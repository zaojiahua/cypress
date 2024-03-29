<template>
  <Modal v-model="currentOpenUnitTemplateEditor" :mask-closable="false" :closable="false" width="80">
    <Card>
      <div slot="title">
        <Tag size="large" color="success">UNITTYPE</Tag>
        <AutoComplete
          v-model="currentUnitType"
          icon="ios-search"
          placeholder="input here"
          style="width:300px">
          <Option v-for="unitType in unitTypes" :value="unitType" :key="unitType"></Option>
        </AutoComplete>
      </div>
      <div class="edit-area" @keydown="handleKeydown">
        <Input type="textarea" :rows="40" v-model="currentUnitTemplateContent"/>
      </div>
    </Card>
    <Modal v-model="setNewUnitName" :mask-closable="false" :styles="{top: '48%'}" :closable="false" @on-ok="_saveAs">
      <Input placeholder="为新的 Unit 起一个名字吧" v-model="newUnitName"/>
    </Modal>
    <div slot="footer">
      <Button type="warning" @click="closeUnitTemplateEditor">取消</Button>
      <Button type="success" @click="saveAs">另存为</Button>
      <Button type="primary" @click="updateUnitTemplate">更新</Button>
    </div>
  </Modal>
</template>

<script>
import { isJsonString, insertAfterCursor } from 'lib/tools.js'

import { updateJobUnitTemplate, createNewUnitTemplate } from 'api/reef/request'

import { mapState } from 'vuex'

export default {
  props: {
    openUnitTemplateEditor: {
      type: Boolean,
      default: false
    },
    unitTemplateName: {
      type: String,
      default: '请为当前 unit 模板起一个名字吧'
    },
    unitTemplateType: {
      type: String,
      default: ''
    },
    unitTemplateContent: {
      type: String,
      default: ''
    },
    unitTemplateId: {
      type: Number,
      default: undefined
    }
  },
  data () {
    return {
      setNewUnitName: false,
      isEditing: true,
      currentOpenUnitTemplateEditor: this.openUnitTemplateEditor,
      currentUnitTemplateContent: this.unitTemplateContent,
      currentUnitType: this.unitTemplateType,
      newUnitName: ''
    }
  },
  computed: {
    ...mapState('unit', [
      'unitTypes'
    ])
  },
  watch: {
    openUnitTemplateEditor (val) {
      this.currentOpenUnitTemplateEditor = val
    },
    unitTemplateContent (val) {
      this.currentUnitTemplateContent = val
    },
    unitTemplateType (val) {
      this.currentUnitType = val
    }
  },
  methods: {
    _reset () {
      this.currentUnitType = this.unitTemplateType
      this.newUnitName = ''
    },
    jsonFormatCheck (str) { // 检查是否是JSON格式
      if (!isJsonString(str)) {
        this.$Message.error({
          background: true,
          content: '不是 JSON 格式'
        })
        return false
      } else {
        return true
      }
    },
    closeUnitTemplateEditor () {
      this._reset()
      this.$emit('closeUnitTemplateEditor')
    },
    _saveAs () { // 另存为一个新的unit模板
      let unitInfo = {
        unit_name: this.newUnitName,
        unit_content: JSON.parse(this.currentUnitTemplateContent),
        type: this.currentUnitType
      }
      createNewUnitTemplate(unitInfo).then((res) => { // 保存新建的unit模板并更新ui显示
        if (res.status === 201) {
          this.$Message.success({
            background: true,
            content: '新建成功'
          })
          this.$emit('updateUnitLists', this.currentUnitType)
        }
      }).catch(e => {
        console.log(e)
      })
      this.setNewUnitName = false
      this.closeUnitTemplateEditor()
    },
    saveAs () { // 点击另存为时显示重命名
      if (this.jsonFormatCheck(this.currentUnitTemplateContent)) {
        this.setNewUnitName = true
      }
    },
    async updateUnitTemplate () { // 更新当前unit模板
      if (this.jsonFormatCheck(this.currentUnitTemplateContent)) {
        let unitInfo = {
          unit_name: this.unitTemplateName,
          unit_content: JSON.parse(this.currentUnitTemplateContent),
          type: this.currentUnitType
        }
        try {
          let { status } = await updateJobUnitTemplate(this.unitTemplateId, unitInfo)
          if (status === 200) {
            this.$Message.success({
              background: true,
              content: '更新成功'
            })
            this.$emit('updateUnitLists', this.currentUnitType)
          } else {
            this.$Message.error({
              background: true,
              content: '更新失败'
            })
          }
        } catch (error) {
          console.log(error)
        }
        this.closeUnitTemplateEditor()
      }
    },
    handleKeydown (event) { // 键盘按键事件分发
      switch (event.keyCode) {
        case 9: // tab   按下时填入两个空格
          let insertStr = '  '
          event.preventDefault()
          insertAfterCursor(event.target, insertStr)
          break
        case 27: // esc
          this.closeUnitTemplateEditor()
          break
      }
    }
  }
}
</script>

<style lang="less">
// .edit-area {

// }
</style>
