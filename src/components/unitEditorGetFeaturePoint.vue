<template>
  <div style="margin-bottom: 10px;">
    <Divider orientation="left">选取特征点</Divider>
    <Table :columns="coordinateColumn" :data="coordinateData" border  max-height="158" size="small" style="margin-bottom: 16px;">
      <template slot-scope="{ row, index }" slot="action">
        <Button type="error" size="small" @click="remove(index)" :disabled="coordinateData.length === 1">Delete</Button>
      </template>
    </Table>
    <Input placeholder="为选取的特征点们取一个名字吧" required v-model="currentFeaturePointFileName">
      <span slot="prepend">配置文件名称</span>
    </Input>
    <div class="get-recognition-rate">
      <div style="display: flex; align-items: center; width: 66%">
        <span>识别率：</span>
        <InputNumber :max="100" :min="0"  v-model="imgThreshold" style="flex: 1;" placeholder="识别率标准..." :formatter="value => `${value}%`" :parser="value => value.replace('%', '')"></InputNumber>
      </div>
      <!-- <Button type="primary" @click="setFeaturePointFileName">Commit</Button> -->
    </div>
  </div>
</template>

<script>
import { suffixAutoRemove, suffixAutoComplete } from '../lib/tools.js'

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
  watch: {
    featurePointFileName (val) {
      this.currentFeaturePointFileName = suffixAutoRemove(val)
    },
    currentFeaturePointFileName (val) {
      this.currentFeaturePointFileName = suffixAutoRemove(val)
    }
  },
  computed: {
    computedImgThreshold () {
      return (this.imgThreshold / 100).toFixed(4)
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
        return false
      } else {
        coordinateDataList.threshold = parseFloat(this.computedImgThreshold)
      }
      if (!this.currentFeaturePointFileName) {
        this.$Message.error({
          background: true,
          content: '请为配置文件命名'
        })
        return false
      }
      /**
       * 设置当前识别率，由 unitEditorUtils 接收
       */
      this.$bus.emit('setThreshold', parseFloat(this.computedImgThreshold))

      for (let i = 0; i < this.coordinateData.length; i++) {
        if (this.coordinateData[i].coordinate_a !== '' && this.coordinateData[i].coordinate_b !== '') {
          let area = 'area' + coordinateNum
          let coordinateRowList = this.coordinateData[i].coordinate_a.split(',').concat(this.coordinateData[i].coordinate_b.split(',')).map(parseFloat)
          coordinateDataList[area] = coordinateRowList
          coordinateNum++
        }
      }

      let featurePointFileName = suffixAutoComplete(this.currentFeaturePointFileName, '.json')

      this.$emit('setFeaturePointFileName', featurePointFileName)
      this.$bus.emit('addResFile', {
        'name': featurePointFileName,
        'type': 'json',
        'file': JSON.stringify(coordinateDataList, null, 4),
        'fileUrl': ''
      })
      this.coordinateData = []
      return true
    },
    setNewName (newName) {
      this.currentFeaturePointFileName = newName
    }
  },
  mounted () {
    this.currentFeaturePointFileName = suffixAutoRemove(this.featurePointFileName)
  },
  created () {
    this.$bus.on('remove', index => this.remove(index))
    this.$bus.on('getCoordinate', coordinate => {
      this.coordinateData.push(coordinate)
    })
    this.$bus.on('setNewName', this.setNewName)
  },
  beforeDestroy () {
    this.$bus.off('remove')
    this.$bus.off('getCoordinate')
    this.$bus.off('setNewName', this.setNewName)
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
