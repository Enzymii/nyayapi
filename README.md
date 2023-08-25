# Turborepo starter

This is a template to build monorepo program in typescript edited from official starter Turborepo.

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `docs`: ~~a [Next.js](https://nextjs.org/) app~~ a static website doc powered by [Eleventy](https://www.11ty.dev/)
- `web`: a [Next.js](https://nextjs.org/) app
- `ui`: a stub React component library shared by both `web` and `docs` applications
- `eslint-config-custom`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `tsconfig`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

And some other essential tools added to enforce code quality:

- [Husky](https://typicode.github.io/husky/#/) for git hooks
- [lint-staged](https://github.com/okonet/lint-staged) for linting staged files
- [commitlint](https://commitlint.js.org/#/) for commit message linting
- [commitizen](https://github.com/commitizen/cz-cli) for commit message formatting

### Commit

To commit, it is recommended to use

```
pnpm run commit
```

instead of `git commit`. This will use `commitizen` which will guide you to write a conventional commit message.

### Build

To build all apps and packages, run the following command:

```
pnpm build
```

### Develop

To develop all apps and packages, run the following command:

```
pnpm dev
```

### Generate Doc

To generate the 11ty-powered doc, run the following command:

```
pnpm run doc
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks)
- [Caching](https://turbo.build/repo/docs/core-concepts/caching)
- [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)
- [Filtering](https://turbo.build/repo/docs/core-concepts/monorepos/filtering)
- [Configuration Options](https://turbo.build/repo/docs/reference/configuration)
- [CLI Usage](https://turbo.build/repo/docs/reference/command-line-reference)
