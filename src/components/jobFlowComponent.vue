<template>
  <Collapse simple>
    <Panel name="1">
      {{ title }}
      <SlickList slot="content" v-show="edit" :lockToContainerEdges="true" :useDragHandle="true" class="list" lockAxis="y" v-model="jobInfo.job_flows">
        <SlickItem class="list-item" v-for="(item, index) in jobInfo.job_flows" :index="index" :key="index">
          <div style="width: 20%">
            <Icon v-handle type="ios-menu" :size="iconSize"/>
            <Icon type="ios-trash" :size="iconSize" @click="deleteJobFlow(index)"/>
            <Icon v-show="index!==0" type="md-arrow-up" :size="iconSize" @click="zIndexBottom(index)"/>
          </div>
          <p @click="editFlow(item.id)">{{item.name}}</p>
        </SlickItem>
        <div class="list-item">
          <Icon  type="ios-add-circle-outline" :size="iconSize" class="add-icon" @click="addJobFlow"/>
        </div>

      </SlickList>
    </Panel>
  </Collapse>
</template>

<script>
import { HandleDirective,SlickList, SlickItem } from 'vue-slicksort'
import {mapState} from "vuex";
export default {
  props: {
    title: {
      type: String,
      default: '用例流程图列表'
    }
  },
  data () {
    return {
      flag: true,
      edit:true,
      iconSize: 18,
    }
  },
  directives: {
    handle: HandleDirective
  },
  components: {
    SlickItem,
    SlickList,
  },
  computed: {
    ...mapState('job', ['jobInfo']),
  },

  methods: {
    getChangeLists (vals) {
      console.log(vals, 'vals')
    },
    toEdit() {
      this.edit = !this.edit
    },
    editFlow(id=null) {
      alert(id)
    },
    deleteJobFlow(index) {
      this.jobInfo.job_flows.splice(index,1)
      console.log(this.jobInfo)
    },
    addJobFlow(){
      this.jobInfo.job_flows.push({name: 'list11'})
    },
    swapArray(arr, index1, index2) {
      arr[index1] = arr.splice(index2, 1, arr[index1])[0];
      return arr;
    },
    zIndexBottom(index){
      if(index!==0){
        let moveNum = index - 0;
        for (let i = 0; i<moveNum; i++) {
          this.swapArray(this.jobInfo.job_flows, index, index - 1);
          index--;
        }
      }
    }

  }
}
</script>

<style>
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
</style>
