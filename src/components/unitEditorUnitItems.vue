<template>
  <Card style="height: 320px;">
    <p slot="title" style="display: flex; justify-content: space-between;">
      <span>Unit Items &nbsp; ({{ unitItemsData.length }})</span>
    </p>
    <div class="items">
      <unit-editor-unit-item v-for="(itemData, index) in unitItemsData" :itemData="itemData" :itemIndex="index" :key="itemData.itemName" ></unit-editor-unit-item>
    </div>
  </Card>
</template>

<script>
import unitEditorUnitItem from './unitEditorUnitItem'

export default {
  name: 'unit-items',
  components: { unitEditorUnitItem },
  props: {
    unitItemsData: {
      type: Array,
      default () {
        return []
      }
    }
  },
  data () {
    return {

    }
  },
  watch: {
    unitItemsData (val) {
      // console.log(val.length)
    }
  },
  methods: {

  },
  mounted () {

  }
}
</script>

<style lang="less" scoped>
.items {
    height: 230px;
    overflow: auto;
}
</style>
