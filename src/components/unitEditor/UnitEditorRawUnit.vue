<template>
  <div style="felx: 1;" class="raw-unit-card card">
    <p class="card-title flex-row">
      Raw Unit &nbsp; ({{ unitType }} Unit)
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
    </p>
    <div v-show="editing" class="card-body">
      <div class="raw-unit-mask"></div>
      <div class="unit-msg">
        <Input type="textarea" :autosize="{minRows: 2,maxRows: 17}" class="unit-msg-edit" v-model="currentUnitContent"/>
      </div>
    </div>
    <div v-show="editing" class="btns card-footer child-m-right--1" style="justify-content: flex-end;">
      <Button @click="cancelEditCurrentUnitContent">取消</Button>
      <Button type="primary" @click="saveCurrentUnitContent">保存</Button>
    </div>
    <div v-show="!editing" class="card-body">
      <div class="unit-msg">
        <pre>{{ unitContent }}</pre>
      </div>
    </div>
    <div v-show="!editing" class="btns card-footer">
      <Button @click="editCurrentUnitContent"><Icon type="ios-clipboard-outline" />编辑</Button>
    </div>
  </div>
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
      this.rawUnitCard.classList.toggle('collapse')
    }
  },
  computed: {
    ...mapState('unit', ['openRawUnit']),
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
  },
  mounted () {
    this.rawUnitCard = document.querySelector('.raw-unit-card')
  }
}
</script>

<style lang="less" scoped>
@import '../../css/common.less';
.raw-unit-card {
  .raw-unit-mask {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(0, 0, 0, .8);
    z-index: @mask;
  }
  .unit-msg {
    width: 100%;
    z-index: @overMask;
  }
  .unit-msg-edit {
    z-index: @overMask;
  }
  .btns {
    display: flex;
    align-items: center;
    z-index: @overMask;
  }
}
.collapse {
  flex: 0;
  height: 52px;
}
</style>
