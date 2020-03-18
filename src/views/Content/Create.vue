<script>
import moment from 'moment'
import Detail from './Detail'
import { deepClone } from '@/utils'
export default {
  extends: Detail,
  name: 'contentCreate',
  provide () {
    return {
      changeColumn: '',
      changeCurrentTab: ''
    }
  },
  data () {
    return {
      excludeList: ['imageUpload', 'singleImage', 'audioUpload', 'videoUpload', 'fileUpload'],
      bttons: [
        {
          name: '1',
          label: '存为初稿',
          icon: 'baocun',
          disabled: !this._checkPermission('/admin/contentext', 'PUT')
        },
        {
          name: '2',
          label: '发布',
          icon: 'fabu',
          disabled: !this._checkPermission('/admin/contentext', 'PUT')
        },
        {
          name: '3',
          label: '存为草稿',
          icon: 'cunweicaogao',
          disabled: !this._checkPermission('/admin/contentext', 'PUT')
        },
        {
          name: '12',
          label: '提交审核',
          icon: 'shenhe',
          disabled: !this._checkPermission('/admin/contentext', 'PUT')
        }
      ],
      handleHeaders: [
        {
          text: '保存',
          key: 'dropdown',
          icon: 'baocun',
          active: false,
          showHandle: true,
          options: [
            {
              name: '1',
              label: '存为初稿',
              icon: 'baocun',
              power: 'editContentAble',
              disabled: !this._checkPermission('/admin/contentext', 'PUT')
            },
            {
              name: '3',
              label: '存为草稿',
              power: 'editContentAble',
              icon: 'cunweicaogao',
              disabled: !this._checkPermission('/admin/contentext', 'PUT')
            }
          ]
        },
        {
          key: 'link',
          showHandle: true,
          options: [
            {
              name: '2',
              label: '发布',
              power: 'publishContentAble',
              icon: 'fabu',
              disabled: !this._checkPermission('/admin/contentext', 'PUT')
            },
            {
              name: '12',
              label: '提交审核',
              power: 'editContentAble',
              icon: 'shenhe',
              disabled: !this._checkPermission('/admin/contentext', 'PUT')
            }
          ]
        }
      ]
    }
  },
  methods: {
    moment,
    fetchContentDetail () {
      const that = this
      this.loading = true
      this.$request.fetchContentPlus(this.contentId).then(res => {
        if (res.code === 200) {
          this.detail = {
            renderingField: res.data.enableJson
          }
          let dataField = {
            modelId: this.contentId,
            modelName: this.$route.query.modelName || '',
            channelId: this.channelId
          }
          const { formListBase, formListExtend } = res.data.enableJson || {}
          if (formListBase instanceof Array && formListBase.length) {
            this.detail.formListBase = this.detailResetData(formListBase)
          }
          if (formListExtend instanceof Array && formListExtend.length) {
            this.detail.formListExtend = this.detailResetData(formListExtend)
          } else {
            this.detail.formListExtend = []
          }
          ['formListBase', 'formListExtend'].forEach(field => {
            const keys = this.detail[field]
            Object.values(keys).forEach(item => {
              if (item instanceof Array && item.length) {
                // 循环第一层
                item.forEach(d => {
                  // 循环
                  if (d[0].value.type === 'datetime' && d[0].value.isDefaultNow) {
                    dataField[d[0].value.name] = that.moment().format('YYYY-MM-DD HH:mm:ss')
                  } else {
                    dataField[d[0].value.name] = d[0].value.defaultValue
                  }
                })
              } else {
                if (item.list) {
                  // 判断如果有list，则循环list
                  item.list.forEach(d => {
                    // 循环
                    if (d.value.type === 'datetime' && d.value.isDefaultNow) {
                      dataField[d.value.name] = that.moment().format('YYYY-MM-DD HH:mm:ss')
                    } else {
                      dataField[d.value.name] = d.value.defaultValue
                    }
                  })
                } else {
                  if (item.value.type === 'datetime' && item.value.isDefaultNow) {
                    dataField[item.value.name] = that.moment().format('YYYY-MM-DD HH:mm:ss')
                  } else {
                    dataField[item.value.name] = item.value.defaultValue
                  }
                }
              }
            })
          })
          this.detail.dataField = dataField
          this.setForm()
          this.setDefaultContentTab()
        }
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    handleSubmit (e, btn) {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.loading = true
          this.$request.fetchContentCreate(this.getFormData).then(res => {
            if (res.code === 200) {
              if (res.data === 10) {
                let _this = this
                this.examineObj = {
                  title: '',
                  icon: '',
                  text: '智能审核中，请稍后...',
                  visible: true,
                  showClose: false
                }
                setTimeout(function () {
                  _this.examineObj.visible = false
                  _this.removeTab(_this.$route.fullPath)
                  _this.$routerLink('/content/index', 'audit')
                }, 2000)
              } else {
                this._messageSuccess('create')
                this.removeTab(this.$route.fullPath)
                this.$routerLink('/content/index', 'list')
              }
            }
            this.loading = false
          }).catch(() => {
            this.loading = false
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    detailResetData (list) {
      let data = deepClone(list)
      let excludeList = ['content', ...this.excludeList]
      // 去除多余数组
      let RowList = data.map((d) => {
        // 判断是否有多数组
        if (d.length > 1) {
          let list = [d[0], d[1]]
          return list
        } else if (excludeList.indexOf(d[0][0].type) !== -1) {
          let obj = {
            type: d[0][0].type,
            index: d[0][0].index,
            name: d[0][0].name,
            list: d[0]
          }
          return obj
        } else {
          return d[0][0]
        }
      })
      return RowList
    },
    setHeaderBths (status) {
      let arr = []
      if (status) {
        // 工作流
        arr = ['12', '1', '3']
      } else {
        // 非工作流
        arr = ['1', '2', '3']
      }
      if (this.contentTree.data[0].children[0] && !this.contentTree.data[0].children[0].publishContentAble) {
        this.bttons.find(d => d.name === '2').disabled = true
      } else {
        this.bttons.find(d => d.name === '2').disabled = false
      }
      this.headers = arr.map(v => {
        return this.bttons.find(d => d.name === v)
      })
      this.filterDisBtn(this.headers, -1)
    }
  },
  watch: {
    'form.channelId': function (newData) {
      if ('viewControl' in this.form || 'allowComment' in this.form) {
        if (newData) {
          this.$request.fetchChannelDefaults(newData).then(res => {
            if (res.code === 200) {
              if ('viewControl' in this.form) {
                this.form.viewControl = res.data.viewControl
              }
              if ('allowComment' in this.form) {
                this.form.allowComment = res.data.allowComment
              }
            }
          })
        }
      }
    },
    sourceObj (val) {
      this.detail.dataField.contentSourceId = val
      this.setForm()
    }
  }
}
</script>
