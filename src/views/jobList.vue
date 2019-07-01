<template>
  <div>
    <Tabs type="card" class="tabs">
      <!--可以循环遍历数据 -->
      <TabPane label="适用机型">
        <CheckboxGroup>
          <Row type="flex">
            <Col span="4"><Checkbox label="aaa"></Checkbox></Col>
            <Col span="4"><Checkbox>sdj</Checkbox></Col>
            <Col span="4"><Checkbox>sfa</Checkbox></Col>
            <Col span="4"><Checkbox>aeaw</Checkbox></Col>
            <Col span="4"><Checkbox>adf</Checkbox></Col>
            <Col span="4"><Checkbox>SDF</Checkbox></Col>
            <Col span="4"><Checkbox>aaa</Checkbox></Col>
          </Row>
        </CheckboxGroup>
      </TabPane>
      <TabPane label="测试用例">
        <CheckboxGroup>
          <Row type="flex">
            <Col span="4"><Checkbox label="aaa"></Checkbox></Col>
            <Col span="4"><Checkbox label="aaa">sdj</Checkbox></Col>
            <Col span="4"><Checkbox>sfa</Checkbox></Col>
            <Col span="4"><Checkbox>aeaw</Checkbox></Col>
            <Col span="4"><Checkbox>adf</Checkbox></Col>
            <Col span="4"><Checkbox>SDF</Checkbox></Col>
            <Col span="4"><Checkbox label="a567a">aaa</Checkbox></Col>
          </Row>
        </CheckboxGroup>
      </TabPane>
      <TabPane label="安卓版本">
        <CheckboxGroup>
          <Row type="flex">
            <Col span="4"><Checkbox label="aaa"></Checkbox></Col>
            <Col span="4"><Checkbox label="aaa">sdj</Checkbox></Col>
            <Col span="4"><Checkbox>sfa</Checkbox></Col>
            <Col span="4"><Checkbox>aeaw</Checkbox></Col>
            <Col span="4"><Checkbox>adf</Checkbox></Col>
            <Col span="4"><Checkbox>adf</Checkbox></Col>
            <Col span="4"><Checkbox>aeaw</Checkbox></Col>
            <Col span="4"><Checkbox>adf</Checkbox></Col>
            <Col span="4"><Checkbox>SDF</Checkbox></Col>
            <Col span="4"><Checkbox label="a567a">aaa</Checkbox></Col>
          </Row>
        </CheckboxGroup>
      </TabPane>
      <TabPane label="Rom版本">
        <CheckboxGroup>
          <Row type="flex">
            <Col span="4"><Checkbox label="aaa"></Checkbox></Col>
            <Col span="4"><Checkbox label="aaa">sdj</Checkbox></Col>
            <Col span="4"><Checkbox>sfa</Checkbox></Col>
            <Col span="4"><Checkbox>aeaw</Checkbox></Col>
            <Col span="4"><Checkbox>adf</Checkbox></Col>
            <Col span="4"><Checkbox>adf</Checkbox></Col>
            <Col span="4"><Checkbox>aeaw</Checkbox></Col>
            <Col span="4"><Checkbox>adf</Checkbox></Col>
            <Col span="4"><Checkbox>SDF</Checkbox></Col>
            <Col span="4"><Checkbox label="a567a">aaa</Checkbox></Col>
          </Row>
        </CheckboxGroup>
      </TabPane>
      <TabPane label="安卓版本">
        <CheckboxGroup>
          <!-- justify="space-between"-->
          <Row type="flex">
            <Col span="4"><Checkbox label="aaa"></Checkbox></Col>
            <Col span="4"><Checkbox label="aaa">sdj</Checkbox></Col>
            <Col span="4" ><Checkbox>sfa</Checkbox></Col>
            <Col span="4"><Checkbox>aeaw</Checkbox></Col>
            <Col span="4"><Checkbox>adf</Checkbox></Col>
            <Col span="4"><Checkbox>adf</Checkbox></Col>
            <Col span="4"><Checkbox>aeaw</Checkbox></Col>
            <Col span="4"><Checkbox>adf</Checkbox></Col>
            <Col span="4"><Checkbox>SDF</Checkbox></Col>
            <Col span="4"><Checkbox label="a567a">aaa</Checkbox></Col>
          </Row>
        </CheckboxGroup>
      </TabPane>
    </Tabs>

    <!--6个标签的颜色 可循环遍历设置-->
    <div style="margin-top: 60px; border-bottom: 1px solid #dcdee2;">
      <Tag color="default">适用机型</Tag>
      <Tag color="red">测试用途</Tag>
      <Tag color="orange">安卓版本</Tag>
      <Tag color="cyan">ROM版本</Tag>
      <Tag color="blue">维护人员</Tag>
      <Tag color="purple">自定义标签</Tag>
    </div>

    <!--少了中间选中的展示-->
    <Button style="margin: 30px 0px;">清空</Button>
    <Divider style="margin-top: -6px"/>
    <Row>
      <Button icon="ios-cloud-upload-outline">导入用例</Button>
      <!--<Upload action="//jsonplaceholder.typicode.com/posts/">
        <Button icon="ios-cloud-upload-outline">导入用例</Button>
      </Upload>-->
      <Button type="error" style="float: right;margin-right: 20px">批量删除</Button>
      <Button type="success" style="float: right;margin-right: 20px">导出用例</Button>
    </Row>
    <Divider  style="margin-top: 40px"/>

    <div>
      <Table ref="selection" :columns="columns" :data="jobData" @on-row-click="onRowClick"></Table>
    </div>

    <Page simple :page-size="pageSize" :total="dataCount" @on-change="jobPageChange" style="text-align: center;margin-top: 20px"></Page>
    <Drawer title="用例详细信息" :closable="false" v-model="showDrawer" width="50">
      <job-msg-component ref="jobDetail"></job-msg-component>
    </Drawer>
  </div>
