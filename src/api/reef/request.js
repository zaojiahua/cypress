import axios from '../index'
import url from './url'
import {baseURL} from '../../config'

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

const getCabinetTypeList = () => {
  return axios.request({
    url: url.cabinetType()
  })
}

const deleteTag = (type, id) => {
  return axios.request({
    method: 'delete',
    url: url.deleteTag(id, type)
  })
}
//删除冗余的自定义标签、测试用途
const deleteTags = (data) => {
  return axios.request({
    method: 'delete',
    url: url.deleteTags(),
    data
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

// 根据指定条件job获取指定字段
const getJobMsgByParams = (_params) => {
  return axios.request({
    params: _params,
    url: url.jobMsgByParams()
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

const deleteJob = (data) => {
  return axios.request({
    method: 'post',
    url: url.deleteJob(),
    data
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
const getJobUnitsBodyDict = (_params) => {
  return axios.request({
    url: url.unit(),
    params: _params,
  })
}

const getJobUnitsBodyDict_en = (_params) => {
  return axios.request({
    url: url.unit_en(),
    params: _params,
  })
}

const updateJobUnitTemplate = (id, data) => {
  return axios.request({
    method: 'patch',
    url: url.handleUnit(id),
    data
  })
}

const updateJobUnitTemplate_en = (id, data) => {
  return axios.request({
    method: 'patch',
    url: url.handleUnit_en(id),
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

const createNewUnitTemplate_en = (data) => {
  return axios.request({
    method: 'post',
    url: url.unit_en(),
    data
  })
}

const updateFlowWithFlowId = (id, data) => {
  return axios.request({
    method: 'patch',
    url: url.jobFlowWithFlowId(id),
    data
  })
}

const updateFlowOrder = (jobId, flowList) => {
  let data = {
    job: jobId,
    flows: flowList
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

const getFlow = (data = {}) => {
  return axios.request({
    method: 'get',
    url: url.createFlow(),
    params: data
  })
}

const copyFlowWithFlowId = (data = {}) => {
  return axios.request({
    method: 'post',
    url: url.copyFlow(),
    data
  })
}
const copyJob = (data = {}) => {
  return axios.request({
    method: 'post',
    url: url.copyJob(),
    data
  })
}


const deleteUnitTemplate = (id) => {
  return axios.request({
    method: 'delete',
    url: url.handleUnit(id)
  })
}

const deleteUnitTemplate_en = (id) => {
  return axios.request({
    method: 'delete',
    url: url.handleUnit_en(id)
  })
}

const getUserInfoByToken = (token) => {
  return axios.request({
    method: 'get',
    url: url.token(token)
  })
}

//cabinetList
const getCabinetList = (data = {}) => {
  return axios.request({
    method: 'get',
    url: url.cabinetList(),
    params: data
  })
}

const getAppNameList = (data = {}) => {
  return axios.request({
    method: 'get',
    url: url.appNameList(),
    params: data
  })
}
const jobBindResource= (data = {}) => {
  return axios.request({
    method: 'post',
    url: url.jobBindResource(),
    data
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
  getCabinetTypeList,
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
  getJobUnitsBodyDict_en,
  updateJobUnitTemplate,
  updateJobUnitTemplate_en,
  createNewUnitTemplate,
  createNewUnitTemplate_en,
  deleteUnitTemplate,
  deleteUnitTemplate_en,
  getUserInfoByToken,
  updateFlowWithFlowId,
  deleteFlowWithFlowId,
  createFlow,
  jobFlowByJobLabel,
  updateFlowOrder,
  getFlow,
  copyFlowWithFlowId,
  copyJob,
  getJobMsgByParams,
  getCabinetList,
  getAppNameList,
  jobBindResource,
  deleteJob,
  deleteTags,
}
