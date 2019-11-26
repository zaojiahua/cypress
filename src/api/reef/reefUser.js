import axios from '../index'

export const getReefUserList = () => {
  return axios.request({
    url: 'api/v1/cedar/reefuser/?fields=id,username,last_name'
  })
}
