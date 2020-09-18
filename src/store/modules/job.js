import CONST from 'constant/constant'
import _ from 'lodash'

let state = {
  jobInfo: {},
  preJobInfo: { dirty: false },
  isValidated: false,
  outerDiagramModel: null,
  finalResultBlockKey: null,
  draftId: undefined,
  draftLabel: undefined,
  normalData: null,
  normalKey: undefined
}

let mutations = {
  setJobInfo (state, jobInfo) {
    state.jobInfo = jobInfo
    if (!state.preJobInfo.dirty) {
      state.preJobInfo = _.cloneDeep(jobInfo)
      state.preJobInfo.dirty = false
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
      if (finalResultBlock) state.finalResultBlockKey = finalResultBlock.key
    }
  },
  setFinalResultBlock (state, key) {
    state.finalResultBlockKey = key
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
  }
}

let getters = {
  jobId (state) {
    return parseInt(state.jobInfo.job_id)
  },
  manufacturerId () {
    return state.jobInfo.manufacturer
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  getters
}
