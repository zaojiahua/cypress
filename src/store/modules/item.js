let state = {
  showItemEditor: false,
  currentItem: {
    itemName: '',
    itemContent: ''
  }
}

let mutations = {
  setShowItemEditor (state, showItemEditor) {
    state.showItemEditor = showItemEditor
  },
  setCurrentItem (state, unitItem) {
    state.currentItem = unitItem
  }
}

let getters = {
  itemType (state) {
    return state.currentItem.itemContent.type
  },
  isUxInput (state) {
    return state.currentItem.itemContent.type === 'uxInput'
  },
  isPicInput (state) {
    return state.currentItem.itemContent.type === 'picInput'
  },
  isOutputPicture (state) {
    return state.currentItem.itemContent.type === 'outputPicture'
  },
  isOutputFile (state) {
    return state.currentItem.itemContent.type === 'outputFile'
  },
  isJobResourcePicture (state) {
    return state.currentItem.itemContent.type === 'jobResourcePicture'
  },
  isJobResourceFile (state) {
    return state.currentItem.itemContent.type === 'jobResourceFile'
  },
  isInputFile (state) {
    return state.currentItem.itemContent.type === 'inputFile'
  },
  isInputPicture (state) {
    return state.currentItem.itemContent.type === 'inputPicture'
  },
  isOutputVideo (state) {
    return state.currentItem.itemContent.type === 'outputVideo'
  },
  isInputVideo (state) {
    return state.currentItem.itemContent.type === 'inputVideo'
  },
  currentItemMeaning (state) {
    return state.currentItem.itemContent.meaning
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  getters
}
