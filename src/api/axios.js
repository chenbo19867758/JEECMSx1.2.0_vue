import axios from 'axios'
import qs from 'qs'
import { Message } from 'element-ui'
import router from '@/routes'

// axios
// 基于promise用于浏览器和node.js的http客户端

// 特点
// 支持浏览器和node.js
// 支持promise
// 能拦截请求和响应
// 能转换请求和响应数据
// 能取消请求
// 自动转换JSON数据
// 浏览器端支持防止CSRF(跨站请求伪造)


// 权限token
const tokenKey = 'JEECMS-Auth-Token'
// 创建一个实例 axios.create([config])  里面的参数就是config
const request = axios.create({
  // baseURL 如果url不是绝对路径，那么会将baseURL和url拼接作为请求的接口地址,用来区分不同环境，建议使用
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

// 请求拦截器, axios.create([config])  config就是create后面的参数
request.interceptors.request.use(config => {
  // assign 合并 baseHeader(),config.headers到 config.headers中
  // baseHeader()中包含有 token,在每次请求的时候都发送给后端。
  config.headers = Object.assign({}, baseHeader(), config.headers)
  // 比如 axios.login(loginUrls.login, data)， 其中 loginUrls.login 就是 url
  if (!config.url) {
    Message.error({
      showClose: true,
      message: '接口地址错误',
      type: 'error',
      duration: 3 * 1000
    })
  } else if (config.url.endsWith('/admin/login')) {
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    // 将对象序列化，多个对象之间用&拼接（拼接是由底层处理，无需手动操作） qs.stringify()	转换成查询字符串
    config.data = qs.stringify(config.data)
  }
  return config
}, error => {
  console.log(error)
  return Promise.reject(error)
})

// 响应拦截器
request.interceptors.response.use(response => {
  if (response.data.token && response.data.token !== '') {
    // 访问响应后把token设置到 localStorage中
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

// 登录用的请求实例-请求拦截器
requestLogin.interceptors.request.use(config => {
  config.data = qs.stringify(config.data)
  return config
}, error => {
  return Promise.reject(error)
})

// 登录用的请求实例-响应拦截器
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
  // 外部使用方式全部在前面加 axios.*** 如 axios.login, axios.upload
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
