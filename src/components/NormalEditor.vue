<template>
  <Modal v-model="openNormalEditor" :closable="false" fullscreen>
    <div class="container" @click="closeContextMenu">
      <header>
        <Input clearable size="large" v-model="curNormalData.text" />
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
        <ButtonGroup vertical size="default" v-else>
          <Button type="primary" @click="setWingman(0)">主机</Button>
          <Button v-for="wingman in wingmans" :key="wingman" @click="setWingman(wingman)">{{wingman}} 号机</Button>
        </ButtonGroup>
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
      :unitData="unitData"
      @closeUnitEditor="closeUnitEditor"
      @changeUnitColor="changeUnitColor"
      @saveUnit="saveUnit"
      @setUnitName="setUnitName"
    ></unit-editor>
    <div slot="footer">
      <Button type="text" @click="save(false)">取消</Button>
      <Button type="primary" @click="save(true)">确定</Button>
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
import { getJobUnitsBodyDict, deleteUnitTemplate } from 'api/reef/unit'

export default {
  name: 'NormalEditor',
  components: { unitTemplateEditor, UnitEditor },
  props: {
    openNormalEditor: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      innerPalette: null,
      innerDiagram: null,
      unitTemplateType: '',
      startUnitTemplateType: '基础操作',
      curNormalData: {},
      unitTemplateId: undefined,
      unitTemplateName: '',
      unitTemplateContent: '',
      openUnitTemplateEditor: false,
      unitController: null,
      isDiagram: false,
      wingmans: 3,
      showUnitEditor: false,
      curUnitKey: undefined,
      unitData: null
    }
  },
  computed: {
    ...mapState('job', ['normalData']),
    ...mapState('unit', ['unitLists'])
  },
  watch: {
    normalData (val) {
      this.curNormalData = JSON.parse(val)
      this.innerDiagram.model = go.Model.fromJson(JSON.stringify(this.curNormalData.unitLists))
    },
    openNormalEditor (val) {
      if (val) this.getSelectedUnit(this.unitTemplateType)
    }
  },
  methods: {
    save (toggle) {
      if (toggle) {
        this.curNormalData.unitLists = JSON.parse(this.innerDiagram.model.toJson())
        let units = this.curNormalData.unitLists.nodeDataArray.filter(item => item.category === 'Unit')
        if (units.some(item => CONST.STAR.has(item.unitMsg.execModName))) {
          if (units.some(item => item.star === CONST.COLORS.RESULT)) {
            this.curNormalData.star = CONST.COLORS.RESULT
          } else {
            this.curNormalData.star = CONST.COLORS.STAR
          }
        }
        if (units.length === 0 || units.some(item => item.completed === false)) {
          this.curNormalData.color = CONST.COLORS.UNFINISHED
        } else {
          this.curNormalData.color = CONST.COLORS.FINISH
        }
        if (!this.curNormalData.resFile) {
          this.curNormalData.resFile = {}
        }
        units.forEach((val) => {
          Object.assign(this.curNormalData.resFile, val.resFile)
        })

        this.$emit('saveNormalData', this._.cloneDeep(this.curNormalData))
      }
      this.$emit('closeNormalEditor')
    },
    getSelectedUnit (name) {
      if (!this.unitLists) return
      let unitCategoryData = { nodeDataArray: [] }
      if (!this.unitLists[name]) name = this.startUnitTemplateType
      this.unitTemplateType = name
      if (this.unitLists[name]) {
        Object.entries(this.unitLists[name]).forEach((unit) => {
          unitCategoryData.nodeDataArray.push({
            category: 'Unit',
            text: unit[0],
            unit_id: unit[1]['unit_id'],
            unitMsg: unit[1]['unit_content']
          })
        })
        this.innerPalette.model = new go.GraphLinksModel(unitCategoryData.nodeDataArray)
      }
    },
    updateUnitLists (unitTemplateType = undefined) {
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
          this.$store.commit('unit/setUnitLists', unitLists)
          if (unitTemplateType) this.getSelectedUnit(unitTemplateType)
        } else {
          throw new Error('获取 Unit 列表失败')
        }
      }).catch(err => {
        console.log(err)
        this.$Message.error({ background: true, content: '获取 Unit 列表失败' })
      })
    },
    handleUnitTemplateEditor (toggle) {
      this.openUnitTemplateEditor = toggle
      this.closeContextMenu()
    },
    delUnitTemplate () {
      this.$Modal.confirm({
        title: '温馨提示',
        content: '确定要删除当前 Unit 模板吗？',
        okText: '心意已决',
        cancelText: '我再想想',
        onOk: async () => {
          let { status } = await deleteUnitTemplate(this.unitTemplateId)
          if (status === 204) {
            this.$Message.success({ background: true, content: '删除成功' })
            setTimeout(() => { this.updateUnitLists(this.unitTemplateType) }, 300)
          } else {
            this.$Message.error({ background: true, content: '删除失败' })
          }
        }
      })
    },
    closeContextMenu () {
      this.unitController.style.display = 'none'
    },
    setWingman (wingmanId) {
      let curUnit = this.innerDiagram.findNodeForKey(this.curUnitKey)
      if (wingmanId) {
        if (!curUnit.data.assistDevice) {
          this.$store.commit('job/handleWingmanCount', 'plus')
        }
        this.innerDiagram.model.setDataProperty(curUnit.data, 'assistDevice', wingmanId)
        this.innerDiagram.model.setDataProperty(curUnit.data.unitMsg, 'assistDevice', wingmanId)
      } else {
        if (curUnit.data.assistDevice) {
          this.$store.commit('job/handleWingmanCount', 'reduce')
        }
        this.innerDiagram.model.setDataProperty(curUnit.data, 'assistDevice', null)
        delete curUnit.data.assistDevice
        delete curUnit.data.unitMsg.assistDevice
      }
    },
    closeUnitEditor () {
      this.showUnitEditor = false
    },
    changeUnitColor (hasCompleted) {
      let currentNodeData = this.innerDiagram.findNodeForKey(this.unitData.unitNodeKey).data
      if (hasCompleted) {
        this.innerDiagram.model.setDataProperty(currentNodeData, 'color', CONST.COLORS.FINISH)
        currentNodeData.completed = true
      } else {
        this.innerDiagram.model.setDataProperty(currentNodeData, 'color', CONST.COLORS.UNFINISHED)
        currentNodeData.completed = false
      }
    },
    saveUnit (unitData, unitResFileList) {
      this.closeUnitEditor()
      let curUnitNode = this.innerDiagram.findNodeForKey(unitData.unitNodeKey)
      this.innerDiagram.model.setDataProperty(curUnitNode.data, 'unitMsg', unitData.unitMsg)
      this.innerDiagram.model.setDataProperty(curUnitNode.data, 'text', unitData.unitName)
      if (unitResFileList.length) {
        if (!curUnitNode.data.resFile) {
          this.innerDiagram.model.setDataProperty(curUnitNode.data, 'resFile', {})
        }
        let { resFile } = curUnitNode.data
        for (let item of unitResFileList) {
          if (item.oldname !== item.newname) {
            delete resFile[item.oldName]
          }
          resFile[item.newName] = true
        }
      }
    },
    setUnitName (val) {
      this.unitData.unitName = val
    }
  },
  mounted () {
    innerDiagramInit(this)
    innerPaletteInit(this)
    this.updateUnitLists()
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
