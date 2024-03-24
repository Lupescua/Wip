# frontend-packages
Welcome to the monorepo for shared packages used by the Salling Digital frontend teams.

In this repository you will wind packages that can be imported into all the different frontend projects accross teams. It's an initiative to make our ways of working more effective but also to inspire cross-team colaboration.

For an introduction on how to work with and in the packages see the below resources.

## Resources

- [The Wiki pages overview](https://github.com/Salling-Group/frontend-packages/wiki)
- [Contribution Guide](https://github.com/Salling-Group/frontend-packages/wiki/Contribution-Guide)
- [Ways of Working Guide](https://github.com/Salling-Group/frontend-packages/wiki/Ways-of-working)
- [Monorepo Management with Rush](https://github.com/Salling-Group/frontend-packages/wiki/Monorepo-management-with-Rush)

## Getting started

Install rush globally

```sh
npm install -g @microsoft/rush
```

Ensure your working directory is **frontend-packages/\***

```sh
rush update
rush rebuild
```

**Use the [rush cli](https://github.com/Salling-Group/frontend-packages/wiki/Monorepo-management-with-Rush), and avoid using npm or yarn as this will corrupt the symlinks. Should this happen, use `rush update --purge` to fix.**

## Submitting a pull request

See [contribution guide](https://github.com/Salling-Group/frontend-packages/wiki/Contribution-Guide#pull-request) on how to create a pull request

### Install a package from the github registry

To Install the packages published in the repository in another project, in the same directory as your package.json file create or edit an `.npmrc` file to include the following lines:

```
@salling-group:registry=https://npm.pkg.github.com/
//npm.pkg.github.com/:_authToken=${NPM_AUTH_TOKEN}
```
The NPM_AUTH_TOKEN should be replaced by a personal access token generated on github

https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry

## Updating update-caniuse-lite

Custom global rush script to repo, enabling automatic bump of caniuse.

 1. run rush bump-caniuse-lite
 2. run rush update
 3. Commit and push changed lock file and repo-state.