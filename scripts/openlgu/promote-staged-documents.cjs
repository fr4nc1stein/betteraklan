#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '../..');
const PIPELINE_DIR = path.join(ROOT, 'pipeline/openlgu');
const DEFAULT_INPUT = path.join(PIPELINE_DIR, 'staged-documents.jsonl');

function parseArgs(argv) {
  const args = { input: DEFAULT_INPUT, remote: false };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--input' && argv[i + 1]) {
      args.input = argv[i + 1];
      i += 1;
    } else if (arg === '--remote') {
      args.remote = true;
    } else if (arg === '--local') {
      args.remote = false;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }
  return args;
}

function printHelp() {
  console.log(`Usage: node scripts/openlgu/promote-staged-documents.cjs [options]

Promotes staged documents straight to the canonical documents table.

This is a one-time, minimal promotion path — not the general reconciliation
promotion described in docs/openlgu/source-pipeline.md (still deferred,
since that guards against overwriting populated canonical fields on
existing documents). It only INSERT OR IGNOREs new rows, so it is safe to
re-run, but it never updates a canonical document that already exists.

Options:
  --input <path>   Staged documents JSONL. Default: ${path.relative(ROOT, DEFAULT_INPUT)}
  --local          Target local D1 (default)
  --remote         Target remote/production D1
`);
}

function readJsonl(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return fs
    .readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map(line => JSON.parse(line));
}

function escapeSql(value) {
  if (value === null || value === undefined || value === '') return 'NULL';
  return `'${String(value).replace(/'/g, "''")}'`;
}

function documentId(doc) {
  return `doc_${doc.document_type}_${doc.term_id}_${doc.normalized_number}`;
}

function main() {
  const args = parseArgs(process.argv);
  const staged = readJsonl(args.input);

  const eligible = staged.filter(d => d.staging_status !== 'needs_review');
  const skipped = staged.length - eligible.length;

  if (!eligible.length) {
    console.log('No eligible staged documents to promote.');
    if (skipped) console.log(`  (${skipped} need review and were skipped)`);
    return;
  }

  const rows = eligible.map(d => ({
    id: documentId(d),
    type: d.document_type,
    number: d.number,
    title: d.title,
    session_id: null,
    term_id: d.term_id,
    date_enacted: d.date_enacted,
    date_filed: null,
    pdf_url: d.pdf_url || null,
    source_type: 'website',
    publication_status: 'active',
    verification_state: 'unverified',
    source_confidence: null,
    canonical_notes: `Promoted from ${d.source_record_id}`,
  }));

  const columns = [
    'id',
    'type',
    'number',
    'title',
    'session_id',
    'term_id',
    'date_enacted',
    'date_filed',
    'pdf_url',
    'source_type',
    'publication_status',
    'verification_state',
    'source_confidence',
    'canonical_notes',
  ];

  const values = rows
    .map(row => `(${columns.map(col => escapeSql(row[col])).join(', ')})`)
    .join(',\n  ');

  // INSERT OR IGNORE: never overwrites a canonical document that already
  // exists (matches by primary key). Re-running this script after another
  // scrape only adds genuinely new documents.
  const sql = `INSERT OR IGNORE INTO documents (${columns.join(', ')})\nVALUES\n  ${values};`;

  const tempFile = path.join(ROOT, `.wrangler-temp-${Date.now()}.sql`);
  fs.writeFileSync(tempFile, sql);
  try {
    const flag = args.remote ? '--remote' : '--local';
    console.log(
      `Promoting ${rows.length} document(s) to ${args.remote ? 'REMOTE (production)' : 'LOCAL'} D1...`
    );
    execSync(
      `npx wrangler d1 execute BETTERLB_DB ${flag} --file="${tempFile}"`,
      { cwd: ROOT, stdio: 'inherit' }
    );
  } finally {
    fs.unlinkSync(tempFile);
  }

  console.log(`Done: ${rows.length} document(s) promoted.`);
  if (skipped) {
    console.log(
      `  (${skipped} staged document(s) need review and were skipped)`
    );
  }
}

main();
