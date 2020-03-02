<template>
  <Modal
    v-model="unitEditorShow"
    :mask-closable="false"
    :closable="false" width="90"
    @on-ok="editorCompleted"
    @on-cancel="closeUnitEditor">
      <div slot="header" class="unit-editor-header">
        <span>UNIT EDITOR</span>
        <div style="margin-left:20px; display: flex; align-items: center; width: 32.8%;">
          <Tag color="green" size="large" style="display: flex; align-items: center;">UNIT NAME</Tag>
          <Input type="text" v-model="unitName" style="flex: 1;"></Input>
        </div>
      </div>
      <div class="unit-editor">
        <div>
          <unit-editor-unit-items v-if="unitItemsData !== null" :unitItemsData="unitItemsData"></unit-editor-unit-items>
          <unit-editor-raw-unit v-if="unitContent !== null" :unitContent="unitContent" :unitType="unitType" style="margin-top: 20px;"></unit-editor-raw-unit>
        </div>
        <div>
          <unit-editor-item-edit :filesName="filesName" @saveChange="saveChange" ref="itemEdit"></unit-editor-item-edit>
        </div>
        <div>
          <unit-editor-utils></unit-editor-utils>
        </div>
      </div>
  </Modal>
</template>

<script>
import unitEditorUnitItems from './unitEditorUnitItems'
import unitEditorRawUnit from './unitEditorRawUnit'
import unitEditorItemEdit from './unitEditorItemEdit'
import unitEditorUtils from './unitEditorUtils'
import { findComponentsDownward } from '../lib/tools.js'

