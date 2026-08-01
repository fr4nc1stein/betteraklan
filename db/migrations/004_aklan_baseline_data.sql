-- Aklan Baseline Data — replaces the Los Baños placeholder seed
-- Migration: 004_aklan_baseline_data.sql
--
-- 002_baseline_data.sql seeded four Los Baños "Sangguniang Bayan" terms
-- (sb_9..sb_12) and no persons/memberships at all — this repo forked from
-- a Los Baños template and the OpenLGU seed data was never adapted for
-- Aklan, a province (Sangguniang Panlalawigan, headed by a Governor), not
-- a municipality (Sangguniang Bayan, headed by a Mayor).
--
-- Terms below cover 2013-07-01 through 2028-06-30 on the standard PH local
-- election cycle (3-year terms starting July 1 after a May election) so
-- that scraped documents dated as far back as 2013 can be assigned a
-- term_id. `term_number`/`ordinal` are a sequential bookkeeping index for
-- this dataset only — there is no authoritative historical numbering for
-- the Aklan SP the way Sangguniang Bayan terms are conventionally counted,
-- so `name` is generated from the year range instead of an ordinal claim
-- (see functions/utils/formatters.ts formatTermName).
--
-- Persons/memberships are seeded for the CURRENT term (2025-2028) only,
-- sourced from src/data/directory/executive.json and
-- src/data/directory/legislative.json (already-real Aklan roster data).
-- Historical rosters for earlier terms are not available and are not
-- required to display scraped documents, which surface no named authors.
--
-- The Los Baños sb_9..sb_12 terms are removed here rather than left in
-- place: sb_9/10/11/12 share the exact same 3-year date ranges as
-- sp_2016/2019/2022/2025 (both follow the standard PH local election
-- cycle), so formatTermName() would render them as indistinguishable
-- duplicate "Sangguniang Panlalawigan (YYYY-YYYY)" entries — and sb_12's
-- term_number (12) sorts ahead of sp_2025's (5) in the terms list, so the
-- empty placeholder term would display as more "current" than the real
-- one. Nothing references sb_9..sb_12 yet (memberships/sessions/documents/
-- staged_documents were all empty before this migration), so this delete
-- is safe.

DELETE FROM terms WHERE id IN ('sb_9', 'sb_10', 'sb_11', 'sb_12');

INSERT INTO terms (id, term_number, ordinal, name, start_date, end_date, year_range) VALUES
  ('sp_2013', 1, '1st', 'Sangguniang Panlalawigan (2013-2016)', '2013-07-01', '2016-06-30', '2013-2016'),
  ('sp_2016', 2, '2nd', 'Sangguniang Panlalawigan (2016-2019)', '2016-07-01', '2019-06-30', '2016-2019'),
  ('sp_2019', 3, '3rd', 'Sangguniang Panlalawigan (2019-2022)', '2019-07-01', '2022-06-30', '2019-2022'),
  ('sp_2022', 4, '4th', 'Sangguniang Panlalawigan (2022-2025)', '2022-07-01', '2025-06-30', '2022-2025'),
  ('sp_2025', 5, '5th', 'Sangguniang Panlalawigan (2025-2028)', '2025-07-01', '2028-06-30', '2025-2028');

