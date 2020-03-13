import draggable from 'vuedraggable'
import EditorComponents from '@/components/draggable/Editor/components'
import PreviewComponents from '@/components/draggable/Preview/components'
import customConfigs from '@/components/draggable/Config/customConfigs'
import fastConfigs from '@/components/draggable/Config/fastConfigs'
import defaultConfigs from '@/components/draggable/Config/defaultConfigs'
import { deepClone, hasRepeatValue, randomWord, arrayFlat } from '@/utils'

export default {
  components: {
    draggable,
    ...EditorComponents,
    ...PreviewComponents
  },
  data () {
    return {
      modelId: '',
      modelName: '',
      loading: false,
      activePanels: ['1'],
      tabs: [
        {
          label: '基本信息',
          name: 'Base'
        },
        {
          label: '扩展设置',
          name: 'Extend'
        },
        {
          label: 'SEO设置',
          name: 'Seo'
        }
      ],
      currentTab: 'Base',
      options: {
        group: {
          name: 'widget',
          pull: 'clone',
          put: false
        },
        sort: false,
        forceFallback: true,
        filter: '.disable',
        ghostClass: 'ghost1',
        fallbackClass: true,
        chosenClass: 'chosen',
        dragClass: 'dragging'
      },
      options2: {
        group: 'widget',
        handle: '.widget-view, .widget-view-box',
        forceFallback: true,
        fallbackClass: 'ghost-fallback',
        ghostClass: 'ghost',
        animation: 100,
        dragClass: 'dragging2'
        // disabled: true
      },
      options3: {
        group: {
          name: 'widget',
          put: false
        },
        sort: false,
        forceFallback: true,
        filter: '.disable',
        ghostClass: 'ghost',
        chosenClass: 'chosen',
        dragClass: 'dragging'
      },
      options4: {
        group: 'widget_list',
        forceFallback: true,
        fallbackClass: true,
        ghostClass: 'ghost_list',
        animation: 100,
        dragClass: 'dragging2'
        // disabled: true
      },
      customConfigs,
      fastConfigs,
      defaultConfigs: this.getInitDefaultConfig(),
      customConfigsFilter: [],
      fastConfigsFilter: [],
      selectTab: '',
      selectIndex: '',
      selectIndexConfig: '', // 选择字段模型，所对应的三层下标
      isConfig: false, // 配置详情
      selectWg: {},
      updateWg: {},
      data: {
        // 基本
        formListBase: [],
        // 扩展
        formListExtend: [],
        // SEO
        formListSeo: []
      },
      labelWidth: 'auto',
      excludeList: ['imageUpload', 'singleImage', 'audioUpload', 'videoUpload', 'fileUpload'], // 需要合在一起的
      noMerge: ['content', 'document', 'multiImageUpload'], // 不能向下或向上合并的
      isNoShowGhostLeft: false, // 左侧不显示 放在这里 提示语句
      isNoShowGhostRight: false, // 右侧不显示 放在这里 提示语句
      OriginalListIndex: -1, // 原始数据列表index
      OriginalListTab: '', // 原始数据列表的tab
      componentStart: false, // 左侧组件是否开始拖拽
      disable: false // 是否可以拖拽
    }
  },
  computed: {
    groups () {
      return [
        {
          title: '模型组件',
          name: '1',
          class: 'drag-comp-list',
          options: this.options,
          icon: 'moxingzujian',
          data: this.getCustomConfigs
        },
        {
          title: '快速组件',
          name: '2',
          class: 'drag-comp-list',
          icon: 'kuaisuzujian',
          options: this.options,
          data: this.getFastConfigs
        },
        {
          title: '未启用模型',
          name: '3',
          class: 'drag-comp-list2',
          icon: 'weiqiyongmoxing',
          options: this.options3,
          data: this.defaultConfigs
        }
      ]
    },
    getSelectFormItem () {
      console.log(this.selectTab)
      console.log(this.selectIndex)
      if (this.selectTab !== '' && this.selectIndex !== '') {
        let obj = null
        if (this.selectIndex.toString().indexOf(',') !== -1) {
          let indexs = this.selectIndex.split(',')
          obj = this.data[`formList${this.selectTab}`][indexs[0]]
          for (let i = 1; i < indexs.length; i++) {
            // 判断是否有list
            if (obj.list) {
              obj = obj.list[indexs[i]]
            } else {
              obj = obj[indexs[i]]
            }
          }
        } else {
          if (this.data[`formList${this.selectTab}`][this.selectIndex] instanceof Object) {
            obj = this.data[`formList${this.selectTab}`][this.selectIndex]
          }
        }
        return obj
      } else {
        return null
      }
    },
    getCustomConfigs () {
      return this.customConfigs.filter(d => !this.customConfigsFilter.includes(d.type)).slice().sort((a, b) => a.groupIndex - b.groupIndex)
    },
    getFastConfigs () {
      return this.fastConfigs.filter(d => !this.fastConfigsFilter.includes(d.type)).slice().sort((a, b) => a.groupIndex - b.groupIndex)
    },
    getDefaultConfigs () {
      return this.defaultConfigs.slice().sort((a, b) => a.groupIndex - b.groupIndex)
    }
  },
  watch: {
    // 'selectWg.value': {
    //   deep: true,
    //   handler (newData) {
    //     this.$nextTick(() => {
    //       try {
    //         this.$refs.editorComponent.$refs.baseForm.$refs.form.validate(valid => {
    //           if (valid) {
    //             this.options2.disabled = false
    //           } else {
    //             this.$message.error('请检查配置详情')
    //             this.options2.disabled = true
    //           }
    //         })
    //       } catch (error) {
    //         this.options2.disabled = false
    //       }
    //     })
    //   }
    // }
  },
  methods: {
    deepClone,
    hasRepeatValue,
    getInitDefaultConfig () {
      return defaultConfigs.filter(d => !['parentColumn', 'columnName', 'accessPath'].includes(d.type)).slice().sort((a, b) => a.groupIndex - b.groupIndex)
    },
    // 拖拽禁止 正文、文库
    handleWidgetProhibit (obj, tab, e) {
      let isTrue = true
      if (tab === 'Extend' && (obj.type === 'content' || obj.type === 'document' || obj instanceof Array)) {
        this.$message.error('不可拖拽至该区域！')
        this.data[`formList${tab}`].splice(e.newIndex, 1)
        this.data.formListBase.splice(e.oldIndex, 0, obj)
        isTrue = false
      }
      return isTrue
    },
    // 是否可以添加
    isWidgetAdd (index, tab, e) {
      let isTrue = true
      let newIndex = e.newIndex
      // 判断是否有list 并且类型相同
      if (index) {
        let OriginalIndex = newIndex !== 0 ? 0 : 1
        let obj = this.data[`formList${tab}`][index].list[newIndex]
        let OriginalObj = this.data[`formList${tab}`][index].list[OriginalIndex]
        if (obj.type !== OriginalObj.type) {
          this.data[`formList${tab}`][index].list.splice(newIndex, 1)
          this.data[`formList${tab}`][this.OriginalListIndex].list.splice(e.oldIndex, 0, obj)
          isTrue = false
        }
      } else {
        let obj = this.data[`formList${tab}`][newIndex]
        let tempListBase = arrayFlat(this.data.formListBase)
        let tempListExtend = arrayFlat(this.data.formListExtend)
        // 判断是否是需要验证的类型
        if (this.excludeList.indexOf(obj.type) !== -1) {
          // 判断当前添加的类型和当前页面是否存在改类型的组件
          if (tab !== 'Base' && tempListBase.find(d => d.type === obj.type)) {
            this.data[`formList${tab}`].splice(newIndex, 1)
            isTrue = false
          } else if (tab !== 'Extend' && tempListExtend.find(d => d.type === obj.type)){
            this.data[`formList${tab}`].splice(newIndex, 1)
            isTrue = false
          }
        }
      }
      if (!isTrue) {
        this.$message.error('不可拖拽至该区域！')
      }
      return isTrue
    },
    // 获取原始数据位置
    handleWidgetListStart (e, index, tab) {
      this.OriginalListIndex = index
      this.OriginalListTab = tab
    },
    // 拖拽成功添加
    handleWidgetAdd (e, tab, listIndex) {
      console.log(e, tab)
      const newIndex = e.newIndex
      let newObj = this.deepClone(this.data[`formList${tab}`][newIndex])
      // 判断是否可以拖拽 和 是否可以添加成功
      if (!this.handleWidgetProhibit(newObj, tab, e) || !this.isWidgetAdd(listIndex, tab, e)) {
        return false
      }
      // console.log('prop: ', newObj.prop, this.selectWg.prop)
      if (newObj.type) {
        const key = Date.now() + '_' + Math.ceil(Math.random() * 1000000)
        if (!newObj.prop) {
          newObj.prop = newObj.type + '_' + key
          if (newObj.isCustom && newObj.type !== 'organize') newObj.value.name = newObj.type + '_' + randomWord(false, 6)
        }
        if (newObj.prop && newObj.prop === this.selectWg.prop) {
          this.selectIndex = newIndex
          this.selectTab = tab
        } else if (this.selectTab && this.selectTab === tab) {
          this.selectIndex = this.data[`formList${this.selectTab}`].findIndex(d => d.prop === this.selectWg.prop)
        }

        // 选择节点
        this.selectIndex = newIndex
        this.data[`formList${tab}`][newIndex] = newObj
        this.updateWg = this.data[`formList${tab}`][newIndex] // 重新刷新页面？
        this.selectTab = tab
        this.selectWg = newObj
        this.modelTab = ''
        this.componentStart = false
        this.ghostLeft = 0
        this.fetchMergeData(tab, newIndex)
      }
    },
    // 组件拖动事件
    handleComponentStart (e, list, index) {
      let type = list[e.oldIndex].type
      let tempListBase = arrayFlat(this.data.formListBase)
      let tempListExtend = arrayFlat(this.data.formListExtend)
      this.componentStart = true
      // 判断是否是 需要合并的类型，如果不是则不进入判断
      if (this.excludeList.indexOf(type) !== -1 && (tempListBase.find(d => d.type === type) || tempListExtend.find(d => d.type === type))) {
        this.isNoShowGhostLeft = true
        this.isNoShowGhostRight = true
      } else {
        this.isNoShowGhostLeft = false
        this.isNoShowGhostRight = false
      }
    },
    // 左侧区域 开始拖动
    handleWidgetStart (e, tab) {
      // 获取当前移动的字段
      let obj = this.data[`formList${tab}`][e.oldIndex]
      // 判断如果是 文本 则右侧不显示内容
      if (obj.type === 'content' || obj.type === 'document' || obj instanceof Array) {
        this.isNoShowGhostRight = true
      } else {
        this.isNoShowGhostRight = false
      }
    },
    // 移动节点
    handleWidgetMoved (e, tab) {
      console.log('move: ', tab, this.selectTab)
      if (this.selectTab) this.selectIndex = this.data[`formList${this.selectTab}`].findIndex(d => d.prop === this.selectWg.prop)
    },
    // 选择节点
    handleSelectWidget (index, tab) {
      try {
        // 判断是否打开了配置详情
        if (this.isConfig) {
          this.$refs.editorComponent.$refs.baseForm.$refs.form.validate(valid => {
            if (valid) {
              this.doSelectItem(index, tab)
            } else {
              this.$message.error('请检查配置详情')
            }
          })
        } else {
          this.doSelectItem(index, tab)
        }
      } catch (error) {
        this.doSelectItem(index, tab)
      }
    },
    // 合并节点
    handleMergeWidget (index, type, tab) {
      // 被合并的下标
      let MergeIndex = index - 1
      // 选中下标
      let tempIndex = index - 1
      if (type === 'down') {
        MergeIndex = index + 1
        tempIndex = index
      }
      // 判断加入的否是  内容 文档 多图
      if (this.data[`formList${tab}`][MergeIndex] instanceof Array || this.noMerge.indexOf(this.data[`formList${tab}`][MergeIndex].type) !== -1 || this.noMerge.indexOf(this.data[`formList${tab}`][index].type) !== -1) {
        this.$message.error('不能合并该字段')
        return
      } else {
        let obj = deepClone(this.data[`formList${tab}`][index])
        let list = [[this.data[`formList${tab}`][MergeIndex]], [obj]]
        // 设置index
        list.forEach((d, index) => {
          d[0].index = index
        })
        this.data[`formList${tab}`].splice(MergeIndex, 1, list)
        this.data[`formList${tab}`].splice(index, 1)
        this.selectIndex = this.selectIndexConfig = tempIndex + ',1,0'
      }
    },
    // 分开节点
    handleSplitWidget (index, type, tab) {
      let tempIndexs = index.split(',')
      // 判断是否左右移动
      if (type === 'about') {
        this.data[`formList${tab}`][tempIndexs[0]].reverse()
        this.selectIndex = this.selectIndexConfig = tempIndexs[1] === '0' ? tempIndexs[0] + ',1,0' : tempIndexs[0] + ',0,0'
      } else {
        // 选中下标
        let tempIndex = tempIndexs[0]
        // 获取当前需要分离的行
        let rowList = deepClone(this.data[`formList${tab}`][tempIndexs[0]])
        // 需要分离的字段
        let LeaveObj = rowList[tempIndexs[1]][0]
        rowList.splice([tempIndexs[1]], 1)
        // 留在本行字段
        let stayObj = rowList[0][0]
        let list = []
        if (type === 'up') {
          tempIndex = tempIndex[0] - 1
          list = [LeaveObj, stayObj]
        } else {
          tempIndex = tempIndex[0] + 1
          list = [stayObj, LeaveObj]
        }
        this.data[`formList${tab}`].splice(tempIndexs[0], 1, ...list)
        this.selectIndex = this.selectIndexConfig = tempIndex
      }
    },
    doSelectItem (index, tab) {
      this.selectIndexConfig = index
      this.selectIndex = index
      this.selectTab = tab
      if (index.toString().indexOf(',') !== -1) {
        let indexs = index.split(',')
        let obj = this.data[`formList${tab}`]
        for (let i = 0; i < indexs.length; i++) {
          // 判断是否有list
          if (obj.list) {
            obj = obj.list[indexs[i]]
          } else {
            obj = obj[indexs[i]]
          }
        }
        this.selectWg = obj
      } else {
        this.selectWg = this.data[`formList${tab}`][index]
      }
      if (this.selectWg.name !== 'modelName') {
        this.isConfig = true
      }
      console.log('select', this.selectIndex)
    },
    // 删除节点
    handleWidgetDelete (index, tab) {
      this.selectIndex = ''
      this.selectIndexConfig = ''
      this.selectTab = ''
      this.selectWg = {}
      this.$nextTick(() => {
        let obj = null
        // 判断是否有多层级
        if (index.toString().indexOf(',') !== -1) {
          let indexs = index.split(',')
          // 判断有两级
          if (indexs.length === 2) {
            // 判断是否list
            if (this.data[`formList${tab}`][indexs[0]].list) {
              obj = deepClone(this.data[`formList${tab}`][indexs[0]].list[indexs[1]])
              // 清除
              if (this.data[`formList${tab}`][indexs[0]].list.length === 1) {
                this.data[`formList${tab}`].splice(indexs[0], 1)
              } else {
                this.data[`formList${tab}`][indexs[0]].list.splice(indexs[1], 1)
              }
            } else {
              obj = deepClone(this.data[`formList${tab}`][indexs[0]][indexs[1]])
              // 清除
              this.data[`formList${tab}`][indexs[0]].splice(indexs[1], 1)
            }

          } else {
            // 三级
            obj = deepClone(this.data[`formList${tab}`][indexs[0]][indexs[1]][indexs[2]])
            // 清除
            this.data[`formList${tab}`][indexs[0]].splice(indexs[1], 1)
            this.data[`formList${tab}`].splice(indexs[0], 1, this.data[`formList${tab}`][indexs[0]][0][0])
          }
        } else {
          // 没有多层级
          obj = this.data[`formList${tab}`][index]
          // 清除
          this.data[`formList${tab}`].splice(index, 1)
        }
        this.defaultConfigs.push(obj)
      })
    },
    // 从默认组件中彻底删除字段
    handleDeleteDefaultConfig (index) {
      this.defaultConfigs.splice(index, 1)
    },
    // 保存页面
    handleSave () {
      try {
        if (this.isConfig) {
          this.$refs.editorComponent.$refs.baseForm.$refs.form.validate(valid => {
            if (valid) {
              this.doSave()
            } else {
              this.$message.error('请检查配置详情')
              return false
            }
          })
        } else {
          this.doSave()
        }
      } catch (error) {
        console.log(error)
        this.doSave()
      }
    },
    doSave () {
      let tempListBase = arrayFlat(this.data.formListBase)
      let tempListExtend = arrayFlat(this.data.formListExtend)
      const check = this.hasRepeatValue(tempListBase.map(d => d.value.name)) && this.hasRepeatValue(tempListExtend.map(d => d.value.name))
      if (!check) {
        this.$message.error('存在重复的标签名称，请检查并修改')
      } else {
        this.loading = true
        let data = {
          formListBase: this.saveResetData('Base'),
          formListExtend: this.saveResetData('Extend')
        }
        // 对未启用字段进行排序
        this.defaultConfigs.forEach((d, index) => {
          d.groupIndex = index + 1
        })
        const postData = {
          modelId: this.modelId,
          enableJson: JSON.stringify(data),
          unEnableJson: JSON.stringify(this.defaultConfigs)
        }
        this.$request.fetchModelItem(postData).then(res => {
          if (res.code === 200) {
            this.$message({
              message: '保存成功',
              type: 'success'
            })
          }
          this.loading = false
        }).catch(() => {
          this.loading = false
        })
      }
    },
    // 关闭页面
    handleClose () {
      this.$confirm('关闭页面后当前保存的数据将会丢失，是否确定关闭？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        window.opener = null
        window.close()
      })
    },
    // 获取详情
    fetchModelDetail () {},
    // 保存重置数据
    saveResetData (tab) {
      let data = deepClone(this.data[`formList${tab}`])
      // 循环数据源 单元格数据
      let CellList = data.map((d, index) => {
        let returnObj
        if (d instanceof Array) {
          d.forEach((item, sIndex) => {
            item.index = index + 1
            item.sortWeight = sIndex + 1
          })
          returnObj = d
        } else {
          if (d.list) {
            d.list.forEach((item, sIndex) => {
              item.index = index + 1
              item.sortWeight = sIndex + 1
            })
            returnObj = [d.list]
          } else {
            d.index = index + 1
            returnObj = [[d]]
          }
        }
        return returnObj
      })
      return CellList
    },
    // 获取合并特定类型的数据
    fetchMergeData (tab, typeIndex) {
      // 复制一份原始数据
      let list = deepClone(this.data[`formList${tab}`])
      // 获取当前需要合并的类型
      let tempType = list[typeIndex].type
      // 特定类型数据下标
      let listIndexs = []
      // 临时保存特定类型列表
      let tempList = []
      // 获取相同类型的数据下标
      list.forEach((v, index) => {
        // 判断是否已经是数组 合并到一起了
        let type1 = tempType === 'singleImage' || tempType === 'imageUpload' ? 'imageUpload' : tempType
        let type2 = v.type === 'singleImage' || v.type === 'imageUpload' ? 'imageUpload' : v.type
        if (type1 === type2 && this.excludeList.indexOf(v.type) !== -1) {
          // 判断类型是否相同
          listIndexs.push(index)
        }
      })
      // 获取数据
      listIndexs.forEach(v => {
        // 判断是否有list
        if (list[v].list) {
          let temp = []
          tempList = temp.concat(list[v].list, tempList)
        } else {
          tempList.push(list[v])
        }
      })
      // 判断是否有需要合并的类型
      if (listIndexs.length) {
        // 定义类型结构
        let obj = {
          type: tempList[0].type,
          index: tempList[0].index,
          name: tempList[0].name,
          list: tempList,
          value: {
            name: tempList[0].value.name
          }
        }
        list.splice(listIndexs[0], 1, obj)
        if (listIndexs.length > 1) {
          list.splice(listIndexs[1], 1)
        }
        this.data[`formList${tab}`] = []
        this.data[`formList${tab}`] = list
      }
    },
    // 重置数据
    resetData () {
      Object.keys(this.data).forEach(d => {
        this.data[d] = []
      })
    }
  },
  mounted () {
    const { id } = this.$route.query
    this.resetData()
    if (id) {
      this.modelId = id
      this.fetchModelDetail()
    }
  },
  activated () {
    const { id } = this.$route.query
    if (id && id !== this.modelId) {
      this.resetData()
      this.modelId = id
      this.fetchModelDetail()
    }
  }
}
