<template>
  <Layout class="container">
    <Header style="padding: 0;">
      <Menu mode="horizontal" theme="dark" class="header-menu">
        <div class="logo">
          <b>ANGELREEF</b><span>®</span>
        </div>
        <div class="menu-list">
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
          <nav>
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
          </nav>
        </div>
      </Menu>
    </Header>
    <Layout>
      <Sider collapsible :width="isCollapsed ? 78 : 110" v-model="isCollapsed" class="sider">
        <Menu :active-name="$route.name" ref="menu" theme="dark" width="auto"
        :class="['menu-item', this.isCollapsed ? 'collapsed-menu' : '']">
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
      <Content class="content">
        <transition name="fade" mode="out-in">
          <keep-alive include="jobList">
            <router-view/>
          </keep-alive>
        </transition>
        <job-msg-component></job-msg-component>
      </Content>
    </Layout>
  </Layout>
</template>
<script>
import { mapState } from 'vuex'
import jobMsgComponent from '_c/jobMsgComponent'
import Countdown from '_c/common/Countdown'
import { controlDevice, releaseOccupyDevice } from 'api/reef/device'

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
          sessionStorage.removeItem('token')
          localStorage.removeItem('token')
          sessionStorage.removeItem('identity')
          localStorage.removeItem('identity')
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
        this.$store.commit('job/recoverJobInfo')
        routeOptions.query = { jobId: this.preJobInfo.job_id }
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
      if (!this.contentDom) this.contentDom = document.querySelector('.content')
      let { innerHeight } = window
      this.contentDom.style.height = `${innerHeight - 64}px`
    }
  },
  mounted () {
    this.$Message.config({
      duration: 3
    })
    this.setHeight()
    window.addEventListener('resize', this.setHeight)
  }
}
</script>

<style lang="less" scoped>
@import '../css/common.less';
.container {
  height: 100%;
  .header-menu {
    height: 100%;
    .logo {
      position: relative;
      font-size: 1rem;
      height: 4em;
      width: 12.5em;
      margin-left: 0.8em;
      color: @logoColor;
      text-align: center;
      b {
        font-size: 1.5em;
        font-weight: @logoWeight;
        letter-spacing: 0.0625em;
      }
      span {
        position: absolute;
        top: -0.625em;
        right: 0;
        font-size: 1.25em;
        font-weight: @logoWeight;
      }
    }
    .menu-list {
      .countdown {
        position: relative;
        color: rgba(255,255,255,.7);
        margin-right: 1.25em;
        .countdown-pane {
          visibility: hidden;
          position: absolute;
          bottom: -100%;
          left: 0;
          width: 100%;
          opacity: 0;
          transition: all .2s linear;
        }
        &:hover .countdown-pane {
          visibility: visible;
          opacity: 1;
        }
      }
    }
  }
  .sider {
    .menu-item {
      li { padding-left: 1em; padding-right: 0.6em; }
      span {
        display: inline-block;
        width: 4.3125em;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        vertical-align: bottom;
        transition: width .2s ease .2s;
      }
      i {
        transform: translateX(0px);
        vertical-align: middle;
        font-size: 1em;
        transition: font-size .2s ease, transform .2s ease;
      }
    }
    .collapsed-menu {
      span { width: 0; transition: all .2s ease; }
      i {
        transform: translateX(8px);
        font-size: 1.375em;
        transition: font-size .2s ease .2s, transform .2s ease .2s;
      }
    }
  }
  .content {
    padding: 1em;
    background-color: @lightBGC;
  }
}
</style>
