<template>
  <Card>
    <p slot="title">Item Edit</p>
    <div v-show="!showEditPane" class="items-edit"></div>
    <div class="items-edit" v-show="showEditPane">
      <div>
        <div v-if="unitItemData && showInput">
          <Input
            v-for="(blank, index) in tmachBlanks"
            :key="index"
            v-model="tmachBlanks[index]"
            style="margin-bottom: 10px;"
            :placeholder="unitItemData && unitItemData.itemContent.type === 'outputFile' ? 'text.txt' : unitItemData.itemContent.type === 'outputPicture' ? 'snap.jpg' : ''"
            :disabled="unitItemData.itemContent.type === 'picInput' ? true : false"
          >
          </Input>
        </div>
        <div v-if="unitItemData && (unitItemData.itemContent.type === 'inputFile' || unitItemData.itemContent.type === 'inputPicture') ? true : false">
          <AutoComplete
            v-for="(blank, index) in tmachBlanks"
            :key="index" v-model="tmachBlanks[index]"
            style="margin-bottom: 10px;"
          >
            <div v-for="names in filesName" :key="names.title">
              <div class="auto-complete-title">
                <span>{{ names.title }}</span>
              </div>
              <Option v-for="name in names.children" :key="name" :value="name"></Option>
            </div>
          </AutoComplete>
        </div>
        <unit-editor-screen-shot
          :imgName="tmachBlanks[0]"
          :itemType="unitItemData.itemContent.type"
          @setImgName="setImgName"
          v-if="unitItemData && (unitItemData.itemContent.type === 'jobResourcePicture' || unitItemData.itemContent.type === 'picInput')"
        ></unit-editor-screen-shot>
        <unit-editor-get-feature-point :featurePointFileName="tmachBlanks[0]" @setFeaturePointFileName="setFeaturePointFileName" v-if="unitItemData && unitItemData.itemContent.type === 'jobResourceFile'"></unit-editor-get-feature-point>
        <p><Tag>操作说明</Tag>{{ unitItemData ? unitItemData.itemContent.meaning : ''}}</p>
        <Checkbox v-model="saveToFinalResult" v-if="unitItemData && unitItemData.itemContent.type === 'outputPicture' ? true : false" style="float: right;">添加此图片至最终结果</Checkbox>
      </div>
      <div class="save-btn">
        <Button type="primary" @click="saveItem">保存</Button>
      </div>
    </div>
  </Card>
</template>

<script>
import unitEditorScreenShot from './unitEditorScreenShot'
import unitEditorGetFeaturePoint from './unitEditorGetFeaturePoint'

import { suffixAutoComplete, suffixAutoRemove } from '../lib/tools.js'