</template>

<script>
import util from '../lib/util/validate.js'
import { getJobList } from '../api/reef/job'
import jobMsgComponent from '../components/jobMsgComponent'

const jobSerializer = [
  {
    custom_tag: [
      {
        id: 'number',
        custom_tag_name: 'string'
      }
    ],
    id: 'number',
    job_name: 'string',
    test_area: [
      {
        id: 'number',
        description: 'string'
      }
    ]
  }
]

export default {
  name: 'jobList',
  components: {
    jobMsgComponent
  },
  data () {
    return {
      showDrawer: false, // 侧滑栏是否打开
      pageSize: 10, // 每页条数
      currentPage: 1, // 当前页数
      dataCount: 0,
      jobCurrentId: null,
      jobMsgLoad: false,
      columns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: '用例名称',
          key: 'job_name'
        },
        {
          title: '测试用途',
          key: 'text_area'
        },
        {
          title: '自定义标签',
          key: 'custom_tag'
        }
      ],
      jobData: util.validate(jobSerializer, [])
    }
  },
  methods: {
    getMsg () { // 每个页面的请求数据
      getJobList({// 向路径后拼接参数
        fields: 'id,job_name,test_area,custom_tag,custom_tag.custom_tag_name,custom_tag.id,test_area.description,test_area.id',
        offset: this.offset,
        limit: this.pageSize,
        job_deleted: 'False'
      }).then(res => { // 一次只获取10条数据
        this.dataCount = parseInt(res.headers['total-count'])

        this.jobData = util.validate(jobSerializer, res.data.jobs)
        this.jobData.forEach(job => { // 遍历后返回返回的值
          let jobTextAreas = []
          job.test_area.forEach(jobTextArea => {
            jobTextAreas.push(jobTextArea.description)
          })

          let jobCustomTags = []
          job.custom_tag.forEach(jobCustomTag => {
            jobCustomTags.push(jobCustomTag.custom_tag_name)
          })

          job.text_area = jobTextAreas.join(',')
          job.custom_tag = jobCustomTags.join(',')
        })
      }).catch(error => {
        console.log(error)
      })
    },
    jobPageChange (page) {
      this.currentPage = page
      this.getMsg()
    },
    onRowClick (currentData, index) { // 单击表格某一行
      this.$emit('on-row-click', currentData, index)
      this.showDrawer = true
      this.jobMsgLoad = true
      // this.jobCurrentId = currentData.id
      // this.jobCurrentId = currentData.id
      this.$refs.jobDetail.getMsg(currentData.id)
    }
  },
  computed: {
    offset () { // 从某位置开始 返回当前下标
      return (this.currentPage - 1) * this.pageSize
    }
  },
  mounted () {
    this.getMsg()
  }
}
</script>

<style scoped>

</style>
