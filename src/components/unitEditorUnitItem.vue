<template>
  <div class="item" :class="{active: checked}" @click="handleClick">
    <p class="item-content" ><Tag :color="isComplete ? 'success' : 'error'">{{ isComplete ? '编辑完成' : '暂无数据' }}</Tag><span>{{ tagContent[this.currentItemData.type] }}</span></p>
  </div>
</template>

<script>
import { findBrothersComponents } from '../lib/tools.js'

export default {
  name: 'unit-item',
  props: {
    unitType: {
      type: String,
      default: ''
    },
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
      currentItemData: this.itemData.itemContent,
      checked: false, // 是否被选中
      dataForItemEdit: { // 发送给 item edit，以进行默认内容的填充
        firstLevelType: '',
        secondLevelType: '',
        content: ''
      },
      tagContent: {
        'jobResourceFile': '参考标准图片',
        'inputPicture': '输入图片名称',
        'inputFile': '输入文件名称',
        'outputPicture': '输出图片名称',
        'outputFile': '输出文件名称',
        'uxInput': '手动输入坐标值'
      },
      tmachBlanks: []
    }
  },
  watch: {
    itemData (val) {
      if (val) {
        this.currentItemData = val.itemContent
        this.isComplete = this._hasCompleted(this.currentItemData)
        // this.currentItemData = this._handleCurrentItemData(this.currentItemData)
        this._getDataForItemEdit()
        if (this.checked) {
          this.$el.click()
        }
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
      this.$bus.emit('editItem', this.itemData, this.tmachBlanks)
    },
    _hasCompleted (data) { // 判断 item 是否完成
      if (!data) return
      this.tmachBlanks = data.content.match(/Tmach.*? /g)
      console.log(this.tmachBlanks)
      let flag = true
      for (let i = 0; i < this.tmachBlanks.length; i++) {
        if (this.tmachBlanks[i] === 'Tmach ') {
          flag = false
          break
        }
      }
      return flag
    },
    _getDataForItemEdit () {

    },
    _reset () {
      this.checked = false
    }
  },
  created () {
    this.$bus.on('reset', this._reset)
  },
  mounted () {
    if (this.itemData.itemContent) {
      this.isComplete = this._hasCompleted(this.itemData.itemContent)
      this._getDataForItemEdit()
    }
  },
  beforeDestroy () {
    this.$bus.off('reset', this._reset)
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

  .item-name {
    background-color: tomato;
    border-radius: 6px;
    padding: 0 6px;
    margin-right: 6px;
  }

  .item-content {
    word-wrap:break-word;
    word-break:break-all;
    overflow: hidden;
    margin-right: 6px;
  }
}
.active {
  box-shadow: inset 0px 0px 20px #c1dfec;
  border-color: #a2c6d6;
}
</style>
