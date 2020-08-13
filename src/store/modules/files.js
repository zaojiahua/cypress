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
  currentFile: null,
  isDuplicatedFile: false,
  duplicatedFile: null,
  resFilesName,
  showResFileModal: false
}

let mutations = {
  setResFiles (state, resFiles) {
    state.resFiles = resFiles
  },
  addResFile (state, resFile) {
    let resFiles = state.resFiles
    let index = resFiles.findIndex(file => file.name === resFile.name)
    if (index !== -1) {
      if (resFile.name !== 'FILES_NAME_CONFIG.json') {
        state.isDuplicatedFile = true
        state.duplicatedFile = {
          index,
          resFile
        }
      } else {
        state.resFiles.splice(index, 1, resFile)
      }
      return
    }
    state.resFiles.push(resFile)
    if (resFile.type === 'png') {
      state.currentFile = resFile
    }
  },
  removeResFile (state, index) {
    state.resFiles.splice(index, 1)
  },
  clearResFiles (state) {
    state.resFiles = []
  },
  setCurrentFile (state, data) {
    if (data.byName) {
      for (let i = 0; i < state.resFiles.length; i++) {
        if (state.resFiles[i].name === data.name) {
          state.currentFile = state.resFiles[i]
          break
        }
      }
    } else {
      state.currentFile = data.currentFileInfo
    }
  },
  removeCurrentFile (state) {
    state.currentFile = null
  },
  setIsDuplicatedFile (state, isDuplicatedFile) {
    state.isDuplicatedFile = isDuplicatedFile
  },
  renameDuplicatedFile (state, newName) {
    if (!newName.endsWith(state.duplicatedFile.resFile.type)) {
      state.duplicatedFile.resFile.name = newName + '.' + state.duplicatedFile.resFile.type
    } else {
      state.duplicatedFile.resFile.name = newName
    }
    state.resFiles.push(state.duplicatedFile.resFile)
    state.isDuplicatedFile = false
    state.currentFile = state.duplicatedFile.resFile
  },
  setDuplicatedFile (state) {
    state.resFiles.splice(state.duplicatedFile.index, 1, state.duplicatedFile.resFile)
    state.isDuplicatedFile = false
    state.currentFile = state.duplicatedFile.resFile
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

}

export default {
  namespaced: true,
  state,
  mutations,
  getters
}
