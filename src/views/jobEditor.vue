<template>
  <div id="wrap">
    <p class="jobName">jobName: {{jobName}}</p>

    <div id="chart-wrap">
      <div id="chart-palette"></div>
      <div id="chart-diagram"></div>
    </div>
    <Modal v-model="blockModalShow" fullscreen :title="blockName">
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
      :mask-closable="false">
      <div class="unitView">
        <div class="unitContent">
          <Input v-model="unitContent" type="textarea" :autosize="{minRows: 10,maxRows: 31}" placeholder="Enter something..." />
        </div>
        <div class="unitOperation">
          <job-operation-component :stage-job-label="stageJobLabel"></job-operation-component>
        </div>
      </div>
    </Modal>

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
export default {
  components: { JobOperationComponent },
  data () {
    return {
      jobName: 'zzz',
      blockModalShow: false,
      unitModalShow: false,
      jobOperationComponentShow: false,
      unitName: null,
      unitContent: null,
      blockName: '',
      stageJobLabel: null
    }
  },
  mounted () {
    const self = this

    myDiagramInit()
    if (this.$route.params.jobLabel) {
      getBlockFlowDict4Font(this.$route.params.jobLabel).then(res => {
        if (res.data.error) return this.$router.push({ path: '/' })
        this.stageJobLabel = res.data.stageJobLabel
        self.myDiagram.model = go.Model.fromJson(res.data.jobBody)
      })
    } else {
      getTemporarySpace().then(res => {
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
        let block = self.myDiagram.findNodeForKey(node.data.from).data

        if (block.category === 'normalBlock') {
          // vm.showDrawerOperation('linkOperation')
          // currentLinkObj = node
        }
      }

      const switchBlockTemplate = baseNodeTemplateForPort(MAKE(go.Brush, go.Brush.Linear, { 0.0: 'yellow', 1.0: 'black' }), 'Diamond')
      const normalBlockTemplate = baseNodeTemplateForPort(MAKE(go.Brush, go.Brush.Linear, { 0.0: 'blue', 1.0: 'red' }), 'RoundedRectangle')

      normalBlockTemplate.doubleClick = function (e, node) {
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
        self.unitModalShow = true
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

    blockChartInit () {
    //
    }/*,
    saveBlock () { // block点击确定进行校验
      const self = this
      var blockDiagramData = JSON.parse(self.blockDiagram.model.toJson())
      if (blockDiagramData.linkDataArray.length === 0) {
        console.log('缺少链接关系')
      }

      if(blockDiagramData.nodeDataArray.length ===0){
        console.log("还未对流程图进行编辑！");
      }else{
        var entryAll = self.blockDiagram.findNodesByExample({'category': "Start"})
        var exitAll = self.blockDiagram.findNodesByExample({"category":"End"})
        var unitListAll = self.blockDiagram.findNodesByExample({"category":"UnitList"})
        var unitAll = self.blockDiagram.findNodesByExample({"category":"Unit"})

        //Entry
        if(entryAll.count !== 1){
          console.log("有且只有一个Entry")
        }else{
          entryAll.iterator.each(function (node) {
            var entryLinksOutOf = node.findLinksOutOf();
            if(entryLinksOutOf.count <1){
              console.log("Entry缺少指向链接");
            }
          })
        }
        //Exit
        if(exitAll.count !==1){
          blockDiagramHint.add("有且只有一个Exit");
        }else{
          exitAll.iterator.each(function (node) {
            var exitLinksInto = node.findLinksInto();
            if(exitLinksInto.count !== 1){
              blockDiagramHint.add("Exit缺少被指向链接");
            }
          })
        }
        //UnitList
        if(unitListAll.count <1){
          blockDiagramHint.add("缺少UnitList");
        }else{
          unitListAll.iterator.each(function (node) {
            var unitListLinksInto = node.findLinksInto();
            var unitListLinksOutOf = node.findLinksOutOf();
            if(unitListLinksInto.count !== 1){
              blockDiagramHint.add("UnitList有且只有一条被指向链接");
            }
            if(unitListLinksOutOf.count !==1){
              blockDiagramHint.add("UnitList有且只有一条指向链接");
            }
          })
          for (var i = 0; i <blockDiagramData.nodeDataArray.length ; i++) {
            if(blockDiagramData.nodeDataArray[i].category === "UnitList"){
              var groupNum = 0;
              for (var j = 0; j <blockDiagramData.nodeDataArray.length ; j++) {
                if(blockDiagramData.nodeDataArray[j].group === blockDiagramData.nodeDataArray[i].key && blockDiagramData.nodeDataArray[j].category==="Unit"){
                  groupNum++;
                }
              }
              if(groupNum === 0){
                blockDiagramHint.add("UnitList中至少包含一个Unit");
              }
            }
          }
        }
        //Unit
        if(unitAll.count ===0){
          blockDiagramHint.add("缺少Unit");
        }else{
          unitAll.iterator.each(function (node) {
            if(!node.data.unitMsg){
              blockDiagramHint.add("Unit信息没有编辑");
            }
          })
        }
      }
      if(blockDiagramHint.size !== 0 || $('#NormalBlockNameCheck').is(':visible')){
        $(".errInfo").show();
        $(".errInfo p").remove();

        var errorNum = 1;
        blockDiagramHint.forEach(function (element) {
          $(".errInfo").append("<p>" + errorNum + "." + element +"</p>");
          errorNum++;
        });
      }
    } */
  }
}
</script>
<style lang="less" scoped>
    .jobName {
    font-size: 18px;
    padding: 5px 20px
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
