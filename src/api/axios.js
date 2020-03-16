import axios from 'axios'
import qs from 'qs'
import { Message } from 'element-ui'
import router from '@/routes'

// 权限token
const tokenKey = 'JEECMS-Auth-Token'
const request = axios.create({
  baseURL: process.env.VUE_APP_API_PREFIX,
  timeout: 50000,
  headers: {
    'Content-Type': 'application/json',
    // 'Content-Type': 'application/x-www-form-urlencoded'
    // 'Content-Type': 'multipart/form-data;  boundary=----WebKitFormBoundary2aXQlWf6Ry3KweQt'
    'Redirect-Header': false
  }
})

const baseHeader = () => {
  const token = window.localStorage.getItem(tokenKey)
  const siteId = window.localStorage.getItem('siteId')
  return {
    [tokenKey]: token,
    siteId
  }
}

// 请求拦截
request.interceptors.request.use(config => {
  config.headers = Object.assign({}, baseHeader(), config.headers)
  if (!config.url) {
    Message.error({
      showClose: true,
      message: '接口地址错误',
      type: 'error',
      duration: 3 * 1000
    })
  } else if (config.url.endsWith('/admin/login')) {
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    config.data = qs.stringify(config.data)
  }
  return config
}, error => {
  console.log(error)
  return Promise.reject(error)
})

// 请求拦截
request.interceptors.response.use(response => {
  if (response.data.token && response.data.token !== '') {
    localStorage.setItem(tokenKey, response.data.token)
  }
  return response
}, error => {
  // console.log(error)
  let message = error.message
  if (error.response.status === 404) {
    message = '接口访问失败'
  }
  Message({
    showClose: true,
    message,
    type: 'error',
    duration: 3 * 1000
  })
  return Promise.reject(error)
})

const checkStatus = response => {
  // console.log('axios', response.data)
  if (response && response.status === 401) {
    window.localStorage.setItem(tokenKey, '')
    const url = window.location.hash.substr(1)
    if (/^\/login/.test(url)) {
      router.push(url)
    } else {
      router.push(`/login?redirect=${escape(url)}`)
    }
    return
  }
  if (response && (response.status === 200 || response.status === 304 || response.status === 400 || response.status === 404)) {
    return response.data
  }
  return {
    status: -404,
    msg: '网络异常'
  }
}

function checkCode (res) {
  if ([501, 502, 503, 506].includes(res.code)) {
    window.localStorage.setItem(tokenKey, '')
    const url = window.location.hash.substr(1)
    if (/^\/login/.test(url)) {
      router.push(url)
    } else {
      router.push(`/login?redirect=${escape(url)}`)
    }
  }
  if (res.code !== 200 && res.code !== 1) {
    Message.closeAll()
    Message({
      showClose: true,
      message: res.message || '服务器端错误',
      type: 'error',
      duration: 3 * 1000
    })
  }
  return res
}

// 登录用的请求实例
const requestLogin = axios.create({
  baseURL: process.env.VUE_APP_API_PREFIX,
  timeout: 50000,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
})

// 请求拦截
requestLogin.interceptors.request.use(config => {
  config.data = qs.stringify(config.data)
  return config
}, error => {
  return Promise.reject(error)
})

// 请求拦截
requestLogin.interceptors.response.use(response => {
  return response
}, error => {
  let message = error.message
  if (error.response.status === 404) {
    message = '接口访问失败'
  }
  Message({
    showClose: true,
    message,
    type: 'error',
    duration: 3 * 1000
  })
  return Promise.reject(error)
})

export default {
  request (config) {
    return axios.request(config).then(checkStatus).then(checkCode)
  },
  login (url, data) {
    return requestLogin({
      method: 'post',
      url,
      data
    }).then(checkStatus).then(checkCode)
  },
  upload (url, data, onUploadProgress = () => {}) {
    return request({
      method: 'post',
      url,
      headers: { 'Content-Type': 'multipart/form-data' },
      data,
      onUploadProgress,
      timeout: 0
    }).then(checkStatus).then(checkCode)
  },
  download (url, data, onDownloadProgress = () => {}) {
    return request({
      method: 'post',
      url,
      data,
      responseType: 'blob',
      onDownloadProgress
    }).then(checkStatus)
  },
  post (url, data, onUploadProgress = () => {}) {
    return request({
      method: 'post',
      url,
      data,
      onUploadProgress
    }).then(checkStatus).then(checkCode)
  },
  get (url, params, headers = {}) {
    return request({
      method: 'get',
      url,
      params,
      headers
    }).then(checkStatus).then(checkCode)
  },
  put (url, data) {
    return request({
      method: 'put',
      url,
      data
    }).then(checkStatus).then(checkCode)
  },
  patch (url, data) {
    return request({
      method: 'patch',
      url,
      data
    }).then(checkStatus).then(checkCode)
  },
  delete (url, data) {
    return request({
      method: 'delete',
      url,
      data
    }).then(checkStatus).then(checkCode)
  }
}
