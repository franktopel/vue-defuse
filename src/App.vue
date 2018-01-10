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
import VueSlider from 'vue-slider-component'
var sliderOptions = require('./helper/sliderOptions')
var verticalSliderOptions = require('./helper/verticalSliderOptions')

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
    VueSlider
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

  .vue-slider-component.vue-slider-vertical-reverse {
    left: 0;
    position: absolute;
  }

  .fieldwidth {
    margin: 50px auto 0;
  }

  .vue-slider-component.slider-small {
    display: inline-block;
  }

  input, button {
    font-size: 16px;
    padding: .5em;
  }
</style>
