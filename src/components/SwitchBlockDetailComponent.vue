<template>
  <Modal
    title="switchBlock Detail"
    :value="switchBlockModalShow"
    :mask-closable="false"
    :closable="false">
    <Form ref="switchBlockForm" :label-width="80" :model="switchBlockInfo" :rules="switchBlocRules">
      <FormItem label="name" prop="switchBlockName">
        <Input v-model="switchBlockInfo.switchBlockName" placeholder="Enter something..."/>
      </FormItem>
      <FormItem label="fileName" prop="fileName">
        <Input v-model="switchBlockInfo.fileName" placeholder="Enter something..."/>
      </FormItem>
      <FormItem label="explain" prop="explain">
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
    const validatePassCheck = (rule, value, callback) => {
      if (!value) {
        callback(new Error('文件名不能为空'))
      } else if (!new RegExp('(.py|.txt)$').test(value)) {
        callback(new Error('文件名后缀必须为 .py|.txt'))
      } else {
        callback()
      }
    }
    return {
      switchBlockRules: '',
      switchBlocRules: {
        switchBlockName: [
          { required: true, message: 'switchBlock名称不能为空', trigger: 'blur' }
        ],
        fileName: [
          { validator: validatePassCheck, trigger: 'blur' }
        ],
        explain: [
          { required: true, message: '描述不能为空', trigger: 'blur' }
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
