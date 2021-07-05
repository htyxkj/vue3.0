<template> 
    <el-row>
        <el-container>
            <el-header style="height:45px;padding:0px 10px;border-bottom: 1px solid #CCCCCC;    line-height: 45px;">
                <Accounting @dataChange="accChange" class="topdiv1"></Accounting>
                <el-date-picker v-model="fm_date" format="yyyy-MM-dd" class="topdiv1" type="date" @change="fm_dateChange" placeholder="选择日期" size="small"></el-date-picker>
                <div class="topdiv1"><!-- 显示类别 -->
                    <el-select v-model="showType" placeholder="请选择" size="small">
                        <el-option v-for="item in showTypeData" :key="item.id" :label="item.label" :value="item.id"></el-option>
                    </el-select>
                    &nbsp;&nbsp;
                    <el-button style="border:0px" type="primary" size="small" @click="initData">      
                        <i class="el-icon-search"></i>
                        <span>查询</span>
                    </el-button>
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
                <el-aside width="300px">
                    <amb-tree :style="'height:'+tableHeight+'px'" @dataChange="treeChange" :purposesId="amb_purposes_id" :showCbox="true" ></amb-tree>
                </el-aside>
                <el-main style="padding:0px">
                    <template v-if="tableLoading">
                        <div v-loading="valueTableLoading" :style="'height:'+tableHeight+'px'">
                            <table class="tableTitle">
                                <tr>
                                    <th style="text-align: left">收支项目</th>
                                </tr>
                            </table>
                        </div>
                    </template>
                    <template v-else>
                        <vxe-table resizable size="mini" ref="ProfitLossAspectTable" auto-resize :loading="tableLoading" show-overflow row-id="element_id" 
                            border stripe highlight-hover-row :height="tableHeight" :tree-config="{children: 'children',expandRowKeys: this.defaultExpandKeys }"
                            :data="tableData" highlight-current-row>
                            <vxe-table-column field="element_name" title="收支项目" min-width="200" tree-node></vxe-table-column>
                            <vxe-table-column v-for="(itemP,index) in groups" :key="index" min-width="100" :title="itemP.name+'发生额'" align="center">
                                <!-- <vxe-table-column title="发生额" align="right" min-width="100"> -->
                                    <template v-slot="{row}"> 
                                        {{getFormatValue(row[itemP.key+'month_money'])}}
                                    </template>
                                <!-- </vxe-table-column> -->
                                <!-- <vxe-table-column title="结构比例" align="right" min-width="100">
                                    <template v-slot="{row}"> 
                                        {{ row[itemP.key+'month_rate'] }}
                                    </template>
                                </vxe-table-column> -->
                            </vxe-table-column>
                            <vxe-table-column v-slot="{row}" min-width="100" title="操作" align="center" fixed="right">
                                <el-button style="border:0px" type="primary" size="small" @click="showChart(row)">      
                                    <span>图表</span>
                                </el-button>
                            </vxe-table-column>
                        </vxe-table>
                    </template>
                </el-main>
            </el-container>
        </el-container>
        <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="50%">
            <div ref="ProfitLossAspectChart" style="height:360px" ></div>
        </el-dialog>
    </el-row>
</template>
<script lang="ts">
import { Component, Vue, Provide, Watch } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from 'vuex-class';
import Accounting from "../components/Accounting.vue"//核算目的
import AmbTree from "../components/AmbTree.vue"//阿米巴树
import { BIPUtil } from "@/utils/Request";
import {BipMenuBtn} from '@/classes/BipMenuBtn'
let tools = BIPUtil.ServApi;
import XLSX from "xlsx"
import moment from 'moment'
import {CurrUtils} from '@/utils/CurrUtils'
let currutil = CurrUtils.curr
import echarts from 'echarts'; 
@Component({
    components: {
        Accounting,
        AmbTree
    }
})
/**
 * 损益横比
 */
export default class ProfitLossAspect  extends Vue {
    
    @State('bipComHeight', { namespace: 'login' }) height!: number;
    amb_purposes_id:string = "";//核算目的id
    amb_period_kj:string = "";//核算目的中的会计期间ID
    amb_group_ids:any =[];//核算阿米巴key
    fm_date:any = "";//期间
    tableData:any=[];
    tableHeight:any ="500";
    tableLoading:boolean = true;
    valueTableLoading:boolean = false;
    defaultExpandKeys:any= [];
    groups:any =[];//数据阿米巴集合

