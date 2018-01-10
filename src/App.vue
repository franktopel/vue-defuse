<template>
  <div id="defuse">
    <Defuse
      :X="dimX | toInt"
      :Y="dimY | toInt"
      :numberOfBombs="Math.min((dimX * dimY), numberOfBombs) | toInt"
      :fieldWidth="fieldWidth" />
  </div>
</template>

<script>
import Defuse from './components/Defuse'

export default {
  name: 'defuse',
  data () {
    return {
      dimX: 10,
      dimY: 10,
      fieldWidth: 60,
      numberOfBombs: 10,
    }
  },
  components: {
    Defuse,
  },
  filters: {
    toInt (val) {
      if (!isNaN(val)) {
        return parseInt(val)
      } else {
        return null
      }
    }
  }
}
</script>

<style lang="scss">
  #defuse {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
    padding: 1em;
    text-align: center;
  }

  .fieldwidth {
    margin: 50px auto 0;
  }

  input, button {
    font-size: 16px;
    padding: .5em;
  }
</style>