INSERT INTO persons (id, first_name, middle_name, last_name, suffix) VALUES
  ('miraflores-jose-enrique-m', 'Jose Enrique', 'M.', 'Miraflores', NULL),
  ('calizo-dexter-m', 'Dexter', 'M.', 'Calizo', NULL),
  ('bautista-mark-ace-l', 'Mark Ace', 'L.', 'Bautista', NULL),
  ('quimpo-reynaldo-m', 'Reynaldo', 'M.', 'Quimpo', NULL),
  ('quimpo-mark-v', 'Mark', 'V.', 'Quimpo', NULL),
  ('tupas-teddy-c', 'Teddy', 'C.', 'Tupas', NULL),
  ('cleope-apolinar-c', 'Apolinar', 'C.', 'Cleope', NULL),
  ('dalisay-romeo-m', 'Romeo', 'M.', 'Dalisay', NULL),
  ('cordova-bayani-m', 'Bayani', 'M.', 'Cordova', NULL),
  ('legaspi-bob-augusto-f', 'Bob Augusto', 'F.', 'Legaspi', NULL),
  ('gallenero-jupiter-aelred-g', 'Jupiter Aelred', 'G.', 'Gallenero', NULL),
  ('tabang-glenn-c', 'Glenn', 'C.', 'Tabang', NULL),
  ('labindao-concepcion-p', 'Concepcion', 'P.', 'Labindao', NULL),
  ('tolosa-ralf-a', 'Ralf', 'A.', 'Tolosa', NULL),
  ('tolentino-edmundo-m-jr', 'Edmundo', 'M.', 'Tolentino', 'Jr.'),
  ('solanoy-michael-t', 'Michael', 'T.', 'Solanoy', NULL);

INSERT INTO memberships (id, person_id, term_id, chamber, role, rank) VALUES
  ('mem_sp2025_governor', 'miraflores-jose-enrique-m', 'sp_2025', 'Executive', 'Governor', NULL),
  ('mem_sp2025_vice_governor', 'calizo-dexter-m', 'sp_2025', 'Sangguniang Panlalawigan', 'Vice Governor', NULL),
  ('mem_sp2025_board_1', 'bautista-mark-ace-l', 'sp_2025', 'Sangguniang Panlalawigan', 'Provincial Board Member — 1st District', NULL),
  ('mem_sp2025_board_2', 'quimpo-reynaldo-m', 'sp_2025', 'Sangguniang Panlalawigan', 'Provincial Board Member — 1st District', NULL),
  ('mem_sp2025_board_3', 'quimpo-mark-v', 'sp_2025', 'Sangguniang Panlalawigan', 'Provincial Board Member — 1st District', NULL),
  ('mem_sp2025_board_4', 'tupas-teddy-c', 'sp_2025', 'Sangguniang Panlalawigan', 'Provincial Board Member — 1st District', NULL),
  ('mem_sp2025_board_5', 'cleope-apolinar-c', 'sp_2025', 'Sangguniang Panlalawigan', 'Provincial Board Member — 1st District', NULL),
  ('mem_sp2025_board_6', 'dalisay-romeo-m', 'sp_2025', 'Sangguniang Panlalawigan', 'Provincial Board Member — 2nd District', NULL),
  ('mem_sp2025_board_7', 'cordova-bayani-m', 'sp_2025', 'Sangguniang Panlalawigan', 'Provincial Board Member — 2nd District', NULL),
  ('mem_sp2025_board_8', 'legaspi-bob-augusto-f', 'sp_2025', 'Sangguniang Panlalawigan', 'Provincial Board Member — 2nd District', NULL),
  ('mem_sp2025_board_9', 'gallenero-jupiter-aelred-g', 'sp_2025', 'Sangguniang Panlalawigan', 'Provincial Board Member — 2nd District', NULL),
  ('mem_sp2025_board_10', 'tabang-glenn-c', 'sp_2025', 'Sangguniang Panlalawigan', 'Provincial Board Member — 2nd District', NULL),
  ('mem_sp2025_pcl', 'labindao-concepcion-p', 'sp_2025', 'Sangguniang Panlalawigan', 'PCL President', NULL),
  ('mem_sp2025_abc', 'tolosa-ralf-a', 'sp_2025', 'Sangguniang Panlalawigan', 'ABC President', NULL),
  ('mem_sp2025_sk', 'tolentino-edmundo-m-jr', 'sp_2025', 'Sangguniang Panlalawigan', 'SK Provincial Federation President', NULL),
  ('mem_sp2025_secretary', 'solanoy-michael-t', 'sp_2025', 'Sangguniang Panlalawigan', 'Secretary to the Sanggunian', NULL);

INSERT INTO schema_migrations (name) VALUES ('004_aklan_baseline_data.sql');
