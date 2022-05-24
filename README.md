blox-js-sdk
===========

blox-js-sdk provides the essential packages to facilitate appblox features across appblox applications.

As of now, blox-js-sdk contains the following
- [shield](#shield) : methods to use SHIELD
- [ab-federation-helpers](#ab-federation-helpers) : libraries to ease the use of Webpack Module Federation - Promise based loading.

shield helps to setup authentication for your application. It contains many methods to setup user authentication with shield and obtain tokens across appblox applications.

ab-federation-helpers contains hooks and methods to facilitate federated Components and Modules

Currently blox-js-sdk is maintained in a private git repo.

Installation
---------------
        npm i git+https://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:x-oauth-basic@github.com/Appblox/blox-js-sdk.git

Usage
-----
        import { shield } from 'blox-js-sdk/shield'

        import { useFederatedComponent } from 'blox-js-sdk/ab-federation-helpers'

---
# shield
blox-js-sdk/shield includes the following elements
1. [tokenStore](#tokenstore)
2. [init](#init)
3. [verifyLogin](#verifylogin)
4. [getAuthUrl](#getauthurl)
5. [logout](#logout)


## tokenStore

#### Description
Its an object which stores the token, refresh Token, expiry time as private variables along with related functions. It contains the timer id for the token

#### Usage
    shield.tokenStore.getToken()

## init

#### Description
Its used to initialise the tokenstore with values from the shield backend. It takes a parameter clientID which is unique for each application.

#### Usage

    await shield.init('dev-app-6303')

## verifyLogin

#### Description
It retrieves for the token from the localStorage and validates the token. If the token is not present in the localStorage it redirects to the shield login.

#### Usage

    const isLoggedinn = await shield.verifyLogin()

## getAuthUrl

#### Description
It generates authorization URL with query parameters

#### Usage

    const authUrl = shield.getAuthUrl()

## logout

#### Description
It logs out the user by removing the token from localStorage and redirects to shield login.

#### Usage

    await shield.logout()

---


# ab-federation-helpers
ab-federation-helpers includes the following elements
1. [useFederatedComponent](#usefederatedcomponent)
2. [useFederatedModule](#usefederatedmodule)
3. [useDynamicScript](#usedynamicscript)


## useFederatedComponent

#### Description
used to obtain federated Component . 

#### Usage

    const system = {
        module: './login',
        scope: 'login',
        url: 'http://localhost:3013/remoteEntry.js',
    }
    const { Component: FederatedComponent, errorLoading } = useFederatedComponent(
      system?.url,
      system?.scope,
      system?.module,
      React
    )
    return (
      <React.Suspense fallback={''}>
        {errorLoading
          ? `Error loading module "${module}"`
          : FederatedComponent && <FederatedComponent />}
      </React.Suspense>
    )

## useFederatedModule

#### Description
used to obtain federated Module .

#### Usage

    const system = {
        module: './login',
        scope: 'login',
        url: 'http://localhost:3013/remoteEntry.js',
    }
    const { Component: FederatedModule, errorLoading } = useFederatedModule(
      system?.url,
      system?.scope,
      system?.module,
      React
    )

## useDynamicScript

#### Description
loads script from remote URL.

#### Usage

      const { ready, errorLoading } = useDynamicScript(remoteUrl, React);
