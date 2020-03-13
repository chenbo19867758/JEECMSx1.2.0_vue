<template>
  <section class="d-document-preview z-draggable-preview">
    <el-form-item
      :prop="option.name"
      :rules="getRules"
      :required="option.isRequired"
    >
      <div v-if="isShowPdf&&showPdf">
        <iframe :src="pdfUrl" id="iframepage"
          width="100%" height="700px" frameborder="0" scrolling="yes"></iframe>
      </div>
      <jee-file-upload
        v-else
        v-bind="option"
        v-model="val"
        type="2"
        :isDescShow="false"
        :enableType="enableType"
        :isSecret='false'
      ></jee-file-upload>
    </el-form-item>
  </section>
</template>

<script>
import previewMixin from '@/components/draggable/Mixin/previewMixin'

export default {
  name: 'DDocumentPreview',
  mixins: [previewMixin],
  props: {
    isShowPdf: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      pdfUrl: '',
      showPdf: false
    }
  },
  computed: {
    activeContent () {
      return this.option.label
    },
    enableType () {
      return this.option.type instanceof Array ? this.option.type.join(',') : ''
    },
    getRules () {
      const { isRequired } = this.option
      let formItemRules = []
      if (isRequired) {
        formItemRules.push(this.$rules.requiredArray())
      }
      return formItemRules
    }
  },
  watch: {
    val (newVal, oldVal) {
      if (newVal.length) {
        this.showPdf = true
        this.contentConversionDoc(newVal[0].resId)
      } else {
        this.showPdf = false
      }
    }
  },
  methods: {
    contentConversionDoc (id) {
      this.$request.fetchContentConversionDoc({ id: id }).then(res => {
        if (res.code === 200) {
          this.pdfUrl = res.data
        }
      })
    }
  }
}
</script>
