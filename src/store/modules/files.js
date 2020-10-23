import _ from 'lodash'
import CONST from 'constant/constant'

let resFilesName = []
for (let key in CONST.WILL_TOUCH_NAME) {
  resFilesName.push({
    title: CONST.WILL_TOUCH_NAME[key],
    key,
    children: []
  })
}

let state = {
  resFiles: [],
  curFile: null,
  duplicatedFile: null,
  resFilesName,
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
  },
  removeResFile (state, index) {
    state.resFiles.splice(index, 1)
  },
  clearResFiles (state) {
    state.resFiles = []
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
  setCurrentFile (state, data) {
    if (data.byName) {
      for (let i = 0; i < state.resFiles.length; i++) {
        if (state.resFiles[i].name === data.name) {
          state.curFile = state.resFiles[i]
          break
        }
      }
    } else {
      state.curFile = data.currentFileInfo
    }
  },
  addResFilesName (state, data) {
    state.resFilesName[data.index].children.push(data.name)
  },
  setResFilesName (state, filesName) {
    let preNames = JSON.parse(filesName)
    for (let i = 0; i < state.resFilesName.length; i++) {
      if (preNames[i]) {
        Object.assign(state.resFilesName[i], preNames[i])
      } else {
        state.resFilesName[i].children = []
      }
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
