<template>
  <div class="defuse">
    <div class="row" v-for="row,idx in map">
      <m-field
        v-for="field in row" :field="field" :key="`${field.x},${field.y}`"
        @click.native="open(field)"
      ></m-field>
    </div>
    <input placeholder="x" type="text" v-model="addBombX"/>
    <input placeholder="y" type="text" v-model="addBombY"/>
    <button type="button" @click="addBomb(addBombX, addBombY)">Add Bomb</button>
  </div>
</template>

<script>
import Vue from 'vue'
import MField from './Field'
function Field (x, y, hasBomb = false) {
  this.x = x
  this.y = y
  this.isOpen = false
  this.hasBomb = hasBomb
  this.isMarked = false
}
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
      addBombY: null
    }
  },
  mounted () {
    this.clearMap()
    this.placeBombs()
  },
  methods: {
    clearMap () {
      this.map = []
      for (let y = 0; y < this.dimY; y++) {
        let row = []
        for (let x = 0; x < this.dimX; x++) {
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
      Vue.set(this.map[x][y], 'hasBomb', true)
    },

    open (field) {
      // Vue.set(field, 'isOpen', true)
      Vue.set(this.map[field.x][field.y], 'isOpen', true)

      console.log(field)
      if (field.hasBomb) {
        this.endGame()
      }
    },

    endGame () {
      alert('boom')
    }
  },
  components: {
    MField
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
  :root {
    --fieldwidth: 20px;
  }



  .row {
    display: flex;
  }


</style>
