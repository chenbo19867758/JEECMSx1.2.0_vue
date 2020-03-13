<template>
  <section class="security-user-detail-container">
    <base-header v-bind="headers"
      v-on:handleDelete="handleHeaderDelete"
    />
    <base-form
      v-bind="form"
      :rules="rules"
      v-on:handleConfirm="handleConfirm"
    ></base-form>
  </section>
</template>
<script>
import baseHeader from '@/components/mixins/baseHeader'
import baseForm from '@/components/mixins/baseForm'
import { mapActions } from 'vuex'

export default {
  name: 'securityAccessoryDetail',
  mixins: [baseHeader, baseForm],
  data () {
    return {
      headers: {
        buttons: [
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
        // content: 'system.security.handleDesc3'
      },
      form: {
        api: 'fetchSysSecretDetail',
        params: {
          id: ''
        },
        form: {
          id: '',
          name: ''
        },
        formItems: [
          {
            prop: 'name',
            label: 'system.security.name',
            placeholder: 'system.security.namePlaceholder',
            maxlength: 50
          }
        ],
        submitBtns: [{
          text: '保存',
          subType: 'submit',
          disabled: !this._checkPermission('/admin/secrets', 'PUT')
        }]
      }
    }
  },
  computed: {
    rules () {
      return {
        name: [
          this.$rules.required(),
          {
            validator: (rule, value, callback) => {
              if (value) {
                var params = {
                  name: value,
                  secretType: 2,
                  id: this.form.params.id
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
  inject: ['removeTab'],
  methods: {
    ...mapActions('system', ['ReflushSecurityAccessory', 'FetchAccessorySecurityOptions']),
    // 顶部操作按钮
    handleHeaderDelete () {
      this._confirmDelete().then(() => {
        this.fetchSysSecretDelete([this.form.form.id])
      })
    },
    handleConfirm (data) {
      this.form.loading = true
      this.$request.fetchSysSecretUpdate(data).then(res => {
        this.hideFormLoading()
        if (res.code === 200) {
          this._messageSuccess('save')
          this.ReflushSecurityAccessory(true)
          this.FetchAccessorySecurityOptions(true)
          this.removeTab(this.$route.fullPath)
          this.$router.replace({ name: 'securityAccessoryIndex' })
        }
      }).catch(this.hideFormLoading)
    },
    // 发送请求事件
    fetchSysSecretDelete (ids) {
      this.$request.fetchSysSecretDelete(ids).then(res => {
        if (res.code === 200) {
          this._messageSuccess('delete')
          this.ReflushSecurityAccessory(true)
          this.FetchAccessorySecurityOptions(true)
          this.removeTab(this.$route.fullPath)
          this.$router.replace({ name: 'securityAccessoryIndex' })
        }
      })
    },
    fetchFormCallBack (res) {
      if (res.code === 200) {
        this.form.form = res.data
      }
    }
  },
  mounted () {
    const { id } = this.$route.query
    this.form.params.id = id
    this.fetchFormApi()
  },
  activated () {
    const { id } = this.$route.query
    if (id && id !== this.form.params.id) {
      this.form.params.id = id
      this.fetchFormApi()
    }
  }
}
</script>
<style lang="scss" scoped>

</style>
