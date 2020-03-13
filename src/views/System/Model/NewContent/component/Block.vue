<template>
  <div class="content-block-box">
    <div class="content-block-left">
      <model-left></model-left>
    </div>
    <div class="content-block-right"></div>
  </div>
</template>

<script>
import modelLeft from './ModelLfet'
export default {
  name: 'modelDetailBlock',
  data () {
    return {

    }
  },
  components: {
    modelLeft
  }
}
</script>

<style scoped lang="scss">
.content-block-box{
  width: 1200px;
  margin: 0 auto;
  display: flex;
  .content-block-left{
    width: 775px;
    margin-right: 20px;
  }
  .content-block-right{
    width: 372px;
    background-color: #fff;
  }
}
</style>
