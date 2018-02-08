<template>
  <div>
    <vue-defuse
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
  import VueDefuse from './components/VueDefuse'

  export default {
    name: 'vue-defuse',
    data () {
      return {
        dimX: 10,
        dimY: 10,
        fieldWidth: 60,
        numberOfBombs: 10,
        serverRecords: null,
        storesRecordsOnServer: false,
        recordsStoreUrl: {
          base: 'https://connexo.de/defuse/defuse-api',
          get: 'https://connexo.de/defuse/defuse-api/get.php',
          set: 'https://connexo.de/defuse/defuse-api/set.php'
        },
      }
    },
    components: {
      VueDefuse,
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
      if (this.storesRecordsOnServer) {
        this.getServerRecords()
      }
    }
  }
</script>

<style lang="scss">
  body {
    background-color: #205060;
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
    .defuse {
      box-shadow: 0 0 10px #000;
    }
  }


  .fieldwidth {
    margin: 50px auto 0;
  }

  input, button {
    font-size: 16px;
    padding: .5em;
  }
</style>
