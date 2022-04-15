<template>
  <Modal
    class="unit-editor"
    fullscreen
    :closable="false"
    :mask-closable="false"
    v-model="curShowUnitEditor"
  >
    <div slot="header" class="header">
      <span>UNIT EDITOR</span>
      <div class="unit-name">
        <Tag class="unit-name-tag" color="green" size="large">UNIT NAME</Tag>
        <Input class="unit-name-input" v-model="unitName" clearable></Input>
      </div>
    </div>
    <div class="body">
<!--      这个是弹出的模态框，靠openTestResultModal属性控制打开，分左右两部分，按情况向slot插入需要的内容-->
      <TestResult :openTestResultModal="openTestResultModal" @closeTestModal="closeTestModal">
        <template #left>
          <div v-if="Object.keys(testOcrResponseData).length !== 0">
            <Divider>识别的图片</Divider>
            <img :src="testOcrResponseData.data.img_detected" alt="" style="max-width: 100%">
            <p> Tip：请确认识别的图片与你所选区相同，如果不同，请检查是否有保存选区</p>
          </div>
          <div v-else-if="Object.keys(testIconResponseData).length !== 0">
            <Divider>识别的图标</Divider>
            <img :src="testIconResponseData.icon" alt="" style="max-width: 100%;border: 1px">
            <p> Tip：请确认识别的图片与你所选区相同，如果不同，请检查是否有保存选区</p>
          </div>
        </template>
        <template #right>
          <div v-if="Object.keys(testOcrResponseData).length !== 0">
            <List border size="small">
              <Divider>识别的文字</Divider>
              <ListItem v-for="(words,index) in testOcrResponseData.result">{{ index + 1 }}: {{ words.text }}</ListItem>
            </List>
          </div>
          <div v-else-if="Object.keys(testIconResponseData).length !== 0">
            <Divider>识别的图片</Divider>
            <img :src="testIconResponseData.img_detected" alt="" style="max-width: 100% ;max-height:500px">
            <p> Tip：请确认识别的图片与你所选区相同，如果不同，请检查是否有保存选区</p>
          </div>

        </template>

      </TestResult>
      <div class="pane">
        <ItemList
          @updateUnitItem="updateUnitItem" ref="list"
        ></ItemList>
        <RawUnit></RawUnit>
      </div>
      <div class="pane">
        <ItemEditor
          @updateUnitItem="updateUnitItem"
          @on-change-unit-name="changeUnitName"
        ></ItemEditor>
      </div>
      <div class="pane">
        <Utils></Utils>
<!--        根据unit不同，显示不同内容的按钮，调用不同方法发给不同api-->
        <Button type="primary" v-show="hasIconTest" @click="sendIconTestRequest('icon_test')">测试图标</Button>
        <Button type="primary" v-show="hasIconPositionTest" @click="sendIconPositionTestRequest('icon_test_position')">测试图标位置</Button>
        <Button type="primary" v-show="hasOcrTest" @click="sendOcrTestRequest">测试文字</Button>
        <Button type="primary" v-show="hasIconPositionFixTest" @click="sendIconPositionTestRequest('icon_test_position_fixed')">测试图标位置</Button>
        <Button type="primary" v-show="hasIconTestFixTest" @click="sendIconTestRequest('icon_test_fixed')">测试图标</Button>
      </div>
    </div>
    <div slot="footer">
      <Button :disabled="isNotExecutable()" @click="singleStepDebug">
        <span v-if="!loading">执行</span>
        <span v-else>执行中...</span>
      </Button>
      <Button @click="closeUnitEditor(false)">取消</Button>
      <Button @click="closeUnitEditor(true)" type="primary">保存</Button>
    </div>
  </Modal>
</template>

<script>
import ItemList from './UnitEditorItemList'
import RawUnit from './UnitEditorRawUnit'
import ItemEditor from './UnitEditorItemEditor'
import Utils from './UnitEditorUtils'

import {findComponentsDownward} from 'lib/tools.js'

import {mapGetters, mapState} from 'vuex'
import CONST from "../../constant/constant";
import axios from "../../api";
import {baseURL, jobLibSvcURL} from "../../config";
import {dataURLtoFile} from "../../lib/tools";
import TestResult from "_c/unitEditor/TestResult";

