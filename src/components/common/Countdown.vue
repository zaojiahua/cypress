<template>
  <!-- 倒计时组件, 传入总时间与提醒快要到期的时间 -->
  <span>{{hour}}:{{minute}}:{{second}}</span>
</template>

<script>
export default {
  name: 'Countdown',
  props: {
    totalTime: {
      type: Number,
      default: 30
    },
    remindTime: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      countdown: this.totalTime * 60
    }
  },
  computed: {
    hour () {
      return Math.floor(this.countdown / 3600).toString().padStart(2, '0')
    },
    minute () {
      return Math.floor((this.countdown % 3600) / 60).toString().padStart(2, '0')
    },
    second () {
      return Math.floor((this.countdown % 3600) % 60).toString().padStart(2, '0')
    }
  },
  methods: {
    startCount () {
      let totalTimer = window.setInterval(() => {
        if (this.countdown === 0) {
          clearInterval(totalTimer)
          this.$emit('timeout')
        } else {
          this.countdown--
          if (this.remindTime !== 0 && this.countdown === this.remindTime * 60) {
            this.$emit('remind')
          }
        }
      }, 1000)
      this.$once('hook:beforeDestroy', () => {
        clearInterval(totalTimer)
        totalTimer = null
      })
    },
    restart () {
      this.countdown = this.totalTime * 60
    }
  },
  mounted () {
    this.startCount()
  }
}
</script>

<style lang="less" scoped>
  span {
    color: rgba(255,255,255,.7);
  }
</style>
