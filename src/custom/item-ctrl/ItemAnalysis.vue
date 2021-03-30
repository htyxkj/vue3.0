<template>
  <div class="analysis">
    <div class="header">
      <h1>农发数据可视化分析</h1>
      <div class="showTime">{{ showtime }}</div>
    </div>
    <!-- 页面主体部分 -->
    <div class="mainbox">
      <div class="column">
        <div class="panel leftTop1">
          <div class="filter">
            <a data-id="1" data-type="leftTopTabs1" href="javascript:;" :class="leftTopTabs1==1?'active':''" @click="aClick">营业收入</a>
            <a data-id="2" data-type="leftTopTabs1" href="javascript:;" :class="leftTopTabs1==2?'active':''" @click="aClick">利润</a>
          </div>
          <div class="chart" ref="leftTopTabsC"></div>
          <div class="panel-footer"></div>
        </div>
        <div class="panel leftCenter1">
          <div class="filter">
            <a data-id="1" data-type="leftCenterabs1" href="javascript:;" :class="leftCenterabs1==1?'active':''" @click="aClick">第一季度</a>
            <a data-id="2" data-type="leftCenterabs1" href="javascript:;" :class="leftCenterabs1==2?'active':''" @click="aClick">第二季度</a>
            <a data-id="3" data-type="leftCenterabs1" href="javascript:;" :class="leftCenterabs1==3?'active':''" @click="aClick">第三季度</a>
            <a data-id="4" data-type="leftCenterabs1" href="javascript:;" :class="leftCenterabs1==4?'active':''" @click="aClick">第四季度</a>
          </div>
          <template v-if="leftCenterabs1 == 1">
            <div>
              <CardInfo :item="item"></CardInfo>
            </div>
          </template>
          <template v-if="leftCenterabs1 == 2">
            <div class="chart">第二季度</div>
          </template>
          <template v-if="leftCenterabs1 == 3">
            <div class="chart">第三季度</div>
          </template>
          <template v-if="leftCenterabs1 == 4">
            <div class="chart">第四季度</div>
          </template>
          <div class="panel-footer"></div>
        </div>
      </div>
      <div class="column columnCenter">
        <!-- <div class="panel leftTop2">
          <div class='wrapper'>
            <div class="inner">
              <div class="chart" ref="centerTC1"></div>
              <div class="btm"></div>
            </div>
            <div class="inner">
              <div class="chart" ref="centerTC2"></div>
              <div class="btm"></div>
            </div>
          </div>
          <div class="panel-footer"></div>
        </div> -->
        <!-- 地图模块 -->
        <div class="map">
          <div class="chart" ref="itemAnaMap"></div>
          <div class="map1"></div>
          <div class="map2"></div>
          <div class="map3"></div>
        </div>
      </div>
      <div class="column">
        <div class="panel leftTop1">
          <div class="filter">
            <a data-id="1" data-type="rightTopTabs1" href="javascript:;" :class="rightTopTabs1==1?'active':''" @click="aClick">营业收入</a>
            <a data-id="2" data-type="rightTopTabs1" href="javascript:;" :class="rightTopTabs1==2?'active':''" @click="aClick">利润</a>
          </div>
          <div class="chart" ref="rightTopTabsC"></div>
          <div class="panel-footer"></div>
        </div>
        <div class="panel leftCenter1">
          <div class="filter">
            <a data-id="1" data-type="rightCenterabs1" href="javascript:;" :class="rightCenterabs1==1?'active':''" @click="aClick">第一季度</a>
            <a data-id="2" data-type="rightCenterabs1" href="javascript:;" :class="rightCenterabs1==2?'active':''" @click="aClick">第二季度</a>
            <a data-id="3" data-type="rightCenterabs1" href="javascript:;" :class="rightCenterabs1==3?'active':''" @click="aClick">第三季度</a>
            <a data-id="4" data-type="rightCenterabs1" href="javascript:;" :class="rightCenterabs1==4?'active':''" @click="aClick">第四季度</a>
          </div>
          <template v-if="rightCenterabs1 == 1"><div class="chart">第一季度</div></template>
          <template v-if="rightCenterabs1 == 2"><div class="chart">第二季度</div></template>
          <template v-if="rightCenterabs1 == 3"><div class="chart">第三季度</div></template>
          <template v-if="rightCenterabs1 == 4"><div class="chart">第四季度</div></template>
          <div class="panel-footer"></div>
        </div>
      </div>
    </div>
    <div class="mainbox bottombox">
      <div class="column">
        <div class="panel pie">
          <h2>年度砼型号销售占比</h2>
          <div class="chart"></div>
          <div class="panel-footer"></div>
        </div>
      </div>
      <div class="column">
        <div class="panel bar2">
          <h2>年度应付账款</h2>
          <div class="chart "></div>
          <div class="panel-footer"></div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import echarts from "echarts";
