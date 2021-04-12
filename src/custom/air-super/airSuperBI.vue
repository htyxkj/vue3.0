<template>
  <div class="analysis">
    <div class="header">
      <h1>飞防数据可视化分析</h1>
      <div class="showTime">{{ showtime }}</div>
      <!-- <template v-if="isFormalLogin">
        <div class="homeBtn"><el-button type="text" class="btn" @click="gaotoPage">业务系统</el-button></div>
      </template> -->
    </div>
    <!-- 页面主体部分 -->
    <div class="mainbox">
      <div class="column">
        <div class="panel bar">
          <h2>
            <el-select :popper-append-to-body="false" size="mini" v-model="year"
              placeholder="请选择" class="select-style" popper-class="select-popper" @change="dataChange">
              <el-option v-for="item in yearArray" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
            <el-select :popper-append-to-body="false" size="mini" v-model="season"
              placeholder="请选择" class="select-style" popper-class="select-popper" @change="dataChange">
              <el-option v-for="item in seasonArray" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
            计划防治完成比例
          </h2>
          <div class="chart"></div>
          <div class="panel-footer"></div>
        </div>
        <div class="panel airbar">
          <h2>实际完成架次对比</h2>
          <div class="chart"></div>
          <div class="panel-footer"></div>
        </div>
        <div class="panel airbar1">
          <h2>年平均用药量对比</h2>
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
              <li>本年总架次</li>
              <li>本年总用药量</li>
              <li>本年总喷洒面积</li>
            </ul>
          </div>
        </div>
        <!-- 数字模块 -->
        <div class="no">
          <div class="no-hd">
            <ul>
              <li>{{ daySum.time }}</li>
              <li>{{ daySum.area }}</li>
              <li>{{ daySum.dosage }}</li>
              <li>{{ daySum.avgDosage }}</li>
            </ul>
          </div>
          <div class="no-bd">
            <ul>
              <li>本日总喷洒时长</li>
              <li>本日总喷洒面积</li>
              <li>本日总用药量</li>
              <li>本日平均用药量</li>
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
        <div class="panel pie1 panel-max">
          <h2>当前在线设备信息</h2>
          <div class="chart equi">
            <div class="equi-title">
              <div class="eqid">设备信息</div>
              <div class="tkid">任务信息</div>
              <div class="oper">操作</div>
            </div>
            <div
              class="equi-cont"
              v-for="(item, index) in tableData"
              :key="index"
            >
              <div class="eqid">
                <span class="ellipsis">{{ item.sbid }}</span>
              </div>
              <div class="tkid">
                <span class="ellipsis">{{ item.taskname }}</span>
              </div>
              <div class="oper">
                <span class="ellipsis" @click="gotoOneRealTime(item)">{{ item.address }}</span>
              </div>
            </div>
          </div>
          <div class="panel-footer"></div>
        </div>
        <div class="panel rtmap">    
          <bi-real-time-track :sbKeys="sbKeys"></bi-real-time-track>
          <div class="panel-footer"></div>
        </div>
      </div>
    </div>
    <el-dialog title="登陆" :visible.sync="showLoginDia" width="35%">
      <el-form label-width="100px" class="login-form">
        <el-form-item class="bip-form-item" label="账户:">
          <el-input v-model="userCode"></el-input>
        </el-form-item>
        <el-form-item class="bip-form-item" label="密码:">
          <el-input id="pwd" v-model="password" :show-password="true" type="password"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="initPortal">登 陆</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { User } from '@/classes/User';
