<template>
  <div class="item" :class="{active: checked, disabled: !canEdit}" @click="handleClick">
    <p class="item-content" >
      <Tag :color="!canEdit ? '#aaaaaa' : isComplete ? 'success' : 'error'">
        {{ isComplete ? '编辑完成' : '暂无数据' }}
      </Tag>
      <span>
        {{ tagContent[this.currentItemData.type] }}
      </span>
    </p>
  </div>
</template>

<script>
import { findBrothersComponents } from '../lib/tools.js'

export default {
  name: 'unit-item',
  props: {
    editToggle: {
      type: Boolean,
      default: false
    },
    itemIndex: {
      type: Number
    },
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
      tagContent: {
        'jobResourceFile': '图片配置文件',
        'jobResourcePicture': '参考标准图片',
        'inputPicture': '输入图片名称',
        'inputFile': '输入文件名称',
        'outputPicture': '输出图片名称',
        'outputFile': '输出文件名称',
        'uxInput': '手动输入参数',
        'picInput': '从图片选取坐标点'
      },
      tmachBlanks: [],
      canEdit: true
    }
  },
  watch: {
    itemData (val) {
      if (val) {
        this.currentItemData = val.itemContent
        // if (this.currentItemData.type === 'jobResourceFile' && !this.editToggle) this.canEdit = false
        // else this.canEdit = true
        this.isComplete = this._hasCompleted(this.currentItemData)
        if (this.checked) {
          this.$el.click()
        }
      }
    },
    editToggle (val) {
      if (this.currentItemData.type === 'jobResourceFile' && !val) this.canEdit = false
      else if (this.currentItemData.type === 'jobResourceFile' && val) this.canEdit = true
      else this.canEdit = true
    }
  },
  methods: {
    _isEditable () {
      if (this.canEdit === false) {
        this.$Modal.warning({
          title: '温馨提示',
          content: '请先在 参考标准图片 中获取图片'
        })
      }
    },
    _setClickedState () {
      this.checked = true
      let unitItemBrothers = findBrothersComponents(this, 'unit-item')
      unitItemBrothers.forEach(bro => {
        bro.checked = false
      })
    },
    _removeAreas () {
      let imageZoom = document.querySelector('.image-zoom')
      let areas = document.querySelectorAll('.area')
      areas.forEach(area => {
        imageZoom.removeChild(area)
      })
    },
    handleClick () {
      this._isEditable()
      this._setClickedState()
      this.isComplete = this._hasCompleted(this.currentItemData)
      this.$bus.emit('editItem', this.itemData, this.tmachBlanks)
      this._removeAreas()
      if (this.currentItemData.type === 'jobResourcePicture' || this.currentItemData.type === 'jobResourceFile') {
        /**
         * 获取该 UnitItem 的依赖文件
         * 由 jobResFile 组件响应
         */
        this.$bus.emit('getFileData', this.tmachBlanks, this.currentItemData.type)
      }
      this.$bus.emit('setItemType', this.itemData.itemContent.type)
    },
    _hasCompleted (data) { // 判断 item 是否完成
      if (!data) return
      this.tmachBlanks = data.content.match(/Tmach.*? /g)
      let flag = true
      for (let i = 0; i < this.tmachBlanks.length; i++) {
        if (this.tmachBlanks[i] === 'Tmach ') {
          flag = false
          break
        }
      }
      if (this.itemData.itemContent.type === 'jobResourcePicture' && flag) { // 通知 UnitItems 不必再限制 UnitItem 的状态
        this.$emit('setEditToggle', true)
      }
      if (this.itemData.itemContent.type === 'jobResourcePicture' && !flag) {
        this.$emit('setEditToggle', false)
      }
      return flag
    },
    _reset () {
      this.checked = false
    },
    _setEditToggle () {
      if (this.editToggle) this.canEdit = true
    }
  },
  created () {
    this.$bus.on('reset', this._reset)
  },
  mounted () {
    if (this.itemData.itemContent.type === 'jobResourceFile' && !this.editToggle) {
      this.canEdit = false
    }
    if (this.itemData.itemContent) {
      this.isComplete = this._hasCompleted(this.itemData.itemContent)
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
.disabled {
  background: #cccccc;
  &:hover {
    box-shadow: inset 0px 0px 0px #c1dfec;
    border: 1px solid #eeeeee;
    cursor: not-allowed;
  }
}
</style>
