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
          <Option v-for="unitType in unitTemplateTypes" :value="unitType" :key="unitType"></Option>
        </AutoComplete>
      </div>
      <div class="edit-area" @keydown="handleKeydown">
        <Input type="textarea" :rows="40" v-model="currentUnitTemplateContent"/>
      </div>
    </Card>
    <Modal v-model="setNewUnitName" :mask-closable="false" :styles="{top: '48%'}" :closable="false" @on-ok="_saveAs">
      <Input placeholder="为新的 Unit 起一个名字吧" autofocus="autofocus" v-model="newUnitName"/>
    </Modal>
    <div slot="footer">
      <Button type="warning" @click="closeUnitTemplateEditor">取消</Button>
      <Button type="success" @click="saveAs">另存为</Button>
      <Button type="primary" @click="updateUnitTemplate">更新</Button>
    </div>
  </Modal>
</template>

<script>
import { isJsonString, insertAfterCursor } from '../lib/tools.js'

import { updateJobUnitTemplate, createNewUnitTemplate } from '../api/reef/unit'

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
    },
    unitTemplateTypes: {
      type: Array,
      default () {
        return ['ADBC', 'IMGTOOL', 'LIMBTEMPR', 'MONITCAM']
      }
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
    jsonFormatCheck (str) {
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
    _saveAs () {
      let unitInfo = {
        unit_name: this.newUnitName,
        unit_content: JSON.parse(this.currentUnitTemplateContent),
        type: this.currentUnitType
      }
      createNewUnitTemplate(unitInfo).then((res) => {
        if (res.status === 201) {
          this.$Message.success({
            background: true,
            content: '新建成功'
          })
          this.$emit('updateUnitAllList', this.currentUnitType)
        }
      }).catch(e => {
        console.log(e)
      })
      this.setNewUnitName = false
      this.closeUnitTemplateEditor()
    },
    saveAs () {
      if (this.jsonFormatCheck(this.currentUnitTemplateContent)) {
        this.setNewUnitName = true
      }
    },
    updateUnitTemplate () {
      if (this.jsonFormatCheck(this.currentUnitTemplateContent)) {
        let unitInfo = {
          unit_name: this.unitTemplateName,
          unit_content: JSON.parse(this.currentUnitTemplateContent),
          type: this.unitTemplateType
        }
        updateJobUnitTemplate(this.unitTemplateId, unitInfo).then((res) => {
          if (res.status === 200) {
            this.$Message.success({
              background: true,
              content: '更新成功'
            })
            this.$emit('updateUnitAllList', this.currentUnitType)
          }
        }).catch(e => {
          console.log(e)
        })
        this.closeUnitTemplateEditor()
      }
    },
    handleKeydown (event) {
      switch (event.keyCode) {
        case 9: // tab
          let insertStr = '  '
          event.preventDefault()
          insertAfterCursor(event.target, insertStr)
          break
        case 27: // esc
          console.log(event.keyCode, this)
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
