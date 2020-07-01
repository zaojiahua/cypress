let state = {
  unitTypes: [],
  itemHandBook: {
    method: undefined,
    index: undefined,
    data: undefined
  },
  openRawUnit: true
}

let mutations = {
  setUnitTypes (state, unitTypes) {
    state.unitTypes = unitTypes
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
