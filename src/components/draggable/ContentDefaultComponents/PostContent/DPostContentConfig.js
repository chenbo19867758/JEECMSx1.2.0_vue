import common from '@/components/draggable/common'

export default {
  ...common,
  icon: 'jia',
  type: 'postContent',
  name: '发文字号',
  // 字段名称
  groupType: '', // 基础、扩展、SEO
  // 分组类型
  groupIndex: 16,
  // 分组排序 左侧拖动区顺序
  isCustom: false,
  // 是否自定义字段
  index: 1,
  // 排序
  preview: 'DPostContentPreview',
  editor: 'DPostContentEditor',
  hiddenFields: [],
  disableFields: ['label', 'name'],
  value: {
    defaultValue: {
      issueOrg: '',
      issueYear: '',
      issueNum: ''
    }, // 默认值
    label: '发文字号', // 字段名称
    name: 'postContent', // 标签名称
    placeholder: '请输入顺序号', // 默认提示文字
    tip: '', // 帮助信息
    isRequired: false // 是否必填
  }
}
