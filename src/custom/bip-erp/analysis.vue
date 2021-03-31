<template>
  <div class="analysis">
    <div class="header">
      <h1>搅拌站数据可视化分析</h1>
      <div class="showTime">{{ showtime }}</div>
    </div>
    <!-- 页面主体部分 -->
    <div class="mainbox">
      <div class="column">
        <div class="panel bar">
          <h2>本月产量对比</h2>
          <div class="chart"></div>
          <div class="panel-footer"></div>
        </div>
        <div class="panel line">
          <h2>
            本年产量趋势
            <!-- <a href="javaScript:;">2019</a>
						<a href="javaScript:;">2020</a> -->
          </h2>
          <div class="chart"></div>
          <div class="panel-footer"></div>
        </div>
        <div class="panel pie">
          <h2>年度砼型号销售占比</h2>
          <div class="chart"></div>
          <div class="panel-footer"></div>
        </div>
      </div>
      <div class="column">
        <!-- 数字模块 -->
        <div class="no">
          <div class="no-hd">
            <ul>
              <li>{{ skfcy }}</li>
              <li>{{ fkfcy }}</li>
              <li>{{ yefcy }}</li>
            </ul>
          </div>
          <div class="no-bd">
            <ul>
              <li>本年度回款(万元)</li>
              <li>本年度付款(万元)</li>
              <li>账户余额(万元)</li>
            </ul>
          </div>
        </div>
        <!-- 地图模块 -->
        <div class="map">
          <div class="chart"></div>
          <div class="map1"></div>
          <div class="map2"></div>
          <div class="map3"></div>
        </div>
      </div>
      <div class="column">
        <div class="panel pie1">
          <h2>年度费用支出对比</h2>
          <div class="chart"></div>
          <div class="panel-footer"></div>
        </div>
        <div class="panel bar1">
          <h2>年度应收账款</h2>
          <div class="chart "></div>
          <div class="panel-footer"></div>
        </div>
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
import { Component, Vue, Provide, Watch } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from "vuex-class";
import { User } from "@/classes/User";
import CDataSet from "@/classes/pub/CDataSet";
import { Cells } from "@/classes/pub/coob/Cells";
import QueryEntity from "@/classes/search/QueryEntity";
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi;
@Component({
  components: {},
})
export default class followTimesLine extends Vue {
  @Mutation("snkey", { namespace: "login" }) setSnkey: any;
  @Mutation("user", { namespace: "login" }) setUserInfo: any;
  @Mutation("menulist", { namespace: "login" }) setMenusInfo: any;
  @Provide() page: any = { pageSize: 2000, currPage: 1, total: 0 };
  @Provide() record: Array<any> = [];
  @Provide() tableData: Array<any> = [];
  @Provide() myDesktop: CDataSet = new CDataSet("");
  @Provide() popData: Array<any> = [];
  @Provide() cdic: String = "KH19090006";
  @Provide() showtime: String = "";
  @Provide() t: any = "";
  @Provide() skfcy: Number = 0;
  @Provide() fkfcy: Number = 0;
  @Provide() yefcy: Number = 0;
  mounted() {
    this.initPortal();
    this.time();
    this.echartsMap();
  }
  // 模拟账户登录
  async initPortal() {
    const loading = this.$loading({
      lock: true,
      text: "加载中",
      spinner: "el-icon-loading",
      background: "background:'rgba(0, 0, 0, 0.7)'",
    });
    let res = await tools.loginWithOutPwd("portal");
    let data = res.data;
    if (data.id === 0) {
      let userI = data.data.user;
      let snkey = data.data.snkey;
      userI.password = "";
      this.setSnkey(snkey);
      this.setUserInfo(userI);
      let ms = data.data.menulist;
      this.setMenusInfo(ms);
      loading.close();
      this.timeReqData();
    }
  }
  // 定时器执行获取当前时间
  time() {
    clearTimeout(this.t); //清除定时器
    let dt = new Date();
    let y = dt.getFullYear();
    let mt = dt.getMonth() + 1;
    let day = dt.getDate();
    let h = dt.getHours(); //获取时
    let m = dt.getMinutes(); //获取分
    let s = dt.getSeconds(); //获取秒
    this.showtime =
      y + "年" + mt + "月" + day + "-" + h + "时" + m + "分" + s + "秒";
    this.t = setTimeout(this.time, 1000); //设定定时器，循环运行
  }
  // 间隔半小时获取后台数据一次
  timeReqData() {
    let t;
    clearTimeout(t);
    this.reqOutputMonth();
    this.reqProYear();
    this.reqCaptYear();
    this.reqCosttYear();
    this.reqBilltYear();
    this.reqYieldMonth();
    t = setTimeout(this.timeReqData, 1000 * 60 * 30); //设定定时器，循环运行
  }
  // ------------------------数据请求-----------------
  // 1.本月产量对比
  async reqOutputMonth() {
    let qe: QueryEntity = new QueryEntity("", "");
    qe.page.currPage = this.page.currPage;
    qe.page.pageSize = this.page.pageSize;
    // let cont = "~" + "cbm  = " + "'" + this.cdic + "'";
    // qe.cont = cont;
    let cc = await tools.getBipInsAidInfo("OUTPUTMONTH", 210, qe);
    if (cc.data.id === 0) {
      let res = cc.data.data.data.values;
      let xAxisdata = new Array();
      let yAxisdata = new Array();
      for (let item = 0; item < res.length; item++) {
        xAxisdata.push(res[item].name);
        yAxisdata.push(res[item].qty);
      }
      this.echartsBar(xAxisdata, yAxisdata);
    }
  }
  // 2.本年度砼型号销量占比
  async reqProYear() {
    let qe: QueryEntity = new QueryEntity("", "");
    qe.page.currPage = this.page.currPage;
    qe.page.pageSize = this.page.pageSize;
    let cc = await tools.getBipInsAidInfo("PROYEAR", 210, qe);
    if (cc.data.id === 0) {
      let res = cc.data.data.data.values;
      this.echartsPie(res);
    }
  }
  // 3.本年度资金情况
  async reqCaptYear() {
    let qe: QueryEntity = new QueryEntity("", "");
    qe.page.currPage = 1;
    qe.page.pageSize = 1;
    let cc = await tools.getBipInsAidInfo("CaptYear", 210, qe);
    if (cc.data.id === 0) {
      let res = cc.data.data.data.values;
      this.skfcy = res[0].skfcy;
      this.fkfcy = res[0].fkfcy;
      this.yefcy = res[0].yefcy;
    }
  }
  // 4.本年度各个公司费用占比
  async reqCosttYear() {
    let qe: QueryEntity = new QueryEntity("", "");
    qe.page.currPage = this.page.currPage;
    qe.page.pageSize = this.page.pageSize;
    let cc = await tools.getBipInsAidInfo("CostYear", 210, qe);
    if (cc.data.id === 0) {
      let res = cc.data.data.data.values;
      this.echartsPie1(res);
    }
  }
  // 5.本年度每个月产量趋势分析
  async reqYieldMonth() {
    // 获取对应有几个公司
    let qe1: QueryEntity = new QueryEntity("", "");
    qe1.page.currPage = this.page.currPage;
    qe1.page.pageSize = this.page.pageSize;
    let cc1 = await tools.getBipInsAidInfo("YIELDMONSCM", 210, qe1);
    var scmArray = [];
    if (cc1.data.id === 0) {
      scmArray = cc1.data.data.data.values;
    }
    // 获取公司对应每个月的产量
    let qe: QueryEntity = new QueryEntity("", "");
    qe.page.currPage = this.page.currPage;
    qe.page.pageSize = this.page.pageSize;
    let cc = await tools.getBipInsAidInfo("YIELDMONTH", 210, qe);
    if (cc.data.id === 0) {
      let res = cc.data.data.data.values;
      let qtydata = new Array();
      for (let index = 0; index < scmArray.length; index++) {
        let vot = {
          name: "",
          type: "",
          smooth: true,
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        };
        (vot.name = scmArray[index].name),
          (vot.type = "line"),
          (vot.smooth = true),
          (vot.data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        qtydata.push(vot);
      }
      for (let index = 0; index < res.length; index++) {
        for (let id = 0; id < scmArray.length; id++) {
          if (res[index].name == scmArray[id].name) {
            let scmArrayId = scmArray[id].xid;
            qtydata[scmArray[id].xid].data.splice(
              res[index].month - 1,
              res[index].month - 1,
              res[index].qty
            );
          }
        }
      }
      this.echartsLine(qtydata);
    }
  }

  // 6.本年度应收应付账款
  async reqBilltYear() {
    let qe: QueryEntity = new QueryEntity("", "");
    qe.page.currPage = this.page.currPage;
    qe.page.pageSize = this.page.pageSize;
    let cc = await tools.getBipInsAidInfo("BILLYEAR", 210, qe);
    if (cc.data.id === 0) {
      let res = cc.data.data.data.values;
      let ysxAxisdata = new Array();
      let ysyAxisdata = new Array();
      let yfxAxisdata = new Array();
      let yfyAxisdata = new Array();
      for (let index = 0; index < res.length; index++) {
        if (res[index].arpid == 2) {
          ysxAxisdata.push(res[index].name);
          ysyAxisdata.push(res[index].fcy);
        } else {
          yfxAxisdata.push(res[index].name);
          yfyAxisdata.push(res[index].fcy);
        }
      }
      this.echartsBar1(ysxAxisdata, ysyAxisdata);
      this.echartsBar2(yfxAxisdata, yfyAxisdata);
    }
  }

  async getCell(cellid: string) {
    let res = await tools.getCCellsParams(cellid);
    let rtn: any = res.data;
    if (rtn.id == 0) {
      let kn: Array<Cells> = rtn.data.layCels;
      let cells = kn;
      return new CDataSet(cells[0]);
    } else {
      return new CDataSet("");
    }
  }
  // 绘制左侧第一个柱状图
  echartsBar(xAxisdata: any, yAxisdata: any) {
    // 实例化对象
    let myChart = echarts.init(
      document.querySelector(".bar .chart") as HTMLCanvasElement
    );
    // 指定配置和数据
    let option:any = {
      color: ["#2f89cf"],
      tooltip: {
        trigger: "axis",
        axisPointer: {
          // 坐标轴指示器，坐标轴触发有效
          type: "shadow", // 默认为直线，可选为：'line' | 'shadow'
        },
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
          type: "category",
          data: xAxisdata,
          axisTick: {
            alignWithLabel: true,
          },
          /* 修改X轴刻度标签 */
          axisLabel: {
            color: "rgba(255,255,255,.6)",
            fontSize: "10",
          },
          //  x轴样式不显示
          axisLine: {
            show: false,
            // 如果想要设置单独的线条样式
            // lineStyle: {
            //    color: "rgba(255,255,255,.1)",
            //    width: 1,
            //    type: "solid"
          },
        },
      ],
      yAxis: [
        {
          type: "value",
          // y 轴文字标签样式
          axisLabel: {
            color: "rgba(255,255,255,.6)",
            fontSize: "12",
          },
          // y轴线条样式
          axisLine: {
            lineStyle: {
              color: "rgba(255,255,255,.1)",
              // width: 1,
              // type: "solid"
            },
          },
          // y 轴分隔线样式
          splitLine: {
            lineStyle: {
              color: "rgba(255,255,255,.1)",
            },
          },
        },
      ],
      series: [
        {
          name: "本月产量",
          type: "bar",
          barWidth: "35%",
          data: yAxisdata,
          itemStyle: {
            // 修改柱子圆角
            barBorderRadius: 5,
          },
        },
      ],
    };
    // 把配置项给到实例对象
    myChart.setOption(option);

    /* 设置图表随屏幕自适应 */
    window.addEventListener("resize", function() {
      myChart.resize();
    });
  }
  // 绘制左侧折线图(年度产量对比)
  echartsLine(qtydata: any) {
    let myChart = echarts.init(
      document.querySelector(".line .chart") as HTMLCanvasElement
    );
    // 2.指定配置
    var option:any = {
      // 通过这个color修改两条线的颜色
      color: ["#065aab", "#1089E7", "#F57474", "#56D0E3", "#F8B448", "#8B78F6"],
      tooltip: {
        trigger: "axis",
      },
      legend: {
        // 如果series 对象有name 值，则 legend可以不用写data
        // 修改图例组件 文字颜色
        textStyle: {
          color: "#4c9bfd",
        },
        // 这个10% 必须加引号
        right: "10%",
      },
      grid: {
        top: "20%",
        left: "3%",
        right: "4%",
        bottom: "3%",
        show: true, // 显示边框
        borderColor: "#012f4a", // 边框颜色
        containLabel: true, // 包含刻度文字在内
      },

      xAxis: {
        type: "category",
        boundaryGap: false,
        data: [
          "1月",
          "2月",
          "3月",
          "4月",
          "5月",
          "6月",
          "7月",
          "8月",
          "9月",
          "10月",
          "11月",
          "12月",
        ],
        axisTick: {
          show: false, // 去除刻度线
        },
        axisLabel: {
          color: "#4c9bfd", // 文本颜色
        },
        axisLine: {
          show: false, // 去除轴线
        },
      },
      yAxis: {
        type: "value",
        axisTick: {
          show: false, // 去除刻度线
        },
        axisLabel: {
          color: "#4c9bfd", // 文本颜色
        },
        axisLine: {
          show: false, // 去除轴线
        },
        splitLine: {
          lineStyle: {
            color: "#012f4a", // 分割线颜色
          },
        },
      },
      series: qtydata,
    };
    myChart.setOption(option);

    /* 设置图表随屏幕自适应 */
    window.addEventListener("resize", function() {
      myChart.resize();
    });
  }
  // 绘制左侧最后一个饼状图
  echartsPie(res: any) {
    let myChart = echarts.init(
      document.querySelector(".pie .chart") as HTMLCanvasElement
    );
    let option:any = {
      tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b} : {c} ({d}%)",
      },
      color: ["#065aab", "#1089E7", "#F57474", "#56D0E3", "#F8B448", "#8B78F6"],
      series: [
        {
          name: "砼型号",
          type: "pie",
          radius: "70%",
          center: ["50%", "50%"],
          data: res,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        },
      ],
    };

    myChart.setOption(option);
    /* 设置图表随屏幕自适应 */
    window.addEventListener("resize", function() {
      myChart.resize();
    });
  }

  // 绘制右侧第一个饼状图
  echartsPie1(res: any) {
    let myChart = echarts.init(
      document.querySelector(".pie1 .chart") as HTMLCanvasElement
    );
    var option:any = {
      legend: {
        top: "90%",
        itemWidth: 10,
        itemHeight: 10,
        textStyle: {
          color: "rgba(255,255,255,.5)",
          fontSize: "12",
        },
      },
      tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b} : {c}(万元) ({d}%)",
      },
      // 注意颜色写的位置
      color: [
        "#006cff",
        "#60cda0",
        "#ed8884",
        "#ff9f7f",
        "#0096ff",
        "#9fe6b8",
        "#32c5e9",
        "#1d9dff",
      ],
      series: [
        {
          name: "费用占比",
          type: "pie",
          // 如果radius是百分比则必须加引号
          radius: ["10%", "70%"],
          center: ["50%", "42%"],
          roseType: "radius",
          data: res,
          // 修饰饼形图文字相关的样式 label对象
          label: {
            fontSize: 10,
          },
          // 修饰引导线样式
          labelLine: {
            // 连接到图形的线长度
            length: 10,
            // 连接到文字的线长度
            length2: 10,
          },
        },
      ],
    };
    myChart.setOption(option);
    /* 设置图表随屏幕自适应 */
    window.addEventListener("resize", function() {
      myChart.resize();
    });
  }

  // 绘制右侧第一个柱状图(本年度应收账款)
  echartsBar1(xAxisdata: any, yAxisdata: any) {
    // 实例化对象
    let myChart = echarts.init(
      document.querySelector(".bar1 .chart") as HTMLCanvasElement
    );
    // 指定配置和数据
    let option:any= {
      color: ["#2f89cf"],
      tooltip: {
        trigger: "axis",
        axisPointer: {
          // 坐标轴指示器，坐标轴触发有效
          type: "shadow", // 默认为直线，可选为：'line' | 'shadow'
        },
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
          type: "category",
          data: xAxisdata,
          axisTick: {
            alignWithLabel: true,
          },
          /* 修改X轴刻度标签 */
          axisLabel: {
            color: "rgba(255,255,255,.6)",
            fontSize: "10",
          },
          //  x轴样式不显示
          axisLine: {
            show: false,
            // 如果想要设置单独的线条样式
            // lineStyle: {
            //    color: "rgba(255,255,255,.1)",
            //    width: 1,
            //    type: "solid"
          },
        },
      ],
      yAxis: [
        {
          type: "value",
          // y 轴文字标签样式
          axisLabel: {
            color: "rgba(255,255,255,.6)",
            fontSize: "12",
          },
          // y轴线条样式
          axisLine: {
            lineStyle: {
              color: "rgba(255,255,255,.1)",
              // width: 1,
              // type: "solid"
            },
          },
          // y 轴分隔线样式
          splitLine: {
            lineStyle: {
              color: "rgba(255,255,255,.1)",
            },
          },
        },
      ],
      series: [
        {
          name: "应收账款(万元)",
          type: "bar",
          barWidth: "35%",
          data: yAxisdata,
          itemStyle: {
            // 修改柱子圆角
            barBorderRadius: 5,
          },
        },
      ],
    };
    // 把配置项给到实例对象
    myChart.setOption(option);

    /* 设置图表随屏幕自适应 */
    window.addEventListener("resize", function() {
      myChart.resize();
    });
  }

  // 绘制右侧第一个柱状图(本年度应付账款)
  echartsBar2(xAxisdata: any, yAxisdata: any) {
    // 实例化对象
    let myChart = echarts.init(
      document.querySelector(".bar2 .chart") as HTMLCanvasElement
    );
    // 指定配置和数据
    let option:any = {
      color: ["#2f89cf"],
      tooltip: {
        trigger: "axis",
        axisPointer: {
          // 坐标轴指示器，坐标轴触发有效
          type: "shadow", // 默认为直线，可选为：'line' | 'shadow'
        },
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
          type: "category",
          data: xAxisdata,
          axisTick: {
            alignWithLabel: true,
          },
          /* 修改X轴刻度标签 */
          axisLabel: {
            color: "rgba(255,255,255,.6)",
            fontSize: "10",
          },
          //  x轴样式不显示
          axisLine: {
            show: false,
            // 如果想要设置单独的线条样式
            // lineStyle: {
            //    color: "rgba(255,255,255,.1)",
            //    width: 1,
            //    type: "solid"
          },
        },
      ],
      yAxis: [
        {
          type: "value",
          // y 轴文字标签样式
          axisLabel: {
            color: "rgba(255,255,255,.6)",
            fontSize: "12",
          },
          // y轴线条样式
          axisLine: {
            lineStyle: {
              color: "rgba(255,255,255,.1)",
              // width: 1,
              // type: "solid"
            },
          },
          // y 轴分隔线样式
          splitLine: {
            lineStyle: {
              color: "rgba(255,255,255,.1)",
            },
          },
        },
      ],
      series: [
        {
          name: "应付账款(万元)",
          type: "bar",
          barWidth: "35%",
          data: yAxisdata,
          itemStyle: {
            // 修改柱子圆角
            barBorderRadius: 5,
          },
        },
      ],
    };
    // 把配置项给到实例对象
    myChart.setOption(option);

    /* 设置图表随屏幕自适应 */
    window.addEventListener("resize", function() {
      myChart.resize();
    });
  }
  // 绘制中部地图
  echartsMap() {
    let myChart = echarts.init(
      document.querySelector(".map .chart") as HTMLCanvasElement
    );
    // 2. 指定配置和数据
    let option:any = {
      backgroundColor: "", //背景颜色
      title: {
        text: "",
        subtext: "",
        color: "#fff",
        // sublink: 'http://www.pm25.in',
        x: "center",
      },
      //是视觉映射组件，用于进行『视觉编码』，也就是将数据映射到视觉元素（视觉通道）。
      visualMap: {
        min: 0, //最小值
        max: 10, //最大值
        calculable: false, //是否显示拖拽用的手柄（手柄能拖拽调整选中范围）。
        inRange: {
          // color: ["#fb714c", "#70b4f4", "#70e4f4", "#f09640", "#f9d9bb"], //颜色
          color: ['#467bc0','#04387b'] 
        },
        textStyle: {
          color: "#fff",
        },
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
        },
        {
          type: "scatter",
          showEffectOn: "render", //配置什么时候显示特效
          coordinateSystem: "geo", //该系列使用的坐标系
          symbolSize: 10, //标记的大小
          data: [{ name: "宜昌", value: [111.3, 30.7, 130] }],
          zlevel: 99999,
        },
      ],
    };

    // myChart.setOption(option);
    window.addEventListener("resize", function() {
      myChart.resize();
    });
    myChart.setOption(option);
    window.addEventListener("resize", function() {
      myChart.resize();
    });
  }
}
</script>
<style  lang="scss" scoped>
li {
  list-style: none;
}
.analysis {
  background: url(../../assets/bip-erp/image/bg.jpg) no-repeat top center;
  overflow-y: auto;
  height: 100%;
  position: absolute;
  width: 100%;
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
}
.header h1 {
  color: #fff;
  text-align: center;
  font-size: 0.475rem;
  line-height: 1rem;
}
.header .showTime {
  position: absolute;
  right: 0.375rem;
  top: 0;
  line-height: 0.9375rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.25rem;
}
.mainbox {
  min-width: 1024px;
  max-width: 1920px;
  margin: 0 auto;
  padding: 0.125rem 0.125rem 0;
  display: flex;
}
.mainbox .column {
  flex: 3;
}
.mainbox .column:nth-child(2) {
  flex: 5;
  margin: 0px 0.125rem 0.1875rem;
}
.mainbox .panel {
  position: relative;
  height: 3.75rem;
  border: 1px solid rgba(25, 186, 139, 0.17);
  background: url(../../assets/bip-erp/image/line.png) rgba(255, 255, 255, 0.04);
  padding: 0 0.1875rem 0.5rem;
  margin-bottom: 0.1875rem;
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
.mainbox .panel h2 {
  height: 0.6rem;
  line-height: 0.6rem;
  font-size: 0.25rem;
  font-weight: 400;
  color: #ffffff;
  text-align: center;
}
.mainbox .panel h2 a {
  margin: 0 0.1875rem;
  color: #fff;
  text-decoration: underline;
}
.mainbox .panel .chart {
  height: 3rem;
}
.mainbox .no {
  background: rgba(101, 132, 226, 0.1);
  padding: 0.1875rem;
}
.mainbox .no .no-hd {
  position: relative;
  border: 1px solid rgba(25, 186, 139, 0.17);
}
.mainbox .no .no-hd::before {
  position: absolute;
  top: 0;
  left: 0;
  content: "";
  width: 30px;
  height: 10px;
  border-top: 2px solid #02a6b5;
  border-left: 2px solid #02a6b5;
}
.mainbox .no .no-hd::after {
  position: absolute;
  bottom: 0;
  right: 0;
  content: "";
  width: 30px;
  height: 10px;
  border-bottom: 2px solid #02a6b5;
  border-right: 2px solid #02a6b5;
}
.mainbox .no .no-hd ul {
  display: flex;
}
.mainbox .no .no-hd ul li {
  position: relative;
  flex: 1;
  height: 1rem;
  line-height: 1rem;
  text-align: center;
  color: #ffeb7b;
  font-size: 0.875rem;
  padding: 0.05rem 0;
  font-family: electronicFont;
  font-weight: bold;
}
.mainbox .no .no-hd ul li:first-child::after {
  position: absolute;
  top: 25%;
  right: 0;
  content: "";
  width: 1px;
  height: 50%;
  background: rgba(255, 255, 255, 0.2);
}
.mainbox .no .no-bd ul {
  display: flex;
}
.mainbox .no .no-bd ul li {
  flex: 1;
  text-align: center;
  height: 0.5rem;
  line-height: 0.5rem;
  font-size: 0.225rem;
  color: rgba(255, 255, 255, 0.7);
  padding-top: 0.125rem;
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
  /* animation: rotate 15s linear infinite; */
  z-index: 2;
}
.map .map3 {
  width: 7.075rem;
  height: 7.075rem;
  background-image: url(../../assets/bip-erp/image/jt.png);
  animation: rotate1 10s linear infinite;
}
@keyframes rotate {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}
@keyframes rotate1 {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(-360deg);
  }
}
</style>
