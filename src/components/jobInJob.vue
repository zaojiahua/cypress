<template>
  <Modal v-model="jobModalShow" :closable="false" width="90">
    <div slot="header">
        <p v-show="currentJobName === 'Job block'">请选择您需要的Job</p>
        <p v-show="currentJobName !== 'Job block'">当前选中的Job为：<strong>{{ currentJobName }}</strong></p>
    </div>
    <job-list-filter @getMsg="getJobData"></job-list-filter>
    <Table ref="jobTable" highlight-row border height="520" :columns="columns" :data="data" @on-row-click="selectJob"></Table>
    <Page simple :page-size="pageSize" :total="dataCount" :current="currentPage" @on-change="pageChange" style="text-align :center; margin-top: 20px;"></Page>
    <div slot="footer">
      <Button type="text" size="large" @click="cancel">取消</Button>
      <Button type="primary" size="large" @click="confirm">确定</Button>
    </div>
  </Modal>
</template>

<script>
import jobListFilter from '../components/jobListFilter'
import axios from '../api'
import util from '../lib/util/validate.js'
import { serializer } from '../lib/util/jobListSerializer'

export default {
  components: { jobListFilter },
  props: {
    jobModalShow: {
      type: Boolean,
      default: false
    },
    currentJobBlockText: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      columns: [
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
      data: [],
      pageSize: 10,
      dataCount: 0,
      currentPage: 1,
      currentJob: {},
      currentJobIndex: 0,
      currentJobName: this.currentJobBlockText
    }
  },
  computed: {
    offset () {
      return (this.currentPage - 1) * this.pageSize
    }
  },
  watch: {
    jobModalShow (val) {
      if (val) {
        this.currentJob = {}
        this.$refs.jobTable.clearCurrentRow()
        this.currentJobName = this.currentJobBlockText
      }
    }
  },
  methods: {
    cancel () {
      this.currentJob = {}
      this.$emit('jobModalClose', this.currentJob)
    },
    confirm () {
      this.$emit('jobModalClose', this.currentJob)
    },
    getJobData (filterUrlParam) {
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
      axios.request({ url }).then(res => {
        this.dataCount = parseInt(res.headers['total-count'])
        this.data = util.validate(serializer.jobSerializer, res.data.jobs)
        this.data.forEach(job => {
          let jobTestAreas = []
          job.test_area.forEach(jobTestArea => {
            jobTestAreas.push(jobTestArea.description)
          })

          let jobCustomTags = []
          job.custom_tag.forEach(jobCustomTag => {
            jobCustomTags.push(jobCustomTag.custom_tag_name)
          })

          job.text_area = jobTestAreas.join(',')
          job.custom_tag = jobCustomTags.join(',')
        })
      })
    },
    pageChange (page) {
      this.currentPage = page
      this.getJobData()
    },
    selectJob (data, index) {
      this.currentJobIndex = index
      this.currentJobName = data.job_name
      this.currentJob = {
        id: data.id,
        job_name: data.job_name
      }
    }
  },
  mounted () {
    this.getJobData()
  }
}
</script>
