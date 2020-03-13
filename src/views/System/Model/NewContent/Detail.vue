<template>
  <section class="column-model-edit-container model-content-container system-model-newContent-container" v-loading="loading">
    <el-header height="auto">
      <model-header :screenFullElement="screenFullElement" @handleSave="handleSave"/>
    </el-header>
    <div class="column-model-main-container scrollbar">
      <div class="component-block component" @mouseleave="leaveFun">
        <!-- 拖动组件区域 -->
        <div class="component-block-title">
          <div class="component-block-title-list-box">
            <div class="component-block-title-list jee-hover-color" v-for="group in groups" :class="{'jee-click': modelTab === group.name }" @mousemove="changeComponent(group)">
              <jee-icon :iconClass="group.icon" class="jee-color"></jee-icon>
              {{group.title}}
            </div>
          </div>
          <div class="component-block-title-items" :class="{'leave': componentShow === false, 'active': componentShow === true  }">
            <template v-for="(group, index) in groups">
              <draggable
                :list="group.data"
                v-bind="group.options"
                class="component-block-title-items-box"
                :style="group.data.length?'':'border-top:none'"
                v-show="modelTab === group.name"
                @start="handleComponentStart($event, group.data)"
              >
                <div v-for="(item, idx) in group.data" :key="item.type+idx" class="drag-comp-item-wrap">
                  <div class="hover-box jee-border"></div>
                  <jee-icon :iconClass="item.icon === undefined ? 'jia' : item.icon"></jee-icon>
                  <span class="drag-comp-item">{{group.name === '3' && item.isCustom ? item.value.label : item.name}}</span>
                  <jee-icon v-if="group.name === '3' && item.isCustom"
                            iconClass="jianqu" class="delete"
                            @click="()=>handleDeleteDefaultConfig(idx)"
                  ></jee-icon>
                </div>
              </draggable>
            </template>
          </div>
        </div>
      </div>
      <div class="content-block scrollbar">
        <div class="content-block-box" style='padding-top:0px'>
          <div class="content-block-left" :class="{isNoShowGhost: isNoShowGhostLeft}">
            <el-form label-suffix="：">
              <draggable
                v-model="data.formListBase"
                v-bind="options2"
                @start="handleWidgetStart($event, 'Base')"
                @add="handleWidgetAdd($event, 'Base')"
                @end="handleWidgetMoved($event, 'Base')"
                class="widget-form-list"
              >
                <!--循环行-->
                <template v-for="(row, rowIndex) in data.formListBase">
                  <div class="ghost-box" :key="rowIndex">
                  <!--判断是否合并-->
                  <template v-if="row instanceof Array && row.length">
                    <!--循环列-->
                    <div class="model-left-box">
                      <div class="model-left-container">
                        <div class="model-left-label widgetBr">
                        <template v-for="(col, colIndex) in row">
                          <template v-for="(cell, cellIndex) in col">
                            <div class="widget-view" :key="cell.prop" @click="handleSelectWidget(rowIndex + ',' + colIndex + ',' + cellIndex, 'Base')" :class="{active: selectIndex === rowIndex + ',' + colIndex + ',' + cellIndex && selectTab === 'Base'}">
                              <el-form-item label="内容模型" v-if="cell.type === 'modelName'">
                                {{cell.value.defaultValue}}
                              </el-form-item>
                              <component v-else :is="cell.preview" :index="cellIndex" :option="cell.value" :form="{[cell.value.name]: cell.value.defaultValue}" v-model="cell.value.defaultValue"
                                         :isValidator='false'></component>
                              <!-- 删除 -->
                              <jee-icon iconClass="guanbi" class="close" @click.stop="handleWidgetDelete(rowIndex + ',' + colIndex + ',' + cellIndex, 'Base')" v-if="cell.canDelete"/>
                              <!-- 向上 -->
                              <el-tooltip class="item" effect="light" content="向上挤" placement="top">
                                <jee-icon iconClass="xiangshangji" @click.stop="handleSplitWidget(rowIndex + ',' + colIndex + ',' + cellIndex, 'up', 'Base')"></jee-icon>
                              </el-tooltip>
                              <!-- 向下 -->
                              <el-tooltip class="item" effect="light" content="向下挤" placement="bottom">
                                <jee-icon iconClass="xiangxiaji" @click.stop="handleSplitWidget(rowIndex + ',' + colIndex + ',' + cellIndex, 'down', 'Base')"></jee-icon>
                              </el-tooltip>
                              <!-- 左右 -->
                              <el-tooltip class="item" :class="{'left': colIndex === 1, 'right': colIndex === 0}" effect="light" :content="colIndex === 0 ? '右移' : '左移'" placement="top">
                                <jee-icon iconClass="zuoyouyi" @click.stop="handleSplitWidget(rowIndex + ',' + colIndex + ',' + cellIndex, 'about', 'Base')"></jee-icon>
                              </el-tooltip>
                            </div>
                          </template>
                        </template>
                        </div>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <!--判断是否正文-->
                    <el-tabs
                      v-if="row.type === 'content'"
                      type="card"
                      class="tab-content"
                      v-model="activeContent"
                      editable
                      :class="{'hide-close-first': row.list.length > 1 }"
                      @edit="(targetName, action)=>handleContentTabsEdit(targetName, action, rowIndex, 'Base', row.list.length)"
                    >
                      <el-tab-pane
                        v-for="(col, colIndex) in row.list"
                        :key="col.tabLabel"
                        :label="col.tabLabel"
                        :name="col.tabName"
                      >
                        <div class="widget-view" :key="col.prop" :class="{active: selectIndexConfig === rowIndex + ',' + colIndex && selectTab === 'Base'}" @click="handleSelectWidget(rowIndex + ',' + colIndex, 'Base')" style="padding:0 1px">
                          <component :is="col.preview" :index="colIndex" :option="col.value" :form="{[col.value.name]: col.value.defaultValue}" v-model="col.value.defaultValue"
                                     :isValidator='false'></component>
                        </div>
                      </el-tab-pane>
                    </el-tabs>
                    <!--判断是否是文档 -->
                    <el-tabs type="card" class="tab-document" closable @tab-remove="handleWidgetDelete(rowIndex, 'Base')" v-model="activeDocument" v-else-if="row.type === 'document'" :before-leave="documentChange">
                      <el-tab-pane label="清除文档" name="close">
                        <div class="tab-document-close" slot="label"><jee-icon iconClass="delete"></jee-icon>清除文档</div>
                      </el-tab-pane>
                      <el-tab-pane :label="row.name" :name="row.type">
                        <div class="widget-view" :key="row.prop" :class="{active: selectIndex === rowIndex && selectTab === 'Base'}" @click="handleSelectWidget(rowIndex, 'Base')">
                          <component :is="row.preview" :index="rowIndex" :option="row.value" :form="{[row.value.name]: row.value.defaultValue}" v-model="row.value.defaultValue"
                                     :isValidator='false'></component>
                        </div>
                      </el-tab-pane>
                    </el-tabs>
                    <template v-else>
                      <div class="model-left-box" v-if="row.list === undefined" @click="handleSelectWidget(rowIndex, 'Base')" :class="{'active': selectIndex === rowIndex && selectTab === 'Base'}">
                        <div class="model-left-container">
                          <div class="model-left-label">
                            <div class="widget-view" :key="row.prop" >
                              <el-form-item label="内容模型" v-if="row.type === 'modelName'">
                                {{row.value.defaultValue}}
                              </el-form-item>
                              <component v-else :is="row.preview" :index="rowIndex" :option="row.value" :form="{[row.value.name]: row.value.defaultValue}" v-model="row.value.defaultValue"
                                         :isValidator='false'></component>
                              <!-- 删除 -->
                              <jee-icon iconClass="guanbi" class="close" v-if="row.canDelete" @click.stop="handleWidgetDelete(rowIndex, 'Base')"/>
                              <!-- 向上 -->
                              <el-tooltip v-show="rowIndex !== 0" class="item" effect="light" content="向上挤" placement="top">
                                <jee-icon iconClass="xiangshangji" @click.stop="handleMergeWidget(rowIndex, 'up', 'Base')"></jee-icon>
                              </el-tooltip>
                              <!-- 向下 -->
                              <el-tooltip class="item" effect="light" content="向下挤" placement="bottom">
                                <jee-icon iconClass="xiangxiaji" @click.stop="handleMergeWidget(rowIndex, 'down', 'Base')"></jee-icon>
                              </el-tooltip>
                            </div>
                          </div>
                        </div>
                      </div>
                      <template v-else>
                        <div class="model-left-box widget-view-box" @click.stop="handleSelectWidget(rowIndex, 'Base')" :class="{'active': selectIndex === rowIndex && selectTab === 'Base'}">
                          <div class="model-left-container" :class="{'isNoShowComponent': OriginalListIndex === rowIndex}">
                            <p class="model-left-title">{{row.name}}：</p>
                            <draggable
                              v-model="row.list"
                              v-bind="options4"
                              @start="handleWidgetListStart($event, rowIndex, 'Base')"
                              @add="handleWidgetAdd($event, 'Base', rowIndex)"
                              class="model-left-label flexwrap">
                              <template v-for="(col, colIndex) in row.list">
                                <div class="ghost_list_box" :class="{active: selectIndexConfig === rowIndex + ',' + colIndex && selectTab === 'Base', flex50: row.type === 'fileUpload'}">
                                  <div class="widget-view" :key="col.prop" @click.stop="handleSelectWidget(rowIndex + ',' + colIndex, 'Base')">
                                    <component :is="col.preview" :index="colIndex" :option="col.value" :form="{[col.value.name]: col.value.defaultValue}" v-model="col.value.defaultValue"
                                               :isValidator='false'></component>
                                    <!-- 删除 -->
                                    <jee-icon iconClass="guanbi" class="close" @click.stop="handleWidgetDelete(rowIndex + ',' + colIndex, 'Base')" v-if="col.canDelete"/>

                                  </div>
                                </div>
                              </template>
                            </draggable>
                            <!-- 删除 -->
                            <jee-icon iconClass="guanbi" class="close" @click.stop="handleWidgetDelete(rowIndex, 'Base')"/>
                            <!-- 向上 -->
                            <el-tooltip v-show="rowIndex !== 0" class="item" effect="light" content="向上挤" placement="top">
                              <jee-icon iconClass="xiangshangji" @click.stop="handleMergeWidget(rowIndex, 'up', 'Base')"></jee-icon>
                            </el-tooltip>
                            <!-- 向下 -->
                            <el-tooltip class="item" effect="light" content="向下挤" placement="bottom">
                              <jee-icon iconClass="xiangxiaji" @click.stop="handleMergeWidget(rowIndex, 'down', 'Base')"></jee-icon>
                            </el-tooltip>
                          </div>
                        </div>
                      </template>
                    </template>
                  </template>
                  </div>
                </template>
              </draggable>
            </el-form>
          </div>
          <div class="content-block-right" :class="{isNoShowGhost: isNoShowGhostRight}">
            <el-form label-suffix="：">
              <draggable
                v-model="data.formListExtend"
                v-bind="options2"
                @add="handleWidgetAdd($event, 'Extend')"
                @end="handleWidgetMoved($event, 'Extend')"
                class="widget-form-list"
              >
                <template v-for="(item, index) in data.formListExtend">
                  <template v-if="item.type === 'modelName'">
                    <div class="ghost-box">
                      <div class="widget-view system-model-newContent">
                        <el-form-item :label="item.name" style="margin-right: 10px; margin-left:10px; margin-bottom: 0;">
                          <div>{{item.value.defaultValue}}</div>
                        </el-form-item>
                      </div>
                    </div>
                  </template>
                  <div class="ghost-box " v-else-if="item.list !== undefined">
                    <div class="widget-view-box" @click.stop="handleSelectWidget(index, 'Extend')">
                      <p class="model-right-title">{{item.name}}：</p>
                      <div class="model-right-list flexwrap">
                        <div v-for="(col, colIndex) in item.list" class="model-right-item widget-view" :key="col.prop"  @click.stop="handleSelectWidget(index + ',' + colIndex, 'Extend')" :class="{active: selectIndexConfig === index + ',' + colIndex && selectTab === 'Extend', w140: item.type !== 'fileUpload'}">
                          <component :is="col.preview" :index="colIndex" :option="col.value" :form="{[col.value.name]: col.value.defaultValue}" v-model="col.value.defaultValue"
                                     :isValidator='false'></component>
                          <!-- 删除 -->
                          <jee-icon iconClass="guanbi" class="close" @click.stop="handleWidgetDelete(index + ',' + colIndex, 'Extend')" v-if="col.canDelete"/>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="ghost-box" v-else>
                    <div class="widget-view" :key="item.prop" @click="handleSelectWidget(index, 'Extend')" :class="{active: selectIndex === index && selectTab === 'Extend'}">
                      <component :is="item.preview" :index="index" :option="item.value" :form="{[item.value.name]: item.value.defaultValue}" v-model="item.value.defaultValue"
                                 :isValidator='false'></component>
                      <!-- 删除 -->
                      <jee-icon iconClass="guanbi" @click.stop="handleWidgetDelete(index, 'Extend')" class="close" v-if="item.canDelete"/>
                    </div>
                  </div>
                </template>
              </draggable>
            </el-form>
          </div>
        </div>
      </div>
      <div class="config-block" :class="{'active': isConfig}">
        <div class="config-block-box" style="padding-top:18px">
          <div class="config-block-title">配置详情</div>
          <div class="config-block-form">
            <component :is="getSelectFormItem.editor" v-bind="getSelectFormItem" v-if="getSelectFormItem"
               ref="editorComponent"
               :key="getSelectFormItem.prop || getSelectFormItem.type"></component>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import {
  mapGetters
} from 'vuex'
import detailMixin from '../detailMixinNew'
import defaultConfigs from '@/components/draggable/Config/contentDefaultConfigs'
import { deepClone, arrayFlat } from '@/utils'
import ModelHeader from '../Vip/ModelNewHeader'
export default {
  name: 'modelNewContentDetail',
  mixins: [detailMixin],
  components: {
    ModelHeader
  },
  // 由于在模板中引入了 inject 所以需要初始话设置一个值
  provide () {
    return {
      changeColumn: '',
      fetchContentDetail: ''
    }
  },
  data () {
    return {
      customConfigsFilter: ['ueditor'],
      fastConfigsFilter: [],
      defaultConfigFilter: [],
      activeContent: 'content',
      activeDocument: 'document',
      data: {
        formListBase: [], // 主体数据
        formListExtend: [], // 扩展数据
        formListContent: []
      },
      screenFullElement: '.model-content-container',
      loading: false, // loading
      componentShow: false, // 是否显示模型组件列表
      modelTab: '',
      tabIndex: 1,
      modelNameObj: {
        type: 'modelName',
        name: '内容模型',
        index: 1,
        isCustom: false,
        value: {
          defaultValue: '', // 默认值
          label: '内容模型', // 字段名称
          name: 'modelName', // 标签名称
          isLengthLimit: false, // 是否字数限制
          max: 50, // 最大长度
          isInputLimit: false, // 是否输入限制
          inputLimit: '', // 限制类型
          isRegister: false, // 是否应用到注册
          isRequired: false // 是否必填
        }
      },
      titleIndex: null // 左侧模型组件显示下标
    }
  },
  computed: {
    ...mapGetters(['setting']),
    // 是否开启内容发文字号
    openContentIssue () {
      const { openContentIssue } = this.setting.attrs || {}
      return openContentIssue
    },
    // 是否开启内容密级
    openContentSecurity () {
      const { openContentSecurity } = this.setting.attrs || {}
      return openContentSecurity
    }
  },
  watch: {
    // 是否开启内容发文字号
    openContentIssue (newData, oldData) {
      this.setContentIssue(newData)
    },
    // 是否开启内容密级
    openContentSecurity (newData, oldData) {
      this.setContentSecurity(newData)
    }
  },
  mounted () {
    this.initData()
  },
  methods: {
    // 阻止文档tabs切换
    documentChange (activeName, oldActiveName) {
      if (activeName === 'close') {
        return false
      }
    },
    // 切换组件区域
    changeComponent (item) {
      this.componentShow = true
      this.modelTab = item.name
    },
    // 鼠标离开组件区域
    leaveFun () {
      let _this = this
      _this.componentShow = false
      // if (!_this.componentStart) {
      //   setTimeout(function () {
      //     _this.modelTab = ''
      //     _this.componentStart = false
      //   }, 1000)
      // }
      // this.modelTab = ''
    },
    // 初始化
    initData () {
      let titleList = this.getFormListTitle()
      let baseList = this.getFormListBase()
      let contentList = this.getFormListContent()
      this.defaultConfigs = this.getInitDefaultConfig()
      this.data = {
        formListBase: deepClone([this.modelNameObj].concat(titleList, contentList)),
        formListExtend: deepClone(baseList)
      }
      this.activeContent = 'content'
      this.setContentSecurity(this.openContentSecurity)
      this.setContentIssue(this.openContentIssue)
    },
    // 获取详情
    fetchModelDetail () {
      this.loading = true
      this.$request.fetchModelDetail({ id: this.modelId }).then(res => {
        if (res.code === 200) {
          const { enableJson, unEnableJson, modelName } = res.data
          this.modelNameObj.value.defaultValue = modelName
          // 新增加的模型一开始是没有数据的
          if (!(enableJson instanceof Object && Object.keys(enableJson).length)) {
            this.initData()
          } else {
            const { formListBase, formListExtend } = enableJson || {}
            if (formListBase instanceof Array && formListBase.length) {
              // this.data.formListBase = this.detailResetData(formListBase).sort((a, b) => a.index - b.index)
              this.data.formListBase = this.detailResetData(formListBase)
            }
            if (formListExtend instanceof Array && formListExtend.length) {
              // this.data.formListExtend = this.detailResetData(formListExtend).sort((a, b) => a.index - b.index)
              this.data.formListExtend = this.detailResetData(formListExtend)
            } else {
              // 如果没有数据，则设置为空
              this.data.formListExtend = []
            }
            if (unEnableJson instanceof Array && unEnableJson.length) {
              this.defaultConfigs = unEnableJson.sort((a, b) => a.groupIndex - b.groupIndex)
            } else {
              this.defaultConfigs = this.getInitDefaultConfig()
            }
            console.log(this.data.formListBase)
            // 判断下是否字段模型名称
            let tempBaseList = arrayFlat(this.data.formListBase)
            let tempExtend = arrayFlat(this.data.formListExtend)
            if (tempBaseList.find(d => d.type === 'modelName') === undefined && tempExtend.find(d => d.type === 'modelName') === undefined) {
              this.data.formListBase = [this.modelNameObj].concat(this.data.formListBase)
            } else {
              ['formListBase', 'formListExtend'].forEach(item => {
                this.data[item].forEach(d => {
                  if (d instanceof Array) {
                    d.forEach(c => {
                      if (c.type === 'modelName') {
                        c.value.defaultValue = modelName
                      }
                    })
                  } else if (d.type === 'modelName') {
                    d.value.defaultValue = modelName
                  }
                })
              })
            }
            this.setContentSecurity(this.openContentSecurity)
            this.setContentIssue(this.openContentIssue)
          }
        } else {
          this.initData()
        }
        this.loading = false
      }).catch(() => {
        this.initData()
        this.loading = false
      })
    },
    // 开启内容密级时将内容密级字段插入，关闭时删除
    setContentSecurity (newData) {
      if (newData === '0') {
        this.defaultConfigs = this.defaultConfigs.filter(d => d.type !== 'contentSecurity')
        this.data.formListBase = this.data.formListBase.filter(d => d.type !== 'contentSecurity')
        this.data.formListExtend = this.data.formListExtend.filter(d => d.type !== 'contentSecurity')
      } else {
        if (!this.defaultConfigs.find(d => d.type === 'contentSecurity') && !this.data.formListBase.find(d => d.type === 'contentSecurity') && !this.data.formListExtend.find(d => d.type === 'contentSecurity')) {
          let contentSecurity = defaultConfigs.find(d => d.type === 'contentSecurity')
          this.defaultConfigs.push(contentSecurity)
        }
      }
    },
    // 开启内容发文字号时将发文字号字段插入，关闭时删除
    setContentIssue (newData) {
      if (newData === '0') {
        this.defaultConfigs = this.defaultConfigs.filter(d => d.type !== 'postContent')
        this.data.formListBase = this.data.formListBase.filter(d => d.type !== 'postContent')
        this.data.formListExtend = this.data.formListExtend.filter(d => d.type !== 'postContent')
      } else {
        if (!this.defaultConfigs.find(d => d.type === 'postContent') && !this.data.formListBase.find(d => d.type === 'postContent') && !this.data.formListExtend.find(d => d.type === 'postContent')) {
          let postContent = defaultConfigs.find(d => d.type === 'postContent')
          this.defaultConfigs.push(postContent)
        }
      }
    },
    // 默认主体
    getFormListBase () {
      let column = deepClone(defaultConfigs.find(d => d.type === 'column'))
      let releaseTime = deepClone(defaultConfigs.find(d => d.type === 'releaseTime'))
      return [
        column,
        releaseTime
      ].map(d => {
        const key = Date.now() + '_' + Math.ceil(Math.random() * 1000000)
        d.prop = d.type + '_' + key
        return d
      })
    },
    // 默认标题
    getFormListTitle () {
      let title = deepClone(defaultConfigs.find(d => d.type === 'title'))
      let subTitle = deepClone(defaultConfigs.find(d => d.type === 'subTitle'))
      return [title, subTitle]
    },
    // 默认正文
    getFormListContent () {
      let content = deepClone(defaultConfigs.find(d => d.type === 'content'))
      let obj = {
        type: content.type,
        index: content.index,
        name: content.name,
        value: {
          name: content.name
        },
        list: [
          {
            tabLabel: '正文',
            tabName: 'content',
            ...content
          }
        ]
      }
      return [obj]
    },
    // 获取基础数据
    getInitDefaultConfig () {
      return defaultConfigs.filter(d => !['title', 'subTitle', 'content', 'column', 'releaseTime'].includes(d.type)).slice().sort((a, b) => a.groupIndex - b.groupIndex)
    },
    // 新增正文
    handleContentTabsEdit (targetName, action, rowIndex, type, length) {
      if (action === 'add') {
        let content = deepClone(defaultConfigs.find(d => d.type === 'content'))
        // this.data.formListContent.push(content)
        this.data.formListBase.forEach((d, index) => {
          if (d.type === 'content') {
            let newTabName = d.list.length
            d.list.forEach(c => {
              if (c.value.label.indexOf(newTabName) !== -1) {
                newTabName++
              }
            })
            content.tabLabel = '正文' + newTabName
            content.tabName = 'content' + newTabName
            content.prop = 'content' + newTabName
            content.value.name = 'content' + newTabName
            content.value.label = '正文' + newTabName
            this.activeContent = 'content' + newTabName
            d.list.push(content)
          }
        })
      } else if (action === 'remove') {
        // 最后一个删除时删除整个字段
        if (length === 1) {
          this.handleWidgetDelete(rowIndex, type)
        }
        this.data[`formList${type}`].forEach(d => {
          if (d.type === 'content') {
            d.list.forEach((c, index) => {
              // 判断是否是第一个，并且数量超过1
              if (index !== 0 && d.list.length > 1) {
                if (c.tabName === targetName) {
                  d.list.splice(index, 1)
                  this.activeContent = d.list[d.list.length - 1].tabName
                }
              }
            })
          }
        })
      }
    },
    detailResetData (list) {
      let data = deepClone(list)
      let excludeList = ['content', ...this.excludeList]
      // 去除多余数组
      let RowList = data.map((d) => {
        // 判断是否有多数组
        if (d.length > 1) {
          let list = [d[0], d[1]]
          return list
        } else if (excludeList.indexOf(d[0][0].type) !== -1) {
          let obj = {
            type: d[0][0].type,
            index: d[0][0].index,
            name: d[0][0].name,
            list: d[0],
            value: {
              name: d[0][0].value.name
            }
          }
          return obj
        } else {
          return d[0][0]
        }
      })
      return RowList
    }
  }
}
</script>
<style lang="scss">
.model-content-container{
  .d-radio-editor-container,
  .d-checkbox-editor-container,
  .d-select-editor-container{
    .option-radio{
      .el-input__inner{
        width: 240px!important;
      }
    }
    .option-radio-gender{
      .el-input__inner{
        width: 210px!important;
      }
    }
  }
}
</style>
<style scoped lang="scss">
@import '../detail.scss';
.route-view-container{
  overflow-x: auto!important;
  padding: 30px 0 0!important;
}

