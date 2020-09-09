import go from 'gojs'
import CONST from 'constant/constant'
import { startValidation } from '../core/validation/operationValidation/job'
import { commonValidation } from '../core/validation/common'
import { unitListValidation } from '../core/validation/operationValidation/block'

import { getBlockFlowDict4Font } from '../api/reef/jobFlow'

import {
  MAKE,
  showLinkLabel,
  finishDrop,
  linkTemplateStyle,
  startNodeTemplate,
  endNodeTemplate,
  unitNodeTemplate,
  baseNodeTemplateForPort,
  baseGroupTemplate
} from './jobEditorCommon'

function outerDiagramInit (context) {
  context.outerDiagram = MAKE(go.Diagram, 'outer-diagram', {
    initialContentAlignment: go.Spot.Center,
    allowDrop: true,
    // layout: MAKE(go.LayeredDigraphLayout, { direction: 90, layerSpacing: 40, columnSpacing: 30, setsPortSpots: true }),
    linkTemplate: linkTemplateStyle(),
    'draggingTool.isGridSnapEnabled': true,
    'linkingTool.portGravity': 40,
    'linkingTool.linkValidation': commonValidation,
    'relinkingTool.portGravity': 40,
    'relinkingTool.linkValidation': commonValidation,
    'toolManager.mouseWheelBehavior': go.ToolManager.WheelZoom,
    'LinkDrawn': showLinkLabel,
    'LinkRelinked': showLinkLabel,
    'undoManager.isEnabled': true,
    mouseDrop: function (e) {
      finishDrop(e, null)
    }
  })

  const startTemplate = startNodeTemplate(CONST.COLORS.START)
  startTemplate.linkValidation = startValidation

  const endTemplate = endNodeTemplate(CONST.COLORS.END)
  endTemplate.doubleClick = (e, node) => {
    if (node.data.text === 'End') {
      context.outerDiagram.model.setDataProperty(node.data, 'text', 'Fail')
      context.outerDiagram.model.setDataProperty(node.data, 'color', CONST.COLORS.FAIL)
    } else if (node.data.text === 'Fail') {
      context.outerDiagram.model.setDataProperty(node.data, 'text', 'Success')
      context.outerDiagram.model.setDataProperty(node.data, 'color', CONST.COLORS.SUCCESS)
    } else {
      context.outerDiagram.model.setDataProperty(node.data, 'text', 'End')
      context.outerDiagram.model.setDataProperty(node.data, 'color', CONST.COLORS.END)
    }
  }

  const switchBlockTemplate = baseNodeTemplateForPort(CONST.COLORS.SWITCH, 'Diamond')
  switchBlockTemplate.doubleClick = function (e, node) {
    if (e.diagram instanceof go.Palette) return
    context.switchBlockInfo = {
      switchBlockName: node.data.text,
      fileName: node.data.fileName,
      explain: node.data.explain
    }
    context.currentSwitchBlockKey = node.data.key
    context.switchBlockModalShow = true
  }

  const normalBlockTemplate = baseNodeTemplateForPort(CONST.COLORS.NORMAL, 'Rectangle')
  normalBlockTemplate.contextMenu = MAKE('ContextMenu',
    MAKE('ContextMenuButton',
      MAKE(go.TextBlock, 'NormalBlock', {
        margin: 8
      }),
      {
        click: function (e, obj) {
          context.setOutputNormalBlock(context, false)
        }
      }
    ),
    MAKE('ContextMenuButton',
      MAKE(go.TextBlock, '结果Block', {
        margin: 8
      }),
      {
        click: function (e, obj) {
          context.setOutputNormalBlock(context, true)
        }
      }
    ))

  normalBlockTemplate.doubleClick = function (e, node) {
    if (e.diagram instanceof go.Palette) return
    context.unitType = '请选择组件类型'
    context.blockName = node.data.text
    context.currentNormalBlockKey = node.data.key
    context.blockModalShow = true
    if (!context.innerDiagram) innerDiagramInit(context)
    if (!context.innerPalette) innerPaletteInit(context)
    context.innerDiagram.model = go.Model.fromJson(context._.cloneDeep(node.data.unitLists))
  }

  const jobBlockTemplate = baseNodeTemplateForPort(CONST.COLORS.JOB, 'Rectangle')
  jobBlockTemplate.doubleClick = function (e, node) {
    if (e.diagram instanceof go.Palette) return
    context.currentJobBlockText = node.data.text
    context.currentJobBlockKey = node.data.key
    context.jobModalShow = true
  }

  context.outerDiagram.nodeTemplateMap.add('normalBlock', normalBlockTemplate)
  context.outerDiagram.nodeTemplateMap.add('switchBlock', switchBlockTemplate)
  context.outerDiagram.nodeTemplateMap.add('Start', startTemplate)
  context.outerDiagram.nodeTemplateMap.add('End', endTemplate)
  context.outerDiagram.nodeTemplateMap.add('Job', jobBlockTemplate)
}

