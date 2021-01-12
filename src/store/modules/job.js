import CONST from 'constant/constant'
import _ from 'lodash'

let state = {
  jobInfo: {
    job_flows: []
  }, // 用例的基本信息保存在这里
  // jobFlow: {
  //   job_id:'number',
  //   job_flow: [{
  //     id: 'number',
  //     name: 'string',
  //     ui_json_file: 'string',
  //     order: 'string',
  //     description:'string'
  //   }],
  // },
  // jobFlow: {
  //   job_flow: [],
  // },
  preJobInfo: { dirty: false }, // 编辑过程中回到jobList页面查看其他用例基本信息时, 为防止继续编辑时信息丢失, 在这里做备份
  isValidated: false, // 右侧抽屉中的表单信息是否通过验证
  outerDiagramModel: null, // jobEditor界面的逻辑流信息
  duplicateId: null, // 自动保存的副本用例的id及jobLabel, 更改自动保存的逻辑之后可能会用不到了
  duplicateLabel: null, //自动保存的副本用例的jobLabel
  normalData: null, // 双击normalBlock后获取到该数据, normalEditor界面会用到
  config: _.cloneDeep(CONST.JOB_DEFAULT_CONFIG),
  jobLabelDuplicate: 'duplicate',

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
        state.jobInfo = {job_flows: []}
        state.preJobInfo = { dirty: false }
      }
    }
  },
  handleNormalData (state, { action, data }) {
    if (action === 'set') {
      state.normalData = data
    }
  },
  setIsValidated (state, isValidated) {
    state.isValidated = isValidated
  },
  setOuterDiagramModel (state, diagramModel) {
    state.outerDiagramModel = diagramModel
  },
  setDuplicateId (state, id) {
    state.duplicateId = id
  },
  setDuplicateLabel (state, label) { // 传入正在传入的job的jobLabel
    if (label === null)
      { state.duplicateLabel = label}
    else
      {state.duplicateLabel = `${label}_${state.jobLabelDuplicate}`}
  },
  // setJobId (state, jobId) {
  //   state.jobInfo.job_id = jobId
  // },

  setJobLabel (state, label) {
    state.jobInfo.job_label = label
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
  // getJobLabel (state) {
  //   return state.jobInfo.job_label
  // },
  normalKey (state) {
    return state.normalData.key
  },
  manufacturerId () {
    return state.jobInfo.manufacturer
  },
  byProductsName () {
    return state.config.byProductsName
  },
  editJobMsg (){
    // 新建用例或则编辑自己的用例或则admin权限可以被允许
    return state.jobInfo.job_id === undefined || (sessionStorage.groups && sessionStorage.groups.includes('Admin')) ||state.jobInfo.author  === parseInt(sessionStorage.id)
  },
  editJobFlow (){
    return state.jobInfo.job_id === undefined || (sessionStorage.groups && sessionStorage.groups.includes('Admin')) ||state.jobInfo.author  === parseInt(sessionStorage.id)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  getters
}
