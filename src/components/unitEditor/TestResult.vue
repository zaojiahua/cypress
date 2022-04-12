<template>
  <Modal v-model="modalOpen" fullscreen title="测试结果">
    <Row type="flex" justify="center" align="top">
      <!--    这是点击测试按钮展开的模态框，分左右两部分，根据slot插入的不同，左边可能是小图标或者裁剪后的图-->
      <Col span="11"  >
        <div class="img">
          <slot name="left" ></slot>
        </div>
      </Col>
      <Col span="2">
<!--        右边是带十字星的图标查找图或带文字选框的文字查找图-->
        <div style="{min-height: 100%;height: 120vh;position: relative;}">
          <div class="divider">
          </div>
        </div>
      </Col>
      <Col span="11">
        <div class="img">
          <slot name="right"></slot>
        </div>
      </Col>
    </Row>
    <div slot="footer">
      <Button type="primary" @click="close">确定</Button>
    </div>
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
    }
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
    max-height: 600px;
    max-width: 100%;
  }
  .divider{
    position: absolute;
    left: 50%;
    top: 0;
    min-height: 100%;
    height: auto;
    width: 1px;
    border-left: 1px solid grey;
  }

</style>
