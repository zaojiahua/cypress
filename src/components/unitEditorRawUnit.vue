<template>
  <Card style="height: 500px; z-index: 10">
    <p slot="title">Raw Unit &nbsp; ({{ unitType }} Unit)</p>
    <div v-show="!editing" class="raw-unit">
      <div class="unit-msg">
        <pre>{{ currentUnitContent }}</pre>
      </div>
      <div class="btns">
        <Button @click="editCurrentUnitContent"><Icon type="ios-clipboard-outline" />编辑</Button>
      </div>
    </div>
    <div v-show="editing" class="raw-unit">
      <div class="raw-unit-mask"></div>
      <div class="unit-msg unit-msg-edit" @keydown.tab="handleKeydown">
        <Input type="textarea" :autosize="{minRows: 2,maxRows: 17}" v-model="currentUnitContent" />
      </div>
      <div class="btns" style="justify-content: flex-end;">
        <Button @click="cancelEditCurrentUnitContent" style="margin-right: 10px;">取消</Button>
        <Button type="primary" @click="saveCurrentUnitContent">保存</Button>
      </div>
    </div>
  </Card>
</template>

<script>
import { isJsonString, insertAfterCursor } from '../lib/tools.js'

export default {
  props: {
    unitContent: {
      type: String,
      default: ''
    },
    unitType: {
      type: String,
      default: ''
    }
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
        this.$bus.emit('saveRawUnit', this.currentUnitContent)
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
    }
  }
}
</script>

<style lang="less" scoped>
.raw-unit {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 420px;

  .raw-unit-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 3000px;
    height: 3000px;
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
</style>
