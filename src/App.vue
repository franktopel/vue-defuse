<template>
  <div id="defuse">
    <vue-slider
      v-model="dimX"
      v-bind="sliderOptions"
    ></vue-slider>
    <vue-slider
      v-model="dimY"
      v-bind="verticalSliderOptions"
    ></vue-slider>
    <p class="fieldwidth">Width/height of a single field:
      <vue-slider
        v-model="fieldWidth"
        v-bind="Object.assign({}, sliderOptions, { width: 290, class: 'slider-small', min: 20, max: 100 })">
      </vue-slider>
    </p>
    <p class="fieldwidth">Number of bombs:
      <vue-slider
        v-model="numberOfBombs"
        v-bind="Object.assign({}, sliderOptions, { width: 290, class: 'slider-small', min: 0, max: dimY * dimX })">
      </vue-slider>
    </p>
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
      fieldWidth: 40,
      numberOfBombs: 10,
      sliderOptions,
      verticalSliderOptions,
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
    padding: 40px 60px;
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
    padding: 1em;
  }
</style>
