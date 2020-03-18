<template>
  <section class="column-model-edit-container content-detail-container">
    <section class="content-wrap">
      <header v-if="headers.length >0&&!isQuote" :class="{isFullscreen: isFullscreen}">
        <div class="header-wrap">
          <handle-hearder @handleHead="handleHead"
            v-bind="{handleHeaders:handleHeaders,detail:detail}"></handle-hearder>
          <el-button class="full-screen" type="empty" size="small" @click="handleClickScreenFull">
            <jee-icon :iconClass="isFullscreen?'huanyuanhuabu':'quanping'"></jee-icon>
            {{$t(isFullscreen? 'global.cancelScreenFull':'global.screenFull')}}
          </el-button>
        </div>
      </header>
      <el-form
        label-suffix="："
        ref="form"
        v-loading="loading"
        :model="form"
      >
        <div class="content-block scrollbar">
          <div class="content-block-box">
            <div class="content-block-left">
              <!--循环行-->
              <template v-for="(row, rowIndex) in detail.formListBase">
                <div class="ghost-box">
                  <!--判断是否合并-->
                  <template v-if="row instanceof Array && row.length">
                    <!--循环列-->
                    <div class="model-left-box twoModels">
                      <div class="model-left-container ">
                        <div class="model-left-label widgetBr">
                          <template v-for="(col, colIndex) in row">
                            <template v-for="(cell, cellIndex) in col">
                              <div class="widget-view" v-if="cell.type === 'modelName'">
                                <el-form-item :label="cell.name">
                                  <div>{{cell.value.defaultValue}}</div>
                                </el-form-item>
                              </div>
                              <div class="widget-view edit" v-else :key="cell.prop">
                                <component :is="cell.preview" :index="cellIndex" :option="cell.value" :form="form" v-model="form[cell.value.name]"
                                           :isValidator='true' :getContentText="getContentText"></component>
                              </div>
                            </template>
                          </template>
                        </div>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <!--判断是否正文-->
                    <el-tabs type="card" v-model="activeContentTab" v-if="row.type === 'content'" @tab-click="handleClickContentTab" class="tab-content">
                      <el-tab-pane :label="col.tabLabel" :name="col.tabName" :key="colIndex" v-for="(col, colIndex) in row.list">
                        <div class="widget-view edit" :key="col.prop">
                          <component
                            :is="col.preview"
                            :index="colIndex"
                            :ref="col.tabName"
                            :option="col.value"
                            :form="form"
                            :editorOptions="{initialFrameHeight: 1200}"
                            v-model="form[col.value.name]"
                            :isValidator='false'
                          />
                        </div>
                      </el-tab-pane>
                    </el-tabs>
                    <!--判断是否是文档 -->
                    <el-tabs type="card" class="tab-document" v-model="activeDocument" v-else-if="row.type === 'document'" :before-leave="documentChange">
                      <el-tab-pane label="清除文档" name="close">
                        <div class="tab-document-close" slot="label"><jee-icon iconClass="delete"></jee-icon>清除文档</div>
                      </el-tab-pane>
                      <el-tab-pane :label="row.name" :name="row.type">
                        <div class="widget-view edit" :key="row.prop">
                          <component :is="row.preview" :index="rowIndex" :option="row.value" :form="form" v-model="form[row.value.name]"
                                     :isValidator='false' :isShowPdf="true"></component>
                        </div>
                      </el-tab-pane>
                    </el-tabs>
                    <template v-else>
                      <div class="model-left-box" v-if="row.list === undefined">
                        <div class="model-left-container">
                          <div class="model-left-label">
                            <div class="widget-view edit" :key="row.prop">
                              <el-form-item :label="row.name" v-if="row.type === 'modelName'">
                                <div>{{row.value.defaultValue}}</div>
                              </el-form-item>
                              <component v-else :is="row.preview" :index="rowIndex" :option="row.value" :form="form" v-model="form[row.value.name]"
                                         :isValidator='true' :getContentText="getContentText"></component>
                            </div>
                          </div>
                        </div>
                      </div>
                      <template v-else>
                        <div class="model-left-box">
                          <div class="model-left-container">
                            <p class="model-left-title">{{row.name}}：</p>
                            <div class="model-left-label flexwrap">
                              <template v-for="(col, colIndex) in row.list">
                                <div class="widget-view edit" :class="{flex50: row.type === 'fileUpload' || row.type === 'multiImageUpload', w100: row.type !== 'fileUpload' && row.type !== 'multiImageUpload'}" :key="col.prop">
                                  <component :is="col.preview" :index="colIndex" :option="col.value" :form="form" v-model="form[col.value.name]"
                                             :isValidator='true'></component>
                                </div>
                              </template>
                            </div>
                          </div>
                        </div>
                      </template>
                    </template>
                  </template>
                </div>
              </template>
            </div>
            <div class="content-block-right" v-show="detail.formListExtend && detail.formListExtend.length > 0">
              <template v-for="(item, index) in detail.formListExtend">
                <template v-if="item.type === 'modelName'">
                  <div class="ghost-box">
                    <div class="widget-view">
                      <el-form-item :label="item.name" style="padding: 15px 20px; margin-bottom: 0;">
                        <div>{{item.value.defaultValue}}</div>
                      </el-form-item>
                    </div>
                  </div>
                </template>
                <div class="ghost-box" v-else-if="item.list !== undefined">
                  <p class="model-right-title">{{item.name}}：</p>
                  <div class="widget-view model-right-list flexwrap edit">
                    <div v-for="(col, colIndex) in item.list" class="model-right-item" :key="col.prop" :class="{w140: item.type !== 'fileUpload'}">
                      <component :is="col.preview" :index="colIndex" :option="col.value" :form="form" v-model="form[col.value.name]"
                                 :isValidator='true'></component>
                    </div>
                  </div>
                </div>
                <div class="ghost-box" v-else>
                  <div class="widget-view edit" :key="item.prop">
                    <component :is="item.preview" :index="index" :option="item.value" :form="form" v-model="form[item.value.name]"
                               :isValidator='true' :getContentText="getContentText"></component>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
        <!--<div class="content-form-item-wrap">-->
          <!--&lt;!&ndash; 标题正文区 &ndash;&gt;-->
          <!--<div class="title-content-wrap">-->
            <!--<div class="title-wrap">-->
              <!--&lt;!&ndash; 标题拖拽区 &ndash;&gt;-->
                <!--<template v-for="(item, index) in titleFormItems">-->
                  <!--<component :key="index" :is="item.preview"-->
                  <!--:index="index" :option="item.value"-->
                  <!--:form="form" v-model="form[item.value.name]"-->
                  <!--/>-->
                <!--</template>-->
            <!--</div>-->
            <!--<div class="content-wrap">-->
              <!--&lt;!&ndash; 正文拖拽区 &ndash;&gt;-->
                <!--<el-tabs type="card" v-model="activeContentTab" @tab-click="handleClickContentTab"-->
                <!--&gt;-->
                  <!--<template v-for="(item, index2) in contentFormItems">-->
                    <!--<el-tab-pane :label="item.tabLabel" :name="item.tabName" :key="index2">-->
                        <!--<component :is="item.preview" :index="index2" :ref="item.tabName" :key="index2" :option="item.value" :form="form" v-model="form[item.value.name]"></component>-->
                    <!--</el-tab-pane>-->
                  <!--</template>-->
                <!--</el-tabs>-->
            <!--</div>-->
          <!--</div>-->
          <!--&lt;!&ndash; 属性拖拽区 &ndash;&gt;-->
          <!--<div class="base-extend-wrap">-->
            <!--<el-collapse accordion value="Base" @change='handleChangeAttrPanel'>-->
              <!--<template v-for="(tab, index) in tabs">-->
                <!--<el-collapse-item :title="tab.label" :name="tab.name" :key="index">-->
                  <!--<el-form-item v-if="tab.name === 'Base'"-->
                  <!--class="column-form-item sm-height" prop='modelName' label='内容模型'>-->
                    <!--<span>{{form.modelName}}</span>-->
                  <!--</el-form-item>-->
                  <!--<template v-for="(item, index2) in arrtFormItems[tab.name]">-->
                    <!--<component :key="index2" :is="item.preview"-->
                      <!--:getContentText="getContentText"-->
                      <!--:index="index2" :option="item.value"-->
                      <!--:form="form" v-model="form[item.value.name]"-->
                    <!--/>-->
                  <!--</template>-->
                <!--</el-collapse-item>-->
              <!--</template>-->
            <!--</el-collapse>-->
          <!--</div>-->
        <!--</div>-->
      </el-form>
      <form-dialog
        ref="editDialog"
        v-bind="edit"
        @handleConfirm="handleConfirmEdit"
        @handleChangeCascader="handleChangeCascader"
      >
      </form-dialog>
      <sort-content ref="sortContent" :channelIds="[channelId]"
        @getSort="getSort" key="contentEdit"></sort-content>
      <edition ref="edition" @setEdition="setEdition"></edition>
      <operatio-records ref="operatio"></operatio-records>
      <relevant-contents ref="relevant"></relevant-contents>
      <el-dialog
        :title="examineObj.title"
        :visible.sync="examineObj.visible"
        width="30%"
        height="130"
        :show-close="examineObj.showClose">
          <div class="examineDialog"><jee-icon v-show="examineObj.icon !== ''" :iconClass="examineObj.icon"/>{{examineObj.text}}</div>
      </el-dialog>
    </section>
  </section>
