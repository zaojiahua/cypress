let state = {
  unitLists: null,
  unitTypes: [],
  itemHandBook: {
    method: undefined,
    index: undefined,
    data: undefined
  },
  openRawUnit: true
}

let mutations = {
  setUnitLists (state, data) {
    state.unitLists = data
    state.unitTypes = Object.keys(data)
  },
  setItemHandBook (state, handbook) {
    state.itemHandBook = handbook
  },
  handleOpenRawUnit (state, open) {
    state.openRawUnit = open
  }
}

export default {
  namespaced: true,
  state,
  mutations
}
