<template>
  <draggable
    v-model="value"
    v-bind="options"
    @add="handleWidgetAdd($event, 'Base')"
    @end="handleWidgetMoved($event, 'Base')"
    class="widget-form-list"
  >
    <!--循环行-->
    <template v-for="(row, rowIndex) in value">
      <div class="ghost-box">
        <!--判断是否合并-->
        <template v-if="row instanceof Array && row.length">
          <!--循环列-->
          <div class="model-left-box">
            <div class="model-left-container">
              <div class="model-left-label">
                <template v-for="(col, colIndex) in row">
                  <template v-for="(cell, cellIndex) in col">
                    <div class="widget-view" :key="cell.prop" @click="handleSelectWidget(rowIndex + ',' + colIndex + ',' + cellIndex, ModelType)" :class="{active: selectIndex === rowIndex + ',' + colIndex + ',' + cellIndex && selectTab === ModelType}">
                      <component :is="cell.preview" :index="cellIndex" :option="cell.value" :form="{[cell.value.name]: cell.value.defaultValue}" v-model="cell.value.defaultValue"
                                 :isValidator='false'></component>
                      <!-- 删除 -->
                      <jee-icon iconClass="guanbi" class="close" @click.stop="handleWidgetDelete(rowIndex + ',' + colIndex + ',' + cellIndex, ModelType)" v-if="cell.canDelete"/>
                      <!-- 向上 -->
                      <el-tooltip class="item" effect="light" content="向上挤" placement="top">
                        <jee-icon iconClass="xiangshangji" @click.stop="handleSplitWidget(rowIndex + ',' + colIndex + ',' + cellIndex, 'up', ModelType)"></jee-icon>
                      </el-tooltip>
                      <!-- 向下 -->
                      <el-tooltip class="item" effect="light" content="向下挤" placement="bottom">
                        <jee-icon iconClass="xiangxiaji" @click.stop="handleSplitWidget(rowIndex + ',' + colIndex + ',' + cellIndex, 'down', ModelType)"></jee-icon>
                      </el-tooltip>
                      <!-- 左右 -->
                      <el-tooltip class="item" :class="{'left': colIndex === 1, 'right': colIndex === 0}" effect="light" :content="colIndex === 0 ? '右移' : '左移'" placement="top">
                        <jee-icon iconClass="zuoyouyi" @click.stop="handleSplitWidget(rowIndex + ',' + colIndex + ',' + cellIndex, 'about', ModelType)"></jee-icon>
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
          <el-tabs type="card" class="tab-content" v-model="activeContent" editable @tab-remove="handleContentTabsRemove(rowIndex, ModelType, row.list.length)" @edit="handleContentTabsEdit" v-if="row.type === 'content'">
            <el-tab-pane :label="col.tabLabel" :name="col.tabName" :key="colIndex" v-for="(col, colIndex) in row.list">
              <div class="widget-view" :key="col.prop" :class="{active: selectIndex === rowIndex && selectTab === 'Content'}" @click="handleSelectWidget(rowIndex + ',' + colIndex, 'Content')">
                <component :is="col.preview" :index="colIndex" :option="col.value" :form="{[col.value.name]: col.value.defaultValue}" v-model="col.value.defaultValue"
                           :isValidator='false'></component>
              </div>
            </el-tab-pane>
          </el-tabs>
          <!--判断是否是文档 -->
          <el-tabs type="card" class="tab-document" closable @tab-remove="handleWidgetDelete(rowIndex, ModelType)" v-model="activeDocument" v-else-if="row.type === 'document'" :before-leave="documentChange">
            <el-tab-pane label="清除文档" name="close">
              <div class="tab-document-close" slot="label"><jee-icon iconClass="delete"></jee-icon>清除文档</div>
            </el-tab-pane>
            <el-tab-pane :label="row.name" :name="row.type">
              <div class="widget-view" :key="row.prop" :class="{active: selectIndex === rowIndex && selectTab === 'Document'}" @click="handleSelectWidget(rowIndex, ModelType)">
                <component :is="row.preview" :index="rowIndex" :option="row.value" :form="{[row.value.name]: row.value.defaultValue}" v-model="row.value.defaultValue"
                           :isValidator='false'></component>
              </div>
            </el-tab-pane>
          </el-tabs>
          <template v-else-if="row.type === 'modelName'">
            <div class="model-left-box" @click="handleSelectWidget(rowIndex, ModelType)" :class="{'active': selectIndex === rowIndex && selectTab === ModelType}">
              <div class="model-left-container">
                <div class="model-left-label">
                  <div class="model-left-name">
                    <el-form-item label="内容模型">
                      <div>{{row.value.defaultValue}}</div>
                    </el-form-item>
                  </div>
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="model-left-box" v-if="row.list === undefined" @click="handleSelectWidget(rowIndex, ModelType)" :class="{'active': selectIndex === rowIndex && selectTab === ModelType}">
              <div class="model-left-container">
                <div class="model-left-label">
                  <div class="widget-view" :key="row.prop" >
                    <component :is="row.preview" :index="rowIndex" :option="row.value" :form="{[row.value.name]: row.value.defaultValue}" v-model="row.value.defaultValue"
                               :isValidator='false'></component>
                    <!-- 删除 -->
                    <jee-icon iconClass="guanbi" class="close" v-if="row.canDelete" @click.stop="handleWidgetDelete(rowIndex, ModelType)"/>
                    <!-- 向上 -->
                    <el-tooltip class="item" effect="light" content="向上挤" placement="top">
                      <jee-icon iconClass="xiangshangji" @click.stop="handleMergeWidget(rowIndex, 'up', ModelType)"></jee-icon>
                    </el-tooltip>
                    <!-- 向下 -->
                    <el-tooltip class="item" effect="light" content="向下挤" placement="bottom">
                      <jee-icon iconClass="xiangxiaji" @click.stop="handleMergeWidget(rowIndex, 'down', ModelType)"></jee-icon>
                    </el-tooltip>
                  </div>
                </div>
              </div>
            </div>
            <template v-else>
              <div class="model-left-box">
                <div class="model-left-container">
                  <p class="model-left-title">{{row.name}}：</p>
                  <draggable
                    v-model="row.list"
                    v-bind="options4"
                    class="model-left-label flexwrap"
                  >
                    <template v-for="(col, colIndex) in row.list">
                      <div class="widget-view" :key="col.prop"  @click="handleSelectWidget(rowIndex + ',' + colIndex, ModelType)" :class="{active: selectIndexConfig === rowIndex + ',' + colIndex && selectTab === 'Base', flex50: row.type === 'fileUpload', w100: row.type !== 'fileUpload'}">
                        <component :is="col.preview" :index="colIndex" :option="col.value" :form="{[col.value.name]: col.value.defaultValue}" v-model="col.value.defaultValue"
                                   :isValidator='false'></component>
                        <!-- 删除 -->
                        <jee-icon iconClass="guanbi" class="close" @click.stop="handleWidgetDelete(rowIndex + ',' + colIndex, ModelType)" v-if="col.canDelete"/>
                      </div>
                    </template>
                  </draggable>
                </div>
              </div>
            </template>
          </template>
        </template>
      </div>
    </template>
  </draggable>
