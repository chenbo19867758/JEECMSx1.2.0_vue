<template>
  <section class="d-file-upload-preview z-draggable-preview">
    <!--<el-form-item-->
      <!--:label="option.label"-->
      <!--:prop="option.name"-->
      <!--:rules="getRules"-->
      <!--:required="option.isRequired"-->
    <!--&gt;-->
    <el-form-item
      :prop="option.name"
      :rules="getRules"
    >
    <div class="upload-item">
      <!--<p class="form-label"><span class="t-red" v-if="option.isRequired">*</span>{{option.label}}:</p>-->
      <jee-file-resource-upload
        v-bind="option"
        v-model="val"
        :isDescShow="false"
        :uploadOption="option"
        :isBtn="true"
      ></jee-file-resource-upload>
    </div>

    </el-form-item>
  </section>
</template>

<script>
import previewMixin from '@/components/draggable/Mixin/previewMixin'
export default {
  name: 'DFileUploadPreview',
  mixins: [previewMixin],
  computed: {
    getRules () {
      const { isRequired } = this.option
      let formItemRules = []
      if (isRequired) {
        formItemRules.push(this.$rules.requiredArray())
      }
      return formItemRules
    }
  }
}
</script>

<style lang="scss">
.d-file-upload-preview.z-draggable-preview{
  >.el-form-item{
    padding-top: 2px;
  }
  .upload-item{
    display: flex;
  }
  .form-label{
    padding: 0 10px;
    display: inline;
    white-space:normal;
    word-break:break-all;
  }
}
</style>
