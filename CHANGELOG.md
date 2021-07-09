# @crossid/crossid-spa-js

## 0.0.1

[All Changes](https://github.com/crossid/crossid-spa-js/compare/2e4949a...v0.0.1)

### Major Changes

- Initial version, with a client that can perform authorization code flow with PKCE extension.
- Create login URL via `createRedirectURL` or redirect by `loginWithRedirect`, handle callback via `handleRedirectCallback`.
- Client `getUser` and `getAccessToken` methods.
- Support for caching tokens using `memory`, `localStorage` and `sessionStorage`.
