<template>
  <Layout class="layout">
    <Header class="header">
      <Menu mode="horizontal" theme="dark" class="flex-row">
        <div class="logo flex-row">
          <b>TMach</b><span>®</span>
        </div>
        <div class="flex-row">
          <div class="countdown" v-if="countdown">
            距设备释放还有：
            <Countdown
              ref="countdown"
              :totalTime="totalTime" :remindTime="remindTime"
              @remind="remind" @timeout="releaseDevice"
            ></Countdown>
            <ButtonGroup vertical class="countdown-pane">
              <Button icon="ios-trash-outline" long @click="releaseDevice(false)">提前释放</Button>
              <Button icon="ios-add" long @click="extendTime">延期使用</Button>
            </ButtonGroup>
          </div>
          <MenuItem name="1">
            {{ username }}
          </MenuItem>
          <MenuItem name="3" @click.native="logout">
            登出
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
          <MenuItem name="jobList" @click.native="viewJobList" title="用例管理">
            <Icon type="logo-buffer"></Icon>
            <span>用例管理</span>
          </MenuItem>
          <MenuItem v-show="isNotAdmin()&&($route.name!=='jobEditor')" name="createJob" @click.native="viewJobCreate" title="用例编辑">
            <Icon type="ios-create"></Icon>
            <span>用例编辑</span>
          </MenuItem>
          <MenuItem v-show="isNotAdmin()&&($route.name==='jobEditor')" name="jobEditor" @click.native="viewJobCreate" title="用例编辑">
            <Icon type="ios-create"></Icon>
            <span>用例编辑</span>
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
      if (this.isTrigger()) {
        this.$Modal.confirm({
          title: '您确定要登出?',
          onOk: () => {
            this.$Loading.start()
            // 登出后不能通过后退键回到TMach操作页面中
            CONST.USER_INFO.forEach((val) => {
              sessionStorage.removeItem(val)
              localStorage.removeItem(val)
            })
            this.$router.push({ name: 'login' })
            this.$Message.success('登出成功!')
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
        return  window.confirm('确定要离开该页面吗？会导致编辑的内容丢失。')
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
            title: '到期提醒',
            desc: '占用时间耗尽，设备已自动释放',
            duration: 0
          })
          this.$Modal.remove()
        } else if (status === 200 && !auto) {
          this.$Message.success({
            background: true,
            content: '设备释放成功'
          })
        }
      } catch (error) {
        this.$Notice.error({
          title: '设备释放失败',
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
                content: `延期占用设备 ${device_name}`
              })
            }
          }).catch(err=>{
            if(err.response.status>=500)
              this.$Message.error("服务器错误")
            else
              this.$Message.error("延期占用失败")
          })
        }else{
          this.$Message.error({content:"设备为"+ response.data.status +"状态，无法延期",duration:6})
          this.$store.commit('device/setCountdown')
          this.$store.commit('device/clearDeviceInfo')
          this.$store.commit('device/clearPreDeviceInfo')
        }

      }).catch(error=>{
        if(error.response.status>=500)
          this.$Message.error("服务器错误")
        else
          this.$Message.error({content:error.response.data.description,duration:6})
      })
    },
    remind () {
      let _this = this
      this.$Modal.confirm({
        title: '延期提醒',
        content: `距自动释放设备还剩 ${this.remindTime} 分钟，要延长设备占用时间吗？`,
        okText: '延期',
        cancelText: '取消',
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
