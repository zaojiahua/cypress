<template>
  <div id="wrap">
    <Drawer title="用例详细信息" :closable="false" v-model="showDrawer" width="50">
      <job-msg-component ref="jobDetail" :prop-confirm-btn="false" :prop-enter-btn="false"></job-msg-component>
    </Drawer>
    <div class="jobName">
      jobName: {{jobName}}
      <Button size="large" style="float: right" @click="$store.commit('noKeepAlive', 'jobEditor')" to="/jobList">取消</Button>
      <Button type="primary" size="large" @click="saveJob" style="margin-right: 10px">确定</Button>
      <Button type="info" size="large" @click="showDrawer=true" style="margin-right: 10px">详情</Button>
      <Button :type="$store.state.keepAliveComponents.length === 2 ? 'success' : 'warning'" size="large" @click="$store.commit('keepAlive', 'jobEditor')" style="margin-right: 10px">{{ this.$store.state.keepAliveComponents.length === 2 ? "已存" : "暂存" }}</Button>
      <i-switch size="large" v-show="switchButtonShow" v-model="switchButton">
        <span slot="open">另存</span>
        <span slot="close">更新</span>
      </i-switch>
    </div>

      <div id="chart-wrap">
        <div id="chart-palette"></div>
        <div id="chart-diagram"></div>
      </div>

    <Modal v-model="blockModalShow" :closable="false" fullscreen>
      <div slot="header">
        <Input v-model="blockName" size="large" placeholder="large size" />
      </div>
      <div slot="footer">
        <Button type="text" size="large" @click="blockModalShow=false">取消</Button>
        <Button type="primary" size="large" @click="saveNormalBlock">确定</Button>
      </div>
      <div id="inner-wrap">
        <div id="chart-left">
          <div id="dropdown-div" align="center"><!--下拉动态unit-->
            <Dropdown trigger="click" @on-click="getSelectedUnit">
              <Button id="dropdown-btn" type="primary">{{unitType}}</Button><!--:model="unitType"-->
              <DropdownMenu slot="list" style="width: 150px">
                <DropdownItem v-for="(currentUnit, key) in unitAllList" :name="key" :key="key">{{key}}</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
          <div id="inner-palette"></div>
        </div>
        <div id="inner-diagram"></div>
      </div>
    </Modal>
    <Modal
      v-model="unitModalShow"
      :width="this.screenWidth > 1366 ? '95' : '1290px'"
      :styles="{top: '20px'}"
      :mask-closable="false"
      :closable="false">
      <div slot="header">
        <Input v-model="unitName" size="large" placeholder="large size" />
      </div>
      <!--unit编辑页面-->
      <div slot="footer">
        <Button type="text" size="large" @click="unitModalShow=false">取消</Button>
        <Button type="primary" size="large" @click="saveUnit">确定</Button>
      </div>
      <div class="unitView" @keydown="keydownHandler">
        <div class="unitContent">
          <Input v-model="unitContent" type="textarea" :autosize="{minRows: 10,maxRows: 31}" placeholder="Enter something..." />
        </div>
        <div class="unitOperation">
          <job-operation-component :stage-job-label="stageJobLabel" ref="emptyOperation" @getImageName="getImageNames" @getFileName="getFileNames"></job-operation-component>
        </div>
      </div>
    </Modal>
    <switch-block-detail-component
      :switch-block-info="switchBlockInfo"
      v-model="switchBlockModalShow"
      @save="switchBlockSave"
      @clear="switchBlockInfo = {}">
    </switch-block-detail-component>
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
  baseNodeTemplate,
  baseNodeTemplateForPort,
  baseGroupTemplate,
  basicModel
} from './jobEditorCommon'
import jobMsgComponent from '../components/jobMsgComponent'
import JobOperationComponent from '../components/jobOperationComponent'
import { getTemporarySpace } from '../api/coral/jobLibSvc'
import { getJobUnitsBodyDict } from '../api/reef/unit'
import { getBlockFlowDict4Font, jobFlowAndMsgSave, jobFlowAndMsgUpdate } from '../api/reef/jobFlow'
import { jobResFilesSave } from '../api/reef/jobResFileSave'
import SwitchBlockDetailComponent from '../components/SwitchBlockDetailComponent'
import { isJsonString, insertAfterCursor } from '../lib/tools'
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
  components: { SwitchBlockDetailComponent, JobOperationComponent, jobMsgComponent },
  data () {
    return {
      jobName: '',
      blockModalShow: false,
      unitModalShow: false,
      jobOperationComponentShow: false,
      switchBlockModalShow: false,
      currentSwitchBlockKey: null,
      unitName: null,
      unitContent: null,
      blockName: '',
      stageJobLabel: null,
      unitNodeByKey: null,
      getCurrentNormalBlockByKey: null,
      unitType: '请选择组件类型',
      switchBlockInfo: {},
      unitAllList: {},
      basicModuleShow: {},
      switchButtonShow: false,
      switchButton: false,
      showDrawer: false,
      isCertain: false, // 是否是通过点击确定按钮离开jobEditor页面
      screenWidth: 1366,
      ingroneList: ['login']
    }
  },
  mounted () {
    const self = this
    self.$Notice.config({
      top: 150,
      duration: 10
    })

    myDiagramInit()
    function myDiagramInit () {
      self.myDiagram = MAKE(go.Diagram, 'chart-diagram', {
        initialContentAlignment: go.Spot.Center,
        allowDrop: true,
        // 设置网格
        grid: MAKE(go.Panel, 'Grid',
          MAKE(go.Shape, 'LineH', {
            stroke: 'lightgray',
            strokeWidth: 0.5
          }),
          MAKE(go.Shape, 'LineH', {
            stroke: 'gray',
            strokeWidth: 0.5,
            interval: 10
          }),
          MAKE(go.Shape, 'LineV', {
            stroke: 'lightgray',
            strokeWidth: 0.5
          }),
          MAKE(go.Shape, 'LineV', {
            stroke: 'gray',
            strokeWidth: 0.5,
            interval: 10
          })
        ),
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

      self.myDiagram.linkTemplate = linkTemplateStyle()

      self.myDiagram.linkTemplate.doubleClick = function (e, node) {
        if (e.diagram instanceof go.Palette) return
        let block = self.myDiagram.findNodeForKey(node.data.from).data

        if (block.category === 'normalBlock') {
          // vm.showDrawerOperation('linkOperation')
          // currentLinkObj = node
        }
      }

      const startTemplate = startNodeTemplate('#00AD5F')
      startTemplate.linkValidation = startValidation

      const endTemplate = endNodeTemplate('tomato')

      endTemplate.doubleClick = (e, node) => {
        if (node.data.text === 'End') {
          self.myDiagram.model.setDataProperty(node.data, 'text', 'Fail')
          self.myDiagram.model.setDataProperty(node.data, 'color', '#A9A9A9')
        } else {
          self.myDiagram.model.setDataProperty(node.data, 'text', 'End')
          self.myDiagram.model.setDataProperty(node.data, 'color', '#DC3C00')
        }

        debugger
      }

      const switchBlockTemplate = baseNodeTemplateForPort(MAKE(go.Brush, go.Brush.Linear, { 0.0: '#74ebd5', 1.0: '#9face6' }), 'Diamond')
      switchBlockTemplate.doubleClick = function (e, node) {
        self.$Notice.destroy()
        if (e.diagram instanceof go.Palette) return

        self.switchBlockInfo = {
          switchBlockName: node.data.text,
          fileName: node.data.fileName,
          explain: node.data.explain
        }
        self.currentSwitchBlockKey = node.data.key

        self.switchBlockModalShow = true
      }

      const normalBlockTemplate = baseNodeTemplateForPort(MAKE(go.Brush, go.Brush.Linear, { 0.0: '#30cfd0', 1.0: '#330867' }), 'RoundedRectangle')

      normalBlockTemplate.doubleClick = function (e, node) {
        self.$Notice.destroy()
        if (e.diagram instanceof go.Palette) return
        self.unitType = '请选择组件类型'
        self.blockName = node.data.text
        self.getCurrentNormalBlockByKey = node.data.key
        self.blockModalShow = true
        if (!self.blockDiagram) blockDiagramInit()
        if (!self.blockPalette) blockPaletteInit()
        if (!node.data.unitLists) { // unitList存在则展示
          self.blockDiagram.model = go.Model.fromJson({
            'class': 'go.GraphLinksModel',
            'linkFromPortIdProperty': 'fromPort',
            'linkToPortIdProperty': 'toPort',
            'nodeDataArray': [],
            'linkDataArray': []
          })
        } else {
          // 通过 lodbash deepCopy 一份数据并传递给 self.blockDiagram.model
          self.blockDiagram.model = go.Model.fromJson(self._.cloneDeep(node.data.unitLists))
        }
      }

      self.myDiagram.nodeTemplateMap.add('normalBlock', normalBlockTemplate)
      self.myDiagram.nodeTemplateMap.add('switchBlock', switchBlockTemplate)
      self.myDiagram.nodeTemplateMap.add('Start', startTemplate)
      self.myDiagram.nodeTemplateMap.add('End', endTemplate)

      self.myDiagram.toolManager.linkingTool.linkValidation = commonValidation
      self.myDiagram.toolManager.relinkingTool.linkValidation = commonValidation
    }

    function blockDiagramInit () {
      self.blockDiagram = MAKE(go.Diagram, 'inner-diagram', {
        initialContentAlignment: go.Spot.Center,
        allowDrop: true,
        'toolManager.mouseWheelBehavior': go.ToolManager.WheelZoom,
        mouseDrop: function (e) {
          finishDrop(e, null)
        },
        'undoManager.isEnabled': true
      })

      // -------------从Palette拖拽节点的触发事件，判断Unit是否被UnitList包含------------
      self.blockDiagram.addDiagramListener('externalobjectsdropped', function (e) {
        e.subject.each(function (n) {
          // 得到从Palette拖过来的节点 判断节点如果没有group则删除节点
          if (n.data.category === 'Unit') {
            if (!n.data.group) { // 判断Unit是否被UnitList包含
              self.blockDiagram.commandHandler.deleteSelection()// 删除该选中节点
              self.$Message.error('Unit只能被包裹在UnitList中') // 错误提示
            }
          }
        })
      })

      self.blockDiagram.linkTemplate = linkTemplateStyle()

      const unitTemplate = baseNodeTemplate('#c924c9', 'RoundedRectangle')
      unitTemplate.doubleClick = function (e, node) {
        if (e.diagram instanceof go.Palette) return

        self.$Notice.destroy()
        self.$refs.emptyOperation.deviceRefresh() // 双击unit时刷新device列表
        self.$refs.emptyOperation.emptyData()
        self.unitModalShow = true
        self.unitNodeByKey = node.data.key
        self.unitName = node.data.text
        self.unitContent = JSON.stringify(node.data.unitMsg, null, 2)
      }

      const unitListGroupTemplate = baseGroupTemplate()
      unitListGroupTemplate.memberValidation = function groupValidation (group, node) {
        return node.data.category === 'Unit'// 当节点的category值为Unit时
      }

      unitListGroupTemplate.linkValidation = unitListValidation

      self.blockDiagram.nodeTemplateMap.add('Unit', unitTemplate)
      self.blockDiagram.nodeTemplateMap.add('Start', startNodeTemplate('#00AD5F'))
      self.blockDiagram.nodeTemplateMap.add('End', endNodeTemplate('tomato'))
      self.blockDiagram.groupTemplateMap.add('UnitList', unitListGroupTemplate)

      self.blockDiagram.toolManager.linkingTool.linkValidation = commonValidation
      self.blockDiagram.toolManager.relinkingTool.linkValidation = commonValidation
    }

    function blockPaletteInit () {
      self.blockPalette =
        MAKE(go.Palette, 'inner-palette',
          {
            nodeTemplateMap: self.blockDiagram.nodeTemplateMap,
            groupTemplateMap: self.blockDiagram.groupTemplateMap,
            layout: MAKE(go.GridLayout, { wrappingColumn: 1, alignment: go.GridLayout.Position })
          })
      let basicModule = {
        'nodeDataArray': [
          { category: 'Start', text: 'Entry' },
          { category: 'Unit', text: 'Unit' },
          { category: 'UnitList', text: 'UnitList', isGroup: true },
          { category: 'End', text: 'Exit' }
        ]
      }

      self.basicModuleShow = {
        key: 'basicModule',
        value: basicModule
      }
      self.blockPalette.model = new go.GraphLinksModel(basicModule.nodeDataArray, basicModule.linkDataArray)
    }
    getJobUnitsBodyDict().then(res => {
      res.data.unit.forEach((unit, index) => {
        if (!(unit.type in this.unitAllList)) {
          this.$set(this.unitAllList, unit.type, {})
        }
        this.$set(this.unitAllList[unit.type], unit.unit_name, unit.unit_content)
      })
      this.$set(this.unitAllList, 'Basic Module', this.basicModuleShow)
    })
    this.init()

    this._getResFile(this.$route.query.jobId)
  },
  beforeCreate () {
    const self = this
    window.onload = () => {
      self.screenWidth = document.body.clientWidth
    }
    window.onresize = () => {
      return (() => {
        window.screenWidth = document.body.clientWidth
        self.screenWidth = window.screenWidth
      })()
    }
  },
  beforUpdate () {
    this.isCertain = false
  },
  // 提醒用户暂存已编辑的内容
  beforeRouteLeave (to, from, next) {
    let self = this
    let toFullPath = to.fullPath
    if (this.$store.state.keepAliveComponents.length !== 2 && this.myDiagram.model.nodeDataArray.length !== 0 && !this.isCertain && this.ingroneList.indexOf(to.name) === -1) {
      this.$Modal.confirm({
        title: 'WARNING',
        content: '此操作会丢失已编辑的内容，确定要继续吗？',
        closable: false,
        okText: '保存并退出',
        cancelText: '退出',
        onOk () {
          self.$store.commit('keepAlive', 'jobEditor')
          next(false)
          setTimeout(function () {
            self.$router.push({ path: toFullPath })
          }, 100)
        },
        onCancel () {
          next()
        }
      })
    } else {
      next()
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
        { category: 'switchBlock', text: 'Switch block' },
        { category: 'normalBlock', text: 'Normal block' },
        { category: 'End', text: 'End' }
      ])

      if (this.$route.query.jobFlow) {
        getBlockFlowDict4Font(this.$route.query.jobFlow).then(res => {
          if (JSON.stringify(res.data) === '{}') {
            this.$Message.warning('这个job不存在')
            return this.$router.push({ path: '/' })
          }
          this.stageJobLabel = this.$route.query.jobLabel
          this.jobName = this.$route.query.jobName
          this.$refs.jobDetail.getMsg(this.$route.query.jobId)
          this.myDiagram.model = go.Model.fromJson(res.data)
          this.switchButtonShow = true
        })
      } else {
        getTemporarySpace().then(res => {
          this.stageJobLabel = res.data.stageJobLabel
          this.$refs.jobDetail.getMsg()
          this.myDiagram.model = basicModel()
        })
      }
    },
    _sendContextIntoUnit (key, res) {
      let unitMsgObj = {
        execCmdDict: {}
      }
      if (this.unitContent) {
        unitMsgObj = JSON.parse(this.unitContent)
        if (!unitMsgObj.execCmdDict) unitMsgObj.execCmdDict = {}
      }
      unitMsgObj.execCmdDict[key] = '<1ijobFile>' + res
      this.unitContent = JSON.stringify(unitMsgObj, null, 2)
    },
    getImageNames (res) {
      this._sendContextIntoUnit('referImgFile', res)
    },
    getFileNames (res) {
      this._sendContextIntoUnit('configFile', res)
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
        this.blockModalShow = false
        this.myDiagram.model.setDataProperty(currentNormalBlockData, 'unitLists', blockDiagramData)
        this.myDiagram.model.setDataProperty(currentNormalBlockData, 'text', this.blockName)
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
          desc: errorMessage // 提示内容
        })
        return false
      } else return true
    },
    _jobMsgRules () {
      let flag = true
      this.$refs.jobDetail.$refs.jobInfoForm.validate((valid) => {
        if (!valid) {
          this.showDrawer = true
          flag = false
        }
      })
      return flag
    },
    // 生成 jobLabel
    _createJobLabel (src) {
      let jobLabel = this.md5(this.myDiagram.model.toJson())
      jobLabel = 'job-' + jobLabel.substr(0, 8) + '-' + jobLabel.substr(8, 4) + '-' + jobLabel.substr(12, 4) + '-' + jobLabel.substr(16, 4) + '-' + jobLabel.substr(20)
      return jobLabel
    },
    _createNewTag (tagType) { // 生成新的测试用途、自定义标签条目
      let requests = []
      let targetName = tagType === 'test_area' ? 'job_test_area' : 'custom_tag'
      let target = this.$refs.jobDetail.jobInfo[tagType]
      for (let i = target.length - 1; i > 0; i--) {
        if (typeof target[i] !== 'number') {
          requests.push(
            axios.request({
              url: `${baseURL}/api/v1/cedar/${targetName}/`,
              method: 'post',
              data: tagType === 'test_area' ? { description: target[i] } : { custom_tag_name: target[i] }
            }).then(res => {
              target[i] = res.data.id
            })
          )
        }
      }
      return Promise.all(requests)
    },
    _blobToFile (blob, name) {
      return new File([blob], name, { type: blob.type }) // 参数是数组!
    },
    _getData () {
      let filesData = this.$refs.emptyOperation.filesData
      let data = new FormData()
      data.append('job', this.$route.query.jobId)
      for (let i = 0; i < filesData.length; i++) {
        let file = this._blobToFile(filesData[i].file, filesData[i].name)
        data.append('file', file)
      }
      return data
    },
    saveJob () {
      // 使用 & 保证都运行
      if (this._jobFlowRules() & this._jobMsgRules()) {
        let info = this.$refs.jobDetail.jobInfo
        let jobFlow = this.myDiagram.model.toJson()
        Promise.all([this._createNewTag('test_area')]).then(() => { // this._createNewTag('custom_tag') API暂时不能用
          // console.log(this.$refs.jobDetail.jobInfo.test_area)
          let id = this.$route.query.jobId
          info.ui_json_file = JSON.parse(jobFlow)
          if (!id) { // 新建job
            info.job_label = this._createJobLabel(jobFlow)
            jobFlowAndMsgSave(info).then(res => {
            // 保存成功后跳转回jobList页面
              if (res.status === 200) {
                this.isCertain = true
                this.$router.push({ path: '/jobList' })
                this.$Message.info('操作完成')
              } else {
                console.log(res)
              }
            }).catch(res => {
              debugger
            })
          } else { // 更新job
            let data = this._getData() // 准备要上传的依赖文件

            jobFlowAndMsgUpdate(id, info).then(res => { // 保存job
              if (res.status === 200) {
                this.$Message.info('Job 保存成功')

                jobResFilesSave(data).then(res => { // 上传依赖文件
                  if (res.status === 201) {
                    this.isCertain = true
                    this.$Message.info('Job 依赖文件保存成功')
                    console.log('更新成功')
                    this.$router.push({ path: '/jobList' })
                  } else {
                    console.log(res)
                  }
                })
              } else {
                console.log(res)
              }
            })
          }
        })
      }
    },
    saveUnit () {
      let currentUnitNode = this.blockDiagram.findNodeForKey(this.unitNodeByKey).data
      if (!this.unitContent) this.$Message.error('unit信息不能为空！')
      else if (!isJsonString(this.unitContent)) this.$Message.error('不是json')
      else {
        this.blockDiagram.model.setDataProperty(currentUnitNode, 'unitMsg', JSON.parse(this.unitContent))
        this.blockDiagram.model.setDataProperty(currentUnitNode, 'text', this.unitName)
        this.unitModalShow = false
      }
    },
    getSelectedUnit (name) {
      let unitCategoryData = {}
      unitCategoryData.nodeDataArray = []
      this.unitType = name
      if (name !== 'Basic Module') {
        Object.entries(this.unitAllList[name]).forEach((unit) => {
          unitCategoryData.nodeDataArray.push({
            category: 'Unit',
            text: unit[0],
            unitMsg: unit[1]
          })
        })
        this.blockPalette.model = new go.GraphLinksModel(unitCategoryData.nodeDataArray)
      } else {
        this.blockPalette.model = new go.GraphLinksModel(this.basicModuleShow.value.nodeDataArray, this.basicModuleShow.value.linkDataArray)
      }
    },
    _getResFile (id) {
      if (!id) return
      axios.request({
        url: `api/v1/cedar/job/${id}/?fields=job_res_file,job_res_file.name,job_res_file.file,job_res_file.type`
      }).then(res => {
        this.$refs.emptyOperation.filesData = res.data.job_res_file
        this.$refs.emptyOperation.filesData.forEach(item => {
          item.fileUrl = item.file
          item.file = null
        })

        for (let i = 0; i < this.$refs.emptyOperation.filesData.length; i++) {
          axios.request({
            url: `${baseURL}/${this.$refs.emptyOperation.filesData[i].fileUrl}`,
            responseType: 'blob'
          }).then(res => {
            this.$refs.emptyOperation.filesData[i].file = res.data
          })
        }
      })
    },
    keydownHandler () {
      let insertStr = '  '
      if (event.keyCode === 9) {
        event.preventDefault()
        insertAfterCursor(event.target, insertStr)
      }
    }
  }
}
</script>
<style lang="less" scoped>
  .jobName {
    font-size: 18px;
    padding: 5px 20px
  }

  .jobName Button{
    float: right;
    margin-bottom: 5px;
  }

  #chart-wrap {
    width: 100%;
    display: flex;
    height: 83vh;
    justify-content: space-between;
    margin-bottom: 22px;

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
      height: 78vh;
      justify-content: space-between;
      margin-bottom: 22px;

      #chart-left{
        width: 15%;
        margin-right: 30px;
        background-color: white;
        border: solid 1px rgb(244, 244, 244);

        #dropdown-div{
          width: 100%;
          height: 10%;

          #dropdown-btn{
            width: 100%;
            margin-top: 10px;
            letter-spacing: 2px;
            font-size: 14px;
          }
        }
        #inner-palette {
          width: 100%;
          height: 90%;
          background-color: white;
        }
      }
      #inner-diagram{
        flex-grow: 1;
        background-color: white;
        border: solid 1px rgb(244, 244, 244);
      }
    }

    .unitView{
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

      .unitOperation{
        width: 80%;
        flex-grow: 1;
        background-color: white;
        border: solid 1px rgb(244, 244, 244);
      }
    }
</style>