import "echarts/map/js/china";
import 'echarts-liquidfill'
import { Component, Vue } from "vue-property-decorator";
import { Mutation } from "vuex-class";
import QueryEntity from "@/classes/search/QueryEntity";
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi;
import CardInfo from "@/custom/item-ctrl/components/CardInfo.vue";
import {Map} from "@/custom/item-ctrl/components/china"
@Component({
  components: {CardInfo},
})
export default class ItemAnalysis extends Vue {
  @Mutation("snkey", { namespace: "login" }) setSnkey: any;
  @Mutation("user", { namespace: "login" }) setUserInfo: any;
  @Mutation("menulist", { namespace: "login" }) setMenusInfo: any;
  page: any = { pageSize: 2000, currPage: 1, total: 0 };
  showtime: String = "";
  t: any = "";
  currActive:any =1;

  leftTopTabs1:any = 1;
  leftCenterabs1:any = 1;
  rightTopTabs1:any =1;
  rightCenterabs1:any =1;

  /************ 左上第一个图 **********/
  leftT1C1Con:any=null;
  leftT1C2Con:any=null;
  leftTopTabsC:any = null;
  leftTopTabsCCurrInd:any = null;
  leftTopTabsCInterval:any = null;
  /************ 右上第一个图 **********/
  rightT1C1Con:any=null;
  rightT1C2Con:any=null;
  rightTopTabsC:any = null;
  rightTopTabsCCurrInd:any = null;
  rightTopTabsCInterval:any = null;
  /************ 中上第一个图 **********/
  centerTC1Con:any=null;
  centerTC2Con:any=null;
  centerTC1:any = null;
  centerTC2:any = null;
  /************ 地图 *************/
  map:any = null;
  mapCon:any = null;

  item:any = null;

