<template>
  <div>
    <Button @click="deviceRefresh" type="primary" class="refresh">Refresh</Button>
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
      <AutoComplete
        v-model="imgName"
        :data="suffixs"
        @on-search="handleSearch"
        placeholder="Please enter a picture name"
        clearable
        style="width: 66%">
        <Option v-for="suffix in suffixs" :value="suffix" :key="suffix">{{ suffix }}</Option>
      </AutoComplete>
      <Button type="primary" :loading="loading" @click="getImg">
        <span v-if="!loading">Commit</span>
        <span v-else>Loading...</span>
     </Button>
    </div>
    <Divider orientation="left">特征点选取</Divider>
    <Table :columns="coordinateColumn" :data="coordinateData" border  max-height="158" size="small">
      <template slot-scope="{ row, index }" slot="action">
        <Button type="error" size="small" @click="remove(index)" :disabled="coordinateData.length === 1">Delete</Button>
      </template>
    </Table>
  </div>
</template>

<script>
import { getUsableDeviceList } from '../api/reef/device.js'
import { getScreenShot } from '../api/coral/jobLibSvc.js'

import { blobToDataURL } from '../lib/tools.js'

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
      imgName: '',
      suffixs: [],
      coordinateColumn: [
        {
          title: 'coordinate_A',
          key: 'coordinate_a',
          align: 'center'
        },
        {
          title: 'coordinate_B',
          key: 'coordinate_b',
          align: 'center'
        },
        {
          title: 'Action',
          slot: 'action',
          width: 150,
          align: 'center'
        }
      ],
      coordinateData: []
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
        value + '.jpg',
        value + '.png'
      ]
    },
    getImg () {
      let errors = []
      if (this.currentDeviceRow === -1) errors.push('未选择 device')
      if (!this.imgName || !new RegExp('(.jpg|.png|.JPG|.PNG)$').test(this.imgName)) errors.push('图片名称后缀格式错误')
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
      let getScreenShotParams = {
        device_label: currentDevice.device_label,
        device_ip: currentDevice.ip_address,
        picture_name: this.imgName
      }
      getScreenShot(getScreenShotParams).then(res => {
        if (res.status === 200) {
          blobToDataURL(res.data).then(res => {
            this.$bus.emit('showFile', {
              'fileToShow': res,
              'isText': false,
              'isImage': true,
              'isVideo': false,
              'isScreenShot': true
            })
          })
        }
      })
    },
    onCoordinateRowClick (row, index) {

    },
    add () {
      if (this.coordinateData.length < 3) {
        this.coordinateData.push(
          {
            coordinate_a: '',
            coordinate_b: ''
          }
        )
      }
    },
    remove (index) {
      this.coordinateData.length <= 1 ? this.$Message.error({ background: true, content: "can't deleted" }) : this.coordinateData.splice(index, 1)
    }
  },
  created () {
    this.$bus.on('add', this.add)
    this.$bus.on('remove', index => this.remove(index))
    this.$bus.on('getCoordinate', coordinate => {
      this.coordinateData.push(coordinate)
    })
  },
  mounted () {
    this.deviceRefresh()
  },
  beforeDestroy () {
    this.$bus.off('add')
    this.$bus.off('remove')
    this.$bus.off('getCoordinate')
  }
}
</script>

<style lang="less" scoped>
.refresh {
  position: absolute;
  top: 12px;
  right: 0;
  z-index: 2;
}
.get-image {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}
</style>
