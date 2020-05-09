import files from './files'

let state = {
  imgRecRate: 0.99,
  coordinates: [],
  absoulteCoordinates: null
}

let mutations = {
  addCoordinate (state, coordinate) {
    state.coordinates.push(coordinate)
  },
  removeCoordinate (state, index) {
    state.coordinates.splice(index, 1)
  },
  clearCoordinates (state) {
    state.coordinates = []
  },
  setAbsoluteCoordinates (state, absoulteCoordinates) {
    state.absoulteCoordinates = absoulteCoordinates
  },
  setImgRecRate (state, imgRecRate) {
    state.imgRecRate = imgRecRate
  },
  setCoordinateAndImgRecRate (state, name) {
    state.coordinates = []
    let areasData
    let { resFiles } = files.state.resFiles
    console.log(name, resFiles)
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
