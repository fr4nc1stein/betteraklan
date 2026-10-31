#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const cheerio = require('cheerio');

const COLLECTOR_VERSION = 'aklan-wordpress-collector-v1';
const DEFAULT_OUTPUT_ROOT = 'pipeline/openlgu/sources';

// aklan.gov.ph blocks requests with no/non-browser User-Agent (403), unlike
// a DataTables-style listing site. Legislative documents are individual
// WordPress posts under category archives, not rows in one big table, and
// there is no pagination on these categories today (verified: /page/2/ 404s).
const REQUEST_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
};

const SOURCES = [
  {
    key: 'resolutions',
    label: 'Resolutions',
    url: 'https://aklan.gov.ph/category/archives/resolutions/',
    document_type: 'resolution',
    min_rows: 1,
  },
  {
    key: 'ordinances',
    label: 'Ordinances',
    url: 'https://aklan.gov.ph/category/archives/ordinances/',
    document_type: 'ordinance',
    min_rows: 1,
  },
  {
    key: 'executive_orders',
    label: 'Executive Orders',
    url: 'https://aklan.gov.ph/category/archives/executive-orders/',
    document_type: 'executive_order',
    min_rows: 1,
  },
];

// --- CLI ---

function parseArgs(argv) {
  const args = {
    source: null,
    htmlDir: null,
    saveHtmlDir: null,
    outputRoot: DEFAULT_OUTPUT_ROOT,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];

    if (arg === '--source' && next) {
      args.source = next;
      i += 1;
    } else if (arg === '--html-dir' && next) {
      args.htmlDir = next;
      i += 1;
    } else if (arg === '--save-html-dir' && next) {
      args.saveHtmlDir = next;
      i += 1;
    } else if (arg === '--output-root' && next) {
      args.outputRoot = next;
      i += 1;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function printHelp() {
  console.log(`Usage: node scripts/openlgu/collect-website-source-records.cjs [options]

Fetches aklan.gov.ph legislative document category archives, follows each
post, and emits source-record JSONL.

Options:
  --source <key>          Collect single source only (resolutions|ordinances|executive_orders)
  --html-dir <path>       Read saved HTML fixtures instead of live fetch
                          (expects <key>.html for the archive page and
                          <key>__<post-slug>.html for each post)
  --save-html-dir <path>  Save fetched HTML to disk for fixture generation
  --output-root <path>    Output root directory. Default: ${DEFAULT_OUTPUT_ROOT}
`);
}

// --- Utilities ---

function writeJsonl(filePath, records) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(
    filePath,
    records.length ? `${records.map(r => JSON.stringify(r)).join('\n')}\n` : ''
  );
}

function readJsonl(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return fs
    .readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map(line => JSON.parse(line));
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function timestampSlug() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function slugFromUrl(url) {
  return String(url).replace(/\/+$/, '').split('/').pop();
}

// --- HTTP ---

async function fetchWithRetry(url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: REQUEST_HEADERS,
      });
      clearTimeout(timeout);

      if (res.status === 429) {
        const retryAfter = res.headers.get('retry-after');
        const waitMs = retryAfter
          ? parseInt(retryAfter, 10) * 1000
          : Math.pow(2, attempt) * 1000;
        if (attempt < retries) {
          console.log(`  HTTP 429, retry ${attempt}/${retries} in ${waitMs}ms`);
          await delay(waitMs);
          continue;
        }
        throw new Error(`HTTP 429 after ${retries} attempts`);
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }

      return await res.text();
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error(
          `Request timeout after 30s (attempt ${attempt}/${retries})`
        );
      }
      if (attempt < retries) {
        const waitMs = Math.pow(2, attempt) * 1000;
        console.log(
          `  ${err.message}, retry ${attempt}/${retries} in ${waitMs}ms`
        );
        await delay(waitMs);
        continue;
      }
      throw err;
    }
  }
}

// --- Content hash ---

function normalizeUrl(url) {
  return String(url ?? '')
    .trim()
    .toLowerCase()
    .replace(/#.*$/, '')
    .replace(/\/+$/, '');
}

function normalizeCellValue(value) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();
}

function computeContentHash(sourceKind, sourceUrl, rawPayload) {
  const input = { source_kind: sourceKind, source_url: sourceUrl };
  for (const key of Object.keys(rawPayload).sort()) {
    input[key] = normalizeCellValue(rawPayload[key]);
  }
  if (rawPayload.pdf_url) {
    input.pdf_url = normalizeUrl(rawPayload.pdf_url);
  }
  const serialized = JSON.stringify(input, Object.keys(input).sort());
  return `sha256:${crypto.createHash('sha256').update(serialized).digest('hex')}`;
}

// --- Reachability checking ---
// Google Drive share links return 200 for both viewable and permission-denied
// pages under HEAD, so a HEAD check would be misleading. Only direct
// same-domain PDF/image links get checked; Drive links are marked unchecked.

