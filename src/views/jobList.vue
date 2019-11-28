<template>
  <div>
    <Divider>用例筛选</Divider>
    <Tabs type="card" class="tabs">
      <!--可以循环遍历数据 -->
      <TabPane v-for="column in filterColumn" :key="column.title" :label="column.title" :class="column.key">
        <CheckboxGroup v-model="filterRules" @on-change="onJobFilterChange">
          <Row type="flex">
            <Col span="4" v-for="(item, index) in filterData[column.key]" :key="index">
              <Checkbox :label="column.key + ':' + index + ':' + item[column.item_key]"><span>{{ item[column.item_key] }}</span></Checkbox>
            </Col>
          </Row>
        </CheckboxGroup>
      </TabPane>
    </Tabs>
    <!--6个标签的颜色 可循环遍历设置-->
    <div style="margin-top: 50px; border-bottom: 1px solid #dcdee2;">
      <Tag color="default">适用机型</Tag>
      <Tag color="red">测试用途</Tag>
      <Tag color="orange">安卓版本</Tag>
      <Tag color="cyan">ROM版本</Tag>
      <Tag color="blue">维护人员</Tag>
      <Tag color="purple">自定义标签</Tag>
    </div>

    <!--中间选中的展示-->
    <Row style="margin-top: 20px; min-height: 30px;">
      <Tag v-for="(label, index) in filterRules" :key="index" :color="colors[label.split(':')[0]]" closable @on-close="close('filterRules', index)">{{ label.split(':')[2] }}</Tag>
    </Row>
    <Button style="margin: 30px 0px;" @click="clearTags('filterRules')">清空</Button>
    <Divider style="margin-top: -6px">已选用例</Divider>
    <Row>
      <Row>
        <Col span="12" style="height: 40px;">
          <Upload ref="upload"
            :show-upload-list="false"
            :format="['zip']"
            :on-format-error="handleFormatError"
            :action="uploadUrl"
            :data="uploadData"
            :on-success="handleUploadSuccess">
            <Button icon="ios-cloud-upload-outline">导入用例</Button>
          </Upload>
        </Col>
        <Col span="12" style="text-align: right; height: 40px;">
          <Button type="error" style="margin-right: 20px;" @click="delSelectedJobs">批量删除</Button>
          <Button type="warning" style="margin-right: 20px;" @click="clearTags('selectedJobs')">清除已选</Button>
          <Button type="success" @click="exportJobs">导出用例</Button>
        </Col>
      </Row>
      <Row span="24"  style="margin-top: 20px; min-height: 60px;">
        <Tag v-for="job in selectedJobs" :key="job.id" @click.native="openDetail(job.id)" closable @on-close="close('selectedJobs', job.id)">{{ job.name }}</Tag>
      </Row>
    </Row>
    <Divider  style="margin-top: 40px">用例列表</Divider>

    <div>
      <Table :loading="loading" ref="jobList" :columns="columns" :data="jobData" @on-row-click="onRowClick" @on-selection-change="selectedJobsChange"></Table>
    </div>

    <Page simple :page-size="pageSize" :total="dataCount" :current="this.currentPage" @on-change="jobPageChange" style="text-align: center;margin-top: 20px"></Page>
    <Drawer title="用例详细信息" :closable="false" v-model="showDrawer" width="50">
      <job-msg-component ref="jobDetail"></job-msg-component>
    </Drawer>
  </div>
</template>

<script>
import util from '../lib/util/validate.js'
import { getPhoneModelList } from '../api/reef/phoneModel'
import { getJobTestAreaList } from '../api/reef/jobTestArea'
import { getAndroidVersionList } from '../api/reef/androidVersion'
import { getRomVersionList } from '../api/reef/romVersion'
import { getReefUserList } from '../api/reef/reefUser'
import { getCustomTagList } from '../api/reef/customTag'
import jobMsgComponent from '../components/jobMsgComponent'
import axios from '../api/index'
import { getSelectedJobs } from '../api/coral/jobLibSvc'
import { jobLibSvcURL } from '../config/index'
import serializer from '../lib/util/jobListSerializer'

