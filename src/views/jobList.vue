<template>
  <div class="container flex-column">
    <job-list-filter @getFilterParam="getFilterParam"></job-list-filter>
    <!-- <div>
      <div>
        <Tag v-for="job in selectedJobs" :key="job.id" closable @on-close="close(job.id)">{{ job.name }}</Tag>
      </div>
    </div> -->
    <div>
      <div class="child-m-right--1 flex-row m-b--1">
        <div class="child-m-right--1 flex-row">
          <!-- <Upload ref="upload"
            :show-upload-list="false"
            :format="['zip']"
            :on-format-error="handleFormatError"
            :action="uploadUrl"
            :data="uploadData"
            :on-success="handleUploadSuccess">
            <Button icon="ios-cloud-upload-outline">导入用例</Button>
          </Upload> -->
        </div>
        <div class="child-m-right--1 flex-row">
          <Tag size="large" style="margin-top: 0; margin-bottom: 0;"> 已选 {{Object.keys(this.selectedJobs).length}} 个</Tag>
          <!-- <Button type="success" icon="ios-cloud-download" @click="exportJobs">导出用例</Button> -->
          <Button type="warning" icon="ios-qr-scanner" @click="clear">取消选择</Button>
          <Button type="error" icon="md-trash" @click="delSelectedJobs">批量删除</Button>
        </div>
      </div>
      <Table
        ref="jobList"
        :columns="columns"
        :data="jobData"
        :height="tableHeight"
        @on-row-click="onRowClick"
        @on-selection-change="selectedJobsChange"
      ></Table>
      <div class="flex-row page">
        <Button size="small" :disabled="this.curPage === 1" @click="jobPageChange(1)">首页</Button>
        <Page simple :page-size="pageSize" :total="dataCount" :current.sync="curPage" @on-change="jobPageChange" style="margin: 0 1em;"></Page>
        <Button size="small" :disabled="this.curPage === this.lastPage" @click="jobPageChange(lastPage)">尾页</Button>
      </div>
    </div>
  </div>
</template>

<script>
import util from 'lib/util/validate.js'
import CONST from 'constant/constant'
import { getSelectedJobs } from 'api/coral/jobLibSvc'
import { jobLibSvcURL } from '../config/index'
import { serializer, jobSerializer } from 'lib/util/jobListSerializer'
import jobListFilter from '../components/jobListFilter'
import { getJobDetail, getJobList, updateJobMsg } from 'api/reef/request'
import { mapState } from 'vuex'

export default {
  name: 'jobList',
  components: {
    jobListFilter
  },
  data () {
    return {
      pageSize: 10, // 每页条数
      dataCount: 0,
      lastPage: 0,
      columns: [
        {
          type: 'index',
          width: 60,
          align: 'center'
        },
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
          filteredValue: this.jobState ? [ this.jobState ] : [],
          filterRemote (value) {
            this.jobState = value[0] || ''
            localStorage.setItem('joblist-management:DEFAULT_FILTER_CONFIG', this.jobState)
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
          filteredValue: this.jobType ? [ this.jobType ] : [],
          filterRemote (value) {
            this.jobType = value[0] || ''
            localStorage.setItem('COMPJOBLIST:FILTER_JOB_TYPE', this.jobType)
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
      jobState: localStorage.getItem('joblist-management:DEFAULT_FILTER_CONFIG') || '',
      jobType: localStorage.getItem('COMPJOBLIST:FILTER_JOB_TYPE') || '',
      filterUrlParam: '',
      tableHeight: 519
    }
  },
  computed: {
    ...mapState(['refresh']),
    curPage: {
      get: function () {
        return this.$store.state.curPage
      },
      set: function (val) {
        this.$store.commit('setCurPage', val)
      }
    },
    offset () { // 从某位置开始 返回当前下标
      return (this.curPage - 1) * this.pageSize
    },
    uploadUrl () {
      return jobLibSvcURL + '/form/'
    },
    jobIdList () {
      return Object.keys(this.selectedJobs)
    }
  },
  watch: {
    refresh (val) {
      if (val) this.jobPageChange(1)
    }
  },
  methods: {
    getFilteredJobs () {
      let filterUrlParam = `${this.jobState ? `&draft=${this.jobState === 'draft' ? 'True' : 'False'}` : ''}${this.jobType ? `&job_type=${this.jobType}` : ''}${this.filterUrlParam}`
      getJobList({
        pageSize: this.pageSize,
        offset: this.offset,
        filterUrlParam
      }).then(res => {
        this.currentPageSelectedJobs = {}
        this.dataCount = Number(res.headers['total-count'])
        this.lastPage = Math.ceil(this.dataCount / this.pageSize)
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
      if (page) {
        this.$store.commit('setCurPage', page)
      }
      this.getFilteredJobs()
    },
    async getJobInfo (jobId) {
      let { data } = await getJobDetail(jobId)
      let job = util.validate(jobSerializer, data)
      let jobInfo = {
        manufacturer: (job.phone_models.length === 0) ? null : job.phone_models[0].manufacturer.id, // todo: 写了manufacturer 没写phonemodel
        author: job.author.id,
        job_id: job.id,
        job_flow: job.ui_json_file
      }
      CONST.SIMPLE_JOB_KEY.forEach(val => {
        jobInfo[val] = job[val]
      })
      CONST.COMPLEX_JOB_KEY.forEach(val => {
        jobInfo[val] = job[val].map(item => item.id)
      })
      this.$store.commit('job/handleJobInfo', { action: 'setJobInfo', data: jobInfo })
    },
    async onRowClick (curData, index) { // 单击表格某一行
      await this.getJobInfo(curData.id)
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
        this.$Modal.confirm({
          title: '提示',
          content: '您真的要删除这些用例吗？',
          onOk: () => {
            this.jobIdList.forEach(async (id) => {
              await updateJobMsg(id, { job_deleted: true })
            })
            setTimeout(() => {
              if (this.jobData.length - this.jobIdList.length === 0 && this.curPage > 1) {
                this.jobPageChange(this.curPage - 1)
              } else {
                this.jobPageChange(this.curPage)
              }
              this.$Message.success('用例删除成功')
              this.selectedJobs = {}
            }, 300)
          }
        })
      }
    },
    getFilterParam (val) {
      this.filterUrlParam = val
      if (this.filterUrlParam) {
        this.curPage = 1
      }
      this.jobPageChange()
    },
    setTableHeight () {
      let { innerHeight } = window
      if (innerHeight <= 768) {
        this.tableHeight = 256
      } else if (innerHeight > 768 && innerHeight <= 900) {
        this.tableHeight = 279
      } else if (innerHeight > 900 && innerHeight < 1080) {
        this.tableHeight = 471
      } else {
        this.tableHeight = 519
      }
      this.jobPageChange()
    }
  },
  beforeCreate () {
    this.$store.dispatch('setBasicData')
    this.jobState = localStorage.getItem('joblist-management:DEFAULT_FILTER_CONFIG')
    this.jobType = localStorage.getItem('COMPJOBLIST:FILTER_JOB_TYPE')
  },
  mounted () {
    // this.setTableHeight()
    // window.addEventListener('resize', this.setTableHeight)
  },
  activated () {
    this.jobPageChange()
  },
  beforeRouteLeave (to, from, next) {
    localStorage.setItem('joblist-management:DEFAULT_FILTER_CONFIG', this.jobState)
    next()
  }
}
</script>

<style lang="less" scoped>
@import '../css/common.less';
.container {
  height: 100%;
  .page {
    justify-content: center;
    margin-top: 1em;
  }
}
</style>