export default {
  name: 'UnitEditor',
  components: {ItemList, RawUnit, ItemEditor, Utils, TestResult},
  props: {
    showUnitEditor: Boolean
  },
  data() {
    return {
      curShowUnitEditor: this.showUnitEditor,
      unitItems: [],
      openTestResultModal: false,
      testOcrResponseData: {},
      testIconResponseData: {},
      loading:false,
      unitName:""
    }
  },
  computed: {
    ...mapState('unit', ['unitData']),
    ...mapState('files', ['curFile', 'resFiles']),
    ...mapState('device', ['deviceInfo']),
    ...mapGetters('files', ['dataURLtoFileFormat']),
    ...mapGetters('job', [ 'normalKey']),
    hasIconTest() {
      let hasTestFunction = false
      for (let functionName of CONST.ICON_TEST_UNIT_LIST) {
        if (this.unitData.unitMsg && functionName === this.unitData.unitMsg.functionName) {
          hasTestFunction = true
        }
      }
      return (this.checkWeatherCompleted && hasTestFunction)
    },
    hasIconTestFixTest(){
      let hasTestFunction = false
      for (let functionName of CONST.ICON_TEST_UNIT_LIST_FIXED) {
        if (this.unitData.unitMsg && functionName === this.unitData.unitMsg.functionName) {
          hasTestFunction = true
        }
      }
      return (this.checkWeatherCompleted && hasTestFunction)
    },
    hasOcrTest() {
      if (!this.unitData.unitMsg) return
      return ('ocrChoice' in this.unitData.unitMsg && 'referImgFile' in this.unitData.unitMsg.execCmdDict)
    },
    hasIconPositionTest() {
      let hasTestFunction = false
      for (let functionName of CONST.ICON_POSITION_TEST_UNIT_LIST) {
        if (this.unitData.unitMsg && functionName === this.unitData.unitMsg.functionName) {
          hasTestFunction = true
        }
      }
      return (this.checkWeatherCompleted() && hasTestFunction)
    },
    hasIconPositionFixTest() {
      let hasTestFunction = false
      for (let functionName of CONST.ICON_POSITION_FIX_TEST_UNIT_LIST) {
        if (this.unitData.unitMsg && functionName === this.unitData.unitMsg.functionName) {
          hasTestFunction = true
        }
      }
      return (this.checkWeatherCompleted() && hasTestFunction)
    }
  },

  watch: {
    showUnitEditor(val) {
      this.curShowUnitEditor = val
      if(val)
        this.unitName = this.unitData.unitName
    },
    unitData: {
      deep: true,
      handler(newVal) {
        if (!newVal || !newVal.unitMsg) return
        let copyOfVal = this._.cloneDeep(newVal) //深拷贝
        let {unitMsg: {execCmdDict: {execCmdList}}} = copyOfVal
        if (execCmdList) {
          execCmdList.forEach((val, idx) => {
            val.itemID = Math.random().toString(16).slice(2, 8) // 为每一个unitItem生成一个id, 减少不必要的重新渲染
          })
          copyOfVal.unitMsg.execCmdDict.execCmdList = execCmdList
        }
        this.curUnitData = copyOfVal
      }
    }
  },
  methods: {
    async singleStepDebug() {
      this.unitItems = [...findComponentsDownward(this, 'UnitItem')]
      if (!this.deviceInfo) {
        let _this = this
        this.$Modal.confirm({
          title:'提示',
          content:'还未选取设备，是否现在去选择？',
          okText:'是',
          cancelText:'否',
          onOk(){
            _this.$store.commit('device/setSelectDevice', true)
            _this.$store.commit('device/setControlDeviceFlag', true)
          }
        })
        return
      }
      if(this.loading) return
      if(!this.checkWeatherCompleted()){
        this.$Message.error("请将信息填写完整！")
        return
      }
      let unitData = this._.cloneDeep(this.unitData.unitMsg)
      unitData.key = this.unitData.unitKey
      unitData.jobUnitName = this.unitData.unitName
      unitData.device_label = this.deviceInfo.device_label
      let url = `http://${this.deviceInfo.cabinet.ip_address}:5000/eblock/unit/`
      let data = new FormData()
      data.append('data', JSON.stringify(unitData))
      let resFiles = this._.cloneDeep(this.resFiles)
      let picName = ""
      if(unitData.execCmdDict.referImgFile)
        picName = unitData.execCmdDict.referImgFile.pic
      //提取当前unit下的json格式的依赖文件
      for (let i = 0; i < resFiles.length; i++) {
        let {name, type, file} = resFiles[i]
        if(name===picName)
          data.append('file', dataURLtoFile(file, name))  //png（图片）类的file需要解析
        if (name === 'FILES_NAME_CONFIG.json') continue // 移除老版本中遗留的文件，文件内容已经写入到start节点了
        let str = name.split("_")
        if(type==="json" && parseInt(str[0])===this.normalKey && parseInt(str[1])===unitData.key){
          if (this.dataURLtoFileFormat.indexOf(type) !== -1) {
            data.append('file', dataURLtoFile(file, name))  //png（图片）类的file需要解析
          } else {
            data.append('file', new File([file], name, {type}))
          }
        }
      }
      this.loading = true

      try {
        let response = await axios.request({
          url,
          method: 'post',
          data: data
        })
        if (response.data.result === 0) {
          this.loading = false
          this.$Message.info({content:"执行成功",duration:8})
        } else if (response.data.result === 1) {
          this.loading = false
          this.$Message.info({content:"执行失败",duration:8})
        }else {
          this.loading = false
         this.$Message.info({content:"执行异常",duration:8})
        }
      } catch (e) {
        this.loading = false
        if(!e.response){
          this.$Message.warning({content:"执行异常",duration:8})
          return
        }
        if (e.response.data.error_code){
          this.$Message.warning({content:`执行异常 code:${e.response.data.error_code} detail:${e.response.data.description}`,duration:6})
        }else this.$Message.warning({content:"执行异常",duration:8})
      }
    },
    closeUnitEditor(save) {
      console.log(this.unitData.unitType)
      this.unitItems = [...findComponentsDownward(this, 'UnitItem')]
      if (save) {
        this.$emit('handleUnitColor', this.checkWeatherCompleted()) // 检查当前unit是否编辑完成, 以决定unit块的颜色
        let unitData = this._.cloneDeep(this.unitData)
        unitData.unitName = this.unitName
        let {unitMsg: {execCmdDict: {execCmdList}}} = unitData
        if (execCmdList) {
          execCmdList.forEach((val) => {
            delete val.itemID
          })
        }
        unitData.completed = this.checkWeatherCompleted()
        this.$emit('saveUnit', unitData)
        // if (this.curFile) { // 如果当前展示的图片不为空
        //   let options
        //   if (!this.curFile.dirty) { // 该图片是新截取的
        //     options = { action: 'addCurFile' } // 将该图片添加到依赖文件列表中
        //     this.$store.commit('files/handleCurFile', options)
        //   }
        // }
      }
      this.unitItems.forEach(item => { // 使每一个unitItem处于非点击状态
        item.isClicked = false
      })
      this.$emit('closeUnitEditor') // 关闭unitEditor
      this.$store.commit('item/handleAreasInfo', {action: 'clear'}) // 清除当前选区信息
      this.$store.commit('item/handleShowItemEditor', false) // 关闭itemEditor
      this.$store.commit('files/handleCurFile', {action: 'removeCurFile'}) // 清空当前显示的图片的信息
      this.curUnitData = null // 清空当前unit的副本信息
    },
    checkWeatherCompleted() { // 如果每一个unitItem都编辑完成了, 则该unit也编辑完成了
      return this.unitItems.every(unitItem => unitItem.isCompleted === true)
    },
    updateUnitItem(item) { // 接受来自unitList.unitEditor的数据, 并将对应的数据更新
      let {unitMsg: {execCmdDict, execCmdDict: {execCmdList}}} = this.curUnitData
      let src = execCmdList || execCmdDict
      Object.assign(src[item.itemName], item.itemContent)
    },
    isNotExecutable(){
      if (!this.unitData.unitMsg) return true
      return CONST.UNIT_NOT_EXEC.includes(this.unitData.unitMsg.functionName )
    },
    validateRequireMessage() {
      if (this.curFile === null) {
        this.$Message.error({
          content: '请先完成所有截图和选区，二次修改时需要点击一下之前截图',
          duration: 5,
          closable: true
        })
      } else if (this.deviceInfo === null) {
        this.$Message.error({
          content: '请先选取设备',
          duration: 5,
          closable: true
        })
      } else return 1
    },
    prepareData: function () {
      let data = new FormData()
      let resFiles = this._.cloneDeep(this.resFiles)
      for (let eachfile of resFiles) {
        let type = eachfile.type
        let file = eachfile.file
        if (this.unitData.unitMsg.execCmdDict.configArea && eachfile.name === this.unitData.unitMsg.execCmdDict.configArea.area) {
          data.append('configArea', new File([file], eachfile.name, {type}))
        } else if (this.unitData.unitMsg.execCmdDict.configFile && eachfile.name === this.unitData.unitMsg.execCmdDict.configFile.area) {
          data.append('configFile', new File([file], eachfile.name, {type}))
        }
      }
      data.append('inputImgFile', dataURLtoFile(this.curFile.file, this.curFile.name))
      return data;
    },
    async sendIconTestRequest(functionName) {
      if (this.validateRequireMessage()) {
        let data = this.prepareData();
        let url = `http://${this.deviceInfo.cabinet.ip_address}:5000/basic/${functionName}/`
        try {
          let response = await axios.request({
            url,
            method: 'post',
            data: data
          })
          this.$Message.info({
            content: `需要特征点数量${response.data.required},现有特征点数量${response.data.sample},匹配结果${response.data.message}`,
            duration: 10,
            closable: true
          })
        } catch (e) {
          this.$Message.error(`请检查是否缺少选区文件 ${e}`)
        }
      }
    },
    async sendIconPositionTestRequest(functionName) {
      if (this.validateRequireMessage()) {
        let data = this.prepareData();
        let url = `http://${this.deviceInfo.cabinet.ip_address}:5000/basic/${functionName}/`
        try {
          let response = await axios.request({
            url,
            method: 'post',
            data: data
          })
          if (response.data.hasOwnProperty('error')) {
            this.$Message.error(response.data.error)
          } else {
            this.testIconResponseData = response.data
            this.openTestResultModal = true
            if (functionName === "icon_test_position"){
              let content = `首选识别点位权重: ${response.data.key_point_one} 备选识别点位权重: ${response.data.key_point_two}`
              this.$Message.info({
                content,
                duration: 5
              })
            }
          }
        } catch (e) {

          this.$Message.error(`请检查是否缺少选区文件 ${e}`)
        }
      }
    },
    async sendOcrTestRequest() {
      if (this.validateRequireMessage()) {
        let data = new FormData()
        let resFiles = this._.cloneDeep(this.resFiles)
        data.append('inputImgFile', dataURLtoFile(this.curFile.file, this.curFile.name))
        data.append('ocrChoice', this.unitData.unitMsg.ocrChoice)
        for (let eachFile of resFiles) {
          let type = eachFile.type
          let file = eachFile.file
          if (this.unitData.unitMsg.execCmdDict.configFile && eachFile.name === this.unitData.unitMsg.execCmdDict.configFile.area) {
            data.append('configFile', new File([file], eachFile.name, {type}))
          }
        }
        let url = `http://${this.deviceInfo.cabinet.ip_address}:5000/basic/ocr_test/`
        try {
          let response = await axios.request({
            url,
            method: 'post',
            data: data
          })
          this.openTestResultModal = true
          this.testOcrResponseData = response.data
        } catch (e) {
          console.log(e)
          this.$Message.error("测试文字异常")
        }
      }
    },
    closeTestModal() {
      this.openTestResultModal = false
      this.testOcrResponseData = {}
      this.testIconResponseData = {}
    },
    //unitItem填入值以后吧对应的unitName后面加上对应的值
    changeUnitName(name){
      let arr = this.unitData.unitName.split("_@_")
      if(arr.length>1)
        arr.pop()
      this.unitName = arr[0] + "_@_" + name
    }
  }
}
</script>

<style lang="less">
// ::-webkit-scrollbar {
//   width: 6px;
//   height: 6px;
// }
// ::-webkit-scrollbar-thumb {
//   border-radius: 3px;
//   background-color: rgb(190, 202, 209);
// }
.unit-editor {
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .unit-name {
      display: flex;
      align-items: center;
      width: 32.8%;

      .unit-name-tag {
        display: flex;
        color: #000;
        align-items: center;
      }

      .unit-name-input {
        flex: 1;
      }
    }
  }

  .body {
    display: flex;
    justify-content: space-between;
    padding-top: 1em;
    height: 100%;

    .pane {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      width: 32.8%;
      height: 100%;
    }
  }
}
</style>
