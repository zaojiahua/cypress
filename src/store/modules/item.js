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
  handleSaveToFinal (state, toggle) {
    state.saveToFinalResult = toggle
  },
  handleAreasInfo (state, { action, data }) {
    if (action === 'set') {
      state.areasInfo = data
    }
    if (action === 'clear') {
      state.areasInfo = {
        data: [],
        idx: undefined
      }
    }
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
  isJobResourceFileWithDefaultValue (state) {
    return state.itemData.itemContent.type === 'jobResourceFileWithDefaultValue'
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
