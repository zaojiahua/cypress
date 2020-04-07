import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  // namaspaced: true, // 解决不同模块命名冲突的问题，之后在不同页面中引入getter、actions、mutations时，需要加上所属的模块名
  state: {
    // 设备信息相关
    selectedDeviceInfo: null,
    jobInfoValid: false,
    jobInfo: {},
    // 抽屉
    showDrawer: false
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

  },
  getters: {
    selectedDeviceInfo (state) {
      if (state.selectedDeviceInfo) {
        return [
          {
            device_name: state.selectedDeviceInfo.device_name,
            phone_model: state.selectedDeviceInfo.phone_model,
            android_version: state.selectedDeviceInfo.android_version,
            rom_version: state.selectedDeviceInfo.rom_version,
            ip_address: state.selectedDeviceInfo.ip_address,
            device_label: state.selectedDeviceInfo.device_label
          }
        ]
      } else {
        return []
      }
    }
  }
})
