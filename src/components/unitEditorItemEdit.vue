<template>
  <Card>
    <p slot="title">Item Edit</p>
    <div v-show="!showEditPane" class="items-edit"></div>
    <div class="items-edit" v-show="showEditPane">
      <!-- <div>
        <div class="data-type">
          <div>
            <p>请选择数据类型：</p>
            <RadioGroup v-model="dataFromUnitItem.secondLevelType" v-if="dataFromUnitItem.firstLevelType === 'unitdata'">
              <Radio label="ux_input">&lt;ux_input></Radio>
              <Radio label="input_file">&lt;input_file></Radio>
              <Radio label="jobres_file">&lt;jobres_file></Radio>
            </RadioGroup>
            <RadioGroup v-model="dataFromUnitItem.secondLevelType" v-if="dataFromUnitItem.firstLevelType === 'unitfile'">
              <Radio label="output_file">&lt;output_file</Radio>
              <Radio label="input_file">&lt;input_file></Radio>
              <Radio label="jobres_file">&lt;jobres_file></Radio>
            </RadioGroup>
          </div>
          <div>
            <Button @click="reset">重置</Button>
          </div>
        </div>
        <div v-if="dataFromUnitItem.secondLevelType === 'ux_input'">
          <p>请输入数据：</p>
          <Input type="text" v-model="dataFromUnitItem.content" />
        </div>
        <div v-else-if="dataFromUnitItem.secondLevelType === 'input_file' || dataFromUnitItem.secondLevelType === 'output_file'">
          <p>请输入文件名：</p>
          <Input type="text" v-model="dataFromUnitItem.content" />
        </div>
        <div v-else-if="dataFromUnitItem.secondLevelType === 'jobres_file'">
          <Tabs value="screenshot">
            <TabPane label="图片截取" name="screenshot">
              <unit-editor-screen-shot :unitName="unitName"></unit-editor-screen-shot>
            </TabPane>
            <TabPane label="文件上传" name="upload">
              <p v-if="!file" style="margin-bottom: 10px;">请选择上传文件：</p>
              <Input v-if="file" style="margin-bottom: 10px;" v-model="fileName"><span slot="prepend">文件名称</span></Input>
              <Upload
                type="drag"
                :before-upload="stopUpload"
                :accept="acceptFileType"
                :format="legalFormat"
                :on-format-error="handleFormatError"
                action="//jsonplaceholder.typicode.com/posts/">
                <div style="padding: 20px 0" v-if="!file">
                  <Icon type="ios-cloud-upload" size="80" style="color: #3399ff"></Icon>
                  <p style="margin-top: 20px;">点击或将文件拖拽到这里上传</p>
                  <p>文件格式：txt/jpg/png/mp4/mov...</p>
                </div>
                <div style="padding: 20px 0" v-if="file">
                  <Icon type="ios-document-outline"  size="80" style="color: #3399ff" v-show="isText"></Icon>
                  <Icon type="ios-images" size="80" style="color: #3399ff" v-show="isImage"/>
                  <Icon type="ios-videocam-outline" size="80" style="color: #3399ff" v-show="isVideo"/>
                  <p style="margin-top: 20px;">文件名称：{{ fileName }}</p>
                  <p>文件类型：{{ fileType }}</p>
                  <Button type="primary" style="margin-top: 20px;" :loading="uploading" @click.stop="upload">{{ !uploading ? '上传' : '上传中' }}</Button>
                </div>
              </Upload>
            </TabPane>
          </Tabs>
        </div>
      </div> -->
      <div>
        <Input
          v-show="showInput"
          v-for="(blank, index) in tmachBlanks"
          :key="index" v-model="tmachBlanks[index]"
          style="margin-bottom: 10px;"
          :placeholder="dataFromUnitItem && dataFromUnitItem.itemContent.type === 'outputFile' ? 'text.txt' : dataFromUnitItem.itemContent.type === 'outputPicture' ? 'snap.jpg' : ''"
        >
        </Input>
        <AutoComplete
          v-show="dataFromUnitItem && (dataFromUnitItem.itemContent.type === 'inputFile' || dataFromUnitItem.itemContent.type === 'inputPicture') ? true : false"
          v-for="(blank, index) in tmachBlanks"
          :key="blank" v-model="tmachBlanks[index]"
          style="margin-bottom: 10px;"
        >
          <div v-for="(names, index) in filesName" :key="index">
            <div class="auto-complete-title">
              <span>{{ names.title }}</span>
            </div>
            <Option v-for="(name, index) in names.children" :key="index" :value="name"></Option>
          </div>
        </AutoComplete>
        <unit-editor-screen-shot :imgName="tmachBlanks[0]" @setImgName="setImgName" v-if="dataFromUnitItem && dataFromUnitItem.itemContent.type === 'jobResourcePicture'"></unit-editor-screen-shot>
        <unit-editor-get-feature-point :featurePointFileName="tmachBlanks[0]" @setFeaturePointFileName="setFeaturePointFileName" v-if="dataFromUnitItem && dataFromUnitItem.itemContent.type === 'jobResourceFile'"></unit-editor-get-feature-point>
        <p><Tag>操作说明</Tag>{{ dataFromUnitItem ? dataFromUnitItem.itemContent.meaning : ''}}</p>
        <Checkbox v-model="saveToFinalResult" v-if="dataFromUnitItem && dataFromUnitItem.itemContent.type === 'outputPicture' ? true : false" style="float: right;">添加此图片至最终结果</Checkbox>
      </div>
      <div class="save-btn">
        <Button type="primary" @click="saveItem">保存</Button>
      </div>
    </div>
  </Card>
