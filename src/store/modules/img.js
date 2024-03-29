import files from './files'

let state = {
  imgRecRate: 0.99, // 图片识别率
  coordinates: [], // 选取区域的信息保存在这里
  absCoordinates: null // 选点的位置(可以是相对或则比例（绝对）)
}

let mutations = {
  handleCoordinate (state, { action, data }) {
    if (action === 'add') {
      state.coordinates.push(data)
    }
    if (action === 'remove') {
      state.coordinates.splice(data, 1)
    }
    if (action === 'clear') {
      state.coordinates = []
    }
  },
  setAbsoluteCoordinates (state, absCoordinates) {
    state.absCoordinates = absCoordinates
  },
  setImgRecRate (state, imgRecRate) {
    state.imgRecRate = imgRecRate
  },
  setCoordinateAndImgRecRate (state, name) {
    state.coordinates = []
    let areasData
    let { resFiles } = files.state.resFiles
    for (let i = 0; i < resFiles.length; i++) {
      if (resFiles[i].name === name) {
        areasData = JSON.parse(resFiles[i].file)
        break
      }
    }
    for (let key in areasData) {
      if (key === 'threshold') {
        state.imgRecRate = areasData[key]
      }
      if (key.startsWith('area')) {
        let coordinate = {}
        coordinate.coordinate_a = areasData[key].splice(0, 2).join(',')
        coordinate.coordinate_b = areasData[key].join(',')
        state.coordinates.push(coordinate)
      }
    }
  }
}

let getters = {
  imgRecRate (state) {
    return state.imgRecRate * 100
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  getters
}
