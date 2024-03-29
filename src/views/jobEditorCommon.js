import go from 'gojs'
import CONST from 'constant/constant'
export const MAKE = go.GraphObject.make

const lightText = 'whitesmoke'

export function showLinkLabel (e) {
  /*
  * 是否展示link text
  * */
  let label = e.subject.findObject('LABEL')
  if (label !== null) label.visible = (e.subject.fromNode.data.category === 'switchBlock')
}

export function finishDrop (e, grp) {
  if (e.diagram instanceof go.Palette) return // unit不能放置在palette内的unitList中
  let ok = (grp !== null
    ? grp.addMembers(grp.diagram.selection, true)
    : e.diagram.commandHandler.addTopLevelParts(e.diagram.selection, true))
  if (!ok) e.diagram.currentTool.doCancel()
}

function dropOntoLink (e, obj) {
  let diagram = e.diagram
  let newNode = diagram.selection.first()
  if (newNode.data.category === 'Unit') {
    diagram.commandHandler.groupSelection()
    newNode = diagram.selection.first()
  }
  let oldLink = obj.part
  // let fromNode = oldLink.fromNode
  let toNode = oldLink.toNode
  oldLink.toNode = newNode
  if (newNode.data.category === 'switchBlock') {
    diagram.model.addLinkData({ from: newNode.data.key, to: toNode.data.key, visible: true })
  } else {
    diagram.model.addLinkData({ from: newNode.data.key, to: toNode.data.key })
  }
}

export function linkTemplateStyle () {
  return MAKE(go.Link, // the whole link panel
    {
      routing: go.Link.AvoidsNodes,
      curve: go.Link.JumpOver,
      corner: 5,
      toShortLength: 4,
      relinkableFrom: true,
      relinkableTo: true,
      reshapable: false,
      resegmentable: false, // 用户是否可以更改链接中的段数，默认为false

      // layoutConditions: go.Part.LayoutAdded | go.Part.LayoutRemoved,
      // mouse-overs subtly highlight links:
      mouseEnter: function (e, link) { link.findObject('HL').stroke = 'rgba(30,144,255,0.2)' },
      mouseLeave: function (e, link) { link.findObject('HL').stroke = 'transparent' },
      mouseDrop: dropOntoLink,
      selectionAdorned: false
    },
    new go.Binding('points').makeTwoWay(),
    MAKE(go.Shape, // the highlight shape, normally transparent
      { isPanelMain: true, strokeWidth: 8, stroke: 'transparent', name: 'HL' }),
    MAKE(go.Shape,
      { isPanelMain: true, strokeWidth: 40, stroke: 'transparent' }),
    MAKE(go.Shape, // the link path shape
      { isPanelMain: true, stroke: 'gray', strokeWidth: 2 },
      new go.Binding('stroke', 'isSelected', function (sel) { return sel ? 'dodgerblue' : 'gray' }).ofObject()),
    MAKE(go.Shape, // the arrowhead
      { toArrow: 'standard', strokeWidth: 0, fill: 'gray' }),
    MAKE(go.Panel, 'Auto', // the link label, normally not visible
      { visible: false, name: 'LABEL', segmentIndex: 3, segmentFraction: 0.6 },
      new go.Binding('visible', 'visible').makeTwoWay(),
      MAKE(go.Shape, 'RoundedRectangle', // the label shape
        { fill: '#F8F8F8', strokeWidth: 0 }),
      MAKE(go.TextBlock, 'else', // link default: else
        {
          textAlign: 'center',
          font: '12pt helvetica, arial, sans-serif',
          stroke: '#064973',
          editable: true
        },
        new go.Binding('text').makeTwoWay())
    )
  )
}

export function startNodeTemplate (color, shape = 'RoundedRectangle') {
  const startNodeTemplate = baseNodeTemplate(color, shape)
  // parameter1: 20,
  startNodeTemplate.add(makePort('L', go.Spot.Left, true, false))
  startNodeTemplate.add(makePort('R', go.Spot.Right, true, false))
  startNodeTemplate.add(makePort('B', go.Spot.Bottom, true, false))
  startNodeTemplate.deletable = false
  return startNodeTemplate
}

export function endNodeTemplate (color, isUnit = false, shape = 'RoundedRectangle') {
  const endNodeTemplate = baseNodeTemplate(color, shape)
  endNodeTemplate.add(makePort('T', go.Spot.Top, false, true))
  endNodeTemplate.add(makePort('L', go.Spot.Left, false, true))
  endNodeTemplate.add(makePort('R', go.Spot.Right, false, true))
  if (isUnit) endNodeTemplate.deletable = false
  return endNodeTemplate
}

