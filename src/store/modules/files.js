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
    //删除一个block时吧对应的block里的资源文件删除（不删png）
    if (action === 'deleteNormalResFiles') {
      //data:index  删除normalBlock时，接受的是normal的key值
      state.resFiles = state.resFiles.filter(file=>{
        let key = null
        if(file.type==="json"){
          key = parseInt(file.name.split("_")[0])
        }
        return file.type!=="json" || key!==data
      })
      state.resFiles.forEach((item,index)=>{
        item.index = index
      })
    }
    //data:{ unitKey:key, normalKey:normalKey }  删除unit时，接受的是unit的key值和unit对应的normal的key
    if (action === 'deleteUnitResFiles') {
      state.resFiles = state.resFiles.filter(file=>{
        let key = []
        if(file.type==="json"){
          key = file.name.split("_")
        }
        return data.normalKey!==parseInt(key[0]) || (data.normalKey===parseInt(key[0]) && parseInt(key[1])!==data.unitKey)  || file.type!=="json"
      })
      state.resFiles.forEach((item,index)=>{
        item.index = index
      })
    }
    //data:{ unitKey[key], normalKey:normalKey }  删除unitList时，接受的是unit的key值集合和unit对应的normal的key
    if (action === 'deleteUnitListResFiles') {
      state.resFiles = state.resFiles.filter(file=>{
        let key = []
        if(file.type==="json"){
          key = file.name.split("_")
        }
        return data.normalKey!==parseInt(key[0]) || (data.normalKey===parseInt(key[0]) && !data.unitKey.includes(parseInt(key[1]))) || file.type!=="json"
      })
      state.resFiles.forEach((item,index)=>{
        item.index = index
      })
    }
  },
  handleCurFile (state, { action, data }) {
    if (action === 'setCurFile') {
      if (data.dirty) {
        if (data.index !== -1) {
          state.curFile = state.resFiles[data.index]
          state.curFile.name = data.name
        }else
          state.curFile = data
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
