<template>
  <section class="inMail-index-inbox-container">
    <search-header
      class="search-header"
      v-bind="searchHeader"
      :params="list.params"
       @handleSearch="handleSearchs"
    ></search-header>
    <base-header
      v-bind="headers"
      v-on:handleCreate="handleHeaderCreate"
      v-on:handleDelete="handleHeaderDelete"
    />
   <base-table
      v-bind="list"
      v-on:handleSelectionChange="handleSelectionChange"
      v-on:handleSizeChange="handleSizeChange"
      v-on:handleCurrentChange="handleCurrentChange"
      v-on:handleDelete="handleTableDelete"
      v-on:handleSign="handleTableSign"
    >
      <template #title="scope">
        <div class="jee-color" @click="rowHref(scope.scope.row)"><jee-icon :iconClass="scope.scope.row.status===0?'zhanneixinweidu':'zhanneixinyidu'" style="margin-right:5px;"/>{{scope.scope.row.title}}</div>
      </template>
    </base-table>
    <form-dialog
      title="查看"
      ref="lookDialog"
      :showCancel='false'
      :buttons="lookButtons"
    >
    <div class="dialog-box">
      <div class="dialog-header">
        <div class='title'>{{message.title}}</div>
        <p><span class="label">发件人</span>：<span>{{message.sendUserName}}</span></p>
        <p><span class="label">收件时间</span>：<span>{{message.createTime}}</span></p>
      </div>
      <div class="dialog-content">
        <p>
          {{message.content}}
        </p>
      </div>
    </div>
    </form-dialog>
  </section>
</template>

