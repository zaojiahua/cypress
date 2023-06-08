<template>
  <Layout class="layout">
    <Header class="header">
      <Menu mode="horizontal" theme="dark" class="flex-row">
        <div class="logo flex-row" @click="showModal=true">
          <b>TMach</b><span>®</span>
        </div>
        <div class="flex-row">
          <div class="countdown" v-if="countdown">
            {{$t('layout.release')}}：
            <Countdown
              ref="countdown"
              :totalTime="totalTime" :remindTime="remindTime"
              @remind="remind" @timeout="releaseDevice"
            ></Countdown>
            <ButtonGroup vertical class="countdown-pane">
              <Button icon="ios-trash-outline" long @click="releaseDevice(false)">{{$t('layout.btn_1')}}</Button>
              <Button icon="ios-add" long @click="extendTime">{{$t('layout.btn_2')}}</Button>
            </ButtonGroup>
          </div>
          <MenuItem name="1">
            {{ username }}
          </MenuItem>
          <MenuItem name="3" @click.native="logout">
            {{$t('layout.login_out')}}
            <Icon type="ios-exit-outline" size="24">
            </Icon>
          </MenuItem>
        </div>
      </Menu>
    </Header>
    <Layout>
      <Sider collapsible :width="isCollapsed ? 78 : 110" v-model="isCollapsed" class="sider">
        <Menu :active-name="$route.name" ref="menu" theme="dark" width="auto"
        :class="['sider-menu', this.isCollapsed ? 'sider-menu-collapsed' : '']">
          <MenuItem name="jobList" @click.native="viewJobList" :title="$t('layout.jobManagement')">
            <Icon type="logo-buffer"></Icon>
            <span>{{$t('layout.jobManagement')}}</span>
          </MenuItem>
          <MenuItem v-show="isNotAdmin()&&($route.name!=='jobEditor')" name="createJob" @click.native="viewJobCreate" :title="$t('layout.jobEdit')">
            <Icon type="ios-create"></Icon>
            <span>{{$t('layout.jobEdit')}}</span>
          </MenuItem>
          <MenuItem v-show="isNotAdmin()&&($route.name==='jobEditor')" name="jobEditor" @click.native="viewJobCreate" :title="$t('layout.jobEdit')">
            <Icon type="ios-create"></Icon>
            <span>{{$t('layout.jobEdit')}}</span>
          </MenuItem>
        </Menu>
      </Sider>
      <Layout class="main">
        <Content>
          <transition name="fade" mode="out-in">
            <keep-alive include="jobList">
              <router-view/>
            </keep-alive>
          </transition>
          <job-msg-component></job-msg-component>
        </Content>
      </Layout>
    </Layout>
    <Modal v-model="showModal" :closable="false" :mask-closable="false"  width="360" footer-hide>
      <Form :label-width="120">
        <FormItem style="margin-top: 10px">
          <b slot="label">Cypress version：</b>
          <p>3.8</p>
        </FormItem>
      </Form>
      <p style="text-align: center">
        <Button type="primary"  @click="showModal = false">{{$t('public.btn_close')}}</Button>
      </p>
    </Modal>
  </Layout>
</template>
<script>
import { mapState } from 'vuex'
import CONST from 'constant/constant'
import jobMsgComponent from '_c/jobMsgComponent'
import Countdown from '_c/common/Countdown'
import axios from '../api'
import { controlDevice, releaseOccupyDevice } from 'api/reef/request'