</template>
<script>
import formDialog from '@/components/mixins/formDialog'
import baseHeader from '@/components/mixins/baseHeader'
import tableDialog from '@/components/mixins/tableDialog'
import PreviewComponents from '@/components/draggable/Preview/components'
import screenFull from '@/components/mixins/screenFull'
import edition from './detailCompoents/Edition'
import operatioRecords from './detailCompoents/operatioRecords'
import relevantContents from './detailCompoents/RelevantContents'
import mixins from './components/mixins'
import sortContent from './components/sortContent'
import handleHearder from './detailCompoents/HandleHearder'
import { mapGetters, mapActions } from 'vuex'
import { deepClone, arrayFlat } from '@/utils'

export default {
  name: 'contentDetail',
  components: {
    sortContent,
    edition,
    relevantContents,
    operatioRecords,
    handleHearder,
    ...PreviewComponents
  },
  mixins: [screenFull, mixins, formDialog, tableDialog, baseHeader],
  inject: ['removeTab'],
  provide () {
    return {
      changeColumn: this.getChannlWrokflow,
      fetchContentDetail: this.fetchContentDetail,
      changeCurrentTab: this.changeCurrentTab
    }
  },
  data () {
    var popverBtns = [
      {
        label: '置顶',
        type: 'Istop',
        disShow: this.$route.query.type === 'add',
        power: 'topContentAble',
        icon: 'zhiding',
        disabled: !this._checkPermission('/admin/contentext/top', 'POST')
      },
      {
        label: '复制',
        type: 'Copy',
        power: 'copyContentAble',
        icon: 'fuzhilaiyuanlangmu'
      },
      {
        label: '引用',
        type: 'Quote',
        power: 'quoteContentAble',
        icon: 'yinyong',
        disabled: !this._checkPermission('/admin/contentext/quote', 'POST')
      },
      {
        label: '排序',
        type: 'Sort',
        power: 'sortContentAble',
        icon: 'paixu1',
        disabled: !this._checkPermission('/admin/contentext/sort', 'POST')
      },
      {
        label: '相关内容',
        type: 'Relevant',
        power: 'editContentAble',
        icon: 'neirongguanli'
      },
      {
        name: '7',
        label: '版本',
        power: 'editContentAble',
        icon: 'banben',
        disabled: false
      },
      {
        name: '8',
        label: '操作记录',
        icon: 'caozuojilu',
        disabled: false
      },
      {
        name: '14',
        label: '归档',
        power: 'fileContentAble',
        icon: 'guidang',
        disabled: !this._checkPermission('/admin/contentext/status', 'POST')
      },
      {
        name: '16',
        label: '出档',
        power: 'fileContentAble',
        icon: 'chudang',
        disabled: !this._checkPermission('/admin/contentext/file', 'POST')
      }
    ]
    return {
      loading: false,
      form: {},
      detail: {
        formListExtend: []
      },
      contentId: '',
      channelId: '',
      hasWorkflow: false,
      tabs: [
        {
          label: '基本属性',
          name: 'Base'
        },
        {
          label: '扩展设置',
          name: 'Extend'
        }
      ],
      screenFullElement: '.content-wrap',
      headers: [],
      activeContentTab: '',
      activeDocument: 'document',
      popverBtns: popverBtns,
      bttons: [
        {
          name: '1',
          label: '存为初稿',
          icon: 'iconbaocun',
          power: 'editContentAble',
          disabled: !this._checkPermission('/admin/contentext', 'PUT')
        },
        {
          name: '3',
          label: '存为草稿',
          power: 'editContentAble',
          icon: 'cunweicaogao',
          disabled: !this._checkPermission('/admin/contentext', 'PUT')
        },
        {
          name: '2',
          label: '发布',
          power: 'publishContentAble',
          icon: 'fabu',
          disabled: !this._checkPermission('/admin/contentext', 'PUT')
        },
        {
          name: '4',
          label: '待发布',
          power: 'editContentAble',
          icon: 'daifabu',
          disabled: !this._checkPermission('/admin/contentext', 'PUT')
        },
        {
          name: '5',
          label: '预览',
          icon: 'yulang',
          disabled: false
        },
        {
          name: '6',
          label: '浏览',
          icon: 'liulan',
          disabled: false
        },
        {
          name: '7',
          label: '版本',
          power: 'editContentAble',
          icon: 'banben',
          disabled: false
        },
        {
          name: '8',
          label: '操作记录',
          icon: 'caozuojilu',
          disabled: false
        },
        {
          name: '11',
          label: '强制发布',
          power: 'publishContentAble',
          icon: 'fabu',
          disabled: !this._checkPermission('/admin/contentext', 'PUT')
        },
        {
          name: '12',
          label: '提交审核',
          power: 'editContentAble',
          icon: 'shenhe',
          disabled: !this._checkPermission('/admin/contentext', 'PUT')
        },
        {
          name: '13',
          label: '下线',
          power: 'publishContentAble',
          icon: 'xiaxian',
          disabled: !this._checkPermission('/admin/contentext/status', 'POST')
        },
        {
          name: '14',
          label: '归档',
          power: 'fileContentAble',
          icon: 'guidang',
          disabled: !this._checkPermission('/admin/contentext/status', 'POST')
        },
        {
          name: '15',
          label: '删除',
          power: 'deleteContentAble',
          icon: 'delete',
          disabled: !this._checkPermission('/admin/contentext', 'DELETE')
        },
        {
          name: '16',
          label: '出档',
          power: 'fileContentAble',
          icon: 'chudang',
          disabled: !this._checkPermission('/admin/contentext/file', 'POST')
        },
        {
          name: '17',
          label: '撤回(撤回后为初稿状态)',
          power: 'editContentAble',
          icon: 'huanyuan',
          disabled: !this._checkPermission('/admin/contentext', 'PUT')
        }
      ],
      timer: null,
      isQuote: false,
      isCited: false,
      labelWidth: 'auto',
      excludeList: ['imageUpload', 'singleImage', 'audioUpload', 'videoUpload', 'fileUpload'], // 多个模型合并到一行
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
      }, // 默认模型名称
      examineObj: {
        title: '',
        icon: '',
        text: '',
        visible: false,
        showClose: false,
        handleClose: function () {}
      }, // 审核提示窗信息
      handleHeaders: [
        {
          text: '保存',
          key: 'dropdown',
          icon: 'baocun',
          active: false,
          showHandle: true,
          options: [
            {
              name: '1',
              label: '存为初稿',
              icon: 'baocun',
              power: 'editContentAble',
              disabled: !this._checkPermission('/admin/contentext', 'PUT')
            },
            {
              name: '3',
              label: '存为草稿',
              power: 'editContentAble',
              icon: 'cunweicaogao',
              disabled: !this._checkPermission('/admin/contentext', 'PUT')
            }
          ]
        },
        {
          key: 'link',
          showHandle: true,
          options: [
            {
              name: '17',
              label: '撤回(撤回后为初稿状态)',
              power: 'editContentAble',
              icon: 'huanyuan',
              disabled: !this._checkPermission('/admin/contentext', 'PUT')
            },
            {
              name: '2',
              label: '发布',
              power: 'publishContentAble',
              icon: 'fabu',
              disabled: !this._checkPermission('/admin/contentext', 'PUT')
            },
            {
              name: '12',
              label: '提交审核',
              power: 'editContentAble',
              icon: 'shenhe',
              disabled: !this._checkPermission('/admin/contentext', 'PUT')
            },
            {
              name: '11',
              label: '强制发布',
              power: 'publishContentAble',
              icon: 'fabu',
              disabled: !this._checkPermission('/admin/contentext', 'PUT')
            },
            {
              name: '13',
              label: '下线',
              power: 'publishContentAble',
              icon: 'xiaxian',
              disabled: !this._checkPermission('/admin/contentext/status', 'POST')
            }
          ]
        },
        {
          text: '预览',
          key: 'dropdown',
          icon: 'yulang',
          showHandle: true,
          disShow: this.$route.query.type === 'add',
          active: false,
          options: [
            {
              name: '5',
              label: '预览',
              icon: 'yulang',
              disabled: false
            },
            {
              name: '6',
              label: '浏览',
              icon: 'liulan',
              disabled: false
            }
          ]
        },
        {
          text: '设置类型',
          type: 'content',
          key: 'dropdown',
          showHandle: true,
          disShow: this.$route.query.type === 'add',
          active: false,
          icon: 'shezhileixing',
          options: []
        },
        {
          text: '推送',
          key: 'dropdown',
          active: false,
          showHandle: true,
          disShow: this.$route.query.type === 'add',
          icon: 'icontuisong',
          options: [
            {
              label: '推送到站群',
              type: 'Pushstation',
              power: 'sitePushContentAble',
              icon: 'tuisongdaozhanqun',
              disabled: !this._checkPermission('/admin/content/push/sites', 'PUT')
            },
            {
              label: '推送到微信',
              type: 'Pushweixin',
              power: 'wechatPushContentAble',
              icon: 'tuisongdaoweixin',
              disabled: !this._checkPermission('/admin/contentext/push', 'POST')
            },
            {
              label: '推送到微博',
              type: 'Pushweibo',
              power: 'weiboPushContentAble',
              icon: 'tuijiandaoweibo',
              disabled: !this._checkPermission('/admin/weiboarticlepush', 'POST')
            }
          ]
        },
        {
          key: 'link',
          showHandle: true,
          options: [
            {
              name: '15',
              label: '删除',
              power: 'deleteContentAble',
              icon: 'delete',
              disabled: !this._checkPermission('/admin/contentext', 'DELETE')
            }
          ]
        },
        {
          text: '更多',
          key: 'dropdown',
          showHandle: true,
          disShow: this.$route.query.type === 'add',
          active: false,
          options: popverBtns
        }
      ]
    }
  },
  computed: {
    ...mapGetters(['siteExtendConfig']),
    contentAutoSave () {
      try {
        return this.siteExtendConfig.cfg.contentAutoSave
      } catch (error) {
        return '0'
      }
    },
    contentCommitAllowUpdate () {
      let { contentCommitAllowUpdate } = this.siteExtendConfig.cfg
      return contentCommitAllowUpdate
    },
    titleFormItems () {
      let formItems = []
      if (this.detail && this.detail.renderingField) {
        formItems = this.detail.renderingField.formListTitle || []
      }
      return formItems.sort((a, b) => a.index - b.index)
    },
    contentFormItems () {
      let formItems = []
      if (this.detail && this.detail.renderingField) {
        formItems = this.detail.renderingField.formListContent || []
      }
      return formItems.sort((a, b) => a.index - b.index)
    },
    baseFormItems () {
      let formItems = []
      if (this.detail && this.detail.renderingField) {
        formItems = this.detail.renderingField.formListBase || []
      }
      return formItems.sort((a, b) => a.index - b.index)
    },
    extendFormItems () {
      let formItems = []
      if (this.detail && this.detail.renderingField) {
        formItems = this.detail.renderingField.formListExtend || []
      }
      return formItems.sort((a, b) => a.index - b.index)
    },
    arrtFormItems () {
      return {
        Base: this.baseFormItems,
        Extend: this.extendFormItems
      }
    },
    formItems () {
      // return [...this.titleFormItems, ...this.contentFormItems, ...this.baseFormItems, ...this.extendFormItems]
      return [...this.detail.renderingField.formListBase, ...this.detail.renderingField.formListExtend]
    },
    getFormData () {
      let data = {
        json: {}
      }
      Object.keys(this.form).forEach(d => {
        const item = arrayFlat(this.formItems).find(f => f.value.name === d)
        if (item) {
          if (!item.isCustom) data[d] = this.form[d]
          else data.json[d] = this.form[d]
        } else {
          data[d] = this.form[d]
        }
      })
      return data
    }
  },
  watch: {
    contentAutoSave () {
      this.handleAutoSave()
    },
    isQuote (newVal) {
      this.isQuote = newVal
    },
    detail: {
      deep: true,
      handler (newData) {
        if (newData) {
          const { id, dataField, renderingField, banJson } = newData
          let detailForm = Object.assign({}, { id }, dataField, this.form, { banJson })
          // if(dataField){
          //   {}, { id }, this.form
          // }
          const fieldKeys = Object.keys(renderingField || {})
          // if (this.$route.query.type === 'link' || this.$route.query.type === 'Link') {
          //   this.channelId = dataField.channelId
          // }
          fieldKeys.forEach(field => {
            const keys = renderingField[field]
            Object.values(keys).forEach(item => {
              let itemName = ''
              let itemValue = ''
              if (item instanceof Array && item.length) {
                // 循环第一层
                item.forEach(d => {
                  itemName = d[0].value.name
                  itemValue = d[0].value.defaultValue
                })
              } else {
                if (item.list) {
                  // 判断如果有list，则循环list
                  item.list.forEach(d => {
                    itemName = d.value.name
                    itemValue = d.value.defaultValue
                  })
                } else {
                  itemName = item.value.name
                  itemValue = item.value.defaultValue
                }
              }
              if (!(itemName in detailForm)) {
                detailForm[itemName] = itemValue
              }
            })
          })
          if ('channelId' in detailForm && this.$route.query.type === 'add') {
            detailForm.channelId = Number(this.channelId)
          }
          this.form = detailForm
        }
      }
    }
  },
  methods: {
    ...mapActions('config', ['FetchSiteExtentConfig']),
    handleHead (data) {
      if (data.name) {
        this.handleHeaderButton(data)
      } else if (data.type) {
        this.handleEvent(data.type, data)
      }
    },
    // 阻止文档tabs切换
    documentChange (activeName, oldActiveName) {
      if (activeName === 'close') {
        this.detail.formListBase.forEach(d => {
          if (d.type === 'document') {
            this.form[d.value.name] = []
          }
        })
        return false
      }
    },
    handleAutoSave () {
      const { type } = this.$route.query
      if (type === 'add' && this.contentAutoSave === '1') {
        if (!this.timer) {
          this.timer = setInterval(() => {
            this.$refs.form.validate(valid => {
              if (valid) {
                this.getFormData.type = 1
                this.$request.fetchContentUpdate(this.getFormData).then(res => {
                  if (res.code === 200) {
                    this._messageSuccess('autoSave')
                  }
                })
              }
            })
          }, 10000)
        }
      } else {
        this.handleClearInterval()
      }
    },
    getSort (status) {
      if (status) {
        this.fetchContentDetail()
      }
    },
    setEdition (status) {
      if (status) {
        this.fetchContentDetail()
      }
    },
    setDefaultContentTab () {
      try {
        this.detail.formListBase.forEach(d => {
          if (d.type === 'content') {
            this.activeContentTab = d.list[0].tabName
          }
        })
      } catch (error) {}
    },
    handleClickContentTab (tab, e) {
      this.activeContentTab = tab.name
    },
    // 解决扩展设置的label位置问题
    handleChangeAttrPanel () {
      this.labelWidth = ''
      this.$nextTick(() => {
        this.labelWidth = 'auto'
      })
    },
    // 获取当前正文文本内容
    getContentText () {
      try {
        // console.log(this.$refs[this.activeContentTab][0].editor.getText())
        return this.filterHtml(this.$refs[this.activeContentTab][0].value)
      } catch (error) {
        return ''
      }
    },
    filterHtml (str) {
      str = str.replace(/<\/?[^>]*>/g, '') // 去除HTML tag
      str = str.replace(/[ | ]*\n/g, '\n') // 去除行尾空白
      str = str.replace(/\n[\s| | ]*\r/g, '\n') // 去除多余空行
      str = str.replace(/&nbsp;/ig, '')// 去掉&nbsp;
      return str
    },
    setForm () {
      let that = this
      if (this.detail) {
        const { id, modelName, dataField, modelId } = this.detail
        let detailForm = Object.assign({}, { id, modelName, modelId }, dataField)

        if (this.$route.query.type === 'link' || this.$route.query.type === 'Link') {
          this.channelId = dataField.channelId
          this.getChannlWrokflow(dataField.channelId)
        }
        if ('channelId' in detailForm && this.$route.query.type === 'add') {
          detailForm.channelId = Number(this.channelId)
        }
        this.form = detailForm
        this.getContentBtn(this.detail, that)
      }
    },
    // 获取详情
    fetchContentDetail () {
      this.loading = true
      this.$request.fetchContentDetail(this.contentId).then(res => {
        if (res.code === 200) {
          this.detail = Object.assign({}, res.data)
          this.modelNameObj.value.defaultValue = this.detail.modelName
          const { formListBase, formListExtend } = res.data.renderingField || {}
          if (formListBase instanceof Array && formListBase.length) {
            this.detail.formListBase = this.detailResetData(formListBase)
          }
          if (formListExtend instanceof Array && formListExtend.length) {
            this.detail.formListExtend = this.detailResetData(formListExtend)
          } else {
            this.detail.formListExtend = []
          }
          // 判断下是否字段模型名称
          let tempBaseList = arrayFlat(this.detail.formListBase)
          let tempExtend = arrayFlat(this.detail.formListExtend)
          if (tempBaseList.find(d => d.type === 'modelName') === undefined && tempExtend.find(d => d.type === 'modelName') === undefined) {
            this.detail.formListBase = [this.modelNameObj].concat(this.detail.formListBase)
          }
          this.setForm()
          this.setDefaultContentTab()
        }
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    // 表格弹窗数据回调
    fetchTableDialogCallBack (res) {
      if (res.code === 200) {
        this.tablelist.data = res.data.content.map(v => {
          return v.cmsContent
        })
        this.tablelist.totalCount = res.data.totalElements
      }
    },
    // 保存
    handleSubmit (e, btn) {
      this.$refs.form.validate(valid => {
        if (valid) {
          let params = this.getFormData
          if (params.json.orgid && params.json.orgid instanceof Array && params.json.orgid.length > 0) {
            params.json.orgid = params.json.orgid[params.json.orgid.legnth - 1]
          }
          this.loading = true
          console.log(params)
          this.$request.fetchContentUpdate(params).then(res => {
            if (res.code === 200) {
              if (res.data === 10) {
                let _this = this
                this.examineObj = {
                  title: '',
                  icon: '',
                  text: '智能审核中，请稍后...',
                  visible: true,
                  showClose: false
                }
                setTimeout(function () {
                  _this.examineObj.visible = false
                  _this.removeTab(_this.$route.fullPath)
                  _this.$routerLink('/content/index', 'audit')
                }, 2000)
              } else {
                this._messageSuccess('save')
                this.removeTab(this.$route.fullPath)
                this.$routerLink('/content/index', 'list')
              }
            }
            this.loading = false
          }).catch(() => {
            this.loading = false
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    // 头部按钮点击
    handleHeaderButton (item) {
      const { releaseTime, offlineTime } = this.form
      if (this.getFormData.force === true) {
        delete this.getFormData.force
      }
      switch (item.name) {
        case '1':
          this.getFormData.type = 2
          this.handleSubmit()
          break
        case '2':
          this.getFormData.type = 5
          if (offlineTime) {
            if (releaseTime && offlineTime < releaseTime) {
              this.$message.error('下线时间小于发布时间时不能发布')
              break
            } else if (new Date(offlineTime) < new Date()) {
              this.$message.error('下线时间小于当前时间时不能发布')
              break
            }
          }
          this.handleSubmit()
          break
        case '3':
          this.getFormData.type = 1
          this.handleSubmit()
          break
        case '4':
          this.getFormData.type = 4
          this.handleSubmit()
          break
        case '5':
          // 预览
          if (this.detail.previewUrl) {
            window.open(this.detail.previewUrl)
          } else {
            this.$message('没有预览地址')
          }
          break
        case '6':
          // 浏览
          if (this.detail.url) {
            window.open(this.detail.url)
          } else {
            this.$message('没有浏览地址')
          }
          break
        case '7':
          this.$refs['edition'].showTheDialog(item)
          break
        case '8':
          this.$refs['operatio'].showTheDialog(this.contentId)
          break
        case '11':
          console.log('违禁')
          this.getFormData.type = 5
          this.getFormData.force = true
          if (offlineTime) {
            if (releaseTime && offlineTime < releaseTime) {
              this.$message.error('下线时间小于发布时间时不能发布')
              break
            } else if (new Date(offlineTime) < new Date()) {
              this.$message.error('下线时间小于当前时间时不能发布')
              break
            }
          }
          this.handleSubmit()
          break
        case '12':
          // 审核
          this.getFormData.type = 3
          this.$refs.form.validate(valid => {
            if (valid) {
              this.loading = true
              this.$request.fetchContentSubmit(this.getFormData).then(res => {
                this.$restBack(res, () => {
                  this.removeTab(this.$route.fullPath)
                  this.$routerLink('/content/index', 'list')
                }, '提交成功')
                this.loading = false
              }).catch(() => {
                this.loading = false
              })
            } else {
              console.log('error submit!!')
              return false
            }
          })
          break
        case '13':
          // 下线
          this.changeStatus([this.form.id], 7)
          // this.getFormData.type = 7
          // this.handleSubmit()
          break
        case '14':
          // 归档
          this.handleEventFile([this.form.id])
          break
        case '15':
          // 删除
          this.handleEventDelete([this.form.id])
          break
        case '16':
          // 出档
          this.handleEventFileout([this.form.id])
          break
        case '17':
          // 撤回
          this.$request.fetchContentTaskRevoke({ contentId: this.form.id }).then(res => {
            this.$restBack(res, () => {
              this.fetchContentDetail()
            })
          })
          break
        default:
          break
      }
    },
    // 右侧弹出层
    handleEvent (type, btn) {
      this.handleEventAll([this.form.id], btn)
    },
    // 右侧按钮点击
    handleEventRelevant (data, btn) {
      this.$refs['relevant'].showTheDialog(this.contentTree, data[0])
    },
    // handleEventBrowse (data, btn) {
    //   // var ids = data
    // },
    // 是否工作流
    getChannlWrokflow (id) {
      let params = {
        id: id
      }
      this.$request.fetchChannelWorkflowBeing(params).then((res) => {
        if (res.code === 200) {
          this.hasWorkflow = res.data
          this.setHeaderBths(res.data)
        }
      })
    },
    getContentBtn (detail) {
      this.$request.fetchContentTypePage().then(res => {
        if (res.code === 200) {
          var arr = res.data.content
          var btns = []
          if (detail.contentTypes instanceof Array) {
            var obj = {}
            arr.forEach(v => {
              obj = detail.contentTypes.find(d => d.id === v.id)
              if (obj) {
                btns.push({
                  label: '取消' + v.typeName,
                  id: v.id,
                  // disabled: !obj.operation,
                  type: 'Custom',
                  addType: 'cancel',
                  power: 'typeContentAble',
                  logoId: v.logoId,
                  img: v.logoResource ? this.$getPath(v.logoResource.url) : ''
                })
              } else if (!obj) {
                btns.push({
                  label: v.typeName,
                  id: v.id,
                  power: 'typeContentAble',
                  type: 'Custom',
                  addType: 'o',
                  logoId: v.logoId,
                  img: v.logoResource ? this.$getPath(v.logoResource.url) : ''
                })
              }
            })
            let arr1 = btns.map(t => {
              if (this.form.status === 3 || this.hasWorkflow) {
                if (this.hasWorkflow && detail.purview.editContentAble && t.power === 'editContentAble') {
                  t.disabled = false
                } else {
                  t.disabled = true
                }
              }
              return t
            })
            this.$set(this.handleHeaders.find(v => v.type === 'content'), 'options', arr1)
          }
          if (this.$route.query.type !== 'add') {
            if (this.isCited) {
              this.popverBtns.find(d => d.power === 'quoteContentAble').label = '取消引用'
              this.popverBtns.find(d => d.power === 'quoteContentAble').type = 'Dereference'
              this.popverBtns.find(d => d.power === 'quoteContentAble').icon = 'quxiaoyinyong'
            } else {
              this.popverBtns.find(d => d.power === 'quoteContentAble').label = '引用'
              this.popverBtns.find(d => d.power === 'quoteContentAble').type = 'Quote'
              this.popverBtns.find(d => d.power === 'quoteContentAble').icon = 'yinyong'
            }
            if (detail.top) {
              this.popverBtns.find(d => d.power === 'topContentAble').label = '取消置顶'
              this.popverBtns.find(d => d.power === 'topContentAble').type = 'Notop'
              this.popverBtns.find(d => d.power === 'topContentAble').icon = 'zhiding'
            } else if (!detail.top) {
              this.popverBtns.find(d => d.power === 'topContentAble').label = '置顶'
              this.popverBtns.find(d => d.power === 'topContentAble').type = 'Istop'
              this.popverBtns.find(d => d.power === 'topContentAble').icon = 'zhiding'
            }
          }
        }
      })
    },
    // 头部按钮显示
    async setHeaderBths (status) {
      // 内容状态(1:草稿; 2-初稿 3:流转中; 4:已审核; 5:已发布; 6:驳回; 7:下线 8-归档; 9:暂存; 10: 智能审核中; 11: 违禁内容; 12: 审核失败)
      let type = parseInt(this.form.status) || 1
      let arr = []
      let btns = []
      let showHandle = -1
      if (type === 8) {
        arr = ['16']
        showHandle = 6
      } else if (type === 5) {
        let str = status ? '12,1,3,13,14,15,5,6,7,8' : '1,2,3,13,14,15,5,6,7,8'
        let str2 = '13,14,15,5,6,7,8'
        arr = this.contentCommitAllowUpdate === '1' ? str.split(',') : str2.split(',')
      } else if (type === 10) {
        arr = ['15']
        showHandle = 5
      } else if (type === 11 || type === 12) {
        const res = await this.$request.fetchContentForceButton({ contentId: this.contentId })
        if (res.code === 200) {
          if (res.data) {
            if (status) {
              arr = '1,3,12,11,14,15,5,7,8'.split(',')
            } else {
              arr = '1,3,2,11,14,15,5,7,8'.split(',')
              // this.showContentBtn(status, arr)
            }
          } else {
            if (status) {
              arr = '1,3,12,14,15,5,7,8'.split(',')
            } else {
              arr = '1,3,2,14,15,5,7,8'.split(',')
            }
          }
          this.showContentBtn(status, arr, showHandle)
        }
      } else {
        if (status) {
        // 工作流
          btns = ['12,1,3,14,15', '12,1,3,14,15', '17', '12,1,3,14,15', '12,1,3,13,14,15', '12,1,3,14,15', '12,1,2,3,14,15', '16']
          arr = (btns[type - 1] + ',5,7,8').split(',')
        } else {
        // 非工作流
          btns = ['1,3,2,14,15', '1,3,2,14,15', '', '1,3,2,14,15', '1,3,2,13,14,15', '', '1,3,2,14,15', '16']
          arr = (btns[type - 1] + ',5,7,8').split(',')
        }
      }
      if (type !== 11 && type !== 12) {
        this.showContentBtn(status, arr, showHandle)
      }
    },
    showContentBtn (status, arr, showHandle) {
      console.log('是否工作流：' + status)
      this.headers = arr.map(v => {
        let t = this.bttons.find(d => d.name === v)
        return t
      })
      // revokeSupport 内容是否可撤回
      if (!this.detail.revokeSupport && this.headers.find(d => d.name === '17')) {
        this.headers.find(d => d.name === '17').disabled = true
      } else if (this.headers.find(d => d.name === '17')) {
        this.headers.find(d => d.name === '17').disabled = false
      }
      if (this.detail.actions instanceof Array && this.detail.actions.length > 0) {
        let actions = this.detail.actions.map(v => {
          v.label = v.actionName
          return v
        })
        this.headers.unshift(actions)
      }
      if (status && this.headers.find(d => d.name === '1')) {
        this.headers.find(d => d.name === '1').disabled = false
      }
      this.filterDisBtn(this.headers, showHandle)
    },
    filterDisBtn (data, showHandle) {
      let arr = this.handleHeaders.map((v, i) => {
        v.options = v.options.map(t => {
          if (t.name) {
            let obj = data.find(d => d.name === t.name)
            if (obj) {
              t.disShow = false
              return obj
            } else {
              t.disShow = true
              return t
            }
          } else {
            if (showHandle === i) {
              t.disShow = true
            } else {
              t.disShow = false
            }
            return t
          }
        })
        if (showHandle !== -1 && showHandle !== i) {
          v.showHandle = false
        } else {
          v.showHandle = true
        }
        return v
      })
      this.$set(this, 'handleHeaders', arr)
    },
    getFormDatas (status) {
      const { id, channelId, isQuote, type, isCited } = this.$route.query
      this.isCited = !!isCited
      this.isQuote = isQuote === 'true' || isQuote === true
      if (type === 'add' && channelId) {
        this.channelId = channelId
        this.getChannlWrokflow(channelId)
        this.fetchContentList(true)
      }
      if ((id && id !== String(this.contentId)) || status) {
        this.contentId = id ? Number(id) : ''
        this.fetchContentDetail()
      }
      if (type !== 'add') {
        this.fetchContentList()
      }
    },
    detailResetData (list) {
      let data = deepClone(list)
      let excludeList = ['content', ...this.excludeList]
      // 去除多余数组
      // 返回空数据[[]]时会报异常
      let RowList = data.filter(d => d[0].length > 0).map((d) => {
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
      // console.log('RowList: ')
      // console.log(RowList)
      return RowList
    },
    handleClearInterval () {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    },
    changeCurrentTab () {}
  },
  mounted () {
    this.FetchSiteExtentConfig()
    this.handleAutoSave()
    this.$nextTick(() => {
      const { id } = this.$route.query
      this.getFormDatas()
      if (id) {
        this.FetchWechatInfoPage()
        this.GetOwnerTrees()
        this.FetchSiteExtentConfig(this.currentSiteId)
      }
    })
  },
  activated () {
    this.detail = {}
    this.contentId = ''
    this.getFormDatas()
    this.handleAutoSave()
  },
  deactivated () {
    this.handleClearInterval()
  },
  beforeDestroy () {
    // this.handleClearInterval()
  }
}
</script>
<style lang="scss">
@import '@/views/System/Model/detail.scss';
.ct-pover{
    padding: 0 !important;
    min-width: 135px !important;
    &__box{
      padding:8px 0;
    }
    &__item{
      padding: 0 12px !important;
      line-height: 28px;
      color: #666666 ;
      display: block !important;
      .jee-svg-icon{
          fill: #666;
          margin-right: 8px;
        }
      &:hover{
        background-color: #F3F3F3;
      }
    }
  }
.content-detail-container{
  background-color: #F1EFF2;

  .el-main{
    overflow-x: hidden;
  }
  .content-wrap{
    background-color: #ffffff;
    // height: 100%;
    // overflow-x: hidden;
    // overflow-y: overlay;
    >header{
      &.isFullscreen{
        background: #F1F0F0;
      }
      .header-wrap{
        background: #fff;
        height: 58px;
        width: 1164px;
        margin: 0 auto;
        box-sizing: border-box;
        display: flex;
        padding-left: 16px;
        align-items: center;
        border-radius: 4px;
        border: 1px solid #E8E8E8;
      }
      .full-screen{
        /*background-color: #F1F0F0;*/
        padding: 8px 20px;
      }
    }
    >.el-form{
      height: calc(100% - 60px);
      overflow-y: overlay;
    }
    .content-form-item-wrap{
      padding-top: 20px;
      display: flex;
      justify-content: center;
      .title-content-wrap{
        width: 900px;
        margin-right: 20px;
        .title-wrap{
          padding: 0 22px 0 16px;
          margin-bottom: 20px;
          border: 2px solid #e8e8e8;
          border-radius: 4px;
          .el-form-item{
            padding: 6px 0;
            .el-input{
              max-width: 100%;
              .el-input__inner{
                border: 0;
              }
            }
            .el-form-item__label-wrap{
              margin-left: 0!important;
            }
            .el-form-item__content{
              margin-left: 68px!important;
              .el-form-item__content{
                margin-left: 0!important;
              }
            }
          }
          :first-child .el-form-item{
            border-bottom: 1px solid #e8e8e8;
          }
        }
        .content-wrap{
          .ql-editor{
            min-height: 400px;
          }
        }
        .el-tabs{
          .el-tab-pane{
            border: 1px solid #e8e8e8;
            border-radius: 0 4px 4px 4px;
          }
        }
      }
      .base-extend-wrap{
        width: 360px;
        .column-form-item{
          margin: 0!important;
          padding: 5px 0;

        }
        .z-draggable-preview{
          >.el-form-item{
            padding: 5px 0;
            .el-form-item__error{
              position: relative;
              padding-top: 10px;
              line-height: 1;
            }
          }
        }
      }

      .el-collapse-item__wrap{
        overflow: visible;
      }

      .el-collapse{
        border-top: 0;
        .el-collapse-item{
          border: 1px solid #e8e8e8;
          border-radius: 4px;
          padding: 0 20px 30px;
          .el-collapse-item__header {
            border-bottom-color: transparent;
            height: 14px!important;
            font-size: 16px;
            font-weight: 600;
            padding: 30px 0 0;
            &.is-active{
              padding-bottom: 10px;
              border-bottom-color: #e8e8e8;
            }
            .el-collapse-item__arrow{
              font-size: 18px;
            }
          }
          .el-collapse-item__wrap{
            border-bottom: 0;
            .el-collapse-item__content{
              padding-bottom: 0;
              padding-top: 20px;
            }
          }
          & + .el-collapse-item{
            margin-top: 30px;
          }
        }
      }
      .el-picker-panel.el-popper{
        left: auto!important;
        right: 0;
      }
    }
  }
  .jee-multi-image-resource-upload-container .resource-upload-wrap {
    >div:last-of-type{
      .image-desc{
        margin-bottom: 0px;
      }
    }
  }
}

.content-detail-container .content-block-box{
  width: 1200px;
  height: 100%;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  padding-top: 20px;
  .content-block-left{
    width: 775px;
    margin-right: 20px;
    .d-sub-title-preview.z-draggable-preview{
      span.el-input__count-inner{
        padding-right: 0 !important;
      }
    }
    .model-left-label.flexwrap{
      padding: 0 30px;
      // justify-content: space-between;
      .widget-view.edit{
        padding: 0;
        margin-right: 50px;
        &:last-child{
          margin-right: 0;
        }
        &:nth-child(4n){
          margin-right: 0;
        }
      }
    }
    .d-multi-image-upload-preview.z-draggable-preview{
      .drag-wrap:not(.none-drag-wrap){
        display: flex;
        margin-top: 30px;
        padding-bottom: 20px;
        // margin-left: -75px;
      }
      .upload-item{
        // display: block;
      }
      p.form-label{
        flex-shrink: 0;
        padding-left: 0;
      }
      .image-desc-wrap{
        display: flex;
        margin-right: 49px;
        margin-top: 20px;
        padding-right: 0;
        margin-bottom: 0;
        &:last-child{
          margin-right: 0;
        }
        &:nth-child(2n){
          margin-right: 0;
        }
        &:first-child{
          margin-top: 0;
        }
        &:nth-child(2){
          margin-top: 0;
        }
        .el-textarea__inner{
          height: 140px;
          &:focus-within{
            border-color: #1EC6DF;
          }
        }
        .image-desc.el-textarea{
          width: 180px;
          margin-left: 10px;
          margin-top: 0;
        }
      }
    }
    .model-left-box{
      border: 1px solid #E8E8E8;
      border-radius: 4px;
      margin-bottom: 10px;
      background-color: #fff;
      font-size: 14px;
      color: #666;
      position: relative;
      // &:hover{
      //   border-color: #1bb2c9;
      // }
      .model-left-title{
        padding: 20px 20px 10px;
      }
      .xiangshangji, .xiangxiaji, .zuoyouyi{
        position: absolute;
        left: 50%;
        z-index: 1102;
        opacity: 0;
        cursor: pointer;
        font-size: 18px;
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
        top: 50%;
        transform: translate(-50%, -50%);
      }
      &.active{
        background-color: rgba(213,244,248,1);
        border: 1px dashed #1EC6DF;
        .close, .xiangshangji, .xiangxiaji, .zuoyouyi{
          opacity: 1;
        }
      }
      .widget-view{
        padding: 0 30px;
        &.active{
          background-color: rgba(213,244,248,1);
          border: 1px dashed #1EC6DF;
          .close, .xiangshangji, .xiangxiaji, .zuoyouyi{
            opacity: 1;
          }
        }
      }
      .model-left-label{
        display: flex;
        // align-items: center;
        position: relative;
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
            width: 140px;
            flex: inherit;
          }
          .flex50{
            min-width: 50%;
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
          }
          /deep/ .el-form-item__content{
            flex: 1;
            .el-input__inner,.el-textarea__inner{
              border: none!important;
              padding-left: 0;
            }
            .el-input{
              max-width: none;
              &.line .el-input__inner{
                border:1px solid #ddd !important;
                border-radius:4px;
              }
            }
          }
          /deep/ .el-dialog  .el-form-item{
            display: block;
            .el-form-item__content{
              flex: none;
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
        /deep/ .d-file-upload-preview{
          .el-form-item{
            /deep/ .el-form-item__content{
              .el-input__inner{
                border:1px solid #e8e8e8 !important;
              }
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
            margin-right: -28px;
            >.el-form-item{
              padding-bottom:2px;
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

    // 富文本组件标签页
    .tab-content.el-tabs.el-tabs--card{
      /deep/ .el-tabs__header .el-tabs__item{
        border-radius: 0;
        &:first-child{
          border-radius: 4px 0 0 0;
        }
        &:last-child{
          border-radius: 0 4px 0 0;
        }
        &.is-active{
          border-top-style: solid;
          border-top-width: 1px;
        }
      }
      // /deep/ .el-tabs__content .el-tab-pane{
      //   border-top: 0;
      // }
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
          .tab-document-close{
            .jee-svg-icon{
              margin-right:10px;
            }
          }
        }
      }
    }
  }
  .content-block-right{
    width: 370px;
    background-color: #fff;
    border: 1px solid #E8E8E8;
    .ghost-box{
      border-left: 1px solid #fff;
      border-top: 1px solid #fff;
      border-right: 1px solid #fff;
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
        border: 1px dashed #1EC6DF!important;
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
        &.d-address-preview,&.d-city-preview{
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
    }
    .model-right-title{
      height: 14px;
      line-height: 1;
      color: #666666;
      font-size: 14px;
      padding: 20px 30px 10px;
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
      font-size: 18px;
      z-index: 1102;
      cursor: pointer;
    }
    &.edit{
      cursor: auto;
      &:after{
        display: none;
      }
    }
  }
}
.column-model-edit-container.content-detail-container{
  .content-block-box{
    .content-block-left{
      .d-datetime-preview.z-draggable-preview{
        .el-date-picker.el-popper{
          left: 2px !important;
        }
        .el-input--suffix{
          span.el-input__prefix{
            left: -1px;
          }
        }
        .el-input__inner{
          padding-left: 30px !important;
        }
      }
      .model-left-box{
        &:hover{
          border-color: #ccc;
        }
        &:focus{
          border-color: #1EC6DF;
        }
        &:active{
          border-color: #1EC6DF;
        }
        &:focus-within{
          border-color: #1EC6DF;
        }
      }
      .d-title-preview{
        .el-form-item{
          .input-wrap{
            .btn-strong{
              padding-right: 10px;
            }
          }
          .el-input__inner{
            padding-right: 5px;
          }
          .el-input{
            .el-input__suffix{
              right: 5px;
            }
          }
          // .el-form-item__label{
          //   margin-right: -21px !important;
          // }
        }
      }
      // .d-input-preview.z-draggable-preview,.d-sub-title-preview.z-draggable-preview,.d-select-preview.z-draggable-preview,.d-datetime-preview.z-draggable-preview,.d-title-preview{
      //   .el-form-item__label{
      //     margin-right: -21px !important;
      //   }
      // }
      // .d-sub-title-preview.z-draggable-preview{
      //   .el-form-item__label{
      //     margin-right: -21px !important;
      //   }
      // }
      // .d-datetime-preview.z-draggable-preview{
      //   .el-form-item__label{
      //     margin-right: -12px !important;
      //   }
      // }
    }
    .content-block-right{
      .d-title-preview.z-draggable-preview{
        .el-form-item__content{
          .z-tip-form-item{
            padding-left: 20px;
          }
          .el-form-item__error{
            padding-left: 20px!important;
          }
        }
      }
    }
    .d-radio-preview.z-draggable-preview{
      padding: 10px 0;
      .el-form-item__content{
        .el-radio-group{
          .el-radio__inner{
            border: 1px solid #ccc;
          }
        }
        .el-radio__input.is-checked{
          .el-radio__inner{
            border-color: #1ec6df;
            background: #1ec6df;
          }
        }
      }
    }
  }
}
.column-model-edit-container.content-detail-container{
  .model-left-box.twoModels{
    .d-checkbox-preview.z-draggable-preview:not(.d-checkbox-preview__horizontal){
      >.el-form-item{
        display: flex;
        align-items: flex-start !important;
        .el-form-item__label{
          // line-height: 25px;
        }
      }
      .el-checkbox-group.z-checkbox-group{
        display: grid;
        grid-template-columns: 76px auto;
        .el-checkbox{
          margin: 10px 0;
          margin-right: 20px;
        }
      }
    }
    .d-postcontent-preview.z-draggable-preview{
      >.el-form-item{
        display: flex;
        align-items: flex-start;
      }
      .content-wrap{
        flex-direction: column;
        .el-select{
          margin-bottom: 20px;
          &:last-child{
            margin-bottom: 0;
          }
        }
        .el-input__suffix{
          right: 3px;
        }
      }
    }
    .d-select-preview.z-draggable-preview{
      .el-input__suffix{
        right: 3px;
      }
    }
  }
  .content-block-left{
    .d-title-preview.z-draggable-preview{
      .m-colorPicker{
        .colorBtn{
          >div{
            margin-left: 3px;
          }
        }
      }
    }
  }
}
</style>

<style lang="scss" scoped>

.z-draggable-preview{
  /deep/ .input-wrap{
    align-items: flex-start;
    .m-colorPicker{
      width: 40px;
      height: 40px;
      .colorBtn{
        top: 50%;
        transform: translate(0, -50%);
      }
    }
  }
  /deep/ .d-postcontent-preview{
    .el-select{
      margin-right: 0!important;
      .el-input__inner{
        padding-left: 0;
      }
    }
  }
  /deep/ .el-select-dropdown{
    border-radius: 4px!important;
  }
  /deep/ .el-form-item__error{
    position: static;
  }
}

.examineDialog{
  color: #333333;
  font-size: 14px;
  text-align: center;
  font-weight: bold;
  padding: 20px 0;
}

</style>