export default {
  name: 'jobList',
  components: {
    jobMsgComponent
  },
  data () {
    return {
      filterColumn: [
        {
          title: '适用机型',
          key: 'phone_model',
          item_key: 'phone_model_name'
        }, {
          title: '测试用途',
          key: 'job_test_area',
          item_key: 'description'
        }, {
          title: '安卓版本',
          key: 'android_version',
          item_key: 'version'
        }, {
          title: 'ROM版本',
          key: 'rom_version',
          item_key: 'version'
        }, {
          title: '维护人员',
          key: 'reefuser',
          item_key: 'username'
        }, {
          title: '自定义标签',
          key: 'custom_tag',
          item_key: 'custom_tag_name'
        }
      ],
      filterData: {}, // 提供的筛选条件
      filterRules: [], // 已选的筛选条件
      colors: { // Tag的颜色
        phone_model: 'default',
        job_test_area: 'red',
        android_version: 'orange',
        rom_version: 'cyan',
        reefuser: 'blue',
        custom_tag: 'purple'
      },
      filterUrlParam: '', // 存放筛选用的url params
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
      jobData: util.validate(serializer.jobSerializer, []),
      selectedJobs: {}, // 已选的job
      currentPageJobs: {}, // 当前页面的已选job
      uploadData: { // 上传时附带的额外参数
        requestName: 'importJob'
      },
      loading: false
    }
  },
  methods: {
    getMsg () { // 每个页面的请求数据
      let url =
        'api/v1/cedar/job/?fields=' +
        'id,' +
        'job_label,' +
        'job_name,' +
        'test_area,' +
        'test_area.id,' +
        'test_area.description,' +
        'custom_tag,' +
        'custom_tag.id,' +
        'custom_tag.custom_tag_name' +
        '&limit=' + this.pageSize +
        '&offset=' + this.offset +
        '&job_deleted=False' +
        '&ordering=id' +
        this.filterUrlParam

      axios.request({ url })
        .then(res => {
          this.currentPageJobs = {}
          this.dataCount = parseInt(res.headers['total-count'])

          this.jobData = util.validate(serializer.jobSerializer, res.data.jobs)
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

          // 勾选已选的选项
          this.jobData.forEach((value) => {
            if (this.selectedJobs[value.id] !== undefined) {
              value._checked = true
              this.$set(this.currentPageJobs, value.id, 'exist')
            }
          })
        })
        .catch(err => {
          console.log(err)
        })
    },
    jobPageChange (page) { // 切换页面
      this.loading = true
      this.currentPage = page
      this.getMsg()
      this.loading = false
    },
    onRowClick (currentData, index) { // 单击表格某一行
      // this.$emit('on-row-click', currentData, index)
      this.showDrawer = true
      this.jobMsgLoad = true
      // this.jobCurrentId = currentData.id
      // this.jobCurrentId = currentData.id
      this.$refs.jobDetail.getMsg(currentData.id)
    },
    selectedJobsChange (selection) {
      selection.forEach((value) => {
        if (this.selectedJobs[value.id] === undefined) {
          console.log('勾选了id为' + value.id + '的job')
          this.$set(this.selectedJobs, value.id, { id: value.id, name: value.job_name })
          this.$set(this.currentPageJobs, value.id, 'exist')
        }
      })
      for (let item in this.currentPageJobs) {
        let i = 0
        for (i; i < selection.length; i++) {
          if (parseInt(item) === selection[i].id) {
            break
          }
        }
        if (i === selection.length) {
          console.log('不再勾选id为' + item + '的job')
          this.$delete(this.selectedJobs, item)
          this.$delete(this.currentPageJobs, item)
        }
      }
    },
    close (target, key) {
      switch (target) {
        case 'filterRules':
          this.filterRules.splice(key, 1)
          this.onJobFilterChange()
          break
        case 'selectedJobs':
          try {
            this.jobData.forEach((value, index) => {
              if (key === value.id) {
                this.$refs.jobList.toggleSelect(index)
                throw Error('已找到目标')
              }
            })
          } catch (e) {

          }
          this.$delete(this.selectedJobs, key)
      }
    },
    clearTags (target) {
      switch (target) {
        case 'filterRules':
          this.filterRules = []
          this.onJobFilterChange()
          break
        case 'selectedJobs':
          for (let i = 0; i < this.jobData.length; i++) {
            if (this.selectedJobs[this.jobData[i].id] !== undefined) {
              this.$refs.jobList.toggleSelect(i)
            }
          }
          this.selectedJobs = {}
          this.currentPageJobs = {}
          break
      }
      this.filterRules = []
    },
    openDetail (id) {
      this.showDrawer = true
      this.jobMsgLoad = true
      // this.jobCurrentId = currentData.id
      // this.jobCurrentId = currentData.id
      this.$refs.jobDetail.getMsg(id)
    },
    /**
     * 用例筛选模块
     * author lc
     * lastEditTime 2019年11月26日11:40:30
     */
    _jobRender () { // 将filterRules数组整理为筛选条件
      let selectedData = {}
      this.filterRules.forEach(item => {
        let info = item.split(':')
        let type = info[0]
        let index = info[1]
        if (selectedData[type] === undefined) selectedData[type] = []
        selectedData[type].push(this.filterData[type][index])
      })
      return selectedData
    },
    selectedDetail (selectedData) { // 将筛选条件整理为符合格式的url参数
      let conditions = []
      Object.keys(selectedData).forEach(key => {
        let condition = []
        selectedData[key].forEach(item => {
          condition.push(item.id)
        })
        if (key === 'job_test_area') key = 'test_area' // 使命名一致
        else if (key === 'phone_model') key = 'phone_models'
        else if (key === 'reefuser') key = 'author'

        condition.forEach(item => {
          item = key + '__id=' + item
        })

        let conditionStr = key + '__id__in=' + 'ReefList[' + condition.join('{%,%}') + ']'
        conditions.push(conditionStr)
      })

      return conditions.join('&')
    },
    onJobFilterChange () { // 筛选条件改变时触发该函数，获取符合条件的job
      let selectedData = this._jobRender()
      this.filterUrlParam = '&' + this.selectedDetail(selectedData)
      this.getMsg()
    },
    /**
     * 导入用例模块
     * author: lc
     * lastEditTime: 2019年11月27日10:56:50
     */
    handleFormatError () {
      this.$Notice.error({
        title: '文件上传失败',
        desc: '请使用ZIP格式的压缩包！'
      })
      this.$refs.upload.clearFiles()
    },
    handleUploadSuccess (res) {
      if (res.state === 'OK') {
        this.$Message.success('文件上传成功！')
      }
    },
    /**
     * 导出用例
     * author lc
     * lastEditTime 2019年11月26日18:56:24
     */
    exportJobs () {
      if (this.jobIdList.length === 0) {
        this.$Modal.error({
          title: '错误',
          content: '请先选择要导出的用例'
        })
      } else {
        let self = this
        this.$Modal.confirm({
          title: '提示',
          content: '您确定要导出这些用例吗？',
          closable: false,
          onOk () {
            getSelectedJobs({
              requestName: 'exportJob',
              jobIdList: self.jobIdList
            }).then(res => {
              if (res.data.file) {
                window.location.href = res.data.file
              } else {
                this.$Message.error('导出用例失败！')
              }
            }).catch(err => {
              console.log(err)
            })
          }
        })
      }
    },
    /**
     * 删除用例
     * author lc
     * lastEditTime 2019年11月27日14:28:36
     */
    delSelectedJobs () {
      if (this.jobIdList.length === 0) {
        this.$Modal.error({
          title: '错误',
          content: '请先选择要删除的用例！'
        })
      } else {
        let self = this
        this.$Modal.confirm({
          title: '提示',
          content: '您真的要删除这些用例吗？',
          onOk () {
            let delUrlList = []
            for (let i = 0; i < self.jobIdList.length; i++) {
              delUrlList.push(axios.request({
                url: 'api/v1/cedar/job/' + self.jobIdList[i] + '/',
                method: 'patch',
                data: { job_deleted: true }
              }))
            }
            Promise.all(delUrlList).then(res => {
              this.$Message.success('用例删除成功')
              self.selectedJobs = {}
              self.getMsg()
            }).catch(err => {
              console.log(err)
              this.$Message.error('用例删除失败')
            })
          }
        })
      }
    }
  },
  computed: {
    offset () { // 从某位置开始 返回当前下标
      return (this.currentPage - 1) * this.pageSize
    },
    uploadUrl () {
      return jobLibSvcURL + '/form/'
    },
    jobIdList () {
      return Object.keys(this.selectedJobs)
    }
  },
  beforeCreate () {
    getPhoneModelList().then(res => {
      this.filterData.phone_model = util.validate(serializer.getPhoneModelSerializer, res.data).phonemodels
    }).catch(error => {
      console.log(error)
    })
    getJobTestAreaList().then(res => {
      this.filterData.job_test_area = util.validate(serializer.getJobTestAreaSerializer, res.data).jobtestareas
    }).catch(error => {
      console.log(error)
    })
    getAndroidVersionList().then(res => {
      this.filterData.android_version = util.validate(serializer.getAndroidVersionSerializer, res.data).androidversions
    }).catch(error => {
      console.log(error)
    })
    getRomVersionList().then(res => {
      this.filterData.rom_version = util.validate(serializer.getRomVersionSerializer, res.data).romversions
    }).catch(error => {
      console.log(error)
    })
    getReefUserList().then(res => {
      this.filterData.reefuser = util.validate(serializer.getReefUserSerializer, res.data).reefusers
      this.filterData.reefuser = res.data.reefusers
    }).catch(error => {
      console.log(error)
    })
    getCustomTagList().then(res => {
      this.filterData.custom_tag = util.validate(serializer.getCustomTagSerializer, res.data).customtags
    }).catch(error => {
      console.log(error)
    })
  },
  mounted () {
    this.getMsg()
  }
}
</script>

<style scoped>

</style>
