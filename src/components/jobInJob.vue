<template>
  <Modal v-model="jobModalShow" :closable="false" :mask-closable="false" width="90">
    <div slot="header">
      <p v-show="currentJobName === 'Job'">请选择您需要的InnerJob</p>
      <p v-show="currentJobName !== 'Job'">当前选中的InnerJob为：<strong>{{ currentJobName }}</strong></p>
    </div>
    <job-list-filter @getFilterParam="getFilterParam"></job-list-filter>
    <Table ref="jobTable" highlight-row border height="520" :columns="columns" :data="innerJobs" @on-row-click="selectJob"></Table>
    <Page simple :page-size="pageSize" :total="jobNum" :current="curPage" @on-change="pageChange" style="text-align :center; margin-top: 20px;"></Page>
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

import { mapState } from 'vuex'

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
          key: 'test_area'
        },
        {
          title: '自定义标签',
          key: 'custom_tag'
        }
      ],
      innerJobs: [],
      pageSize: 10,
      jobNum: 0,
      curPage: 1,
      currentJob: {},
      currentJobIndex: 0,
      currentJobName: '',
      filterUrlParam: ''
    }
  },
  computed: {
    ...mapState('job', [
      'jobInfo'
    ]),
    offset () {
      return (this.curPage - 1) * this.pageSize
    }
  },
  watch: {
    jobModalShow (val) {
      if (val) {
        this.getFilteredJobs()
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
    async getFilteredJobs () {
      let romVerFilter = this.jobInfo && this.jobInfo.rom_version && this.jobInfo.rom_version.length
        ? `&rom_version__id__in=ReefList[${this.jobInfo.rom_version.join('{%,%}')}]` : ''
      let andVerFilter = this.jobInfo && this.jobInfo.android_version && this.jobInfo.android_version.length
        ? `&android_version__id__in=ReefList[${this.jobInfo.android_version.join('{%,%}')}]` : ''
      let phoModFilter = this.jobInfo && this.jobInfo.phone_models && this.jobInfo.phone_models.length
        ? `&phone_models__id__in=ReefList[${this.jobInfo.phone_models.join('{%,%}')}]` : ''
      let url =
        'api/v1/cedar/job/?fields=' +
        'id,' +
        'job_label,' +
        'description,' +
        'job_name,' +
        'job_type,' +
        'rom_version,rom_version.id,' +
        'android_version,android_version.id,' +
        'custom_tag,custom_tag.custom_tag_name,custom_tag.id,' +
        'phone_models,phone_models.id,' +
        'test_area,test_area.description,test_area.id,' +
        'author,author.username,author.id,' +
        'ui_json_file' +
        '&job_deleted=False' +
        '&draft=False' +
        '&job_type=InnerJob' +
        romVerFilter +
        andVerFilter +
        phoModFilter +
        this.filterUrlParam +
        '&limit=' + this.pageSize +
        '&offset=' + this.offset +
        '&ordering=-updated_time'
      if (romVerFilter || andVerFilter || phoModFilter) {
        let { headers, status, data: { jobs } } = await axios.request({ url })
        if (status === 200) {
          this.jobNum = parseInt(headers['total-count'])
          this.innerJobs = util.validate(serializer.jobSerializer, jobs)
          this.innerJobs.forEach(job => {
            let jobTestAreas = []
            job.test_area.forEach(jobTestArea => {
              jobTestAreas.push(jobTestArea.description)
            })

            let jobCustomTags = []
            job.custom_tag.forEach(jobCustomTag => {
              jobCustomTags.push(jobCustomTag.custom_tag_name)
            })

            job.test_area = jobTestAreas.join(',')
            job.custom_tag = jobCustomTags.join(',')
          })
        } else {
          this.$Message.error({
            background: true,
            content: '获取 InnerJob 列表失败'
          })
        }
      }
    },
    pageChange (page) {
      this.curPage = page
      this.getFilteredJobs()
    },
    selectJob (data, index) {
      this.currentJobIndex = index
      this.currentJobName = data.job_name
      this.currentJob = {
        id: data.id,
        job_name: data.job_name,
        job_label: data.job_label
      }
    },
    getFilterParam (val) {
      this.filterUrlParam = val.endsWith('&') ? val.substring(0, val.length - 1) : val
      if (this.filterUrlParam) {
        this.curPage = 1
      }
      this.getFilteredJobs()
    }
  }
}
</script>
