import go from 'gojs'
import CONST from 'constant/constant'
import { startValidation } from '../core/validation/operationValidation/job'
import { commonValidation } from '../core/validation/common'
import { unitListValidation } from '../core/validation/operationValidation/block'

import { getBlockFlowDict4Font } from '../api/reef/request'

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

// function setOutputNormalBlock (context, isOutput) { // 指定结果Block isOutput 是否指定为结果Block
//   if (isOutput && context.jobInfo.job_type === 'InnerJob') {
//     context.$Message.error({
//       content: '无法为内嵌用例指定结果Block'
//     })
//     return
//   }
//   let iterator = context.outerDiagram.selection // 获取当前选中节点的迭代器
//   let a = iterator.next()
//   if (iterator.count > 1) { // 只能将一个节点指定为结果Block
//     context.$Message.error({
//       content: '仅可选取一个Block'
//     })
//     return
//   }
//   context.outerDiagram.selection.each(({ data, data: { unitLists } }) => { //unitLists 就是normalBlock里面的内容
//     if (typeof unitLists !== 'object') { // 兼容处理
//       unitLists = JSON.parse(unitLists)
//     }
//     let { nodeDataArray, linkDataArray } = unitLists
//     // 找到最后一个有star属性的unit
//     let starUnitArray = nodeDataArray.filter((val, index) => { // 获取带有star属性的unit节点 该节点是输出结果的节点
//       return val.category === 'Unit' && 'star' in val
//     })
//     let lastStarUnit = null //结果unit
//     if (starUnitArray.length === 1) { // 仅有一个unit节点时,该节点即为目标unit
//       lastStarUnit = starUnitArray[0]
//     }
//     else if (starUnitArray.length > 1) {
//       let linkDataMap = new Map()
//       linkDataArray.forEach((val) => {
//         linkDataMap.set(val.from, val.to)
//       })
//       let startKey = nodeDataArray.filter(val => { // 找到start节点
//         return val.category === 'Start'
//       })[0].key
//       let next = linkDataMap.get(startKey)
//       let nodeOrderArray = []
//       while (true) {
//         if (next) {
//           nodeOrderArray.push(next)
//           next = linkDataMap.get(next)
//         } else {
//           nodeOrderArray.splice(nodeOrderArray.length - 1, 1)
//           break
//         }
//       }
//       let lastStarUnitIndex = 0
//       starUnitArray.forEach((val, idx, arr) => { // 清除所有unit的结果标记, 并找到最后一个unit
//         arr[idx].star = CONST.COLORS.STAR
//         arr[idx].unitMsg.finalResult = null
//         delete arr[idx].unitMsg.finalResult
//         let tempIndex = nodeOrderArray.indexOf(val.group)
//         if (tempIndex > lastStarUnitIndex) {
//           lastStarUnitIndex = tempIndex
//           lastStarUnit = val
//         }
//       })
//     } else {
//       context.$Message.error({
//         content: '无法对该Block进行右键操作'
//       })
//       return
//     }
//     // data 是 noramlBlock 设定结果Block
//     if (data.star) {
//       let finalResultBlock = context.outerDiagram.findNodeForKey(context.config.finalResultKey)
//       if (context.config.finalResultKey === 0 && isOutput) { // 如果要设定结果Block且当前不存在结果Block
//         lastStarUnit.star = CONST.COLORS.RESULT
//         lastStarUnit.unitMsg.finalResult = true
//         context.$store.commit('job/handleConfig', {
//           action: 'setConfig',
//           data: { finalResultKey: data.key }
//         })
//         context.$Message.success({
//           content: '已将该Block设为结果Block'
//         })
//         context.outerDiagram.model.setDataProperty(data, 'star', lastStarUnit.star)
//         context.outerDiagram.model.setDataProperty(data, 'unitLists', JSON.stringify(unitLists))
//       }
//       if (context.config.finalResultKey) { // 如果结果Block已经存在
//         if (context.config.finalResultKey === data.key) { // 如果结果block为当前block
//           if (!isOutput) { // 如果要将结果Block恢复为普通block
//             lastStarUnit.star = CONST.COLORS.STAR
//             lastStarUnit.unitMsg.finalResult = null
//             delete lastStarUnit.unitMsg.finalResult
//             context.$store.commit('job/handleConfig', {
//               action: 'setConfig',
//               data: { finalResultKey: null }  // 表明未设置结果block
//             })
//             context.$Message.success({
//               content: '已将该Block设为NormalBlock'
//             })
//             context.outerDiagram.model.setDataProperty(data, 'star', lastStarUnit.star)
//             context.outerDiagram.model.setDataProperty(data, 'unitLists', JSON.stringify(unitLists))
//           }
//         } else { // 如果结果block不是当前block
//           if (isOutput) { // 要设置结果block
//             if (finalResultBlock) { // 结果block存在的话
//               let finalResultUnit = JSON.parse(finalResultBlock.data.unitLists).nodeDataArray.filter(node => node.category === 'Unit' && node.unitMsg.finalResult)
//               if (finalResultUnit.length > 0) {
//                 context.$Message.error({
//                   content: '结果Block有且只能有一个'
//                 })
//               } else {
//                 lastStarUnit.star = CONST.COLORS.RESULT
//                 lastStarUnit.unitMsg.finalResult = true
//                 context.$store.commit('job/handleConfig', {
//                   action: 'setConfig',
//                   data: { finalResultKey: data.key }
//                 })
//                 context.$Message.success({
//                   content: '已将该Block设为结果Block'
//                 })
//                 context.outerDiagram.model.setDataProperty(data, 'star', lastStarUnit.star)
//                 context.outerDiagram.model.setDataProperty(data, 'unitLists', JSON.stringify(unitLists))
//               }
//             } else {
//               lastStarUnit.star = CONST.COLORS.RESULT
//               lastStarUnit.unitMsg.finalResult = true
//               context.$store.commit('job/handleConfig', {
//                 action: 'setConfig',
//                 data: { finalResultKey: data.key }
//               })
//               context.$Message.success({
//                 content: '已将该Block设为结果Block'
//               })
//               context.outerDiagram.model.setDataProperty(data, 'star', lastStarUnit.star)
//               context.outerDiagram.model.setDataProperty(data, 'unitLists', JSON.stringify(unitLists))
//             }
//           }
//         }
//       }
//     } else {
//       context.$Message.error({
//         content: '无法对该Block进行右键操作'
//       })
//     }
//   })
// }

