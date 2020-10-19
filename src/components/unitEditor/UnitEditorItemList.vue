<template>
  <Card class="unit-item-list-card">
    <!-- title -->
    <p slot="title">
      <span>Unit Items &nbsp; ({{ numOfItems }})</span>
    </p>
    <!-- extra -->
    <div slot="extra">
      <span>OCR引擎：</span>
      <Switch false-color="#ff4949" v-model="ocrChoiceToggle" @on-change="changeOcrChoice">
        <span slot="open">1</span>
        <span slot="close">2</span>
      </Switch>
    </div>
    <!-- body -->
    <transition-group name="item" tag="div" class="item-container">
      <UnitItem
        v-for="(item, index) in curUnitItemsData"
        :key="item.itemContent.itemID || index"
        :itemData="item"
        :itemIndex="index"
        @updateUnitItem="updateUnitItem"
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
  props: {
    unitItemsData: Array,
    ocrChoice: Number
  },
  data () {
    return {
      curUnitItemsData: this.unitItemsData,
      ocrChoiceToggle: true,
      curOcrChoice: 0
    }
  },
  computed: {
    ...mapState('unit', ['openRawUnit']),
    numOfItems () {
      return this.curUnitItemsData ? this.curUnitItemsData.length : 0
    }
  },
  watch: {
    openRawUnit (val) {
      this.itemList.classList.toggle('collapse')
    },
    unitItemsData (val) {
      this.curUnitItemsData = []
      if (val) {
        for (let i = 0; i < val.length; i++) {
          let order = Number(val[i].itemContent.order) || i + 1
          this.curUnitItemsData[order - 1] = val[i]
        }
      }
    },
    ocrChoice (val) {
      if (val === 1) {
        this.ocrChoiceToggle = true
      }
      if (val === 2) {
        this.ocrChoiceToggle = false
      }
      this.curOcrChoice = val
    }
  },
  methods: {
    updateUnitItem (currentItem) {
      this.$emit('updateUnitItem', currentItem)
    },
    changeOcrChoice (val) {
      if (val) {
        this.curOcrChoice = 1
      } else {
        this.curOcrChoice = 2
      }
      this.$emit('updateOcrChoice', this.curOcrChoice)
    }
  },
  mounted () {
    this.itemList = document.querySelector('.item-list')
  }
}
</script>

<style lang="less" scoped>
  @import '../../css/common.less';
  .unit-item-list-card {
    flex: 1;
    margin-bottom: 1em;
    .item-container {
      overflow: hidden;
      & > div:first-child {
        margin-top: 0;
      }
      & > div:last-child {
        margin-bottom: 0;
      }
    }
    .item-enter-active, .item-leave-active {
      transition: all 1s;
    }
    .item-enter, .item-leave-to {
      opacity: 0;
      transform: translateX(100%);
    }
  }
  // .item-list {
  //   overflow: auto;
  //   margin-bottom: 1em;
  //   .title {
  //     position: relative;
  //     .engine {
  //       position: absolute;
  //       right: 1em;
  //       top: 0;
  //       display: flex;
  //       justify-content: space-between;
  //       align-items: center;
  //     }
  //   }
  //   .item-list-content {
  //     display: flex;
  //     flex-direction: column;
  //     justify-content: space-between;
  //     .item-enter-active, .item-leave-active {
  //       transition: all 1s;
  //     }
  //     .item-enter, .item-leave-to {
  //       opacity: 0;
  //       transform: translateX(100%);
  //     }
  //   }
  // }
  // .collapse {
  //   flex: 1;
  // }
</style>
