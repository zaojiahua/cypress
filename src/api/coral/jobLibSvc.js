import axios from '../index'
import { jobLibSvcURL } from '../../config'

export const callEblockExce = (data) => {
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
  return axios.request({
    url: jobLibSvcURL,
    method: 'post',
    data: data
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
