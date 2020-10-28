import CONST from 'constant/constant'
import _ from 'lodash'

let state = {
  jobInfo: {},
  preJobInfo: { dirty: false },
  isValidated: false,
  outerDiagramModel: null,
  draftId: undefined,
  draftLabel: undefined,
  normalData: null,
  config: _.cloneDeep(CONST.JOB_DEFAULT_CONFIG)
}

let mutations = {
  handleJobInfo (state, { action, data }) {
    if (action === 'setJobInfo') {
      state.jobInfo = data
      if (!state.preJobInfo.dirty) {
        state.preJobInfo = _.cloneDeep(data)
        state.preJobInfo.dirty = false
      }
    }
    if (action === 'setPreJobInfo') {
      if (!data) state.preJobInfo = { dirty: false }
      else {
        state.preJobInfo = _.cloneDeep(state.jobInfo)
        state.preJobInfo.dirty = false
      }
    }
    if (action === 'recoverJobInfo') {
      if (state.preJobInfo.dirty) {
        state.jobInfo = _.cloneDeep(state.preJobInfo)
        delete state.jobInfo.dirty
      } else {
        state.jobInfo = {}
        state.preJobInfo = { dirty: false }
      }
    }
  },
  setPreJobInfo (state, notClear) {
    if (!notClear) state.preJobInfo = { dirty: false }
    else {
      state.preJobInfo = _.cloneDeep(state.jobInfo)
      state.preJobInfo.dirty = true
    }
  },
  recoverJobInfo (state) {
    if (state.preJobInfo.dirty) {
      state.jobInfo = _.cloneDeep(state.preJobInfo)
      delete state.jobInfo.dirty
    } else {
      state.jobInfo = {}
      state.preJobInfo = { dirty: false }
    }
  },
  setIsValidated (state, isValidated) {
    state.isValidated = isValidated
  },
  setOuterDiagramModel (state, diagramModel) {
    state.outerDiagramModel = diagramModel
    if (diagramModel) {
      let finalResultBlock = JSON.parse(diagramModel).nodeDataArray.filter((val) => {
        return val.category === 'normalBlock' && val.star === CONST.COLORS.RESULT
      })[0]
      if (finalResultBlock) {
        state.config.finalResultKey = finalResultBlock.key
      }
    }
  },
  setDraftId (state, id) {
    state.draftId = id
  },
  setDraftLabel (state, label) {
    state.draftLabel = label
  },
  setNormalData (state, data) {
    state.normalData = JSON.stringify(data, (key, val) => {
      if (key === 'pb') return
      return val
    })
  },
  setNormalKey (state, key) {
    state.normalKey = key
  },
  setJobTestArea (state, data) {
    state.jobInfo.test_area = data
  },
  setJobCustomTag (state, data) {
    state.jobInfo.custom_tag = data
  },
  handleConfig (state, { action, data }) {
    if (action === 'init') {
      state.config = _.cloneDeep(CONST.JOB_DEFAULT_CONFIG)
    }
    if (action === 'setConfig') {
      _.extend(state.config, data)
    }
    if (action === 'setByProductsName') {
      state.config.byProductsName.forEach((val, idx, arr) => {
        _.extend(arr[idx], data[idx])
      })
    }
    if (action === 'addByProductsName') {
      let target = state.config.byProductsName[data.type].children
      if (data.index !== -1) {
        // let preText = target[data.index].text
        target[data.index].text = data.data.text
        // state.updateInfo = {
        //   preText,
        //   curText: data.data.text,
        //   user: target[data.index].user
        // }
      } else {
        target.push(data.data)
      }
    }
    if (action === 'deleteByProductsName') {
      state.config.byProductsName[data.pIdx].children.splice(data.sIdx, 1)
    }
    if (action === 'setByProductsNameUser') {
      let target = state.config.byProductsName[data.pIdx].children[data.sIdx]
      if (!target.user.includes(data.user)) {
        target.user.push(data.user)
      }
    }
  }
}

let getters = {
  jobId (state) {
    return parseInt(state.jobInfo.job_id)
  },
  normalKey (state) {
    return JSON.parse(state.normalData).key
  },
  manufacturerId () {
    return state.jobInfo.manufacturer
  },
  byProductsName () {
    return state.config.byProductsName
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  getters
}
