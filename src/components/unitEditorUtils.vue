<template>
  <Card>
    <p slot="title">Utils &nbsp; {{ fileName ? `(${fileName})` : '' }}</p>
    <div class="file-gallery">
      <p class="file-none" v-show="!fileToShow && !isLoading">还没有可以展示/编辑的文件</p>
      <div class="loader" v-if="isLoading">
        <div class="box"></div>
        <div class="box"></div>
        <div class="box"></div>
      </div>
      <div v-show="fileToShow" class="file-container">
        <div v-show="isText" class="text">
          <Input v-model="fileToShow" type="textarea" :rows="16" />
        </div>
        <div v-show="isImage" class="image-container">
          <div class="image-zoom">
            <img :src="fileToShow" draggable="false" class="image">
            <div id="selection-area" v-show="isScreenShot">
              <Button size="small" type="primary" @click="getCoordinate">选取完毕</Button>
              <div class="block" id="top-left"></div>
              <div class="block" id="top-right"></div>
              <div class="block" id="bottom-right"></div>
              <div class="block" id="bottom-left"></div>
              <div class="border" id="top"></div>
              <div class="border" id="right"></div>
              <div class="border" id="bottom"></div>
              <div class="border" id="left"></div>
            </div>
          </div>
        </div>
        <div v-show="isVideo" class="video">
          <video :src="fileToShow" controls></video>
        </div>
      </div>
    </div>
  </Card>
</template>

<script>
import { toDecimal } from '../lib/tools'

export default {
  data () {
    return {
      fileName: null,
      fileToShow: null,
      isLoading: false,
      isText: false,
      isImage: false,
      isVideo: false,
      isScreenShot: false,
      imageZoom: null,
      imageZoomData: null,
      selectionArea: null,
      selectionAreaData: null,
      mouseStartX: undefined,
      mouseStartY: undefined,
      dragging: false,
      bottomRightToggle: false
    }
  },
  methods: {
    setFileData (data) {
      this.fileName = data.fileName
      this.isText = data.isText
      this.isImage = data.isImage
      this.isVideo = data.isVideo
      this.isScreenShot = data.isScreenShot
      if (this.isImage && data.fileToShow) {
        let _this = this
        let image = new Image()
        image.src = data.fileToShow
        image.onload = function () {
          let width = image.width
          let height = image.height
          let img = document.querySelector('.image')
          if (width > height) {
            _this.imageZoom.style.width = '100%'
            _this.imageZoom.style.height = 'auto'
            img.style.maxWidth = _this.imageZoom.style.width
          } else {
            _this.imageZoom.style.height = '100%'
            _this.imageZoom.style.width = 'auto'
            img.style.maxHeight = _this.imageZoom.style.height
          }
          _this.fileToShow = data.fileToShow
        }
      } else {
        this.fileToShow = data.fileToShow
      }
    },
    drag (event) {
      event.preventDefault()
      switch (event.type) {
        case 'mousedown':
          this.dragging = true
          this.mouseStartX = event.screenX
          this.mouseStartY = event.screenY
          this.imageZoomData = this.imageZoom.getBoundingClientRect()
          this.selectionAreaData = this.selectionArea.getBoundingClientRect()
          break
        case 'mousemove':
          let moveX = event.screenX - this.mouseStartX
          let moveY = event.screenY - this.mouseStartY
          if (this.dragging && !this.bottomRightToggle) {
            if (event.target.id === 'selection-area') {
              let topLeftX = moveX + this.selectionAreaData.x - this.imageZoomData.x
              let topLeftY = moveY + this.selectionAreaData.y - this.imageZoomData.y
              topLeftX = Math.min(Math.max(0, topLeftX), this.imageZoomData.width - this.selectionAreaData.width)
              topLeftY = Math.min(Math.max(0, topLeftY), this.imageZoomData.height - this.selectionAreaData.height)
              this.selectionArea.style.left = topLeftX + 'px'
              this.selectionArea.style.top = topLeftY + 'px'
            }
          }
          if (this.dragging && this.bottomRightToggle) {
            let width = Math.min(this.selectionAreaData.width + moveX, this.imageZoomData.width)
            let height = Math.min(this.selectionAreaData.height + moveY, this.imageZoomData.height)

            this.selectionArea.style.width = width + 'px'
            this.selectionArea.style.height = height + 'px'
          }
          break
        case 'mouseup':
          this.dragging = false
          this.bottomRightToggle = false
          break
      }
    },
    over (event) {
      if (!this.dragging) {
        switch (event.target.id) {
          case 'bottom-right':
            this.bottomRightToggle = true
            break
          default:
            this.bottomRightToggle = false
        }
      }
    },
    getCoordinate () {
      let startPoint = {}
      let endPoint = {}
      startPoint.x = toDecimal((this.selectionAreaData.x - this.imageZoomData.x) / this.imageZoomData.width)
      startPoint.y = toDecimal((this.selectionAreaData.y - this.imageZoomData.y) / this.imageZoomData.height)
      endPoint.x = toDecimal((this.selectionAreaData.x + this.selectionAreaData.width - this.imageZoomData.x) / this.imageZoomData.width)
      endPoint.y = toDecimal((this.selectionAreaData.y + this.selectionAreaData.height - this.imageZoomData.y) / this.imageZoomData.height)
      this.$bus.emit('getCoordinate', {
        coordinate_a: `${startPoint.x}, ${startPoint.y}`,
        coordinate_b: `${endPoint.x}, ${endPoint.y}`
      })
    },
    reset () {
      // this.fileName = null
      // this.fileToShow = null
      // this.isLoading = false
      // this.isText = false
      // this.isImage = false
      // this.isVideo = false
      // this.isScreenShot = false
    }
  },
  created () {
    this.$bus.on('showFile', data => {
      this.setFileData(data)
    })
    this.$bus.on('isLoading', () => {
      this.isLoading = !this.isLoading
      this.fileToShow = null
    })
    this.$bus.on('reset', this.reset)
    this.$bus.on('setFileName', fileName => {
      this.fileName = fileName
    })
  },
  mounted () {
    this.imageZoom = document.querySelector('.image-zoom')
    this.selectionArea = document.querySelector('#selection-area')

    document.addEventListener('mouseover', this.over)
    this.selectionArea.addEventListener('mousedown', this.drag)
    this.imageZoom.addEventListener('mousemove', this.drag)
    this.imageZoom.addEventListener('mouseup', this.drag)
  },
  beforeDestroy () {
    this.$bus.off('showFile')
    this.$bus.off('isLoading')
    this.$bus.off('reset', this.reset)
    this.$bus.off('setFileName')
    document.removeEventListener('mouseover', this.over)
    this.selectionArea.removeEventListener('mousedown', this.drag)
    this.imageZoom.removeEventListener('mousemove', this.drag)
    this.imageZoom.removeEventListener('mouseup', this.drag)
  }
}
</script>

