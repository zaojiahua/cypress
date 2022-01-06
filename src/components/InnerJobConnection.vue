<template>
  <div>
    <row style="margin-bottom: 16px;">用例名称：{{ propInner }}</row>
    <Table stripe :columns="columns" :data="data" border></Table>
    <div class="flex-row page">
      <Button size="small" :disabled="this.curPage === 1" @click="onPageChange(1)">首页</Button>
      <Page simple :page-size="pageSize" :total="dataCount" :current.sync="curPage" @on-change="onPageChange" style="margin: 0 1em;"></Page>
      <Button size="small" :disabled="this.curPage === this.lastPage" @click="onPageChange(lastPage)">尾页</Button>
    </div>
  </div>
</template>

<script>
  import axios from "../api";

  export default {
    props:{
      propInner:{
        type:String,
        default:""
      }
    },
    data () {
      return {
        pageSize: 10, // 每页条数
        dataCount: 0,
        lastPage: 0,
        curPage: 1,
        offset: 0,
        job_label:"",
        columns: [
          {
            title: '#',
            width: 200,
            align: 'center',
            render: (h, params) => {
              return h('div', [
                h('span', params.index + 1)
              ])
            }
          },
          {
            title: '关联用例',
            key: 'job_name',
          },
          {
            title: '测试柜类型',
            key: 'cabinet_type',
          },
          {
            title: '维护人员',
            key: 'author',
            // width:200
          },
        ],
        data: []
      }
    },
    methods: {
      setInnerLabel(label){
        this.job_label = label
      },
      refresh (label) {
        if(label)
          this.setInnerLabel(label)
        let url = 'api/v1/cedar/search_job/?limit='+this.pageSize+'&offset='+this.offset
        axios.request({
          url,
          method: 'post',
          data: { job:this.job_label }
        }).then(res => {
          this.dataCount = Number(res.headers['total-count'])
          this.lastPage = Math.ceil(this.dataCount / this.pageSize)
          this.data = res.data
        }).catch(err => {
          console.log(err)
          this.dataCount = 0
          this.lastPage = 0
          this.data = []
          this.curPage = 1
          this.$Message.error("inner关联信息获取失败")
        })
      },
      onPageChange (page) {
        this.offset = this.pageSize * (page - 1)
        this.curPage = page
        this.refresh()
      },

    },
    mounted () {

    }
  }
</script>
<style scoped>
  @import '../css/common.less';
  .page {
    justify-content: center;
    margin-top: 1em;
  }
</style>
