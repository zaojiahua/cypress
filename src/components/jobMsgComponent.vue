<template>
  <Form ref="jobInfoForm" :label-width="100" :model="jobInfo" :rules="jobInfoRules">
    <Form-item label="用例名称:" prop="job_name">
      <Input v-model="jobInfo.job_name" placeholder="请输入"/>
    </Form-item>
    <Form-item label="测试用途:" prop="test_area">
      <Select v-model="jobInfo.test_area" multiple placeholder="请选择" filterable>
        <Option v-for="item in jobTestArea.jobtestareas" :value="item.id" :key="item.id">{{ item.description }}</Option>
      </Select>
    </Form-item>
    <Form-item label="自定义标签:" prop="custom_tag">
      <Select v-model="jobInfo.custom_tag" multiple placeholder="请选择" filterable>
        <Option v-for="item in customTag.customtags" :value="item.id" :key="item.id">{{ item.custom_tag_name }}</Option>
      </Select>
    </Form-item>
    <Form-item label="用例说明:" prop="description">
      <Input v-model="jobInfo.description" placeholder="请输入"/>
    </Form-item>
    <Form-item label="厂商信息:" prop="manufacturers">
      <div>
      <Select v-model="jobInfo.manufacturer" placeholder="请选择" @on-change="clear" filterable>
        <Option v-for="item in manufacturer.manufacturers" :value="item.id" :key="item.id">{{ item.manufacturer_name }}</Option>
      </Select></div>
    </Form-item>
    <Form-item label="适配机型:" prop="phone_models">
      <Select v-model="jobInfo.phone_models" multiple :disabled="disabled" placeholder="请选择" filterable>
          <Option v-for="item in checkManufacturerList.phonemodel" :value="item.id" :key="item.id">{{ item.phone_model_name }}</Option>
      </Select>
    </Form-item>
    <Form-item label="ROM版本:" prop="rom_version">
      <Select v-model="jobInfo.rom_version" multiple :disabled="disabled" placeholder="请选择" filterable>
        <Option v-for="item in checkManufacturerList.romversion" :value="item.id" :key="item.id">{{ item.version }}</Option>
      </Select>
    </Form-item>
    <Form-item label="适配系统:" prop="android_version">
      <Select v-model="jobInfo.android_version" multiple placeholder="请选择">
        <Option v-for="item in androidVersion.androidversions" :value="item.id" :key="item.id">{{ item.version }}</Option>
      </Select>
    </Form-item>
    <Form-item>
      <Button v-show="propConfirmBtn" type="success" @click="submit(currentJobId)" style="float: right;margin-right: 20px">提交</Button>
      <Button v-show="propEnterBtn" type="info" @click="routerTo" style="float: right;margin-right: 20px">进入</Button>
    </Form-item>
  </Form>
</template>
<script>
import util from '../lib/util/validate.js'
import { getJobDetail, patchUpdateJob } from '../api/reef/job'
import { getManufacturerList } from '../api/reef/manufacturer'
import { getJobTestAreaList } from '../api/reef/jobTestArea'
import { getCustomTagList } from '../api/reef/customTag'
import { getAndroidVersionList } from '../api/reef/androidVersion'

const jobSerializer = {
  android_version: [
    {
      id: 'number',
      version: 'string'
    }
  ],
  author: {
    id: 'number',
    username: 'string'
  },
  custom_tag: [
    {
      id: 'number',
      custom_tag_name: 'string'
    }
  ],
  description: 'string',
  id: 'number',
  job_label: 'string',
  job_name: 'string',
  job_type: 'string',
  phone_models: [
    {
      id: 'number',
      phone_model_name: 'string',
      manufacturer: {
        id: 'number',
        manufacturer_name: 'string'
      }
    }
  ],
  rom_version: [
    {
      id: 'number',
      version: 'string',
      manufacturer: {
        id: 'number',
        manufacturer_name: 'string'
      }
    }
  ],
  test_area: [
    {
      id: 'number',
      description: 'string'
    }
  ]
}

const manufacturerSerializer = {
  manufacturers: [
    {
      id: 'number',
      manufacturer_name: 'string',
      phonemodel: [
        {
          id: 'number',
          phone_model_name: 'string'
        }],
      romversion: [{
        id: 'number',
        version: 'string'
      }]
    }]
}

const androidVersionSerializer = {
  androidversions: [
    {
      id: 'number',
      version: 'string'
    }
  ]
}

const customTagSerializer = {
  customtags: [
    {
      id: 'number',
      custom_tag_name: 'string'
    }
  ]
}

const jobTestAreaSerializer = {
  jobtestareas: [
    {
      id: 'number',
      description: 'string'
    }
  ]
}

