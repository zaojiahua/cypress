<template>
  <div class="loader" :style="loaderSize">
    <div></div>
    <div></div>
    <div></div>
  </div>
</template>
<script>
export default {
  name: 'CypressLoader',
  props: {
    size: Number
  },
  computed: {
    loaderSize () {
      return { width: `${this.size}px`, height: `${this.size}px` }
    }
  }
}
</script>
<style scoped>
  .loader {
    position: relative;
    z-index: 5;
  }
  .loader > div {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    transform-origin: 48% 48%;
    mix-blend-mode: screen;
  }
  .loader > div:nth-child(1) {
    background-color: #0000ff;
    animation: turn 3s linear 0s infinite;
  }
  .loader > div:nth-child(2) {
    background-color: #00ff00;
    animation: turn 3s linear -1s infinite;
  }
  .loader > div:nth-child(3) {
    background-color: #ff0000;
    animation: turn 3s linear -2s infinite;
  }
  @keyframes turn {
    to {
      transform: rotate(360deg);
    }
  }
</style>
