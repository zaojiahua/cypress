import Vue from 'vue'
import Vuex from 'vuex'
import device from './modules/device'
import job from './modules/job'
import unit from './modules/unit'
import files from './modules/files'
import item from './modules/item'
import img from './modules/img'

import CONST from '../constant/constant'
import util from '../lib/util/validate.js'
import _ from 'lodash'
import { serializer } from '../lib/util/jobListSerializer'
import { getJobTestAreaList, getCustomTagList, getReefUserList, getPhoneModelList, getAndroidVersionList, getRomVersionList, getManufacturerList } from '../api/reef/request'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    device,
    job,
    unit,
    files,
    item,
    img
  },
  state: {
    showDrawer: false, // 是否显示右侧抽屉
    isLoading: false,
    curPage: 1, // 当前jobList页
    curCabinetType:[], //当前jobList筛选的测试柜类型
    refresh: false, // 控制是否刷新jobList页面
    basicData: null // 基本的信息, 如job_test_area/custom_tag/phone_model等信息
  },
  mutations: {
    handleShowDrawer (state,flag = false) {
      state.showDrawer = flag
    },
    setIsLoading (state, isLoading) {
      state.isLoading = isLoading
    },
    setCurPage (state, page) {
      state.curPage = page
    },
    setCabinetType(state, cabinetType){
      state.curCabinetType = cabinetType
    },
    refreshJobList (state) {
      state.refresh = true
      setTimeout(() => {
        state.refresh = false
      })
    },
    setBasicData (state, data) {
      state.basicData = data
    },
    setOneBasicData (state, data) {
      state.basicData.splice(state.basicData[data.type], 1, data.value)
    }
  },
  actions: {
    setBasicData ({ commit }) {
      let basicData = []
      Promise.all([
        getJobTestAreaList(),
        getCustomTagList(),
        getReefUserList(),
        getPhoneModelList(),
        getAndroidVersionList(),
        getRomVersionList(),
        getManufacturerList()
      ]).then((res) => {
        CONST.BASIC_DATA_KEYS.forEach((val, idx) => {
          let data = util.validate(serializer[`${val.camelCase}Serializer`], res[idx].data)
          data = data[Object.keys(data)[0]]
          // data = _.orderBy(data, [val.orderCase])
          basicData.push(data)
          basicData[val.camelCase] = idx
        })
        commit('setBasicData', basicData)
      })
    },
    setBasicTestArea ({ commit }) {
      getJobTestAreaList().then(({ data }) => {
        data = util.validate(serializer.testAreaSerializer, data)
        data = data[Object.keys(data)[0]]
        // data = _.orderBy(data, ['description'])
        commit('setOneBasicData', { type: 'testArea', value: data })
      })
    },
    setBasicCustomTag ({ commit }) {
      getCustomTagList().then(({ data }) => {
        data = util.validate(serializer.customTagSerializer, data)
        data = data[Object.keys(data)[0]]
        // data = _.orderBy(data, ['custom_tag_name'])
        commit('setOneBasicData', { type: 'customTag', value: data })
      })
    }
  }
})
