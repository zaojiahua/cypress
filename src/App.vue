<template>
  <div id="app" style="min-width: 1366px;">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'app'
}
</script>

<style scoped>
  html,body{
    height: 100%;
  }
  body{
    margin: 0;
  }
  #app{
    height: 100%;
  }
</style>
