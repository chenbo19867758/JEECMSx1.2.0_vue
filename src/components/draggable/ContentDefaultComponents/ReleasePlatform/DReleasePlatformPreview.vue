<template>
  <section class="d-release-platform d-checkbox-preview z-draggable-preview">
    <el-form-item
      :label="option.label"
      :prop="option.name"
      :required="option.isRequired"
      :rules="getRules"
    >
      <el-checkbox-group style='padding-top: 13px !important;' v-model="val" class="z-checkbox-group">
        <el-checkbox v-for="(opt, index) in getOptions || []" :key="index" :label="opt.value">
          {{opt.label}}
        </el-checkbox>
      </el-checkbox-group>
      <div class="z-tip-form-item" v-if="option.tip">{{option.tip}}</div>
    </el-form-item>
  </section>
</template>

<script>
import compoment from '@/components/draggable/CustomComponents/Checkbox/DSimpleCheckboxPreview'
export default {
  name: 'DReleasePlatformPreview',
  extends: compoment
}
</script>
