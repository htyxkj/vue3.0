import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'

Vue.use(Router)

const basePro = window.location.pathname;
const basePro1 = basePro.substring(0,basePro.lastIndexOf('/')); 
export default new Router({
  mode: 'history',
  base:basePro1,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: {
        keepAlive: true // 需要被缓存
      }
    },
    {
      path: '/login',
      name: 'login',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ './views/login/Login.vue')
    },
    {
      path: '/WxApplets',
      name: 'WxApplets',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ './views/login/WxApplets.vue')
    }, 
    {
      path: '/layout',
      name: 'layout',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ './views/app/CommonLayOut.vue')
    },
    {
        path: '/myTask',
        name: 'myTask',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ './views/app/taskMsg/bipTask.vue')
      },
      {
        path: '/myMsg',
        name: 'myMsg',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ './views/app/taskMsg/bipMsg.vue')
      }
  ]
})
