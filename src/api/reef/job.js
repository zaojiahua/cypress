import axios from '../index'

export const getJobList = (params) => {
  return axios.request({
    url: 'api/v1/cedar/job/?fields=' +
      'id,' +
      'test_area,' +
      'test_area.description,' +
      'custom_tag,' +
      'custom_tag.custom_tag_name,' +
      'ui_json_file,' +
      'job_name,' +
      'job_type,' +
      'draft' +
      '&job_deleted=False' +
      '&limit=' + params.pageSize +
      '&offset=' + params.offset +
      params.jobState +
      params.jobType +
      '&ordering=id' + params.filterUrlParam
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
      'author,author.username,author.id,' +
      'ui_json_file' +
      '&job_deleted=False'
  })
}

export const patchUpdateJob = (id, data) => {
  return axios.request({
    url: `/api/v1/cedar/job/${id}/`,
    method: 'patch',
    data
  })
}
