<template>
  <section class="d-audio-upload-preview z-draggable-preview">
    <!--<el-form-item-->
      <!--:label="option.label"-->
      <!--:prop="option.name"-->
      <!--:rules="getRules"-->
    <!--&gt;-->
    <el-form-item
      :prop="option.name"
      :rules="getRules"
    >
      <jee-video-resource-upload
        v-bind="option"
        v-model="val"
        iconClass='yinpin'
        compType="audio"
        :isDescShow="false"
        :uploadOption="uploadOption"
      ></jee-video-resource-upload>
      <p class="form-label"><span class="t-red" v-if="option.isRequired">*</span>{{option.label}}</p>
    </el-form-item>
  </section>
</template>

<script>
import previewMixin from '@/components/draggable/Mixin/previewMixin'
export default {
  name: 'DAudioUploadPreview',
  mixins: [previewMixin],
  computed: {
    uploadOption () {
      return {
        ...this.option,
        iconClass: 'yinpin',
        compType: 'audio'
      }
    }
  }
}
</script>

<style lang="scss">
.d-audio-upload-preview.z-draggable-preview{
  >.el-form-item{
    padding-top: 2px;
  }
  .form-label{
    padding: 0 10px;
    white-space:normal;
    word-break:break-all;
  }
}
</style>
