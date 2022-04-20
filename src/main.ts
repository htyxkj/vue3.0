import Vue from "vue";
import './plugins/axios'
import App from "./App.vue";
import router from "./router";
import "./plugins/element.js";
import "./plugins/vxetable.js";
import './assets/icon/iconfont.css'
import './assets/icon/iconfont.js'
import './assets/bip-erp/css/font.css'
import "./scss/element-variables.scss";
import './utils/Request'
import store from './store'
import EventBus from 'vue-bus-ts';
import BaseLayout from '@/components/layout/BaseLayout.vue';
import BipMenuItem from '@/components/menu/BipMenuItem.vue';
import BipSubMenu from '@/components/menu/BipSubMenu.vue';
import BipCommEditor from '@/components/editorn/BipCommEditor.vue'
import BipSearchDialog from '@/components/searchdialog/BipSearchDialog.vue'
import BipSearchCont from '@/components/editorn/BipSearchCont.vue'
import BipSearchCont2 from '@/components/editorn/BipSearchCont2.vue'
Vue.component('BaseLayout',BaseLayout);
Vue.component('BipMenuItem',BipMenuItem);
Vue.component('BipSubMenu',BipSubMenu);
Vue.component('BipCommEditor',BipCommEditor);
Vue.component('BipSearchDialog',BipSearchDialog);
Vue.component('BipSearchCont',BipSearchCont);
Vue.component('BipSearchCont2',BipSearchCont2);
Vue.use(EventBus);

var bus = new EventBus.Bus();

import 'viewerjs/dist/viewer.css'
import Viewer from 'v-viewer' // 预览图片组件
Vue.use(Viewer);
Viewer.setDefaults({
    Options: { "inline": true, "button": true, "navbar": true, "title": true, "toolbar": true, "tooltip": true, "movable": true, "zoomable": true, "rotatable": true, "scalable": true, "transition": true, "fullscreen": true, "keyboard": true, "url": "data-source" }
});
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

import {ElLoadingComponent} from 'element-ui/types/loading'
import {LoadingServiceOptions} from 'element-ui/types/loading'
import {ElMessageBox} from 'element-ui/types/message-box'
import {ElMessageBoxShortcutMethod} from 'element-ui/types/message-box'
import {ElNotification} from 'element-ui/types/notification'
import {ElMessage} from 'element-ui/types/message'
declare module "vue/types/vue" {
  interface Vue {
    $loading: (options: LoadingServiceOptions) => ElLoadingComponent,
    $msgbox: ElMessageBox,
    $alert: ElMessageBoxShortcutMethod,
    $confirm: ElMessageBoxShortcutMethod,
    $prompt: ElMessageBoxShortcutMethod,
    $notify: ElNotification,
    $message: ElMessage
  }
}
import '@antv/x6-vue-shape'