.el-header{
  border-bottom: 1px solid #e8e8e8;
  padding-bottom: 20px!important;
}
.z-draggable-preview{
  > .el-form-item{
    margin-left: 10px;
    margin-right: 10px;
  }
}
.column-model-edit-container{
  overflow-x: auto;
  overflow-y: overlay;
}
.column-model-main-container{
  height: 100%;
  display: flex;
  position: relative;
  align-items: stretch;
  /deep/.form-item-wrap{
    .el-form-item{

    }
  }
  // .model-left-box.active{
  //   /deep/ .el-input__inner,
  //   /deep/ .el-input__count-inner{
  //     background: #D5F4F8 !important;
  //   }
  // }
  .el-tabs--card{
    > .el-tabs__header{
      .el-tabs__item{
        .el-icon-close{
          right: -13px;
        }
      }
    }
  }
  .el-form-item__label{
    padding-right: 0;
  }
  .component-block{
    background-color: #fff;
    color: #333;
    .component-block-title{
      display: flex;
      height: 100%;
    }
    .component-block-title-list-box{
      border-right: 1px solid #E8E8E8;
      width: 40px;
    }
    .component-block-title-list{
      font-size:16px;
      font-weight:400;
      width: 20px;
      margin: 20px auto;
      text-align: center;
      cursor: pointer;
      margin-bottom: 40px;
      // color: #333;
      .jee-svg-icon{
        margin-bottom: 10px;
      }
    }
    .component-block-title-items{
      width: 0;
      border-right: 1px solid #E8E8E8;
      overflow: hidden;
      transition:all .3s ease-in .1s;
      .component-block-title-items-box{
        margin: 20px;
        width: 240px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        // border-top: 1px solid #E8E8E8;
        // border-left: 1px solid #E8E8E8;
        .drag-comp-item-wrap{
          width: 33.33%;
          height: 80px;
          border: 1px solid #E8E8E8;
          margin-left: -1px;
          margin-top: -1px;
          background-color: #fff;
          // border-right: 1px solid #E8E8E8;
          // border-bottom: 1px solid #E8E8E8;
          box-sizing: border-box;
          text-align: center;
          font-size: 12px;
          color: #666;
          position: relative;
          .hover-box{
            width: 100%;
            height: 100%;
            position: absolute;
            left: 0;
            top: 0;
            display: none;
            z-index: 1;
          }
          &:hover{
            .hover-box{
              display: block;
            }
          }
          .jee-svg-icon{
            font-size: 24px;
            display: flex;
            flex-direction: row;
            justify-content: center;
            margin: 18px auto 10px;
          }
          svg.jia.jee-svg-icon{
            font-size: 16px;
          }
          svg.delete.jianqu.jee-svg-icon{
            fill: #797979;
            color: #797979;
            font-size: 16px;
            top: -17px;
            right: 1px;
          }
          .delete{
            position: absolute;
            right: 0;
            top: -20px;
            cursor: pointer;
            z-index: 10;
          }
        }
      }
      &.leave{
        width:0;
        border-right: 0 solid #e8e8e8;
      }
      &.active{
        width: 280px;
      }
    }
  }
  .content-block{
    flex: 1;
    background-color: #F0F0F0;
    padding-top: 20px;
    padding-bottom: 40px;
    overflow-x: overlay;
  }

  .content-block-box{
    width: 1205px;
    height: 100%;
    margin: 0 auto;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-right: 20px;
    box-sizing: border-box;
    .widget-view{
      .el-form-item{
        padding-left: 30px;
        padding-right: 30px;
      }
      &.active{
        background-color: rgba(213,244,248,1);
        border: 1px dashed #1EC6DF!important;
      }
    }
    .content-block-left{
      width: 775px;
      margin-right: 0px;
      margin-left: 20px;
      .model-left-box{
        border: 1px solid #E8E8E8;
        border-radius: 4px;
        background-color: #fff;
        font-size: 14px;
        color: #666;
        position: relative;
        .model-left-title{
          padding: 20px 20px 10px;
        }
        .item{
          display: none;
        }
        .xiangshangji, .xiangxiaji, .zuoyouyi{
          position: absolute;
          left: 50%;
          opacity: 1;
          z-index: 1102;
          cursor: pointer;
          font-size: 20px;
        }
        .xiangshangji{
          top: -7px;
          transform: translate(-50%, 0);
        }
        .xiangxiaji{
          bottom: -7px;
          transform: translate(-50%, 0);
        }
        .zuoyouyi{
          left: auto;
          &.left{
            left: -10px;
            top: 50%;
            transform: translate(0, -50%);
          }
          &.right{
            right: -10px;
            top: 50%;
            transform: translate(0, -50%);
          }
        }
        &.active{
          // background-color: rgba(213,244,248,1);
          border: 1px dashed #1EC6DF;
          // .close{
          //   opacity: 1;
          // }
          .item{
            display: block;
          }
          .el-input__inner{
            // background: #D5F4F8!important;
            padding-left: 0;
          }
          .el-input__count-inner{
            // background: #D5F4F8!important;
          }
        }
        .widget-view{
          padding: 0 23px 0 30px
        }

        .model-left-label{
          position: relative;
          display: flex;
          &.widgetBr:before{
            position: absolute;
            left: 50%;
            top: 50%;
            width: 1px;
            height: 100%;
            display: block;
            content: '';
            border-left: 1px solid #e8e8e8;
            transform: translate(-50%, -50%);
          }
          &.flexwrap{
            flex-wrap: wrap;
            align-items: start;
            .w100{
              width: 120px;
              flex: inherit;
            }
            .flex50{
              width: 50%;
              box-sizing: border-box;
              flex: inherit;
            }
          }
          /deep/ .el-form-item{
            // align-items: center;
            margin-bottom: 0;
            font-size: 16px;
            color: #666;
            display: flex;
            padding: 10px 0;
            .el-radio-group .el-radio, .el-checkbox-group .el-checkbox{
              padding: 0;
              min-height:14px;
            }
            /deep/ .el-form-item__content{
              flex: 1;
              .el-input__inner{
                border: none!important;
                padding-left: 0;
              }
              .el-input{
                max-width: none;
              }
            }
            .content-wrap{
              .el-select, .el-input{
                flex: 1;
              }
            }
            .source-wrap{
              .el-autocomplete, .el-input{
                flex: 1;
              }
            }
          }
          /deep/ .widget-view{
            .d-video-upload-preview,.d-audio-upload-preview,.d-image-upload-preview{
              >.el-form-item{
                .el-form-item__content{
                  width:140px;
                }
                .form-label{
                  line-height:1.5;
                  padding-top:5px;
                }
                .z-video-uploader{
                  height:140px;
                  .text-wrap{
                    position:relative;
                    top:22px;
                  }
                }
              }
            }
            .d-textarea-preview{
              margin-right: -21px;
              >.el-form-item{
                padding-bottom:3px;
              }
            }
          }
        }
      }
      .model-left-box.active{
        .model-left-label{
          /deep/ .el-form-item{
            /deep/ .el-form-item__content{
              .el-input__inner{
                // background: #D5F4F8;
              }
            }
          }
        }
      }
      /deep/ .el-tabs__content{
        width: 100%;
        margin-bottom: 10px;
        .el-tab-pane{
          background-color: #fff;
        }
      }
      /deep/ .el-tabs__item{
        background-color: #fff;
      }
      .tab-content-first{
        /deep/ .el-tabs__item:first-child{
          .el-icon-close {
            display: none;
          }
        }
      }
      .tab-document{
        /deep/ .el-tabs__nav{
          position: relative;
          width: 100%;
          #tab-close{
            position: absolute;
            border: none;
            background-color: transparent;
            right: 0;
            padding-right: 0;
            .tab-document-close{
              color: #666;
              .jee-svg-icon{
                margin-right:10px;
                fill: #777;
                color: #777;
              }
              &:hover{
                color: #1EC6DF;
                .jee-svg-icon{
                  fill: #1EC6DF;
                  color: #1EC6DF;
                }
              }
            }
          }
        }
      }
      // 拖动副本上下无间隔
      .ghost-box:nth-of-type(n+2) {
        padding-top: 10px;
      }
      .ghost,
      .ghost + .ghost-box{
        padding-top: 0;
      }
      // 隐藏正文有多个时第一个的关闭按钮
      .hide-close-first{
        /deep/ .el-tabs__item:first-child{
          padding: 0 26px;
          .el-icon-close{
            display: none;
          }
          &:hover{
            padding: 0 26px;
          }
        }
      }
    }
    .content-block-right{
      width: 370px;
      margin-left: 20px;
      height:100%;
      .ghost-box{
        background-color: #fff;
        border-bottom: 1px solid #e8e8e8;
      }
      .ghost-box:last-child{
        border-bottom: 1px solid #fff;
      }
      .widget-view{
        .el-form-item{
          padding-left: 30px;
          padding-right: 30px;
        }
        &.active{
          background-color: rgba(213,244,248,1);
          // border: 1px dashed #1EC6DF!important;
        }
        /*表单项-h*/
        /deep/ .el-form-item{
          padding:18px 30px;
          &__label{
            width: 100%;
            text-align: left;
            margin-bottom: 7px;
            line-height:1;
          }
          &.el-form-item__addr{
            .el-form-item__label{
              float: none;
              display: block;
            }
            .address-wrap{
              flex-wrap: wrap;
              .address-cascader{
                max-width: inherit;
                margin-right: 0;
                margin-bottom: 7px;
              }
              .el-input__inner{
                padding-left: 20px!important;
              }
            }
          }
          .el-select,.el-input,.el-cascader{
            line-height:35px;
            height:35px;
            .el-input__inner{
              line-height:35px;
              height:35px;
            }
            .el-input__icon{
              line-height:35px;
              height:35px;
            }
          }
        }
        /*组件-h*/
        /deep/ .z-draggable-preview{
          &.d-radio-preview,&.d-checkbox-preview{
            .el-form-item{
              padding-bottom:10px;
              &__label{
                margin-bottom: 18px;
              }
              .el-radio-group{
                .el-radio{
                  margin-bottom: 8px;
                  &__inner{
                    border: 1px solid #ccc;
                  }
                }
              }
              .el-checkbox-group{
                width:100%;
                .el-checkbox{
                  line-height:1;
                  padding-bottom:10px;
                }
              }
            }
          }
          &.d-radio-preview{
            .el-form-item{
              padding-bottom:0;
            }
          }
          &.d-link-preview{
            .el-form-item{
              .el-checkbox{
                padding-top: 0;
                position: relative;
                top:-4px;
              }
            }
          }
          /*地址*/
          &.d-address-preview,&.d-city-preview,&.d-link-preview{
            .el-form-item{
              &__content{
                .el-form-item{
                  padding:0;
                }
                .area-wrap{
                  width:100%;
                  padding-bottom:0;
                  .el-form-item{
                    width:100%;
                    padding:0 0 5px;
                    margin-right:0;
                  }
                }
              }
            }
          }
          /*发文字号*/
          &.d-postcontent-preview{
            .content-wrap{
              width:100%;
              .el-select{
                margin-bottom:10px;
                margin-right:0;
              }
            }
          }
          &.d-title-preview{
            .el-form-item{
              .input-wrap{
                width:100%;
              }
            }
          }
        }
        // 发布平台
        /deep/ .d-release-platform{
          .el-form-item__label{
            margin-bottom: 20px;
          }
          .el-checkbox{
            &:nth-of-type(1){
              width: 52px;
            }
            &:nth-of-type(2){
              width: 120px;
            }
          }
        }
      }
      .model-right-title{
        height: 14px;
        line-height: 1;
        color: #666666;
        font-size: 14px;
        padding: 20px 30px 10px;
      }
      >.el-form{
        height:100%;
      }
      .widget-form-list{
        height:100%;
      }
      .model-right-list{
        display: flex;
        padding:5px 0;
        /*右侧组件样式-h*/
        /deep/ .model-right-item{
          position: relative;
          .resource-upload-wrap .z-video-uploader {
            height: auto;
            .text-wrap{
              width: 138px;
              height: 138px;
              .jee-svg-icon{
                padding-top: 38px;
              }
            }
          }
          .d-file-upload-preview{
            .el-form-item{
                padding:13px 30px;
                &__content{
                  line-height:35px;
                }
            }
          }
          .d-video-upload-preview,.d-audio-upload-preview,.d-image-upload-preview{
            .el-form-item{
                padding:15px 15px 0px 30px;
                .form-label{
                  padding-top:5px;
                }
            }
          }
          &:nth-of-type(2n){
            .d-video-upload-preview,.d-audio-upload-preview,.d-image-upload-preview{
              .el-form-item{
                  padding:15px 30px 0px 15px;
              }
            }
          }
          &:last-of-type{
            .d-file-upload-preview{
              .el-form-item{
                  padding-bottom:22px;
              }
            }
            .d-video-upload-preview,.d-audio-upload-preview,.d-image-upload-preview{
              .el-form-item{
                  padding-bottom:10px;
              }
            }
          }
        }
        &.flexwrap{
          flex-wrap: wrap;
          align-items: start;
          .w140{
            width: 50%;
            box-sizing: border-box;
            flex: initial;
          }
        }
      }
      /deep/ .d-multi-image-upload-preview.z-draggable-preview > .el-form-item{
        padding-top: 15px;
      }
    }
    .widget-view{
      flex: 1;
      position: relative;
      cursor: move;
      &:hover{
        .close{
          opacity: 1;
        }
      }
      &:after{
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        top: 0;
        display: block;
        z-index: 1101;
      }
      .close{
        position: absolute;
        opacity: 0;
        top: 0;
        right: 0;
        font-size: 16px;
        z-index: 1102;
        cursor: pointer;
      }
      &.active{
        background-color: rgba(213,244,248,1);
        border: 1px dashed #1EC6DF;
        .xiangshangji, .xiangxiaji, .zuoyouyi{
          opacity: 1;
        }
        .item{
          display: block;
        }
      }
    }
    .widget-view-box{
      cursor: move;
      &:hover{
        .flexwrap + .close{
          opacity: 1;
        }
      }
      .flexwrap + .close{
        position: absolute;
        opacity: 0;
        top: 0;
        right: 0;
        font-size: 16px;
        z-index: 1102;
        cursor: pointer;
      }
    }
    .ghost_list_box.active{
      /deep/ .jee-image-resource-upload-container,
      /deep/ .jee-video-resource-upload-container{
        background-color: #ffffff;
      }
    }
    .model-left-box:not(.active){
      .widget-view:not(.active):hover{
        background-color: #F9F9F9;
        /deep/ .el-input__inner{
          background-color: #F9F9F9;
        }
      }
    }
    .content-block-right .widget-view:not(.active):hover{
      background-color: #F9F9F9;
    }
    // 富文本组件标签页
    .tab-content.el-tabs.el-tabs--card{
      /deep/ .el-tabs__new-tab{
        border: 0;
        outline: none;
        color: #666666;
        width: 80px;
        .el-icon-plus{
          font-size: 16px;
          transform: scale(1);
          padding-right: 64px;
          position: relative;
          &::before{
            content: "\e7a0";
          }
          &::after{
            content: "添加正文";
            font-size: 14px;
            position: absolute;
            right: 0;
            line-height: 16px;
          }
        }
      }
      /deep/ .el-tabs__header .el-tabs__item{
        border-radius: 0;
        &:first-child{
          border-radius: 4px 0 0 0;
        }
        &:last-child{
          border-radius: 0 4px 0 0;
        }
        &.is-closable:hover{
          padding-left: 26px;
          padding-right: 12px;
        }
        &.is-closable:not(.is-active){
          color: #666666;
        }
        &.is-active {
          padding-right: 12px;
          .el-icon-close{
            background-color: rgba(255,255,255,0);
            &:hover{
              background-color: rgba(255,255,255,0.4);
            }
          }
        }
      }
      // /deep/ .el-tabs__content .el-tab-pane{
      //   border-top: 0;
      // }
    }
  }

  .config-block{
    width: 0;
    transition:all .3s ease-in .1s;
    position: relative;
    &.active{
      width: 360px;
    }
    .config-block-box{
      padding: 30px;
      padding-top: 18px;
    }
    .config-block-title{
      font-size:16px;
      border-bottom: 1px solid #E8E8E8;
      height: 40px;
      line-height: 40px;
      margin-bottom: 30px;
    }
    .config-block-form{
      /deep/.form-item-wrap{
        width: 345px;
        .el-form-item{
          .el-form-item__label{
          }
          .el-form-item__content{

          }
        }
        >.el-form-item{
          display: flex;
          flex-wrap: wrap;
          .el-form-item__label{
            line-height: 1 !important;
          }
        }
      }
    }
  }
}

