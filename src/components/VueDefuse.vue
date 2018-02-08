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
              @click="toggleInstructions">💡</button>
      <button type="button"
              class="defuse-personal-records"
              v-if="hasPersonalRecords"
              @click="togglePersonalRecords">⚜</button>
      <button type="button"
              class="defuse-server-records"
              v-if="storesRecordsOnServer && serverRecords"
              @click="toggleServerRecords">👑</button>
    </h2>
    <div class="game-state">
      <span class="bomb-mark-count"
            :data-bomb-mark-count="remainingBombsCount"></span>
      <span class="win-lose-state"
            @click="buildMap()"
            :title="message('gamestate.newGame')">{{ winLoseSymbol }}</span>
      <span class="timer">⌛ {{ timePassed | formatTimer }}</span>
      <ul class="stats">
        <li class="actions"><span class="label">{{ message('stats.actions') }}:</span> <span class="value"> {{ actions }}</span></li>
        <li class="apm"><span class="label">{{ message('stats.apm') }}:</span> <span class="value"> {{ apm }}</span></li>
      </ul>
    </div>
    <div class="playfield"
         :class="{
              'game-over': gamestate === 'lost' || gamestate === 'won',
              'defuse-settings': showSettings,
              'defuse-personal-records': showPersonalRecords,
              'defuse-server-records': showServerRecords,
              'defuse-instructions': showInstructions }">

      <!-- playfield creation -->
      <div class="row"
           v-for="row, index in map">
        <m-field
          v-for="field in row"
          :field="field"
          :key="`${field.x},${field.y}`"
          @click.native.prevent="open(field, true)"
          @click.right.native.prevent="toggleBombMarker(field, $event)"
          @longtap="longtap(field)"
        ></m-field>
      </div>

      <!-- overlays for gamestate, instructions and settings -->
      <div class="playfield-overlay game-over">
        <div class="inner">
          <h3>{{ message(`gamestate.${gamestate}`, [ timePassed ]) }}</h3>
          <p v-if="newLocalRecord" class="new-record">{{ newLocalRecord }}</p>
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
          <button type="button"
                  v-for="difficulty in difficulties"
                  @click="setParams(difficulty.X, difficulty.Y, difficulty.numberOfBombs, difficulty.name); toggleSettings()">
            {{ message(`settings.label.difficulty.level.${difficulty.name}`) | upperCase }}
            <br />
            {{ difficulty.X }} x {{ difficulty.Y }}, {{ difficulty.numberOfBombs }} 💣
          </button>
          <br />
          <br />
          <h3>{{ message('settings.label.headline') }}</h3>
          <div class="defuse-settings-custom">
            <label>{{ message('settings.label.playfieldWidth') }}
              <input type="number"
                     @input="selectedDifficulty = 'custom'"
                     min="1"
                     :max="100"
                     step="1"
                     v-model="setX"
                     :placeholder="message('settings.label.playfieldWidth')"/>
            </label>
            <label>{{ message('settings.label.playfieldHeight') }}
              <input type="number"
                     @input="selectedDifficulty = 'custom'"
                     min="1"
                     :max="100"
                     step="1"
                     v-model="setY"
                     :placeholder="message('settings.label.playfieldHeight')"/>
            </label>
            <label>{{ message('settings.label.bombCount') }}
              <input type="number"
                     @input="selectedDifficulty = 'custom'"
                     min="0"
                     :max="X * Y"
                     step="1"
                     v-model="setBombCount"
                     :placeholder="message('settings.label.bombCount')"/>
            </label>
            <label>{{ message('settings.label.fieldSize') }}
              <input type="number"
                     min="20"
                     max="60"
                     step="1"
                     v-model="setFieldWidth"
                     :placeholder="message('settings.label.fieldSize')"/>
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

      <div class="playfield-overlay defuse-personal-records" id="defuse-personal-records">
        <div class="language-switch">
          <button type="button" v-for="lang in languages" :class="{ 'active-language': language === lang }" @click="setLanguage(lang)">{{ lang }}</button>
        </div>
        <button class="close" @click="togglePersonalRecords">✖</button>
        <div class="inner">
          <h3>{{ message('records.local.records') }}</h3>
          <p v-for="difficulty in difficulties" v-if="localRecords[difficulty.name]">{{ message(`settings.label.difficulty.level.${difficulty.name}`) }}: {{ localRecords[difficulty.name] }}s</p>
        </div>
      </div>

      <div class="playfield-overlay defuse-server-records" id="defuse-server-records" v-if="serverRecords">
        <div class="language-switch">
          <button type="button" v-for="lang in languages" :class="{ 'active-language': language === lang }" @click="setLanguage(lang)">{{ lang }}</button>
        </div>
        <button class="close" @click="toggleServerRecords">✖</button>
        <div class="inner">
          <div class="defuse-scores">
            <h2>{{ message('records.server.headline') }}</h2>
            <small>
              {{ message('records.server.totalGamesPlayed', [serverRecords.totalGames]) }}
              {{ message('records.server.totalGamesWon', [serverRecords.wonGames]) }}
              {{ message('records.server.winPercentage', [((serverRecords.wonGames / serverRecords.totalGames) * 100).toFixed(2)]) }}</small>
            <div class="defuse-scores-lists">
              <section v-for="difficulty in difficultiesKeys">
                <h3>{{ message(`settings.label.difficulty.level.${difficulty}`) }}</h3>
                <ol>
                  <li v-for="record in serverRecords.records[difficulty]">
                    <b class="record-name">{{ record.name.substr(0, 10) }}</b>
                    <br />
                    <span class="record-time">⏱&nbsp;&nbsp;{{ record.seconds | formatTimer }}</span>
                    <br />
                    <small class="record-actions">({{ record.actions }} {{ message('stats.actions') }})</small>
                  </li>
                </ol>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MField from './MField.vue'
