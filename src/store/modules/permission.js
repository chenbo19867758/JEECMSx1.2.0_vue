import router, { rootRoute, exceptionRoutes, filterAsyncRoutes } from '@/routes'
// eslint-disable-next-line no-unused-vars
import asyncRoutes from '@/routes/asyncRoutes'
// eslint-disable-next-line no-unused-vars
import request from '@/api'

export default {
  namespaced: true,
  state: {
    routes: [],
    addRoutes: [],
    excludes: [],
    includes: [],
    openTarget: ['modelVipDetail//']
  },
  mutations: {
    SET_ROUTES: (state, data) => {
      state.addRoutes = data
      const root = data.find(d => d.path === '/')
      state.routes = root ? root.children : []
      // state.routes = constantRoutes.concat(data)
      // console.log(state.addRoutes, state.routes)
    },
    SET_EXCLUDES: (state, data) => {
      state.excludes = data
    },
    SET_INCLUDES: (state, data) => {
      state.includes = data
    },
    CLEAR_ROUTES: (state) => {
      state.addRoutes = []
      state.routes = []
      state.excludes = []
      state.includes = []
    }
  },
  actions: {
    GenerateRoutes ({ commit, rootState, dispatch }) {
      // =====开发时使用本地路由数据
      // const openPermission = window.localStorage.getItem('openPermission')
      // if (openPermission !== '1') {
      //   return new Promise(resolve => {
      //     let accessedRoutes = filterAsyncRoutes(asyncRoutes.concat(exceptionRoutes))
      //     commit('SET_ROUTES', [{
      //       ...rootRoute,
      //       children: asyncRoutes
      //     }])
      //     dispatch('app/fetchSetting', {}, { root: true })
      //     resolve([{
      //       ...rootRoute,
      //       children: accessedRoutes
      //     }])
      //   })
      // }
      // =====上线时使用接口路由
      // store\modules\app.js state里面有 menus: []
      const menus = rootState.app.menus
      if (menus instanceof Array && menus.length) {
        return new Promise(resolve => {
          // exceptionRoutes 定义在 routes/index.js中的静态变量
          // concat 拼接
          let accessedRoutes = filterAsyncRoutes(menus.concat(exceptionRoutes))
          commit('SET_ROUTES', [{
            ...rootRoute,
            children: menus
          }])
          resolve([{
            ...rootRoute,
            children: accessedRoutes
          }])
        })
      }
      console.log('fetchMenusPermission()')
      return request.fetchMenusPermission().then(res => {
        if (res.code === 200) {
          const routes = res.data.menus.concat(exceptionRoutes)
          let accessedRoutes = filterAsyncRoutes(routes)

          //console.log("accessedRoutes:"+JSON.SON.stringify(accessedRoutes));

          // 这里登陆成功后会返回json数据，数据里包括menus接口，查看"登录成功返回数据.json"文件
          const { perms, menus, ...propData } = res.data
          commit('SET_ROUTES', [{
            ...rootRoute,
            children: res.data.menus
          }])
          dispatch('app/updateUser', propData, { root: true })
          dispatch('app/updateRoutings', perms, { root: true })
          dispatch('app/fetchSetting', {}, { root: true })
          dispatch('config/FetchSitesOwnsite', true, { root: true })
          return [{
            ...rootRoute,
            children: accessedRoutes
          }]
        } else {
          router.push('/login')
        }
        return null
      })
    },
    AddExcludes ({ commit, state }, path) {
      let excludes = state.excludes
      if (excludes.indexOf(path) < 0) {
        excludes.push(path)
      }
      commit('SET_EXCLUDES', excludes)
    },
    DelExcludes ({ commit, state }, path) {
      let excludes = state.excludes.filter(e => e !== path)
      commit('SET_EXCLUDES', excludes)
    },
    AsyncIncludes ({ commit, state }, data) {
      commit('SET_INCLUDES', data)
    },
    AddIncludes ({ commit, state }, path) {
      let includes = state.includes
      if (includes.indexOf(path) < 0) {
        includes.push(path)
      }
      commit('SET_INCLUDES', includes)
    },
    DelIncludes ({ commit, state }, path) {
      let includes = state.includes.filter(i => i !== path)
      commit('SET_INCLUDES', includes)
    },
    Clear ({ commit }) {
      commit('CLEAR_ROUTES')
    }
  }
}
