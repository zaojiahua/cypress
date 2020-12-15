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
import { login } from 'api/reef/request'
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
  watch: {
    keepLogin (val) {
      localStorage.setItem('LOGIN:KEEP_LOGIN', val)
    }
  },
  methods: {
    login () {
      login(this.username, this.password).then(({ status, data }) => {
        // 清空 用户信息 获取用户token
        CONST.USER_INFO.forEach((val) => {
          sessionStorage.removeItem(val)
          localStorage.removeItem(val)
        })

        sessionStorage.setItem('token', data['token'])
        if (this.keepLogin) {
            localStorage.setItem('token', sessionStorage.token)
          }
        this.$router.push('/')
      }).catch(error => {
        let errorMsg = ''
        if (error.response.status >= 401) {
          errorMsg = '错误的 用户名 或 密码 ！'
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
  mounted () {
    this.keepLogin = !!localStorage.getItem('LOGIN:KEEP_LOGIN')
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
