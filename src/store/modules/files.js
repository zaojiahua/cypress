let state = {
  resFiles: [],
  curFile: null,
  duplicatedFile: null,
  showResFileModal: false
}

let mutations = {
  handleResFiles (state, { action, data }) {
    if (action === 'setResFiles') {
      state.resFiles = data
    }
    if (action === 'addResFile') {
      if (data.index !== -1) {
        state.resFiles.splice(data.index, 1, data)
      } else {
        state.resFiles.push(data)
      }
    }
    if (action === 'removeResFile') {
      state.resFiles.splice(data, 1)
      for (let i = data; i < state.resFiles.length; i++) {
        state.resFiles[i].index--
      }
    }
    if (action === 'clearResFiles') {
      state.resFiles = []
    }
  },
  handleCurFile (state, { action, data }) {
    if (action === 'setCurFile') {
      if (data.dirty) {
        if (data.index !== -1) {
          state.curFile = state.resFiles[data.index]
          state.curFile.name = data.name
        }
      } else {
        state.curFile = data
      }
    }
    if (action === 'addCurFile') {
      if (!state.curFile) return
      let { dirty, index } = state.curFile
      if (!dirty) {
        state.curFile.dirty = true
        if (index !== -1) {
          state.resFiles.splice(index, 1, state.curFile)
        } else {
          state.curFile.index = state.resFiles.length
          state.resFiles.push(state.curFile)
        }
      }
    }
    if (action === 'removeCurFile') {
      state.curFile = null
    }
  },
  setShowResFileModal (state) {
    state.showResFileModal = !state.showResFileModal
  }
}

let getters = {
  resFilesName (state) {
    return state.resFiles.map(item => item.name)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  getters
}
