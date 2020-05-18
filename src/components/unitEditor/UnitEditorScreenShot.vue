<template>
  <div class="screen-shot">
    <Button @click="showDeviceSelectPage" type="primary" class="select-device">选取设备</Button>
    <Divider orientation="left">获取图片</Divider>
    <Table
      border
      size="small"
      :columns="deviceInfoColumns"
      :data="deviceInfo"
    ></Table>
    <div class="get-image">
      <div>
        <Input v-model="currentImageName" v-if="!isPicInput" @input="setImageName">
          <span slot="prepend">图片名称</span>
        </Input>
      </div>
      <Button type="primary" :loading="isLoading" @click="getImage">
        <span v-if="!isLoading">获取截图</span>
        <span v-else>Loading...</span>
     </Button>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { getScreenShot } from 'api/coral/jobLibSvc.js'
import { blobToDataURL, suffixAutoComplete } from 'lib/tools.js'
export default {
  name: 'ScreenShot',
  props: {
    imageName: String
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
      currentImageName: this.imageName,
      loading: false
    }
  },
  computed: {
    ...mapState([
      'isLoading'
    ]),
    ...mapGetters('item', [
      'itemType',
      'isPicInput',
      'isJobResourcePicture'
    ]),
    ...mapGetters('device', [
      'deviceInfo'
    ])
  },
  methods: {
    showDeviceSelectPage () {
      this.$store.commit('device/setSelectDevice', true)
    },
    handleErrors () {
      let errors = []
      if (!this.deviceInfo.length) errors.push('未选择 device')
      if (this.isJobResourcePicture && !this.currentImageName) errors.push('请为图片命名')
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
        this.$store.commit('files/removeCurrentFile')
        this.$store.commit('setIsLoading', true)
        let screenShotName = suffixAutoComplete(this.currentImageName, '.png')
        if (this.isJobResourcePicture) {

        }
        let getScreenShotParams = {
          device_label: this.deviceInfo[0].device_label,
          device_ip: this.deviceInfo[0].ip_address,
          picture_name: screenShotName
        }
        let screenshot = new Promise((resolve, reject) => {
          getScreenShot(getScreenShotParams, this.deviceInfo[0].cabinet_ip_address).then(res => resolve(res)).catch(err => reject(err))
        })
        var timeout = new Promise((resolve, reject) => {
          setTimeout(reject, 20000, 'timeout')
        })
        Promise.race([screenshot, timeout]).then(({ status, data }) => {
          if (status === 200) {
            blobToDataURL(data).then(res => {
              if (this.isJobResourcePicture) {
                this.$store.commit('files/addResFile', {
                  name: screenShotName,
                  type: 'png',
                  file: res
                })
              }
              if (this.isPicInput) {
                this.$store.commit('files/setCurrentFile', {
                  byName: false,
                  currentFileInfo: {
                    name: '选点用图',
                    type: 'png',
                    file: res
                  }
                })
              }
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
    setImageName () {
      this.$emit('setImageName', this.currentImageName)
    }
  }
}
</script>

<style lang="less" scoped>
  .screen-shot {
    position: relative;
    margin-bottom: 10px;
    .select-device {
      position: absolute;
      top: -4px;
      right: 0;
      z-index: 2;
    }
    .get-image {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
      & > div {
        display: flex;
        align-items: center;
        width: 60%;
      }
    }
  }
</style>
