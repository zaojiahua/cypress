let state = {
  jobInfo: {},
  isValidated: false,
  isInnerJob: false
}

let mutations = {
  setJobInfo (state, jobInfo) {
    state.jobInfo = jobInfo

    if (jobInfo.job_type === 'InnerJob') state.isInnerJob = true
    else state.isInnerJob = false
  },
  setIsValidated (state, isValidated) {
    state.isValidated = isValidated
  },
  setIsInnerJob (state, isInnerJob) {
    state.isInnerJob = !state.isInnerJob

    if (state.isInnerJob) {
      state.jobInfo.job_type = 'InnerJob'
    } else {
      state.jobInfo.job_type = 'Joblib'
    }
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
