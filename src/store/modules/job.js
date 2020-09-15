import CONST from 'constant/constant'

let state = {
  jobInfo: {},
  preJobInfo: null,
  isValidated: false,
  outerDiagramModel: null,
  dataForDiagramModel: null,
  finalResultBlockKey: null,
  draftId: undefined,
  draftLabel: undefined
}

let mutations = {
  setJobInfo (state, jobInfo) {
    state.jobInfo = jobInfo
  },
  setPreJobInfo (state, notClear) {
    if (!notClear) state.preJobInfo = null
    else state.preJobInfo = JSON.stringify(state.jobInfo)
  },
  recoverJobInfo (state) {
    if (state.preJobInfo) {
      state.jobInfo = JSON.parse(state.preJobInfo)
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
