<template>
  <div class="defuse"
       @click.right.prevent>
    <h2 class="game-title">
      Defuse!
      <button type="button"
              class="defuse-settings"
              @click="toggleSettings">⚙</button>
      <button type="button"
              class="defuse-instructions"
              @click="toggleInstructions">❔</button>
    </h2>
    <div class="game-state">
      <span class="bomb-mark-count"
            :data-bomb-mark-count="remainingBombsCount"></span>
      <span class="win-lose-state"
            @click="buildMap()"
            :title="message('gamestate.newGame')">{{ winLoseSymbol }}</span>
      <span class="timer">⌛ {{ timePassed | formatTimer }}</span>
    </div>
    <div class="playfield"
         :class="{
              'game-over': gamestate === 'lost' || gamestate === 'won',
              'defuse-settings': showSettings,
              'defuse-instructions': showInstructions }">
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
          <button type="button" @click="buildMap">{{ message('gamestate.retry') }}</button>
        </div>
      </div>
      <div class="playfield-overlay defuse-settings" id="defuse-settings" >
        <div class="language-switch">
          <button type="button" v-for="lang in languages" :class="{ 'active-language': language === lang }" @click="setLanguage(lang)">{{ lang }}</button>
        </div>
        <button class="close" @click="toggleSettings">✖</button>
        <div class="inner">
          <h3>{{ message('settings.label.difficulty.headline') }}</h3>
          <button type="button" @click="setParams(10, 10, 10)">{{ message('settings.label.difficulty.level.easy') }} (10 x 10, 10 💣)</button>
          <button type="button" @click="setParams(20, 20, 60)">{{ message('settings.label.difficulty.level.medium') }} (20 x 20, 60 💣)</button>
          <button type="button" @click="setParams(30, 20, 120)">{{ message('settings.label.difficulty.level.hard') }} (30 x 20, 120 💣)</button>
          <hr />
          <h3>{{ message('settings.label.headline') }}</h3>
          <div class="defuse-settings-custom">
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
      <div class="playfield-overlay defuse-instructions" id="defuse-instructions" >
        <div class="language-switch">
          <button type="button" v-for="lang in languages" :class="{ 'active-language': language === lang }" @click="setLanguage(lang)">{{ lang }}</button>
        </div>
        <button class="close" @click="toggleInstructions">✖</button>
        <div class="inner">
          <h3>{{ message('instructions.headline') }}</h3>
          <p v-for="line in message('instructions.texts')">{{ line }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MField from './Field'
const messages = require('../i18n/translations.json')
const Field = require('../helper/Field')

// get default language from either localStorage or from the browser
var userLang = localStorage.getItem('defuse-language') || navigator.language || navigator.userLanguage

// make sure the language is supported, fall back to 'en' otherwise
if (Object.keys(messages).indexOf(userLang) === -1) {
  userLang = 'en'
}

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
      showInstructions: false,
      setX: this.X * 1,
      setY: this.Y * 1,
      setBombCount: this.numberOfBombs * 1,
      setFieldWidth: this.fieldWidth * 1,
      messages,
      language: userLang,
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
      if (event && event.hasOwnProperty(sourceCapabilities) && event.sourceCapabilities.hasOwnProperty(firesTouchEvents)) {
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
              window.setTimeout(() => { this.open(neighField) }, Math.floor(10000 / (this.getX * this.getY)))
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
      if (!this.showSettings) {
        this.showInstructions = false
      }
      this.showSettings = !this.showSettings
    },

    toggleInstructions () {
      if (!this.showInstructions) {
        this.showSettings = false
      }
      this.showInstructions = !this.showInstructions
    },

    message (key) {
      let message = messages[this.language]
      key.split('.').forEach(function (keypart) {
        message = message.hasOwnProperty(keypart) ? message[keypart] : undefined
      })
      return message || key
    },

    setLanguage (lang) {
      if (this.languages.indexOf(lang) > -1) {
        localStorage.setItem('defuse-language', lang)
        this.language = lang
      }
    },

    setParams (x, y, m) {
      this.adjustFieldSize(x, y)
      this.setX = x
      this.setY = y
      this.setBombCount = m
      this.toggleSettings()
    },

    adjustFieldSize (x, y) {
      if (x * this.setFieldWidth > window.innerWidth - 50 || y * this.setFieldWidth > window.innerHeight - 170) {
        this.setFieldWidth = Math.min(Math.floor((window.innerWidth - 50) / x) - 2, Math.floor((window.innerHeight - 170) / y) - 2)
      }
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
    margin: 0 -.15em;
    padding: 0 1em;
    position: relative;
    text-align: center;
    .defuse-settings,
    .defuse-instructions {
      background-color: transparent;
      border: 0;
      bottom: 0;
      outline: none;
      position: absolute;
      top: 0;
      transition: all .4s ease;
      &:hover {
        transform: scale(2);
      }
    }
    .defuse-settings {
      right: 0;
    }
    .defuse-instructions {
      left: 0;
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

  .bomb-mark-count {
    flex-basis: 2;
    &::before {
      content: "💣 "attr(data-bomb-mark-count)
    }
  }

  .win-lose-state {
    font-size: 3em;
    flex-basis: fit-content;
  }

  .timer {
    font-size: 1.5em;
    flex-basis: 2;
  }

  .playfield-overlay {
    background-color: rgba(0, 0, 0, .66);
    bottom: 0;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    transform: scale(0);
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
        bottom: 0;
        left: 0;
        opacity: .95;
        overflow: scroll;
        position: absolute;
        padding: 2em 1em 1em;
        right: 0;
        text-align: center;
        top: 2em;
      }
      label {
        white-space: nowrap;
        input {
          display: block;
          margin: 0 auto 1em;
          min-width: 100px;
          text-align: center;
        }
      }
      button {
        display: inline-block;
      }
      .defuse-settings-custom {
        columns: 2;
        max-width: 280px;
        margin: 0 auto;
        @media screen and (min-width: 640px) {
          columns: 4;
          max-width: 500px;
          label {
            text-align: center;
          }
          input {
            min-width: 115px;
          }
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
        z-index: 2000;
      }
    }
  }

  .playfield.game-over.defuse-settings,
  .playfield.game-over.defuse-instructions {
    .playfield-overlay.game-over {
      display: none;
    }
  }

  .playfield.defuse-instructions {
    z-index: 1000;
    .playfield-overlay.defuse-instructions {
      color: #fff;
      text-align: center;
      transform: scale(1);
      transition-duration: .5s;
      z-index: 9999;
      .inner {
        bottom: 0;
        left: 1em;
        opacity: .95;
        overflow: scroll;
        position: absolute;
        padding: 0 1em 1em;
        text-align: left;
        top: 2em;
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
        z-index: 2000;
      }
      h3 {
        margin: 0;
      }
    }
  }

  .language-switch {
    left: 1em;
    line-height: 1.5em;
    position: absolute;
    top: .4em;
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
