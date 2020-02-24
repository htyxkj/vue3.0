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
    //   component: () => import(/* webpackChunkName: "about" */ './custom/air-super/RealTimeTrack.vue'),   
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
        // meta: {
        //   keepAlive: false // 需要被缓存
        // },
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
      },
      {
        path: '/hrMonthly',
        name: 'hrMonthly',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ './custom/bip-hr/AttendanceMonthly.vue')
      },
      {
        path: '/OperatingArea',
        name: 'OperatingArea',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ './custom/air-super/OperatingArea.vue')
      },
      {
        path: '/TaskRoutePlanning',
        name: 'TaskRoutePlanning',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ './custom/air-super/TaskRoutePlanning.vue')
      },
      {
        path: '/PlayBack',
        name: 'PlayBack',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ './custom/air-super/PlayBack.vue')
      },
      {
        path: '/TrackShow',
        name: 'TrackShow',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ './custom/air-super/TrackShow.vue')
      },
      {
        path: '/RealTimeTrack',
        name: 'RealTimeTrack',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ './custom/air-super/RealTimeTrack.vue')
      },
      {
        path: '/SortiesQuery',
        name: 'SortiesQuery',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ './custom/air-super/SortiesQuery.vue')
      },
      {
        path: '/SortiesInvoke',
        name: 'SortiesInvoke',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ './custom/air-super/SortiesInvoke.vue')
      }
  ]
})
