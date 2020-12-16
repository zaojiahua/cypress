import Vue from 'vue'
import Router from 'vue-router'
import routes from './router'
import {getUserInfoByToken} from 'api/reef/request'
import CONST from 'constant/constant'
Vue.use(Router)
const router = new Router({
  mode: 'history',
  routes
})

router.beforeEach((to, from, next) => {
  if (to.name === 'login') { // 已经登陆过就不再登陆
    if (sessionStorage.getItem('token') || localStorage.getItem('token'))
    {
      next({name:'home'})
    }
    else{
      next()
    }
  }
  else {
    // token不存在或无效则进行登陆
    if (!sessionStorage.getItem('token') && localStorage.getItem('token')) sessionStorage.setItem('token', localStorage.getItem('token'))
    let userToken = sessionStorage.getItem('token')
    if (userToken) {
      getUserInfoByToken(userToken).then(({ data:{ token } }) => {
        if (token.length > 0){
          let userInfo = token[0].user
          userInfo.groups = userInfo.groups.map((item) => {
            return item.name;
          })
          CONST.USER_INFO.forEach((val) => {
            if (userInfo[val]) sessionStorage.setItem(val, userInfo[val])
          })

          next()

        } else {
          // 错误的token进行删除
          localStorage.removeItem('token')
          sessionStorage.removeItem('token')
          next({ name: 'login', query: { redirect: to.fullPath } })
        }
      })
    }
    else next({ name: 'login', query: { redirect: to.fullPath } })
  }
})

export default router
