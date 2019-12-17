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
        <div style="margin: 16px; display: flex; justify-content: space-around;">
          <AutoComplete v-model="imgName" :data="suffixs" @on-search="handleSearch" placeholder="Enter something..." clearable style="width: 66%" />
          <Button type="primary" :loading="loading" @click="getImg" style="margin-left:6px">
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
          <div style="margin: 16px; display: flex; justify-content: space-around;">
            <Input v-model="imgThreshold" placeholder="识别率标准..." clearable style="width: 72%" type="number"/>
            <Button type="primary" @click="getFeaturePointFileName()" style="margin-left:6px">Commit</Button>
          </div>
        </template>
      </Card>
      <div style="margin-left:42%;width: 58%;height: 68vh; display: flex; justify-content: center; align-items: center;">
        <img ref="ImgRef" :src="imgUrl" :style="style" @click="getCoordinate">
      </div>
    </TabPane>
    <TabPane label="文件上传">
      <Row style="height: 100%;">
        <Col span="12" style="padding: 0 30px;">
          <Table border :columns="filesColumn" :data="filesData" @on-row-click="showFile">
            <template slot-scope="{ row, index }" slot="action">
              <Button type="error" size="small" @click="removeFile(index)">Delete</Button>
            </template>
          </Table>
        </Col>
        <Col span="12" style="padding: 0 30px; height: 100%;">
          <div v-if="fileType === 'image'" class="img">
            <img :src="fileContent">
          </div>
          <div v-else-if="fileType === 'text'" class="text" @keydown="keydownHandler">
            <Input type="textarea" :autosize="{minRows: 40, maxRows: 40}" v-model="fileContent" style="height: 100%;" />
            <Button type="primary" @click="saveChange">保存更改</Button>
          </div>
          <div v-else class="default">
            <div class="tip">
              点击左侧列表项预览
              <!-- {{ filesData }} -->
            </div>
          </div>
        </Col>
      </Row>
    </TabPane>
  </Tabs>
</template>

<script>
import { toDecimal, isJsonString, insertAfterCursor } from '../lib/tools'
import util from '../lib/util/validate.js'
import { getUsableDeviceList } from '../api/reef/device'
import { callEblockExce, getFeaturePointIntoJob } from '../api/coral/jobLibSvc' // deviceOperationStatus
// import { deviceOperationStatus } from '../mock/coral/jobLibSvc'

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
    // deviceAutoLoad: {
    //   type: Boolean,
    //   default: true
    // },
    stageJobLabel: {
      type: String,
      default: null
    },
    unitMsg: {
      type: Boolean,
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
      suffixs: [],
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
      ],
      filesColumn: [
        {
          type: 'index',
          width: 50,
          align: 'center'
        },
        {
          title: '文件名称',
          key: 'name',
          align: 'center'
        },
        {
          title: '文件类型',
          key: 'type',
          width: 100,
          align: 'center'
        },
        // {
        //   title: '最后修改时间/生成时间',
        //   key: 'lastModified',
        //   align: 'center'
        // },
        {
          title: 'Action',
          slot: 'action',
          width: 100,
          align: 'center'
        }
      ],
      filesData: [],
      fileType: 'default',
      fileContent: '',
      currentFile: undefined
    }
  },
  methods: {
    keydownHandler (event) {
      let insertStr = '    '
      if (event.keyCode === 9) {
        event.preventDefault()
        insertAfterCursor(event.target, insertStr)
      }
    },
    saveChange () { // 保存对依赖文件的修改
      if (isJsonString(this.fileContent)) {
        console.log(this.filesData, this.currentFile)
        let type = this.filesData[this.currentFile].file.type
        this.filesData[this.currentFile].file = new Blob([JSON.stringify(JSON.parse(this.fileContent), null, 4)], {
          type
        })
        this.fileType = 'default'
        this.$Message.success({
          background: true,
          content: '修改成功'
        })
      } else {
        this.$Message.error({
          background: true,
          content: '不是JSON格式，请检查您的内容'
        })
      }
    },
    showFile (data, index) { // 展示依赖文件的内容
      data = this.filesData[index]
      this.currentFile = index
      if (data.type === 'jpg' || data.type === 'png') {
        this.fileType = 'image'
      } else {
        this.fileType = 'text'
      }
      let reader = new FileReader()
      console.log('yes')
      if (this.fileType === 'text') {
        reader.readAsText(data.file)
        reader.onload = () => {
          this.fileContent = reader.result
        }
      } else {
        reader.readAsDataURL(data.file)
        reader.onload = () => {
          this.fileContent = reader.result
        }
      }
    },
    removeFile (index) { // 删除依赖文件
      this.filesData.splice(index, 1)
      this.currentFile = undefined
      this.fileType = 'default'
    },
    handleSearch (value) {
      this.suffixs = !value || value.indexOf('.') >= 0 ? [] : [
        value + '.jpg',
        value + '.png'
      ]
    },
    onDeviceRowClick (row, index) {
      this.currentDeviceRowIndex = index
    },
    onCoordinateRowClick (row, index) { // 点击table的某一行
      this.currentCoordinateRowIndex = index
      this.coordinateData[index] = row
      this.flag = true
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
        // this.viewImg(`${res.data.file}?t=${(new Date()).toString()}`)
        this.viewImg(res.data.file)
        this._loading(false)
        this.$emit('getImageName', this.imgName)
      } else {
        this._loading(false)
        this.$Message.error('当前device被使用，请换一个device')
      }
    },
    remove (index) {
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
    },

    getFeaturePointFileName () { // 获取坐标数据 get fileName
      let coordinateNum = 1
      let coordinateDataList = {}
      if (!this.imgThreshold) {
        this.$Message.error('识别率未输入')
        return
      } else {
        coordinateDataList.threshold = parseFloat(this.imgThreshold)
      }
      let getCoordinateFileData = {
        requestName: 'getFeaturePointIntoJob',
        featurePointDict: coordinateDataList,
        stageJobLabel: this.stageJobLabel
      }
      for (let i = 0; i < this.coordinateData.length; i++) {
        if (this.coordinateData[i].coordinate_a !== '' && this.coordinateData[i].coordinate_b !== '') {
          let area = 'area' + coordinateNum
          let coordinateRowList = this.coordinateData[i].coordinate_a.split(',').concat(this.coordinateData[i].coordinate_b.split(',')).map(parseFloat)
          coordinateDataList[area] = coordinateRowList
          coordinateNum++
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
    },
    emptyData () {
      this.imgName = ''
      this.imgThreshold = null
      this.coordinateData = [
        {
          coordinate_a: '',
          coordinate_b: ''
        }
      ]
      this.imgUrl = ''
    }
  }
//   mounted () {
//     if (this.deviceAutoLoad) this.deviceRefresh()
//   }
}
</script>

<style scoped lang="less">
  .unitView{
    min-width: 100%;
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
  .img {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    border: 1px solid #2d8cf0;
    border-radius: 6px;

    img {
      width: 100%;
    }
  }
  .text {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    width: 100%;
    height: 100%;
  }
  .default {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    border: 1px solid #2d8cf0;
    border-radius: 6px;

    .tip {
      display: flex;
      justify-content: center;
      align-items: center;
      user-select: none;

      width: 300px;
      height: 200px;
      border: 2px dashed #2d8cf0;
      border-radius: 6px;
    }
  }
</style>
