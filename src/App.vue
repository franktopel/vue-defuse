<template>
  <div id="defuse">
    <div class="server-stats">
      <small v-if="serverRecords">Total games played: {{ serverRecords.totalGames }}. Total Games won: {{ serverRecords.wonGames }}. Win percentage: {{ (serverRecords.wonGames / serverRecords.totalGames * 100).toFixed(2) }}%.</small>
    </div>
    <Defuse
      :X="dimX"
      :Y="dimY"
      :serverRecords="serverRecords"
      :numberOfBombs="Math.min((dimX * dimY), numberOfBombs)"
      :fieldWidth="fieldWidth"
      :storesRecordsOnServer="storesRecordsOnServer"
      @getServerRecords="getServerRecords"
      @storeResultToServer="storeResultToServer"
    />
  </div>
</template>

<script>
  import axios from 'axios'
  import Defuse from './components/Defuse'

  export default {
    name: 'defuse',
    data () {
      return {
        dimX: 10,
        dimY: 10,
        fieldWidth: 60,
        numberOfBombs: 10,
        serverRecords: null,
        storesRecordsOnServer: true,
        recordsStoreUrl: {
          base: 'https://connexo.de/defuse/defuse-api',
          get: 'https://connexo.de/defuse/defuse-api/get.php',
          set: 'https://connexo.de/defuse/defuse-api/set.php'
        },
      }
    },
    components: {
      Defuse,
    },
    methods: {
      getServerRecords () {
        axios.get(this.recordsStoreUrl.get, {
          // headers: {'content-type': 'application/json'}
        })
          .then(response => {
            this.serverRecords = { ...response.data }
          })
          .catch(error => {
            console.error(error)
          })
      },
      storeResultToServer (payload) {
        axios.post(this.recordsStoreUrl.set, payload)
          .then(response => {
            // this.playerName = '__user__'
          })
          .catch(function (error) {
            console.error(error)
          })
      },
    },
    created () {
      // this.getServerRecords()
    }
  }
</script>

<style lang="scss">
  body {
    margin: 0;
    padding: 0;
  }
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