</template>

<script>
import unitEditorScreenShot from './unitEditorScreenShot'
import unitEditorGetFeaturePoint from './unitEditorGetFeaturePoint'

import { fileToDataURL, suffixAutoRemove, suffixAutoComplete } from '../lib/tools.js'

export default {
  name: 'item-edit',
  components: { unitEditorScreenShot, unitEditorGetFeaturePoint },
  props: {
    unitName: {
      type: String,
      default: ''
    },
    unitType: {
      type: String,
      default: ''
    },
    filesName: {
      type: Array,
      default () {
        return []
      }
    }
  },
  data () {
    return {
      dataFromUnitItem: null,
      showEditPane: false,
      acceptFileType: 'image/jpeg, image/png, video/mp4, video/mov, application/json, text/plain',
      legalFormat: ['jpg', 'jpeg', 'png', 'mp4', 'mov', 'json', 'plain'],
      file: null,
      fileName: undefined,
      fileType: undefined,
      fileToShow: undefined,
      isText: false,
      isImage: false,
      isVideo: false,
      uploading: false,
      tmach: '',
      saveToFinalResult: false,
      tmachBlanks: []
    }
  },
  watch: {
    file (val) {
      if (val) {
        this.fileName = val.name
        this.fileType = val.type
        if (val.type.split('/')[0] === 'image') {
          this.isImage = true
          this.isText = false
          this.isVideo = false
          fileToDataURL(val).then(res => {
            this.fileToShow = res
          })
        } else if (val.type.split('/')[0] === 'application' || val.type.split('/')[0] === 'text') {
          this.isText = true
          this.isImage = false
          this.isVideo = false
          let reader = new FileReader()
          reader.readAsText(val)
          reader.onload = () => {
            this.fileToShow = reader.result
          }
        } else if (val.type.split('/')[0] === 'video') {
          this.isVideo = true
          this.isText = false
          this.isImage = false
          fileToDataURL(val).then(res => {
            this.fileToShow = res
          })
        }
      } else {
        this.fileName = undefined
        this.fileType = undefined
        this.fileToShow = undefined
      }
    },
    fileToShow (val) {
      this.$bus.emit('showFile', {
        'fileName': this.fileName,
        'fileToShow': val,
        'isText': this.isText,
        'isImage': this.isImage,
        'isVideo': this.isVideo,
        'isScreenShot': false
      })
    },
    fileName (val) {
      this.$bus.emit('setFileName', val)
    },
    saveToFinalResult (val) {
      if (!val) {
        for (let i = 0; i < this.tmachBlanks.length; i++) {
          this.tmachBlanks[i] = this.tmachBlanks[i].replace('<copy2rdsDatPath>', '')
        }
      }
    }
  },
  computed: {
    showInput () {
      let itemType = this.dataFromUnitItem.itemContent.type
      if (itemType !== 'jobResourcePicture' && itemType !== 'jobResourceFile' && itemType !== 'inputFile' && itemType !== 'inputPicture') {
        return true
      }
      return false
    },
    showAutoComplete () {
      let itemType = this.dataFromUnitItem.itemContent.type
      if (itemType !== 'inputFile' && itemType !== 'inputPicture') return true
      return false
    }

  },
  methods: {
    reset () {
      this.file = null
      this.fileName = undefined
      this.fileType = undefined
      this.fileToShow = undefined
      this.isText = false
      this.isImage = false
      this.isVideo = false
      this.saveToFinalResult = false
      this.tmach = ''
    },
    _tmachBlankSuffixComplete () {
      let itemType = this.dataFromUnitItem.itemContent.type
      if (itemType === 'outputPicture' || itemType === 'inputPicture') {
        let commandOfSaveToFinal = '<copy2rdsDatPath>'
        for (let i = 0; i < this.tmachBlanks.length; i++) {
          if (this.tmachBlanks[i].length === 0) continue
          this.tmachBlanks[i] = suffixAutoComplete(this.tmachBlanks[i], '.jpg')
          if (this.saveToFinalResult) {
            this.tmachBlanks[i] += commandOfSaveToFinal
          }
        }
      }
      if (itemType === 'outputFile' || itemType === 'inputFile') {
        for (let i = 0; i < this.tmachBlanks.length; i++) {
          if (this.tmachBlanks[i].length === 0) continue
          this.tmachBlanks[i] = suffixAutoComplete(this.tmachBlanks[i], '.txt')
        }
      }
    },
    saveItem () {
      let itemType = this.dataFromUnitItem.itemContent.type
      this.showEditPane = false
      if (itemType === 'outputFile') {
        this.$bus.emit('addFilesName', 'file', this.tmachBlanks)
      }
      if (itemType === 'outputPicture') {
        this.$bus.emit('addFilesName', 'picture', this.tmachBlanks)
      }
      this._tmachBlankSuffixComplete()
      let res = this.dataFromUnitItem.itemContent.content.match(/Tmach.*? /g)
      for (let i = 0; i < res.length; i++) {
        this.dataFromUnitItem.itemContent.content = this.dataFromUnitItem.itemContent.content.replace(res[i], 'Tmach' + this.tmachBlanks[i] + ' ')
      }
      if (this.unitType === 'IMGTOOL' && itemType === 'jobResourcePicture') {
        this.$bus.emit('setUnitItemState')
      }
      this.$bus.emit('saveChange', this.dataFromUnitItem, this.tmachBlanks)
      this.$bus.emit('reset')
      this.reset()
    },
    stopUpload (file) {
      console.log(file.type)
      this.file = file
      return false
    },
    handleFormatError (file) {
      // this.$Notice.warning({
      //   title: '文件格式错误',
      //   desc: '当前文件 ' + file.name + ' 的格式不合法，请选择合适的文件上传'
      // })
      // console.log(file)
    },
    upload () {
      this.uploading = true
      this.$bus.emit('addResFile', {
        'name': this.fileName,
        'type': this.fileType.split('/')[1],
        'file': this.fileToShow,
        'fileUrl': ''
      })
      setTimeout(() => {
        this.file = null
        this.uploading = false
        this.$Message.success({
          background: true,
          content: '上传成功'
        })
      }, 1500)
    },
    _tmachBlankSuffixLessen (type, tmachBlanks) {
      tmachBlanks.forEach((tmach, index, arr) => {
        arr[index] = tmach.trim().substring(5)
      })
      if (type === 'outputPicture' || type === 'outputFile') {
        let indexOfPoint
        let commandOfSaveToFinal = '<copy2rdsDatPath>'
        for (let i = 0; i < tmachBlanks.length; i++) {
          if (tmachBlanks[i].includes(commandOfSaveToFinal)) this.saveToFinalResult = true
          indexOfPoint = tmachBlanks[i].lastIndexOf('.')
          if (indexOfPoint !== -1) {
            tmachBlanks[i] = tmachBlanks[i].substring(0, indexOfPoint)
          }
        }
      }
      return tmachBlanks
    },
    setImgName (imgName) {
      this.tmachBlanks[0] = imgName
    },
    setFeaturePointFileName (featurePointFileName) {
      console.log(featurePointFileName)
      this.tmachBlanks[0] = featurePointFileName
    }
  },
  created () {
    this.$bus.on('editItem', (dataFromUnitItem, tmachBlanks) => {
      this.dataFromUnitItem = dataFromUnitItem
      this.tmachBlanks = this._tmachBlankSuffixLessen(dataFromUnitItem.itemContent.type, tmachBlanks)
      this.showEditPane = true
    })
  },
  beforeDestroy () {
    this.$bus.off('editItem')
  }
}
</script>

<style lang="less" scoped>
.items-edit {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 755px;

  .auto-complete-title {
    padding: 0 10px;
    font-weight: bold;
  }

  .data-type {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .save-btn {
    display: flex;
    justify-content: center;
  }
}
</style>
