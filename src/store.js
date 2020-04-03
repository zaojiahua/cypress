import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  // namaspaced: true, // 解决不同模块命名冲突的问题，之后在不同页面中引入getter、actions、mutations时，需要加上所属的模块名
  state: {
    // 设备信息相关
    selectedDeviceInfo: null,
    jobInfo: {},
    // 抽屉
    showDrawer: false,
    jobInfoValid: false
  },
  mutations: {
    setSelectedDeviceInfo (state, deviceInfo) {
      state.selectedDeviceInfo = deviceInfo
    },
    setJobInfo (state, jobInfo) {
      state.jobInfo = jobInfo
    },
    handleShowDrawer (state) {
      state.showDrawer = !state.showDrawer
    },
    setJobInfoValid (state, jobInfoValid) {
      state.jobInfoValid = jobInfoValid
    }
  },
  actions: {

  }
})
