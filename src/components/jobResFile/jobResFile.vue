<template>
  <Modal v-model="showResFileModal" :closable="false" :mask-closable="false" width="90">
    <Tabs>
      <TabPane :label="label" name="files">
        <div class="res-file">
          <job-res-file-table style="width: 45%;" :columns="filesColumn" :data="resFiles" :currentFile="currentFile" @showFile="showFile"></job-res-file-table>
          <div class="res-file-show">
              <job-res-file-show style="width: 96%;" :filesData="resFiles" :currentFile="currentFile" @saveChange="saveChange"></job-res-file-show>
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

    <Modal v-model="checkDuplicateNameModal" :styles="{top: '48%'}" :mask-closable="false"  :closable="false">
      <p slot="header">
        <Icon type="ios-alert-outline" style="color:orange;font-size:1.2em;font-weight:bold;" />
        温馨提示
      </p>
      <p style="width:100%;text-align:center;">已存在同名文件，请选择您要进行的操作。</p>
      <div slot="footer">
        <Button type="warning" @click="overwrite">覆盖同名文件</Button>
        <Button type="primary" @click="rename">重命名</Button>
      </div>
    </Modal>
    <Modal v-model="renameModal" :styles="{top: '48%'}" :mask-closable="false" :closable="false">
      <p slot="header">
        <Icon type="ios-clipboard-outline" style="color:orange;font-size:1.2em;font-weight:bold;" />
        请填写新的名字
      </p>
      <Input v-model="newName"/>
      <div slot="footer">
        <Button type="info" @click="checkDuplicateName">检测名称是否可用</Button>
        <Button type="success" @click="setNewName" :disabled="this.checkState ? false : true">确定</Button>
      </div>
    </Modal>
  </Modal>
</template>

<script>
import jobResFileShow from './jobResFileShow'
import jobResFileTable from './jobResFileTable'

import { suffixAutoRemove } from 'lib/tools'

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
      currentFile: 0,
      fileData: null,
      checkDuplicateNameModal: false,
      overwriteAt: null,
      renameModal: false,
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
      this.resFiles[this.currentFile].file = file
      this.$Message.success({
        background: true,
        content: '修改成功'
      })
    },
    showFile (index) { // 展示依赖文件的内容
      this.currentFile = index
    },
    overwrite () {
      this.resFiles.splice(this.overwriteAt, 1, this.fileData)
      this.checkDuplicateNameModal = false
    },
    rename () {
      this.checkDuplicateNameModal = false
      this.renameModal = true
    },
    setNewName () {
      this.fileData.name = this.newName + '.' + this.fileData.type
      this.resFiles.push(this.fileData)
      this.renameModal = false
      this.checkState = null
      this.$bus.emit('setNewName', this.newName + '.' + this.fileData.type)
    },
    checkDuplicateName () {
      let flag = true
      for (let i = 0; i < this.resFiles.length; i++) {
        if (suffixAutoRemove(this.resFiles[i].name) === this.newName && this.fileData.type === this.resFiles[i].type) {
          flag = false
          break
        }
      }
      this.checkState = flag
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
