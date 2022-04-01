<template>
  <Card class="utils-container">
    <!-- title -->
    <div slot="title">
      Utils &nbsp; {{ utilTitle }}
    </div>
    <!-- extra -->
    <div slot="extra">
      <Button
        size="small"
        type="primary"
        @click.native="handleCoordinate"
        id='btn-confirm-area'
        v-show="(isJobResourceFile || isJobResourceFileWithDefaultValue) && this.curFile"
      >确定</Button>
<!--      <Button-->
<!--        size="small"-->
<!--        type="primary"-->
<!--        style="margin-right: 16px;"-->
<!--        @click="handleAbsoluteCoordinates(false)"-->
<!--        id="btn-get-coordinate"-->
<!--        v-show="isPicInput && this.curFile"-->
<!--      >获取坐标</Button>-->
      <Button
        size="small"
        type="primary"
        @click="handleOffsetCoordinates"
        id="btn-point-offside"
        v-show="isOffset"
      >确定</Button>
      <Button
        size="small"
        type="primary"
        @click="handleAbsoluteCoordinates(true)"
        id="btn-get-relative-coordinate"
        v-show="isPicInput && this.curFile"
      >获取坐标比例</Button>
    </div>
    <!-- body -->
    <div>
      <p v-show="!editing">还没有可以展示/编辑的文件</p>
      <transition name="fade-loader">
        <CypressLoader
          :size="60"
          :fillColor="'#999'"
          v-show="isLoading"
        ></CypressLoader>
      </transition>
      <transition name="fade-tool">
        <ImageTool
          v-show="editing && !isLoading"
          :imgSrc="curFile? curFile.file : null"
          @outputResult="outputResult"
          :areasInfo="normalizedAreasInfo"
          :select-point-show="selectPoint"
        ></ImageTool>
      </transition>
    </div>
  </Card>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import ImageTool from '_c/common/ImageTool'
import CypressLoader from '_c/common/Loader'

export default {
  name: 'Utils',
  components: { ImageTool, CypressLoader },
  data () {
    return {
      btnConfirmArea: null,
      coordinate: null,
      itemType: null,
      threshold: null,
      fileInfo: null,
      normalizedAreasInfo: []
    }
  },
  computed: {
    ...mapState(['isLoading']),
    ...mapState('files', ['resFiles', 'curFile']),
    ...mapState('item', ['areasInfo', 'itemData','selectPoint']),
    ...mapGetters('item', ['isPicInput', 'isJobResourceFile', 'isJobResourcePicture', 'isJobResourceFileWithDefaultValue', 'isOffset']),
    ...mapGetters('img', ['imgRecRate']),
    editing () {
      return !!(this.curFile || this.isLoading)
    },
    utilTitle () {
      if (this.curFile && this.isJobResourcePicture) {
        return '(图片名称：' + this.curFile.name + ')'
      }
      if (this.curFile && this.isJobResourceFile) {
        return '(图片名称：' + this.curFile.name + ' | 识别率：' + this.imgRecRate + '%)'
      }
      return null
    }
  },
  watch: {
    areasInfo (val) {
      this.normalizedAreasInfo = this.normalizeAreasInfo(val)
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
    hasSelectAPoint () {
      if (!this.point) {
        this.$Message.warning({
          background: true,
          content: '请选择坐标点'
        })
        return false
      }
      return true
    },
    hasSelectOffset () {
      if (!this.offset) {
        this.$Message.warning({
          background: true,
          content: '请选择测距点'
        })
        return false
      }
      return true
    },
    handleCoordinate () {
      if (!this.hasSelectArea()) return
      let startPoint = this.coordinate.relativeCoordinate.topLeft
      let endPoint = this.coordinate.relativeCoordinate.bottomRight
      if((startPoint.y===endPoint.y) || (startPoint.x===endPoint.x)){
        this.$Message.info("选区无效，请重新选择！")
        return
      }
      this.$store.commit('img/handleCoordinate', {
        action: 'add',
        data: {
          coordinate_a: `${startPoint.x.toFixed(4)}, ${startPoint.y.toFixed(4)}`,
          coordinate_b: `${endPoint.x.toFixed(4)}, ${endPoint.y.toFixed(4)}`
        }
      })
      this.coordinate = null
    },
    handleAbsoluteCoordinates (isRelative) {
      if (!this.hasSelectAPoint()) return
      console.log(isRelative)
      console.log(this.relativePoint)
      this.$store.commit('img/setAbsoluteCoordinates', isRelative ? this.relativePoint : this.point) // 可以是原图坐标，也可以是比例坐标
      this.point = null
      this.relativePoint = null
    },
    handleOffsetCoordinates(){
      if (!this.hasSelectOffset()) return
      this.$store.commit('img/setOffsetCoordinates', this.offset)
      this.offset = null
    },
    outputResult (val) {
      this.coordinate = null
      this.point = null
      this.relativePoint = null
      this.offset = null
      if (val.coordinate) this.coordinate = this._.cloneDeep(val.coordinate)
      if (val.point && val.relativePoint) {
        this.point = this._.cloneDeep(val.point)
        this.relativePoint = this._.cloneDeep(val.relativePoint)
      }
      if (val.offset) this.offset = this._.cloneDeep(val.offset)
    },
    normalizeAreasInfo (val) { // 特征点区域数据整理
      let areasInfo = []
      if (Array.isArray(val.data)) {
        val.data.forEach(val => {
          let tlp = val.coordinate_a.split(',')
          let brp = val.coordinate_b.split(',')
          areasInfo.push({
            x: tlp[0],
            y: tlp[1],
            w: brp[0] - tlp[0],
            h: brp[1] - tlp[1]
          })
        })
      } else {
        let tlp = val.data.coordinate_a.split(',')
        let brp = val.data.coordinate_b.split(',')
        areasInfo.push({
          x: tlp[0],
          y: tlp[1],
          w: brp[0] - tlp[0],
          h: brp[1] - tlp[1]
        })
        areasInfo.index = val.index
      }
      return areasInfo
    }
  }
}
</script>

<style lang="less" scoped>
  @import '../../css/common.less';
  .utils-container {
    height: 100%;
    /deep/ .ivu-card-extra {
      top: 10px;
    }
    /deep/ .ivu-card-body {
      height: calc(100% - 44px);
      & > div:first-child {
        // display: flex;
        // justify-content: center;
        // align-items: center;
        position: relative;
        height: 100%;
        & > * {
          position: absolute;
          top: 50%;
          right: 50%;
          transform: translate(50%, -50%);
        }
        & > p:first-child {
          padding: 40px;
          border: 1px dashed #dddddd;
          border-radius: 6px;
          background-color: rgba(0, 0, 0, 0.3);
          color: white;
          transition-delay: .4s;
        }
      }
    }
  }
  .fade-loader-enter-active {
    transition: all .4s linear;
  }
  .fade-loader-leave-active {
    transition: all .4s linear;
  }
  .fade-loader-enter, .fade-loader-leave-active {
    opacity: 0;
  }
  .fade-tool-enter-active {
    transition: all .4s linear;
  }
  .fade-tool-leave-active {
    transition: all .4s linear;
  }
  .fade-tool-enter, .fade-tool-leave-active {
    opacity: 0;
  }
</style>
