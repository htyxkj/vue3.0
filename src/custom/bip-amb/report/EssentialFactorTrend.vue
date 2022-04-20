<template> 
    <el-container>
        <el-header style="height:45px;padding:0px 10px;border-bottom: 1px solid #CCCCCC;    line-height: 45px;">
            <Accounting @dataChange="accChange" :class="screenWidth<1600?'topdiv1_min':'topdiv1'"></Accounting>
            <el-date-picker v-model="fm_date" format="yyyy-MM-dd" :class="screenWidth<1600?'topdiv1_min':'topdiv1'" type="date" @change="fm_dateChange" placeholder="选择日期" size="small"></el-date-picker>
            <el-date-picker v-model="to_date" format="yyyy-MM-dd" :class="screenWidth<1600?'topdiv1_min':'topdiv1'" type="date" @change="to_dateChange" placeholder="选择日期" size="small"></el-date-picker>
            <amb-tree-dialog @dataChange="treeChange" :class="screenWidth<1600?'topdiv1_min':'topdiv1'" :purposesId="amb_purposes_id" :showCbox="false" ></amb-tree-dialog>
            <div :class="screenWidth<1600?'topdiv1_min':'topdiv1'"><!-- 显示类别 -->
                <el-select v-model="showType" placeholder="请选择" size="small">
                    <el-option v-for="item in showTypeData" :key="item.id" :label="item.label" :value="item.id"></el-option>
                </el-select>
            </div>
            <div :class="screenWidth<1600?'topdiv1_min':'topdiv1'" style="width:71px;">
                <el-button style="border:0px" type="primary" size="small" class="bip_btn_primary" @click="initData">      
                    <i class="el-icon-search"></i>
                    <span>查询</span>
                </el-button>
            </div>
            
            <div class="topdiv2" style="width:80px;"><!-- 导出 -->
                <el-button style="border:0px;" @click="exportDataEvent">      
                    <i class="el-icon-download"></i>
                    <span>导出</span>
                </el-button>
            </div>
            <div class="topdiv2" style="width:80px;"><!-- 刷新 -->
                <el-button style="border:0px;" @click="initData">      
                    <i class="el-icon-refresh-right"></i>
                    <span>刷新</span>
                </el-button>
            </div>
             <div class="topdiv2"><!-- 显示隐藏列 -->
                <el-button style="border:0px" @click="showExpData">      
                    <span>显示扩展指标</span>
                </el-button>
            </div>
        </el-header>
        <el-container>
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
                    <vxe-table resizable size="mini" ref="ProfitLossTrendTable" auto-resize :loading="valueTableLoading" show-overflow row-id="element_id" highlight-current-row
                        border stripe highlight-hover-row :height="tableHeight" :tree-config="{children: 'children',expandRowKeys: this.defaultExpandKeys }"
                        @cell-dblclick="cellDBClick"
                        :data="tableData">
                        <vxe-table-column field="element_name" title="收支项目" min-width="200" fixed="left" tree-node>
                            <template v-slot="{row}"> 
                                {{ row.element_name }}
                            </template>
                        </vxe-table-column>
                        <vxe-table-column v-for="(itemP,index) in period" :key="index" min-width="120" :title="itemP.name+'发生额'" align="right">
                            <template v-slot="{row}"> 
                                    {{getFormatValue(row[itemP.key+'month_money'])}}
                                </template>
                            <!-- <vxe-table-column title="发生额" min-width="100" align="right">
                                <template v-slot="{row}"> 
                                    {{getFormatValue(row[itemP.key+'month_money'])}}
                                </template>
                            </vxe-table-column> -->
                            <!-- <vxe-table-column title="结构比例"  min-width="100" align="right">
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
        <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="50%">
            <div ref="EssentialFactorTrendChart" style="height:360px" ></div>
        </el-dialog>
    </el-container>
</template>
<script lang="ts">
import { Component, Vue, Provide, Watch } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from 'vuex-class';
import Accounting from "../components/Accounting.vue";//核算目的
import AmbTreeDialog from "../components/AmbTreeDialog.vue";//阿米巴树
import { BIPUtil } from "@/utils/Request";
import {BipMenuBtn} from '@/classes/BipMenuBtn';
let tools = BIPUtil.ServApi;
import XLSX from "xlsx";
import moment from 'moment';
import {CurrUtils} from '@/utils/CurrUtils';
import { template } from "node_modules/xe-utils";
import echarts from 'echarts';
let currutil = CurrUtils.curr
import _ from 'lodash'
@Component({
    components: {
        Accounting,
        AmbTreeDialog,
    }
})
/**
 * 单巴指标趋势分析
 */
