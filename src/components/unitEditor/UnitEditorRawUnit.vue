<template>
  <Card class="raw-unit-card" :class="foldRawUnit ? 'fold-raw-unit' : null">
    <!-- title -->
    <div slot="title">
      Raw Unit &nbsp; ({{ unitData.unitType }} Unit)
    </div>
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
        <Input type="textarea" v-model="unitContent"/>
        <div class="btns">
          <Button @click="endUnitContentEdit(false)">取消</Button>
          <Button type="primary" @click="endUnitContentEdit(true)">保存</Button>
        </div>
      </div>
      <Button @click="editUnitContent"><Icon type="ios-clipboard-outline" />编辑</Button>
    </div>
  </Card>
</template>

<script>
import { isJsonString, insertAfterCursor } from 'lib/tools.js'
import { mapState } from 'vuex'

export default {
  name: 'RawUnit',
  data () {
    return {
      foldRawUnit: false,
      editing: false,
      curUnitContent: undefined
    }
  },
  computed: {
    ...mapState('unit', ['unitData']),
    unitContent: {
      get () {
        if (this.unitData.unitMsg) {
          let { unitMsg, unitMsg: { execCmdDict: { execCmdList } } } = this._.cloneDeep(this.unitData)
          if (execCmdList) {
            execCmdList.forEach((val, idx, arr) => {
              delete arr[idx].itemId
            })
          }
          return JSON.stringify(unitMsg, null, 2)
        }
        return ''
      },
      set (val) {
        this.curUnitContent = val
      }
    }
  },
  methods: {
    editUnitContent () {
      this.editing = true
      this.curUnitContent = this.unitContent
    },
    endUnitContentEdit (save) {
      if (save) {
        if (!isJsonString(this.unitContent)) {
          this.$Message.error({
            background: true,
            content: '不是 JSON 格式'
          })
          return
        } else {
          this.$store.commit('unit/handleUnitData', {
            action: 'setUnitMsg',
            data: JSON.parse(this.curUnitContent)
          })
          this.$Message.success({
            background: true,
            content: '保存成功'
          })
        }
      }
      this.editing = false
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
  max-height: calc(50% - 16px);
  /deep/ .ivu-card-extra {
    top: 10px;
  }
  /deep/ .ivu-card-body {
    height: calc(100% - 44px);
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
  max-height: 44px;
  /deep/ .ivu-card-body {
    display: none;
  }
}
</style>