export function baseNodeTemplateForPort (color, shape) {
  const baseNodeTemplateForPort = baseNodeTemplate(color, shape)
  baseNodeTemplateForPort.add(makePort('T', go.Spot.Top, false, true))
  baseNodeTemplateForPort.add(makePort('L', go.Spot.Left, true, true))
  baseNodeTemplateForPort.add(makePort('R', go.Spot.Right, true, true))
  baseNodeTemplateForPort.add(makePort('B', go.Spot.Bottom, true, false))
  return baseNodeTemplateForPort
}

// 选取baseNode/baseGroup时的装饰模板
var nodeSelectionAdornmentTemplate =
MAKE(go.Adornment, 'Auto',
  MAKE(go.Shape, {
    fill: null,
    stroke: 'deepskyblue',
    strokeWidth: 1.5,
    // 选取节点时，strokeDashArray为空数组时选择框为实线，设置形如[x,y]的格式时，将创建x个像素的虚线和y个像素的空格
    strokeDashArray: [4, 2]
  }),
  // 占位符，用于装饰对象（Adornment）时，表示装饰对象的区域
  MAKE(go.Placeholder)
)

export function baseNodeTemplate (fill, shape) {
  const baseNodeTemplate = MAKE(go.Node, 'Spot', nodeStyle(),
    {
      selectable: true,
      selectionAdornmentTemplate: nodeSelectionAdornmentTemplate
    },
    // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
    MAKE(go.Panel, 'Auto',
      MAKE(go.Shape, shape,
        {
          parameter1: 10,
          minSize: new go.Size(96, 36),
          fill: fill,
          stroke: null,
          margin: 2,
          strokeWidth: 4
        },
        new go.Binding('fill', 'color'),
        new go.Binding('stroke', 'color'),
        new go.Binding('strokeDashArray', 'assistDevice', function (v) {
          return v ? [8, 6] : [0, 0]
        })
      ),
      MAKE(go.TextBlock,
        {
          font: 'bold 11pt Helvetica, Arial, sans-serif',
          stroke: lightText,
          margin: new go.Margin(8, 24, 8, 24),
          maxSize: new go.Size(160, NaN),
          wrap: go.TextBlock.WrapFit,
          editable: false
        },
        new go.Binding('text').makeTwoWay()
      ),
      MAKE(go.Shape, 'Diamond',
        {
          desiredSize: new go.Size(12, 12),
          fill: CONST.COLORS.STAR,
          alignment: new go.Spot(1, 0, -1, 1),
          opacity: 0.0
        },
        new go.Binding('fill', 'star'),
        new go.Binding('opacity', 'star', function (v) { return v ? 1.0 : 0.0 })
      ),
      MAKE(go.Panel, 'Spot',
        new go.Binding('opacity', 'assistDevice', function (t) {
          return t ? 1 : 0
        }),
        {
          opacity: 0,
          alignment: new go.Spot(0, 0, 5, 5),
          alignmentFocus: go.Spot.TopLeft
        },
        MAKE(go.TextBlock,
          new go.Binding('text', 'assistDevice'), {
            angle: 0,
            stroke: 'white',
            font: 'bold 13px sans-serif',
            textAlign: 'center'
          })
      )
    )
  )

  return baseNodeTemplate
}

export function unitNodeTemplate (color, shape = 'Rectangle') {
  const unitTemplate = baseNodeTemplate(color, shape)
  return unitTemplate
}

