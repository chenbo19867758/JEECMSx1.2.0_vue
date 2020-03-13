<template>
  <section class="security-content-index-container">
    <base-header v-bind="headers"
      v-on:handleCreate="handleHeaderCreate"
      v-on:handleDelete="handleHeaderDelete"
    />
    <base-table
      v-bind="list"
      v-on:handleSelectionChange="handleSelectionChange"
      v-on:handleSizeChange="handleSizeChange"
      v-on:handleCurrentChange="handleCurrentChange"
      v-on:handleDelete="handleTableDelete"
    ></base-table>
    <form-dialog
      ref="addDialog"
      :loading="addFormLoading"
      :form="addForm"
      :rules="addRules"
      :formItems="addFormItems"
      v-on:handleConfirm="handleConfirmAdd"
    ></form-dialog>
  </section>
</template>

<script>
import baseHeader from '@/components/mixins/baseHeader'
import baseTable from '@/components/mixins/baseTable'
import formDialog from '@/components/mixins/formDialog'
import { mapState, mapActions } from 'vuex'

const columns = [
  {
    prop: 'name',
    label: 'system.security.name',
    scopeType: 'link',
    href: '/system/security/content/detail'
  }
]

export default {
  name: 'securityContentIndex',
  mixins: [baseHeader, baseTable, formDialog],
  data () {
    return {
      list: {
        columns,
        api: 'fetchSysSecretList',
        params: {
          secretType: 1
        },
        handleColumn: [
          {
            type: 'Delete',
            name: 'global.delete',
            icon: 'delete',
            disabled: !this._checkPermission('/admin/secrets', 'DELETE')
          }
        ],
        handleColumnProp: {
          label: 'global.handle',
          align: 'left'
        }
      },
      headers: {
        buttons: [
          {
            type: 'Create',
            text: 'global.create',
            icon: 'xinjian',
            disabled: !this._checkPermission('/admin/secrets', 'POST')
          },
          {
            type: 'Delete',
            text: 'global.delete',
            icon: 'delete',
            disabled: !this._checkPermission('/admin/secrets', 'DELETE')
          }
        ],
        title: '',
        showAlertIcon: false,
        paddingBottom: '10px'
        // content: 'system.security.handleDesc2'
      },
      addFormLoading: false,
      addForm: {
        name: ''
      },
      addFormItems: [
        {
          prop: 'name',
          label: 'system.security.name',
          placeholder: 'system.security.namePlaceholder',
          maxlength: 50
        }
      ]
    }
  },
  computed: {
    ...mapState('system', ['reflushSecurityContent']),
    addRules () {
      return {
        name: [
          this.$rules.required(),
          {
            validator: (rule, value, callback) => {
              if (value) {
                var params = {
                  name: value,
                  secretType: 1
                }
                this.$request.fetchSysSecretCheck(params).then(res => {
                  if (res.code === 200 && res.data) {
                    callback()
                  } else {
                    callback(new Error('密级名称不能重复'))
                  }
                })
              }
            },
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    ...mapActions('system', ['ReflushSecurityContent', 'FetchContentSecurityOptions']),
    // 表格操作按钮
    handleTableDelete (row, index) {
      this._confirmDelete().then(() => {
        this.fetchSysSecretDelete([row.id])
      })
    },
    // 顶部操作按钮
    handleHeaderCreate () {
      this.$refs.addDialog.showDialog()
    },
    handleHeaderDelete () {
      if (this.list.selectedKeys.length) {
        this._confirmDelete().then(() => {
          this.fetchSysSecretDelete(this.list.selectedKeys)
        })
      } else {
        this._messageOne()
      }
    },
    handleConfirmAdd (data, btn) {
      this.addFormLoading = true
      data.secretType = this.list.params.secretType
      this.$request.fetchSysSecretCreate(data).then(res => {
        if (res.code === 200) {
          this.fetchTableApi()
          this.FetchContentSecurityOptions(true)
        }
        this.addFormLoading = false
      }).catch(() => {
        this.addFormLoading = false
      })
    },
    // 发送请求事件
    fetchSysSecretDelete (ids) {
      this.list.loading = true
      this.$request.fetchSysSecretDelete(ids).then(res => {
        if (res.code === 200) {
          this.fetchTableApi()
          this.FetchContentSecurityOptions(true)
        }
      }).then(this.hideTableLoading)
        .catch(this.hideTableLoading)
    },
    fetchTableCallBack (res) {
      if (res.code === 200) {
        this.list.data = res.data.content
        this.list.totalCount = res.data.totalElements
      }
    }
  },
  activated () {
    if (this.reflushSecurityContent) {
      this.fetchTableApi()
      this.ReflushSecurityContent(false)
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
