<template>
  <div id="wrap" ref="jobEditor">
    <div>
      <div class="job-editor-header">
        <Input v-model="$store.state.job.jobInfo.job_name" clearable class="job-name" placeholder="请输入JOB名称" size="large" />

        <div class="job-editor-header-btns">
          <div>
            <Button type="primary" @click="$store.commit('handleShowDrawer')" size="large" style="margin-right: 10px;">用例详情</Button>
            <Button type="info" ghost size="large" @click="viewResFile" style="margin-right: 10px;">查看依赖文件</Button>
          </div>
          <div>
            <Button type="primary" size="large" @click="saveJob" style="margin-right: 10px;">保存</Button>
            <Button size="large" type="success" @click="saveAs" style="margin-right: 10px;">另存为</Button>
            <Button type="primary" ghost size="large" @click="_saveJob" style="margin-right: 10px;">存草稿</Button>
            <Button size="large" @click="cancelEdit">退出</Button>
          </div>
        </div>
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
      <unit-editor
        :showUnitEditor="showUnitEditor"
        :unitData="unitData"
        @closeUnitEditor="closeUnitEditor"
        @changeUnitColor="changeUnitColor"
        @saveUnit="saveUnit"
        @setUnitName="setUnitName"
      ></unit-editor>
      <div id="chart-wrap">
        <div id="outer-palette"></div>
        <div id="outer-diagram"></div>
      </div>
      <unit-template-editor
        :openUnitTemplateEditor="openUnitTemplateEditor"
        :unitTemplateId="unitTemplateId"
        :unitTemplateType="unitType"
        :unitTemplateName="unitTemplateName"
        :unitTemplateContent="unitTemplateContent"
        @closeUnitTemplateEditor="closeUnitTemplateEditor"
        @updateUnitAllList="updateUnitAllList"
      ></unit-template-editor>

      <Modal v-model="blockModalShow" :closable="false" fullscreen>
        <div slot="header">
          <Input v-model="blockName" clearable size="large" placeholder="large size" />
        </div>
        <div slot="footer">
          <Button type="text" size="large" @click="blockModalShow=false">取消</Button>
          <Button type="primary" size="large" @click="saveNormalBlock">确定</Button>
        </div>
        <div id="inner-wrap">
          <div id="chart-left" @click="closeContextMenu">
            <div class="inner-palette-container">
              <div class="inner-palette-header">
                <Dropdown trigger="click" @on-click="getSelectedUnit">
                  <Button id="dropdown-btn" type="primary" ghost>
                    {{ unitType }}
                    <Icon type="ios-arrow-down"></Icon>
                  </Button>
                  <DropdownMenu slot="list">
                    <DropdownItem
                      v-for="(currentUnit, key) in unitAllList"
                      :name="key"
                      :key="key"
                    >{{key}}</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
              <div id="inner-palette"></div>
            </div>
            <div id="unit-controller">
              <div v-if="!isDiagram">
                <Button type="error" long @click="delUnitTemplate">删除</Button>
                <Button type="primary" long style="margin-top: 2px;" @click="editUnitTemplate">编辑</Button>
              </div>
              <div v-else>
                <ButtonGroup vertical size="default">
                  <Button type="primary" @click="setWingman(0)">主机</Button>
                  <Button v-for="wingman in wingmans" :key="wingman" @click="setWingman(wingman)">{{wingman}} 号机</Button>
                </ButtonGroup>
              </div>
            </div>
          </div>
          <div id="inner-diagram" @click="closeContextMenu"></div>
        </div>
      </Modal>
      <!-- <job-editor-job-flow-editor :blockModalShow="blockModalShow" @blockModalClose="blockModalClose"></job-editor-job-flow-editor> -->

      <switch-block-detail-component
        :switch-block-info="switchBlockInfo"
        v-model="switchBlockModalShow"
        @save="switchBlockSave"
        @clear="switchBlockInfo = {}">
      </switch-block-detail-component>
    </div>
  </div>
