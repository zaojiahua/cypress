<template>
  <Form :label-width="80">
    <Form-item label="用例名称:">
      <Input v-model="jobInfo.job_name" placeholder="请输入"/>
    </Form-item>
    <Form-item label="测试用途:">
      <Select v-model="jobInfo.test_area" multiple placeholder="请选择" filterable>
        <Option v-for="item in jobTestArea.jobtestareas" :value="item.id" :key="item.id">{{ item.description }}</Option>
      </Select>
    </Form-item>
    <Form-item label="自定义标签:">
      <Select v-model="jobInfo.custom_tag" multiple placeholder="请选择" filterable>
        <Option v-for="item in customTag.customtags" :value="item.id" :key="item.id">{{ item.custom_tag_name }}</Option>
      </Select>
    </Form-item>
    <Form-item label="用例说明:">
      <Input v-model="jobInfo.description" placeholder="请输入"/>
    </Form-item>
    <Form-item label="厂商信息:">
      <div>
      <Select v-model="manufacturer_id" placeholder="请选择" @on-change="clear" filterable>
        <Option v-for="item in manufacturer.manufacturers" :value="item.id" :key="item.id">{{ item.manufacturer_name }}</Option>
      </Select></div>
    </Form-item>
    <Form-item label="适配机型:">
      <Select v-model="jobInfo.phone_models" multiple :disabled="disabled" placeholder="请选择" filterable>
          <Option v-for="item in checkManufacturerList.phonemodel" :value="item.id" :key="item.id">{{ item.phone_model_name }}</Option>
      </Select>
    </Form-item>
    <Form-item label="ROM版本:">
      <Select v-model="jobInfo.rom_version" multiple :disabled="disabled" placeholder="请选择" filterable>
        <Option v-for="item in checkManufacturerList.romversion" :value="item.id" :key="item.id">{{ item.version }}</Option>
      </Select>
    </Form-item>
    <Form-item label="适配系统:">
      <Select v-model="jobInfo.android_version" multiple placeholder="请选择">
        <Option v-for="item in androidVersion.androidversions" :value="item.id" :key="item.id">{{ item.version }}</Option>
      </Select>
    </Form-item>
    <Form-item>
      <Button type="success" @click="submit(propJobId)">提交</Button>
      <Button type="error" style="margin-left: 8px">取消</Button>
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
    propJobMsgLoad: {
      type: Boolean,
      default: false
    },
    propJobId: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      manufacturer_id: null,
      checkManufacturerList: {},
      disabled: true,
      isError: false,
      jobInfo: {
        test_area: [],
        android_version: [],
        custom_tag: [],
        phone_models: [],
        rom_version: [],
        job_label: '',
        job_name: '',
        description: ''
      },
      job: util.validate(jobSerializer, {}),
      manufacturer: util.validate(manufacturerSerializer, {}),
      androidVersion: util.validate(androidVersionSerializer, {}),
      customTag: util.validate(customTagSerializer, {}),
      jobTestArea: util.validate(jobTestAreaSerializer, {})
    }
  },
  methods: {
    getMsg () {
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

      getJobDetail(this.propJobId).then(res => {
        this.job = util.validate(jobSerializer, res.data)
        this._jobMsgView()
      })
        .catch(error => {
          this.isError = true
          let errorMsg = ''
          if (error.response.status >= 500) {
            errorMsg = '服务器错误！'
          } else {
            errorMsg = `id 为${this.propJobId}的job 不存在`
          }
          this.$Message.error(errorMsg)
          this.$Loading.error()
        })
    },
    _jobMsgView () {
      this.jobInfo.job_name = this.job.job_name
      this.jobInfo.description = this.job.description
      this.jobInfo.job_label = this.job.job_label

      this.job.test_area.forEach(item => {
        this.jobInfo.test_area.push(item.id)
      })

      this.job.android_version.forEach(item => {
        this.jobInfo.android_version.push(item.id)
      })

      this.job.custom_tag.forEach(item => {
        this.jobInfo.custom_tag.push(item.id)
      })
      this.manufacturer_id = this.job.phone_models[0].manufacturer.id
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
    },
    submit: function (id) {
      if (this.isError) {
        this.$Message.error('失败操作')
      } else {
        patchUpdateJob(id, this.jobInfo).then(res => {
          console.log(res)
          this.$Message.info('ok')
        }).catch(error => {
          console.log(error)
        })
      }
    }
  },
  watch: {
    manufacturer_id () {
      this.disabled = false
      this.manufacturer.manufacturers.forEach(item => {
        if (item.id === this.manufacturer_id) {
          this.checkManufacturerList = item
        }
      })
    },
    propJobId () {
      if (this.propJobMsgLoad && this.propJobId) this.getMsg()
    }
  }
}
</script>
