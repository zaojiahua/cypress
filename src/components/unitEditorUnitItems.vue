<template>
  <Card style="height: 320px;">
    <p slot="title" style="display: flex; justify-content: space-between;">
      <span>Unit Items &nbsp; ({{ unitItemDatas.length }})</span>
    </p>
    <div class="items">
      <unit-editor-unit-item v-for="itemData in unitItemDatas" :unitType="unitType" :key="itemData.itemName" :itemData="itemData"></unit-editor-unit-item>
    </div>
  </Card>
</template>

<script>
import unitEditorUnitItem from './unitEditorUnitItem'

export default {
  components: { unitEditorUnitItem },
  props: {
    unitType: {
      type: String,
      default: ''
    },
    unitContent: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      unitMsgObj: null,
      unitItemDatas: []
    }
  },
  watch: {
    unitContent (val) {
      this.unitItemDatas = []
      this.unitMsgObj = JSON.parse(val)
      let dataForUnitItem
      if (this.unitType === 'IMGTOOL') {
        dataForUnitItem = this.unitMsgObj.execCmdDict
        Object.keys(dataForUnitItem).forEach(execCmdDictKey => {
          if (execCmdDictKey === 'referImgFile' || execCmdDictKey === 'configFile' || execCmdDictKey === 'inputImgFile' || execCmdDictKey === 'imgCmpThreshold') {
            this.unitItemDatas.push({
              'itemName': execCmdDictKey,
              'itemContent': JSON.parse(JSON.stringify(dataForUnitItem[execCmdDictKey]))
            })
          }
        })
      } else {
        dataForUnitItem = this.unitMsgObj.execCmdDict.execCmdList
        dataForUnitItem.forEach((val, index) => {
          if (val.type !== 'noChange') {
            this.unitItemDatas.push({
              'itemName': index,
              'itemContent': JSON.parse(JSON.stringify(val))
            })
          }
        })
      }
    }
  },
  methods: {

  }
}
</script>

<style lang="less" scoped>
.items {
    height: 230px;
    overflow: auto;
}
</style>
