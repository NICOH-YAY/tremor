Implemented **Vaulting Ambition**, replacing Trial by Combat on this branch. Dev server: [Play locally](http://127.0.0.1:5173/).

- **Changed:** deterministic simulator, three-section tower, player interface, Three.js renderer/UI, tests, documentation, credits, retained assets, and the named CI workflow.
- **Play:** aim with mouse or A/D/arrows; hold Space/mouse to charge, release to vault. No air control. R confirms restart. Reach the crown.
- **Verified:** clean `npm ci`, **12 passing tests**, typecheck, and production build. Search replays a winning **12-vault route**.
- **Known limitations:** browser rendering/input and human difficulty remain unverified because no browser was available. Title art is pending; movement uses procedural animation. Build reports a bundle-size warning.

[Claude review handoff](</D:/Coding VS/game-dev-f26/midterms/nicoh-yay/docs/REVIEW-HANDOFF.md>) includes evidence and limitations.

No commits, pushes, or model calls.