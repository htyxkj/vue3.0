<template>
  <div class="analysis">
    <div id="load" :class="!loading?'load_hide':''">
      <div class="load_img">
        <!-- 加载动画 -->
        <img class="jzxz1" src="../../assets/item-ctrl/jzxz1.png">
        <img class="jzxz2" src="../../assets/item-ctrl/jzxz2.png">
      </div>
    </div>
    <div class="header">
      <h1>融通农发经营数据可视化分析</h1>
      <div class="showTime">{{ showtime }}</div>
    </div>
    <!-- 页面主体部分 -->
    <div class="mainbox">
      <div class="column">
        <div class="panel">
          <div class="filter">
            <a
              data-id="1"
              data-type="leftTopTabs1"
              href="javascript:;"
              :class="leftTopTabs1 == 1 ? 'active' : ''"
              @click="aClick"
              >营业收入</a
            >
            <a
              data-id="2"
              data-type="leftTopTabs1"
              href="javascript:;"
              :class="leftTopTabs1 == 2 ? 'active' : ''"
              @click="aClick"
              >利润</a
            >
          </div>
          <div class="chart" ref="leftTopTabsC"></div>
          <div class="panel-footer"></div>
        </div>
        <div class="panel">
          <div class="filter">
            <a
              data-id="1"
              data-type="leftCenterabs1"
              href="javascript:;"
              :class="leftCenterabs1 == 1 ? 'active' : ''"
              @click="aClick"
              >第一季度</a
            >
            <a
              data-id="2"
              data-type="leftCenterabs1"
              href="javascript:;"
              :class="leftCenterabs1 == 2 ? 'active' : ''"
              @click="aClick"
              >第二季度</a
            >
            <a
              data-id="3"
              data-type="leftCenterabs1"
              href="javascript:;"
              :class="leftCenterabs1 == 3 ? 'active' : ''"
              @click="aClick"
              >第三季度</a
            >
            <a
              data-id="4"
              data-type="leftCenterabs1"
              href="javascript:;"
              :class="leftCenterabs1 == 4 ? 'active' : ''"
              @click="aClick"
              >第四季度</a
            >
            <a href="javascript:;" class="goto-list" @click="gotoList('L')">列表</a>
          </div>
          <el-carousel
            height="200px"
            indicator-position="none"
            :interval="7000"
          >
            <el-carousel-item
              v-for="(item, index) in leftTableData[leftCenterabs1]"
              :key="index"
            >
              <CardInfo :item="item"></CardInfo>
            </el-carousel-item>
          </el-carousel>
          <div class="panel-footer"></div>
        </div>
      </div>
      <div class="column columnCenter">
        <div class="leftTop2">
          <div class="wrapper">
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
        <div class="panel">
          <div class="filter">
            <a
              data-id="1"
              data-type="rightTopTabs1"
              href="javascript:;"
              :class="rightTopTabs1 == 1 ? 'active' : ''"
              @click="aClick"
              >营业收入</a
            >
            <a
              data-id="2"
              data-type="rightTopTabs1"
              href="javascript:;"
              :class="rightTopTabs1 == 2 ? 'active' : ''"
              @click="aClick"
              >利润</a
            >
          </div>
          <div class="chart" ref="rightTopTabsC"></div>
          <div class="panel-footer"></div>
        </div>
        <div class="panel">
          <div class="filter">
            <a
              data-id="1"
              data-type="rightCenterabs1"
              href="javascript:;"
              :class="rightCenterabs1 == 1 ? 'active' : ''"
              @click="aClick"
              >第一季度</a
            >
            <a
              data-id="2"
              data-type="rightCenterabs1"
              href="javascript:;"
              :class="rightCenterabs1 == 2 ? 'active' : ''"
              @click="aClick"
              >第二季度</a
            >
            <a
              data-id="3"
              data-type="rightCenterabs1"
              href="javascript:;"
              :class="rightCenterabs1 == 3 ? 'active' : ''"
              @click="aClick"
              >第三季度</a
            >
            <a
              data-id="4"
              data-type="rightCenterabs1"
              href="javascript:;"
              :class="rightCenterabs1 == 4 ? 'active' : ''"
              @click="aClick"
              >第四季度</a>
            <a href="javascript:;" class="goto-list" @click="gotoList('R')">列表</a>
          </div>
          <el-carousel
            height="200px"
            indicator-position="none"
            :interval="7000"
          >
            <el-carousel-item
              v-for="(item, index) in rightTableData[rightCenterabs1]"
              :key="index"
            >
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
          <h2>{{ leftB1ConName }}</h2>
          <div class="chart" ref="leftB1Con"></div>
          <div class="panel-footer"></div>
        </div>
      </div>
      <div class="column">
        <div class="panel bottomChart">
          <h2>{{ rightB1ConName }}</h2>
          <div class="chart" ref="rightB1Con"></div>
          <div class="panel-footer"></div>
        </div>
      </div>
    </div>

    <!--左侧弹出框--->
    <template v-if="leftTopTabs1Chart">
      <div class="filterbg"></div>
      <div
        class="popup"
        :style="leftTopTabs1Chart ? 'width: 82%;height: 76%;' : ''"
      >
        <a
          href="javascript:;"
          class="popupClose"
          @click="leftTopTabs1Chart = false"
        ></a>
        <el-row style="color: #f7f8fe; text-align: center"
          ><h3>
            {{ popItemLeft1.name }}-各个板块-
            {{ leftTopTabs1 == 1 ? "营业收入" : "利润" }}占比
          </h3></el-row
        >
        <el-row>
          <div
            class="summaryPie"
            v-for="(item, index) in popValues"
            :id="'summaryPie' + (index + 1)"
            :ref="'summaryPie' + (index + 1)"
            :key="index"
          ></div>
          <!-- <div  ></div>
             <div id="summaryPie2" ref="summaryPie2" class="summaryPie" ></div> -->
        </el-row>
      </div>
    </template>
    
    <!--右侧弹出框-->
    <template v-if="rightTopTabs1Chart">
      <div class="filterbg"></div>
      <div
        class="popup"
        :style="rightTopTabs1Chart ? 'width: 82%;height: 76%;' : ''"
      >
        <a
          href="javascript:;"
          class="popupClose"
          @click="rightTopTabs1Chart = false"
        ></a>
        <el-row style="color: #f7f8fe; text-align: center"
          ><h3>
           各个公司- {{ popItemRight1.name }}-
            {{ rightTopTabs1 == 1 ? "营业收入" : "利润" }}对比
          </h3></el-row >
        <el-row>
             <div  ref="popRightChart" style="width:100%;height:400px;"></div>
        </el-row>
      </div>
    </template>

    <!---中间营收和利润完成比-->
    <template v-if="centerPopShow">
      <div class="filterbg"></div>
      <div
        class="popup"
        :style="centerPopShow ? 'width: 82%;height: 76%;' : ''"
      >
        <a
          href="javascript:;"
          class="popupClose"
          @click="centerPopShow = false"
        ></a>
        <el-row style="color: #f7f8fe; text-align: center"
          ><h3>
           各区域公司{{ popCenterType == 1 ? "营业收入" : "利润" }}完成情况
          </h3>
          <div>
            <span>{{ popCenterType == 1 ? "总营业收入" : "总利润" }}:{{popItemCenter.total}}亿&nbsp;&nbsp;</span>
             <span>已完成:{{popItemCenter.wcfcy}}亿</span>
          </div>
          </el-row >
        <el-row>
            <div class="popView" v-for="(item,index) in popItemCenter.data" :key="index">
              <div class="summaryPie2">
                 <div class="chart" :ref="'popCenterTC'+(index+1)"></div>
              </div>
             
              <div class="btm"></div>
            </div>
        </el-row>
      </div>
    </template>

    <!-- 左右两侧轮播块列表弹出框 -->
    <template v-if="showCarouselTable">
      <div class="filterbg"></div>
      <div class="popup" :style="showCarouselTable ? 'width: 82%;height: 76%;' : ''">
        <a href="javascript:;" class="popupClose" @click="showCarouselTable = false"></a>
        <el-row>
          <vxe-table height="438px" size="mini" resizable border show-header-overflow show-overflow 
          :footer-method="footerMethod" show-footer
          style="width:90%;margin: auto;margin-top:0.9rem;"
          highlight-hover-row :data="carouselTableData">
            <vxe-table-column align="center" type="seq" title="序号" width="60"></vxe-table-column>
            <vxe-table-column align="center" field="name" :title="carouselTableType=='L'?'区域公司':'业务板块'"></vxe-table-column>
            <vxe-table-column align="center" field="yjrmb" title="营业收入计划(亿元)" width="130"></vxe-table-column>
            <vxe-table-column align="center" field="sjrmb" title="营业收入实际(亿元)" width="130"></vxe-table-column>
            <vxe-table-column align="center" field="rmbbl" title="完成比例" width="75">
              <template v-slot="{row}">
                {{(row.rmbbl*1).toFixed(2)+'%'}}
              </template>
            </vxe-table-column>
            <vxe-table-column align="center" field="pm1" title="完成率排名" width="82"></vxe-table-column>
            <vxe-table-column align="center" field="yjfcy" title="利润总额(亿元)" width="110"></vxe-table-column>
            <vxe-table-column align="center" field="sjfcy" title="实际完成(亿元)" width="110"></vxe-table-column>
            <vxe-table-column align="center" field="fcybl" title="完成比例" width="75">
              <template v-slot="{ row }">
                {{(row.fcybl*1).toFixed(2)+'%'}}
              </template>
            </vxe-table-column>
            <vxe-table-column align="center" field="pm2" title="完成率排名" width="82"></vxe-table-column>
          </vxe-table>
        </el-row>
      </div>
    </template>
  </div>
