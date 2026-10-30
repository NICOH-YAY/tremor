// Amendment 2026-10-30: engine episodes declared before controller tuning.
export const SUITE={tuning:['E1M1','E1M2','E1M3'],heldOut:['E1M4','E1M5'],seeds:[17,83]} as const;
export const ALL_CASES=[...SUITE.tuning,...SUITE.heldOut];
