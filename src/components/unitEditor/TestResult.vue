<template>
  <Modal v-model="modalOpen" fullscreen title="测试结果"    @on-ok="close"  @on-cancel="close">
<!--    <p>用时：{{responseDate.data.speed_time}}</p>-->
    <Row type="flex" justify="center" align="middle">
      <Col span="11"  >
        <Divider>识别的图片</Divider>
        <div class="img">
          <img :src="responseDate.data.img_detected" alt="">
        </div>
      </Col>
      <Col span="2">
      <Divider type="vertical" />
      </Col>
      <Col span="11">
        <List border size="small">
          <Divider>识别的文字</Divider>
          <ListItem v-for="(words,index) in responseDate.result">{{index+1}}: {{words.text}}</ListItem>
        </List>
      </Col>
    </Row>
<!--    <h1>{{ responseDate }}</h1>-->
  </Modal>
</template>

<script>
export default {
  name: "TestResult",
  data() {
    return {
      modalOpen: this.openTestResultModal
    }
  },
  watch: {
    openTestResultModal(val) {
      this.modalOpen = val
    }
  },
  props: {
    openTestResultModal: {
      type: Boolean
    },
    responseDate: Object
  },
  methods:{
    close (){
      this.$emit("closeTestModal")
    }
  }

}
</script>

<style scoped>
  .img{
    text-align: center;
  }
  img {
    max-height: 600px;
    text-align: center;
    /*max-width: 100%;*/
  }

</style>