export default {
  components: { unitEditorUnitItems, unitEditorRawUnit, unitEditorItemEdit, unitEditorUtils },
  props: {
    unitEditorModalShow: {
      type: Boolean,
      default: false
    },
    filesName: {
      type: Array,
      default () {
        return []
      }
    },
    nodeKey: {
      type: Number
    }
  },
  data () {
    return {
      unitNodeKey: 0,
      unitName: '',
      unitType: '',
      unitMsg: null,
      unitContent: '',
      unitItemsData: [],
      unitEditorShow: this.unitEditorModalShow,
      unitItems: [], // 存放 unit items 的每个实例
      isEditing: false,
      currentItem: -1,
      loadingStatus: false,
      deviceColumn: [
        {
          title: '名称',
          key: 'device_name'
        },
        {
          title: '型号',
          key: 'phone_model'
        },
        {
          title: '安卓版本',
          key: 'android_version'
        },
        {
          title: 'ROM版本',
          key: 'rom_version'
        }
      ],
      imgName: '',
      loading: false
    }
  },
  watch: {
    unitName (val) {
      this.unitName = val
    },
    unitEditorModalShow (val) {
      this.unitEditorShow = val
    }
  },
  methods: {
    editorCompleted () {
      this._changeUnitStatus() // 根据 unit 是否编辑完毕来改变 unit 的颜色
      this._resetUnitUtils() // 初始化 UnitUtils 模块
      this._saveUnit() // 保存当前 unit 的内容
      this.closeUnitEditor() // 关闭 UnitEditor
    },
    closeUnitEditor () {
      this.$refs.itemEdit.showEditPane = false
      this.$emit('closeUnitEditor')
    },
    _checkWhetherCompleted () { // 检查当前 unit 是否编辑完毕
      this.unitItems = [...findComponentsDownward(this, 'unit-item')]
      return this.unitItems.every(unitItem => {
        return unitItem.isComplete === true
      })
    },
    _changeUnitStatus () {
      this.$emit('updateCanvas', this._checkWhetherCompleted(), this.nodeKey)
    },
    _resetUnitUtils () {
      this.$bus.emit('resetUnitUtils')
    },
    _saveUnit () {
      this.$emit('saveUnit', this.unitNodeKey, this.unitName, this.unitMsg)
    },
    _setUnitEditorData (unitEditorData) { // 设置 UnitEditor 所需数据
      this.unitNodeKey = unitEditorData.unitNodeKey
      this.unitName = unitEditorData.unitName
      this.unitType = unitEditorData.unitType
      this.unitMsg = unitEditorData.unitMsg
      this.unitContent = unitEditorData.unitContent
      this.unitItemsData = unitEditorData.unitItemsData
    },
    _getUnitItems (unitMsg) { // 解析 UnitMsg 以获取需要编辑的 UnitItem
      let unitItemsData = []
      let unitType = unitMsg.execModName
      if (unitType === 'IMGTOOL') {
        Object.keys(unitMsg.execCmdDict).forEach(execCmdDictKey => {
          if (unitMsg.execCmdDict[execCmdDictKey].type !== 'noChange') {
            unitItemsData.push({
              'itemName': execCmdDictKey,
              'itemContent': JSON.parse(JSON.stringify(unitMsg.execCmdDict[execCmdDictKey]))
            })
          }
        })
      } else {
        unitMsg.execCmdDict.execCmdList.forEach((val, index) => {
          if (val.type !== 'noChange') {
            unitItemsData.push({
              'itemName': index,
              'itemContent': JSON.parse(JSON.stringify(val))
            })
          }
        })
      }
      return unitItemsData
    },
    _updateUnitEditorData (unitMsg) { // 更新 UnitEditor 所需数据
      this.unitContent = JSON.stringify(unitMsg, null, 2)
      this.unitItemsData = this._getUnitItems(unitMsg)
    },
    saveChange (data) { // 修改 unitMsg 的内容
      if (this.unitType === 'IMGTOOL') {
        this.$set(this.unitMsg.execCmdDict, data.itemName, data.itemContent)
      } else {
        this.unitMsg.execCmdDict.execCmdList.splice(Number(data.itemName), 1, data.itemContent)
      }
      this._updateUnitEditorData(this.unitMsg)
    }
  },
  beforeUpdate () {
    this.unitItems = [...findComponentsDownward(this, 'unit-item')]
  },
  created () {
    this.$bus.on('setUnitEditorData', this._setUnitEditorData)
    this.$bus.on('setNamesAboutScreenShotFile', (imgName, featurePointFileName) => {
      let target = this.unitMsg.execCmdDict
      target['referImgFile']['content'] = `Tmach${imgName} `
      target['configFile']['content'] = `Tmach${featurePointFileName}.json `
    })
  },
  destroyed () {
    this.$bus.off('setUnitEditorData', this._setUnitEditorData)
    this.$bus.off('setNamesAboutScreenShotFile')
  }
}
</script>

<style lang="less">
::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
::-webkit-scrollbar-thumb {
  // background-color: #a1a3a9;
  border-radius: 3px;
  // background-color: rgb(136, 135, 219);
  background-image: -webkit-linear-gradient(
      45deg,
      // rgba(4, 81, 182, 0.8) 6%,
      // rgba(6, 105, 44, 0.8) 18%,
      // rgba(112, 216, 42, 0.8) 25%,
      // rgba(89, 0, 206, 0.8) 50%,
      // rgba(125, 69, 228, 0.8) 60%,
      // rgba(192, 45, 113, 0.8) 75%,
      // rgba(112, 216, 42, 0.8)
      rgba(35, 35, 36, 0.8) 6%,
      rgba(120, 134, 125, 0.8) 18%,
      rgba(170, 190, 157, 0.8) 25%,
      rgba(137, 125, 153, 0.8) 50%,
      rgba(86, 76, 104, 0.8) 60%,
      rgba(138, 94, 115, 0.8) 75%,
      rgba(107, 140, 167, 0.8)
  );
}
.unit-editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1rem;
}
.unit-editor {
  display: flex;
  justify-content: space-between;
  &>div {
    width: 32.8%;
  }
}

</style>
