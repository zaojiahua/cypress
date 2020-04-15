import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  // namaspaced: true, // 解决不同模块命名冲突的问题，之后在不同页面中引入getter、actions、mutations时，需要加上所属的模块名
  state: {
    // 设备信息相关
    selectedDeviceInfo: null,
    jobInfoValid: false,
    jobInfo: {},
    // 抽屉
    showDrawer: false,
    // UnitEditor
    unitEditorData: {
      unitName: '',
      unitType: '',
      unitMsg: null
    },
    showItemEditor: false,
    currentUnitItem: {
      itemName: '',
      itemContent: ''
    },
    resFile: [],
    currentFile: null,
    coordinates: [],
    absoluteCoordinates: null,
    imageRecognitionRate: 0.99,
    isDuplicateName: false,
    duplicateFile: null,
    isLoading: false,
    resFilesName: [
      {
        title: '文件名称',
        children: ['text']
      },
      {
        title: '图片名称',
        children: ['snap']
      }
    ]
  },
  mutations: {
    setSelectedDeviceInfo (state, deviceInfo) {
      state.selectedDeviceInfo = deviceInfo
    },
    setJobInfo (state, jobInfo) {
      state.jobInfo = jobInfo
    },
    handleShowDrawer (state) {
      state.showDrawer = !state.showDrawer
    },
    setJobInfoValid (state, jobInfoValid) {
      state.jobInfoValid = jobInfoValid
    },
    setUnitEditorData (state, data) {
      state.unitEditorData = data
    },
    handleUnitName (state, unitName) {
      state.unitEditorData.unitName = unitName
    },
    addNewItem (state, data) {
      data.itemData.content = data.itemData.content.replace(/Tmach.*? /g, 'Tmach ')
      state.unitEditorData.unitMsg.execCmdDict.execCmdList.splice(data.itemIndex + 1, 0, data.itemData)
    },
    removeItem (state, itemIndex) {
      state.unitEditorData.unitMsg.execCmdDict.execCmdList.splice(itemIndex, 1)
    },
    saveUnitContent (state, unitContent) {
      state.unitEditorData.unitMsg = JSON.parse(unitContent)
    },
    saveUnitItem (state, data) {
      let unitType = state.unitEditorData.unitType
      if (unitType === 'ADBC') {
        state.unitEditorData.unitMsg.execCmdDict.execCmdList.splice(data.itemName, 1, data.itemContent)
      }
      if (unitType === 'IMGTOOL') {
        state.unitEditorData.unitMsg.execCmdDict[data.itemName] = data.itemContent
      }
    },
    handleCurrentUnitItem (state, data) {
      state.currentUnitItem = data
    },
    handleShowItemEditor (state, flag) {
      state.showItemEditor = flag
    },
    handleResFile (state, resFile) {
      state.resFile = resFile
    },
    removeResFile (state, index) {
      state.resFile.splice(index, 1)
    },
    addResFile (state, fileInfo) {
      let resFile = state.resFile
      let index = resFile.findIndex(file => file.name === fileInfo.name)
      if (index !== -1) {
        if (fileInfo.name !== 'FILES_NAME_CONFIG.json') {
          state.isDuplicateName = true
          state.duplicateFile = {
            index: i,
            fileInfo
          }
        } else {
          state.resFile.splice(index, 1, fileInfo)
        }
        return
      }
      state.resFile.push(fileInfo)
      if (fileInfo.type === 'png') {
        state.currentFile = fileInfo
      }
    },
    setCurrentFile (state, data) {
      if (data.byName) {
        for (let i = 0; i < state.resFile.length; i++) {
          if (state.resFile[i].name === data.name) {
            state.currentFile = state.resFile[i]
            break
          }
        }
      } else {
        state.currentFile = data.currentFileInfo
      }
    },
    clearCurrentFile (state) {
      state.currentFile = null
    },
    addCoordinate (state, coordinate) {
      state.coordinates.push(coordinate)
    },
    clearCoordinate (state) {
      state.coordinates = []
    },
    setCoordinateAndImageRecognitionRate (state, name) {
      state.coordinates = []
      let areaFileData
      for (let i = 0; i < state.resFile.length; i++) {
        if (state.resFile[i].name === name) {
          areaFileData = JSON.parse(state.resFile[i].file)
          break
        }
      }
      for (let key in areaFileData) {
        if (key === 'threshold') {
          state.imageRecognitionRate = areaFileData[key]
        }
        if (key.startsWith('area')) {
          let coordinate = {}
          coordinate.coordinate_a = areaFileData[key].splice(0, 2).join(',')
          coordinate.coordinate_b = areaFileData[key].join(',')
          state.coordinates.push(coordinate)
        }
      }
    },
    removeCoordinate (state, index) {
      state.coordinates.splice(index, 1)
    },
    handleAbsoluteCoordinates (state, absoluteCoordinates) {
      state.absoluteCoordinates = absoluteCoordinates
    },
    handleImageRecognitionRate (state, imageRecognitionRate) {
      state.imageRecognitionRate = imageRecognitionRate
    },
    handleIsDuplicateName (state, flag) {
      state.isDuplicateName = flag
    },
    overwriteDuplicateFile (state) {
      state.resFile.splice(state.duplicateFile.index, 1, state.duplicateFile.fileInfo)
      state.isDuplicateName = false
      state.currentFile = state.duplicateFile.fileInfo
    },
    renameDuplicateFile (state, newName) {
      if (!newName.endsWith(state.duplicateFile.fileInfo.type)) {
        state.duplicateFile.fileInfo.name = newName + '.' + state.duplicateFile.fileInfo.type
      } else {
        state.duplicateFile.fileInfo.name = newName
      }
      state.resFile.push(state.duplicateFile.fileInfo)
      state.isDuplicateName = false
      state.currentFile = state.duplicateFile.fileInfo
    },
    handleIsLoading (state, flag) {
      state.isLoading = flag
    },
    handleResFilesName (state, data) {
      state.resFilesName[data.index].children.push(data.name)
    },
    setResFilesName (state, data) {
      state.resFilesName = JSON.parse(data)
    }
  },
  actions: {

  },
  getters: {
    selectedDeviceInfo (state) {
      if (state.selectedDeviceInfo) {
        return [
          {
            device_name: state.selectedDeviceInfo.device_name,
            phone_model: state.selectedDeviceInfo.phone_model,
            android_version: state.selectedDeviceInfo.android_version,
            rom_version: state.selectedDeviceInfo.rom_version,
            ip_address: state.selectedDeviceInfo.ip_address,
            device_label: state.selectedDeviceInfo.device_label
          }
        ]
      } else {
        return []
      }
    },
    unitItemsData (state) {
      if (!state.unitEditorData.unitMsg) return []
      let unitMsg = state.unitEditorData.unitMsg
      let unitItemsData = []
      let unitType = unitMsg.execModName
      if (unitType === 'IMGTOOL') {
        Object.keys(unitMsg.execCmdDict).forEach(execCmdDictKey => {
          if (unitMsg.execCmdDict[execCmdDictKey].type !== 'noChange') {
            unitItemsData.push({
              'itemName': execCmdDictKey,
              'itemContent': JSON.parse(JSON.stringify(unitMsg.execCmdDict[execCmdDictKey]))
            })
          }
        })
      } else {
        unitMsg.execCmdDict.execCmdList.forEach((val, index) => {
          if (val.type !== 'noChange') {
            unitItemsData.push({
              'itemName': index,
              'itemContent': JSON.parse(JSON.stringify(val))
            })
          }
        })
      }
      return unitItemsData
    },
    unitContent (state) {
      return JSON.stringify(state.unitEditorData.unitMsg, null, 2)
    },
    itemType (state) {
      return state.currentUnitItem.itemContent.type
    },
    isUxInput (state) {
      return state.currentUnitItem.itemContent.type === 'uxInput'
    },
    isPicInput (state) {
      return state.currentUnitItem.itemContent.type === 'picInput'
    },
    isOutputPicture (state) {
      return state.currentUnitItem.itemContent.type === 'outputPicture'
    },
    isOutputFile (state) {
      return state.currentUnitItem.itemContent.type === 'outputFile'
    },
    isJobResourcePicture (state) {
      return state.currentUnitItem.itemContent.type === 'jobResourcePicture'
    },
    isJobResourceFile (state) {
      return state.currentUnitItem.itemContent.type === 'jobResourceFile'
    },
    isInputFile (state) {
      return state.currentUnitItem.itemContent.type === 'inputFile'
    },
    isInputPicture (state) {
      return state.currentUnitItem.itemContent.type === 'inputPicture'
    },
    currentUnitItemMeaning (state) {
      return state.currentUnitItem.itemContent.meaning
    },
    imageRecognitionRate (state) {
      return state.imageRecognitionRate * 100
    },
    isLoading (state) {
      return state.isLoading
    },
    currentFile (state) {
      return state.currentFile
    }
  }
})
