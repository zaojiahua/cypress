<template>
  <Card>
    <p slot="title">
      <Icon type="ios-film-outline"></Icon>
      {{ title }}
    </p>
    <p slot="extra" v-show="!isAdmin">
      <a v-show="!edit" :disabled="!copyFlowObj || !editJobFlow" href="#"  @click.prevent="pasteJobFlow">
        <Icon type="ios-loop-strong"></Icon>
        粘贴
      </a>
      <a v-show="!edit" :disabled="!editJobFlow" href="#"  @click.prevent="newFlow">
        <Icon type="ios-loop-strong"></Icon>
        新增
      </a>
      <a v-show="!edit" :disabled="!editJobFlow" href="#"  @click.prevent="toEdit">
        <Icon type="ios-loop-strong"></Icon>
        编辑
      </a>
      <a v-show="edit" href="#"  @click.prevent="toCancel">
        <Icon type="ios-loop-strong"></Icon>
        取消
      </a>
      <a v-show="edit" href="#"  @click.prevent="toSave">
        <Icon type="ios-loop-strong"></Icon>
        确认
      </a>
    </p>

    <SlickList :lockToContainerEdges="true" :useDragHandle="true" class="list" lockAxis="y" v-model="jobFlowList">
      <SlickItem class="list-item" v-for="(item, index) in jobFlowList" :index="index" :key="index">
        <div class="flow-class">{{item.name}}</div>
        <div v-show="edit" style="width: 20%; text-align: right">
          <Icon v-show="index!==0" type="md-arrow-up" :size="iconSize" @click="zIndexBottom(index)"/>
          <Icon v-show="jobFlowList.length !== 1" type="ios-trash" :size="iconSize" @click="deleteJobFlow(index)"/>
          <Icon v-handle type="ios-menu" :size="iconSize"/>
        </div>
        <div v-show="!edit" style="width: 20%; text-align: right">
          <Icon v-show="!isAdmin" type="ios-copy" :size="iconSize" @click="copyFlow(item)"/>
          <Icon type="ios-create" :size="iconSize" @click="showFlowMsg(item)"/>
        </div>
<!--        <Dropdown v-show="!edit" triggexr="click" @on-click="flowHandleMenu" style=" width: 20%; text-align: right">-->
<!--          <Icon :size="iconSize" type="md-more" @click="handleOpen(item)"/>-->
<!--          <DropdownMenu slot="list">-->
<!--            <DropdownItem name="edit">编辑</DropdownItem>-->
<!--            <DropdownItem name="copy">复制</DropdownItem>-->
<!--          </DropdownMenu>-->
<!--        </Dropdown>-->
        <Modal
          v-model="flowModal"
          :mask-closable="false"
          :closable="false"
          title="流程图信息"
          ok-text="查看"
          @on-ok="enterFlow">
          <Form ref="form"
            :model="currentFlow"
            width="30"
            :label-width="90">
            <FormItem>
              <b slot="label">名称:</b>
              <Input v-model="currentFlow.name" disabled class="disabled-input" :autosize="{minRows: 1,maxRows: 4}"></Input>
            </FormItem>
            <FormItem>
              <b slot="label">描述:</b>
              <Input v-model="currentFlow.description" disabled class="disabled-input" :autosize="{minRows: 1,maxRows: 4}"></Input>
            </FormItem>
          </Form>
        </Modal>
      </SlickItem>
    </SlickList>
  </Card>
</template>

