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
          @arrangeFileName="arrangeFileName"
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
      unitItems: [],
      unitResFileList: []
    }
  },
  computed: {
    ...mapState('unit', ['itemHandBook', 'unitData'])
  },
  watch: {
    showUnitEditor (val) {
      this.curShowUnitEditor = val
    },
    unitData: {
      deep: true,
      handler (newVal) {
        let copyOfVal = this._.cloneDeep(newVal)
        let { unitMsg: { execCmdDict: { execCmdList } } } = copyOfVal
        if (execCmdList) {
          execCmdList.forEach((val, idx) => {
            val.itemID = Math.random().toString(16).slice(2, 8)
          })
          copyOfVal.unitMsg.execCmdDict.execCmdList = execCmdList
        }
        this.curUnitData = copyOfVal
      }
    },
    itemHandBook (val) {
      if (val.methods === 'add') {
        val.data.itemID = Math.random().toString(16).slice(2, 8)
        val.data.content = val.data.content.replace(/Tmach.*? /g, 'Tmach ')
        this.curUnitData.unitMsg.execCmdDict.execCmdList.splice(val.index + 1, 0, val.data)
      } else if (val.methods === 'remove') {
        this.curUnitData.unitMsg.execCmdDict.execCmdList.splice(val.index, 1)
      }
    }
  },
  methods: {
    closeUnitEditor (save) {
      this.unitItems = [...findComponentsDownward(this, 'UnitItem')]
      if (save) {
        this.$emit('changeUnitColor', this.checkWeatherCompleted())
        let unitData = this._.cloneDeep(this.unitData)
        let unitResFileList = this._.cloneDeep(this.unitResFileList)
        this.unitResFileList = []
        let { unitMsg: { execCmdDict: { execCmdList } } } = unitData
        if (execCmdList) {
          execCmdList.forEach((val) => {
            delete val.itemID
          })
        }
        this.$emit('saveUnit', unitData, unitResFileList)
      }
      this.$emit('closeUnitEditor')
      this.unitItems.forEach(item => {
        item.isClicked = false
      })
      this.$store.commit('item/handleShowItemEditor', false)
      this.$store.commit('files/handleCurFile', { action: 'removeCurFile' })
      this.curUnitData = null
    },
    checkWeatherCompleted () {
      return this.unitItems.every(unitItem => unitItem.isCompleted === true)
    },
    updateUnitItem (item) {
      let { unitMsg: { execCmdDict, execCmdDict: { execCmdList } } } = this.curUnitData
      let src = execCmdList || execCmdDict
      Object.assign(src[item.itemName], item.itemContent)
    },
    arrangeFileName (nameData) {
      this.unitResFileList.push(nameData)
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
