<template>
  <div style="position: relative; margin-bottom: 10px;">
    <Button @click="deviceRefresh" type="primary" class="refresh">刷新列表</Button>
    <Divider orientation="left">获取图片</Divider>
    <Table border
      size="small"
      :loading="loading"
      highlight-row
      max-height="200"
      @on-row-click="onDeviceRowClick"
      :columns="deviceColumns"
      :data="deviceData">
    </Table>
    <div class="get-image">
      <div style="display: flex; align-items: center; width: 66%;">
        <Input v-model="currentImgName" v-if="itemType === 'picInput' ? false : true">
          <span slot="prepend">图片名称</span>
        </Input>
      </div>
      <Button type="primary" :loading="loading" @click="getImg">
        <span v-if="!loading">{{ itemType === 'picInput' ? '获取截图' : 'commit' }}</span>
        <span v-else>Loading...</span>
     </Button>
    </div>
  </div>
</template>

<script>
import { getUsableDeviceList } from '../api/reef/device.js'
import { getScreenShot } from '../api/coral/jobLibSvc.js'

import { blobToDataURL, suffixAutoRemove, suffixAutoComplete } from '../lib/tools.js'

import util from '../lib/util/validate.js'

const deviceSerializer = [
  {
    android_version: {
      version: 'string'
    },
    device_name: 'string',
    id: 'number',
    phone_model: {
      phone_model_name: 'string'
    },
    rom_version: {
      version: 'string'
    }
  }
]

export default {
  props: {
    imgName: {
      type: String,
      default: ''
    },
    itemType: {
      type: String,
      default: 'jobResourcePicture'
    }
  },
  data () {
    return {
      loading: false,
      deviceColumns: [
        {
          title: '名称',
          key: 'device_name',
          align: 'center'
        },
        {
          title: '型号',
          key: 'phone_model',
          align: 'center'
        },
        {
          title: '安卓版本',
          key: 'android_version',
          align: 'center'
        },
        {
          title: 'ROM版本',
          key: 'rom_version',
          align: 'center'
        }
      ],
      deviceData: [],
      currentDeviceRow: -1,
      currentImgName: '',
      suffixs: []
    }
  },
  methods: {
    onDeviceRowClick (row, index) {
      this.currentDeviceRow = index
    },
    deviceRefresh () {
      getUsableDeviceList().then(res => {
        this.deviceData = util.validate(deviceSerializer, res.data['devices'])
        this.deviceData.forEach(device => {
          device.phone_model = device.phone_model.phone_model_name
          device.rom_version = device.rom_version.version
          device.android_version = device.android_version.version
        })
      })
    },
    handleSearch (value) {
      this.suffixs = !value || value.indexOf('.') >= 0 ? [] : [
        value + '.jpg'
      ]
    },
    getImg () {
      let errors = []
      if (this.currentDeviceRow === -1) errors.push('未选择 device')
      if (errors.length) {
        errors.forEach(error => {
          this.$Message.error({
            background: true,
            content: error
          })
        })
        return
      }
      const currentDevice = this.deviceData[this.currentDeviceRow]
      this.loading = true
      this.$bus.emit('isLoading')

      let imgName = suffixAutoComplete(this.currentImgName, '.jpg')
      if (this.itemType === 'jobResourcePicture') this.$emit('setImgName', imgName)
      let getScreenShotParams = {
        device_label: currentDevice.device_label,
        device_ip: currentDevice.ip_address,
        picture_name: imgName
      }
      getScreenShot(getScreenShotParams).then(res => {
        if (res.status === 200) {
          blobToDataURL(res.data).then(res => {
            this.$bus.emit('showFile', {
              'fileToShow': res,
              'itemType': this.itemType,
              'isScreenShot': true
            })
            this.$bus.emit('isLoading')
            if (this.itemType === 'jobResourcePicture') {
              this.$bus.emit('addResFile', {
                'name': imgName,
                'type': 'jpg',
                'file': res,
                'fileUrl': ''
              })
            }
          })
        } else if (res.status === 500) {
          console.log(res)
        }
        this.loading = false
      })
    }
  },
  watch: {
    imgName (val) {
      this.currentImgName = suffixAutoRemove(val)
    },
    currentImgName (val) {
      this.currentImgName = suffixAutoRemove(val)
    }
  },
  mounted () {
    this.deviceRefresh()
    this.currentImgName = suffixAutoRemove(this.imgName)
  }
}
</script>

<style lang="less" scoped>
.refresh {
  position: absolute;
  top: -4px;
  right: 0;
  z-index: 2;
}
.get-image {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}
</style>
