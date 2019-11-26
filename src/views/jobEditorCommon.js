import go from 'gojs'
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
  let ok = (grp !== null
    ? grp.addMembers(grp.diagram.selection, true)
    : e.diagram.commandHandler.addTopLevelParts(e.diagram.selection, true))
  if (!ok) e.diagram.currentTool.doCancel()
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
      reshapable: true,
      resegmentable: true,
      // mouse-overs subtly highlight links:
      mouseEnter: function (e, link) { link.findObject('HIGHLIGHT').stroke = 'rgba(30,144,255,0.2)' },
      mouseLeave: function (e, link) { link.findObject('HIGHLIGHT').stroke = 'transparent' },
      selectionAdorned: false
    },
    new go.Binding('points').makeTwoWay(),
    MAKE(go.Shape, // the highlight shape, normally transparent
      { isPanelMain: true, strokeWidth: 8, stroke: 'transparent', name: 'HIGHLIGHT' }),
    MAKE(go.Shape, // the link path shape
      { isPanelMain: true, stroke: 'gray', strokeWidth: 2 },
      new go.Binding('stroke', 'isSelected', function (sel) { return sel ? 'dodgerblue' : 'gray' }).ofObject()),
    MAKE(go.Shape, // the arrowhead
      { toArrow: 'standard', strokeWidth: 0, fill: 'gray' }),
    MAKE(go.Panel, 'Auto', // the link label, normally not visible
      { visible: false, name: 'LABEL', segmentIndex: 2, segmentFraction: 0.5 },
      new go.Binding('visible', 'visible').makeTwoWay(),
      MAKE(go.Shape, 'RoundedRectangle', // the label shape
        { fill: '#F8F8F8', strokeWidth: 0 }),
      MAKE(go.TextBlock, 'else', // the label
        {
          textAlign: 'center',
          font: '18pt helvetica, arial, sans-serif',
          stroke: '#56d8e4',
          editable: true
        },
        new go.Binding('text').makeTwoWay())
    )
  )
}

export function startNodeTemplate (color, shape = 'Circle') {
  const startNodeTemplate = baseNodeTemplate(color, shape)
  startNodeTemplate.add(makePort('L', go.Spot.Left, true, false))
  startNodeTemplate.add(makePort('R', go.Spot.Right, true, false))
  startNodeTemplate.add(makePort('B', go.Spot.Bottom, true, false))
  return startNodeTemplate
}

export function endNodeTemplate (color, shape = 'Circle') {
  const endNodeTemplate = baseNodeTemplate(color, shape)
  endNodeTemplate.add(makePort('T', go.Spot.Top, false, true))
  endNodeTemplate.add(makePort('L', go.Spot.Left, false, true))
  endNodeTemplate.add(makePort('R', go.Spot.Right, false, true))
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
        { fill: fill, stroke: null },
        new go.Binding('fill', 'color')
      ),
      MAKE(go.TextBlock,
        {
          font: 'bold 11pt Helvetica, Arial, sans-serif',
          stroke: lightText,
          margin: 8,
          maxSize: new go.Size(160, NaN),
          wrap: go.TextBlock.WrapFit,
          editable: false
        },
        new go.Binding('text').makeTwoWay())
    )
  )

  return baseNodeTemplate
}

export function baseGroupTemplate () {
  return MAKE(go.Group, 'Auto', nodeStyle(),
    {
      selectable: true,
      selectionAdornmentTemplate: nodeSelectionAdornmentTemplate,
      background: 'transparent',
      // isSubGraphExpanded: false,// only show the Group itself, not any of its members
      ungroupable: true,
      // highlight when dragging into the Group
      mouseDragEnter: function (e, grp, prev) {
        highlightGroup(e, grp, true)
      },
      mouseDragLeave: function (e, grp, next) {
        highlightGroup(e, grp, false)
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
        stroke: '#33D3E5',
        strokeWidth: 2,
        // 设置link的port  使其连线
        portId: '',
        cursor: 'pointer'
      }),
    MAKE(go.Panel, 'Vertical', // title above Placeholder
      MAKE(go.Panel, 'Horizontal', // button next to TextBlock
        { stretch: go.GraphObject.Horizontal, background: '#33D3E5' },
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
    port.stroke = (show ? 'yellow' : null)
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

export function basicModel () {
  return go.Model.fromJson(
    {
      'class': 'go.GraphLinksModel',
      'linkFromPortIdProperty': 'fromPort',
      'linkToPortIdProperty': 'toPort',
      'nodeDataArray': [],
      'linkDataArray': []
    }
  )
}
