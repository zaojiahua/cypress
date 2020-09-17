<template>
  <div class="card item-list">
    <p class="card-title">
      <span>Unit Items &nbsp; ({{ numOfItems }})</span>
    </p>
    <div class="card-body item-list-content">
      <transition-group name="item" tag="div">
        <UnitItem
          v-for="(item, index) in curUnitItemsData"
          :key="item.itemContent.itemID || index"
          :itemData="item"
          :itemIndex="index"
          @updateUnitItem="updateUnitItem"
        ></UnitItem>
      </transition-group>
    </div>
  </div>
</template>

<script>
import UnitItem from './UnitEditorItem'

import { mapState } from 'vuex'

export default {
  name: 'UnitItemList',
  components: { UnitItem },
  props: {
    unitItemsData: Array
  },
  data () {
    return {
      curUnitItemsData: this.unitItemsData
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
    }
  },
  methods: {
    updateUnitItem (currentItem) {
      this.$emit('updateUnitItem', currentItem)
    }
  },
  mounted () {
    this.itemList = document.querySelector('.item-list')
  }
}
</script>

<style lang="less" scoped>
  @import '../../css/common.less';
  .item-list {
    overflow: auto;
    margin-bottom: 1em;
    .item-list-content {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      .item-enter-active, .item-leave-active {
        transition: all 1s;
      }
      .item-enter, .item-leave-to {
        opacity: 0;
        transform: translateX(100%);
      }
    }
  }
  .collapse {
    flex: 1;
  }
</style>