import echarts from "echarts";
import "echarts/map/js/china";
import { Component, Vue, Provide, Watch } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from "vuex-class";
import CDataSet from "@/classes/pub/CDataSet";
import { Cells } from "@/classes/pub/coob/Cells";
import QueryEntity from "@/classes/search/QueryEntity";
import QueryCont from "@/classes/search/QueryCont";
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi;
import { GlobalVariable } from "@/utils/ICL";
import { BaseVariable } from "@/utils/BaseICL";
import qs from "qs";
import moment from 'moment';
import BiRealTimeTrack from "./components/BIRealTimeTrack.vue";
@Component({
  components: {BiRealTimeTrack},
})
export default class followTimesLine extends Vue {
  @Mutation("isLogin", { namespace: 'login' }) setIsLogin: any;
  @Getter('user', { namespace: 'login' }) user?: User;
  @Mutation("snkey", { namespace: "login" }) setSnkey: any;
  @Mutation("user", { namespace: "login" }) setUserInfo: any;
  @Mutation("menulist", { namespace: "login" }) setMenusInfo: any;
  @Mutation("isOtherePage", {  namespace: 'login' }) setIsOtherePage: any;
  isFormalLogin:boolean = true;
  page: any = { pageSize: 2000, currPage: 1, total: 0 };
  showtime: String = "";
  t: any = "";
  skfcy: Number = 0;
  fkfcy: Number = 0;
  yefcy: Number = 0;
  tableData: Array<any> = [];
  yearArray: Array<any> = [];
  seasonArray: Array<any> = [
    { value: "0", label: "春季" },
    { value: "1", label: "夏季" },
    { value: "2", label: "秋季" },
  ];
  year: any = "";
  season: String = "1";
  password:any = null;
  userCode:any = null;
  showLoginDia:boolean = false;
  daySum:any = {area: 0,avgDosage: 0,dosage: 0,time: 0}; //日汇总信息
  sbKeys:any = null;//选择设备key
  reamIndex:any=0;
  async mounted() {
    let _year = moment().year();
    this.year = _year;
    for(var i=0;i<5;i++){
      let d1 = { value: (_year-i), label: (_year-i)+"年" };
      this.yearArray.push(d1);
    }
    await this.initPortal();
    this.time();
  }
  // 模拟账户登录
  async initPortal() {
    if(!this.isFormalLogin){
      const loading = this.$loading({
        lock: true,
        text: "加载中",
        spinner: "el-icon-loading",
        background: "background:'rgba(0, 0, 0, 0.7)'",
      });
      let res = null;
      if(!this.userCode && !this.password){
        res = await tools.loginWithOutPwd("portal");
      }else{
        res = await tools.login(new User(this.userCode, "", this.password));
        if(res.data.id  == 0){
          this.isFormalLogin = true;
          this.showLoginDia = false;
        }
      }
      let data = res.data;
      if (data.id === 0) {
        let userI = data.data.user;
        let snkey = data.data.snkey;
        userI.password = "";
        this.setSnkey(snkey);
        this.setUserInfo(userI);
        let ms = data.data.menulist;
        this.setMenusInfo(ms);
        this.timeReqData();
      }else{
        this.$notify.error(data.message);
      }
      loading.close();
    }else{
      this.timeReqData();
      this.modifyMapAir();
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
    this.reqCaptYear();
    this.getDaySum();
    this.reqBilltYear();
    this.reqEqui();
    this.reqRatio();
    t = setTimeout(this.timeReqData, 1000 * 60 * 30); //设定定时器，循环运行
  }
  //间隔15分钟跟换地图展示飞机
  modifyMapAir(){
    if(this.tableData.length>0){
      if(this.reamIndex>= this.tableData.length-1){
        this.reamIndex = 0;
      }
      this.gotoOneRealTime(this.tableData[this.reamIndex])
      this.reamIndex++;
      setTimeout(() => {
        this.modifyMapAir();
      }, 1000*60*15);
    }
  }
  // ------------------------数据请求-----------------
  // 获取设备信息
  async reqEqui() {
    this.tableData = [];
    if(this.isFormalLogin){
      let usercode = JSON.parse(window.sessionStorage.getItem("user") + "").userCode
      //查询全部设备
      let data = {
        apiId: GlobalVariable.APIID_MPARAMS,
        dbid: BaseVariable.COMM_FLD_VALUE_DBID,
        usercode: usercode,
        oprid: 220,
        condition: '{"userCode":"'+usercode+'"}',
      };
      let data1 = qs.stringify(data);
      let res = await Vue.$axios.post("/realTimeServlet", data1);
      if(res.data.id == 0){
        let tasks = res.data.data.data;
        for(var i=0;i<tasks.length;i++){
          let task = tasks[i];
          if(task.offline== 0){
            task['address'] = "详情";
            this.tableData.push(task);
          }
        }
        if(this.tableData.length>0){
          this.gotoOneRealTime(this.tableData[0]);
        }
      }
    }else{
      for(var i=0;i<5;i++){
        let d1 = {sbid:this.getRandom(100000,0),speedtime:new Date(),address:"详情"};
        this.tableData.push(d1);
      }
    }
    this.echartsMap();
  }
  // 条件发生改变
  dataChange() {
    this.reqRatio();
    this.reqOutputMonth();
    this.reqBilltYear();
  }
  // 1.计划架次完成比例
  async reqRatio() {
    if(this.isFormalLogin){
      let qe: QueryEntity = new QueryEntity("", "");
      qe.page.currPage = this.page.currPage;
      qe.page.pageSize = this.page.pageSize;
      if (this.season !== "") {
        qe.cont = "iym = '" + this.year + "'" + " and " + "season = '" + this.season + "'";
      } else {
        qe.cont = "iym = '" + this.year + "'";
      }
      let cc = await tools.getBipInsAidInfo("RATIO", 210, qe);
      if (cc.data.id === 0) {
        let res = cc.data.data.data.values;
        let labeldata = new Array();
        let plandata = new Array();
        let ratiodata = new Array();
        let framedata = new Array();
        for (let item = 0; item < res.length; item++) {
          labeldata.push(res[item].orgname);
          plandata.push(res[item].planqty);
          ratiodata.push(res[item].ratio);
          framedata.push(100);
        }
        this.completePro(labeldata, plandata, ratiodata, framedata);
      }
    }else{
      let labeldata = ["昌平站", "大兴站", "房山区站", "丰台站", "怀柔站", "平谷站", "顺义站"] ;
      let plandata = []
      let ratiodata = [];
      for(var i=0;i<7;i++){
        plandata.push(this.getRandom(1000,0));
        ratiodata.push(this.getRandom(100,0));
      }
      let framedata = [100, 100, 100, 100, 100, 100, 100];
      this.completePro(labeldata, plandata, ratiodata, framedata);
    }
  }

  // 2.年度架次对比
  async reqOutputMonth() {
    if(this.isFormalLogin){
      let qe: QueryEntity = new QueryEntity("", "");
      qe.page.currPage = this.page.currPage;
      qe.page.pageSize = this.page.pageSize;
      if (this.season !== "") {
        qe.cont = "iym = '" +this.year +"'" +" and " +"season = '" +this.season +"'";
      } else {
        qe.cont = "iym = '" + this.year + "'";
      }
      let cc = await tools.getBipInsAidInfo("OUTPUTMONTH", 210, qe);
      if (cc.data.id === 0) {
        let res = cc.data.data.data.values;
        let xAxisdata = new Array();
        let yAxisdata = new Array();
        for (let item = 0; item < res.length; item++) {
          xAxisdata.push(res[item].orgname);
          yAxisdata.push(res[item].jcqty);
        }
        this.echartsBar(xAxisdata, yAxisdata);
      }
    }else{
      let xAxisdata = ["海淀站", "丰台站", "门头沟站", "房山区站", "通州站", "顺义站", "昌平站", "大兴站", "平谷站", "怀柔站"];
      let yAxisdata = [];
      for(var i=0;i<10;i++){
          yAxisdata.push(this.getRandom(1000,0))
      }
      this.echartsBar(xAxisdata, yAxisdata);
    }
  }
  // 3.平均用药量
  async reqBilltYear() {
    if(this.isFormalLogin){
      let qe: QueryEntity = new QueryEntity("", "");
      qe.page.currPage = this.page.currPage;
      qe.page.pageSize = this.page.pageSize;
      if (this.season !== "") {
        qe.cont = "iym = '" + this.year + "'" +" and " +"season = '" +this.season +"'";
      } else {
        qe.cont = "iym = '" + this.year + "'";
      }
      let cc = await tools.getBipInsAidInfo("BILLYEAR", 210, qe);
      if (cc.data.id === 0) {
        let res = cc.data.data.data.values;
        console.log(res);
        let ysxAxisdata = new Array();
        let ysyAxisdata = new Array();
        for (let index = 0; index < res.length; index++) {
          ysxAxisdata.push(res[index].orgname);
          ysyAxisdata.push(res[index].avgyl);
        }
        this.echartsBar1(ysxAxisdata, ysyAxisdata);
      }
    }else{
      let ysyAxisdata = [];
      let ysxAxisdata = ["海淀站", "丰台站", "门头沟站", "房山区站", "通州站", "顺义站", "昌平站", "大兴站", "平谷站", "怀柔站"];
      for(var i=0;i<10;i++){
          ysyAxisdata.push(this.getRandom(1,5))
      }
      this.echartsBar1(ysxAxisdata, ysyAxisdata);
    }
  }
  // 4.本年度总架次、总面积、总药量
  async reqCaptYear() {
    if(this.isFormalLogin){
      let qe: QueryEntity = new QueryEntity("", "");
      qe.page.currPage = 1;
      qe.page.pageSize = 1;
      let cc = await tools.getBipInsAidInfo("BIYEARSUM", 210, qe);
      console.log(cc);
      if (cc.data.id === 0 ) {
        let res = cc.data.data.data.values;
        if(res.length>0){
          this.skfcy = res[0].jcqty;
          this.fkfcy = res[0].sumflow;
          this.yefcy = res[0].sumarea;
        }else{
          this.skfcy = 0;
          this.fkfcy = 0;
          this.yefcy = 0;
        }
      }
    }else{//未正式登陆 生成模拟数据
      this.skfcy = this.getRandom(100,0);
      this.fkfcy = this.getRandom(1000,2);
      this.yefcy = this.getRandom(10000,2);
    }
  }
  //本日汇总信息
  async getDaySum(){
    if(this.isFormalLogin){
      let usercode = JSON.parse(window.sessionStorage.getItem("user") + "").userCode
      //查询全部设备
      let data = {
        apiId: GlobalVariable.APIID_MPARAMS,
        dbid: BaseVariable.COMM_FLD_VALUE_DBID,
        usercode: usercode,
        oprid: 230,
        condition: '{"userCode":"'+usercode+'"}',
      };
      let data1 = qs.stringify(data);
      let res = await Vue.$axios.post("/realTimeServlet", data1);
      if(res.data.id == 0){
        this.daySum = res.data.data.data;
      }
    }else{
        this.daySum = {area: this.getRandom(100000,0),avgDosage: this.getRandom(100000,0),dosage: this.getRandom(100000,0),time:this.getRandom(100000,0)}
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
  // --------------------------绘制图形------------------------
  // 绘制计划防治完成比例
  completePro(labeldata: any, plandata: any, ratiodata: any, framedata: any) {
    // 基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(
      document.querySelector(".bar .chart") as HTMLCanvasElement
    );
    // 完成比例
    var data = ratiodata;
    // 页签名称
    var titlename = labeldata;
    // 计划数量
    var valdata = plandata;
    var myColor = [
      "#1089E7",
      "#F57474",
      "#56D0E3",
      "#F8B448",
      "#8B78F6",
      "#1089E7",
      "#F57474",
      "#56D0E3",
      "#F8B448",
      "#8B78F6",
    ];
    let option = {
      //图标位置
      grid: {
        top: "10%",
        left: "22%",
        bottom: "10%",
      },
      xAxis: {
        show: false,
      },
      yAxis: [
        {
          show: true,
          data: titlename,
          inverse: true,
          axisLine: {
            show: false,
          },
          splitLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            color: "#fff",
            rich: {
              lg: {
                backgroundColor: "#339911",
                color: "#fff",
                borderRadius: 15,
                // padding: 5,
                align: "center",
                width: 15,
                height: 15,
              },
            },
          },
        },
        {
          show: true,
          inverse: true,
          data: valdata,
          axisLabel: {
            textStyle: {
              fontSize: 12,
              color: "#fff",
            },
          },
        },
      ],
      series: [
        {
          name: "条",
          type: "bar",
          yAxisIndex: 0,
          data: data,
          barCategoryGap: 50,
          barWidth: 10,
          itemStyle: {
            normal: {
              barBorderRadius: 20,
              color: function(params: any) {
                var num = myColor.length;
                return myColor[params.dataIndex % num];
              },
            },
          },
          label: {
            normal: {
              show: true,
              position: "inside",
              formatter: "{c}%",
            },
          },
        },
        {
          name: "框",
          type: "bar",
          yAxisIndex: 1,
          barCategoryGap: 50,
          data: framedata,
          barWidth: 15,
          itemStyle: {
            normal: {
              color: "none",
              borderColor: "#00c1de",
              borderWidth: 3,
              barBorderRadius: 15,
            },
          },
        },
      ],
    };
    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);
    window.addEventListener("resize", function() {
      myChart.resize();
    });
  }