</template>

<script>
import draggable from 'vuedraggable'
import EditorComponents from '@/components/draggable/Editor/components'
import PreviewComponents from '@/components/draggable/Preview/components'
export default {
  name: 'ModelTemplate',
  components: {
    draggable,
    ...EditorComponents,
    ...PreviewComponents
  },
  props: {
    value: {
      default: () => {
        return []
      }, // 文本框内容
      type: Array
    },
    ModelType: {
      type: String,
      default: 'Base'
    },
    selectIndex: {
      type: String,
      default: ''
    },
    selectTab: {
      type: String,
      default: ''
    },
    options: {
      type: Object,
      default: {}
    },
    activeContent: {
      type: String,
      default: ''
    },
    activeDocument: {
      type: String,
      default: ''
    }
  },
  data () {
    return {}
  },
  created () {
  },
  methods: {
    handleContentTabsEdit (targetName, action) {
      this.$emit('handleContentTabsEdit', targetName, action)
    },
    handleWidgetAdd (e, tab) {
      this.$emit('handleWidgetAdd', e, tab)
    },
    handleWidgetMoved (e, tab) {
      this.$emit('handleWidgetMoved', e, tab)
    },
    handleSelectWidget (index, tab) {
      console.log('111122222')
      this.$emit('handleSelectWidget', index, tab)
    },
    handleWidgetDelete (index, tab) {
      this.$emit('handleWidgetDelete', index, tab)
    },
    handleSplitWidget (index, type, tab) {
      this.$emit('handleSplitWidget', index, type, tab)
    },
    handleContentTabsRemove (rowIndex, type, length) {
      this.$emit('handleContentTabsRemove', rowIndex, type, length)
    },
    handleMergeWidget (index, type, tab) {
      this.$emit('handleMergeWidget', index, type, tab)
    }
  }
}
</script>

