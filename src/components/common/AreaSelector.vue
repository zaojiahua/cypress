<template>
  <div class="selector-container">
    <div class="selector">
      <img draggable="false" v-show="imgSrc" class="selector__img">
      <div class="selector__curarea" v-show="imgSrc">
        <div class="selector__curarea__tl"></div>
        <div class="selector__curarea__t"></div>
        <div class="selector__curarea__tr"></div>
        <div class="selector__curarea__r"></div>
        <div class="selector__curarea__br"></div>
        <div class="selector__curarea__b"></div>
        <div class="selector__curarea__bl"></div>
        <div class="selector__curarea__l"></div>
        <button class="selector__curarea__close" @click="closeArea" v-show="closable">关闭</button>
      </div>
    </div>
    <div class="selector_mask" v-show="showMask"></div>
  </div>
</template>

<script>
export default {
  name: 'AreaSelector',
  props: {
    imgSrc: String,
    closable: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      isDragging: false,
      mouseStartX: null,
      mouseStartY: null,
      selector: null,
      selectorRect: null,
      curArea: null,
      curAreaRect: null,
      imageWidth: null,
      imageHeight: null,
      showMask: false,
      curAreaBRBox: null,
      moveArea: false,
      expandRight: false,
      expandBottom: false
    }
  },
  watch: {
    imgSrc (val) {
      if (!val) return
      let image = new Image()
      image.src = val
      image.onload = () => {
        this.imageWidth = image.width
        this.imageHeight = image.height
        let img = document.querySelector('.selector__img')
        if (this.imageWidth > this.imageHeight) {
          this.selector.style.width = '100%'
          this.selector.style.height = 'auto'
          img.style.maxWidth = this.selector.style.width
        } else {
          this.selector.style.height = '100%'
          this.selector.style.width = 'auto'
          img.style.maxHeight = this.selector.style.height
        }
        img.src = val
      }
    }
  },
  methods: {
    selectLabelArea (event) {
      event.preventDefault()
      switch (event.type) {
        case 'mousedown':
          this.isDragging = true
          this.mouseStartX = event.pageX
          this.mouseStartY = event.pageY
          if (event.target.classList.contains('selector__img')) {
            this.selector = document.querySelector('.selector')
            this.selectorRect = this.selector.getBoundingClientRect()

            this.curArea.style.left = this.mouseStartX - this.selectorRect.x + 'px'
            this.curArea.style.top = this.mouseStartY - this.selectorRect.y + 'px'
            this.curArea.style.width = '0px'
            this.curArea.style.height = '0px'
            this.curArea.style.display = 'flex'

            let areas = document.querySelectorAll('.area')
            areas.forEach(area => {
              this.selector.removeChild(area)
            })
          } else if (event.target.classList.contains('selector__curarea')) {
            this.moveArea = true
          } else if (event.target.classList.contains('selector__curarea__b')) {
            this.expandBottom = true
          } else if (event.target.classList.contains('selector__curarea__r')) {
            this.expandRight = true
          }
          break
        case 'mousemove':
          if (this.isDragging) {
            let moveX = event.pageX - this.mouseStartX
            let moveY = event.pageY - this.mouseStartY
            this.mouseStartX = event.pageX
            this.mouseStartY = event.pageY
            let rect = this.curArea.getBoundingClientRect()
            if (this.moveArea) {
              let top = Math.max(0, parseInt(this.curArea.style.top) + moveY)
              let left = Math.max(0, parseInt(this.curArea.style.left) + moveX)
              if (top + parseInt(this.curArea.style.height) > this.selectorRect.height) {
                top = this.selectorRect.height - parseInt(this.curArea.style.height)
              }
              if (left + parseInt(this.curArea.style.width) > this.selectorRect.width) {
                left = this.selectorRect.width - parseInt(this.curArea.style.width)
              }
              this.curArea.style.top = top + 'px'
              this.curArea.style.left = left + 'px'
            }
            if (this.expandRight) {
              let width = Math.min(this.selectorRect.width, rect.width + moveX)
              this.curArea.style.width = width + 'px'
            }
            if (this.expandBottom) {
              let height = Math.min(this.selectorRect.height, rect.height + moveY)
              this.curArea.style.height = height + 'px'
            }
            if (!this.moveArea && !this.expandRight && !this.expandBottom) {
              let width = Math.min(this.selectorRect.width, rect.width + moveX)
              let height = Math.min(this.selectorRect.height, rect.height + moveY)
              this.curArea.style.width = width + 'px'
              this.curArea.style.height = height + 'px'
            }
          }
          break
        case 'mouseup':
          this.isDragging = false
          this.moveArea = false
          this.expandRight = false
          this.expandBottom = false
          this.curAreaRect = this.curArea.getBoundingClientRect()
          let coordinate = {}
          coordinate.relativeCoordinate = {
            topLeft: {
              x: this.toDecimal((this.curAreaRect.x - this.selectorRect.x) / this.selectorRect.width),
              y: this.toDecimal((this.curAreaRect.y - this.selectorRect.y) / this.selectorRect.height)
            },
            bottomRight: {
              x: this.toDecimal((this.curAreaRect.x + this.curAreaRect.width - this.selectorRect.x) / this.selectorRect.width),
              y: this.toDecimal((this.curAreaRect.y + this.curAreaRect.height - this.selectorRect.y) / this.selectorRect.height)
            }
          }
          coordinate.absoluteCoordinate = {
            topLeft: {
              x: coordinate.relativeCoordinate.topLeft.x * this.imageWidth,
              y: coordinate.relativeCoordinate.topLeft.y * this.imageHeight
            },
            bottomRight: {
              x: coordinate.relativeCoordinate.bottomRight.x * this.imageWidth,
              y: coordinate.relativeCoordinate.bottomRight.y * this.imageHeight
            }
          }
          this.$emit('on-select', coordinate)
          break
        case 'mouseleave':
          this.isDragging = false
          this.moveArea = false
          this.expandRight = false
          this.expandBottom = false
      }
    },
    handleShowMask (event) {
      switch (event.type) {
        case 'keypress':
          if (event.key === ' ') {
            this.showMask = true
          }
          break
        case 'keyup':
          if (event.key === ' ') {
            this.showMask = false
          }
          break
      }
    },
    toDecimal (num) {
      let f = parseFloat(num)
      if (isNaN(f)) {
        return
      }
      f = Math.round(num * 100) / 100
      return f
    },
    closeArea () {
      this.curArea.style.display = 'none'
      this.curArea.style.width = '0px'
      this.curArea.style.height = '0px'
    }
  },
  mounted () {
    this.selector = document.querySelector('.selector')
    this.curArea = document.querySelector('.selector__curarea')

    this.selector.addEventListener('mousedown', this.selectLabelArea)
    this.selector.addEventListener('mousemove', this.selectLabelArea)
    this.selector.addEventListener('mouseup', this.selectLabelArea)
    this.selector.addEventListener('mouseleave', this.selectLabelArea)
    window.addEventListener('keypress', this.handleShowMask)
    window.addEventListener('keyup', this.handleShowMask)
  },
  beforeDestroy () {
    window.removeEventListener('keypress', this.handleShowMask)
    window.removeEventListener('keyup', this.handleShowMask)
  }
}
</script>

