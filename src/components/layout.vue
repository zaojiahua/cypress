<template>
  <div class="layout">
    <Layout  style="height: 100vh">
      <Header>
        <Menu mode="horizontal" theme="dark">
          <!--<Icon @click.native="collapsedSider" :class="rotateIcon" :style="{margin: '0 20px'}" type="md-menu" size="24"></Icon>-->
          <div class="layout-logo">
            <b>ANGELREEF</b>
            <span>®</span>
          </div>
          <div style="float: right">
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
              to="jobList"
            >
              <Icon type="logo-buffer"></Icon>
              <span>用例管理</span>
            </MenuItem>
            <MenuItem name="jobEditor" @click.native="createJob" to="jobEditor">
              <Icon type="ios-create"></Icon>
              <span>创建用例</span>
            </MenuItem>
          </Menu>
        </Sider>
        <Content :style="{padding: '15px', minHeight: '280px', background: '#fff' }">
          <!-- 将需要被缓存的组件的name传入 -->
          <!-- <keep-alive :include="$store.state.keepAliveComponents"> -->
            <router-view/>
          <!-- </keep-alive> -->
        </Content>
      </Layout>
    </Layout>
    <job-msg-component></job-msg-component>
  </div>
</template>
<script>
import jobMsgComponent from '../components/jobMsgComponent'

export default {
  components: { jobMsgComponent },
  data () {
    return {
      isCollapsed: true,
      username: localStorage.username
    }
  },
  computed: {
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
    createJob () {
      this.$store.commit('job/setJobInfo', {})
      setTimeout(() => {
        this.$store.commit('handleShowDrawer')
      }, 600)
    }
  }
}
</script>

<style scoped>
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
</style>
