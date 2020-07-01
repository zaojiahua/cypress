<template>
  <Card class="item-list">
    <p slot="title" class="title">
      <span>Unit Items &nbsp; ({{ numOfItems }})</span>
    </p>
    <div class="item-list-content">
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
  </Card>
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
    numOfItems () {
      return this.curUnitItemsData ? this.curUnitItemsData.length : 0
    },
    ...mapState('unit', [
      'openRawUnit'
    ])
  },
  watch: {
    unitItemsData (val) {
      this.curUnitItemsData = val
    },
    openRawUnit (val) {
      let list = document.querySelector('.item-list')
      let items = document.querySelector('.item-list-content')
      if (!val) {
        list.style.height = '768px'
        items.style.height = '678px'
      } else {
        list.style.height = '320px'
        items.style.height = '230px'
      }
    },
    numOfItems (val) {
      if (val < 4) {
        this.$store.commit('unit/handleOpenRawUnit', true)
      } else {
        this.$store.commit('unit/handleOpenRawUnit', false)
      }
    }
  },
  methods: {
    updateUnitItem (currentItem) {
      this.$emit('updateUnitItem', currentItem)
    }
  }
}
</script>

<style lang="less" scoped>
  .item-list {
    height: 320px;
    .title {
      display: flex;
      justify-content: space-between;
    }
    .item-list-content {
      height: 230px;
      overflow: auto;
      overflow-x: hidden;
      .item-enter-active, .item-leave-active {
        transition: all 1s;
      }
      .item-enter, .item-leave-to {
        opacity: 0;
        transform: translateX(100%);
      }
    }
  }
</style>
