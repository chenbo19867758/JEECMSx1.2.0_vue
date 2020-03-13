<template>
<!-- heyan -->
  <section class="config-message-index">
    <!-- <base-header
      v-if="$env === 'dev'"
      v-bind="headers"
      /> -->
    <el-tabs v-model="activeTab">
      <template v-for="(item, index) in tabs">
        <el-tab-pane :label="item.label" :name="item.name" :key="index">
          <component :is="'Membership'" :name="item.name" :key="item.name"></component>
        </el-tab-pane>
      </template>
    </el-tabs>
  </section>
</template>

<script>
import Membership from './Membership'
import baseHeader from '@/components/mixins/baseHeader'
export default {
  name: 'configInformationIndex',
  components: {
    Membership
  },
  mixins: [baseHeader],
  data () {
    return {
      headers: {
        title: '操作说明',
        showAlertIcon: true,
        content: '操作说明'
      },
      activeTab: '1',
      tabs: [
        {
          name: '1',
          label: '会员验证',
          component: 'Membership'
        },
        {
          name: '2',
          label: '用户消息',
          component: 'Membership'
        }
      ]
    }
  }
}
</script>
