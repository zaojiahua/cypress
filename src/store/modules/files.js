let state = {
  resFiles: [],  //目前文件的类型是使用文件名称后缀
  curFile: null,
  duplicatedFile: null,
  showResFileModal: false,
  imgFormat:['jpg','png','jpeg'],
  videoFormat:['mp4'],
  audioFormat:['mp3'],
  fileFormat:['apk'],
}

let mutations = {
  handleResFiles (state, { action, data }) {
    if (action === 'setResFiles') {
      state.resFiles = data
    }
    if (action === 'addResFile') {
      if (data.index !== -1) {  // 原地修改内容
        state.resFiles.splice(data.index, 1, data)
      } else { // 尾端添加内容
        data.index = state.resFiles.length
        state.resFiles.push(data)
      }
    }
    if (action === 'removeResFile') {  // 删除传入的data是int
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
      if (!dirty) { // 如果是新获取的文件
        state.curFile.dirty = true
        if (index !== -1) { // 存在同名文件则替换
          state.resFiles.splice(index, 1, state.curFile)
        } else { // 否则放入队尾
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
  resFilesName (state) { // 返回resFiles 的name集合，通过获取集合长度可知resFiles长度
    return state.resFiles.map(item => item.name)
  },
  dataURLtoFileFormat (state) { // 返回resFiles 的name集合，通过获取集合长度可知resFiles长度
    return state.imgFormat.concat(state.videoFormat).concat(state.audioFormat)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  getters
}
