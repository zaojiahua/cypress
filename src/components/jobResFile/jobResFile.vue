<template>
  <Modal v-model="showResFileModal" :closable="false" :mask-closable="false" width="90">
    <Tabs>
      <TabPane :label="label" name="files">
        <div class="res-file">
          <job-res-file-table style="width: 45%;" :columns="filesColumn" :data="resFiles" :curFile="curFile" @showFile="showFile"></job-res-file-table>
          <div class="res-file-show">
              <job-res-file-show style="width: 96%;" :filesData="resFiles" :curFile="curFile" @saveChange="saveChange"></job-res-file-show>
          </div>
        </div>
        <div slot="footer">
          <Button type="primary" size="large" @click="closeResFileModal">确定</Button>
        </div>
      </TabPane>
      <TabPane label="上传文件" name="upload" icon="ios-cloud-upload-outline" class="upload-wrapper">
        <Upload
          type="drag"
          action="#"
          :accept="Accept"
          :before-upload="beforeUpload">
          <div class="upload-area">
            <Icon type="ios-cloud-upload" size="300" style="color: #3399ff"></Icon>
            <p style="font-size: 18px;">单击或拖动此处上载文件</p>
          </div>
        </Upload>
      </TabPane>
    </Tabs>
  </Modal>
</template>

<script>
import jobResFileShow from './jobResFileShow'
import jobResFileTable from './jobResFileTable'

import {mapGetters, mapState} from 'vuex'

export default {
  components: { jobResFileShow, jobResFileTable },
  props: {
    jobName: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      Accept: ".png,.jpg,.jpeg,.mp3,.mp4,.txt,.json,.apk,.log",//上传文件格式限制
      filesColumn: [
        {

        },
        {
          title: '文件名称'
        },
        {
          title: '文件类型'
        },
        {
          title: 'Action'
        }
      ],
      curFile: 0,
      label: (h) => {
        return h('div', [
          h('span', '依赖文件'),
          h('Badge', {
            props: {
              count: this.resFiles.length
            }
          })
        ])
      }
    }
  },
  computed: {
    ...mapState('files', [
      'resFiles'
    ]),
    ...mapGetters('files', ['resFilesName','dataURLtoFileFormat']),
    showResFileModal: {
      get () {
        return this.$store.state.files.showResFileModal
      },
      set () {
        this.$store.commit('files/setShowResFileModal')
      }
    }
  },
  methods: {
    beforeUpload(file) {
      let reader = new FileReader()
      if (this.resFilesName.indexOf(file.name) !== -1){
        this.$Message.warning("上传文件重名请进行修改后重新上传")
      }else {
        reader.onload = () => {
          this.$store.commit('files/handleResFiles', { //尾端添加
            action: 'addResFile',
            data: {
              dirty: true,
              index: -1,
              name: file.name,
              file: reader.result,
              type: file.name.split('.').pop()
            }
          })
          this.$Message.info("上传成功！！")
        }
        if (file.type.startsWith(('image')) || file.type.startsWith('audio') || file.type.startsWith('video')) { // 图片则存放 dataURL
          reader.readAsDataURL(file)
        } else { // json 则存放 text
          reader.readAsText(file)

        }
      }
      return false



    },
    closeResFileModal () {
      this.$store.commit('files/setShowResFileModal')
    },
    saveChange (file) { // 保存对依赖文件的修改
      this.resFiles[this.curFile].file = file
      this.$Message.success({
        background: true,
        content: '修改成功'
      })
    },
    showFile (index) { // 展示依赖文件的内容
      this.curFile = index
    }
  }
}
</script>

<style lang="less" scoped>
.res-file {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 1000px;

  .res-file-show {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 45%;
  }
}
.upload-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  .upload-area {
    padding: 20px 200px;
  }
}
</style>
