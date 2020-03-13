<template>
  <dialog-form
    ref="form"
    class="resource-upload-container"
    :showSubmitButton="false"
    :form="form"
    :showFoot="false"
    :formItems="formItems"
    :labelWidth="labelWidth"
  >
    <template #spaceId="scope">
      <div class="resource-item">
        <resource-tree v-bind="tree" v-model="scope.form.spaceId"/>
      </div>
    </template>
  </dialog-form>
</template>
<script>
import dialogForm from '@/components/mixins/dialogForm'
import ResourceTree from './ResourceTree'
export default {
  name: 'ResourceUpload',
  mixins: [dialogForm],
  components: {
    ResourceTree
  },
  props: ['resourceType', 'uploadOption'],
  data () {
    return {
      labelWidth: '260px',
      form: {
        uploadFile: this.resourceType === 'insertimage' || this.resourceType === 'attachment' ? [] : '',
        mark: false,
        addToRes: false,
        spaceId: ''
      },
      tree: {
        loading: false,
        data: [],
        defaultProps: {
          children: 'children',
          label: 'label'
        }
      }
    }
  },
  computed: {
    formItems () {
      switch (this.resourceType) {
        case 'insertimage':
          return [
            {
              prop: 'uploadFile',
              label: '选择文件',
              type: 'multiImageUpload',
              option: {
                autoUpload: false,
                isImageDesc: false,
                defaultFileName: '',
                type: ['jpg', 'jpeg', 'gif', 'png', 'bmp'],
                ...this.uploadOption
              }
            },
            {
              prop: 'mark',
              label: '是否添加水印',
              type: 'radio',
              options: this.$enums.boolYes
            },
            {
              prop: 'addToRes',
              label: '是否添加到资源库',
              type: 'radio',
              options: this.$enums.boolYes
            },
            {
              prop: 'spaceId',
              type: 'slot',
              hiddenKey: 'addToRes',
              hiddenValue: true
            }
          ]
        case 'insertvideo':
          return [
            {
              prop: 'uploadFile',
              label: '选择文件',
              type: 'videoUpload',
              option: {
                autoUpload: false,
                defaultFileName: '',
                type: ['mov', 'mp4', 'rmvb', '3gp', 'mkv'],
                ...this.uploadOption
              }
            },
            {
              prop: 'addToRes',
              label: '是否添加到资源库',
              type: 'radio',
              options: this.$enums.boolYes
            },
            {
              prop: 'spaceId',
              type: 'slot',
              hiddenKey: 'addToRes',
              hiddenValue: true
            }
          ]
        case 'music':
          return [
            {
              prop: 'uploadFile',
              label: '选择文件',
              type: 'audioUpload',
              option: {
                autoUpload: false,
                defaultFileName: '',
                type: ['mp3', 'mav', 'ogg', 'acc'],
                ...this.uploadOption
              }
            },
            {
              prop: 'addToRes',
              label: '是否添加到资源库',
              type: 'radio',
              options: this.$enums.boolYes
            },
            {
              prop: 'spaceId',
              type: 'slot',
              hiddenKey: 'addToRes',
              hiddenValue: true
            }
          ]
        case 'attachment':
          return [
            {
              prop: 'uploadFile',
              label: '选择文件',
              type: 'fileUpload',
              option: {
                autoUpload: false,
                defaultFileName: '',
                typeLimit: 1,
                ...this.uploadOption
              }
            },
            {
              prop: 'addToRes',
              label: '是否添加到资源库',
              type: 'radio',
              options: this.$enums.boolYes
            },
            {
              prop: 'spaceId',
              type: 'slot',
              hiddenKey: 'addToRes',
              hiddenValue: true
            }
          ]
        default:
          return [
            {
              prop: 'uploadFile',
              label: '选择文件',
              type: 'imageUpload',
              option: {
                autoUpload: false,
                type: ['jpg', 'jpeg', 'gif', 'png', 'bmp'],
                ...this.uploadOption
              }
            },
            {
              prop: 'mark',
              label: '是否添加水印',
              type: 'radio',
              options: this.$enums.boolYes
            },
            {
              prop: 'addToRes',
              label: '是否添加到资源库',
              type: 'radio',
              options: this.$enums.boolYes
            },
            {
              prop: 'spaceId',
              type: 'slot',
              hiddenKey: 'addToRes',
              hiddenValue: true
            }
          ]
      }
    },
    getResourceType () {
      let type = ''
      switch (this.resourceType) {
        case 'insertvideo':
          type = 2
          break
        case 'music':
          type = 3
          break
        case 'attachment':
          type = 4
          break
        default:
          type = 1
      }
      return type
    }
  },
  methods: {
    getHtml (url, name) {
      let html = ''
      switch (this.resourceType) {
        case 'insertvideo':
          html = `<p><video controls src='${url}' style='max-width:750px'>no video</video></p>`
          break
        case 'music':
          html = `<p><audio controls src='${url}'>no audio</audio></p>`
          break
        case 'attachment':
          html = `<a href='${url}' download='${url}'>${name}</a>`
          break
        default:
          html = `<img src='${url}' style='max-width:750px'/>`
      }
      return html
    },
    async handleConfirm () {
      if (!this.form.uploadFile) {
        this.$message('请先上传文件')
        return
      }
      if (this.form.uploadFile instanceof Array) {
        const that = this
        for (let index = 0; index < this.form.uploadFile.length; index++) {
          const d = that.form.uploadFile[index]
          await that.handleUpload({
            ...that.form,
            ...d
          })
        }
      } else {
        this.handleUpload(this.form)
      }
    },
    async handleUpload (form) {
      this.$emit('handleLoading', true)
      let { uploadFile, ...data } = form
      Object.keys(data).forEach(k => {
        uploadFile.append(k, data[k])
      })
      const dt = await this.$request.fetchUpload(uploadFile).then(res => {
        if (res.code === 200) {
          this.$message({
            message: '上传成功',
            type: 'success'
          })
          const fileUrl = this.$getPath(res.data.fileUrl)
          this.$emit('handleInsertHtml', this.getHtml(fileUrl, data.fileName), { url: fileUrl, id: res.data.resourceId, fileName: data.fileName }, form)
        }
        this.$emit('handleLoading', false)
      }).catch(() => {
        this.$emit('handleLoading', false)
      })
      return dt
    }
  }
}
</script>
<style lang="scss" scoped>
.resource-upload-container{
  .resource-item{
    height: 290px;
    border: 1px solid #e8e8e8;
    padding-top: 10px;
    border-radius: 4px;
  }
}
</style>
