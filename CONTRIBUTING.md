# Contributing

## Adding a check

1. Create `src/checks/<name>.ts` that exports a `Check`. Use the existing checks as a template.
2. Register it in the `CHECKS` array in `src/audit.ts`. The score total adjusts automatically.
3. Set the check's `max` points in proportion to how important it is. Safety checks carry the most weight.
4. Add a test and record the change in `CHANGELOG.md`.

## Workflow

- Branch from `main` and open a pull request.
- Record significant, hard-to-reverse decisions as an ADR in `docs/adr/`.
- Tag releases with semantic versioning and summarize them in `CHANGELOG.md`.

## Local development

```bash
npm install
npm run audit -- example.com   # run the tool
npm test                       # run the tests
npm run build                  # type-check and compile into dist/
```
