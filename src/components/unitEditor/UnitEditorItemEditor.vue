<template>
  <Card class="item-editor-container">
    <!-- title -->
    <div slot="title">Item Editor</div>
    <!-- extra -->
    <Button
      slot="extra"
      size="small"
      v-show="this.picUrl.length !== 0"
      @click="gallery = !gallery"
    >选取图片</Button>
    <!-- body -->
    <div v-show="!editing" class="item-not-editing">
      <p>选择一个 ITEM 开始编辑吧</p>
    </div>
    <div v-show="editing" class="item-editing">
      <div>
        <div v-if="showInput">
          <Input
            v-for="(blank, index) in tmachBlanks"
            :key="index"
            v-model="tmachBlanks[index].content"
            clearable
          />
        </div>
        <div v-if="showAutoComplete">
          <AutoComplete
            v-for="(blank, index) in tmachBlanks"
            :key="index"
            v-model="tmachBlanks[index].content"
            clearable
          >
            <div v-for="(namesData, pIdx) in byProductsName" :key="namesData.title">
              <div class="auto-complete-title">
                <span>{{ namesData.title }}</span>
              </div>
              <Option
                class="auto-item"
                v-for="(nameData, sIdx) in namesData.children"
                :key="nameData.loc"
                :value="nameData.text || nameData"
                @click.native="handleByProductsNameUser(pIdx, sIdx)"
              >
                <span>{{ nameData.text || nameData }}</span>
                <span @click.stop="deleteByProductsName(pIdx, sIdx)">&times;</span>
              </Option>
            </div>
          </AutoComplete>
        </div>
        <ScreenShot
          v-if="showScreenShot"
          ref="screenShot"
          @handleImgName="setName"
        ></ScreenShot>
        <FeaturePoint
          v-if="showFeaturePoint"
        ></FeaturePoint>
        <Checkbox v-model="$store.state.item.saveToFinalResult" v-if="showCheckbox" style="float: right;">添加此图片至最终结果</Checkbox>
        <p class="instructions"><Tag>操作说明</Tag>{{ curItemMeaning }}</p>
      </div>
      <div>
        <Button type="primary" @click="saveItemData" :loading="saving">
          <span v-if="!saving">确定</span>
          <span v-else>saving...</span>
        </Button>
      </div>
    </div>
    <Gallery mode="vertical" :picUrl="picUrl" @getPic="getPic" @close="closeGallery" :open="gallery"></Gallery>
  </Card>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { suffixRemove } from 'lib/tools.js'
import ScreenShot from './UnitEditorScreenShot'
import FeaturePoint from './UnitEditorFeaturePoint'
import CONST from 'constant/constant'
import Gallery from '_c/common/Gallery.vue'

