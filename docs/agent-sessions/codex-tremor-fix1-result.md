Fixed the blocker, majors, and listed minors. Changes include identity-neutral stun/purge behavior, shared event sanitation, model/baseline information parity, visible supplies, separate error accounting, the course workflow, and updated documentation with an appended review response.

The named leakage regression failed before the fix. Coverage now calls `step()` for every action ID and enforces completion for both baselines.

Validation is green: **105 tests**, typecheck, build, and diff checks.

All changes remain **uncommitted**.