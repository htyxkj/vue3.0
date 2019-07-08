<template>
  <div class="home">
    <!-- 首页顶部统计区域 -->
      <div class="home-top">
          <el-row type="flex" class="row-bg" justify="space-around">
            <el-col :span="3">
                <div class="grid-content bg-purple1">
                    <el-row>
                        <el-col :span="10" class="top-col top-icon"><i class="el-icon-tickets"></i></el-col>
                        <el-col :span="14" class="top-col">
                            <div class="top-textbig">
                                <span>12</span>
                            </div>
                            <div class="top-text">
                                <span>待处理</span>
                            </div>
                        </el-col>
                    </el-row>
                </div>
            </el-col>
            <el-col :span="3">
                <div class="grid-content bg-purple2">
                     <el-row>
                        <el-col :span="10" class="top-col top-icon"><i class="el-icon-document"></i></el-col>
                        <el-col :span="14" class="top-col">
                            <div class="top-textbig">
                                <span>5</span>
                            </div>
                            <div class="top-text">
                                <span>退回件</span>
                            </div>
                        </el-col>
                    </el-row>
                </div>
            </el-col>
           <el-col :span="3">
                <div class="grid-content bg-purple3">
                     <el-row>
                        <el-col :span="10" class="top-col top-icon"><i class="el-icon-goods"></i></el-col>
                        <el-col :span="14" class="top-col">
                            <div class="top-textbig">
                                <span>13</span>
                            </div>
                            <div class="top-text">
                                <span>代办件</span>
                            </div>
                        </el-col>
                    </el-row>
                </div>
            </el-col>
            <el-col :span="3">
                <div class="grid-content bg-purple4">
                     <el-row>
                        <el-col :span="10" class="top-col top-icon"><i class="el-icon-sold-out"></i></el-col>
                        <el-col :span="14" class="top-col">
                            <div class="top-textbig">
                                <span>6</span>
                            </div>
                            <div class="top-text">
                                <span>待审核</span>
                            </div>
                        </el-col>
                    </el-row>
                </div>
            </el-col>
            <el-col :span="3">
                <div class="grid-content bg-purple5">
                     <el-row>
                        <el-col :span="10" class="top-col top-icon"><i class="el-icon-news"></i></el-col>
                        <el-col :span="14" class="top-col">
                            <div class="top-textbig">
                                <span>8</span>
                            </div>
                            <div class="top-text">
                                <span>批示件</span>
                            </div>
                        </el-col>
                    </el-row>
                </div>
            </el-col>
            <el-col :span="3">
                <div class="grid-content bg-purple6">
                     <el-row>
                        <el-col :span="10" class="top-col top-icon"><i class="el-icon-sunny"></i></el-col>
                        <el-col :span="14" class="top-col">
                            <div class="top-textbig date">
                                <span>海淀区</span>
                            </div>
                            <div class="top-text">
                                <span>{{weath}}℃</span>
                            </div>
                        </el-col>
                    </el-row>
                </div>
            </el-col>
            <el-col :span="3">
                <div class="grid-content bg-purple7">
                     <el-row>
                        <el-col :span="8" class="top-col top-icon"><i class="el-icon-alarm-clock"></i></el-col>
                        <el-col :span="16" class="top-col">
                            <div class="top-textbig date">
                                <span>{{date}}</span>
                            </div>
                            <div class="top-text date">
                                <span>{{dayweek}}</span>
                            </div>
                        </el-col>
                    </el-row>
                </div>
            </el-col>
        </el-row>
      </div>

      <!-- 中部区域 -->
      <div class="center">
        <el-row>
           <el-col :span="16" class="jd" >
                <div class="jd-title">
                    <el-row>
                        <el-col :span="12">
                             <div class="jd-title-left">
                                <i class="el-icon-arrow-right"></i>
                                <span>办理监督</span>
                            </div>
                        </el-col>
                        <el-col :span="12">
                              <div class="jd-title-right">
                                <span>查看更多</span>
                                <i class="el-icon-arrow-right"></i>
                            </div>
                        </el-col>
                    </el-row>
                </div>
                <el-table
                    :data="tableData"
                    size="mini"
                    stripe
                    style="width: 100%">
                    <el-table-column
                        prop="date"
                        label="日期"
                        width="180">
                    </el-table-column>
                    <el-table-column
                        prop="name"
                        label="姓名"
                        width="180">
                    </el-table-column>
                     <el-table-column
                        prop="sex"
                        label="性别"
                        width="180">
                    </el-table-column>
                    <el-table-column
                        prop="address"
                        label="地址">
                    </el-table-column>
                </el-table>
           </el-col>
           <el-col :span="8"  class="center-right">
               <el-row>
                 <el-col :span="8">
                    
                    <el-progress type="circle" :percentage="0"></el-progress>
                 </el-col>
                 <el-col :span="8">
                   
                    <el-progress type="circle" :percentage="25"  color="#8e71c7"></el-progress>
                 </el-col>
                  <el-col :span="8">
                   
                    <el-progress type="circle" :percentage="50"></el-progress>
                 </el-col>
               </el-row>
              <el-row>
                 <el-col :span="8">
                 
                    <el-progress type="circle" :percentage="88" ></el-progress>
                 </el-col>
                 <el-col :span="8">
                  
                   <el-progress type="circle" :percentage="100" ></el-progress>
                 </el-col>
                  <el-col :span="8">
                   
                    <el-progress type="circle" :percentage="100" status="success"  >Done</el-progress>
                 </el-col>
               </el-row>
           </el-col>
        </el-row>
      </div>

      <!-- 底部区域 -->
      <div>
         <el-row type="flex" :gutter="10">
             <el-col :span="12" class="linchart">
                <el-row class="linchart-title">
                    <div class="echarttitle">
                        <i class="el-icon-arrow-right"></i>
                        <span>本周销量统计图</span>
                    </div>
                </el-row>
                <el-row>
                    <div id="linchart2" :style="{width: '100%', height: '190px'}"></div>
                </el-row>
            </el-col>

             <el-col :span="12" class="linchart linchart-left">
                <el-row>
                    <div class="linchart-title echarttitle" >
                        <i class="el-icon-arrow-right"></i>
                        <span>今日交通流量分布图</span>
                    </div>
                </el-row>
                <el-row>
                    <div id="linchart" :style="{width: '100%', height: '190px'}"></div>
                </el-row>
            </el-col>
        </el-row>
      </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Provide } from "vue-property-decorator";
