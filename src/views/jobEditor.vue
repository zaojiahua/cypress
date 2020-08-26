<template>
  <div id="wrap" ref="jobEditor">
    <div>
      <div class="job-editor-header">
        <Input v-model="$store.state.job.jobInfo.job_name" class="job-name" placeholder="请输入JOB名称" size="large" />

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
        <Input placeholder="重命名" v-model="$store.state.job.jobInfo.job_name" />
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
        <div id="chart-palette"></div>
        <div id="chart-diagram"></div>
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
          <Input v-model="blockName" size="large" placeholder="large size" />
        </div>
        <div slot="footer">
          <Button type="text" size="large" @click="blockModalShow=false">取消</Button>
          <Button type="primary" size="large" @click="saveNormalBlock">确定</Button>
        </div>
        <div id="inner-wrap">
          <div id="chart-left" @click="closeContextMenu">
            <div class="unit-palette-container">
              <div class="unit-palette-header">
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
              <div id="unit-palette"></div>
            </div>
            <div id="unit-controller">
              <Button type="error" long @click="delUnitTemplate">删除</Button>
              <Button type="primary" long style="margin-top: 2px;" @click="editUnitTemplate">编辑</Button>
            </div>
          </div>
          <div id="inner-diagram"></div>
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
import {
  MAKE,
  showLinkLabel,
  finishDrop,
  linkTemplateStyle,
  startNodeTemplate,
  endNodeTemplate,
  unitNodeTemplate,
  baseNodeTemplateForPort,
  baseGroupTemplate,
  basicModel
} from './jobEditorCommon'
import jobInJob from '_c/jobInJob'
import jobResFile from '_c/jobResFile/jobResFile.vue'
import UnitEditor from '_c/unitEditor/UnitEditor.vue'
import unitTemplateEditor from '_c/unitTemplateEditor'
import { getJobUnitsBodyDict, deleteUnitTemplate } from '../api/reef/unit'
import { getBlockFlowDict4Font, jobFlowAndMsgSave, jobFlowAndMsgUpdate } from '../api/reef/jobFlow'
import { jobResFilesSave, getJobResFilesList, getJobResFile } from '../api/reef/jobResFileSave'
import SwitchBlockDetailComponent from '_c/SwitchBlockDetailComponent'
import { commonValidation } from '../core/validation/common'
import {
  startValidation
} from '../core/validation/operationValidation/job'
import { unitListValidation } from '../core/validation/operationValidation/block'
import { jobFlowValidation } from '../core/validation/finalValidation/job'
import { blockFlowValidation } from '../core/validation/finalValidation/block'
import axios from 'api'
import { baseURL } from '../config'
import { mapState, mapGetters } from 'vuex'
import { createJobLabel } from '../lib/tools'
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
      unitContent: '',
      blockName: '',
      stageJobLabel: null,
      currentNormalBlockKey: null,
      unitType: '请选择组件类型',
      switchBlockInfo: {},
      unitAllList: {},
      basicModuleShow: {},
      screenWidth: 1400,
      jobModalShow: false,
      currentJobBlockKey: null,
      currentJobBlockText: 'Job block',
      unitMsgToogle: true,
      showUnitEditor: false,
      unitData: undefined,
      unitController: null,
      openUnitTemplateEditor: false,
      unitTemplateContent: '',
      unitTemplateId: undefined,
      rename: false,
      unitTemplateName: ''
    }
  },
  computed: {
    ...mapState('job', [
      'jobInfo',
      'isInnerJob',
      'diagramModel'
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
  mounted () {
    this.unitController = document.querySelector('#unit-controller')
    const _this = this
    _this.$Notice.config({
      top: 150,
      duration: 0
    })
    this.$Message.config({
      duration: 3
    })

    if (!this.resFiles.length) {
      this.handleResFile(this.jobId)
    }

    myDiagramInit()
    function myDiagramInit () {
      _this.myDiagram = MAKE(go.Diagram, 'chart-diagram', {
        initialContentAlignment: go.Spot.Center,
        allowDrop: true,
        // layout: MAKE(go.LayeredDigraphLayout, { direction: 90, layerSpacing: 40, columnSpacing: 30, setsPortSpots: true }),
        // 设置网格
        // grid: MAKE(go.Panel, 'Grid',
        //   MAKE(go.Shape, 'LineH', {
        //     stroke: 'lightgray',
        //     strokeWidth: 0.5
        //   }),
        //   MAKE(go.Shape, 'LineH', {
        //     stroke: 'gray',
        //     strokeWidth: 0.5,
        //     interval: 10
        //   }),
        //   MAKE(go.Shape, 'LineV', {
        //     stroke: 'lightgray',
        //     strokeWidth: 0.5
        //   }),
        //   MAKE(go.Shape, 'LineV', {
        //     stroke: 'gray',
        //     strokeWidth: 0.5,
        //     interval: 10
        //   })
        // ),
        // 拖动时是否捕捉网格点
        'draggingTool.isGridSnapEnabled': true,
        // 初次链接时，以链接（link）头部距离目标节点的某个Port的距离小于linkingTool.portGravity时，链接会自动吸附到目标节点的Port上
        'linkingTool.portGravity': 40,
        // 修改链接时，以链接（link）头部距离目标节点的某个Port的距离小于linkingTool.portGravity时，链接会自动吸附到目标节点的Port上
        'relinkingTool.portGravity': 40,
        'toolManager.mouseWheelBehavior': go.ToolManager.WheelZoom,
        'LinkDrawn': showLinkLabel,
        'LinkRelinked': showLinkLabel,
        mouseDrop: function (e) {
          finishDrop(e, null)
        },
        'undoManager.isEnabled': true
      })

      _this.myDiagram.linkTemplate = linkTemplateStyle()

      _this.myDiagram.linkTemplate.doubleClick = function (e, node) {
        if (e.diagram instanceof go.Palette) return
        let block = _this.myDiagram.findNodeForKey(node.data.from).data

        if (block.category === 'normalBlock') {
          // vm.showDrawerOperation('linkOperation')
          // currentLinkObj = node
        }
      }

      const startTemplate = startNodeTemplate(CONST.COLORS.START)
      startTemplate.linkValidation = startValidation

      const endTemplate = endNodeTemplate(CONST.COLORS.END)

      endTemplate.doubleClick = (e, node) => {
        if (node.data.text === 'End') {
          _this.myDiagram.model.setDataProperty(node.data, 'text', 'Fail')
          _this.myDiagram.model.setDataProperty(node.data, 'color', CONST.COLORS.FAIL)
        } else if (node.data.text === 'Fail') {
          _this.myDiagram.model.setDataProperty(node.data, 'text', 'Success')
          _this.myDiagram.model.setDataProperty(node.data, 'color', CONST.COLORS.SUCCESS)
        } else {
          _this.myDiagram.model.setDataProperty(node.data, 'text', 'End')
          _this.myDiagram.model.setDataProperty(node.data, 'color', CONST.COLORS.END)
        }

        // debugger
      }

      const switchBlockTemplate = baseNodeTemplateForPort(CONST.COLORS.SWITCH, 'Diamond')
      switchBlockTemplate.doubleClick = function (e, node) {
        _this.$Notice.destroy()
        if (e.diagram instanceof go.Palette) return

        _this.switchBlockInfo = {
          switchBlockName: node.data.text,
          fileName: node.data.fileName,
          explain: node.data.explain
        }
        _this.currentSwitchBlockKey = node.data.key

        _this.switchBlockModalShow = true
      }

      const normalBlockTemplate = baseNodeTemplateForPort(CONST.COLORS.NORMAL, 'Rectangle')

      normalBlockTemplate.doubleClick = function (e, node) {
        _this.$Notice.destroy()
        if (e.diagram instanceof go.Palette) return
        _this.unitType = '请选择组件类型'
        _this.blockName = node.data.text
        _this.currentNormalBlockKey = node.data.key
        _this.blockModalShow = true
        if (!_this.blockDiagram) blockDiagramInit()
        if (!_this.blockPalette) blockPaletteInit()
        if (!node.data.unitLists) { // unitList存在则展示
          _this.blockDiagram.model = go.Model.fromJson({
            'class': 'go.GraphLinksModel',
            'linkFromPortIdProperty': 'fromPort',
            'linkToPortIdProperty': 'toPort',
            'nodeDataArray': [],
            'linkDataArray': []
          })
        } else {
          // 通过 lodbash deepCopy 一份数据并传递给 _this.blockDiagram.model
          _this.blockDiagram.model = go.Model.fromJson(_this._.cloneDeep(node.data.unitLists))
        }
      }

      const jobBlockTemplate = baseNodeTemplateForPort(CONST.COLORS.JOB, 'Rectangle')
      jobBlockTemplate.doubleClick = function (e, node) {
        if (e.diagram instanceof go.Palette) return
        _this.currentJobBlockText = node.data.text
        _this.currentJobBlockKey = node.data.key
        _this.jobModalShow = true
      }

      _this.myDiagram.nodeTemplateMap.add('normalBlock', normalBlockTemplate)
      _this.myDiagram.nodeTemplateMap.add('switchBlock', switchBlockTemplate)
      _this.myDiagram.nodeTemplateMap.add('Start', startTemplate)
      _this.myDiagram.nodeTemplateMap.add('End', endTemplate)
      _this.myDiagram.nodeTemplateMap.add('Job', jobBlockTemplate)

      _this.myDiagram.toolManager.linkingTool.linkValidation = commonValidation
      _this.myDiagram.toolManager.relinkingTool.linkValidation = commonValidation
    }

    function blockDiagramInit () {
      _this.blockDiagram = MAKE(go.Diagram, 'inner-diagram', {
        initialContentAlignment: go.Spot.Center,
        allowDrop: true,
        layout: MAKE(go.LayeredDigraphLayout, { direction: 0, layerSpacing: 40, columnSpacing: 30, setsPortSpots: false }),
        'toolManager.mouseWheelBehavior': go.ToolManager.WheelZoom,
        mouseDrop: function (e) {
          finishDrop(e, null)
        },
        'undoManager.isEnabled': true,
        'commandHandler.archetypeGroupData': { category: 'UnitList', text: 'UnitList', isGroup: true }
      })

      // -------------从Palette拖拽节点的触发事件，判断Unit是否被UnitList包含------------
      _this.blockDiagram.addDiagramListener('externalobjectsdropped', function (e) {
        e.subject.each(function (n) {
          // 得到从Palette拖过来的节点 判断节点如果没有group则删除节点
          if (n.data.category === 'Unit') {
            if (!n.data.group) { // 判断Unit是否被UnitList包含
              _this.blockDiagram.commandHandler.groupSelection()
            }
          }
        })
      })
      _this.blockDiagram.linkTemplate = linkTemplateStyle()

      const unitTemplate = unitNodeTemplate(CONST.COLORS.UNIT)

      unitTemplate.doubleClick = function (e, node) {
        if (e.diagram instanceof go.Palette) return
        // _this.unitMsgToogle = !_this.unitMsgToogle
        _this.showUnitEditor = true
        let { key, text, unitMsg, unitMsg: { execModName } } = node.data
        _this.unitData = {
          unitNodeKey: key,
          unitName: text,
          unitType: execModName,
          unitMsg: _this._.cloneDeep(unitMsg)
        }
      }

      unitTemplate.contextClick = function (e, node) {
        if (!(e.diagram instanceof go.Palette) || !sessionStorage.identity.includes('Admin')) return
        _this.unitTemplateName = node.data.text
        _this.unitTemplateId = node.data.unit_id
        _this.unitTemplateContent = JSON.stringify(node.data.unitMsg, null, 2)
        _this.unitController.style.top = `${e.event.y - 50}px`
        _this.unitController.style.left = `${e.event.x}px`
        _this.unitController.style.display = 'block'
      }

      const unitListGroupTemplate = baseGroupTemplate(_this)
      unitListGroupTemplate.memberValidation = function groupValidation (group, node) {
        return node.data.category === 'Unit'// 当节点的category值为Unit时
      }

      unitListGroupTemplate.linkValidation = unitListValidation

      _this.blockDiagram.nodeTemplateMap.add('Unit', unitTemplate)
      _this.blockDiagram.nodeTemplateMap.add('Start', startNodeTemplate(CONST.COLORS.START, true))
      _this.blockDiagram.nodeTemplateMap.add('End', endNodeTemplate(CONST.COLORS.END, true))
      _this.blockDiagram.groupTemplateMap.add('UnitList', unitListGroupTemplate)

      _this.blockDiagram.toolManager.linkingTool.linkValidation = commonValidation
      _this.blockDiagram.toolManager.relinkingTool.linkValidation = commonValidation
    }

    function blockPaletteInit () {
      _this.blockPalette =
        MAKE(go.Palette, 'unit-palette',
          {
            nodeTemplateMap: _this.blockDiagram.nodeTemplateMap,
            groupTemplateMap: _this.blockDiagram.groupTemplateMap,
            layout: MAKE(go.GridLayout, { wrappingColumn: 1, alignment: go.GridLayout.Center })
          })
      _this.getSelectedUnit('基础操作')
    }
    this.updateUnitAllList()
    this.init()
  },
  beforeCreate () {
    const _this = this
    window.onload = () => {
      _this.screenWidth = document.body.clientWidth
    }
    window.onresize = () => {
      return (() => {
        window.screenWidth = document.body.clientWidth
        _this.screenWidth = window.screenWidth
      })()
    }
  },
  methods: {
    async init () {
      this.myPalette = MAKE(
        go.Palette, 'chart-palette', {
          scrollsPageOnFocus: false,
          nodeTemplateMap: this.myDiagram.nodeTemplateMap,
          layout: MAKE(go.GridLayout, { wrappingColumn: 1, alignment: go.GridLayout.Location })
        }
      )

      this.myPalette.model = new go.GraphLinksModel([
        { category: 'Start', text: 'Start' },
        { category: 'switchBlock', text: 'Switch' },
        {
          category: 'normalBlock',
          text: 'Normal',
          unitLists: {
            'class': 'GraphLinksModel',
            'linkFromPortIdProperty': 'fromPort',
            'linkToPortIdProperty': 'toPort',
            'nodeDataArray': [
              {
                'category': 'Start',
                'text': 'Entry',
                'key': -1,
                'loc': '-914.2500000000001 -64.00000000000001'
              },
              {
                'category': 'UnitList',
                'text': 'UnitList',
                'isGroup': true,
                'key': -2,
                'loc': '-700.5 -49'
              },
              {
                'category': 'End',
                'text': 'Exit',
                'key': -3,
                'loc': '-423.5 -65'
              }
            ],
            'linkDataArray': [
              {
                'from': -1,
                'to': -2,
                'fromPort': 'R',
                'toPort': 'L'
              },
              {
                'from': -2,
                'to': -3,
                'fromPort': 'R',
                'toPort': 'L'
              }
            ]
          }
        },
        { category: 'Job', text: 'Job' },
        { category: 'End', text: 'End' }
      ])

      if (this.diagramModel && this.diagramModel.nodeDataArray.length) {
        this.myDiagram.model = go.Model.fromJson(this.diagramModel)
      } else {
        if (this.jobInfo.job_flow) {
          let { status, data } = await getBlockFlowDict4Font(this.jobInfo.job_flow)
          if (status === 200) {
            if (JSON.stringify(data) === '{}') {
              this.$Message.err({
                background: true,
                content: '这个job不存在'
              })
              return this.$router.push({ path: '/' })
            }
            this.stageJobLabel = this.jobInfo.jobLabel
            this.myDiagram.model = go.Model.fromJson(data)
            this.$store.commit('job/setDiagramModel', data)
          } else {
            this.$Message.err({
              background: true,
              content: '获取 Job 信息失败'
            })
          }
        } else {
        // getTemporarySpace().then(res => {
          let model = basicModel()
          this.myDiagram.model = model
          this.$store.commit('job/setDiagramModel', model)
        // })
        }
      }
    },
    switchBlockSave (msg) {
      let node = this.myDiagram.model.findNodeDataForKey(this.currentSwitchBlockKey)
      this.myDiagram.model.setDataProperty(node, 'text', msg.switchBlockName)
      this.myDiagram.model.setDataProperty(node, 'fileName', msg.fileName)
      this.myDiagram.model.setDataProperty(node, 'explain', msg.explain)
    },
    saveNormalBlock () { // normalBlock点击确定进行校验
      let currentNormalBlockData = this.myDiagram.findNodeForKey(this.currentNormalBlockKey).data

      let blockDiagramData = JSON.parse(this.blockDiagram.model.toJson())

      const blockDiagramHint = blockFlowValidation(this)

      this.$Notice.destroy()

      function setDataProperty (context, data, propname, val) {
        context.myDiagram.model.setDataProperty(data, propname, val)
      }

      if (blockDiagramHint.size !== 0) {
        this.blockModalShow = true
        let errorNum = 1
        let errorMessage = ''
        blockDiagramHint.forEach(element => {
          errorMessage += errorNum + '.' + element + '<br/>'
          errorNum++
        })
        // message提示
        this.$Notice.error({
          title: '当前block出现以下错误',
          desc: errorMessage
        })
      } else {
        let units = blockDiagramData.nodeDataArray.filter(item => item.category === 'Unit')
        if (units.some(item => CONST.STAR.has(item.unitMsg.execModName))) {
          setDataProperty(this, currentNormalBlockData, 'star', true)
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

        this.myDiagram.model = go.Model.fromJson(this.myDiagram.model.toJson())
        this.blockModalShow = false
      }
    },
    _jobFlowRules () {
      const myDiagramEventValidationHint = jobFlowValidation(this)

      this.$Notice.destroy()

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
    isNestedInnerJob () { // 是否是嵌套的InnerJob
      let { count } = this.myDiagram.findNodesByExample({ 'category': 'Job' })
      if (count > 0 && this.isInnerJob) {
        this.$Message.error({
          background: true,
          content: 'InnerJob 暂不支持嵌套'
        })
        return true
      }
      return false
    },
    _dataURLtoFile (dataurl, filename) {
      var arr = dataurl.split(',')
      var mime = arr[0].match(/:(.*?);/)[1]
      var dec = atob(arr[1]) // window atob() 方法用于解码使用 base-64 编码的字符串，base-64 编码使用的是 btoa，该方法使用 "A-Z", "a-z", "0-9", "+", "/" 和 "=" 字符来编码字符串。
      var n = dec.length
      var u8arr = new Uint8Array(n) // 8位无符号整数数组 0~255
      while (n--) {
        u8arr[n] = dec.charCodeAt(n) // charCodeAt() 方法可返回指定位置的字符的 Unicode 编码
      }
      return new File([u8arr], filename, { type: mime })
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
      if (!this._jobMsgRules() || this.isNestedInnerJob()) return
      if (this._jobFlowRules()) {
        this._saveJob(saveAs, false, false)
      }
    },
    async uploadFiles (id, info, resFiles) {
      info.job_id = id
      try {
        let { status } = await jobFlowAndMsgUpdate(id, info)
        if (status === 200) {
          let data = new FormData()
          data.append('job', id)
          for (let i = 0; i < resFiles.length; i++) {
            let { name, type, file } = resFiles[i]
            if (type === 'png') {
              data.append('file', this._dataURLtoFile(file, name))
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
              this.$router.push({ path: '/jobList' })
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
    async _saveJob (e, saveAs = false, isDraft = true) {
      let jobFlow = this.myDiagram.model.toJson()
      let id = this.jobId
      let info = this._.cloneDeep(this.jobInfo)
      info.ui_json_file = JSON.parse(jobFlow)
      info.test_area = await this._createNewTag('test_area')
      info.custom_tag = await this._createNewTag('custom_tag')
      info.draft = isDraft
      info.author = localStorage.id
      this.removeInvalidFile(info.ui_json_file)
      this.$store.commit('files/addResFile', {
        name: 'FILES_NAME_CONFIG.json',
        type: 'json',
        file: JSON.stringify(this.resFilesName, null, 2)
      })
      let resFiles = this._.cloneDeep(this.resFiles)
      if (id) { // 不是新建 job
        if (saveAs) { // 另存为
          info.job_label = createJobLabel(this)
          try {
            let { status, data } = await jobFlowAndMsgSave(info)
            if (status === 201) {
              id = data.id
            }
            this.uploadFiles(id, info, resFiles)
          } catch (error) {
            console.log(error)
          }
        } else { // 更新
          this.uploadFiles(id, info, resFiles)
        }
      } else { // 新建 job
        info.job_label = createJobLabel(this)
        info.job_type = 'Joblib'
        jobFlowAndMsgSave(info).then(res => {
          if (res.status === 201) {
            id = res.data.id
          }
        }).then(() => {
          this.uploadFiles(id, info, resFiles)
        }).catch(err => {
          console.error(err)
        })
      }

      this.clearData()
    },
    saveAs () {
      this.rename = true
    },
    saveUnit (unitData, unitResFileList) {
      this.showUnitEditor = false
      let curUnitNode = this.blockDiagram.findNodeForKey(unitData.unitNodeKey)
      this.blockDiagram.model.setDataProperty(curUnitNode.data, 'unitMsg', unitData.unitMsg)
      this.blockDiagram.model.setDataProperty(curUnitNode.data, 'text', unitData.unitName)
      if (unitResFileList.length) {
        if (!curUnitNode.data.resFile) {
          this.blockDiagram.model.setDataProperty(curUnitNode.data, 'resFile', {})
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
        this.blockPalette.model = new go.GraphLinksModel(unitCategoryData.nodeDataArray)
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
        console.log('您选中的job为：', job.id)
        let currentJobBlockData = this.myDiagram.findNodeForKey(this.currentJobBlockKey).data
        this.myDiagram.model.setDataProperty(currentJobBlockData, 'text', job.job_name)
        this.myDiagram.model.setDataProperty(currentJobBlockData, 'jobId', job.id)
        this.myDiagram.model.setDataProperty(currentJobBlockData, 'jobLabel', job.job_label)
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
      let currentNodeData = this.blockDiagram.findNodeForKey(this.unitData.unitNodeKey).data

      if (hasCompleted) {
        this.blockDiagram.model.setDataProperty(currentNodeData, 'color', CONST.COLORS.FINISH)
        currentNodeData.completed = true
      } else {
        this.blockDiagram.model.setDataProperty(currentNodeData, 'color', CONST.COLORS.UNFINISHED)
        currentNodeData.completed = false
      }
      // this.blockDiagram.model = go.Model.fromJson(this.blockDiagram.model.toJson())
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
      this.$store.commit('job/clearDiagramModel')
      this.$store.commit('job/clearPreJobInfo')
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
      this.clearData()
      this.$router.push({ path: '/jobList' })
    }
  },
  beforeRouteLeave (to, from, next) {
    setTimeout(() => {
      this.$Notice.destroy()
    }, 600)
    next()
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

  #chart-palette {
    width: 15%;
    margin-right: 30px;
    background-color: white;
    border: solid 1px rgb(244, 244, 244);
  }

  #chart-diagram {
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

    .unit-palette-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      width: 100%;

      .unit-palette-header {
        text-align: center;

        #dropdown-btn {
          margin-bottom: 10px;
        }
      }

      #unit-palette {
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
