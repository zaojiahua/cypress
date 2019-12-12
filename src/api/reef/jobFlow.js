import axios from '../index'

export const getBlockFlowDict4Font = (url) => {
  return axios.request({
    url: url,
    method: 'get'
  })
}
