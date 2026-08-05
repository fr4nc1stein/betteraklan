// One-off generator: computes a guaranteed-inside-the-polygon point for each
// municipality from the existing boundary GeoJSON, using Turf's
// point-on-feature (unlike a mass centroid, this can't land outside the
// landmass for elongated/concave municipalities). Run with:
//   npx tsx scripts/generate-municipality-centroids.ts
// Output is committed as static data — this script doesn't run at build or
// request time.
import { readFileSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

import pointOnFeature from '@turf/point-on-feature';
import type { Feature, FeatureCollection, MultiPolygon } from 'geojson';

const __dirname = dirname(fileURLToPath(import.meta.url));

const boundariesPath = resolve(
  __dirname,
  '../src/data/geo/municipalities-boundaries.json'
);
const outputPath = resolve(
  __dirname,
  '../src/data/geo/municipality-centroids.json'
);

const boundaries: FeatureCollection<MultiPolygon, { slug: string; name: string }> =
  JSON.parse(readFileSync(boundariesPath, 'utf-8'));

const centroids = boundaries.features
  .map((feature: Feature<MultiPolygon, { slug: string; name: string }>) => {
    const point = pointOnFeature(feature);
    const [lon, lat] = point.geometry.coordinates;
    return {
      slug: feature.properties.slug,
      name: feature.properties.name,
      lat: Math.round(lat * 10000) / 10000,
      lon: Math.round(lon * 10000) / 10000,
    };
  })
  .sort((a, b) => a.slug.localeCompare(b.slug));

writeFileSync(outputPath, JSON.stringify(centroids, null, 2) + '\n');
console.log(`Wrote ${centroids.length} municipality centroids to ${outputPath}`);
for (const c of centroids) {
  console.log(`  ${c.slug.padEnd(16)} ${c.lat}, ${c.lon}`);
}