export default class EssentialFactorTrend extends Vue {
    @State('bipComHeight', { namespace: 'login' }) height!: number;
    amb_purposes_id:string = "";//核算目的id
    amb_group_ids:any =[];//核算阿米巴key
    fm_date:any = "";//期间
    to_date:any = "";//期间
    tableData:any=[];
    tableHeight:any ="500";
    tableLoading:boolean = true;
    valueTableLoading:boolean = false;
    showType:any = 1;//选中显示类别 默认
    defaultExpandKeys:any=[];
    period:any =[];//期间集合
    res:any; //展示数据
    period_fm_date:any = null;
    period_to_date:any = null;
    chartOption:any = null;
    dialogVisible:boolean = false;
    dialogTitle:any = "";
    screenWidth:number=1920;
    excelData:any=[];
    showTypeData:any =[
        {id:1,label:"按元显示"},
        {id:1000,label:"按千元显示"},
        {id:10000,label:"按万元显示"},
        {id:100000000,label:"按亿元显示"}
    ];

    isCollapse:boolean=true;
    showExp:boolean = false;
    allTableData:any = []
    async created() {
        this.fm_date = moment(new Date()).add(-1, 'days').format("YYYY-MM-DD")
        this.to_date = moment(new Date()).add(-1, 'days').format("YYYY-MM-DD")
        this.tableHeight =  this.height - 60
        this.screenWidth= document.body.clientWidth;
    }
    mounted() { 
        
    }
    async initData(){
        this.period=[];
        this.tableData =[];
        this.defaultExpandKeys = [];
        this.tableLoading = true;
        this.valueTableLoading = true;
        if(this.amb_purposes_id !="" && this.amb_group_ids.length>0 && this.fm_date){
            let btn1 = new BipMenuBtn("DLG","损益趋势分析")
            btn1.setDlgType("D")
            btn1.setDlgCont("amb.serv.util.report.IncomeInvoke*203;0;0");//职能损益表
            let b = JSON.stringify(btn1)
            let prarm = {
                "purpose_id":this.amb_purposes_id,
                "group_ids":this.amb_group_ids, 
                "fm_date":this.fm_date,
                "to_date":this.to_date   
            }
            let v = JSON.stringify(prarm);
            let res = await tools.getDlgRunClass(v,b);
            let tdata = [];
            let period_ids:any = [];
            if(res.data.id ==0){
                tdata = res.data.data.data
                this.allTableData = tdata
                this.defaultExpandKeys = res.data.data.expandRowKeys;
                this.period = res.data.data.period

                 this.tableData = _.filter(tdata,(item:any)=>{
                    return item.isShow==1
                });
            }else{
                this.$notify.error(res.data.message)
               
            }
        }
        this.tableLoading = false;
        this.valueTableLoading = false;
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
    showExpData(){
        this.showExp = !this.showExp
        if(this.showExp){
            this.tableData = this.allTableData
        }else{
            this.tableData = _.filter(this.allTableData,(item:any) => {
                return item.isShow == 1;
            });
        }
    }
    //显示折线图表
    showChart(row:any){
        this.dialogVisible = true;
        this.dialogTitle = row.element_name;
        let xAxisData = [];
        let seriesData = [];
       
        let chartOption:any = {
            tooltip: {
                trigger: 'item',
                formatter: '{b}{a}:<br/> {c} '
            },
            xAxis: {
                type: 'category',
                axisLine: {show: true},
                axisLabel: {show: true},
                axisTick: {show: false},
                splitLine: {show: false},
                data: []
            },
            yAxis: {
                type: 'value',
                splitLine: {
                    lineStyle: {
                        type: 'dashed'
                    }
                }
            },
            series: [
                {
                name:'发生额',
                type: 'line',
                data: []
                }
            ]
        };
       for(var i =0;i<this.period.length;i++){
            let itemP = this.period[i];
            xAxisData.push(itemP.name)
            seriesData.push(row[itemP.key+'month_money'])
        }
        chartOption.xAxis.data = xAxisData
        chartOption.series[0].data = seriesData

        setTimeout(() => {
            let myChart = echarts.init(this.$refs.EssentialFactorTrendChart as HTMLCanvasElement); 
            myChart.setOption(chartOption);  

          
        }, 200);
    }


    //核算目的发生变化 value = 核算目的ID
    accChange(value:any){
        this.amb_purposes_id = value.id;
        this.initPeriodDate();
    }
    //期间发生变化
    fm_dateChange(value:any){
        if(value){
            this.fm_date = moment(value).format("YYYY-MM-DD")
            this.initPeriodDate();
        }else{
            this.fm_date = "";
        }
    }
    //期间发生变化
    to_dateChange(value:any){
        if(value){
            this.to_date = moment(value).format("YYYY-MM-DD")
            this.initPeriodDate();
        }else{
            this.to_date = "";
        }
    }
    //阿米巴发生变化
    treeChange(checkData:any){
        this.amb_group_ids = checkData.keys;
    }
    
    /**
     * 获取期间的开始时间结束时间
     */
    async initPeriodDate(){
        let btn1 = new BipMenuBtn("DLG","职能式损益表")
        btn1.setDlgType("D")
        btn1.setDlgCont("amb.serv.util.report.IncomeInvoke*205;0;0");//职能损益表
        let b = JSON.stringify(btn1)
        let prarm = {
            "purpose_id":this.amb_purposes_id,
            "group_ids":this.amb_group_ids, 
            "fm_date":this.fm_date,
            "to_date":this.to_date   
        }
        let v = JSON.stringify(prarm);
        let res = await tools.getDlgRunClass(v,b);
        if(res.data.id == 0){
            let fm_date = res.data.data.fm_date;
            this.period_fm_date = moment(fm_date).format("YYYY-MM-DD")+" 00:00:00"
            let to_date = res.data.data.to_date;
            this.period_to_date = moment(to_date).format("YYYY-MM-DD")+" 23:59:59"
        }
    }
    //单元格双击
    cellDBClick(env:any){
        let jsontj:any = {
            purpose_id:this.amb_purposes_id,
            fm_group_id:this.amb_group_ids[0],
            element_id:env.row.element_id,
            fm_date:this.period_fm_date+"~"+this.period_to_date
        };
        if(this.period_fm_date == null || this.period_to_date == null){
            jsontj.fm_date = "";
        }
        this.$router.push({
            path:'/layout',
            name:'layout',
            params:{method:"BL",pmenuid:'300504',jsontj:jsontj },
            query: {pbuid:'300504',pmenuid:'300504'}
        })
    }
    //导出excel
    exportDataEvent () {
        this.exportEvent()
    }
    exportEvent () {
        let tb:any = this.$refs.ProfitLossTrendTable;
        if(tb){
            // 转换数据
            let header = tb.$el.querySelector('.body--wrapper>.vxe-table--header')
            let hesheet = XLSX.utils.table_to_sheet(header)
            let headerbook:any = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(headerbook, hesheet)
          /*   let jsonArr = [];
            for(var i=0;i<this.tableData.length;i++){
                let json:any = {}
                let cellID = 0;
                let d1 = this.tableData[i];
                let v = this.createCellPos(cellID);
                cellID++;
                json[v] = d1.element_name;
                for(var j=0;j<this.period.length;j++){
                    let itemP = this.period[j];
                    v = this.createCellPos(cellID);
                    cellID++;
                    json[v] = d1[itemP.key+'month_money'];
                    v = this.createCellPos(cellID);
                    cellID++;
                    json[v] = d1[itemP.key+'month_rate'];
                }
                jsonArr.push(json)
            } */
            this.excelData = [];
            this.formatJson(this.tableData,this.period);

            XLSX.utils.sheet_add_json(headerbook.Sheets.Sheet1, this.excelData , {skipHeader: true, origin: "A2"});
            let wbout = XLSX.write(headerbook, { bookType: 'xlsx', bookSST: false, type: 'binary' })
            let blob = new Blob([this.toBuffer(wbout)], { type: 'application/octet-stream' })
            // 保存导出
          this.exportFilesServ(blob, '损益趋势分析')
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
//处理导出数据
    formatJson(jsonData:any,period:any) { 
        jsonData.map((v:any, index:any) => {
        let tempArr:any = []
        if(v.level==1)
            v.element_name="  "+v.element_name
        if(v.level==2)
            v.element_name="    "+v.element_name
        if(v.level==3)
            v.element_name="      "+v.element_name
        if(v.level==4)
            v.element_name="        "+v.element_name
        if(v.level==5)
            v.element_name="          "+v.element_name
        if(v.level==6)
            v.element_name="            "+v.element_name
        tempArr.push(v.element_name);
        for(var i=0;i<period.length;i++){
            let itemP = period[i]
            tempArr.push(v[itemP.key+'month_money'])
        }
        this.excelData.push(tempArr);
        if(v.children && v.children.length>0){
            //如果有children进行递归
            this.formatJson(v.children,period)
        }
      });
    }

    getFormatValue(value:any){
        let cc = value/this.showType;
        return currutil.currency(cc,'',2);
    }
    @Watch("height")
    heightChange() {
        this.tableHeight =  this.height -60
        this.screenWidth= document.body.clientWidth;
    }
 
   
}
</script>
<style scoped lang="scss" >
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
            background-color: #f8f8f9;
            background-size: 1px 100%,100% 1px;
            background-position: 100% 0,100% 100%;
        }
    }
}
</style>