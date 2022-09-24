<template>
  <div class="screen-shot-container">
    <!-- title -->
    <!-- body -->
    <div class="screen-shot-body">
      <Table
        border
        size="small"
        :columns="deviceInfoColumns"
        :data="deviceInfo"
      ></Table>
      <div class="child-m-right--1">
        <Button
          @click="showDeviceSelectPage" type="success"
        >选取设备</Button>
        <Button type="primary" :loading="isLoading" @click="getImage">
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
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { blobToDataURL, cypressGet, cypressTimeout } from 'lib/tools.js'

export default {
  name: 'ScreenShot',
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
    ...mapGetters('device', ['deviceInfo']),
    ...mapState('unit', ['unitData']),
    imgName () {
      return `${[this.normalKey, this.unitKey, this.itemName].join('_')}.png`
    }
  },
  methods: {
    showDeviceSelectPage () {
      this.$store.commit('device/setSelectDevice', true)
      this.$store.commit('device/setControlDeviceFlag', true)
    },
    handleErrors () {
      let errors = []
      if (!this.deviceInfo.length) errors.push('未选择设备')
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
        if (this.isJobResourcePicture) {

        }
        let screenShotParams = {
          cabinet_ip: this.deviceInfo[0].cabinet_ip_address,
          device_label: this.deviceInfo[0].device_label,
          device_ip: this.deviceInfo[0].ip_address,
          picture_name: this.imgName
        }
        let deviceCondition = ''
        if(this.unitData.unitMsg && this.unitData.unitMsg.assistDevice)
          deviceCondition = '&assist_device=' + this.unitData.unitMsg.assistDevice
        let screenshot = cypressGet({
          url: `http://${screenShotParams.cabinet_ip}:5000/pane/snap_shot/?device_label=${screenShotParams.device_label}&device_ip=${screenShotParams.device_ip}&picture_name=${screenShotParams.picture_name}${deviceCondition}`,
          responseType: 'blob'
        })
        Promise.race([screenshot, cypressTimeout(20)]).then(({ status, response }) => {
          if (status === 200) {
            if(response.type==="application/json"){
              let data = response
              let reader = new FileReader()
              reader.readAsText(data,'utf-8')
              reader.addEventListener("loadend", function (){
                data = JSON.parse(reader.result )
              })
              if(data.error_code!==0){
                this.$Notice.error({
                  title: '截图失败',
                  desc: '请检查您的设备',
                  duration: 4
                })
              }
              return
            }
            this.$emit('handleImgName', this.imgName)
            // 找到同样前缀文件的位置
            let index = -1
            for (let i = 0; i < this.resFilesName.length; i++) {
              if (this.resFilesName[i].startsWith(this.imgName)) {
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
                  name: this.imgName,
                  file: res,
                  type: 'png'
                }
              })
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
        justify-content: flex-end;
        & > div:first-child {
          flex: 1;
        }
      }
      /deep/ .ivu-table > .ivu-table-overflowX {
        overflow-x: hidden;
      }
      /deep/.ivu-table .ivu-table-tip {
        overflow-x: hidden;
      }
    }
  }
</style>
