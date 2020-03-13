<template>
  <div class="system-setting-container">
    <base-header
      v-bind="headers"
    />
    <base-form
      v-bind="form"
      v-on:handleConfirm="handleConfirm"
    ></base-form>
  </div>
</template>

<script>
import baseHeader from '@/components/mixins/baseHeader'
import baseForm from '@/components/mixins/baseForm'
import {
  mapActions
} from 'vuex'
export default {
  name: 'sms',
  mixins: [baseHeader, baseForm],
  data () {
    return {
      headers: {
        title: '操作说明',
        showAlertIcon: true,
        content: '选择统一使用后，需要填写统一的配置信息，在站点配置的短信服务那里只能查看此配置信息不可再编辑；选择否，不需要填写配置信息，在站点配置的短信服务那里需要用户去填写自身的配置；'
      },
      form: {
        api: 'fetchSmsDetail',
        labelWidth: '236px',
        form: {
          id: '',
          accessKey: '',
          accesskeySecret: '',
          isEnable: true,
          isGloable: true,
          serviceProvider: '',
          smsSign: ''
        },
        formItems: [
          {
            prop: 'isEnable',
            label: '是否开启短信服务：',
            type: 'radio',
            options: this.$enums.boolYes
          },
          {
            prop: 'isGloable',
            label: '是否全站群统一使用：',
            type: 'radio',
            options: this.$enums.boolYes,
            hiddenKey: 'isEnable',
            hiddenValue: true
          },
          {
            prop: 'serviceProvider',
            label: '服务商：',
            type: 'radio',
            options: [
              {
                value: 1,
                label: '阿里云'
              },
              {
                value: 2,
                label: '腾讯云'
              }
            ],
            hiddenFunc: (item) => item.isEnable && item.isGloable
          },
          {
            prop: 'accessKey',
            label: 'AccessKeyID/AppID：',
            type: 'textarea',
            height: '100px',
            placeholder: '请输入AccessKeyID/AppID',
            hiddenFunc: (item) => item.isEnable && item.isGloable,
            href: 'https://cloud.tencent.com/product/sms',
            hrefText: '点击获取AccessKey和AccessKeySecret'
          },
          {
            prop: 'accesskeySecret',
            label: 'AccessKeySecret/AppKey：',
            type: 'textarea',
            height: '100px',
            placeholder: '请输入AccessKeySecret/AppKey',
            hiddenFunc: (item) => item.isEnable && item.isGloable,
            maxlength: 1500
          },
          {
            prop: 'smsSign',
            label: '短信签名：',
            placeholder: '请输入短信签名',
            hiddenFunc: (item) => item.isEnable && item.isGloable,
            maxlength: 1500
          }
        ],
        rules: {
          isEnable: [
            this.$rules.required()
          ],
          isGloable: [
            this.$rules.required()
          ],
          accessKey: [
            this.$rules.required(),
            this.$rules.max(255)
          ],
          accesskeySecret: [
            this.$rules.required(),
            this.$rules.max(1500)
          ],
          serviceProvider: [
            this.$rules.required()
          ],
          smsSign: [
            this.$rules.required(),
            this.$rules.max(1500)
          ]
        },
        submitBtns: [{
          text: '保存',
          subType: 'submit',
          disabled: !this._checkPermission('/admin/sms', 'POST')
        }]
      },
      activeTabName: 'qqForm'
    }
  },
  methods: {
    ...mapActions('system', ['FetchSmsDetail']),
    handleConfirm (data) {
      this.$request.fetchSmsUpdate(data).then(res => {
        if (res.code === 200) {
          this.$message({
            message: '保存成功',
            type: 'success'
          })
          this.FetchSmsDetail()
        }
      }).catch()
    }
  },
  created () {
    this.$request.fetchSmsDetail().then(res => {
      if (res.code === 200) {
        this.form.form = res.data
      }
    })
  },
  watch: {
    form: {
      handler (val, oldVal) {
        if (val.form.serviceProvider === 1) {
          this.form.formItems[2].href = 'https://www.aliyun.com/product/sms'
        } else if (val.form.serviceProvider === 2) {
          this.form.formItems[2].href = 'https://cloud.tencent.com/product/sms'
        }
      },
      deep: true
    }
  }
}
</script>

<style lang="scss" scoped>
.system-setting-container{
  font-size: 16px;
  header{
    padding-bottom: 20px;
    span{
      padding-right: 10px;
    }
  }
  .el-alert{
    margin-bottom: 20px;
  }
}

</style>
