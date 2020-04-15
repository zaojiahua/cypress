<template>
  <Modal
    class="unit-editor"
    width="90"
    :closable="false"
    :mask-closable="false"
    v-model="currentShowUnitEditor"
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
        <ItemList></ItemList>
        <RawUnit></RawUnit>
      </div>
      <div style="height:840px;">
        <ItemEditor></ItemEditor>
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

export default {
  name: 'UnitEditor',
  components: { ItemList, RawUnit, ItemEditor, Utils },
  props: {
    showUnitEditor: Boolean
  },
  data () {
    return {
      currentShowUnitEditor: this.showUnitEditor,
      unitItems: []
    }
  },
  watch: {
    showUnitEditor (val) {
      this.currentShowUnitEditor = val
    }
  },
  computed: {
    unitName: {
      get () {
        return this.$store.state.unitEditorData.unitName
      },
      set (val) {
        this.$store.commit('handleUnitName', val)
      }
    }
  },
  methods: {
    closeUnitEditor (save) {
      this.unitItems = [...findComponentsDownward(this, 'UnitItem')]
      if (save) {
        this.$emit('changeUnitColor', this.checkWeatherCompleted())
        this.$emit('saveUnit')
      }
      this.$emit('closeUnitEditor')
      this.unitItems.forEach(item => {
        item.isClicked = false
      })
      this.$store.commit('handleShowItemEditor', false)
      this.$store.commit('clearCurrentFile')
    },
    checkWeatherCompleted () {
      return this.unitItems.every(unitItem => unitItem.isCompleted === true)
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
