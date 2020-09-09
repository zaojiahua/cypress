<template>
  <div class="layout">
    <Layout  style="height: 100vh">
      <Header>
        <Menu mode="horizontal" theme="dark" class="menu">
          <!--<Icon @click.native="collapsedSider" :class="rotateIcon" :style="{margin: '0 20px'}" type="md-menu" size="24"></Icon>-->
          <div class="layout-logo">
            <b>ANGELREEF</b>
            <span>®</span>
          </div>
          <div style="display: flex;">
            <div class="device-countdown" v-if="this.countdown">
              距设备释放还有：
              <Countdown
                ref="countdown"
                :totalTime="totalTime"
                :remindTime="remindTime"
                @remind="remind"
                @timeout="releaseDevice"
              ></Countdown>
              <div class="device-controller">
                <ButtonGroup vertical>
                  <Button icon="ios-trash-outline" @click="releaseDevice(false)">提前释放</Button>
                  <Button icon="ios-add" @click="extendTime">延期使用</Button>
                </ButtonGroup>
              </div>
            </div>
            <MenuItem name="1">
              {{ username }}
            </MenuItem>
            <MenuItem name="2" @click.native="getSysVersion" to="about">
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
        <Sider collapsible :collapsed-width="78" v-model="isCollapsed">
          <Menu :active-name="$route.name" ref="menu" theme="dark" width="auto" :class="menuitemClasses">
            <MenuItem
              name="jobList"
              style="border-top: 1px solid darkgrey"
              @click.native="viewJob"
            >
              <Icon type="logo-buffer"></Icon>
              <span>用例管理</span>
            </MenuItem>
            <MenuItem name="jobEditor" @click.native="createJob">
              <Icon type="ios-create"></Icon>
              <span>创建用例</span>
            </MenuItem>
          </Menu>
        </Sider>
        <Content :style="{padding: '15px', minHeight: '280px', background: '#fff' }">
          <keep-alive include="jobList">
            <router-view/>
          </keep-alive>
        </Content>
      </Layout>
    </Layout>
    <job-msg-component></job-msg-component>
  </div>
</template>
<script>
import jobMsgComponent from '../components/jobMsgComponent'
import Countdown from './common/Countdown'
import { controlDevice, releaseOccupyDevice } from '../api/reef/device'

import { mapState } from 'vuex'

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
    ...mapState('job', [
      'preJobInfo',
      'isValidated'
    ]),
    ...mapState('device', [
      'countdown',
      'deviceInfo'
    ]),
    rotateIcon () {
      return [
        'menu-icon',
        this.isCollapsed ? 'rotate-icon' : ''
      ]
    },
    menuitemClasses () {
      return [
        'menu-item',
        this.isCollapsed ? 'collapsed-menu' : ''
      ]
    }
  },
  methods: {
    getSysVersion () {},
    collapsedSider () {
      this.$refs.side1.toggleCollapse()
    },
    logout () {
      const self = this
      this.$Modal.confirm({
        title: '您确定要登出?',
        onOk () {
          this.$Loading.start()
          self.$router.push({ name: 'login', query: { redirect: self.$route.fullPath } }
          )
          this.$Message.success('登出成功!')
          this.$Loading.finish()
          // 登出后不能通过后退键回到TMach操作页面中
          sessionStorage.removeItem('token')
          localStorage.removeItem('token')
          sessionStorage.removeItem('identity')
          localStorage.removeItem('identity')
        },
        onCancel () {
          this.$Modal.remove()
        }
      })
    },
    viewJob () {
      this.$store.commit('job/setPreJobInfo', true)
      this.$router.push({ path: '/jobList' })
    },
    createJob () {
      if (this.preJobInfo) {
        this.$store.commit('job/recoverJobInfo')
      } else {
        this.$store.commit('job/setJobInfo', {})
      }
      setTimeout(() => {
        if (!this.isValidated) {
          this.$store.commit('handleShowDrawer')
        }
      }, 600)
      this.$router.push({ path: '/jobEditor' })
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
    }
  },
  mounted () {
    this.$Message.config({
      duration: 3
    })
  }
}
</script>

<style lang="less" scoped>
  .layout{
    background: #f5f7f9;
    position: relative;
    border-radius: 4px;
    overflow: auto;
  }
  .layout-logo{
    color: #1bbc9c;
    height: 64px;
    width: 200px;
    float: left;
    position: relative;
    top: 0;
    left: 0;
    text-align: center;
    border-bottom: #5b5b5b 1px solid;
  }

  .layout-logo b{
    color:#1bbc9c;
    font-size:24px;
    font-weight: 900;
    letter-spacing: 1px;
  }
  .layout-logo span{
    color:#1bbc9c;
    position: absolute;
    font-size: 20px;
    font-weight: 900;
    top:-10px;
    right:0;
  }
  .menu-item span{
    display: inline-block;
    overflow: hidden;
    width: 69px;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: bottom;
    transition: width .2s ease .2s;
  }
  .menu-item i{
    transform: translateX(0px);
    transition: font-size .2s ease, transform .2s ease;
    vertical-align: middle;
    font-size: 16px;
  }
  .collapsed-menu span{
    width: 0;
    transition: width .2s ease;
  }
  .collapsed-menu i{
    transform: translateX(5px);
    transition: font-size .2s ease .2s, transform .2s ease .2s;
    vertical-align: middle;
    font-size: 22px;
  }
  .layout-nav{
    width: 420px;
    margin: 0 auto;
    margin-right: 20px;
  }
  .ivu-layout-header{
    padding: 0;
  }
  .menu {
    display: flex;
    justify-content: space-between;
    .device-countdown {
      position: relative;
      color: rgba(255,255,255,.7);
      margin-right: 20px;
      .device-controller {
        display: none;
        position: absolute;
        right: 0;
        box-shadow: 10px 10px 5px #888888;
        .btn {
          margin: 0;
        }
      }
      &:hover {
        .device-controller {
          display: block;
        }
      }
    }
  }
</style>