</template>
<script lang="ts">
import echarts from "echarts";
import "echarts/map/js/china";
import "echarts-liquidfill";
import { Component, Vue } from "vue-property-decorator";
import { Mutation } from "vuex-class";
import QueryEntity from "@/classes/search/QueryEntity";
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi;
import CardInfo from "@/custom/item-ctrl/components/CardInfo.vue";
import { Map } from "@/custom/item-ctrl/components/china";
let _ = require("lodash");
@Component({
  components: { CardInfo },
})
export default class ItemAnalysis extends Vue {
  @Mutation("snkey", { namespace: "login" }) setSnkey: any;
  @Mutation("user", { namespace: "login" }) setUserInfo: any;
  @Mutation("menulist", { namespace: "login" }) setMenusInfo: any;
  page: any = { pageSize: 2000, currPage: 1, total: 0 };
  showtime: String = "";
  t: any = "";
  currActive: any = 1;
  loading:boolean = false;

  leftTopTabs1: any = 1;
  leftCenterabs1: any = 1;
  rightTopTabs1: any = 1;
  rightCenterabs1: any = 1;

  /***** */
  leftTopTabs1Chart: boolean = false;
  rightTopTabs1Chart: boolean = false;
  popItemLeft1: any = null;
  popValues: Array<any> = [];
  popItemRight1:any =null;
  /************ 左上第一个图 **********/
  leftT1C1Con: any = null;
  leftT1C2Con: any = null;
  leftTopTabsC: any = null;
  leftTopTabsCCurrInd: any = null;
  leftTopTabsCInterval: any = null;
  /************ 右上第一个图 **********/
  rightT1C1Con: any = null;
  rightT1C2Con: any = null;
  rightTopTabsC: any = null;
  rightTopTabsCCurrInd: any = null;
  rightTopTabsCInterval: any = null;
  /************ 中上第一个图 **********/
  centerTC1Con: any = null;
  centerTC2Con: any = null;
  centerTC1: any = null;
  centerTC2: any = null;
  centerPopShow:boolean = false
  popItemCenter:any = null;
  popCenterType:any = 1;
  /************ 地图 *************/
  map: any = null;
  mapCon: any = null;
  /************ 左侧中间列表 ************/
  leftTableData: any = {
    1: [],
    2: [],
    3: [],
    4: [],
  };
  /************ 右侧中间列表 ************/
  rightTableData: any = {
    1: [],
    2: [],
    3: [],
    4: [],
  };
  /************** 左下图表 *****************/
  leftB1Con: any = null;
  leftB1C1: any = null;
  leftB1ConName: any = "";
  /************** 右下图表 *****************/
  rightB1Con: any = null;
  rightB1C1: any = null;
  rightB1ConName: any = "";

  /************** 左右两侧轮播图弹出表格 ****************/
  showCarouselTable:any = false;
  carouselTableData:any = [];
  carouselTableType:any = "";

  async mounted() {
    this.loading = true;
    this.time();
    this.initConfig();
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
    this.initRightCenter1();
    //左侧下方面积图
    this.initleftBottom1();
    //右侧柱状图
    this.initRightBottom1();
    let _this = this;
    setTimeout(() => {
      this.loading = false
    }, 700);
    window.addEventListener("resize", function () {
      if (_this.centerTC1) _this.centerTC1.resize();
      if (_this.centerTC2) _this.centerTC2.resize();
      if (_this.leftTopTabsC) _this.leftTopTabsC.resize();
      if (_this.rightTopTabsC) _this.rightTopTabsC.resize();
      if (_this.map) _this.map.resize();
    });
  }
  /**
   * 左上第一个图
   */
  async initLeftTop1() {
    let qe: QueryEntity = new QueryEntity("", "");
    qe.page.currPage = 1;
    qe.page.pageSize = 500;
    let cc = await tools.getBipInsAidInfo("BOARD_L1", 210, qe);
    if (cc.data.id == 0) {
      let values = cc.data.data.data.values;
      for (var i = 0; i < values.length; i++) {
        let vl = values[i];
        let c1 = { name: vl.name, value: vl.rmb, scm: vl.scm };
        let c2 = { name: vl.name, value: vl.fcy, scm: vl.scm };
        this.leftT1C1Con.series[0].data.push(c1);
        this.leftT1C2Con.series[0].data.push(c2);
      }
    }
    let refc1 = this.$refs.leftTopTabsC;
    if (refc1) {
      this.leftTopTabsC = echarts.init(
        this.$refs.leftTopTabsC as HTMLCanvasElement
      );
      this.leftTopTabsC.setOption(this.leftT1C1Con);
      this.leftTopTabsC.on("click", this.chartClickLeft1Function);
    }
    this.leftTopTabsCInterval = setInterval(() => {
      var dataLen = this.leftT1C1Con.series[0].data.length; // 取消之前高亮的图形
      this.leftTopTabsC.dispatchAction({
        type: "downplay",
        seriesIndex: 0,
        dataIndex: this.leftTopTabsCCurrInd,
      });
      this.leftTopTabsCCurrInd = (this.leftTopTabsCCurrInd + 1) % dataLen; // 高亮当前图形
      this.leftTopTabsC.dispatchAction({
        type: "highlight",
        seriesIndex: 0,
        dataIndex: this.leftTopTabsCCurrInd,
      }); // 显示 tooltip
      this.leftTopTabsC.dispatchAction({
        type: "showTip",
        seriesIndex: 0,
        dataIndex: this.leftTopTabsCCurrInd,
      });
    }, 5000);
  }
  /**
   * 左右两边轮播列表点击
   */
  gotoList(type:any){
    this.showCarouselTable = true;
    this.carouselTableType = type;
    if(type == 'R'){
      this.carouselTableData = this.rightTableData[this.rightCenterabs1]
    }else if(type =='L'){
      this.carouselTableData = this.leftTableData[this.leftCenterabs1]
    }
  }
  //表尾合计
  footerMethod({ columns, data }:any) {
    let yjrmb =0,sjrmb=0,rmbbl='',yjfcy=0,sjfcy=0,fcybl='';
    for(var i=0;i<data.length;i++){
      yjrmb += data[i].yjrmb
      sjrmb += data[i].sjrmb
      yjfcy += data[i].yjfcy
      sjfcy += data[i].sjfcy
    }
    rmbbl = (sjrmb/yjrmb).toFixed(4)+"%"
    fcybl = (sjfcy/yjfcy).toFixed(4)+"%"
    yjrmb = parseFloat(yjrmb.toFixed(4))
    sjrmb = parseFloat(sjrmb.toFixed(4))
    yjfcy = parseFloat(yjfcy.toFixed(4))
    sjfcy = parseFloat(sjfcy.toFixed(4))
    let dt = ['合计','',yjrmb,sjrmb,rmbbl,'',yjfcy,sjfcy,fcybl,''] 
    return [dt];
  }

