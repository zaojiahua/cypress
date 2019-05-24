<template>
  <Form :model="JobAttrFrom" :label-width="80">
    <Form-item label="用例名称:">
      <Input v-model="JobAttrFrom.job_name" placeholder="请输入"/>
    </Form-item>
    <Form-item label="测试用途:">
      <Select v-model="checkJobTestArea" multiple placeholder="请选择" filterable>
        <Option v-for="item in JobTestArea" :value="item.id" :key="item.id">{{ item.description }}</Option>
      </Select>
    </Form-item>
    <Form-item label="自定义标签:">
      <Select v-model="checkCustomTag" multiple placeholder="请选择" filterable>
        <Option v-for="item in CustomTag" :value="item.id" :key="item.id">{{ item.custom_tag_name }}</Option>
      </Select>
    </Form-item>
    <Form-item label="用例说明:">
      <Input v-model="JobAttrFrom.description" placeholder="请输入"/>
    </Form-item>
    <Form-item label="厂商信息:">
      <div>
      <Select v-model="checkManufacturer" placeholder="请选择" @on-change="show" filterable>
        <Option v-for="item in manufacturer" :value="item.id" :key="item.id">{{ item.manufacturer_name }}</Option>
      </Select></div>
    </Form-item>
    <Form-item label="适配机型:">
      <Select v-model="checkPhoneModel" multiple :disabled="disabled" placeholder="请选择" filterable>
        <div v-if="checkManufacturerList">
          <Option v-for="item in checkManufacturerList.phonemodel" :value="item.id" :key="item.id">{{ item.phone_model_name }}</Option>
        </div>
      </Select>
    </Form-item>
    <Form-item label="ROM版本:">
      <Select v-model="checkRomVersion" multiple :disabled="disabled" placeholder="请选择" filterable @on-change="showRom">
        <div v-if="checkManufacturerList">
        <Option v-for="item in checkManufacturerList.romversion" :value="item.id" :key="item.id">{{ item.version }}</Option>
        </div>
      </Select>
    </Form-item>
    <Form-item label="适配系统:">
      <Select v-model="checkAndroidVersion" multiple placeholder="请选择">
        <Option v-for="item in androidVersion" :value="item.id" :key="item.id">{{ item.version }}</Option>
      </Select>
    </Form-item>
    <Form-item>
      <Button type="success">提交</Button>
      <Button type="error" style="margin-left: 8px">取消</Button>
    </Form-item>
  </Form>
</template>
<script>
import { getJobDetail, getManufacturerList, getAndroidVersionList, getCustomTagList, getJobTestAreaList } from '../api/jobAttr'

export default {
  name: 'jobAttr',
  data () {
    return {
      JobAttrFrom: {
      },
      JobTestArea: [],
      checkJobTestArea: [],
      CustomTag: [],
      checkCustomTag: [],
      manufacturer: [],
      checkManufacturer: '',
      androidVersion: [],
      checkAndroidVersion: [],
      checkPhoneModel: [],
      checkRomVersion: [],
      disabled: true,
      checkManufacturerList: {}
    }
  },
  methods: {
    jobView (id) {
      getJobDetail(id).then(res => {
        this.JobAttrFrom = res.data
      }).catch(err => {
      })
      getManufacturerList().then(res => {
        this.manufacturer = res.data.manufacturers
      }).catch(err => {
      })

      getAndroidVersionList().then(res => {
        this.androidVersion = res.data.androidversions
      }).catch(err => {
      })

      getCustomTagList().then(res => {
        this.CustomTag = res.data.customtags
      }).catch(err => {
      })

      getJobTestAreaList().then(res => {
        this.JobTestArea = res.data.jobtestareas
      }).catch(err => {
      })
    },
    show () {
      console.log('checkManufacturer', this.checkManufacturer)
      console.log('checkManufacturerList', this.checkManufacturerList)
    },
    showRom () {
      // console.log('ManufacturerList', this.checkManufacturerList)
      // console.log('ROM', this.checkRomVersion)
    }
  },
  // computed: {
  //   checkManufacturerList: function () {
  //     let items = this.manufacturer
  //     for (let index in items) { // 千万别这样做
  //       console.log(items[index])
  //       if (this.checkManufacturer === items[index].id) return items[index]
  //     }
  //   }
  // },
  watch: {
    checkManufacturer () {
      this.disabled = false

      let items = this.manufacturer
      for (let item of items) {
        if (this.checkManufacturer === item.id) this.checkManufacturerList = item
      }

      console.log(this.checkManufacturerList)
      // this.manufacturer.forEach(item => {
      //   if (item.id === this.checkManufacturer) {
      //     console.log(item)
      //     this.checkManufacturerList = item
      //   }
      // })
    }
  },
  mounted () {
    this.jobView(this.$route.params.id)
  }
}
</script>
