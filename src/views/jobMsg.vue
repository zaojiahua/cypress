<template>
  <job-msg-component :job-id="$route.params.id" :is-submit="submit">
    <Button type="success" @click="submitJobMsg">提交</Button>
    <Button type="error" style="margin-left: 8px">取消</Button>
  </job-msg-component>
</template>
<script>
import jobMsgComponent from '../components/jobMsgComponent'
export default {
  name: 'jobMsg',
  data () {
    return {
      submit: false
    }
  },
  components: { jobMsgComponent },
  methods: {
    submitJobMsg () {
      this.submit = true
    }
  }
}
</script>
