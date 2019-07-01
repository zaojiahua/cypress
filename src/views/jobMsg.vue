<template>
  <div>
    <job-msg-component ref="jobDetail"></job-msg-component>
  </div>

</template>
<script>
import jobMsgComponent from '../components/jobMsgComponent'
export default {
  name: 'jobMsg',
  data () {
    return {
    }
  },
  components: { jobMsgComponent },
  mounted () {
    this.$refs.jobDetail.getMsg(this.$route.params.id)
  }

}
</script>
