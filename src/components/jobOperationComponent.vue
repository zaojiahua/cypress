<template>
  <Tabs type="card">
    <TabPane label="图片截取">
      <Card style="float: left; width: 40%">
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
          <Button type="primary" :loading="loading" @click="getImg">
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
import { callEblockExce, deviceOperationStatus } from '../api/coral/jobLibSvc'
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
      imgUrl: '',
      loading: false,
      style: {},
      imgName: '',
      switchValue: true,
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
    onCoordinateRowClick (row, index) {
      this.currentCoordinateRowIndex = index
    },
    deviceRefresh () {
      getUsableDeviceList().then(res => {
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
        { name: '',
          age: '',
          address: ''
        }
      )
    },
    _loading (flag = true) {
      this.loading = flag
      this.featurePointShow = flag
    },
    getImg () {
      this._loading()
      let error = []
      if (this.currentDeviceRowIndex === null) error.push('未选择device')
      if (!this.imgName || !new RegExp('(.jpg|.png|.JPG|.PNG)$').test(this.imgName)) error.push('图片名称错误')

      if (error.length) {
        this.$Message.error(error.toString())
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

      callEblockExce(callEblockExceData).then(res => {
        this._callEblockExceResponseHandle(res)
      })
    },

    _callEblockExceResponseHandle (res) {
      console.log(res.data)
      if (res.data.state === true) {
        let timer = setInterval(function () {
          getImgStatus(timer)
        }, 2000)

        let wrapCount = 1
        let getImgStatus = (timer) => { // 请求后端获取图片，成功则展示
          if (wrapCount !== 10) {
            wrapCount++

            deviceOperationStatus(this.deviceData[this.currentDeviceRowIndex].device_label).then(res => {
              if (res.data.state) {
                this.viewImg(`${res.data.file}?t=${(new Date()).toString()}`)
                this._loading(false)
                clearInterval(timer)
              }
            })
          } else {
            this._loading(false)
            this.$Message.error('请求超时，请换一个device')
            clearInterval(timer)
          }
        }
      } else {
        this._loading(false)
        this.$Message.error('当前device被使用，请换一个device')
      }
      // this._loading(false)
    },

    remove (index) {
      this.viewImg(require('../assets/image/404.jpg'))
      this.coordinateData.length <= 1 ? this.$Message.error("can't deleted") : this.coordinateData.splice(index, 1)
    },
    viewImg (imgUrl) {
      debugger
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

      console.log({ x, y })
      console.log(scroll())
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
