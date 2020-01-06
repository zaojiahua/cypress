<template>
  <Card>
    <p slot="title">Item Edit</p>
    <div v-show="!showEditPane" class="items-edit"></div>
    <div class="items-edit" v-show="showEditPane">
      <div>
        <div class="data-type">
          <div>
            <p>请选择数据类型：</p>
            <RadioGroup v-model="data.type">
              <Radio label="ux_input">&lt;ux_input></Radio>
              <Radio label="input_file">&lt;input_file></Radio>
              <Radio label="jobres_file">&lt;jobres_file></Radio>
            </RadioGroup>
          </div>
          <div>
            <Button @click="reset">重置</Button>
          </div>
        </div>
        <div v-if="data.type === 'ux_input'">
          <p>请输入数据：</p>
          <Input type="text" v-model="data.content" />
        </div>
        <div v-else-if="data.type === 'input_file'">
          <p>请输入文件名：</p>
          <Input type="text" v-model="data.content" />
        </div>
        <div v-else-if="data.type === 'jobres_file'">
          <Tabs value="screenshot">
            <TabPane label="图片截取" name="screenshot">
              <unit-editor-screen-shot></unit-editor-screen-shot>
            </TabPane>
            <TabPane label="文件上传" name="upload">
              <p>请选择上传文件：</p>
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
                  <p style="margin-top: 20px;">文件名称：{{ fileParams.name }}</p>
                  <p>文件类型：{{ fileParams.type }}</p>
                  <Button type="primary" style="margin-top: 20px;" :loading="uploading" @click.stop="upload">{{ !uploading ? '上传' : '上传中' }}</Button>
                </div>
              </Upload>
            </TabPane>
          </Tabs>
        </div>
      </div>
      <div class="save-btn">
        <Button type="primary" @click="saveData">保存</Button>
      </div>
    </div>
  </Card>
</template>

<script>
import unitEditorScreenShot from './unitEditorScreenShot'

import { fileToDataURL } from '../lib/tools.js'

export default {
  name: 'item-edit',
  components: { unitEditorScreenShot },
  data () {
    return {
      data: {
        type: '',
        content: ''
      },
      showEditPane: false,
      acceptFileType: 'image/jpeg, image/png, video/mp4, video/mov, application/json, text/plain',
      legalFormat: ['jpg', 'jpeg', 'png', 'mp4', 'mov', 'json', 'plain'],
      file: null,
      fileParams: {},
      fileToShow: undefined,
      isText: false,
      isImage: false,
      isVideo: false,
      uploading: false
    }
  },
  watch: {
    file (val) {
      if (val) {
        this.$set(this.fileParams, 'name', val.name)
        this.$set(this.fileParams, 'type', val.type)
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
        this.fileParams = {}
        this.fileToShow = undefined
      }
    },
    fileToShow (val) {
      this.$bus.emit('showFile', {
        'fileToShow': val,
        'isText': this.isText,
        'isImage': this.isImage,
        'isVideo': this.isVideo,
        'isScreenShot': false
      })
    }
  },
  methods: {
    reset () {
      this.data.type = ''
      this.data.content = ''
    },
    saveData () {
      this.showEditPane = false
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
        'name': this.fileParams.name,
        'type': this.fileParams.type.split('/')[1],
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
    }
  },
  created () {
    this.$bus.on('editItem', dataForItemEdit => {
      this.data.type = dataForItemEdit.type
      this.data.content = dataForItemEdit.content
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
