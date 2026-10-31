// Frozen 2026-10-31 before model trials. Seen maps cannot support clean held-out claims.
export const SUITE={tuning:['E1M1','E1M2','E1M3'],seen:['E1M4','E1M5'],heldOut:['E1M6','E1M7'],seeds:[17,83]} as const;
export const ALL_CASES=[...SUITE.tuning,...SUITE.seen,...SUITE.heldOut];
