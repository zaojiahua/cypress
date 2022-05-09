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
        @on-row-click="onRowClick"
        @on-selection-change="selectedJobsChange"
      ></Table>
      <div class="flex-row page">
        <Button size="small" :disabled="this.curPage === 1" @click="jobPageChange(1)">首页</Button>
        <Page simple :page-size="pageSize" :total="dataCount" :current.sync="curPage" @on-change="jobPageChange" style="margin: 0 1em;"></Page>
        <Button size="small" :disabled="this.curPage === this.lastPage" @click="jobPageChange(lastPage)">尾页</Button>
      </div>
    </div>

    <Modal v-model="showJobConnectionModal" :fullscreen="true" :transfer="false" :closable="false" >
      <inner-job-connection ref="innerJobConnection" :prop-inner="propInner"></inner-job-connection>
      <div slot="footer">
        <Button type="primary" @click="showJobConnectionModal = false">关闭</Button>
      </div>
    </Modal>

    <Modal v-model="showErrorInner" :closable="false" :mask-closable="false" :footer-hide="true" width="50">
      <Icon type="ios-help-circle" style="color: #ff9900;float: left;margin: 15px 10px 0 0;" size="24"/>
      <p style="margin: 15px 0;font-size: 16px">提示</p>
      <Row style="margin: 10px 0 0 30px;">
        Inner 【{{ errorInnerList.join("】,【") }}】 存在关联用例，无法删除，继续删除选中的其他用例吗？
      </Row>
      <Row type="flex" justify="end" style="margin-top: 30px;">
        <Button type="text" @click="showErrorInner=false">取消</Button>
        <Button type="primary" :disabled="delJobIds.length===0" @click="continueDeleted">继续</Button>
      </Row>
    </Modal>
  </div>
</template>

<script>
import util from 'lib/util/validate.js'
import CONST from 'constant/constant'
import { getSelectedJobs } from 'api/coral/jobLibSvc'
import { jobLibSvcURL } from '../config/index'
import { serializer, jobSerializer } from 'lib/util/jobListSerializer'
import jobListFilter from '../components/jobListFilter'
import InnerJobConnection from '../components/InnerJobConnection'
import { getJobDetail, getJobList, deleteJob,copyJob,getCabinetTypeList } from 'api/reef/request'
import { createJobLabel } from '../lib/tools'
import { mapState } from 'vuex'

