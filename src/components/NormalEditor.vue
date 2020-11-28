<template>
  <Modal v-model="openNormalEditor" :closable="false" fullscreen>
    <div class="container" @click="closeContextMenu">
      <header>
        <Input clearable size="large" v-model="curNormalData.text" />
        {{finalResKey}}
      </header>
      <nav>
        <Dropdown trigger="click" @on-click="getSelectedUnit" style="width: 100%; margin-bottom: 1em;">
          <Button type="primary" ghost style="width: 100%;">
            {{unitTemplateType}}
            <Icon type="ios-arrow-down" />
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem v-for="(unit, key) in unitLists" :name="key" :key="key">{{key}}</DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <div id="inner-palette"></div>
      </nav>
      <main>
        <div id="inner-diagram"></div>
      </main>
      <div id="unit-controller">
        <ButtonGroup vertical size="default" v-if="!isDiagram">
          <Button type="error" @click="delUnitTemplate">删除</Button>
          <Button type="success" @click="handleUnitTemplateEditor(true)">编辑</Button>
        </ButtonGroup>
        <Dropdown trigger="custom" :visible="true" v-else>
          <DropdownMenu slot="list">
            <Dropdown v-for="{name, data, visible, func} in dropdownMenuData" :key="name" placement="right-start" @on-click="handleClick($event, func)">
              <DropdownItem :disabled="visible">
                {{name}}
                <Icon type="ios-arrow-forward"></Icon>
              </DropdownItem>
              <DropdownMenu v-for="{name, key} in data" :key="key" slot="list">
                <DropdownItem :disabled="visible" :name="key">{{name}} </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </DropdownMenu>
        </Dropdown>
<!--        <ButtonGroup vertical size="default" v-else>-->
<!--          <Button type="primary" @click="setWingman(0)">主机</Button>-->
<!--          <Button v-for="wingman in numOfWingman" :key="wingman" @click="setWingman(wingman)">{{wingman}} 号机</Button>-->
<!--        </ButtonGroup>-->
      </div>
    </div>
    <unit-template-editor
      :openUnitTemplateEditor="openUnitTemplateEditor"
      :unitTemplateId="unitTemplateId"
      :unitTemplateType="unitTemplateType"
      :unitTemplateName="unitTemplateName"
      :unitTemplateContent="unitTemplateContent"
      @closeUnitTemplateEditor="handleUnitTemplateEditor(false)"
      @updateUnitLists="updateUnitLists"
    ></unit-template-editor>
    <unit-editor
      :showUnitEditor="showUnitEditor"
      @closeUnitEditor="closeUnitEditor"
      @handleUnitColor="handleUnitColor"
      @saveUnit="saveUnit"
      @setUnitName="setUnitName"
    ></unit-editor>
    <div slot="footer">
      <Button type="text" @click="saveNormalData(false)">取消</Button>
      <Button type="primary" @click="saveNormalData(true)">确定</Button>
    </div>
  </Modal>
</template>
<script>
import go from 'gojs'
import { mapState } from 'vuex'
import CONST from 'constant/constant'
import unitTemplateEditor from '_c/unitTemplateEditor'
import UnitEditor from '_c/unitEditor/UnitEditor.vue'
import { innerDiagramInit, innerPaletteInit } from '../views/JobEditorGoInit'
import { getJobUnitsBodyDict, deleteUnitTemplate } from 'api/reef/request'