  // 绘制左侧第二个图（柱状图）
  echartsBar(xAxisdata: any, yAxisdata: any) {
    // 实例化对象
    let myChart = echarts.init(
      document.querySelector(".airbar .chart") as HTMLCanvasElement
    );
    // 指定配置和数据
    let option: any = {
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
          name: "架次数量",
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

  // 绘制左侧第二个柱状图(平均用药量)
  echartsBar1(xAxisdata: any, yAxisdata: any) {
    // 实例化对象
    let myChart = echarts.init(
      document.querySelector(".airbar1 .chart") as HTMLCanvasElement
    );
    // 指定配置和数据
    let option: any = {
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
          name: "平均用药量",
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
  async echartsMap() {
    let cmcCode="2";
    if(this.user){
			cmcCode = this.user.deptInfo.cmcCode
			cmcCode = cmcCode.substring(0,6)
      if(cmcCode =="2"){
        cmcCode = "200037"
      }
    }
    let cityName = "";
    let myChart = echarts.init(
      document.querySelector(".map .chart") as HTMLCanvasElement
    );
    let qe:QueryEntity = new QueryEntity('','');
    qe.page.currPage = 1;
    qe.page.pageSize = 1;
    qe.cont = "";
    let oneCont = [];
    let qCont = new QueryCont('orgcode',cmcCode,12);
    qCont.setContrast(0);
    oneCont.push(qCont);
    qe.cont = "~["+JSON.stringify(oneCont)+"]"
    let vv:any = await tools.getBipInsAidInfo('GETADCODE',210,qe);
    let features = null;
    if(vv.data.id ==0){
      let vl = vv.data.data.data.values[0]
      if(vl){
        features = JSON.parse(vl.features);
        cityName = vl.name;
        echarts.registerMap(cityName, features);
      }
    }
    if(features){
      let geoCoordMap:any ={}
      var data:Array<any> = [];
      for(var i=0;i<features.features.length;i++){
        let one = features.features[i];
        // 每个地区的坐标
        geoCoordMap[one.properties.name] = one.properties.center
        let value = this.getRandom(100,0);
        if(this.isFormalLogin){
          value = 0;
          for(var j=0;j<this.tableData.length;j++){
            let adcode = one.properties.adcode;
            if(adcode == this.tableData[j].area){
              value++;
            }
          }
        }
        if(value>0){
          let d1 = {name:one.properties.name,value:value}
          data.push(d1)
        }
      }
      var convertData = function(data:any) {
        var res = [];
        for (var i = 0; i < data.length; i++) {
          let geoCoord:any = geoCoordMap[data[i].name];
          if (geoCoord) {
            res.push({
              name: data[i].name,
              value: geoCoord.concat(data[i].value),
            });
          }
        }
        // 有数据的地区的名称和value值
        return res;
      };
      // 设定series是一个空的数组
      let series:any = [];
      [[cityName, data]].forEach(function(item, i) {
        series.push(
            {
              name: "定位点",
              type: "effectScatter", // 散点图
              coordinateSystem: "geo", // 使用地理坐标系
              hoverAnimation: "false",
              legendHoverLink: "false",
              rippleEffect: {
              period: 4,
              brushType: "stroke",
              scale: 3,
            },
            data: convertData(item[1]),
            symbolSize: function(val:any) {
              if (val[2] <= 10) {
                return 4;
              }
              if (val[2] > 10 && val[2] <= 20) {
                return 8;
              }
              if (val[2] > 20) {
                return 12;
              }
            },
            itemStyle: {
              normal: {
                color: "#5599E4",
              },
            },
            zlevel: 1,
          },
          {
            type: "map",
            map: cityName,
            zlevel: 0,
            itemStyle: {
              normal: {
                areaColor: "#323c48",
                borderColor: "#111",
              },
              emphasis: {
                areaColor: "#2a333d",
              },
            },
            label: {
              normal: {
                show: true,
                textStyle: {
                  color: "#ddb926",
                  fontSize: 10,
                },
              },
              emphasis: {
                textStyle: {
                  color: "#ddb926",
                  fontSize: 10,
                },
              },
            },
            data: data,
          }
        );
      });
      let option = {
        title: {
          text: "",
          subtext: "",
          left: "center",
          textStyle: {
            color: "#7bbfea",
          },
        },
        geo: {
          map: cityName,
          label: {
            textStyle: {
              fontSize: ".1rem",
            },
          },
          itemStyle: {
            normal: {
              areaColor: "#fff",
              borderColor: "#587A9F",
            },
            emphasis: {
              areaColor: "#ccc",
            },
          },
        },
        series: series,
      };
      myChart.setOption(option);
    }
  }
  /**
   * 设备点击详情
   */
  gotoOneRealTime(item:any){
    if(this.isFormalLogin){
      this.sbKeys = item.taskid+"_"+item.sbid+"_"+item.offline+"_"+item.sbtype;
    }
  }

  /**
   * 生成随机数
   */
  getRandom(num:any,digits:any): number{
    return parseFloat((Math.random()*num).toFixed(digits));
  }

  /**
   * type  1 登陆 0 退出
   */
  loginPage(type:any){
    this.userCode = null;
    this.password = null;
    if(type == 1){
      this.showLoginDia = true;
    }else{
      this.isFormalLogin = false;
      this.initPortal();
    }
  }
  gaotoPage(){
    this.setIsOtherePage(false)
    this.$router.push({
        path:'/',
        name:"Home",
    })
  }
}
</script>
<style lang="scss" scoped>
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
.panel-max::-webkit-scrollbar {
  width: 4px;
}
.panel-max::-webkit-scrollbar-thumb {
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
  right: 1rem;
  top: 0;
  line-height: 0.9375rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.25rem;
}
.loginBtn{
  position: absolute;
  right: 1.375rem;
  top: 0;
  line-height: 0.9375rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.25rem;
}
.homeBtn{
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
  overflow: hidden;
}
.mainbox .column:nth-child(2) {
  flex: 5;
  margin: 0px 0.125rem 0.1875rem;
}
.rtmap{
  height: 7.25rem !important;
  padding: 0px !important;
}
.mainbox .panel {
  position: relative;
  height: 3.75rem;
  border: 1px solid rgba(25, 186, 139, 0.17);
  background: url(../../assets/bip-erp/image/line.png) rgba(255, 255, 255, 0.04);
  padding: 0 0.1875rem 0.5rem;
  margin-bottom: 0.1875rem;
}
.mainbox .panel-max {
  position: relative;
  height: 5.23rem;
  border: 1px solid rgba(25, 186, 139, 0.17);
  background: url(../../assets/bip-erp/image/line.png) rgba(255, 255, 255, 0.04);
  padding: 0 0.1875rem 0.5rem;
  margin-bottom: 0.1875rem;
  overflow-y: auto;
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
  height: 0.5rem;
  line-height: 0.5rem;
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
.mainbox .no .no-bd ul li {
    -webkit-box-flex: 1;
    flex: 1;
    text-align: center;
    height: 0.1rem;
    line-height: 0.1rem;
    font-size: 0.225rem;
    color: rgba(255, 255, 255, 0.7);
    padding-top: 0.1rem;
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
  height: 8.99rem;
}
.map .chart {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 5;
  height: 8.99rem;
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
ul {
  padding: 0;
}
.no-cont ul {
  display: flex;
}
.no-cont ul li {
  flex: 1;
  height: 0.3rem;
  line-height: 0.3rem;
  text-align: center;
  color: #fff;
  font-size: 0.25rem;
}
.no-value ul {
  display: flex;
}
.no-value ul li {
  flex: 1;
  height: 0.8rem;
  line-height: 0.8rem;
  text-align: center;
  color: #ffeb7b;
  font-size: 0.5rem;
  font-family: electronicFont;
  font-weight: bold;
}
.equi {
  text-align: center;
  color: #ffffff;
  font-size: 0.25rem;
}
.equi-title {
  display: flex;
}
.equi-cont {
  display: flex;
}
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.equi div {
  border: 1px solid rgba(25, 186, 139, 0.17);
  height: 0.5rem;
  line-height: 0.5rem;
  overflow: hidden;
}
.equi .eqid {
  flex: 4.5;
}
.equi .tkid {
  flex: 6;
}
.equi .oper {
  flex: 1;
}

.select-style {
  width: 90px;
  // margin-right: 0.36rem;
  /deep/.el-input__inner {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    border: 0px solid #a1a3ad;
    border-left-width: 0;
    background-color: rgba(110, 147, 206, 0.2);
    // font-family: PingFangSC-Regular;
    font-size: 0.25rem;
    color: #ffffff;
  }
}
/deep/.select-popper {
  background-color: rgba(110, 147, 206, 0.2);
  border-radius: 0.08rem;
  border: solid 0.02rem #1c395d;
  font-family: PingFangSC-Regular;
  .el-select-dropdown__item.selected {
    font-family: PingFangSC-Regular;
    // font-size: 0.28rem;
    // color: rgba(110, 147, 206, 1);
  }
  li {
    color: #fff;
    background: transparent;
    color: #fff;
    // font-size: 0.28rem;
  }
  .el-select-dropdown__item:hover,
  .el-select-dropdown__item.hover {
    background-color: rgba(110, 147, 206, 0.2);
    margin-right: 1px;
  }
  .popper__arrow::after {
    border-bottom-color: rgba(110, 147, 206, 0.2);
  }
  .popper__arrow {
    border-bottom-color: rgba(110, 147, 206, 0.2);
  }
  .el-select-dropdown__empty {
    padding: 0.2rem;
    font-size: 0.28rem;
  }
}
</style>
<style lang="scss">
.login-form{
  .el-form-item__label{
    height: 40px !important;
    line-height: 40px !important;
    border-width: 0px !important;
    padding: 0px 15px !important;
    background:transparent !important;
  }
}
</style>