<template> 
    <el-container>
        <el-header style="height:45px;padding:0px 10px;border-bottom: 1px solid #CCCCCC;    line-height: 45px;">
            <Accounting @dataChange="accChange" :class="screenWidth<1600?'topdiv1_min':'topdiv1'"></Accounting> 
             <el-date-picker v-model="fm_date" format="yyyy-MM-dd" :class="screenWidth<1600?'topdiv1_min':'topdiv1'" type="date" @change="fm_dateChange" placeholder="选择日期" size="small"></el-date-picker>
             <div class="topdiv2"><!-- 刷新 -->
                <el-button style="border:0px" @click="initData">      
                    <i class="el-icon-refresh-right"></i>
                    <span>刷新</span>
                </el-button>
            </div>

        </el-header>
        <el-container>
            <!-- <el-aside width="300px"> -->
                <amb-tree class="el-tree-node_content" :style="'height:'+treeHeight+'px'" @dataChange="treeChange" :purposesId="amb_purposes_id" :showCbox="false" ></amb-tree>
           <!--  </el-aside> -->
            <el-main style="padding:0px">
              <template v-if="tableLoading">
                    <div v-loading="valueTableLoading" :style="'height:'+tableHeight+'px'">
                         
                    </div>
                </template>
                <template v-else> 
                    <div :style="'height:'+tableHeight+'px'">
                     <el-collapse v-model="activeNames">
                            <el-collapse-item :name="item.id" v-for="(item,index) in tableData" :key="item.id">
                                <template slot="title">
                                    <span style="padding-left:10px;font-weight:bold;">{{index+1}}、{{item.name}}</span>
                                </template>
                                <div style="padding-left:30px;padding-right:30px;">
                                    <vxe-table resizable border size="mini" ref="FIncomeTable" auto-resize :loading="valueTableLoading"  show-overflow
                                        highlight-current-row highlight-hover-row row-id="id" :data="item.eleData">
                                        <vxe-table-column align="center" title="项目" min-width="200" fixed="left">
                                            <template v-slot="{row}"> 
                                            {{row.ele_name}}
                                            </template>
                                        </vxe-table-column>
                                                <vxe-table-column align="center" title="目标值" min-width="100">
                                                    <template v-slot="{row}"> 
                                                        {{money_format(row.y_tarValue)}}
                                                    </template>
                                                </vxe-table-column>
                                                <vxe-table-column align="center" title="日数据" min-width="100">
                                                    <template v-slot="{row}"> 
                                                         {{money_format(row.dayData)}}
                                                    </template>
                                                </vxe-table-column>
                                                <vxe-table-column align="center" title="月数据" min-width="100">
                                                    <template v-slot="{row}"> 
                                                         {{money_format(row.monthData)}}
                                                    </template>
                                                </vxe-table-column>
                                                <vxe-table-column align="center" title="年数据" min-width="100">
                                                    <template v-slot="{row}"> 
                                                         {{money_format(row.yearData)}}
                                                    </template>
                                                </vxe-table-column>
                                         
                                        <vxe-table-column v-slot="{row}" min-width="70" title="图表分析" align="center" fixed="right">
                                                <el-button style="border:0px" type="primary" size="small" @click="showMonthChart(row)">      
                                                    <span>分析表</span>
                                                </el-button>
                                        </vxe-table-column>
                                    </vxe-table>
                                </div>
                                
                            </el-collapse-item>
                             
                        </el-collapse>
                    </div>
                     
                </template>
            </el-main>
        </el-container>
            <el-dialog :title="dialogTitle1" :visible.sync="dialogVisible1" :width="screenWidth<1600?'90%':'70%'">
                <div v-loading="valueTableLoading">
                    <el-row>
                        <el-col :span="screenWidth<1600?'6':'7'"><div class="chartTitle">当月指标完成率</div></el-col>
                        <el-col :span="screenWidth<1600?'18':'17'"><div class="chartTitle">年度指标完成率(按月统计)</div></el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="screenWidth<1600?'6':'7'">
                            <div style="text-align: center;">
                                <div ref="pieChart1" :class="screenWidth<1600?'pieChart_style_1366X768':'pieChart_style'"></div>
                                <div :class="screenWidth<1600?'pieTitle_1366X768':'pieTitle'">
                                        <div class="pieTitle_Item">
                                        <el-tag style="width:20px;height:20px;background-color: #8078FF;border-radius: 50%;"></el-tag>
                                        <span class="sam_style">实际</span><span class="sam_style">{{aValue}}</span>
                                        </div>
                                        <div class="pieTitle_Item">
                                            <el-tag style="width:20px;height:20px;background-color: #5F57C7;border-radius: 50%;"></el-tag>
                                            <span class="sam_style">目标</span><span class="sam_style">{{tValue}}</span>                             
                                        </div>
                                </div>
                            </div>
                            
                            
                        </el-col>
                        <el-col :span="screenWidth<1600?'18':'17'"><div ref="monthChart" :class="screenWidth<1600?'monthChart_style_1366X768':'monthChart_style'"></div></el-col>
                    </el-row>    
                </div>
                
                
            </el-dialog>

    </el-container>
