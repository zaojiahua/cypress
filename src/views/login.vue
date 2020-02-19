<template>
  <div id="login-page">
    <form id="login">
      <div class="login-logo">
        <b>TMACH</b>
      </div>
      <Divider/>
      <div id="login-input">
        <Input prefix="ios-person-outline" v-model="username" placeholder="请输入账户" style="width: auto"/>
        <Input id="password" prefix="ios-lock-outline" type="password" password v-model="password" placeholder="请输入密码" style="width: auto"/>
        <Checkbox id="remember-pwd" v-model="keepLogin">保持登入</Checkbox>
        <div>
          <Button type="success" @click="login">登入</Button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { login } from '../api/reef/user'
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
      login(this.username, this.password).then(res => {
        localStorage.id = res.data.id
        localStorage.username = res.data.username
        sessionStorage.token = res.data.token
        sessionStorage.identity = res.data.groups
        localStorage.removeItem('token')
        if (this.keepLogin) {
          localStorage.setItem('token', res.data.token)
          localStorage.setItem('identity', res.data.groups)
        }
        this.$router.push(this.$route.query.redirect || '/')
      }).catch(error => {
        let errorMsg = ''
        if (error.response.status === 400) {
          errorMsg = '错误的 使用者名称 或 密码 ！'
        } else if (error.response.status >= 500) {
          errorMsg = '服务器错误！'
        } else {
          errorMsg = error.toString()
        }
        this.$Message.error(errorMsg)
        this.$Loading.error()
      })
    }
  }
}
</script>

<style scoped>
  html,body,#login-page{
    height: 100vh;
  }
  #login-page{
    width: 100%;
    background: #2f3638;
  }
  #login{
    position: absolute;
    top: 0;
    bottom:0;
    left: 0;
    right: 0;
    width: 270px;
    height: 310px;
    background: #ffffff;
    margin:auto;
    border-radius: 3px;
    padding: 15px;
  }
  .login-logo{
    color: #1bbc9c;
    font-size: 20px;
    font-weight: 900;
    margin-bottom: -15px;
    margin-left: 24px;
  }
  Divider{
    margin-bottom: 15px;
  }
  #login-input{
    width: 190px;
    margin: 0 auto;
  }
  #password{
    margin-top: 25px;
  }
  #remember-pwd{
    margin-top: 30px;
    color: #515a6e;
  }
  Button{
    margin-top: 35px;
    width: 100%;
    background: #1bbc9c;
  }
</style>
