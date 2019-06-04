<template>
  <div>
    <job-msg-component :prop-job-id="id" :prop-job-msg-load="flag"></job-msg-component>
  </div>

</template>
<script>
import jobMsgComponent from '../components/jobMsgComponent'
export default {
  // parseInt($route.params.id)
  name: 'jobMsg',
  data () {
    return {
      flag: true,
      id: 86
    }
  },
  components: { jobMsgComponent }
}
</script>
