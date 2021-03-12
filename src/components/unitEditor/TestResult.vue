<template>
  <Modal v-model="modalOpen" fullscreen title="测试结果"    @on-ok="close"  @on-cancel="close">
    <Row type="flex" justify="center" align="top">
      <Col span="11"  >
        <div class="img">
          <slot name="left" ></slot>
        </div>
      </Col>
      <Col span="2">
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
