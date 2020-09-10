<template>
  <div class="mb-1">
    <Divider orientation="left">选取特征点</Divider>
    <Table
      :columns="coordinateColumn"
      :data="coordinates"
      border
      max-height="556"
      size="small"
      class="mb-1"
      @on-row-click="showLabelArea"
    >
      <template slot-scope="{ row, index }" slot="action">
        <Button type="error" size="small" @click.stop.native="remove(index)" :disabled="coordinates.length === 1">Delete</Button>
      </template>
    </Table>
    <div class="file-info">
      <div class="file-name">
        <Tag color="blue" size="large" class="tag">文件名称</Tag>
        <Input
          placeholder="为选取的特征点们取一个名字吧"
          @input="setFeaturePointFileName"
          v-model="currentFeaturePointFileName"
          style="flex: 1;"
          clearable
        ></Input>
      </div>
      <div class="recognition-rate">
        <Tag color="blue" size="large" class="tag">识别率</Tag>
        <InputNumber
          :max="100"
          :min="0"
          v-model="imgRecRate"
          style="flex: 1;"
          placeholder="识别率标准..."
          :formatter="value => `${value}%`"
          :parser="value => value.replace('%', '')"
        ></InputNumber>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'FeaturePoint',
  props: {
    featurePointFileName: String
  },
  data () {
    return {
      coordinateColumn: [
        {
          type: 'index',
          width: 60,
          align: 'center'
        },
        {
          title: 'coordinate_A',
          key: 'coordinate_a',
          align: 'center'
        },
        {
          title: 'coordinate_B',
          key: 'coordinate_b',
          align: 'center'
        },
        {
          title: 'Action',
          slot: 'action',
          width: 150,
          align: 'center'
        }
      ],
      currentFeaturePointFileName: this.featurePointFileName
    }
  },
  computed: {
    ...mapState('img', [
      'coordinates'
    ]),
    imgRecRate: {
      get () {
        return this.$store.state.img.imgRecRate * 100
      },
      set (val) {
        this.$store.commit('img/setImgRecRate', (val / 100).toFixed(4))
      }
    }
  },
  methods: {
    remove (index) {
      this.$store.commit('img/removeCoordinate', index)
    },
    setFeaturePointFileName () {
      this.$emit('setFeaturePointFileName', this.currentFeaturePointFileName)
    },
    removeLabelArea () {
      let imageDom = document.querySelector('.selector')
      let areas = document.querySelectorAll('.area')
      areas.forEach(area => {
        imageDom.removeChild(area)
      })
    },
    showLabelArea (currentRowData, index) {
      this.removeLabelArea()
      let coordinateA = currentRowData.coordinate_a.split(',')
      let coordinateB = currentRowData.coordinate_b.split(',')
      let selector = document.querySelector('.selector')
      let selectorRect = selector.getBoundingClientRect()
      let selectorImgRect = document.querySelector('.selector__img').getBoundingClientRect()
      let offsetX = (selectorRect.width - selectorImgRect.width) / 2
      let offsetY = (selectorRect.height - selectorImgRect.height) / 2
      let left = offsetX + coordinateA[0] * selectorImgRect.width
      let top = offsetY + coordinateA[1] * selectorImgRect.height
      let width = (coordinateB[0] - coordinateA[0]) * selectorImgRect.width
      let height = (coordinateB[1] - coordinateA[1]) * selectorImgRect.height

      let area = document.createElement('div')
      area.classList.add('area')
      area.setAttribute('style', `display: flex; justify-content: center; align-items: center; font-size: 24px; font-weight: bolder; position: absolute; left: ${left}px; top: ${top}px; width: ${width}px; height: ${height}px; z-index: 900; background: rgba(87, 250, 255, .4);`)
      area.innerText = index + 1
      selector.appendChild(area)
    }
  }
}
</script>

<style lang="less" scoped>
  .mb-1 {
    margin-bottom: 10px;
  }
  .file-info {
    display: flex;
    justify-content: space-between;
    .tag {
      line-height: 32px;
    }
    .file-name {
      display: flex;
      flex: 1;
      justify-content: space-between;
      align-items: center;
      margin-right: 20px;
    }
    .recognition-rate {
      display: flex;
      flex: 1;
      align-items: center;
    }
  }
</style>
