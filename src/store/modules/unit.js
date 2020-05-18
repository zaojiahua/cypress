let state = {
  unitTypes: [],
  unitData: {
    unitName: '',
    unitType: '',
    unitMsg: null
  }
}

let mutations = {
  setUnitTypes (state, unitTypes) {
    state.unitTypes = unitTypes
  },
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
    let { unitMsg: { execCmdDict, execCmdDict: { execCmdList } } } = state.unitData
    let target = execCmdList || execCmdDict
    if (Array.isArray(target)) {
      state.unitData.unitMsg.execCmdDict.execCmdList.splice(data.itemName, 1, data.itemContent)
    } else {
      state.unitData.unitMsg.execCmdDict[data.itemName] = data.itemContent
    }
  }
}

let getters = {
  unitItemsData (state) {
    if (!state.unitData.unitMsg) return []
    let { unitMsg: { execCmdDict, execCmdDict: { execCmdList } } } = state.unitData
    let unitItemsData = []
    let source = execCmdList || execCmdDict

    for (let key in source) {
      if (source[key].type !== 'noChange') {
        unitItemsData.push({
          'itemName': key,
          'itemContent': JSON.parse(JSON.stringify(source[key]))
        })
      }
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
