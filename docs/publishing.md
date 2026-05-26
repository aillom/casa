# Publishing C.A.S.A To npm

This guide explains how to publish C.A.S.A so users can run it with `npx`.

## Package Name

The package is configured as:

```text
@aillom/casa
```

The CLI binary is:

```text
casa
```

After publishing, users should be able to run:

```bash
npx @aillom/casa --help
npx @aillom/casa doctor
npx @aillom/casa generate adapters
```

## One-Time npm Setup

1. Create or use an npm account.
2. Join or create the `@aillom` npm organization.
3. Log in locally:

```bash
npm login
npm whoami
```

4. Confirm you can publish scoped public packages under `@aillom`.

## Pre-Publish Checks

Run:

```bash
npm run check
npm pack --dry-run
```

Review the file list printed by `npm pack --dry-run`. It should include the CLI, `.casa`, docs, examples and templates.

## Publish

For the first public release:

```bash
npm publish --access public
```

If the npm account requires 2FA for writes, use the current authenticator code:

```bash
npm publish --access public --otp=123456
```

If npm returns `E404 Not Found - PUT https://registry.npmjs.org/@scope%2fname` during first publish, the most common causes are:

- the logged-in npm user cannot create packages under that scope
- the organization scope exists but package creation is restricted
- the package is being treated as private/restricted before the first public publish
- the account requires a granular access token or automation token with publish permission

Check:

```bash
npm whoami
npm org ls aillom
npm access get status @aillom/casa
```

For a locked-down org, create a granular npm access token with publish rights for the `@aillom` scope, then publish with:

```bash
npm publish --access public --//registry.npmjs.org/:_authToken=YOUR_TOKEN
```

For later releases:

```bash
npm version patch
npm publish
git push --follow-tags
```

Use `minor` or `major` instead of `patch` when the CLI or method contract changes significantly.

## Test The Published Package

After publishing:

```bash
npx @aillom/casa --help
npx @aillom/casa doctor
```

## Future CLI Install Flow

The intended future project setup is:

```bash
mkdir my-app
cd my-app
npx @aillom/casa init --mode greenfield --adapters codex,cursor,claude
npx @aillom/casa doctor
```

The current package does not yet implement `init`; it provides the foundation commands first:

- `doctor`
- `check`
- `generate adapters`
- `mission new`
- `capsule list`
- `gate list`