  async chartClickLeft1Function(param: any) {
    if (this.leftTopTabs1 == 1) {
      console.log("营业收入");
    } else {
      console.log("利润");
    }
    let name = param.name;
    this.popItemLeft1 = param.data;
    console.log(name, this.popItemLeft1);
    console.log(param, "chartClickLeft1Function");
    this.leftTopTabs1Chart = true;
    //获取辅助
    let qe: QueryEntity = new QueryEntity("", "");
    qe.cont = "scm='" + this.popItemLeft1.scm + "'";
    qe.page.currPage = 1;
    qe.page.pageSize = 500;
    let cc = await tools.getBipInsAidInfo("BOARD_L1_1", 210, qe);
    if (cc.data.id == 0) {
      let values = cc.data.data.data.values;
      console.log(values);
      this.popValues = values;
    }
    this.$nextTick(() => {
      console.log(this.$refs);
      let vrs:Array<any> = []
      let totalFcy = 0,totalRmb=0;
      _.forEach(this.popValues, (item: any, index: any) => {
        let itm:any = {totalfcy:0,syfcy:0,totalrmb:0,syrmb:0}
        itm.title = item.bkname;
        itm.fcy = parseFloat(item.fcy)
        itm.rmb = parseFloat(item.rmb)
        totalFcy+=parseFloat(item.fcy);
        totalRmb+=parseFloat(item.rmb);
        vrs.push(itm)
      });
      _.forEach(vrs, (item: any) => {
        item.totalfcy = totalFcy
        item.totalrmb = totalRmb
        item.syfcy = totalFcy-parseFloat(item.fcy);
        item.syrmb = totalRmb-parseFloat(item.rmb);
        if(this.leftTopTabs1==1){
          item.color = this.getColor(item.rmb*100/totalRmb)
        }else{
           item.color = this.getColor(item.fcy*100/totalFcy)
        }
        
      });
      
      _.forEach(vrs, (item: any, index: any) => {
        let k = "summaryPie" + (index + 1);
        let _r:any = this.$refs[k];
        let summaryPie: any = echarts.init(
          _r[0] as HTMLCanvasElement
        );
        var pieOption1 = {
          title: {
            // x: "center",
            // y: pieData.pieTop,
            text: item.title,
            bottom:'-4%',
            left :'center',
            textStyle: {
              fontWeight: "300",
              color: "#f7f8fe",
              fontSize: 14,

            },
            textAlign:'auto',
            // subtext:'1,7亿'
          },
          tooltip: {
            show: false,
          },
          toolbox: {
            show: false,
          },

          series: [
            {
              type: "pie",
              clockWise: false,
              radius: [40, 46],
              hoverAnimation: false,
              center: ["50%", "50%"],
              labelLine: {
                show: false
              },
              data: [
                {
                  value: this.leftTopTabs1==1?item.rmb:item.fcy,
                  label: {
                    normal: {
                      formatter: " {d}% \n "+(this.leftTopTabs1==1?item.rmb:item.fcy)+"亿",
                      position: "center",
                      show: true,
                      textStyle: {
                        fontSize: 12,
                        fontWeight: "300",
                        color: '#f7f8fe',
                      },
                    },
                  },
                  itemStyle: {
                    normal: {
                      color:  item.color,
                      shadowColor:  item.color,
                      shadowBlur: 10,
                    },
                  },
                },
                {
                  value: this.leftTopTabs1==1?item.syrmb:item.syfcy,
                  name: "",
                  itemStyle: {
                    normal: {
                      color: "rgba(44,59,70,1)", // 未完成的圆环的颜色
                      label: {
                        position:'inside',
                        show: false,
                      }
                    },
                    emphasis: {
                      color: "rgba(44,59,70,1)", // 未完成的圆环的颜色
                    },
                  }
                }
              ]
            }
          ]
        };
        summaryPie.setOption(pieOption1);
      });
    });
  }

  /**
   * 右上第一个图
   */
  async initRightTop1() {
    let qe: QueryEntity = new QueryEntity("", "");
    qe.page.currPage = 1;
    qe.page.pageSize = 500;
    let cc = await tools.getBipInsAidInfo("BOARD_R1", 210, qe);
    if (cc.data.id == 0) {
      let values = cc.data.data.data.values;
      for (var i = 0; i < values.length; i++) {
        let vl = values[i];
        let c1 = { name: vl.name, value: vl.rmb,id:vl.id };
        let c2 = { name: vl.name, value: vl.fcy,id:vl.id };
        this.rightT1C1Con.series[0].data.push(c1);
        this.rightT1C2Con.series[0].data.push(c2);
      }
    }
    let refc1 = this.$refs.rightTopTabsC;
    if (refc1) {
      this.rightTopTabsC = echarts.init(
        this.$refs.rightTopTabsC as HTMLCanvasElement
      );
      this.rightTopTabsC.setOption(this.rightT1C1Con);
      this.rightTopTabsC.on('click',this.chartClickRight1Function)
    }
    this.rightTopTabsCInterval = setInterval(() => {
      var dataLen = this.rightT1C1Con.series[0].data.length; // 取消之前高亮的图形
      this.rightTopTabsC.dispatchAction({
        type: "downplay",
        seriesIndex: 0,
        dataIndex: this.rightTopTabsCCurrInd,
      });
      this.rightTopTabsCCurrInd = (this.rightTopTabsCCurrInd + 1) % dataLen; // 高亮当前图形
      this.rightTopTabsC.dispatchAction({
        type: "highlight",
        seriesIndex: 0,
        dataIndex: this.rightTopTabsCCurrInd,
      }); // 显示 tooltip
      this.rightTopTabsC.dispatchAction({
        type: "showTip",
        seriesIndex: 0,
        dataIndex: this.rightTopTabsCCurrInd,
      });
    }, 5000);
  }

