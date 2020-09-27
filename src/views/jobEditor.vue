<template>
  <div class="container">
    <div class="header flex-row">
      <Input v-model="$store.state.job.jobInfo.job_name" clearable class="job-name" placeholder="请输入JOB名称" size="large" />
      <div class="child-m-right--1 flex-row">
        <div class="child-m-right--1 flex-row">
          <Button type="primary" @click="$store.commit('handleShowDrawer')" size="large" style="margin-right: 10px;">用例详情</Button>
          <Button type="info" ghost size="large" @click="viewResFile" style="margin-right: 10px;">查看依赖文件</Button>
        </div>
        <div class="child-m-right--1 flex-row">
          <Button type="primary" size="large" @click="saveJob" style="margin-right: 10px;">保存</Button>
          <Button size="large" type="success" @click="saveAs" style="margin-right: 10px;">另存为</Button>
          <Button type="primary" ghost size="large" @click="_saveJob" style="margin-right: 10px;">存草稿</Button>
          <Button size="large" @click="cancelEdit">退出</Button>
        </div>
      </div>
    </div>
    <div class="content">
      <div id="outer-palette"></div>
      <div id="outer-diagram"></div>
    </div>
    <Modal v-model="rename" :closable="false" :mask-closeable="false" :styles="{ top: '42%' }">
      <div slot="header" style="color:#f60;text-align:center">
        <Icon type="ios-information-circle" style="font-size: 20px;"></Icon>
        <span style="font-size: 18px;">重命名</span>
      </div>
      <Input placeholder="重命名" clearable v-model="$store.state.job.jobInfo.job_name" />
      <div slot="footer" >
        <Button type="primary" @click="_saveJob(true, true, false)">确定</Button>
      </div>
    </Modal>
    <job-in-job
      :jobModalShow="jobModalShow"
      :currentJobBlockText="currentJobBlockText"
      @jobModalClose="jobModalClose"
    ></job-in-job>
    <job-res-file
      ref="jobResFile"
      :jobName="jobName"
    ></job-res-file>
    <NormalEditor
      :openNormalEditor="openNormalEditor"
      @closeNormalEditor="closeNormalEditor"
      @saveNormalData="saveNormalData"
    ></NormalEditor>
    <switch-block-detail-component
      :switch-block-info="switchBlockInfo"
      v-model="switchBlockModalShow"
      @save="switchBlockSave"
      @clear="switchBlockInfo = {}">
    </switch-block-detail-component>
  </div>
</template>
<script>
import { init } from './JobEditorGoInit'
import jobInJob from '_c/jobInJob'
import jobResFile from '_c/jobResFile/jobResFile.vue'
import NormalEditor from '_c/NormalEditor.vue'
import CONST from 'constant/constant'
import { jobFlowAndMsgSave, jobFlowAndMsgUpdate } from '../api/reef/jobFlow'
import { jobResFilesSave, getJobResFilesList, getJobResFile } from '../api/reef/jobResFileSave'
import { patchUpdateJob } from 'api/reef/job'
import SwitchBlockDetailComponent from '_c/SwitchBlockDetailComponent'
import { jobFlowValidation } from '../core/validation/finalValidation/job'
import { mapState, mapGetters } from 'vuex'
import { createJobLabel, dataURLtoFile, createNewTag } from '../lib/tools'
import { releaseOccupyDevice } from '../api/reef/device'