</template>
<script lang="ts">
import { Component, Vue, Provide, Watch } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from 'vuex-class';
import Accounting from "../components/Accounting.vue"//核算目的
import AmbTree from "../components/AmbTree.vue"//阿米巴树
import { BIPUtil } from "@/utils/Request";
import {BipMenuBtn} from '@/classes/BipMenuBtn' 
let tools = BIPUtil.ServApi;
import echarts from 'echarts';
import moment from "moment";
import {CurrUtils} from '@/utils/CurrUtils'
let currutil = CurrUtils.curr
@Component({
    components: {
        Accounting,
        AmbTree
    }
})
/**
 * 阿米巴数据看板
 */
export default class AmbDataBoard extends Vue {
    @State('bipComHeight', { namespace: 'login' }) height!: number;
    amb_purposes_id:string = "";//核算目的id
    amb_group_ids:any =[];//核算阿米巴key
    fm_date:any =""; //开始时间
    // to_date:any=""; //结束时间 
    calendar_id:any = "";
    tableHeight:any ="500";
    treeHeight:any ="500";
    chartStyle:string = "height :400px;";
    chartOption:any = null;
    tableData:any = [];
    showType:String = '';

    dialogVisible1:boolean = false;
    dialogTitle1:any = "";
    dialogVisible2:boolean = false;
    dialogTitle2:any = "";
    tableLoading:boolean = true;
    valueTableLoading:boolean = false;
    screenWidth:number=1920;

    activeNames:any =  [];
    
    aValue:any=0 //饼状图实际值
    tValue:any=0 //饼状图目标值
     
    async created() {
       this.fm_date = moment(new Date()).add(-1, 'day').format("YYYY-MM-DD")
       // this.fm_date = "2021-10-01"
        this.treeHeight =  this.height -60
        this.tableHeight = this.height -60
        this.screenWidth= document.body.clientWidth;
    }

    async initData(){
        this.tableLoading = true;
        this.valueTableLoading = true;
        if(this.amb_purposes_id !="" && this.amb_group_ids !=""){
            let btn1 = new BipMenuBtn("DLG","数据看板")
            btn1.setDlgType("D")
            btn1.setDlgCont("amb.serv.util.report.DataBoardInvoke*202;0;0");
            let b = JSON.stringify(btn1)
            let prarm = {
                "purpose_id":this.amb_purposes_id,//核算目的
                "group_ids":this.amb_group_ids, //阿米巴集合
                "fm_date":this.fm_date,//开始期间
                "to_date":this.fm_date,   //结束期间
            }
            
            let v = JSON.stringify(prarm);
            let res = await tools.getDlgRunClass(v,b);
            if(res.data.id ==0){ 
               this.tableData = res.data.data.data 
               for (let i = 0; i < this.tableData.length; i++) {
                   const element = this.tableData[i];
                   this.activeNames.push(element.id)
               }
                
            }else{
                this.$notify.error(res.data.message)
            }  
        }else{
            if(this.amb_purposes_id==""){
                this.$notify.error("核算目的不能为空！")
            }else if(this.amb_group_ids.length == 0){
                this.$notify.error("请选择阿米巴！")
            }
        }
        this.tableLoading = false;
        this.valueTableLoading = false;
    }
    
    

