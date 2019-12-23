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
  </Modal>
</template>

<script>
import jobResFileShow from './jobResFileShow'
import jobResFileTable from './jobResFileTable'

import axios from '../api'
import { baseURL } from '../config'

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
      currentFile: 0
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
            url: `${baseURL}/${this.filesData[i].fileUrl}`,
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
    }
  },
  mounted () {
    if (this.$route.query.jobId) {
      this._getResFile(this.$route.query.jobId)
    }
  }
}
</script>

<style lang="less" scoped>
.res-file {
    display: flex;
    justify-content: space-between;
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
