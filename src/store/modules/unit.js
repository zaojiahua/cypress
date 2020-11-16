import _ from 'lodash'
import CONST from '../../constant/constant'

let state = {
  unitData: _.extend({}, CONST.DEFAULT_UNIT_DATA), // 双击unit时获取, 用于unitEditor
  unitLists: null, // unit模板保存在这里
  unitTypes: [] // unit模板的分类保存在这里
}

let mutations = {
  handleUnitData (state, { action, data }) {
    switch (action) {
      case 'setUnitData':
        state.unitData = data
        break
      case 'clearUnitData':
        state.unitData = {}
        break
      case 'setUnitMsg':
        state.unitData.unitMsg = data
        break
      case 'setItemData':
        let { unitMsg: { execCmdDict, execCmdDict: { execCmdList } } } = state.unitData
        let target = execCmdList || execCmdDict
        if (Array.isArray(target)) {
          target.splice(Number(data.itemName), 1, data.itemContent)
        } else {
          target[data.itemName] = data.itemContent
        }
        break
    }
  },
  setUnitLists (state, data) {
    state.unitLists = data
    state.unitTypes = Object.keys(data)
  }
}

let getters = {
  unitKey (state) {
    return state.unitData.unitKey
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  getters
}
