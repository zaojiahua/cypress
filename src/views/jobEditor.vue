<template>
  <div class="container" @click="closeJobController">
    <div class="header flex-row">
      <Input v-model="$store.state.job.jobInfo.job_name" clearable class="job-name" placeholder="请输入JOB名称" size="large" />
      <div class="child-m-right--1 flex-row">
        <div class="child-m-right--1 flex-row">
          <Button type="primary" @click="$store.commit('handleShowDrawer')" size="large" style="margin-right: 10px;">用例详情</Button>
          <Button type="info" ghost size="large" @click="viewResFile" style="margin-right: 10px;">查看依赖文件</Button>
        </div>
        <div class="child-m-right--1 flex-row">
          <Dropdown @on-click="handleMenu">
            <Button size="large">
              菜单
              <Icon type="ios-menu" />
            </Button>
            <DropdownMenu slot="list">
              <DropdownItem name="save">保存</DropdownItem>
              <DropdownItem name="saveAs">另存为</DropdownItem>
              <DropdownItem name="saveDraft">存草稿</DropdownItem>
              <DropdownItem name="quit">退出</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    </div>
    <div class="content">
      <div id="outer-palette"></div>
      <div id="outer-diagram"></div>
    </div>
    <ButtonGroup vertical size="default" id="job-controller">
      <Button type="primary" @click="setWingman(0)">主机</Button>
      <Button v-for="wingman in wingmans" :key="wingman" @click="setWingman(wingman)">{{wingman}} 号机</Button>
    </ButtonGroup>
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
    <div class="saving-mask" v-if="saving">
      <CypressLoader :size="60"></CypressLoader>
    </div>
  </div>
</template>
<script>
import { init } from './JobEditorGoInit'
import jobInJob from '_c/jobInJob'
import jobResFile from '_c/jobResFile/jobResFile.vue'
import NormalEditor from '_c/NormalEditor.vue'
import CypressLoader from '_c/common/Loader.vue'
import CONST from 'constant/constant'
import SwitchBlockDetailComponent from '_c/SwitchBlockDetailComponent'
import { jobFlowValidation } from '../core/validation/finalValidation/job'
import { mapState, mapGetters } from 'vuex'
import { createJobLabel, dataURLtoFile, shouldCreateNewTag, createNewTag } from '../lib/tools'
import { releaseOccupyDevice, updateJobMsg, jobResFilesSave, getJobResFilesList, saveJobFlowAndMsg, getJobResFile } from '../api/reef/request'