<style lang="less" scoped>
  .selector-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    position: relative;
    .selector {
      position: relative;
      z-index: 200;
      .selector__img {
        user-select: none;
      }
      .selector__curarea {
        display: none;
        position:absolute;
        width:100px;
        height:100px;
        background: url('../../assets/image/selctionbg.png') repeat scroll 0 0 transparent;
        z-index: 1000;
        box-sizing: border-box;
        .selector__curarea__tl,
        .selector__curarea__t,
        .selector__curarea__tr,
        .selector__curarea__r,
        .selector__curarea__br,
        .selector__curarea__b,
        .selector__curarea__bl,
        .selector__curarea__l {
          position: absolute;
          width: 4px;
          height: 4px;
          z-index: 1000;
        }
        .selector__curarea__tl {
          top: 0;
          left: 0;
          background-color: red;
          z-index: 1100;
        }
        .selector__curarea__t {
          width: 100%;
          top: 0;
        }
        .selector__curarea__tr{
          top: 0;
          right: 0;
          background-color: red;
          z-index: 1100;
        }
        .selector__curarea__r {
          right: 0;
          height: 100%;
          cursor: e-resize;
        }
        .selector__curarea__br {
          bottom: 0;
          right: 0;
          background-color: red;
          cursor: se-resize;
          z-index: 1100;
        }
        .selector__curarea__b {
          bottom: 0;
          width: 100%;
          cursor: s-resize;
        }
        .selector__curarea__bl {
          bottom: 0;
          left: 0;
          background-color: red;
          z-index: 1100;
        }
        .selector__curarea__l {
          left: 0;
          height: 100%;
        }
        .selector__curarea__close {
          position: absolute;
          top: 8px;
          right: 8px;
          cursor: pointer;
          border: none;
          outline: none;
          text-indent: 10em;
          overflow: hidden;
          width: 1em;
          height: 0.8em;
          // background-color: transparent;
        }
        .selector__curarea__close::after {
          display: block;
          content: "\00D7";
          position: absolute;
          top: -0.3em;
          right: 0.2em;
        }
      }
    }
    .selector_mask {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 100;
    }
  }
</style>
