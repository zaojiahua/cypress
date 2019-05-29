<template>
  <job-msg-component :job-id="$route.params.id"></job-msg-component>
</template>
<script>
import jobMsgComponent from '../components/jobMsgComponent'
export default {
  name: 'jobMsg',
  components: { jobMsgComponent }
}
</script>
