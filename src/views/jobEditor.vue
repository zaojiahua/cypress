<template>
  <div id="wrap" ref="jobEditor">
    <div>
      <div class="job-editor-header">
        <Input v-model="$store.state.jobInfo.job_name" class="job-name" placeholder="请输入JOB名称" size="large" />

        <div class="job-editor-header-btns">
          <div>
            <Button type="primary" @click="$store.commit('handleShowDrawer')" size="large" style="margin-right: 10px;">用例详情</Button>
            <Button type="info" ghost size="large" @click="viewResFile" style="margin-right: 10px;">查看依赖文件</Button>
          </div>
          <div>
            <Button type="primary" size="large" @click="saveJob" style="margin-right: 10px;">保存</Button>
            <!-- <Button type="error" size="large" style="margin-right: 10px;">存为草稿</Button> -->
            <Button size="large" type="success" @click="saveAs" style="margin-right: 10px;">另存为</Button>
            <Button size="large" to="/jobList">退出</Button>
          </div>
        </div>
      </div>
      <Modal v-model="rename" :closable="false" :mask-closeable="false" :styles="{ top: '42%' }">
        <div slot="header" style="color:#f60;text-align:center">
          <Icon type="ios-information-circle" style="font-size: 20px;"></Icon>
          <span style="font-size: 18px;">重命名</span>
        </div>
        <Input placeholder="重命名" v-model="$store.state.jobInfo.job_name" />
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
        :resFileModalShow="resFileModalShow"
        @resFileModalClose="resFileModalClose"
      ></job-res-file>
      <unit-editor
        :filesName="filesName"
        :unitContent="unitContent"
        :unitEditorModalShow="unitEditorModalShow"
        :nodeKey="nodeKey"
        @closeUnitEditor="closeUnitEditor"
        @updateCanvas="updateCanvas"
        @saveUnit="saveUnit"
      ></unit-editor>
      <div id="chart-wrap">
        <div id="chart-palette"></div>
        <div id="chart-diagram"></div>
      </div>
      <unit-template-editor
        :openUnitTemplateEditor="openUnitTemplateEditor"
        :unitTemplateId="unitTemplateId"
        :unitTemplateType="unitType"
        :unitTemplateTypes="unitTypes"
        :unitTemplateName="unitName"
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
            <div class="common-palette-container">
              <div class="common-palette-header">
                <p>常用工具</p>
              </div>
              <div id="common-palette"></div>
            </div>
            <div class="unit-palette-container">
              <div class="common-palette-header">
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
        @clear="switchBlockInfo = {}"
      ></switch-block-detail-component>
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
import jobInJob from '../components/jobInJob'
import jobResFile from '../components/jobResFile'
import unitEditor from '../components/unitEditor'
import unitTemplateEditor from '../components/unitTemplateEditor'
import { getJobUnitsBodyDict, deleteUnitTemplate } from '../api/reef/unit'
import { getBlockFlowDict4Font, jobFlowAndMsgSave, jobFlowAndMsgUpdate } from '../api/reef/jobFlow'
import { jobResFilesSave } from '../api/reef/jobResFileSave'
import SwitchBlockDetailComponent from '../components/SwitchBlockDetailComponent'
import { commonValidation } from '../core/validation/common'
import {
  startValidation
} from '../core/validation/operationValidation/job'
import { unitListValidation } from '../core/validation/operationValidation/block'
import { jobFlowValidation } from '../core/validation/finalValidation/job'
import { blockFlowValidation } from '../core/validation/finalValidation/block'
import axios from '../api'
import { baseURL } from '../config'