    showType:any = 1;//选中显示类别 默认
    showTypeData:any =[
        {id:1,label:"按元显示"},
        {id:1000,label:"按千元显示"},
        {id:10000,label:"按万元显示"},
        {id:100000000,label:"按亿元显示"}
    ];
    dialogVisible:boolean = false;
    dialogTitle:any = "";
    async created() {
        this.fm_date = moment(new Date()).add(-1, 'days').format("YYYY-MM-DD")
        this.tableHeight =  this.height - 60
    }
    mounted() { 
    }
    async initData(){
        this.groups = [];
        this.tableData =[];
        this.tableLoading = true;
        this.valueTableLoading = true;
        if(this.amb_purposes_id !="" && this.amb_group_ids.length>0 && this.fm_date){
            let btn1 = new BipMenuBtn("DLG"," 损益横比")
            btn1.setDlgType("D")
            btn1.setDlgCont("amb.serv.util.report.IncomeInvoke*204;0;0");//职能损益表
            let b = JSON.stringify(btn1)
            let prarm = {
                "purpose_id":this.amb_purposes_id,
                "group_ids":this.amb_group_ids, 
                "fm_date":this.fm_date,
                "to_date":this.fm_date   
            }
            let v = JSON.stringify(prarm);
            let res = await tools.getDlgRunClass(v,b);
            if(res.data.id ==0){
                this.tableData = res.data.data.data 
                this.defaultExpandKeys = res.data.data.expandRowKeys;
                this.groups = res.data.data.period
                // for(var i =0;i<tdata.length;i++){
                //     let d = tdata[i];
                //     let elid = d.element_id;
                //     let elIndex = element_ids.indexOf(elid);
                //     element_ids.push(elid);
                //     let data = td[elIndex];
                //     if(elIndex ==-1){
                //         data = {};
                //         data.element_name = d.element_name;
                //         data.level = d.level
                //         data[d.group_id+'month_money'] = d.tmonth_money
                //         data[d.group_id+'month_rate'] = d.month_rate 
                //         td.push(data);
                //     }else{
                //         data[d.group_id+'month_money'] = d.tmonth_money
                //         data[d.group_id+'month_rate'] = d.month_rate 
                //         td[elIndex] = data;
                //     }
                    
                //     if(groups_ids.indexOf(d.group_id) ==-1){
                //         let onep:any = {};
                //         onep.key = d.group_id
                //         onep.name = d.group_name
                //         groups_ids.push(d.group_id)
                //         this.groups.push(onep);
                //     }
                // }
            }else{
                this.$notify.error(res.data.message)
            }
        }
        this.tableLoading = false;
        this.valueTableLoading = false;
    }
    //显示图表
    showChart(row:any){
        this.dialogVisible = true;
        let legendData = [];
        let seriesData = [];
        this.dialogTitle = row.element_name;
        let chartOption:any = {
            color:["#3AA1FF","#975FE5","#F2637B","#FBD437","#4ECB73","#5AD4D4"],
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b} : {c} '
            },
            legend: {
                type: 'scroll',
                orient: 'vertical',
                right: 10,
                top: 20,
                bottom: 20,
                data: [],
            },
            xAxis: {
                type: 'value',
                splitLine: {
                    lineStyle: {
                        type: 'dashed'
                    }
                }
            },
            yAxis: {
                type: 'category',
                axisLine: {show: false},
                axisLabel: {show: false},
                axisTick: {show: false},
                splitLine: {show: false},
                data: []
            },
            series: [
                {
                    name: '巴',
                    type: 'bar',
                    label: {
                        show: true,
                        formatter: '{b}'
                    },
                    data: [],
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };
        for(var i =0;i<this.groups.length;i++){
            let itemP = this.groups[i];
            legendData.push(itemP.name)
            let vl = {value:row[itemP.key+'month_money'],name:itemP.name}
            seriesData.push(vl)
        }
        chartOption.legend.data = legendData
        chartOption.yAxis.data = legendData
        chartOption.series[0].data = seriesData
        setTimeout(() => {
            let myChart = echarts.init(this.$refs.ProfitLossAspectChart as HTMLCanvasElement); 
            myChart.setOption(chartOption);  
        }, 200);
    }
    getUpLevel(resData:any,i:any,level:any){
        let data = null;
        for(;i>=0;i--){
            let od = resData[i];
            if(od.level<level){
                data = od
                break;
            }
        }
        return data;
    }
    //核算目的发生变化 value = 核算目的ID
    accChange(value:any){
        this.amb_purposes_id = value.id;
        this.amb_period_kj = value.calendar_id;
        // this.initData();
    }
    //期间发生变化
    fm_dateChange(value:any){
        this.fm_date = moment(value).format("YYYY-MM-DD")
        // this.initData();
    }
    //阿米巴发生变化
    treeChange(checkData:any){
        this.amb_group_ids = checkData.keys;
        // this.initData();
    }
    //导出excel
    exportDataEvent () {
        this.exportEvent()
    }
    exportEvent () {
        let tb:any = this.$refs.ProfitLossAspectTable;
        if(tb){
            // 转换数据
            let header = tb.$el.querySelector('.body--wrapper>.vxe-table--header')
            let hesheet = XLSX.utils.table_to_sheet(header)
            let headerbook:any = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(headerbook, hesheet)
            let jsonArr = [];
            for(var i=0;i<this.tableData.length;i++){
                let json:any = {}
                let cellID = 0;
                let d1 = this.tableData[i];
                let v = this.createCellPos(cellID);
                cellID++;
                json[v] = d1.element_name;
                for(var j=0;j<this.groups.length;j++){
                    let itemP = this.groups[j];
                    v = this.createCellPos(cellID);
                    cellID++;
                    json[v] = d1[itemP.key+'month_money'];
                    v = this.createCellPos(cellID);
                    cellID++;
                    json[v] = d1[itemP.key+'month_rate'];
                }
                jsonArr.push(json)
            }
            XLSX.utils.sheet_add_json(headerbook.Sheets.Sheet1, jsonArr , {skipHeader: true, origin: "A3"});
            let wbout = XLSX.write(headerbook, { bookType: 'xlsx', bookSST: false, type: 'binary' })
            let blob = new Blob([this.toBuffer(wbout)], { type: 'application/octet-stream' })
            // 保存导出
            this.exportFilesServ(blob, '损益横比')
        }
    }
    /**导出Excel */
    exportFilesServ(content:any,title:string){
        const blob = new Blob([content]);
        const fileName = title+'.xlsx'
        if ('download' in document.createElement('a')) { // 非IE下载
        const elink = document.createElement('a')
        elink.download = fileName
        elink.style.display = 'none'
        elink.href = URL.createObjectURL(blob)
        document.body.appendChild(elink)
        elink.click()
        URL.revokeObjectURL(elink.href) // 释放URL 对象
        document.body.removeChild(elink)
        } else { // IE10+下载
        navigator.msSaveBlob(blob, fileName)
        }
    }
    toBuffer (wbout:any) {
        let buf = new ArrayBuffer(wbout.length)
        let view = new Uint8Array(buf)
        for (let index = 0; index !== wbout.length; ++index) view[index] = wbout.charCodeAt(index) & 0xFF
        return buf
    }
    createCellPos( n:any ){
        var ordA = 'A'.charCodeAt(0);
        var ordZ = 'Z'.charCodeAt(0);
        var len = ordZ - ordA + 1;
        var s = "";
        while( n >= 0 ) {
            s = String.fromCharCode(n % len + ordA) + s;
            n = Math.floor(n / len) - 1;
        }
        return s;
    }
    getFormatValue(value:any){
        let cc = value/this.showType;
        return currutil.currency(cc,'',2);
    }
    @Watch("height")
    heightChange() {
        this.tableHeight =  this.height -60
    }
}
</script>
<style scoped lang="scss" >
.topdiv1{
    float: left;
    margin-right: 3px;
}
.topdiv2{
    float: right;
    margin-right: 3px;
}
.tableTitle{
    width: 100%;
    font-size: 12px;
    background-color: #f8f8f9;
    tr:nth-child(1){
        width: 3.125rem;
    }
    tr{
        background-color: #f8f8f9;
        th{
            border-right: 1px solid #f0f0f0;
            color: #606266;
            padding: 6px;
            line-height: 24px;
            height: 24px;
            background-color: #f8f8f9;
            background-size: 1px 100%,100% 1px;
            background-position: 100% 0,100% 100%;
        }
    }
}
</style>