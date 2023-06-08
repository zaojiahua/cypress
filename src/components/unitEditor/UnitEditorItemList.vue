<template>
  <Card class="unit-item-list-card">
    <!-- title -->
    <div slot="title">
      <span>Unit Items &nbsp; ({{ numOfItems }})</span>
      {{ocrChoice}}
    </div>
    <!-- extra -->
    <div slot="extra">
      <div v-show="rotateChoice" style="float: left;margin-right: 10px">
        <Select v-model="rotateChoice" style="width:65px" size="small" :placeholder="$t('unitEditor.bar_1')" @on-select="handleRotateChoice">
          <Option value="0">0</Option>
          <Option value="90">90</Option>
          <Option value="180">180</Option>
          <Option value="270">270</Option>
        </Select>
      </div>
      <div v-show="tGuard&&isShowTGuard" style="float: left;margin-right: 10px">
        <span>T-Guard </span>
        <Switch false-color="#ff4949" v-model="tGuardToggle" @on-change="handleTGuard">
          <span slot="open">{{$t('unitEditor.switch_1')}}</span>
          <span slot="close">{{$t('unitEditor.switch_2')}}</span>
        </Switch>
      </div>
      <div v-show="ocrChoice" style="float: right;">
        <span>OCR </span>
        <Switch false-color="#ff4949" v-model="ocrChoiceToggle" @on-change="handleOcrChoice">
          <span slot="open">1</span>
          <span slot="close">2</span>
        </Switch>
      </div>
      <div v-show="directionSwitch" style="float: right;">
        <span>{{$t('unitEditor.bar_2')}} </span>
        <Switch false-color="#ff4949" v-model="directionToggle" @on-change="handleDirection">
          <span slot="open">{{$t('unitEditor.switch_3')}}</span>
          <span slot="close">{{$t('unitEditor.switch_4')}}</span>
        </Switch>
      </div>
      <div v-show="saveSwitch" style="float: right;">
        <span>{{$t('unitEditor.bar_3')}} </span>
        <Switch false-color="#ff4949" v-model="saveToggle" @on-change="handleSave">
          <span slot="open">{{$t('unitEditor.switch_1')}}</span>
          <span slot="close">{{$t('unitEditor.switch_2')}}</span>
        </Switch>
      </div>
      <div v-show="methodSelect" style="float: right;margin-left: 10px">
        <span>{{$t('unitEditor.bar_4')}} </span>
        <Select v-model="methodSelect" style="width:90px" size="small">
          <Option :value="1">{{$t('unitEditor.switch_5')}}</Option>
          <Option :value="2">{{$t('unitEditor.switch_6')}}</Option>
          <Option :value="3">{{$t('unitEditor.switch_7')}}</Option>
          <!--<Option :value="4" v-show="showOption">图标膨胀</Option>-->
        </Select>
      </div>
    </div>
    <!-- body -->
    <transition-group name="item" tag="div" class="item-container">
      <UnitItem
        v-for="(item, index) in unitItemsData"
        :key="item.itemContent.itemId || index"
        :itemData="item"
        :itemIndex="index"
        :isActive="curUnitItem === index"
        @click.native="handleItemClick(index)"
      ></UnitItem>
    </transition-group>
  </Card>
</template>

<script>
import UnitItem from './UnitEditorItem'

import { mapState } from 'vuex'

