import crypto from "crypto";

// Tests invent clinician GDC numbers, and the database requires them to be
// unique. Picking each one at random from the same 100,000 numbers meant two
// tests, in different jest workers or in one file, sometimes drew the same
// number and failed on the unique constraint for no reason.
//
// Each jest worker gets its own block of numbers, and numbers within a file
// count up from a random start, so none repeat. The blocks stay clear of the
// seed's fixed numbers (999991, 999992) and the fixed ones some tests use
// (123456, 987654).
const BLOCK = 45_000;
const BLOCKS = 16;
const FIRST = 200_000;

const worker = ((Number(process.env.JEST_WORKER_ID) || 1) - 1) % BLOCKS;
const base = FIRST + worker * BLOCK;
let next = crypto.randomInt(0, BLOCK);

export function uniqueGdc(): string {
  const gdc = String(base + (next++ % BLOCK));
  return gdc.padStart(6, "0");
}
