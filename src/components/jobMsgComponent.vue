<template>
  <Drawer title="用例详情" :closable="false" v-model="$store.state.showDrawer" width="30" @on-close="closeDrawer">
    <Divider orientation="left">
      <b>用例信息</b>
      <div  class="inner-job">
        <Checkbox v-model="isInnerJob">Inner Job</Checkbox>
      </div>
    </Divider>
    <Form ref="formInfo" :label-width="100" :model='formInfo'>
      <FormItem label="用例名称:" prop="job_name">
        <Input v-model="formInfo.job_name" placeholder="请输入"/>
      </FormItem>
      <FormItem label="测试用途:" prop="test_area">
        <Select v-model="formInfo.test_area" multiple placeholder="请选择" filterable allow-create>
          <Option v-for="item in jobTestArea.jobtestareas" :value="item.id" :key="item.id">{{ item.description }}</Option>
        </Select>
      </FormItem>
      <FormItem label="自定义标签:" prop="custom_tag">
        <Select v-model="formInfo.custom_tag" multiple placeholder="请选择" filterable allow-create>
          <Option v-for="item in customTag.customtags" :value="item.id" :key="item.id">{{ item.custom_tag_name }}</Option>
        </Select>
      </FormItem>
      <FormItem label="用例说明:" prop="description">
        <Input v-model="formInfo.description" placeholder="请输入"/>
      </FormItem>
      <Divider orientation="left" class="device-info-title" style="margin-top: 60px;">
        <b>设备信息</b>
        <Button type="info" @click="selectDevice">选取设备</Button>
      </Divider>
      <FormItem label="厂商信息:" prop="manufacturer">
        <Select v-model="formInfo.manufacturer" placeholder="请选择" @on-change="clear" filterable>
          <Option v-for="item in manufacturer.manufacturers" :value="item.id" :key="item.id">{{ item.manufacturer_name }}</Option>
        </Select>
      </FormItem>
      <FormItem label="适配机型:" prop="phone_models">
        <Select v-model="formInfo.phone_models" multiple :disabled="disabled" placeholder="请选择" filterable>
          <Option v-for="item in checkManufacturerList.phonemodel" :value="item.id" :key="item.id">{{ item.phone_model_name }}</Option>
        </Select>
      </FormItem>
      <FormItem label="ROM版本:" prop="rom_version">
        <Select v-model="formInfo.rom_version" multiple :disabled="disabled" placeholder="请选择" filterable>
          <Option v-for="item in checkManufacturerList.romversion" :value="item.id" :key="item.id">{{ item.version }}</Option>
        </Select>
      </FormItem>
      <FormItem label="适配系统:" prop="android_version">
        <Select v-model="formInfo.android_version" multiple placeholder="请选择">
          <Option v-for="item in androidVersion.androidversions" :value="item.id" :key="item.id">{{ item.version }}</Option>
        </Select>
      </FormItem>
      <div v-show="!isJobEditor" style="float: right;">
        <Button type="success" @click="saveChange" style="margin-right: 20px">保存修改</Button>
        <Button type="info" @click="enterJobEditor">开始编辑</Button>
      </div>
    </Form>
    <job-device-select></job-device-select>
    <Modal v-model="isConflicted" :closable="false" :styles="{top: '42%'}" width="390">
      <div slot="header" style="color:#f60;text-align:center">
        <Icon type="ios-information-circle" style="font-size: 20px;"></Icon>
        <span style="font-size: 18px;">设备信息冲突</span>
      </div>
      <div style="text-align:center;">
        <p style="margin: 20px 0;">当前选择的设备与已填信息冲突，请选择您要进行的操作</p>
      </div>
      <div slot="footer" style="display: flex; justify-content: space-between;">
        <Button @click="handleConflict">取消</Button>
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

import { mapState, mapGetters } from 'vuex'

