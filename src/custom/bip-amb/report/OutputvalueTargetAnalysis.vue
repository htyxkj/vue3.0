<template> 
    <el-container>
        <el-header style="height:45px;padding:0px 10px;border-bottom: 1px solid #CCCCCC;    line-height: 45px;">
            <Accounting @dataChange="accChange" :class="screenWidth<1600?'topdiv1_min':'topdiv1'"></Accounting> 
            <el-date-picker v-model="fm_date"  :class="screenWidth<1600?'topdiv1_min':'topdiv1'" type="month" @change="fm_dateChange"  placeholder="选择日期" size="small"></el-date-picker>
            <div :class="screenWidth<1600?'topdiv1_min':'topdiv1'"><!-- 显示类别 -->
                <el-select v-model="showType" placeholder="指标类型" size="small">
                    <el-option v-for="item in showTypeData" :key="item.id" :label="item.name" :value="item.id"></el-option>
                </el-select>
            </div>
            <accounting-ele-dialog @dataChange="check_accountEle"  :class="screenWidth<1600?'topdiv1_min':'topdiv1'" :purposesId="amb_purposes_id" showEleId="AE20110500004" :showCbox="true"></accounting-ele-dialog>
            <div :class="screenWidth<1600?'topdiv1_min':'topdiv1'">
                <el-button style="border:0px" type="primary" size="small" class="bip_btn_primary" @click="initData">      
                    <i class="el-icon-search"></i>
                    <span>查询</span>
                </el-button>
            </div>
            <!-- <div class="topdiv2">  导出
                <el-button style="border:0px" @click="exportDataEvent">      
                    <i class="el-icon-download"></i>
                     <span>导出</span>
                </el-button>
            </div>  -->
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
                        <table class="tableTitle" >
                            <tr>
                                <th style="text-align: left">收支项目</th>
                            </tr>
                        </table>
                    </div>
                </template>
                <template v-else> 
                    <vxe-table resizable border size="mini" ref="FIncomeTable" auto-resize :loading="valueTableLoading"  show-overflow :height="tableHeight"
                        highlight-current-row highlight-hover-row row-id="element_id" :data="tableData" 
                        :tree-config="{transform: true, rowField: 'element_id', parentField: 'element_parent_id',expandAll: true}">
                        <vxe-table-column field="element_name" align="center" title="收支项目" min-width="200" tree-node fixed="left">
                            <template v-slot="{row}" > 
                            {{row.element_name}}
                            </template>
                        </vxe-table-column>
                        <vxe-table-colgroup v-for="(item,index) in monthlist" :key="index" align="center"  :title="item.month">
                                <vxe-table-column align="center" title="目标值" min-width="100">
                                    <template v-slot="{row}"> 
                                        {{row[item.pdate+"t_value"]}}
                                    </template>
                                </vxe-table-column>
                                <vxe-table-column align="center" title="实际值" min-width="100">
                                    <template v-slot="{row}"> 
                                        {{row[item.pdate+"mc_value"]}}
                                    </template>
                                </vxe-table-column>
                                <vxe-table-column align="center" title="达成率" min-width="100">
                                    <template v-slot="{row}"> 
                                        {{row[item.pdate+"CompletionRate"]}}
                                    </template>
                                </vxe-table-column>
                        </vxe-table-colgroup>
                        
                        

                        <vxe-table-column v-slot="{row}" min-width="70" title="图表分析" align="center" fixed="right">
                                <el-button style="border:0px" type="primary" size="small" @click="showMonthChart(row)">      
                                    <span>分析表</span>
                                </el-button>
                        </vxe-table-column>
                    
                    </vxe-table>
                </template>
            </el-main>
        </el-container>
            <el-dialog :title="dialogTitle1" :visible.sync="dialogVisible1" width="50%">
                <div ref="monthChart" style="height:360px" ></div>
            </el-dialog>

    </el-container>
</template>
<script lang="ts">
import { Component, Vue, Provide, Watch } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from 'vuex-class';
import Accounting from "../components/Accounting.vue"//核算目的
import AccountingEleDialog from "../components/AccountingEleDialog .vue" //核算要素
import AmbTree from "../components/AmbTree.vue"//阿米巴树
import Period from "../components/Period.vue"//阿米期间
import { BIPUtil } from "@/utils/Request";
import {BipMenuBtn} from '@/classes/BipMenuBtn' 
let tools = BIPUtil.ServApi;
import XEUtils, { toJSONString } from 'xe-utils'
import { values } from 'xe-utils/methods';
import QueryEntity from "@/classes/search/QueryEntity";
import moment from "moment";
import echarts from 'echarts';
import XLSX from "xlsx";
import { config } from "node_modules/vue/types/umd";
@Component({
    components: {
        Accounting,
        AmbTree,
        Period,
        AccountingEleDialog
    }
})
/**
 * 产值目标趋势分析（单巴）
 */
export default class OutputvalueTargetAnalysis extends Vue {
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
    monthlist:any =[]
    showTypeData:any = [];  //经营目标类型参照
    showType:String = '';
    amb_accountEle_ids:any=[]; //核算要素
    dialogVisible1:boolean = false;
    dialogTitle1:any = "";
    dialogVisible2:boolean = false;
    dialogTitle2:any = "";
    year_tableData:any=[]; 
    year_monthlist:any=[];
    tableLoading:boolean = true;
    valueTableLoading:boolean = false;
    isTree:boolean =true;
    screenWidth:number=1920;
    async created() {
        this.fm_date = moment(new Date()).add(-1, 'month').format("YYYY-MM")
        // this.to_date = moment(new Date()).add(-1, 'month').format("YYYY-MM")
        this.treeHeight =  this.height -60
        this.tableHeight = this.height -60
        this.screenWidth= document.body.clientWidth;
        this.getCoList();
    }

