<template>
  <div class="defuse"
       @click.right.prevent>
    <h2 class="game-title">Defuse!</h2>
    <div class="game-state">
      <span class="bomb-mark-count"
            :data-bomb-mark-count="remainingBombsCount"></span>
      <span class="win-lose-state"
            @click="buildMap()"
      >{{ winLoseSymbol }}</span>
      <span class="timer">⌛ {{ timePassed | formatTimer }}</span>
    </div>
    <div class="playfield" :class="{ 'game-over': gamestate === 'lost' || gamestate === 'won' }">
      <div class="row"
           v-for="row, index in map">
        <m-field
          v-for="field in row"
          :field="field"
          :key="`${field.x},${field.y}`"
          @click.native.prevent="open(field)"
          @click.right.native.prevent="toggleBombMarker(field, $event)"
          @longtap="longtap(field)"
        ></m-field>
      </div>
      <div class="playfield-overlay">
        <div class="inner">
          <h3>GAME OVER!</h3>
          <h4>{{ winLoseSymbol }}</h4>
          <button type="button" @click="buildMap">{{ gamestate === 'lost' ? 'Try again' : 'Restart' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MField from './Field'

const Field = require('../helper/Field')

export default {
  name: 'Defuse',
  props: {
    X: {
      type: Number,
      default: 10,
    },
    Y: {
      type: Number,
      default: 10,
    },
    fieldWidth: {
      type: [String, Number],
      default: 40,
    },
    numberOfBombs: {
      type: Number,
      default: 0,
    }
  },
  data () {
    return {
      map: null,
      bombsMarkedCount: 0,
      closedFieldCount: 0,
      winLoseSymbol: '',
      timePassed: 0,
      timer: null,
      gamestate: undefined
    }
  },
  watch: {
    X: function (newVal, oldVal) {
      this.buildMap()
    },

    Y: function () {
      this.buildMap()
    },

    numberOfBombs: function () {
      this.buildMap()
    },

    fieldWidth: function (newVal, oldVal) {
      document.querySelector(':root').style.setProperty('--fieldwidth', `${newVal}px`)
    }
  },
  created () {
    this.buildMap()
    document.querySelector(':root').style.setProperty('--fieldwidth', `${this.fieldWidth}px`)
  },
  computed: {
    remainingBombsCount () {
      return this.numberOfBombsValidated - this.bombsMarkedCount
    },
    numberOfBombsValidated () {
      return Math.min((this.X * this.Y), this.numberOfBombs)
    }
  },
  filters: {
    formatTimer (seconds) {
      if (seconds.toString().length < 4) {
        return ('0000' + seconds).substr(-4)
      } else {
        return seconds
      }
    }
  },
  methods: {
    clearMap () {
      this.timePassed = 0
      this.stopTimer()
      this.winLoseSymbol = '😃'
      this.closedFieldCount = this.X * this.Y
      this.bombsMarkedCount = 0
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

    toggleBombMarker (field, event) {
      if (event && event.sourceCapabilities.firesTouchEvents) {
        return
      }
      this.startTimer()
      if (field.isOpen) {
        return
      }
      this.map[field.y][field.x].isMarked = !this.map[field.y][field.x].isMarked
      if (this.map[field.y][field.x].isMarked) {
        this.bombsMarkedCount++
      } else {
        this.bombsMarkedCount--
      }
    },

    buildMap () {
      this.clearMap()
      this.placeBombs()
      this.gamestate = undefined
    },

    placeBombs () {
      let freeFields = []
      for (let y = 0; y < this.Y; y++) {
        for (let x = 0; x < this.X; x++) {
          freeFields.push({x, y})
        }
      }

      for (let bombIdx = 0; bombIdx < this.numberOfBombsValidated; bombIdx++) {
        let rndIdx = Math.floor(Math.random() * freeFields.length)
        let field = freeFields[rndIdx]
        freeFields.splice(rndIdx, 1)
        this.map[field.y][field.x].hasBomb = true
      }
    },

    open (field) {
      this.startTimer()
      if (field.isMarked) {
        return
      }
      if (!field.isOpen) {
        this.closedFieldCount--
      }
      field.isOpen = true
      if (field.hasBomb) {
        this.endGame()
      } else {
        let neighbourFields = this.getNeighbours(field)
        let numNeighbourBombs = 0
        neighbourFields.forEach(function (neighField) {
          if (neighField.hasBomb) {
            numNeighbourBombs++
          }
        })

        // showNumber
        this.map[field.y][field.x].numNeighbourBombs = numNeighbourBombs
        if (numNeighbourBombs === 0) {
          neighbourFields.forEach(neighField => {
            if (!neighField.isOpen && !neighField.isMarked) {
              window.setTimeout(() => { this.open(neighField) }, Math.floor(Math.random() * 300))
            }
          })
        }
        if (this.closedFieldCount === this.numberOfBombsValidated) {
          this.winGame()
        }
      }
    },

    getNeighbours (field) {
      let list = []
      let minX = Math.max(0, field.x - 1)
      let maxX = Math.min(this.X - 1, field.x + 1)
      let minY = Math.max(0, field.y - 1)
      let maxY = Math.min(this.Y - 1, field.y + 1)
      for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
          if (x !== field.x || y !== field.y) {
            list.push(this.map[y][x])
          }
        }
      }
      return list
    },

    winGame () {
      this.winLoseSymbol = '😄'
      this.gamestate = 'won'
      this.stopTimer()
    },

    endGame () {
      this.winLoseSymbol = '😡'
      this.gamestate = 'lost'
      this.stopTimer()
    },

    startTimer () {
      if (!this.timer) {
        this.timePassed = 0
        this.timer = setInterval(() => {
          this.timePassed++
        }, 1000)
      }
    },

    stopTimer () {
      clearInterval(this.timer)
      this.timer = null
    },

    longtap (field, event) {
      this.toggleBombMarker(field, event)
    },

    log (val) {
      console.log(val)
    }
  },
  components: {
    MField
  }
}
</script>

<style lang="scss">
  .defuse {
    background-color: #f0f0f0;
    display: inline-block;
    position: relative;
    border: 2px solid #aaa;
    padding: 0 .3em .3em;
  }

  .game-title {
    background-color: #333;
    color: #fff;
    font-size: 2em;
    text-align: center;
    margin: 0 -.15em;
  }

  .row {
    display: flex;
  }
  .game-state {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 0.6em;
    > * {
      background-color: #fff;
      display: flex;
      flex-direction: column;
      font-size: 2em;
      justify-content: center;
      text-align: center;
      width: 30%;
    }
  }

  .playfield-overlay {
    background-color: rgba(0, 0, 0, .66);
    bottom: 0;
    position: absolute;
    left: 0;
    right: 0;
    transform: scale(0);
    top: 0;
  }

  .playfield {
    position: relative;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -webkit-tap-highlight-color: rgba(0,0,0,0);
  }

  .playfield.game-over {
    z-index: 1000;
    .playfield-overlay {
      color: #fff;
      text-align: center;
      transform: scale(1);
      transition-duration: .5s;
      z-index: 9999;
      .inner {
        left: 50%;
        opacity: .5;
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
        h3 {
          font-size: 3em;
          margin: 0;
          white-space: nowrap;
        }
        h4 {
          font-size: 3em;
          margin: 0;
        }
        button {
          appearance: none;
          background-color: #fff;
          padding: 0.5em 2em;
        }
      }
    }
  }


  .bomb-mark-count {
    border: 1px solid #ddd;
    flex-basis: 1;
    &::before {
      content: "💣 "attr(data-bomb-mark-count)
    }
  }

  .win-lose-state {
    border: 1px solid #ddd;
    font-size: 4em;
    flex-basis: 1;
  }

  .timer {
    border: 1px solid #ddd;
    flex-basis: 1;
  }


</style>
