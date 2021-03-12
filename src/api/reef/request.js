import axios from '../index'
import url from './url'
import { baseURL } from '../../config'

// login
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

// basic data
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

const deleteTag = (type, id) => {
  return axios.request({
    method: 'delete',
    url: url.deleteTag(id, type)
  })
}

// device
const getUsableDeviceList = () => {
  return axios.request({
    url: url.usableDevice()
  })
}

const getDeviceList = (data) => {
  return axios.request({
    url: url.device(data)
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

// job
const getJobId = (jobLabel) => {
  return axios.request({
    url: url.jobSingleId(jobLabel)
  })
}



const getJobList = (data) => {
  // console.log(url.job(data))
  return axios.request({
    url: url.job(data)
  })
}

const getJobDetail = (id) => {

  // console.log(url.jobDetail(id))
  // getJobDetail 需要job id 获取单个job 因此不能加条件 （如：job_deleted=true）
  return axios.request({
    url: url.jobDetail(id)
  })
}

const getJobFlowList = (id) => {

  // console.log(url.jobDetail(id))
  // getJobDetail 需要job id 获取单个job 因此不能加条件 （如：job_deleted=true）
  return axios.request({
    url: url.jobFlow(id)
  })
}

const saveJobFlowAndMsg = (data) => {
  return axios.request({
    method: 'post',
    url: url.saveJobFlowAndMsg(),
    data
  })
}

const updateJobMsg = (id, data) => {
  return axios.request({
    method: 'patch',
    url: url.updateJobMsg(id),
    data
    // headers: { 'Access-Control-Allow-Origin': '*' }
  })
}

const getBlockFlowDict4Font = (url) => {
  return axios.request({
    url: url
  })
}

// resfile
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

const getJobResFile = (fileUrl) => {
  return axios.request({
    url: `${baseURL}${fileUrl}`,
    responseType: 'blob'
  })
}

// unit
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


const updateFlowWithFlowId = (id,data) => {
  return axios.request({
    method: 'patch',
    url: url.jobFlowWithFlowId(id),
    data
  })
}

const updateFlowOrder = (jobId,flowList) => {
  let data = {
    job:jobId,
    flows:flowList
  }
  return axios.request({
    method: 'post',
    url: url.updateFlowOrder(),
    data
  })
}
const createFlow = (data) => {
  return axios.request({
    method: 'post',
    url: url.createFlow(),
    data
  })
}
const jobFlowByJobLabel = (jobLabel) => {
  return axios.request({
    method: 'get',
    url: url.jobFlowByJobLabel(jobLabel)
  })
}
const deleteFlowWithFlowId = (id) => {
  return axios.request({
    method: 'delete',
    url: url.jobFlowWithFlowId(id),
  })
}

const getFlow = (data={}) => {
  return axios.request({
    method: 'get',
    url: url.createFlow(),
    params:data
  })
}

const deleteUnitTemplate = (id) => {
  return axios.request({
    method: 'delete',
    url: url.handleUnit(id)
  })
}


const getUserInfoByToken = (token) => {
  return axios.request({
    method: 'get',
    url: url.token(token)
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
  deleteTag,
  getUsableDeviceList,
  getDeviceList,
  getDeviceBatteryLevel,
  controlDevice,
  releaseOccupyDevice,
  saveJobFlowAndMsg,
  getJobId,
  getJobList,
  getJobDetail,
  getJobFlowList,
  updateJobMsg,
  getBlockFlowDict4Font,
  jobResFilesSave,
  getJobResFilesList,
  getJobResFile,
  getJobUnitsBodyDict,
  updateJobUnitTemplate,
  createNewUnitTemplate,
  deleteUnitTemplate,
  getUserInfoByToken,
  updateFlowWithFlowId,
  deleteFlowWithFlowId,
  createFlow,
  jobFlowByJobLabel,
  updateFlowOrder,
  getFlow
}
