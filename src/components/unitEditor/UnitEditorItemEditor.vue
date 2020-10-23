<template>
  <Card class="item-editor-container">
    <!-- title -->
    <div slot="title">Item Editor &nbsp; {{ titleInfo }}</div>
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
        {{tmachBlanks}}
        <div v-if="showInput">
          <Input
            v-for="(blank, index) in tmachBlanks"
            :key="index"
            v-model="tmachBlanks[index].main"
            clearable
          />
        </div>
        <div v-if="showAutoComplete">
          <AutoComplete
            v-for="(blank, index) in tmachBlanks"
            :key="index"
            v-model="tmachBlanks[index].main"
            clearable
          >
            <!-- <div v-for="names in resFilesName" :key="names.title">
              <div class="auto-complete-title">
                <span>{{ names.title }}</span>
              </div>
              <Option v-for="name in names.children" :key="name" :value="name"></Option>
            </div> -->
          </AutoComplete>
        </div>
        <ScreenShot
          v-if="showScreenShot"
          :imgName="imgName"
          @setImgName="setName"
        ></ScreenShot>
        <FeaturePoint
          v-if="isJobResourceFile"
          :areaFileName="areaFileName"
          @handleAreaFileName="setName"
        ></FeaturePoint>
        <Checkbox v-model="$store.state.item.saveToFinalResult" v-if="showCheckbox" style="float: right;">添加此图片至最终结果</Checkbox>
        <p class="instructions"><Tag>操作说明</Tag>{{ curItemMeaning }}</p>
        {{itemData}}
      </div>
      <div>
        <Button type="primary" size="small" long @click="saveItemData" :loading="saving">
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
      tmachBlanks: [{ main: 0 }],
      tmachIndex: 0,
      preFileName: null,
      saving: false,
      gallery: false
    }
  },
  computed: {
    ...mapState('job', ['normalKey', 'config']),
    ...mapState('files', ['resFiles', 'curFile']),
    ...mapGetters('files', ['resFilesName']),
    ...mapState('unit', ['unitData']),
    ...mapGetters('unit', ['unitKey']),
    ...mapState('item', ['editing', 'itemData', 'saveToFinalResult']),
    ...mapState('img', ['imgRecRate', 'coordinates', 'absoulteCoordinates']),
    ...mapGetters('item', ['itemType', 'itemName', 'isPicInput', 'isOutputPicture', 'isOutputFile', 'isJobResourceFile', 'curItemMeaning']),
    titleInfo () {
      if (this.itemData.itemIndex !== undefined) {
        return `(当前Item: ${this.itemData.itemIndex + 1})`
      }
      return ''
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
    },
    picUrl () {
      return this.resFiles.filter((val) => { return val.type === 'png' })
    },
    areaFileName () {
      if (!this.tmachBlanks[0].main) {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.tmachBlanks[0].main = 'config_file'
      }
      return this.tmachBlanks[0]
    },
    imgName () {
      return this.showInput ? {} : this.tmachBlanks[0]
    }
  },
  watch: {
    itemData (val) {
      let child = '<copy2rdsDatPath>'
      if (!val.itemContent.content) return
      if (val.itemContent.content.includes(child) && (this.isOutputPicture || this.isOutputFile)) {
        this.$store.commit('item/handleSaveToFinal', true)
      } else {
        this.$store.commit('item/handleSaveToFinal', false)
      }
      this.handleTmachBlanks(val.itemContent.content.match(/Tmach.*? /g))
      // this.setPreFileName()
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
    handleTmachBlanks (rawData) {
      let child = '<copy2rdsDatPath>'
      let prefix = CONST.WILL_TOUCH_FILE.has(this.itemType) ? [this.normalKey, this.unitKey, this.itemName, ''].join('*') : ''
      let suffix = this.saveToFinalResult ? child : ''
      for (let key in CONST.FILL) {
        if (CONST.FILL[key].has(this.itemType)) {
          suffix = `.${key.toLowerCase()}${suffix}`
        }
      }
      let tmachBlanks = rawData.map(item => item.trim().substring(5))
      for (let i = 0; i < tmachBlanks.length; i++) {
        let slices = tmachBlanks[i].split('*')
        let lastSlice = slices.pop()
        let suffixIndex = lastSlice.lastIndexOf('.')
        tmachBlanks[i] = { prefix, suffix }
        if (suffixIndex !== -1) {
          tmachBlanks[i].main = lastSlice.substring(0, suffixIndex)
        } else {
          tmachBlanks[i].main = lastSlice
        }
      }
      this.tmachBlanks = tmachBlanks
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
        if (!nameInfo.main) {
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
          if (this.resFilesName[i].startsWith(nameInfo.prefix)) {
            index = i
            break
          }
        }
        this.$store.commit('files/handleResFiles', {
          action: 'addResFile',
          data: {
            dirty: true,
            index: index === -1 ? this.resFilesName.length : index,
            name: `${nameInfo.prefix}${nameInfo.main}${nameInfo.suffix}`,
            file: JSON.stringify(coordinateDataList, null, 4),
            type: 'json'
          }
        })
        this.$store.commit('img/clearCoordinates')
      }
      return true
    },
    handleUnitData () { // 保存更新后的unitData
      let flag = true
      for (let i = 0; i < this.tmachBlanks.length; i++) {
        if (!this.tmachBlanks[i].main.trim()) flag = false
        break
      }
      if (!flag) {
        this.$Message.error({
          background: true,
          content: '不允许填入空值'
        })
        return flag
      }
      let itemData = this._.cloneDeep(this.itemData)
      let tmachBlanks = itemData.itemContent.content.match(/Tmach.*? /g)
      let curIndex = 0
      let temp
      for (let i = 0; i < tmachBlanks.length; i++) {
        curIndex = itemData.itemContent.content.indexOf(tmachBlanks[i], curIndex)
        temp = itemData.itemContent.content.split('')
        let target
        let tepTmach = this.tmachBlanks[i]
        if (tepTmach.main.split('*').length > 1) {
          target = `Tmach${tepTmach.main}${tepTmach.suffix} `
        } else {
          target = `Tmach${tepTmach.prefix}${tepTmach.main}${tepTmach.suffix} `
        }
        temp.splice(curIndex, tmachBlanks[i].length, target)
        curIndex += target.length
        itemData.itemContent.content = temp.join('')
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
          if (suffixRemove(this.tmachBlanks[0]) === outputFilesName[i]) {
            this.$Message.error({
              content: '这个名字已经被占用了',
              background: true
            })
            return false
          }
        }
        this.$store.commit('files/addResFilesName', {
          name: suffixRemove(this.tmachBlanks[0]),
          index
        })
      }
      return true
    },
    saveItemData () {
      // if (!this.saveResFilesName()) return
      if (!this.saveFeaturePoint()) return
      if (!this.handleUnitData()) return
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
      // let resFilesInfo = this._.cloneDeep(this.config.resFilesInfo)
      // let key = [this.normalKey, this.unitKey, this.itemData.itemName].join('*')
      // resFilesInfo[key] = `${key}*${name}`
      // this.$store.commit('job/setConfig', { resFilesInfo })
      // console.log(resFilesInfo)
      this.tmachBlanks[0].main = name
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
    }
  }
}
</script>

<style lang="less" scoped>
  @import '../../css/common.less';
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
    }
  }
</style>
