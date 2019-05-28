import axios from '../index'

export const getCustomTagList = () => {
  return axios.request({
    url: '/api/v1/cedar/custom_tag/?fields=id,custom_tag_name'
  })
}
