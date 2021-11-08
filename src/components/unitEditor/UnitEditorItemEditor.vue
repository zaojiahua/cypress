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
      /*
        tmachBlanks 数据结构:
        [{ content: xxx, suffix: xxx }, ...]
        解析execCmdDict/execCmdList内元素content字段的"Tmach "或"Tmachxxxxx "(注意最后一位是空格)的内容, "xxxxx"部分去掉后缀后填入content, 后缀填入suffix部分
      */
      tmachIndex: 0,
      saving: false, // 为true时显示加载动画
      gallery: false // 是否打开画廊 (Gallery组件, 用于选取一张图片并展示/编辑)
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
    ...mapGetters('item', ['itemType', 'itemName', 'isPicInput', 'isOutputPicture', 'isOutputFile', 'isJobResourceFile', 'curItemMeaning', 'isJobResourcePicture','isInputPicture','isAllowNull']),
    showInput () { // 如果CONST.SHOW_INPUT这一Set中包含该itemType(即execCmdDict/execCmdList内子元素的type字段), 则显示Input组件
      return CONST.SHOW_INPUT.has(this.itemType)
    },
    showAutoComplete () { // 同上, 是否显示AutoComplete组件
      return CONST.SHOW_AUTO_COMPLETE.has(this.itemType)
    },
    showScreenShot () { // 同上, 是否显示截图功能组件
      return CONST.SHOW_SCREEN_SHOOT.has(this.itemType)
    },
    showFeaturePoint () { // 同上, 是否显示特征点选取组件
      return CONST.SHOW_FEATURE_POINT.has(this.itemType)
    },
    willTouchFile () { // 同上, 是否会产生保存选取信息的依赖文件
      return CONST.WILL_TOUCH_FILE.has(this.itemType)
    },
    showCheckbox () { // 目前只有outputPicture这一type需要该功能, 后期扩展可同上处理
      return this.isOutputPicture
    },
    picUrl () { // 返回png文件组成的数组
      return this.resFiles.filter((val) => { return val.type === 'png' })
    },
    loc () { // 当前编辑中的unitItem的位置, eg: -2_-4_inputImgFile / -3_-5_4
      return [this.normalKey, this.unitKey, this.itemName].join('_')
    }
  },
  watch: {
    itemData (val) { // unitItem用到的数据变化时, 更新this.tmachBlanks
      if (!val || !val.itemContent.content) return
      this.handleTmachBlanks(val.itemContent.content.match(/Tmach.*? /g))
    },
    saveToFinalResult (val) { // 该字段变化时
      if (!(this.isOutputPicture || this.isOutputFile)) return
      let suffix = '<copy2rdsDatPath>'
      if (val) { // 值为true, 将后缀'<copy2rdsDatPath>'添加到用户输入内容尾部
        this.tmachBlanks.forEach((item, idx, arr) => {
          if (!item.suffix.endsWith(suffix)) {
            arr[idx].suffix += suffix
          }
        })
      } else { // 值为false, 去掉后缀'<copy2rdsDatPath>'
        this.tmachBlanks.forEach((item, idx, arr) => {
          arr[idx].suffix = arr[idx].suffix.replace(suffix, '')
        })
      }
    },
    absCoordinates (val) { // 选点/选区绝对值
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
    curFile (val) { // 当前显示的图片变化时
      if (!val || !this.tmachBlanks[0]) return
      if (this.isJobResourcePicture) { // 如果unitItem的type为jobResourcePicture
        this.tmachBlanks[0].content = suffixRemove(val.name) // 将文件的名字填入第一个空里
      }
    }
  },
  methods: {
    handleTmachBlanks (rawData) { // 传入原始数组, 返回修改后的tmach数组
      let child = '<copy2rdsDatPath>'
      let suffix = this.saveToFinalResult ? child : '' // 如果要保存到最终结果, 后缀需要添加宏命令'<copy2rdsDatPath>'
      for (let key in CONST.FILL) {
        if (CONST.FILL[key].has(this.itemType)) {
          suffix = `.${key.toLowerCase()}${suffix}`
          break
        }
      }
      this.tmachBlanks = rawData.map(item => {
        item = item.trim().substring(5)
        if (suffix) {
          item = item.split('.').shift()
        }
        return {
          content: this.isJobResourceFile ? this.loc : item,
          suffix
        }
      })
    },
    handleCurFile () {
      if (this.curFile) { // 如果当前展示的图片不为空
        let options
        if (this.curFile.dirty) { // 如果该图片之前已经存在
          options = { action: 'clearCurFile' } // 将当前文件置空
        } else { // 该图片是新截取的
          options = { action: 'addCurFile' } // 将该图片添加到依赖文件列表中
        }
        this.$store.commit('files/handleCurFile', options)
      }
    },
    saveFeaturePoint () { // 保存选取的区域信息
      if (this.willTouchFile && this.coordinates.length !== 0) { // 如果会产生关于选区信息的依赖文件且选区信息不为空
        let nameInfo = this.tmachBlanks[0]
        let coordinateNum = 1
        let coordinateDataList = {} // 存放选区信息
        coordinateDataList.threshold = this.imgRecRate // 图片识别率
        for (let i = 0; i < this.coordinates.length; i++) {
          let area = 'area' + coordinateNum++
          let coordinateRowList = this.coordinates[i].coordinate_a.split(',').concat(this.coordinates[i].coordinate_b.split(',')).map(parseFloat)
          coordinateDataList[area] = coordinateRowList
        }
        // 查看是否存在同名文件, 有则覆盖
        let index = -1
        for (let i = 0; i < this.resFilesName.length; i++) {
          if (this.resFilesName[i] ===`${nameInfo.content}${nameInfo.suffix}`) {
            index = i
            break
          }
        }
        this.$store.commit('files/handleResFiles', { // 将选区信息依赖文件保存下来
          action: 'addResFile',
          data: {
            dirty: true, // 标识是否是新获得的图片,可以用于告知文件是否有被更动或新增
            index: index,
            name: `${nameInfo.content}${nameInfo.suffix}`,
            file: JSON.stringify(coordinateDataList, null, 4),
            type: 'json'
          }
        })
        this.$store.commit('img/handleCoordinate', { action: 'clear' }) // 清除选区信息
      }
    },
    handleUnitData () { // 保存更新后的unitData
      this.tmachBlanks.forEach(item=>{
        item.content = item.content.replace(/ /g,"")
      })
      let flag = true
      if (this.curFile && this.isJobResourcePicture) { // 如果当前显示的图片不为空且itemType为jobResourcePicture
        this.tmachBlanks[0].content = suffixRemove(this.curFile.name) // 将当前图片的名字去掉后缀后保存
      }
      // 检查是否存在空值
      for (let i = 0; i < this.tmachBlanks.length; i++) {
        if (!this.tmachBlanks[i].content.trim()) flag = false
        break
      }
      // if(this.isAllowNull&&this.isInputPicture) {
      //   //inputPicture 部分允许填入空值
      // }else {
      //   if (!flag) { //  存在则报错并终止
      //     this.$Message.error({
      //       background: true,
      //       content: '不允许填入空值'
      //     })
      //     return flag
      //   }
      // }
      if (!flag&&(!this.isAllowNull||!this.isInputPicture)) { //  存在则报错并终止
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
        if(this.isAllowNull&&this.isInputPicture&&!this.tmachBlanks[i].content.trim()){
          target = 'Tmach '
        }else {
          target = `Tmach${this.tmachBlanks[i].content.trim()}${this.tmachBlanks[i].suffix} `
        }
        temp.splice(curIndex, tmachBlanks[i].length, target)
        curIndex += target.length
        itemData.itemContent.content = temp.join('')
      }
      if (this.showScreenShot && this.curFile) { // 如果要显示截图工具且当前图片不为空, 将图片名称保存在itemData的pic字段中
        itemData.itemContent.pic = this.curFile.name
      }
      if (this.showFeaturePoint) { // 如果要显示选区/选点工具, 将配置文件的名称保存在itemData的area字段中
        itemData.itemContent.area = `${this.loc}.json`
      }
      this.$store.commit('item/handleItemData', { // 设置当前的itemData
        action: 'setItemData',
        data: itemData
      })
      this.$store.commit('unit/handleUnitData', { // 将当前itemData同步更新到其父元素unitData中
        action: 'setItemData',
        data: itemData
      })
      return true
    },
    handleShowItemEditor () {
      if (!this.isPicInput) {
        this.$store.commit('item/handleShowItemEditor', false) // 关闭itemEditor
      }
    },
    handleByProductsName () {
      if (CONST.WILL_TOUCH_NAME[this.itemType]) { // 如果该类型的itemType会生成一个name, 例如 截图保存 这个unit
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
          loc: this.loc,
          text: this.tmachBlanks[0].content.trim(),
          user: []
        }
        let childIdx = -1
        let textList = []
        temp.forEach(item=>{
          textList.push(item.text)
        })
        for (let i = 0; i < temp.length; i++) {
          if (temp[i].loc !== byProductsInfo.loc && temp[i].text === byProductsInfo.text) {
            this.$Message.error({
              background: true,
              content: '这个名字已经被占用了'
            })
            return false
          }
          if(temp[i].loc === byProductsInfo.loc ){  //说明改的是当前已有的图片名称
            console.log(temp[i])
            //先吧当前的名称在list中去除，留下除自身名称的其他名称列表做对比
            // 防止不修改直接点保存会 出错
            textList.splice(textList.indexOf(temp[i].text),1)
            if(textList.indexOf(byProductsInfo.text)!==-1){
              this.$Message.error({
                background: true,
                content: '这个名字已经被占用了'
              })
              return false
            }
            if (textList.indexOf(byProductsInfo.text)===-1) {
              childIdx = i
              break
            }
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
      if (!this.handleByProductsName()) return
      if (!this.handleUnitData()) return
      if (this.isJobResourceFile){
        if (this.willTouchFile && this.coordinates.length !== 0) {
          this.saveFeaturePoint()
        }
        else{
          this.saveFeaturePoint()
          this.$Message.info("注意是否需要选择区域！")
          return
        }
      }else{
        this.saveFeaturePoint()
      }
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
    setName (name) { // 截图时将图片名称保存下来
      if (this.showScreenShot) return
      this.tmachBlanks[0].content = name.split('.').shift()
    },
    getPic (val) { // 将在画廊中选取的图片展示出来
      this.$store.commit('files/handleCurFile', {
        action: 'setCurFile',
        data: val
      })
      if (this.showScreenShot && !(this.showInput || this.showAutoComplete)) { // 如果要显示截图工具, 且不展示Input组件和AutoComplete组件, 将该图片名称填入tmachBlanks相应位置
        this.setName(suffixRemove(val.name))
      }
    },
    closeGallery (val) { // 关闭画廊
      this.gallery = val
    },
    deleteByProductsName (pIdx, sIdx) { // 删除不需要的运行过程中截取的图片的名称
      // let loc = this.byProductsName[pIdx].children[sIdx].loc.split('*')
      // console.log(loc)
      this.$store.commit('job/handleConfig', {
        action: 'deleteByProductsName',
        data: { pIdx, sIdx }
      })
    },
    handleByProductsNameUser (pIdx, sIdx) { // 记录哪些位置用到了运行过程中截取的图片的名称
      this.$store.commit('job/handleConfig', {
        action: 'setByProductsNameUser',
        data: {
          pIdx,
          sIdx,
          user: this.loc
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