function outerPaletteInit (context) {
  context.outerPalette = MAKE(
    go.Palette, 'outer-palette', {
      scrollsPageOnFocus: false,
      nodeTemplateMap: context.outerDiagram.nodeTemplateMap,
      layout: MAKE(go.GridLayout, { wrappingColumn: 1, alignment: go.GridLayout.Location })
    }
  )
  context.outerPalette.model = new go.GraphLinksModel(CONST.OUTER_PALETTE_MODEL)
}

function innerDiagramInit (context) {
  context.innerDiagram = MAKE(go.Diagram, 'inner-diagram', {
    initialContentAlignment: go.Spot.Center,
    allowDrop: true,
    linkTemplate: linkTemplateStyle(),
    layout: MAKE(go.LayeredDigraphLayout, { direction: 0, layerSpacing: 40, columnSpacing: 30, setsPortSpots: false }),
    'linkingTool.linkValidation': commonValidation,
    'relinkingTool.linkValidation': commonValidation,
    'toolManager.mouseWheelBehavior': go.ToolManager.WheelZoom,
    'undoManager.isEnabled': true,
    'commandHandler.archetypeGroupData': { category: 'UnitList', text: 'UnitList', isGroup: true },
    mouseDrop: function (e) {
      finishDrop(e, null)
    }
  })

  // -------------从Palette拖拽节点的触发事件，判断Unit是否被UnitList包含------------
  context.innerDiagram.addDiagramListener('externalobjectsdropped', function (e) {
    e.subject.each(function (n) {
      // 得到从Palette拖过来的节点 判断节点如果没有group则删除节点
      if (n.data.category === 'Unit') {
        if (!n.data.group) { // 判断Unit是否被UnitList包含
          context.innerDiagram.commandHandler.groupSelection()
        }
      }
    })
  })

  const unitTemplate = unitNodeTemplate(CONST.COLORS.UNIT)
  unitTemplate.doubleClick = function (e, node) {
    if (e.diagram instanceof go.Palette) return
    context.showUnitEditor = true
    let { key, text, unitMsg, unitMsg: { execModName } } = node.data
    context.unitData = {
      unitNodeKey: key,
      unitName: text,
      unitType: execModName,
      unitMsg: context._.cloneDeep(unitMsg)
    }
  }

  unitTemplate.contextClick = function (e, node) {
    if (e.diagram instanceof go.Palette && sessionStorage.identity.includes('Admin')) {
      context.isDiagram = false
      context.unitTemplateName = node.data.text
      context.unitTemplateId = node.data.unit_id
      context.unitTemplateContent = JSON.stringify(node.data.unitMsg, null, 2)
      context.unitController.style.top = `${e.event.y - 50}px`
      context.unitController.style.left = `${e.event.x}px`
      context.unitController.style.display = 'block'
    } else {
      context.isDiagram = true
      context.curUnitKey = node.data.key
      context.unitController.style.top = `${e.event.y - 50}px`
      context.unitController.style.left = `${e.event.x}px`
      context.unitController.style.display = 'block'
    }
  }

  const unitListGroupTemplate = baseGroupTemplate(context)
  unitListGroupTemplate.memberValidation = function groupValidation (group, node) {
    return node.data.category === 'Unit'// 当节点的category值为Unit时
  }

  unitListGroupTemplate.linkValidation = unitListValidation

  context.innerDiagram.nodeTemplateMap.add('Unit', unitTemplate)
  context.innerDiagram.nodeTemplateMap.add('Start', startNodeTemplate(CONST.COLORS.START))
  context.innerDiagram.nodeTemplateMap.add('End', endNodeTemplate(CONST.COLORS.END, true))
  context.innerDiagram.groupTemplateMap.add('UnitList', unitListGroupTemplate)
}

function innerPaletteInit (context) {
  context.innerPalette =
    MAKE(go.Palette, 'inner-palette',
      {
        nodeTemplateMap: context.innerDiagram.nodeTemplateMap,
        groupTemplateMap: context.innerDiagram.groupTemplateMap,
        layout: MAKE(go.GridLayout, { wrappingColumn: 1, alignment: go.GridLayout.Center })
      })
  context.getSelectedUnit('基础操作')
}

async function setOuterDiagramData (context) {
  if (context.outerDiagramModel !== null && JSON.parse(context.outerDiagramModel).nodeDataArray.length > 1) {
    context.outerDiagram.model = go.Model.fromJson(context.outerDiagramModel)
  } else {
    if (context.jobInfo.job_flow) {
      let { status, data } = await getBlockFlowDict4Font(context.jobInfo.job_flow)
      if (status === 200) {
        if (JSON.stringify(data) === '{}') {
          context.$Message.err({
            background: true,
            content: '这个job不存在'
          })
          return context.$router.push({ path: '/' })
        }
        context.outerDiagram.model = go.Model.fromJson(data)
      } else {
        context.$Message.err({
          background: true,
          content: '获取 Job 信息失败'
        })
        return context.$router.push({ path: '/' })
      }
    } else {
      context.outerDiagram.model = go.Model.fromJson(CONST.BASIC_OUTER_DIAGRAM_MODEL)
    }
  }
}

export function init (context) {
  outerDiagramInit(context)
  outerPaletteInit(context)
  setOuterDiagramData(context)
}
