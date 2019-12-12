import axios from '../index'

export const getJobUnitsBodyDict = () => {
  return axios.request({
    url: '/api/v1/cedar/unit/'
  })
}