async function checkUrlReachability(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: REQUEST_HEADERS,
    });
    clearTimeout(timeout);

    if (res.ok) {
      return {
        reachability: res.redirected ? 'redirect' : 'reachable',
        redirect_url: res.redirected ? res.url : null,
      };
    }
    if (res.status === 404) {
      return { reachability: 'dead', redirect_url: null };
    }
    return { reachability: 'error', redirect_url: null };
  } catch {
    return { reachability: 'error', redirect_url: null };
  }
}

// --- HTML parsing ---

function findListingLinks($) {
  const links = [];
  $('article.hentry').each((_i, el) => {
    const anchor = $(el).find('h2.entry-title a').first();
    const href = anchor.attr('href');
    if (href) links.push(href.trim());
  });
  return links;
}

function extractNumber(title) {
  const m = title.match(/no\.?\s*([0-9][0-9a-z-]*(?:-[a-z])?)/i);
  return m ? m[1].replace(/,$/, '') : '';
}

function extractSeriesYear(title) {
  const m = title.match(/series\s+of\s+(\d{4})/i);
  return m ? m[1] : '';
}

function extractDocumentLink($, contentRoot) {
  const driveLink = contentRoot
    .find('a[href*="drive.google.com"], a[href*="docs.google.com"]')
    .first();
  if (driveLink.length) {
    return { url: driveLink.attr('href').trim(), kind: 'google_drive' };
  }

  const pdfLink = contentRoot.find('a[href$=".pdf" i]').first();
  if (pdfLink.length) {
    return { url: pdfLink.attr('href').trim(), kind: 'pdf' };
  }

  const image = contentRoot.find('img[src*="/wp-content/uploads/"]').first();
  if (image.length) {
    return { url: image.attr('src').trim(), kind: 'image' };
  }

  return { url: '', kind: 'none' };
}

function extractDescription($, contentRoot) {
  const clone = contentRoot.clone();
  clone.find('.entry-meta, script, style').remove();
  return normalizeCellValue(clone.text());
}

function parsePost($, postUrl) {
  const title = normalizeCellValue($('h1.entry-title').first().text());
  const dateEnacted =
    $('time.entry-date.published').first().attr('datetime') || '';
  const contentRoot = $('.entry-content').first();
  const { url: documentUrl, kind: documentUrlKind } = extractDocumentLink(
    $,
    contentRoot
  );
  const description = extractDescription($, contentRoot);

  return {
    number: extractNumber(title),
    title,
    series_year: extractSeriesYear(title),
    date_enacted: dateEnacted ? dateEnacted.slice(0, 10) : '',
    description,
    pdf_url: documentUrl,
    document_url_kind: documentUrlKind,
    post_url: postUrl,
  };
}

// --- Source record creation ---

function toSourceRecord(rawPayload, source, runId) {
  const payloadWithType = { ...rawPayload, type: source.document_type };

  const contentHash = computeContentHash(
    'website_post',
    source.url,
    rawPayload
  );
  const hashSlug = crypto
    .createHash('sha256')
    .update(contentHash)
    .digest('hex')
    .slice(0, 20);
  const now = new Date().toISOString();

  return {
    id: `src_${source.key}_${hashSlug}`,
    source_kind: 'website_post',
    source_key: source.key,
    source_url: source.url,
    content_hash: contentHash,
    collector_version: COLLECTOR_VERSION,
    raw_payload_json: payloadWithType,
    pdf_url: rawPayload.pdf_url || '',
    pdf_reachability: null,
    pdf_redirect_url: null,
    pdf_checked_at: null,
    run_id: runId,
    first_seen_at: now,
    last_seen_at: now,
  };
}

// --- Run output ---

function buildRunManifest(
  source,
  { status, startedAt, finishedAt, attempts, counts, listingShape, error }
) {
  return {
    source_key: source.key,
    status,
    started_at: startedAt,
    finished_at: finishedAt,
    duration_ms: finishedAt ? new Date(finishedAt) - new Date(startedAt) : null,
    attempts,
    source_url: source.url,
    collector_version: COLLECTOR_VERSION,
    counts: status === 'success' ? counts : undefined,
    listing_shape: listingShape || undefined,
    error: error || undefined,
  };
}

function writeRunOutput(source, manifest, records, outputRoot) {
  const sourceDir = path.join(outputRoot, source.key);
  const ts = timestampSlug();
  const runDir = path.join(sourceDir, 'runs', ts);

  fs.mkdirSync(runDir, { recursive: true });

  fs.writeFileSync(
    path.join(runDir, 'run.json'),
    `${JSON.stringify(manifest, null, 2)}\n`
  );

  if (manifest.status === 'success') {
    writeJsonl(path.join(runDir, 'source-records.jsonl'), records);

    const latestDir = path.join(sourceDir, 'latest');
    fs.mkdirSync(latestDir, { recursive: true });
    fs.writeFileSync(
      path.join(latestDir, 'run.json'),
      `${JSON.stringify(manifest, null, 2)}\n`
    );
    writeJsonl(path.join(latestDir, 'source-records.jsonl'), records);
  } else {
    fs.writeFileSync(
      path.join(sourceDir, 'last-failed-run.json'),
      `${JSON.stringify(manifest, null, 2)}\n`
    );
  }
}

