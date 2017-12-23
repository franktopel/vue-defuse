<template>
  <div id="app">
    <Defuse/>
  </div>
</template>

<script>
import Defuse from './components/Defuse'

export default {
  name: 'app',
  components: {
    Defuse
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
