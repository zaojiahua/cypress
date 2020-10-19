<template>
  <Card class="raw-unit-card" :class="foldRawUnit ? 'fold-raw-unit' : null">
    <!-- title -->
    <p slot="title">
      Raw Unit &nbsp; ({{ unitType }} Unit) {{foldRawUnit}}
    </p>
    <!-- extra -->
    <div slot="extra">
      <Icon
        type="ios-arrow-down"
        size="20"
        v-show="!foldRawUnit"
        @click="handleFoldRawUnit"
      />
      <Icon
        type="ios-arrow-up"
        size="20"
        v-show="foldRawUnit"
        @click="handleFoldRawUnit"
      />
    </div>
    <!-- body -->
    <div class="raw-unit-container">
      <div class="raw-unit-content">
        <pre>{{ unitContent }}</pre>
      </div>
      <div v-show="editing">
        <Input type="textarea" v-model="currentUnitContent"/>
        <div class="btns">
          <Button @click="cancelEditCurrentUnitContent">取消</Button>
          <Button type="primary" @click="saveCurrentUnitContent">保存</Button>
        </div>
      </div>
      <Button @click="editCurrentUnitContent"><Icon type="ios-clipboard-outline" />编辑</Button>
    </div>
  </Card>
</template>

<script>
import { isJsonString, insertAfterCursor } from 'lib/tools.js'

export default {
  name: 'RawUnit',
  props: {
    unitData: Object
  },
  data () {
    return {
      foldRawUnit: false,
      editing: false,
      currentUnitContent: this.unitContent
    }
  },
  watch: {
    unitContent (val) {
      this.currentUnitContent = val
    }
  },
  computed: {
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
    handleFoldRawUnit (toggle) {
      this.foldRawUnit = !this.foldRawUnit
    }
  }
}
</script>

<style lang="less" scoped>
@import '../../css/common.less';
.raw-unit-card {
  flex: 1;
  max-height: 50%;
  /deep/ .ivu-card-body {
    height: calc(100% - 51px);
  }
  .raw-unit-container {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    height: 100%;
    .raw-unit-content {
      overflow: auto;
      height: 100%;
      margin-bottom: 1em;
      pre {
        margin: 0;
      }
    }
    .raw-unit-content + div {
      display: flex;
      position: fixed;
      flex-direction: column;
      justify-content: space-around;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      padding: 6em;
      background-color: rgba(0, 0, 0, .8);
      z-index: @mask;
      & > div:first-child {
        flex: 1;
        margin-bottom: 1em;
        /deep/ .ivu-input {
          height: 100%;
          max-height: 100%;
        }
      }
      .btns {
        display: flex;
        justify-content: flex-end;
        & > Button:first-child {
          margin-right: 1em;
        }
      }
    }
  }
}
.fold-raw-unit {
  max-height: 50px;
  font-size: 0;
  /deep/ .ivu-card-body {
    visibility: hidden;
    height: 0;
    padding: 0;
  }
}
</style>
