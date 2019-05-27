import axios from './index'

export const getJobList = (params) => {
  return axios.request({
    url: '/api/v1/cedar/job/',
    params: params
  })
}

export const getJobDetail = (id) => {
  return axios.request({
    url: `/api/v1/cedar/job/${id}/?fields=` +
      'id,' +
      'job_label,' +
      'description,' +
      'job_name,' +
      'job_type,' +
      'rom_version,rom_version.version,rom_version.id,' +
      'rom_version.manufacturer,rom_version.manufacturer.manufacturer_name,rom_version.manufacturer.id,' +
      'android_version,android_version.version,android_version.id,' +
      'custom_tag,custom_tag.custom_tag_name,custom_tag.id,' +
      'phone_models,phone_models.phone_model_name,phone_models.id,' +
      'phone_models.manufacturer,phone_models.manufacturer.manufacturer_name,phone_models.manufacturer.id,' +
      'test_area,test_area.description,test_area.id,' +
      'author,author.username,author.id' +
      '&job_deleted=False'
  })
}

export const patchUpdateJob = (id, jobInfo) => {
  return axios.request({
    url: `/api/v1/cedar/job/${id}/`,
    method: 'patch',
    data: jobInfo

  })
}

export const getManufacturerList = () => {
  return axios.request({
    url: '/api/v1/cedar/manufacturer/'
  })
}

export const getAndroidVersionList = () => {
  return axios.request({
    url: '/api/v1/cedar/android_version/?fields=id,version'
  })
}

export const getJobTestAreaList = () => {
  return axios.request({
    url: '/api/v1/cedar/job_test_area/?fields=id,description'
  })
}

export const getCustomTagList = () => {
  return axios.request({
    url: '/api/v1/cedar/custom_tag/?fields=id,custom_tag_name'
  })
}