  async chartClickRight1Function(param: any){
    console.log(param)
    this.popItemRight1 = param.data
    this.rightTopTabs1Chart = true
     let qe: QueryEntity = new QueryEntity("", "");
    qe.cont = "id='" + this.popItemRight1.id + "'";
    qe.page.currPage = 1;
    qe.page.pageSize = 500;
    let cc = await tools.getBipInsAidInfo("BOARD_R1_1", 210, qe);
    if (cc.data.id == 0) {
      let values = cc.data.data.data.values;
      console.log(values);
      if(values){
        let rpopChart:any = echarts.init(this.$refs.popRightChart as HTMLCanvasElement);
        let option:any = {
          color: ["#73b9bc"],
          tooltip: {
            trigger: "axis",
            axisPointer: {
              // 坐标轴指示器，坐标轴触发有效
              type: "shadow", // 默认为直线，可选为：'line' | 'shadow'
            },
          },
          grid: {
            left: "10%",
            top: "10px",
            right: "20%",
            bottom: "4%",
            containLabel: true,
          },
          xAxis: [
            {
              type: "category",
              data: [],
              axisTick: {
                alignWithLabel: true,
              },
              axisLabel: {
                textStyle: {
                  color: "rgba(255,255,255,.6)",
                  fontSize: "12",
                },
              },
              axisLine: {
                show: false,
              },
            },
          ],
          yAxis: [
            {
              type: "value",
              axisLabel: {
                formatter:'{value} 亿',
                textStyle: {
                  color: "rgba(255,255,255,.6)",
                  fontSize: "12",
                  
                },
              },
              axisLine: {
                lineStyle: {
                  color: "rgba(255,255,255,.1)",
                },
              },
              splitLine: {
                lineStyle: {
                  color: "rgba(255,255,255,.1)",
                },
              },
            },
          ],
          series: [
            {
              name: "",
              type: "bar",
              barWidth: "35%",
              data: [],
              itemStyle: {
                barBorderRadius: 5,
              },
            },
          ],
        };
        option.xAxis[0].data = [];
        option.series[0].data = [];
        _.forEach(values,(item:any,index:any) => {
          option.xAxis[0].data.push(item.gsname);
          option.series[0].data.push(this.rightTopTabs1==1?item.rmb:item.fcy);
        });
        rpopChart.setOption(option);
      }
    }
  }

  /**
   * 中上第一个图
   */
  async initCenterTop1() {
    let qe: QueryEntity = new QueryEntity("", "");
    qe.page.currPage = 1;
    qe.page.pageSize = 500;
    let cc = await tools.getBipInsAidInfo("BOARD_M1", 210, qe);
    if (cc.data.id == 0) {
      let values = cc.data.data.data.values[0];
      // 基于准备好的dom，初始化echarts实例
      this.centerTC1 = echarts.init(this.$refs.centerTC1 as HTMLCanvasElement);
      
      // 绘制图表
      this.centerTC1Con.series[0].data.push(parseFloat(values.rmbbl)/100)
      this.centerTC1Con.series[0].name="营收目标"
      this.centerTC1Con.title.text="营收:"+values.yjrmb+"亿，完成:"+values.sjrmb+"亿";
      this.centerTC1.setOption(this.centerTC1Con);
      this.centerTC1.getZr().on('click',this.centerTC1Click);
      
      // 基于准备好的dom，初始化echarts实例
      this.centerTC2 = echarts.init(this.$refs.centerTC2 as HTMLCanvasElement);
      // 绘制图表
      this.centerTC2Con.series[0].data.push(parseFloat(values.fcybl)/100)
      this.centerTC2Con.series[0].name="利润目标"
      this.centerTC2Con.title.text="利润:"+values.yjfcy+"亿，完成:"+values.sjfcy+"亿";
      this.centerTC2.setOption(this.centerTC2Con);
      this.centerTC2.getZr().on('click',this.centerTC2Click);
    }
  }

  async centerTC1Click(param:any){
    console.log(param)
    this.popCenterType = 1;
    this.centerPopShow = true;
    this.popItemCenter = {total:0,wcfcy:0,data:[]};
    let qe: QueryEntity = new QueryEntity("", "");
    qe.page.currPage = 1;
    qe.page.pageSize = 500;
    let ins:any = await tools.getBipInsAidInfo("BOARD_M2", 210, qe);
    if(ins.data.id >=0){
         let vrs = ins.data.data.data.values;
        _.forEach(vrs,(item:any) => {
          this.popItemCenter.total+=parseFloat(item.yjrmb);
          this.popItemCenter.wcfcy+=parseFloat(item.sjrmb);
          let itm:any = {};
          itm.name = item.name;
          itm.wcbl = parseFloat(item.rmbbl)/100;
          itm.yjfcy = item.yjrmb;
          itm.sjfcy = item.sjrmb;
           itm.color = this.getColor(item.rmbbl);
          this.popItemCenter.data.push(itm);
        });
        this.popItemCenter.wcfcy = this.popItemCenter.wcfcy.toFixed(2);
        console.log(this.popItemCenter)
        //创建board
        this.$nextTick(()=>{
          _.forEach(this.popItemCenter.data, (item: any, index: any) => {
            let k = "popCenterTC" + (index + 1);
            let _r:any = this.$refs[k];
            let popCenterTC: any = echarts.init(
              _r[0] as HTMLCanvasElement
            );
          let popCenterOption = this.getCenterPopOption(item);
            popCenterTC.setOption(popCenterOption);
          });
        });

    }

  }

