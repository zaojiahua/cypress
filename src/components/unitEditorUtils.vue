<template>
  <Card>
    <p slot="title">Utils &nbsp; {{ fileName ? `(${fileName})` : '' }}</p>
    <div class="file-gallery">
      <p class="file-none" v-show="!fileToShow && !isLoading">还没有可以展示/编辑的文件</p>
      <!-- 加载动画 -->
      <div class="loader" v-if="isLoading">
        <div class="box"></div>
        <div class="box"></div>
        <div class="box"></div>
      </div>

      <div v-show="fileToShow" class="file-container">
        <div class="image-container">
          <Button size="small" type="primary" @click.native="getCoordinate" id='btn-confirm-area' v-show="itemType === 'jobResourceFile'">确定</Button>
          <Button size="small" type="primary" @click="getPointAbsoluteCoordinates" id="btn-get-coordinate" v-show="itemType === 'picInput'">获取坐标</Button>
          <div class="image-zoom">
            <img :src="fileToShow" draggable="false" class="image">
            <div id="selection-area" v-show="isScreenShot"></div>
          </div>
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
      isScreenShot: false,
      imageZoom: null,
      imageZoomData: null,
      selectionArea: null,
      btnConfirmArea: null,
      selectionAreaData: null,
      mouseStartX: undefined,
      mouseStartY: undefined,
      isDragging: false,
      imageWidth: null,
      imageHeight: null,
      itemType: null
    }
  },
  methods: {
    setFileData (data) {
      this.fileName = data.fileName
      this.isScreenShot = data.isScreenShot
      this.itemType = data.itemType
      // console.log(this.itemType)
      if (data.fileToShow) {
        let _this = this
        let image = new Image()
        image.src = data.fileToShow
        image.onload = function () {
          _this.imageWidth = image.width
          _this.imageHeight = image.height
          let img = document.querySelector('.image')
          if (this.imageWidth > this.imageHeight) {
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
    selectArea (event) {
      event.preventDefault()
      switch (event.type) {
        case 'mousedown':
          var selArea = this.selectionArea
          this.isDragging = true
          this.mouseStartX = event.clientX
          this.mouseStartY = event.clientY
          if (!this.imageZoomData) {
            this.imageZoomData = this.imageZoom.getBoundingClientRect()
          }
          selArea.style.left = this.mouseStartX - this.imageZoomData.x + 'px'
          selArea.style.top = this.mouseStartY - this.imageZoomData.y + 'px'
          selArea.style.width = '0px'
          selArea.style.height = '0px'
          selArea.style.display = 'flex'
          break
        case 'mousemove':
          selArea = this.selectionArea
          if (this.isDragging) {
            selArea.style.width = Math.abs(event.clientX - this.mouseStartX) + 'px'
            selArea.style.height = Math.abs(event.clientY - this.mouseStartY) + 'px'
          }
          break
        case 'mouseup':
          this.isDragging = false
          this.selectionAreaData = this.selectionArea.getBoundingClientRect()
          break
      }
    },
    getPointAbsoluteCoordinates () {
      let x = parseInt(toDecimal((this.selectionAreaData.x - this.imageZoomData.x) / this.imageZoomData.width) * this.imageWidth)
      let y = parseInt(toDecimal((this.selectionAreaData.y - this.imageZoomData.y) / this.imageZoomData.height) * this.imageHeight)
      this.$bus.emit('getPointAbsoluteCoordinates', { x, y })
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
    this.$bus.on('setItemType', (itemType) => {
      this.itemType = itemType
    })
  },
  mounted () {
    this.imageZoom = document.querySelector('.image-zoom')
    this.selectionArea = document.querySelector('#selection-area')
    this.btnConfirmArea = document.querySelector('#btn-confirm-area')

    this.imageZoom.addEventListener('mousedown', this.selectArea)
    this.imageZoom.addEventListener('mousemove', this.selectArea)
    this.imageZoom.addEventListener('mouseup', this.selectArea)
  },
  beforeDestroy () {
    this.$bus.off('showFile')
    this.$bus.off('isLoading')
    this.$bus.off('reset', this.reset)
    this.$bus.off('setFileName')
    this.$bus.off('setItemType')
    this.imageZoom.removeEventListener('mousedown', this.selectArea)
    this.imageZoom.removeEventListener('mousemove', this.selectArea)
    this.imageZoom.removeEventListener('mouseup', this.selectArea)
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

    .image-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      position: relative;
      background: linear-gradient(to bottom right ,#12c2e9, #c471ed, #f64f59);

      #btn-confirm-area, #btn-get-coordinate {
        position: absolute;
        right: 0;
        top: -54px;
      }

      .image-zoom {
        position: relative;

        .image {
          user-select: none;
        }

        #selection-area {
          position:absolute;
          width:0px;
          height:0px;
          font-size:0px;
          margin:0px;
          padding:0px;
          border:1px dashed #0099FF;
          background: url('../assets/image/selctionbg.png') repeat scroll 0 0 transparent;
          display: none;
          justify-content: center;
          align-items: center;

          .block{
            position: absolute;
            z-index: 1;
            width: 4px;
            height: 4px;
            background-color: #0f0;
          }
        }
      }
    }
  }
}
</style>