.ghost{
  width: 100%;
  height:40px;
  background-color: rgba(230,246,248,1);
  position: relative;
  line-height: 60px;
  list-style: none;
  font-size: 0;
  opacity: 1;
  &.ghost-box{
    .model-left-box{
      display: none;
    }
    .widget-view{
      display: none;
    }
  }
  .hover-box{
    display: none;
  }
  .jee-svg-icon{
    opacity: 0;
  }
  &:after{
    display: block;
    position: absolute;
    content: '';
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 1px;
    border-bottom: 1px dashed #1EC6DF;
  }
  &:before{
    display: block;
    position: absolute;
    background-color: rgba(230,246,248,1);
    content: '放在这里';
    left: 50%;
    top: 50%;
    height: 25px;
    line-height: 25px;
    transform: translate(-50%, -50%);
    padding: 0 30px;
    color: #1EC6DF;
    z-index: 1;
    font-size: 14px;
  }
}

.ghost_list{
  width: 51px;
  height:202px;
  // background-color: rgba(230,246,248,1);
  position: relative;
  line-height: 60px;
  list-style: none;
  font-size: 0;
  opacity: 1;
  &.ghost-box{
    .model-left-box{
      display: none;
    }
    .widget-view{
      display: none;
    }
  }
  .hover-box{
    display: none;
  }
  .jee-svg-icon{
    opacity: 0;
  }
  &:after{
    display: block;
    position: absolute;
    content: '';
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    height: 100%;
    width: 1px;
    // border-left: 1px dashed #1EC6DF;
  }
  &:before{
    content: '放在这里';
    display: block;
    position: absolute;
    // color: #1EC6DF;
    // background-color: rgba(230,246,248,1);
    left: 50%;
    top: 50%;
    padding: 10px 0;
    text-align: center;
    line-height: 1;
    text-align: center;
    transform: translate(-50%, -50%);
    z-index: 1;
    font-size: 14px;
  }

  .widget-view {
    display: none;
  }
}

