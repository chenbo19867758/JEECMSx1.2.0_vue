<template>
  <section class="d-image-upload-preview z-draggable-preview">
    <!--<el-form-item-->
      <!--:label="option.label"-->
      <!--:prop="option.name"-->
      <!--:rules="getRules"-->
    <!--&gt;-->
      <el-form-item
      :prop="option.name"
      :rules="getRules"
    >
      <jee-image-resource-upload
        v-bind="option"
        :uploadOption="option"
        :defaultUrl="defaultUrl"
        :ImageDescShow="false"
        :isBan="isBan"
        v-model="val"
      ></jee-image-resource-upload>
        <p class="form-label"><span class="t-red" v-if="option.isRequired">*</span>{{option.label}}</p>
    </el-form-item>
  </section>
</template>

<script>
import previewMixin from '@/components/draggable/Mixin/previewMixin'
export default {
  name: 'DImageUploadPreview',
  mixins: [previewMixin],
  data () {
    return {
      defaultUrl: '',
      isBan: false
    }
  },
  watch: {
    value: {
      handler (newData) {
        if (typeof newData === 'object' && newData.url) {
          this.defaultUrl = newData.url
          this.replaceImg(this.defaultUrl)
        } else {
          this.replaceImg(this.value)
        }
      },
      deep: true
    }
  },
  mounted () {
    if (typeof this.value === 'object' && this.value.url) {
      this.defaultUrl = this.value.url
      this.replaceImg(this.defaultUrl)
    } else {
      this.replaceImg(this.value)
    }
  },
  methods: {
    replaceImg (img) {
      // 图片类违禁词
      if (this.form.banJson && this.form.banJson[this.option.name] && this.form.banJson[this.option.name].img) {
        this.form.banJson[this.option.name].img.forEach(d => {
          if (d.indexOf(img) !== -1) {
            this.isBan = true
          }
        })
      }
    }
  }
}
</script>
<style lang="scss">
.d-image-upload-preview.z-draggable-preview{
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
