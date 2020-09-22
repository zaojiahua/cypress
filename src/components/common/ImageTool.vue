<template>
  <div class="image-tool-container">
    <div class="tool-bar">
      <button class="tool-bar-btn active" @click="(evt) => setEventType(evt, 0)">选区</button>
      <button class="tool-bar-btn" @click="(evt) => setEventType(evt, 1)">选点</button>
      <button class="tool-bar-btn" @click="(evt) => setEventType(evt, 2)">测距</button>
    </div>
    <div class="image-tool-content">
      <div>
        <canvas id="image-tool-canvas" :height="canvasH" :width="canvasW"></canvas>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'ImageTool',
  props: ['imgSrc', 'areasInfo'],
  data () {
    return {
      imageH: 0,
      imageW: 0,
      canvasH: 0,
      canvasW: 0,
      aspectRatio: 1.0,
      sizeRatio: 1.0,
      eventTypes: ['AREA', 'POINT', 'RANGING'],
      eventType: 'AREA',
      canvasToggle: false,
      outputInfo: null
    }
  },
  watch: {
    imgSrc (val) {
      this.drawImg(val)
    },
    areasInfo (val) {
      this.context2D.clearRect(0, 0, this.canvasW, this.canvasH)
      val.forEach((v, i) => {
        console.log(v)
        if (v.h < 1 && v.w < 1) {
          let x = v.x * this.canvasW
          let y = v.y * this.canvasH
          let w = v.w * this.canvasW
          let h = v.h * this.canvasH
          this.drawRect(x, y, w, h, 'rgba(87, 250, 255, .4)', 'rgba(87, 250, 255, .4)')
          this.fillText(val.index + 1 ? val.index + 1 + '' : i + 1 + '', x + w / 2, y + h / 2 + 14, 'white', 'center', 'bottom', '24px sans-serif')
        } else {
          this.drawRect(v.x, v.y, v.w, v.h, 'rgba(87, 250, 255, .4)', 'rgba(87, 250, 255, .4)')
          this.fillText(val.index + 1 ? val.index + 1 + '' : i + 1 + '', v.x + v.w / 2, v.y + v.h / 2 + 14, 'white', 'center', 'bottom', '24px sans-serif')
        }
      })
    }
  },
  methods: {
    drawImg (src) {
      let img = new Image()
      img.setAttribute('src', src)
      img.onload = () => {
        this.imageH = img.height
        this.imageW = img.width
        this.aspectRatio = img.height / img.width
        this.canvasH = document.querySelector('.image-tool-content').getBoundingClientRect().height
        this.canvasW = this.canvasH / this.aspectRatio
        this.sizeRatio = this.imageH / this.canvasH
        this.canvas.parentNode.style.backgroundImage = `url(${src})`
        this.setOffScreenCanvas(img)
      }
    },
    setEventType (evt, idx) {
      let toolBarBtns = [...document.querySelectorAll('.tool-bar-btn')]
      toolBarBtns.forEach(val => {
        if (val.classList.contains('active')) {
          val.classList.toggle('active')
        }
      })
      evt.target.classList.toggle('active')
      this.eventType = this.eventTypes[idx]
    },
    setOffScreenCanvas (img) {
      this.offscreenCanvas = document.createElement('canvas')
      this.offscreenContext = this.offscreenCanvas.getContext('2d')
      this.offscreenCanvas.width = img.width
      this.offscreenCanvas.height = img.height
      this.offscreenContext.drawImage(img, 0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height)
    },
    fillCircle (x, y, radius, fillStyle = '#F76132') {
      if (this.context2D !== null) {
        this.context2D.save()
        this.context2D.fillStyle = fillStyle
        this.context2D.beginPath()
        // 圆是圆弧的特殊表现形式[startAngle = 0, endAngle = 2 * Math.PI]
        this.context2D.arc(x, y, radius, 0, Math.PI * 2)
        this.context2D.fill()
        this.context2D.restore()
      }
    },
    fillText (text, x, y, color = 'white', align = 'left', baseline = 'top', font = '14px sans-serif') {
      if (this.context2D !== null) {
        this.context2D.save()
        this.context2D.textAlign = align
        this.context2D.textBaseline = baseline
        this.context2D.font = font
        this.context2D.fillStyle = color
        this.context2D.fillText(text, x, y)
        this.context2D.restore()
      }
    },
    strokeLine (x0, y0, x1, y1) {
      if (this.context2D !== null) {
        this.context2D.save()
        this.context2D.lineWidth = 2
        this.context2D.strokeStyle = '#F76132'
        this.context2D.beginPath()
        this.context2D.moveTo(x0, y0)
        this.context2D.lineTo(x1, y1)
        this.context2D.stroke()
        this.context2D.restore()
      }
    },
    drawRect (x, y, w, h, fillStyle = 'rgba(77,160,155,0.4)', strokeStyle = '#2d8cf0') {
      if (this.context2D !== null) {
        this.context2D.save()
        this.context2D.fillStyle = fillStyle
        this.context2D.strokeStyle = strokeStyle
        this.context2D.lineWidth = 1
        this.context2D.beginPath()
        this.context2D.moveTo(x, y)
        this.context2D.lineTo(x + w, y)
        this.context2D.lineTo(x + w, y + h)
        this.context2D.lineTo(x, y + h)
        this.context2D.closePath()
        this.context2D.fill()
        this.context2D.stroke()
        this.context2D.restore()
      }
    },
    drawTriangle (x0, y0, x1, y1) {
      if (this.context2D === null) {
        return
      }
      this.context2D.save()
      this.context2D.lineWidth = 2
      this.context2D.strokeStyle = '#F76132'
      this.context2D.beginPath()
      this.context2D.moveTo(x0, y0)
      this.context2D.lineTo(x1, y1)
      this.context2D.lineTo(x1, y0)
      this.context2D.closePath()
      this.context2D.stroke()
      this.context2D.restore()
    },
    dispatchMouseEvent (evt) {
      let { type, offsetX, offsetY } = evt
      switch (this.eventType) {
        case 'AREA':
          switch (type) {
            case 'mousedown':
              this.context2D.clearRect(0, 0, this.canvasW, this.canvasH)
              this.canvasToggle = true
              this.startX = offsetX
              this.startY = offsetY
              break
            case 'mousemove':
              if (this.canvasToggle) {
                this.context2D.clearRect(0, 0, this.canvasW, this.canvasH)
                let areaW = offsetX - this.startX
                let areaH = offsetY - this.startY
                if (areaW > 10 || areaH > 10) {
                  this.drawRect(this.startX, this.startY, areaW, areaH)
                  this.fillCircle(this.startX, this.startY, 4)
                  this.fillCircle(offsetX, offsetY, 4)
                }
              }
              break
            case 'mouseup':
              if (this.canvasToggle) {
                this.canvasToggle = false
                let absoluteCoordinate = {
                  topLeft: {
                    x: Math.max(0, Math.min(this.startX, offsetX)) * this.sizeRatio,
                    y: Math.max(0, Math.min(this.startY, offsetY)) * this.sizeRatio
                  },
                  bottomRight: {
                    x: Math.min(this.canvasW, Math.max(this.startX, offsetX)) * this.sizeRatio,
                    y: Math.min(this.canvasH, Math.max(this.startY, offsetY)) * this.sizeRatio
                  }
                }
                let relativeCoordinate = {
                  topLeft: {
                    x: absoluteCoordinate.topLeft.x / this.imageW,
                    y: absoluteCoordinate.topLeft.y / this.imageH
                  },
                  bottomRight: {
                    x: absoluteCoordinate.bottomRight.x / this.imageW,
                    y: absoluteCoordinate.bottomRight.y / this.imageH
                  }
                }
                this.outputInfo = { coordinate: {
                  absoluteCoordinate,
                  relativeCoordinate
                } }
                this.$emit('outputResult', JSON.parse(JSON.stringify(this.outputInfo)))
              }
              break
            case 'mouseleave':
              if (this.canvasToggle) {
                this.canvasToggle = false
                let absoluteCoordinate = {
                  topLeft: {
                    x: Math.max(0, Math.min(this.startX, offsetX)) * this.sizeRatio,
                    y: Math.max(0, Math.min(this.startY, offsetY)) * this.sizeRatio
                  },
                  bottomRight: {
                    x: Math.min(this.canvasW, Math.max(this.startX, offsetX)) * this.sizeRatio,
                    y: Math.min(this.canvasH, Math.max(this.startY, offsetY)) * this.sizeRatio
                  }
                }
                let relativeCoordinate = {
                  topLeft: {
                    x: absoluteCoordinate.topLeft.x / this.imageW,
                    y: absoluteCoordinate.topLeft.y / this.imageH
                  },
                  bottomRight: {
                    x: absoluteCoordinate.bottomRight.x / this.imageW,
                    y: absoluteCoordinate.bottomRight.y / this.imageH
                  }
                }
                this.outputInfo = { coordinate: {
                  absoluteCoordinate,
                  relativeCoordinate
                } }
                this.$emit('outputResult', JSON.parse(JSON.stringify(this.outputInfo)))
              }
              break
          }
          break
        case 'POINT':
          switch (type) {
            case 'mousedown':
              this.context2D.clearRect(0, 0, this.canvasW, this.canvasH)
              let { offsetX, offsetY } = evt
              this.fillCircle(offsetX, offsetY, 10)
              this.outputInfo = {
                point: {
                  x: (offsetX * this.sizeRatio).toFixed(2),
                  y: (offsetY * this.sizeRatio).toFixed(2)
                }
              }
              this.$emit('outputResult', JSON.parse(JSON.stringify(this.outputInfo)))
              break
          }
          break
        case 'RANGING':
          switch (type) {
            case 'mousedown':
              this.context2D.clearRect(0, 0, this.canvasW, this.canvasH)
              this.canvasToggle = true
              this.startX = offsetX
              this.startY = offsetY
              break
            case 'mousemove':
              if (this.canvasToggle) {
                this.context2D.clearRect(0, 0, this.canvasW, this.canvasH)
                if (offsetX - this.startX > 10 || offsetY - this.startY > 10) {
                  this.drawTriangle(this.startX, this.startY, offsetX, offsetY)
                  this.fillCircle(this.startX, this.startY, 4)
                  this.fillText(`${((offsetX - this.startX) * this.sizeRatio).toFixed(2)}`, this.startX, this.startY + 6, 'green')
                  this.fillText(`${((offsetY - this.startY) * this.sizeRatio).toFixed(2)}`, offsetX + 10, offsetY - 10, 'green')
                }
              }
              break
            case 'mouseup':
              if (this.canvasToggle) {
                this.canvasToggle = false
                if (offsetX - this.startX > 10 || offsetY - this.startY > 10) {
                  this.drawTriangle(this.startX, this.startY, offsetX, offsetY)
                  this.outputInfo = {
                    offset: {
                      offsetX: ((offsetX - this.startX) * this.sizeRatio).toFixed(2),
                      offsetY: ((offsetY - this.startY) * this.sizeRatio).toFixed(2)
                    }
                  }
                  this.$emit('outputResult', JSON.parse(JSON.stringify(this.outputInfo)))
                }
              }
              break
            case 'mouseleave':
              if (this.canvasToggle) {
                this.canvasToggle = false
                if (offsetX - this.startX > 10 || offsetY - this.startY > 10) {
                  this.drawTriangle(this.startX, this.startY, offsetX, offsetY)
                  this.outputInfo = {
                    offset: {
                      offsetX: ((offsetX - this.startX) * this.sizeRatio).toFixed(2),
                      offsetY: ((offsetY - this.startY) * this.sizeRatio).toFixed(2)
                    }
                  }
                  this.$emit('outputResult', JSON.parse(JSON.stringify(this.outputInfo)))
                }
              }
          }
          break
      }
    }
  },
  mounted () {
    this.canvas = document.querySelector('#image-tool-canvas')
    this.canvas.addEventListener('mousedown', this.dispatchMouseEvent)
    this.canvas.addEventListener('mousemove', this.dispatchMouseEvent)
    this.canvas.addEventListener('mouseup', this.dispatchMouseEvent)
    this.canvas.addEventListener('mouseleave', this.dispatchMouseEvent)
    this.context2D = this.canvas.getContext('2d')
    this.drawImg(this.imgSrc)
  }
}
</script>
<style lang="less" scoped>
.image-tool-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  .tool-bar {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    height: 60px;
    padding: 1em;
    .tool-bar-btn {
      padding: 0.2em 0.8em;
      margin-right: 1em;
      border: 0;
      font-size: 1rem;
      color: white;
      border-radius: 0.5em;
      background-color: #57b;
      box-shadow: 0 0.4em #148;
      text-shadow: 1px 1px #148;
      &:active {
        background-color: #456ab5;
        transform: translateY(0.1em);
        box-shadow: 0 0.3em #148;
      }
      &:focus {
        outline: none;
      }
    }
    .active {
      background-color: rgb(104, 201, 231);
      box-shadow: 0 0.4em rgb(81, 158, 182);
      color: black;
    }
  }
  .image-tool-content {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    div {
      position: relative;
      background-repeat: no-repeat;
      background-size: contain;
      font-size: 0;
      #image-tool-canvas {
        background-color: transparent;
        background-repeat: no-repeat;
        background-size: contain;
      }
    }
  }
}
</style>
