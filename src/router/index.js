import Vue from 'vue'
import Router from 'vue-router'
import routes from './router'
Vue.use(Router)
const router = new Router({
  mode: 'history',
  routes
})

// router.beforeEach((to, from, next) => {
//   console.log(to.path)
//   if (to.path === '/jobMsg/86') {
//     console.log('gzj')
//     next(false)
//   } else {
//     console.log('gzj   pig')
//     next()
//   }
// })

export default router
