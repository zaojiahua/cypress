<template>
  <div class="home">
    <layout></layout>
  </div>
</template>

<script>
// @ is an alias to /src
import layout from '../components/layout.vue'

export default {
  name: 'home',
  components: {
    layout
  },
  mounted () {
    window.addEventListener('online', () => {
      this.$Notice.destroy()
      this.$Message.success({
        background: true,
        content: '网络连接已恢复'
      })
    })
    window.addEventListener('offline', () => {
      this.$Notice.error({
        title: '警告',
        desc: '网络连接已断开，请检查您的网络',
        duration: 0
      })
    })
  }
}
</script>
