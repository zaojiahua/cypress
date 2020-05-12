let state = {
  jobInfo: {},
  preJobInfo: null,
  isValidated: false,
  isInnerJob: false,
  diagramModel: null,
  dataForDiagramModel: null
}

let mutations = {
  setJobInfo (state, jobInfo) {
    state.jobInfo = jobInfo

    if (jobInfo.job_type === 'InnerJob') state.isInnerJob = true
    else state.isInnerJob = false
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
  setIsInnerJob (state) {
    state.isInnerJob = !state.isInnerJob

    if (state.isInnerJob) {
      state.jobInfo.job_type = 'InnerJob'
    } else {
      state.jobInfo.job_type = 'Joblib'
    }
  },
  setDiagramModel (state, diagramModel) {
    state.diagramModel = diagramModel
  },
  clearDiagramModel (state) {
    state.diagramModel = null
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
