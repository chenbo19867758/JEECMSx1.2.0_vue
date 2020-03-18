<template>
  <div id="app" class="app-container">
    <!--这里的 <router-view> 是最顶层的出口，router-view 没有设置名字，那么默认为 default-->
    <router-view />
  </div>
</template>
<script>
import {
  mapActions
} from 'vuex'

export default {
  name: 'APP',
  methods: {
    ...mapActions('app', ['changeTheme', 'changeLang'])
  },
  created () {
    const theme = window.localStorage.getItem('theme') || 'custom-grayBlue'
    this.changeTheme(theme)
    const lang = window.localStorage.getItem('lang') || 'cn'
    this.changeLang(lang)
    this.$i18n.locale = lang
  }
}
</script>

<style lang="scss">
.app-container{
  height: 100vh!important;
}
</style>