export default {
  name: 'jobEditor',
  components: { SwitchBlockDetailComponent, jobInJob, jobResFile, unitEditor, unitTemplateEditor },
  data () {
    return {
      jobName: '',
      blockModalShow: false,
      switchBlockModalShow: false,
      currentSwitchBlockKey: null,
      unitName: null,
      unitContent: '',
      blockName: '',
      stageJobLabel: null,
      getCurrentNormalBlockByKey: null,
      unitType: '请选择组件类型',
      switchBlockInfo: {},
      unitAllList: {},
      basicModuleShow: {},
      screenWidth: 1400,
      jobModalShow: false,
      currentJobBlockKey: null,
      currentJobBlockText: 'Job block',
      resFileModalShow: false,
      unitMsgToogle: true,
      unitEditorModalShow: false,
      unitController: null,
      openUnitTemplateEditor: false,
      unitTemplateContent: '',
      unitTemplateId: undefined,
      unitTypes: [],
      filesName: [
        {
          title: '文件名称',
          children: ['text']
        },
        {
          title: '图片名称',
          children: ['snap']
        }
      ],
      nodeKey: null,
      colors: {
        start: '#064973',
        switch: '#768BB9',
        normal: '#F76132',
        job: '#50A5F4',
        end: '#313131',
        fail: '#818286',
        success: '#F65A6D',
        finish: '#29BB87',
        unfinished: '#F76132',
        unit: '#338FF0',
        group: '#50A5F4'
      },
      rename: false
    }
  },
  mounted () {
    this.unitController = document.querySelector('#unit-controller')

    const _this = this
    _this.$Notice.config({
      top: 150,
      duration: 0
    })

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

      const startTemplate = startNodeTemplate(_this.colors.start)
      startTemplate.linkValidation = startValidation

      const endTemplate = endNodeTemplate(_this.colors.end)

      endTemplate.doubleClick = (e, node) => {
        if (node.data.text === 'End') {
          _this.myDiagram.model.setDataProperty(node.data, 'text', 'Fail')
          _this.myDiagram.model.setDataProperty(node.data, 'color', _this.colors.fail)
        } else if (node.data.text === 'Fail') {
          _this.myDiagram.model.setDataProperty(node.data, 'text', 'Success')
          _this.myDiagram.model.setDataProperty(node.data, 'color', _this.colors.success)
        } else {
          _this.myDiagram.model.setDataProperty(node.data, 'text', 'End')
          _this.myDiagram.model.setDataProperty(node.data, 'color', _this.colors.end)
        }

        // debugger
      }

      const switchBlockTemplate = baseNodeTemplateForPort(_this.colors.switch, 'Diamond')
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

      const normalBlockTemplate = baseNodeTemplateForPort(_this.colors.normal, 'Rectangle')

      normalBlockTemplate.doubleClick = function (e, node) {
        _this.$Notice.destroy()
        if (e.diagram instanceof go.Palette) return
        _this.unitType = '请选择组件类型'
        _this.blockName = node.data.text
        _this.getCurrentNormalBlockByKey = node.data.key
        _this.blockModalShow = true
        if (!_this.blockDiagram) blockDiagramInit()
        if (!_this.blockPalette) blockPaletteInit()
        if (!_this.commonPalette) commonPaletteInit()
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

      const jobBlockTemplate = baseNodeTemplateForPort(_this.colors.job, 'Rectangle')
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

      const unitTemplate = unitNodeTemplate(_this.colors.unit)

      unitTemplate.doubleClick = function (e, node) {
        if (e.diagram instanceof go.Palette) return
        _this.unitContent = JSON.stringify(node.data.unitMsg, null, 2)
        _this.unitMsgToogle = !_this.unitMsgToogle
        _this.unitEditorModalShow = true
        _this.unitName = node.data.text
        _this.nodeKey = node.data.key
        _this.$bus.emit('setUnitEditorData', {
          unitNodeKey: node.data.key,
          unitName: node.data.text,
          unitType: node.data.unitMsg.execModName,
          unitMsg: JSON.parse(JSON.stringify(node.data.unitMsg, null, 2)),
          unitContent: JSON.stringify(node.data.unitMsg, null, 2),
          unitItemsData: _this._getUnitItems(node.data.unitMsg)
        })
        // let units = e.diagram.findNodesByExample(example) // 模糊查找，找到所有的 Unit
        // units.iterator.each(unit => {
        //   let unitMsgCmdDict = JSON.stringify(unit.data.unitMsg.execCmdDict, null, 2)
        //   if (outputFile && unitMsgCmdDict && (unitMsgCmdDict.indexOf('<blkInpPath>' + outputFile[0].split('>')[1]) !== -1)) {
        //     unit.isSelected = true
        //   }
        //   if (inputFile && unitMsgCmdDict && (unitMsgCmdDict.indexOf('<blkOutPath>' + inputFile[0].split('>')[1]) !== -1)) {
        //     unit.isSelected = true
        //   }
        // })
      }

      unitTemplate.mouseEnter = function (e, node) {
        // console.log(node)
        // if (e.diagram instanceof go.Palette) return
        // console.log(node.data)
        // _this.unitContent = JSON.stringify(node.data.unitMsg, null, 2)
        // outputFile = JSON.stringify(node.data.unitMsg, null, 2)

        // if (outputFile) {
        //   _this.unitOutputFileData = []
        //   _this.unitOutputFileData.push({
        //     file_name: outputFile[0].split('>')[1]
        //   })
        // }
        // inputFile = JSON.stringify(node.data.unitMsg, null, 2)
        // if (inputFile) {
        //   _this.unitInputFileData = []
        //   _this.unitInputFileData.push({
        //     file_name: inputFile[0].split('>')[1]
        //   })
        // }
        // console.log(outputFile, inputFile)
        // tooltip.style.display = 'block'
      }

      unitTemplate.contextClick = function (e, node) {
        if (!(e.diagram instanceof go.Palette) || !sessionStorage.identity.includes('Admin')) return
        _this.unitName = node.data.text
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
      _this.blockDiagram.nodeTemplateMap.add('Start', startNodeTemplate(_this.colors.start))
      _this.blockDiagram.nodeTemplateMap.add('End', endNodeTemplate(_this.colors.end))
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
    function commonPaletteInit () {
      _this.commonPalette =
        MAKE(go.Palette, 'common-palette',
          {
            nodeTemplateMap: _this.blockDiagram.nodeTemplateMap,
            groupTemplateMap: _this.blockDiagram.groupTemplateMap,
            layout: MAKE(go.GridLayout, { wrappingColumn: 1, alignment: go.GridLayout.Position })
          })
      let basicModule = {
        'nodeDataArray': [
          { category: 'Start', text: 'Entry' },
          { category: 'UnitList', text: 'UnitList', isGroup: true },
          { category: 'End', text: 'Exit' }
        ]
      }

      _this.basicModuleShow = {
        key: 'basicModule',
        value: basicModule
      }
      _this.commonPalette.model = new go.GraphLinksModel(basicModule.nodeDataArray, basicModule.linkDataArray)
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
    init () {
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

      if (this.$store.state.jobInfo.job_flow) {
        getBlockFlowDict4Font(this.$store.state.jobInfo.job_flow).then(res => {
          if (JSON.stringify(res.data) === '{}') {
            this.$Message.warning('这个job不存在')
            return this.$router.push({ path: '/' })
          }
          this.stageJobLabel = this.$store.state.jobInfo.jobLabel
          this.myDiagram.model = go.Model.fromJson(res.data)
        })
      } else {
        // getTemporarySpace().then(res => {
        this.myDiagram.model = basicModel()
        // })
      }
    },
    switchBlockSave (msg) {
      let node = this.myDiagram.model.findNodeDataForKey(this.currentSwitchBlockKey)
      this.myDiagram.model.setDataProperty(node, 'text', msg.switchBlockName)
      this.myDiagram.model.setDataProperty(node, 'fileName', msg.fileName)
      this.myDiagram.model.setDataProperty(node, 'explain', msg.explain)
    },
    saveNormalBlock () { // normalBlock点击确定进行校验
      let currentNormalBlockData = this.myDiagram.findNodeForKey(this.getCurrentNormalBlockByKey).data

      let blockDiagramData = JSON.parse(this.blockDiagram.model.toJson())

      const blockDiagramHint = blockFlowValidation(this)

      this.$Notice.destroy()

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
        if (units.some(item => item.unitMsg.execModName === 'IMGTOOL')) {
          this.myDiagram.model.setDataProperty(currentNormalBlockData, 'star', true)
        } else {
          this.myDiagram.model.setDataProperty(currentNormalBlockData, 'star', false)
        }
        if (units.length === 0 || units.some(item => item.completed === false)) {
          this.myDiagram.model.setDataProperty(currentNormalBlockData, 'color', this.colors.unfinished)
        } else {
          this.myDiagram.model.setDataProperty(currentNormalBlockData, 'color', this.colors.finish)
        }
        this.myDiagram.model.setDataProperty(currentNormalBlockData, 'unitLists', blockDiagramData)
        this.myDiagram.model.setDataProperty(currentNormalBlockData, 'text', this.blockName)
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
      if (this.$store.state.jobInfoValid) {
        flag = true
      } else {
        this.$store.commit('handleShowDrawer')
      }
      return flag
    },
    // 生成 jobLabel
    _createJobLabel () {
      let randomStr = Math.random().toString(36).substr(2)
      let jobLabel = this.md5(this.myDiagram.model.toJson() + randomStr)
      jobLabel = 'job-' + jobLabel.substr(0, 8) + '-' + jobLabel.substr(8, 4) + '-' + jobLabel.substr(12, 4) + '-' + jobLabel.substr(16, 4) + '-' + jobLabel.substr(20)
      return jobLabel
    },
    _setJobResFile (id) {
      let filesData = this.$refs.jobResFile.filesData
      let filesNameConfig = filesData.find(item => item.name === 'filesNameConfig.json')
      if (filesNameConfig) {
        filesNameConfig.file = JSON.stringify(this.filesName, null, 2)
      } else {
        filesData.push({
          name: 'filesNameConfig.json',
          type: 'json',
          file: JSON.stringify(this.filesName, null, 2)
        })
      }
      let data = new FormData()
      data.append('job', id)
      for (let i = 0; i < filesData.length; i++) {
        let file = null
        if (filesData[i].type === 'jpg' || filesData[i].type === 'png') {
          file = this._dataURLtoFile(filesData[i].file, filesData[i].name)
        } else {
          file = new File([filesData[i].file], filesData[i].name, { type: filesData[i].type })
        }
        data.append('file', file)
      }
      return data
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
      let targetNameDic = {
        'test_area': 'job_test_area',
        'custom_tag': 'custom_tag'
      }
      let target = this.$store.state.jobInfo[tagType]
      for (let i = 0; i < target.length; i++) {
        if (typeof target[i] !== 'number') {
          let res = await axios.request({
            url: `${baseURL}/api/v1/cedar/${targetNameDic[tagType]}/`,
            method: 'post',
            data: tagType === 'test_area' ? { description: target[i] } : { custom_tag_name: target[i] }
          })
          target.splice(i, 1, res.data.id)
        }
      }
      return target
    },
    saveJob (saveAs = false) {
      // 使用 & 保证都运行
      if (!this._jobMsgRules()) return
      if (this._jobFlowRules()) {
        this._saveJob(saveAs, false, false)
      }
    },
    async _saveJob (e, saveAs = false, isDraft = true) { // render 函数中会向函数传入点击事件参数
      let jobFlow = this.myDiagram.model.toJson()
      let id = this.$route.query.jobId
      let info = JSON.parse(JSON.stringify(this.$store.state.jobInfo, null, 2))
      info.ui_json_file = JSON.parse(jobFlow)
      info.test_area = await this._createNewTag('test_area')
      info.custom_tag = await this._createNewTag('custom_tag')
      info.draft = isDraft
      if (id) { // 不是新建 job
        if (saveAs) { // 另存为
          info.job_label = this._createJobLabel()
          jobFlowAndMsgSave(info).then(res => {
            if (res.status === 201) {
              id = res.data.id
            }
          }).then(() => {
            let data = this._setJobResFile(id)
            jobFlowAndMsgUpdate(id, info).then(res => {
              if (res.status === 200) {
                jobResFilesSave(data).then(res => {
                  if (res.status === 201) {
                    this.$Message.info('保存成功')
                    this.$router.push({ path: '/jobList' })
                  }
                })
              }
            })
          })
        } else { // 更新
          let data = this._setJobResFile(id)
          jobFlowAndMsgUpdate(id, info).then(res => {
            if (res.status === 200) {
              jobResFilesSave(data).then(res => {
                if (res.status === 201) {
                  this.$Message.info('保存成功')
                  this.$router.push({ path: '/jobList' })
                }
              })
            }
          })
        }
      } else { // 新建 job
        info.job_label = this._createJobLabel()
        jobFlowAndMsgSave(info).then(res => {
          if (res.status === 201) {
            id = res.data.id
          }
        }).then(() => {
          let data = this._setJobResFile(id)
          jobFlowAndMsgUpdate(id, info).then(res => {
            if (res.status === 200) {
              jobResFilesSave(data).then(res => {
                if (res.status === 201) {
                  this.$Message.info('保存成功')
                  this.$router.push({ path: '/jobList' })
                }
              })
            }
          })
        }).catch(err => {
          console.log(err)
        })
      }
    },
    saveAs () {
      this.rename = true
    },
    saveUnit (unitNodeKey, unitName, unitMsg) {
      let currentUnitNode = this.blockDiagram.findNodeForKey(unitNodeKey)
      this.unitName = unitName
      this.blockDiagram.model.setDataProperty(currentUnitNode.data, 'unitMsg', unitMsg)
      this.blockDiagram.model.setDataProperty(currentUnitNode.data, 'text', unitName)
      this.unitEditorModalShow = false
    },
    getSelectedUnit (name) {
      let unitCategoryData = {}
      unitCategoryData.nodeDataArray = []
      this.unitType = name
      Object.entries(this.unitAllList[name]).forEach((unit) => {
        unitCategoryData.nodeDataArray.push({
          category: 'Unit',
          text: unit[0],
          unit_id: unit[1]['unit_id'],
          unitMsg: unit[1]['unit_content']
        })
      })
      this.blockPalette.model = new go.GraphLinksModel(unitCategoryData.nodeDataArray)
    },
    jobModalClose (job) {
      this.jobModalShow = false
      if (job.id) {
        console.log('您选中的job为：', job.id)
        let currentJobBlockData = this.myDiagram.findNodeForKey(this.currentJobBlockKey).data
        this.myDiagram.model.setDataProperty(currentJobBlockData, 'text', job.job_name)
        this.myDiagram.model.setDataProperty(currentJobBlockData, 'jobId', job.id)
        console.log(currentJobBlockData)
      }
    },
    viewResFile () {
      this.resFileModalShow = true
    },
    resFileModalClose () {
      this.resFileModalShow = false
    },
    closeUnitEditor () {
      this.unitEditorModalShow = false
    },
    delUnitTemplate () {
      let _this = this
      this.$Modal.confirm({
        title: '温馨提示',
        content: '确定要删除当前 Unit 模板吗？',
        okText: '心意已决',
        cancelText: '我再想想',
        onOk () {
          deleteUnitTemplate(_this.unitTemplateId).then((res) => {
            if (res.status === 204) {
              _this.$Message.success({
                background: true,
                content: '删除成功'
              })
              setTimeout(() => {
                _this.updateUnitAllList(_this.unitType)
              }, 500)
            }
          }).catch((e) => {
            console.log(e)
          })
          console.log('删除')
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
    updateUnitAllList (name = undefined) {
      this.unitAllList = {}
      getJobUnitsBodyDict().then(res => {
        // console.log(res)
        res.data.unit.forEach((unit, index) => {
          if (!(unit.type in this.unitAllList)) {
            this.$set(this.unitAllList, unit.type, {})
          }
          this.$set(this.unitAllList[unit.type], unit.unit_name, {
            unit_id: unit.id,
            unit_content: unit.unit_content
          })
        })
        if (name) this.getSelectedUnit(name)
      })
    },
    updateCanvas (hasCompleted, nodeKey) {
      let currentNodeData = this.blockDiagram.findNodeForKey(nodeKey).data

      if (hasCompleted) {
        this.blockDiagram.model.setDataProperty(currentNodeData, 'color', this.colors.finish)
        currentNodeData.completed = true
      } else {
        this.blockDiagram.model.setDataProperty(currentNodeData, 'color', this.colors.unfinished)
        currentNodeData.completed = false
      }
      // this.blockDiagram.model = go.Model.fromJson(this.blockDiagram.model.toJson())
    },
    _getUnitItems (unitMsg) {
      let unitItemsData = []
      let unitType = unitMsg.execModName
      if (unitType === 'IMGTOOL') {
        Object.keys(unitMsg.execCmdDict).forEach(execCmdDictKey => {
          if (unitMsg.execCmdDict[execCmdDictKey].type !== 'noChange') {
            unitItemsData.push({
              'itemName': execCmdDictKey,
              'itemContent': JSON.parse(JSON.stringify(unitMsg.execCmdDict[execCmdDictKey]))
            })
          }
        })
      } else {
        unitMsg.execCmdDict.execCmdList.forEach((val, index) => {
          if (val.type !== 'noChange') {
            unitItemsData.push({
              'itemName': index,
              'itemContent': JSON.parse(JSON.stringify(val))
            })
          }
        })
      }
      return unitItemsData
    },
    setFilesName (filesNameConfig) {
      this.filesName = JSON.parse(filesNameConfig)
    }
  },
  created () {
    this.$bus.on('addFilesName', (type, data) => {
      if (type === 'file') {
        this.filesName[0].children = this.filesName[0].children.concat(data)
      }
      if (type === 'picture') {
        this.filesName[1].children = this.filesName[1].children.concat(data)
      }
    })
    this.$bus.on('setFilesName', this.setFilesName)
  },
  beforeDestroy () {
    this.$bus.off('setFilesName', this.setFilesName)
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
  }

  .job-editor-header-btns {
    width: 83.1%;
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

    .common-palette-container {
      width: 100%;

      .common-palette-header p {
        text-align: center;
        font-size: 16px;
        font-weight: bolder;
        margin: 6px 0;
      }

      #common-palette {
        height: 176px;
        background-color: white;
      }
    }

    .unit-palette-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      width: 100%;
      padding-top: 40px;

      .common-palette-header {
        text-align: center;

        #dropdown-btn {
          margin: 10px 0;
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