  async mounted() {
    this.time();
    this.initConfig()
    //初始化 左上1
    this.initLeftTop1();
    //初始化 右上1
    this.initRightTop1();
    //初始化 中上1
    this.initCenterTop1();
    //初始化地图
    this.initMap();

    this.initLeftCenter1();

    this.item =  {
                    "ob_month": 1,
                    "yjfcy": 13240.6000,
                    "sjfcy": 14495.2500,
                    "sjrmb": 49996.4300,
                    "name": "中国融通农业发展（哈尔滨）有限责任公司",
                    "rmbbl": 0.226,
                    "fcybl": 1.095,
                    "scm": "051",
                    "yjrmb": 73652.5600,
                    "pm1":1,
                    "pm2":5
                }


    let _this = this;
    window.addEventListener("resize", function() {
      if(_this.centerTC1)
      _this.centerTC1.resize();
      if(_this.centerTC2)
      _this.centerTC2.resize();
      if(_this.leftTopTabsC)
      _this.leftTopTabsC.resize();
      if(_this.rightTopTabsC)
      _this.rightTopTabsC.resize();
    });
  }
  /**
   * 左上第一个图
   */
  async initLeftTop1(){
    let qe: QueryEntity = new QueryEntity("", "");
    qe.page.currPage = 1;
    qe.page.pageSize = 500;
    let cc = await tools.getBipInsAidInfo("BOARD_L1", 210, qe);
    if(cc.data.id ==0){
      let values = cc.data.data.data.values;
      for(var i=0;i<values.length;i++){
        let vl = values[i];
        let c1 = {name:vl.name,value:vl.rmb}
        let c2 = {name:vl.name,value:vl.fcy}
        this.leftT1C1Con.series[0].data.push(c1)
        this.leftT1C2Con.series[0].data.push(c2)
      }
    }
    let refc1 = this.$refs.leftTopTabsC;
    if(refc1){
      this.leftTopTabsC = echarts.init(this.$refs.leftTopTabsC as HTMLCanvasElement); 
      this.leftTopTabsC.setOption(this.leftT1C1Con); 
    }
    this.leftTopTabsCInterval = setInterval(() => {        
      var dataLen = this.leftT1C1Con.series[0].data.length        // 取消之前高亮的图形        
      this.leftTopTabsC.dispatchAction({          
        type: 'downplay',          
        seriesIndex: 0,          
        dataIndex: this.leftTopTabsCCurrInd
      })        
      this.leftTopTabsCCurrInd = (this.leftTopTabsCCurrInd + 1) % dataLen        // 高亮当前图形        
      this.leftTopTabsC.dispatchAction({          
        type: 'highlight',          
        seriesIndex: 0,          
        dataIndex: this.leftTopTabsCCurrInd
      })        // 显示 tooltip        
      this.leftTopTabsC.dispatchAction({          
        type: 'showTip',          
        seriesIndex: 0,          
        dataIndex: this.leftTopTabsCCurrInd
        })      
      }, 5000)
  }
  /**
   * 右上第一个图
   */
  async initRightTop1(){
    let qe: QueryEntity = new QueryEntity("", "");
    qe.page.currPage = 1;
    qe.page.pageSize = 500;
    let cc = await tools.getBipInsAidInfo("BOARD_R1", 210, qe);
    if(cc.data.id ==0){
      let values = cc.data.data.data.values;
      for(var i=0;i<values.length;i++){
        let vl = values[i];
        let c1 = {name:vl.name,value:vl.rmb}
        let c2 = {name:vl.name,value:vl.fcy}
        this.rightT1C1Con.series[0].data.push(c1)
        this.rightT1C2Con.series[0].data.push(c2)
      }
    }
    let refc1 = this.$refs.rightTopTabsC;
    if(refc1){
      this.rightTopTabsC = echarts.init(this.$refs.rightTopTabsC as HTMLCanvasElement); 
      this.rightTopTabsC.setOption(this.rightT1C1Con); 
    }
    this.rightTopTabsCInterval = setInterval(() => {        
      var dataLen = this.rightT1C1Con.series[0].data.length        // 取消之前高亮的图形        
      this.rightTopTabsC.dispatchAction({          
        type: 'downplay',          
        seriesIndex: 0,          
        dataIndex: this.rightTopTabsCCurrInd
      })        
      this.rightTopTabsCCurrInd = (this.rightTopTabsCCurrInd + 1) % dataLen        // 高亮当前图形        
      this.rightTopTabsC.dispatchAction({          
        type: 'highlight',          
        seriesIndex: 0,          
        dataIndex: this.rightTopTabsCCurrInd
      })        // 显示 tooltip        
      this.rightTopTabsC.dispatchAction({          
        type: 'showTip',          
        seriesIndex: 0,          
        dataIndex: this.rightTopTabsCCurrInd
        })      
      }, 5000)
  }
  /**
   * 中上第一个图 
   */
  async initCenterTop1(){
    let qe: QueryEntity = new QueryEntity("", "");
    qe.page.currPage = 1;
    qe.page.pageSize = 500;
    let cc = await tools.getBipInsAidInfo("BOARD_M1", 210, qe);
    console.log(cc)
    if(cc.data.id ==0){
      let values = cc.data.data.data.values[0];
      // 基于准备好的dom，初始化echarts实例
      this.centerTC1 = echarts.init(this.$refs.centerTC1 as HTMLCanvasElement) 
      // 绘制图表
      this.centerTC1Con.series[0].data.push(parseFloat(values.rmbbl)/100)
      this.centerTC1Con.series[0].name="营业收入"
      this.centerTC1Con.title.text="营业收入"
      this.centerTC1.setOption(this.centerTC1Con);

      // 基于准备好的dom，初始化echarts实例
      this.centerTC2 = echarts.init(this.$refs.centerTC2 as HTMLCanvasElement) 
      // 绘制图表
      this.centerTC2Con.series[0].data.push(parseFloat(values.fcybl)/100)
      this.centerTC2Con.series[0].name="利润"
      this.centerTC2Con.title.text="利润"
      this.centerTC2.setOption(this.centerTC2Con);
    }
  }
  /**
   * 地图
   */
  async initMap(){
    this.map = echarts.init(this.$refs.itemAnaMap as HTMLCanvasElement) 
    echarts.registerMap("中华人民共和国", Map);
    var option = {
      title: {
        text: "",
        subtext: "",
        left: "center",
        textStyle: {
          color: "#7bbfea",
        },
      },
      geo: {
        map: "china",
        label: {
          emphasis: {
            show: true,
            color: "#fff"
          }
        },
        roam: false,
        zoom: 1,
        itemStyle: {
          normal: {
            areaColor: "rgba(43, 196, 243, 0.42)",
            borderColor: "rgba(43, 196, 243, 1)",
            borderWidth: 1
          },
          emphasis: {
            areaColor: "#2B91B7"
          }
        }
      }
    };
    // 绘制图表
    this.map.setOption( option);
  }

