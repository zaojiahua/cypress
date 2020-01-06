<template>
  <Card style="height: 320px;">
    <p slot="title">Unit Items &nbsp; (4)</p>
    <div class="items">
      <unit-editor-unit-item v-for="(item, key, index) in unitItemDatas" :key="index" :itemData="{title: key, data: item}"></unit-editor-unit-item>
    </div>
  </Card>
</template>

<script>
import unitEditorUnitItem from './unitEditorUnitItem'

export default {
  components: { unitEditorUnitItem },
  props: {
    unitContent: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      unitMsgObj: null,
      unitItemDatas: {}
    }
  },
  watch: {
    unitContent (val) {
      this.unitMsgObj = JSON.parse(val)
      let execCmdDict = this.unitMsgObj.execCmdDict
      this.$set(this.unitItemDatas, 'referImgFile', execCmdDict.referImgFile)
      this.$set(this.unitItemDatas, 'configFile', execCmdDict.configFile)
      this.$set(this.unitItemDatas, 'inputImgFile', execCmdDict.inputImgFile)
      this.$set(this.unitItemDatas, 'imgCmpThreshold', execCmdDict.imgCmpThreshold)
    }
  },
  methods: {

  }
}
</script>

<style lang="less" scoped>
.items {
    // height: 230px;
    overflow: auto;
}
</style>
