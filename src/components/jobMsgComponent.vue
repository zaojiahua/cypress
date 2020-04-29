<template>
  <Drawer title="用例详情" :closable="false" v-model="$store.state.showDrawer" width="30" @on-close="closeDrawer">
    <div  class="inner-job">
      <Checkbox v-model="isInnerJob">Inner Job</Checkbox>
    </div>
    <Form ref="jobInfoForm" :label-width="100" :model="$store.state.jobInfo" :rules="jobInfoRules">
      <Divider orientation="left">
        <b>用例信息</b>
      </Divider>
      <FormItem label="用例名称:" prop="job_name">
        <Input v-model="$store.state.jobInfo.job_name" placeholder="请输入"/>
      </FormItem>
      <FormItem label="测试用途:" prop="test_area">
        <Select v-model="$store.state.jobInfo.test_area" multiple placeholder="请选择" filterable allow-create>
          <Option v-for="item in jobTestArea.jobtestareas" :value="item.id" :key="item.id">{{ item.description }}</Option>
        </Select>
      </FormItem>
      <FormItem label="自定义标签:" prop="custom_tag">
        <Select v-model="$store.state.jobInfo.custom_tag" multiple placeholder="请选择" filterable allow-create>
          <Option v-for="item in customTag.customtags" :value="item.id" :key="item.id">{{ item.custom_tag_name }}</Option>
        </Select>
      </FormItem>
      <FormItem label="用例说明:" prop="description">
        <Input v-model="$store.state.jobInfo.description" placeholder="请输入"/>
      </FormItem>
      <Divider orientation="left" class="device-info-title" style="margin-top: 60px;">
        <b>设备信息</b>
        <Button type="info" @click="showDeviceSelectPage">选取设备</Button>
      </Divider>
      <FormItem label="厂商信息:" prop="manufacturers">
        <Select v-model="$store.state.jobInfo.manufacturer" placeholder="请选择" @on-change="clear" filterable>
          <Option v-for="item in manufacturer.manufacturers" :value="item.id" :key="item.id">{{ item.manufacturer_name }}</Option>
        </Select>
      </FormItem>
      <FormItem label="适配机型:" prop="phone_models">
        <Select v-model="$store.state.jobInfo.phone_models" multiple :disabled="disabled" placeholder="请选择" filterable>
            <Option v-for="item in checkManufacturerList.phonemodel" :value="item.id" :key="item.id">{{ item.phone_model_name }}</Option>
        </Select>
      </FormItem>
      <FormItem label="ROM版本:" prop="rom_version">
        <Select v-model="$store.state.jobInfo.rom_version" multiple :disabled="disabled" placeholder="请选择" filterable>
          <Option v-for="item in checkManufacturerList.romversion" :value="item.id" :key="item.id">{{ item.version }}</Option>
        </Select>
      </FormItem>
      <FormItem label="适配系统:" prop="android_version">
        <Select v-model="$store.state.jobInfo.android_version" multiple placeholder="请选择">
          <Option v-for="item in androidVersion.androidversions" :value="item.id" :key="item.id">{{ item.version }}</Option>
        </Select>
      </FormItem>
      <FormItem v-show="this.$route.name !== 'jobEditor'">
        <Button v-show="propEnterBtn" type="info" @click="enterJobEditor" style="float: right;margin-right: 20px">开始编辑</Button>
        <Button v-show="propConfirmBtn" type="success" @click="submit(currentJobId)" style="float: right;margin-right: 20px">保存修改</Button>
      </FormItem>
    </Form>
    <pre>
      {{ JSON.parse(JSON.stringify(this.jobInfo, null, 2)) }}
    </pre>
    <job-device-select></job-device-select>
    <Modal v-model="deviceInfoConflict" :closable="false" :styles="{top: '42%'}" width="390">
      <div slot="header" style="color:#f60;text-align:center">
        <Icon type="ios-information-circle" style="font-size: 20px;"></Icon>
        <span style="font-size: 18px;">设备信息冲突</span>
      </div>
      <div style="text-align:center;">
        <p style="margin: 20px 0;">当前选择的设备与已填信息冲突，请选择您要进行的操作</p>
      </div>
      <div slot="footer" style="display: flex; justify-content: space-between;">
        <Button @click="handleDeviceInfoConflict">取消</Button>
        <div>
          <Button type="success" @click="deviceInfoAppend">追加</Button>
          <Button type="primary" @click="deviceInfoReplace">替换</Button>
        </div>
      </div>
    </Modal>
  </Drawer>
