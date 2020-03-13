
import router from '@/routes/index'
import rules from './rules'
import request from '@/api'
import enums from './enums'
import echarts from 'echarts'
import { encodeUnicode, decodeUnicode, emojiString } from './emoji.js'

var moment = require('moment')
export default {
  install (Vue, options) {
    /** 路由跳转
     * @method $routerLink
     * @param {path：路径，type：类型(list：列表，edit:修改，save：新增)，queryParams：请求参数}
    */
    Vue.prototype.$routerLink = function (path, type, queryParams, moduleId = 0) {
      var params = {
        type: type
      }
      params = Object.assign(params, queryParams)
      // 路由
      router.push({ path: path, query: params })
    }

    /** 时间戳转换
     * @method $moment
     * @param {time：时间戳，format：转换格式}
    */
    Vue.prototype.$moment = function (str, type = 'YYYY-MM-DD HH:mm:ss', filter = false) {
      if (filter) {
        if (str) {
          return moment(parseInt(str)).format(type)
        } else {
          return '-'
        }
      } else {
        return str
      }
    }
    /** 微信图片渲染
     * @method $weChatUrl
     * @param {url：图片路径}
    */
    Vue.prototype.$weChatUrl = function (url) {
      if (/^http:\/\/mmbiz/.test(url)) {
        const base = process.env.VUE_APP_API_HOST
        return `${base}/common/loadingImage?imageUrl=${url}`
      } else {
        return url
      }
    }
    Vue.prototype.$showEmojiName = function (str) {
      // 处理显示emoji昵称
      let name = decodeUnicode(str)
      name = emojiString(name)
      return name
    }
    Vue.prototype.$emojiCodeName = function (str) {
      // 处理显示emoji昵称
      return encodeUnicode(str)
    }
    Vue.prototype.$echarts = echarts
    Vue.prototype.$request = request
    Vue.prototype.$rules = rules
    Vue.prototype.$enums = enums
    /** 微信图片渲染
     * @method $lookupIcon
     * @param {suffix：后缀名；type：类型}
    */
    Vue.prototype.$lookupIcon = function (suffix) {
      let item = enums.resourceSuffix.find(v => v.suffix === suffix)
      return item
    }
    /** 时间字符串
     * @method $getDateDiff
     * @param {timespan：时间戳}
    */
    Vue.prototype.$getDateDiff = function (timespan, istimesTamp) {
      var dateTime = new Date(timespan)
      var year = dateTime.getFullYear()
      var month = dateTime.getMonth() + 1
      var day = dateTime.getDate()
      var hour = dateTime.getHours()
      var minute = dateTime.getMinutes()
      // var second = dateTime.getSeconds()
      var now = new Date()
      var nowNew = now.getTime() // typescript转换写法
      var milliseconds = 0
      var timeSpanStr
      milliseconds = nowNew - timespan

      if (milliseconds <= 1000 * 60 * 1) {
        timeSpanStr = '刚刚'
      } else if (1000 * 60 * 1 < milliseconds && milliseconds <= 1000 * 60 * 60) {
        timeSpanStr = Math.round((milliseconds / (1000 * 60))) + '分钟前'
      } else if (1000 * 60 * 60 * 1 < milliseconds && milliseconds <= 1000 * 60 * 60 * 24) {
        timeSpanStr = Math.round(milliseconds / (1000 * 60 * 60)) + '小时前'
      } else if (1000 * 60 * 60 * 24 < milliseconds && milliseconds <= 1000 * 60 * 60 * 24 * 3) {
        timeSpanStr = Math.round(milliseconds / (1000 * 60 * 60 * 24)) + '天前'
      } else if (milliseconds > 1000 * 60 * 60 * 24 * 3 && year === now.getFullYear()) {
        timeSpanStr = year + '-' + month + '-' + day + ' ' + hour + ':' + minute
      } else {
        timeSpanStr = year + '-' + month + '-' + day + ' ' + hour + ':' + minute
      }
      return timeSpanStr
    }

    /** 当前地址ip
     * @method $path
     * @param {}
    */
    Vue.prototype.$path = process.env.VUE_APP_API_HOST

    /** 当前地址ip
     * @method $getPath
     * @param {url: 路径}
    */
    Vue.prototype.$getPath = function (url) {
      const base = process.env.VUE_APP_API_HOST
      if (/^http/.test(url)) return url
      return base + url
    }
    /** 是否开发模式
     * @method $env
     * @param {}
    */
    Vue.prototype.$env = process.env.VUE_APP_ENV

    /** 导出，下载处理文件流
     * @method $exportClick
     * @param {res：文件流，name ： 下载文件名}
    */
    Vue.prototype.$exportClick = function (res, name = '下载.zip') {
      const content = res
      const blob = new Blob([content])
      const fileName = name
      if ('download' in document.createElement('a')) { // 非IE下载
        const elink = document.createElement('a')
        elink.download = fileName
        elink.style.display = 'none'
        elink.href = URL.createObjectURL(blob)
        document.body.appendChild(elink)
        elink.click()
        URL.revokeObjectURL(elink.href) // 释放URL 对象
        document.body.removeChild(elink)
      } else { // IE10+下载
        navigator.msSaveBlob(blob, fileName)
      }
    }

    /** 当res.code === 200 时
     * @method $restBack
     * @param {res：回调参数，fn ： 成功后回调函数，message：成功提示，type：提示类型}
    */
    Vue.prototype.$restBack = function (res, fn = () => {}, message = '操作成功', type = 'success') {
      if (res.code === 200) {
        this.$message({
          message: message || res.message,
          type: type
        })
        fn()
      }
    }
  }
}
