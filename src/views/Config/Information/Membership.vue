<template>
  <section class="config-message-index-container">
    <base-header
      v-if="$env === 'dev'"
      v-bind="headers"
      @handleLink="handleHeaderLink"
      />
    <base-table
      v-bind="list"
      :columns="columns"
      @handleSelectionChange="handleSelectionChange"
      @handleSizeChange="handleSizeChange"
      @handleCurrentChange="handleCurrentChange"
    >
    </base-table>
  </section>
</template>

<script>
import baseHeader from '@/components/mixins/baseHeader'
import baseTable from '@/components/mixins/baseTable'

export default {
  name: 'membership',
  mixins: [baseHeader, baseTable],
  props: {
    name: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      headers: {
        buttons: [
          {
            type: 'Link',
            text: '新建',
            icon: 'xinjian',
            href: '/config/information/detail',
            params: {
              type: 'add',
              status: 'member'
            },
            disabled: !this._checkPermission('/admin/messageTpl', 'POST')
          }
        ],
        title: '',
        showAlertIcon: false,
        content: '操作说明'
      },
      list: {
        api: 'fetchMessageTplPage',
        params: {
          tplType: 1
        }
      }
    }
  },
  computed: {
    columns () {
      return [
        {
          prop: 'id',
          label: '序号',
          width: '65px'
        },
        {
          prop: 'mesTitle',
          label: '模板名称',
          scopeType: 'link',
          href: '/config/information/detail',
          showOverflowTooltip: true,
          params: {
            status: this.name === '1' ? 'member' : 'user'
          }
          // width: '325px'
        },

        {
          prop: 'mesCode',
          label: '模板标识'
        },
        {
          prop: 'remark',
          label: '模板描述',
          showOverflowTooltip: true
        }
      ]
    }
  },
  methods: {
    fetchTableCallBack (res) {
      if (res.code === 200) {
        this.list.data = res.data.content
        this.list.totalCount = res.data.totalElements
      }
    },
    getParams (type) {
      this.headers.buttons[0].params.status = type === '1' ? 'member' : 'user'
      this.list.params.tplType = parseInt(type)
    }
  },
  beforeMount () {
    this.getParams(this.name)
  },
  activated () {
    if (this.$route.query.type === 'list') {
      this.fetchTableApi()
      this.$router.push({ query: { type: '' } })
    }
  }
}
</script>

<style lang="scss" scoped></style>
