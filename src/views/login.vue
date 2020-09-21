<template>
  <div class="login-pane">
    <div class="container">
      <div class="login-logo">
        <b>TMACH</b>
      </div>
      <Divider/>
      <div class="login-input">
        <Input prefix="ios-person-outline" v-model="username" placeholder="请输入账户"/>
        <Input prefix="ios-lock-outline" @on-enter="login" type="password" password v-model="password" placeholder="请输入密码"/>
        <Checkbox v-model="keepLogin">保持登入</Checkbox>
        <Button type="success" @click="login">登入</Button>
      </div>
    </div>
  </div>
</template>

<script>
import { login } from 'api/reef/user'
import CONST from 'constant/constant'
export default {
  name: 'login',
  data () {
    return {
      username: '',
      password: '',
      keepLogin: false
    }
  },
  methods: {
    login () {
      login(this.username, this.password).then(({ status, data }) => {
        if (this.keepLogin) {
          CONST.USER_INFO.forEach((val, idx) => {
            localStorage.setItem(val, data[val])
          })
        } else {
          CONST.USER_INFO.forEach((val, idx) => {
            sessionStorage.setItem(val, data[val])
          })
        }
        this.$router.push('/')
      }).catch(error => {
        let errorMsg = ''
        if (error.response.status === 400) {
          errorMsg = '错误的 用户名称 或 密码 ！'
        } else if (error.response.status >= 500) {
          errorMsg = '服务器错误！'
        } else {
          errorMsg = error.toString()
        }
        this.$Message.error(errorMsg)
        this.$Loading.error()
      })
    }
  },
  beforeRouteEnter (to, from, next) {
    if (sessionStorage.getItem('token') || localStorage.getItem('token')) {
      this.route.push('/')
    }
    next()
  }
}
</script>

<style lang="less" scoped>
@import '../css/common.less';
@loginBGC: #2f3638;
.login-pane {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: @loginBGC;
  height: 100%;
  .container {
    padding: 1em 2em;
    border-radius: 4px;
    background-color: @lightBGC;
    .login-logo {
      color: @logoColor;
      margin-bottom: -0.8em;
      b {
        font-size: 1.25rem;
        font-weight: @logoWeight;
      }
    }
    .login-input {
      display: flex;
      flex-direction: column;
      & > * { margin-bottom: 1.6em; }
      > :last-child { background-color: @logoColor; }
    }
  }
}
</style>
