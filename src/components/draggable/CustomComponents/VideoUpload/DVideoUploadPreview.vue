<template>
  <section class="d-video-upload-preview z-draggable-preview">
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
        :isDescShow="false"
        :uploadOption="option"
      ></jee-video-resource-upload>
      <p class="form-label"><span class="t-red" v-if="option.isRequired">*</span>{{option.label}}</p>
    </el-form-item>
  </section>
</template>

<script>
import previewMixin from '@/components/draggable/Mixin/previewMixin'
export default {
  name: 'DVideoUploadPreview',
  mixins: [previewMixin]
}
</script>

<style lang="scss">
.d-video-upload-preview.z-draggable-preview{
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
