import { Message, MessageBox } from 'element-ui'
import i18n from '@/i18n'
import permission from '@/directive/permission'
import store from '@/store'

export default {
  directives: { permission },
  methods: {
    _getItem (key) {
      return window.localStorage.getItem(key)
    },
    _setItem (key, value) {
      if (value instanceof Array) {
        value = JSON.stringify({ key: value })
      } else if (value instanceof Object && typeof value === 'object') {
        value = JSON.stringify(value)
      }
      return window.localStorage.setItem(key, value)
    },
    _removeItem (key) {
      return window.localStorage.removeItem(key)
    },
    _confirmDelete (type = 'confirmDelete') {
      return MessageBox.confirm(i18n.t(`message.${type}`), i18n.t('global.tip'), {
        confirmButtonText: i18n.t('global.confirm'),
        cancelButtonText: i18n.t('global.cancel'),
        type: 'warning'
      })
    },
    _messageOne () {
      Message(i18n.t('message.selectLeastOne'))
    },
    _messageSuccess (type) {
      Message.success(i18n.t(`global.${type}`) + i18n.t('global.success'))
    },
    _checkPermission (api, method) {
      const permissions = store.getters && store.getters.routings
      if (permissions instanceof Array && permissions.find(d => d.apiUrl === api && d.requestMethod === method)) {
        return true
      }
      // 所有页面按钮权限开关
      // if (this._getItem('openPermission') !== '1') {
      //   return true
      // }
      return false
    }
  }
}
