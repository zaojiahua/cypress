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
          multiple
          type="drag"
          action="//jsonplaceholder.typicode.com/posts/">
          <div class="upload-area">
            <Icon type="ios-cloud-upload" size="300" style="color: #3399ff"></Icon>
            <p style="font-size: 18px;">Click or drag files here to upload</p>
          </div>
        </Upload>
      </TabPane>
    </Tabs>
  </Modal>
</template>

<script>
import jobResFileShow from './jobResFileShow'
import jobResFileTable from './jobResFileTable'

import { mapState } from 'vuex'

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
      fileData: null,
      overwriteAt: null,
      newName: '',
      checkState: null,
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
    },
    getFileData (tmachBlanks, itemType) {
      if (!tmachBlanks[0]) return
      for (let i = 0; i < this.resFiles.length; i++) {
        if (this.resFiles[i].name === tmachBlanks[0]) {
          /**
           * 将文件展示在 UnitEditor 中
           * 由 unitEditorUtils 组件响应
           */
          this.$bus.emit('showFile', {
            'fileToShow': this.resFiles[i].file,
            'fileName': this.resFiles[i].name,
            'itemType': itemType,
            'isScreenShot': true
          })
          break
        }
      }
    }
  },
  created () {
    this.$bus.on('addResFile', fileData => {
      let resFiles = this.resFiles
      let flag = true
      for (let i = 0; i < resFiles.length; i++) {
        if (fileData.name === resFiles[i].name && fileData.type === resFiles[i].type) {
          flag = false
          this.overwriteAt = i
          break
        }
      }
      if (!flag) {
        this.fileData = fileData
        this.checkDuplicateNameModal = true
      } else {
        resFiles.push(fileData)
      }
    })
    /**
     * 获取 UnitItem 的依赖文件数据
     * 来自 unitEditorUnitItem 组件
     */
    this.$bus.on('getFileData', this.getFileData)
  },
  beforeDestroy () {
    this.$bus.off('addResFile')
    this.$bus.off('getFileData', this.getFileData)
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
