import CONST from 'constant/constant'
export function jobFlowValidation (vueObj) {
  const self = vueObj
  // 事件校验提示
  let myDiagramEventValidationHint = new Set()

  const startValidation = () => {
    let startAll = self.outerDiagram.findNodesByExample({ 'category': 'Start' })

    if (startAll.count !== 1) {
      myDiagramEventValidationHint.add(self.$t('goInit.startValidation_1'))
    } else {
      startAll.iterator.each(node => {
        let startLinksOutOf = node.findLinksOutOf()
        if (startLinksOutOf.count !== 1) {
          myDiagramEventValidationHint.add(self.$t('goInit.startValidation_2'))
        }
      })
    }
  }

  const endValidation = () => {
    let endAll = self.outerDiagram.findNodesByExample({ 'category': 'End' })
    let failResult = self.outerDiagram.findNodesByExample({ 'category': 'Fail' })
    let successResult = self.outerDiagram.findNodesByExample({ 'category': 'Success' })
    let abnormalResult = self.outerDiagram.findNodesByExample({ 'category': 'Abnormal' })

    if (endAll.count <= 0 && failResult.count <= 0 && successResult.count <= 0 && abnormalResult.count <= 0) {
      myDiagramEventValidationHint.add(self.$t('goInit.endValidation_1'))
    } else {
      if(endAll.count > 0){
        endAll.iterator.each(node => { // 遍历所有的end节点
          let endLinksInto = node.findLinksInto()
          if (endLinksInto.count <= 0) {
            myDiagramEventValidationHint.add(self.$t('goInit.endValidation_2'))
          }
        })
      }
      if(failResult.count > 0){
        failResult.iterator.each(node => { // 遍历所有的 fail 节点
          let failLinksInto = node.findLinksInto()
          if (failLinksInto.count <= 0) {
            myDiagramEventValidationHint.add(self.$t('goInit.endValidation_3'))
          }
        })
      }
      if(successResult.count > 0){
        successResult.iterator.each(node => { // 遍历所有的 success节点
          let successLinksInto = node.findLinksInto()
          if (successLinksInto.count <= 0) {
            myDiagramEventValidationHint.add(self.$t('goInit.endValidation_4'))
          }
        })
      }
      if(abnormalResult.count > 0){
        abnormalResult.iterator.each(node => { // 遍历所有的 abnormal 节点
          let abnormalLinksInto = node.findLinksInto()
          if (abnormalLinksInto.count <= 0) {
            myDiagramEventValidationHint.add(self.$t('goInit.endValidation_5'))
          }
        })
      }
    }
  }

  const onlyOneOfFinalResultValidation = () => {
    let finalResultCount = self.outerDiagram.findNodesByExample({ 'category': 'normalBlock','star':CONST.COLORS.RESULT}).count
    if (finalResultCount > 1){
      myDiagramEventValidationHint.add(self.$t('goInit.finalResult'))
    }
  }

  const switchBlockValidation = () => {
    let switchBlockAll = self.outerDiagram.findNodesByExample({ 'category': 'switchBlock' })

    switchBlockAll.iterator.each(node => {
      let switchBlockLinksInto = node.findLinksInto()
      let switchBlockLinksOutOf = node.findLinksOutOf()
      if (switchBlockLinksInto.count < 1) {
        myDiagramEventValidationHint.add(self.$t('goInit.switchValidation_1'))
      }
      if (switchBlockLinksOutOf.count < 2) {
        myDiagramEventValidationHint.add(self.$t('goInit.switchValidation_2'))
      }

      switchBlockLinksInto.each(link => {
        let preNormalBlockData = link.fromNode.data
        if (preNormalBlockData.category === 'normalBlock') {
          // self.outerDiagram.model.setDataProperty(preNormalBlockData, 'star', true)
          let imgToolUnits = JSON.parse(preNormalBlockData.unitLists).nodeDataArray.filter(item => item.category === 'Unit' && CONST.IMGTOOL.has(item.unitMsg.execModName))
          if (!imgToolUnits.length) {
            myDiagramEventValidationHint.add(self.$t('goInit.switchValidation_3'))
          }
        }
      })

      let elseNum = 0
      let textOfLinksOutof = {}
      switchBlockLinksOutOf.iterator.each(link => {
        if (link.data.text in textOfLinksOutof) {
          myDiagramEventValidationHint.add(self.$t('goInit.switchValidation_4'))
        } else {
          textOfLinksOutof[link.data.text] = 1
        }
        let linkVal = link.data
        if (linkVal.visible && !linkVal.text) {
          elseNum++
        } else if (linkVal.visible && linkVal.text.replace(/^\s+|\s+$/g, '') === 'else') elseNum++
      })
      if (elseNum !== 1) myDiagramEventValidationHint.add(self.$t('goInit.switchValidation_5'))
    })
  }

  const normalBlockValidation = () => {
    let normalBlockAll = self.outerDiagram.findNodesByExample({ 'category': 'normalBlock' })
    let jobBlockAll = self.outerDiagram.findNodesByExample({ 'category': 'Job' })
    if (normalBlockAll.count === 0 && jobBlockAll.count === 0) {
      myDiagramEventValidationHint.add(self.$t('goInit.normalValidation_1'))
    } else {
      if (normalBlockAll.count) {
        normalBlockAll.iterator.each(function (node) {
          let normalBlockLinksInto = node.findLinksInto()
          let normalBlockLinksOutOf = node.findLinksOutOf()
          if (normalBlockLinksInto.count < 1) {
            myDiagramEventValidationHint.add(self.$t('goInit.normalValidation_2'))
          }
          if (normalBlockLinksOutOf.count !== 1) {
            myDiagramEventValidationHint.add(self.$t('goInit.normalValidation_3'))
          }
        })
      }
      if (jobBlockAll.count) {
        jobBlockAll.iterator.each(function (node) {
          let jobBlockLinksInto = node.findLinksInto()
          let jobBlockLinksOutOf = node.findLinksOutOf()
          if (jobBlockLinksInto.count < 1) {
            myDiagramEventValidationHint.add(self.$t('goInit.normalValidation_4'))
          }
          if (jobBlockLinksOutOf.count !== 1) {
            myDiagramEventValidationHint.add(self.$t('goInit.normalValidation_5'))
          }
        })
      }
    }
  }

  if (self.outerDiagram.links.count === 0) {
    myDiagramEventValidationHint.add(self.$t('goInit.validation_1'))
  }
  if (self.outerDiagram.nodes.count === 0) {
    myDiagramEventValidationHint.add(self.$t('goInit.validation_2'))
  } else {
    onlyOneOfFinalResultValidation()
    startValidation()
    endValidation()
    switchBlockValidation()
    normalBlockValidation()
  }

  return myDiagramEventValidationHint
}
