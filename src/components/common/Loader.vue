<template>
  <!-- 加载动画 -->
  <!-- <div class="loader" :style="loaderSize">
    <div></div>
    <div></div>
    <div></div>
  </div> -->
  <svg version="1.1" class="loader" x="0px" y="0px"
    :style="loaderSize"
    viewBox="0 0 100 100" enable-background="new 0 0 0 0" xml:space="preserve">
    <circle :fill="fillColor" stroke="none" cx="6" cy="50" r="6">
      <animateTransform
        attributeName="transform"
        dur="1s"
        type="translate"
        values="0 15 ; 0 -15; 0 15"
        repeatCount="indefinite"
        begin="0.1"/>
    </circle>
    <circle :fill="fillColor" stroke="none" cx="30" cy="50" r="6">
      <animateTransform
        attributeName="transform"
        dur="1s"
        type="translate"
        values="0 10 ; 0 -10; 0 10"
        repeatCount="indefinite"
        begin="0.2"/>
    </circle>
    <circle :fill="fillColor" stroke="none" cx="54" cy="50" r="6">
      <animateTransform
        attributeName="transform"
        dur="1s"
        type="translate"
        values="0 5 ; 0 -5; 0 5"
        repeatCount="indefinite"
        begin="0.3"/>
    </circle>
  </svg>
  <!-- <svg version="1.1"
    class="loader" :style="loaderSize"
    viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve"
  >
    <rect fill="none" stroke="#fff" stroke-width="4" x="25" y="25" width="50" height="50">
      <animateTransform
        attributeName="transform"
        dur="0.5s"
        from="0 50 50"
        to="180 50 50"
        type="rotate"
        id="strokeBox"
        attributeType="XML"
        begin="rectBox.end"/>
    </rect>
    <rect x="27" y="27" fill="#fff" width="46" height="50">
      <animate
        attributeName="height"
        dur="1.3s"
        attributeType="XML"
        from="50"
        to="0"
        id="rectBox"
        fill="freeze"
        begin="0s;strokeBox.end"/>
    </rect>
  </svg> -->
</template>
<script>
export default {
  name: 'CypressLoader',
  props: {
    size: Number,
    fillColor: {
      type: String,
      default: '#fff'
    }
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
