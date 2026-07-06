# Releasing

This project publishes to npm automatically through [`.github/workflows/release.yml`](../.github/workflows/release.yml) whenever a version tag (a tag starting with `v`) is pushed.

## One-time setup

1. Create a token on npm. Sign in at [npmjs.com](https://www.npmjs.com), then go to your avatar menu, choose Access Tokens, and generate a granular access token with read and write permission on this package.
2. Store the token in GitHub. In the repository, open Settings, then Secrets and variables, then Actions, and add a repository secret named `NPM_TOKEN` with the token as its value.

## Publishing a new version

```bash
npm version patch      # bumps the version and creates a git tag (use minor or major for larger changes)
git push --follow-tags # pushes the commit and the new tag
```

Pushing the tag starts the release workflow, which builds the project, runs the tests, and publishes to npm with [provenance](https://docs.npmjs.com/generating-provenance-statements).

## Publishing by hand

If you ever need to publish without the workflow, sign in with `npm login` and run `npm publish`. The build runs automatically before publishing.
