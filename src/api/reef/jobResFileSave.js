import axios from '../index'

export const jobResFilesSave = (data) => {
  return axios.request({
    url: 'api/v1/cedar/job_upload_multi_res_file/',
    method: 'post',
    data: data
  })
}
