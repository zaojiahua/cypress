<template>
  <div class="image-tool-container">
    <div class="tool-bar">
      <Button v-for="(val, idx) in eventTypes" :type="val === eventType ? 'primary' : 'default'" size="small" :key="val" @click="setEventType(idx)">{{ val }}</Button>
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
  props: {
    imgSrc: String,
    areasInfo: Array,
    selectPointShow: Array,
  },
  data () {
    return {
      imageH: 0,
      imageW: 0,
      canvasH: 0,
      canvasW: 0,
      aspectRatio: 1.0,
      sizeRatio: 1.0,
      eventTypes: ['选区', '选点', '测距'],
      eventType: '选区', // 当前功能
      canvasToggle: false,
      outputInfo: null
    }
  },
  computed: {
    offsetString () {
      if (this.outputInfo && this.outputInfo.offset) {
        return `offsetX: ${this.outputInfo.offset.offsetX}, offsetY: ${this.outputInfo.offset.offsetY}`
      }
      return ''
    }
  },
  watch: {
    imgSrc (val) {
      this.drawImg(val)
    },
    areasInfo (val) { // 传入选取信息时
      this.context2D.clearRect(0, 0, this.canvasW, this.canvasH) // 清空当前绘制的内容
      val.forEach((v, i) => {
        if (v.h <= 1 && v.w <= 1) { // 传入的是小数
          let x = v.x * this.canvasW
          let y = v.y * this.canvasH
          let w = v.w * this.canvasW
          let h = v.h * this.canvasH
          this.drawRect(x, y, w, h, 'rgba(87, 250, 255, .4)', 'rgba(87, 250, 255, .4)') // 画出区域
          this.fillText(val.index + 1 ? val.index + 1 + '' : i + 1 + '', x + w / 2, y + h / 2 + 14, 'white', 'center', 'bottom', '24px sans-serif') // 填入区域序号
        } else { // 传入的是真实尺寸
          this.drawRect(v.x, v.y, v.w, v.h, 'rgba(87, 250, 255, .4)', 'rgba(87, 250, 255, .4)')
          this.fillText(val.index + 1 ? val.index + 1 + '' : i + 1 + '', v.x + v.w / 2, v.y + v.h / 2 + 14, 'white', 'center', 'bottom', '24px sans-serif')
        }
      })
    },
    selectPointShow (val) {
      setTimeout(()=>{  //因为图片的加载时间会更长（加载过程为异步过程），需要设置设置延迟执行
        this.context2D.clearRect(0, 0, this.canvasW, this.canvasH)
        for (const value of val) {
          if (value.x <= 1 && value.y <= 1 ){
            this.fillCircle(value.x * this.canvasW, value.y * this.canvasH, 12, 'rgba(107, 40, 200, .2)')
            this.fillCircle(value.x * this.canvasW, value.y * this.canvasH, 3)
          }else {
            this.fillCircle(value.x * this.canvasW / this.imageW, value.y * this.canvasH / this.imageH, 12, 'rgba(107, 40, 200, .2)')
            this.fillCircle(value.x * this.canvasW / this.imageW, value.y * this.canvasH / this.imageH, 3)
          }
        }
      },500);

    }
  },
  methods: {
    drawImg (src) {
      let img = new Image()
      img.setAttribute('src', src)
      img.onload = () => { // 图片加载完成时调整大小以适应屏幕（异步）
        this.imageH = img.height
        this.imageW = img.width
        this.aspectRatio = img.height / img.width
        if (this.imageH > this.imageW) {
          this.canvasH = document.querySelector('.image-tool-content').getBoundingClientRect().height
          this.canvasW = this.canvasH / this.aspectRatio
        } else {
          this.canvasW = document.querySelector('.image-tool-container').parentNode.getBoundingClientRect().width - 32
          this.canvasH = this.canvasW * this.aspectRatio
        }
        this.sizeRatio = this.imageH / this.canvasH
        this.canvas.parentNode.style.backgroundImage = `url(${src})`
        this.setOffScreenCanvas(img)
      }
    },
    setEventType (idx) {
      this.eventType = this.eventTypes[idx]
    },
    setOffScreenCanvas (img) { // 设置离屏画布, 取色器与放大镜功能可以在这里扩充
      this.offscreenCanvas = document.createElement('canvas')
      this.offscreenContext = this.offscreenCanvas.getContext('2d')
      this.offscreenCanvas.width = img.width
      this.offscreenCanvas.height = img.height
      this.offscreenContext.drawImage(img, 0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height) // 异步操作，会导致覆盖选点
    },
    fillCircle (x, y, radius, fillStyle = '#F76132') { // 画圆
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
    fillText (text, x, y, color = 'white', align = 'left', baseline = 'top', font = '14px sans-serif') { // 绘制文本
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
    strokeLine (x0, y0, x1, y1) { // 画线
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
    drawRect (x, y, w, h, fillStyle = 'rgba(77,160,155,0.4)', strokeStyle = '#2d8cf0') { // 画长方体
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
    drawTriangle (x0, y0, x1, y1) { // 画三角形
      if (this.context2D === null) {
        return
      }
      this.context2D.save()
      this.context2D.lineWidth = 2
      this.context2D.fillStyle = 'white'
      this.context2D.strokeStyle = '#F76132'
      this.context2D.beginPath()
      this.context2D.moveTo(x0, y0)
      this.context2D.lineTo(x1, y1)
      this.context2D.lineTo(x1, y0)
      this.context2D.closePath()
      this.context2D.stroke()
      this.context2D.fill()
      this.context2D.restore()
    },
    dispatchMouseEvent (evt) { // 分发鼠标事件
      let { type, offsetX, offsetY } = evt
      switch (this.eventType) {
        case '选区':
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
                let areaW = (absoluteCoordinate.bottomRight.x - absoluteCoordinate.topLeft.x) / this.sizeRatio
                let areaH = (absoluteCoordinate.bottomRight.y - absoluteCoordinate.topLeft.y) / this.sizeRatio
                if (areaW > 10 || areaH > 10) {
                  this.drawRect(absoluteCoordinate.topLeft.x / this.sizeRatio, absoluteCoordinate.topLeft.y / this.sizeRatio, areaW, areaH)
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
        case '选点':
          switch (type) {
            case 'mousedown':
              this.context2D.clearRect(0, 0, this.canvasW, this.canvasH)
              let { offsetX, offsetY } = evt
              this.fillCircle(offsetX, offsetY, 12, 'rgba(107, 40, 200, .2)')
              this.fillCircle(offsetX, offsetY, 3)
              this.outputInfo = {
                point: {
                  x: (offsetX * this.sizeRatio).toFixed(2),
                  y: (offsetY * this.sizeRatio).toFixed(2)
                },
                relativePoint: {
                  x: ((offsetX * this.sizeRatio).toFixed(2) / this.imageW).toFixed(4),
                  y: ((offsetY * this.sizeRatio).toFixed(2) / this.imageH).toFixed(4)
                }
              }
              this.$emit('outputResult', JSON.parse(JSON.stringify(this.outputInfo)))
              break
          }
          break
        case '测距':
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
                if (Math.abs(offsetX - this.startX) > 10 || Math.abs(offsetY - this.startY) > 10) {
                  this.drawTriangle(this.startX, this.startY, offsetX, offsetY)
                  this.drawRect(0, 0, this.canvasW, 20, 'white')
                  this.fillCircle(this.startX, this.startY, 4)
                  let tempOffsetX = ((offsetX - this.startX) * this.sizeRatio).toFixed(2)
                  let tempOffsetY = ((offsetY - this.startY) * this.sizeRatio).toFixed(2)
                  this.fillText(`offsetX: ${tempOffsetX}, offsetY: ${tempOffsetY}`, 2, 5, 'black')
                  this.outputInfo = {
                    offset: {
                      offsetX: tempOffsetX,
                      offsetY: tempOffsetY
                    }
                  }
                  this.$emit('outputResult', JSON.parse(JSON.stringify(this.outputInfo)))
                }
              }
              break
            case 'mouseup':
              if (this.canvasToggle) {
                this.canvasToggle = false
                if (Math.abs(offsetX - this.startX) > 10 || Math.abs(offsetY - this.startY) > 10) {
                  this.drawTriangle(this.startX, this.startY, offsetX, offsetY)
                  this.drawRect(0, 0, this.canvasW, 20, 'white')
                  this.fillCircle(this.startX, this.startY, 4)
                  let tempOffsetX = ((offsetX - this.startX) * this.sizeRatio).toFixed(2)
                  let tempOffsetY = ((offsetY - this.startY) * this.sizeRatio).toFixed(2)
                  this.fillText(`offsetX: ${tempOffsetX}, offsetY: ${tempOffsetY}`, 2, 5, 'black')
                  this.outputInfo = {
                    offset: {
                      offsetX: tempOffsetX,
                      offsetY: tempOffsetY
                    }
                  }
                  this.$emit('outputResult', JSON.parse(JSON.stringify(this.outputInfo)))
                }
              }
              break
            case 'mouseleave':
              if (this.canvasToggle) {
                this.canvasToggle = false
                if (Math.abs(offsetX - this.startX) > 10 || Math.abs(offsetY - this.startY) > 10) {
                  this.drawTriangle(this.startX, this.startY, offsetX, offsetY)
                  this.drawRect(0, 0, this.canvasW, 20, 'white')
                  this.fillCircle(this.startX, this.startY, 4)
                  let tempOffsetX = ((offsetX - this.startX) * this.sizeRatio).toFixed(2)
                  let tempOffsetY = ((offsetY - this.startY) * this.sizeRatio).toFixed(2)
                  this.fillText(`offsetX: ${tempOffsetX}, offsetY: ${tempOffsetY}`, 2, 5, 'black')
                  this.outputInfo = {
                    offset: {
                      offsetX: tempOffsetX,
                      offsetY: tempOffsetY
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
    this.context2D = this.canvas.getContext('2d') // 使用canvas
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
    height: 40px;
    padding-bottom: .6em;
    Button {
      margin-right: 1em;
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
      transition: box-shadow .3s linear;
      &:hover {
        box-shadow: 0 0 6px #666;
      }
      #image-tool-canvas {
        background-color: transparent;
        background-repeat: no-repeat;
        background-size: contain;
      }
    }
  }
}
</style>
