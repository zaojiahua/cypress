import Vue from 'vue'
import Vuex from 'vuex'
import device from './modules/device'
import job from './modules/job'
import unit from './modules/unit'
import files from './modules/files'
import item from './modules/item'
import img from './modules/img'

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
    showDrawer: false,
    isLoading: false,
    curPage: 1,
    refresh: false
  },
  mutations: {
    handleShowDrawer (state) {
      state.showDrawer = !state.showDrawer
    },
    setIsLoading (state, isLoading) {
      state.isLoading = isLoading
    },
    setCurPage (state, page) {
      state.curPage = page
    },
    refreshJobList (state) {
      state.refresh = true
      setTimeout(() => {
        state.refresh = false
      })
    }
  }
})
