<template>
  <div class="defuse">
    <vue-slider
      v-model="dimX"
      v-bind="sliderOptions"
    ></vue-slider>
    <vue-slider
      v-model="dimY"
      v-bind="verticalSliderOptions"
    ></vue-slider>
    <div class="row">
      <div class="field"></div>
      <div class="field" v-for="n in X">{{ n }}</div>
    </div>
    <div class="row" v-for="row, index in map">
      <div class="field">{{ index + 1 }}</div>
      <m-field
        v-for="field in row"
        :field="field"
        :key="`${field.x},${field.y}`"
        :class="{ 'is-highlighted': field.x == addBombX - 1 && field.y == addBombY - 1 }"
        @click.native="open(field)"
      ></m-field>
    </div>
    <br />

    <br />
    <br />
    <br />
    <input placeholder="x" type="number" min="1" :max="X-1" v-model="addBombX"/>
    <input placeholder="y" type="number" min="1" :max="Y-1" v-model="addBombY"/>
    <button type="button" @click="addBomb(parseInt(addBombX-1), parseInt(addBombY-1))">Add Bomb</button>
  </div>
</template>

<script>
import MField from './Field'
import VueSlider from 'vue-slider-component'
var sliderOptions = require('../helper/sliderOptions')
var verticalSliderOptions = require('../helper/verticalSliderOptions')

const Field = require('../helper/Field')

export default {
  name: 'Defuse',
  data () {
    return {
      dimX: 10,
      dimY: 10,
      map: null,
      numberOfBombs: null,
      remainingBombs: null,
      addBombX: null,
      addBombY: null,
      sliderOptions,
      verticalSliderOptions
    }
  },
  computed: {
    X () {
      return parseInt(this.dimX)
    },
    Y () {
      return parseInt(this.dimY)
    }
  },
  watch: {
    dimX: function (newVal, oldVal) {
      this.clearMap()
    },
    dimY: function () {
      this.clearMap()
    }
  },
  created () {
    this.clearMap()
    this.placeBombs()
  },
  methods: {
    clearMap () {
      this.map = []
      for (let y = 0; y < this.Y; y++) {
        let row = []
        for (let x = 0; x < this.X; x++) {
          let field = new Field(x, y)
          row.push(field)
        }
        this.map.push(row)
      }
    },

    placeBombs () {
      this.map[1][1].hasBomb = true
    },

    addBomb (x, y) {
      this.map[x][y].hasBomb = true
    },

    open (field) {
      field.isOpen = true
      if (field.hasBomb) {
        this.endGame()
      }
    },

    endGame () {
      alert('boom')
    }
  },
  components: {
    MField,
    VueSlider
  }
}
</script>

<style lang="scss">
  :root {
    --fieldwidth: 20px;
  }

  .defuse {
    padding: 80px 0 0 80px;
    position: relative;
  }

  input, button {
    font-size: 16px;
    padding: 1em;
  }

  .row {
    display: flex;
  }

  .vue-slider-vertical-reverse {
    left: 0;
    position: absolute;
  }

  .vue-slider-horizontal {
    left: 180px;
    position: absolute;
    top: 40px;
  }
</style>
