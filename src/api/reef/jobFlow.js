import axios from '../index'

export const getBlockFlowDict4Font = (url) => {
  return axios.request({
    url: url
  })
}

export const jobFlowAndMsgSave = (data) => {
  return axios.request({
    url: 'api/v1/cedar/job/',
    method: 'post',
    data: data
  })
}

export const jobFlowAndMsgUpdate = (id, data) => {
  return axios.request({
    url: `api/v1/cedar/job/${id}/`,
    method: 'patch',
    data: data
  })
}
