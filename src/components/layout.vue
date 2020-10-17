<template>
  <Layout class="layout">
    <Header class="header">
      <Menu mode="horizontal" theme="dark" class="flex-row">
        <div class="logo flex-row">
          <b>ANGELREEF</b><span>®</span>
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
          <MenuItem name="2" to="about">
            关于TMach
            <Icon type="ios-help-circle-outline" size="24"/>
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
          <MenuItem name="jobEditor" @click.native="enterJobEditor" title="用例编辑">
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
import { controlDevice, releaseOccupyDevice } from 'api/reef/request'

export default {
  components: { jobMsgComponent, Countdown },
  data () {
    return {
      isCollapsed: true,
      username: localStorage.username,
      totalTime: 30,
      remindTime: 5
    }
  },
  computed: {
    ...mapState('job', ['jobInfo', 'preJobInfo', 'isValidated']),
    ...mapState('device', ['countdown', 'deviceInfo'])
  },
  methods: {
    logout () {
      this.$Modal.confirm({
        title: '您确定要登出?',
        onOk: () => {
          this.$Loading.start()
          this.$router.push({ name: 'login' })
          this.$Message.success('登出成功!')
          this.$Loading.finish()
          // 登出后不能通过后退键回到TMach操作页面中
          CONST.USER_INFO.forEach((val) => {
            sessionStorage.removeItem(val)
            localStorage.removeItem(val)
          })
        }
      })
    },
    viewJobList () {
      if (this.$route.name === 'jobEditor') {
        this.$store.commit('job/setPreJobInfo', true)
      }
      this.$router.push({ path: '/jobList' })
    },
    enterJobEditor () {
      let routeOptions = { name: 'jobEditor' }
      if (JSON.stringify(this.jobInfo) !== '{}') {
        routeOptions.query = { jobId: this.jobInfo.job_id }
      } else if (this.preJobInfo) {
        routeOptions.query = { jobId: this.preJobInfo.job_id }
        this.$store.commit('job/recoverJobInfo')
      } else {
        this.$store.commit('job/setJobInfo', {})
      }
      setTimeout(() => {
        if (!this.isValidated) {
          this.$store.commit('handleShowDrawer')
        }
      }, 600)
      this.$router.push(routeOptions)
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
        this.$store.commit('device/clearPreDeviceInfo')
      }
    },
    async extendTime () {
      // eslint-disable-next-line camelcase
      let { id, device_name } = this.deviceInfo
      try {
        let { status } = await controlDevice({
          device_id_list: [id],
          occupy_type: 'job_editor'
        })
        if (status === 200) {
          this.$refs.countdown.restart()
          this.$Message.success({
            background: true,
            // eslint-disable-next-line camelcase
            content: `延期占用设备 ${device_name}`
          })
        }
      } catch (error) {
        console.log(error)
      }
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
      width: 12.5em;
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
