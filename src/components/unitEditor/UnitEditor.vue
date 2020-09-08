<template>
  <Modal
    class="unit-editor"
    width="90"
    :closable="false"
    :mask-closable="false"
    v-model="curShowUnitEditor"
  >
    <div slot="header" class="header">
      <span>UNIT EDITOR</span>
      <div class="unit-name">
        <Tag class="unit-name-tag" color="green" size="large">UNIT NAME</Tag>
        <Input class="unit-name-input" v-model="unitName"></Input>
      </div>
    </div>
    <div>
    <div class="body">
      <div style="height:840px;">
        <ItemList
          :unitItemsData="unitItemsData"
          @updateUnitItem="updateUnitItem"
        ></ItemList>
        <RawUnit
          :unitData="curUnitData"
          @updateRawUnit="updateRawUnit"
        ></RawUnit>
      </div>
      <div style="height:840px;">
        <ItemEditor
          @updateUnitItem="updateUnitItem"
          @arrangeFileName="arrangeFileName"
        ></ItemEditor>
      </div>
      <div style="height:840px;">
        <Utils></Utils>
      </div>
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
    showUnitEditor: Boolean,
    unitData: Object
  },
  data () {
    return {
      curShowUnitEditor: this.showUnitEditor,
      curUnitData: this.unitData,
      unitItems: [],
      unitResFileList: []
    }
  },
  computed: {
    ...mapState('unit', [
      'itemHandBook'
    ]),
    unitName: {
      get () {
        return this.curUnitData ? this.curUnitData.unitName : ''
      },
      set (val) {
        this.curUnitData.unitName = val
      }
    },
    unitItemsData () {
      if (!this.curUnitData) return

      let { unitMsg: { execCmdDict, execCmdDict: { execCmdList } } } = this._.cloneDeep(this.curUnitData)
      let src = execCmdList || execCmdDict
      let unitItemsData = []
      for (let key in src) {
        if (src[key].type !== 'noChange') {
          unitItemsData.push({
            'itemName': key,
            'itemContent': this._.cloneDeep(src[key])
          })
        }
      }
      return unitItemsData
    }
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
        let unitData = this._.cloneDeep(this.curUnitData)
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
      this.$store.commit('item/setShowItemEditor', false)
      this.$store.commit('files/removeCurrentFile')
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
    updateRawUnit (unitContent) {
      this.curUnitData.unitMsg = JSON.parse(unitContent)
    },
    arrangeFileName (nameData) {
      this.unitResFileList.push(nameData)
    }
  }
}
</script>

<style lang="less">
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-thumb {
    border-radius: 3px;
    background-color: rgb(190, 202, 209);
  }
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
      & > div {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        width: 32.8%;
      }
    }
  }
</style>
