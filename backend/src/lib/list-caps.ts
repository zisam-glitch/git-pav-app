// backend/src/lib/list-caps.ts
// The most rows a patient's list endpoint returns (I2). Each list is newest first, so a cap
// drops the oldest. The caps are far above what one patient has today; they stop a runaway
// account (or a bug) turning one request into thousands of rows, each signed or decrypted.
// Paging, with a cursor, is the next step (B9); until then the cap is the limit.
export const LIST_CAPS = {
  rewardHistory: 200,
  documents: 200,
  treatmentPlans: 100,
  prescriptions: 200,
} as const;
