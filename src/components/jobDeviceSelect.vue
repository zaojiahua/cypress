<template>
  <Modal
    v-model="$store.state.device.selectDevice"
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
      @on-current-change="select"
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
import { getDeviceList, getDeviceBatteryLevel } from '../api/reef/request'
import util from '../lib/util/validate'

import { mapState } from 'vuex'

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
      deviceColumnChecked: [
        'device_name',
        'phone_model',
        'rom_version',
        'android_version',
        'device_label',
        'ip_address',
        'status',
        'power'
      ],
      devicesColumns: [],
      devicesData: [],
      deviceTotalNum: 0,
      currentPage: 1,
      pageSize: (parseInt(localStorage.getItem('device-management:DEFAULT_PAGE_SIZE')) === 0 || !parseInt(localStorage.getItem('device-management:DEFAULT_PAGE_SIZE'))) ? 20 : parseInt(localStorage.getItem('device-management:DEFAULT_PAGE_SIZE')),
      pageOffset: 0,
      deviceStatusFilterList: ['idle'],
      deviceSelected: null
    }
  },
  methods: {
    getDeviceColumn () {
      let data = []
      this.deviceColumnChecked.forEach(col => data.push(this.deviceColumnDictionary[col]))
      return data
    },
    closeDeviceSelectPage (save) {
      localStorage.setItem('device-management:DEFAULT_DEVICE_COLUMN', this.deviceColumnChecked.join(','))
      localStorage.setItem('device-management:DEFAULT_PAGE_SIZE', this.pageSize)
      if (save) {
        this.$store.commit('device/setDeviceInfo', this.deviceSelected)
        if(this.isControlDevice){
          this.$store.commit('device/setReleaseDeviceId', this.deviceSelected.id)
        }
      }
      this.$store.commit('device/setSelectDevice', false)
    },
    select (currentRow, oldCurrentRow) {
      this.deviceSelected = currentRow
    },
    async refresh () {
      let deviceStatus
      if (this.deviceStatusFilterList.length) {
        deviceStatus = '&status__in=' + 'ReefList[' + this.deviceStatusFilterList.join('{%,%}') + ']'
      }
      let { headers, status, data } = await getDeviceList({
        pageSize: this.pageSize,
        pageOffset: this.pageOffset,
        deviceStatus
      })
      if (status === 200) {
        this.deviceTotalNum = parseInt(headers['total-count'])
        let deviceIdList = []
        this.devicesData = util.validate(getDeviceListSerializer, data['devices'])
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
          let { data, status } = await getDeviceBatteryLevel(deviceIdList.join(','))
          if (status === 200) {
            data.forEach(item => {
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
          } else {
            this.$Message.error({
              background: true,
              content: '获取设备电量信息失败'
            })
          }
        }
      } else {
        this.$Message.error({
          background: true,
          content: '获取设备列表失败'
        })
      }
    },
    onPageChange (page) {
      this.pageOffset = this.pageSize * (page - 1)
      this.currentPage = page
      this.refresh()
    }
  },
  computed: {
    ...mapState('device', [
      'selectDevice',
      'isControlDevice'
    ])
  },
  watch: {
    selectDevice (val) {
      if (val === true) {
        this.refresh()
      }
    },
    deviceColumnChecked (val) {
      this.devicesColumns = this.getDeviceColumn()
    },
    pageSize () {
      if (this.selectDevice) this.refresh()
    }
  },
  mounted () {
    if (!localStorage['device-management:DEFAULT_DEVICE_COLUMN']) {
      localStorage.setItem('device-management:DEFAULT_DEVICE_COLUMN', this.deviceColumnChecked.join(','))
    }
    this.deviceColumnChecked = localStorage.getItem('device-management:DEFAULT_DEVICE_COLUMN').split(',')
    this.pageSize = parseInt(localStorage.getItem('device-management:DEFAULT_PAGE_SIZE')) === 0 || !parseInt(localStorage.getItem('device-management:DEFAULT_PAGE_SIZE')) ? 20 : parseInt(localStorage.getItem('device-management:DEFAULT_PAGE_SIZE'))
  }
}
</script>

<style lang="less" scoped>
body {
  position: relative;
}
</style>