<script>
import searchHeader from '@/components/mixins/searchHeader'
import baseTable from '@/components/mixins/baseTable'
import baseHeader from '@/components/mixins/baseHeader'
import formDialog from '@/components/mixins/formDialog'
export default {
  name: 'inMailIndex',
  mixins: [searchHeader, baseTable, baseHeader, formDialog],
  data () {
    return {
      list: {
        showIndex: false,
        rowKey: 'messageId',
        columns: [
          {
            prop: 'title',
            label: '标题',
            scopeType: 'slot',
            minWidth: '175px',
            showOverflowTooltip: true
          },
          {

            prop: 'content',
            label: '内容',
            minWidth: '175px',
            showOverflowTooltip: true
          },
          {
            prop: 'sendUserName',
            label: '发件人',
            minWidth: '175px'
          },
          {
            scopeType: 'time',
            prop: 'createTimes',
            label: '收件时间',
            minWidth: '175px'
          }
        ],
        api: 'fetchMessageInbox',
        params: {
          status: '',
          type: 1,
          sendUserName: '',
          content: '',
          title: '',
          startTime: '',
          endTime: ''
        },
        handleColumnProp: {
          label: '操作',
          width: '180'
        },
        handleColumn: [
          {
            type: 'Sign',
            name: '标记为已读',
            icon: 'htmal5icon09',
            disabled: !this._checkPermission('/admin/systemmessage', 'PUT')
          },
          {
            type: 'Delete',
            name: '删除',
            icon: 'delete',
            disabled: !this._checkPermission('/admin/systemmessage', 'DELETE')
          }
        ]
      },
      searchHeader: {
        searchItems: [
          {
            type: 'select',
            value: 'status',
            placeholder: '请选择信件状态',
            label: '信件状态：',
            style: {
              width: '150px'
            },
            options: [
              {
                label: '所有',
                value: ''
              },
              {
                label: '已读',
                value: true
              },
              {
                label: '未读',
                value: false
              }
            ]
          },
          {
            type: 'timePicker',
            value: 'time',
            startText: '收件开始时间',
            endText: '收件结束时间'
          },
          {
            type: 'select',
            value: 'type',
            options: [
              {
                label: '发件人',
                value: 1
              },
              {
                label: '标题',
                value: 2
              },
              {
                label: '内容',
                value: 3
              }
            ]
          },
          {
            type: 'searchInput',
            value: 'text',
            placeholder: '请输入相关信息'
          }
        ]
      },
      headers: {
        buttons: [
          {
            type: 'Create',
            text: '标记为已读',
            icon: 'htmal5icon09',
            disabled: !this._checkPermission('/admin/systemmessage', 'PUT')
          },
          {
            type: 'Delete',
            text: '删除',
            icon: 'delete',
            disabled: !this._checkPermission('/admin/systemmessage', 'DELETE')
          }
        ],
        showAlertIcon: false,
        content: '操作说明'
      },
      lookButtons: [
        {
          text: '关闭',
          type: 'close'
        }
      ],
      message: {

      }
    }
  },
  methods: {
    handleSearchs () {
      let params = this.list.params
      if (params.time) {
        params.startTime = params.time[0]
        params.endTime = params.time[1]
      } else {
        params.startTime = ''
        params.endTime = ''
      }
      if (params.text) {
        if (params.type === 1) {
          params.sendUserName = params.text
          params.title = ''
          params.content = ''
        } else if (params.type === 2) {
          params.title = params.text
          params.sendUserName = ''
          params.content = ''
        } else if (params.type === 3) {
          params.content = params.text
          params.sendUserName = ''
          params.title = ''
        }
      } else {
        params.sendUserName = ''
        params.title = ''
        params.content = ''
      }
      this.list.params = params
      this.fetchTableApi()
    },
    handleHeaderCreate () {
      if (this.list.selectedKeys.length) {
        this.$confirm('确定批量标记阅读？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.fetchSystemmessagePut(this.list.selectedKeys)
        })
      } else {
        this.$message('至少选择一项进行操作')
      }
    },
    handleHeaderDelete () {
      if (this.list.selectedKeys.length) {
        this.$confirm('确定批量删除消息？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.fetchSystemmessageDelete(this.list.selectedKeys)
        })
      } else {
        this.$message('至少选择一项进行操作')
      }
    },
    rowHref (row) {
      let messageId = row.messageId
      this.$request.fetchSystemmessage({ messageId }).then(res => {
        if (res.code === 200) {
          this.message = res.data
          this.$refs.lookDialog.showDialog()
          let ids = []
          ids.push(row.messageId)
          this.$request.fetchSystemmessagePut({ ids }).then(res => {})
          this.fetchTableApi()
        }
      })
    },
    handleTableSign (data) {
      let ids = []
      ids.push(data.messageId)
      this.$confirm('是否确定标记已读？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.fetchSystemmessagePut(ids)
      })
    },
    handleTableDelete (data) {
      let ids = []
      ids.push(data.messageId)
      this.$confirm('是否确定删除？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.fetchSystemmessageDelete(ids)
      })
    },
    fetchTableCallBack (res) {
      if (res.code === 200) {
        this.list.data = res.data.content
        this.list.totalCount = res.data.totalElements
      }
    },
    // 标记已阅读
    fetchSystemmessagePut (ids) {
      this.list.loading = true
      this.$request.fetchSystemmessagePut({ ids }).then(res => {
        if (res.code === 200) {
          this.fetchTableApi()
        }
      }).then(this.hideTableLoading).catch(this.hideTableLoading)
    },
    // 删除
    fetchSystemmessageDelete (ids) {
      this.list.loading = true
      this.$request.fetchSystemmessageDelete({ ids }).then(res => {
        if (res.code === 200) {
          this.fetchTableApi()
        }
      }).then(this.hideTableLoading).catch(this.hideTableLoading)
    }
  },
  created () {

  }
}
</script>

<style lang="scss">
.inMail-index-inbox-container{
  .search-item-wrap:nth-child(3){
    width: 100px;
  }
  .jee-color{
    cursor: pointer;
  }
  .dialog-box{
    border:1px solid rgba(237,237,237,1);
    border-radius:0px 0px 4px 4px;
    .dialog-header{
      padding: 20px;
      border-bottom: 1px solid rgba(237,237,237,1);
      background:rgba(250,250,250,1);
      .title{
        color: #333333;
        font-size: 16px;
        font-weight: 600;
      }
      .label{
        color: #999999;
        width: 70px;
        font-size: 14px;
        display: inline-block;
        margin-top: 10px;
        text-align-last: justify;
      }
      span{
        color: #333333;
        font-size: 14px;
        font-weight: 500;
      }
    }
    .dialog-content{
      overflow: scroll;
      max-height: 355px;
      p{
        text-indent:28px;
        font-size: 14px;
        color: #333333;
        padding: 20px;
      }
    }
  }
  .base-header-container{
    margin-top: 10px;
  }
}
</style>
