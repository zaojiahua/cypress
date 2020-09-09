import CONSTANT from 'constant/constant'
export function jobFlowValidation (vueObj) {
  const self = vueObj
  // 事件校验提示
  let myDiagramEventValidationHint = new Set()

  const startValidation = () => {
    let startAll = self.outerDiagram.findNodesByExample({ 'category': 'Start' })

    if (startAll.count !== 1) {
      myDiagramEventValidationHint.add('有且只有一个Start')
    } else {
      startAll.iterator.each(node => {
        let startLinksOutOf = node.findLinksOutOf()
        if (startLinksOutOf.count !== 1) {
          myDiagramEventValidationHint.add('Start缺少指向链接')
        }
      })
    }
  }

  const endValidation = () => {
    let endAll = self.outerDiagram.findNodesByExample({ 'category': 'End' })

    if (endAll.count <= 0) {
      myDiagramEventValidationHint.add('缺少End')
    } else {
      endAll.iterator.each(node => { // 遍历所有的end节点
        let endLinksInto = node.findLinksInto()
        if (endLinksInto.count <= 0) {
          myDiagramEventValidationHint.add('End至少有一条被指向链接')
        }
        if (node.data.text === 'End') {
          endLinksInto.each(link => {
            let preNormalBlockData = link.fromNode.data
            if (preNormalBlockData.category === 'normalBlock') {
              // self.outerDiagram.model.setDataProperty(preNormalBlockData, 'star', true)
              let imgToolUnits = preNormalBlockData.unitLists.nodeDataArray.filter(item => item.category === 'Unit' && CONSTANT.IMGTOOL.has(item.unitMsg.execModName))
              if (!imgToolUnits.length) {
                myDiagramEventValidationHint.add('End 节点前的 NormalBlock 未包含类型为 "图像识别" 的 Unit（如果必须要这么做，请将 End 节点更换为 Success 或 Fail 节点）')
              }
            }
          })
        }
      })
    }
  }

  const switchBlockValidation = () => {
    let switchBlockAll = self.outerDiagram.findNodesByExample({ 'category': 'switchBlock' })

    switchBlockAll.iterator.each(node => {
      let switchBlockLinksInto = node.findLinksInto()
      let switchBlockLinksOutOf = node.findLinksOutOf()
      if (switchBlockLinksInto.count < 1) {
        myDiagramEventValidationHint.add('SwitchBlock至少有一条被指向链接')
      }
      if (switchBlockLinksOutOf.count < 2) {
        myDiagramEventValidationHint.add('SwitchBlock至少有两条指向链接')
      }

      switchBlockLinksInto.each(link => {
        let preNormalBlockData = link.fromNode.data
        if (preNormalBlockData.category === 'normalBlock') {
          // self.outerDiagram.model.setDataProperty(preNormalBlockData, 'star', true)
          let imgToolUnits = preNormalBlockData.unitLists.nodeDataArray.filter(item => item.category === 'Unit' && item.unitMsg.execModName === 'IMGTOOL')
          if (!imgToolUnits.length) {
            myDiagramEventValidationHint.add('SwitchBlock 节点前的 NormalBlock 未包含类型为 "图像识别" 的 Unit')
          }
        }
      })

      let elseNum = 0
      let textOfLinksOutof = {}
      switchBlockLinksOutOf.iterator.each(link => {
        if (link.data.text in textOfLinksOutof) {
          myDiagramEventValidationHint.add('由 SwitchBlock 出发的链接不能拥有重复的值')
        } else {
          textOfLinksOutof[link.data.text] = 1
        }
        let linkVal = link.data
        if (linkVal.visible && !linkVal.text) {
          elseNum++
        } else if (linkVal.visible && linkVal.text.replace(/^\s+|\s+$/g, '') === 'else') elseNum++
      })
      if (elseNum !== 1) myDiagramEventValidationHint.add('SwitchBlock 有且只有一条包含 else 的指向链接,其他链接需要写入相应 token 值')
    })
  }

  const normalBlockValidation = () => {
    let normalBlockAll = self.outerDiagram.findNodesByExample({ 'category': 'normalBlock' })

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

  if (self.outerDiagram.links.count === 0) {
    myDiagramEventValidationHint.add('缺少链接关系')
  }
  if (self.outerDiagram.nodes.count === 0) {
    myDiagramEventValidationHint.add('还未对流程图进行编辑！')
  } else {
    startValidation()
    endValidation()
    switchBlockValidation()
    normalBlockValidation()
  }

  return myDiagramEventValidationHint
}
