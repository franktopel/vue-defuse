// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vue2TouchEvents from 'vue2-touch-events'
import App from './App'

Vue.use(Vue2TouchEvents)
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#defuse',
  template: '<App/>',
  components: { App }
})
