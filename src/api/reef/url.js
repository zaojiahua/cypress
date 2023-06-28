const reefPrefix = '/api/v1/cedar/'
const coralPrefix = '/api/v1/coral/'
const testAreaFilter = ['id', 'description']
const customTagFilter = ['id', 'custom_tag_name']
const reefUserFilter = ['id', 'username', 'last_name']
const phoneModelFilter = ['id', 'phone_model_name']
const androidVersionFilter = ['id', 'version']
const romVersionFilter = ['id', 'version']
const manufacturerFilter = ['id', 'manufacturer_name', 'phonemodel', 'phonemodel.id', 'phonemodel.phone_model_name', 'romversion', 'romversion.id', 'romversion.version']
const usableDeviceFilter = ['id', 'device_label', 'ip_address', 'device_name', 'phone_model', 'phone_model.phone_model_name', 'android_version', 'android_version.version', 'rom_version', 'rom_version.version']
const deviceFilter = ['id', 'device_label', 'occupy_type', 'phone_model', 'phone_model.id', 'phone_model.phone_model_name', 'phone_model.manufacturer', 'phone_model.manufacturer.id', 'phone_model.manufacturer.manufacturer_name', 'phone_model.cpu_name', 'rom_version', 'rom_version.id', 'rom_version.version', 'device_name', 'android_version', 'android_version.id', 'android_version.version', 'ip_address', 'cabinet', 'cabinet.ip_address', 'status']
const jobFilter = ['id','job_label', 'test_area', 'test_area.description', 'custom_tag', 'custom_tag.custom_tag_name', 'ui_json_file', 'job_name', 'job_type','cabinet_type', 'job_second_type', 'draft', 'updated_time', 'author', 'author.id','author.username']
const jobDetailFilter = ['id', 'job_label', 'description', 'job_name', 'job_type', 'job_second_type', 'case_number', 'priority', 'draft','cabinet_type','unit_group','is_support_parameter',
  'rom_version', 'rom_version.version', 'rom_version.id', 'rom_version.manufacturer', 'rom_version.manufacturer.manufacturer_name', 'rom_version.manufacturer.id',
  'android_version', 'android_version.version', 'android_version.id', 'custom_tag', 'custom_tag.custom_tag_name', 'custom_tag.id',
  'phone_models', 'phone_models.phone_model_name', 'phone_models.id', 'phone_models.manufacturer', 'phone_models.manufacturer.manufacturer_name', 'phone_models.manufacturer.id',
  'test_area', 'test_area.description', 'test_area.id', 'author', 'author.username', 'author.id', 'ui_json_file',
  'job_flow', 'job_flow.id', 'job_flow.name', 'job_flow.ui_json_file', 'job_flow.order', 'job_flow.description','matching_rule']
const jobFlowFilter = ['job_flow', 'job_flow.id', 'job_flow.name', 'job_flow.ui_json_file', 'job_flow.order', 'job_flow.description']
const resFileFilter = ['job_res_file', 'job_res_file.name', 'job_res_file.file', 'job_res_file.type']
const tokenUserFilter = ['user', 'user.id', 'user.username', 'user.groups','user.groups.name']

function joinFilter (data) {
  return data.join(',')
}

export default {
  login: () => `${reefPrefix}user_login/`,
  testArea: () => `${reefPrefix}job_test_area/?fields=${joinFilter(testAreaFilter)}&ordering=description`,
  customTag: () => `${reefPrefix}custom_tag/?fields=${joinFilter(customTagFilter)}&ordering=custom_tag_name`,
  reefUser: () => `${reefPrefix}reefuser/?fields=${joinFilter(reefUserFilter)}&ordering=username`,
  phoneModel: () => `${reefPrefix}phone_model/?fields=${joinFilter(phoneModelFilter)}&ordering=phone_model_name`,
  androidVersion: () => `${reefPrefix}android_version/?fields=${joinFilter(androidVersionFilter)}&ordering=version`,
  romVersion: () => `${reefPrefix}rom_version/?fields=${joinFilter(romVersionFilter)}&ordering=version`,
  manufacturer: () => `${reefPrefix}manufacturer/?fields=${joinFilter(manufacturerFilter)}`,
  cabinetType: () => `${reefPrefix}get_cabinet_type_info/?data_type=cabinet_type_data`,
  usableDevice: () => `${reefPrefix}device/?fields=${joinFilter(usableDeviceFilter)}&status=idle&ai_occupy=False`,
  device: (data) => `${reefPrefix}device/?fields=${joinFilter(deviceFilter)}&limit=${data.pageSize}&offset=${data.pageOffset}${data.deviceStatus}${data.deviceKeywordCondition}&ordering=id`,
  deviceBattery: (data) => `${reefPrefix}get_device_power_battery_level/?device_id=${data}`,
  controlDevice: () => `${coralPrefix}control_device/`,
  releaseDevice: () => `${coralPrefix}release_occupy_device/`,
  job: (data) => `${reefPrefix}job/?fields=${joinFilter(jobFilter)}&job_deleted=False&limit=${data.pageSize}&offset=${data.offset}&ordering=-updated_time${data.filterUrlParam}`,
  jobSingleId: (job_label) => `${reefPrefix}job/?fields=id&job_label=${job_label}`,
  jobMsgByParams: () => `${reefPrefix}job/`,
  jobFlowByJobLabel: (job_label) => `${reefPrefix}job/?fields=${joinFilter(jobFlowFilter)}&job_label=${job_label}`,
  jobDetail: (id) => `${reefPrefix}job/${id}/?fields=${joinFilter(jobDetailFilter)}`,
  jobFlow: (id) => `${reefPrefix}job/${id}/?fields=${joinFilter(jobFlowFilter)}`,
  jobFlowWithFlowId: (id) => `${reefPrefix}job_flow/${id}/`,
  updateFlowOrder: () => `${reefPrefix}job_flow_order_update/`,
  createFlow: () => `${reefPrefix}job_flow/`,
  copyFlow:() => `${reefPrefix}job_flow_copy/`,
  copyJob:() => `${reefPrefix}job_copy/`,

  cabinetList:() => `${reefPrefix}get_cabinet_type_info/`,
  appNameList:() => `${reefPrefix}get_order_app_name`,
  jobBindResource:() => `${reefPrefix}job_bind_resource/`,

  saveJobFlowAndMsg: () => `${reefPrefix}job/`,
  updateJobMsg: (id) => `${reefPrefix}job/${id}/`,
  deleteJob:() => `${reefPrefix}job_deleted/`,
  deleteTag: (id, type) => `${reefPrefix}${type}/${id}`,
  deleteTags: () => `${reefPrefix}delete_tag/`,
  saveResFile: () => `${reefPrefix}job_upload_multi_res_file/`,
  getResFile: (id) => `${reefPrefix}job_flow/${id}/?fields=${joinFilter(resFileFilter)}`,
  unit: () => `${reefPrefix}unit/`,
  unit_en: () => `${reefPrefix}unit_en/`,
  handleUnit: (id) => `${reefPrefix}unit/${id}/`,
  handleUnit_en: (id) => `${reefPrefix}unit_en/${id}/`,
  token: (token) => `${reefPrefix}token/?fields=${joinFilter(tokenUserFilter)}&key=${token}`
}
