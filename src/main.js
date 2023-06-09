import Vue from 'vue'
import App from './App.vue'
import router from './router'
import i18n  from "./locale"
// import store from './store'
import store from './store/index'
import './plugins/iview.js'
import { MOCK } from './config'
import lodash from 'lodash'
import md5 from 'js-md5'
import VueBus from 'vue-bus'

Vue.use(VueBus)
Vue.use(i18n)

if (process.env.NODE_ENV !== 'production' && MOCK) require('./mock')
Vue.config.productionTip = false

Vue.prototype._ = lodash
Vue.prototype.md5 = md5 // 32位 md5 加密

new Vue({
  router,
  store,
  i18n,    //挂载i18n
  render: h => h(App)
}).$mount('#app')
