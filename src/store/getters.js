// Vuex 允许我们在 store 中定义“getter”（可以认为是 store 的计算属性）。就像计算属性一样，getter 的返回值会根据它的依赖被缓存起来，且只有当它的依赖值发生了改变才会被重新计算。
// 值变化跟着变
// src/store/modules 下面对应配置，
// src/store/modules/permission.js 对应存储值
const getters = {
  user: state => state.app.user,
  areaOptions: state => state.system.areaOptions,
  areaOptionsId: state => state.system.areaOptionsId,
  setting: state => state.app.setting,
  routings: state => state.app.routings,
  config: state => state.config,
  system: state => state.system,
  // 添加路由数据
  addRoutes: state => state.permission.addRoutes,
  // 获取路由数据
  routes: state => state.permission.routes,
  memberInfo: state => state.system.member,
  userSecurityOptions: state => state.system.userSecurityOptions,
  contentSecurityOptions: state => state.system.contentSecurityOptions,
  accessorySecurityOptions: state => state.system.accessorySecurityOptions,
  ftpOptions: state => state.system.ftpOptions,
  ossOptions: state => state.system.ossOptions,
  columnOptions: state => state.column.columnOptions,
  contentColumnOptions: state => state.column.contentColumnOptions,
  columnModelOptions: state => state.column.columnModelOptions,
  content: state => state.content,
  contentModelOptions: state => state.content.contentModelOptions,
  organizeOptions: state => state.system.organizeOptions,
  organizeOptionsAll: state => state.system.organizeOptionsAll,
  roleOptions: state => state.system.roleOptions,
  memberLevelOptions: state => state.vip.memberLevelOptions,
  memberGroupOptions: state => state.vip.memberGroupOptions,
  resourceOptions: state => state.system.resourceOptions,
  shareResourceOptions: state => state.system.shareResourceOptions,
  ownerTree: state => state.config.ownerTree,
  ownSiteOptions: state => state.config.ownSiteOptions,
  currentSiteId: state => state.config.currentSiteId,
  currentSiteName: state => state.config.currentSiteName,
  siteBaseConfig: state => state.config.siteBaseConfig,
  siteExtendConfig: state => state.config.siteExtendConfig,
  wechatInfoList: state => state.content.wechatInfoList,
  weiboinfoList: state => state.content.weiboinfoList,
  tencentList: state => state.social.tencentList,
  wechatTags: state => state.wechat.wechatTags,
  workflowOptions: state => state.config.workflowOptions,
  issueOrgOptions: state => state.config.issueOrgOptions,
  issueYearOptions: state => state.config.issueYearOptions,
  smsIsGloable: state => state.system.smsIsGloable,
  smsIsEnable: state => state.system.smsIsEnable,
  emailIsGloable: state => state.system.emailIsGloable,
  emailIsEnable: state => state.system.emailIsEnable,
  detailData: state => state.interact.detailData
}
export default getters
