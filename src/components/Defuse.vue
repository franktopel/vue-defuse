<template>
  <div class="defuse">
  <div class="row" v-for="row,idx in map">
    <div class="field" v-for="field in row" @click="open">
        <span v-if="field.isBomb">    💣</span>
    </div>
  </div>
  </div>
</template>

<script>

function Field (x, y) {
  this.x = x
  this.y = y
  this.isOpen = false
  this.isBomb = false
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
      remainingBombs: null
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
      this.map[1][1].isBomb = true
    },

    open () {
      console.log(arguments)
      //
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
:root {
  --fieldwidth: 20px;
}

.field {
  // height: var(--fieldwidth);
  // width: var(--fieldwidth);
  height: 20px;
  width: 20px;
  background-color: #ddd;
  margin: 1px;
}

.row {
  display: flex;
}
</style>
