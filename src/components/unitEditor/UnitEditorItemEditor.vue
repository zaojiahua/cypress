<template>
  <Card>
    <p slot="title">Item Editor</p>
    <div class="item-editor-empty" v-show="!showItemEditor">
      <p class="empty">选择一个 ITEM 开始编辑吧</p>
    </div>
    <div class="item-editor" v-if="showItemEditor">
      <div>
        <div v-if="showInput">
          <Input
            v-for="(blank, index) in tmachBlanks"
            :key="index"
            v-model="tmachBlanks[index]"
            class="mb-1"
          >
          </Input>
        </div>
        <div v-if="showAutoComplete">
          <AutoComplete
            v-for="(blank, index) in tmachBlanks"
            :key="index"
            v-model="tmachBlanks[index]"
            class="mb-1"
          >
            <div v-for="names in resFilesName" :key="names.title">
              <div class="auto-complete-title">
                <span>{{ names.title }}</span>
              </div>
              <Option v-for="name in names.children" :key="name" :value="name"></Option>
            </div>
          </AutoComplete>
        </div>
        <ScreenShot
          v-if="showScreenShot"
          :imageName="tmachBlanks[0]"
          @setImageName="setName"
        ></ScreenShot>
        <FeaturePoint
          v-if="isJobResourceFile"
          :featurePointFileName="tmachBlanks[0]"
          @setFeaturePointFileName="setName"
        ></FeaturePoint>
        <Checkbox v-model="saveToFinalResult" v-if="showCheckbox" style="float: right;">添加此图片至最终结果</Checkbox>
        <p class="instructions"><Tag>操作说明</Tag>{{ currentUnitItemMeaning }}</p>
      </div>
      <div class="btn-confirm">
        <Button type="primary" @click="saveItem">确定</Button>
      </div>
    </div>
    <Modal v-model="isDuplicateName" :styles="{top: '48%'}" :mask-closable="false"  :closable="false">
      <p slot="header">
        <Icon type="ios-alert-outline" style="color:orange;font-size:1.2em;font-weight:bold;" />
        温馨提示
      </p>
      <p style="width:100%;text-align:center;">已存在同名文件，请选择您要进行的操作。</p>
      <div slot="footer">
        <Button type="warning" @click="overwrite">覆盖同名文件</Button>
        <Button type="primary" @click="rename">重命名</Button>
      </div>
    </Modal>
    <Modal v-model="showRename" :styles="{top: '48%'}" :mask-closable="false" :closable="false">
      <p slot="header">
        <Icon type="ios-clipboard-outline" style="color:orange;font-size:1.2em;font-weight:bold;" />
        请填写新的名字
      </p>
      <Input v-model="tmachBlanks[0]"/>
      <div slot="footer">
        <!-- <Button type="info" @click="checkDuplicateName">检测名称是否可用</Button> -->
        <Button type="success" @click="setNewName">确定</Button>
      </div>
    </Modal>
  </Card>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { suffixAutoComplete, suffixAutoRemove } from 'lib/tools.js'
import ScreenShot from './UnitEditorScreenShot'
import FeaturePoint from './UnitEditorFeaturePoint'

