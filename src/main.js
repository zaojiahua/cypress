import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/iview.js'
import { MOCK } from './config'
import lodash from 'lodash'
import md5 from 'js-md5'

if (process.env.NODE_ENV !== 'production' && MOCK) require('./mock')
Vue.config.productionTip = false

Vue.prototype._ = lodash
Vue.prototype.md5 = md5 // 32位 md5 加密

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
