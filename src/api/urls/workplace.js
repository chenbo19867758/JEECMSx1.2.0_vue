const prefix = '/admin'

export default {
  // 代办
  toDeal: `${prefix}/task/toDeal`,
  // 已办
  handle: `${prefix}/task/handle`,
  // 未办
  overDue: `${prefix}/task/overDue`,
  // 操作
  audit: `${prefix}/task/audit`,
  // 撤回
  revoke: `${prefix}/task/revoke`,
  // 首页今日统计和累计统计
  statistics: `${prefix}/index/statistics`,
  // 首页待办事项
  upcoming: `${prefix}/index/upcoming`
}