import echarts from 'echarts'; 
import { Menu } from "@/classes/Menu";
import BipMenu from "@/components/menu/BipMenu.vue";
import { Route, RawLocation } from 'vue-router';
@Component({
  components: {
    BipMenu
  }
})
export default class Home extends Vue {
  @Provide() menus: Array<Menu> = [];
  @Provide() tableData:any = 
                [   
                    {
                        date: '2016-05-02',
                        name: '王小虎',
                        sex:'男',
                        address: '上海市普陀区金沙江路 1518 弄'
                    }, 
                    {
                        date: '2016-05-04',
                        name: '王小虎',
                        sex:'男',
                        address: '上海市普陀区金沙江路 1517 弄'
                    }, 
                    {
                        date: '2016-05-01',
                        name: '王小虎',
                        sex:'男',
                        address: '上海市普陀区金沙江路 1519 弄'
                    }, 
                    {
                        date: '2016-05-03',
                        name: '王小虎',
                        sex:'男',
                        address: '上海市普陀区金沙江路 1516 弄'
                    },
                     {
                        date: '2016-05-03',
                        name: '王小虎',
                        sex:'男',
                        address: '上海市普陀区金沙江路 1516 弄'
                    },
                     {
                        date: '2016-05-03',
                        name: '王小虎',
                        sex:'男',
                        address: '上海市普陀区金沙江路 1516 弄'
                    },
                ];
  @Provide() weath:any = 20;
  @Provide() date:any = '';
  @Provide() dayweek:any = '';
  @Provide() columnchartdata:any= [10, 52, 200, 334, 390, 330, 220]

  mounted() {
    this.menus = JSON.parse(window.sessionStorage.getItem("menulist") + "");
    if (this.menus == null) {
      this.menus = [];
      
    }
    this.getDate();
    this.setColumnChart();
    this.setLinChart();
  }

  // initTableData(){
  //     for(let i=0;i<=999;i++){
  //         let peo = {name:'张三'+i,sex:i%2==0?'F':'M',age:"fdsfdsfdsfdsfdsfdsfdsfdsfdsfdsfdsfdsfdsfdsfdsfjflkdsjflkajf;lkdsajfdsalk;fjd;lksafads"+Math.random()*100/10};
  //         this.tableData.push(peo);
  //     }
  // }
    setColumnChart() {
        var myChart = echarts.init(document.getElementById("linchart2") as HTMLCanvasElement);
        myChart.setOption({
            color: ["#3398DB"],
            tooltip: {
              trigger: "axis",
              axisPointer: {
                  // 坐标轴指示器，坐标轴触发有效
                  type: "shadow" // 默认为直线，可选为：'line' | 'shadow'
              }
            },
            grid: {
              left: "3%",
              right: "4%",
              bottom: "3%",
              top: "5%",
              containLabel: true
            },
            xAxis: [
              {
                  type: "category",
                  data: [
                  "星期一",
                  "星期二",
                  "星期三",
                  "星期四",
                  "星期五",
                  "星期六",
                  "星期日"
                  ],
                  axisTick: {
                  alignWithLabel: true
                  }
              }
            ],
            yAxis: [
              {
                  type: "value"
              }
            ],
            series: [
                {
                  name: "本周销量统计",
                  type: "bar",
                  barWidth: 30,
                  data: this.columnchartdata,
                  itemStyle: {
                  normal: {
                      //定义一个list，然后根据所以取得不同的值，这样就实现了，
                      color: function(params:any) {
                      var colorList = [
                          "#C1232B",
                          "#B5C334",
                          "#FCCE10",
                          "#E87C25",
                          "#27727B",
                          "#FE8463",
                          "#9BCA63",
                          "#FAD860",
                          "#F3A43B",
                          "#60C0DD",
                          "#D7504B",
                          "#C6E579",
                          "#F4E001",
                          "#F0805A",
                          "#26C0C0"
                      ];
                      return colorList[params.dataIndex];
                      }
                  }
                  }
              }
            ]
        });
    }