export function baseGroupTemplate (context) {
  return MAKE(go.Group, 'Auto', nodeStyle(),
    {
      selectable: true,
      selectionAdornmentTemplate: nodeSelectionAdornmentTemplate,
      background: 'transparent',
      // isSubGraphExpanded: false,// only show the Group itself, not any of its members
      ungroupable: true,
      // highlight when dragging into the Group
      mouseDragEnter: (e, grp, prev) => highlightGroup(e, grp, true),
      mouseDragLeave: (e, grp, next) => highlightGroup(e, grp, false),
      memberAdded: function (t, n) { // 判断当前 Unit 是否已经编辑完成，并改变 Unit 状态
        let { data: { unitMsg: { execModName, execCmdDict, execCmdDict: { execCmdList } } } } = n
        let target = execCmdList || execCmdDict
        if (CONST.STAR.has(execModName)) {
          if (n.data.star) {
            context.innerDiagram.model.setDataProperty(n.data, 'star', n.data.star)
          } else {
            context.innerDiagram.model.setDataProperty(n.data, 'star', CONST.COLORS.STAR)
          }
        }
        for (let key in target) {
          if (target[key].type !== 'noChange' && target[key].content.includes('Tmach ')) {
            context.innerDiagram.model.setDataProperty(n.data, 'color', CONST.COLORS.UNFINISHED)
            n.data.completed = false
            return
          }
        }
        context.innerDiagram.model.setDataProperty(n.data, 'color', CONST.COLORS.FINISH)
        n.data.completed = true
      },
      computesBoundsAfterDrag: true,
      // when the selection is dropped into a Group, add the selected Parts into that Group;
      // if it fails, cancel the tool, rolling back any changes
      mouseDrop: finishDrop,
      handlesDragDropForMembers: true, // don't need to define handlers on member Nodes and Links
      layout:
          MAKE(go.GridLayout,
            {
              wrappingWidth: Infinity,
              alignment: go.GridLayout.Position,
              cellSize: new go.Size(1, 1),
              spacing: new go.Size(4, 4)
            })
      // Groups containing Nodes lay out their members vertically  定义格式
    },
    new go.Binding('background', 'isHighlighted', function (h) {
      return h ? 'rgba(255,0,0,0.2)' : 'transparent'
    }).ofObject(),
    MAKE(go.Shape, 'Rectangle',
      {
        fill: null,
        stroke: CONST.COLORS.GROUP,
        strokeWidth: 2,
        // 设置link的port  使其连线
        portId: '',
        cursor: 'pointer'
      }),
    MAKE(go.Panel, 'Vertical', // title above Placeholder
      MAKE(go.Panel, 'Horizontal', // button next to TextBlock
        { stretch: go.GraphObject.Horizontal, background: CONST.COLORS.GROUP },
        MAKE('SubGraphExpanderButton',
          { alignment: go.Spot.Right, margin: 5 }),
        MAKE(go.TextBlock,
          {
            alignment: go.Spot.Left,
            editable: false,
            margin: 5,
            font: 'bold 16px sans-serif',
            opacity: 1,
            stroke: '#404040'
          },
          new go.Binding('text', 'text').makeTwoWay())
      ), // end Horizontal Panel
      MAKE(go.Placeholder,
        { padding: 5, alignment: go.Spot.TopLeft })
    ), // end Vertical Panel
    makePort('T', go.Spot.Top, false, true),
    makePort('L', go.Spot.Left, true, true),
    makePort('R', go.Spot.Right, true, true),
    makePort('B', go.Spot.Bottom, true, false)
  ) // end Group and call to add to template Map
}

function nodeStyle () {
  /*
  * 定义node样式
  * */
  return [

    new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
    {
      // 字体位置在每个节点的中心
      locationSpot: go.Spot.Center,

      mouseEnter: function (e, obj) {
        showPorts(obj.part, true)
      },
      mouseLeave: function (e, obj) {
        showPorts(obj.part, false)
      }
    }
  ]
}

function makePort (name, spot, output, input) {
  /*
  * 定义port
  * */
  return MAKE(go.Shape, 'Circle',
    {
      fill: 'gray',
      stroke: null, // this is changed to "white" in the showPorts function
      desiredSize: new go.Size(6, 6),
      alignment: spot,
      alignmentFocus: spot, // align the port on the main Shape
      portId: name, // declare this object to be a "port"
      fromSpot: spot,
      toSpot: spot, // declare where links may connect at this port
      fromLinkable: output,
      toLinkable: input, // declare whether the user may draw links to/from here
      cursor: 'pointer' // show a different cursor to indicate potential link point
    })
}

function showPorts (node, show) {
  /*
  * 当鼠标停留在节点上时，使节点上的所有端口都可见
  * */
  let diagram = node.diagram
  if (!diagram || diagram.isReadOnly || !diagram.allowLink) return
  node.ports.each(function (port) {
    port.stroke = (show ? CONST.COLORS.STAR : CONST.COLORS.GROUP)
  })
}

function highlightGroup (e, grp, show) {
  if (!grp) return
  e.handled = true
  if (show) {
    // cannot depend on the grp.diagram.selection in the case of external drag-and-drops;
    // instead depend on the DraggingTool.draggedParts or .copiedParts
    var tool = grp.diagram.toolManager.draggingTool
    var map = tool.draggedParts || tool.copiedParts // this is a Map
    // now we can check to see if the Group will accept membership of the dragged Parts
    if (grp.canAddMembers(map.toKeySet())) {
      grp.isHighlighted = true
      return
    }
  }
  grp.isHighlighted = false
}
