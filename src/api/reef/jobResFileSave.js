import axios from '../index'
import { baseURL } from '../../config'

export const jobResFilesSave = (data) => {
  return axios.request({
    url: 'api/v1/cedar/job_upload_multi_res_file/',
    method: 'post',
    data: data
  })
}

export const getJobResFilesList = (id) => {
  return axios.request({
    url: `api/v1/cedar/job/${id}/?fields=job_res_file,job_res_file.name,job_res_file.file,job_res_file.type`
  })
}

export const getJobResFile = (fileUrl) => {
  return axios.request({
    url: `${baseURL}${fileUrl}`,
    responseType: 'blob'
  })
}
