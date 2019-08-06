import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/iview.js'
import { MOCK } from './config'
import lodash from 'lodash'

if (process.env.NODE_ENV !== 'production' && MOCK) require('./mock')
Vue.config.productionTip = false

Vue.prototype._ = lodash

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
