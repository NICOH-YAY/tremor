Fixed. Root cause: the text filter missed five files (`LICENSE`, `README.TXT`, `.sln`, `.vcxproj`, `.vcxproj.filters`), saving CRLF hashes that differed from Git’s LF bytes.

The checker now normalizes text to LF, preserves binary bytes, sorts paths, and normalizes separators. Added explicit LF attributes and regression coverage.

Verified:
- Fresh `git archive HEAD`: original fails; proposed changes pass.
- All 76 tests, typecheck, build, and 508 engine checks pass.

No commit made.