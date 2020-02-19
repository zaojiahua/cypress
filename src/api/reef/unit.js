import axios from '../index'

export const getJobUnitsBodyDict = () => {
  return axios.request({
    url: '/api/v1/cedar/unit/'
  })
}

export const updateJobUnitTemplate = (id, unitInfo) => {
  return axios.request({
    url: `/api/v1/cedar/unit/${id}/`,
    method: 'patch',
    data: unitInfo
  })
}

export const createNewUnitTemplate = (unitInfo) => {
  return axios.request({
    url: '/api/v1/cedar/unit/',
    method: 'post',
    data: unitInfo
  })
}

export const deleteUnitTemplate = (id) => {
  return axios.request({
    url: `/api/v1/cedar/unit/${id}/`,
    method: 'delete'
  })
}