    setLinChart() {
        var dom = document.getElementById("linchart") as HTMLCanvasElement;
        var myChart = echarts.init(dom);
        myChart.setOption({
            title: {
            text: ""
            },
            tooltip: {
            trigger: "axis"
            },
            legend: {
            data: ["违章", "事故"],
            x: "center",
            top: "1%",
            textStyle: {
                //图例文字的样式
                // color:'#194296',
                fontSize: 12
            }
            },
            grid: {
            left: "3%",
            right: "4%",
            bottom: "3%",
            top: "5%",
            containLabel: true
            },
            toolbox: {
            feature: {
                // saveAsImage: {}
            }
            },
            xAxis: {
            type: "category",
            boundaryGap: false,
            data: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
            // color: "#194296"
            },
            yAxis: {
            type: "value",
            // color: "#194296"
            },
            series: [
            {
                name: "违章",
                type: "line",
                stack: "总量",
                // color: "#d5d073",
                smooth: true, //设置圆滑折线
                data: [120, 132, 101, 134, 90, 230, 210]
            },
            {
                name: "事故",
                type: "line",
                stack: "总量",
                smooth: true, //设置圆滑折线
                data: [220, 182, 191, 234, 290, 330, 310]
            }
            ]
        });
    }

    getDate(){
           var date = new Date();
           var year =date.getFullYear();
           var month = date.getMonth()+1;
           var day = date.getDate();
           this.date = year+"年"+month+"月"+day+"日";
           var week =date.getDay();
           console.log(week)
           switch (week) {
               case 0:
                   this.dayweek = '星期日'
                   break;
                case 1:
                   this.dayweek = '星期一'
                   break;
                case 2:
                    this.dayweek = '星期二'
                     break;
                case 3:
                    this.dayweek = '星期三'
                     break;
                case 4:
                    this.dayweek = '星期四'
                     break;
                case 5:
                    this.dayweek = '星期五'
                    break;
               default:
                    this.dayweek = '星期六'
                   break;
           }
          
       }
}
</script>

<style scoped>
.home {
  overflow:auto
}
.menu-title{
    height:60px;
    padding-left: 10px;
}
.home-top {
  text-align: center;
  margin-top: 5px;
}
.bg-purple1 {
    background-color: #00baae;
}
.bg-purple2 {
    background-color: #FFA023;
}
.bg-purple3 {
    background-color: #FF7777;
}
.bg-purple4 {
    background-color: #3ABA7D;
}
.bg-purple5 {
    background-color: #40AAF3;
}
.bg-purple6 {
    background-color: #D47D00;
}
.bg-purple7 {
    background-color: #00baae;
}
.grid-content {
    border-radius: 4px;
    height: 80px;
    min-height: 80px;
    overflow: hidden; 
}
.row-bg {
    height: 90px;
    padding: 0 0 10px 0;
    /* background-color: #f9fafc; */
}
.top-icon {
    height: 80px;
    line-height: 80px;
    font-size: 40px;
    color: #ffffff;
}
.top-text {
    height: 30px;
    line-height: 30px;
    color: azure;
    font-size: 12px;
}
.top-textbig {
    font-size: 20px;
    height: 50px;
    line-height: 50px;
    color: azure;
}
.center {
  margin-top: -15px;
}
.date {
    height: 40px;
    line-height: 40px;
}
.jd {
  border: 1px solid #EBEBEB;
}
.jd-title {
    height: 40px;
    line-height: 40px;
    text-align: left;
    background-color:#EBEBEB;
}
.date {
    font-size: 14px;
}
.jd-title-right {
    text-align: right;
    padding-right: 10px;
    cursor: pointer;
    font-size: 12px;
    color:#3ABA7D;
}
.echarttitle {
  background-color:#EBEBEB;
  padding: 8px 10px 8px 0;
}
#linchart,
#linchart1,
#linchart2 {
  background-color: #f9f9f9;
  
}
.center-right {
  text-align: center;
}
.el-row {
  margin-bottom: 20px; 
}
</style>