    //柱状图表
   async showMonthChart(row:any){
        this.valueTableLoading = true;
        this.dialogVisible1 = true;
        this.dialogTitle1 = row.ele_name;
        let monthData:any = ""; 
        let xAxisData = [];
        let seriesData_0 = [];
        let seriesData_1 = [];
        let seriesData_2 = [];
        console.log(row);
        
        //饼状圆形图
        let option:any =this.showPieChart(row)

       //柱状图
        let chartOption:any = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                type: 'cross',
                crossStyle: {
                    color: '#999'
                    }
                }
            },
            legend: {
                data: ['目标值', '实际完成额', '达成率']
            },
            xAxis: [
                {
                type: 'category',
                data: [],
                axisPointer: {
                    type: 'shadow'
                    }
                }
            ],
            yAxis: [
                {
                type: 'value',
                name: '目标值',
                min: 0,
                axisLabel: {
                    formatter: '{value} '
                }
                },
                {
                type: 'value',
                name: '达成率',
                min: 0,
                axisLabel: {
                    formatter: '{value} %'
                }
                }
            ],
            series: [
                {
                name: '目标值',
                type: 'bar',
                barWith:5,
                data: []

                },
                {
                name: '实际完成额',
                barWith:5,
                type: 'bar',
                data: []
                },
                {
                name: '达成率',
                type: 'line',
                yAxisIndex: 1,
                data: []
                }
            ]
        };
     
        let btn = new BipMenuBtn("DLG","柱状图表数据")
            btn.setDlgType("D")
            btn.setDlgCont("amb.serv.util.report.DataBoardInvoke*203;0;0");
            let b = JSON.stringify(btn)
            let prarm = {
                "purpose_id":this.amb_purposes_id,//核算目的
                "group_ids":this.amb_group_ids, //阿米巴集合
                "fm_date":this.fm_date,//开始期间
                "to_date":this.fm_date,   //结束期间
                // "accumulation":row.accumulation,//开始期间
                // "eleId":row.ele_id,   //结束期间
                "ele_data":row
            }  
            let v = JSON.stringify(prarm);
            let res = await tools.getDlgRunClass(v,b);
            
            if(res.data.id ==0){ 
               monthData = res.data.data.data  
               for(var i =0;i<monthData.length;i++){
                    let itemP = monthData[i];
                    xAxisData.push(itemP.month)
                    seriesData_0.push(parseFloat(itemP.tarValue))
                    seriesData_1.push(parseFloat(itemP.mValue))
                    seriesData_2.push(parseFloat(itemP.CompletionRate))   
                }    
            }
        chartOption.xAxis[0].data = xAxisData
        chartOption.series[0].data = seriesData_0
        chartOption.series[1].data = seriesData_1
        chartOption.series[2].data = seriesData_2  
 
      this.valueTableLoading = false;

      let myChart = echarts.init(this.$refs.monthChart as HTMLCanvasElement); 
        myChart.setOption(chartOption);  
        let myChart1 = echarts.init(this.$refs.pieChart1 as HTMLCanvasElement); 
        myChart1.setOption(option);
        myChart1.dispatchAction({type: 'highlight',seriesIndex: 0,dataIndex: 1});
 
}

    //  饼状图
    showPieChart(row:any){
        let aRate:any = (row.monthData/row.m_tarValue*100).toFixed(2);
        let uRate:any = ((row.m_tarValue-row.monthData)/row.m_tarValue*100).toFixed(2);
        this.aValue = this.money_format(row.monthData)
        this.tValue = this.money_format(row.m_tarValue)
        let option:any = {
            tooltip: {
                trigger: 'item',
               formatter: '{c}'
            },
            color:['#5F57C7','#8078FF'],
            series: [
                {
                    name: '当月指标完成率',
                    type: 'pie',
                    radius: ['50%', '70%'],
                    avoidLabelOverlap: false,
                    label: {
                        show: false,
                        position: 'center'
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: '20',
                            fontWeight: 'bold'
                        }
                    },
                    labelLine: {
                        show: false
                    },
                    data: [
                       // {value: row.m_tarValue>0?row.m_tarValue-row.monthData:0, name: '剩余目标'},
                        //{value: row.monthData, name: '实际'}
                        {value: row.m_tarValue>0?(row.m_tarValue-row.monthData).toFixed(2):0,name: uRate+'%'},
                        {value: row.monthData.toFixed(2) , name: row.m_tarValue>0?aRate+'%':'100%'}  
                    ] 
                }
            ]
        };
        return option;
    }
    
    //核算目的发生变化 value = 核算目的ID
    accChange(value:any){
        this.calendar_id = value.calendar_id
        this.amb_purposes_id = value.id;
       // this.initData();
    }
    
    //阿米巴发生变化
    treeChange(checkData:any){
        this.amb_group_ids = checkData.keys;
        this.initData();
    }  
    //期间发生变化
    fm_dateChange(value:any){
        if(value){
            this.fm_date = moment(value).format("YYYY-MM-DD")
        }else{
            this.fm_date = "";
        }
    }
     money_format(val:any){
       return currutil.currency(val,'',2)
    }
    @Watch("height")
    heightChange() {
        this.treeHeight =  this.height -60
        this.tableHeight = this.height -60
        this.screenWidth= document.body.clientWidth;
    }
}
</script>
<style scoped lang="scss" >
.el-tree-node_content{font-family: "Microsoft YaHei"; font-size:12px !important}
.topdiv1{
    float: left;
    margin-right: 3px;
}
.topdiv1_min{
    float: left;
    margin-right: 3px;
    width: 130px;
}
.topdiv2{
    float: right;
    margin-right: 3px;
}
.chartTitle{
    font-weight:bold;
    text-align: center;
    margin-bottom:10px;
}
 
.sam_style{
    padding:0 3px;
    margin-left: 5px;
    font-size:14px;
    font-weight: bold;
    position: relative;
    top: -4px;
    
} 
.monthChart_style{
    height:360px;
    padding-left:15px;
}
.monthChart_style_1366X768{
     height:280px;
    padding-left:15px;
}
.pieChart_style{
    height:250px;
    position: relative;
    top:10px;
}
.pieChart_style_1366X768{
    height:220px;
    position: relative;
    top:-15px;
}
.pieTitle{
   position: absolute;
   transform: translate(-30%, -20%);
}
.pieTitle_1366X768{
   position: absolute;
   transform: translate(-60%, -50%);
}
.pieTitle_Item{
    position: relative;
    left: 150px;
    margin: 10px 0;
    text-align: left;
}
</style>