</template>
<script>
import util from '../lib/util/validate.js'

import { patchUpdateJob } from '../api/reef/job'
import { getManufacturerList } from '../api/reef/manufacturer'
import { getJobTestAreaList } from '../api/reef/jobTestArea'
import { getCustomTagList } from '../api/reef/customTag'
import { getAndroidVersionList } from '../api/reef/androidVersion'
import { serializer, jobSerializer } from '../lib/util/jobListSerializer'
import jobDeviceSelect from '../components/jobDeviceSelect'

export default {
  name: 'jobMsgComponent',
  components: { jobDeviceSelect },
  props: {
    propEnterBtn: { // Show delete button
      type: Boolean,
      default: true
    },
    propConfirmBtn: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      // router: '',
      checkManufacturerList: {},
      disabled: true,
      isError: false,
      jobInfoRules: {
        job_name: [
          { required: true, message: '请输入用例名称', trigger: 'blur,change' }
        ],
        test_area: [
          { required: true, type: 'array', min: 1, message: '请输入测试用途', trigger: 'change' }
        ],
        // custom_tag: [
        //   { required: true, type: 'array', min: 1, message: '请输入自定义标签', trigger: 'change' }
        // ],
        // description: [
        //   { required: true, message: '请输入用例说明', trigger: 'blur' }
        // ],
        // manufacturers: [
        //   { required: true, type: 'string', message: '请输入厂商信息', trigger: 'change' }
        // ],
        phone_models: [
          { required: true, type: 'array', min: 1, message: '请输入适配机型', trigger: 'change' }
        ],
        rom_version: [
          { required: true, type: 'array', min: 1, message: '请输入ROM版本', trigger: 'change' }
        ],
        android_version: [
          { required: true, type: 'array', min: 1, message: '请输入适配系统', trigger: 'change' }
        ]
      },
      job: util.validate(jobSerializer, {}),
      manufacturer: util.validate(serializer.getManufacturerSerializer, {}),
      androidVersion: util.validate(serializer.getAndroidVersionSerializer, {}),
      customTag: util.validate(serializer.getCustomTagSerializer, {}),
      jobTestArea: util.validate(serializer.getJobTestAreaSerializer, {}),
      deviceInfoConflict: false
    }
  },
  watch: {
    // 选择设备时检测是否和已填信息发生冲突并进行处理
    selectedDeviceInfo (val) {
      if (val === null) return
      let jobInfo = JSON.parse(JSON.stringify(this.jobInfo), null, 2)
      if (!jobInfo.manufacturer) {
        this.deviceInfoReplace(false)
        return
      }
      if (jobInfo.manufacturer !== val.manufacturer_id) {
        this.handleDeviceInfoConflict()
        return
      }

      let same = true
      this.phoneModelFlag = true
      this.romVersionFlag = true
      this.androidVersionFlag = true
      if (!jobInfo.phone_models.includes(val.phone_model_id)) {
        this.phoneModelFlag = false
        same = false
      }
      if (!jobInfo.rom_version.includes(val.rom_version_id)) {
        this.romVersionFlag = false
        same = false
      }
      if (!jobInfo.android_version.includes(val.android_version_id)) {
        this.androidVersionFlag = false
        same = false
      }
      if (!same) {
        this.handleDeviceInfoConflict()
      } else {
        console.log('有啥不一样')
      }
    },
    // 当厂商发生变动时刷新列表
    manufacturerId (val) {
      this.refreshManufacturer()
    }
  },
  computed: {
    // 当前job的id
    currentJobId () {
      return this.$store.state.jobInfo.job_id
    },
    // 当前已选设备的信息
    selectedDeviceInfo () {
      return this.$store.state.selectedDeviceInfo
    },
    // 已选设备的厂商id
    manufacturerId () {
      return this.$store.state.jobInfo.manufacturer
    },
    jobInfo () {
      return this.$store.state.jobInfo
    },
    isInnerJob: {
      get () {
        return this.$store.state.isInnerJob
      },
      set () {
        this.$store.commit('handleInnerJob')
      }
    }
  },
  methods: {
    enterJobEditor () {
      setTimeout(() => {
        this.$store.commit('handleShowDrawer')
        this.closeDrawer()
      }, 800)
      this.$router.push({
        name: 'jobEditor',
        query: {
          jobId: this.$store.state.jobInfo.job_id
        }

      })
    },
    clear () {
      let jobInfo = JSON.parse(JSON.stringify(this.jobInfo, null, 2))
      jobInfo.phone_models = []
      jobInfo.rom_version = []
      this.$store.commit('setJobInfo', jobInfo)
    },
    refreshManufacturer () {
      this.disabled = false
      this.manufacturer.manufacturers.forEach(item => {
        if (item.id === this.manufacturerId) {
          this.checkManufacturerList = item
        }
      })
    },
    submit (id) {
      if (this.isError) {
        this.$Message.error('失败操作')
      } else {
        this.$refs.jobInfoForm.validate((valid) => {
          if (valid) {
            patchUpdateJob(id, this.jobInfo).then(res => {
              console.log(res)
              this.$Message.info('修改成功')
            }).catch(error => {
              console.log(error)
            })
          } else {
            this.$Message.warning('请输入完整信息')
          }
        })
      }
    },
    showDeviceSelectPage () {
      this.$store.commit('handleShowDeviceSelect', true)

      // window.open('http://10.80.5.138/job-management', '_blank', 'scrollbars=yes,resizable=1,modal=false,alwaysRaised=yes')
    },
    handleDeviceInfoConflict () {
      this.deviceInfoConflict = !this.deviceInfoConflict
    },
    deviceInfoAppend () {
      let jobInfo = JSON.parse(JSON.stringify(this.jobInfo), null, 2)
      if (!this.phoneModelFlag) jobInfo.phone_models.push(this.selectedDeviceInfo.phone_model_id)
      if (!this.romVersionFlag) jobInfo.rom_version.push(this.selectedDeviceInfo.rom_version_id)
      if (!this.androidVersionFlag) jobInfo.android_version.push(this.selectedDeviceInfo.android_version_id)
      this.$store.commit('setJobInfo', jobInfo)

      this.handleDeviceInfoConflict()
    },
    deviceInfoReplace (toggle = true) {
      let jobInfo = JSON.parse(JSON.stringify(this.jobInfo), null, 2)
      jobInfo.manufacturer = this.selectedDeviceInfo.manufacturer_id
      jobInfo.phone_models = [this.selectedDeviceInfo.phone_model_id]
      jobInfo.rom_version = [this.selectedDeviceInfo.rom_version_id]
      jobInfo.android_version = [this.selectedDeviceInfo.android_version_id]
      this.$store.commit('setJobInfo', jobInfo)

      if (toggle) this.handleDeviceInfoConflict()
    },
    closeDrawer () {
      this.$refs.jobInfoForm.validate((valid) => {
        this.$store.commit('setJobInfoValid', valid)
        if (!valid) {
          this.$Message.warning('请输入完整信息')
        }
      })
    }
  },
  mounted () {
    Promise.all([getManufacturerList(), getAndroidVersionList(), getCustomTagList(), getJobTestAreaList()]).then(res => {
      this.manufacturer = util.validate(serializer.getManufacturerSerializer, res[0].data)
      this.androidVersion = util.validate(serializer.getAndroidVersionSerializer, res[1].data)
      this.customTag = util.validate(serializer.getCustomTagSerializer, res[2].data)
      this.jobTestArea = util.validate(serializer.getJobTestAreaSerializer, res[3].data)
    })
  }
}
</script>

<style lang="less" scoped>
  .inner-job {
    position: absolute;
    top: 24px;
    right:8px;
    z-index: 10;
    background-color: white;
    padding: 10px;
  }
  .device-info-title {
    position: relative;

    Button {
      position: absolute;
      right: 0;
      top: -2px;
      z-index: 2;
    }
  }
</style>
