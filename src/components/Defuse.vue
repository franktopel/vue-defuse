<template>
  <div class="defuse"
       @click.right.prevent>
    <h2 class="game-title">Defuse! <button type="button" class="defuse-settings" @click="toggleSettings">⚙</button></h2>
    <div class="game-state">
      <span class="bomb-mark-count"
            :data-bomb-mark-count="remainingBombsCount"></span>
      <span class="win-lose-state"
            @click="buildMap()"
      >{{ winLoseSymbol }}</span>
      <span class="timer">⌛ {{ timePassed | formatTimer }}</span>
    </div>
    <div class="playfield" :class="{ 'game-over': gamestate === 'lost' || gamestate === 'won', 'defuse-settings': showSettings }">
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
      <div class="playfield-overlay game-over">
        <div class="inner">
          <h3>{{ message(`gamestate.${gamestate}`) }}</h3>
          <h4>{{ winLoseSymbol }}</h4>
          <button type="button" @click="buildMap">{{ gamestate === 'lost' ? 'Try again' : 'Restart' }}</button>
        </div>
      </div>
      <div class="playfield-overlay defuse-settings" id="defuse-settings" >
        <div class="language-switch">
          <button type="button" v-for="lang in languages" :class="{ 'active-language': language === lang }" @click="language = lang">{{ lang }}</button>
        </div>
        <button class="close" @click="showSettings = false">✖</button>
        <div class="inner">
          <label>{{ message('settings.label.playfieldWidth') }}
            <input type="number" min="1" :max="100" step="1" v-model="setX" :placeholder="message('settings.label.playfieldWidth')"/>
          </label>
          <label>{{ message('settings.label.playfieldHeight') }}
            <input type="number" min="1" :max="100" step="1" v-model="setY" :placeholder="message('settings.label.playfieldHeight')"/>
          </label>
          <label>{{ message('settings.label.bombCount') }}
            <input type="number" min="0" :max="X * Y" step="1" v-model="setBombCount" :placeholder="message('settings.label.bombCount')"/>
          </label>
          <label>{{ message('settings.label.fieldSize') }}
            <input type="number" min="20" max="60" step="1" v-model="setFieldWidth" :placeholder="message('settings.label.fieldSize')"/>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MField from './Field'
