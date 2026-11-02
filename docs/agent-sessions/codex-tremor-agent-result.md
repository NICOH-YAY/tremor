Implemented and left uncommitted:

- Course interface with fixed actions, fog of war, qualitative aim, and validation feedback.
- Baselines, Vertex model controller, mocked replay, episode runner, and evaluation CLI.
- Declared evaluation plan, decisions, reusable skill, invocation log, and rubric tests.
- Dependencies and package scripts.

Validation: **15 tests passed**, typecheck passed, build passed.

Full evaluation awaits the content-worker levels. The normal tsx command also hits a Windows sandbox user-lookup error; a temporary compiled CLI verified the explicit missing-level failure. No live calls or fabricated results.

No worker-owned directories were edited. **No world.ts contract changes are needed.**