export default {
  name: 'item-edit',
  components: { unitEditorScreenShot, unitEditorGetFeaturePoint },
  props: {
    unitType: {
      type: String,
      default: ''
    },
    filesName: {
      type: Array,
      default () {
        return []
      }
    }
  },
  data () {
    return {
      unitItemData: null,
      showEditPane: false,
      saveToFinalResult: false,
      tmachBlanks: []
    }
  },
  watch: {
    saveToFinalResult (val) {
      if (!val) {
        for (let i = 0; i < this.tmachBlanks.length; i++) {
          this.tmachBlanks[i] = this.tmachBlanks[i].replace('<copy2rdsDatPath>', '')
        }
      }
    }
  },
  computed: {
    showInput () {
      let itemType = this.unitItemData.itemContent.type
      if (itemType !== 'jobResourcePicture' && itemType !== 'jobResourceFile' && itemType !== 'inputFile' && itemType !== 'inputPicture') {
        return true
      }
      return false
    },
    showAutoComplete () {
      let itemType = this.unitItemData.itemContent.type
      if (itemType !== 'inputFile' && itemType !== 'inputPicture') return true
      return false
    }
  },
  methods: {
    saveItem () {
      if (!this._handleDuplicateName()) return // 重名则中断
      this._tmachBlankSuffixComplete() // 补全后缀
      this._patchUnitContent() // 拼接 Tamch 并填入
      this._setUnitItemState() // 使 UnitItem 变为可编辑状态
      this._closeEditPane() // 关闭当前面板
    },
    setImgName (imgName) {
      this.tmachBlanks[0] = imgName
    },
    setFeaturePointFileName (featurePointFileName) {
      this.tmachBlanks[0] = featurePointFileName
    },
    _tmachBlankSuffixComplete () {
      let itemType = this.unitItemData.itemContent.type
      if (itemType === 'outputPicture' || itemType === 'inputPicture') {
        let commandOfSaveToFinal = '<copy2rdsDatPath>'
        for (let i = 0; i < this.tmachBlanks.length; i++) {
          if (this.tmachBlanks[i].length === 0) continue
          this.tmachBlanks[i] = suffixAutoComplete(this.tmachBlanks[i], '.jpg')
          if (this.saveToFinalResult) {
            this.tmachBlanks[i] += commandOfSaveToFinal
          }
        }
      }
      if (itemType === 'outputFile' || itemType === 'inputFile') {
        for (let i = 0; i < this.tmachBlanks.length; i++) {
          if (this.tmachBlanks[i].length === 0) continue
          this.tmachBlanks[i] = suffixAutoComplete(this.tmachBlanks[i], '.txt')
        }
      }
    },
    _checkDuplicateName (index) {
      let flag = false
      for (let i = 0; i < this.tmachBlanks.length; i++) {
        if (this.filesName[index]['children'].includes(this.tmachBlanks[i])) {
          flag = true
          this.$Message.error(`该名字( ${this.tmachBlanks[i]} )已经存在，请再想一个吧`)
        }
      }
      return flag // true: 重复 false: 无重复
    },
    _handleDuplicateName () {
      let itemType = this.unitItemData.itemContent.type
      if (itemType === 'outputFile') {
        if (this._checkDuplicateName(0)) return false
        this.$bus.emit('addFilesName', 'file', this.tmachBlanks)
      }
      if (itemType === 'outputPicture') {
        if (this._checkDuplicateName(1)) return false
        this.$bus.emit('addFilesName', 'picture', this.tmachBlanks)
      }
      return true // 无重复
    },
    _closeEditPane () {
      this.$emit('saveChange', this.unitItemData, this.tmachBlanks)
      this.$bus.emit('reset')
      this.saveToFinalResult = false
      this.showEditPane = false
    },
    _patchUnitContent () {
      let res = this.unitItemData.itemContent.content.match(/Tmach.*? /g)
      for (let i = 0; i < res.length; i++) {
        this.unitItemData.itemContent.content = this.unitItemData.itemContent.content.replace(res[i], 'Tmach' + this.tmachBlanks[i] + ' ')
      }
    },
    _setUnitItemState () {
      let itemType = this.unitItemData.itemContent.type
      if (this.unitType === 'IMGTOOL' && itemType === 'jobResourcePicture') {
        this.$bus.emit('setUnitItemState')
      }
    },
    _tmachBlankSuffixLessen (type, tmachBlanks) {
      tmachBlanks.forEach((tmach, index, arr) => { // 去掉前缀 Tmach
        arr[index] = tmach.trim().substring(5)
      })
      if (type === 'outputPicture' || type === 'outputFile') {
        let commandOfSaveToFinal = '<copy2rdsDatPath>'
        for (let i = 0; i < tmachBlanks.length; i++) {
          if (tmachBlanks[i].includes(commandOfSaveToFinal)) this.saveToFinalResult = true
          tmachBlanks[i] = suffixAutoRemove(tmachBlanks[i])
        }
      }
      return tmachBlanks
    },
    editItem (unitItemData, tmachBlanks) {
      this.unitItemData = unitItemData
      this.tmachBlanks = this._tmachBlankSuffixLessen(unitItemData.itemContent.type, tmachBlanks)
      this.showEditPane = true
    }
  },
  created () {
    this.$bus.on('editItem', this.editItem)
    this.$bus.on('getPointAbsoluteCoordinates', (coordinate) => {
      if (this.unitItemData.itemContent.type === 'picInput') {
        this.tmachBlanks.splice(0, 1, coordinate.x.toString())
        this.tmachBlanks.splice(1, 1, coordinate.y.toString())
      }
    })
  },
  beforeDestroy () {
    this.$bus.off('editItem', this.editItem)
    this.$bus.off('getPointAbsoluteCoordinates')
  }
}
</script>

<style lang="less" scoped>
.items-edit {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 755px;

  .auto-complete-title {
    padding: 0 10px;
    font-weight: bold;
  }

  .data-type {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .save-btn {
    display: flex;
    justify-content: center;
  }
}
</style>
