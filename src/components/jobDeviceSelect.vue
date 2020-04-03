<template>
  <Modal
    v-model="showDeviceSelectPage"
    fullscreen
    :closable="false"
    @on-ok="closeDeviceSelectPage(true)"
    @on-cancel="closeDeviceSelectPage(false)"
    style="position: relative"
  >
    <Row type="flex" justify="space-between" style="margin-bottom: 8px;">
      <CheckboxGroup v-model="deviceColumnChecked" style="float: right;">
        <Checkbox v-for="item in deviceColumnDictionary" :label="item.key" :key="item.key">{{ item.title }}</Checkbox>
      </CheckboxGroup>
      <div>
        <span style="margin-right: 16px;">每页展示设备数</span>
        <InputNumber :max="100" :min="10" v-model="pageSize" :active-change="false"></InputNumber>
      </div>
    </Row>
    <Table
      :columns="devicesColumns"
      :data="devicesData"
      stripe
      border
      max-height="1158"
      highlight-row
      size="small"
      @on-current-change="selectDevice"
    ></Table>
    <Page
      :total="deviceTotalNum"
      :current="currentPage"
      :page-size="pageSize"
      @on-change="onPageChange"
      simple
      style="margin-top: 20px; text-align: center;"
    />
  </Modal>
</template>

<script>
import { getDeviceList, getDeviceBatteryLevel } from '../api/reef/device.js'
import util from '../lib/util/validate'

const getDeviceListSerializer = [
  {
    id: 'number',
    device_label: 'string',
    device_name: 'string',
    phone_model: {
      phone_model_name: 'string',
      cpu_name: 'string',
      manufacturer: {
        id: 'number',
        manufacturer_name: 'string'
      }
    },
    rom_version: {
      id: 'number',
      version: 'string'
    },
    android_version: {
      id: 'number',
      version: 'string'
    },
    ip_address: 'string',
    status: 'string'
  }
]

export default {
  name: 'DeviceSelectPage',
  data () {
    let _this = this
    return {
      showDeviceSelectPage: false,
      deviceColumnDictionary: {
        'device_name': {
          title: '自定义名称',
          key: 'device_name',
          sortable: true
        },
        'phone_model': {
          title: '设备型号',
          key: 'phone_model',
          sortable: true,
          filters: []
        },
        'rom_version': {
          title: 'ROM版本',
          key: 'rom_version',
          sortable: true
        },
        'android_version': {
          title: '安卓版本',
          key: 'android_version',
          sortable: true
        },
        'cpu_name': {
          title: 'CPU型号',
          key: 'cpu_name',
          sortable: true
        },
        'device_label': {
          title: '设备编号',
          key: 'device_label',
          sortable: true
        },
        'ip_address': {
          title: 'IP',
          key: 'ip_address',
          sortable: true
        },
        'status': {
          title: '使用状态',
          key: 'status',
          sortable: true,
          filters: [
            {
              label: 'idle',
              value: 'idle'
            },
            {
              label: 'busy',
              value: 'busy'
            },
            {
              label: 'offline',
              value: 'offline'
            },
            {
              label: 'error',
              value: 'error'
            }
          ],
          filteredValue: [
            'idle'
          ],
          filterRemote (value) {
            _this.deviceStatusFilterList = value
            _this.onPageChange(1)
          }
        },
        'power': {
          title: '电量',
          key: 'power',
          sortable: true
        }
      },
      deviceColumnChecked: [],
      devicesColumns: [],
      devicesData: [],
      deviceTotalNum: 0,
      currentPage: 1,
      pageSize: 20,
      pageOffset: 0,
      deviceStatusFilterList: ['idle'],
      deviceSelected: null
    }
  },
  methods: {
    handleShowDeviceSelectPage () {
      this.showDeviceSelectPage = !this.showDeviceSelectPage
    },
    getDeviceColumn () {
      let data = []
      this.deviceColumnChecked.forEach(col => data.push(this.deviceColumnDictionary[col]))
      return data
    },
    closeDeviceSelectPage (save) {
      localStorage.setItem('device-management:DEFAULT_DEVICE_COLUMN', this.deviceColumnChecked.join(','))
      localStorage.setItem('device-management:DEFAULT_PAGE_SIZE', this.pageSize)
      if (save) {
        this.$store.commit('setSelectedDeviceInfo', this.deviceSelected)
      }
    },
    selectDevice (currentRow, oldCurrentRow) {
      this.deviceSelected = currentRow
    },
    refresh () {
      let deviceStatus
      if (this.deviceStatusFilterList.length) {
        deviceStatus = '&status__in=' + 'ReefList[' + this.deviceStatusFilterList.join('{%,%}') + ']'
      }
      getDeviceList({
        pageSize: this.pageSize,
        pageOffset: this.pageOffset,
        deviceStatus
      }).then(res => {
        this.deviceTotalNum = Number(res.headers['total-count'])

        let deviceIdList = []
        this.devicesData = util.validate(getDeviceListSerializer, res.data['devices'])
        this.devicesData.forEach(device => {
          device.cpu_name = device.phone_model.cpu_name
          device.manufacturer_id = device.phone_model.manufacturer.id
          device.phone_model_id = device.phone_model.id
          device.phone_model = device.phone_model.phone_model_name
          device.rom_version_id = device.rom_version.id
          device.rom_version = device.rom_version.version
          device.android_version_id = device.android_version.id
          device.android_version = device.android_version.version

          deviceIdList.push(device.id)
        })
        if (deviceIdList.length) {
          getDeviceBatteryLevel(deviceIdList.join(',')).then(res => {
            res.data.forEach(item => {
              this.devicesData.forEach(device => {
                if (device.id === item.device) {
                  if (item.battery_level) {
                    this.$set(device, 'power', item.battery_level + '%')
                    return
                  }
                  this.$set(device, 'power', '无电量信息')
                }
              })
            })
          })
        }
      })
    },
    onPageChange (page) {
      this.pageOffset = this.pageSize * (page - 1)
      this.currentPage = page
      this.refresh()
    }
  },
  watch: {
    showDeviceSelectPage (val) {
      if (val === true) {
        this.refresh()
      }
    },
    deviceColumnChecked (val) {
      this.devicesColumns = this.getDeviceColumn()
    },
    pageSize () {
      if (this.showDeviceSelectPage) this.refresh()
    }
  },
  created () {
    this.$bus.on('showDeviceSelectPage', this.handleShowDeviceSelectPage) // 响应来自 jobMsgComponent 的动作
  },
  mounted () {
    this.deviceColumnChecked = localStorage.getItem('device-management:DEFAULT_DEVICE_COLUMN').split(',')
    this.pageSize = Number(localStorage.getItem('device-management:DEFAULT_PAGE_SIZE'))
  },
  beforeDestroy () {
    this.$bus.off('showDeviceSelectPage', this.handleShowDeviceSelectPage)
  }
}
</script>

<style lang="less" scoped>
body {
  position: relative;
}
</style>
