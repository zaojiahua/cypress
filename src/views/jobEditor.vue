<template>
  <div class="container" @click="closeJobController">
    <div class="header flex-row">
      <Input :disabled="!editJobMsg" v-model="$store.state.job.jobInfo.job_name" clearable class="job-name" placeholder="请输入JOB名称" size="large" />
      <div class="child-m-right--1 flex-row">
        <div class="child-m-right--1 flex-row">
          <Button type="primary" @click="$store.commit('handleShowDrawer',true)" size="large" style="margin-right: 10px;">用例详情</Button>
          <Button v-if="editJobFlow" type="info" ghost size="large" @click="viewResFile" style="margin-right: 10px;">查看依赖文件</Button>
<!--          <Button v-if="editJobFlow" type="info" ghost size="large" :disabled="!duplicateId" @click="duplicateTipModal = true" style="margin-right: 10px;">使用副本</Button>-->
          <Modal
            title="确认使用副本替换当前的编辑内容吗？"
            v-model="duplicateTipModal"
            @on-ok="showDuplicateJob"
            class-name="vertical-center-modal">
            <p>替换内容包括运行流程图，依赖文件以及用例的详细信息，且不可逆</p>
          </Modal>
        </div>
        <div class="child-m-right--1 flex-row">
          <Dropdown @on-click="handleMenu">
            <Button size="large">
              菜单
              <Icon type="ios-menu" />
            </Button>
            <DropdownMenu slot="list">
              <DropdownItem v-if="editJobFlow" name="save">保存</DropdownItem>
              <DropdownItem v-if="editJobFlow && selectJobType === 'InnerJob'" name="saveAs">另存为</DropdownItem>
              <DropdownItem v-if="editJobFlow" name="saveDraft">存草稿</DropdownItem>
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
      @saveFinalResKey="saveFinalResKey"
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
import { init,setOuterDiagramData } from './JobEditorGoInit'
import jobInJob from '_c/jobInJob'
import jobResFile from '_c/jobResFile/jobResFile.vue'
import NormalEditor from '_c/NormalEditor.vue'
import CypressLoader from '_c/common/Loader.vue'
import CONST from 'constant/constant'
import SwitchBlockDetailComponent from '_c/SwitchBlockDetailComponent'
import { jobFlowValidation } from '../core/validation/finalValidation/job'
import { mapState, mapGetters } from 'vuex'
import { createJobLabel, dataURLtoFile, shouldCreateNewTag, createNewTag } from '../lib/tools'
import {
  releaseOccupyDevice,
  updateJobMsg,
  jobResFilesSave,
  getJobResFilesList,
  saveJobFlowAndMsg,
  getJobResFile,
  getJobId,
  getJobDetail,
  updateFlowWithFlowId,
  createFlow,
  jobFlowByJobLabel, getJobFlowList
} from '../api/reef/request'
import util from "lib/util/validate";
import {jobSerializer} from "lib/util/jobListSerializer";
import {jobBindResource} from 'api/reef/request'

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
      lastActiveTime: null, // 记录最后移动鼠标的时间
      activeTimeInterval: 2 * 60 * 1000, //记录页面无操作最大时间，超过则不进行自动保存
      autoSaveInterval: 3 * 60 * 1000,
      autoSaveTimer: null,
      autoSaveToggle: true, //自动保存开关 默认开启
      openNormalEditor: false,
      wingmanCount: 0,
      wingmans: 3,
      jobController: null, // unit 右键菜单栏dom对象
      saving: false, //是否展示加载动画
      duplicateTipModal: false
    }
  },
  computed: {
    ...mapState('job', ['jobInfo', 'jobFlowInfo','outerDiagramModel', 'isValidated', 'duplicateId', 'duplicateLabel', 'normalData', 'config', 'jobLabelDuplicate', 'selectJobType','resourceList']),
    ...mapGetters('job', ['jobId', 'normalKey']),
    ...mapState('files', ['resFiles']),
    ...mapGetters('files', ['resFilesName','dataURLtoFileFormat']),
    ...mapState('device', ['countdown', 'deviceInfo']),
    editJobMsg() {
      return !(sessionStorage.groups && sessionStorage.groups.includes('Admin')) && (this.jobInfo.job_id === undefined ||this.jobInfo.author  === parseInt(sessionStorage.id))
    },
    editJobFlow (){
      return !(sessionStorage.groups && sessionStorage.groups.includes('Admin')) && (this.jobInfo.job_id === undefined ||this.jobInfo.author  === parseInt(sessionStorage.id))
    },
    isAdmin (){
      return sessionStorage.groups && sessionStorage.groups.includes('Admin')
    }
  },
  watch: {
    jobInfo: {
      handler: function (val) {
        if (val.job_type === 'InnerJob' && this.config.finalResultKey) { // 如果当前用例为innerjob且已经指定了结果unit，则提醒用户错误
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
        this.$store.commit('job/setEditingJobId', this.jobId)
      }
    }
  },
  beforeRouteEnter (to, from, next) {
    // 在渲染该组件的对应路由被 confirm 前调用
    // 不！能！获取组件实例 `this`
    // 因为当守卫执行前，组件实例还没被创建
    if (from.name !== 'jobList' && from.name !== 'createJob') {
      next ({ name: 'jobList'})
    }else{
      next()
    }

  },
    // beforeRouteLeave (to, from, next) {
    //   const answer = window.confirm('确定要离开该页面吗？会导致编辑的内容丢失。')
    //   if (answer) {
    //     next()
    //   } else {
    //     next(false)
    //   }
    // },
  // beforeRouteLeave  (to, from, next) {
  //   const answer = window.confirm('Do you really want to leave? you have unsaved changes!')
  //   if (to.name === 'jobList' && this.autoSaveToggle) { // 离开jobEditor页面去往jobList页面时，如果自动保存处于开启状态，则将当前用例逻辑流保存到store中
  //     let start_node = this.outerDiagram.model.findNodeDataForKey(-1)
  //     this.outerDiagram.model.setDataProperty(start_node, 'config', this._.cloneDeep(this.config))
  //     this.$store.commit('job/setOuterDiagramModel', this.outerDiagram.model.toJson())
  //   }
  //   next()
  // },
  beforeDestroy () {
    window.removeEventListener('contextmenu', this.dispatchMouseEvent)
    window.removeEventListener('mousemove', this.dispatchMouseEvent)
    window.removeEventListener('beforeunload', this.beforeunloadHandler, false);
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
    saveFinalResKey(val){
      this.$store.commit('job/handleConfig', {
        action: 'setConfig',
        data: { finalResultKey: val }
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
      // console.log(this.$store.state.job.isValidated)
      if (this.$store.state.job.isValidated) {
        flag = true
      } else { // 否，弹出右侧抽屉
        this.$store.commit('handleShowDrawer',true)
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
            content: '无法为内嵌用例指定结果unit'
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
    async createOrUpdateJobFlow(jobId,jobFlowInfo) {
      let jobFlowId = jobFlowInfo["id"]
      if (jobFlowId === undefined){ // create
        // 获取order
        let { data:{job_flow} } = await getJobFlowList(jobId)
        if (job_flow.length !== 0) {
          jobFlowInfo["order"] = Math.max(...job_flow.map(x => x.order)) + 1
          console.log(jobFlowInfo["order"])
        }else {
          jobFlowInfo["order"] = 0
        }
        jobFlowInfo["job"] = jobId
        let {data} = await createFlow(jobFlowInfo)
        return data.id
      } else {
        delete jobFlowInfo["order"]
        let {data} = await updateFlowWithFlowId(jobFlowId,jobFlowInfo)
        return data.id
      }
    },
    async uploadFiles (id, info, jobFlowInfo) { // 保存依赖文件，更新job Msg (job attr)失败则抛出异常
      this.saving = true
      info.job_id = id
      let resFiles = this._.cloneDeep(this.resFiles)
      try {
        let { status } = await updateJobMsg(id, info) // 更新jobInfo
        if (status === 200) {
          let jobFlowId = await this.createOrUpdateJobFlow(id, jobFlowInfo)
          let data = new FormData()
          data.append('job_flow', jobFlowId)
          for (let i = 0; i < resFiles.length; i++) {
            let { name, type, file } = resFiles[i]
            if (name === 'FILES_NAME_CONFIG.json') continue // 移除老版本中遗留的文件，文件内容已经写入到start节点了
            if (this.dataURLtoFileFormat.indexOf(type) !== -1) {
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
    async bindResource(job_label,resourceList){
      await jobBindResource( {"job_label":job_label,"resource_data":resourceList}).then(() => { // 更新用例信息
        this.$Message.success('用例资源绑定成功')
      }).catch(error => {
        console.log(error)
        this.$Message.error('用例资源绑定失败')
      })
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
      async function createNewJob (context, jobInfo,jobFlowInfo,resourceList) { // 复用自动保存的用俐/创建新用俐
        if (!jobInfo.job_label) { // 没有自动保存
          jobInfo.job_label = createJobLabel(context)
        }
          // 创建新的Job
        try {
          let { status, data } = await saveJobFlowAndMsg(jobInfo)  // 保存 job 的信息
          if (status === 201){
            await context.uploadFiles(data.id, jobInfo, jobFlowInfo)
            if(resourceList.length>0)
              await context.bindResource(data.job_label,resourceList)
          }
        } catch (err) {
          console.log(err)
          throw new Error(err)
        }
      }
      if (name === 'quit') { // 退出
        this.autoSaveToggle = false
        this.$router.push({ path: '/jobList' })
        this.$store.commit('setCurPage', 1)
      } else // 非退出的操作
        {
          if (!this.editJobMsg || !this.editJobFlow ){
            this.$Message.error({
              background: true,
              content: '没有编辑当前用例的权限'
            })
            return
          }
        let id = this.jobId
        let jobInfo = await this.prepareJobInfo()
        let jobFlowInfo = await this.prepareJobFlowInfo(jobInfo)
        // 资源验证：先去除空值，看实际选择的资源value是否为空
        for (let i = this.resourceList.length-1; i >= 0; i--) {
          if(!this.resourceList[i] || this.resourceList[i].length===0)
            this.resourceList.splice(i,1)
        }
        //资源验证：每个设备(主僚机)下的sim1和sim2只能选择一次
        let sim_1_list = []
        let sim_2_list = []
        this.resourceList.forEach(item=>{
          if(item[1]==="simcard_1"){
            sim_1_list.push(item)
          }else if(item[1]==="simcard_2"){
            sim_2_list.push(item)
          }
        })
        let sim_1_name = []
        let sim_2_name = []
        sim_1_list.forEach(item=>{
          sim_1_name.push(item[0])
        })
        sim_2_list.forEach(item=>{
          sim_2_name.push(item[0])
        })
        let resourceList = _.cloneDeep(this.resourceList)

        if (name === 'saveDraft') { // 存草稿，可跳过校验
          if (!this._jobMsgRules()) return
          jobInfo.draft = true
          this.autoSaveToggle = false
          if (id) //id 存在 则将已有的job更新成草稿 不存在会创建
          {
            try {
              await this.uploadFiles(id, jobInfo, jobFlowInfo)
              if(resourceList.length>0)
                await this.bindResource(jobInfo.job_label,resourceList)
            } catch (error) {
              this.$Message.error({
                background: true,
                content: error
              })
              return
            }
            // if (this.duplicateId) { // todo:将副本删除
            //   updateJobMsg(this.duplicateId, { job_deleted: true })
            // }
          }
          else // 保存全新草稿job
          {
              try {
                // console.log("创建一个全新的草稿job")
                await createNewJob(this, jobInfo, jobFlowInfo,resourceList)
              } catch (error) {
                this.$Message.error({
                  background: true,
                  content: error
                })
                return
              }
            }
        }
        else //  保存或另存正式的job
          {
            let innerJobRule = true
            let innerJobs = this.outerDiagram.findNodesByExample({ 'category': 'Job' })
            innerJobs.each(node => { if (!node.data.jobLabel) { innerJobRule = false}})

          if (!innerJobRule) {
            this.$Message.error({
              background: true,
              content: '不允许存在空的Job块'
            })
            return
          }
          if (!this._jobMsgRules() || !this._jobFlowRules() || this.isInvalidInnerJob()) return
          if (this._jobFlowRules()) this.autoSaveToggle = false
          if (name === 'save') { // 保存，如果已经存在则更新并返回，如果不存在则创建
            jobInfo.draft = false
            if (id) { //id 存在表明是更新正式用例
              try {
                await this.uploadFiles(id, jobInfo,jobFlowInfo)
                if(resourceList.length>0)
                  await this.bindResource(jobInfo.job_label,resourceList)
              } catch (error) {
                this.$Message.error({
                  background: true,
                  content: error
                })
                return
              }
              // if (this.duplicateId) {
              //   updateJobMsg(this.duplicateId, { job_deleted: true })
              // }
            }
            else //生成正式job
              {
                try {
                  // console.log("创建一个全新的job")
                  await createNewJob(this, jobInfo, jobFlowInfo,resourceList)
                } catch (error) {
                  this.$Message.error({
                    background: true,
                    content: error
                  })
                  return
                }
              }
          }
          else if (name === 'saveAs') { // 另存为
            delete jobFlowInfo.id
            if (this.selectJobType !== 'InnerJob') {
              this.$Message.error({
                background: true,
                content: 'Inner Job 才具备另存为功能'
              })
              return
            }
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
                    keydown: async (e) => { // 监听键盘的操作
                      switch (e.keyCode) {
                        case 13: // enter
                          jobInfo.job_name = e.target.value.trim() || jobInfo.job_name
                          // 另存为生成新的jobLabel
                          jobInfo.job_label = createJobLabel (this)
                          try {
                            await createNewJob(this, jobInfo, jobFlowInfo,resourceList)  // 监听回车（）enter 触发 的另存为
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
                        case 27: // 监听esc 触发 取消
                          console.log("esc")
                          this.$Modal.remove()
                          break
                      }
                    }
                  }
                })
              },
              onOk: async () => {
                jobInfo.job_name = this.value.trim() || jobInfo.job_name
                // 另存为生成新的jobLabel
                jobInfo.job_label = createJobLabel (this)
                try {
                  await createNewJob(this, jobInfo, jobFlowInfo,resourceList) // input框确认按钮的确认触发的保存
                } catch (error) {
                  this.$Message.error({
                    background: true,
                    content: error
                  })
                  return
                }
                // console.log("onOk")
                await this.clearData()
              }
            })
            // console.log("save as end")
            return // 显示出rename的 input 框后 防止执行 clearData
          }
        }
      }
      await this.clearData()
    },
    async prepareJobInfo () { // 返回保存用例时需要的信息
      let { data: start } = this.outerDiagram.findNodeForKey(-1) // 将配置信息保存在Start节点
      this.outerDiagram.model.setDataProperty(start, 'config', this._.cloneDeep(this.config))
      // 保存Job信息
      let jobInfo = this._.cloneDeep(this.jobInfo)
      jobInfo.flow_execute_mode = "SingleSplit" // todo：需要设置用户输入的入口
      jobInfo.ui_json_file = JSON.parse(this.outerDiagram.model.toJson())
      jobInfo.ui_json_file.nodeDataArray.forEach((val, idx, arr) => {
        if ('unitLists' in val && typeof val.unitLists === 'string') {
          arr[idx].unitLists = JSON.parse(val.unitLists)
        }
      })
      jobInfo.subsidiary_device_count = this.calcWingmanCount()
      jobInfo.author = parseInt( sessionStorage.id)
      // 创建新的标签
      if (shouldCreateNewTag('test_area', jobInfo)) {
        jobInfo.test_area = await createNewTag('test_area', jobInfo)
        this.$store.dispatch('setBasicTestArea')
      }
      if (shouldCreateNewTag('custom_tag', jobInfo)) {
        jobInfo.custom_tag = await createNewTag('custom_tag', jobInfo)
        this.$store.dispatch('setBasicCustomTag')
      }
      return jobInfo
    },
    async prepareJobFlowInfo(jobInfo) {
      let jobFlowInfo = this._.cloneDeep(this.jobFlowInfo)
      jobFlowInfo["ui_json_file"] = jobInfo.ui_json_file
      jobFlowInfo["flow_type"] = jobInfo.job_type === "InnerJob" ? "InnerFlow" : "NormalFlow"
      const inner_job_list = this.prepareInnerJobList()
      if (this.selectJobType === 'norMalJob') jobFlowInfo["inner_flow"] = await this.prepareInnerFlowIdList(inner_job_list)
      return jobFlowInfo
    },
    prepareInnerJobList () { // 保存用到的innerjob的joblabel
      let list = []
      let innerJobs = this.outerDiagram.findNodesByExample({ 'category': 'Job' })
      innerJobs.each(node => { if (node.data.jobLabel) { list.push(node.data.jobLabel) } })
      return list
    },
    async prepareInnerFlowIdList (innerJobList) { // 保存用到的innerjob的innerFlow 一对一关系
      let innerFlowIdList = []
      for (let jobLabel of innerJobList){
        let {data:{jobs}} = await jobFlowByJobLabel(jobLabel)
        innerFlowIdList.push(jobs[0].job_flow[0].id)
      }
      return innerFlowIdList
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
      info.author = parseInt(sessionStorage.id)
      info.draft = true
      info.job_deleted = true // 副本设置成用户不可见
      info.inner_job_list = this.prepareInnerJobList()
      if (!this.duplicateLabel) { // 第一次自动保存
        if (!info.job_label) { // 编辑的job数据库没有，是一个新建的job
          const job_label = createJobLabel(this)
          this.$store.commit('job/setJobLabel', job_label)
        }
        this.$store.commit('job/setDuplicateLabel', this.jobInfo.job_label) // 设置副本的jobLabel
      }
      info.job_label = this.duplicateLabel
      return info
    },
    async autoSave () { // todo：先屏蔽副本的代码，之后再做
      let curTime = Date.now()
      if (curTime - this.lastActiveTime >= this.activeTimeInterval || !this._jobMsgRules() || !this.autoSaveToggle) return
      let info = await this.prepareAutoSaveInfo()
      if (!this.duplicateId) { // 第一次自动保存时，需要判断副本job_label是否存在，存在则更新，否则创建
        // console.log("第一次保存")
        try {
          let { data: { jobs } } = await getJobId(info.job_label)
          // console.log(jobs)
          if (jobs.length !== 0) {
            this.$store.commit('job/setDuplicateId', jobs[0].id)
            console.log(info)
            await this.uploadFiles(this.duplicateId, info)
          }else{ // 没有副本则创建副本
            let { status, data } = await saveJobFlowAndMsg(info)
            if (status === 201) {
              this.$store.commit('job/setDuplicateId', data.id)
              await this.uploadFiles(data.id, info)
            }
          }
        }catch (error){
          console.log(error)
          throw new Error('请求失败')
        }
      } else
        {
        try {
          // console.log("非第一次自动保存")
          await this.uploadFiles(this.duplicateId, info)
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
    handleResFile (jobFlowId) { // jobEditor挂载时获取依赖文件
      if (!jobFlowId) return
      getJobResFilesList(jobFlowId).then(({ status, data }) => {
        if (status === 200) {
          let filesData = data.job_res_file
          Promise.all(filesData.map(item => getJobResFile(item.file))).then(res => {
            res.forEach((file, index) => {
              let reader = new FileReader()   //允许Web应用程序异步读取存储在用户计算机上的文件（或原始数据缓冲区）的内容
              if (file.data.type.startsWith('image') || file.data.type.startsWith('audio') || file.data.type.startsWith('video')) { // 图片则存放 dataURL
                //开始读取指定的Blob中的内容。一旦完成，result属性中将包含一个data: URL格式的Base64字符串以表示所读取文件的内容,img通过加载这个地址,完成图片的加载
                reader.readAsDataURL(file.data)
              } else { // json 则存放 text
                //开始读取指定的Blob中的内容。一旦完成，result属性中将包含一个字符串以表示所读取的文件内容。
                reader.readAsText(file.data)

              }
              reader.onload = () => {   //在读取操作完成时触发
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
      this.$store.commit('job/setDuplicateId', null) // 清除自动保存的用例的Id
      this.$store.commit('job/setDuplicateLabel', null) // 清除自动保存的用例的label
      this.$store.commit('job/handleJobInfo', { action: 'setJobInfo', data: {} }) // 清空jobInfo
      this.$store.commit('job/setOuterDiagramModel', null) // 清空画布信息
      // this.$store.commit('job/handleJobInfo', { action: 'setPreJobInfo', data: false }) // 清空上一次选择的job的信息
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
    beforeunloadHandler(e) {
      e.returnValue = "确定要关闭窗口吗？"
    },
    setWingman (id) { // 设置执行inner job的僚机
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
    },
    async showDuplicateJob() { // todo：先屏蔽副本的代码，之后再做
      let jobId = this._.cloneDeep(this.jobId)
      let jobLabel = this._.cloneDeep(this.jobInfo.job_label)
      async function setJobMsg (context, id) {
        let { data } = await getJobDetail(id)
        let job = util.validate(jobSerializer, data)
        let jobInfo = {
          manufacturer: (job.phone_models.length === 0) ? null : job.phone_models[0].manufacturer.id, // todo: 写了manufacturer 没写phonemodel
          author: this.jobInJob.author,
          job_id: jobId, // 将副本的内容作用到编辑的job
          job_flow: job.ui_json_file,
          cabinet_type:job.cabinet_type,
          resource_data:job.matching_rule ? job.matching_rule.resource_data : []
        }
        CONST.SIMPLE_JOB_KEY.forEach(val => {
          jobInfo[val] = job[val]
        })
        jobInfo.job_label = jobLabel
        CONST.COMPLEX_JOB_KEY.forEach(val => {
          jobInfo[val] = job[val].map(item => item.id)
        })
        // 保证数据作用到原job 而非 副本
        jobInfo.job_id = context.jobId
        jobInfo.job_label = context.jobInfo.job_label

        context.$store.commit('job/handleJobInfo', { action: 'setJobInfo', data: jobInfo })
      }

      await setJobMsg(this, this.duplicateId)

      this.$store.commit('job/setOuterDiagramModel', null)
      setOuterDiagramData(this, this.jobInfo.job_flow) //展示副本的流程图

      this.handleResFile(this.duplicateId)

      this.$store.commit('handleShowDrawer')
    }
  },
  mounted () {
    init(this) // 创建画板与画布并绘制流程图
    if (!this.resFiles.length) this.handleResFile(this.jobFlowInfo.id)

    this.jobController = document.getElementById('job-controller')
    //  todo：先屏蔽副本的代码（自动保存），之后再做
    this.autoSaveToggle = this.editJobFlow && this.editJobMsg && false // 可以被编辑则可以自动保存
    if (this.autoSaveToggle){
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
    }
    window.addEventListener('contextmenu', this.dispatchMouseEvent) //右键菜单栏
    window.addEventListener('mousemove', this.dispatchMouseEvent) //
    window.addEventListener('beforeunload', this.beforeunloadHandler, false);
    window.addEventListener('onunload', () => { // 刷新/关闭页面确认后删除自动保存的用例 todo:不起效果
      // if (this.duplicateId) updateJobMsg(this.duplicateId, { job_deleted: true })
      this.$store.commit('job/setDuplicateId', null)
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
