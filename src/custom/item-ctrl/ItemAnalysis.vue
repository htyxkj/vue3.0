<template>
  <div>
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
          <div class="">
            <div class="panel">
              <div class="filter">
                <a data-id="1" data-type="leftTopTabs1" href="javascript:;" :class="leftTopTabs1 == 1 ? 'active' : ''" @click="aClick">营业收入</a>
                <a data-id="2" data-type="leftTopTabs1" href="javascript:;" :class="leftTopTabs1 == 2 ? 'active' : ''" @click="aClick">利润</a>
                <a href="javascript:;" class="goto-list pieTitle">计划占比</a>
              </div>
              <div class="chart" id="leftTopTabsC" ref="leftTopTabsC"></div>
              <div class="panel-footer"></div>
            </div>
            <div class="panel">
              <div class="filter">
                <a data-id="1" data-type="leftCenterabs1" href="javascript:;" :class="leftCenterabs1 == 1 ? 'active' : ''" @click="aClick" >第一季度</a>
                <a data-id="2" data-type="leftCenterabs1" href="javascript:;" :class="leftCenterabs1 == 2 ? 'active' : ''" @click="aClick" >第二季度</a>
                <a data-id="3" data-type="leftCenterabs1" href="javascript:;" :class="leftCenterabs1 == 3 ? 'active' : ''" @click="aClick" >第三季度</a>
                <a data-id="4" data-type="leftCenterabs1" href="javascript:;" :class="leftCenterabs1 == 4 ? 'active' : ''" @click="aClick" >第四季度</a >
                <a href="javascript:;" class="goto-list" @click="gotoList('L')">列表</a>
              </div>
              <el-carousel
                height="3.1rem"
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
            <div class="panel bottomChart">
              <div class="filter">
                <a data-id="1" data-type="leftBottomTabs1" href="javascript:;" :class="leftBottomTabs1 == 1 ? 'active' : ''" @click="aClick" >实际利润贡献比(万元)</a>
                <a data-id="2" data-type="leftBottomTabs1" href="javascript:;" :class="leftBottomTabs1 == 2 ? 'active' : ''" @click="aClick" >实际营收贡献比(万元)</a>
              </div>
              <!-- <h2>{{ leftB1ConName }}</h2> -->
              <div class="chart" ref="leftB1Con"></div>
              <div class="panel-footer"></div>
            </div>
          </div>
        </div>
        <div class="column columnCenter">
          <div class="leftTop2">
            <el-row>
              <el-col :span="1">&nbsp;</el-col>
              <el-col :span="10">
                <div @click="centerTC1Click">
                  <el-row v-if="centerTC1Con" class="my-card" type="flex" align="middle">
                    <el-col :span="14" class="content">
                      <el-row>
                        <el-col :span="12">
                          <el-row>
                            <el-col>全年营收：</el-col>
                            <el-col> {{centerTC1Con.yjrmb}}亿</el-col>
                          </el-row>
                        </el-col>
                        <el-col :span="12">
                          <el-row>
                            <el-col>累计完成：</el-col>
                            <el-col> {{centerTC1Con.sjrmb}}亿</el-col>
                          </el-row>
                        </el-col>
                        <el-col :span="12">
                          <el-row>
                            <el-col>预计营收：</el-col>
                            <el-col> {{centerTC1Con.curr_yjrmb}}亿</el-col>
                          </el-row>
                        </el-col>
                        <el-col :span="12">
                          <el-row>
                            <el-col>差&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;额：</el-col>
                            <el-col> {{(centerTC1Con.curr_yjrmb - centerTC1Con.sjrmb).toFixed(1)}}亿</el-col>
                          </el-row>
                        </el-col>
                      </el-row>
                    </el-col>
                    <el-col :span="10" class="progress">  
                      <el-progress type="circle" :width="70" :stroke-width='4' :percentage="centerTC1Con.bl"></el-progress>
                    </el-col>
                  </el-row>
                </div>
              </el-col>
              <el-col :span="2">&nbsp;</el-col>
              <el-col :span="10">
                <div @click="centerTC2Click">
                  <el-row v-if="centerTC2Con" class="my-card" type="flex" align="middle">
                    <el-col :span="14" class="content">
                      <el-row>
                        <el-col :span="12">
                          <el-row>
                            <el-col>全年利润：</el-col>
                            <el-col> {{centerTC2Con.yjfcy}}亿</el-col>
                          </el-row>
                        </el-col>
                        <el-col :span="12">
                          <el-row>
                            <el-col>累计完成：</el-col>
                            <el-col> {{centerTC2Con.sjfcy}}亿</el-col>
                          </el-row>
                        </el-col>
                        <el-col :span="12">
                          <el-row>
                            <el-col>预计利润：</el-col>
                            <el-col> {{centerTC2Con.curr_yjfcy}}亿</el-col>
                          </el-row>
                        </el-col>
                        <el-col :span="12">
                          <el-row>
                            <el-col>差&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;额：</el-col>
                            <el-col> {{(centerTC2Con.curr_yjfcy - centerTC2Con.sjfcy).toFixed(1)}}亿</el-col>
                          </el-row>
                        </el-col>
                      </el-row>
                    </el-col>
                    <el-col :span="10" class="progress">
                      <el-progress type="circle" :width="70"  :stroke-width='4' :percentage="centerTC2Con.bl"></el-progress>
                    </el-col>
                  </el-row>
                </div>
              </el-col>
            </el-row>
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
          <div>
            <div class="panel">
              <div class="filter">
                <a data-id="1" data-type="rightTopTabs1" href="javascript:;" :class="rightTopTabs1 == 1 ? 'active' : ''" @click="aClick">营业收入</a>
                <a data-id="2" data-type="rightTopTabs1" href="javascript:;" :class="rightTopTabs1 == 2 ? 'active' : ''" @click="aClick">利润</a>
                <a href="javascript:;" class="goto-list pieTitle">计划占比</a>
              </div>
              <div class="chart" id="rightTopTabsC" ref="rightTopTabsC"></div>
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
                height="3.1rem"
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
            <div class="panel bottomChart">
              <div class="filter">
                <a data-id="1" data-type="rightBottomTabs1" href="javascript:;" :class="rightBottomTabs1 == 1 ? 'active' : ''" @click="aClick" >月度营收对比分析</a>
                <a data-id="2" data-type="rightBottomTabs1" href="javascript:;" :class="rightBottomTabs1 == 2 ? 'active' : ''" @click="aClick" >月度利润对比分析</a>
              </div>
              <!-- <h2>{{ rightB1ConName }}</h2> -->
              <div class="chart" ref="rightB1Con"></div>
              <div class="panel-footer"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div style="display:flex;">
      <!--左侧弹出框--->
      <template v-if="leftTopTabs1Chart">
        <div class="filterbg"></div>
        <div class="popup" :style="leftTopTabs1Chart ? 'width: 82%;height: 76%;' : ''" >
          <a
            href="javascript:;"
            class="popupClose"
            @click="leftTopTabs1Chart = false"
          ></a>
          <el-row style="color: #f7f8fe; text-align: center"
            ><h3>
              {{ popItemLeft1.name }}-各个板块-
              {{ leftTopTabs1 == 1 ? "营业收入" : "利润" }}占比&nbsp;&nbsp;&nbsp;&nbsp;
              总金额：{{ popItemLeft1.value }} （亿）
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
              {{ rightTopTabs1 == 1 ? "营业收入" : "利润" }}对比&nbsp;&nbsp;&nbsp;&nbsp;
              总金额：{{ popItemRight1.value }} （亿）
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
          <el-row style="height:90%" class="dlgTable">
            <vxe-table height="auto" size="mini" resizable border show-header-overflow show-overflow 
            :footer-method="footerMethod" show-footer header-row-class-name="itemAnalysisTableHeader" footer-row-class-name="itemAnalysisTableHeader"
            :row-class-name="itemAnalysisTableRowClass" border="none" class="itemAnalyTable" style="font-size:14px"
            highlight-hover-row :data="carouselTableData">
              <vxe-table-column align="center" type="seq" title="序号" width="60"></vxe-table-column>
              <vxe-table-column align="center" min-width="76" v-if="carouselTableType == 'L'" field="orgnamexa" title="区域公司"></vxe-table-column>
              <vxe-table-column align="center" min-width="76" v-if="carouselTableType == 'R'"  field="name" title="业务板块"></vxe-table-column>
              <vxe-table-column align="center" field="yjrmb" title="计划营收(亿)" min-width="100"></vxe-table-column>
              <vxe-table-column align="center" field="sjrmb" title="实际营收(亿)" min-width="100"></vxe-table-column>
              <vxe-table-column align="center" field="rmbbl" title="完成比例" min-width="75">
                <template v-slot="{row}">
                  {{(row.rmbbl*1).toFixed(2)+'%'}}
                </template>
              </vxe-table-column>
              <vxe-table-column align="center" field="pm1" title="排名" min-width="43"></vxe-table-column>
              <vxe-table-column align="center" field="yjfcy" title="利润总额(亿)" min-width="100"></vxe-table-column>
              <vxe-table-column align="center" field="sjfcy" title="实际完成(亿)" min-width="100"></vxe-table-column>
              <vxe-table-column align="center" field="fcybl" title="完成比例" min-width="76">
                <template v-slot="{ row }">
                  {{(row.fcybl*1).toFixed(2)+'%'}}
                </template>
              </vxe-table-column>
              <vxe-table-column align="center" field="pm2" title="排名" min-width="43"></vxe-table-column>
            </vxe-table>
          </el-row>
        </div>
      </template>
    </div>
  </div>
