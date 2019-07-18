import Vue from "vue";
import './plugins/axios'
import App from "./App.vue";
import router from "./router";
import "./plugins/element.js";
import "./plugins/vxetable.js";
// import "./plugins/eventBus.js";
import './assets/icon/iconfont.css'
import "./scss/element-variables.scss";
import './utils/Request'
import store from './store'
import 'vxe-table/lib/index.css'

import EventBus from 'vue-bus-ts';

Vue.use(EventBus);
var bus = new EventBus.Bus();


Vue.config.productionTip = false;
new Vue({
   bus,
  router,
  store,
  render: h => h(App)
}).$mount("#app");



import Component from 'vue-class-component';

Component.registerHooks([
    'beforeRouteEnter',
    'beforeRouteLeave',
    'beforeRouteUpdate',
]);

// import {ElMessageBox} from 'element-ui/types/message-box'
declare module "vue/types/vue" {
  interface Vue {
    $loading: any,
    $msgbox: any,
    $alert: any,
    $confirm: any,
    $prompt: any,
    $notify: any,
    $message: any
  }
}