export default {
  name: 'jobList',
  components: {
    jobListFilter,
    InnerJobConnection
  },
  data () {
    return {
      copyJobName:'',
      pageSize: 10, // 每页条数
      dataCount: 0,
      lastPage: 0,
      propInner:"",
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
          key: 'job_name',
          width:300
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
          width:110,
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
          width:130,
          sortable: 'true',
          align: 'center',
          filters: [
            {
              label: '功能',
              value: 'Joblib'
            },
            {
              label: '性能',
              value: 'PerfJob'
            },
            {
              label: '内嵌',
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
        },
        {
          title: '测试柜类型',
          key: 'cabinet_type',
          width:130,
          align: 'center',
          filters: [],
          filterRemote (value) {
            this.cabinetType= value
            this.$store.commit('setCabinetType', value)
            this.jobPageChange(1)
          }
        },
        {
          title: '维护人员',
          key: 'author',
          width:200
        },
        {
          title: '操作',
          key: 'operation',
          width: 150,
          render: (h, params) => {
            if (!this.isAdmin) {
              if(params.row.job_type==="内嵌"){
                return h('div', [
                  h('span', {
                    class: 'mouse-hover',
                    on: {
                      click: () => {
                        event.stopPropagation();
                        this.show(params.index)
                      }
                    }
                  },'另存'),
                  h('span', {
                    class: 'mouse-hover',
                    style:{
                      marginLeft:'10px',
                      color: '#2d8cf0'
                    },
                    on: {
                      click: () => {
                        event.stopPropagation();
                        this.propInner = params.row.job_name
                        this.viewJobConnection(params.row.job_label)
                      }
                    }
                  },'参考'),
                ]);
              }else {
                return h('div', [
                  h('span', {
                    class: 'mouse-hover',
                    on: {
                      click: () => {
                        event.stopPropagation();
                        this.show(params.index)
                      }
                    }
                  },'另存'),
                ]);
              }
            }else {
              if(params.row.job_type==="内嵌") {
                return h('div', [
                  h('span', {
                    class: 'mouse-hover',
                    style:{
                      marginLeft:'10px',
                      color: '#2d8cf0'
                    },
                    on: {
                      click: () => {
                        event.stopPropagation();
                        this.propInner = params.row.job_name
                        this.viewJobConnection(params.row.job_label)
                      }
                    }
                  },'参考'),
                ])
              }else {

              }
            }

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
      cabinetType: [],
      filterUrlParam: '',
      tableHeight: 519,
      showJobConnectionModal:false,
      showErrorInner:false,
      errorInnerList:[],
      delJobIds:[],
    }
  },
  computed: {
    ...mapState(['refresh', 'curCabinetType']),
    ...mapState('job', ['editingJobId']),
    isAdmin (){
      return sessionStorage.groups && sessionStorage.groups.includes('Admin')
    },
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
    show (index) {
      let self = this
      self.copyJobName = `${self.jobData[index].job_name}_copy`
      this.$Modal.confirm({
        render: (h) => {
          return h('Input', {
            props: {
              ref:'newJobName',
              value: self.copyJobName,
              autofocus: true,
              placeholder: '请输入新的用例名称',
            },
            on: {
              input: (val) => {
                self.copyJobName = val
              }
            }
          })
        },
        async onOk(){
          let data = {
            "job_id": self.jobData[index].id,
            "job_name": self.copyJobName,
            "job_label": createJobLabel(self),
            "author_id": parseInt(sessionStorage.id)
          }
          if (self.copyJobName.length >=70){
            self.$Message.error("用例名称过长")
            return
          }
          if (self.copyJobName.includes("/")){
            self.$Message.error("用例名称不允许包含/")
            return
          }
          try{
            await copyJob(data)
            self.$Message.info("另存成功")
          } catch (e) {
            self.$Message.error("另存失败")
          }
          self.getFilteredJobs()
        }
      }
      )
    },
    viewJobConnection(label){
      this.showJobConnectionModal = true
      this.$refs.innerJobConnection.setInnerLabel(label)
      this.$refs.innerJobConnection.onPageChange(1)
    },
    getFilteredJobs () {
      let filterUrlParam = `${this.jobState ? `&draft=${this.jobState === 'draft' ? 'True' : 'False'}` : ''}${this.jobType ? `&job_type=${this.jobType}` : ''}${this.filterUrlParam}${this.cabinetType.length>0 ? `&cabinet_type__in=ReefList[${ this.cabinetType.join('{%,%}')}]`:''}`
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
          if (job.job_type === "InnerJob" && sessionStorage.username!=='admin') job._disabled = true
          //todo: 自己只能删除自己的用例
          // if (job.job_type === "InnerJob" || parseInt(sessionStorage.getItem("id")) !== job.author.id) job._disabled = true
          job.test_area = job.test_area.map(item => item.description).join(',')
          job.custom_tag = job.custom_tag.map(item => item.custom_tag_name).join(',')
          job.job_state = job.draft ? '草稿' : '正式'
          job.author = job.author.username
          if( job.job_type === "Joblib" )
            job.job_type = '功能'
          else if( job.job_type === "InnerJob" )
            job.job_type = '内嵌'
          else if( job.job_type === "PerfJob" )
            job.job_type = '性能'

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
        job_flow: job.ui_json_file,
        job_flows:job.job_flow,
        cabinet_type:job.cabinet_type,
        resource_data:job.matching_rule ? job.matching_rule.resource_data : []
      }
      CONST.SIMPLE_JOB_KEY.forEach(val => {
        jobInfo[val] = job[val]
      })
      CONST.COMPLEX_JOB_KEY.forEach(val => {
        jobInfo[val] = job[val].map(item => item.id)
      })
      this.$store.commit('job/setSelectJobType', job.job_type)
      this.$store.commit('job/handleJobInfo', { action: 'setJobInfo', data: jobInfo })
      this.$store.commit('job/handleResourceList', { action: 'setResourceList', data: jobInfo.resource_data })
    },
    async onRowClick (curData, index) { // 单击表格某一行
      await this.getJobInfo(curData.id)
      this.$store.commit('handleShowDrawer',true)
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
          onOk: () => {
            deleteJob({ job_ids: _this.jobIdList })
              .then(response=>{
                if(response.status===200){
                  if (_this.jobData.length - _this.jobIdList.length === 0 && _this.curPage > 1) {
                    _this.jobPageChange(_this.curPage - 1)
                  } else {
                    _this.jobPageChange(_this.curPage)
                  }
                  this.$Message.success('用例删除成功')
                  _this.selectedJobs = {}
                }
              }).catch(error=>{
              if(error.response.status===500){
                this.$Message.error('服务器错误！')
                return
              }
              if(error.response.data.custom_code==="0"){
                if(error.response.data.point_out_job.length===0){
                  if (_this.jobData.length - _this.jobIdList.length === 0 && _this.curPage > 1) {
                    _this.jobPageChange(_this.curPage - 1)
                  } else {
                    _this.jobPageChange(_this.curPage)
                  }
                  this.$Message.success('用例删除成功')
                  _this.selectedJobs = {}
                }else {
                  _this.showErrorInner = true
                  _this.errorInnerList = error.response.data.point_out_job
                  _this.delJobIds = error.response.data.enable
                }
              }else
                this.$Message.error({content:'用例删除失败！'+error.response.data.description,duration:10})
            })
          }
        })
      }
    },
    continueDeleted(){
      deleteJob({ job_ids: this.delJobIds })
        .then(response=>{
          if(response.status===200){
            this.showErrorInner = false
            if (this.jobData.length - this.jobIdList.length === 0 && this.curPage > 1) {
              this.jobPageChange(this.curPage - 1)
            } else {
              this.jobPageChange(this.curPage)
            }
            this.$Message.success('用例删除成功')
            this.selectedJobs = {}
          }
        }).catch(error=>{
        if(error.response.status===500){
          this.$Message.error('服务器错误！')
          return
        }
        this.$Message.error({content:'用例删除失败！'+error.response.data.description,duration:10})
      })
    },
    getFilterParam (val) {
      this.filterUrlParam = val
      if (this.filterUrlParam) {
        this.curPage = 1
      }
      this.jobPageChange()
    },
    getCabinetList(){
      getCabinetTypeList()
        .then(response=>{
          let CabinetList = response.data
          let  CabinetFilters = []
          CabinetList.forEach(item=>{
            CabinetFilters.push({label:item.type,value:item.type})
          })
          this.columns[7].filters = CabinetFilters;
        })
        .catch(error=>{
          this.$Message.error("测试柜列表获取失败")
        })
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
    if(this.$route.query.hasOwnProperty("jobId")) {
      let jobId = _.parseInt(this.$route.query.jobId)
      this.$store.commit('setCurPage', 1)
      this.$store.commit('job/setEditingJobId', jobId)
    }
    // this.setTableHeight()
    // window.addEventListener('resize', this.setTableHeight)
  },
  async activated () {
    this.columns[5].filteredValue = [].concat(this.jobState)
    this.columns[6].filteredValue = [].concat(this.jobType)
    this.getCabinetList()
    this.jobPageChange()
    if(this.curCabinetType.length>0)
      this.columns[7].filteredValue = this.curCabinetType

    if (this.editingJobId !== null && !isNaN(this.editingJobId)) {
      await this.getJobInfo(this.editingJobId)
      this.$store.commit('handleShowDrawer',true)
    }
    this.$store.commit('job/setEditingJobId', null)
  },
  beforeRouteLeave (to, from, next) {
    localStorage.setItem('joblist-management:DEFAULT_FILTER_CONFIG', this.jobState)
    next()
  }
}
</script>

<style>
  .mouse-hover:hover{
    color: #2d8cf0;
    cursor: pointer;
  }
</style>
<style lang="less" scoped>
@import '../css/common.less';
.container {
  /*height: 100%;*/
  .page {
    justify-content: center;
    margin-top: 1em;
  }
}
/deep/.ivu-page-simple .ivu-page-simple-pager input{
  width: 45px;
}
</style>
