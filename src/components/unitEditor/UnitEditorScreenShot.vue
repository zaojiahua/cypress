<template>
  <Card class="screen-shot-container">
    <!-- title -->
    <p slot="title">
      <Divider orientation="left" style="margin: 0;">获取图片</Divider>
    </p>
    <!-- extra -->
    <Button
      slot="extra"
      @click="showDeviceSelectPage"
      type="primary"
      size="small"
    >选取设备</Button>
    <!-- body -->
    <div class="screen-shot-body">
      <Table
        border
        size="small"
        :columns="deviceInfoColumns"
        :data="deviceInfo"
      ></Table>
      <div class="child-m-right--1">
        <Input v-model="curImgName" size="small" :disabled="!isPicInput ? false : true" @input="setImgName" clearable>
          <span slot="prepend">图片名称</span>
        </Input>
        <Button type="primary" size="small" :loading="isLoading" @click="getImage">
          <span v-if="!isLoading">获取截图</span>
          <span v-else>Loading...</span>
        </Button>
        <!-- <Dropdown placement="bottom-end">
          <Button type="primary">
              获取截图
              <Icon type="ios-arrow-down"></Icon>
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem>
              <Button type="primary" :loading="isLoading" @click="getImage">
                <span v-if="!isLoading">获取主机截图</span>
                <span v-else>Loading...</span>
              </Button>
            </DropdownItem>
            <DropdownItem v-for="idx of 3" :key="idx">
              <Button type="primary" :loading="isLoading" @click="getImage">
                <span v-if="!isLoading">获取{{idx}}号僚机截图</span>
                <span v-else>Loading...</span>
              </Button>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown> -->
      </div>
    </div>
  </Card>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { blobToDataURL, addSuffix, cypressGet, cypressTimeout, suffixRemove } from 'lib/tools.js'
import CONST from 'constant/constant'

export default {
  name: 'ScreenShot',
  props: {
    imgName: Object
  },
  data () {
    return {
      deviceInfoColumns: [
        {
          title: '名称',
          key: 'device_name',
          align: 'center'
        },
        {
          title: '型号',
          key: 'phone_model',
          align: 'center'
        },
        {
          title: '安卓版本',
          key: 'android_version',
          align: 'center'
        },
        {
          title: 'ROM版本',
          key: 'rom_version',
          align: 'center'
        }
      ],
      curImgName: this.imgName.main,
      loading: false
    }
  },
  computed: {
    ...mapState(['isLoading']),
    ...mapGetters('job', ['normalKey']),
    ...mapGetters('unit', ['unitKey']),
    ...mapState('files', ['resFiles', 'curFile']),
    ...mapGetters('files', ['resFilesName']),
    ...mapGetters('item', ['itemType', 'isPicInput', 'isJobResourcePicture', 'itemName']),
    ...mapGetters('device', ['deviceInfo'])
  },
  watch: {
    curFile (val) {
      if (!val) return
      if (CONST.SHOW_SCREEN_SHOOT.has(this.itemType)) {
        this.curImgName = val.name
        let slices = val.name.split('*')
        this.curImgName = suffixRemove(slices.pop())
      }
    },
    imgName: {
      handler: function (val) {
        this.curImgName = this.imgName.main
      },
      deep: true
    }
  },
  methods: {
    showDeviceSelectPage () {
      this.$store.commit('device/setSelectDevice', true)
    },
    handleErrors () {
      let errors = []
      if (!this.deviceInfo.length) errors.push('未选择 device')
      if (this.isJobResourcePicture && !this.curImgName) errors.push('请为图片命名')
      this.curImgName = [this.normalKey, this.unitKey, this.itemName, 'cypress'].join('*')
      if (this.curImgName.includes('*') || this.curImgName.includes('.')) errors.push('名称中不可包含 * 与 .')
      if (errors.length) {
        errors.forEach(error => {
          this.$Message.error({
            background: true,
            content: error
          })
        })
      }
      return !errors.length
    },
    getImage () {
      if (this.handleErrors()) {
        this.$store.commit('files/handleCurFile', { action: 'removeCurFile' })
        this.$store.commit('setIsLoading', true)
        let screenShotName = addSuffix(this.curImgName.trim(), '.png')
        if (this.isJobResourcePicture) {

        }
        let screenShotParams = {
          cabinet_ip: this.deviceInfo[0].cabinet_ip_address,
          device_label: this.deviceInfo[0].device_label,
          device_ip: this.deviceInfo[0].ip_address,
          picture_name: screenShotName
        }
        let screenshot = cypressGet({
          url: `http://${screenShotParams.cabinet_ip}:5000/pane/snap_shot/?device_label=${screenShotParams.device_label}&device_ip=${screenShotParams.device_ip}&picture_name=${screenShotParams.picture_name}`,
          responseType: 'blob'
        })
        Promise.race([screenshot, cypressTimeout(20)]).then(({ status, response }) => {
          if (status === 200) {
            // 找到同样前缀文件的位置
            let index = -1
            for (let i = 0; i < this.resFilesName.length; i++) {
              if (this.resFilesName[i].startsWith(this.imgName.prefix)) {
                index = i
                break
              }
            }
            // 将截取的图片设置为当前文件以展示

            blobToDataURL(response).then(res => {
              this.$store.commit('files/handleCurFile', {
                action: 'setCurFile',
                data: {
                  dirty: false,
                  index,
                  name: `${this.imgName.prefix}${this.curImgName.trim()}.png`,
                  file: res,
                  type: 'png'
                }
              })
              // if (this.isPicInput) {
              //   this.$store.commit('files/addResFile', {
              //     name: `ForPointSelect_${Math.random().toString(36).substr(2, 6)}.png`,
              //     type: 'png',
              //     file: res
              //   })
              // }
            })
          }
        }).catch(err => {
          console.log('error', err)
          this.$Notice.error({
            title: '截图失败',
            desc: '请检查您的设备',
            duration: 4
          })
        }).finally(() => {
          this.$store.commit('setIsLoading', false)
        })
      }
    },
    setImgName () {
      this.$emit('setImgName', this.curImgName.trim())
    }
  }
}
</script>

<style lang="less" scoped>
  @import '../../css/common.less';
  .screen-shot-container {
    /deep/ .ivu-card-head {
      border-bottom: 0;
      & > .ivu-divider {
        margin: 0;
      }
    }
    /deep/ .ivu-card-body {
      padding: 0 1em 1em;
    }
    .screen-shot-body {
      & > * {
        margin-bottom: 1em;
      }
      & > div:last-child {
        margin-bottom: 0;
      }
      & > div:nth-child(2) {
        display: flex;
        justify-content: space-between;
        & > div:first-child {
          flex: 1;
        }
      }
    }
  }
</style>