  getCenterPopOption(item:any){
    let popCenterOption ={
              // 图表主标题
              title: {
                text: item.name, // 主标题文本，支持使用 \n 换行
                bottom: -2, // 定位 值: 'top', 'middle', 'bottom' 也可以是具体的值或者百分比
                left: 'left', // 值: 'left', 'center', 'right' 同上
                textStyle: { // 文本样式
                  fontSize: 20,
                  fontWeight: 300,
                  color: '#fff'
                },
                subtext:'计划'+item.yjfcy+'，完成'+item.sjfcy+'亿',
              },
              // 提示框组件
              tooltip: {
                trigger: 'item', // 触发类型, 数据项图形触发，主要在散点图，饼图等无类目轴的图表中使用。
                formatter: function (value:any) {
                  let n1:any = value.data * 100;
                  n1 = n1.toFixed(2);
                  return value.seriesName + ': ' + n1 + '%'
                }
              },
              series: [{
                type: 'liquidFill',
                name: item.name, // 系列名称，用于tooltip的显示，legend 的图例筛选
                radius: '40%', // 水球图的半径
                center: ['50%', '51%'], // 水球图的中心（圆心）坐标，数组的第一项是横坐标，第二项是纵坐标
                // 水填充图的形状 circle 默认圆形  rect 圆角矩形  triangle 三角形  
                // diamond 菱形  pin 水滴状 arrow 箭头状  还可以是svg的path
                shape: 'circle',
                phase: 0, // 波的相位弧度 不设置  默认自动
                direction: 'right', // 波浪移动的速度  两个参数  left 从右往左 right 从左往右
                // 图形上的文本标签
                label: {
                  fontSize: 14,
                  fontWeight: 300,
                  color: '#fff'
                },
                outline: {
                  show: true,
                  borderDistance: 2, // 边框线与图表的距离 数字
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
                  color: item.color, // 水球显示的背景颜色
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
                data: [item.wcbl] // 系列中的数据内容数组
              }]
            }

            return popCenterOption
  }

  async centerTC2Click(param:any){
    this.popCenterType = 2;
    this.centerPopShow = true;
    this.popItemCenter = {total:0,wcfcy:0,data:[]};
    let qe: QueryEntity = new QueryEntity("", "");
    qe.page.currPage = 1;
    qe.page.pageSize = 500;
    let ins:any = await tools.getBipInsAidInfo("BOARD_M2", 210, qe);
    if(ins.data.id >=0){
         let vrs = ins.data.data.data.values;
        _.forEach(vrs,(item:any) => {
          this.popItemCenter.total+=parseFloat(item.yjfcy);
          this.popItemCenter.wcfcy+=parseFloat(item.sjfcy);
          let itm:any = {};
          itm.name = item.name;
          itm.wcbl = parseFloat(item.fcybl)/100;
          itm.yjfcy = item.yjfcy;
          itm.sjfcy = item.sjfcy;
          itm.color = this.getColor(item.fcybl);
          this.popItemCenter.data.push(itm);
        });
        this.popItemCenter.wcfcy = this.popItemCenter.wcfcy.toFixed(2);
        console.log(this.popItemCenter)
        //创建board
        this.$nextTick(()=>{
          _.forEach(this.popItemCenter.data, (item: any, index: any) => {
            let k = "popCenterTC" + (index + 1);
            let _r:any = this.$refs[k];
            let popCenterTC: any = echarts.init(
              _r[0] as HTMLCanvasElement
            );
          let popCenterOption = this.getCenterPopOption(item);
            popCenterTC.setOption(popCenterOption);
          });
        });
    }
  }

  /**
   * 地图
   */
  async initMap() {
    this.map = echarts.init(this.$refs.itemAnaMap as HTMLCanvasElement);
    echarts.registerMap("中华人民共和国", Map);
    let qe: QueryEntity = new QueryEntity("", "");
    qe.page.currPage = 1;
    qe.page.pageSize = 500;
    let ins:any = await tools.getBipInsAidInfo("BOARD_M2", 200, qe);
    if(ins.data.id >=0){
            ins = ins.data.data.data
      this.leftB1ConName = ins.title;
      let labers = ins.labers;
      let showColsIndex = ins.showColsIndex;
      let cc = await tools.getBipInsAidInfo("BOARD_M2", 210, qe);
      let gps:any ={
        "哈尔滨": [126.535732,45.807747, 130],
        "沈阳": [123.469255,41.684175, 130] ,
        "北京": [116.404188,39.915529, 130] ,
        "济南": [117.1195,36.655813, 130],
        "南京": [118.801042,32.064652, 130] ,
        "杭州": [120.21459,30.253481, 130] ,
        "广州": [113.271889,23.135336, 130] ,
        "昆明": [102.835764,24.885852, 130] ,
        "武汉": [114.308826,30.599661, 130] ,
        "乌鲁木齐": [87.617539,43.829764, 130] ,
        "成都": [104.074585,30.58178, 130] }
      if(cc.data.id ==0){
        let values = cc.data.data.data.values;
        for(var i=0;i<values.length;i++){
          let vl = values[i];
          let name = vl.name;
          let addr = gps[name];
          let tipHtml = '<div style="width:300px;height:178px;background:rgba(22,80,158,0.8);border:1px solid rgba(7,166,255,0.7)">'
            +'<div style="width:100%;height:40px;line-height:40px;border-bottom:2px solid rgba(7,166,255,0.7);">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+'<i style="display:inline-block;width:8px;height:8px;background:#16d6ff;border-radius:40px;">'+'</i>'
            +'<span style="margin-left:10px;color:#fff;font-size:16px;">'+name+'</span>'+'</div>'
            +'<div style="padding:5px">'
          for(var j=2;j<showColsIndex.length;j++){
            let text = vl[ins.cells.cels[showColsIndex[j]].id];
            let label = labers[j];
            tipHtml += '<p style="color:#fff;font-size:12px;width:50%;float:left">'+'<i style="display:inline-block;width:10px;height:10px;background:#16d6ff;border-radius:40px;margin:0 8px">'+'</i>'
            tipHtml += label+'<span style="color:#f48225;margin:0 6px;">'+text+'</span>'+''+'</p>'
          }
          tipHtml += '</div></div>';
          let d1 = { name: name, value: addr,message:tipHtml}
          this.mapCon.series[0].data.push(d1);
        }
      }
    }
    // 绘制图表
    this.map.setOption(this.mapCon);
  }
  /**
   * 左侧列表
   */
  async initLeftCenter1() {
    let qe: QueryEntity = new QueryEntity("", "");
    qe.page.currPage = 1;
    qe.page.pageSize = 500;
    let cc = await tools.getBipInsAidInfo("BOARD_L2", 210, qe);
    this.leftTableData = {
      1: [],
      2: [],
      3: [],
      4: [],
    };
    let f: any = [];
    let s: any = [];
    let t: any = [];
    let f4: any = [];
    if (cc.data.id == 0) {
      let values = cc.data.data.data.values;
      for (var i = 0; i < values.length; i++) {
        let vl = values[i];
        if (vl.ob_month == 1) {
          //第一季度
          f.push(vl);
        } else if (vl.ob_month == 2) {
          //第一季度
          s.push(vl);
        } else if (vl.ob_month == 3) {
          //第一季度
          t.push(vl);
        } else if (vl.ob_month == 4) {
          //第一季度
          f4.push(vl);
        }
      }
    }
    f = this.sort(f, "fcybl", "pm2", "name", "desc");
    f = this.sort(f, "rmbbl", "pm1", "name", "desc");
    this.leftTableData["1"] = f;
    s = this.sort(s, "fcybl", "pm2", "name", "desc");
    s = this.sort(s, "rmbbl", "pm1", "name", "desc");
    this.leftTableData["2"] = s;
    t = this.sort(t, "fcybl", "pm2", "name", "desc");
    t = this.sort(t, "rmbbl", "pm1", "name", "desc");
    this.leftTableData["3"] = t;
    f4 = this.sort(f4, "fcybl", "pm2", "name", "desc");
    f4 = this.sort(f4, "rmbbl", "pm1", "name", "desc");
    this.leftTableData["4"] = f4;
  }
  /**
   * 右侧列表
   */
  async initRightCenter1() {
    let qe: QueryEntity = new QueryEntity("", "");
    qe.page.currPage = 1;
    qe.page.pageSize = 500;
    let cc = await tools.getBipInsAidInfo("BOARD_R2", 210, qe);
    this.rightTableData = {
      1: [],
      2: [],
      3: [],
      4: [],
    };
    let f: any = [];
    let s: any = [];
    let t: any = [];
    let f4: any = [];
    if (cc.data.id == 0) {
      let values = cc.data.data.data.values;
      for (var i = 0; i < values.length; i++) {
        let vl = values[i];
        if (vl.ob_month == 1) {
          //第一季度
          f.push(vl);
        } else if (vl.ob_month == 2) {
          //第一季度
          s.push(vl);
        } else if (vl.ob_month == 3) {
          //第一季度
          t.push(vl);
        } else if (vl.ob_month == 4) {
          //第一季度
          f4.push(vl);
        }
      }
    }
    f = this.sort(f, "fcybl", "pm2", "name", "desc");
    f = this.sort(f, "rmbbl", "pm1", "name", "desc");
    this.rightTableData["1"] = f;
    s = this.sort(s, "fcybl", "pm2", "name", "desc");
    s = this.sort(s, "rmbbl", "pm1", "name", "desc");
    this.rightTableData["2"] = s;
    t = this.sort(t, "fcybl", "pm2", "name", "desc");
    t = this.sort(t, "rmbbl", "pm1", "name", "desc");
    this.rightTableData["3"] = t;
    f4 = this.sort(f4, "fcybl", "pm2", "name", "desc");
    f4 = this.sort(f4, "rmbbl", "pm1", "name", "desc");
    this.rightTableData["4"] = f4;
  }
  /**
   * 左下面积图
   */
  async initleftBottom1() {
    let qe: QueryEntity = new QueryEntity("", "");
    qe.page.currPage = 1;
    qe.page.pageSize = 500;
    let ins:any = await tools.getBipInsAidInfo("BOARD_L3", 200, qe);
    if(ins.data.id >=0){
      ins = ins.data.data.data
      this.leftB1ConName = ins.title;
      let labers = ins.labers;
      let showColsIndex = ins.showColsIndex;
      for(var i=1;i<labers.length;i++){
          let dd = { name: labers[i], type: 'line', smooth: true,stack: labers[i], areaStyle: {opacity:0.6,}, emphasis: { focus: 'series' },data: [] }
          this.leftB1Con.series.push(dd)
          let lb1 = {
            name: labers[i],
            textStyle: {
              color: '#ffffff'
            }
          }
          this.leftB1Con.legend.data.push(lb1)
      }
      let cc = await tools.getBipInsAidInfo("BOARD_L3", 210, qe);
      if (cc.data.id == 0) {
        let values = cc.data.data.data.values;
        for (var i = 0; i < values.length; i++) {
          let vl = values[i];
          this.leftB1Con.xAxis[0].data.push(vl.iym);
          for (var j = 1; j < labers.length; j++) {
            this.leftB1Con.series[j - 1].data.push(
              vl[ins.cells.cels[showColsIndex[j]].id]
            );
          }
        }
      }
      // 基于准备好的dom，初始化echarts实例
      this.leftB1C1 = echarts.init(this.$refs.leftB1Con as HTMLCanvasElement);
      // 绘制图表
      this.leftB1C1.setOption(this.leftB1Con);
    }
  }
  /**
   * 右下柱状图
   */
  async initRightBottom1() {
    let qe: QueryEntity = new QueryEntity("", "");
    qe.page.currPage = 1;
    qe.page.pageSize = 500;
    let ins: any = await tools.getBipInsAidInfo("BOARD_R3", 200, qe);
    if (ins.data.id >= 0) {
      ins = ins.data.data.data;
      this.rightB1ConName = ins.title;
      let cc = await tools.getBipInsAidInfo("BOARD_R3", 210, qe);
      if (cc.data.id == 0) {
        let values = cc.data.data.data.values;
        for (var i = 0; i < values.length; i++) {
          let vl = values[i];
          console.log(vl);
          this.rightB1Con.xAxis3D.data.push(vl.name);
          this.rightB1Con.series[0].data.push([0,(i+1),vl.lrbl]);
        }
      }
      // 基于准备好的dom，初始化echarts实例
      this.rightB1C1 = echarts.init(this.$refs.rightB1Con as HTMLCanvasElement);
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
  sort(
    arr: any = [],
    field: any,
    sortfield: any,
    key: any,
    type: string = "desc"
  ) {
    let retArr = JSON.parse(JSON.stringify(arr));
    let d = null;
    for (var i = 0; i < arr.length; i++) {
      for (var j = i; j < arr.length; j++) {
        arr[j][field] = parseFloat(arr[j][field]);
        if (type == "desc") {
          if (arr[i][field] < arr[j][field]) {
            d = arr[i];
            arr[i] = arr[j];
            arr[j] = d;
          }
        } else if (type == "asc") {
          if (arr[i][field] > arr[j][field]) {
            d = arr[i];
            arr[i] = arr[j];
            arr[j] = d;
          }
        }
      }
    }
    for (var i = 0; i < arr.length; i++) {
      let v1 = arr[i];
      for (var j = 0; j < retArr.length; j++) {
        if (retArr[j][key] == v1[key]) {
          retArr[j][sortfield] = i + 1;
        }
      }
    }
    return retArr;
  }
  /**
   * 页签切换
   */
  aClick(e: any) {
    let type = e.currentTarget.dataset.type;
    if (type == "leftTopTabs1") {
      this.leftTopTabs1 = e.currentTarget.dataset.id;
      if (this.leftTopTabs1 == 1) {
        this.leftTopTabsC.setOption(this.leftT1C1Con);
      } else {
        this.leftTopTabsC.setOption(this.leftT1C2Con);
      }
    } else if (type == "leftCenterabs1") {
      this.leftCenterabs1 = e.currentTarget.dataset.id;
    } else if (type == "rightTopTabs1") {
      this.rightTopTabs1 = e.currentTarget.dataset.id;
      if (this.rightTopTabs1 == 1) {
        this.rightTopTabsC.setOption(this.rightT1C1Con);
      } else {
        this.rightTopTabsC.setOption(this.rightT1C2Con);
      }
    } else if (type == "rightCenterabs1") {
      this.rightCenterabs1 = e.currentTarget.dataset.id;
    }
  }
  initConfig() {
    let leftT1Con = {
      color: [
        "#0f56ea",
        "#1fc4f4",
        "#f5dc30",
        "#ff9110",
        "#f8224a",
        "#f92598",
        "#c31ced",
        "#621bf1",
        "#2ff0ce",
        "#18e47d",
        "#b5f813",
        "#f8492d",
        "#2b3de7",    
      ],
      tooltip: {
        trigger: "item",
      },
      series: [
        {
          name: "",
          type: "pie",
          radius: ["30%", "70%"],
          center: ["50%", "50%"],
          itemStyle: {
            borderRadius: 8,
            normal:{ 
              label:{ 
                show: true, 
                formatter: '{b} ({d}%)' 
              }
            } 
          },
          data: [],
        },
      ],
    };
    this.leftT1C1Con = JSON.parse(JSON.stringify(leftT1Con));
    this.leftT1C2Con = JSON.parse(JSON.stringify(leftT1Con));
    this.rightT1C1Con = JSON.parse(JSON.stringify(leftT1Con));
    this.rightT1C2Con = JSON.parse(JSON.stringify(leftT1Con));

    let centerTC1Con ={
      // 图表主标题
      title: {
        text: '', // 主标题文本，支持使用 \n 换行
        bottom: -6, // 定位 值: 'top', 'middle', 'bottom' 也可以是具体的值或者百分比
        left: 'center', // 值: 'left', 'center', 'right' 同上
        textStyle: { // 文本样式
          fontSize: 16,
          fontWeight: 200,
          color: '#fff'
        }
      },
      // 提示框组件
      tooltip: {
        trigger: 'item', // 触发类型, 数据项图形触发，主要在散点图，饼图等无类目轴的图表中使用。
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
        // 图形上的文本标签
        label: {
          fontSize: 30,
          fontWeight: 200,
          color: '#fff'
        },
        // label: {
        //   show: true,
        //   fontSize: 14,
        //   position: ['50%', '50%'],
        //   color: 'rgba(254, 253, 244, 1.00)',
        //   insideColor: 'rgba(244, 120, 34, 1.00)',
        //   formatter: 'XXXXXXXXXX',
        //   rich: {
        //       total: {
        //           fontSize: 37,
        //           fontFamily: "微软雅黑",
        //       }, total2: {
        //           fontSize: 25,
        //           fontFamily: "微软雅黑",
        //       },
        //       active: {
        //           fontFamily: "微软雅黑",
        //           fontSize: 14,
        //       },
        //   }
        // },
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
        data: [] // 系列中的数据内容数组
      }]
    }
    this.centerTC1Con =  JSON.parse(JSON.stringify(centerTC1Con))
    this.centerTC2Con =  JSON.parse(JSON.stringify(centerTC1Con))

    let leftB1Con = {
       color: [
        "#155dff",
        "#0ef6a7",
        "#ffe535",
        "#19f1ff",
        "#1860f4",
        "#1fc4f4",
        "#f5dc30",
        "#ff9110",
        "#f8224a",
        "#f92598",
      ],
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
          label: {
            backgroundColor: "#6a7985",
          },
        },
      },
      legend: {
          data: []
      },
      grid: {
        left: "0%",
        top: "10px",
        right: "0%",
        bottom: "4%",
        containLabel: true,
      },
      xAxis: [
          {
              type: 'category',
              boundaryGap: false,
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
              fontSize: "12",
            },
          },
          axisLine: {
            lineStyle: {
              color: "rgba(255,255,255,.1)",
            },
          },
          splitLine: {
            lineStyle: {
              color: "rgba(255,255,255,.1)",
            },
          },
        },
      ],
      series: [],
    };
    this.leftB1Con = JSON.parse(JSON.stringify(leftB1Con));

    // let rightB1Con = {
    //   color: ["#2f89cf"],
    //   tooltip: {
    //     trigger: "axis",
    //     axisPointer: {
    //       // 坐标轴指示器，坐标轴触发有效
    //       type: "shadow", // 默认为直线，可选为：'line' | 'shadow'
    //     },
    //   },
    //   grid: {
    //     left: "0%",
    //     top: "10px",
    //     right: "0%",
    //     bottom: "4%",
    //     containLabel: true,
    //   },
    //   xAxis: [
    //     {
    //       type: "category",
    //       data: [],
    //       axisTick: {
    //         alignWithLabel: true,
    //       },
    //       axisLabel: {
    //         textStyle: {
    //           color: "rgba(255,255,255,.6)",
    //           fontSize: "12",
    //         },
    //       },
    //       axisLine: {
    //         show: false,
    //       },
    //     },
    //   ],
    //   yAxis: [
    //     {
    //       type: "value",
    //       axisLabel: {
    //         textStyle: {
    //           color: "rgba(255,255,255,.6)",
    //           fontSize: "12",
    //         },
    //       },
    //       axisLine: {
    //         lineStyle: {
    //           color: "rgba(255,255,255,.1)",
    //           // width: 1,
    //           // type: "solid"
    //         },
    //       },
    //       splitLine: {
    //         lineStyle: {
    //           color: "rgba(255,255,255,.1)",
    //         },
    //       },
    //     },
    //   ],
    //   series: [
    //     {
    //       name: "",
    //       type: "bar",
    //       barWidth: "35%",
    //       data: [],
    //       itemStyle: {
    //         barBorderRadius: 5,
    //       },// 基准线
    //     },
    //   ],
    // };
    let rightB1Con = {
      tooltip: {},
        xAxis3D: {
          type: 'category',
          data: [],
          name:''
        },
        yAxis3D: {
          type: 'category',
          data: [],
          name:''
        },
        zAxis3D: {
          type: 'value',
          name:''
        },
        grid3D: {
          boxWidth: 200,
          boxDepth: 8,
          light: {
            main: {
              intensity: 1.2,
              shadow: true
            },
            ambient: {
              intensity: 0.3
            }
          }
        },
        series: [{
          type: 'bar3D',
          data: [],
          shading: 'lambert',
          label: {
            fontSize: 16,
            borderWidth: 1
          },
          emphasis: {
            label: {
              fontSize: 20,
              color: '#900'
            },
            itemStyle: {
              color: '#900'
            }
          }
        }]
      }
    this.rightB1Con = JSON.parse(JSON.stringify(rightB1Con));

    this.mapCon={
      color: [
        "#ffffff",
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
          show:true,
          emphasis: {
            show: true,
            color: "#fff",
          },
        },
        roam: false,
        zoom: 1,
        itemStyle: {
          normal: {
            areaColor: "rgba(43, 196, 243, 0.42)",
            borderColor: "rgba(43, 196, 243, 1)",
            borderWidth: 1,
          },
          emphasis: {
            areaColor: "#2B91B7"
          }
        },
        regions: [
          {name: '黑龙江',itemStyle: {areaColor: '#3580ed',color: '#3580ed',borderWidth:0}},
          {name: '吉林',itemStyle: {areaColor: '#32b4ed',color: '#32b4ed',borderWidth:0}},
          {name: '内蒙古',itemStyle: {areaColor: '#32b4ed',color: '#32b4ed',borderWidth:0}},
          {name: '辽宁',itemStyle: {areaColor: '#32b4ed',color: '#32b4ed',borderWidth:0}},
          {name: '北京',itemStyle: {areaColor: '#F43749',color: '#F43749',borderWidth:0}},
          {name: '天津',itemStyle: {areaColor: '#F43749',color: '#F43749',borderWidth:0}},
          {name: '河北',itemStyle: {areaColor: '#F43749',color: '#F43749',borderWidth:0}},
          {name: '山西',itemStyle: {areaColor: '#F43749',color: '#F43749',borderWidth:0}},
          {name: '山东',itemStyle: {areaColor: '#ff971a',color: '#ff971a',borderWidth:0}},
          {name: '河南',itemStyle: {areaColor: '#ff971a',color: '#ff971a',borderWidth:0}},
          {name: '重庆',itemStyle: {areaColor: '#ff971a',color: '#ff971a',borderWidth:0}},
          {name: '江苏',itemStyle: {areaColor: '#bfff43',color: '#bfff43',borderWidth:0}},
          {name: '安徽',itemStyle: {areaColor: '#bfff43',color: '#bfff43',borderWidth:0}},
          {name: '浙江',itemStyle: {areaColor: '#3ae8c6',color: '#3ae8c6',borderWidth:0}},
          {name: '上海',itemStyle: {areaColor: '#3ae8c6',color: '#3ae8c6',borderWidth:0}},
          {name: '福建',itemStyle: {areaColor: '#3ae8c6',color: '#3ae8c6',borderWidth:0}},
          {name: '江西',itemStyle: {areaColor: '#3ae8c6',color: '#3ae8c6',borderWidth:0}},
          {name: '广东',itemStyle: {areaColor: '#603de0',color: '#603de0',borderWidth:0}},
          {name: '广西',itemStyle: {areaColor: '#603de0',color: '#603de0',borderWidth:0}},
          {name: '海南',itemStyle: {areaColor: '#603de0',color: '#603de0',borderWidth:0}},
          {name: '云南',itemStyle: {areaColor: '#d156ef',color: '#d156ef',borderWidth:0}},
          {name: '贵州',itemStyle: {areaColor: '#d156ef',color: '#d156ef',borderWidth:0}},
          {name: '湖南',itemStyle: {areaColor: '#d156ef',color: '#d156ef',borderWidth:0}},
          {name: '湖北',itemStyle: {areaColor: '#ffe266',color: '#ffe266',borderWidth:0}},
          {name: '陕西',itemStyle: {areaColor: '#ffe266',color: '#ffe266',borderWidth:0}},
          {name: '新疆',itemStyle: {areaColor: '#18d186',color: '#18d186',borderWidth:0}},
          {name: '青海',itemStyle: {areaColor: '#f75e34',color: '#f75e34',borderWidth:0}},
          {name: '宁夏',itemStyle: {areaColor: '#f75e34',color: '#f75e34',borderWidth:0}},
          {name: '甘肃',itemStyle: {areaColor: '#f75e34',color: '#f75e34',borderWidth:0}},
          {name: '四川',itemStyle: {areaColor: '#f75e34',color: '#f75e34',borderWidth:0}},
        ]
      },
      // 提示框，鼠标移入
      tooltip: {
        show: true, //鼠标移入是否触发数据
        trigger: "item", //出发方式
        // formatter: "{b}-公司数量：{c}",
        formatter:function(params:any){
          return params.data.message;
        }
      },
      //配置地图的数据，并且显示
      series: [
        {
          type: "effectScatter",
          showEffectOn: "render", //配置什么时候显示特效
          coordinateSystem: "geo", //该系列使用的坐标系
          symbolSize: 10, //标记的大小
          rippleEffect:{              //涟漪特效相关配置。
            period:1.2,               //动画的时间。
            scale:3.5,              //动画中波纹的最大缩放比例。
            brushType:'fill', 
          },
          data: []
        },
      ]
    };
  }
  // 定时器执行获取当前时间
  time() {
    clearTimeout(this.t); //清除定时器
    let dt = new Date();
    let y = dt.getFullYear();
    let mt = dt.getMonth() + 1;
    let day = dt.getDate();
    let h: any = dt.getHours(); //获取时
    let m: any = dt.getMinutes(); //获取分
    let s: any = dt.getSeconds(); //获取秒
    if (m < 10) {
      m = "0" + m;
    }
    if (s < 10) {
      s = "0" + s;
    }
    if (h < 10) {
      h = "0" + h;
    }
    this.showtime =
      y + "年" + mt + "月" + day + "-" + h + "时" + m + "分" + s + "秒";
    this.t = setTimeout(this.time, 1000); //设定定时器，循环运行
  }

  getColor(value:any){
    console.log(value)
    if(value>=0&&value<10){
      return '#e90c0c'
    }else if(value>=10&&value<20){
       return '#fc5c01'
    }else if(value>=20&&value<30){
       return '#ff8212'
    }else if(value>=30&&value<40){
       return '#ffae0f'
    }else if(value>=40&&value<50){
       return '#ffe912'
    }else if(value>=50&&value<60){
       return '#c0f814'
    }else if(value>=60&&value<70){
       return '#83f014'
    }else if(value>=70&&value<80){
       return '#3fef10'
    }else if(value>=80&&value<90){
       return '#05f293'
    }else{
       return '#00deb7'
    }
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
  // color:#00deb7
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
    height: 3.28rem;
    border: 1px solid rgba(25, 186, 139, 0.17);
    background: url(../../assets/bip-erp/image/line.png)
      rgba(255, 255, 255, 0.04);
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
h2{
  margin: 0px;
  height: 0.6rem;
  line-height: 0.6rem;
  font-size: 0.25rem;
  color: #ffffff;
  text-align: center;
}
.bottombox {
  padding-top: 0px;
  .column:nth-child(1) {
    margin-right: 0.075rem;
  }
}
.leftTop2{
  // height: 3.2rem !important;
  width: 100%;
}
.mainbox .panel .chart {
  height: 100%;
}
.map {
  position: relative;
  height: 8rem;
}
.map .chart {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 5;
  height: 8rem;
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

a {
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
.filter .goto-list{
  right: 0px;
  position: absolute;
  color: #ffffff;
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
  width: 26%;
  float: left;
  z-index: 9;
  margin-top: -26px;
}
.wrapper .inner:nth-child(2){
  margin-left: 0.5rem
}
.wrapper .inner .chart {
  width: 180px;
  height: 150px;
  background: url(../../assets/item-ctrl/fill-border.gif) no-repeat center bottom;
  background-size: 68% 80%;
  margin: 0 auto 0;
  background-position-y: 17px;
}
.wrapper .inner .btm {
  width: 120px;
  height: 10px;
  background: url(../../assets/item-ctrl/icon-bot.png) no-repeat;
  background-size: 100% 100%;
  margin: 0 30px;
}

/**弹出层*/
.filterbg {
  width: 100%;
  height: 100%;
  background: rgba(30, 182, 254, 0.5);
  position: absolute;
  top: 0;
  left: 0;
  z-index: 998;
  display: block;
  /* display: none; */
}

.popup {
  width: 0;
  height: 0;
  background: #061f3e;
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 99999999;
  border-radius: 8px;
  display: block;
  -webkit-transform: translate(-50%, -50%);
  -moz-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  -o-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}

.popup .popupClose {
  width: 36px;
  height: 36px;
  background: url(../../assets/item-ctrl/close.png);
  background-size: cover;
  position: absolute;
  top: -18px;
  right: -18px;
  display: block;
  transition: 0.3s;
}
.popupClose:hover{
	transform: rotate(180deg);
}
// .popupClose:hover{
//    transform:rotate(90deg);                //w3c标准
//    transition-duration: 0.3s;
// }
.summaryPie {
  height: 100%;
  float: left;
  // width: 33%;
  width: 200px;
  height: 150px;
  margin-bottom: 10px;
}
.summaryPie2 {
  height: 100%;
  float: left;
  // width: 33%;
  width: 150px;
  height: 150px;
  margin-left:8px;
  margin-bottom: 10px;
}

.summaryPie2 .chart{
   float: left;
    width: 150px;
    height: 150px;
    background: url(../../assets/item-ctrl/fill-border.gif) no-repeat center bottom;
    background-size: 60% 60%;
    margin: 0 auto 0;
    background-position-y: 30px;
}

/* 加载旋转动画 */
#load{width:100%;height:100%;position:absolute;background:url(../../assets/item-ctrl/data08.png) no-repeat #061537;background-size:cover;top:0;left:0;z-index:999}
#load .load_img{position:absolute;left:calc(50% - 182px);top:calc(50% - 182px);}
.load_img img{position:absolute;left:0;top:0;}
.load_img .jzxz1{animation:xz1 8s infinite linear;}
	@keyframes xz1 {
	  from {
	  transform:rotate(0deg);
	  }
	  50% {
	    transform:rotate(180deg);
	  }
	  to{
	  	transform:rotate(360deg);
	  }
	}	
.load_img .jzxz2{animation:xz2 7s infinite linear;}
	@keyframes xz2 {
	  from {
	  transform:rotate(0deg);
	  }
	  50% {
	    transform:rotate(-180deg);
	  }
	  to{
	  	transform:rotate(-360deg);
	  }
	}
  .load_hide{
    z-index: -1 !important;
    opacity: 0;
    -webkit-transition: all 1.3s ease-in;  
    -moz-transition: all 1.3s ease-in;  
    transition: all 1.3s ease-in;  
  }
</style>
