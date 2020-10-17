import axios from '../index'
import url from '../url'

const login = (username, password) => {
  return axios.request({
    method: 'post',
    url: url.login(),
    data: {
      username,
      password
    }
  })
}

const getJobTestAreaList = () => {
  return axios.request({
    url: url.testArea()
  })
}

const getCustomTagList = () => {
  return axios.request({
    url: url.customTag()
  })
}

const getReefUserList = () => {
  return axios.request({
    url: url.reefUser()
  })
}

const getPhoneModelList = () => {
  return axios.request({
    url: url.phoneModel()
  })
}

const getAndroidVersionList = () => {
  return axios.request({
    url: url.androidVersion()
  })
}

const getRomVersionList = () => {
  return axios.request({
    url: url.romVersion()
  })
}

const getManufacturerList = () => {
  return axios.request({
    url: url.manufacturer()
  })
}

const getUsableDeviceList = () => {
  return axios.request({
    url: url.usableDevice()
  })
}

const getDeviceList = () => {
  return axios.request({
    url: url.device()
  })
}

const getDeviceBatteryLevel = (data) => {
  return axios.request({
    url: url.deviceBattery(data)
  })
}

const controlDevice = (data) => {
  return axios.request({
    method: 'post',
    url: url.controlDevice(),
    data
  })
}

const releaseOccupyDevice = (data) => {
  return axios.request({
    method: 'post',
    url: url.releaseDevice(),
    data
  })
}

const getJobList = (data) => {
  return axios.request({
    url: url.job(data)
  })
}

const getJobDetail = (id) => {
  return axios.request({
    url: url.jobDetail(id)
  })
}

const saveJobFlowAndMsg = (data) => {
  return axios.request({
    method: 'post',
    url: url.saveJobFlowAndMsg(),
    data
  })
}

const updateJob = (id, data) => {
  return axios.request({
    method: 'patch',
    url: url.updateJob(id),
    data
  })
}

const jobResFilesSave = (data) => {
  return axios.request({
    method: 'post',
    url: url.saveResFile(),
    data
  })
}

const getJobResFilesList = (id) => {
  return axios.request({
    url: url.getResFile(id)
  })
}

const deleteTag = (type, id) => {
  return axios.request({
    method: 'delete',
    url: url.deleteTag(id, type)
  })
}

const getJobUnitsBodyDict = () => {
  return axios.request({
    url: url.unit()
  })
}

const updateJobUnitTemplate = (id, data) => {
  return axios.request({
    method: 'patch',
    url: url.handleUnit(id),
    data
  })
}

const createNewUnitTemplate = (data) => {
  return axios.request({
    method: 'post',
    url: url.unit(),
    data
  })
}

const deleteUnitTemplate = (id) => {
  return axios.request({
    method: 'delete',
    url: url.handleUnit(id)
  })
}

export {
  login,
  getJobTestAreaList,
  getCustomTagList,
  getReefUserList,
  getPhoneModelList,
  getAndroidVersionList,
  getRomVersionList,
  getManufacturerList,
  getUsableDeviceList,
  getDeviceList,
  getDeviceBatteryLevel,
  controlDevice,
  releaseOccupyDevice,
  saveJobFlowAndMsg,
  getJobList,
  getJobDetail,
  updateJob,
  jobResFilesSave,
  getJobResFilesList,
  deleteTag,
  getJobUnitsBodyDict,
  updateJobUnitTemplate,
  createNewUnitTemplate,
  deleteUnitTemplate
}
