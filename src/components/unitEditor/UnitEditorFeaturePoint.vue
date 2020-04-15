<template>
  <div class="mb-1">
    <Divider orientation="left">选取特征点</Divider>
    <Table
      :columns="coordinateColumn"
      :data="coordinateData"
      border
      max-height="556"
      size="small"
      class="mb-1"
      @on-row-click="showLabelArea"
    >
      <template slot-scope="{ row, index }" slot="action">
        <Button type="error" size="small" @click="remove(index)" :disabled="coordinateData.length === 1">Delete</Button>
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
        ></Input>
      </div>
      <div class="recognition-rate">
        <Tag color="blue" size="large" class="tag">识别率</Tag>
        <InputNumber
          :max="100"
          :min="0"
          v-model="imageRecognitionRate"
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
export default {
  name: 'FeaturePoint',
  props: {
    featurePointFileName: String
  },
  data () {
    return {
      coordinateColumn: [
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
    coordinateData () {
      return this.$store.state.coordinates
    },
    imageRecognitionRate: {
      get () {
        return this.$store.state.imageRecognitionRate * 100
      },
      set (val) {
        this.$store.commit('handleImageRecognitionRate', (val / 100).toFixed(4))
      }
    }
  },
  methods: {
    remove (index) {
      this.$store.commit('removeCoordinate', index)
    },
    setFeaturePointFileName () {
      this.$emit('setFeaturePointFileName', this.currentFeaturePointFileName)
    },
    removeLabelArea () {
      let imageDom = document.querySelector('.image-dom')
      let areas = document.querySelectorAll('.area')
      areas.forEach(area => {
        imageDom.removeChild(area)
      })
    },
    showLabelArea (currentRowData, index) {
      this.removeLabelArea()
      let imageDom = document.querySelector('.image-dom')
      let imageDomData = imageDom.getBoundingClientRect()
      let coordinateA = currentRowData.coordinate_a.split(',')
      let coordinateB = currentRowData.coordinate_b.split(',')
      let left = Math.floor(coordinateA[0] * imageDomData.width) + 1
      let top = Math.floor(coordinateA[1] * imageDomData.height) + 2
      let width = Math.floor((coordinateB[0] - coordinateA[0]) * imageDomData.width)
      let height = Math.floor((coordinateB[1] - coordinateA[1]) * imageDomData.height)
      let area = document.createElement('div')
      area.classList.add('area')
      area.style.display = 'flex'
      area.style.justifyContent = 'center'
      area.style.alignItems = 'center'
      area.style.fontSize = '24px'
      area.style.fontWeight = 'bolder'
      area.style.position = 'absolute'
      area.style.left = `${left}px`
      area.style.top = `${top}px`
      area.style.width = `${width}px`
      area.style.height = `${height}px`
      area.style.background = 'rgba(87, 250, 255, .4)'
      area.style.border = '1px dashed #0099FF'
      area.innerText = index + 1
      imageDom.appendChild(area)
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
