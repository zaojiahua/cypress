<template>
  <Modal v-model="unitEditorShow" :mask-closable="false" :closable="false" width="90" @on-ok="saveUnit" @on-cancel="closeUnitEditor">
      <div slot="header" class="unit-editor-header">
        <span>UNIT EDITOR</span>
        <div style="margin-left:20px; display: flex; align-items: center; width: 32.8%;">
          <Tag color="green" size="large" style="display: flex; align-items: center;">UNIT NAME</Tag>
          <Input type="text" v-model="currentUnitName" style="flex: 1;"></Input>
        </div>
      </div>
      <div class="unit-editor">
        <div>
          <unit-editor-unit-items :unitContent="currentUnitContent" :unitType="unitType"></unit-editor-unit-items>
          <unit-editor-raw-unit :unitContent="currentUnitContent" :unitType="unitType" style="margin-top: 20px;"></unit-editor-raw-unit>
        </div>
        <div>
          <unit-editor-item-edit ref="itemEdit" :unitName="currentUnitName" :unitType="unitType"></unit-editor-item-edit>
        </div>
        <div>
          <unit-editor-utils></unit-editor-utils>
        </div>
      </div>
  </Modal>
</template>

<script>
import unitEditorUnitItems from './unitEditorUnitItems'
import unitEditorRawUnit from './unitEditorRawUnit'
import unitEditorItemEdit from './unitEditorItemEdit'
import unitEditorUtils from './unitEditorUtils'
import {
  findComponentsDownward,
  fileToDataURL
} from '../lib/tools.js'

export default {
  components: { unitEditorUnitItems, unitEditorRawUnit, unitEditorItemEdit, unitEditorUtils },
  props: {
    unitName: {
      type: String,
      default: ''
    },
    unitEditorModalShow: {
      type: Boolean,
      default: false
    },
    unitContent: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      currentUnitName: this.unitName,
      unitType: '',
      unitEditorShow: this.unitEditorModalShow,
      currentUnitContent: this.unitContent,
      unitMsgObj: null,
      unitItems: [], // 存放 unit items 的每个实例
      isEditing: false,
      isEditingItem: false,
      currentItem: -1,
      acceptFileType: 'image/jpeg, image/png, video/mp4, video/mov, application/json, text/plain',
      legalFormat: ['jpg', 'jpeg', 'png', 'mp4', 'mov', 'json', 'plain'],
      dataForItemEdit: {
        type: '',
        content: ''
      },
      file: null,
      fileParams: {
        name: '',
        type: ''
      },
      fileToShow: '',
      isImage: false,
      isText: false,
      isVideo: false,
      loadingStatus: false,
      deviceColumn: [
        {
          title: '名称',
          key: 'device_name'
        },
        {
          title: '型号',
          key: 'phone_model'
        },
        {
          title: '安卓版本',
          key: 'android_version'
        },
        {
          title: 'ROM版本',
          key: 'rom_version'
        }
      ],
      deviceData: [],
      suffixs: [],
      imgName: '',
      imgUrl: '',
      loading: false
    }
  },
  watch: {
    unitName (val) {
      this.currentUnitName = val
    },
    unitEditorModalShow (val) {
      this.unitEditorShow = val
    },
    unitContent (val) {
      this.currentUnitContent = val
      this.unitMsgObj = JSON.parse(val)
      this.unitType = this.unitMsgObj.execModName
      if (this.currentItem !== -1) {
        setTimeout(() => {
          this.unitItems[this.currentItem].$el.click()
        })
      }
    },
    file (val) {
      if (val) {
        this.$set(this.fileParams, 'name', val.name)
        this.$set(this.fileParams, 'type', val.type)
        if (val.type.split('/')[0] === 'image') {
          this.isImage = true
          this.isText = false
          this.isVideo = false
          fileToDataURL(val).then(res => {
            this.fileToShow = res
          })
        } else if (val.type.split('/')[0] === 'application' || val.type.split('/')[0] === 'text') {
          this.isText = true
          this.isImage = false
          this.isVideo = false
          let reader = new FileReader()
          reader.readAsText(val)
          reader.onload = () => {
            this.fileToShow = reader.result
          }
        } else if (val.type.split('/')[0] === 'video') {
          this.isVideo = true
          this.isText = false
          this.isImage = false
          fileToDataURL(val).then(res => {
            this.fileToShow = res
          })
        }
      }
    }
  },
  methods: {
    closeUnitEditor () {
      this.$refs.itemEdit.showEditPane = false
      this.$emit('closeUnitEditor')
    },
    saveUnit () {
      this.$emit('saveUnit', this.currentUnitName, this.currentUnitContent)
      this.closeUnitEditor()
    },
    handleSearch (value) {
      this.suffixs = !value || value.indexOf('.') >= 0 ? [] : [
        value + '.jpg',
        value + '.png'
      ]
    },
    onDeviceRowClick (row, index) {
      this.currentDeviceRowIndex = index
    }
  },
  beforeUpdate () {
    this.unitItems = [...findComponentsDownward(this, 'unit-item')]
  },
  created () {
    this.$bus.on('saveChange', data => {
      let target = this.unitType === 'IMGTOOL' ? this.unitMsgObj.execCmdDict : this.unitMsgObj.execCmdDict.execCmdList
      if (this.unitType === 'IMGTOOL') {
        target[data.itemName] = data.itemContent
      } else {
        target[Number(data.itemName)] = data.itemContent
      }
      this.currentUnitContent = JSON.stringify(this.unitMsgObj, null, 2)
    })
    this.$bus.on('setNamesAboutScreenShotFile', (imgName, featurePointFileName) => {
      let target = this.unitMsgObj.execCmdDict
      target['referImgFile']['content'] = `Tmach${imgName} `
      target['configFile']['content'] = `Tmach${featurePointFileName}.json `
      this.currentUnitContent = JSON.stringify(this.unitMsgObj, null, 2)
    })
  },
  destroyed () {
    this.$bus.off('saveChange')
  }
}
</script>

<style lang="less">
::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
::-webkit-scrollbar-thumb {
  // background-color: #a1a3a9;
  border-radius: 3px;
  // background-color: rgb(136, 135, 219);
  background-image: -webkit-linear-gradient(
      45deg,
      // rgba(4, 81, 182, 0.8) 6%,
      // rgba(6, 105, 44, 0.8) 18%,
      // rgba(112, 216, 42, 0.8) 25%,
      // rgba(89, 0, 206, 0.8) 50%,
      // rgba(125, 69, 228, 0.8) 60%,
      // rgba(192, 45, 113, 0.8) 75%,
      // rgba(112, 216, 42, 0.8)
      rgba(35, 35, 36, 0.8) 6%,
      rgba(120, 134, 125, 0.8) 18%,
      rgba(170, 190, 157, 0.8) 25%,
      rgba(137, 125, 153, 0.8) 50%,
      rgba(86, 76, 104, 0.8) 60%,
      rgba(138, 94, 115, 0.8) 75%,
      rgba(107, 140, 167, 0.8)
  );
}
.unit-editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1rem;
}
.unit-editor {
  display: flex;
  justify-content: space-between;
  &>div {
    width: 32.8%;
  }
}

</style>
