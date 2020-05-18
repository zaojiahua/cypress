let state = {
  selectDevice: false,
  deviceInfo: null
}

let mutations = {
  setDeviceInfo (state, deviceInfo) {
    console.log(deviceInfo)
    state.deviceInfo = deviceInfo
  },
  clearDeviceInfo (state) {
    state.deviceInfo = null
  },
  setSelectDevice (state, toggle = true) {
    state.selectDevice = toggle
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
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  getters
}
