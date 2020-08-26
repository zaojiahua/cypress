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
        <button class="selector__curarea__close" @click="closeArea" v-show="showClose">关闭</button>
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
    },
    maskKey: {
      type: [String, Number],
      default: 'Control'
    }
  },
  data () {
    return {
      isDragging: false,
      mouseStartX: null,
      mouseStartY: null,
      selector: null,
      selectorRect: null,
      selectorImg: null,
      selectorImgRect: null,
      curArea: null,
      curAreaRect: null,
      imageWidth: null,
      imageHeight: null,
      showMask: false,
      curAreaBRBox: null,
      moveArea: false,
      expandRight: false,
      expandBottom: false,
      expandTop: false,
      expandLeft: false
    }
  },
  watch: {
    imgSrc (val) {
      if (!val) return
      this.setImg(val)
    }
  },
  computed: {
    showClose () {
      return this.closable && !this.isDragging
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
          this.selector = document.querySelector('.selector')
          this.selectorRect = this.selector.getBoundingClientRect()
          this.selectorImgRect = this.selectorImg.getBoundingClientRect()
          if (event.target.classList.contains('selector__img')) {
            this.curArea.style.left = this.mouseStartX - this.selectorImgRect.x + (this.selectorRect.width - this.selectorImgRect.width) / 2.0 + 'px'
            this.curArea.style.top = this.mouseStartY - this.selectorImgRect.y + (this.selectorRect.height - this.selectorImgRect.height) / 2.0 + 'px'
            this.curArea.style.width = '0px'
            this.curArea.style.height = '0px'
            this.curArea.style.display = 'flex'

            let areas = document.querySelectorAll('.area')
            areas.forEach(area => {
              this.selector.removeChild(area)
            })
          } else if (event.target.classList.contains('selector__curarea')) {
            this.moveArea = true
          } else if (event.target.classList.contains('selector__curarea__t')) {
            this.expandTop = true
          } else if (event.target.classList.contains('selector__curarea__r')) {
            this.expandRight = true
          } else if (event.target.classList.contains('selector__curarea__b')) {
            this.expandBottom = true
          } else if (event.target.classList.contains('selector__curarea__l')) {
            this.expandLeft = true
          } else if (event.target.classList.contains('selector__curarea__close')) {
            this.isDragging = false
          }
          break
        case 'mousemove':
          if (this.isDragging) {
            let moveX = event.pageX - this.mouseStartX
            let moveY = event.pageY - this.mouseStartY
            this.mouseStartX = event.pageX
            this.mouseStartY = event.pageY
            let offsetX = (this.selectorRect.width - this.selectorImgRect.width) / 2.0
            let offsetY = (this.selectorRect.height - this.selectorImgRect.height) / 2.0
            let curAreaRect = this.curArea.getBoundingClientRect()
            if (this.moveArea) {
              let top = Math.max(offsetY, parseInt(this.curArea.style.top) + moveY)
              let left = Math.max(offsetX, parseInt(this.curArea.style.left) + moveX)
              if (top + parseInt(this.curArea.style.height) > this.selectorImgRect.height + offsetY) {
                top = this.selectorImgRect.height + offsetY - parseInt(this.curArea.style.height)
              }
              if (left + parseInt(this.curArea.style.width) > this.selectorImgRect.width + offsetX) {
                left = this.selectorImgRect.width + offsetX - parseInt(this.curArea.style.width)
              }
              this.curArea.style.top = top + 'px'
              this.curArea.style.left = left + 'px'
            }
            if (this.expandTop) {
              let top = Math.max(offsetY, parseInt(this.curArea.style.top) + moveY)
              if (top + parseInt(this.curArea.style.height) > this.selectorImgRect.height + offsetY) {
                top = this.selectorImgRect.height + offsetY - parseInt(this.curArea.style.height)
              }
              this.curArea.style.top = top + 'px'
              let height = Math.min(this.selectorImgRect.height, curAreaRect.height - moveY)
              this.curArea.style.height = height + 'px'
            }
            if (this.expandRight) {
              let width = Math.min(this.selectorImgRect.width, curAreaRect.width + moveX)
              this.curArea.style.width = width + 'px'
            }
            if (this.expandBottom) {
              let height = Math.min(this.selectorImgRect.height, curAreaRect.height + moveY)
              this.curArea.style.height = height + 'px'
            }
            if (this.expandLeft) {
              let left = Math.max(offsetX, parseInt(this.curArea.style.left) + moveX)
              if (left + parseInt(this.curArea.style.width) > this.selectorImgRect.width + offsetX) {
                left = this.selectorImgRect.width + offsetX - parseInt(this.curArea.style.width)
              }
              this.curArea.style.left = left + 'px'
              let width = Math.min(this.selectorImgRect.width, curAreaRect.width - moveX)
              this.curArea.style.width = width + 'px'
            }
            if (!this.moveArea && !this.expandTop && !this.expandRight && !this.expandBottom && !this.expandLeft) {
              let width = Math.min(this.selectorImgRect.width, curAreaRect.width + moveX)
              let height = Math.min(this.selectorImgRect.height, curAreaRect.height + moveY)
              this.curArea.style.width = width + 'px'
              this.curArea.style.height = height + 'px'
            }
          }
          break
        case 'mouseup':
          this.isDragging = false
          this.moveArea = false
          this.expandTop = false
          this.expandRight = false
          this.expandBottom = false
          this.expandLeft = false
          this.curAreaRect = this.curArea.getBoundingClientRect()
          let coordinate = {}
          coordinate.relativeCoordinate = {
            topLeft: {
              x: (this.curAreaRect.x - this.selectorImgRect.x) / this.selectorImgRect.width,
              y: (this.curAreaRect.y - this.selectorImgRect.y) / this.selectorImgRect.height
            },
            bottomRight: {
              x: (this.curAreaRect.x + this.curAreaRect.width - this.selectorImgRect.x) / this.selectorImgRect.width,
              y: (this.curAreaRect.y + this.curAreaRect.height - this.selectorImgRect.y) / this.selectorImgRect.height
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
          this.expandTop = false
          this.expandRight = false
          this.expandBottom = false
          this.expandLeft = false
      }
    },
    handleShowMask (event) {
      switch (event.type) {
        case 'keydown':
          if (event.key === this.maskKey || event.keyCode === this.maskKey) {
            this.showMask = true
          }
          break
        case 'keyup':
          if (event.key === this.maskKey || event.keyCode === this.maskKey) {
            this.showMask = false
          }
          break
      }
    },
    closeArea (event) {
      this.curArea.style.display = 'none'
      this.curArea.style.width = '0px'
      this.curArea.style.height = '0px'
      this.$emit('on-select', {})
    },
    setImg (src) {
      let image = new Image()
      image.src = src
      image.onload = () => {
        this.imageWidth = image.width
        this.imageHeight = image.height
        this.$emit('on-load', {
          width: this.imageWidth,
          height: this.imageHeight
        })
        let img = document.querySelector('.selector__img')
        if (this.imageWidth > this.imageHeight) {
          this.selector.style.width = '100%'
          img.style.maxWidth = this.selector.style.width
        } else {
          this.selector.style.height = '100%'
          img.style.maxHeight = this.selector.style.height
        }
        img.src = src
      }
    }
  },
  mounted () {
    this.selector = document.querySelector('.selector')
    this.selectorImg = document.querySelector('.selector__img')
    this.curArea = document.querySelector('.selector__curarea')

    this.selector.addEventListener('mousedown', this.selectLabelArea)
    this.selector.addEventListener('mousemove', this.selectLabelArea)
    this.selector.addEventListener('mouseup', this.selectLabelArea)
    this.selector.addEventListener('mouseleave', this.selectLabelArea)
    window.addEventListener('keydown', this.handleShowMask)
    window.addEventListener('keyup', this.handleShowMask)

    if (this.imgSrc) this.setImg(this.imgSrc)
  },
  beforeDestroy () {
    window.removeEventListener('keydown', this.handleShowMask)
    window.removeEventListener('keyup', this.handleShowMask)
  }
}
</script>

<style lang="less" scoped>
  .selector-container {
    width: 100%;
    height: 100%;
    .selector {
      position: relative;
      display: flex;
      z-index: 200;
      width: 100%;
      height: 100%;
      justify-content: center;
      align-items: center;
      .selector__img {
        user-select: none;
        z-index: 200;
        max-height: 100%;
        max-width: 100%;
      }
      .selector__curarea {
        display: none;
        position:absolute;
        width:100px;
        height:100px;
        background: repeating-linear-gradient(-45deg, rgba(11, 182, 182, 0.4), rgba(11, 182, 182, 0.4) 10px, rgba(60, 199, 199, 0.4) 10px, rgba(21, 123, 182, 0.4) 20px);
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
          cursor: n-resize;
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
          cursor: w-resize;
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
