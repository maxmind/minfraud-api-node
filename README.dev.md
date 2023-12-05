Steps for releasing:

1. Review open issues and PRs to see if any can easily be fixed, closed, or
   merged.
2. Bump copyright year in `README.md`, if necessary.
3. Review `CHANGELOG.md` for completeness and correctness. Update its
   release date.
4. Set the version in `package.json`.
5. Create a release PR containing the updates relating to any of the steps
   above.
6. Ensure that the release PR is merged into `main`.
7. With `main` checked out, run `npm publish`. This will generate the
   docs, deploy docs, and publish the module to NPM.
8. Create and push a git tag (eg `git tag v4.2.0 && git push --tags`).
8. Manually create a release on GitHub to include the release-specific
   notes found in `CHANGELOG.md`.
9. Verify the release on
   [GitHub](https://github.com/maxmind/minfraud-api-node/releases) and
   [NPM](https://npmjs.com/package/@maxmind/minfraud-api-node).

## Set up pre-commit hooks

`npm run setup` to install husky pre-commit hooks