export default {
  components: { jobMsgComponent, Countdown },
  data () {
    return {
      showModal:false,
      isCollapsed: true,
      username: sessionStorage.username,
      totalTime: 30,
      remindTime: 5
    }
  },
  computed: {
    ...mapState('device', ['countdown', 'deviceInfo'])
  },
  methods: {
    isNotAdmin() {
      return !sessionStorage.groups.includes('Admin')
    },
    logout () {
      let _this = this
      if (this.isTrigger()) {
        this.$Modal.confirm({
          title: _this.$t('layout.loginOutTit'),
          onOk: () => {
            this.$Loading.start()
            // 登出后不能通过后退键回到TMach操作页面中
            CONST.USER_INFO.forEach((val) => {
              sessionStorage.removeItem(val)
              localStorage.removeItem(val)
            })
            this.$router.push({ name: 'login' })
            this.$Message.success(_this.$t('layout.loginOutSuccess'))
            this.$Loading.finish()
          }
        })
    }
    },
    viewJobList () {
      if (this.isTrigger()) this.$router.push({ name: 'jobList' })

    },
    viewJobCreate () { // 路由跳转到jobEditor页面
      if (this.isTrigger()) this.$router.push({name:'createJob'})
    },
    isTrigger() { // 当处于jobEditor时，页面跳转给予警告
      if (this.$route.name === 'jobEditor') {
        return  window.confirm(this.$t('layout.title_1'))
      } else {
        return true
      }
    },
    async releaseDevice (auto = true) {
      try {
        let { status } = await releaseOccupyDevice({
          device_id_list: [this.deviceInfo.id]
        })
        if (status === 200 && auto) {
          this.$Notice.info({
            title: this.$t('layout.modalTit_1'),
            desc: this.$t('layout.modalTit_2'),
            duration: 0
          })
          this.$Modal.remove()
        } else if (status === 200 && !auto) {
          this.$Message.success({
            background: true,
            content: this.$t('layout.modalTit_3')
          })
        }
      } catch (error) {
        this.$Notice.error({
          title: this.$t('layout.modalTit_4'),
          duration: 0
        })
      } finally {
        this.$store.commit('device/setCountdown')
        this.$store.commit('device/clearDeviceInfo')
        this.$store.commit('device/clearPreDeviceInfo')
      }
    },
    async extendTime () { // 设备占用延时
      // eslint-disable-next-line camelcase
      let { id, device_name } = this.deviceInfo
      let url = "api/v1/cedar/device/"+id+"/?fields=id,status"
      await axios.request({ url }).then(response=>{
        if(response.data.status === "occupied"){
          controlDevice({
            device_id_list: [id],
            occupy_type: 'job_editor'
          }).then(res=>{
            if(res.status===200){
              this.$refs.countdown.restart()
              this.$Message.success({
                background: true,
                // eslint-disable-next-line camelcase
                content: this.$t('layout.modalTit_5')+` ${device_name}`
              })
            }
          }).catch(err=>{
            if(err.response.status>=500)
              this.$Message.error(this.$t('public.error_500'))
            else
              this.$Message.error(this.$t('layout.modalTit_6'))
          })
        }else{
          this.$Message.error({content:this.$t('layout.device')+ response.data.status +this.$t('layout.modalTit_7'),duration:6})
          this.$store.commit('device/setCountdown')
          this.$store.commit('device/clearDeviceInfo')
          this.$store.commit('device/clearPreDeviceInfo')
        }

      }).catch(error=>{
        if(error.response.status>=500)
          this.$Message.error(this.$t('public.error_500'))
        else
          this.$Message.error({content:error.response.data.description,duration:6})
      })
    },
    remind () {
      let _this = this
      this.$Modal.confirm({
        title: this.$t('layout.title_2'),
        content: this.$t('layout.modalTit_8')+` ${this.remindTime} `+this.$t('layout.modalTit_9'),
        okText: this.$t('layout.modalTit_10'),
        cancelText: this.$t('public.btn_cancel'),
        async onOk () {
          _this.extendTime()
        }
      })
    },
    setHeight () {
      // if (!this.contentDom) this.contentDom = document.querySelector('.content')
      // let { innerHeight } = window
      // this.contentDom.style.height = `${innerHeight - 64}px`
    }
  },
  mounted () {
    if (localStorage.getItem('device-management:DEFAULT_PAGE_SIZE') === undefined ||
      isNaN(parseInt(localStorage.getItem('device-management:DEFAULT_PAGE_SIZE'))) ){
        localStorage.setItem('device-management:DEFAULT_PAGE_SIZE', 20)
    }
    this.$Message.config({
      duration: 3
    })
    // this.setHeight()
    // window.addEventListener('resize', this.setHeight)
  }
}
</script>

<style lang="less" scoped>
@import '../css/common.less';
.layout {
  font-size: 16px;
  .header {
    padding: 0;
    .logo {
      position: relative;
      font-size: 1rem;
      width: 7em;
      height: 4em;
      padding: 0 0.8em;
      cursor: pointer;
      color: @logoColor;
      font-weight: @logoWeight;
      b {
        font-size: 1.5rem;
        letter-spacing: 1px;
      }
      span {
        position: absolute;
        font-size: 1.25rem;
        right: 0;
        top: -0.4em;
      }
      + div {
        color: rgba(255, 255, 255, .7);
        .countdown {
          position: relative;
          margin-right: 1em;
          &-pane {
            visibility: hidden;
            position: absolute;
            left: 0;
            bottom: -100%;
            width: 100%;
            opacity: 0;
            transition: all .3s linear;
          }
          &:hover .countdown-pane {
            opacity: 1;
            visibility: visible;
          }
        }
      }
    }
  }
  .sider {
    &-menu {
      li {
        display: flex;
        padding: 1em;
        justify-content: center;
        align-items: center;
        span {
          display: inline-block;
          width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          transition: width .2s ease .2s;
        }
        i {
          transition: font-size .2s ease;
          font-size: 1rem;
        }
      }
    }
    &-menu-collapsed {
      li {
        span { width: 0; transition: width .2s ease; }
        i {
          transition: font-size .2s ease .2s;
          font-size: 1.375rem;
        }
      }
    }
  }
  .main {
    height: calc(100vh - 4em);
    padding: 1em;
    background-color: @lightBGC;
  }
}
</style>
