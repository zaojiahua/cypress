let state = {
  jobInfo: {},
  preJobInfo: null,
  isValidated: false,
  diagramModel: null,
  dataForDiagramModel: null,
  finalResultBlockKey: null,
  draftId: null
}

let mutations = {
  setJobInfo (state, jobInfo) {
    state.jobInfo = jobInfo
  },
  setPreJobInfo (state) {
    state.preJobInfo = JSON.stringify(state.jobInfo)
  },
  clearPreJobInfo (state) {
    state.preJobInfo = null
  },
  renewJobInfo (state) {
    if (state.preJobInfo) {
      state.jobInfo = JSON.parse(state.preJobInfo)
    }
  },
  setIsValidated (state, isValidated) {
    state.isValidated = isValidated
  },
  setDiagramModel (state, diagramModel) {
    state.diagramModel = diagramModel
    if (diagramModel) {
      let finalResultBlock = diagramModel.nodeDataArray.filter((val) => {
        return val.category === 'normalBlock' && val.star === 'purple'
      })[0]
      if (finalResultBlock) state.finalResultBlockKey = finalResultBlock.key
    }
  },
  setFinalResultBlock (state, key) {
    state.finalResultBlockKey = key
  },
  clearDiagramModel (state) {
    state.diagramModel = null
  },
  setDraftId (state, id) {
    state.draftId = id
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
