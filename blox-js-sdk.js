import qs from 'query-string'

const base = window.location.origin
let clientId = null
const authorizationEndpoint = 'https://shield-dev.appblox.io/login'

const getCodeInUrl = function () {
  const parsedQuery = qs.parseUrl(window.location.href)
  const code = parsedQuery.query.code
  return code
}

class TokenStore {
  constructor() {
    if (!getCodeInUrl()) {
      this.initRefreshCycle()
    }
  }
  t
  rt
  te
  sendRefreshBefore = 10000
  timeoutHandle
  setToken(token) {
    this.t = token
    localStorage.setItem('_ab_t', token)
  }
  initRefreshCycle() {
    clearTimeout(this.timeoutHandle)
    let expiresIn = this.getExpiry()
    console.log('expires in = ', expiresIn)
    if (!expiresIn) return false
    expiresIn *= 1000

    let timer = expiresIn - new Date().getTime()
    if (!timer || timer < this.sendRefreshBefore || isNaN(timer)) {
      if (!timer) console.log('!timer')
      if (timer < this.sendRefreshBefore)
        console.log('less than', this.sendRefreshBefore)
      if (isNaN(timer)) console.log('isNan')
      console.log(
        'invalid expiry time ',
        new Date().getTime(),
        expiresIn,
        timer
      )
      return null
    }
    timer = parseInt(timer) - this.sendRefreshBefore
    console.log('valid expiry time ', new Date().getTime(), expiresIn, timer)
    this.timeoutHandle = setTimeout(() => {
      refreshAccessToken()
    }, timer)
  }
  setExpiry(timestamp) {
    this.te = timestamp
    localStorage.setItem('_ab_t_e', timestamp)
  }
  getExpiry() {
    return this.te || localStorage.getItem('_ab_t_e')
  }
  removeToken(token) {
    this.t = token
    localStorage.removeItem('_ab_t')
  }
  setRefreshToken(token) {
    this.rt = token
    localStorage.setItem('_ab_rt', token)
  }
  removeRefreshToken(token) {
    this.rt = token
    localStorage.removeItem('_ab_rt')
  }
  getToken() {
    return this.t || localStorage.getItem('_ab_t')
  }
  getRefreshToken() {
    return this.rt || localStorage.getItem('_ab_rt')
  }
  clearTokens() {
    this.removeRefreshToken()
    this.removeToken()
  }
}

const tokenStore = new TokenStore()

const refreshAccessToken = async () => {
  console.log('calling refresh access token')
  const server = 'https://shield-dev.appblox.io/refresh-token'
  try {
    const res = await fetch(server, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenStore.getToken()} ${tokenStore.getRefreshToken()}`,
      },
    })
    const data = await res.json()
    if (data && data.data.AccessToken) {
      console.log('data is ', data.data)
      tokenStore.setToken(data.data.AccessToken)
      tokenStore.setExpiry(data.data.AtExpires)
      tokenStore.setRefreshToken(data.data.RefreshToken)
      tokenStore.initRefreshCycle()
    } else if (data.status === 401) {
      console.log('expired token')
      tokenStore.clearTokens()
      await verifyLogin()
      // await logout()
      // verifyLogin();
    }
  } catch (error) {
    console.log('error in refreshing = ', error)
    // await logout()
    // verifyLogin();
  }
}

export const logout = async () => {
  await shieldLogout()
  tokenStore.removeRefreshToken()
  tokenStore.removeToken()

  await verifyLogin()
}
export const verifyLogin = async () => {
  let token = tokenStore.getToken()
  if (!token) {
    const authorizationUrl = getAuthUrl()
    window.location = authorizationUrl
  } else {
    const isValid = await validateAccessToken()
    if (!isValid) {
      const authorizationUrl = getAuthUrl()
      window.location = authorizationUrl
    }
    return isValid
  }
}
const validateAccessToken = async () => {
  const server = `https://shield-dev.appblox.io/validate-appblox-acess-token`
  try {
    const res = await fetch(server, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenStore.getToken()}`,
      },
    })
    const data = await res.json() // access token set to appblox io cookie

    return data.data && data.data === 'valid'
  } catch (error) {
    console.log(error)
  }
}
const shieldLogout = async () => {
  const server = `https://shield-dev.appblox.io/logout`
  try {
    const res = await fetch(server, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenStore.getToken()}`,
      },
    })
    const data = await res.json() // access token set to appblox io cookie

    return data
  } catch (error) {
    console.log(error)
  }
}
const getAuthUrl = () => {
  const oAuthQueryParams = {
    response_type: 'code',
    scope: 'user private_repo',
    redirect_uri: base,
    client_id: clientId,
    state: 'state123',
  }

  const query = qs.stringify(oAuthQueryParams)

  const authorizationUrl = `${authorizationEndpoint}?${query}`
  return authorizationUrl
}

export const init = async function (id) {
  clientId = id
  const code = getCodeInUrl()
  // var cookie;
  if (code) {
    const tokenData = await sendCodeToServer(code)
    if (tokenData.success && tokenData.data) {
      tokenStore.setToken(tokenData.data.ab_at)
      tokenStore.setExpiry(tokenData.data.expires_in)
      tokenStore.setRefreshToken(tokenData.data.ab_rt)
      tokenStore.initRefreshCycle()
    }
  }
}

async function sendCodeToServer(code) {
  const server = `https://shield-dev.appblox.io/auth/get-token?grant_type=authorization_code&code=${code}&redirect_uri=${base}`
  try {
    const res = await fetch(server, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    const data = await res.json() // access token set to appblox io cookie
    if (location.href.includes('?')) {
      history.pushState({}, null, location.href.split('?')[0])
    }
    console.log('🚀  file: index.js  line 50  sendCodeToServer  data', data)
    return data
  } catch (error) {
    console.log(error)
  }
}

export const shield = {
  init,
  verifyLogin,
  tokenStore,
  getAuthUrl,
  logout,
}
