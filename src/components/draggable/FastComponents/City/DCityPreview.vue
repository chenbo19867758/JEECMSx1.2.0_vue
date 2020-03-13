<template>
  <section class="d-city-preview z-draggable-preview">
    <el-form-item
      :label="option.label"
      :prop="option.name"
      :rules="getRules"
    >
      <!-- <div class="area-wrap">
        <el-form-item label-width="0"
          :prop="`${option.name}.provinceCode`"
          :rules="getRules"
        >
          <el-select
            v-model="form[option.name].provinceCode"
            popper-class="jee-border"
            placeholder='请选择'
            clearable
            @change="handleChangeProvince"
            :popperAppendToBody='false'
          >
            <el-option
              v-for="opt in getProvinces || []"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label-width="0"
          :prop="`${option.name}.cityCode`"
          :rules="getRules"
          >
          <el-select
            v-model="form[option.name].cityCode"
            popper-class="jee-border"
            placeholder='请选择'
            clearable
            :popperAppendToBody='false'
          >
            <el-option
              v-for="opt in getCitys(form[option.name].provinceCode) || []"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value">
            </el-option>
          </el-select>
        </el-form-item>
      </div> -->
      <el-cascader
        v-model="val"
        class="city-cascader"
        ref='cascader'
        popper-class="jee-border"
        placeholder='请选择'
        clearable
        :props="getCascaderProps"
        :options="getOptions"
        :appendToBody="false"
        @change="handleChange"
      />
      <div class="z-tip-form-item" v-if="option.tip">{{option.tip}}</div>
    </el-form-item>
  </section>
</template>

<script>
import previewMixin from '@/components/draggable/Mixin/previewMixin'
import { deepClone } from '@/utils'
import {
  mapGetters,
  mapActions
} from 'vuex'

export default {
  name: 'DCityPreview',
  mixins: [previewMixin],
  computed: {
    ...mapGetters(['areaOptions']),
    getCascaderProps () {
      return {
        checkStrictly: true
      }
    },
    val: {
      get () {
        const value = []
        if (this.value.provinceCode) {
          value.push(this.value.provinceCode)
          if (this.value.cityCode) {
            value.push(this.value.cityCode)
          }
        }
        return value
      },
      set (val) {
        const value = {
          provinceCode: '',
          cityCode: ''
        }
        if (Array.isArray(val) && val.length) {
          value.provinceCode = val[0]
          if (val.length > 1) {
            value.cityCode = val[1]
          }
        }
        this.$emit('input', value)
      }
    },
    getOptions () {
      // 不使用深拷贝会产生无限循环
      let options = deepClone(this.areaOptions).map(p => {
        if (p.children instanceof Array && p.children.length) {
          p.children = p.children.map(c => {
            if ('children' in c) {
              delete c.children
            }
            return c
          })
        }
        return p
      })
      return options
    }
  },
  methods: {
    ...mapActions('system', ['FetchSystemAreaTree']),
    handleChange (val) {
      this.$refs.cascader.dropDownVisible = false
    }
  },
  mounted () {
    this.FetchSystemAreaTree()
  }
}
</script>

<style lang="scss">
.d-city-preview .el-form-item{
  .el-form-item__content .city-cascader{
    max-width: 205px;
  }
  .el-input__inner{
    padding-left: 0!important;
  }
}
</style>