<style scoped lang="scss">
  .content-block{
    flex: 1;
    background-color: #F0F0F0;
    padding-top: 20px;
    padding-bottom: 40px;
    overflow-x: overlay;
  }

  .content-block-box{
    width: 1200px;
    height: 100%;
    margin: 0 auto;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    .content-block-left{
      width: 775px;
      margin-right: 20px;
      .model-left-box{
        border: 1px solid #E8E8E8;
        border-radius: 4px;
        margin-bottom: 10px;
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
          background-color: rgba(213,244,248,1);
          border: 1px dashed #1EC6DF;
          .close{
            opacity: 1;
          }
          .item{
            display: block;
          }
        }
        .widget-view{
          padding: 0 30px;
        }

        .model-left-label{
          display: flex;
          &.flexwrap{
            flex-wrap: wrap;
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
          .model-left-name{
            padding: 0 30px;
            width: 100%;
            cursor: move;
          }
          /deep/ .el-form-item{
            align-items: center;
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
              .el-input__inner{
                border: none!important;
                /*padding-left: 0;*/
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
      .ghost-box:last-child{
        .widget-view{
          border-bottom: 1px solid #fff;
        }
      }
      .widget-view{
        border-left: 1px solid #fff;
        border-top: 1px solid #fff;
        border-right: 1px solid #fff;
        border-bottom: 1px solid #e8e8e8;
        .el-form-item{
          padding-left: 30px;
          padding-right: 30px;
        }
        &.active{
          background-color: rgba(213,244,248,1);
          border: 1px dashed #1EC6DF!important;
        }
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
        font-size: 22px;
        z-index: 1102;
        cursor: pointer;
      }
      &.active{
        background-color: rgba(213,244,248,1);
        border: 1px dashed #1EC6DF;
        .close, .xiangshangji, .xiangxiaji, .zuoyouyi{
          opacity: 1;
        }
        .item{
          display: block;
        }
      }
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
    }
    .config-block-title{
      font-size:16px;
      border-bottom: 1px solid #E8E8E8;
      height: 40px;
      line-height: 40px;
      margin-bottom: 10px;
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
    &.ghost-box{
      margin-bottom: 10px;
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
    width: 50px;
    height: 100%;
    background-color: rgba(230,246,248,1);
    position: relative;
    list-style: none;
    font-size: 0;
    &:after{
      display: block;
      position: absolute;
      content: '';
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 1px;
      height:  100%;
      border-bottom: 1px dashed #1EC6DF;
    }
    &:before{
      display: block;
      position: absolute;
      background-color: rgba(230,246,248,1);
      content: '放在这里';
      left: 50%;
      top: 50%;
      width: 25px;
      height: 100%;
      transform: translate(-50%, -50%);
      color: #1EC6DF;
      z-index: 1;
      font-size: 14px;
    }
  }
</style>
