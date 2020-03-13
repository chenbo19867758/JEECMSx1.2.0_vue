<template>
  <section class="d-address-preview z-draggable-preview">
    <el-form-item
      :label="option.label"
      :prop="option.name"
      :rules="getRules"
      class="el-form-item__addr"
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
            :clearable="true"
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
            :clearable="true"
            @change="handleChangeCity"
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
        <el-form-item label-width="0"
          :prop="`${option.name}.areaCode`"
          :rules="getRules"
        >
          <el-select
            v-model="form[option.name].areaCode"
            popper-class="jee-border"
            :clearable="true"
            placeholder='请选择'
            :popperAppendToBody='false'
          >
            <el-option
              v-for="opt in getCountrys(form[option.name].provinceCode, form[option.name].cityCode) || []"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value">
            </el-option>
          </el-select>
        </el-form-item>
      </div> -->
      <div class="address-wrap">
        <el-cascader
          v-model="val"
          class="address-cascader"
          ref='cascader'
          popper-class="jee-border"
          placeholder='请选择'
          clearable
          :props="getCascaderProps"
          :options="areaOptions"
          :appendToBody="false"
          @change="handleChange"
        />
        <el-form-item label-width="0"
          :prop="`${option.name}.address`"
          :rules="getRules"
        >
          <el-input v-model="form[option.name].address" placeholder="详细地址" :maxlength="50"></el-input>
        </el-form-item>
      </div>
      <div class="z-tip-form-item" v-if="option.tip">{{option.tip}}</div>
    </el-form-item>
  </section>
</template>

<script>
import previewMixin from '@/components/draggable/Mixin/previewMixin'
import {
  mapGetters,
  mapActions
} from 'vuex'

export default {
  name: 'DAddressPreview',
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
            if (this.value.areaCode) {
              value.push(this.value.areaCode)
            }
          }
        }
        return value
      },
      set (val) {
        const value = {
          provinceCode: '',
          cityCode: '',
          areaCode: '',
          address: this.value.address
        }
        if (Array.isArray(val) && val.length) {
          value.provinceCode = val[0]
          if (val.length > 1) {
            value.cityCode = val[1]
          }
          if (val.length > 2) {
            value.areaCode = val[2]
          }
        }
        this.$emit('input', value)
      }
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
.d-address-preview .el-form-item{
  .address-wrap{
    display: flex;
    align-items: center;
  }
  .el-form-item{
    margin-bottom: 0!important;
    padding:0!important;
    flex:1;
  }
  .address-cascader{
    max-width: 205px;
    margin-right: 10px;
  }
  .el-input__inner{
    padding-left: 0!important;
  }
}
</style>
