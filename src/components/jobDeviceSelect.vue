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
      <div style="width:300px;" v-click-outside="onClickOutSide">
        <Input v-model="deviceKeyword" clearable search enter-button="Search" :placeholder="$t('jobDevSel.tips_1')" class="search-input"
               @on-focus="isShowHistory=true" @on-search="onDeviceSearch" @on-clear="deviceKeyword='';onPageChange(1)"/>
        <Card v-show="isShowHistory" style="position:absolute;width: 300px;z-index: 100;margin-top: 5px;">
          <Row>{{$t('jobDevSel.tips_2')}}<Icon style="float: right;" type="ios-trash-outline" size="18" @click="emptyHistory" /></Row>
          <div class="history-box" v-for="(item,index) in historyList" :key="index" @click="onSearchHistory(item)">{{ item }}</div>
          <Row v-show="historyList.length===0" style="margin-top: 10px;color: #cccccc;cursor: default;">{{$t('jobDevSel.tips_3')}}</Row>
        </Card>
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

    <Row style="margin-top:20px;text-align: center ">
      <Page
        :total="deviceTotalNum"
        :current="currentPage"
        :page-size="pageSize"
        @on-change="onPageChange"
        simple
        style="display: inline-flex;"
      />
      <div style="display: inline-block;margin-left: 30px">
        <span style="margin-right: 16px;">{{$t('jobDevSel.tips_4')}}</span>
        <InputNumber :max="100" :min="10" v-model="pageSize" :active-change="false" size="small"></InputNumber>
      </div>
    </Row>
  </Modal>
</template>

<script>
import { getDeviceList, getDeviceBatteryLevel } from '../api/reef/request'
import util from '../lib/util/validate'
import clickOutside from '../../node_modules/view-design/src/directives/clickoutside';

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
  directives: { clickOutside },
  data () {
    let _this = this
    return {
      deviceColumnDictionary: {
        'device_name': {
          title: this.$t('jobDevSel.device_name'),
          key: 'device_name',
          sortable: true
        },
        'phone_model': {
          title: this.$t('jobDevSel.phone_model'),
          key: 'phone_model',
          sortable: true,
          filters: []
        },
        'rom_version': {
          title: this.$t('jobDevSel.rom_version'),
          key: 'rom_version',
          sortable: true
        },
        'android_version': {
          title: this.$t('jobDevSel.android_version'),
          key: 'android_version',
          sortable: true
        },
        'cpu_name': {
          title: this.$t('jobDevSel.cpu_name'),
          key: 'cpu_name',
          sortable: true
        },
        'device_label': {
          title: this.$t('jobDevSel.device_label'),
          key: 'device_label',
          sortable: true
        },
        'ip_address': {
          title: 'IP',
          key: 'ip_address',
          sortable: true
        },
        'status': {
          title: this.$t('jobDevSel.status'),
          key: 'status',
          sortable: true,
          filters: [
            {
              label: 'idle',
              value: 'idle'
            },
            {
              label: 'occupied',
              value: 'occupied'
            },
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
          title: this.$t('jobDevSel.power'),
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
      deviceSelected: null,
      deviceKeyword:"",
      isShowHistory:false,  //历史记录板块
      historyList:[],  //历史记录数据（最多显示10条）
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
        this.$store.commit('device/setJobMsgDeviceInfo', this.deviceSelected)
        if(!this.isJobDeviceMsg){
          this.$store.commit('device/setDeviceInfo', this.deviceSelected)
        }
        if(this.isControlDevice){
          this.$store.commit('device/setReleaseDeviceId', this.deviceSelected.id)
        }
      }
      this.$store.commit('device/setSelectDevice', false)
      this.$store.commit('device/setIsJobDeviceMsg', false)
    },
    select (currentRow, oldCurrentRow) {
      this.deviceSelected = currentRow
    },
    async refresh () {
      let deviceStatus = '&status__in=' + 'ReefList[idle{%,%}occupied]'
      if (this.deviceStatusFilterList.length) {
        deviceStatus = '&status__in=' + 'ReefList[' + this.deviceStatusFilterList.join('{%,%}') + ']'
      }
      let deviceKeywordCondition = ""
      if(this.deviceKeyword.trim()!==""){
        deviceKeywordCondition = '&device_name__icontains=' +  this.deviceKeyword.trim()
      }
      let { headers, status, data } = await getDeviceList({
        pageSize: this.pageSize,
        pageOffset: this.pageOffset,
        deviceKeywordCondition,
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
                  this.$set(device, 'power', this.$t('jobDevSel.tips_5'))
                }
              })
            })
          } else {
            this.$Message.error({
              background: true,
              content: this.$t('jobDevSel.tips_6')
            })
          }
        }
      } else {
        this.$Message.error({
          background: true,
          content: this.$t('jobDevSel.tips_7')
        })
      }
    },
    onPageChange (page) {
      this.pageOffset = this.pageSize * (page - 1)
      this.currentPage = page
      this.refresh()
    },
    onDeviceSearch(){
      if(this.deviceKeyword.trim()===""){
        this.onPageChange(1)
        return
      }
      if(!this.historyList.includes(this.deviceKeyword.trim())){
        this.historyList.unshift(this.deviceKeyword.trim())
        if(this.historyList.length>15)
          this.historyList.pop()
        localStorage.setItem('cypress:historyList',JSON.stringify(this.historyList))
      }else {
        let i = this.historyList.indexOf(this.deviceKeyword.trim())
        this.historyList.splice(i,1)
        this.historyList.unshift(this.deviceKeyword.trim())
        localStorage.setItem('cypress:historyList',JSON.stringify(this.historyList))
      }
      this.onPageChange(1)
    },
    //按自定义名称搜索部分  并且加上历史记录功能
    onClickOutSide(e){
      this.isShowHistory = false
    },
    //点击历史记录，直接搜索
    onSearchHistory(item){
      this.deviceKeyword = item
      this.onPageChange(1)
    },
    //清空历史记录
    emptyHistory(){
      localStorage.removeItem('cypress:historyList');
      this.historyList = []
    }
  },
  computed: {
    ...mapState('device', [
      'selectDevice',
      'isControlDevice',
      'isJobDeviceMsg'
    ])
  },
  watch: {
    selectDevice (val) {
      if (val === true) {
        this. onPageChange(1)
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
    if(JSON.parse(localStorage.getItem('cypress:historyList'))){
      this.historyList = JSON.parse(localStorage.getItem('cypress:historyList'))
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
/deep/.search-input .ivu-input-icon-clear{
  margin-right: 76px!important;
}
.history-box{
  display: inline-block;
  border-radius: 20px;
  background: #f2f2f2;
  padding:3px 10px;
  margin: 10px 10px 0 0;
  cursor: pointer;
}
</style>
