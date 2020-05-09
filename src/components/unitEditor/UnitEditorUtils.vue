<template>
  <Card>
    <p slot="title">Utils &nbsp; {{ utilTitle }}</p>
    <div class="file-gallery">
      <p class="file-none" v-show="empty">还没有可以展示/编辑的文件</p>
      <!-- 加载动画 -->
      <div class="loader" v-if="isLoading">
        <div class="box"></div>
        <div class="box"></div>
        <div class="box"></div>
      </div>

      <div v-show="currentFile" class="file-container">
        <div class="image-container">
          <Button
            size="small"
            type="primary"
            @click.native="addCoordinate"
            id='btn-confirm-area'
            v-show="isJobResourceFile"
          >确定</Button>
          <Button
            size="small"
            type="primary"
            @click="handleAbsoluteCoordinates"
            id="btn-get-coordinate"
            v-show="isPicInput"
          >获取坐标</Button>
          <div class="image-dom">
            <img v-if="currentFile" draggable="false" class="image">
            <div id="selection-area" v-show="currentFile"></div>
          </div>
        </div>
      </div>
    </div>
  </Card>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { toDecimal } from 'lib/tools'
export default {
  name: 'Utils',
  data () {
    return {
      imageDom: null,
      imageWidth: null,
      imageHeight: null,
      imageDomData: null,
      selectionArea: null,
      btnConfirmArea: null,
      selectionAreaData: null,
      mouseStartX: null,
      mouseStartY: null,
      isDragging: false,
      itemType: null,
      threshold: null,
      fileInfo: null
    }
  },
  computed: {
    ...mapState([
      'isLoading'
    ]),
    ...mapState('files', [
      'currentFile'
    ]),
    ...mapGetters('item', [
      'isPicInput',
      'isJobResourceFile',
      'isJobResourcePicture'
    ]),
    ...mapGetters('img', [
      'imgRecRate'
    ]),
    empty () {
      return !(this.currentFile || this.isLoading)
    },
    utilTitle () {
      if (this.currentFile && this.isJobResourcePicture) {
        return '( 图片名称：' + this.currentFile.name + ' )'
      }
      if (this.currentFile && this.isJobResourceFile) {
        return '( 图片名称：' + this.currentFile.name + ' | 识别率：' + this.imgRecRate + '% )'
      }
      return null
    }
  },
  watch: {
    currentFile (val) {
      if (!val) return
      let image = new Image()
      image.src = val.file
      image.onload = () => {
        this.imageWidth = image.width
        this.imageHeight = image.height
        let img = document.querySelector('.image')
        if (this.imageWidth > this.imageHeight) {
          this.imageDom.style.width = '100%'
          this.imageDom.style.height = 'auto'
          img.style.maxWidth = this.imageDom.style.width
        } else {
          this.imageDom.style.height = '100%'
          this.imageDom.style.width = 'auto'
          img.style.maxHeight = this.imageDom.style.height
        }
        img.src = val.file
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
          this.imageDom = document.querySelector('.image-dom')
          this.imageDomData = this.imageDom.getBoundingClientRect()
          this.selectionArea.style.left = this.mouseStartX - this.imageDomData.x + 'px'
          this.selectionArea.style.top = this.mouseStartY - this.imageDomData.y + 'px'
          this.selectionArea.style.width = '0px'
          this.selectionArea.style.height = '0px'
          this.selectionArea.style.display = 'flex'

          let areas = document.querySelectorAll('.area')
          areas.forEach(area => {
            this.imageDom.removeChild(area)
          })
          break
        case 'mousemove':
          if (this.isDragging) {
            this.selectionArea.style.width = Math.abs(event.pageX - this.mouseStartX) + 'px'
            this.selectionArea.style.height = Math.abs(event.pageY - this.mouseStartY) + 'px'
          }
          break
        case 'mouseup':
          this.isDragging = false
          this.selectionAreaData = this.selectionArea.getBoundingClientRect()
          break
      }
    },
    addCoordinate () {
      let startPoint = {}
      let endPoint = {}
      startPoint.x = toDecimal((this.selectionAreaData.x - this.imageDomData.x) / this.imageDomData.width)
      startPoint.y = toDecimal((this.selectionAreaData.y - this.imageDomData.y) / this.imageDomData.height)
      endPoint.x = toDecimal((this.selectionAreaData.x + this.selectionAreaData.width - this.imageDomData.x) / this.imageDomData.width)
      endPoint.y = toDecimal((this.selectionAreaData.y + this.selectionAreaData.height - this.imageDomData.y) / this.imageDomData.height)
      this.$store.commit('img/addCoordinate', {
        coordinate_a: `${startPoint.x}, ${startPoint.y}`,
        coordinate_b: `${endPoint.x}, ${endPoint.y}`
      })
    },
    handleAbsoluteCoordinates () {
      let x = parseInt(toDecimal((this.selectionAreaData.x - this.imageDomData.x) / this.imageDomData.width) * this.imageWidth)
      let y = parseInt(toDecimal((this.selectionAreaData.y - this.imageDomData.y) / this.imageDomData.height) * this.imageHeight)
      this.$store.commit('img/setAbsoluteCoordinates', { x: x.toString(), y: y.toString() })
    }
  },
  mounted () {
    this.imageDom = document.querySelector('.image-dom')
    this.selectionArea = document.querySelector('#selection-area')
    this.btnConfirmArea = document.querySelector('#btn-confirm-area')

    this.imageDom.addEventListener('mousedown', this.selectLabelArea)
    this.imageDom.addEventListener('mousemove', this.selectLabelArea)
    this.imageDom.addEventListener('mouseup', this.selectLabelArea)
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
      background-color: rgba(0, 0, 0, 0.3);
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

        .image-dom {
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
            background: url('../../assets/image/selctionbg.png') repeat scroll 0 0 transparent;
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
