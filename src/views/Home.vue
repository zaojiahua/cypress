<template>
  <layout></layout>
</template>

<script>
// @ is an alias to /src
import layout from '_c/layout.vue'

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
        content: this.$t('createJob.tips_4')
      })
    })
    window.addEventListener('offline', () => {
      this.$Notice.error({
        title: this.$t('public.modal_warn'),
        desc:  this.$t('createJob.tips_5'),
        duration: 0
      })
    })
  }
}
</script>
