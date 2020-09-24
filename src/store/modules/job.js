import CONST from 'constant/constant'
import _ from 'lodash'
import util from 'lib/util/validate.js'
import { serializer } from 'lib/util/jobListSerializer'
import { getManufacturerList } from 'api/reef/manufacturer'
import { getJobTestAreaList } from 'api/reef/jobTestArea'
import { getCustomTagList } from 'api/reef/customTag'
import { getAndroidVersionList } from 'api/reef/androidVersion'

let state = {
  jobInfo: {},
  preJobInfo: { dirty: false },
  isValidated: false,
  outerDiagramModel: null,
  finalResultBlockKey: null,
  draftId: undefined,
  draftLabel: undefined,
  normalData: null,
  normalKey: undefined,
  manufacturer: util.validate(serializer.manufacturerSerializer, {}),
  androidVersion: util.validate(serializer.androidVersionSerializer, {}),
  customTag: util.validate(serializer.customTagSerializer, {}),
  testArea: util.validate(serializer.testAreaSerializer, {})
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
  },
  setJobTestArea (state, data) {
    state.jobInfo.test_area = data
  },
  setJobCustomTag (state, data) {
    state.jobInfo.custom_tag = data
  },
  setBaseData (state, data) {
    state[data.type] = data.data
  },
  setBaseTestArea (state, data) {
    state.testArea = data
  },
  setBaseCustomTag (state, data) {
    state.customTag = data
  }
}

let actions = {
  setBaseData ({ commit }) {
    Promise.all([getManufacturerList(), getAndroidVersionList(), getCustomTagList(), getJobTestAreaList()]).then((res) => {
      CONST.SERIALIZER_KEY.forEach((val, idx) => {
        let data = util.validate(serializer[`${val}Serializer`], res[idx].data)
        commit('setBaseData', { type: val, data })
      })
    })
  },
  setJobTestArea ({ commit }, jobTestArea) {
    getJobTestAreaList().then(({ data }) => {
      let testArea = util.validate(serializer.testAreaSerializer, data)
      commit('setBaseTestArea', testArea)
      commit('setJobTestArea', jobTestArea)
    })
  },
  setJobCustomTag ({ commit }, jobCustomTag) {
    getCustomTagList().then(({ data }) => {
      let customTag = util.validate(serializer.customTagSerializer, data)
      commit('setBaseCustomTag', customTag)
      commit('setJobCustomTag', jobCustomTag)
    })
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
  actions,
  getters
}
