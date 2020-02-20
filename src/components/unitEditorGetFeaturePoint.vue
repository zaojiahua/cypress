<template>
  <div style="margin-bottom: 10px;">
    <Divider orientation="left">选取特征点</Divider>
    <Table :columns="coordinateColumn" :data="coordinateData" border  max-height="158" size="small" style="margin-bottom: 16px;">
      <template slot-scope="{ row, index }" slot="action">
        <Button type="error" size="small" @click="remove(index)" :disabled="coordinateData.length === 1">Delete</Button>
      </template>
    </Table>
    <Input placeholder="为选取的特征点们取一个名字吧" required v-model="currentFeaturePointFileName">
      <span slot="prepend">特征点名称</span>
    </Input>
    <div class="get-recognition-rate">
      <div style="display: flex; align-items: center; width: 66%">
        <span>识别率：</span>
        <InputNumber :max="100" :min="0"  v-model="imgThreshold" style="flex: 1;" placeholder="识别率标准..." :formatter="value => `${value}%`" :parser="value => value.replace('%', '')"></InputNumber>
      </div>
      <Button type="primary" @click="setFeaturePointFileName">Commit</Button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    featurePointFileName: {
      type: String,
      default: ''
    }
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
      coordinateData: [],
      imgThreshold: 99,
      currentFeaturePointFileName: ''
    }
  },
  methods: {
    remove (index) {
      this.coordinateData.splice(index, 1)
    },
    setFeaturePointFileName () {
      let coordinateNum = 1
      let coordinateDataList = {}
      if (!this.imgThreshold) {
        this.$Message.error({
          background: true,
          content: '识别率未输入'
        })
        return
      } else {
        coordinateDataList.threshold = parseFloat(this.imgThreshold)
      }
      for (let i = 0; i < this.coordinateData.length; i++) {
        if (this.coordinateData[i].coordinate_a !== '' && this.coordinateData[i].coordinate_b !== '') {
          let area = 'area' + coordinateNum
          let coordinateRowList = this.coordinateData[i].coordinate_a.split(',').concat(this.coordinateData[i].coordinate_b.split(',')).map(parseFloat)
          coordinateDataList[area] = coordinateRowList
          coordinateNum++
          console.log(area, coordinateRowList, coordinateDataList)
        }
      }
      this.$emit('setFeaturePointFileName', this.currentFeaturePointFileName)
      this.$bus.emit('addResFile', {
        'name': this.featurePointFileName + '.json',
        'type': 'json',
        'file': JSON.stringify(coordinateDataList, null, 4),
        'fileUrl': ''
      })
      this.coordinateData = []
    }
  },
  mounted () {
    this.currentFeaturePointFileName = this.featurePointFileName.replace('.json', '')
  },
  created () {
    this.$bus.on('remove', index => this.remove(index))
    this.$bus.on('getCoordinate', coordinate => {
      this.coordinateData.push(coordinate)
    })
  },
  beforeDestroy () {
    this.$bus.off('remove')
    this.$bus.off('getCoordinate')
  }
}
</script>

<style scoped>
.get-recognition-rate {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}
</style>
