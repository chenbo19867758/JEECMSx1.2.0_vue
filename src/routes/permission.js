import router, { createRouter } from '@/routes'
import store from '@/store'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 进度条 NProgress https://segmentfault.com/a/1190000014193675
NProgress.configure({
  showSpinner: false
})

const getToken = function () {
  return localStorage.getItem('JEECMS-Auth-Token')
}

// https://router.vuejs.org/zh/guide/advanced/navigation-guards.html#%E5%85%A8%E5%B1%80%E5%89%8D%E7%BD%AE%E5%AE%88%E5%8D%AB
// router.beforeEach 注册一个全局前置守卫
// to: Route: 即将要进入的目标 路由对象
// from: Route: 当前导航正要离开的路由
// next: Function: 一定要调用该方法来 resolve 这个钩子。执行效果依赖 next 方法的调用参数。
//    next():进行管道中的下一个钩子。如果全部钩子执行完了，则导航的状态就是confirmed(确认的)。
//    next(false):中断当前的导航。如果浏览器的URL改变了（可能是用户手动或者浏览器后退按钮），那么URL地址会重置到from路由对应的地址。
//    next('/')或者({path:'/'})：跳转到一个不同的地址。当前的导航被中断，然后进行一个新的导航。你可以向next传递任意位置对象，且允许设置诸如replace:true、name:'home'之类的选项以及任何用在router-link的to prop或router.push中的选项。
//    next(error):如果传入next的参数是一个Error实例，则导航会被终止且该错误会被传递给router.onError()注册过的回调。
router.beforeEach((to, from, next) => {
  // console.log('路由切换：', from.path, '===>', to.path)
  NProgress.start()
  if (to.path === '/callback') {
    next()
    NProgress.done()
  } else if (getToken()) { // 如果有token
    // 登录后进入登录页
    if (to.path === '/login') {
      next()
      NProgress.done()
    } else {
      // 当进入非登录页时，需要进行权限校验
      const addRoutes = store.getters.addRoutes
      // console.log(addRoutes.length, store.getters.routes)
      if (addRoutes.length === 0) {
        store.dispatch('permission/GenerateRoutes').then((routes) => {
          // console.log('动态加载路由')
          if (routes instanceof Array && routes.length) {
            router.match = createRouter(routes).match
            router.addRoutes(routes) // 动态添加可访问路由表
            next({ ...to }) //, replace: true
          } else {
            console.log('路由获取失败')
          }
        })
      } else {
        // console.log('已加载过动态路由')
        if (to.path === '/') {
          next({ path: '/workplace/index', replace: true })
        } else {
          if (store.state.permission.openTarget.includes(to.name) && from.name && from.name !== to.name) {
            window.open(`/#${to.fullPath}`)
          } else {
            next()
          }
        }
        NProgress.done()
      }
    }
  } else {
    if (to.path !== '/login') {
      // fullPath匹配路由，path匹配路径。
      // 路由是：/path/one
      // 真正路径是：/path/true
      // 那么此时path为/path/true，而fullPath为/path/one
      next(`/login?redirect=${escape(to.fullPath)}`)
      NProgress.done()
    } else {
      next()
      NProgress.done()
    }
  }
})

// 全局后置钩子
// 和守卫不同的是，这些钩子不会接受 next 函数也不会改变导航本身：
router.afterEach(() => {
  NProgress.done()
})
