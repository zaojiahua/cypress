import Mock from 'mockjs'
import { baseURL, jobLibSvcURL } from '../config'
import { login } from './reef/user'
import { getUsableDeviceList } from './reef/device'
import { jobLibSvcExecute } from './coral/jobLibSvc'

Mock.mock(`${baseURL}/api/v1/login/`, 'post', login)
Mock.mock(baseURL + '/api/v1/cedar/device/?fields=id,device_label,ip_address,device_name,' +
  'phone_model,phone_model.phone_model_name,' +
  'android_version,android_version.version,' +
  'rom_version,rom_version.version' +
  '&status=idle&ai_occupy=False', 'get', getUsableDeviceList)

Mock.mock(jobLibSvcURL, 'post', jobLibSvcExecute)

export default Mock