export default {
  name: 'UnitItemList',
  components: { UnitItem },
  data () {
    return {
      ocrChoiceToggle: undefined,
      // tGuardToggle:undefined,
      directionToggle:undefined,
      curUnitItem: undefined
    }
  },
  computed: {
    ...mapState('unit', ['unitData']),
    ...mapState('job', ['jobInfo']),
    unitItemsData: { // 在当前的Unit信息中提取Items的信息
      get () {
        if (!this.unitData.unitMsg) return
        let { unitMsg } = this._.cloneDeep(this.unitData)
        let src = unitMsg.execCmdDict.execCmdList || unitMsg.execCmdDict
        let unitItemsData = []
        for (let key in src) {
          if (src[key].type !== 'noChange') { // 只提取需要用户操作的Item信息
            let { order } = src[key]
            if (order) {
              unitItemsData[order - 1] = { 'itemName': key, 'itemContent': src[key] }
            } else {
              unitItemsData.push({ 'itemName': key, 'itemContent': src[key] })
            }
          }
        }
        return unitItemsData
      },
      set (val) { /* 取消报错 */ }
    },
    numOfItems () { // Item的数量
      return this.unitItemsData ? this.unitItemsData.length : 0
    },
    ocrChoice () { // 如果保存了文字识别引擎的编号，则返回，否则返回0
      if (!this.unitData.unitMsg) return
      return this.unitData.unitMsg.ocrChoice
    },
    tGuard(){
      if (!this.unitData.unitMsg) return
      return this.unitData.unitMsg.tGuard
    },
    directionSwitch(){
      if (!this.unitData.unitMsg) return
      return this.unitData.unitMsg.portrait
    },
    isShowTGuard(){
      return this.jobInfo.job_type !== 'ComboJob';
    },
    tGuardToggle(){
      return this.tGuard === 1
    },
    saveSwitch(){
      if (!this.unitData.unitMsg) return
      return this.unitData.unitMsg.save
    },
    saveToggle(){
      return this.saveSwitch === 1
    },
    showOption(){
      if (!this.unitData.unitMsg) return
      let unitList = ['start_point_with_swipe_slow','start_point_with_icon']
      return !unitList.includes(this.unitData.unitMsg.jobUnitName);
    },
    rotateChoice:{
      get () {
        if (!this.unitData.unitMsg) return
        return this.unitData.unitMsg.camera_rotate
      },
      set(){
      }
    },
    methodSelect:{
      get () {
        if (!this.unitData.unitMsg) return
        return this.unitData.unitMsg.start_method
      },
      set(val){
        let { unitMsg } = this._.cloneDeep(this.unitData)
        unitMsg.start_method = val
        this.$store.commit('unit/handleUnitData', {
          action: 'setUnitMsg',
          data: unitMsg
        })
      }
    }
  },
  watch: {
    ocrChoice (val) {
      this.ocrChoiceToggle = val === 1
    },
    // tGuard (val) {
    //   this.tGuardToggle = val === 1
    //   console.log("this.tGuardToggle 开关")
    //   console.log(this.tGuardToggle)
    // },
    directionSwitch (val) {
      this.directionToggle = val === 1
    }
  },
  methods: {
    handleRotateChoice(val){
      let { unitMsg } = this._.cloneDeep(this.unitData)
      unitMsg.camera_rotate = val.value
      this.$store.commit('unit/handleUnitData', {
        action: 'setUnitMsg',
        data: unitMsg
      })
    },
    handleOcrChoice (val) { // 更改当前unit使用的ocr引擎
      let { unitMsg } = this._.cloneDeep(this.unitData)
      unitMsg.ocrChoice = val ? 1 : 2
      this.$store.commit('unit/handleUnitData', {
        action: 'setUnitMsg',
        data: unitMsg
      })
    },
    handleTGuard(val){
      let { unitMsg } = this._.cloneDeep(this.unitData)
      unitMsg.tGuard = val ? 1 : 2
      this.$store.commit('unit/handleUnitData', {
        action: 'setUnitMsg',
        data: unitMsg
      })
    },
    handleDirection(val){
      let { unitMsg } = this._.cloneDeep(this.unitData)
      unitMsg.portrait = val ? 1 : 2
      this.$store.commit('unit/handleUnitData', {
        action: 'setUnitMsg',
        data: unitMsg
      })
    },
    handleSave(val){
      let { unitMsg } = this._.cloneDeep(this.unitData)
      unitMsg.save = val ? 1 : 2
      this.$store.commit('unit/handleUnitData', {
        action: 'setUnitMsg',
        data: unitMsg
      })
    },
    handleItemClick (index) { // 记录当前点击的unitItem
      this.curUnitItem = index
    }
  }
}
</script>

<style lang="less" scoped>
  @import '../../css/common.less';
  .unit-item-list-card {
    flex: 1;
    margin-bottom: 1em;
    max-height: calc(50% + 2px);
    /deep/ .ivu-card-extra {
      top: 10px;
    }
    /deep/ .ivu-card-body {
      height: calc(100% - 44px);
    }
    .item-container {
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
      & > div:first-child {
        margin-top: 0;
      }
      & > div:last-child {
        margin-bottom: 0;
      }
    }
    .item-enter-active, .item-leave-active {
      transition: all .3s;
    }
    .item-enter, .item-leave-to {
      opacity: 0;
      transform: translateX(100%);
    }
  }
</style>
