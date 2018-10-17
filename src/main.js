// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import Vue2TouchEvents from 'vue2-touch-events'
require('es6-promise/auto')

Vue.use(Vue2TouchEvents)
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#vue-defuse',
  components: { App },
  template: '<App/>',
})
