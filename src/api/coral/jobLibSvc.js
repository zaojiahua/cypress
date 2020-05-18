import axios from '../index'
import { jobLibSvcURL, machexecURL } from '../../config'

export const getScreenShot = (data, cabinetIp) => {
  /*
  * {
          requestName: ...,
          deviceId: ...,
          deviceLabel: ...,
          ipAddress: ...,
          ImgName: ...,
          stageJobLabel: ...
      }
  * */
  console.log(machexecURL, data, cabinetIp)
  return axios.request({
    url: `${machexecURL}/pane/snap_shot/`,
    method: 'get',
    params: data,
    responseType: 'blob'
  })
}

export const getTemporarySpace = () => {
  /*
  * */
  return axios.request({
    url: jobLibSvcURL,
    method: 'post',
    data: { requestName: 'getTemporarySpace' }
  })
}

export const getFeaturePointIntoJob = (data) => {
  return axios.request({
    url: jobLibSvcURL,
    method: 'post',
    data: data
  })
}

export const getSelectedJobs = (data) => { // 导出已选用例，暂时保留
  return axios.request({
    url: jobLibSvcURL,
    method: 'post',
    data: data
  })
}
