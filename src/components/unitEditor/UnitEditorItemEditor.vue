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
            clearable
          >
          </Input>
        </div>
        <div v-if="showAutoComplete">
          <AutoComplete
            v-for="(blank, index) in tmachBlanks"
            :key="index"
            v-model="tmachBlanks[index]"
            class="mb-1"
            clearable
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
          :featurePointFileName="tmachBlanks[0] || randomJSONFileName()"
          @setFeaturePointFileName="setName"
        ></FeaturePoint>
        <Checkbox v-model="saveToFinalResult" v-if="showCheckbox" style="float: right;">添加此图片至最终结果</Checkbox>
        <p class="instructions"><Tag>操作说明</Tag>{{ currentItemMeaning }}</p>
      </div>
      <div class="btn-confirm">
        <Button type="primary" @click="saveItem" :loading="saving">
          <span v-if="!saving">确定</span>
          <span v-else>saving...</span>
        </Button>
      </div>
    </div>
    <Modal v-model="isDuplicatedFile" :styles="{top: '48%'}" :mask-closable="false"  :closable="false">
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
      <Input v-model="tmachBlanks[0]" clearable />
      <div slot="footer">
        <!-- <Button type="info" @click="checkDuplicateName">检测名称是否可用</Button> -->
        <Button type="success" @click="setNewName">确定</Button>
      </div>
    </Modal>
  </Card>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { suffixComplete, suffixAutoRemove } from 'lib/tools.js'
import ScreenShot from './UnitEditorScreenShot'
import FeaturePoint from './UnitEditorFeaturePoint'
import CONST from 'constant/constant'

