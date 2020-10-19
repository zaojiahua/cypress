import _ from 'lodash'
import CONST from '../../constant/constant'

let state = {
  unitData: _.extend({}, CONST.DEFAULT_UNIT_DATA),
  unitLists: null,
  unitTypes: [],
  itemHandBook: {
    method: undefined,
    index: undefined,
    data: undefined
  }
}

let mutations = {
  handleUnitData (state, { action, data }) {
    switch (action) {
      case 'setUnitData':
        state.unitData = data
        break
      case 'setUnitMsg':
        state.unitData.unitMsg = data
        break
    }
  },
  setUnitLists (state, data) {
    state.unitLists = data
    state.unitTypes = Object.keys(data)
  },
  setItemHandBook (state, handbook) {
    state.itemHandBook = handbook
  }
}

export default {
  namespaced: true,
  state,
  mutations
}
