<template>
  <Drawer title="用例详情" :closable="false" v-model="$store.state.showDrawer" width="30" @on-close="closeDrawer">
    <Form ref="form"
      v-if="basicData"
      :model="$store.state.job.jobInfo"
      width="30" :label-width="90"
      label-position="left"
      :rules="validateRules">
       <FormItem label="用例名称" prop="job_name">
        <Input v-model="$store.state.job.jobInfo.job_name" clearable placeholder="请输入用例名称"/>
      </FormItem>
      <FormItem label="测试用途" prop="test_area">
        <Select v-model="$store.state.job.jobInfo.test_area" multiple placeholder="请选择" filterable allow-create>
          <Option v-for="item in basicData[basicData.testArea]" :value="item.id" :key="item.id">{{ item.description }}</Option>
        </Select>
      </FormItem>
      <FormItem label="用例类型" prop="job_type" class="type">
        <Cascader :data="jobTypes" v-model="curJobType"></Cascader>
        <Input v-model="jobTypeString" style="display: none;" disabled />
      </FormItem>
      <FormItem label="自定义标签" prop="custom_tag">
        <Select v-model="$store.state.job.jobInfo.custom_tag" multiple placeholder="请选择" filterable allow-create>
          <Option v-for="item in basicData[basicData.customTag]" :value="item.id" :key="item.id">{{ item.custom_tag_name }}</Option>
        </Select>
      </FormItem>
      <FormItem label="用例说明" prop="description">
        <Input v-model="$store.state.job.jobInfo.description" clearable placeholder="请输入说明信息" />
      </FormItem>
      <Divider orientation="left" class="device-info-title" style="margin-top: 60px;">
        <b>设备信息</b>
        <Button type="info" @click="$store.commit('device/setSelectDevice')">选取设备</Button>
      </Divider>
      <FormItem label="厂商信息" prop="manufacturer">
        <Select v-model="$store.state.job.jobInfo.manufacturer" placeholder="请选择" @on-change="clear" filterable>
          <Option v-for="item in basicData[basicData.manufacturer]" :value="item.id" :key="item.id">{{ item.manufacturer_name }}</Option>
        </Select>
      </FormItem>
      <FormItem label="适配机型" prop="phone_models">
        <Select v-model="$store.state.job.jobInfo.phone_models" multiple :disabled="disabled" placeholder="请选择" filterable>
          <Option v-for="item in curManufacturer.phonemodel" :value="item.id" :key="item.id">{{ item.phone_model_name }}</Option>
        </Select>
      </FormItem>
      <FormItem label="ROM版本" prop="rom_version">
        <Select v-model="$store.state.job.jobInfo.rom_version" multiple :disabled="disabled" placeholder="请选择" filterable>
          <Option v-for="item in curManufacturer.romversion" :value="item.id" :key="item.id">{{ item.version }}</Option>
        </Select>
      </FormItem>
      <FormItem label="适配系统" prop="android_version">
        <Select v-model="$store.state.job.jobInfo.android_version" multiple placeholder="请选择">
          <Option v-for="item in basicData[basicData.androidVersion]" :value="item.id" :key="item.id">{{ item.version }}</Option>
        </Select>
      </FormItem>
      <div v-show="!isJobEditor" style="float: right;">
        <Button type="success" @click="saveChange" style="margin-right: 1em">保存修改</Button>
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
import util from 'lib/util/validate.js'
import { jobSerializer } from 'lib/util/jobListSerializer'
import { controlDevice, releaseOccupyDevice, updateJobMsg } from 'api/reef/request'
import jobDeviceSelect from '../components/jobDeviceSelect'
import { shouldCreateNewTag, createNewTag } from 'lib/tools'

import { mapState, mapGetters } from 'vuex'