const qs = require('qs')
const messages = require('../i18n/translations.json')
const difficulties = require('../config/difficulties.json')
const difficultiesKeys = difficulties.map(difficulty => difficulty.name)
const localRecords = JSON.parse(localStorage.getItem('defuse-records')) || JSON.parse('{"easy":null,"medium":null,"hard":null,"insane":null}')
const Field = require('./MField.js')

// get default language from either localStorage or from the browser
var userLang = localStorage.getItem('defuse-language') || navigator.language || navigator.userLanguage

// make sure the language is supported, fall back to 'en' otherwise
if (Object.keys(messages).indexOf(userLang) === -1) {
  userLang = 'en'
}

export default {
  name: 'VueDefuse',
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
    },
    serverRecords: {
      type: Object,
      default: null
    },
    storesRecordsOnServer: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      map: null,
      bombsMarkedCount: 0,
      closedFieldCount: 0,
      winLoseSymbol: '',
      timePassed: 0,
      timeStarted: null,
      timer: null,
      gamestate: undefined,
      showSettings: false,
      showInstructions: false,
      showPersonalRecords: false,
      showServerRecords: false,
      setX: this.X * 1,
      setY: this.Y * 1,
      setBombCount: this.numberOfBombs * 1,
      setFieldWidth: this.fieldWidth * 1,
      language: userLang,
      actions: 0,
      selectedDifficulty: 'easy',
      difficulties,
      difficultiesKeys,
      messages,
      localRecords: null,
      newLocalRecord: null,
      playerName: null,
      recordsStoreUrl: {
        base: 'https://connexo.de/defuse/defuse-api',
        get: 'https://connexo.de/defuse/defuse-api/get.php',
        set: 'https://connexo.de/defuse/defuse-api/set.php'
      },
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
    if (this.storesRecordsOnServer) {
      this.$emit('getServerRecords')
    }
    this.localRecords = localRecords
    document.querySelector(':root').style.setProperty('--fieldwidth', `${this.setFieldWidth ? this.setFieldWidth : this.fieldWidth}px`)
  },
  computed: {
    remainingBombsCount () {
      return this.numberOfBombsValidated - this.bombsMarkedCount
    },

    numberOfBombsValidated () {
      return Math.min((this.getX * this.getY), this.getBombCount ? parseInt(this.getBombCount) : this.numberOfBombs)
    },

    fieldCount () {
      return this.setX * this.setY
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
    },

    apm () {
      if (this.actions && this.timePassed) {
        return Math.floor(this.actions / (this.timePassed / 60))
      } else {
        return 0
      }
    },

    hasPersonalRecords () {
      let result = false
      this.difficulties.forEach(difficulty => {
        if (this.localRecords[difficulty.name]) {
          result = true
        }
      })
      return result
    }
  },
  filters: {
    formatTimer (seconds) {
      let days, hrs, mins, secs, remainingSecs
      days = ('0' + Math.floor(seconds / (24 * 60 * 60))).substr(-2)
      remainingSecs = seconds - days * (24 * 60 * 60)
      hrs = ('0' + Math.floor(remainingSecs / (60 * 60))).substr(-2)
      remainingSecs = seconds - hrs * (60 * 60)
      mins = ('0' + Math.floor(remainingSecs / 60)).substr(-2)
      secs = ('0' + remainingSecs % 60).substr(-2)
      return (days !== '00' ? `${days}:${hrs}:${mins}:${secs}` : (hrs !== '00' ? `${hrs}:${mins}:${secs}` : (mins.charAt(0) !== '0' ? `${mins}:${secs}` : `${mins.charAt(1)}:${secs}`)))
      // use this if all you wanna see is seconds filled up with zeros
      // if (seconds.toString().length < 4) {
      //   return ('0000' + seconds).substr(-4)
      // } else {
      //   return seconds
      // }
    },
    upperCase (str) {
      return typeof str === 'string' ? str.toLocaleUpperCase() : ''
    }
  },
  methods: {
    clearMap () {
      this.actions = 0
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
      if (event && event.hasOwnProperty('sourceCapabilities') && event.sourceCapabilities.hasOwnProperty('firesTouchEvents')) {
        return
      }
      this.actions++
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
      this.gamestate = null
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

    open (field, manuallyTriggered) {
      if (manuallyTriggered) {
        this.actions++
      }
      this.startTimer()
      if (field.isMarked) {
        return
      }
      if (!field.isOpen) {
        this.closedFieldCount--
      }
      field.isOpen = true
      if (field.hasBomb) {
        // fix game design flaw of losing on first open field
        if (this.closedFieldCount === this.fieldCount - 1) {
          this.stopTimer()
          this.buildMap()
          this.startTimer()
          this.$nextTick(() => {
            document.querySelector(`.x${field.x}-y${field.y}`).dispatchEvent(new Event('click'))
          })
          return
        }
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
              if (this.getX * this.getY > 1000) {
                this.open(neighField, false)
              } else {
                window.setTimeout(() => { this.open(neighField, false) }, Math.floor(10000 / (this.getX * this.getY)))
              }
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
      this.updateLocalRecords()
      this.storeGameResults()
    },

    endGame () {
      this.winLoseSymbol = '😡'
      this.gamestate = 'lost'
      this.stopTimer()
      this.newLocalRecord = null
      this.storeGameResults()
    },

    startTimer () {
      if (!this.timer) {
        this.timeStarted = Date.now()
        this.timer = setInterval(() => {
          this.timePassed = Math.round((Date.now() - this.timeStarted) / 1000)
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
        this.showPersonalRecords = false
        this.showServerRecords = false
      }
      this.showSettings = !this.showSettings
    },

    toggleInstructions () {
      if (!this.showInstructions) {
        this.showSettings = false
        this.showPersonalRecords = false
        this.showServerRecords = false
      }
      this.showInstructions = !this.showInstructions
    },

    togglePersonalRecords () {
      if (!this.showPersonalRecords) {
        this.showSettings = false
        this.showInstructions = false
        this.showServerRecords = false
      }
      this.showPersonalRecords = !this.showPersonalRecords
    },

    toggleServerRecords () {
      if (!this.showServerRecords) {
        this.showSettings = false
        this.showInstructions = false
        this.showPersonalRecords = false
      }
      this.showServerRecords = !this.showServerRecords
    },

    message (key, replacers) {
      let message = messages[this.language]
      key.split('.').forEach(function (keypart) {
        message = message.hasOwnProperty(keypart) ? message[keypart] : message
      })
      if (Array.isArray(replacers) && replacers.length && typeof message === 'string') {
        replacers.forEach(function (replacement, index) {
          message = message.replace(`%${index + 1}`, replacement)
        })
      }
      return typeof message === 'string' || Array.isArray(message) ? message : `{${key}}`
    },

    setLanguage (lang) {
      if (this.languages.indexOf(lang) > -1) {
        localStorage.setItem('defuse-language', lang)
        this.language = lang
      }
    },

    setParams (x, y, m, d) {
      this.adjustFieldSize(x, y)
      this.setX = x
      this.setY = y
      this.setBombCount = m
      if (d) {
        this.selectedDifficulty = d
      } else {
        this.selectedDifficulty = 'custom'
      }
    },

    adjustFieldSize (x, y) {
      this.setFieldWidth = Math.min(Math.floor((window.innerWidth - 50) / x) - 2, Math.floor((window.innerHeight - 170) / y) - 2)
    },

    updateLocalRecords () {
      if (this.selectedDifficulty === 'custom' || this.showSettings) {
        return
      }
      if (!this.localRecords[this.selectedDifficulty] || this.localRecords[this.selectedDifficulty] > this.timePassed) {
        this.localRecords[this.selectedDifficulty] = this.timePassed
        localStorage.setItem('defuse-records', JSON.stringify(this.localRecords))
        this.newLocalRecord = this.message(
          'records.local.newRecord',
          [
            this.message(`settings.label.difficulty.level.${this.selectedDifficulty}`),
            this.timePassed
          ]
        )
      } else {
        this.newLocalRecord = null
      }
    },

    storeGameResults () {
      if (!this.storesRecordsOnServer || this.showSettings) {
        return
      }

      if (this.gamestate === 'won') {
        this.playerName = window.prompt(this.message('records.server.askname'), this.playerName || this.message('records.server.placeholder'))
        if (!this.playerName) {
          this.playerName = '__user__'
        }
      }

      let payload = {
        seconds: this.timePassed,
        difficulty: this.selectedDifficulty,
        actions: this.actions,
        gamestate: this.gamestate,
        name: this.playerName === '' ? null : this.playerName,
        x: this.X,
        y: this.Y,
        bombcount: this.numberOfBombs,
      }

      this.$emit('storeResultToServer', qs.stringify(payload))
    },
  },
  components: {
    MField
  },
}
</script>

<style lang="scss">
  .defuse {
    border: 2px solid #aaa;
    background-color: #999;
    display: inline-block;
    padding: 0 .3em .3em;
    position: relative;
  }

  .game-title {
    background-color: #666;
    color: #fff;
    font-size: 2em;
    margin: 0 -.15em;
    padding: 0 3.5em 0 2em;
    position: relative;
    text-align: center;
    .defuse-settings,
    .defuse-instructions,
    .defuse-personal-records,
    .defuse-server-records {
      background-color: transparent;
      border: 0;
      bottom: 0;
      font-size: .8em;
      outline: none;
      padding: 0;
      position: absolute;
      text-shadow: 0 0 15px #fff,
                  0 0 5px #fff,
                 1px 1px 1px #fff,
                 1px -1px 1px #fff,
                 -1px 1px 1px #fff,
                 -1px -1px 1px #fff;
      top: 0;
      transition: all .4s ease;
      &:hover {
        transform: scale(1.5);
      }
    }
    .defuse-settings {
      right: .5em;
    }
    .defuse-instructions {
      right: 2.5em;
    }
    .defuse-personal-records {
      left: .5em;
    }
    .defuse-server-records {
      left: 2.5em;
    }
  }

  .row {
    display: flex;
    &:last-child .field {
      margin-bottom: 0;
    }
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
    padding-left: .5em;
    text-align: left;
    &::before {
      content: "💣 "attr(data-bomb-mark-count)
    }
  }

  .win-lose-state {
    font-size: 3em;
  }

  .timer {
    font-size: 1.5em;
  }

  .stats {
    list-style-type: none;
    margin: 0;
    padding: 0 .5em;
    text-align: left;
    min-width: 90px;
    width: 5%;
    .actions,
    .apm {
      font-size: 0;
      font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
      .value,
      .label {
        font-size: 10px;
        display: inline-block;
      }
      .label {
        width: 80%;
      }
      .value {
        margin-right: 5%;
        text-align: right;
        width: 15%;
      }
    }
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
    background-color: #f0f0f0;
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
        opacity: .9;
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
        .new-record {
          font-weight: bold;
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
         overflow-y: auto;
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
  .playfield.defuse-personal-records {
    z-index: 1000;
    .playfield-overlay.defuse-personal-records {
      color: #fff;
      text-align: center;
      transform: scale(1);
      transition-duration: .5s;
      z-index: 9999;
      .inner {
        left: 50%;
        opacity: .95;
        position: absolute;
        padding: 0 1em 1em;
        text-align: center;
        top: 50%;
        transform: translate(-50%, -50%);
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

  .playfield.defuse-server-records {
    z-index: 1000;
    .playfield-overlay.defuse-server-records {
      color: #fff;
      text-align: center;
      transform: scale(1);
      transition-duration: .5s;
      z-index: 9999;
      .inner {
        left: 50%;
        max-width: 100%;
        opacity: .95;
        overflow-x: auto;
        position: absolute;
        padding: 0 1em 1em;
        text-align: center;
        top: 50%;
        transform: translate(-50%, -50%);
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
      &:last-of-type() {
        margin-right: 0;
      }
      &.active-language {
        font-weight: bold;
        transform: scale(1.3)
      }
    }
  }
  .defuse-scores {
    &-lists {
      display: flex;
      flex-direction: row;
    }
    h2 {
      width: 100%;
    }
    section {
      margin: 1em;
    }
    ol {
      text-align: left;
      > * {
        white-space: nowrap;
      }
    }
  }


</style>
