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
      // component: () => import(/* webpackChunkName: "about" */ './custom/air-super/RealTimeTrack.vue'),//飞防首页
      meta: {
        keepAlive: true // 需要被缓存
      }
    },{
      path: '/portal',
      name: 'portal',
      component: () => import(/* webpackChunkName: "about" */ './views/login/Portal.vue'),//未登录状态门户页
    },
    {
      path: '/wlogin',
      name: 'wlogin',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ './views/login/Login.vue')
    },
    {
      path: '/registered',
      name: 'registered',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ './views/registered/Registered.vue')
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
        //飞防架区操作          
        path: '/OperatingArea',
        name: 'OperatingArea',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ './custom/air-super/OperatingArea.vue')
      },
      {
        //飞防路线规划
        path: '/TaskRoutePlanning',
        name: 'TaskRoutePlanning',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ './custom/air-super/TaskRoutePlanning.vue')
      },
      {
        //飞防轨迹回放
        path: '/PlayBack',
        name: 'PlayBack',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ './custom/air-super/PlayBack.vue')
      },
      {
        //飞防航带查询
        path: '/TrackShow',
        name: 'TrackShow',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ './custom/air-super/TrackShow.vue')
      },
      {
        //飞防 实时页面
        path: '/RealTimeTrack',
        name: 'RealTimeTrack',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ './custom/air-super/RealTimeTrack.vue')
      },
      {
        //架次查询
        path: '/SortiesQuery',
        name: 'SortiesQuery',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ './custom/air-super/SortiesQuery.vue')
      },
      {
        //飞防架次统计
        path: '/SortiesInvoke',
        name: 'SortiesInvoke',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ './custom/air-super/SortiesInvoke.vue')
      },
      {
        //飞防 机组GPS导入
        path: '/GPSRepair',
        name: 'GPSRepair',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ './custom/air-super/GPSRepair.vue')
      },
      {
        //阿米巴 数据建模
        path: '/DataModeling',
        name: 'DataModeling',
        component: () => import(/* webpackChunkName: "about" */ './custom/bip-amb/report/DataModeling.vue')
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
      },
      {
          //阿米巴 交易价格
          path: '/TradingPrice',
          name: 'TradingPrice',
          component :()=> import('./custom/bip-amb/document/TradingPrice.vue')
      },
      {
          //阿米巴 接口取数
          path: '/InterfaceGetData',
          name: 'InterfaceGetData',
          component :()=> import('./custom/bip-amb/report/InterfaceGetData.vue')
      },
      {
          //融通甘特图
          path: '/ItemKanban',
          name: 'ItemKanban',
          component :()=> import('./custom/item-ctrl/ItemKanban.vue')
      }
  ]
})

const originalPush:any = Router.prototype.push
Router.prototype.push = function push(location:any) {
  return originalPush.call(this, location).catch((err:any) => err)
}