export default {
  name: 'jobMsgComponent',
  components: { jobDeviceSelect },
  data () {
    return {
      curManufacturer: {},
      disabled: true,
      validateRules: {
        job_name: [{
          required: true, message: '用例名称不能为空', trigger: 'blur,change'
        }],
        test_area: [{
          required: true, type: 'array', min: 1, message: '测试用途不能为空', trigger: 'change'
        }],
        job_type: [{
          required: true, type: 'string', message: '用例类型不能为空', trigger: 'change'
        }],
        manufacturer: [{
          required: true, type: 'number', message: '厂商信息不能为空', trigger: 'change'
        }],
        phone_models: [{
          required: true, type: 'array', min: 1, message: '适配机型不能为空', trigger: 'change'
        }],
        rom_version: [{
          required: true, type: 'array', min: 1, message: 'ROM版本不能为空', trigger: 'change'
        }],
        android_version: [{
          required: true, type: 'array', min: 1, message: '适配系统不能为空', trigger: 'change'
        }]
      },
      job: util.validate(jobSerializer, {}),
      isConflicted: false,
      jobTypes: [
        {
          value: 'Joblib',
          label: '功能测试',
          children: []
        },
        {
          value: 'InnerJob',
          label: '内嵌用例',
          children: []
        },
        {
          value: 'PerfJob',
          label: '性能测试',
          children: [
            {
              value: 'TimeJob',
              label: '启动时间'
            }
          ]
        }
      ],
      curJobType: []
    }
  },
  computed: {
    ...mapState(['showDrawer', 'basicData']),
    ...mapState('job', ['jobInfo', 'draftId']),
    ...mapGetters('job', ['jobId']),
    ...mapState('device', ['deviceInfo', 'preDeviceInfo', 'countdown']),
    isJobEditor () { // 是否在 JobEditor 页面
      return this.$route.name === 'jobEditor'
    },
    manufacturer () {
      return this.basicData[this.basicData.manufacturer]
    },
    jobTypeString: {
      get: function () {
        return this.curJobType.join('/')
      },
      set: function (val) {

      }
    }
  },
  watch: {
    jobInfo (val) {
      if (val.job_type) {
        this.curJobType.splice(0, 1, val.job_type)
      } else {
        this.curJobType.splice(0, 1)
      }
      if (val.job_second_type) {
        this.curJobType.splice(1, 1, val.job_second_type)
      } else {
        this.curJobType.splice(1, 1)
      }
    },
    showDrawer (val) {
      if (val === false && !this.isJobEditor) this.$store.commit('job/handleJobInfo', { action: 'recoverJobInfo' })
    },
    deviceInfo (newVal, oldVal) { // 设备信息变化时检测是否和已填信息发生冲突并进行处理
      this.$store.commit('device/setPreDeviceInfo', oldVal)
      this.checkConflict(false, true)
    },
    'jobInfo.manufacturer' (val) { // 当厂商发生变动时刷新列表
      this.resetManufacturter()
    },
    curJobType (val) {
      this.$set(this.jobInfo, 'job_type', val[0])
      this.$set(this.jobInfo, 'job_second_type', val[1])
    }
  },
  methods: {
    enterJobEditor () {
      setTimeout(() => { // 延时关闭右侧抽屉
        this.$store.commit('handleShowDrawer')
        this.closeDrawer()
      }, 800)

      if (this.draftId) {
        updateJobMsg(this.draftId, { job_deleted: true }).then(({ status }) => {
          if (status === 200) {
          } else {
            console.log('删除自动备份文件失败，错误码: ' + status)
          }
          this.$store.commit('job/setDraftId', null)
        }).catch(err => {
          console.log(err)
        })
      }

      // 清空失效的数据
      this.$store.commit('job/setOuterDiagramModel', null)
      this.$store.commit('job/handleJobInfo', { action: 'setPreJobInfo', data: false })
      this.$store.commit('files/handleResFiles', { action: 'clearResFiles' })

      if (this.countdown) {
        this.checkConflict(true, false)
      }

      this.$router.push({ // 跳转到 JobEditor
        name: 'jobEditor',
        query: {
          jobId: this.jobId
        }
      })
    },
    clear () { // 当厂商变化时清空 适配机型 与 ROM版本 信息
      this.jobInfo.phone_models = []
      this.jobInfo.rom_version = []
    },
    resetManufacturter () {
      for (let i = 0; i < this.manufacturer.length; i++) {
        if (this.manufacturer[i].id === this.jobInfo.manufacturer) {
          this.curManufacturer = this.manufacturer[i]
          this.disabled = false
          break
        }
      }
    },
    async controlDevice () {
      if (this.preDeviceInfo) {
        try {
          // eslint-disable-next-line camelcase
          let { id, device_name } = this.preDeviceInfo
          let { status } = await releaseOccupyDevice({
            device_id_list: [id]
          })
          if (status === 200) {
            this.$Message.success({
              background: true,
              // eslint-disable-next-line camelcase
              content: `成功释放设备 ${device_name}`
            })
            this.$store.commit('device/setCountdown')
          }
        } catch (error) {
          console.log(error)
        }
      }
      try {
        // eslint-disable-next-line camelcase
        let { id, device_name } = this.deviceInfo
        let { status } = await controlDevice({
          device_id_list: [id],
          occupy_type: 'job_editor'
        })
        if (status === 200) {
          this.$Message.success({
            background: true,
            // eslint-disable-next-line camelcase
            content: `成功占用设备 ${device_name}`
          })
          this.$store.commit('device/setCountdown', true)
        }
      } catch (error) {
        console.log(error)
      }
    },
    saveChange () { // 保存对当前 Job 的修改
      this.$refs.form.validate(async (valid) => {
        if (shouldCreateNewTag('test_area', this.jobInfo)) {
          let data = await createNewTag('test_area', this.jobInfo)
          this.$store.dispatch('setBasicTestArea')
          setTimeout(() => {
            this.$store.commit('job/setJobTestArea', data)
          }, 400)
        }
        if (shouldCreateNewTag('custom_tag', this.jobInfo)) {
          let data = await createNewTag('custom_tag', this.jobInfo)
          this.$store.dispatch('setBasicCustomTag')
          setTimeout(() => {
            this.$store.commit('job/setJobCustomTag', data)
          }, 400)
        }
        if (valid) { // 通过验证
          setTimeout(() => {
            updateJobMsg(this.jobId, this.jobInfo).then(() => {
              this.$Message.info('修改成功')
              this.$store.commit('refreshJobList')
            }).catch(error => {
              console.log(error)
            })
          }, 400)
        } else { // 验证失败
          this.$Message.warning({
            background: true,
            content: '请输入完整信息'
          })
        }
      })
    },
    handleConflict () { // 打开或关闭冲突处理面板
      this.isConflicted = !this.isConflicted
    },
    deviceInfoAppend () { // 发生冲突后将选取的设备信息追加
      if (!this.phoneModelFlag) this.jobInfo.phone_models.push(this.deviceInfo.phone_model_id)
      if (!this.romVersionFlag) this.jobInfo.rom_version.push(this.deviceInfo.rom_version_id)
      if (!this.androidVersionFlag) this.jobInfo.android_version.push(this.deviceInfo.android_version_id)
      this.controlDevice()
      this.handleConflict()
    },
    deviceInfoReplace (toggle = true) { // 发生冲突后用选取的设备信息替换原设备信息
      if (!this.deviceInfo) return
      this.$set(this.jobInfo, 'manufacturer', this.deviceInfo.manufacturer_id)
      this.$set(this.jobInfo, 'phone_models', [])
      this.jobInfo.phone_models.push(this.deviceInfo.phone_model_id)
      this.$set(this.jobInfo, 'rom_version', [])
      this.jobInfo.rom_version.push(this.deviceInfo.rom_version_id)
      this.$set(this.jobInfo, 'android_version', [])
      this.jobInfo.android_version.push(this.deviceInfo.android_version_id)
      this.controlDevice()
      if (toggle) this.handleConflict()
    },
    closeDrawer () { // 关闭右侧抽屉时检测当前 Job 是否通过验证，并更新 JobInfo
      if (this.isJobEditor) {
        this.$refs.form.validate((valid) => {
          this.$store.commit('job/setIsValidated', valid)
          if (!valid) {
            this.$Message.warning({
              background: true,
              content: '请输入完整信息'
            })
          }
        })
      }
    },
    async checkConflict (formToggle, deviceToggle) {
      if (!this.jobInfo || !this.deviceInfo) return
      if (deviceToggle) {
        if (!this.jobInfo.manufacturer) {
          this.deviceInfoReplace(false)
          return
        }
        if (this.jobInfo.manufacturer !== this.deviceInfo.manufacturer_id) {
          this.handleConflict()
          return
        }
        let same = true
        this.phoneModelFlag = true
        this.romVersionFlag = true
        this.androidVersionFlag = true
        if (!this.jobInfo.phone_models.includes(this.deviceInfo.phone_model_id)) {
          this.phoneModelFlag = false
          same = false
        }
        if (!this.jobInfo.rom_version.includes(this.deviceInfo.rom_version_id)) { // 检测 ROM 版本是否冲突
          this.romVersionFlag = false
          same = false
        }
        if (!this.jobInfo.android_version.includes(this.deviceInfo.android_version_id)) { // 检测适配系统是否冲突
          this.androidVersionFlag = false
          same = false
        }
        if (!same) { // 有冲突则进行处理
          this.handleConflict()
        } else {
          this.controlDevice()
        }
      }
      if (formToggle) {
        if (!this.deviceInfo) return
        if (
          this.jobInfo.manufacturer !== this.deviceInfo.manufacturer_id ||
          !this.jobInfo.phone_models.includes(this.deviceInfo.phone_model_id) ||
          !this.jobInfo.rom_version.includes(this.deviceInfo.rom_version_id) ||
          !this.jobInfo.android_version.includes(this.deviceInfo.android_version_id)
        ) {
          let { status } = await releaseOccupyDevice({
            device_id_list: [this.deviceInfo.id]
          })
          if (status === 200) {
            this.$Message.warning({
              background: true,
              content: '当前设备与 Job 冲突，已自动释放。'
            })
          }
          this.$store.commit('device/setCountdown')
        }
      }
    }
  },
  mounted () {
    if (!this.basicData) this.$store.dispatch('setBasicData')
  }
}
</script>

<style lang="less" scoped>
@import '../css/common.less';
  .device-info-title {
    position: relative;

    Button {
      position: absolute;
      right: 0;
      top: -2px;
      z-index: 2;
    }
  }
  // .type {
  //   /deep/ & > .ivu-form-item-content {
  //     display: flex;
  //     justify-content: space-between;
  //     align-items: center;
  //   }
  // }
</style>
