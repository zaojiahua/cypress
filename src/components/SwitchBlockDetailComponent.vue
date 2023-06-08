<template>
  <Modal
    title="Switch Detial  "
    :value="switchBlockModalShow"
    :mask-closable="false"
    :closable="false">
    <Form ref="switchBlockForm" :label-width="120" :model="switchBlockInfo" :rules="switchBlocRules" @submit.native.prevent>
      <FormItem label="name" prop="switchBlockName">
        <Input v-model="switchBlockInfo.switchBlockName" placeholder="Enter something..."/>
      </FormItem>
      <FormItem :label="$t('normal.tips_8')">
        <Input v-model="switchBlockInfo.switchBlockTime" />
      </FormItem>
    </Form>

    <div slot="footer">
      <Button type="text" size="large" @click="cancel">{{$t('public.btn_cancel')}}</Button>
      <Button type="primary" size="large" @click="submit">{{$t('public.btn_ok')}}</Button>
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
          { required: true, message: this.$t('normal.tips_9'), trigger: 'blur' }
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
