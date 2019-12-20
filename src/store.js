import Vue from 'vue'
import Vuex from 'vuex'

const state = {
  // keepAliveComponents: ['jobList'] // 需要被缓存的组件
}

const mutations = {
  // keepAlive (state, component) {
  //   if (!state.keepAliveComponents.includes(component)) {
  //     state.keepAliveComponents.push(component)
  //   }
  // },
  // noKeepAlive (state, component) {
  //   let index = state.keepAliveComponents.indexOf(component)
  //   if (index !== -1) {
  //     state.keepAliveComponents.splice(index, 1)
  //   }
  // }
}

const actions = {

}

Vue.use(Vuex)

export default new Vuex.Store({
  // namaspaced: true, // 解决不同模块命名冲突的问题，之后在不同页面中引入getter、actions、mutations时，需要加上所属的模块名
  state,
  mutations,
  actions
})
