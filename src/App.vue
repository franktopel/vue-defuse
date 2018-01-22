<template>
  <div id="defuse">
    <small v-if="serverRecords">{{ serverRecords.totalGames }} games of Defuse played so far. {{ serverRecords.wonGames }} of those solved successfully, resolving to {{ (serverRecords.wonGames / serverRecords.totalGames * 100).toFixed(2) }}%.</small>
    <Defuse
      :X="dimX"
      :Y="dimY"
      :serverRecords="serverRecords"
      :numberOfBombs="Math.min((dimX * dimY), numberOfBombs)"
      :fieldWidth="fieldWidth"
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
            console.log(response.data)
          })
          .catch(error => {
            console.log(error)
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
