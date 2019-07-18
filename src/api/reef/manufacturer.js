import axios from '../index'

export const getManufacturerList = () => {
  return axios.request({
    url: '/api/v1/cedar/manufacturer/?' +
      'fields=id,manufacturer_name,' +
      'phonemodel,phonemodel.id,phonemodel.phone_model_name,' +
      'romversion,romversion.id,romversion.version'
  })
}
