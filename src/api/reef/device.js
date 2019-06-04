import axios from '../index'

export const getUsableDeviceList = () => {
  return axios.request({
    url: '/api/v1/cedar/device/?fields=id,device_label,ip_address,device_name,phone_model,phone_model.phone_model_name,android_version,android_version.version,rom_version,rom_version.version&status=idle&ai_occupy=False'
  })
}
