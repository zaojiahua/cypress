import axios from '../index'

export const getManufacturerList = () => {
  return axios.request({
    url: '/api/v1/cedar/manufacturer/'
  })
}
