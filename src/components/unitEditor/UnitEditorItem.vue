<template>
  <div class="item" :class="{active: isClicked, disabled: !isEditable}" @click="handleItemClick">
    <p class="item-content" >
      <Tag :color="tagColor" style="border-radius: 50%">
        {{ itemIndex + 1 }}
      </Tag>
      <span>
        {{ itemDesc[this.itemType] }}
      </span>
    </p>
    <div class="btn-list" v-if="isPicInput">
      <span class="add-new-item" @click.stop="handleItem(true)"> + </span>
      <span class="remove-item" @click.stop="handleItem(false)"> - </span>
    </div>
  </div>
</template>

<script>
import { findBrothersComponents } from 'lib/tools.js'
import { mapGetters, mapState } from 'vuex'
import CONST from 'config/const'

export default {
  name: 'UnitItem',
  props: {
    itemData: Object,
    itemIndex: Number
  },
  data () {
    return {
      isClicked: false,
      currentItem: this.itemData.itemContent,
      tmachBlanks: [],
      itemDesc: CONST.ITEM_DESC
    }
  },
  watch: {
    itemData (val) {
      if (val) {
        this.currentItem = val.itemContent
        this.handleTmachBlanks()
      }
    }
  },
  computed: {
    ...mapState('files', [
      'resFiles',
      'currentFile'
    ]),
    ...mapState('img', [
      'coordinates'
    ]),
    ...mapGetters('item', [
      'isJobResourcePicture',
      'isJobResourceFile'
    ]),
    itemType () {
      return this.currentItem.type
    },
    isUxInput () {
      return this.itemType === 'uxInput'
    },
    isPicInput () {
      return this.itemType === 'picInput'
    },
    isCompleted () {
      if (this.isUxInput && this.uxInputDefaultValue) {
        this.setDefaultValue()
        return true
      }
      for (let i = 0; i < this.tmachBlanks.length; i++) {
        if (this.tmachBlanks[i] === 'Tmach ') {
          return false
        }
      }
      return true
    },
    uxInputDefaultValue () {
      if ('defaultValue' in this.currentItem) {
        return this.currentItem.defaultValue.split(' ')
      }
      return null
    },
    tagText () {
      return this.isCompleted ? '编辑完成' : '暂无数据'
    },
    tagColor () {
      return !this.isEditable ? '#aaaaaa' : this.isCompleted ? 'success' : 'error'
    },
    isEditable () {
      if (this.itemType === 'jobResourceFile' && !this.currentFile) {
        return false
      }
      return true
    }
  },
  methods: {
    handleItem (flag) { // 当 item 类型 为 picInput 时，可以复制或删除本身
      if (flag) {
        this.$store.commit('unit/setItemHandBook', {
          methods: 'add',
          index: Number(this.itemData.itemName),
          data: this._.cloneDeep(this.currentItem)
        })
      } else {
        this.$store.commit('unit/setItemHandBook', {
          methods: 'remove',
          index: Number(this.itemData.itemName)
        })
      }
    },
    handleClicked () { // 点击 item 时取消对兄弟节点的聚焦
      this.isClicked = true
      let unitItemBrothers = findBrothersComponents(this, 'UnitItem')
      unitItemBrothers.forEach(bro => {
        bro.isClicked = false
      })
    },
    removeLabelArea () { // 移除标示区域
      let imageDom = document.querySelector('.image-dom')
      let areas = document.querySelectorAll('.area')
      areas.forEach(area => {
        imageDom.removeChild(area)
      })
    },
    addAreas () { // 显示标示区域
      let imageDom = document.querySelector('.image-dom')
      let imageDomData = imageDom.getBoundingClientRect()
      for (let i = 0; i < this.coordinates.length; i++) {
        let coordinateA = this.coordinates[i].coordinate_a.split(',')
        let coordinateB = this.coordinates[i].coordinate_b.split(',')
        let left = Math.floor(coordinateA[0] * imageDomData.width)
        let top = Math.floor(coordinateA[1] * imageDomData.height)
        let width = Math.round((coordinateB[0] - coordinateA[0]) * imageDomData.width)
        let height = Math.round((coordinateB[1] - coordinateA[1]) * imageDomData.height)
        let area = document.createElement('div')
        area.classList.add('area')
        area.style.display = 'flex'
        area.style.justifyContent = 'center'
        area.style.alignItems = 'center'
        area.style.fontSize = '24px'
        area.style.fontWeight = 'bolder'
        area.style.position = 'absolute'
        area.style.left = `${left}px`
        area.style.top = `${top}px`
        area.style.width = `${width}px`
        area.style.height = `${height}px`
        area.style.background = 'rgba(87, 250, 255, .4)'
        area.style.border = '1px dashed #0099FF'
        area.innerText = i + 1
        imageDom.appendChild(area)
      }
    },
    setCoordinateAndImgRecRate (name) { // 点击 类型为 jobResourceFile 的 item 时，如果存在相应文件，则将文件内的数据提取出来
      this.$store.commit('img/clearCoordinates')
      let areasData
      for (let i = 0; i < this.resFiles.length; i++) {
        if (this.resFiles[i].name === name) {
          areasData = JSON.parse(this.resFiles[i].file)
          break
        }
      }
      for (let key in areasData) {
        if (key === 'threshold') {
          this.$store.commit('img/setImgRecRate', areasData[key])
        }
        if (key.startsWith('area')) {
          let coordinate = {}
          coordinate.coordinate_a = areasData[key].splice(0, 2).join(',')
          coordinate.coordinate_b = areasData[key].join(',')
          this.$store.commit('img/addCoordinate', coordinate)
        }
      }
    },
    handleItemClick () {
      if (!this.isEditable) {
        this.$Modal.warning({
          title: '温馨提示',
          content: '请先获取图片'
        })
        return
      }
      this.removeLabelArea()
      this.handleClicked()
      this.$store.commit('item/setCurrentItem', this.itemData)
      this.$store.commit('item/setShowItemEditor', true)
      if (this.tmachBlanks[0].trim().length !== 0) {
        if (this.isJobResourcePicture) {
          this.$store.commit('files/setCurrentFile', {
            byName: true,
            name: this.tmachBlanks[0].trim().substring(5)
          })
        }
        if (this.isJobResourceFile) {
          this.setCoordinateAndImgRecRate(this.tmachBlanks[0].trim().substring(5))
          this.addAreas()
        }
      }
    },
    setDefaultValue () { // 给某些 item 内的选项设定默认值
      if (this.tmachBlanks.includes('Tmach ')) {
        for (let i = 0; i < this.tmachBlanks.length; i++) {
          this.currentItem.content = this.currentItem.content.replace(this.tmachBlanks[i], 'Tmach' + this.uxInputDefaultValue[i] + ' ')
        }
        this.$emit('updateUnitItem', this._.cloneDeep(this.itemData))
      }
    },
    handleTmachBlanks () { // 获取 item 中需要修改的项
      this.tmachBlanks = this.currentItem.content.match(/Tmach.*? /g)
    }
  },
  mounted () {
    this.handleTmachBlanks()
    // if (this.itemData.itemContent.type === 'jobResourceFile' && !this.editToggle) {
    //   this.isEditable = false
    // }
  }
}
</script>

<style lang="less" scoped>
.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #eeeeee;
  border-radius: 6px;
  padding: 10px 6px;
  margin: 10px 0;
  margin-right: 10px;
  cursor: pointer;
  &:hover {
    box-shadow: inset 0px 0px 20px #a5d0e4;
    border-color: #a7dbf3;
  }
  &:isClicked {
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

  .btn-list {
    display: flex;
    float: right;

    .add-new-item, .remove-item {
      display: inline-block;
      text-align: center;
      width: 20px;
      height: 20px;
      line-height: 20px;
      font-size: 18px;
      border-radius: 4px;
      color: white;
      user-select: none;
    }
    .add-new-item {
      background: rgb(48, 207, 61);
      margin-right: 6px;
      cursor: copy;
    }
    .remove-item {
      background: rgb(214, 50, 32);
      cursor: default;
    }
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