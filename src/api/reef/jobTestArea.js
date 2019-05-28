import axios from '../index'

export const getJobTestAreaList = () => {
  return axios.request({
    url: '/api/v1/cedar/job_test_area/?fields=id,description'
  })
}
