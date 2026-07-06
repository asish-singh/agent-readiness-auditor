# Releasing

This project publishes to npm automatically via [`.github/workflows/release.yml`](../.github/workflows/release.yml)
whenever a version tag (`v*`) is pushed.

## One-time setup

1. Create an npm account at [npmjs.com](https://www.npmjs.com) and log in locally once:
   ```bash
   npm login
   ```
2. Create an **Automation** access token: npmjs.com → your avatar → *Access Tokens*
   → *Generate New Token* → *Automation*.
3. Add it to GitHub as a repo secret named `NPM_TOKEN`:
   ```bash
   gh secret set NPM_TOKEN
   # paste the token when prompted
   ```

## Cutting a release

```bash
npm version patch      # or: minor / major — bumps package.json and tags the commit
git push --follow-tags # pushes the commit and the new tag
```

Pushing the tag triggers the Release workflow, which builds, runs tests, and
publishes to npm with [provenance](https://docs.npmjs.com/generating-provenance-statements).

## First publish (manual, once)

The very first publish can also be done by hand after `npm login`:

```bash
npm publish   # prepublishOnly rebuilds automatically
```

After that, prefer the tag-driven flow above.
