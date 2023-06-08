export function blockFlowValidation (vueObj) {
  const self = vueObj

  let blockDiagramHint = new Set()

  const entryValidation = () => {
    let entryAll = self.innerDiagram.findNodesByExample({ 'category': 'Start' })

    if (entryAll.count !== 1) {
      blockDiagramHint.add(self.$t('goInit.entryValidation_1'))
    } else {
      entryAll.iterator.each(node => {
        let entryLinksOutOf = node.findLinksOutOf()
        if (entryLinksOutOf.count < 1) {
          blockDiagramHint.add(self.$t('goInit.entryValidation_2'))
        }
      })
    }
  }

  const exitValidation = () => {
    let exitAll = self.innerDiagram.findNodesByExample({ 'category': 'End' })

    if (exitAll.count !== 1) {
      blockDiagramHint.add(self.$t('goInit.exitValidation_1'))
    } else {
      exitAll.iterator.each(node => {
        let exitLinksInto = node.findLinksInto()
        if (exitLinksInto.count !== 1) {
          blockDiagramHint.add(self.$t('goInit.exitValidation_2'))
        }
      })
    }
  }

  const unitListValidation = () => {
    let unitListAll = self.innerDiagram.findNodesByExample({ 'category': 'UnitList' })

    if (unitListAll.count < 1) {
      blockDiagramHint.add(self.$t('goInit.unitListValidation_1'))
    } else {
      unitListAll.iterator.each(node => {
        let unitListLinksInto = node.findLinksInto()
        let unitListLinksOutOf = node.findLinksOutOf()
        if (unitListLinksInto.count !== 1) {
          blockDiagramHint.add(self.$t('goInit.unitListValidation_2'))
        }
        if (unitListLinksOutOf.count !== 1) {
          blockDiagramHint.add(self.$t('goInit.unitListValidation_3'))
        }
        // https://gojs.net/latest/api/symbols/Group.html#memberParts
        if (node.memberParts.count < 1) {
          blockDiagramHint.add(self.$t('goInit.unitListValidation_4'))
        } else {
          node.memberParts.iterator.each(part => {
            if (part.data.category !== 'Unit') {
              blockDiagramHint.add(self.$t('goInit.unitListValidation_5'))
            }
          })
        }
      })
    }
  }

  const unitValidation = () => {
    let unitAll = self.innerDiagram.findNodesByExample({ 'category': 'Unit' })

    if (unitAll.count === 0) {
      blockDiagramHint.add(self.$t('goInit.unitValidation_1'))
    } else {
      unitAll.iterator.each(function (node) {
        if (!node.data.unitMsg) {
          blockDiagramHint.add(self.$t('goInit.unitValidation_2'))
        }
      })
    }
  }

  if (self.innerDiagram.links.count === 0) {
    blockDiagramHint.add(self.$t('goInit.validation_1'))
  }
  if (self.innerDiagram.nodes.length === 0) {
    blockDiagramHint.add(self.$t('goInit.validation_2'))
  } else {
    entryValidation()
    exitValidation()
    unitListValidation()
    unitValidation()
  }

  return blockDiagramHint
}
