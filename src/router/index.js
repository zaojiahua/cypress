import Vue from 'vue'
import Router from 'vue-router'
import routes from './router'
Vue.use(Router)
const router = new Router({
  mode: 'history',
  routes
})

router.beforeEach((to, from, next) => {
  if (to.path === '/login') {
    next()
  } else {
    if (localStorage.getItem('token')) sessionStorage.setItem('token', localStorage.getItem('token'))
    let token = sessionStorage.getItem('token')
    if (token === null || token === '') {
      next({ path: '/login', query: { redirect: to.fullPath } })
    } else {
      next()
    }
  }
})

export default router