export default {
  name: 'jobEditor',
  components: { SwitchBlockDetailComponent, jobInJob, jobResFile, NormalEditor },
  data () {
    return {
      outerDiagram: null,
      outerPalette: null,
      jobName: '',
      switchBlockModalShow: false,
      currentSwitchBlockKey: null,
      switchBlockInfo: {},
      jobModalShow: false,
      currentJobBlockKey: null,
      currentJobBlockText: 'Job block',
      rename: false,
      lastActiveTime: null,
      activeTimeInterval: 120000,
      autoSaveInterval: 180000,
      autoSaveTimer: null,
      autoSaveToggle: true,
      openNormalEditor: false,
      wingmanCount: 0
    }
  },
  computed: {
    ...mapState('job', ['jobInfo', 'outerDiagramModel', 'finalResultBlockKey', 'draftId', 'draftLabel', 'normalKey']),
    ...mapGetters('job', ['jobId']),
    ...mapState('files', ['resFiles', 'resFilesName']),
    ...mapState('device', ['countdown', 'deviceInfo'])
  },
  watch: {
    jobInfo: {
      handler: function (val) {
        if (val.job_type === 'InnerJob' && this.finalResultBlockKey) {
          this.$Message.error({
            background: true,
            content: '无法为内嵌用例指定结果Block'
          })
        }
      },
      deep: true
    }
  },
  beforeRouteLeave  (to, from, next) {
    if (to.name === 'jobList' && this.autoSaveToggle) {
      this.$store.commit('job/setOuterDiagramModel', this.outerDiagram.model.toJson())
    }
    next()
  },
  beforeDestroy () {
    window.removeEventListener('contextmenu', this.dispatchMouseEvent)
    window.removeEventListener('mousemove', this.dispatchMouseEvent)
    window.clearInterval(this.autoSaveTimer)
  },
  methods: {
    closeNormalEditor () {
      this.openNormalEditor = false
    },
    switchBlockSave (msg) {
      let node = this.outerDiagram.model.findNodeDataForKey(this.currentSwitchBlockKey)
      this.outerDiagram.model.setDataProperty(node, 'text', msg.switchBlockName)
      this.outerDiagram.model.setDataProperty(node, 'fileName', msg.fileName)
      this.outerDiagram.model.setDataProperty(node, 'explain', msg.explain)
    },
    saveNormalData (val) {
      let curNormalData = this.outerDiagram.findNodeForKey(this.normalKey).data
      this.outerDiagram.model.setDataProperty(curNormalData, 'text', val.text)
      this.outerDiagram.model.setDataProperty(curNormalData, 'star', val.star)
      this.outerDiagram.model.setDataProperty(curNormalData, 'color', val.color)
      this.outerDiagram.model.setDataProperty(curNormalData, 'unitLists', val.unitLists)
      this.outerDiagram.model.setDataProperty(curNormalData, 'resFile', val.resFile)
    },
    _jobFlowRules () {
      const myDiagramEventValidationHint = jobFlowValidation(this)
      // 错误提示
      if (myDiagramEventValidationHint.size !== 0) {
        let errorNum = 1
        let errorMessage = ''
        myDiagramEventValidationHint.forEach(element => {
          errorMessage += errorNum + '.' + element + '<br/>'
          errorNum++
        })
        // message提示
        this.$Notice.error({
          title: '当前用例出现以下错误',
          render: h => {
            return h('div', [
              h('div', {
                domProps: {
                  innerHTML: errorMessage
                }
              }),
              h('Button', {
                style: {
                  marginTop: '16px'
                },
                on: {
                  click: this._saveJob
                }
              }, '存为草稿')
            ])
          }
        })
        return false
      } else return true
    },
    _jobMsgRules () {
      let flag = false
      if (this.$store.state.job.isValidated) {
        flag = true
      } else {
        this.$store.commit('handleShowDrawer')
      }
      return flag
    },
    isInvalidInnerJob () {
      let flag = false
      let { count } = this.outerDiagram.findNodesByExample({ 'category': 'Job' })
      if (this.jobInfo.job_type === 'InnerJob') {
        if (this.finalResultBlockKey) {
          this.$Message.error({
            background: true,
            content: '无法为内嵌用例指定结果Block'
          })
          flag = true
        }
        if (count > 0) {
          this.$Message.error({
            background: true,
            content: '内嵌用例暂不支持嵌套'
          })
          flag = true
        }
      }
      return flag
    },
    saveJob (saveAs = false) {
      if (!this._jobMsgRules() || this.isInvalidInnerJob()) return
      if (this._jobFlowRules()) {
        this.autoSaveToggle = false
        this._saveJob(saveAs, false, false)
      }
    },
    async uploadFiles (id, info) {
      info.job_id = id
      let resFiles = this._.cloneDeep(this.resFiles)
      try {
        let { status } = await jobFlowAndMsgUpdate(id, info)
        if (status === 200) {
          let data = new FormData()
          data.append('job', id)
          for (let i = 0; i < resFiles.length; i++) {
            let { name, type, file } = resFiles[i]
            if (type === 'png') {
              data.append('file', dataURLtoFile(file, name))
            } else {
              data.append('file', new File([file], name, { type }))
            }
          }
          try {
            let { status } = await jobResFilesSave(data)
            if (status === 201) {
              this.$Message.success({
                background: true,
                content: 'Job 保存成功'
              })
            } else {
              this.$Message.error({
                background: true,
                content: '依赖文件上传失败'
              })
            }
          } catch (error) {
            console.log(error)
          }
        } else {
          this.$Message.error({
            background: true,
            content: 'Job 保存失败'
          })
        }
      } catch (error) {
        console.log(error)
      }
    },
    removeInvalidFile (job) {
      let normalBlocks = job.nodeDataArray.filter(item => item.category === 'normalBlock')
      let resFile = {}
      normalBlocks.forEach(val => {
        Object.assign(resFile, val.resFile)
      })
      for (let i = this.resFiles.length - 1; i >= 0; i--) {
        if (!this.resFiles[i].name.startsWith('ForPointSelect_') && !resFile[this.resFiles[i].name]) {
          this.$store.commit('files/removeResFile', i)
        }
      }
    },
    async prepareJobInfo (saveAs, createNew, isDraft) {
      let info = this._.cloneDeep(this.jobInfo)
      info.ui_json_file = JSON.parse(this.outerDiagram.model.toJson())
      info.test_area = await createNewTag('test_area', info)
      info.custom_tag = await createNewTag('custom_tag', info)
      info.author = localStorage.id
      this.removeInvalidFile(info.ui_json_file)
      info.inner_job_list = []
      let innerJobs = this.outerDiagram.findNodesByExample({ 'category': 'Job' })
      innerJobs.each(node => {
        if (node.data.jobLabel) {
          info.inner_job_list.push(node.data.jobLabel)
        }
      })
      if (saveAs || createNew) {
        info.job_label = createJobLabel(this)
      }
      if (!saveAs) {
        info.draft = isDraft
      }
      return info
    },
    async _saveJob (e, saveAs = false, isDraft = true) {
      let id = this.jobId
      let info = await this.prepareJobInfo(saveAs, !id, isDraft)
      this.$store.commit('files/addResFile', {
        name: 'FILES_NAME_CONFIG.json',
        type: 'json',
        file: JSON.stringify(this.resFilesName, null, 2)
      })
      if (saveAs) {
        if (this.draftId) {
          info.job_label = this.draftLabel
          this.uploadFiles(this.draftId, info)
        } else {
          try {
            let { status, data } = await jobFlowAndMsgSave(info)
            if (status === 201) id = data.id
            this.uploadFiles(id, info)
          } catch (error) {
            console.log(error)
          }
        }
      } else {
        if (id) {
          this.uploadFiles(id, info)
          if (this.draftId) {
            patchUpdateJob(this.draftId, { job_deleted: true })
          }
        } else {
          if (this.draftId) {
            info.job_label = this.draftLabel
            this.uploadFiles(this.draftId, info)
          } else {
            try {
              let { status, data } = await jobFlowAndMsgSave(info)
              if (status === 201) id = data.id
              this.uploadFiles(id, info)
            } catch (error) {
              console.log(error)
            }
          }
        }
      }
      await this.clearData()
      this.$router.push({ path: '/jobList' })
      this.$store.commit('setCurPage', 1)
    },
    prepareInnerJobList () {
      let list = []
      let innerJobs = this.outerDiagram.findNodesByExample({ 'category': 'Job' })
      innerJobs.each(node => { if (node.data.jobLabel) { list.push(node.data.jobLabel) } })
      return list
    },
    async prepareAutoSaveInfo () {
      let info = this._.cloneDeep(this.jobInfo)
      info.test_area = await createNewTag('test_area', info)
      this.$store.dispatch('job/setJobTestArea', this._.cloneDeep(info.test_area))
      info.custom_tag = await createNewTag('custom_tag', info)
      this.$store.dispatch('job/setJobCustomTag', this._.cloneDeep(info.custom_tag))
      info.ui_json_file = JSON.parse(this.outerDiagram.model.toJson())
      info.author = localStorage.id
      info.job_name += '_AUTOSAVE'
      info.inner_job_list = this.prepareInnerJobList()
      if (this.draftLabel) {
        info.job_label = this.draftLabel
      } else {
        info.job_label = createJobLabel(this)
        this.$store.commit('job/setDraftLabel', info.job_label)
      }
      return info
    },
    async autoSave () {
      let curTime = Date.now()
      if (curTime - this.lastActiveTime >= this.activeTimeInterval || !this._jobMsgRules() || !this.autoSaveToggle) return
      let info = await this.prepareAutoSaveInfo()
      info.job_label = this.draftLabel
      this.$store.commit('files/addResFile', {
        name: 'FILES_NAME_CONFIG.json',
        type: 'json',
        file: JSON.stringify(this.resFilesName, null, 2)
      })
      if (!this.draftId) {
        try {
          let { status, data } = await jobFlowAndMsgSave(info)
          if (status === 201) {
            this.$store.commit('job/setDraftId', data.id)
            this.uploadFiles(data.id, info)
          }
        } catch (error) {
          console.log(error)
        }
      } else {
        this.uploadFiles(this.draftId, info)
      }
      this.$Notice.success({
        title: '温馨提示',
        desc: `已为您自动保存当前内容, 用例名称为 ${info.job_name}`,
        duration: 6
      })
    },
    saveAs () {
      this.rename = true
    },
    jobModalClose (job) {
      this.jobModalShow = false
      if (job.id) {
        let currentJobBlockData = this.outerDiagram.findNodeForKey(this.currentJobBlockKey).data
        this.outerDiagram.model.setDataProperty(currentJobBlockData, 'text', job.job_name)
        this.outerDiagram.model.setDataProperty(currentJobBlockData, 'jobId', job.id)
        this.outerDiagram.model.setDataProperty(currentJobBlockData, 'jobLabel', job.job_label)
        console.log(currentJobBlockData)
      }
    },
    viewResFile () {
      this.$store.commit('files/setShowResFileModal')
    },
    handleResFile () {
      if (!this.jobId) return
      getJobResFilesList(this.jobId).then(({ status, data }) => {
        if (status === 200) {
          let filesInfo = data.job_res_file
          let filesNameConfigIndex
          filesInfo.forEach((item, index) => {
            item.fileUrl = item.file
            if (item.name === 'FILES_NAME_CONFIG.json' || item.name === 'filesNameConfig.json') {
              filesNameConfigIndex = index
            }
          })
          Promise.all(filesInfo.map(item => getJobResFile(item.fileUrl))).then(res => {
            res.forEach((file, index) => {
              let reader = new FileReader()
              if (file.data.type.split('/')[0] !== 'image') { // json 则存放 text
                reader.readAsText(file.data)
              } else { // 图片则存放 dataURL
                reader.readAsDataURL(file.data)
              }
              reader.onload = () => {
                filesInfo[index].file = reader.result
                if (index === filesNameConfigIndex) {
                  this.$store.commit('files/setResFilesName', reader.result)
                }
              }
            })
          }).then(() => {
            this.$store.commit('files/setResFiles', filesInfo)
          })
        } else {
          throw new Error('依赖文件获取失败')
        }
      }).catch(err => {
        console.log(err)
        this.$Message.error({ background: true, content: '依赖文件获取失败' })
      })
    },
    async clearData () {
      this.$store.commit('job/setDraftId', null)
      this.$store.commit('job/setDraftLabel', null)
      this.$store.commit('job/setJobInfo', {})
      this.$store.commit('job/setOuterDiagramModel', null)
      this.$store.commit('job/setPreJobInfo', false)
      this.$store.commit('job/setFinalResultBlock', null)
      this.$store.commit('files/clearResFiles')
      let resFilesName = []
      for (let key in CONST.WILL_TOUCH_NAME) {
        resFilesName.push({
          title: CONST.WILL_TOUCH_NAME[key],
          key,
          children: []
        })
      }
      this.$store.commit('files/setResFilesName', JSON.stringify(resFilesName))
      if (this.countdown) {
        try {
          let { status } = await releaseOccupyDevice({
            device_id_list: [this.deviceInfo.id]
          })
          if (status === 200) {
            this.$Message.info({
              background: true,
              content: '设备已释放'
            })
            this.$store.commit('device/setCountdown')
            this.$store.commit('device/clearDeviceInfo')
            this.$store.commit('device/clearPreDeviceInfo')
          }
        } catch (err) {
          console.log(err)
          this.$Message.error({
            background: true,
            content: '设备释放失败' + err.toString()
          })
        }
      }
    },
    cancelEdit () {
      this.autoSaveToggle = false
      if (this.draftId) {
        patchUpdateJob(this.draftId, { job_deleted: true }).then(({ status }) => {
          if (status === 200) {
            this.$Notice.warning({
              title: '温馨提示',
              desc: `已为您将自动保存的草稿删除`,
              duration: 6
            })
          }
        })
      }
      this.clearData()
      this.$router.push({ path: '/jobList' })
    },
    dispatchMouseEvent (evt) {
      switch (evt.type) {
        case 'mousemove':
          this.lastActiveTime = Date.now()
          break
        case 'contextmenu':
          evt.preventDefault()
          break
      }
    }
  },
  mounted () {
    init(this) // 创建画板与画布并绘制流程图
    if (!this.resFiles.length) this.handleResFile()
    this.autoSaveTimer = setInterval(this.autoSave, this.autoSaveInterval) // 300000
    window.addEventListener('contextmenu', this.dispatchMouseEvent)
    window.addEventListener('mousemove', this.dispatchMouseEvent)
    window.addEventListener('beforeunload', () => {
      if (this.draftId) patchUpdateJob(this.draftId, { job_deleted: true })
      this.$store.commit('job/setDraftId', null)
    })
  }
}
</script>
<style lang="less" scoped>
@import '../css/common.less';
.container {
  display: flex;
  flex-direction: column;
  height: 100%;
  .header {
    margin-bottom: 1em;
    .job-name {
      width: 13em;
      margin-right: 1em;
    }
    .job-name + div {
      flex: 1;
    }
  }
  .content {
    flex: 1;
    display: flex;
    > div {
      border: 1px solid #cccccc;
      border-radius: 6px;
    }
    #outer-palette {
      width: 13em;
      margin-right: 1em;
    }
    #outer-diagram {
      flex: 1;
    }
  }
}
</style>
