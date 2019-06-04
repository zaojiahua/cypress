<template>
  <div id="wrap">
    <p class="jobName">jobName: {{jobName}}</p>

    <div id="chart-wrap">
      <div id="chart-palette"></div>
      <div id="chart-diagram"></div>
    </div>
    <Modal v-model="modalShow" fullscreen :title="blockName">
      <div id="inner-wrap">
        <div id="inner-palette"></div>
        <div id="inner-diagram"></div>
      </div>
    </Modal>
    <job-operation-component :show-modal="jobOperationComponentShow" :unit-name="unitName" :stage-job-label="stageJobLabel" :unit-content="unitContent"></job-operation-component>
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
      modalShow: false,
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
        self.modalShow = true
        if (!self.BlockDiagram) blockDiagramInit()
        if (!self.blockPalette) blockPaletteInit()
        self.BlockDiagram.model = go.Model.fromJson({
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
    }

    function blockDiagramInit () {
      self.BlockDiagram = MAKE(go.Diagram, 'inner-diagram', {
        initialContentAlignment: go.Spot.Center,
        allowDrop: true,
        'toolManager.mouseWheelBehavior': go.ToolManager.WheelZoom,
        mouseDrop: function (e) {
          finishDrop(e, null)
        },
        'undoManager.isEnabled': true
      })

      self.BlockDiagram.linkTemplate = linkTemplateStyle()

      const unitTemplate = baseNodeTemplate('#c934c9', 'RoundedRectangle')
      unitTemplate.doubleClick = function (e, node) {
        self.jobOperationComponentShow = true
        self.unitName = node.data.text
        self.unitContent = JSON.stringify(node.data.unitMsg, null, 2)

        console.log(self.jobName)
      }

      self.BlockDiagram.nodeTemplateMap.add('Unit', unitTemplate)
      self.BlockDiagram.nodeTemplateMap.add('Start', startNodeTemplate('#0c0bc9'))
      self.BlockDiagram.nodeTemplateMap.add('End', endNodeTemplate('#DC3C00'))
      self.BlockDiagram.groupTemplateMap.add('UnitList', baseGroupTemplate())

      console.log('loadding')
    }

    function blockPaletteInit () {
      self.blockPalette =
        MAKE(go.Palette, 'inner-palette',
          {
            nodeTemplateMap: self.BlockDiagram.nodeTemplateMap,
            groupTemplateMap: self.BlockDiagram.groupTemplateMap,
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

    this.init()
  },
  methods: {
    onSubmit () {

    },
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
    }
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

</style>
