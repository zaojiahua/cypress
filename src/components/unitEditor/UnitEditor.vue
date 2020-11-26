<template>
  <Modal
    class="unit-editor"
    fullscreen
    :closable="false"
    :mask-closable="false"
    v-model="curShowUnitEditor"
  >
    <div slot="header" class="header">
      <span>UNIT EDITOR</span>
      <div class="unit-name">
        <Tag class="unit-name-tag" color="green" size="large">UNIT NAME</Tag>
        <Input class="unit-name-input" v-model="unitData.unitName" clearable></Input>
      </div>
    </div>
    <div class="body">
      <div class="pane">
        <ItemList
          @updateUnitItem="updateUnitItem"
        ></ItemList>
        <RawUnit></RawUnit>
      </div>
      <div class="pane">
        <ItemEditor
          @updateUnitItem="updateUnitItem"
        ></ItemEditor>
      </div>
      <div class="pane">
        <Utils></Utils>
      </div>
    </div>
    <div slot="footer">
      <Button @click="closeUnitEditor(false)">取消</Button>
      <Button @click="closeUnitEditor(true)" type="primary">保存</Button>
    </div>
  </Modal>
</template>

<script>
import ItemList from './UnitEditorItemList'
import RawUnit from './UnitEditorRawUnit'
import ItemEditor from './UnitEditorItemEditor'
import Utils from './UnitEditorUtils'

import { findComponentsDownward } from 'lib/tools.js'

import { mapState } from 'vuex'

export default {
  name: 'UnitEditor',
  components: { ItemList, RawUnit, ItemEditor, Utils },
  props: {
    showUnitEditor: Boolean
  },
  data () {
    return {
      curShowUnitEditor: this.showUnitEditor,
      unitItems: []
    }
  },
  computed: {
    ...mapState('unit', ['unitData'])
  },
  watch: {
    showUnitEditor (val) {
      this.curShowUnitEditor = val
    },
    unitData: {
      deep: true,
      handler (newVal) {
        if (!newVal || !newVal.unitMsg) return
        let copyOfVal = this._.cloneDeep(newVal) //深拷贝
        let { unitMsg: { execCmdDict: { execCmdList } } } = copyOfVal
        if (execCmdList) {
          execCmdList.forEach((val, idx) => {
            val.itemID = Math.random().toString(16).slice(2, 8) // 为每一个unitItem生成一个id, 减少不必要的重新渲染
          })
          copyOfVal.unitMsg.execCmdDict.execCmdList = execCmdList
        }
        this.curUnitData = copyOfVal
      }
    }
  },
  methods: {
    closeUnitEditor (save) {
      this.unitItems = [...findComponentsDownward(this, 'UnitItem')]
      if (save) {
        this.$emit('handleUnitColor', this.checkWeatherCompleted()) // 检查当前unit是否编辑完成, 以决定unit块的颜色
        let unitData = this._.cloneDeep(this.unitData)
        let { unitMsg: { execCmdDict: { execCmdList } } } = unitData
        if (execCmdList) {
          execCmdList.forEach((val) => {
            delete val.itemID
          })
        }
        unitData.completed = this.checkWeatherCompleted()
        this.$emit('saveUnit', unitData)
      }
      this.unitItems.forEach(item => { // 使每一个unitItem处于非点击状态
        item.isClicked = false
      })
      this.$emit('closeUnitEditor') // 关闭unitEditor
      this.$store.commit('item/handleAreasInfo', { action: 'clear' }) // 清除当前选区信息
      this.$store.commit('item/handleShowItemEditor', false) // 关闭itemEditor
      this.$store.commit('files/handleCurFile', { action: 'removeCurFile' }) // 清空当前显示的图片的信息
      this.curUnitData = null // 清空当前unit的副本信息
    },
    checkWeatherCompleted () { // 如果每一个unitItem都编辑完成了, 则该unit也编辑完成了
      return this.unitItems.every(unitItem => unitItem.isCompleted === true)
    },
    updateUnitItem (item) { // 接受来自unitList.unitEditor的数据, 并将对应的数据更新
      let { unitMsg: { execCmdDict, execCmdDict: { execCmdList } } } = this.curUnitData
      let src = execCmdList || execCmdDict
      Object.assign(src[item.itemName], item.itemContent)
    }
  }
}
</script>

<style lang="less">
  // ::-webkit-scrollbar {
  //   width: 6px;
  //   height: 6px;
  // }
  // ::-webkit-scrollbar-thumb {
  //   border-radius: 3px;
  //   background-color: rgb(190, 202, 209);
  // }
  .unit-editor {
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .unit-name {
        display: flex;
        align-items: center;
        width: 32.8%;

        .unit-name-tag {
          display: flex;
          color: #000;
          align-items: center;
        }

        .unit-name-input {
          flex: 1;
        }
      }
    }
    .body {
      display: flex;
      justify-content: space-between;
      padding-top: 1em;
      height: 100%;
      .pane {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        width: 32.8%;
        height: 100%;
      }
    }
  }
</style>
