let state = {
  unitData: {
    unitName: '',
    unitType: '',
    unitMsg: null
  }
}

let mutations = {
  setUnitData (state, unitData) {
    state.unitData = unitData
  },
  setUnitName (state, unitName) {
    state.unitData.unitName = unitName
  },
  setUnitMsg (state, unitContent) {
    state.unitData.unitMsg = JSON.parse(unitContent)
  },
  addUnitItem (state, data) {
    data.itemData.content = data.itemData.content.replace(/Tmach.*? /g, 'Tmach ')
    state.unitData.unitMsg.execCmdDict.execCmdList.splice(data.itemIndex + 1, 0, data.itemData)
  },
  removeUnitItem (state, itemIndex) {
    state.unitData.unitMsg.execCmdDict.execCmdList.splice(itemIndex, 1)
  },
  setUnitItem (state, data) {
    let unitType = state.unitData.unitType
    if (unitType === 'ADBC') {
      state.unitData.unitMsg.execCmdDict.execCmdList.splice(data.itemName, 1, data.itemContent)
    }
    if (unitType === 'IMGTOOL') {
      state.unitData.unitMsg.execCmdDict[data.itemName] = data.itemContent
    }
  }
}

let getters = {
  unitItemsData (state) {
    if (!state.unitData.unitMsg) return []
    let { unitMsg } = state.unitData
    let unitItemsData = []
    let unitType = unitMsg.execModName
    if (unitType === 'IMGTOOL') {
      Object.keys(unitMsg.execCmdDict).forEach((execCmdDictKey) => {
        if (unitMsg.execCmdDict[execCmdDictKey].type !== 'noChange') {
          unitItemsData.push({
            'itemName': execCmdDictKey,
            'itemContent': JSON.parse(JSON.stringify(unitMsg.execCmdDict[execCmdDictKey]))
          })
        }
      })
    } else {
      unitMsg.execCmdDict.execCmdList.forEach((val, index) => {
        if (val.type !== 'noChange') {
          unitItemsData.push({
            'itemName': index,
            'itemContent': JSON.parse(JSON.stringify(val))
          })
        }
      })
    }
    return unitItemsData
  },
  unitContent (state) {
    return JSON.stringify(state.unitData.unitMsg, null, 2)
  },
  unitType (state) {
    return state.unitData.unitType
  },
  unitNodeKey (state) {
    return state.unitData.unitNodeKey
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  getters
}