// --- Combined output ---

function writeCombinedOutput(outputRoot) {
  const combined = [];
  for (const source of SOURCES) {
    const latestPath = path.join(
      outputRoot,
      source.key,
      'latest',
      'source-records.jsonl'
    );
    if (fs.existsSync(latestPath)) {
      combined.push(...readJsonl(latestPath));
    }
  }

  const combinedPath = path.join(outputRoot, '..', 'source-records.jsonl');
  writeJsonl(combinedPath, combined);
  console.log(
    `Combined ${combined.length} source record(s) into ${combinedPath}`
  );
}

// --- Fetch helpers (live vs fixture) ---

async function loadHtml(url, key, args) {
  if (args.htmlDir) {
    const fixturePath = path.join(args.htmlDir, `${key}.html`);
    return fs.readFileSync(fixturePath, 'utf8');
  }
  const html = await fetchWithRetry(url, 3);
  if (args.saveHtmlDir) {
    fs.mkdirSync(args.saveHtmlDir, { recursive: true });
    fs.writeFileSync(path.join(args.saveHtmlDir, `${key}.html`), html);
  }
  return html;
}

// --- Main ---

async function main() {
  const args = parseArgs(process.argv);
  const sources = args.source
    ? SOURCES.filter(s => s.key === args.source)
    : SOURCES;

  if (!sources.length) {
    throw new Error(`Unknown source: ${args.source}`);
  }

  fs.mkdirSync(args.outputRoot, { recursive: true });

  for (let i = 0; i < sources.length; i += 1) {
    const source = sources[i];
    console.log(`[${source.key}] Starting collection...`);

    if (i > 0) {
      await delay(2000);
    }

    const startedAt = new Date().toISOString();

    try {
      const listingHtml = await loadHtml(source.url, source.key, args);
      const $listing = cheerio.load(listingHtml);
      const postUrls = findListingLinks($listing);

      if (postUrls.length === 0) {
        throw {
          type: 'listing_shape_failure',
          message:
            'No article.hentry / h2.entry-title links found on archive page',
        };
      }

      console.log(`  Found ${postUrls.length} post(s)`);

      const rows = [];
      for (const postUrl of postUrls) {
        await delay(1000);
        const postKey = `${source.key}__${slugFromUrl(postUrl)}`;
        const postHtml = await loadHtml(postUrl, postKey, args);
        const $post = cheerio.load(postHtml);
        rows.push(parsePost($post, postUrl));
      }

      // Reachability: only for direct same-domain links, not Drive shares.
      for (const row of rows) {
        if (!row.pdf_url) continue;
        if (row.document_url_kind === 'google_drive') {
          row._reachability = { reachability: 'unchecked', redirect_url: null };
          continue;
        }
        await delay(500);
        row._reachability = await checkUrlReachability(row.pdf_url);
      }

      const runId = `run_${source.key}_${timestampSlug()}`;
      const records = rows.map(row => {
        const { _reachability, ...rawPayload } = row;
        const rec = toSourceRecord(rawPayload, source, runId);
        if (_reachability) {
          rec.pdf_reachability = _reachability.reachability;
          rec.pdf_redirect_url = _reachability.redirect_url;
          rec.pdf_checked_at = new Date().toISOString();
        }
        return rec;
      });

      const finishedAt = new Date().toISOString();
      const manifest = buildRunManifest(source, {
        status: 'success',
        startedAt,
        finishedAt,
        attempts: 1,
        counts: {
          rows_found: postUrls.length,
          rows_parsed: rows.length,
          rows_deduplicated: 0,
          source_records_emitted: records.length,
          rows_skipped: 0,
        },
        listingShape: {
          selector: 'article.hentry h2.entry-title a',
          posts_found: postUrls.length,
        },
      });

      writeRunOutput(source, manifest, records, args.outputRoot);
      console.log(
        `  Emitted ${records.length} source record(s) [${manifest.duration_ms}ms]`
      );
    } catch (err) {
      const finishedAt = new Date().toISOString();
      const isHttp =
        err.message &&
        (err.message.startsWith('HTTP') ||
          err.message.startsWith('fetch failed') ||
          err.message.startsWith('Request timeout'));
      const error = err.type
        ? err
        : { type: isHttp ? 'http_error' : 'parse_error', message: err.message };

      const manifest = buildRunManifest(source, {
        status: 'failed',
        startedAt,
        finishedAt,
        attempts: 1,
        error,
      });

      writeRunOutput(source, manifest, [], args.outputRoot);
      console.error(`  FAILED: ${error.message}`);
    }
  }

  writeCombinedOutput(args.outputRoot);
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