const messages = require('../i18n/translations.json')
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
      gamestate: undefined,
      showSettings: false,
      setX: this.X * 1,
      setY: this.Y * 1,
      setBombCount: this.numberOfBombs * 1,
      setFieldWidth: this.fieldWidth * 1,
      messages,
      language: 'en',
    }
  },
  watch: {
    X: function (newVal, oldVal) {
      this.setX = newVal
      this.buildMap()
    },

    Y: function (newVal, oldVal) {
      this.setY = newVal
      this.buildMap()
    },

    setX: function (newVal, oldVal) {
      this.buildMap()
    },

    setY: function () {
      this.buildMap()
    },

    setBombCount: function (newVal, oldVal) {
      this.buildMap()
    },

    setFieldWidth: function (newVal) {
      document.querySelector(':root').style.setProperty('--fieldwidth', `${newVal}px`)
    },

    numberOfBombs: function () {
      this.setBombCount = null
      this.buildMap()
    },

    fieldWidth: function (newVal, oldVal) {
      this.setFieldWidth = null
      document.querySelector(':root').style.setProperty('--fieldwidth', `${newVal}px`)
    }
  },
  created () {
    this.buildMap()
    document.querySelector(':root').style.setProperty('--fieldwidth', `${this.setFieldWidth ? this.setFieldWidth : this.fieldWidth}px`)
  },
  computed: {
    remainingBombsCount () {
      return this.numberOfBombsValidated - this.bombsMarkedCount
    },
    numberOfBombsValidated () {
      return Math.min((this.getX * this.getY), this.getBombCount ? parseInt(this.getBombCount) : this.numberOfBombs)
    },
    getX () {
      return this.setX ? parseInt(this.setX) : this.X
    },
    getY () {
      return this.setY ? parseInt(this.setY) : this.Y
    },
    getBombCount () {
      return this.setBombCount ? parseInt(this.setBombCount) : this.numberOfBombs
    },
    languages () {
      return Object.keys(this.messages)
    }
  },
  filters: {
    formatTimer (seconds) {
      let mins, secs, hrs, remainingSecs
      hrs = ('0' + Math.floor(seconds / 3600)).substr(-2)
      remainingSecs = seconds - hrs * 3600
      mins = ('0' + Math.floor(remainingSecs / 60)).substr(-2)
      secs = ('0' + remainingSecs % 60).substr(-2)
      return `${hrs}:${mins}:${secs}`
      // use this if all you wanna see is seconds filled up with zeros
      // if (seconds.toString().length < 4) {
      //   return ('0000' + seconds).substr(-4)
      // } else {
      //   return seconds
      // }
    }
  },
  methods: {
    clearMap () {
      this.timePassed = 0
      this.stopTimer()
      this.winLoseSymbol = '😃'
      this.closedFieldCount = this.getX * this.getY
      this.bombsMarkedCount = 0
      this.map = []
      for (let y = 0; y < this.getY; y++) {
        let row = []
        for (let x = 0; x < this.getX; x++) {
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
      for (let y = 0; y < this.getY; y++) {
        for (let x = 0; x < this.getX; x++) {
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

        this.map[field.y][field.x].numNeighbourBombs = numNeighbourBombs
        if (numNeighbourBombs === 0) {
          neighbourFields.forEach(neighField => {
            if (!neighField.isOpen && !neighField.isMarked) {
              window.setTimeout(() => { this.open(neighField) }, Math.floor(Math.random() * (30000 / (this.getX * this.getY))))
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
      let maxX = Math.min(this.getX - 1, field.x + 1)
      let minY = Math.max(0, field.y - 1)
      let maxY = Math.min(this.getY - 1, field.y + 1)
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

    toggleSettings () {
      this.showSettings = !this.showSettings
    },

    message (key) {
      let message = messages[this.language]
      key.split('.').forEach(function (keypart) {
        message = message.hasOwnProperty(keypart) ? message[keypart] : undefined
      })
      return message || key
    },
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
    padding: 0 1em;
    margin: 0 -.15em;
    position: relative;
    text-align: center;
    button {
      border: 0;
      bottom: 0;
      background-color: transparent;
      outline: none;
      position: absolute;
      right: 0;
      top: 0;
      transition: all .4s ease;
      &:hover {
        transform: scale(2);
      }
    }
  }

  .row {
    display: flex;
  }
  .game-state {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: .4em 0;
    > * {
      background-color: #fff;
      display: flex;
      flex-direction: column;
      font-size: 2em;
      justify-content: center;
      text-align: center;
      white-space: nowrap;
      width: 32.5%;
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
    min-height: 378px;
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
    .playfield-overlay.game-over {
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
          padding: .5em 2em;
        }
      }
    }
  }
  .playfield.defuse-settings {
    z-index: 1000;
    .playfield-overlay.defuse-settings {
      color: #fff;
      text-align: center;
      transform: scale(1);
      transition-duration: .5s;
      z-index: 9999;
      .inner {
        left: 0;
        opacity: .95;
        position: absolute;
        padding: 2em 1em 1em;
        top: 2em;
      }
      label {
        input {
          display: block;
          margin-bottom: 1em;
          min-width: 120px;
          text-align: center;
        }
      }
      .close {
        appearance: none;
        background-color: transparent;
        border: 0;
        color: #fff;
        cursor: pointer;
        font-size: 2em;
        outline: 0;
        position: absolute;
        right: 0;
        top: 0;
      }
    }
  }

  .playfield.game-over.defuse-settings {
    .playfield-overlay.game-over {
      display: none;
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
    font-size: 1.5em;
    flex-basis: 1;
  }

  .language-switch {
    position: absolute;
    top: .4em;
    left: 1em;
    line-height: 1.5em;
    vertical-align: baseline;
    button {
      appearance: none;
      background-color: transparent;
      border: 0;
      color: #fff;
      cursor: pointer;
      padding: 0;
      margin-right: .4em;
      outline: none;
      transform-origin: center 70%;
      transition: all .1s linear;
      &::last-of-type() {
        margin-right: 0;
      }
      &.active-language {
        font-weight: bold;
        transform: scale(1.3)
      }
    }
  }


</style>
