import request from '@/api'

export default {
  namespaced: true,
  state: {
    tencentList: [] // 公众号列表
  },
  mutations: {
    TENCENT_LIST: (state, data) => {
      state.tencentList = data
    }
  },
  actions: {
    // 公众号列表
    GetTencentList ({ commit }, data) {
      const params = {
        type: 1
      }
      return request.fetchWechatInfoList(params).then(res => {
        if (res.code === 200) {
          commit('TENCENT_LIST', res.data)
        }
      })
    }
  }
}
