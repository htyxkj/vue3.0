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
      component: Home,//默认首页
    //   component: () => import(/* webpackChunkName: "about" */ './custom/air-super/RealTimeTrack.vue'),//飞防首页
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
      },
      {
        //阿米巴 职能式损益表
        path: '/ProfitLossFunction',
        name: 'ProfitLossFunction',
        component: () => import(/* webpackChunkName: "about" */ './custom/bip-amb/report/ProfitLossFunction.vue')
      },
      {
        //阿米巴 损益趋势分析
        path: '/ProfitLossTrend',
        name: 'ProfitLossTrend',
        component: () => import(/* webpackChunkName: "about" */ './custom/bip-amb/report/ProfitLossTrend.vue')
      },
      {
        //阿米巴 损益横比
        path: '/ProfitLossAspect',
        name: 'ProfitLossAspect',
        component: () => import(/* webpackChunkName: "about" */ './custom/bip-amb/report/ProfitLossAspect.vue')
      },
      {
        //阿米巴 经营趋势分析
        path: '/ManageLossTrend',
        name: 'ManageLossTrend',
        component: () => import(/* webpackChunkName: "about" */ './custom/bip-amb/report/ManageLossTrend.vue')
      },
      {
        //阿米巴 阿米巴比较分析
        path: '/AMBCompareTrend',
        name: 'AMBCompareTrend',
        component: () => import(/* webpackChunkName: "about" */ './custom/bip-amb/report/AMBCompareTrend.vue')
      },
      {
        //阿米巴 经营成功排名
        path: '/ManageResultsRank',
        name: 'ManageResultsRank',
        component: () => import(/* webpackChunkName: "about" */ './custom/bip-amb/report/ManageResultsRank.vue')
      },
      {
        //阿米巴 目标达成趋势
        path: '/GoalAchievementTrend',
        name: 'GoalAchievementTrend',
        component: () => import(/* webpackChunkName: "about" */ './custom/bip-amb/report/GoalAchievementTrend.vue')
      },
      {
        //阿米巴 目标达成分析
        path: '/GoalAchievementAnalysis',
        name: 'GoalAchievementAnalysis',
        component: () => import(/* webpackChunkName: "about" */ './custom/bip-amb/report/GoalAchievementAnalysis.vue')
      },
      {
          //阿米巴会计期间
          path: '/AccountingPeriod',
          name: 'AccountingPeriod',
          component :()=> import('./custom/bip-amb/document/AccountingPeriod.vue')
      },
      {
          //阿米巴核算要素
          path: '/AccountingElement',
          name: 'AccountingElement',
          component :()=> import('./custom/bip-amb/document/AccountingElement.vue')
      },
      {
          //阿米巴 经营模型
          path: '/BusinessModel',
          name: 'BusinessModel',
          component :()=> import('./custom/bip-amb/document/BusinessModel.vue')
      },
      {
          //阿米巴 阿米巴单元
          path: '/AMBUnit',
          name: 'AMBUnit',
          component :()=> import('./custom/bip-amb/document/AMBUnit.vue')
      }
      
      
  ]
})