    async initData(){
        if(this.amb_accountEle_ids.length>0) 
            this.isTree=false;
        this.tableLoading = true;
        this.valueTableLoading = true;
        if(this.amb_purposes_id !="" && this.amb_group_ids !="" && this.showType !="" && this.fm_date !=""){
            let btn1 = new BipMenuBtn("DLG","单巴产值分析")
            btn1.setDlgType("D")
            btn1.setDlgCont("amb.serv.util.report.OutputValueInvoke*202;0;0");// 产值目标
            let b = JSON.stringify(btn1)
            let prarm = {
                "purpose_id":this.amb_purposes_id,//核算目的
                "group_ids":this.amb_group_ids, //阿米巴集合
                "target_type":this.showType, //指标类型
                "fm_date":this.fm_date,//开始期间
                "to_date":this.fm_date,   //结束期间
                "amb_accountEle_ids":this.amb_accountEle_ids //核算要素ID集合
            }
            
            let v = JSON.stringify(prarm);
            let res = await tools.getDlgRunClass(v,b);
            if(res.data.id ==0){
               this.tableData = res.data.data.tardata 
               console.log(this.tableData);
               
               this.monthlist = res.data.data.monthlist 
               this.year_tableData = res.data.data.y_tardata
               this.year_monthlist = res.data.data.y_monthlist
            }else{
                this.$notify.error(res.data.message)
            }  
        }else{
            if(this.amb_purposes_id==""){
                this.$notify.error("核算目的不能为空！")
            }else if(this.showType.length ==0){
                this.$notify.error("指标类型不能为空！")
            }else if(this.amb_group_ids.length == 0){
                this.$notify.error("请选择阿米巴！")
            }
        }
        this.tableLoading = false;
        this.valueTableLoading = false;
    }
    
    //月度目标达成率图表
    showMonthChart(row:any){
        this.dialogVisible1 = true;
        this.dialogTitle1 = row.element_name;
        let xAxisData = [];
        let seriesData_0 = [];
        let seriesData_1 = [];
        let seriesData_2 = [];
       
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

      
       for(var i =0;i<this.monthlist.length;i++){
            let itemP = this.monthlist[i];
            
            if(itemP.type=="0"){
                xAxisData.push(itemP.month)
                seriesData_0.push(parseFloat(row[itemP.pdate+"t_value"]))
                seriesData_1.push(parseFloat(row[itemP.pdate+'mc_value']))
                seriesData_2.push(parseFloat(row[itemP.pdate+'CompletionRate']))
            } 
        }
        
        chartOption.xAxis[0].data = xAxisData
        chartOption.series[0].data = seriesData_0
        chartOption.series[1].data = seriesData_1
        chartOption.series[2].data = seriesData_2
      
        
    setTimeout(() => {
            let myChart = echarts.init(this.$refs.monthChart as HTMLCanvasElement); 
            myChart.setOption(chartOption);  
        }, 200);
    }

    


    //核算目的发生变化 value = 核算目的ID
    accChange(value:any){
        this.calendar_id = value.calendar_id
        this.amb_purposes_id = value.id;
       // this.initData();
    }
    //指标类型发生变化
    /* showTypeChange(value:any){
        this.showType = value.id;
    } */
    //期间发生变化
    fm_dateChange(value:any){
        if(value){
            this.fm_date = moment(value).format("YYYY-MM")       
        }else{
            this.fm_date = "";
        }
    }
    //期间发生变化
  /*   to_dateChange(value:any){
        this.to_date = moment(value).format("YYYY-MM")  
    } */
    //阿米巴发生变化
    treeChange(checkData:any){
        this.amb_group_ids = checkData.keys;
       // this.initData();
    }
    //选择核算要素
    check_accountEle(checkData:any){
        this.amb_accountEle_ids = checkData.keys;
    }
    //导出excel
    exportDataEvent () {
        let refT:any = this.$refs["FIncomeTable"]
        if(refT){
            refT.exportData({ type: 'csv' })
        }
        // // 转换数据
        // let table = this.$refs.xGrid2.$el.querySelector('.body--wrapper>.vxe-table--body')
        // let book = XLSX.utils.book_new()
        // let sheet = XLSX.utils.table_to_sheet(table)
        // XLSX.utils.book_append_sheet(book, sheet)
        // let wbout = XLSX.write(book, { bookType: 'xlsx', bookSST: false, type: 'binary' })
        // let blob = new Blob([this.toBuffer(wbout)], { type: 'application/octet-stream' })
        // // 保存导出
        // FileSaver.saveAs(blob, '数据导出.xlsx')
    } 
    // 获取经营目标类型参照
    async getCoList() {
        let qe: QueryEntity = new QueryEntity("", "");
        qe.page.currPage = 1;
        qe.page.pageSize = 200;
        let cc = await tools.getBipInsAidInfo("TYPE_TARGET1", 210, qe);
        this.showTypeData = cc.data.data.data.values;
       
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
</style>