<template>
  <div class="item" :class="{active: checked}" @click="handleClick">
    <p class="item-data" v-html="currentItemData">{{ itemData.title }}：</p>
    <Checkbox v-model="isComplete" disabled style="float: right;"></Checkbox>
  </div>
</template>

<script>
import { findBrothersComponents } from '../lib/tools.js'

export default {
  name: 'unit-item',
  props: {
    itemData: { // 存放该 item 所属类别及其内容
      type: Object,
      default () {
        return {}
      }
    }
  },
  data () {
    return {
      isComplete: false, // item 是否已完成
      currentItemData: this.itemData.data,
      checked: false, // 是否被选中
      dataForItemEdit: { // 发送给 item edit，以进行默认内容的填充
        type: '',
        content: ''
      }
    }
  },
  watch: {
    itemData (val) {
      if (val) {
        this.currentItemData = val.data
        this.isComplete = this.hasCompleted(val.data)
        this.currentItemData = this.handleCurrentItemData(this.currentItemData)
        this.handleDataForItemEdit()
      }
    },
    dataForItemEdit (val) {
      console.log(val.content)
    }
  },
  methods: {
    handleClick () {
      this.checked = true
      let unitItemBrothers = findBrothersComponents(this, 'unit-item')
      unitItemBrothers.forEach(bro => {
        bro.checked = false
      })
      this.$bus.emit('editItem', this.dataForItemEdit)
    },
    hasCompleted (data) { // 判断 item 是否完成
      if (!data) return
      if (data.indexOf('<input_file></input_file>') === -1 && data.indexOf('<jobres_file></jobres_file>') === -1) return true
      else return false
    },
    handleCurrentItemData (data) { // 将未完成的 item 中的特定字段以红色字体标注出来
      if (!data) return
      data = data.split('<').join('&lt;')
      if (!this.isComplete) {
        data = data.split('&lt;jobres_file>&lt;/jobres_file>').join('<span style="color: red">&lt;jobres_file>&lt;/jobres_file></span>')
        data = data.split('&lt;input_file>&lt;/input_file>').join('<span style="color: red">&lt;input_file>&lt;/input_file></span>')
      }
      return data
    },
    handleDataForItemEdit () {
      if (!this.itemData.data) return
      if (this.itemData.data.indexOf('ux_input') !== -1) {
        this.dataForItemEdit.type = 'ux_input'
      }
      if (this.itemData.data.indexOf('input_file') !== -1) {
        this.dataForItemEdit.type = 'input_file'
        let pattern = /<input_file>(\S*)<\/input_file>/
        let res = this.itemData.data.match(pattern)
        if (res[1]) this.dataForItemEdit.content = res[1]
      }
      if (this.itemData.data.indexOf('jobres_file') !== -1) {
        this.dataForItemEdit.type = 'jobres_file'
        let pattern = /<jobres_file>(\S*)<\/jobres_file>/
        let res = this.itemData.data.match(pattern)
        if (res[1]) this.dataForItemEdit.content = res[1]
      }
    }
  },
  mounted () {
    if (this.itemData.data) {
      this.isComplete = this.hasCompleted(this.itemData.data)
      this.currentItemData = this.currentItemData.split('<').join('&lt;')
      this.handleDataForItemEdit()
    }
  }
}
</script>

<style lang="less" scoped>
.item {
    display: flex;
    justify-content: space-between;
    border: 1px solid #eeeeee;
    border-radius: 6px;
    padding: 10px 6px;
    margin: 10px 0;
    margin-right: 10px;
    &:hover {
      box-shadow: inset 0px 0px 20px #a5d0e4;
      border-color: #a7dbf3;
    }
    &:checked {
        box-shadow: inset 0px 0px 20px #093549;
        border-color: #072c3d;
    }

    .item-data {
      width: 92%;
      word-wrap:break-word;
      word-break:break-all;
      overflow: hidden;
    }
}
.active {
    box-shadow: inset 0px 0px 20px #c1dfec;
    border-color: #a2c6d6;
}
</style>