function outerDiagramInit (context) {
  context.outerDiagram = MAKE(go.Diagram, 'outer-diagram', {
    initialContentAlignment: go.Spot.Center,
    allowDrop: true,
    // layout: MAKE(go.LayeredDigraphLayout, { direction: 90, layerSpacing: 40, columnSpacing: 30, setsPortSpots: true }),
    linkTemplate: linkTemplateStyle(),
    'draggingTool.isGridSnapEnabled': true,
    'linkingTool.portGravity': 60,
    'linkingTool.linkValidation': commonValidation,
    'relinkingTool.portGravity': 60,
    'relinkingTool.linkValidation': commonValidation,
    'toolManager.mouseWheelBehavior': go.ToolManager.WheelZoom,
    'LinkDrawn': showLinkLabel,
    'LinkRelinked': showLinkLabel,
    'undoManager.isEnabled': true,
    mouseDrop: function (e) {
      finishDrop(e, null)
    },
    'commandHandler.canDeleteSelection': deleteNode,
    'commandHandler.canCopySelection': canCopySelect
  })

  function canCopySelect () {
    let flag = true
    context.outerDiagram.selection.each(node =>{
      let { data: { category } } = node
      if (category === 'Start') {
        flag = false
      }
    })
    if (!flag) context.$Message.error({
      background: true,
      content: 'Start不可以被复制'
    })
    return flag
  }

  const startTemplate = startNodeTemplate(CONST.COLORS.START)
  startTemplate.linkValidation = startValidation

  const endTemplate = endNodeTemplate(CONST.COLORS.END)
  endTemplate.doubleClick = (e, node) => {
    if (e.diagram instanceof go.Palette) return
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
  // normalBlockTemplate.contextMenu = MAKE('ContextMenu', // todo:僚机norBlock
  //   MAKE('ContextMenuButton',
  //     MAKE(go.TextBlock, 'NormalBlock', {
  //       margin: 8
  //     }),
  //     {
  //       click: function (e, obj) {
  //         setOutputNormalBlock(context, false)
  //       }
  //     }
  //   ),
  //   MAKE('ContextMenuButton',
  //     MAKE(go.TextBlock, '结果Block', {
  //       margin: 8
  //     }),
  //     {
  //       click: function (e, obj) {
  //         setOutputNormalBlock(context, true)
  //       }
  //     }
  //   ))

  normalBlockTemplate.doubleClick = function (e, node) {
    if (e.diagram instanceof go.Palette) return
    let { data } = context._.cloneDeep(node)
    context.$store.commit('job/handleNormalData', { action: 'set', data })
    context.outerDiagram.div.firstElementChild.blur()  // 失去焦点，防止粘贴错误
    context.openNormalEditor = true
  }

  function deleteNode () { // 删除节点时同步更新配置信息
    return context.outerDiagram.selection.all(function ({ data }) {
      if (data.category === 'normalBlock') {
        if (data.star === CONST.COLORS.RESULT) {
          context.$store.commit('job/handleConfig', {
            action: 'setConfig',
            data: { finalResultKey: null }
          })
        }
      }
      return true
    })
  }

  const jobBlockTemplate = baseNodeTemplateForPort(CONST.COLORS.JOB, 'Rectangle')
  jobBlockTemplate.doubleClick = function (e, node) {
    if (e.diagram instanceof go.Palette) return
    context.currentJobBlockText = node.data.text
    context.currentJobBlockKey = node.data.key
    context.jobModalShow = true
  }
  jobBlockTemplate.contextClick = function (e, node) {
    if (e.diagram instanceof go.Palette) return
    context.isDiagram = true
    context.currentJobBlockKey = node.data.key
    context.jobController.style.top = `${e.event.y - 50}px`
    context.jobController.style.left = `${e.event.x}px`
    context.jobController.style.display = 'block'
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

export function innerDiagramInit (context) {
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
    },
    'commandHandler.canDeleteSelection': deleteNode,
    'commandHandler.canCopySelection': canCopySelect
  })
  function canCopySelect () { // 删除节点时同步更新配置信息
    let flag = true
    context.innerDiagram.selection.each(node =>{
      let { data: { category } } = node
      if (category === 'Start' || category === 'End') {
        flag = false
      }
    })
    if (!flag) context.$Message.error({
                          background: true,
                          content: 'Start,End 不可以被复制'
                        })
    return flag
  }

  function deleteNode () { // 删除节点时同步更新配置信息
    context.innerDiagram.selection.each(node =>{
      let {data: { category, star } } = node
      if (category === 'Unit') {
        if (star === CONST.COLORS.RESULT) {
          context.finalResKey = null
        }
      }
      else if (category === 'UnitList'){
        node.memberParts.iterator.each(part => {
          if (part.data.star === CONST.COLORS.RESULT) {
            context.finalResKey = null
          }
        })
      }
    })
    return true
  }

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
    context.$store.commit('item/handleShowItemEditor', false) // 关闭itemEditor
    context.showUnitEditor = true
    let { key, text, unitMsg, unitMsg: { execModName } } = context._.cloneDeep(node.data)
    let { execCmdDict: { execCmdList: target } } = unitMsg
    if (target) {
      target.forEach((val, idx, arr) => {
        arr[idx].itemId = Math.random().toString(36).substr(2, 6)
      })
    }
    let unitData = {
      unitKey: key,
      unitName: text,
      unitType: execModName,
      unitMsg
    }
    context.$store.commit('unit/handleUnitData', {
      action: 'setUnitData',
      data: unitData
    })
  }

  unitTemplate.contextClick = function (e, { data }) { // 右键点击Unit
    if (e.diagram instanceof go.Palette) { // 右键点击左侧unit模板
        if (!sessionStorage.groups) {
          context.$Notice.warning({
            title: '温馨提醒',
            desc: '用户权限信息丢失,请重新登录。'
          })
          return
        }
        if (!sessionStorage.groups.includes('Admin')) {
          context.$Notice.warning({
            title: '温馨提醒',
            desc: '该功能仅限管理员使用，请切换您的账号或重新登录。'
          })
          return
      }
      context.isDiagram = false
      context.unitTemplateName = data.text
      context.unitTemplateId = data.unit_id
      context.unitTemplateContent = JSON.stringify(data.unitMsg, null, 2)
    } else {
      context.isDiagram = true
      context.curUnitKey = data.key
      context.dropdownMenuData[0].visible = !data.star
    }
    context.unitController.style.top = `${e.event.y - 50}px`
    context.unitController.style.left = `${e.event.x}px`
    context.openContextMenu()
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

export function innerPaletteInit (context) {
  context.innerPalette =
    MAKE(go.Palette, 'inner-palette',
      {
        nodeTemplateMap: context.innerDiagram.nodeTemplateMap,
        groupTemplateMap: context.innerDiagram.groupTemplateMap,
        layout: MAKE(go.GridLayout, { wrappingColumn: 1, alignment: go.GridLayout.Center })
      })
  context.getSelectedUnit('基础操作')
}

function adapter (config, context) {
  // 适配老版本：老版本的finalResultKey默认为0，指定的是Block的key,新版本的finalResultKey默认为 null，指定的是Block的key,unitKey
  if (config.finalResultKey && typeof config.finalResultKey === 'number') {
    context.$Message.info({
      content: '格式转换'
    })
    let { data: finalResultNorBlock } = context.outerDiagram.findNodeForKey(config.finalResultKey)
    let finalResultUnit = JSON.parse(finalResultNorBlock.unitLists).nodeDataArray.filter(node => node.category === 'Unit' && node.star === CONST.COLORS.RESULT)[0]
    config.finalResultKey = `${config.finalResultKey},${finalResultUnit.key}`
  }
  return config
}

function checkFinalResultKey(finalResultKey,context){ // norBlockKey,unitKey
  if(!finalResultKey) return true

  let [norBlockKey,unitKey]  = finalResultKey.split(",").map(item => Number.parseInt(item))
  let { data: { star, unitLists } } = context.outerDiagram.findNodeForKey(norBlockKey)
  if (star === CONST.COLORS.RESULT){
    let finalResultUnit = JSON.parse(unitLists).nodeDataArray.filter(node=> node.category === 'Unit' && node.star === CONST.COLORS.RESULT)[0]
    if (!finalResultUnit || finalResultUnit.key === unitKey) return true
  }
  return false
}

export function setOuterDiagramData (context,job_flow = null) { // 打开jobEditor页面时设置数据
  if (context.outerDiagramModel !== null && JSON.parse(context.outerDiagramModel).nodeDataArray.length > 1) { // 如果逻辑流存在且节点数量多于1个
    context.outerDiagram.model = go.Model.fromJson(context.outerDiagramModel) // 恢复之前保存的逻辑流
  } else { // 如果逻辑流不存在
    if (job_flow) { // 如果jobInfo里有job_flow字段, 则获取逻辑流并展示
      getBlockFlowDict4Font(job_flow).then(({ status, data }) => {
        if (typeof data === 'string') {
          data = JSON.parse(data)
        }
        if (status === 200) {
          if (JSON.stringify(data) === '{}') {
            context.$Message.err({
              background: true,
              content: '这个 job 不存在'
            })
            return context.$router.push({ path: '/' })
          }
          data.nodeDataArray.forEach((val, idx, arr) => {
            if ('unitLists' in val && typeof val.unitLists === 'object') {
              arr[idx].unitLists = JSON.stringify(val.unitLists)
            }
          })
          context.outerDiagram.model = go.Model.fromJson(data)
          // 适配老版本，老版本可能不存在该字段，新版本都存在，config需要设置默认值{}
          let { data: start, data: { config: config = {} } } = context.outerDiagram.findNodeForKey(-1)
          // 之前的结果norBlock  finalResultKey: 'norBlockKey' Number ,现在更改成结果unit finalResultKey:norBlockKey,UnitKey String, 但要适配原来的更改
          let newConfig = adapter(config, context)
          if (!checkFinalResultKey(newConfig.finalResultKey,context)){
            newConfig.finalResultKey = null
            context.$Message.error({
              background: true,
              content: '结果unit设置有误,请重新设置'
            })
          }
          context.$store.commit('job/handleConfig', {
            action: 'setConfig',
            data: newConfig || {}
          })
          context.outerDiagram.model.setDataProperty(start,'config', newConfig)
        } else {
          throw new Error('获取 Job 信息失败')
        }
      }).catch(err => {
        console.log(err)
        context.$Message.error({
          background: true,
          content: '获取 Job 信息失败'
        })
        return context.$router.push({ path: '/' })
      })
    } else { // job_flow字段不存在, 显示默认节点(包含一个start节点)
      context.outerDiagram.model = go.Model.fromJson(CONST.BASIC_OUTER_DIAGRAM_MODEL)
    }
  }
}

export function init (context) {
  if (!context.outerDiagram) outerDiagramInit(context)
  outerPaletteInit(context)
  setOuterDiagramData(context, context.jobFlowInfo.ui_json_file)
}
