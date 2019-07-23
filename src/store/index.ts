import Vue from 'vue'
import Vuex, { StoreOptions } from 'vuex'
import { RootState } from './modules/types'
import { login } from './modules/login'
import { insaid } from './modules/insaid'
Vue.use(Vuex)
const store: StoreOptions<RootState> = {
    state: {
      version: 'v1.0.0'
    },
    modules: {
      login,
      insaid
    }
  }
  export default new Vuex.Store<RootState>(store);