<template>
  <Tabs type="card">
    <TabPane label="图片截取">
      <Card style="float: left; width: 40%">
        <Button type="primary" @click="refreshData" :disabled="selected" style="float: right;margin-right: 10px">Refresh</Button>
        <Divider orientation="left">获取图片</Divider>
        <Table border size="small"
               :loading="loading"
               @on-row-click="onDeviceRowClick"
               highlight-row max-height="200"
               :columns="deviceColumn"
               :data="deviceData">
        </Table>
        <div style="margin: 16px">
          <Input v-model.trim="imgName" placeholder="Enter something..." clearable style="width: 72%" />
          <Button type="primary" :loading="loading" @click="getImg" style="margin-left:6px" >
            <span v-if="!loading">Commit</span>
            <span v-else>Loading...</span>
          </Button>
        </div>
        <template v-show="featurePointShow">
          <Divider orientation="left">特征点选取</Divider>
          <Table border size="small"
                 :columns="coordinateColumn"
                 :data="coordinateData"
                 @on-row-click="onCoordinateRowClick"
                 highlight-row max-height="220">
            <template slot-scope="{ row, index }" slot="action">
              <Button type="primary" size="small" style="margin-right: 5px" @click="add()">Add</Button>
              <Button type="error" size="small" @click="remove(index)">Delete</Button>
            </template>
          </Table>
          <div style="margin: 16px">
            <Input v-model="imgThreshold" placeholder="识别率标准..." clearable style="width: 72%" type="number"/>
            <Button type="primary" @click="getFeaturePointFileName()" style="margin-left:6px">Commit</Button>
          </div>
        </template>
      </Card>
      <div style="margin-left:42%;width: 58%;height: 68vh">
        <img ref="ImgRef" :src="imgUrl" :style="style" @click="getCoordinate">
      </div>
    </TabPane>
    <TabPane label="文件上传">标签二的内容</TabPane>
  </Tabs>
</template>

