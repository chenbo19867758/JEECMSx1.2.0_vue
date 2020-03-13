import baseForm from '@/components/mixins/baseForm'

export default {
  mixins: [baseForm],
  props: {
    value: {
      type: Object,
      default: () => ({
        defaultValue: '',
        label: '单行文本',
        name: '',
        placeholder: '请输入内容',
        tip: '',
        isLengthLimit: false,
        max: 50,
        isInputLimit: false,
        inputLimit: '',
        isRequired: false
      })
    },
    hiddenFields: {
      type: Array,
      default: () => []
    },
    disableFields: {
      type: Array,
      default: () => []
    },
    isVipModel: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      labelWidth: 'auto',
      formItems: [],
      rules: {}
    }
  },
  computed: {
    getFormItems () {
      let hiddenFields = this.hiddenFields
      if (!this.isVipModel) {
        hiddenFields.push('isRegister')
      }
      return this.formItems ? this.formItems.filter(d => !hiddenFields.includes(d.prop)).map(d => {
        if (this.disableFields.includes(d.prop)) {
          d.type = 'text'
        }
        return d
      }) : []
    }
  }
}
