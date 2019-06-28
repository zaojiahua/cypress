<template>
  <div id="wrap">
    <p class="jobName">jobName: {{jobName}}
      <Button size="large" style="width: 200px">取消</Button>
      <Button type="primary" size="large" @click="saveBlock" style="margin-right: 10px; width: 200px">确定</Button>
    </p>

      <div id="chart-wrap">
        <div id="chart-palette"></div>
        <div id="chart-diagram"></div>
      </div>

    <Modal v-model="blockModalShow" fullscreen :title="blockName">
      <div slot="footer">
        <Button type="text" size="large" @click="blockModalShow=false">取消</Button>
        <Button type="primary" size="large" @click="saveNormalBlock">确定</Button>
      </div>
      <div id="inner-wrap">
        <div id="inner-palette"></div>
        <div id="inner-diagram"></div>
      </div>
    </Modal>
    <Modal
      :title="unitName"
      v-model="unitModalShow"
      width="95"
      :styles="{top: '20px'}"
      :mask-closable="false"
      :closable="false">
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
          <job-operation-component :stage-job-label="stageJobLabel"  @getImageName="getImageNames" @getFileName="getFileNames"></job-operation-component>
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
import JobOperationComponent from '../components/jobOperationComponent'
import { getBlockFlowDict4Font, getTemporarySpace } from '../api/coral/jobLibSvc'
import SwitchBlockDetailComponent from '../components/SwitchBlockDetailComponent'
export default {
  components: { SwitchBlockDetailComponent, JobOperationComponent },
  data () {
    return {
      jobName: 'zzz',
      blockModalShow: false,
      unitModalShow: false,
      jobOperationComponentShow: false,
      switchBlockModalShow: false,
      currentSwitchBlockKey: null,
      unitName: null,
      unitContent: null,
      blockName: '',
      stageJobLabel: null,
      errorMessage: '',
      unitNodeByKey: null,
      switchBlockInfo: {}

    }
  },
  mounted () {
    const self = this

    console.log(process.env.NODE_ENV)

    myDiagramInit()
    if (this.$route.query.jobLabel) {
      getBlockFlowDict4Font(this.$route.query.jobLabel).then(res => {
        if (res.data.error) return this.$router.push({ path: '/' })
        this.stageJobLabel = res.data.stageJobLabel
        self.myDiagram.model = go.Model.fromJson(res.data.jobBody)
      })
    } else {
      getTemporarySpace().then(res => {
        console.log(res)
        this.stageJobLabel = res.data.stageJobLabel
        self.myDiagram.model = basicModel()
      })
    }

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
        console.log(self.currentSwitchBlockKey)

        self.switchBlockModalShow = true
      }

      const normalBlockTemplate = baseNodeTemplateForPort(MAKE(go.Brush, go.Brush.Linear, { 0.0: 'blue', 1.0: 'red' }), 'RoundedRectangle')

      normalBlockTemplate.doubleClick = function (e, node) {
        if (e.diagram instanceof go.Palette) return
        self.blockName = node.data.text
        self.blockModalShow = true
        if (!self.blockDiagram) blockDiagramInit()
        if (!self.blockPalette) blockPaletteInit()
        self.blockDiagram.model = go.Model.fromJson({
          'class': 'go.GraphLinksModel',
          'linkFromPortIdProperty': 'fromPort',
          'linkToPortIdProperty': 'toPort',
          'nodeDataArray': [
            {
              category: 'Unit',
              text: 'Unit',
              loc: '1359.6937815372394 884.1991480533534',
              unitMsg: {
                'execCmdDict': {
                  'bkupCmdList': [],
                  'execCmdList': [
                    '<3adbcTool> shell input keyevent 4',
                    '<3adbcTool> shell input keyevent 4',
                    '<3adbcTool> shell input keyevent 4',
                    '<3adbcTool> shell input keyevent 4',
                    '<3adbcTool> shell input keyevent 4',
                    '<3adbcTool> shell input keyevent 3',
                    '<3adbcTool> shell input keyevent 3',
                    '<3adbcTool> shell input keyevent 3'
                  ],
                  'exptResList': []
                },
                'execModName': 'ADBC',
                'jobUnitName': '2JunitBackToHome'
              }
            }
          ],
          'linkDataArray': []
        })
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
          // self.blockDiagramHint.add('Unit只能被包裹在UnitList中')
          // console.log('Unit只能被包裹在UnitList中！')
        }
      })

      self.blockDiagram.linkTemplate = linkTemplateStyle()

      const unitTemplate = baseNodeTemplate('#c934c9', 'RoundedRectangle')
      unitTemplate.doubleClick = function (e, node) {
        if (e.diagram instanceof go.Palette) return
        self.unitModalShow = true
        self.unitNodeByKey = node.data.key
        self.unitName = node.data.text
        self.unitContent = JSON.stringify(node.data.unitMsg, null, 2)
        console.log(self.jobName)
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
      console.log('loadding')
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
      self.blockPalette.model = new go.GraphLinksModel(basicModule.nodeDataArray, basicModule.linkDataArray)
    }

    function myDiagramValidation (fromnode, fromport, tonode, toport) {
      if (fromnode.data.category === 'Start') {
        // 1、Start只有一条指向链接
        if (!maxLinkFrom(fromnode)) {
          return false
        }
        // 2、Start只能指向Normal block
        if (tonode.data.category !== 'normalBlock') {
          return false
        }
      } else if (fromnode.data.category === 'normalBlock') {
        // 2、Normal block只有一条指向链接
        if (!maxLinkFrom(fromnode)) {
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
        if (!maxLinkFrom(fromnode)) {
          return false
        }
        // 2、Entry不能直接指向Exit
        if (tonode.data.category !== 'UnitList') {
          return false
        }
      } else if (tonode.data.category === 'End') { // Exit
        // 1、只有一条被指向链接
        if (!maxLinkTo(tonode)) {
          return false
        }
      } else if (fromnode.data.category === 'UnitList') { // UnitList
        // 2、只有一条指向链接
        if (!maxLinkFrom(fromnode)) {
          return false
        }
        // 3、只有一条被指向链接
        if (tonode.data.category === 'UnitList') {
          var num = tonode.findLinksInto()
          if (num.count > 0) {
            return false
          }
        }
      }
      return true
    }

    function maxLinkFrom (node) {
      return !(node.findNodesOutOf().count > 0)
    }

    // 节点只有一条被指向链接
    function maxLinkTo (node) {
      return !(node.findNodesInto().count > 0)
    }
    this.init()
  },
  methods: {
    init () {
      const self = this
      self.myPalette = MAKE(
        go.Palette, 'chart-palette', {
          scrollsPageOnFocus: false,
          nodeTemplateMap: self.myDiagram.nodeTemplateMap,
          layout: MAKE(go.GridLayout, { wrappingColumn: 1, alignment: go.GridLayout.Position })
        }
      )

      self.myPalette.model = new go.GraphLinksModel([
        { category: 'Start', text: 'Start' },
        { category: 'switchBlock', text: 'Switch block' },
        { category: 'normalBlock', text: 'Normal block' },
        { category: 'End', text: 'End' }
      ])
    },
    getImageNames (res) { // add imageName
      const self = this
      if (res !== '') {
        if (!self.unitContent) {
          self.unitContent = {}
        }
        if (!self.unitContent.execCmdDict) {
          self.unitContent.execCmdDict = {}
        }
        self.unitContent.execCmdDict.referImgFile = '<1ijobFile>' + res // 图片展示成功左侧json自动添加图片信息
        self.unitContent = JSON.stringify(self.unitContent, null, 2)
      }
    },
    getFileNames (res) { // add fileName
      const self = this
      if (res !== '') {
        if (!self.unitContent) {
          self.unitContent = {}
        }
        let unitContentData = JSON.parse(self.unitContent)
        unitContentData.execCmdDict.configFile = '<1ijobFile>' + res
        self.unitContent = JSON.stringify(unitContentData, null, 2)
      }
    },

    switchBlockSave (msg) {
      let node = this.myDiagram.model.findNodeDataForKey(this.currentSwitchBlockKey)
      this.myDiagram.model.setDataProperty(node, 'text', msg.switchBlockName)
      this.myDiagram.model.setDataProperty(node, 'fileName', msg.fileName)
      this.myDiagram.model.setDataProperty(node, 'explain', msg.explain)
    },

    blockChartInit () {
    //
    },
    saveNormalBlock () { // normalBlock点击确定进行校验
      const self = this
      var blockDiagramHint = new Set()
      var blockDiagramData = JSON.parse(self.blockDiagram.model.toJson())
      if (blockDiagramData.linkDataArray.length === 0) {
        blockDiagramHint.add('缺少链接关系')
      }

      if (blockDiagramData.nodeDataArray.length === 0) {
        blockDiagramHint.add('还未对流程图进行编辑！')
      } else {
        var entryAll = self.blockDiagram.findNodesByExample({ 'category': 'Start' })
        var exitAll = self.blockDiagram.findNodesByExample({ 'category': 'End' })
        var unitListAll = self.blockDiagram.findNodesByExample({ 'category': 'UnitList' })
        var unitAll = self.blockDiagram.findNodesByExample({ 'category': 'Unit' })

        // Entry
        if (entryAll.count !== 1) {
          blockDiagramHint.add('有且只有一个Entry')
        } else {
          entryAll.iterator.each(function (node) {
            var entryLinksOutOf = node.findLinksOutOf()
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
            var exitLinksInto = node.findLinksInto()
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
            var unitListLinksInto = node.findLinksInto()
            var unitListLinksOutOf = node.findLinksOutOf()
            if (unitListLinksInto.count !== 1) {
              blockDiagramHint.add('UnitList有且只有一条被指向链接')
            }
            if (unitListLinksOutOf.count !== 1) {
              blockDiagramHint.add('UnitList有且只有一条指向链接')
            }
          })
          for (var i = 0; i < blockDiagramData.nodeDataArray.length; i++) {
            if (blockDiagramData.nodeDataArray[i].category === 'UnitList') {
              var groupNum = 0
              for (var j = 0; j < blockDiagramData.nodeDataArray.length; j++) {
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
        self.blockModalShow = true
        var errorNum = 1
        self.errorMessage = ''
        blockDiagramHint.forEach(function (element) {
          self.errorMessage = self.errorMessage + errorNum + '.' + element + '<br/>'
          errorNum++
        })
        // message提示
        this.$Message.info({
          content: self.errorMessage, // 提示内容
          duration: 0,
          closable: false
        })
      } else {
        self.blockModalShow = false
        var myDiagramDataInBlock = JSON.parse(self.myDiagram.model.toJson())
        myDiagramDataInBlock.nodeDataArray.unitLists = blockDiagramData

        /* console.log('normal block编辑完成')
        console.log(myDiagramDataInBlock) */
      }
    },
    saveBlock () {
      // 事件校验提示
      const self = this
      var myDiagramEventValidationHint = new Set()// 错误提示 set类型去重
      var myDiagramData = JSON.parse(self.myDiagram.model.toJson())// 获取数据 将json字符串转换成json对象
      if (myDiagramData.linkDataArray.length === 0) {
        myDiagramEventValidationHint.add('缺少链接关系')
      }
      if (myDiagramData.nodeDataArray.length === 0) {
        myDiagramEventValidationHint.add('还未对流程图进行编辑！')
      } else {
        var startAll = self.myDiagram.findNodesByExample({ 'category': 'Start' })
        var endAll = self.myDiagram.findNodesByExample({ 'category': 'End' })
        var switchBlockAll = self.myDiagram.findNodesByExample({ 'category': 'switchBlock' })
        var normalBlockAll = self.myDiagram.findNodesByExample({ 'category': 'normalBlock' })

        if (startAll.count !== 1) {
          myDiagramEventValidationHint.add('有且只有一个Start')
        } else {
          startAll.iterator.each(function (node) {
            var startLinksOutOf = node.findLinksOutOf()
            if (startLinksOutOf.count <= 0) {
              myDiagramEventValidationHint.add('Start缺少指向链接')
            }
          })
        }

        if (endAll.count <= 0) {
          myDiagramEventValidationHint.add('缺少End')
        } else {
          endAll.iterator.each(function (node) { // 遍历所有的end节点
            var endLinksInto = node.findLinksInto()
            if (endLinksInto.count <= 0) {
              myDiagramEventValidationHint.add('End至少有一条被指向链接')
            }
          })
        }

        if (switchBlockAll.count !== 0) {
          switchBlockAll.iterator.each(function (node) {
            var switchBlockLinksInto = node.findLinksInto()
            var switchBlockLinksOutOf = node.findLinksOutOf()
            if (switchBlockLinksInto.count < 1) {
              myDiagramEventValidationHint.add('Switch block至少有一条被指向链接')
            }
            if (switchBlockLinksOutOf.count < 2) {
              myDiagramEventValidationHint.add('Switch block至少有两条指向链接')
            }
          })
          var elseNum = 0
          for (var i = 0; i < myDiagramData.nodeDataArray.length; i++) {
            if (myDiagramData.nodeDataArray[i].category === 'switchBlock') {
              for (var j = 0; j < myDiagramData.linkDataArray.length; j++) {
                if (myDiagramData.linkDataArray[j].from === myDiagramData.nodeDataArray[i].key) {
                  if (!myDiagramData.linkDataArray[j].text) {
                    elseNum++
                  } else if (myDiagramData.linkDataArray[j].text.replace(/^\s+|\s+$/g, '') === 'else') {
                    elseNum++
                  }
                }
              }
              if (elseNum !== 1) {
                myDiagramEventValidationHint.add('Switch block有且只有一条包含else的指向链接,其他链接需要写入相应token值')
              }
            }
          }
        }

        if (normalBlockAll.count === 0) {
          myDiagramEventValidationHint.add('缺少Normal block')
        } else {
          normalBlockAll.iterator.each(function (node) {
            var normalBlockLinksInto = node.findLinksInto()
            var normalBlockLinksOutOf = node.findLinksOutOf()
            if (normalBlockLinksInto.count < 1) {
              myDiagramEventValidationHint.add('Normal block至少有一条被指向链接')
            }
            if (normalBlockLinksOutOf.count < 1) {
              myDiagramEventValidationHint.add('Normal block缺少指向链接')
            }
            if (!node.unitLists) {
              myDiagramEventValidationHint.add('Normal block未编辑')
            }
          })
        }
      }

      this.$Message.destroy()

      // 错误提示
      if (myDiagramEventValidationHint.size !== 0) {
        var errorNum = 1
        self.errorMessage = ''
        myDiagramEventValidationHint.forEach(function (element) {
          self.errorMessage = self.errorMessage + errorNum + '.' + element + '<br/>'
          errorNum++
        })

        // message提示
        this.$Message.info({
          content: self.errorMessage, // 提示内容
          duration: 0,
          closable: false
        })
      } else {
        this.$router.push({ path: '/jobShow' })
        // 保存数据 并调用success的api
      }
    },
    saveUnit () { // unit保存数据
      // debugger
      const self = this
      let currentUnitData = self.blockDiagram.findNodeForKey(self.unitNodeByKey).data // 获取当前unit的data
      if (!self.unitContent) {
        this.$Message.error('unit信息不能为空！')
      } else if (!isJson(self.unitContent)) {
        this.$Message.error('不是json')
      } else {
        currentUnitData.unitMsg = self.unitContent
        console.log(currentUnitData)
        self.unitModalShow = false
      }

      function isJson (str) {
        if (typeof str === 'string') {
          try {
            var obj = JSON.parse(str)
            if (typeof obj === 'object') {
              return true
            } else {
              return false
            }
          } catch (e) {
            return false
          }
        }
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

    #inner-wrap{
      width: 100%;
      display: flex;
      height: 78vh;
      justify-content: space-between;
      margin-bottom: 22px;

      #inner-palette {
        width: 20%;
        margin-right: 30px;
        background-color: white;
        border: solid 1px rgb(244, 244, 244);
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
