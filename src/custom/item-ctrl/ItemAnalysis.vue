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
          <el-carousel height="200px" indicator-position="none" :interval="7000">
            <el-carousel-item v-for="(item,index) in leftTableData[leftCenterabs1]" :key="index">
              <CardInfo :item="item"></CardInfo>
            </el-carousel-item>
          </el-carousel>
          <div class="panel-footer"></div>
        </div>
      </div>
      <div class="column columnCenter">
        <div class="leftTop2">
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
        </div>
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
          <el-carousel height="200px" indicator-position="none" :interval="7000">
            <el-carousel-item v-for="(item,index) in rightTableData[rightCenterabs1]" :key="index">
              <CardInfo :item="item"></CardInfo>
            </el-carousel-item>
          </el-carousel>
          <div class="panel-footer"></div>
        </div>
      </div>
    </div>
    <div class="mainbox bottombox">
      <div class="column">
        <div class="panel bottomChart">
          <h2>{{leftB1ConName}}</h2>
          <div class="chart" ref="leftB1Con"></div>
          <div class="panel-footer"></div>
        </div>
      </div>
      <div class="column">
        <div class="panel bottomChart">
          <h2>{{rightB1ConName}}</h2>
          <div class="chart"  ref="rightB1Con"></div>
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
  /************ 左侧中间列表 ************/
  leftTableData:any={
    1 : [],
    2 : [],
    3 : [],
    4 : [],
  }
  /************ 右侧中间列表 ************/
  rightTableData:any={
    1 : [],
    2 : [],
    3 : [],
    4 : [],
  }
  /************** 左下图表 *****************/
  leftB1Con:any=null;
  leftB1C1:any = null;
  leftB1ConName:any = "";
  /************** 右下图表 *****************/
  rightB1Con:any=null;
  rightB1C1:any = null;
  rightB1ConName:any = "";

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
    //左侧列表
    this.initLeftCenter1();
    //右侧列表
    this.initRightCenter1()
    //左侧下方面积图
    this.initleftBottom1();
    //右侧柱状图
    this.initRightBottom1();
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
      if(_this.map)
      _this.map.resize();
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
    // 绘制图表
    this.map.setOption(this.mapCon);
  }
  /**
   * 左侧列表
   */
  async initLeftCenter1(){
    let qe: QueryEntity = new QueryEntity("", "");
    qe.page.currPage = 1;
    qe.page.pageSize = 500;
    let cc = await tools.getBipInsAidInfo("BOARD_L2", 210, qe);
    this.leftTableData={ 
      1 : [],
      2 : [],
      3 : [],
      4 : [],
    }
    let f:any = [];
    let s:any = [];
    let t:any = [];
    let f4:any = [];
    if(cc.data.id ==0){
      let values = cc.data.data.data.values;
      for(var i=0;i<values.length;i++){
        let vl = values[i];
        if(vl.ob_month == 1){//第一季度
          f.push(vl)
        }else if(vl.ob_month == 2){//第一季度
          s.push(vl)
        }else if(vl.ob_month == 3){//第一季度
          t.push(vl)
        }else if(vl.ob_month == 4){//第一季度
          f4.push(vl)
        }
      }
    }
    f = this.sort(f,"fcybl","pm2","name","desc")
    f = this.sort(f,"rmbbl","pm1","name","desc")
    this.leftTableData["1"] = f;
    s = this.sort(s,"fcybl","pm2","name","desc")
    s = this.sort(s,"rmbbl","pm1","name","desc")
    this.leftTableData["2"] = s;
    t = this.sort(t,"fcybl","pm2","name","desc")
    t = this.sort(t,"rmbbl","pm1","name","desc")
    this.leftTableData["3"] = t;
    f4 = this.sort(f4,"fcybl","pm2","name","desc")
    f4 = this.sort(f4,"rmbbl","pm1","name","desc")
    this.leftTableData["4"] = f4;
  }
  /**
   * 右侧列表
   */
  async initRightCenter1(){
    let qe: QueryEntity = new QueryEntity("", "");
    qe.page.currPage = 1;
    qe.page.pageSize = 500;
    let cc = await tools.getBipInsAidInfo("BOARD_R2", 210, qe);
    this.rightTableData={ 
      1 : [],
      2 : [],
      3 : [],
      4 : [],
    }
    let f:any = [];
    let s:any = [];
    let t:any = [];
    let f4:any = [];
    if(cc.data.id ==0){
      let values = cc.data.data.data.values;
      for(var i=0;i<values.length;i++){
        let vl = values[i];
        if(vl.ob_month == 1){//第一季度
          f.push(vl)
        }else if(vl.ob_month == 2){//第一季度
          s.push(vl)
        }else if(vl.ob_month == 3){//第一季度
          t.push(vl)
        }else if(vl.ob_month == 4){//第一季度
          f4.push(vl)
        }
      }
    }
    f = this.sort(f,"fcybl","pm2","name","desc")
    f = this.sort(f,"rmbbl","pm1","name","desc")
    this.rightTableData["1"] = f;
    s = this.sort(s,"fcybl","pm2","name","desc")
    s = this.sort(s,"rmbbl","pm1","name","desc")
    this.rightTableData["2"] = s;
    t = this.sort(t,"fcybl","pm2","name","desc")
    t = this.sort(t,"rmbbl","pm1","name","desc")
    this.rightTableData["3"] = t;
    f4 = this.sort(f4,"fcybl","pm2","name","desc")
    f4 = this.sort(f4,"rmbbl","pm1","name","desc")
    this.rightTableData["4"] = f4;
  }
  /**
   * 左下面积图
   */
  async initleftBottom1(){
    let qe: QueryEntity = new QueryEntity("", "");
    qe.page.currPage = 1;
    qe.page.pageSize = 500;
    let ins:any = await tools.getBipInsAidInfo("BOARD_L3", 200, qe);
    if(ins.data.id >=0){
      ins = ins.data.data.data
      console.log(ins)
      this.leftB1ConName = ins.title;
      let labers = ins.labers;
      let showColsIndex = ins.showColsIndex;
      for(var i=1;i<labers.length;i++){
          let dd = { name: labers[i], type: 'line', stack: labers[i], areaStyle: {}, emphasis: { focus: 'series' },data: [] }
          this.leftB1Con.series.push(dd)
      }
      let cc = await tools.getBipInsAidInfo("BOARD_L3", 210, qe);
      if(cc.data.id ==0){
        let values = cc.data.data.data.values;
        for(var i=0;i<values.length;i++){
          let vl = values[i];
          this.leftB1Con.xAxis[0].data.push(vl.iym)
          for(var j=1;j<labers.length;j++){
            this.leftB1Con.series[j-1].data.push(vl[ins.cells.cels[showColsIndex[j]].id]);
          }
        }
      }
      // 基于准备好的dom，初始化echarts实例
      this.leftB1C1 = echarts.init(this.$refs.leftB1Con as HTMLCanvasElement) 
      // 绘制图表
      this.leftB1C1.setOption(this.leftB1Con);
    }
  }
  /**
   * 右下柱状图
   */
  async initRightBottom1(){
    let qe: QueryEntity = new QueryEntity("", "");
    qe.page.currPage = 1;
    qe.page.pageSize = 500;
    let ins:any = await tools.getBipInsAidInfo("BOARD_R3", 200, qe);
    if(ins.data.id >=0){
      ins = ins.data.data.data
      this.rightB1ConName = ins.title;
      let cc = await tools.getBipInsAidInfo("BOARD_R3", 210, qe);
      if(cc.data.id ==0){
        let values = cc.data.data.data.values;
        for(var i=0;i<values.length;i++){
          let vl = values[i]
          this.rightB1Con.xAxis[0].data.push(vl.name);
          this.rightB1Con.series[0].data.push(vl.lrbl);
        }
      }
      // 基于准备好的dom，初始化echarts实例
      this.rightB1C1 = echarts.init(this.$refs.rightB1Con as HTMLCanvasElement) 
      // 绘制图表
      this.rightB1C1.setOption(this.rightB1Con);
    }
  }

    /***
   * 数组排序  不改变数组数据顺序 只修改排序字段
   * arr 数组集合
   * field 排序字段
   * sortfield 排序回写字段
   * key 唯一值
   * type 排序类型
   */
  sort(arr:any=[],field:any,sortfield:any,key:any,type:string="desc"){
    let retArr = JSON.parse(JSON.stringify(arr));
    let d = null;
    for(var i=0;i<arr.length;i++){
      for(var j=i;j<arr.length;j++){
        arr[j][field] = parseFloat(arr[j][field]);
        if(type == "desc"){
          if(arr[i][field]<arr[j][field]){
            d = arr[i]; arr[i] = arr[j]; arr[j] =d
          }
        }else if(type == "asc"){
          if(arr[i][field]>arr[j][field]){
            d = arr[i]; arr[i] = arr[j]; arr[j] =d
          }
        }
      }
    }
    for(var i=0;i<arr.length;i++){
      let v1 = arr[i];
      for(var j=0;j<retArr.length;j++){
        if(retArr[j][key] == v1[key]){
          retArr[j][sortfield] = (i+1);
        }
      }
    }
    return retArr;
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
      color: [
          "#065aab",
          "#066eab",
          "#0682ab",
          "#0696ab",
          "#06a0ab",
          "#06b4ab",
          "#06c8ab",
          "#06dcab",
          "#06f0ab"
        ],
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
        center: ['50%', '51%'], // 水球图的中心（圆心）坐标，数组的第一项是横坐标，第二项是纵坐标
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

    let leftB1Con={
      color: [
        "#065aab",
        "#066eab",
        "#0682ab",
        "#0696ab",
        "#06a0ab",
        "#06b4ab",
        "#06c8ab",
        "#06dcab",
        "#06f0ab"
      ],
      tooltip: {
          trigger: 'axis',
          axisPointer: {
              type: 'cross',
              label: {
                  backgroundColor: '#6a7985'
              }
          }
      },
      grid: {
        left: "0%",
        top: "10px",
        right: "0%",
        bottom: "4%",
        containLabel: true
      },
      xAxis: [
          {
              type: 'category',
              data: [],
              axisTick: {
                alignWithLabel: true
              },
              axisLabel: {
                textStyle: {
                  color: "rgba(255,255,255,.6)",
                  fontSize: "12"
                }
              },
              axisLine: {
                show: false
              }
          }
      ],
      yAxis: [
          {
              type: 'value',
              axisLabel: {
                textStyle: {
                  color: "rgba(255,255,255,.6)",
                  fontSize: "12"
                }
              },
              axisLine: {
                lineStyle: {
                  color: "rgba(255,255,255,.1)"
                }
              },
              splitLine: {
                lineStyle: {
                  color: "rgba(255,255,255,.1)"
                }
              }
          }
      ],
      series: []
    };
    this.leftB1Con = JSON.parse(JSON.stringify(leftB1Con))

    let rightB1Con = {
      color: ["#2f89cf"],
      tooltip: {
        trigger: "axis",
        axisPointer: {
          // 坐标轴指示器，坐标轴触发有效
          type: "shadow" // 默认为直线，可选为：'line' | 'shadow'
        }
      },
      grid: {
        left: "0%",
        top: "10px",
        right: "0%",
        bottom: "4%",
        containLabel: true
      },
      xAxis: [
        {
          type: "category",
          data: [],
          axisTick: {
            alignWithLabel: true
          },
          axisLabel: {
            textStyle: {
              color: "rgba(255,255,255,.6)",
              fontSize: "12"
            }
          },
          axisLine: {
            show: false
          }
        }
      ],
      yAxis: [
        {
          type: "value",
          axisLabel: {
            textStyle: {
              color: "rgba(255,255,255,.6)",
              fontSize: "12"
            }
          },
          axisLine: {
            lineStyle: {
              color: "rgba(255,255,255,.1)"
              // width: 1,
              // type: "solid"
            }
          },
          splitLine: {
            lineStyle: {
              color: "rgba(255,255,255,.1)"
            }
          }
        }
      ],
      series: [
        {
          name: "",
          type: "bar",
          barWidth: "35%",
          data: [],
          itemStyle: {
            barBorderRadius: 5
          }
        }
      ]
    };
    this.rightB1Con = JSON.parse(JSON.stringify(rightB1Con))

    this.mapCon={
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
      },
      // 提示框，鼠标移入
      tooltip: {
        show: true, //鼠标移入是否触发数据
        trigger: "item", //出发方式
        // formatter: "{b}-公司数量：{c}",
        formatter:function(params:any){
           var tipHtml = '';
            tipHtml = '<div style="width:300px;height:140px;background:rgba(22,80,158,0.8);border:1px solid rgba(7,166,255,0.7)">'
            +'<div style="width:100%;height:40px;line-height:40px;border-bottom:2px solid rgba(7,166,255,0.7);">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+'<i style="display:inline-block;width:8px;height:8px;background:#16d6ff;border-radius:40px;">'+'</i>'
            +'<span style="margin-left:10px;color:#fff;font-size:16px;">'+params.data.name+'</span>'+'</div>'
            +'<div style="padding:20px">'
            +'<p style="color:#fff;font-size:12px;">'+'<i style="display:inline-block;width:10px;height:10px;background:#16d6ff;border-radius:40px;margin:0 8px">'+'</i>'
            +'单位总数：'+'<span style="color:#11ee7d;margin:0 6px;">'+params.data.value+'</span>'+'个'+'</p>'
            +'<p style="color:#fff;font-size:12px;">'+'<i style="display:inline-block;width:10px;height:10px;background:#16d6ff;border-radius:40px;margin:0 8px">'+'</i>'
            +'总人数：'+'<span style="color:#f48225;margin:0 6px;">'+params.data.qty+'</span>'+'个'+'</p>'
           +'</div>'+'</div>';
            return tipHtml;
        }
      },
      //配置地图的数据，并且显示
      series: [
        {
          name: "地图",
          type: "map", //地图种类
          map: "china", //地图类型。
          data: [
            { name: "北京", value: 0, qty:0 },
            { name: "天津", value: 0, qty:0 },
            { name: "上海", value: 0, qty:0 },
            { name: "重庆", value: 0, qty:0},
            { name: "河北", value: 5, qty:150 },
            { name: "河南", value: 0, qty:0 },
            { name: "云南", value: 0, qty:0 },
            { name: "辽宁", value: 0, qty:0 },
            { name: "黑龙江", value: 0, qty:0 },
            { name: "湖南", value: 0, qty:0 },
            { name: "安徽", value: 0, qty:0 },
            { name: "山东", value: 8, qty:110 },
            { name: "新疆", value: 0, qty:0 },
            { name: "江苏", value: 0, qty:0 },
            { name: "浙江", value: 0, qty:0 },
            { name: "江西", value: 0, qty:0 },
            { name: "湖北", value: 0, qty:0 },
            { name: "广西", value: 7,qty:405 },
            { name: "甘肃", value: 0, qty:0 },
            { name: "山西", value: 0, qty:0 },
            { name: "内蒙古", value: 0, qty:0 },
            { name: "陕西", value: 0, qty:0},
            { name: "吉林", value: 0, qty:0 },
            { name: "福建", value: 1, qty:6 },
            { name: "贵州", value: 0, qty:0 },
            { name: "广东", value: 7, qty:422 },
            { name: "青海", value: 0, qty:0 },
            { name: "西藏", value: 0, qty:0 },
            { name: "四川", value: 0, qty:0 },
            { name: "宁夏", value: 0, qty:0 },
            { name: "海南", value: 0, qty:0 },
            { name: "台湾", value: 0, qty:0 },
            { name: "香港", value: 0, qty:0 },
            { name: "澳门", value: 0, qty:0},
            { name: "南海诸岛", value: 0, qty:0 },
          ],
          itemStyle: {
            //地图区域的多边形 图形样式。
            emphasis: {
              //高亮状态下的样试
              label: {
                show: true,
              },
            },
          },
          zoom: 1, //放大比例
          label: {
            //图形上的文本标签，可用于说明图形的一些数据信息
            show: true,
          },
        }
      ],
    };
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
.mainbox .panel::before {
  position: absolute;
  top: 0;
  left: 0;
  content: "";
  width: 10px;
  height: 10px;
  border-top: 2px solid #02a6b5;
  border-left: 2px solid #02a6b5;
}
.mainbox .panel::after {
  position: absolute;
  top: 0;
  right: 0;
  content: "";
  width: 10px;
  height: 10px;
  border-top: 2px solid #02a6b5;
  border-right: 2px solid #02a6b5;
}
.mainbox .panel .panel-footer {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
}
.mainbox .panel .panel-footer::before {
  position: absolute;
  bottom: 0;
  left: 0;
  content: "";
  width: 10px;
  height: 10px;
  border-bottom: 2px solid #02a6b5;
  border-left: 2px solid #02a6b5;
}
.mainbox .panel .panel-footer::after {
  position: absolute;
  bottom: 0;
  right: 0;
  content: "";
  width: 10px;
  height: 10px;
  border-bottom: 2px solid #02a6b5;
  border-right: 2px solid #02a6b5;
}
.bottomChart{

  h2{
    margin: 0px;
    height: 0.6rem;
    line-height: 0.6rem;
    font-size: 0.25rem;
    font-weight: 400;
    color: #ffffff;
    text-align: center;
  }
}
.bottombox{
  padding-top: 0px;
  .column:nth-child(1) {
    margin-right: 0.075rem;
  }
}
.leftTop1{
  // height: 4.5rem !important;
  height: 3.125rem !important;
}
.leftTop2{
  // height: 3.2rem !important;
  width: 50%;
}
.leftCenter1{
  height: 3.125rem !important;
}
.mainbox .panel .chart {
  height: 100%;
}
.map {
  position: relative;
  height: 7.4rem;
}
.map .chart {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 5;
  height: 7.4rem;
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
  width: 180px;
  height: 150px;
  background: url(../../assets/item-ctrl/fill-border.gif) no-repeat center bottom;
  background-size: 70% 80%;
  margin: 0 auto 0;
  background-position-y: 17px;
}
.wrapper .inner .btm {
  width: 220px;
  height: 20px;
  // background: url(../../assets/item-ctrl/icon-bot.png) no-repeat;
  background-size: 100% 100%;
  margin: 0 auto;
}
</style>
