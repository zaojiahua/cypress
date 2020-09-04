<template>
  <div>
    <job-list-filter @getFilterParam="getFilterParam"></job-list-filter>
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
        <Tag v-for="job in selectedJobs" :key="job.id" closable @on-close="close(job.id)">{{ job.name }}</Tag>
      </Row>
    </Row>
    <Divider  style="margin-top: 40px">用例列表</Divider>
    <Table
      :loading="loading"
      ref="jobList"
      :columns="columns"
      :data="jobData"
      @on-row-click="onRowClick"
      @on-selection-change="selectedJobsChange"
    ></Table>

    <Page simple :page-size="pageSize" :total="dataCount" :current="this.currentPage" @on-change="jobPageChange" style="text-align: center;margin-top: 20px"></Page>
  </div>
</template>

<script>
import util from 'lib/util/validate.js'
import { getSelectedJobs } from 'api/coral/jobLibSvc'
import { jobLibSvcURL } from '../config/index'
import { serializer, jobSerializer } from 'lib/util/jobListSerializer'
import jobListFilter from '../components/jobListFilter'
import { getJobDetail, getJobList, patchUpdateJob } from 'api/reef/job'

export default {
  name: 'jobList',
  components: {
    jobListFilter
  },
  data () {
    return {
      pageSize: 10, // 每页条数
      currentPage: 1, // 当前页数
      dataCount: 0,
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
          key: 'test_area'
        },
        {
          title: '自定义标签',
          key: 'custom_tag'
        },
        {
          title: '用例状态',
          key: 'job_state',
          sortable: true,
          align: 'center',
          filters: [
            {
              label: '草稿',
              value: 'draft'
            },
            {
              label: '正式',
              value: 'release'
            }
          ],
          filterMultiple: false,
          filteredValue: [ this.jobState ],
          filterRemote (value) {
            this.jobState = value[0] || ''
            this.jobPageChange(1)
          }
        },
        {
          title: '用例类型',
          key: 'job_type',
          sortable: 'true',
          align: 'center',
          filters: [
            {
              label: '功能测试',
              value: 'Joblib'
            },
            {
              label: '性能测试',
              value: 'PerfJob'
            },
            {
              label: '内嵌用例',
              value: 'InnerJob'
            }
          ],
          filterMultiple: false,
          filteredValue: [ this.jobType ],
          filterRemote (value) {
            this.jobType = value[0] || ''
            this.jobPageChange(1)
          }
        }
      ],
      jobData: util.validate(serializer.jobSerializer, []),
      selectedJobs: {}, // 已选的job
      currentPageSelectedJobs: {}, // 当前页面的已选job
      uploadData: { // 上传时附带的额外参数
        requestName: 'importJob'
      },
      loading: false,
      jobState: '',
      jobType: '',
      filterUrlParam: ''
    }
  },
  methods: {
    getFilteredJobs () { // 每个页面的请求数据
      let jobState
      let jobType
      if (this.jobState === 'draft') {
        jobState = '&draft=True'
      } else if (this.jobState === 'release') {
        jobState = '&draft=False'
      } else {
        jobState = ''
      }
      if (this.jobType === 'Joblib') {
        jobType = '&job_type=Joblib'
      } else if (this.jobType === 'InnerJob') {
        jobType = '&job_type=InnerJob'
      } else if (this.jobType === 'PerfJob') {
        jobType = '&job_type=PerfJob'
      } else {
        jobType = ''
      }
      getJobList({
        pageSize: this.pageSize,
        offset: this.offset,
        jobState,
        jobType,
        filterUrlParam: this.filterUrlParam
      }).then(res => {
        this.currentPageSelectedJobs = {}
        this.dataCount = parseInt(res.headers['total-count'])

        this.jobData = res.data.jobs
        this.jobData.forEach(job => {
          job.test_area = job.test_area.map(item => item.description).join(',')
          job.custom_tag = job.custom_tag.map(item => item.custom_tag_name).join(',')
          job.job_state = job.draft ? '草稿' : '正式'

          // 勾选已选的选项
          if (this.selectedJobs[job.id] !== undefined) {
            job._checked = true
            this.$set(this.currentPageSelectedJobs, job.id, 'exist')
          }
        })
      }).catch(err => {
        console.log(err)
      })
    },
    jobPageChange (page) { // 切换页面
      this.loading = true
      this.currentPage = page
      this.getFilteredJobs()
      this.loading = false
    },
    getJobInfo (jobId) {
      getJobDetail(jobId).then(res => {
        let job = util.validate(jobSerializer, res.data)
        let jobInfo = {
          job_name: job.job_name,
          job_type: job.job_type,
          job_second_type: job.job_second_type,
          job_label: job.job_label,
          description: job.description,
          manufacturer: job.phone_models[0].manufacturer.id,
          author: parseInt(localStorage.id),

          test_area: job.test_area.map(item => item.id),
          android_version: job.android_version.map(item => item.id),
          custom_tag: job.custom_tag.map(item => item.id),
          phone_models: job.phone_models.map(item => item.id),
          rom_version: job.rom_version.map(item => item.id),

          job_id: job.id,
          job_flow: job.ui_json_file,
          draft: job.draft
        }
        this.$store.commit('job/setJobInfo', jobInfo)
      })
    },
    onRowClick (currentData, index) { // 单击表格某一行
      this.getJobInfo(currentData.id)
      this.$store.commit('handleShowDrawer')
    },
    selectedJobsChange (selection) {
      selection.forEach((value) => {
        if (this.selectedJobs[value.id] === undefined) {
          console.log('勾选了id为' + value.id + '的job')
          this.$set(this.selectedJobs, value.id, { id: value.id, name: value.job_name })
          this.$set(this.currentPageSelectedJobs, value.id, 'exist')
        }
      })
      for (let item in this.currentPageSelectedJobs) {
        let i = 0
        for (i; i < selection.length; i++) {
          if (parseInt(item) === selection[i].id) {
            break
          }
        }
        if (i === selection.length) {
          console.log('不再勾选id为' + item + '的job')
          this.$delete(this.selectedJobs, item)
          this.$delete(this.currentPageSelectedJobs, item)
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
      this.currentPageSelectedJobs = {}
      this.filterRules = []
    },
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
    exportJobs () {
      if (this.jobIdList.length === 0) {
        this.$Modal.error({
          title: '错误',
          content: '请先选择要导出的用例'
        })
      } else {
        let _this = this
        this.$Modal.confirm({
          title: '提示',
          content: '您确定要导出这些用例吗？',
          closable: false,
          onOk () {
            getSelectedJobs({
              requestName: 'exportJob',
              jobIdList: _this.jobIdList
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
    delSelectedJobs () {
      if (this.jobIdList.length === 0) {
        this.$Modal.error({
          title: '错误',
          content: '请先选择要删除的用例！'
        })
      } else {
        let _this = this
        this.$Modal.confirm({
          title: '提示',
          content: '您真的要删除这些用例吗？',
          onOk () {
            Promise.all(_this.jobIdList.map(id => {
              patchUpdateJob(id, { job_deleted: true })
            })).then(res => {
              _this.jobPageChange(_this.currentPage)
              _this.$Message.success('用例删除成功')
              _this.selectedJobs = {}
            }).catch(err => {
              console.log(err)
              _this.$Message.error('用例删除失败')
            })
          }
        })
      }
    },
    getFilterParam (val) {
      this.filterUrlParam = val
      this.getFilteredJobs()
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
    this.jobState = localStorage.getItem('joblist-management:DEFAULT_FILTER_CONFIG')
    this.getFilteredJobs()
  },
  beforeRouteLeave (to, from, next) {
    localStorage.setItem('joblist-management:DEFAULT_FILTER_CONFIG', this.jobState)
    next()
  }
}
</script>

<style scoped>

</style>
