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
      <Input :placeholder="$t('jobResFile.tips_10')" v-model="newUnitName"/>
    </Modal>
    <div slot="footer">
      <Button type="warning" @click="closeUnitTemplateEditor">{{$t('public.btn_cancel')}}</Button>
      <Button type="success" @click="saveAs">{{$t('jobEdit.btn_5')}}</Button>
      <Button type="primary" @click="updateUnitTemplate">{{$t('jobResFile.btn_1')}}</Button>
    </div>
  </Modal>
</template>

<script>
import { isJsonString, insertAfterCursor } from 'lib/tools.js'

import { updateJobUnitTemplate, createNewUnitTemplate, updateJobUnitTemplate_en, createNewUnitTemplate_en } from '../api/reef/request'

import { mapState } from 'vuex'

const lang = sessionStorage.getItem("lang")
export default {
  props: {
    openUnitTemplateEditor: {
      type: Boolean,
      default: false
    },
    unitTemplateName: {
      type: String,
      default: lang ==='zh' ? "请为当前 unit 模板起一个名字吧" : "Please give the current unit template a name."
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
          content: this.$t('jobResFile.notices_2')
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
      let request
      if(lang==='zh'){
        request = createNewUnitTemplate(unitInfo)
      }else {
        request = createNewUnitTemplate_en(unitInfo)
      }
      request.then((res) => { // 保存新建的unit模板并更新ui显示
        if (res.status === 201) {
          this.$Message.success({
            background: true,
            content: this.$t('jobResFile.notices_3')
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
          let result
          if(lang==="zh"){
            let { status } = await updateJobUnitTemplate(this.unitTemplateId, unitInfo)
            result = status
          }else {
            let { status } = await updateJobUnitTemplate_en(this.unitTemplateId, unitInfo)
            result = status
          }
          if (result === 200) {
            this.$Message.success({
              background: true,
              content: this.$t('jobResFile.notices_4')
            })
            this.$emit('updateUnitLists', this.currentUnitType)
          } else {
            this.$Message.error({
              background: true,
              content: this.$t('jobResFile.notices_5')
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
