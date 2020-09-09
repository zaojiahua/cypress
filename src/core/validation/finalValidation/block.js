export function blockFlowValidation (vueObj) {
  const self = vueObj

  let blockDiagramHint = new Set()

  const entryValidation = () => {
    let entryAll = self.innerDiagram.findNodesByExample({ 'category': 'Start' })

    if (entryAll.count !== 1) {
      blockDiagramHint.add('有且只有一个Entry')
    } else {
      entryAll.iterator.each(node => {
        let entryLinksOutOf = node.findLinksOutOf()
        if (entryLinksOutOf.count < 1) {
          blockDiagramHint.add('Entry缺少指向链接')
        }
      })
    }
  }

  const exitValidation = () => {
    let exitAll = self.innerDiagram.findNodesByExample({ 'category': 'End' })

    if (exitAll.count !== 1) {
      blockDiagramHint.add('有且只有一个Exit')
    } else {
      exitAll.iterator.each(node => {
        let exitLinksInto = node.findLinksInto()
        if (exitLinksInto.count !== 1) {
          blockDiagramHint.add('Exit缺少被指向链接')
        }
      })
    }
  }

  const unitListValidation = () => {
    let unitListAll = self.innerDiagram.findNodesByExample({ 'category': 'UnitList' })

    if (unitListAll.count < 1) {
      blockDiagramHint.add('缺少UnitList')
    } else {
      unitListAll.iterator.each(node => {
        let unitListLinksInto = node.findLinksInto()
        let unitListLinksOutOf = node.findLinksOutOf()
        if (unitListLinksInto.count !== 1) {
          blockDiagramHint.add('UnitList有且只有一条被指向链接')
        }
        if (unitListLinksOutOf.count !== 1) {
          blockDiagramHint.add('UnitList有且只有一条指向链接')
        }
        // https://gojs.net/latest/api/symbols/Group.html#memberParts
        if (node.memberParts.count < 1) {
          blockDiagramHint.add('UnitList内部不能为空')
        } else {
          node.memberParts.iterator.each(part => {
            if (part.data.category !== 'Unit') {
              blockDiagramHint.add('UnitList中只能包含Unit')
            }
          })
        }
      })
    }
  }

  const unitValidation = () => {
    let unitAll = self.innerDiagram.findNodesByExample({ 'category': 'Unit' })

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

  if (self.innerDiagram.links.count === 0) {
    blockDiagramHint.add('缺少链接关系')
  }
  if (self.innerDiagram.nodes.length === 0) {
    blockDiagramHint.add('还未对流程图进行编辑！')
  } else {
    entryValidation()
    exitValidation()
    unitListValidation()
    unitValidation()
  }

  return blockDiagramHint
}
