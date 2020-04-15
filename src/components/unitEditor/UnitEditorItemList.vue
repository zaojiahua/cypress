<template>
  <Card class="item-list">
    <p slot="title" class="title">
      <span>Unit Items &nbsp; ({{ numOfItems }})</span>
    </p>
    <div class="item-list-content">
      <UnitItem
        v-for="(item, index) in unitItemsData"
        :key="index"
        :itemData="item"
        :itemIndex="index"
      ></UnitItem>
    </div>
  </Card>
</template>

<script>
import UnitItem from './UnitEditorItem'
export default {
  name: 'UnitItemList',
  components: { UnitItem },
  computed: {
    unitItemsData () {
      return this.$store.getters.unitItemsData
    },
    numOfItems () {
      return this.unitItemsData.length
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
    }
  }
</style>
