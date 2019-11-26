import axios from '../index'

export const getRomVersionList = () => {
  return axios.request({
    url: 'api/v1/cedar/rom_version/?fields=id,version'
  })
}
