<template>
  <div>
    <job-list-filter @getMsg="getMsg"></job-list-filter>

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
          <Button type="warning" style="margin-right: 20px;" @click="clear">清除已选</Button>
          <Button type="success" @click="exportJobs">导出用例</Button>
        </Col>
      </Row>
      <Row span="24"  style="margin-top: 20px; min-height: 60px;">
        <Tag v-for="job in selectedJobs" :key="job.id" @click.native="openDetail(job.id)" closable @on-close="close(job.id)">{{ job.name }}</Tag>
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
import jobMsgComponent from '../components/jobMsgComponent'
import axios from '../api/index'
import { getSelectedJobs } from '../api/coral/jobLibSvc'
import { jobLibSvcURL } from '../config/index'
import serializer from '../lib/util/jobListSerializer'
import jobListFilter from '../components/jobListFilter'

export default {
  name: 'jobList',
  components: {
    jobMsgComponent,
    jobListFilter
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
    getMsg (filterUrlParam) { // 每个页面的请求数据
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
        '&ordering=id' + filterUrlParam

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
    close (key) {
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
    },
    clear () {
      for (let i = 0; i < this.jobData.length; i++) {
        if (this.selectedJobs[this.jobData[i].id] !== undefined) {
          this.$refs.jobList.toggleSelect(i)
        }
      }
      this.selectedJobs = {}
      this.currentPageJobs = {}
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
  mounted () {
    this.getMsg()
  }
}
</script>

<style scoped>

</style>
