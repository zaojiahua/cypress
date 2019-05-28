import axios from '../index'

export const getAndroidVersionList = () => {
  return axios.request({
    url: '/api/v1/cedar/android_version/?fields=id,version'
  })
}