export default {
  name: 'jobEditor',
  components: { SwitchBlockDetailComponent, jobInJob, jobResFile, NormalEditor, CypressLoader },
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
      lastActiveTime: null,
      activeTimeInterval: 120000,
      autoSaveInterval: 180000,
      autoSaveTimer: null,
      autoSaveToggle: true,
      openNormalEditor: false,
      wingmanCount: 0,
      wingmans: 3,
      jobController: null, // unit 右键菜单栏dom对象
      saving: false
    }
  },
  computed: {
    ...mapState('job', ['jobInfo', 'outerDiagramModel', 'isValidated', 'draftId', 'draftLabel', 'normalData', 'config']),
    ...mapGetters('job', ['jobId', 'normalKey']),
    ...mapState('files', ['resFiles']),
    ...mapGetters('files', ['resFilesName']),
    ...mapState('device', ['countdown', 'deviceInfo'])
  },
  watch: {
    jobInfo: {
      handler: function (val) {
        if (val.job_type === 'InnerJob' && this.config.finalResultKey) { // 如果当前用例为innerjob且已经指定了结果block，则提醒用户错误
          this.$Message.error({
            background: true,
            content: '无法为内嵌用例指定结果Block'
          })
        }
      },
      deep: true
    },
    saving (val) { //监听saving字段
      if (!val && !this.autoSaveToggle) { // 保存动作结束时，且自动保存没有开启则跳转到jobList页面
        this.$router.push({ path: '/jobList' })
        this.$store.commit('setCurPage', 1)
      }
    }
  },
  beforeRouteLeave  (to, from, next) {
    if (to.name === 'jobList' && this.autoSaveToggle) { // 离开jobEditor页面去往jobList页面时，如果自动保存处于开启状态，则将当前用例逻辑流保存到store中
      this.$store.commit('job/setOuterDiagramModel', this.outerDiagram.model.toJson())
    }
    next()
  },
  beforeDestroy () {
    window.removeEventListener('contextmenu', this.dispatchMouseEvent)
    window.removeEventListener('mousemove', this.dispatchMouseEvent)
  },
  methods: {
    closeNormalEditor () { // 关闭Normal块的编辑页面
      this.openNormalEditor = false
    },
    switchBlockSave (msg) {
      let node = this.outerDiagram.model.findNodeDataForKey(this.currentSwitchBlockKey)
      this.outerDiagram.model.setDataProperty(node, 'text', msg.switchBlockName)
      this.outerDiagram.model.setDataProperty(node, 'fileName', msg.fileName)
      this.outerDiagram.model.setDataProperty(node, 'explain', msg.explain)
    },
    saveNormalData (val) { // 将编辑后的的内容更新到当前Normal块中
      let { data } = this.outerDiagram.findNodeForKey(this.normalKey)
      CONST.NORMAL_DATA_KEY.forEach((key) => {
        this.outerDiagram.model.setDataProperty(data, key, val[key])
      })
    },
    _jobFlowRules () { // 获取逻辑流的错误并弹出显示
      const myDiagramEventValidationHint = jobFlowValidation(this)
      // 错误提示
      if (myDiagramEventValidationHint.size !== 0) {
        let errorNum = 1
        let errorMessage = ''
        myDiagramEventValidationHint.forEach(element => {
          errorMessage = `${errorMessage}${errorNum++}.${element}<br/>`
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
                  click: () => this.handleMenu('saveDraft')
                }
              }, '存为草稿')
            ])
          }
        })
        return false
      } else return true
    },
    _jobMsgRules () { // 右侧抽屉中的表单信息是否通过校验
      let flag = false
      if (this.$store.state.job.isValidated) {
        flag = true
      } else { // 否，弹出右侧抽屉
        this.$store.commit('handleShowDrawer')
      }
      return flag
    },
    isInvalidInnerJob () { // 检测是否是合法的innerjob，见下文Message中的content
      let flag = false
      let { count } = this.outerDiagram.findNodesByExample({ 'category': 'Job' })
      if (this.jobInfo.job_type === 'InnerJob') {
        if (this.config.finalResultKey) {
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
    async uploadFiles (id, info) { // 保存依赖文件，失败则抛出异常
      this.saving = true
      info.job_id = id
      let resFiles = this._.cloneDeep(this.resFiles)
      try {
        let { status } = await updateJobMsg(id, info) // 更新jobInfo
        if (status === 200) {
          let data = new FormData()
          data.append('job', id)
          for (let i = 0; i < resFiles.length; i++) {
            let { name, type, file } = resFiles[i]
            if (name === 'FILES_NAME_CONFIG.json') continue // 兼容老版本
            if (type === 'png') {
              data.append('file', dataURLtoFile(file, name))
            } else {
              data.append('file', new File([file], name, { type }))
            }
          }
          try {
            if (resFiles.length) {
              await jobResFilesSave(data) // 更新依赖文件
            }
          } catch (error) {
            console.log(error)
            throw new Error('Job保存失败')
          }
        } else {
          throw new Error('Job保存失败')
        }
        this.$Message.success({
          background: true,
          content: '用例保存成功'
        })
      } catch (error) {
        console.log(error)
        throw new Error(error)
      } finally {
        this.saving = false
      }
    },
    calcWingmanCount () { // 计算用到的僚机数量, 僚机信息保存在normal/job块的data中
      let wingman = new Array(4).fill(0)
      let normalBlocks = this.outerDiagram.findNodesByExample({ 'category': 'normalBlock' })
      normalBlocks.each(({ data }) => {
        if (data.wingman) {
          wingman[1] += data.wingman[1]
          wingman[2] += data.wingman[2]
          wingman[3] += data.wingman[3]
        }
      })
      let innerJobs = this.outerDiagram.findNodesByExample({ 'category': 'Job' })
      innerJobs.each(({ data }) => {
        if (data.assistDevice) {
          wingman[data.assistDevice]++
        }
      })
      return wingman.reduce((pre, cur) => cur > 0 ? 1 + pre : pre, 0)
    },
    async handleMenu (name) { // 点击菜单项时动作分发
      async function createNewJob (context, jobInfo) { // 复用自动保存的用俐/创建新用俐
        if (context.draftId) { // 将自动保存的Job正式保存下来
          jobInfo.job_label = context.draftLabel
          try {
            await context.uploadFiles(context.draftId, jobInfo)
          } catch (error) {
            throw new Error(error)
          }
        } else { // 创建新的Job
          jobInfo.job_label = createJobLabel(context)
          try {
            let { status, data } = await saveJobFlowAndMsg(jobInfo)
            let id
            if (status === 201) id = data.id
            await context.uploadFiles(id, jobInfo)
          } catch (err) {
            console.log(err)
            throw new Error(err)
          }
        }
      }
      if (name === 'quit') { // 退出
        this.autoSaveToggle = false
        if (this.draftId) {
          updateJobMsg(this.draftId, { job_deleted: true })
        }
        this.$router.push({ path: '/jobList' })
        this.$store.commit('setCurPage', 1)
      } else {
        let id = this.jobId
        let jobInfo = await this.prepareJobInfo()
        if (name === 'saveDraft') { // 存草稿
          if (!this._jobMsgRules()) return
          jobInfo.draft = true
          this.autoSaveToggle = false
          if (id) {
            try {
              await this.uploadFiles(id, jobInfo)
            } catch (error) {
              this.$Message.error({
                background: true,
                content: error
              })
              return
            }
            if (this.draftId) {
              updateJobMsg(this.draftId, { job_deleted: true })
            }
            await this.clearData()
            return
          }
        } else {
          if (this.innerJobNum !== jobInfo.inner_job_list.length) {
            this.$Message.error({
              background: true,
              content: '不允许存在空的Job块'
            })
            return
          }
          if (!this._jobMsgRules() || !this._jobFlowRules() || this.isInvalidInnerJob()) return
          if (this._jobFlowRules()) this.autoSaveToggle = false
          if (name === 'save') { // 保存
            jobInfo.draft = false
            if (id) {
              try {
                await this.uploadFiles(id, jobInfo)
              } catch (error) {
                this.$Message.error({
                  background: true,
                  content: error
                })
                return
              }
              if (this.draftId) {
                updateJobMsg(this.draftId, { job_deleted: true })
              }
              await this.clearData()
              return
            }
          }
          if (name === 'saveAs') { // 另存为
            this.$Modal.confirm({
              render: (h) => {
                return h('Input', {
                  props: {
                    value: this.$store.state.job.jobInfo.job_name,
                    autofocus: true,
                    placeholder: '请输入新的用例名称'
                  },
                  on: {
                    input: (val) => {
                      this.value = val
                    }
                  },
                  nativeOn: {
                    keydown: async (e) => {
                      switch (e.keyCode) {
                        case 13: // enter
                          jobInfo.job_name = e.target.value.trim() || jobInfo.job_name
                          try {
                            await createNewJob(this, jobInfo)
                          } catch (error) {
                            this.$Message.error({
                              background: true,
                              content: error
                            })
                            return
                          }
                          await this.clearData()
                          this.$Modal.remove()
                          break
                        case 27: // esc
                          this.$Modal.remove()
                          break
                      }
                    }
                  }
                })
              },
              onOk: async () => {
                jobInfo.job_name = this.value.trim() || jobInfo.job_name
                try {
                  await createNewJob(this, jobInfo)
                } catch (error) {
                  this.$Message.error({
                    background: true,
                    content: error
                  })
                  return
                }
                await this.clearData()
              }
            })
            return
          }
        }
        try {
          await createNewJob(this, jobInfo)
        } catch (error) {
          this.$Message.error({
            background: true,
            content: error
          })
          return
        }
      }
      await this.clearData()
    },
    async prepareJobInfo () { // 返回保存用例时需要的信息
      // 将配置信息保存在Start节点
      let { data: start } = this.outerDiagram.findNodeForKey(-1)
      this.outerDiagram.model.setDataProperty(start, 'config', this._.cloneDeep(this.config))
      // 保存Job信息
      let jobInfo = this._.cloneDeep(this.jobInfo)
      jobInfo.ui_json_file = JSON.parse(this.outerDiagram.model.toJson())
      jobInfo.ui_json_file.nodeDataArray.forEach((val, idx, arr) => {
        if ('unitLists' in val && typeof val.unitLists === 'string') {
          arr[idx].unitLists = JSON.parse(val.unitLists)
        }
      })
      jobInfo.subsidiary_device_count = this.calcWingmanCount()
      jobInfo.author = localStorage.id
      // 创建新的标签
      if (shouldCreateNewTag('test_area', jobInfo)) {
        jobInfo.test_area = await createNewTag('test_area', jobInfo)
        this.$store.dispatch('setBasicTestArea')
      }
      if (shouldCreateNewTag('custom_tag', jobInfo)) {
        jobInfo.custom_tag = await createNewTag('custom_tag', jobInfo)
        this.$store.dispatch('setBasicCustomTag')
      }
      // 记录涉及到的InnerJob
      jobInfo.inner_job_list = []
      let innerJobs = this.outerDiagram.findNodesByExample({ 'category': 'Job' })
      this.innerJobNum = innerJobs.count
      innerJobs.each(node => {
        if (node.data.jobLabel) {
          jobInfo.inner_job_list.push(node.data.jobLabel)
        }
      })
      return jobInfo
    },
    prepareInnerJobList () { // 保存用到的innerjob的joblabel
      let list = []
      let innerJobs = this.outerDiagram.findNodesByExample({ 'category': 'Job' })
      innerJobs.each(node => { if (node.data.jobLabel) { list.push(node.data.jobLabel) } })
      return list
    },
    async prepareAutoSaveInfo () {
      let { data: start } = this.outerDiagram.findNodeForKey(-1)
      this.outerDiagram.model.setDataProperty(start, 'config', this._.cloneDeep(this.config))
      let info = this._.cloneDeep(this.jobInfo)
      if (shouldCreateNewTag('test_area', info)) {
        info.test_area = await createNewTag('test_area', info)
        this.$store.dispatch('setBasicTestArea')
        setTimeout(() => {
          this.$store.commit('job/setJobTestArea', this._.cloneDeep(info.test_area))
        }, 400)
      }
      if (shouldCreateNewTag('custom_tag', info)) {
        info.custom_tag = await createNewTag('custom_tag', info)
        this.$store.dispatch('setBasicCustomTag')
        setTimeout(() => {
          this.$store.commit('job/setJobCustomTag', this._.cloneDeep(info.custom_tag))
        }, 400)
      }
      info.ui_json_file = JSON.parse(this.outerDiagram.model.toJson())
      info.subsidiary_device_count = this.calcWingmanCount()
      info.author = localStorage.id
      info.job_name += '_AUTOSAVE'
      info.draft = true
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
      if (!this.draftId) {
        try {
          let { status, data } = await saveJobFlowAndMsg(info)
          if (status === 201) {
            this.$store.commit('job/setDraftId', data.id)
            await this.uploadFiles(data.id, info)
          }
        } catch (error) {
          console.log(error)
          throw new Error('自动保存失败')
        }
      } else {
        try {
          await this.uploadFiles(this.draftId, info)
        } catch (error) {
          throw new Error(error)
        }
      }
    },
    jobModalClose (job) { // 关闭innerJob的选取页面, 并将选取的innerjob信息保存下来
      this.jobModalShow = false
      if (job.id) {
        let currentJobBlockData = this.outerDiagram.findNodeForKey(this.currentJobBlockKey).data
        this.outerDiagram.model.setDataProperty(currentJobBlockData, 'text', job.job_name)
        this.outerDiagram.model.setDataProperty(currentJobBlockData, 'jobId', job.id)
        this.outerDiagram.model.setDataProperty(currentJobBlockData, 'jobLabel', job.job_label)
      }
    },
    viewResFile () { // 打开依赖文件的展示页面
      this.$store.commit('files/setShowResFileModal')
    },
    handleResFile () { // jobEditor挂载时获取依赖文件
      if (!this.jobId) return
      getJobResFilesList(this.jobId).then(({ status, data }) => {
        if (status === 200) {
          let filesData = data.job_res_file
          Promise.all(filesData.map(item => getJobResFile(item.file))).then(res => {
            res.forEach((file, index) => {
              let reader = new FileReader()
              if (file.data.type.split('/')[0] !== 'image') { // json 则存放 text
                reader.readAsText(file.data)
              } else { // 图片则存放 dataURL
                reader.readAsDataURL(file.data)
              }
              reader.onload = () => {
                filesData[index].file = reader.result
                filesData[index].index = index
                filesData[index].dirty = true
                if (filesData[index].name === 'FILES_NAME_CONFIG.json') {
                  this.$store.commit('job/handleConfig', {
                    action: 'setByProductsName',
                    data: JSON.parse(reader.result)
                  })
                }
              }
            })
          }).then(() => {
            this.$store.commit('files/handleResFiles', {
              action: 'setResFiles',
              data: filesData
            })
          }).catch((error) => {
            throw new Error(error)
          })
        } else {
          throw new Error('依赖文件获取失败')
        }
      }).catch(err => {
        console.log(err)
        this.$Message.error({ background: true, content: err })
      })
    },
    async clearData () { // 清空用到的信息
      this.$store.commit('job/setDraftId', null) // 清除自动保存的用例的Id
      this.$store.commit('job/setDraftLabel', null) // 清除自动保存的用例的label
      this.$store.commit('job/handleJobInfo', { action: 'setJobInfo', data: {} }) // 清空jobInfo
      this.$store.commit('job/setOuterDiagramModel', null) // 清空画布信息
      this.$store.commit('job/handleJobInfo', { action: 'setPreJobInfo', data: false }) // 清空上一次选择的job的信息
      this.$store.commit('job/handleConfig', { action: 'init' })
      this.$store.commit('job/setIsValidated', false)
      this.$store.commit('files/handleResFiles', { action: 'clearResFiles' })
      this.$store.commit('unit/handleUnitData', { action: 'clearUnitData' })
      this.$store.commit('item/handleItemData', { action: 'clearItemData' })
      this.autoSaveToggle = false
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
    dispatchMouseEvent (evt) {
      switch (evt.type) {
        case 'mousemove': // 记录最后移动鼠标的时间
          this.lastActiveTime = Date.now()
          break
        case 'contextmenu': // 阻止鼠标右键的默认行为
          evt.preventDefault()
          break
      }
    },
    setWingman (id) { // 设置僚机
      let curJobBlock = this.outerDiagram.findNodeForKey(this.currentJobBlockKey)
      if (id) {
        this.outerDiagram.model.setDataProperty(curJobBlock.data, 'assistDevice', id)
      } else {
        this.outerDiagram.model.setDataProperty(curJobBlock.data, 'assistDevice', null)
        delete curJobBlock.data.assistDevice
      }
      this.closeJobController()
    },
    closeJobController () {
      this.jobController.style.display = 'none'
    }
  },
  mounted () {
    init(this) // 创建画板与画布并绘制流程图
    debugger
    if (!this.resFiles.length) this.handleResFile()
    this.autoSaveToggle = true
    this.jobController = document.getElementById('job-controller')
    let timer = setInterval(async () => { // 设置自动保存的自动循环
      try {
        await this.autoSave()
      } catch (error) {
        this.$Message.error({
          background: true,
          content: error
        })
      }
    }, this.autoSaveInterval)
    this.$once('hook:beforeDestroy', () => { // 离开jobEditor时清除定时器
      clearInterval(timer)
      timer = null
    })
    window.addEventListener('contextmenu', this.dispatchMouseEvent) //右键菜单栏
    window.addEventListener('mousemove', this.dispatchMouseEvent) //
    window.addEventListener('beforeunload', () => { // 刷新/关闭页面时删除自动保存的用例
      if (this.draftId) updateJobMsg(this.draftId, { job_deleted: true })
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
  #job-controller {
    display: none;
    position: absolute;
    z-index: 100;
  }
  .saving-mask {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, .6);
    z-index: 1000;
  }
}
</style>
