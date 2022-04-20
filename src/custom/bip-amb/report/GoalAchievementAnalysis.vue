<template> 
    <el-container>
        <el-header style="height:45px;padding:0px 10px;border-bottom: 1px solid #CCCCCC;    line-height: 45px;">
            <Accounting @dataChange="accChange" :class="screenWidth<1600?'topdiv1_min':'topdiv1'"></Accounting> 
            <Period :class="screenWidth<1600?'topdiv1_min':'topdiv1'" :calendar_id="calendar_id" @dataChange="fm_Period_change"></Period>
            <!-- <Period class="topdiv1" :calendar_id="calendar_id" @dataChange="to_Period_change"></Period> -->
            <div :class="screenWidth<1600?'topdiv1_min':'topdiv1'"><!-- 显示类别 -->
                <el-select v-model="showType" placeholder="请选择" size="small">
                    <el-option v-for="item in showTypeData" :key="item.id" :label="item.name" :value="item.id"></el-option>
                </el-select>
            </div>
           
            <div class="topdiv2"><!-- 导出 -->
                <el-button style="border:0px" @click="exportDataEvent">      
                    <i class="el-icon-download"></i>
                     <span>导出</span>
                </el-button>
            </div>
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
                <vxe-table resizable size="mini" ref="FIncomeTable" auto-resize  show-overflow
                    border="inner" stripe highlight-hover-row :height="tableHeight"
                    :data="tableData">
                    <vxe-table-column field="basicelements" title="基准要素项" width="150"></vxe-table-column>
                    <vxe-table-column field="targettype" title="目标类型" width="150"></vxe-table-column>
                    <vxe-table-column field="act_target" title="基准要素实际值" width="150"></vxe-table-column>
                    <vxe-table-column field="target" title="目标值" width="150"></vxe-table-column>
                    <vxe-table-column field="act_com" title="实际完成" width="150"></vxe-table-column>
                    <vxe-table-column field="com_rate" title="差异" width="150"></vxe-table-column>
                </vxe-table>
            </el-main>
        </el-container>
    </el-container>
</template>
<script lang="ts">
import { Component, Vue, Provide, Watch } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from 'vuex-class';
import Accounting from "../components/Accounting.vue"//核算目的
import AmbTree from "../components/AmbTree.vue"//阿米巴树
import Period from "../components/Period.vue"//阿米期间
import BipChart from "@/components/chart/BipChart.vue"
import { BIPUtil } from "@/utils/Request";
import {BipMenuBtn} from '@/classes/BipMenuBtn'
let tools = BIPUtil.ServApi;
import XEUtils from 'xe-utils'
import { values } from 'xe-utils/methods';
import QueryEntity from "@/classes/search/QueryEntity";
@Component({
    components: {
        Accounting,
        AmbTree,
        Period,
        BipChart
    }
})
/**
 * 经营趋势分析
 */
export default class GoalAchievementAnalysis extends Vue {
    @State('bipComHeight', { namespace: 'login' }) height!: number;
    amb_purposes_id:string = "";//核算目的id
    amb_group_ids:any =[];//核算阿米巴key
    fm_period_id:any = "";//开始期间
    to_period_id:any = "";//结束期间
    calendar_id:any = "";
    tableHeight:any ="500";
    treeHeight:any ="500";
    chartStyle:string = "height :400px;";
    chartOption:any = null;
    tableData:any = [];
    showTypeData:any = [];  //经营目标类型参照
    showType:String = '';
    screenWidth:number=1920;
    async created() {
        this.treeHeight =  this.height -60
        this.tableHeight = this.height -60
        // this.initChartOption();
        this.getCoList();
    }
     mounted() { 
        this.screenWidth= document.body.clientWidth;
    }
    initChartOption(){
        this.chartOption = null;
        return  { 
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: ['收入','成本','利润']
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            }, 
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: []
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    name: '收入',
                    type: 'line',
                    stack: '总量',
                    data: []
                },
                {
                    name: '成本',
                    type: 'line',
                    stack: '总量',
                    data: []
                },
                {
                    name: '利润',
                    type: 'line',
                    stack: '总量',
                    data: []
                }
            ]
        };
    }
    async initData(){
        let option:any = this.initChartOption();
        if(this.amb_purposes_id !="" && this.amb_group_ids.length>0 && this.fm_period_id && this.to_period_id){
            let btn1 = new BipMenuBtn("DLG","经营趋势分析")
            btn1.setDlgType("D")
            btn1.setDlgCont("amb.serv.util.report.ProfitsInvoke*202;0;0");//职能损益表
            let b = JSON.stringify(btn1)
            let prarm = {
                "purpose_id":this.amb_purposes_id,//核算目的
                "group_ids":this.amb_group_ids, //阿米巴集合
                "fm_period_id":this.fm_period_id,//开始期间
                "to_period_id":this.to_period_id   //结束期间
            }

            let v = JSON.stringify(prarm);
            let res = await tools.getDlgRunClass(v,b);
            let tdata = []; 
            let xAxisData = [];
            if(res.data.id ==0){
                tdata = res.data.data.data  
                for(var i=0;i<tdata.length;i++){
                    let row = tdata[i];
                    option.xAxis.data.push(row.period_name);
                    option.series[0].data.push(parseFloat(row.in_money).toFixed(2))
                    option.series[1].data.push(parseFloat(row.out_money).toFixed(2))
                    option.series[2].data.push(parseFloat(row.bal_money).toFixed(2))
                } 
                this.chartOption = option
            }else{
                this.$notify.error(res.data.message)
            }
        }
    }
    
    //核算目的发生变化 value = 核算目的ID
    accChange(value:any){
        this.calendar_id = value.calendar_id
        this.amb_purposes_id = value.id;
        // this.initData();
    }
    //期间发生变化
    fm_Period_change(value:any){
        this.fm_period_id = value;
        // this.initData();
    }
    //期间发生变化
    to_Period_change(value:any){
        this.to_period_id = value;
        // this.initData();
    }
    //阿米巴发生变化
    treeChange(checkData:any){
        this.amb_group_ids = checkData.keys;
        // this.initData();
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
        let cc = await tools.getBipInsAidInfo("TYPE_TARGET", 210, qe);
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