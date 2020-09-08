<template>
  <Card style="height: 500px" class="raw-unit-card">
    <p slot="title">Raw Unit &nbsp; ({{ unitType }} Unit)</p>
    <Icon
      type="ios-arrow-up"
      slot="extra" size="20"
      v-show="!openRawUnit"
      @click="open(true)"
    />
    <Icon
      type="ios-arrow-down"
      slot="extra" size="20"
      v-show="openRawUnit"
      @click="open(false)"
    />
    <div v-show="editing" class="raw-unit">
      <div class="raw-unit-mask"></div>
      <div class="unit-msg unit-msg-edit">
        <Input type="textarea" :autosize="{minRows: 2,maxRows: 17}" v-model="currentUnitContent"/>
      </div>
      <div class="btns" style="justify-content: flex-end;">
        <Button @click="cancelEditCurrentUnitContent" style="margin-right: 10px;">取消</Button>
        <Button type="primary" @click="saveCurrentUnitContent">保存</Button>
      </div>
    </div>
    <div v-show="!editing" class="raw-unit">
      <div class="unit-msg">
        <pre>{{ unitContent }}</pre>
      </div>
      <div class="btns">
        <Button @click="editCurrentUnitContent"><Icon type="ios-clipboard-outline" />编辑</Button>
      </div>
    </div>
  </Card>
</template>

<script>
import { isJsonString, insertAfterCursor } from 'lib/tools.js'

import { mapState } from 'vuex'

export default {
  name: 'RawUnit',
  props: {
    unitData: Object
  },
  data () {
    return {
      editing: false,
      currentUnitContent: this.unitContent
    }
  },
  watch: {
    unitContent (val) {
      this.currentUnitContent = val
    },
    openRawUnit (val) {
      let rawUnitCard = document.querySelector('.raw-unit-card')
      if (val) {
        rawUnitCard.style.height = '500px'
      } else {
        rawUnitCard.style.height = '52px'
      }
    }
  },
  computed: {
    ...mapState('unit', [
      'openRawUnit'
    ]),
    unitType () {
      return this.unitData ? this.unitData.unitType : ''
    },
    unitContent () {
      if (this.unitData) {
        let { unitMsg, unitMsg: { execCmdDict: { execCmdList } } } = this._.cloneDeep(this.unitData)
        if (execCmdList) {
          execCmdList.forEach((val) => {
            delete val.itemID
          })
        }
        return JSON.stringify(unitMsg, null, 2)
      }
      return ''
    }
  },
  methods: {
    editCurrentUnitContent () {
      this.editing = true
      let pre = document.querySelector('pre')
      let unitContentEdit = document.querySelector('.unit-msg-edit')
      unitContentEdit.style.width = pre.scrollWidth + 'px'
    },
    cancelEditCurrentUnitContent () {
      this.editing = false
      this.currentUnitContent = this.unitContent
    },
    saveCurrentUnitContent () {
      if (!isJsonString(this.currentUnitContent)) {
        this.$Message.error({
          background: true,
          content: '不是 JSON 格式'
        })
      } else {
        this.$emit('updateRawUnit', this.currentUnitContent)
        this.$Message.success({
          background: true,
          content: '保存成功'
        })
        this.editing = false
      }
    },
    handleKeydown (event) {
      let insertStr = '  '
      event.preventDefault()
      insertAfterCursor(event.target, insertStr)
    },
    open (open) {
      this.$store.commit('unit/handleOpenRawUnit', open)
    }
  }
}
</script>

<style lang="less" scoped>
.raw-unit-card {
  z-index: 10;
  overflow: hidden;
  .raw-unit {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 420px;

    .raw-unit-mask {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background-color: rgba(0, 0, 0, .8);
      z-index: 1;
    }

    .unit-msg {
      // max-height: 88%;
      overflow: auto;
      z-index: 10;
    }
    .unit-msg-edit {
      max-width: 1600px;
    }

    .btns {
      height: 10%;
      display: flex;
      align-items: center;
      z-index: 10;
    }
  }
}
</style>
