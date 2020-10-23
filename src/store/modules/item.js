let state = {
  editing: false,
  itemData: {
    itemName: '',
    itemIndex: undefined,
    itemContent: ''
  },
  saveToFinalResult: false,
  areasInfo: {
    data: [],
    idx: undefined
  }
}

let mutations = {
  handleItemData (state, { action, data }) {
    switch (action) {
      case 'setItemData':
        state.itemData = data
        break
    }
  },
  handleShowItemEditor (state, editing) {
    state.editing = editing
  },
  setCurrentItem (state, unitItem) {
    state.itemData = unitItem
  },
  handleSaveToFinal (state, toggle) {
    state.saveToFinalResult = toggle
  },
  setAreasInfo (state, val) {
    state.areasInfo = val
  }
}

let getters = {
  itemType (state) {
    return state.itemData.itemContent.type
  },
  itemName (state) {
    return state.itemData.itemName
  },
  isUxInput (state) {
    return state.itemData.itemContent.type === 'uxInput'
  },
  isPicInput (state) {
    return state.itemData.itemContent.type === 'picInput'
  },
  isOutputPicture (state) {
    return state.itemData.itemContent.type === 'outputPicture'
  },
  isOutputFile (state) {
    return state.itemData.itemContent.type === 'outputFile'
  },
  isJobResourcePicture (state) {
    return state.itemData.itemContent.type === 'jobResourcePicture'
  },
  isJobResourceFile (state) {
    return state.itemData.itemContent.type === 'jobResourceFile'
  },
  isInputFile (state) {
    return state.itemData.itemContent.type === 'inputFile'
  },
  isInputPicture (state) {
    return state.itemData.itemContent.type === 'inputPicture'
  },
  isOutputVideo (state) {
    return state.itemData.itemContent.type === 'outputVideo'
  },
  isInputVideo (state) {
    return state.itemData.itemContent.type === 'inputVideo'
  },
  curItemMeaning (state) {
    return state.itemData.itemContent.meaning
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  getters
}
