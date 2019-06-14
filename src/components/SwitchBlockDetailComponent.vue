<template>
  <Modal
    title="switchBlock Detail"
    :value="switchBlockModalShow"
    :mask-closable="false"
    :closable="false">
    <Form ref="switchBlockForm" :label-width="80" :model="switchBlockInfo">
      <FormItem label="name">
        <Input v-model="switchBlockInfo.switchBlockName" placeholder="Enter something..."/>
      </FormItem>
      <FormItem label="fileName">
        <Input v-model="switchBlockInfo.fileName" placeholder="Enter something..."/>
      </FormItem>
      <FormItem label="explain">
        <Input v-model="switchBlockInfo.explain" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="Enter something..." />
      </FormItem>
    </Form>

    <div slot="footer">
      <Button type="text" size="large" @click="cancel">取消</Button>
      <Button type="primary" size="large" @click="submit">确定</Button>
    </div>
  </Modal>
</template>

<script>
export default {
  name: 'SwitchBlockDetailComponent',
  props: {
    switchBlockInfo: {
      type: Object,
      default: () => ({})
    },
    switchBlockModalShow: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      switchBlockRules: ''
    }
  },
  model: {
    prop: 'switchBlockModalShow',
    event: 'close'
  },
  methods: {
    submit () {
      this.$emit('close', false)
      this.$emit('save', this.switchBlockInfo)
    },
    cancel () {
      this.$emit('close', false)
      this.$emit('clear')
    }
  }
}
</script>

<style scoped>

</style>
