<template>
  <Modal v-model="resFileModalShow" :closable="false" width="90">
    <div slot="header">
      <strong style="font-size: 18px;">Job--{{ jobName }}的依赖文件：</strong>
    </div>
    <div class="res-file">
      <job-res-file-table style="width: 45%;" :columns="filesColumn" :data="filesData" :currentFile="currentFile" @removeFile="removeFile" @showFile="showFile"></job-res-file-table>
      <div class="res-file-show">
          <job-res-file-show style="width: 96%;" :filesData="filesData" :currentFile="currentFile" @saveChange="saveChange"></job-res-file-show>
      </div>
    </div>
    <div slot="footer">
      <Button type="primary" size="large" @click="resFileModalClose">确定</Button>
    </div>
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

import axios from '../api'
import { baseURL } from '../config'

import { suffixAutoRemove } from '../lib/tools'

export default {
  components: { jobResFileShow, jobResFileTable },
  props: {
    resFileModalShow: {
      type: Boolean,
      default: false
    },
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
      filesData: [],
      currentFile: 0,
      fileData: null,
      checkDuplicateNameModal: false,
      overwriteAt: null,
      renameModal: false,
      newName: '',
      checkState: null
    }
  },
  methods: {
    resFileModalClose () {
      this.$emit('resFileModalClose')
    },
    saveChange (file) { // 保存对依赖文件的修改
      this.filesData[this.currentFile].file = file
      this.$Message.success({
        background: true,
        content: '修改成功'
      })
    },
    showFile (index) { // 展示依赖文件的内容
      this.currentFile = index
    },
    removeFile (index) { // 删除依赖文件
      this.filesData.splice(index, 1)
    },
    _getResFile (id) {
      if (!id) return
      axios.request({
        url: `api/v1/cedar/job/${id}/?fields=job_res_file,job_res_file.name,job_res_file.file,job_res_file.type`
      }).then(res => {
        this.filesData = res.data.job_res_file
        this.filesData.forEach(item => {
          item.fileUrl = item.file
          item.file = null
        })

        for (let i = 0; i < this.filesData.length; i++) {
          axios.request({
            url: `${baseURL}${this.filesData[i].fileUrl}`,
            responseType: 'blob'
          }).then(res => {
            let reader = new FileReader()
            if (res.data.type.split('/')[0] !== 'image') { // 图片则存放 dataURL
              reader.readAsText(res.data)
            } else { // json 则存放 text
              reader.readAsDataURL(res.data)
            }
            reader.onload = () => {
              this.filesData[i].file = reader.result
            }
          })
        }
      })
    },
    overwrite () {
      this.filesData.splice(this.overwriteAt, 1, this.fileData)
      this.checkDuplicateNameModal = false
    },
    rename () {
      this.checkDuplicateNameModal = false
      this.renameModal = true
    },
    setNewName () {
      this.fileData.name = this.newName + '.' + this.fileData.type
      this.filesData.push(this.fileData)
      this.renameModal = false
      this.checkState = null
      this.$bus.emit('setNewName', this.newName + '.' + this.fileData.type)
    },
    checkDuplicateName () {
      let flag = true
      for (let i = 0; i < this.filesData.length; i++) {
        if (suffixAutoRemove(this.filesData[i].name) === this.newName && this.fileData.type === this.filesData[i].type) {
          flag = false
          break
        }
      }
      this.checkState = flag
    },
    getFileData (tmachBlanks, itemType) {
      if (!tmachBlanks[0]) return
      for (let i = 0; i < this.filesData.length; i++) {
        if (this.filesData[i].name === tmachBlanks[0]) {
          /**
           * 将文件展示在 UnitEditor 中
           * 由 unitEditorUtils 组件响应
           */
          this.$bus.emit('showFile', {
            'fileToShow': this.filesData[i].file,
            'fileName': this.filesData[i].name,
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
      let filesData = this.filesData
      let flag = true
      for (let i = 0; i < filesData.length; i++) {
        if (fileData.name === filesData[i].name && fileData.type === filesData[i].type) {
          flag = false
          this.overwriteAt = i
          break
        }
      }
      if (!flag) {
        this.fileData = fileData
        this.checkDuplicateNameModal = true
      } else {
        filesData.push(fileData)
      }
    })
    /**
     * 获取 UnitItem 的依赖文件数据
     * 来自 unitEditorUnitItem 组件
     */
    this.$bus.on('getFileData', this.getFileData)
  },
  mounted () {
    if (this.$route.query.jobId) {
      this._getResFile(this.$route.query.jobId)
    }
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
</style>