export default {
  name: 'ItemEditor',
  components: { ScreenShot, FeaturePoint },
  data () {
    return {
      tmachBlanks: [],
      saveToFinalResult: false,
      showRename: false
    }
  },
  computed: {
    ...mapState(
      [
        'showItemEditor',
        'currentUnitItem',
        'resFile',
        'coordinates',
        'absoluteCoordinates',
        'imageRecognitionRate',
        'resFilesName'
      ]
    ),
    ...mapGetters(
      [
        'itemType',
        'isUxInput',
        'isPicInput',
        'isOutputPicture',
        'isOutputFile',
        'isJobResourcePicture',
        'isJobResourceFile',
        'isInputFile',
        'isInputPicture',
        'currentUnitItemMeaning'
      ]
    ),
    isDuplicateName: {
      get () {
        return this.$store.state.isDuplicateName
      },
      set (val) {
        this.$store.commit('handleIsDuplicateName', val)
      }
    },
    showInput () {
      return !(
        this.isInputPicture ||
        this.isJobResourceFile ||
        this.isJobResourcePicture
      )
    },
    showAutoComplete () {
      return !(
        this.isInputFile ||
        this.isJobResourceFile ||
        this.isJobResourcePicture ||
        this.isPicInput ||
        this.isUxInput ||
        this.isOutputFile ||
        this.isOutputPicture
      )
    },
    showScreenShot () {
      return this.isJobResourcePicture || this.isPicInput
    },
    showCheckbox () {
      return this.isOutputPicture
    }
  },
  watch: {
    currentUnitItem (val) {
      this.tmachBlanks = this.tmachBlanksPrefixLessen(val.itemContent.content.match(/Tmach.*? /g))
    },
    absoluteCoordinates (val) {
      if (this.isPicInput) {
        this.tmachBlanks.splice(0, 1, val.x)
        this.tmachBlanks.splice(1, 1, val.y)
      }
    }
  },
  methods: {
    tmachBlanksPrefixLessen (tmachBlanks) {
      tmachBlanks.forEach((tmach, index, arr) => { // 去掉前缀 Tmach
        arr[index] = tmach.trim().substring(5)
      })
      if (this.isOutputPicture || this.isOutputFile) {
        let commandOfSaveToFinal = '<copy2rdsDatPath>'
        for (let i = 0; i < tmachBlanks.length; i++) {
          if (tmachBlanks[i].includes(commandOfSaveToFinal)) this.saveToFinalResult = true
          // tmachBlanks[i] = suffixAutoRemove(this.tmachBlanks[i])
        }
      }
      return tmachBlanks
    },
    saveFeaturePoint () {
      if (this.isJobResourceFile && this.coordinates.length) {
        if (!this.tmachBlanks[0]) {
          this.$Message.error({
            background: true,
            content: '请为配置文件命名'
          })
          return false
        }
        let coordinateNum = 1
        let coordinateDataList = {}
        coordinateDataList.threshold = this.imageRecognitionRate
        for (let i = 0; i < this.coordinates.length; i++) {
          let area = 'area' + coordinateNum++
          let coordinateRowList = this.coordinates[i].coordinate_a.split(',').concat(this.coordinates[i].coordinate_b.split(',')).map(parseFloat)
          coordinateDataList[area] = coordinateRowList
        }
        this.$store.commit('addResFile', {
          name: suffixAutoRemove(this.tmachBlanks[0]) + '.json',
          type: 'json',
          file: JSON.stringify(coordinateDataList, null, 4),
          fileUrl: ''
        })
        this.$store.commit('clearCoordinate')
      }
      return true
    },
    tmachBlankSuffixComplete () {
      if (this.isOutputPicture || this.isInputPicture || this.isJobResourcePicture) {
        let commandOfSaveToFinal = '<copy2rdsDatPath>'
        for (let i = 0; i < this.tmachBlanks.length; i++) {
          if (this.tmachBlanks[i].length === 0) continue
          this.tmachBlanks[i] = suffixAutoComplete(this.tmachBlanks[i], '.png')
          if (this.saveToFinalResult) {
            this.tmachBlanks[i] += commandOfSaveToFinal
          }
        }
      }
      if (this.isOutputFile || this.isInputFile) {
        for (let i = 0; i < this.tmachBlanks.length; i++) {
          if (this.tmachBlanks[i].length === 0) continue
          this.tmachBlanks[i] = suffixAutoComplete(this.tmachBlanks[i], '.txt')
        }
      }
      if (this.isJobResourceFile) {
        for (let i = 0; i < this.tmachBlanks.length; i++) {
          if (this.tmachBlanks[i].length === 0) continue
          this.tmachBlanks[i] = suffixAutoComplete(this.tmachBlanks[i], '.json')
        }
      }
    },
    updateCurrentUnitItemData () {
      let currentUnitItem = JSON.parse(JSON.stringify(this.currentUnitItem))
      let tmachBlanks = currentUnitItem.itemContent.content.match(/Tmach.*? /g)
      for (let i = 0; i < tmachBlanks.length; i++) {
        currentUnitItem.itemContent.content = currentUnitItem.itemContent.content.replace(tmachBlanks[i], 'Tmach' + this.tmachBlanks[i] + ' ')
      }
      this.$store.commit('saveUnitItem', currentUnitItem)
    },
    closeItemEditor () {
      if (!this.isPicInput) {
        this.$store.commit('handleShowItemEditor', false)
      }
    },
    saveResFilesName () {
      if (this.isOutputPicture && (this.tmachBlanks[0] === undefined || this.tmachBlanks[0] === '')) {
        this.$Message.error({
          content: '名字不能为空',
          background: true
        })
        return false
      }

      let index
      if (this.isOutputFile) index = 0
      else if (this.isOutputPicture) index = 1
      else return true
      let outputFilesName = this.resFilesName[index].children
      for (let i = 0; i < outputFilesName.length; i++) {
        if (suffixAutoRemove(this.tmachBlanks[0]) === outputFilesName[i]) {
          this.$Message.error({
            content: '这个名字已经被占用了',
            background: true
          })
          return false
        }
      }
      this.$store.commit('handleResFilesName', {
        name: suffixAutoRemove(this.tmachBlanks[0]),
        index
      })
      return true
    },
    saveItem () {
      if (!this.saveResFilesName()) return
      if (!this.saveFeaturePoint()) return
      this.tmachBlankSuffixComplete() // 补全后缀
      this.updateCurrentUnitItemData()
      this.closeItemEditor()
    },
    setName (name) {
      this.tmachBlanks.splice(0, 1, name)
    },
    overwrite () {
      this.$store.commit('overwriteDuplicateFile')
    },
    rename () {
      this.showRename = true
    },
    setNewName () {
      this.$store.commit('renameDuplicateFile', this.tmachBlanks[0])
      this.showRename = false
      this.saveItem()
    }
  }
}
</script>

<style lang="less" scoped>
  .item-editor-empty {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 755px;
    .empty {
      padding: 40px;
      border: 1px dashed #dddddd;
      border-radius: 6px;
      background-color: rgba(0, 0, 0, 0.3);
      color: white;
    }
  }
  .item-editor {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 755px;
    .mb-1 {
      margin-bottom: 10px;
    }
    .auto-complete-title {
      padding: 0 10px;
      font-weight: bold;
    }
    .btn-confirm {
      text-align: center;
    }
    .instructions {
      clear: both;
    }
  }
</style>
