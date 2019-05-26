<template>
  <not-found-component></not-found-component>
</template>

<script>
import NotFoundComponent from '../components/notFoundComponent'
export default {
  name: 'notFound',
  components: { NotFoundComponent },
  mounted () {
    console.log('guozijun pig')
  }
}
</script>

<style scoped>

</style>
