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
const jobFilter = ['id', 'test_area', 'test_area.description', 'custom_tag', 'custom_tag.custom_tag_name', 'ui_json_file', 'job_name', 'job_type', 'job_second_type', 'draft', 'updated_time']
const jobDetailFilter = ['id', 'job_label', 'description', 'job_name', 'job_type', 'job_second_type', 'draft', 'subsidiary_device_count', 'rom_version', 'rom_version.version', 'rom_version.id', 'rom_version.manufacturer', 'rom_version.manufacturer.manufacturer_name', 'rom_version.manufacturer.id', 'android_version', 'android_version.version', 'android_version.id', 'custom_tag', 'custom_tag.custom_tag_name', 'custom_tag.id', 'phone_models', 'phone_models.phone_model_name', 'phone_models.id', 'phone_models.manufacturer', 'phone_models.manufacturer.manufacturer_name', 'phone_models.manufacturer.id', 'test_area', 'test_area.description', 'test_area.id', 'author', 'author.username', 'author.id', 'ui_json_file']
const resFileFilter = ['job_res_file', 'job_res_file.name', 'job_res_file.file', 'job_res_file.type']

function joinFilter (data) {
  return data.join(',')
}

export default {
  login: () => `${reefPrefix}user_login/`,
  testArea: () => `${reefPrefix}job_test_area/?fields=${joinFilter(testAreaFilter)}`,
  customTag: () => `${reefPrefix}custom_tag/?fields=${joinFilter(customTagFilter)}`,
  reefUser: () => `${reefPrefix}reefuser/?fields=${joinFilter(reefUserFilter)}`,
  phoneModel: () => `${reefPrefix}phone_model/?fields=${joinFilter(phoneModelFilter)}`,
  androidVersion: () => `${reefPrefix}android_version/?fields=${joinFilter(androidVersionFilter)}`,
  romVersion: () => `${reefPrefix}rom_version/?fields=${joinFilter(romVersionFilter)}`,
  manufacturer: () => `${reefPrefix}manufacturer/?fields=${joinFilter(manufacturerFilter)}`,
  usableDevice: () => `${reefPrefix}device/?fields=${joinFilter(usableDeviceFilter)}&status=idle&ai_occupy=False`,
  device: (data) => `${reefPrefix}device/?fields=${joinFilter(deviceFilter)}&limit=${data.pageSize}&offset=${data.pageOffset}${data.deviceStatus}&ordering=id`,
  deviceBattery: (data) => `${reefPrefix}get_device_power_battery_level/?device_id=${data}`,
  controlDevice: () => `${coralPrefix}control_device/`,
  releaseDevice: () => `${coralPrefix}release_occupy_device/`,
  job: (data) => `${reefPrefix}job/?fields=${joinFilter(jobFilter)}&job_deleted=False&limit=${data.pageSize}&offset=${data.offset}&ordering=-updated_time${data.filterUrlParam}`,
  jobDetail: (id) => `${reefPrefix}job/${id}/?fields=${joinFilter(jobDetailFilter)}&job_deleted=False`,
  saveJobFlowAndMsg: () => `${reefPrefix}job/`,
  updateJobMsg: (id) => `${reefPrefix}job/${id}`,
  deleteTag: (id, type) => `${reefPrefix}${type}/${id}`,
  saveResFile: () => `${reefPrefix}job_upload_multi_res_file/`,
  getResFile: (id) => `${reefPrefix}job/${id}/?fields=${joinFilter(resFileFilter)}`,
  unit: () => `${reefPrefix}unit/`,
  handleUnit: (id) => `${reefPrefix}unit/${id}/`
}