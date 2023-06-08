//国际化
import Vue from 'vue'
import VueI18n from 'vue-i18n'
import iView from 'view-design'
import zhlocale from './lang/zh'
import enlocale from './lang/en'
//引入iview的语言包，名字一定不能错，否则会报错
import iview_zhlocale from 'view-design/dist/locale/zh-CN'
import iview_enlocale from 'view-design/dist/locale/en-US'

Vue.use(VueI18n)
// // 自动根据浏览器系统语言设置语言
// const navLang = navigator.language.substring(0, 2)//自动识别浏览器语言
// const localLang = navLang || false
// let lang = localLang || localRead('local') || 'zh'
//
// Vue.config.lang = lang
if(sessionStorage.lang === undefined
  && localStorage.lang !== undefined){
  sessionStorage.setItem('lang', localStorage.getItem('lang'))
}

// Vue.locale = () => {};   // ivew组件国际化不可缺少的部分===cypress不能加这句话，否则this.$modal.confirm报错
const messages = {
  'zh': Object.assign(iview_zhlocale, zhlocale),
  'en': Object.assign(iview_enlocale, enlocale),
}
// 实例化i18n并引入语言文件。
const i18n = new VueI18n({
  locale: sessionStorage.getItem("lang") ||  'zh', // 语言标识  // 默认语言
  messages
})

Vue.use(iView, {
  i18n: (key, value) => i18n.t(key, value)
})


export default i18n