export default {
  name: 'jobMsgComponent',
  components: { jobDeviceSelect },
  data () {
    return {
      checkManufacturerList: {},
      disabled: true,
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
        // manufacturer: [
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
      isConflicted: false,
      formInfo: {
        job_name: '',
        test_area: '',
        custom_tag: '',
        description: '',
        manufacturer: '',
        phone_models: '',
        rom_version: '',
        android_version: ''
      }
    }
  },
  computed: {
    ...mapState('job', [
      'jobInfo'
    ]),
    ...mapGetters('job', [
      'jobId',
      'manufacturerId'
    ]),
    ...mapState('device', [
      'deviceInfo'
    ]),
    isJobEditor () { // 是否在 JobEditor 页面
      return this.$route.name === 'jobEditor'
    },
    isInnerJob: { // 是否是 InnerJob
      get () {
        return this.$store.state.job.isInnerJob
      },
      set () {
        this.$store.commit('job/setIsInnerJob')
      }
    }
  },
  watch: {
    deviceInfo (val) { // 设备信息变化时检测是否和已填信息发生冲突并进行处理
      if (val === null) return
      let jobInfo = JSON.parse(JSON.stringify(this.jobInfo), null, 2)
      if (!jobInfo.manufacturer) { // 当前 jobInfo 没有厂商信息时则用设备信息直接替换
        this.deviceInfoReplace(false)
        return
      }
      if (jobInfo.manufacturer !== val.manufacturer_id) { // 设备厂商与 jobInfo 厂商不符合时需要解决冲突
        this.handleConflict()
        return
      }

      let same = true
      this.phoneModelFlag = true
      this.romVersionFlag = true
      this.androidVersionFlag = true
      if (!jobInfo.phone_models.includes(val.phone_model_id)) { // 检测适配机型是否冲突
        this.phoneModelFlag = false
        same = false
      }
      if (!jobInfo.rom_version.includes(val.rom_version_id)) { // 检测 ROM 版本是否冲突
        this.romVersionFlag = false
        same = false
      }
      if (!jobInfo.android_version.includes(val.android_version_id)) { // 检测适配系统是否冲突
        this.androidVersionFlag = false
        same = false
      }
      if (!same) { // 有冲突则进行处理
        this.handleConflict()
      } else {
        console.log('有啥不一样')
      }
    },
    manufacturerId (val) { // 当厂商发生变动时刷新列表
      this.refreshManufacturer()
    },
    jobInfo (val) { // jobInfo 更新时同步更新 formInfo
      for (let item in this.formInfo) {
        this.formInfo[item] = val[item]
      }
    }
  },
  methods: {
    enterJobEditor () {
      setTimeout(() => { // 延时关闭右侧抽屉
        this.$store.commit('handleShowDrawer')
        this.closeDrawer()
      }, 800)

      this.$router.push({ // 跳转到 JobEditor
        name: 'jobEditor',
        query: {
          jobId: this.jobId
        }
      })
    },
    clear () { // 当厂商变化时清空 适配机型 与 ROM版本 信息
      let jobInfo = JSON.parse(JSON.stringify(this.jobInfo, null, 2))
      jobInfo.phone_models = []
      jobInfo.rom_version = []
      this.$store.commit('job/setJobInfo', jobInfo)
    },
    refreshManufacturer () {
      this.disabled = false
      this.manufacturer.manufacturers.forEach(item => {
        if (item.id === this.manufacturerId) {
          this.checkManufacturerList = item
        }
      })
    },
    saveChange () { // 保存对点前 Job 的修改
      this.$refs.formInfo.validate((valid) => {
        if (valid) { // 通过验证
          patchUpdateJob(this.jobId, this.jobInfo).then(() => {
            this.$Message.info('修改成功')
          }).catch(error => {
            console.log(error)
          })
        } else { // 验证失败
          this.$Message.warning('请输入完整信息')
        }
      })
    },
    selectDevice () { // 打开设备选取页面
      this.$store.commit('device/setSelectDevice')
    },
    handleConflict () { // 打开或关闭冲突处理面板
      this.isConflicted = !this.isConflicted
    },
    deviceInfoAppend () { // 发生冲突后将选取的设备信息追加
      let jobInfo = JSON.parse(JSON.stringify(this.jobInfo), null, 2)
      if (!this.phoneModelFlag) jobInfo.phone_models.push(this.deviceInfo.phone_model_id)
      if (!this.romVersionFlag) jobInfo.rom_version.push(this.deviceInfo.rom_version_id)
      if (!this.androidVersionFlag) jobInfo.android_version.push(this.deviceInfo.android_version_id)
      this.$store.commit('job/setJobInfo', jobInfo)

      this.handleConflict()
    },
    deviceInfoReplace (toggle = true) { // 发生冲突后用选取的设备信息替换原设备信息
      let jobInfo = JSON.parse(JSON.stringify(this.jobInfo), null, 2)
      jobInfo.manufacturer = this.deviceInfo.manufacturer_id
      jobInfo.phone_models = [this.deviceInfo.phone_model_id]
      jobInfo.rom_version = [this.deviceInfo.rom_version_id]
      jobInfo.android_version = [this.deviceInfo.android_version_id]
      this.$store.commit('job/setJobInfo', jobInfo)

      if (toggle) this.handleConflict()
    },
    closeDrawer () { // 关闭右侧抽屉时检测当前 Job 是否通过验证，并保存 JobInfo
      this.$refs.formInfo.validate((valid) => {
        this.$store.commit('job/setIsValidated', valid)
        if (!valid) {
          this.$Message.warning('请输入完整信息')
        }
      })

      let { jobInfo } = this.$store.state.job
      this.$store.commit('job/setJobInfo', Object.assign(jobInfo, this.formInfo))
    }
  },
  mounted () {
    Promise.all([getManufacturerList(), getAndroidVersionList(), getCustomTagList(), getJobTestAreaList()]).then((res) => {
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
    top: -9px;
    right:-10px;
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
