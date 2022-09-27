let state = {
  selectDevice: false, // 是否打开设备选择界面
  deviceInfo: null, // 当前选中的设备
  jobMsgDeviceInfo:null, // job详情中选取的设备信息
  isJobDeviceMsg:false, // 是否是用例详情中的选取设备信息
  preDeviceInfo: null, // 之前选中的 倒计时中的设备
  countdown: false, // 是否显示倒计时组件CountDown
  isControlDevice:false, //是否占用设备
  releaseDeviceId:null,
}

let mutations = {
  setJobMsgDeviceInfo (state, deviceInfo) {
    state.jobMsgDeviceInfo = deviceInfo
  },
  clearJobMsgDeviceInfo (state) {
    state.jobMsgDeviceInfo = null
  },
  setDeviceInfo (state, deviceInfo) {
    state.deviceInfo = deviceInfo
  },
  clearDeviceInfo (state) {
    state.deviceInfo = null
  },
  setPreDeviceInfo (state, preDeviceInfo) {
    state.preDeviceInfo = preDeviceInfo
  },
  clearPreDeviceInfo (state) {
    state.preDeviceInfo = null
  },
  setSelectDevice (state, toggle = true) {
    state.selectDevice = toggle
  },
  setIsJobDeviceMsg (state, toggle = false) {
    state.isJobDeviceMsg = toggle
  },
  setCountdown (state, toggle = false) {
    state.countdown = toggle
  },
  setControlDeviceFlag(state,toggle = false){
    state.isControlDevice = toggle
  },
  setReleaseDeviceId(state, id = null){
    state.releaseDeviceId = id
  }
}

let getters = {
  deviceInfo (state) {
    return state.deviceInfo ? [
      {
        cabinet_ip_address: state.deviceInfo.cabinet.ip_address,
        device_name: state.deviceInfo.device_name,
        phone_model: state.deviceInfo.phone_model,
        android_version: state.deviceInfo.android_version,
        rom_version: state.deviceInfo.rom_version,
        ip_address: state.deviceInfo.ip_address,
        device_label: state.deviceInfo.device_label
      }
    ] : []
  },
  jobMsgDeviceInfo(state){
    return state.jobMsgDeviceInfo ? [
      {
        cabinet_ip_address: state.jobMsgDeviceInfo.cabinet.ip_address,
        device_name: state.jobMsgDeviceInfo.device_name,
        phone_model: state.jobMsgDeviceInfo.phone_model,
        android_version: state.jobMsgDeviceInfo.android_version,
        rom_version: state.jobMsgDeviceInfo.rom_version,
        ip_address: state.jobMsgDeviceInfo.ip_address,
        device_label: state.jobMsgDeviceInfo.device_label
      }
    ] : []
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  getters
}
