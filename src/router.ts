import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const basePro = window.location.pathname;
const basePro1 = basePro.substring(0,basePro.lastIndexOf('/')); 
export default new Router({
  mode: 'history',
  base:basePro1,
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('./views/Home.vue'),//默认首页
      // component: () => import('./custom/air-super/RealTimeTrack.vue'),//飞防首页
    },
    {
      path: '/report',
      name: 'Report',
      component :()=> import('./views/Index.vue')
    },
    {
      path: '/layout',
      name: 'layout',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('./views/app/CommonLayOut.vue'),
      children: [
        {
          // 当 /layout/layoutDlg 匹配成功，
          // component 会被渲染在 layout 的 <router-view> 中
          path: 'layoutDlg',
          name: 'layoutDlg',
          component: () => import('./views/app/CommonLayOut.vue'),
        },{
          //Test
          path:'Test',
          name:'Test',
          component :()=> import('./custom/basicProject/Test1.vue')
        },{
          //208项目 质量问题信息数据编辑页面
          path:'QualityProblemDatabase',
          name:'QualityProblemDatabase',
          component :()=> import('./custom/bip-208/QualityProblemDatabase.vue')
        },{
          //208项目 严重及以上质量问题信息数据编辑页面
          path:'CriticalIssuesDatabase',
          name:'CriticalIssuesDatabase',
          component :()=> import('./custom/bip-208/CriticalIssuesDatabase.vue')
        }
      ]
    },
    {
      path: '/portal',
      name: 'portal',
      component: () => import('./views/login/Portal.vue'),//未登录状态门户页
    },
    {
      path: '/wlogin',
      name: 'wlogin',
      component: () => import('./views/login/Login.vue')
    },
    {
      path: '/registered',
      name: 'registered',
      component: () => import('./views/registered/Registered.vue')
    },
    {
      path:'/menuAuth',
      name:'/menuAuth',
      component: () => import( './custom/bip/menuAuth.vue')
    },
    {
      path:'/voucherApp',
      name:'/voucherApp',
      component: () => import( './custom/bip/voucherApp.vue')
    },
    {
        path: '/myTask',
        name: 'myTask',
        // meta: {
        //   keepAlive: false // 需要被缓存
        // },
        component: () => import('./views/app/taskMsg/bipTask.vue')
      },
      {
        path: '/myMsg',
        name: 'myMsg',
        component: () => import('./views/app/taskMsg/bipMsg.vue')
      },
      {
        path: '/wOauthToken',
        name: 'wOauthToken',
        component: () => import('./oauthToken/OauthToken.vue')
      },
      {
        path: '/hrMonthly',
        name: 'hrMonthly',
        component: () => import('./custom/bip-hr/AttendanceMonthly.vue')
      },
      {
        //飞防架区操作          
        path: '/OperatingArea',
        name: 'OperatingArea',
        component: () => import('./custom/air-super/OperatingArea.vue')
      },
      {
        //飞防路线规划
        path: '/TaskRoutePlanning',
        name: 'TaskRoutePlanning',
        component: () => import('./custom/air-super/TaskRoutePlanning.vue')
      },
      {
        //飞防轨迹回放
        path: '/PlayBack',
        name: 'PlayBack',
        component: () => import('./custom/air-super/PlayBack.vue')
      },
      {
        //飞防航带查询
        path: '/TrackShow',
        name: 'TrackShow',
        component: () => import('./custom/air-super/TrackShow.vue')
      },
      {
        //飞防 实时页面
        path: '/RealTimeTrack',
        name: 'RealTimeTrack',
        component: () => import( './custom/air-super/RealTimeTrack.vue')
      },
      {
        //架次查询
        path: '/SortiesQuery',
        name: 'SortiesQuery',
        component: () => import('./custom/air-super/SortiesQuery.vue')
      },
      {
        //飞防架次统计
        path: '/SortiesInvoke',
        name: 'SortiesInvoke',
        component: () => import('./custom/air-super/SortiesInvoke.vue')
      },
      {
        //飞防 机组GPS导入
        path: '/GPSRepair',
        name: 'GPSRepair',
        component: () => import('./custom/air-super/GPSRepair.vue')
      },
      {
        //飞防 机组GPS导入
        path: '/airSuperBI',
        name: 'airSuperBI',
        component: () => import('./custom/air-super/airSuperBI.vue')
      },
      {
        //阿米巴 数据建模
        path: '/DataModeling',
        name: 'DataModeling',
        component: () => import('./custom/bip-amb/report/DataModeling.vue')
      },
      {
        //阿米巴 职能式损益表
        path: '/ProfitLossFunction',
        name: 'ProfitLossFunction',
        component: () => import('./custom/bip-amb/report/ProfitLossFunction.vue')
      },
      {
        //阿米巴 损益趋势分析
        path: '/ProfitLossTrend',
        name: 'ProfitLossTrend',
        component: () => import('./custom/bip-amb/report/ProfitLossTrend.vue')
      },
      {
        //阿米巴 损益横比
        path: '/ProfitLossAspect',
        name: 'ProfitLossAspect',
        component: () => import('./custom/bip-amb/report/ProfitLossAspect.vue')
      },
      {
        //阿米巴 经营趋势分析
        path: '/ManageLossTrend',
        name: 'ManageLossTrend',
        component: () => import('./custom/bip-amb/report/ManageLossTrend.vue')
      },
      {
        //阿米巴 阿米巴比较分析
        path: '/AMBCompareTrend',
        name: 'AMBCompareTrend',
        component: () => import('./custom/bip-amb/report/AMBCompareTrend.vue')
      },
      {
        //阿米巴 经营成功排名
        path: '/ManageResultsRank',
        name: 'ManageResultsRank',
        component: () => import('./custom/bip-amb/report/ManageResultsRank.vue')
      },
      {
        //阿米巴 目标达成趋势
        path: '/GoalAchievementTrend',
        name: 'GoalAchievementTrend',
        component: () => import('./custom/bip-amb/report/GoalAchievementTrend.vue')
      },
      {
        //阿米巴 目标达成分析
        path: '/GoalAchievementAnalysis',
        name: 'GoalAchievementAnalysis',
        component: () => import('./custom/bip-amb/report/GoalAchievementAnalysis.vue')
      },
      {
        //阿米巴 指标/要素趋势分析(单巴)
        path: '/EssentialFactorTrend',
        name: 'EssentialFactorTrend',
        component: () => import('./custom/bip-amb/report/EssentialFactorTrend.vue')
      },
      {
        //阿米巴 指标/要素趋势分析(多巴)
        path: '/MultipleEssentialFactorTrend',
        name: 'MultipleEssentialFactorTrend',
        component: () => import('./custom/bip-amb/report/MultipleEssentialFactorTrend.vue')
      },
      {
        //阿米巴  月度经营目标趋势分析
        path: '/MonthGoalAchievementTrend',
        name: 'MonthGoalAchievementTrend',
        component: () => import('./custom/bip-amb/report/MonthGoalAchievementTrend.vue')
      },
      {
        //阿米巴  产值目标趋势分析
        path: '/OutputvalueTargetAnalysis',
        name: 'OutputvalueTargetAnalysis',
        component: () => import('./custom/bip-amb/report/OutputvalueTargetAnalysis.vue')
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
          //阿米巴 计算产量比例
          path: '/ProfitYieldAnalysis',
          name: 'ProfitYieldAnalysis',
          component :()=> import('./custom/bip-amb/report/ProfitYieldAnalysis.vue')
      },
      {
          //融通甘特图
          path: '/ItemKanban',
          name: 'ItemKanban',
          component :()=> import('./custom/item-ctrl/ItemKanban.vue')
      },
      {
          //融通数据分析 看板
          path: '/ItemAnalysis',
          name: 'ItemAnalysis',
          component :()=> import('./custom/item-ctrl/ItemAnalysis.vue')
      },
      {
          //融通 进度分析
          path: '/ItemSchedule',
          name: 'ItemSchedule',
          component :()=> import('./custom/item-ctrl/ItemSchedule.vue')
      },
      {
          //巡检机器人实时视频页面
          path: '/AgvRTVideo',
          name: 'AgvRTVideo',
          component :()=> import('./custom/agv/AgvRTVideo.vue')
      },
      {
          //CRM 工作台
          path:'/workBench',
          name: 'workBench',
          component :()=> import('./custom/bip-crm/workBench.vue')
      },
      //510 项目
      {
          //年统计
          path:'/YearStatistics',
          name:'YearStatistics',
          component :()=> import('./custom/trainPro/YearStatistics.vue')
      },
      {
          //月统计
          path:'/MonthStatistics',
          name:'MonthStatistics',
          component :()=> import('./custom/trainPro/MonthStatistics.vue')
      },
      {
          //周统计
          path:'/WeekStatistics',
          name:'WeekStatistics',
          component :()=> import('./custom/trainPro/WeekStatistics.vue')
      },
      //猪管家
      {
        //肥猪 养殖管理
        path:'/FatPigStatistics1',
        name:'FatPigStatistics1',
        component :()=> import('./custom/breeding/pages/FatPigStatistics1.vue')
      },
  ]
})

const originalPush:any = Router.prototype.push
Router.prototype.push = function push(location:any) {
  return originalPush.call(this, location).catch((err:any) => err)
}