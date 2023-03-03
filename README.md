# @crossid/crossid-spa-js [![npm version](https://img.shields.io/npm/v/@crossid/crossid-spa-js?style=flat)](https://www.npmjs.com/package/@crossid/crossid-spa-js) [![Test](https://github.com/crossid/crossid-spa-js/actions/workflows/test.yml/badge.svg)](https://github.com/crossid/crossid-spa-js/actions/workflows/test.yml) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://reactjs.org/docs/how-to-contribute.html#your-first-pull-request) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/crossid/crossid-spa-js/blob/main/LICENSE)

OAuth2 and OIDC SDK for a single page application (SPA), using the authorization code flow with PKCE extension.

## Get Started

Install by:

npm:

```sh
npm install @crossid/crossid-spa-js
```

yarn:

```sh
yarn add @crossid/crossid-spa-js
```

Init a [client](https://crossid.github.io/crossid-spa-js/classes/client.html):

```js
import { newCrossidClient, Client } from '@crossid/crossid-spa-js'
const crossid = newCrossidClient({
  domain: 'acme.us.crossid.io',
  client_id: 'my-client-id',
  authorizationOpts: {
    audience: ['example.com'],
    domain: 'acme.us.crossid.io'
    scope: 'openid profile',
    redirect_uri: 'http://localhost:3009',
  }
  // use session_storage or local_storage for a persistent cache.
  cache_type: 'memory',
})
```

note: the example above shows how to connect to a [crossid](https://crossid.io) tenant but this library can work with any OIDC authorization server that supports the PKCE extension. See [newCrossidClientByDiscovery](https://crossid.github.io/crossid-spa-js/modules.html#newcrossidclientbydiscovery) and [newCrossidClientCustom](https://crossid.github.io/crossid-spa-js/modules.html#newcrossidclientcustom).

To sign user in, call `crossid.loginWithRedirect({})` to redirect browser to the authprization server login page.
This function is typically bound to a button.

Once signing the user in completes successfully, the user will be redirected to the location specified in `redirect_uri`.

At this point, the signing in process must be completed by running the `crossid.handleRedirectCallback()` function which will take care of completing the flow and caching the tokens.

To get an access token, which can be used to access your API:

```js
const token = await client.getAccessToken()
```

To get the authenticated user:

```js
const user = await client.getUser()
```

For a working example, see [example repo](https://github.com/crossid/crossid-spa-js-example).

## Documentation

- [Example Repo](https://github.com/crossid/crossid-spa-js-example)
- [API Reference](https://crossid.github.io/crossid-spa-js/)

## Bugs and feature requests

Have a bug, feature request or feedback? Please first search for existing and closed issues. If your problem or idea is not addressed yet, [please open a new issue](https://github.com/crossid/crossid-spa-js/issues/new).

## Contributing

The main purpose of this repository is to continue evolving _crossid-spa-js_, making it more secure and easier to use. Development of this library happens in the open on GitHub, and we are grateful to the community for contributing bugfixes and improvements. Read below to learn how you can take part in improving _crossid-spa-js_.

## Reporting a Vulnerability

The Crossid team takes security issues very seriously. We appreciate your efforts to responsibly disclose your findings, and will make every effort to acknowledge your contributions.

To report a security issue, email [security@crossid.io](mailto:security@crossid.io).

We'll endeavor to respond quickly, and will keep you updated throughout the process.

## What is Crossid?

Crossid can:

- Sign users in using various _passwordless_ authentication factors (e.g., _otp_, _fingerprint_, etc...)
- Sign users in via social providers (e,g. _Facebook_) or enterprise providers (e.g., _Azure_)
- Multi factor authentication.
- Issue signed OAuth2 and Openid-Connect access tokens to protect API calls.
- Manage user profiles and access.

## License

This project is licensed under the [MIT license](./LICENSE).