.ghost_shadow{
  width: 50px;
  height: 100%;
  background-color: rgba(230,246,248,1);
  list-style: none;
  border: none;
  position: absolute;
  top: 0;
  left: 0;
  .ghost_shadow_box{
    position: relative;
    width: 100%;
    height: 100%;
    &:after{
      display: block;
      position: absolute;
      content: '';
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 1px;
      height:  100%;
      border-left: 1px solid #1EC6DF;
    }
    &:before{
      display: block;
      position: absolute;
      background-color: rgba(230,246,248,1);
      content: '放在这里';
      left: 50%;
      top: 50%;
      width: 25px;
      text-align: center;
      transform: translate(-50%, -50%);
      color: #1EC6DF;
      z-index: 1;
      font-size: 14px;
    }
  }
}

.isNoShowGhost {
  .ghost{
    height: 0;
    opacity: 0;
  }
}

.isNoShowComponent {
  .ghost_list {
    opacity: 1;
  }
}
// 拖动对象（跟随鼠标）的样式
.dragging2 .model-left-box,
.dragging2 .widget-view {
  box-shadow: 0 0 10px rgba(0,0,0,0.3);
  background-color: #ffffff!important;
  border-radius: 4px;
}
.dragging2 .model-left-box,
.dragging2 .widget-view-box{
  background-color: #ffffff!important;
  .widget-view {
    box-shadow: none;
  }
}
</style>
<style lang="scss">
.column-model-main-container{
  .content-block-left{
    margin-right: 0;
    .model-left-label.widgetBr{
      .d-postcontent-preview.z-draggable-preview{
        >.el-form-item{
          display: flex;
          align-items: flex-start;
        }
        .content-wrap{
          flex-direction: column;
          .el-select{
            // margin-bottom: 20px;
            &:last-child{
              margin-bottom: 0;
            }
          }
          .el-input__suffix{
            right: 1px;
            top: 3px;
          }
          .el-input.el-input--suffix{
            height: 34px;
          }
          .el-input__inner{
            font-size: 14px;
            line-height: 34px;
            height: 34px;
          }
        }
      }
      .d-select-preview.z-draggable-preview{
        .el-input__suffix{
          right: 0px;
        }
      }
      .d-release-platform.d-checkbox-preview.z-draggable-preview:not(.d-checkbox-preview__horizontal){
        >.el-form-item{
          display: flex;
          align-items: flex-start !important;
          .el-form-item__label{
            // line-height: 25px;
          }
          .el-form-item__content{
            margin-top: -11px;
          }
        }
        .el-checkbox-group.z-checkbox-group{
          display: grid;
          grid-template-columns: 76px auto;
          padding-top: 0 !important;
          .el-checkbox{
            margin: 10px 0;
            margin-right: 20px;
          }
        }
      }
      .d-checkbox-preview.z-draggable-preview.d-checkbox-preview__horizontal{
        margin-top: 13px;
      }
    }
    .model-left-label:not(.widgetBr){
      .d-source-preview.z-draggable-preview{
        .source-wrap{
          display: flex;
          .el-autocomplete + .el-input{
            margin-top: 0 !important;
          }
        }
      }
      .d-checkbox-preview.z-draggable-preview.d-checkbox-preview__horizontal{
        padding: 10px 0;
      }
      .d-release-platform.d-checkbox-preview.z-draggable-preview{
        >.el-form-item{
          .el-form-item__content{
            // margin-top: 13px;
          }
        }
      }
    }
    // .model-left-box{
    //   &:hover{
    //     .widget-view{
    //       &:hover{
    //         .el-input__inner{
    //           background-color: #E8E8E8;
    //         }
    //       }
    //     }
    //   }
    //   &.active{
    //     .el-input__inner{
    //       background-color: #d5f4f8;
    //     }
    //     &:hover{
    //       .el-input__inner{
    //         background-color: #E8E8E8;
    //       }
    //     }
    //   }
    // }
    .widget-view{
      .el-input__inner{
        padding-left: 0;
      }
      &.active{
        .el-input__inner{
          // background-color: #d5f4f8;
        }
        &:hover{
          .el-input__inner{
            // background-color: #d5f4f8;
          }
        }
      }
      // &:hover{
      //   .el-input__inner{
      //     background-color: #E8E8E8;
      //   }
      // }
    }
    .d-multi-image-upload-preview.z-draggable-preview{
      .form-label{
        padding-left: 0;
      }
      .upload-item{
        align-items: center;
      }
    }
    .jee-multi-image-resource-upload-container{
      padding: 18px 0;
      .el-button.upload-image{
        // width: 78px;
        padding: 8px 15px;
        font-size: 12px;
      }
    }
    .d-radio-preview.z-draggable-preview{
      .el-form-item__content{
        .el-radio-group{
          .el-radio__inner{
            border: 1px solid #ccc;
          }
        }
      }
    }
    .d-document-preview.z-draggable-preview{
      .el-form-item{
        padding: 0;
      }
      .jee-video-upload-container{
        margin-right: 0;
      }
      .document-uploader{
        .el-upload{
          max-width: calc(100% - 2px);
          .el-upload-dragger{
            height: 150px;
            .text-wrap{
              .jee-svg-icon{
                padding-top: 48px;
              }
            }
          }
        }
      }
    }
    .d-textarea-preview.z-draggable-preview{
      .el-form-item__content{
        .el-textarea__inner{
          border: none;
        }
      }
    }
    .d-content-preview.d-ueditor-preview.z-draggable-preview{
      .edui-editor.edui-notadd{
        width: calc(100% - 2px) !important;
      }
    }
    .d-multi-image-upload-preview.z-draggable-preview{
      .el-form-item{
        .el-button.el-button--small{
          font-size: 12px;
          padding: 8px 15px;
        }
        padding: 0!important;
      }
    }
    .d-postcontent-preview{
      .el-select{
        margin-right: 0!important;
      }
    }
    .z-draggable-preview{
      .el-select-dropdown{
        border-radius: 4px!important;
      }
    }
    .d-radio-preview.z-draggable-preview{
      padding: 10px 0;
    }
  }
  .content-block-right{
    .d-title-preview.z-draggable-preview{
      .input-wrap{
        border: 1px solid #E8E8E8;
        background: #fff;
        .el-input__inner{
          border: none;
        }
      }
    }
  }
  .config-block-box{
    .el-form-item__label{
      font-weight: lighter !important;
    }
    .rule-item + .rule-item.is-length-limit{
      padding-top: 5px;
    }
    .el-input__inner{
      &::-webkit-input-placeholder {
        color: #999;
        font-weight: lighter;
      }
    }
  }
}
.system-model-newContent-container{
  .el-header{
    padding-bottom: 0 !important;
    .model-header-container.show-in-page{
      margin-bottom: 20px;
    }
    .model-header-container{
      .el-button--empty.el-button{
        background: #fff;
        &:focus{
          background: #fff;
        }
        &:hover{
          background: #1EC6DF;
        }
      }
    }
    .model-header-container:not(.show-in-page){
      background: #fff;
      padding-left: 20px;
      .el-col-offset-5{
        margin-left: 0;
      }
      .el-col-offset-5{
        margin-left: 0;
        padding-left: 0;
      }
    }
  }
}
</style>
