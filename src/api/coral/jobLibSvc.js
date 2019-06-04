import axios from '../index'
import { CoralIp } from '../../config'

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
    url: CoralIp,
    method: 'post',
    data: data
  })
}

export const deviceOperationStatus = (deviceLabel) => {
  /*
  * */
  return axios.request({
    url: `${CoralIp}/deviceOperationStatus?deviceLabel=${deviceLabel}`
  })
}

export const getTemporarySpace = () => {
  /*
  * */
  return axios.request({
    url: CoralIp,
    method: 'post',
    data: { requestName: 'getTemporarySpace' }
  })
}

export const getBlockFlowDict4Font = (deviceId) => {
  console.log(deviceId)

  return axios.request({
    url: CoralIp,
    method: 'post',
    data: {
      requestName: 'getBlockFlowDict4Font',
      jobID: deviceId
    }
  })
}