</template>
<script lang="ts">
import echarts from "echarts";
import "echarts/map/js/china";
import "echarts-liquidfill";
import 'echarts-gl';
// 引入highCharts模块
import HighCharts from 'highcharts';
import HighCharts3d from 'highcharts/highcharts-3d';
HighCharts3d(HighCharts);

import { Component, Vue } from "vue-property-decorator";
import { Mutation } from "vuex-class";
import QueryEntity from "@/classes/search/QueryEntity";
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi;
import CardInfo from "@/custom/item-ctrl/components/CardInfo.vue";
let _ = require("lodash");
import { ChartConfig } from "./ts/chart";
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
  leftBottomTabs1:any=1;
  leftB1Con: any = null;
  leftB2Con: any = null;
  leftB1C1: any = null;
  leftB1ConName: any = "";
  /************** 右下图表 *****************/
  rightBottomTabs1:any=1;
  rightB1Con: any = null;
  rightB2Con: any = null;
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
    //左侧下方柱状图
    this.initleftBottom1();
    //右侧下方面积图
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
        let c1 = { name: vl.name, y: parseFloat(vl.rmb), scm: vl.scm,value:vl.rmb};
        let c2 = { name: vl.name, y: parseFloat(vl.fcy), scm: vl.scm,value:vl.fcy };
        this.leftT1C1Con.series[0].data.push(c1);
        this.leftT1C2Con.series[0].data.push(c2);
      }
    }
    
    this.leftT1C1Con.series[0].point.events.click = this.chartClickLeft1Function;
    this.leftT1C2Con.series[0].point.events.click = this.chartClickLeft1Function;
    HighCharts.chart('leftTopTabsC',this.leftT1C1Con);
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
     let point = param.point
    let data ={scm:point.scm,name:point.name,value:parseFloat(point.value).toFixed(2)};
    let name = param.name;
    this.popItemLeft1 = data;
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
      let option = ChartConfig.Config.getPictorialBar();
      let k = "summaryPie" + ( 1);
          let _r:any = this.$refs[k];
          let summaryPie: any = echarts.init(
            _r[0] as HTMLCanvasElement
          );
      _.forEach(vrs, (item: any, index: any) => {
          let value = (this.leftTopTabs1==1?item.rmb/item.totalrmb:item.fcy/item.totalfcy)*100;
          value = parseFloat(value.toFixed(2));
          option.xAxis.data.push(item.title);
          let fcy = (this.leftTopTabs1==1?item.rmb:item.fcy).toFixed(2);
          let msg = item.title+"<br/>金额："+ fcy +"（亿）<br/>占比："+value+"%<br/>";
          let vl = {value:value,message:msg,fcy:fcy}
          option.series[0].data.push(vl);
      });
      summaryPie.setOption(option);
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
        let c1 = { name: vl.name, y: parseFloat(vl.rmb),myid:vl.id,value:vl.rmb};
        let c2 = { name: vl.name, y: parseFloat(vl.fcy),myid:vl.id,value:vl.fcy};
        this.rightT1C1Con.series[0].data.push(c1);
        this.rightT1C2Con.series[0].data.push(c2);
      }
    }
    this.rightT1C1Con.series[0].point.events.click = this.chartClickRight1Function;
    this.rightT1C2Con.series[0].point.events.click = this.chartClickRight1Function;
    HighCharts.chart('rightTopTabsC',this.rightT1C1Con);
  }

  async chartClickRight1Function(param: any){
    let point = param.point
    let data ={id:point.myid,name:point.name,value:parseFloat(point.value).toFixed(2)};
    this.popItemRight1 = data
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
        let option:any = ChartConfig.Config.getColumn();
        option.color= ["#14C4F0"],
        option.grid= {
            left: "10%",
            top: "20px",
            right: "20%",
            bottom: "4%",
            containLabel: true,
        }
        option.series[0]. label={
          show: true,
          position: 'top'
        }
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
      this.centerTC1Con = {yjrmb:values.yjrmb,sjrmb:values.sjrmb,bl:parseInt((values.sjrmb/values.yjrmb*100).toFixed(0)),curr_yjrmb:values.curr_yjrmb}
      this.centerTC2Con = {yjfcy:values.yjfcy,sjfcy:values.sjfcy,bl:parseInt((values.sjfcy/values.yjfcy*100).toFixed(0)),curr_yjfcy:values.curr_yjfcy}
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
    let qe: QueryEntity = new QueryEntity("", "");
    qe.page.currPage = 1;
    qe.page.pageSize = 500;
    let ins:any = await tools.getBipInsAidInfo("BOARD_M2", 200, qe);
    if(ins.data.id >=0){
            ins = ins.data.data.data
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
          let d1 = { name: name, value: addr,message:tipHtml,itemStyle:{color:"#fff"}}//this.mapCon.color[i]
          this.mapCon.series[1].data.push(d1);
          if(name=="哈尔滨"){
            this.mapCon.series[0].data[0].message = tipHtml;
          }else if(name =="沈阳"){
            for(var z=1;z<=3;z++){
              this.mapCon.series[0].data[z].message = tipHtml;
            }
          }else if(name =="北京"){
            for(var z=4;z<=7;z++){
              this.mapCon.series[0].data[z].message = tipHtml;
            }
          }else if(name =="济南"){
            for(var z=8;z<=10;z++){
              this.mapCon.series[0].data[z].message = tipHtml;
            }
          }else if(name == "南京"){
            for(var z=11;z<=12;z++){
              this.mapCon.series[0].data[z].message = tipHtml;
            }
          }else if(name == "杭州"){
            for(var z=13;z<=16;z++){
              this.mapCon.series[0].data[z].message = tipHtml;
            }
          }else if(name == "广州"){
            for(var z=17;z<=19;z++){
              this.mapCon.series[0].data[z].message = tipHtml;
            }
          }else if(name =="昆明"){
            for(var z=20;z<=22;z++){
              this.mapCon.series[0].data[z].message = tipHtml;
            }
          }else if(name=="武汉"){
            for(var z=23;z<=24;z++){
              this.mapCon.series[0].data[z].message = tipHtml;
            }
          }else if(name=="乌鲁木齐"){
            for(var z=25;z<=25;z++){
              this.mapCon.series[0].data[z].message = tipHtml;
            }
          }else if(name =="成都"){
            for(var z=26;z<=29;z++){
              this.mapCon.series[0].data[z].message = tipHtml;
            }
          }
        }
      }
    }
    // 绘制图表
    this.map.setOption(this.mapCon);
    let _this = this;
    this.map.on("mouseover", function (){
      _this.map.dispatchAction({
        type: 'downplay'
      });
    });
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
   * 左下柱状图
   */
  async initleftBottom1(){
    let qe: QueryEntity = new QueryEntity("", "");
    qe.page.currPage = 1;
    qe.page.pageSize = 500;
    let ins: any = await tools.getBipInsAidInfo("BOARD_R3", 200, qe);
    if (ins.data.id >= 0) {
      ins = ins.data.data.data;
      this.leftB1ConName = ins.title;
      let cc = await tools.getBipInsAidInfo("BOARD_R3", 210, qe);
      if (cc.data.id == 0) {
        let values = cc.data.data.data.values;
        for (var i = 0; i < values.length; i++) {
          let vl = values[i];
          this.leftB1Con.xAxis[0].data.push(vl.name);
          this.leftB1Con.series[0].data.push(vl.lrbl);
          this.leftB2Con.xAxis[0].data.push(vl.name);
          this.leftB2Con.series[0].data.push(vl.ysbl);
        }
      }
      // 基于准备好的dom，初始化echarts实例
      this.leftB1C1 = echarts.init(this.$refs.leftB1Con as HTMLCanvasElement);
      // 绘制图表
      this.leftB1C1.setOption(this.leftB1Con);
    }
  }


  /**
   * 右下面积图
   */
  async initRightBottom1() {
    let qe: QueryEntity = new QueryEntity("", "");
    qe.page.currPage = 1;
    qe.page.pageSize = 500;
    let ins:any = await tools.getBipInsAidInfo("BOARD_L3", 200, qe);
    if(ins.data.id >=0){
      ins = ins.data.data.data
      this.rightB1ConName = ins.title;
      let labers = ins.labers;
      let showColsIndex = ins.showColsIndex;
      for(var i=1;i<3;i++){
          let dd = { name: labers[i], type: 'line', smooth: true,stack: labers[i], areaStyle: {opacity:0.6,}, emphasis: { focus: 'series' },data: [] }
          this.rightB1Con.series.push(dd)
          let lb1 = {
            name: labers[i],
            textStyle: {
              color: '#ffffff'
            }
          }
          this.rightB1Con.legend.data.push(lb1)
      }
      for(var i=3;i<labers.length;i++){
          let dd = { name: labers[i], type: 'line', smooth: true,stack: labers[i], areaStyle: {opacity:0.6,}, emphasis: { focus: 'series' },data: [] }
          this.rightB2Con.series.push(dd)
          let lb1 = {
            name: labers[i],
            textStyle: {
              color: '#ffffff'
            }
          }
          this.rightB2Con.legend.data.push(lb1)
      }
      let cc = await tools.getBipInsAidInfo("BOARD_L3", 210, qe);
      if (cc.data.id == 0) {
        let values = cc.data.data.data.values;
        for (var i = 0; i < values.length; i++) {
          let vl = values[i];
          this.rightB1Con.xAxis[0].data.push(vl.iym);
          this.rightB2Con.xAxis[0].data.push(vl.iym);
          this.rightB1Con.series[0].data.push(vl.yjrmb);
          this.rightB1Con.series[1].data.push(vl.sjrmb);
          this.rightB2Con.series[0].data.push(vl.yjfcy);
          this.rightB2Con.series[1].data.push(vl.sjfcy);
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
        HighCharts.chart('leftTopTabsC',this.leftT1C1Con);
      } else {
        HighCharts.chart('leftTopTabsC',this.leftT1C2Con);
      }
    } else if (type == "leftCenterabs1") {
      this.leftCenterabs1 = e.currentTarget.dataset.id;
    } else if (type == "rightTopTabs1") {
      this.rightTopTabs1 = e.currentTarget.dataset.id;
      if (this.rightTopTabs1 == 1) {
        HighCharts.chart('rightTopTabsC',this.rightT1C1Con);
      } else {
        HighCharts.chart('rightTopTabsC',this.rightT1C2Con);
      }
    } else if (type == "rightCenterabs1") {
      this.rightCenterabs1 = e.currentTarget.dataset.id;
    }else if(type == "rightBottomTabs1"){
      this.rightBottomTabs1 = e.currentTarget.dataset.id;
      if (this.rightBottomTabs1 == 1) {
        this.rightB1C1.setOption(this.rightB1Con);
      } else {
        this.rightB1C1.setOption(this.rightB2Con);
      }
    }else if(type =='leftBottomTabs1'){
      this.leftBottomTabs1 = e.currentTarget.dataset.id;
      if (this.leftBottomTabs1 == 1) {
        this.leftB1C1.setOption(this.leftB1Con);
      } else {
        this.leftB1C1.setOption(this.leftB2Con);
      }
    }
  }
  initConfig() { 
    this.leftT1C1Con = ChartConfig.Config.getPie3D();
    this.leftT1C2Con = ChartConfig.Config.getPie3D();
    this.rightT1C1Con = ChartConfig.Config.getPie3D();
    this.rightT1C2Con = ChartConfig.Config.getPie3D(); 
    this.rightB1Con = ChartConfig.Config.getArea();
    this.rightB2Con = ChartConfig.Config.getArea();
    this.leftB1Con = ChartConfig.Config.getColumn();
    this.leftB2Con = ChartConfig.Config.getColumn();
    this.mapCon= ChartConfig.Config.getMap();
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
  itemAnalysisTableRowClass(column:any){
    if(column.$rowIndex%2 ==0){
      return "itemAnalysisTableRow1";
    }else{
      return "itemAnalysisTableRow2";
    }
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
  background: url(../../assets/item-ctrl/images/bg.png) no-repeat;
  overflow-y: auto;
  height: 100%;
  position: absolute;
  width: 100%;
  background-size: 100% 100%;
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
    height: 3.28rem;
    border: 1px solid rgba(25, 186, 139, 0.17);
    background: url(../../assets/bip-erp/image/line.png);
    background-color: #111d40d7;
    padding: 0 0.1875rem 0.5rem;
    margin-bottom: 0.1875rem;
    width: 90%;
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
  height: 1.5rem !important;
  padding-bottom: 0.5rem;
  width: 100%;
  font-size: 15px;
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
  color: #fff;
  border-right: 0.033rem solid #fff;
}
.filter a:first-child {
  padding-left: 0;
}
.filter a:last-child {
  border-right: none;
}
.filter a.active {
  color: #00f2f1;
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

.my-card{
  cursor:pointer;
  background-color: #101C43;
  padding: 10px 5px 5px 5px;
  .progress{
    text-align: center;
  }
  .content{
    text-align: start;
    color: #fff;
  }
}

/**弹出层*/
.filterbg {
  width: 100%;
  height: 100%;
  // background: rgba(30, 182, 254, 0.5);
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
  background: #0E2C8B;
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
  // height: 100%;
  float: left;
  width: 100%;
  // width: 200px;
  height: 400px;
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
  .pieTitle{
    color: rgb(85, 153, 255) !important;
    font-weight: bold;
    text-align: center;
    font-size: 17px;
    right: 12px !important;
  }
</style>
<style lang="scss">
  .itemAnalysisTableHeader{
    color: white;
    background-color: #082173;
    .vxe-resizable{
      display: none;
    }
  }
  .itemAnalysisTableRow1{
    color: white;
    background-color: #0E2C8B !important;
  }
  .itemAnalysisTableRow2{
    color: white;
    background-color: #08257E !important;
  }
  .itemAnalyTable{
    width:90%;
    margin: auto;
    margin-top:0.5rem;
    .vxe-table--footer-wrapper{
      border:0px solid;
    }
  }
  .panel {
    .el-carousel__arrow{
      background-color: rgba(23,116,222,.8);
    }
  }
</style>