<script>
import { HandleDirective,SlickList, SlickItem } from 'vue-slicksort'
import {getJobFlowList, copyFlowWithFlowId, deleteFlowWithFlowId, updateFlowOrder} from "api/reef/request";
import {mapGetters} from "vuex";
export default {
  props: {
    title: {
      type: String,
      default: '用例流程图列表'
    },
    jobId: {
      default: -1
    }
  },
  watch: {
    // async jobId (val) {
    //   await this.refresh(val)
    // }
  },
  data () {
    return {
      copyFlowObj:null,
      selectFlowObj:null,
      enter:"查看",
      flag: true,
      edit: false,
      iconSize: 18,
      flowModal:false,
      jobFlowList:[],
      currentFlow:{}, //选中的flow
      removeFlowList: []
    }
  },
  directives: {
    handle: HandleDirective
  },
  computed: {
    ...mapGetters('job', ['editJobFlow','editJobMsg','isAdmin']),
  },
  components: {
    SlickItem,
    SlickList
  },

  methods: {
    async refresh (jobId){
      this.currentFlow = {}
      this.removeFlowList = []
      if (jobId !== -1){
        let { data:{job_flow} } = await getJobFlowList(jobId)
        job_flow.sort(function (a, b) {
          return a.order-b.order
        })
        this.jobFlowList = job_flow
      }else {
        this.jobFlowList = []
      }
    },
    newFlow() {
      this.$Modal.confirm({
        title: '您确认编辑新的流程图吗?',
        onOk: () => {
          setTimeout(() => { // 延时关闭右侧抽屉
            this.$store.commit('handleShowDrawer')
          }, 800)

          this.$store.commit('job/setJobFlowInfo', {
            job:this.jobId
          })

          this.$store.commit('job/setOuterDiagramModel', null)
          this.$store.commit('files/handleResFiles', { action: 'clearResFiles' })
          this.$router.push({ // 跳转到 JobEditor
            name: 'jobEditor',
            query: {
              jobId: this.jobId
            }
          })
        }
      })
    },
    flowHandleMenu(name) {
      switch (name) {
        case "edit":
          this.showFlowMsg(this.selectFlowObj)
          break;
        case "copy":
          this.copyFlowObj = this.selectFlowObj
          console.log(this.copyFlowObj)
          break;
      }
    },
    handleOpen(item){
      this.selectFlowObj = this._.cloneDeep(item)
    },
    copyFlow(item) {
      this.copyFlowObj = item
      this.$Message.info("复制完成")

    },
    enterFlow() { // 路由到jobEditor页面
      setTimeout(() => { // 延时关闭右侧抽屉
        this.$store.commit('handleShowDrawer')
      }, 800)
      this.$store.commit('job/setJobFlowInfo',this.currentFlow)
      // 清空失效的数据
      this.$store.commit('job/setOuterDiagramModel', null)
      this.$store.commit('files/handleResFiles', { action: 'clearResFiles' })
      this.$router.push({ // 跳转到 JobEditor
        name: 'jobEditor',
        query: {
          jobId: this.jobId
        }
      })
    },
    toEdit() {
      this.edit = true
    },
    async toCancel() {
      this.edit = false
      await this.refresh(this.jobId)
    },
    async toSave() {
      this.edit = false
      // for (let item of this.jobFlowList){
      //   let index = this.jobFlowList.indexOf(item)
      //   if (item.order !== index) {
      //     await updateFlowWithFlowId(item.id,{order:index})
      //   }
      // }
      //
      for (let item of this.removeFlowList){
        await deleteFlowWithFlowId(item.id)
      }

      let orderList = this.jobFlowList.map(item => item.id)
      await updateFlowOrder(this.jobId,orderList)

      await this.refresh(this.jobId)
    },
    showFlowMsg(flowItem) {
      if (!this.edit){
        // this.flowModal = true
        this.currentFlow = flowItem
        this.enterFlow()
      }
    },
    // copyFlow(index) {
    //   this.copyFlowObj = this.jobFlowList[index]
    // },
    async pasteJobFlow(){
      console.log(this.copyFlowObj.id)
      // copy操作
      let { status } = await copyFlowWithFlowId({copy_job:this.jobId,flow:this.copyFlowObj.id})
      console.log(status)
      if (status === 200) {
        this.$Message.info("粘贴成功")
      }else {
        this.$Message.error("粘贴失败")
      }
      await this.refresh(this.jobId)
      this.copyFlowObj = null

    },
    deleteJobFlow(index) {
      this.removeFlowList.push(...this.jobFlowList.splice(index,1))
    },
    swapArray(arr, index1, index2) {
      arr[index1] = arr.splice(index2, 1, arr[index1])[0];
      return arr;
    },
    zIndexBottom(index){
      if(index!==0){
        let moveNum = index - 0;
        for (let i = 0; i<moveNum; i++) {
          this.swapArray(this.jobFlowList, index, index - 1);
          index--;
        }
      }
    }

  }
}
</script>

<style scoped>
body,html{
  -moz-user-select: none;
  -khtml-user-select: none;
  user-select: none;
}
h3,h4{
  text-align:center;
}
.list {
  max-height: 80vh;
  margin: 0 auto;
  padding: 0;
  width: 100%;
  overflow: auto;
  background-color: #f3f3f3;
  border: 1px solid #efefef;
  /*max-width:600px;*/
  cursor:pointer;
}
.list-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px;
  background-color: #fff;
  border-bottom: 1px solid #efefef;
  box-sizing: border-box;
  user-select: none;
  color: #333;
  font-weight: 400;
}
.flow-class {
  width: 80%;
}
.add-icon {
  position: relative;
}
.SortableItem2 p{
  font-size:24px;
  font-weight:bold;
  cursor:pointer;
  background:#efefef;
  margin:0;
  height:30px;
}
.disabled-input >>> input {
  background-color: #0000;
  color: #515a6e;
  border: #eee dotted 1px;
}
.disabled-input >>> textarea {
  background-color: #0000;
  color: #515a6e;
  border: #eee dotted 1px;
}
</style>
