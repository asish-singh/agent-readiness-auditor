# Contributing

## Adding a check

1. Create `src/checks/<name>.ts` exporting a `Check` (see existing checks).
2. Register it in the `CHECKS` array in `src/audit.ts`. Scoring adjusts automatically.
3. Keep `max` points proportional to the risk/value — safety checks weigh highest.
4. Add a fixture-based test (v0.2+) and note the change in `CHANGELOG.md`.

## Workflow

- Branch from `main`, open a PR against an issue.
- Significant, hard-to-reverse decisions get an ADR in `docs/adr/`.
- Releases are tagged with SemVer and summarized in `CHANGELOG.md`.

## Local dev

```bash
npm install
npm run audit -- example.com
npm run build   # type-check + emit to dist/
```
