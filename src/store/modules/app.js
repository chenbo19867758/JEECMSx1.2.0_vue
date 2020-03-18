import request from '@/api'
import { desEncrypt, getImageUrl } from '@/utils'
export default {
  // 模块内部的 action、mutation 和 getter 是注册在全局命名空间，添加 namespaced: true 的方式使其成为带命名空间，启用了命名空间的 getter 和 action 会收到局部化的 getter，dispatch 和 commit，而mutation依然只能改变局部state
  namespaced: true,
  state: {
    theme: '',
    themes: [
      {
        name: 'grayBlue',
        color: '#1EC6DF',
        bodyClass: 'custom-grayBlue',
        img: require('../../assets/img/zhuti-01.png')
      },
      {
        name: 'blue',
        color: '#2D5998',
        bodyClass: 'custom-blue',
        img: require('../../assets/img/zhuti-02.png')
      },
      {
        name: 'lightBlue',
        color: '#3C8DBC',
        bodyClass: 'custom-lightBlue',
        img: require('../../assets/img/zhuti-03.png')
      },
      {
        name: 'green',
        color: '#347C54',
        bodyClass: 'custom-green',
        img: require('../../assets/img/zhuti-04.png')
      },
      {
        name: 'red',
        color: '#E32416',
        bodyClass: 'custom-red',
        img: require('../../assets/img/zhuti-05.png')
      },
      {
        name: 'purple',
        color: '#684EA4',
        bodyClass: 'custom-purple',
        img: require('../../assets/img/zhuti-06.png')
      },
      {
        name: 'gray',
        color: '#ECECEC',
        bodyClass: 'custom-gray',
        img: require('../../assets/img/zhuti-07.png')
      }
    ],
    colorObj: {
      'custom-grayBlue': [
        ['#1EC6DF', '#86EDFC'], // 日志统计柱状图
        ['#FF803B', '#1EC6DF', '#08B4CF', '#0B9AB0'], // 首页趋势图
        ['#66E0F2', '#54D0E0', '#26E0FC', '#10C9E6', '#08B4CF', '#0B9AB0'] // 日志统计操作类型
      ],
      'custom-blue': [
        ['#2D5998']
      ],
      'custom-lightBlue': [
        ['#3C8DBC']
      ],
      'custom-green': [
        ['green']
      ],
      'custom-red': [
        ['#E32416']
      ],
      'custom-purple': [
        ['#684EA4']
      ],
      'custom-gray': [
        ['#ECECEC']
      ]
    },
    lang: '',
    langs: [
      {
        name: 'cn',
        label: '中文(简体)'
      },
      {
        name: 'tw',
        label: '中文(繁体)'
      },
      {
        name: 'en',
        label: 'English'
      }
    ],
    user: {
      needChangePassword: false,
      nextNeedCaptcha: false,
      'JEECMS-Auth-Token': '',
      userName: '',
      lastLoginTime: '',
      lastLoginIP: ''
    },
    routings: [], // 权限标识
    menus: [], // 菜单
    setting: {
      id: '',
      aduitMemberFlowId: '',
      dataBackupsMemory: {},
      attrs: {}
    },
    notice: '',
    ssoAuthToken: ''
  },
  mutations: {
    // 主题
    UPDATE_THEME (state, data) {
      document.body.className = data
      state.theme = data
      window.localStorage.setItem('theme', data)
    },
    // 语言
    UPDATE_LANG (state, data) {
      state.lang = data
      window.localStorage.setItem('lang', data)
    },
    // 用户和路由权限
    SET_USER (state, data) {
      // 数据结构查看 系统分析\登录成功返回数据.json
      // 结构赋值，有命名为auth属性，propData为其他数据的集合
      const { auth, ...propData } = data
      // 结构赋值，有命名为menus，routings属性，user为其他数据的集合
      const { menus, routings, ...user } = auth
      // state.user, user数组, propData数组 组合成一个新对象重新设置到 state.user中
      // 相当于 data中除去了 menus菜单，routings路由数据存到state.user中
      state.user = Object.assign({}, state.user, user, propData)
      state.menus = menus || []
      state.routings = routings || []
      // 设置本地缓存
      if (propData['JEECMS-Auth-Token']) window.localStorage.setItem('JEECMS-Auth-Token', propData['JEECMS-Auth-Token'])
      if (propData['siteId']) window.localStorage.setItem('siteId', propData['siteId'])
      if (propData['siteName']) window.localStorage.setItem('siteName', propData['siteName'])
    },
    // 退出，清空数据
    SET_OUT (state) {
      window.localStorage.removeItem('JEECMS-Auth-Token')
      state.user = {
        needChangePassword: false,
        nextNeedCaptcha: false,
        'JEECMS-Auth-Token': '',
        userName: '',
        lastLoginTime: '',
        lastLoginIP: ''
      }
      state.menus = []
      state.routings = []
      state.ssoAuthToken = ''
    },
    SET_NCP (state, data) {
      state.user.needChangePassword = data
    },
    UPDATE_USER (state, data) {
      state.user = Object.assign({}, state.user, data)
    },
    UPDATE_ROUTINGS (state, data) {
      state.routings = data || []
    },
    // 系统设置，登录成功后从后台返回的数据缓存到store中
    SET_SETTING (state, data) {
      state.setting = data
      // 这里的主要目的是设置ico
      // "systemFlagResourceUrl": "/u/cms/www/201912/05141941d5gu.ico",
      if (data.attrs && data.attrs.systemFlagResourceUrl) {
        const href = getImageUrl(data.attrs.systemFlagResourceUrl)
        var link = document.querySelector("link[rel*='icon']") || document.createElement('link')
        link.type = 'image/x-icon'
        link.rel = 'shortcut icon'
        link.href = href
        document.getElementsByTagName('head')[0].appendChild(link)
      }
    },
    // 通知
    SET_NOTICE (state, data) {
      state.notice = data > 99 ? '99+' : data
    },
    // 单点登录token
    SET_SSO (state, data) {
      state.ssoAuthToken = data.authToken
    }
  },
  actions: {
    updateRoutings ({ commit }, data) {
      commit('UPDATE_ROUTINGS', data)
    },
    updateUser ({ commit }, data) {
      commit('UPDATE_USER', data)
    },
    changeTheme ({ state, commit, rootState, dispatch }, data) {
      commit('UPDATE_THEME', data)
    },
    changeLang ({ state, commit, rootState, dispatch }, data) {
      commit('UPDATE_LANG', data)
    },
    // 普通登录
    // state：数据对象，commit：提交修改方法，rootState：根节点数据对象，dispatch actions：的全局异步调用方法
    fetchLogin ({ state, commit, rootState, dispatch }, data) {
      // desEncrypt  utils\index.js 中的方法
      // data.desStr 为 form 中的password  命名为 desStr
      data.desStr = desEncrypt(JSON.stringify({ pStr: data.desStr }))
      // request 为 import request from '@/api'
      // fetchLogin 为 api\apis\login.js 中的方法
      return request.fetchLogin(data).then(res => {
        // nextNeedCaptcha 下次登录是否需要验证码
        if (res.code === 200 && !res.data.nextNeedCaptcha) {
          // 提交修改到 vuex 保存数据，分别使用 commit,dispatch.
          // SET_USER 设置 用户和路由权限，保存到localStorage中
          commit('SET_USER', res.data)
          // fetchSetting为异步调用所以用dispatch，fetchSetting主要是设置ico图标可以不管
          dispatch('fetchSetting')
          // config/FetchSitesOwnsite为异步调用所以用dispatch
          // 命名空间action 操作根下的所有节点, 可以操作根及以下所有模块的mutations或actions从而改变其他模块的state
          // config/FetchSitesOwnsite指定方法，true为参数，{ root: true }为配置，指定根下的所有节点
          dispatch('config/FetchSitesOwnsite', true, { root: true })
        }
        return res
      })
    },
    // 单点登录后获取详情
    fetchSingleInfo ({ state, commit, rootState, dispatch }, data) {
      commit('SET_SSO', data)
      return request.fetchSingleInfo(data).then(res => {
        if (res.code === 200) {
          if (res.data.userType === 1) {
            commit('SET_USER', res.data)
            dispatch('fetchSetting')
            dispatch('config/FetchSitesOwnsite', true, { root: true })
          } else {
            if (res.data.url) window.location.href = res.data.url
          }
        }
        return res
      })
    },
    // 退出
    fetchLogout ({ state, commit, dispatch }) {
      const token = window.localStorage.getItem('JEECMS-Auth-Token')
      const authToken = state.ssoAuthToken
      request.fetchLogout({ token, authToken })
      commit('SET_OUT')
      dispatch('permission/Clear', true, { root: true })
    },
    SetNeedChangePassword ({ commit }) {
      commit('SET_NCP', false)
    },
    // 异步调用
    async fetchSetting ({ commit }) {
      // 获取系统配置信息 api\apis\system.js 中的方法
      request.fetchSystemSettingDetail().then(res => {
        if (res.code === 200) {
          commit('SET_SETTING', res.data)
        }
      })
    },
    fetchNotice ({ state, commit, rootState, dispatch }, data) {
      return request.fetchSystemmessageNumber().then(res => {
        if (res.code === 200) {
          commit('SET_NOTICE', res.data.unreadMessage)
        }
      })
    }
  },
  getters: {
    langIndex (state, getters) {
      return state.langs.findIndex(d => d.name === state.lang)
    },
    chartOption: state => opt => {
      return {
        height: 600,
        forceFit: true,
        padding: ['auto', 'auto', 80, 'auto'],
        ...opt
      }
    },
    axisOption: state => opt => {
      return {
        dataKey: '时间',
        label: {
          textStyle: {
            fontSize: 14,
            fill: '#999999'
          }
        },
        line: {
          stroke: '#EEEEEE'
        },
        tickLine: {
          length: -4,
          stroke: '#E8E8E8'
        },
        ...opt
      }
    },
    legendOption: state => opt => {
      return {
        useHtml: true,
        itemTpl: '<li class="g2-legend-list-item item-{index} {checked}" data-color="{originColor}" data-value="{originValue}" style="cursor: pointer;font-size: 16px;">' + '<i class="g2-legend-marker" style="width:8px;height:8px;border-radius:50%;display:inline-block;background-color: {color};"></i>' + '<span class="g2-legend-text" style="padding-left:6px;color:#999999">{value}</span>' + '</li>',
        ...opt
      }
    },
    colorOption: state => index => {
      const colors = state.colorObj[state.theme]
      if (colors instanceof Array && colors.length) {
        if (index < colors.length) {
          return colors[index]
        }
      }
      return ''
    }
  }
}
