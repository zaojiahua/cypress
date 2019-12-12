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

export const deviceOperationStatus = (deviceLabel) => {
  /*
  * */
  return axios.request({
    url: `${jobLibSvcURL}/deviceOperationStatus?deviceLabel=${deviceLabel}`
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

export const getBlockFlowDict4Font = (jobLabel) => {
  return axios.request({
    url: jobLibSvcURL,
    method: 'post',
    data: {
      requestName: 'getBlockFlowDict4Font',
      jobID: jobLabel
    }
  })
}

export const getFeaturePointIntoJob = (data) => {
  return axios.request({
    url: jobLibSvcURL,
    method: 'post',
    data: data
  })
}

export const setjobInfoAndFlowDict = (data) => {
  return axios.request({
    url: jobLibSvcURL,
    method: 'post',
    data: data
  })
}

export const jobFlowAndMsgSave = (data) => {
  return axios.request({
    url: `${jobLibSvcURL}/jobFlowAndMsgSave/`,
    method: 'post',
    data: data
  })
}

export const getSelectedJobs = (data) => {
  return axios.request({
    url: jobLibSvcURL,
    method: 'post',
    data: data
  })
}
