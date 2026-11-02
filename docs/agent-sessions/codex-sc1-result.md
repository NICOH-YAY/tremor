Built **Small Change** on `nicoh-yay/small-change`.

- Replaced Vaulting Ambition with a 2D DOM/CSS game: 24 dilemmas, endless days, coffee service, delayed callbacks, journals, Laura chapters, and local saves.
- Added simulation/data modules, responsive UI, tests, license, credits, and authoring docs. Removed Three.js and 3D assets; preserved CI.
- **Passed:** clean `npm ci`, 15 tests, typecheck, and static build. Publishable output: `midterms/nicoh-yay/web/dist/`.

To play:

```powershell
cd midterms/nicoh-yay
npm.cmd run web
```

Open `http://127.0.0.1:5173`. Choose responses and type—or tap—the displayed coffee keys.

**Placeholders:** all PNG art uses CSS fallbacks. Browser visual inspection and human playtesting remain pending. Separate repository Python checks have environment failures, documented in the [Claude review handoff](/D:/Coding%20VS/game-dev-f26/midterms/nicoh-yay/docs/REVIEW-HANDOFF.md).

No commits, pushes, deployment, or model calls.