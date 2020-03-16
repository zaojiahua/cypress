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
        value + '.png'
      ]
    },
    getImg () {
      let errors = []
      if (this.currentDeviceRow === -1) errors.push('未选择 device')
      if (this.itemType === 'jobResourcePicture' && !this.currentImgName) errors.push('请为图片命名')
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

      let imgName = suffixAutoComplete(this.currentImgName, '.png')
      if (this.itemType === 'jobResourcePicture') {
        this.$emit('setImgName', imgName)
        /**
         * 设置当前截图的名称，由 unitEditorUtils 接收
         */
        this.$bus.emit('setFileName', imgName)
      }
      let getScreenShotParams = {
        device_label: currentDevice.device_label,
        device_ip: currentDevice.ip_address,
        picture_name: imgName
      }
      var screenShot = new Promise((resolve, reject) => {
        getScreenShot(getScreenShotParams).then(res => resolve(res)).catch(err => reject(err))
      })
      var getScreenShotTimeOut = new Promise((resolve, reject) => {
        setTimeout(reject, 10000, 'timeout')
      })
      Promise.race([screenShot, getScreenShotTimeOut]).then((res) => {
        this.$bus.emit('isLoading')
        this.loading = false
        if (res.status === 200) {
          blobToDataURL(res.data).then(res => {
            this.$bus.emit('showFile', {
              'fileToShow': res,
              'fileName': imgName,
              'itemType': this.itemType,
              'isScreenShot': true
            })
            if (this.itemType === 'jobResourcePicture') {
              this.$bus.emit('addResFile', {
                'name': imgName,
                'type': 'png',
                'file': res,
                'fileUrl': ''
              })
            }
          })
        }
      }).catch((err) => {
        console.log('error', err)
        this.$bus.emit('isLoading')
        this.loading = false
        this.$Notice.error({
          title: '截图失败',
          desc: '请检查您的设备',
          duration: 4
        })
      })
    },
    setNewName (newName) {
      this.currentImgName = newName
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
  },
  created () {
    this.$bus.on('setNewName', this.setNewName)
  },
  beforeDestroy () {
    this.$bus.on('setNewName', this.setNewName)
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
