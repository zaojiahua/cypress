<template>
  <div class="item" :class="{active: isActive, disabled: !isEditable}" @click="handleItemClick">
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
      <span class="remove-item" :class="disable ? '' : 'disable'" @click.stop="handleItem(false)"> - </span>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import CONST from 'constant/constant'

export default {
  name: 'UnitItem',
  props: {
    itemData: Object, //unit items中单个item的内容
    itemIndex: Number,
    isActive: Boolean
  },
  data () {
    return {
      isClicked: false,
      curItemContent: this.itemData.itemContent,
      tmachBlanks: [], // 可以被定制的内容，item中用户输入项集合
      itemDesc: CONST.ITEM_DESC
    }
  },
  watch: {
    itemData (val) {
      if (val) {
        this.curItemContent = val.itemContent
        this.handleTmachBlanks()
      }
    }
  },
  computed: {
    ...mapGetters('job', ['normalKey']),
    ...mapState('unit', ['unitData']),
    ...mapGetters('unit', ['unitKey']),
    ...mapState('files', ['resFiles', 'curFile']),
    ...mapGetters('files', ['resFilesName']),
    ...mapState('img', ['coordinates']),
    ...mapState('item', ['saveToFinalResult']),
    ...mapGetters('item', ['isJobResourcePicture', 'isJobResourceFile', 'isOutputPicture', 'isOutputFile']),
    itemType () {
      return this.curItemContent.type
    },
    isUxInput () {
      return this.itemType === 'uxInput'
    },
    isPicInput () {
      return this.itemType === 'picInput'
    },
    isJobResourceFileWithDefaultValue () {
      return this.itemType === 'jobResourceFileWithDefaultValue'
    },
    isCompleted () {
      if (this.isUxInput && this.uxInputDefaultValue) {
        this.setDefaultValue()
        return true
      }
      // 设置默认的配置文件
      if (this.isJobResourceFileWithDefaultValue && this.tmachBlanks.includes('Tmach ')) {
        this.$store.commit('files/handleResFiles', { //尾端添加
          action: 'addResFile',
          data: {
            dirty: true,
            index: -1,
            name: `${this.loc}.json`,
            file: JSON.stringify({ 'threshold': 0.99, 'area1': [ 0, 0, 0.99999, 0.99999 ] }, null, 4),
            type: 'json'
          }
        })
        for (let i = 0; i < this.tmachBlanks.length; i++) {
          // eslint-disable-next-line vue/no-side-effects-in-computed-properties
          this.curItemContent.content = this.curItemContent.content.replace(this.tmachBlanks[i], `Tmach${this.loc}.json `)
        }
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.curItemContent.area = `${this.loc}.json`
        this.$store.commit('unit/handleUnitData', {
          action: 'setItemData',
          data: this._.cloneDeep(this.itemData)
        })
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
      if ('defaultValue' in this.curItemContent) {
        return this.curItemContent.defaultValue.split(' ')
      }
      return null
    },
    tagColor () {
      return !this.isEditable ? '#aaaaaa' : this.isCompleted ? 'success' : 'error'
    },
    isEditable () {
      return !(this.itemType === 'jobResourceFile' && !this.curFile);

    },
    disable () {
      let target = this.unitData.unitMsg.execCmdDict.execCmdList
      return target ? target.length > 1 : false
    },
    loc () {
      return [this.normalKey, this.unitKey, this.itemData.itemName].join('_')
    }
  },
  methods: {
    handleItem (flag) { // 当 item 类型 为 picInput 时，可以复制或删除本身
      let itemContent = this._.cloneDeep(this.itemData.itemContent)
      itemContent.content = itemContent.content.replace(/Tmach.*? /g, 'Tmach ')
      itemContent.itemId = Math.random().toString(36).substr(2, 6)
      let { unitMsg } = this._.cloneDeep(this.unitData)
      let { execCmdDict: { execCmdList: target } } = unitMsg
      if (flag) {
        target.splice(Number(this.itemData.itemName) + 1, 0, itemContent)
        this.$store.commit('unit/handleUnitData', {
          action: 'setUnitMsg',
          data: unitMsg
        })
      } else {
        if (target.length === 1) return
        target.splice(Number(this.itemData.itemName), 1)
        this.$store.commit('unit/handleUnitData', {
          action: 'setUnitMsg',
          data: unitMsg
        })
      }
    },
    addAreas () { // 显示标示区域
      this.$store.commit('item/handleAreasInfo', {
        action: 'set',
        data: {
          data: this._.cloneDeep(this.coordinates),
          index: undefined
        }
      })
    },
    parseSelectPoint(){
      let SelectPointList = []
      for (const [index, value] of this.tmachBlanks.entries()) { // 选点数据格式整理并下发给imageTool展示
        if (Number.isNaN(parseFloat(value.trim().substring(5)))) {
          this.$store.commit('item/handleSelectPoint', {
            action: 'clear'
          })
          return
        }
        //  index===4指的是坐标点的第五个值，也就是速度。速度不需要加载在图上。所以去掉
        if(index !== 4){
          if (index % 2 === 0) {
            SelectPointList.push({x:0,y:0})
            SelectPointList[SelectPointList.length - 1].x = parseFloat(value.trim().substring(5))
          } else SelectPointList[SelectPointList.length - 1].y = parseFloat(value.trim().substring(5))
        }
      }
      this.$store.commit('item/handleSelectPoint', {
        action: 'set',
        data: SelectPointList
      })
    },
    setCoordinateAndImgRecRate (name) { // 点击 类型为 jobResourceFile 的 item 时，如果存在相应文件，则将文件内的数据提取出来
      this.$store.commit('img/handleCoordinate', { action: 'clear' })
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
          this.$store.commit('img/handleCoordinate', {
            action: 'add',
            data: {
              coordinate_a: areasData[key].splice(0, 2).join(','),
              coordinate_b: areasData[key].join(',')
            }
          })
        }
      }
    },
    handleItemClick () { // 点击item触发的事件
      if (!this.isEditable) {
        this.$Modal.warning({
          title: '温馨提示',
          content: '请先获取图片'
        })
        return
      }
      this.$store.commit('item/handleSelectPoint', {
        action: 'clear'
      })

      let itemData = this._.cloneDeep(this.itemData)
      itemData.itemIndex = this.itemIndex
      this.$store.commit('item/handleItemData', {
        action: 'setItemData',
        data: itemData
      })
      let { pic, area, content } = itemData.itemContent
      if (pic) { // item 有图片就展示
        this.$store.commit('files/handleCurFile', {
          action: 'setCurFile',
          data: {
            dirty: true,
            index: this.resFilesName.indexOf(pic),
            name: pic
          }
        })
      }
      // 将上一次操作的选点和图片上的操作清空
      this.$store.commit('item/handleAreasInfo', { action: 'clear' })
      this.$store.commit('img/handleCoordinate', { action: 'clear' })
      if (area) { // item 有area 就展示选中区域
        this.setCoordinateAndImgRecRate(area)
        this.addAreas()
      }else {
        // 新选取默认初始化识别率
        this.$store.commit('img/setImgRecRate', 0.99)
      }
      if (this.isPicInput){
        this.parseSelectPoint()
      }
      if (content.includes('<copy2rdsDatPath>') && (this.isOutputPicture || this.isOutputFile)) {
        this.$store.commit('item/handleSaveToFinal', true)
      } else {
        this.$store.commit('item/handleSaveToFinal', false)
      }
      this.$store.commit('item/handleShowItemEditor', true)
    },
    setDefaultValue () { // 给某些 item 内的选项设定默认值
      if (this.tmachBlanks.includes('Tmach ')) {
        for (let i = 0; i < this.tmachBlanks.length; i++) {
          this.curItemContent.content = this.curItemContent.content.replace(this.tmachBlanks[i], 'Tmach' + this.uxInputDefaultValue[i] + ' ')
        }
        this.$emit('updateUnitItem', this._.cloneDeep(this.itemData))
        let itemData = this._.cloneDeep(this.itemData)
        this.$store.commit('item/handleItemData', {
          action: 'setItemData',
          data: itemData
        })
        this.$store.commit('unit/handleUnitData', {
          action: 'setItemData',
          data: itemData
        })
      }
    },
    handleTmachBlanks () { // 获取 item 中需要修改的项
      this.tmachBlanks = this.curItemContent.content.match(/Tmach.*? /g)
    }
  },
  mounted () {
    this.handleTmachBlanks()
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
    .disable {
      background: #cccccc;
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