export default {
  name: 'NormalEditor',
  components: { unitTemplateEditor, UnitEditor },
  props: {
    openNormalEditor: {
      type: Boolean,
      default: false
    },
    // finalResKey: {
    //   type: String,
    //   default: null
    // }
  },
  data () {
    return {
      innerPalette: null,
      innerDiagram: null,
      finalResKey: null,
      unitTemplateType: '', // 左侧显示的unit模板分类
      defaultUnitTemplateType: '基础操作', // 默认显示的unit模板类, 当某个种类下的unit被全部删除完时会用到
      curNormalData: {},
      /*
        curNormalData 结构:
        {
          category: "normalBlock",
          text: "normalBlock的名字",
          unitLists: {
            class: "",
            linkFromPortIdProperty: "fromPort",
            linkToPortIdProperty: "toPort",
            nodeDataArray: [],
            linkDataArray: []
          }
        }
      */
      unitTemplateId: undefined,
      unitTemplateName: '',
      unitTemplateContent: '',
      openUnitTemplateEditor: false,
      unitController: null,
      isDiagram: false,
      numOfWingman: 3, //可设置的僚机个数
      showUnitEditor: false,
      dropdownMenuData:[
        {
          name: "unit类型",
          // data:["结果unit","非结果unit"],
          data:[
            {name:"非结果unit",key:0},
            {name:"结果unit",key:1}
          ],
          visible: true, // 默认不允许
          func: this.setUnitCategory

        },
        {
          name: "运行载体",
          data:[
            {name:"主机",key:0},
            {name:"一号僚机",key:1},
            {name:"二号僚机",key:2},
            {name:"三号僚机",key:3}
            ],
          visible: false,
          func: this.setWingman

        }
      ]

    }
  },
  computed: {
    ...mapState('job', ['normalData','config']),
    ...mapState('unit', ['unitLists', 'unitData'])
  },
  watch: {
    normalData (val) { // 切换normalBlock/更新normalBlock的数据时重新渲染逻辑流
      this.curNormalData = val
      this.innerDiagram.model = go.Model.fromJson(this.curNormalData.unitLists)
    },
    openNormalEditor (val) { // 打开normalEditor时展示unit模板
      if (val) {
        console.log(this._.cloneDeep(this.config.finalResultKey))
        this.getSelectedUnit(this.unitTemplateType)
        this.finalResKey = this._.cloneDeep(this.config.finalResultKey)

      }
    }
  },
  methods: {
    handleClick(key, func){
      if (undefined !== key) {
        func(key)
      }else{
        console.log(key,func)
      }
    },
    setUnitCategory(key) { // 改变unit类型
      if (this.innerDiagram.selection.count > 1) {
        this.$Message.error({
          content: '仅可选取一个Unit'
        })
        return
      }
      let { data } = this.innerDiagram.selection.first()
      if (data.category !== 'Unit') return
      if (key) { // 结果unit
        if (this.finalResKey){ // 有设置结果unit
          if (this.finalResKey !== `${this.normalData.key},${data.key}`){ // 且不是当前unit
            this.$Message.error({ background: true, content: '结果unit有且只能有一个' })
          }
        }else // 没有设置结果unit
          {
            this.innerDiagram.model.setDataProperty(data, 'star', CONST.COLORS.RESULT)
            let unitMsg = this._.cloneDeep(data.unitMsg)
            unitMsg.finalResult = true
            this.innerDiagram.model.setDataProperty(data, 'unitMsg', unitMsg)
            this.finalResKey = `${this.normalData.key},${data.key}`
          }
      } else { // 定义成非结果unit
        if (this.finalResKey === `${this.normalData.key},${data.key}`) this.finalResKey = null // 操作的对象死结果unit 则将结果unit清空
        this.innerDiagram.model.setDataProperty(data, 'star', CONST.COLORS.STAR)
        let unitMsg = this._.cloneDeep(data.unitMsg)
        delete unitMsg.finalResult
        this.innerDiagram.model.setDataProperty(data, 'unitMsg', unitMsg)
      }
    },
    recordOrRemoveWingman () { // 记录或者删除僚机信息
      let wingman = new Array(4).fill(0)
      let flag = false
      let units = this.innerDiagram.findNodesByExample({ 'category': 'Unit' })
      units.each(({ data }) => { // 统计各个unit内记录的僚机信息
        if (data.assistDevice) wingman[data.assistDevice]++
        flag = true
      })
      if (flag) { // 使用了僚机才记录
        this.curNormalData.wingman = wingman
      } else { // 否则删除该字段
        delete this.curNormalData.wingman
      }
    },
    saveNormalData (toggle) { // 保存NormalBlock的信息 只有保存的时候才可以吸入unit信息，其他时候也不要将unit写到store,因为用户可以选择取消
      this.recordOrRemoveWingman()
      if (toggle) {
        this.curNormalData.unitLists = this.innerDiagram.model.toJson() // 将NormalEditor的逻辑流保存下来
        // 获取所有的unit组成的数组
        let units = JSON.parse(this.curNormalData.unitLists).nodeDataArray.filter(item => item.category === 'Unit')
        if (units.some(item => CONST.STAR.has(item.unitMsg.execModName))) { // 如果这些unit中存在可以设为结果Block的unit
          if (units.some(item => item.star === CONST.COLORS.RESULT)) { // 如果存在结果unit,则将当前Normal设为结果block
            this.curNormalData.star = CONST.COLORS.RESULT
          } else { // 否则为普通的normalBlock
            this.curNormalData.star = CONST.COLORS.STAR
          }
        } else { // 否则取消右上角的黄色标识
          this.curNormalData.star = null
        }
        if (units.length === 0 || units.some(item => item.completed === false)) { // 如果没有unit或存在未完成的unit
          this.curNormalData.color = CONST.COLORS.UNFINISHED // 标识normal为未完成的红色
        } else { // 否则
          this.curNormalData.color = CONST.COLORS.FINISH // 标识normal为已完成的绿色
        }
        this.$emit('saveNormalData', this._.cloneDeep(this.curNormalData)) // 将编辑完成后的normalData传递给jobEditor并触发保存操作
        this.$emit('saveFinalResKey', this.finalResKey)
      }
      this.$emit('closeNormalEditor') // 关闭NormalEditor
    },
    getSelectedUnit (name) { // 展示选中的分类下的unit模板
      if (!this.unitLists) return
      let nodeDataArray = []
      if (!this.unitLists[name]) name = this.defaultUnitTemplateType
      this.unitTemplateType = name
      if (this.unitLists[name]) { // 如果当前分类存在
        Object.entries(this.unitLists[name]).forEach((unit) => { // 将该分类下的unit模板记录下来
          nodeDataArray.push({
            category: 'Unit',
            text: unit[0],
            unit_id: unit[1]['unit_id'],
            unitMsg: unit[1]['unit_content']
          })
        })
        nodeDataArray.sort((a, b) => { // 根据weight字段决定显示顺序
          if (a.unitMsg.weight && b.unitMsg.weight) {
            return a.unitMsg.weight - b.unitMsg.weight
          }
          if (!a.unitMsg.weight) return 1
          if (!b.unitMsg.weight) return -1
        })
        this.innerPalette.model = new go.GraphLinksModel(nodeDataArray) // 渲染排序后的nit模板
      }
    },
    updateUnitLists (unitTemplateType = undefined) { // 更新unit模板信息
      getJobUnitsBodyDict().then(({ status, data: { unit } }) => {
        if (status === 200) {
          let unitLists = {}
          unit.forEach((val, idx) => {
            if (!(val.type in unitLists)) unitLists[val.type] = {}
            unitLists[val.type][val.unit_name] = {
              unit_id: val.id,
              unit_content: val.unit_content
            }
          })
          this.$store.commit('unit/setUnitLists', unitLists) // 保存unit模板的信息
          if (unitTemplateType) this.getSelectedUnit(unitTemplateType) // 显示当前选中种类的unit模板
        } else {
          throw new Error('获取 Unit 列表失败')
        }
      }).catch(err => {
        console.log(err)
        this.$Message.error({ background: true, content: '获取 Unit 列表失败' })
      })
    },
    handleUnitTemplateEditor (toggle) { // 打开/关闭Unit模板编辑页面
      this.openUnitTemplateEditor = toggle
      this.closeContextMenu()
    },
    delUnitTemplate () { // 删除选中的单个unit模板
      this.$Modal.confirm({
        title: '温馨提示',
        content: '确定要删除当前 Unit 模板吗？',
        okText: '心意已决',
        cancelText: '我再想想',
        onOk: async () => {
          let { status } = await deleteUnitTemplate(this.unitTemplateId)
          if (status === 204) {
            this.$Message.success({ background: true, content: '删除成功' })
            setTimeout(() => { this.updateUnitLists(this.unitTemplateType) }, 300) // 延时获取更新后的模板信息
          } else {
            this.$Message.error({ background: true, content: '删除失败' })
          }
        }
      })
    },
    closeContextMenu () {
      this.unitController.style.display = 'none'
    },
    openContextMenu () {
      this.unitController.style.display = 'block'
    },
    setWingman (wingmanId) { // 记录僚机使用情况
      this.innerDiagram.selection.each(({ data }) => {
        if (data.category !== 'Unit') return
        if (wingmanId) { // 设置为僚机
          this.innerDiagram.model.setDataProperty(data, 'assistDevice', wingmanId)
          this.innerDiagram.model.setDataProperty(data.unitMsg, 'assistDevice', wingmanId)
        } else { // 设置为主机
          this.innerDiagram.model.setDataProperty(data, 'assistDevice', null)
          this.innerDiagram.model.setDataProperty(data.unitMsg, 'assistDevice', null)
          delete data.assistDevice
          delete data.unitMsg.assistDevice
        }
      })
    },
    closeUnitEditor () { // 关闭unitEditor
      this.showUnitEditor = false
    },
    handleUnitColor (isCompleted) { // 标识unit是否编辑完成
      this.innerDiagram.selection.each(({ data }) => {
        this.innerDiagram.model.setDataProperty(data, 'color', isCompleted ? CONST.COLORS.FINISH : CONST.COLORS.UNFINISHED)
      })
    },
    saveUnit (data) { // 将传入的unit信息保存到逻辑流中
      this.closeUnitEditor()
      this.innerDiagram.selection.each((node) => {
        if (node.category === 'Unit') {
          this.innerDiagram.model.setDataProperty(node.data, 'unitMsg', data.unitMsg)
          this.innerDiagram.model.setDataProperty(node.data, 'text', data.unitName)
          this.innerDiagram.model.setDataProperty(node.data, 'completed', data.completed)
        }
      })
    },
    setUnitName (val) {
      this.unitData.unitName = val
    }
  },
  mounted () {
    innerDiagramInit(this) // 挂载时初始化NormalEditor的画布与画板
    innerPaletteInit(this)
    this.updateUnitLists() // 获取unit模板
    this.unitController = document.querySelector('#unit-controller')
  }
}
</script>
<style lang="less" scoped>
.container {
  display: grid;
  grid-template-areas:  "header header"
                        "palette  diagram";
  grid-template-columns: minmax(210px, 1fr) 7fr;
  grid-template-rows: 1fr 25fr;
  grid-gap: 1em;
  height: 100%;
  header {
    grid-area: header;
    display: flex;
    align-items: center;
  }
  nav {
    grid-area: palette;
    position: relative;;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    overflow: hidden;
    border-radius: 4px;
    #inner-palette {
      width: 100%;
      height: 100%;
      background-color: white;
      padding-top: 4em;
      border: 1px solid #dddddd;
      canvas {
        padding-top: 3.6em;
      }
    }
  }
  main {
    grid-area: diagram;
    background-color: darkkhaki;
    border-radius: 4px;
    #inner-diagram {
      width: 100%;
      height: 100%;
      background-color: white;
      border: 1px solid #dddddd;
    }
  }
  #unit-controller {
    display: none;
    position: absolute;
    width: 100px;
    border-radius: 6px;
    z-index: 10;
  }
}
</style>
