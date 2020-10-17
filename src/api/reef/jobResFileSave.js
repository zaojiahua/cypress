import axios from '../index'
import { baseURL } from '../../config'

export const getJobResFile = (fileUrl) => {
  return axios.request({
    url: `${baseURL}${fileUrl}`,
    responseType: 'blob'
  })
}