export default {
  name: 'ItemEditor',
  components: { ScreenShot, FeaturePoint, Gallery },
  data () {
    return {
      tmachBlanks: [],
      tmachIndex: 0,
      saving: false,
      gallery: false
    }
  },
  computed: {
    ...mapState('job', ['config']),
    ...mapGetters('job', ['normalKey', 'byProductsName']),
    ...mapState('files', ['resFiles', 'curFile']),
    ...mapGetters('files', ['resFilesName']),
    ...mapState('unit', ['unitData']),
    ...mapGetters('unit', ['unitKey']),
    ...mapState('item', ['editing', 'itemData', 'saveToFinalResult']),
    ...mapState('img', ['imgRecRate', 'coordinates', 'absCoordinates']),
    ...mapGetters('item', ['itemType', 'itemName', 'isPicInput', 'isOutputPicture', 'isOutputFile', 'isJobResourceFile', 'curItemMeaning', 'isJobResourcePicture']),
    showInput () {
      return CONST.SHOW_INPUT.has(this.itemType)
    },
    showAutoComplete () {
      return CONST.SHOW_AUTO_COMPLETE.has(this.itemType)
    },
    showScreenShot () {
      return CONST.SHOW_SCREEN_SHOOT.has(this.itemType)
    },
    showFeaturePoint () {
      return CONST.SHOW_FEATURE_POINT.has(this.itemType)
      // isJobResourceFile
    },
    showCheckbox () {
      return this.isOutputPicture
    },
    willTouchFile () {
      return CONST.WILL_TOUCH_FILE.has(this.itemType)
    },
    picUrl () {
      return this.resFiles.filter((val) => { return val.type === 'png' })
    },
    loc () {
      return [this.normalKey, this.unitKey, this.itemName].join('_')
    }
  },
  watch: {
    itemData (val) {
      if (!val.itemContent.content) return
      this.handleTmachBlanks(val.itemContent.content.match(/Tmach.*? /g))
    },
    saveToFinalResult (val) {
      if (!(this.isOutputPicture || this.isOutputFile)) return
      let suffix = '<copy2rdsDatPath>'
      if (val) {
        this.tmachBlanks.forEach((item, idx, arr) => {
          if (!item.suffix.endsWith(suffix)) {
            arr[idx].suffix += suffix
          }
        })
      } else {
        this.tmachBlanks.forEach((item, idx, arr) => {
          arr[idx].suffix = arr[idx].suffix.replace(suffix, '')
        })
      }
    },
    absCoordinates (val) {
      let { length } = this.tmachBlanks
      if (this.isPicInput) {
        if (this.tmachIndex + 2 > length) {
          this.tmachIndex = 0
        }
        this.tmachBlanks[this.tmachIndex].content = val.x
        this.tmachBlanks[this.tmachIndex + 1].content = val.y
        this.tmachIndex += 2
      }
    },
    curFile (val) {
      if (!val || !this.tmachBlanks[0]) return
      if (this.isJobResourcePicture) {
        this.tmachBlanks[0].content = suffixRemove(val.name)
      }
    }
  },
  methods: {
    handleTmachBlanks (rawData) {
      let child = '<copy2rdsDatPath>'
      let suffix = this.saveToFinalResult ? child : ''
      for (let key in CONST.FILL) {
        if (CONST.FILL[key].has(this.itemType)) {
          suffix = `.${key.toLowerCase()}${suffix}`
        }
      }
      this.tmachBlanks = rawData.map(item => {
        item = item.trim().substring(5)
        if (suffix) {
          item = item.split('.').shift()
        }
        return {
          content: this.isJobResourceFile ? [this.normalKey, this.unitKey, this.itemName].join('_') : item,
          suffix
        }
      })
    },
    handleCurFile () {
      if (this.curFile) {
        let options
        if (this.curFile.dirty) {
          options = { action: 'clearCurFile' }
        } else {
          options = { action: 'addCurFile' }
        }
        this.$store.commit('files/handleCurFile', options)
      }
    },
    saveFeaturePoint () { // 保存选取的区域信息
      if (this.willTouchFile && this.coordinates.length) {
        let nameInfo = this.tmachBlanks[0]
        if (!nameInfo.content) {
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
        // 找到同样前缀文件的位置
        let index = -1
        for (let i = 0; i < this.resFilesName.length; i++) {
          if (this.resFilesName[i].startsWith(nameInfo.content)) {
            index = i
            break
          }
        }
        this.$store.commit('files/handleResFiles', {
          action: 'addResFile',
          data: {
            dirty: true,
            index: index === -1 ? this.resFilesName.length : index,
            name: `${nameInfo.content}${nameInfo.suffix}`,
            file: JSON.stringify(coordinateDataList, null, 4),
            type: 'json'
          }
        })
        this.$store.commit('img/handleCoordinate', { action: 'clear' })
      }
      return true
    },
    handleUnitData () { // 保存更新后的unitData
      let flag = true
      if (this.curFile && this.isJobResourcePicture) {
        this.tmachBlanks[0].content = suffixRemove(this.curFile.name)
      }
      // 检查是否存在空值
      for (let i = 0; i < this.tmachBlanks.length; i++) {
        if (!this.tmachBlanks[i].content.trim()) flag = false
        break
      }
      if (!flag) {
        this.$Message.error({
          background: true,
          content: '不允许填入空值'
        })
        return flag
      }
      // 保存修改后的itemData以及unitData
      let itemData = this._.cloneDeep(this.itemData)
      let tmachBlanks = itemData.itemContent.content.match(/Tmach.*? /g)
      let curIndex = 0
      let temp
      for (let i = 0; i < tmachBlanks.length; i++) { // 将用户输入的值插入
        curIndex = itemData.itemContent.content.indexOf(tmachBlanks[i], curIndex)
        temp = itemData.itemContent.content.split('')
        let target
        target = `Tmach${this.tmachBlanks[i].content}${this.tmachBlanks[i].suffix} `
        temp.splice(curIndex, tmachBlanks[i].length, target)
        curIndex += target.length
        itemData.itemContent.content = temp.join('')
      }
      if (this.showScreenShot && this.curFile) {
        itemData.itemContent.pic = this.curFile.name
      }
      if (this.showFeaturePoint) {
        itemData.itemContent.area = `${this.loc}.json`
      }
      this.$store.commit('item/handleItemData', {
        action: 'setItemData',
        data: itemData
      })
      this.$store.commit('unit/handleUnitData', {
        action: 'setItemData',
        data: itemData
      })
      return flag
    },
    handleShowItemEditor () {
      if (!this.isPicInput) {
        this.$store.commit('item/handleShowItemEditor', false)
      }
    },
    handleByProductsName () {
      if (CONST.WILL_TOUCH_NAME[this.itemType]) {
        let { byProductsName } = this.config
        let temp
        let tempIdx
        for (let i = 0; i < byProductsName.length; i++) {
          if (byProductsName[i].key === this.itemType) {
            temp = this.config.byProductsName[i].children
            tempIdx = i
            break
          }
        }
        let byProductsInfo = {
          loc: [this.normalKey, this.unitKey, this.itemName].join('_'),
          text: this.tmachBlanks[0].content,
          user: []
        }
        let childIdx = -1
        for (let i = 0; i < temp.length; i++) {
          if (temp[i].loc !== byProductsInfo.loc && temp[i].text === byProductsInfo.text) {
            this.$Message.error({
              background: true,
              content: '这个名字已经被占用了'
            })
            return false
          }
          if (temp[i].loc === byProductsInfo.loc) {
            childIdx = i
            break
          }
        }
        this.$store.commit('job/handleConfig', {
          action: 'addByProductsName',
          data: {
            type: tempIdx,
            index: childIdx,
            data: byProductsInfo
          }
        })
      }
      return true
    },
    saveItemData () {
      if (!this.handleUnitData()) return
      if (!this.handleByProductsName()) return
      if (!this.saveFeaturePoint()) return
      this.$store.commit('item/handleItemData', {
        action: 'setItemData',
        data: {
          itemName: '',
          itemIndex: undefined,
          itemContent: ''
        }
      })
      this.saving = true
      setTimeout(() => {
        this.saving = false
      }, 200)
      this.handleCurFile()
      this.handleShowItemEditor()
      this.tmachIndex = 0
    },
    setName (name) {
      if (this.showScreenShot) return
      this.tmachBlanks[0].content = name.split('.').shift()
    },
    getPic (val) {
      this.$store.commit('files/handleCurFile', {
        action: 'setCurFile',
        data: val
      })
      if (this.showScreenShot && !(this.showInput || this.showAutoComplete)) {
        this.setName(suffixRemove(val.name))
      }
    },
    closeGallery (val) {
      this.gallery = val
    },
    deleteByProductsName (pIdx, sIdx) {
      // let loc = this.byProductsName[pIdx].children[sIdx].loc.split('*')
      // console.log(loc)
      this.$store.commit('job/handleConfig', {
        action: 'deleteByProductsName',
        data: { pIdx, sIdx }
      })
    },
    handleByProductsNameUser (pIdx, sIdx) {
      console.log(pIdx, sIdx)
      this.$store.commit('job/handleConfig', {
        action: 'setByProductsNameUser',
        data: {
          pIdx,
          sIdx,
          user: [this.normalKey, this.unitKey, this.itemName].join('_')
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .item-editor-container {
    height: 100%;
    /deep/ .ivu-card-extra {
      top: 10px;
    }
    /deep/ .ivu-card-body {
      height: calc(100% - 44px);
    }
    .item-not-editing {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      p {
        padding: 40px;
        border: 1px dashed #dddddd;
        border-radius: 6px;
        background-color: rgba(0, 0, 0, 0.3);
        color: white;
      }
    }
    .item-editing {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
      & > div:first-child {
        margin-bottom: 1em;
        & > * {
          margin-bottom: 1em;
        }
        & > div:first-child {
          & > * {
            margin-bottom: 1em;
          }
          & > div:last-child {
            margin-bottom: 0;
          }
        }
        & + div {
          display: flex;
          justify-content: center;
        }
      }
      .auto-complete-title {
        padding: 0 10px;
        font-weight: bold;
      }
      .auto-item {
        display: flex;
        justify-content: space-between;
        & > span:last-child {
          padding: .02em .3em;
          border-radius: 50%;
          &:hover {
            background: skyblue;
          }
        }
      }
    }
  }
</style>
