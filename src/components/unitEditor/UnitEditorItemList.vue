<template>
  <Card class="unit-item-list-card">
    <!-- title -->
    <div slot="title">
      <span>Unit Items &nbsp; ({{ numOfItems }})</span>
      {{ocrChoice}}
    </div>
    <!-- extra -->
    <div slot="extra" v-show="ocrChoice">
      <span>OCR引擎：</span>
      <Switch false-color="#ff4949" v-model="ocrChoiceToggle" @on-change="handleOcrChoice">
        <span slot="open">1</span>
        <span slot="close">2</span>
      </Switch>
    </div>
    <!-- body -->
    <transition-group name="item" tag="div" class="item-container">
      <UnitItem
        v-for="(item, index) in unitItemsData"
        :key="item.itemContent.itemId || index"
        :itemData="item"
        :itemIndex="index"
        :isActive="curUnitItem === index"
        @click.native="handleItemClick(index)"
      ></UnitItem>
    </transition-group>
  </Card>
</template>

<script>
import UnitItem from './UnitEditorItem'

import { mapState } from 'vuex'

export default {
  name: 'UnitItemList',
  components: { UnitItem },
  data () {
    return {
      ocrChoiceToggle: undefined,
      curUnitItem: undefined
    }
  },
  computed: {
    ...mapState('unit', ['unitData']),
    unitItemsData: { // 在当前的Unit信息中提取Items的信息
      get () {
        if (!this.unitData.unitMsg) return
        let { unitMsg } = this._.cloneDeep(this.unitData)
        let src = unitMsg.execCmdDict.execCmdList || unitMsg.execCmdDict
        let unitItemsData = []
        for (let key in src) {
          if (src[key].type !== 'noChange') { // 只提取需要用户操作的Item信息
            let { order } = src[key]
            if (order) {
              unitItemsData[order - 1] = { 'itemName': key, 'itemContent': src[key] }
            } else {
              unitItemsData.push({ 'itemName': key, 'itemContent': src[key] })
            }
          }
        }
        return unitItemsData
      },
      set (val) { /* 取消报错 */ }
    },
    numOfItems () { // Item的数量
      return this.unitItemsData ? this.unitItemsData.length : 0
    },
    ocrChoice () { // 如果保存了文字识别引擎的编号，则返回，否则返回0
      if (!this.unitData.unitMsg) return
      return this.unitData.unitMsg.ocrChoice
    }
  },
  watch: {
    ocrChoice (val) {
      this.ocrChoiceToggle = val === 1
    }
  },
  methods: {
    handleOcrChoice (val) {
      let { unitMsg } = this._.cloneDeep(this.unitData)
      unitMsg.ocrChoice = val ? 1 : 2
      this.$store.commit('unit/handleUnitData', {
        action: 'setUnitMsg',
        data: unitMsg
      })
    },
    handleItemClick (index) {
      this.curUnitItem = index
    }
  }
}
</script>

<style lang="less" scoped>
  @import '../../css/common.less';
  .unit-item-list-card {
    flex: 1;
    margin-bottom: 1em;
    /deep/ .ivu-card-extra {
      top: 10px;
    }
    /deep/ .ivu-card-body {
      height: calc(100% - 44px);
    }
    .item-container {
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
      & > div:first-child {
        margin-top: 0;
      }
      & > div:last-child {
        margin-bottom: 0;
      }
    }
    .item-enter-active, .item-leave-active {
      transition: all .3s;
    }
    .item-enter, .item-leave-to {
      opacity: 0;
      transform: translateX(100%);
    }
  }
</style>