  async initLeftCenter1(){
    let qe: QueryEntity = new QueryEntity("", "");
    qe.page.currPage = 1;
    qe.page.pageSize = 500;
    let cc = await tools.getBipInsAidInfo("BOARD_L2", 210, qe);
    if(cc.data.id ==0){
      let values = cc.data.data.data.values;
      for(var i=0;i<values.length;i++){
      }
    }
  }
  /**
   * 页签切换
   */
  aClick(e:any){
    let type = e.currentTarget.dataset.type;
    if(type == "leftTopTabs1"){
      this.leftTopTabs1 = e.currentTarget.dataset.id;
      if(this.leftTopTabs1 == 1){
        this.leftTopTabsC.setOption(this.leftT1C1Con); 
      }else{
        this.leftTopTabsC.setOption(this.leftT1C2Con); 
      }
    }else if (type =="leftCenterabs1"){
      this.leftCenterabs1 = e.currentTarget.dataset.id;
    }else if(type == "rightTopTabs1"){
      this.rightTopTabs1 = e.currentTarget.dataset.id;
      if(this.rightTopTabs1 == 1){
        this.rightTopTabsC.setOption(this.rightT1C1Con); 
      }else{
        this.rightTopTabsC.setOption(this.rightT1C2Con); 
      }
    }else if(type == "rightCenterabs1"){
      this.rightCenterabs1 = e.currentTarget.dataset.id;
    }
  }
  initConfig(){
    let leftT1Con = {
      tooltip: {
          trigger: 'item'
      },
      series: [
          {
              name: '',
              type: 'pie',
              radius: ['30%', '70%'],
              center: ['50%', '50%'],
              itemStyle: {
                  borderRadius: 8
              },
              data: [
                
              ]
          }
      ]
    };
    this.leftT1C1Con = JSON.parse(JSON.stringify(leftT1Con))
    this.leftT1C2Con = JSON.parse(JSON.stringify(leftT1Con))
    this.rightT1C1Con = JSON.parse(JSON.stringify(leftT1Con))
    this.rightT1C2Con = JSON.parse(JSON.stringify(leftT1Con))

    let centerTC1Con ={
      // 图表主标题
      title: {
        text: '', // 主标题文本，支持使用 \n 换行
        bottom: -5, // 定位 值: 'top', 'middle', 'bottom' 也可以是具体的值或者百分比
        left: 'center', // 值: 'left', 'center', 'right' 同上
        textStyle: { // 文本样式
          fontSize: 20,
          fontWeight: 500,
          color: '#fff'
        }
      },
      // 提示框组件
      tooltip: {
        trigger: 'item', // 触发类型, 数据项图形触发，主要在散点图，饼图等无类目轴的图表中使用。
        textStyle: {
          color: '#fff' // 文字颜色
        },
        // 提示框浮层内容格式器，支持字符串模板和回调函数两种形式
        // 水球图: {a}（系列名称），{b}（无），{c}（数值）
        // 使用函数模板   传入的数据值 -> value: number|Array,
        formatter: function (value:any) {
          return value.seriesName + ': ' + value.data * 100 + '%'
        }
      },
      series: [{
        type: 'liquidFill',
        name: '', // 系列名称，用于tooltip的显示，legend 的图例筛选
        radius: '60%', // 水球图的半径
        center: ['50%', '50%'], // 水球图的中心（圆心）坐标，数组的第一项是横坐标，第二项是纵坐标
        // 水填充图的形状 circle 默认圆形  rect 圆角矩形  triangle 三角形  
        // diamond 菱形  pin 水滴状 arrow 箭头状  还可以是svg的path
        shape: 'circle',
        phase: 0, // 波的相位弧度 不设置  默认自动
        direction: 'right', // 波浪移动的速度  两个参数  left 从右往左 right 从左往右
        outline: {
          show: true,
          borderDistance: 0, // 边框线与图表的距离 数字
          itemStyle: {
            opacity: 1, // 边框的透明度   默认为 1
            borderWidth: 1, // 边框的宽度
            shadowBlur: 1, // 边框的阴影范围 一旦设置了内外都有阴影
            shadowColor: '#fff', // 边框的阴影颜色,
            borderColor: '#41dcd8' // 边框颜色
          }
        },
        // 图形样式
        itemStyle: {
          color: '#4077eb', // 水球显示的背景颜色
          opacity: 0.5, // 波浪的透明度
          shadowBlur: 10 // 波浪的阴影范围
        },
        backgroundStyle: {
          color: '#407bf3', // 水球未到的背景颜色
          opacity: 0.5
        },
        // 图形的高亮样式
        emphasis: {
          itemStyle: {
            opacity: 0.8 // 鼠标经过波浪颜色的透明度
          }
        },
        // 图形上的文本标签
        label: {
          fontSize: 30,
          fontWeight: 200,
          color: '#fff'
        },
        data: [] // 系列中的数据内容数组
      }]
    }
    this.centerTC1Con =  JSON.parse(JSON.stringify(centerTC1Con))
    this.centerTC2Con =  JSON.parse(JSON.stringify(centerTC1Con))
  }
  // 定时器执行获取当前时间
  time() {
    clearTimeout(this.t); //清除定时器
    let dt = new Date();
    let y = dt.getFullYear();
    let mt = dt.getMonth() + 1;
    let day = dt.getDate();
    let h:any = dt.getHours(); //获取时
    let m:any = dt.getMinutes(); //获取分
    let s:any = dt.getSeconds(); //获取秒
    if(m<10){
      m = "0"+m;
    }
    if(s<10){
      s = "0"+s;
    }
    if(h<10){
      h = "0"+h;
    }
    this.showtime =
      y + "年" + mt + "月" + day + "-" + h + "时" + m + "分" + s + "秒";
    this.t = setTimeout(this.time, 1000); //设定定时器，循环运行
  }
}
</script>
<style lang="scss" scoped>
.analysis {
  background: url(../../assets/bip-erp/image/bg.jpg) top center;
  overflow-y: auto;
  height: 100%;
  position: absolute;
  width: 100%;
  background-attachment: local;
}
.analysis::-webkit-scrollbar {
  width: 4px;
}
.analysis::-webkit-scrollbar-thumb {
  background-color: #d9d9d9;
}
.header {
  position: relative;
  height: 1.25rem;
  background: url(../../assets/bip-erp/image/head_bg.png) no-repeat;
  background-size: 100% 100%;
  h1 {
    color: #fff;
    text-align: center;
    font-size: 0.475rem;
    line-height: 1rem;
  }
  .showTime {
    position: absolute;
    right: 0.375rem;
    top: 0;
    line-height: 0.9375rem;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.25rem;
  }
}
.mainbox {
  min-width: 1024px;
  max-width: 1920px;
  margin: 0 auto;
  padding: 0.125rem 0.125rem 0;
  display: flex;
  .column {
    flex: 3;
  }
  .columnCenter {
    flex: 5;
  }
  .panel {
    position: relative;
    height: 5rem;
    border: 1px solid rgba(25, 186, 139, 0.17);
    background: url(../../assets/bip-erp/image/line.png) rgba(255, 255, 255, 0.04);
    padding: 0 0.1875rem 0.5rem;
    margin-bottom: 0.1875rem;
    .panel-footer {
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
    }
  }
}
.bottombox{
  padding-top: 0px;
}
.leftTop1{
  height: 4.5rem !important;
}
.leftTop2{
  height: 3.2rem !important;
}
.leftCenter1{
  height: 10.125rem !important;
}
.mainbox .panel .chart {
  height: 100%;
}
.map {
  position: relative;
  height: 10.125rem;
}
.map .chart {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 5;
  height: 10.125rem;
  width: 100%;
}
.map .map1,
.map .map2,
.map .map3 {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 6.475rem;
  height: 6.475rem;
  background: url(../../assets/bip-erp/image/map.png) no-repeat;
  background-size: 100% 100%;
  opacity: 0.3;
}
.map .map2 {
  width: 8.0375rem;
  height: 8.0375rem;
  background-image: url(../../assets/bip-erp/image/lbx.png);
  opacity: 0.6;
  z-index: 2;
  animation: rotate2 15s linear infinite;
}
.map .map3 {
  width: 7.075rem;
  height: 7.075rem;
  background-image: url(../../assets/bip-erp/image/jt.png);
  animation: rotate1 10s linear infinite;
}

a{
    text-decoration: none;
}
.filter {
  display: flex;
  font-size: 32rpx;
  padding: 16px 0px 0px 0px;
}
.filter a {
  display: block;
  line-height: 1;
  padding: 0 8px;
  color: #00f2f1;
  border-right: 0.033rem solid #00f2f1;
}
.filter a:first-child {
  padding-left: 0;
}
.filter a:last-child {
  border-right: none;
}
.filter a.active {
  color: #fff;
}
@keyframes rotate1 {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(-360deg);
  }
}
@keyframes rotate2 {
  from {
    transform: translate(-50%, -50%) rotate(-360deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(0deg);
  }
}

.wrapper {
  width: 100%;
}
.wrapper .inner {
  position: relative;
  width: 50%;
  float: left;
}
.wrapper .inner .chart {
  width: 200px;
  height: 180px;
  background: url(../../assets/item-ctrl/fill-border.gif) no-repeat center bottom;
  background-size: 80% 80%;
  margin: 0 auto 0;
  background-position-y: 20px;
}
.wrapper .inner .btm {
  width: 220px;
  height: 20px;
  background: url(../../assets/item-ctrl/icon-bot.png) no-repeat;
  background-size: 100% 100%;
  margin: 0 auto;
}
</style>