export default {
  name: 'jobMsgComponent',
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
      currentJobId: null,
      checkManufacturerList: {},
      disabled: true,
      isError: false,
      jobInfo: {
        manufacturer: '',
        test_area: [],
        job_type: 'Joblib',
        android_version: [],
        custom_tag: [],
        phone_models: [],
        rom_version: [],
        job_label: '',
        job_name: '',
        description: ''
      },
      jobInfoRules: {
        job_name: [
          { required: true, message: '请输入用例名称', trigger: 'blur' }
        ],
        test_area: [
          { required: true, type: 'array', min: 1, message: '请输入测试用途', trigger: 'change' }
        ],
        custom_tag: [
          { required: true, type: 'array', min: 1, message: '请输入自定义标签', trigger: 'change' }
        ],
        description: [
          { required: true, message: '请输入用例说明', trigger: 'blur' }
        ],
        manufacturer: [
          { required: true, message: '请输入厂商信息', trigger: 'change' }
        ],
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
      manufacturer: util.validate(manufacturerSerializer, {}),
      androidVersion: util.validate(androidVersionSerializer, {}),
      customTag: util.validate(customTagSerializer, {}),
      jobTestArea: util.validate(jobTestAreaSerializer, {})
    }
  },
  methods: {
    routerTo () {
      this.$router.push({ name: 'jobEditor', query: { jobLabel: this.job.job_label } })
    },
    getMsg (jobId = null) {
      this.currentJobId = jobId
      getManufacturerList().then(res => {
        this.manufacturer = util.validate(manufacturerSerializer, res.data)
      })
      getAndroidVersionList().then(res => {
        this.androidVersion = util.validate(androidVersionSerializer, res.data)
      })

      getCustomTagList().then(res => {
        this.customTag = util.validate(customTagSerializer, res.data)
      })

      getJobTestAreaList().then(res => {
        this.jobTestArea = util.validate(jobTestAreaSerializer, res.data)
      })
      if (jobId === null) return
      getJobDetail(jobId).then(res => {
        this.job = util.validate(jobSerializer, res.data)
        // this.router = `/jobEditor?jobLabel=${this.job.job_label}`
        this._jobMsgView()
      })
        .catch(error => {
          this.isError = true
          let errorMsg = ''
          if (error.response.status >= 500) {
            errorMsg = '服务器错误！'
          } else {
            errorMsg = `id 为${this.currentJobId}的job 不存在`
          }
          this.$Message.error(errorMsg)
          this.$Loading.error()
        })
    },
    _jobMsgView () {
      this.jobInfo.job_name = this.job.job_name
      this.jobInfo.description = this.job.description
      this.jobInfo.job_label = this.job.job_label
      this.jobInfo.job_type = this.job.job_type
      this.jobInfo.author = localStorage.id

      // // 清空操作,避免重复
      this.jobInfo.test_area = []
      this.jobInfo.android_version = []
      this.jobInfo.custom_tag = []
      this.jobInfo.phone_models = []
      this.jobInfo.rom_version = []

      this.job.test_area.forEach(item => {
        this.jobInfo.test_area.push(item.id)
      })

      this.job.android_version.forEach(item => {
        this.jobInfo.android_version.push(item.id)
      })

      this.job.custom_tag.forEach(item => {
        this.jobInfo.custom_tag.push(item.id)
      })
      if (this.job.phone_models.length !== 0) {
        // 获取Manufacturer保证phone_models romverison来自于同一个manufacturer
        this.jobInfo.manufacturer = this.job.phone_models[0].manufacturer.id
        this.refreshManufacturer()
      }
      this.job.phone_models.forEach(item => {
        this.jobInfo.phone_models.push(item.id)
      })

      this.job.rom_version.forEach(item => {
        this.jobInfo.rom_version.push(item.id)
      })
    },
    clear: function () {
      this.jobInfo.phone_models = []
      this.jobInfo.rom_version = []
      this.refreshManufacturer()
    },
    refreshManufacturer () {
      this.disabled = false
      this.manufacturer.manufacturers.forEach(item => {
        if (item.id === this.jobInfo.manufacturer) {
          this.checkManufacturerList = item
        }
      })
    },
    submit: function (id) {
      if (this.isError) {
        this.$Message.error('失败操作')
      } else {
        this.$refs.jobInfoForm.validate((valid) => {
          if (valid) {
            patchUpdateJob(id, this.jobInfo).then(res => {
              console.log(res)
              this.$Message.info('ok')
            }).catch(error => {
              console.log(error)
            })
          } else {
            this.$Message.warning('请输入完整信息')
          }
        })
      }
    }
  }
}
</script>
