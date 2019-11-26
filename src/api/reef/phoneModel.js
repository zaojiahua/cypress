import axios from '../index'

export const getPhoneModelList = () => {
  return axios.request({
    url: 'api/v1/cedar/phone_model/?fields=id,phone_model_name'
  })
}
