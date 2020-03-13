import request from '@/api'
import { loopOptions } from '@/utils'

export default {
  namespaced: true,
  state: {
    collectTaskList: [],
    detailData: {}
  },
  mutations: {
    SET_CTL: (state, data) => {
      state.collectTaskList = loopOptions(data)
    },
    GET_DATA: (state, data) => {
      state.detailData = data
    }
  },
  getters: {
    collectTaskList: state => state.collectTaskList,
    collectTaskTree: state => {
      return [{
        value: '',
        label: '采集任务',
        expandedIcon: 'dakaiwenjianjia-copy',
        collectIcon: 'weidakaiwenjianjia-copy',
        children: state.collectTaskList
      }]
    }
  },
  actions: {
    // 重置数据
    resetDetailData ({ commit }, data) {
      commit('GET_DATA', data)
    },
    FetchCollectTaskList ({ commit, state }, reflush) {
      if (!state.collectTaskList.length || reflush) {
        request.fetchCollectTaskList().then(res => {
          if (res.code === 200 && res.data.content instanceof Array) {
            commit('SET_CTL', res.data.content)
          }
        })
      }
    },
    getDetailData ({ commit }, params) {
      request.fetchQuestionnaireDetail(params).then(res => {
        if (res.code === 200) {
          if (res.data.processType === 2) {
            var Data = Object.assign(res.data, { prompt2: res.data.prompt })
            Data.prompt = '您的答卷已经提交，感谢您的参与'
            commit('GET_DATA', Data)
          } else {
            commit('GET_DATA', res.data)
          }
        }
      })
    }
  }
}
