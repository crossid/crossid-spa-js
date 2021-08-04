# @crossid/crossid-spa-js

## 0.1.1

[All Changes](https://github.com/crossid/crossid-spa-js/compare/v0.1.0...v0.1.1)

### Minor Changes

- Add `state_type` opt.

## 0.1.0

[All Changes](https://github.com/crossid/crossid-spa-js/compare/v0.0.5...v0.1.0)

### Minor Changes

- Embed idtoken bearer as a claim (`__bearer`) within the IDToken.

### Major Changes

- Logout via redirect.

## 0.0.5

[All Changes](https://github.com/crossid/crossid-spa-js/compare/v0.0.4...v0.0.5)

### Minor Changes

- Remove required `typ` token header as some providers don't support this.

## 0.0.4

[All Changes](https://github.com/crossid/crossid-spa-js/compare/v0.0.3...v0.0.4)

### Minor Changes

- Export options.
- Better documentation.

## 0.0.3

[All Changes](https://github.com/crossid/crossid-spa-js/compare/v0.0.2...v0.0.3)

### Minor Changes

- Fixes for cicd to build before publish.

## 0.0.2

[All Changes](https://github.com/crossid/crossid-spa-js/compare/v0.0.1...v0.0.2)

### Minor Changes

- Update various properties in `package.json` required in order to publish npm package properly.

## 0.0.1

[All Changes](https://github.com/crossid/crossid-spa-js/compare/2e4949a...v0.0.1)

### Major Changes

- Initial version, with a client that can perform authorization code flow with PKCE extension.
- Create login URL via `createRedirectURL` or redirect by `loginWithRedirect`, handle callback via `handleRedirectCallback`.
- Client `getUser` and `getAccessToken` methods.
- Support for caching tokens using `memory`, `localStorage` and `sessionStorage`.