<script>
import { toDecimal } from '../lib/tools'
import util from '../lib/util/validate.js'
import { getUsableDeviceList } from '../api/reef/device'
import { callEblockExce, deviceOperationStatus, getFeaturePointIntoJob } from '../api/coral/jobLibSvc'//, getFeaturePointFile
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
  name: 'jobOperationComponent',
  props: {
    deviceAutoLoad: {
      type: Boolean,
      default: true
    },
    stageJobLabel: {
      type: String,
      default: null
    }
  },
  data () {
    return {
      currentDeviceRowIndex: null,
      currentCoordinateRowIndex: null,
      featurePointShow: false,
      flag: false,
      imgUrl: '',
      loading: false,
      style: {},
      imgName: '',
      switchValue: true,
      imgThreshold: null,
      selected: false,

      deviceColumn: [
        {
          title: '名称',
          key: 'device_name'
        },
        {
          title: '型号',
          key: 'phone_model'
        },
        {
          title: '安卓版本',
          key: 'android_version'
        },
        {
          title: 'ROM版本',
          key: 'rom_version'
        }
      ],
      deviceData: [],
      coordinateColumn: [
        {
          title: 'coordinate_A',
          key: 'coordinate_a'
        },
        {
          title: 'coordinate_B',
          key: 'coordinate_b'
        },
        {
          title: 'Action',
          slot: 'action',
          width: 150,
          align: 'center'
        }
      ],
      coordinateData: [
        {
          coordinate_a: '',
          coordinate_b: ''
        }
      ]
    }
  },
  methods: {
    onDeviceRowClick (row, index) {
      this.currentDeviceRowIndex = index
      console.log(index)
    },
    onCoordinateRowClick (row, index) { // 点击table的某一行
      this.currentCoordinateRowIndex = index
      this.coordinateData[index] = row
      this.flag = true
    },
    deviceRefresh () {
      getUsableDeviceList().then(res => {
        console.log(res)
        // debugger
        this.deviceData = util.validate(deviceSerializer, res.data['devices'])
        this.deviceData.forEach(device => {
          device.phone_model = device.phone_model.phone_model_name
          device.rom_version = device.rom_version.version
          device.android_version = device.android_version.version
        })
        console.log(this.deviceData)
      })
      console.log(this.deviceData)
    },
    add () {
      this.coordinateData.push(
        {
          coordinate_a: '',
          coordinate_b: ''
        }
      )
    },
    _loading (flag = true) {
      this.loading = flag
      this.featurePointShow = flag
      this.selected = flag
    },
    getImg () {
      this._loading()
      let error = []
      if (this.currentDeviceRowIndex === null) error.push('未选择device')
      if (!this.imgName || !new RegExp('(.jpg|.png|.JPG|.PNG)$').test(this.imgName)) error.push('图片名称错误')
      if (error.length) {
        this.$Message.error(error.toString())
        this._loading(false)
        return
      }
      const currentDevice = this.deviceData[this.currentDeviceRowIndex]
      let callEblockExceData = {
        requestName: 'callEblockExce',
        deviceId: currentDevice.id,
        deviceLabel: currentDevice.device_label,
        ipAddress: currentDevice.ip_address,
        ImgName: this.imgName,
        stageJobLabel: this.stageJobLabel
      }

      callEblockExce(callEblockExceData).then(res => { // device
        this._callEblockExceResponseHandle(res)
      })
    },
    _callEblockExceResponseHandle (res) {
      if (res.data.state) {
        this.viewImg(`${res.data.file}?t=${(new Date()).toString()}`)
        // this.viewImg(res.data.file)
        this._loading(false)
        this.$emit('getImageName', this.imgName)
      } else {
        this._loading(false)
        this.$Message.error('当前device被使用，请换一个device')
        console.log(res)
      }
    },
    remove (index) {
      this.viewImg(require('../assets/image/404.jpg'))
      this.coordinateData.length <= 1 ? this.$Message.error("can't deleted") : this.coordinateData.splice(index, 1)
    },
    viewImg (imgUrl) {
      const self = this
      const image = new Image()
      image.src = imgUrl
      image.onload = function () {
        let width = image.width
        let height = image.height
        width > height ? self.style = { width: '100%' } : self.style = { height: '100%' }
        self.imgUrl = imgUrl
      }
    },
    getCoordinate (e) {
      let [mouseLeft, mouseTop] = [e.clientX, e.clientY]
      let [imgLeft, imgTop] = [this.$refs.ImgRef.getBoundingClientRect().left, this.$refs.ImgRef.getBoundingClientRect().top]
      console.log(this.$refs.ImgRef.height)

      let x = toDecimal((mouseLeft - imgLeft) / this.$refs.ImgRef.width)
      let y = toDecimal((mouseTop - imgTop) / this.$refs.ImgRef.height)
      if (!this.flag) {
        this.$Message.error('特征点选取未选择')
        return
      }

      // 坐标添加进table中
      if (this.coordinateData[this.currentCoordinateRowIndex].coordinate_a !== '' && this.coordinateData[this.currentCoordinateRowIndex].coordinate_b !== '') {
        this.$Message.error('已有数据存在！')
      }
      if (this.coordinateData[this.currentCoordinateRowIndex].coordinate_a === '' && this.coordinateData[this.currentCoordinateRowIndex].coordinate_b === '') {
        this.coordinateData.splice(this.currentCoordinateRowIndex, 1, {
          coordinate_a: `${x}, ${y}`,
          coordinate_b: ''
        })
      } else if (this.coordinateData[this.currentCoordinateRowIndex].coordinate_a !== '' && this.coordinateData[this.currentCoordinateRowIndex].coordinate_b === '') {
        this.coordinateData.splice(this.currentCoordinateRowIndex, 1, {
          coordinate_a: this.coordinateData[this.currentCoordinateRowIndex].coordinate_a,
          coordinate_b: `${x},${y}`
        })
      }
      console.log(this.coordinateData)
      console.log({ x, y })
      // console.log(scroll())`
    },

    getFeaturePointFileName () { // 获取坐标数据 get fileName
      let coordinateNum = 1
      let coordinateDataList = {}
      if (!this.imgThreshold) {
        this.$Message.error('识别率未输入')
        return
      } else {
        coordinateDataList.threshold = this.imgThreshold
      }
      let getCoordinateFileData = {
        requestName: 'getFeaturePointIntoJob',
        featurePointDict: coordinateDataList,
        stageJobLabel: this.stageJobLabel
      }
      for (let i = 0; i < this.coordinateData.length; i++) {
        if (this.coordinateData[i].coordinate_a !== '' && this.coordinateData[i].coordinate_b !== '') {
          let area = 'area' + coordinateNum
          let coordinateRowList = this.coordinateData[i].coordinate_a + ',' + this.coordinateData[i].coordinate_b
          coordinateDataList[area] = coordinateRowList
          coordinateNum++
          console.log(coordinateRowList)
        }
      }
      getFeaturePointIntoJob(getCoordinateFileData).then(res => {
        this.$emit('getFileName', res.data.fileName) // 请求成功 向父组件传值 左侧添加数据
      }).catch(error => {
        console.log(error)
      })
    },
    refreshData () {
      this._loading(false)
      this.deviceRefresh()
      this.currentDeviceRowIndex = null
    }
  },
  mounted () {
    if (this.deviceAutoLoad) this.deviceRefresh()
  }
}
</script>

<style scoped lang="less">
  .unitView{
    width: 100%;
    display: flex;
    height: 74vh;
    justify-content: space-between;
    margin-bottom: 22px;

    .unitContent {
      width: 20%;
      margin-right: 16px;
      background-color: white;
      border: solid 1px rgb(244, 244, 244);
    }

    .unitOperation{
      width: 80%;
      flex-grow: 1;
      background-color: white;
      border: solid 1px rgb(244, 244, 244);
    }
  }
</style>
