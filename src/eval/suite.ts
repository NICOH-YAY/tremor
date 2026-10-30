export const SUITE={tuning:['s1_corridor','s2_collar','s3_triage'],heldOut:['h1_dark','h2_door'],seeds:[17,83]} as const;
export const ALL_CASES=[...SUITE.tuning,...SUITE.heldOut];
