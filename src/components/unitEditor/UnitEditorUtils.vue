<template>
  <div class="card">
    <p class="card-title flex-row title">
      Utils &nbsp; {{ utilTitle }}
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
    </p>
    <div class="file-gallery card-body">
      <p class="file-none" v-show="empty">还没有可以展示/编辑的文件</p>
      <!-- 加载动画 -->
      <div class="loader" v-if="isLoading">
        <div class="box"></div>
        <div class="box"></div>
        <div class="box"></div>
      </div>
      <AreaSelector v-show="currentFile" :imgSrc="currentFile ? currentFile.file : ''" @on-select="select" :closable="true" maskKey="F2"></AreaSelector>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import AreaSelector from '_c/common/AreaSelector'

export default {
  name: 'Utils',
  components: { AreaSelector },
  data () {
    return {
      btnConfirmArea: null,
      coordinate: null,
      itemType: null,
      threshold: null,
      fileInfo: null
    }
  },
  computed: {
    ...mapState(['isLoading']),
    ...mapState('files', ['resFiles', 'currentFile']),
    ...mapGetters('item', ['isPicInput', 'isJobResourceFile', 'isJobResourcePicture']),
    ...mapGetters('img', ['imgRecRate']),
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
  methods: {
    hasSelectArea () {
      if (!this.coordinate || !this.coordinate.relativeCoordinate || !this.coordinate.absoluteCoordinate) {
        this.$Message.warning({
          background: true,
          content: '请选择区域'
        })
        return false
      }
      return true
    },
    addCoordinate () {
      if (!this.hasSelectArea()) return
      let startPoint = this.coordinate.relativeCoordinate.topLeft
      let endPoint = this.coordinate.relativeCoordinate.bottomRight
      this.$store.commit('img/addCoordinate', {
        coordinate_a: `${startPoint.x.toFixed(4)}, ${startPoint.y.toFixed(4)}`,
        coordinate_b: `${endPoint.x.toFixed(4)}, ${endPoint.y.toFixed(4)}`
      })
    },
    handleAbsoluteCoordinates () {
      if (!this.hasSelectArea()) return
      let x = parseInt(this.coordinate.absoluteCoordinate.topLeft.x)
      let y = parseInt(this.coordinate.absoluteCoordinate.topLeft.y)
      this.$store.commit('img/setAbsoluteCoordinates', { x, y })
    },
    select (val) {
      this.coordinate = val
    }
  }
}
</script>

<style lang="less" scoped>
  @import '../../css/common.less';
  .title {
    position: relative;
    Button {
      position: absolute;
      right: 1em;
    }
  }
  .file-gallery {
    display: flex;
    justify-content: center;
    align-items: center;

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
      z-index: 5;

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
      }
    }
  }
</style>
