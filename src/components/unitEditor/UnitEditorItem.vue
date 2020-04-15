<template>
  <div class="item" :class="{active: isClicked, disabled: !isEditable}" @click="handleItemClick">
    <p class="item-content" >
      <Tag :color="tagColor">
        {{ tagText }}
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
import { mapGetters } from 'vuex'

export default {
  name: 'UnitItem',
  props: {
    itemData: Object
  },
  data () {
    return {
      isClicked: false,
      currentItemContent: this.itemData.itemContent,
      tmachBlanks: [],
      itemDesc: {
        'jobResourceFile': '图片配置文件',
        'jobResourcePicture': '参考标准图片',
        'inputPicture': '输入图片名称',
        'inputFile': '输入文件名称',
        'outputPicture': '输出图片名称',
        'outputFile': '输出文件名称',
        'uxInput': '手动输入参数',
        'picInput': '从图片选取坐标点'
      }
    }
  },
  watch: {
    itemData (val) {
      if (val) {
        this.currentItemContent = val.itemContent
        this.handleTmachBlanks()
        // if (this.isClicked) {
        //   this.$el.click()
        // }
      }
    }
  },
  computed: {
    ...mapGetters(['isJobResourcePicture', 'isJobResourceFile', 'currentFile']),
    coordinates () {
      return this.$store.state.coordinates
    },
    itemType () {
      return this.currentItemContent.type
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
      if ('defaultValue' in this.currentItemContent) {
        return this.currentItemContent.defaultValue.split(' ')
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
    handleItem (flag) {
      if (flag) {
        this.$store.commit('addNewItem', {
          itemData: this.currentItemContent,
          itemIndex: this.itemData.itemName
        })
      } else {
        this.$store.commit('removeItem', this.itemData.itemName)
      }
    },
    judgeWhetherEditable () {
      if (this.isEditable === false) {
        this.$Modal.warning({
          title: '温馨提示',
          content: '请先在 参考标准图片 中获取图片'
        })
      }
    },
    handleClicked () {
      this.isClicked = true
      let unitItemBrothers = findBrothersComponents(this, 'UnitItem')
      unitItemBrothers.forEach(bro => {
        bro.isClicked = false
      })
    },
    removeLabelArea () {
      let imageDom = document.querySelector('.image-dom')
      let areas = document.querySelectorAll('.area')
      areas.forEach(area => {
        imageDom.removeChild(area)
      })
    },
    addAreas () {
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
    handleItemClick () {
      if (!this.isEditable) {
        this.$Modal.warning({
          title: '温馨提示',
          content: '请先获取图片'
        })
        return
      }
      this.removeLabelArea()
      // this.judgeWhetherEditable()
      this.handleClicked()
      this.$store.commit('handleCurrentUnitItem', this.itemData)
      this.$store.commit('handleShowItemEditor', true)
      if (this.tmachBlanks[0].trim().length !== 0) {
        if (this.isJobResourcePicture) {
          this.$store.commit('setCurrentFile', {
            byName: true,
            name: this.tmachBlanks[0].trim().substring(5)
          })
        }
        if (this.isJobResourceFile) {
          this.$store.commit('setCoordinateAndImageRecognitionRate', this.tmachBlanks[0].trim().substring(5))
          this.addAreas()
        }
      }
    },
    setDefaultValue () {
      if (this.tmachBlanks.includes('Tmach ')) {
        for (let i = 0; i < this.tmachBlanks.length; i++) {
          this.currentItemContent.content = this.currentItemContent.content.replace(this.tmachBlanks[i], 'Tmach' + this.uxInputDefaultValue[i] + ' ')
        }
        this.$store.commit('saveUnitItem', {
          itemName: this.itemData.itemName,
          itemContent: this.currentItemContent
        })
      }
    },
    handleTmachBlanks () {
      this.tmachBlanks = this.currentItemContent.content.match(/Tmach.*? /g)
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
    flex-direction: column;
    float: right;

    .add-new-item, .remove-item {
      display: inline-block;
      text-align: center;
      width: 16px;
      height: 16px;
      line-height: 16px;
      text-align: center;
    }
    .add-new-item {
      background: rgb(48, 207, 61);
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
