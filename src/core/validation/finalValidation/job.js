export function jobFlowValidation (vueObj) {
  const self = vueObj
  // 事件校验提示
  let myDiagramEventValidationHint = new Set()

  const startValidation = () => {
    let startAll = self.myDiagram.findNodesByExample({ 'category': 'Start' })

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
    let endAll = self.myDiagram.findNodesByExample({ 'category': 'End' })

    if (endAll.count <= 0) {
      myDiagramEventValidationHint.add('缺少End')
    } else {
      endAll.iterator.each(node => { // 遍历所有的end节点
        let endLinksInto = node.findLinksInto()
        if (endLinksInto.count <= 0) {
          myDiagramEventValidationHint.add('End至少有一条被指向链接')
        }
      })
    }
  }

  const switchBlockValidation = () => {
    let switchBlockAll = self.myDiagram.findNodesByExample({ 'category': 'switchBlock' })

    switchBlockAll.iterator.each(node => {
      let switchBlockLinksInto = node.findLinksInto()
      let switchBlockLinksOutOf = node.findLinksOutOf()
      if (switchBlockLinksInto.count < 1) {
        myDiagramEventValidationHint.add('Switch block至少有一条被指向链接')
      }
      if (switchBlockLinksOutOf.count < 2) {
        myDiagramEventValidationHint.add('Switch block至少有两条指向链接')
      }

      let elseNum = 0

      node.findLinksOutOf().iterator.each(link => {
        let linkVal = link.data
        if (linkVal.visible && !linkVal.text) {
          elseNum++
        } else if (linkVal.visible && linkVal.text.replace(/^\s+|\s+$/g, '') === 'else') elseNum++
      })

      if (elseNum !== 1) myDiagramEventValidationHint.add('Switch block有且只有一条包含else的指向链接,其他链接需要写入相应token值')
    })
  }

  const normalBlockValidation = () => {
    let normalBlockAll = self.myDiagram.findNodesByExample({ 'category': 'normalBlock' })

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

  if (self.myDiagram.links.count === 0) {
    myDiagramEventValidationHint.add('缺少链接关系')
  }
  if (self.myDiagram.nodes.count === 0) {
    myDiagramEventValidationHint.add('还未对流程图进行编辑！')
  } else {
    startValidation()
    endValidation()
    switchBlockValidation()
    normalBlockValidation()
  }

  return myDiagramEventValidationHint
}
