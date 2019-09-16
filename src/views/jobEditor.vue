<template>
  <div id="wrap">
    <Drawer title="用例详细信息" :closable="false" v-model="showDrawer" width="50">
      <job-msg-component ref="jobDetail" :prop-confirm-btn="false" :prop-enter-btn="false"></job-msg-component>
    </Drawer>
    <div class="jobName">
      jobName: {{jobName}}
      <Button size="large" style="float: right" to="/jobList">取消</Button>
      <Button type="primary" size="large" @click="saveJob" style="margin-right: 10px">确定</Button>
      <Button type="info" size="large" @click="showDrawer=true" style="margin-right: 10px">详情</Button>
      <i-switch size="large" v-show="switchButtonShow" v-model="switchButton">
        <span slot="open">另存</span>
        <span slot="close">更新</span>
      </i-switch>
    </div>

      <div id="chart-wrap">
        <div id="chart-palette"></div>
        <div id="chart-diagram"></div>
      </div>

    <Modal v-model="blockModalShow" fullscreen>
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
              <Button id="dropdown-btn" type="primary" @click="getAllJobUnit">{{unitType}}</Button><!--:model="unitType"-->
              <DropdownMenu slot="list" style="width: 150px">
                <DropdownItem v-for="currentUnit in unitAllList" :name="currentUnit.key" :key="currentUnit.key">{{currentUnit.key}}</DropdownItem>
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
      width="95"
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
      <div class="unitView">
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
import { getBlockFlowDict4Font, getTemporarySpace, jobFlowAndMsgSave, getJobUnitsBodyDict } from '../api/coral/jobLibSvc'
import SwitchBlockDetailComponent from '../components/SwitchBlockDetailComponent'
import { isJsonString } from '../lib/tools'
export default {
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
      unitAllList: [],
      basicModuleShow: {},
      switchButtonShow: false,
      switchButton: false,
      showDrawer: false
    }
  },
  mounted () {
    const self = this

    myDiagramInit()
    function myDiagramInit () {
      self.myDiagram = MAKE(go.Diagram, 'chart-diagram', {
        initialContentAlignment: go.Spot.Center,
        allowDrop: true,
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

      const switchBlockTemplate = baseNodeTemplateForPort(MAKE(go.Brush, go.Brush.Linear, { 0.0: 'yellow', 1.0: 'black' }), 'Diamond')
      switchBlockTemplate.doubleClick = function (e, node) {
        if (e.diagram instanceof go.Palette) return

        self.switchBlockInfo = {
          switchBlockName: node.data.text,
          fileName: node.data.fileName,
          explain: node.data.explain
        }
        self.currentSwitchBlockKey = node.data.key

        self.switchBlockModalShow = true
      }

      const normalBlockTemplate = baseNodeTemplateForPort(MAKE(go.Brush, go.Brush.Linear, { 0.0: 'blue', 1.0: 'red' }), 'RoundedRectangle')

      normalBlockTemplate.doubleClick = function (e, node) {
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
      self.myDiagram.nodeTemplateMap.add('Start', startNodeTemplate('#0c0bc9'))
      self.myDiagram.nodeTemplateMap.add('End', endNodeTemplate('#DC3C00'))

      self.myDiagram.toolManager.linkingTool.linkValidation = myDiagramValidation
      self.myDiagram.toolManager.relinkingTool.linkValidation = myDiagramValidation
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
        let flag = false
        e.subject.each(function (n) {
          // 得到从Palette拖过来的节点 判断节点如果没有group则删除节点
          if (n.data.category === 'Unit') {
            if (!n.data.group) { // 判断Unit是否被UnitList包含
              flag = true
            }
          }
        })

        if (flag) {
          self.blockDiagram.commandHandler.deleteSelection()// 删除该选中节点
          self.$Message.error('Unit只能被包裹在UnitList中') // 错误提示
        }
      })

      self.blockDiagram.linkTemplate = linkTemplateStyle()

      const unitTemplate = baseNodeTemplate('#c934c9', 'RoundedRectangle')
      unitTemplate.doubleClick = function (e, node) {
        if (e.diagram instanceof go.Palette) return

        self.$refs.emptyOperation.emptyData()
        self.unitModalShow = true
        self.unitNodeByKey = node.data.key
        self.unitName = node.data.text
        self.unitContent = JSON.stringify(node.data.unitMsg, null, 2)
      }

      const unitListGroupTemplate = baseGroupTemplate()
      unitListGroupTemplate.memberValidation = function groupValidation (group, node) {
        if (node instanceof go.Group) return false// 不能将UnitList添加到UnitList中
        return node.data.category === 'Unit'// 当节点的category值为Unit时
      }

      self.blockDiagram.nodeTemplateMap.add('Unit', unitTemplate)
      self.blockDiagram.nodeTemplateMap.add('Start', startNodeTemplate('#0c0bc9'))
      self.blockDiagram.nodeTemplateMap.add('End', endNodeTemplate('#DC3C00'))
      self.blockDiagram.groupTemplateMap.add('UnitList', unitListGroupTemplate)

      self.blockDiagram.toolManager.linkingTool.linkValidation = blockDiagramValidation
      self.blockDiagram.toolManager.relinkingTool.linkValidation = blockDiagramValidation
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

    function myDiagramValidation (fromnode, fromport, tonode, toport) {
      if (fromnode.data.category === 'Start') {
        // 1、Start只有一条指向链接
        if (maxLinkFrom(fromnode)) {
          return false
        }
        // 2、Start只能指向Normal block
        if (tonode.data.category !== 'normalBlock') {
          return false
        }
      } else if (fromnode.data.category === 'normalBlock') {
        // 2、Normal block只有一条指向链接
        if (maxLinkFrom(fromnode)) {
          return false
        }
      } else if (fromnode.data.category === 'switchBlock') {
        // 1、switchBlock是否重复指向同一模组
        let flag = true
        fromnode.findNodesOutOf().each(function (node) { // node为遍历的被指向节点
          if (tonode.data.key === node.data.key) {
            flag = false
          }
        })
        return flag
      }
      return true
    }

    function blockDiagramValidation (fromnode, fromport, tonode, toport) {
      if (fromnode.data.category === 'Start') { // Entry
        // 1、Entry只有一条指向链接
        if (maxLinkFrom(fromnode)) {
          return false
        }
        // 2、Entry不能直接指向Exit
        if (tonode.data.category !== 'UnitList') {
          return false
        }
      } else if (tonode.data.category === 'End') { // Exit
        // 1、只有一条被指向链接
        if (maxLinkTo(tonode)) {
          return false
        }
      } else if (fromnode.data.category === 'UnitList') { // UnitList
        // 2、只有一条指向链接
        if (maxLinkFrom(fromnode)) {
          return false
        }
        // 3、只有一条被指向链接
        if (tonode.data.category === 'UnitList') {
          let num = tonode.findLinksInto()
          if (num.count > 0) {
            return false
          }
        }
      }
      return true
    }
    // 连接的时候保证指向链接的最大连接数,默认最多只有一条
    function maxLinkFrom (node, num = 0) {
      return node.findNodesOutOf().count > num
    }

    // 连接的时候保证被指向链接的最大连接数,默认最多只有一条
    function maxLinkTo (node, num = 0) {
      return node.findNodesInto().count > num
    }
    this.init()
  },
  methods: {
    init () {
      this.myPalette = MAKE(
        go.Palette, 'chart-palette', {
          scrollsPageOnFocus: false,
          nodeTemplateMap: this.myDiagram.nodeTemplateMap,
          layout: MAKE(go.GridLayout, { wrappingColumn: 1, alignment: go.GridLayout.Position })
        }
      )

      this.myPalette.model = new go.GraphLinksModel([
        { category: 'Start', text: 'Start' },
        { category: 'switchBlock', text: 'Switch block' },
        { category: 'normalBlock', text: 'Normal block' },
        { category: 'End', text: 'End' }
      ])

      if (this.$route.query.jobLabel) {
        getBlockFlowDict4Font(this.$route.query.jobLabel).then(res => {
          if (res.data.error) {
            this.$Message.warning('这个job不存在')
            return this.$router.push({ path: '/' })
          }
          this.stageJobLabel = res.data.stageJobLabel
          this.jobName = res.data.jobAttribute.job_name
          this.$refs.jobDetail.getMsg(res.data.jobAttribute.id)
          this.myDiagram.model = go.Model.fromJson(res.data.jobBody)
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
      let currentNormalBlockData = this.myDiagram.findNodeForKey(this.getCurrentNormalBlockByKey).data // 获取当前unit的data
      let blockDiagramHint = new Set()
      let blockDiagramData = JSON.parse(this.blockDiagram.model.toJson())
      if (blockDiagramData.linkDataArray.length === 0) {
        blockDiagramHint.add('缺少链接关系')
      }

      if (blockDiagramData.nodeDataArray.length === 0) {
        blockDiagramHint.add('还未对流程图进行编辑！')
      } else {
        let entryAll = this.blockDiagram.findNodesByExample({ 'category': 'Start' })
        let exitAll = this.blockDiagram.findNodesByExample({ 'category': 'End' })
        let unitListAll = this.blockDiagram.findNodesByExample({ 'category': 'UnitList' })
        let unitAll = this.blockDiagram.findNodesByExample({ 'category': 'Unit' })

        // Entry
        if (entryAll.count !== 1) {
          blockDiagramHint.add('有且只有一个Entry')
        } else {
          entryAll.iterator.each(function (node) {
            let entryLinksOutOf = node.findLinksOutOf()
            if (entryLinksOutOf.count < 1) {
              blockDiagramHint.add('Entry缺少指向链接')
            }
          })
        }
        // Exit
        if (exitAll.count !== 1) {
          blockDiagramHint.add('有且只有一个Exit')
        } else {
          exitAll.iterator.each(function (node) {
            let exitLinksInto = node.findLinksInto()
            if (exitLinksInto.count !== 1) {
              blockDiagramHint.add('Exit缺少被指向链接')
            }
          })
        }
        // UnitList
        if (unitListAll.count < 1) {
          blockDiagramHint.add('缺少UnitList')
        } else {
          unitListAll.iterator.each(function (node) {
            let unitListLinksInto = node.findLinksInto()
            let unitListLinksOutOf = node.findLinksOutOf()
            if (unitListLinksInto.count !== 1) {
              blockDiagramHint.add('UnitList有且只有一条被指向链接')
            }
            if (unitListLinksOutOf.count !== 1) {
              blockDiagramHint.add('UnitList有且只有一条指向链接')
            }
          })
          for (let i = 0; i < blockDiagramData.nodeDataArray.length; i++) {
            if (blockDiagramData.nodeDataArray[i].category === 'UnitList') {
              let groupNum = 0
              for (let j = 0; j < blockDiagramData.nodeDataArray.length; j++) {
                if (blockDiagramData.nodeDataArray[j].group === blockDiagramData.nodeDataArray[i].key && blockDiagramData.nodeDataArray[j].category === 'Unit') {
                  groupNum++
                }
              }
              if (groupNum === 0) {
                blockDiagramHint.add('UnitList中至少包含一个Unit')
              }
            }
          }
        }
        // Unit
        if (unitAll.count === 0) {
          blockDiagramHint.add('缺少Unit')
        } else {
          unitAll.iterator.each(function (node) {
            if (!node.data.unitMsg) {
              blockDiagramHint.add('Unit信息没有编辑')
            }
          })
        }
      }

      this.$Message.destroy()

      if (blockDiagramHint.size !== 0) {
        this.blockModalShow = true
        let errorNum = 1
        let errorMessage = ''
        blockDiagramHint.forEach(function (element) {
          errorMessage += errorNum + '.' + element + '<br/>'
          errorNum++
        })
        // message提示
        this.$Message.info({
          content: errorMessage, // 提示内容
          duration: 0,
          closable: false
        })
      } else {
        this.blockModalShow = false
        this.myDiagram.model.setDataProperty(currentNormalBlockData, 'unitLists', blockDiagramData)
        this.myDiagram.model.setDataProperty(currentNormalBlockData, 'text', this.blockName)
      }
    },
    _jobFlowRules () {
      const self = this
      // 事件校验提示
      let myDiagramEventValidationHint = new Set()// 错误提示 set类型去重
      if (self.myDiagram.links.count === 0) {
        myDiagramEventValidationHint.add('缺少链接关系')
      }
      if (self.myDiagram.nodes.count === 0) {
        myDiagramEventValidationHint.add('还未对流程图进行编辑！')
      } else {
        let startAll = this.myDiagram.findNodesByExample({ 'category': 'Start' })
        let endAll = this.myDiagram.findNodesByExample({ 'category': 'End' })
        let switchBlockAll = this.myDiagram.findNodesByExample({ 'category': 'switchBlock' })
        let normalBlockAll = this.myDiagram.findNodesByExample({ 'category': 'normalBlock' })

        if (startAll.count !== 1) {
          myDiagramEventValidationHint.add('有且只有一个Start')
        } else {
          startAll.iterator.each(function (node) {
            let startLinksOutOf = node.findLinksOutOf()
            if (startLinksOutOf.count !== 1) {
              myDiagramEventValidationHint.add('Start缺少指向链接')
            }
          })
        }

        if (endAll.count <= 0) {
          myDiagramEventValidationHint.add('缺少End')
        } else {
          endAll.iterator.each(function (node) { // 遍历所有的end节点
            let endLinksInto = node.findLinksInto()
            if (endLinksInto.count <= 0) {
              myDiagramEventValidationHint.add('End至少有一条被指向链接')
            }
          })
        }

        if (switchBlockAll.count !== 0) {
          switchBlockAll.iterator.each(function (node) {
            let switchBlockLinksInto = node.findLinksInto()
            let switchBlockLinksOutOf = node.findLinksOutOf()
            if (switchBlockLinksInto.count < 1) {
              myDiagramEventValidationHint.add('Switch block至少有一条被指向链接')
            }
            if (switchBlockLinksOutOf.count < 2) {
              myDiagramEventValidationHint.add('Switch block至少有两条指向链接')
            }

            let elseNum = 0

            self.myDiagram.links.iterator.each(function (link) {
              let linkVal = link.data
              if (link.fromNode === node) {
                if (linkVal.visible && !linkVal.text) elseNum++
                else if (linkVal.visible && link.data.text.replace(/^\s+|\s+$/g, '') === 'else') elseNum++
              }
            })

            if (elseNum !== 1) myDiagramEventValidationHint.add('Switch block有且只有一条包含else的指向链接,其他链接需要写入相应token值')
          })
        }

        if (normalBlockAll.count === 0) {
          myDiagramEventValidationHint.add('缺少Normal block')
        } else {
          normalBlockAll.iterator.each(function (node) {
            let normalBlockLinksInto = node.findLinksInto()
            let normalBlockLinksOutOf = node.findLinksOutOf()
            if (normalBlockLinksInto.count < 1) {
              myDiagramEventValidationHint.add('Normal block至少有一条被指向链接')
            }
            if (normalBlockLinksOutOf.count !== 1) {
              myDiagramEventValidationHint.add('Normal block有且只有一条指向链接')
            }
            if (!node.data.unitLists) {
              myDiagramEventValidationHint.add('Normal block未编辑')
            }
          })
        }
      }

      this.$Message.destroy()

      // 错误提示
      if (myDiagramEventValidationHint.size !== 0) {
        let errorNum = 1
        let errorMessage = ''
        myDiagramEventValidationHint.forEach(function (element) {
          errorMessage += errorNum + '.' + element + '<br/>'
          errorNum++
        })

        // message提示
        this.$Message.info({
          content: errorMessage, // 提示内容
          duration: 0,
          closable: false
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
    saveJob () {
      // 使用 & 保证都运行
      if (this._jobFlowRules() & this._jobMsgRules()) {
        jobFlowAndMsgSave({
          stageJobLabel: this.stageJobLabel,
          // this.switchButton 为true 设置为另存为 jobLabel为null
          jobLabel: (this.switchButton) ? null : this.$route.query.jobLabel,
          flow: JSON.parse(this.myDiagram.model.toJson()),
          attribute: this.$refs.jobDetail.jobInfo,
          id: this.$refs.jobDetail.currentJobId
        }).then(res => { // 保存成功后跳转回jobList页面
          if (res.data.state) {
            this.$router.push({ path: '/jobList' })
            this.$Message.info('操作完成')
          } else {
            console.log(res.data)
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
    getAllJobUnit () { // unit动态展示
      let getAllUnitRequestParameter = {
        requestName: 'getJobUnitsBodyDict'
      }
      getJobUnitsBodyDict(getAllUnitRequestParameter).then(res => {
        this.unitAllList = [] // 清空
        for (let i in res.data) {
          let one = { key: i, value: res.data[i] }
          this.unitAllList.push(one)
        }
        this.unitAllList.push(this.basicModuleShow)
      })
    },
    getSelectedUnit (name) {
      let unitCategoryData = {}
      unitCategoryData.nodeDataArray = []
      this.unitType = name
      if (name !== 'basicModule') {
        for (let i = 0; i < this.unitAllList.length; i++) {
          if (name === this.unitAllList[i].key) {
            for (let j in this.unitAllList[i].value) {
              unitCategoryData.nodeDataArray.push({
                category: 'Unit',
                text: j,
                unitMsg: this.unitAllList[i].value[j]
              })
            }
          }
        }
        this.blockPalette.model = new go.GraphLinksModel(unitCategoryData.nodeDataArray)
      } else {
        this.blockPalette.model = new go.GraphLinksModel(this.basicModuleShow.value.nodeDataArray, this.basicModuleShow.value.linkDataArray)
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
