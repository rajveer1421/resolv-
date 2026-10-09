import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

export const APP_DIR = resolve(here, '..', '..');
const WEBSITE_DIR = resolve(APP_DIR, '..');
const SUBMISSION_DIR = join(WEBSITE_DIR, 'The_Epoch_Warriors_submission');

/** Source of truth for every fact on the site (read-only). */
export const DOC_PATH = join(SUBMISSION_DIR, 'Documentation_template.md');

/** Our submitted files: ID lists only (read-only, streamed, never loaded whole). */
const OUTPUT_DIR = process.env.ER_OUTPUT_DIR ?? join(SUBMISSION_DIR, 'output');

/** The challenge inputs, which hold the names and addresses behind the IDs (read-only). */
const DATASET_DIR = process.env.ER_DATA_DIR ?? resolve(WEBSITE_DIR, '..', 'Resources', 'student_resource', 'dataset');

export const inputs = {
  candidates: join(OUTPUT_DIR, 'candidate_pairs.tsv'),
  matching: join(OUTPUT_DIR, 'matching_results.tsv'),
  testS1: join(DATASET_DIR, 'test', 'test_source1.tsv'),
  testS2: join(DATASET_DIR, 'test', 'test_source2.tsv'),
  testS3: join(DATASET_DIR, 'test', 'test_source3.tsv'),
  trainS1: join(DATASET_DIR, 'train', 'train_source1.tsv'),
  trainS2: join(DATASET_DIR, 'train', 'train_source2.tsv'),
  trainS3: join(DATASET_DIR, 'train', 'train_source3.tsv'),
  trainTruth: join(DATASET_DIR, 'train', 'train_ground_truth.tsv'),
} as const;

export const DEMO_DIR = join(APP_DIR, 'public', 'demo');
