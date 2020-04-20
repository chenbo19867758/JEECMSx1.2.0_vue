/* eslint-disable quotes */
import Vue from 'vue'
import Router from 'vue-router'
import store from '@/store'
import routeMap from '@/routes/routeMap'

Vue.use(Router)

// 过滤异步的路由-递归处理
export function filterAsyncRoutes (routes) {
  let routeList = []
  const loop = (routes, parentPath = '/') => {
    if (routes instanceof Array && routes.length) {
      routes.forEach(route => {
        let { children, component, redirect, ...rt } = route
        if (rt.hidden) {
          rt.meta = {
            ...(rt.meta || {}),
            activeMenu: parentPath
          }
        }
        if (routeMap[rt.name]) {
          rt.component = () => import(`@/${routeMap[rt.name]}`)
        }
        if (children instanceof Array && children.length) {
          const subMenus = children.filter(c => c.menuType !== 2)
          if (subMenus.length) rt.redirect = subMenus[0].path
        }
        routeList.push(rt)
        if (children) {
          loop(children, rt.hidden ? parentPath : rt.path)
        }
      })
    }
  }
  loop(routes)
  return routeList
}

// 根路由
export const rootRoute = {
  path: '/',
  // name: 'index',
  component: () => import(`@/${routeMap.index}`)
}
// 公共路由
export const constantRoutes = [
  {
    path: '/login',
    name: 'login',
    hidden: true
  },
  {
    path: '/callback',
    name: 'callback',
    hidden: true
  },
  {
    path: '/layout',
    name: 'layout',
    hidden: true
  }
]

export const exceptionRoutes = [
  {
    path: '/error',
    name: 'error',
    hidden: true
  },
  {
    path: '*',
    name: 'notFound',
    hidden: true
  }
]
// 路由实例化
export const createRouter = routes => new Router({
  // mode: 'history',
  base: process.env.BASE_URL,
  routes,
  // https://router.vuejs.org/zh/guide/advanced/scroll-behavior.html#%E5%BC%82%E6%AD%A5%E6%BB%9A%E5%8A%A8
  // scrollBehavior  使用前端路由，当切换到新路由时，想要页面滚到顶部，或者是保持原先的滚动位置，就像重新加载页面那样。 vue-router 能做到，而且更好，它让你可以自定义路由切换时页面如何滚动。
  scrollBehavior: (to, from, savedPosition) => {
    if (to.hash) {
      return {
        selector: to.hash
      }
    } else if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  }
})

// vuex getters 学习https://vuex.vuejs.org/zh/guide/getters.html
// 如果有多个组件需要用到此属性，我们要么复制这个函数，或者抽取到一个共享函数然后在多处导入它——无论哪种方式都不是很理想。
// Vuex 允许我们在 store 中定义“getter”（可以认为是 store 的计算属性）。就像计算属性一样，getter 的返回值会根据它的依赖被缓存起来，且只有当它的依赖值发生了改变才会被重新计算
// 首先从store中获取路由信息，没有则用静态数据constantRoutes
// store\getters.js 中定义 routes
// routes\permission.js router.beforeEach 动态添加路由 router.addRoutes(routes)
const routes = store.getters.routes.length ? store.getters.routes : constantRoutes
const router = createRouter(filterAsyncRoutes(routes))
console.log("router=====:"+JSON.stringify(filterAsyncRoutes(routes)));
export default router
