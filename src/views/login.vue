<template>
  <div class="login-pane">
    <div class="container">
      <div class="login-logo">
        <b>TMACH</b>
      </div>
      <Divider/>
      <div class="login-input">
        <Input prefix="ios-person-outline" v-model="username" :placeholder="lang==='zh'?'请输入账户':'username'"/>
        <Input prefix="ios-lock-outline" @on-enter="login" type="password" password v-model="password" :placeholder="lang==='zh'?'请输入密码':'password'"/>
        <Row type="flex" justify="space-between">
          <Checkbox v-model="keepLogin">{{$t('login.remember')}}</Checkbox>
          <Select v-model="lang" size="small" style="width:100px;display: inline-block" @on-change="onLangChange">
            <Option value="zh">简体中文</Option>
            <Option value="en">English</Option>
          </Select>
        </Row>
        <Button type="success" @click="login">{{$t('login.login_btn')}}</Button>
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
      lang: localStorage.getItem("lang") ||  'zh',
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
    onLangChange(select){
      this.lang = select
      this.$i18n.locale = select
      sessionStorage.setItem('lang', select)
    },
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
        localStorage.setItem('lang', this.lang)
        sessionStorage.setItem('lang', this.lang)
        this.$i18n.locale = this.lang
        this.$router.push('/')
        this.$Message.success(this.$t('login.successMsg'));
        setTimeout(function (){
          location.reload()
        },100)
      }).catch(error => {
        let errorMsg = ''
        if (error.response.status === 400) {
          errorMsg = this.$t('login.errorMsg_400')
        }else if (error.response.status === 401) {
          errorMsg = this.$t('login.errorMsg_401')
        }else if (error.response.status === 404)
          errorMsg = this.$t('login.errorMsg_404')
        else if(error.response.status >= 500) {
          errorMsg = this.$t('public.error_500')
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