export default {
  name: 'ItemEditor',
  components: { ScreenShot, FeaturePoint },
  data () {
    return {
      tmachBlanks: [],
      tmachIndex: 0,
      saveToFinalResult: false,
      showRename: false,
      preFileName: null,
      saving: false
    }
  },
  computed: {
    ...mapState('files', [
      'resFiles',
      'resFilesName'
    ]),
    ...mapState('item', [
      'showItemEditor',
      'currentItem'
    ]),
    ...mapState('img', [
      'imgRecRate',
      'coordinates',
      'absoulteCoordinates'
    ]),
    ...mapGetters('item', [
      'itemType',
      'isPicInput',
      'isOutputPicture',
      'isOutputFile',
      'isJobResourceFile',
      'currentItemMeaning'
    ]),
    isDuplicatedFile: {
      get () {
        return this.$store.state.files.isDuplicatedFile
      },
      set (val) {
        this.$store.commit('files/setIsDuplicatedFile', val)
      }
    },
    showInput () {
      return !CONST.NOT_SHOW_INPUT.has(this.itemType)
    },
    showAutoComplete () {
      return !CONST.NOT_SHOW_AUTO_COMPLETE.has(this.itemType)
    },
    showScreenShot () {
      return CONST.SHOW_SCREEN_SHOOT.has(this.itemType)
    },
    showCheckbox () {
      return this.isOutputPicture
    },
    willTouchFile () {
      return CONST.WILL_TOUCH_FILE.has(this.itemType)
    }
  },
  watch: {
    currentItem (val) {
      this.tmachBlanks = this.tmachBlanksPrefixLessen(val.itemContent.content.match(/Tmach.*? /g))
      this.setPreFileName()
    },
    absoulteCoordinates (val) {
      let { length } = this.tmachBlanks
      if (this.isPicInput) {
        if (this.tmachIndex + 2 > length) {
          this.tmachIndex = 0
        }
        this.tmachBlanks.splice(this.tmachIndex, 1, val.x)
        this.tmachBlanks.splice(this.tmachIndex + 1, 1, val.y)
        this.tmachIndex += 2
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
      if (this.willTouchFile && this.coordinates.length) {
        if (!this.tmachBlanks[0]) {
          this.$Message.error({
            background: true,
            content: '请为配置文件命名'
          })
          return false
        }
        let coordinateNum = 1
        let coordinateDataList = {}
        coordinateDataList.threshold = this.imgRecRate
        for (let i = 0; i < this.coordinates.length; i++) {
          let area = 'area' + coordinateNum++
          let coordinateRowList = this.coordinates[i].coordinate_a.split(',').concat(this.coordinates[i].coordinate_b.split(',')).map(parseFloat)
          coordinateDataList[area] = coordinateRowList
        }
        this.$store.commit('files/addResFile', {
          name: suffixAutoRemove(this.tmachBlanks[0]) + '.json',
          type: 'json',
          file: JSON.stringify(coordinateDataList, null, 4),
          fileUrl: ''
        })
        this.$store.commit('img/clearCoordinates')
      }
      return true
    },
    tmachBlankSuffixComplete () {
      let commandOfSaveToFinal = '<copy2rdsDatPath>'
      for (let i = 0; i < this.tmachBlanks.length; i++) {
        if (this.tmachBlanks[i].length === 0) continue
        this.tmachBlanks[i] = suffixComplete(this.tmachBlanks[i], this.itemType)
        if (this.saveToFinalResult) {
          this.tmachBlanks[i] += commandOfSaveToFinal
        }
      }
    },
    updateCurrentUnitItemData () {
      let currentItem = this._.cloneDeep(this.currentItem)
      let tmachBlanks = currentItem.itemContent.content.match(/Tmach.*? /g)
      for (let i = 0; i < tmachBlanks.length; i++) {
        currentItem.itemContent.content = currentItem.itemContent.content.replace(tmachBlanks[i], 'Tmach' + this.tmachBlanks[i] + ' ')
      }
      this.$emit('updateUnitItem', currentItem)
    },
    closeItemEditor () {
      if (!this.isPicInput) {
        this.$store.commit('item/setShowItemEditor', false)
      }
    },
    saveResFilesName () {
      if (CONST.WILL_TOUCH_NAME[this.itemType]) {
        if (this.tmachBlanks[0] === undefined || this.tmachBlanks[0] === '') {
          this.$Message.error({
            content: '名字不能为空',
            background: true
          })
          return false
        }

        let index
        let outputFilesName
        for (let i = 0; i < this.resFilesName.length; i++) {
          if (this.resFilesName[i].key === this.itemType) {
            outputFilesName = this.resFilesName[i].children
            index = i
            break
          }
        }
        for (let i = 0; i < outputFilesName.length; i++) {
          if (suffixAutoRemove(this.tmachBlanks[0]) === outputFilesName[i]) {
            this.$Message.error({
              content: '这个名字已经被占用了',
              background: true
            })
            return false
          }
        }
        this.$store.commit('files/addResFilesName', {
          name: suffixAutoRemove(this.tmachBlanks[0]),
          index
        })
      }
      return true
    },
    saveItem () {
      if (!this.saveResFilesName()) return
      if (!this.saveFeaturePoint()) return
      this.saving = true
      this.tmachBlankSuffixComplete() // 补全后缀
      if (this.willTouchFile) {
        this.arrangeFileName(this.tmachBlanks[0])
      }
      this.updateCurrentUnitItemData()
      this.closeItemEditor()
      this.saveToFinalResult = false
      this.tmachIndex = 0
      setTimeout(() => {
        this.saving = false
      }, 200)
    },
    setName (name) {
      this.tmachBlanks.splice(0, 1, name)
    },
    overwrite () {
      this.$store.commit('files/setDuplicatedFile')
    },
    rename () {
      this.showRename = true
    },
    setNewName () {
      this.$store.commit('files/renameDuplicatedFile', this.tmachBlanks[0])
      this.showRename = false
      this.saveItem()
    },
    randomJSONFileName () {
      let fileName = `config_${Math.random().toString(16).slice(2, 6)}.json`
      this.tmachBlanks[0] = fileName
      return fileName
    },
    setPreFileName () {
      if (this.willTouchFile) {
        this.preFileName = this.tmachBlanks[0]
      } else {
        this.preFileName = null
      }
    },
    arrangeFileName (newFileName) {
      this.$emit('arrangeFileName', {
        oldName: this.preFileName,
        newName: newFileName
      })
      this.preFileName = null
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
