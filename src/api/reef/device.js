import axios from '../index'

export const getUsableDeviceList = () => {
  return axios.request({
    url: '/api/v1/cedar/device/?fields=id,device_label,ip_address,device_name,' +
      'phone_model,phone_model.phone_model_name,' +
      'android_version,android_version.version,' +
      'rom_version,rom_version.version' +
      '&status=idle&ai_occupy=False'
  })
}
export const getDeviceList = (queryParameters) => {
  return axios.request({
    url: 'api/v1/cedar/device/?fields=' +
      'id,' +
      'device_label,' +
      'occupy_type,' +
      'phone_model,' +
      'phone_model.id,' +
      'phone_model.phone_model_name,' +
      'phone_model.manufacturer,' +
      'phone_model.manufacturer.id,' +
      'phone_model.manufacturer.manufacturer_name,' +
      'phone_model.cpu_name,' +
      'rom_version,' +
      'rom_version.id,' +
      'rom_version.version,' +
      'device_name,' +
      'android_version,' +
      'android_version.id,' +
      'android_version.version,' +
      'ip_address,' +
      'cabinet,' +
      'cabinet.ip_address,' +
      'status' +
      '&limit=' + queryParameters.pageSize +
      '&offset=' + queryParameters.pageOffset +
      queryParameters.deviceStatus +
      '&ordering=id'
  })
}

export const getDeviceBatteryLevel = (parameter) => {
  return axios.request({
    url: 'api/v1/cedar/get_device_power_battery_level/?device_id=' + parameter
  })
}

export const controlDevice = (data) => {
  return axios.request({
    method: 'post',
    url: 'api/v1/coral/control_device/',
    data
  })
}

export const releaseOccupyDevice = (data) => {
  return axios.request({
    method: 'post',
    url: 'api/v1/coral/release_occupy_device/',
    data
  })
}
