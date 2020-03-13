const prefix = '/admin'

export default {
  // 单点登录
  singleLogin: '/admin/sso/status',
  // 单点登录登录信息
  singleInfo: '/admin/sso/getInfo',
  // 单点登录设置详情
  singleLoginDetail: '/admin/sso',
  // 单点登录设置修改
  singleLoginUpdate: '/admin/sso',
  // 验证码
  code: '/common/kaptcha',
  // 登陆
  login: `${prefix}/login`,
  // 退出
  logout: `${prefix}/logout`,
  // 上传
  upload: `${prefix}/upload/o_upload`,
  // 返回中文首字母
  pinyin: '/language/pinyin',
  // 自动摘要
  summary: '/language/summary',
  // 修改密码
  adminpsw: `${prefix}/users/adminpsw`,
  // 导入word
  docImport: `${prefix}/contentext/docImport`,
  // 登录封面图片
  registerImg: '/register/getImage'
}