</template>
<script>
import go from 'gojs'
import { init } from './JobEditorGoInit'
import jobInJob from '_c/jobInJob'
import jobResFile from '_c/jobResFile/jobResFile.vue'
import UnitEditor from '_c/unitEditor/UnitEditor.vue'
import unitTemplateEditor from '_c/unitTemplateEditor'
import { getJobUnitsBodyDict, deleteUnitTemplate } from '../api/reef/unit'
import { jobFlowAndMsgSave, jobFlowAndMsgUpdate } from '../api/reef/jobFlow'
import { jobResFilesSave, getJobResFilesList, getJobResFile } from '../api/reef/jobResFileSave'
import { patchUpdateJob } from 'api/reef/job'
import SwitchBlockDetailComponent from '_c/SwitchBlockDetailComponent'
import { jobFlowValidation } from '../core/validation/finalValidation/job'
import { blockFlowValidation } from '../core/validation/finalValidation/block'
import axios from 'api'
import { baseURL } from '../config'
import { mapState, mapGetters } from 'vuex'
import { createJobLabel, dataURLtoFile } from '../lib/tools'
import { releaseOccupyDevice } from '../api/reef/device'

import CONST from 'constant/constant'

export default {
  name: 'jobEditor',
  components: { SwitchBlockDetailComponent, jobInJob, jobResFile, UnitEditor, unitTemplateEditor },
  data () {
    return {
      jobName: '',
      blockModalShow: false,
      switchBlockModalShow: false,
      currentSwitchBlockKey: null,
      blockName: '',
      currentNormalBlockKey: null,
      unitType: '请选择组件类型',
      switchBlockInfo: {},
      unitAllList: {},
      jobModalShow: false,
      currentJobBlockKey: null,
      currentJobBlockText: 'Job block',
      showUnitEditor: false,
      unitData: undefined,
      unitController: null,
      openUnitTemplateEditor: false,
      unitTemplateContent: '',
      unitTemplateId: undefined,
      rename: false,
      unitTemplateName: '',
      isDiagram: false,
      wingmans: 3,
      curUnitKey: null,
      lastActiveTime: null,
      activeTimeInterval: 120000,
      autoSaveInterval: 180000,
      autoSaveTimer: null,
      autoSaveToggle: true
    }
  },
  computed: {
    ...mapState('job', [
      'jobInfo',
      'outerDiagramModel',
      'finalResultBlockKey',
      'draftId'
    ]),
    ...mapGetters('job', [
      'jobId'
    ]),
    ...mapState('files', [
      'resFiles',
      'resFilesName'
    ]),
    ...mapState('device', [
      'countdown',
      'deviceInfo'
    ]),
    unitName: {
      get () {
        return this.unitData.unitName
      },
      set () {

      }
    }
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
  mounted () {
    this.unitController = document.querySelector('#unit-controller')
    this.$Message.config({
      duration: 3
    })

    if (!this.resFiles.length) {
      this.handleResFile(this.jobId)
    }

    this.updateUnitAllList()
    init(this)

    window.addEventListener('contextmenu', this.dispatchMouseEvent)
    window.addEventListener('mousemove', this.dispatchMouseEvent)
    this.autoSaveTimer = setInterval(this.autoSave, this.autoSaveInterval) // 300000
  },
  beforeRouteLeave  (to, from, next) {
    if (to.name === 'jobList' && this.autoSaveToggle) {
      this.$store.commit('job/setOuterDiagramModel', this.outerDiagram.model.toJson())
    }
    next()
  },
  beforeDestroy () {
    window.removeEventListener('contextmenu', this.dispatchMouseEvent)
    window.clearInterval(this.autoSaveTimer)
  },
  methods: {
    switchBlockSave (msg) {
      let node = this.outerDiagram.model.findNodeDataForKey(this.currentSwitchBlockKey)
      this.outerDiagram.model.setDataProperty(node, 'text', msg.switchBlockName)
      this.outerDiagram.model.setDataProperty(node, 'fileName', msg.fileName)
      this.outerDiagram.model.setDataProperty(node, 'explain', msg.explain)
    },
    saveNormalBlock () { // normalBlock点击确定进行校验
      let currentNormalBlockData = this.outerDiagram.findNodeForKey(this.currentNormalBlockKey).data
      let blockDiagramData = JSON.parse(this.innerDiagram.model.toJson())
      const blockDiagramHint = blockFlowValidation(this)
      function setDataProperty (context, data, propname, val) {
        context.outerDiagram.model.setDataProperty(data, propname, val)
      }
      if (blockDiagramHint.size !== 0) {
        this.blockModalShow = true
        let errorNum = 1
        let errorMessage = ''
        blockDiagramHint.forEach(element => {
          errorMessage += errorNum + '.' + element + '<br/>'
          errorNum++
        })
        this.$Notice.error({
          title: '当前block出现以下错误',
          desc: errorMessage
        })
      } else {
        let units = blockDiagramData.nodeDataArray.filter(item => item.category === 'Unit')
        if (units.some(item => CONST.STAR.has(item.unitMsg.execModName))) {
          if (units.some(item => item.star === CONST.COLORS.RESULT)) {
            setDataProperty(this, currentNormalBlockData, 'star', CONST.COLORS.RESULT)
          } else {
            setDataProperty(this, currentNormalBlockData, 'star', CONST.COLORS.STAR)
          }
        } else {
          setDataProperty(this, currentNormalBlockData, 'star', false)
        }
        if (units.length === 0 || units.some(item => item.completed === false)) {
          setDataProperty(this, currentNormalBlockData, 'color', CONST.COLORS.UNFINISHED)
        } else {
          setDataProperty(this, currentNormalBlockData, 'color', CONST.COLORS.FINISH)
        }
        setDataProperty(this, currentNormalBlockData, 'unitLists', blockDiagramData)
        setDataProperty(this, currentNormalBlockData, 'text', this.blockName)
        let resFile = {}
        units.forEach((val) => {
          if (val.resFile) {
            Object.assign(resFile, val.resFile)
          }
        })
        setDataProperty(this, currentNormalBlockData, 'resFile', resFile)

        this.outerDiagram.model = go.Model.fromJson(this.outerDiagram.model.toJson())
        this.blockModalShow = false
      }
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
          // desc: errorMessage, // 提示内容
          render: h => {
            return h(
              'div',
              [
                h(
                  'div',
                  {
                    domProps: {
                      innerHTML: errorMessage
                    }
                  }
                ),
                h('Button', {
                  style: {
                    marginTop: '16px'
                  },
                  on: {
                    click: this._saveJob
                  }
                }, '存为草稿')
              ]
            )
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
    async _createNewTag (tagType) { // 生成新的测试用途、自定义标签条目
      let target = this.jobInfo[tagType]
      if (!target) return []
      let targetNameDic = {
        'test_area': 'job_test_area',
        'custom_tag': 'custom_tag'
      }
      for (let i = 0; i < target.length; i++) {
        if (typeof target[i] !== 'number') {
          let { data: { id } } = await axios.request({
            url: `${baseURL}/api/v1/cedar/${targetNameDic[tagType]}/`,
            method: 'post',
            data: tagType === 'test_area' ? { description: target[i] } : { custom_tag_name: target[i] }
          })
          target.splice(i, 1, id)
        }
      }
      return target
    },
    saveJob (saveAs = false) {
      // 使用 & 保证都运行
      if (!this._jobMsgRules() || this.isInvalidInnerJob()) return
      if (this._jobFlowRules()) {
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
        if (!resFile[this.resFiles[i].name]) {
          this.$store.commit('files/removeResFile', i)
        }
      }
    },
    async prepareJobInfo (saveAs, createNew, isDraft) {
      let info = this._.cloneDeep(this.jobInfo)
      info.ui_json_file = JSON.parse(this.outerDiagram.model.toJson())
      info.test_area = await this._createNewTag('test_area')
      info.custom_tag = await this._createNewTag('custom_tag')
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
      this.autoSaveToggle = false
      let id = this.jobId
      let info = await this.prepareJobInfo(saveAs, !id, isDraft)
      this.$store.commit('files/addResFile', {
        name: 'FILES_NAME_CONFIG.json',
        type: 'json',
        file: JSON.stringify(this.resFilesName, null, 2)
      })
      if (saveAs) {
        if (this.draftId) {
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
      this.$router.push({ path: '/jobList' })
      this.$store.commit('setCurPage', 1)
      this.clearData()
    },
    async autoSave () {
      let curTime = Date.now()
      if (curTime - this.lastActiveTime >= this.activeTimeInterval || !this._jobMsgRules() || !this.autoSaveToggle) return
      let info = this.draftId ? await this.prepareJobInfo(false, false, true) : await this.prepareJobInfo(false, true, true)
      info.job_name = info.job_name + '_AUTOSAVE'
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
            this.uploadFiles(this.draftId, info)
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
    saveUnit (unitData, unitResFileList) {
      this.showUnitEditor = false
      let curUnitNode = this.innerDiagram.findNodeForKey(unitData.unitNodeKey)
      this.innerDiagram.model.setDataProperty(curUnitNode.data, 'unitMsg', unitData.unitMsg)
      this.innerDiagram.model.setDataProperty(curUnitNode.data, 'text', unitData.unitName)
      if (unitResFileList.length) {
        if (!curUnitNode.data.resFile) {
          this.innerDiagram.model.setDataProperty(curUnitNode.data, 'resFile', {})
        }
        let { resFile } = curUnitNode.data
        for (let item of unitResFileList) {
          if (item.oldname !== item.newname) {
            delete resFile[item.oldName]
          }
          resFile[item.newName] = true
        }
      }
    },
    setUnitName (val) {
      this.unitData.unitName = val
    },
    getSelectedUnit (name) {
      let unitCategoryData = {}
      unitCategoryData.nodeDataArray = []
      this.unitType = name
      if (this.unitAllList[name]) {
        Object.entries(this.unitAllList[name]).forEach((unit) => {
          unitCategoryData.nodeDataArray.push({
            category: 'Unit',
            text: unit[0],
            unit_id: unit[1]['unit_id'],
            unitMsg: unit[1]['unit_content']
          })
        })
        this.innerPalette.model = new go.GraphLinksModel(unitCategoryData.nodeDataArray)
      } else {
        this.$Message.error({
          background: true,
          content: 'Unit 列表为空'
        })
      }
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
    closeUnitEditor () {
      this.showUnitEditor = false
    },
    delUnitTemplate () {
      let _this = this
      this.$Modal.confirm({
        title: '温馨提示',
        content: '确定要删除当前 Unit 模板吗？',
        okText: '心意已决',
        cancelText: '我再想想',
        async onOk () {
          let { status } = await deleteUnitTemplate(_this.unitTemplateId)
          if (status === 204) {
            _this.$Message.success({
              background: true,
              content: '删除成功'
            })
            setTimeout(() => {
              _this.updateUnitAllList(_this.unitType)
            }, 500)
          } else {
            _this.$Message.error({
              background: true,
              content: '删除失败'
            })
          }
        }
      })
    },
    editUnitTemplate () {
      this.openUnitTemplateEditor = true
    },
    closeContextMenu () {
      this.unitController.style.display = 'none'
    },
    closeUnitTemplateEditor () {
      this.openUnitTemplateEditor = false
    },
    async updateUnitAllList (name = undefined) {
      this.unitAllList = {}
      try {
        let { status, data: { unit } } = await getJobUnitsBodyDict()
        if (status === 200) {
          unit.forEach((unit, index) => {
            if (!(unit.type in this.unitAllList)) {
              this.$set(this.unitAllList, unit.type, {})
            }
            this.$set(this.unitAllList[unit.type], unit.unit_name, {
              unit_id: unit.id,
              unit_content: unit.unit_content
            })
          })
          if (name) this.getSelectedUnit(name)
        } else {
          this.$Message.error({
            background: true,
            content: '获取 Unit 列表失败'
          })
        }
        this.$store.commit('unit/setUnitTypes', Object.keys(this.unitAllList))
      } catch (error) {
        console.log(error)
        this.$Message.error({
          background: true,
          content: '服务器错误，获取 Unit 列表失败'
        })
      }
    },
    changeUnitColor (hasCompleted) {
      let currentNodeData = this.innerDiagram.findNodeForKey(this.unitData.unitNodeKey).data

      if (hasCompleted) {
        this.innerDiagram.model.setDataProperty(currentNodeData, 'color', CONST.COLORS.FINISH)
        currentNodeData.completed = true
      } else {
        this.innerDiagram.model.setDataProperty(currentNodeData, 'color', CONST.COLORS.UNFINISHED)
        currentNodeData.completed = false
      }
      // this.innerDiagram.model = go.Model.fromJson(this.innerDiagram.model.toJson())
    },
    handleResFile (id) {
      if (!id) {
        this.$store.commit('files/setResFiles', [])
        return
      }
      getJobResFilesList(id).then(res => {
        let filesInfo = res.data.job_res_file
        let filesNameConfigIndex
        filesInfo.forEach((item, index) => {
          item.fileUrl = item.file
          item.file = null
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
      })
    },
    async clearData () {
      if (this.countdown) {
        let { status } = await releaseOccupyDevice({
          device_id_list: [this.deviceInfo.id]
        })
        if (status === 200) {
          this.$Message.info({
            background: true,
            content: '设备已释放'
          })
        }
        this.$store.commit('device/setCountdown')
      }
      this.$store.commit('job/setJobInfo', {})
      this.$store.commit('job/setOuterDiagramModel', null)
      this.$store.commit('job/setPreJobInfo', false)
      this.$store.commit('job/setDraftId', null)
      this.$store.commit('job/setFinalResultBlock', null)
      this.$store.commit('files/clearResFiles')
      this.$store.commit('device/clearDeviceInfo')
      this.$store.commit('device/clearPreDeviceInfo')
      this.$store.commit('files/setResFilesName', JSON.stringify([
        {
          title: '文件名称',
          children: ['text']
        },
        {
          title: '图片名称',
          children: ['snap']
        }
      ]))
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
    setWingman (wingmanId) {
      let curUnit = this.innerDiagram.findNodeForKey(this.curUnitKey)
      if (wingmanId) {
        this.innerDiagram.model.setDataProperty(curUnit.data, 'assistDevice', wingmanId)
        this.innerDiagram.model.setDataProperty(curUnit.data.unitMsg, 'assistDevice', wingmanId)
      } else {
        this.innerDiagram.model.setDataProperty(curUnit.data, 'assistDevice', null)
        delete curUnit.data.assistDevice
        delete curUnit.data.unitMsg.assistDevice
      }
    },
    dispatchMouseEvent (evt) {
      evt.preventDefault()
      switch (evt.type) {
        case 'mousemove':
          this.lastActiveTime = Date.now()
          break
      }
    },
    setOutputNormalBlock (context, isOutput) {
      if (isOutput && context.jobInfo.job_type === 'InnerJob') {
        context.$Message.error({
          content: '无法为内嵌用例指定结果Block'
        })
        return
      }
      let iterator = context.outerDiagram.selection
      if (iterator.count > 1) {
        context.$Message.error({
          content: '仅可选取一个Block'
        })
        return
      }
      context.outerDiagram.selection.each(({ data, data: { unitLists: { linkDataArray, nodeDataArray } } }) => {
        // 找到最后一个有star属性的unit
        let starUnitDataArray = nodeDataArray.filter((val, index) => {
          return val.category === 'Unit' && val.star
        })
        let lastStarUnit = null
        if (starUnitDataArray.length === 1) {
          lastStarUnit = starUnitDataArray[0]
        } else if (starUnitDataArray.length > 1) {
          let linkDataMap = new Map()
          linkDataArray.forEach((val) => {
            linkDataMap.set(val.from, val.to)
          })
          let startKey = nodeDataArray.filter(val => {
            return val.category === 'Start'
          })[0].key
          let next = linkDataMap.get(startKey)
          let nodeOrderArray = []
          while (true) {
            if (next) {
              nodeOrderArray.push(next)
              next = linkDataMap.get(next)
            } else {
              nodeOrderArray.splice(nodeOrderArray.length - 1, 1)
              break
            }
          }
          let lastStarUnitIndex = 0
          starUnitDataArray.forEach((val, idx, arr) => {
            arr[idx].star = CONST.COLORS.STAR
            delete arr[idx].unitMsg.finalResult
            let tempIndex = nodeOrderArray.indexOf(val.group)
            if (tempIndex >= lastStarUnitIndex) {
              lastStarUnitIndex = tempIndex
              lastStarUnit = val
            }
          })
        } else {
          context.$Message.error({
            content: '无法对该Block进行右键操作'
          })
          return
        }
        // 设定结果Block
        if (data.star) {
          if (context.finalResultBlockKey && context.finalResultBlockKey !== data.key) {
            context.$Message.error({
              content: '结果Block有且只能有一个'
            })
          } else {
            if (isOutput) {
              lastStarUnit.star = CONST.COLORS.RESULT
              lastStarUnit.unitMsg.finalResult = true
              context.$store.commit('job/setFinalResultBlock', data.key)
              context.$Message.success({
                content: '已将该Block设为结果Block'
              })
            } else {
              lastStarUnit.star = CONST.COLORS.STAR
              delete lastStarUnit.unitMsg.finalResult
              context.$store.commit('job/setFinalResultBlock', null)
              context.$Message.success({
                content: '已将该Block设为NormalBlock'
              })
            }
            context.outerDiagram.model.setDataProperty(data, 'star', lastStarUnit.star)
          }
        } else {
          context.$Message.error({
            content: '无法对该Block进行右键操作'
          })
        }
      })
    }
  }
}
</script>
<style lang="less" scoped>
.job-editor-header {
  display: flex;
  justify-content: space-between;
  font-size: 18px;
  padding: 5px 0;
  margin-bottom: 10px;

  .job-name {
    width: 15%;
    font-size: 18px;
    margin-right: 30px;
  }

  .job-editor-header-btns {
    flex: 1;
    display: flex;
    justify-content: space-between;
  }
}

#chart-wrap {
  width: 100%;
  display: flex;
  height: 88vh;
  justify-content: space-between;
  // margin-bottom: 22px;

  #outer-palette {
    width: 15%;
    margin-right: 30px;
    background-color: white;
    border: solid 1px rgb(244, 244, 244);
  }

  #outer-diagram {
    flex-grow: 1;
    background-color: white;
    border: solid 1px rgb(244, 244, 244);
  }
}

#inner-wrap {
  width: 100%;
  display: flex;
  height: 87vh;
  justify-content: space-between;
  margin-bottom: 22px;

  #chart-left {
    display: flex;
    flex-direction: column;
    width: 15%;
    margin-right: 30px;
    background-color: white;
    border: solid 1px rgb(244, 244, 244);

    .inner-palette-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      width: 100%;

      .inner-palette-header {
        text-align: center;

        #dropdown-btn {
          margin-bottom: 10px;
        }
      }

      #inner-palette {
        flex: 1;
        background-color: white;
      }
    }

    #unit-controller {
      display: none;
      position: absolute;
      width: 100px;
      border-radius: 6px;
      z-index: 10;
    }
  }
  #tooltip {
    display: none;
    position: absolute;
    z-index: 1000000000;
    border-radius: 10px;
    box-shadow: 6px 8px 12px gray;
  }

  #inner-diagram {
    position: relative;
    flex-grow: 1;
    background-color: white;
    border: solid 1px rgb(244, 244, 244);
  }
}

.unitView {
  width: 100%;
  display: flex;
  height: 74vh;
  justify-content: space-between;
  margin-bottom: 22px;

  .unitContent {
    width: 20%;
    margin-right: 16px;
    background-color: white;
    border: solid 1px rgb(244, 244, 244);
  }

  .unitOperation {
    width: 80%;
    flex-grow: 1;
    background-color: white;
    border: solid 1px rgb(244, 244, 244);
  }
}
</style>