<style lang="less" scoped>
.file-gallery {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 755px;

  .file-none {
    padding: 40px;
    border: 1px dashed #dddddd;
    border-radius: 6px;
    background-color: rgba(0, 0, 0, 0.4);
    color: white;
  }

  .loader {
    position: absolute;
    width: 200px;
    height: 200px;
    top: 50%;
    left: 50%;
    z-index: 5;
    transform: translate(-50%, -50%);

    .box {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      transform-origin: 48% 48%;
      mix-blend-mode: screen;
    }
    .box:nth-child(1) {
      background-color: #0000ff;
      animation: turn 3s linear 0s infinite;
    }
    .box:nth-child(2) {
      background-color: #00ff00;
      animation: turn 3s linear -1s infinite;
    }
    .box:nth-child(3) {
      background-color: #ff0000;
      animation: turn 3s linear -2s infinite;
    }
    @keyframes turn {
      to {
        transform: rotate(360deg);
      }
    }
  }

  .file-container {
    flex: 1;
    height: 100%;

    .text {

    }

    .image-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;

      .image-zoom {
        position: relative;

        .image {
          user-select: none;
        }

        #selection-area {
          position: absolute;
          top: 40px;
          left: 40px;
          width: 100px;
          height: 100px;
          cursor: move;
          background: url('../assets/image/selctionbg.png') repeat scroll 0 0 transparent;
          display: flex;
          justify-content: center;
          align-items: center;

          .block{
            position: absolute;
            z-index: 1;
            width: 4px;
            height: 4px;
            background-color: #0f0;
          }
          #top-left {
            // cursor: nw-resize;
            top: -4px;
            left: -4px;
          }
          #top-right {
            // cursor: ne-resize;
            top: -4px;
            right: -4px;
          }
          #bottom-right {
            cursor: se-resize;
            bottom: -4px;
            right: -4px;
            background-color: red;
          }
          #bottom-left {
            // cursor: sw-resize;
            bottom: -4px;
            left: -4px;
          }
          .border {
            position: absolute;
            background-color: #0f0;
          }
          #top,#bottom {
            width: 100%;
            height: 4px;
          }
          #right,#left {
            width: 4px;
            height: 100%;
          }
          #top {
            top: -4px;
            // cursor: n-resize;
          }
          #right {
            right: -4px;
            cursor: e-resize;
          }
          #bottom {
            bottom: -4px;
            cursor: s-resize;
          }
          #left {
            left: -4px;
            // cursor: w-resize;
          }
        }
      }
    }

    .video {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;

      video {
        max-height: 755px;
      }
    }
  }
}
</style>
