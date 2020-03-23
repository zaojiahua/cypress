<template>
  <Modal
    title="Switch Detial  "
    :value="switchBlockModalShow"
    :mask-closable="false"
    :closable="false">
    <Form ref="switchBlockForm" :label-width="80" :model="switchBlockInfo" :rules="switchBlocRules">
      <FormItem label="name" prop="switchBlockName">
        <Input v-model="switchBlockInfo.switchBlockName" placeholder="Enter something..."/>
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
      switchBlockRules: '',
      switchBlocRules: {
        switchBlockName: [
          { required: true, message: 'Switch名称不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  model: {
    prop: 'switchBlockModalShow',
    event: 'close'
  },
  methods: {
    submit () {
      this.$refs.switchBlockForm.validate((valid) => {
        if (valid) {
          this.$emit('close', false)
          this.$emit('save', this.switchBlockInfo)
        } else {
          this.$Message.error('Fail!')
        }
      })
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
