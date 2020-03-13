<template>
  <section class="service-index">
    <iframe :src="url" width="100%" height="100%">
        <!-- IE：你们都看我干吗，我现在也是支持的 -->
    </iframe>
  </section>
</template>
<script>
export default {
  name: 'serviceIndex',
  data () {
    return {
      name: '服务市场'
    }
  },
  computed: {
    url () {
      console.log(window.location)
      let host = window.location.host
      let src = 'http://order.yun.jeecms.com/#/service/index?token=' + localStorage.getItem('JEECMS-Auth-Token') + '&url=' + host
      // let src = 'http://localhost:8081/#/service/index?token=' + localStorage.getItem('JEECMS-Auth-Token')+'&url=x1test.jeecms.com'
      return src
    }
  }
}
</script>
<style>
.service-index {
  width:100%;
  height:100%;
}
</style>
