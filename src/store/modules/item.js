let state = {
  editing: false,
  itemData: { // 点击unitItem时获取
    itemName: '',
    itemIndex: undefined,
    itemContent: ''
  },
  saveToFinalResult: false, // 是否保存到最终结果
  areasInfo: { // 用于在界面上标识选取的区域
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
      case 'clearItemData':
        state.itemData = null
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
    if (!state.itemData) return
    return state.itemData.itemContent.type
  },
  itemName (state) {
    if (!state.itemData) return
    return state.itemData.itemName
  },
  isUxInput (state) {
    if (!state.itemData) return
    return state.itemData.itemContent.type === 'uxInput'
  },
  isPicInput (state) {
    if (!state.itemData) return
    return state.itemData.itemContent.type === 'picInput'
  },
  isOutputPicture (state) {
    if (!state.itemData) return
    return state.itemData.itemContent.type === 'outputPicture'
  },
  isOutputFile (state) {
    if (!state.itemData) return
    return state.itemData.itemContent.type === 'outputFile'
  },
  isJobResourcePicture (state) {
    if (!state.itemData) return
    return state.itemData.itemContent.type === 'jobResourcePicture'
  },
  isJobResourceFile (state) {
    if (!state.itemData) return
    return state.itemData.itemContent.type === 'jobResourceFile'
  },
  isInputFile (state) {
    if (!state.itemData) return
    return state.itemData.itemContent.type === 'inputFile'
  },
  isInputPicture (state) {
    if (!state.itemData) return
    return state.itemData.itemContent.type === 'inputPicture'
  },
  isOutputVideo (state) {
    if (!state.itemData) return
    return state.itemData.itemContent.type === 'outputVideo'
  },
  isInputVideo (state) {
    if (!state.itemData) return
    return state.itemData.itemContent.type === 'inputVideo'
  },
  isJobResourceFileWithDefaultValue (state) {
    if (!state.itemData) return
    return state.itemData.itemContent.type === 'jobResourceFileWithDefaultValue'
  },
  curItemMeaning (state) {
    if (!state.itemData) return
    return state.itemData.itemContent.meaning
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  getters
}
