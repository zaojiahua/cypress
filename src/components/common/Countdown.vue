<template>
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
      return this.padLeft(Math.floor(this.countdown / 3600).toString())
    },
    minute () {
      return this.padLeft(Math.floor((this.countdown % 3600) / 60).toString())
    },
    second () {
      return this.padLeft(Math.floor((this.countdown % 3600) % 60).toString())
    }
  },
  methods: {
    startCount () {
      let totalTimer = window.setInterval(() => {
        if (this.countdown === 0) {
          window.clearInterval(totalTimer)
          this.$emit('timeout')
        } else {
          this.countdown--
          if (this.remindTime !== 0 && this.countdown === this.remindTime * 60) {
            this.$emit('remind')
          }
        }
      }, 1000)
    },
    padLeft (str) {
      if (str.length === 1) {
        return '0' + str
      } else {
        return str
      }
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
