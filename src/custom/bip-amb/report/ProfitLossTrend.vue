<template> 
    <el-container>
        <el-header style="height:45px;padding:0px 10px;border-bottom: 1px solid #CCCCCC;    line-height: 45px;">
            <Accounting @dataChange="accChange" class="topdiv1"></Accounting>
            <el-date-picker v-model="fm_date" format="yyyy-MM-dd" class="topdiv1" type="date" @change="fm_dateChange" placeholder="选择日期" size="small"></el-date-picker>
            <el-date-picker v-model="to_date" format="yyyy-MM-dd" class="topdiv1" type="date" @change="to_dateChange" placeholder="选择日期" size="small"></el-date-picker>
            <div class="topdiv1"><!-- 显示类别 -->
                <el-select v-model="showType" placeholder="请选择" size="small">
                    <el-option v-for="item in showTypeData" :key="item.id" :label="item.label" :value="item.id"></el-option>
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
            <el-aside width="300px">
                <amb-tree :style="'height:'+tableHeight+'px'" @dataChange="treeChange" :purposesId="amb_purposes_id" :showCbox="false" ></amb-tree>
            </el-aside>
            <el-main style="padding:0px">
                <vxe-table resizable size="mini" ref="ProfitLossTrendTable" auto-resize :loading="tableLoading" show-overflow
                    border="inner" stripe highlight-hover-row :height="tableHeight"
                    :data="tableData">
                    <vxe-table-column field="element_name" title="收支项目" min-width="200">
                        <template v-slot="{row}"> 
                            <span v-for="(item) in row.level" :key="item">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                            {{ row.element_name }}
                        </template>
                    </vxe-table-column>
                    <vxe-table-column v-for="(itemP,index) in period" :key="index" :title="itemP.name">
                        <vxe-table-column title="发生额" min-width="80">
                            <template v-slot="{row}"> 
                                {{ (parseFloat(row[itemP.key+'month_money'])/showType).toFixed(2) }}
                            </template>
                        </vxe-table-column>
                        <vxe-table-column title="结构比例"  min-width="100">
                            <template v-slot="{row}"> 
                                {{ row[itemP.key+'month_rate'] }}
                            </template>
                        </vxe-table-column>
                    </vxe-table-column>
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
import { BIPUtil } from "@/utils/Request";
import {BipMenuBtn} from '@/classes/BipMenuBtn'
let tools = BIPUtil.ServApi;
import XLSX from "xlsx"
import moment from 'moment'
@Component({
    components: {
        Accounting,
        AmbTree
    }
})
/**
 * 损益趋势分析
 */
export default class ProfitLossFunction extends Vue {
    @State('bipComHeight', { namespace: 'login' }) height!: number;
    amb_purposes_id:string = "";//核算目的id
    amb_group_ids:any =[];//核算阿米巴key
    fm_date:any = "";//期间
    to_date:any = "";//期间
    tableData:any=[];
    tableHeight:any ="500";
    tableLoading:boolean = false;
    showType:any = 1;//选中显示类别 默认

    period:any =[];//期间集合



    showTypeData:any =[
        {id:1,label:"按元显示"},
        {id:1000,label:"按千元显示"},
        {id:10000,label:"按万元显示"},
        {id:100000000,label:"按亿元显示"}
    ];
    async created() {
        this.fm_date = moment(new Date()).add(-1, 'days').format("YYYY-MM-DD")
        this.to_date = moment(new Date()).add(-1, 'days').format("YYYY-MM-DD")
        this.tableHeight =  this.height - 60
    }
    mounted() { 
    }
    async initData(){
        this.period=[];
        this.tableData =[];
        this.tableLoading = true;
        if(this.amb_purposes_id !="" && this.amb_group_ids.length>0 && this.fm_date){
            let btn1 = new BipMenuBtn("DLG","损益趋势分析")
            btn1.setDlgType("D")
            btn1.setDlgCont("amb.serv.util.report.IncomeInvoke*202;0;0");//职能损益表
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
            
            let element_ids:any=[];
            let period_ids:any = [];
            let td:any = [];
            if(res.data.id ==0){
                this.period=[];
                this.tableData =[];
                tdata = res.data.data.data
                for(var i =0;i<tdata.length;i++){
                    let d = tdata[i];
                    let elid = d.element_id;
                    let elIndex = element_ids.indexOf(elid);
                    element_ids.push(elid);
                    let data = td[elIndex];
                    if(elIndex ==-1){
                        data = {};
                        data.element_name = d.element_name;
                        data.level = d.level
                        data[d.period_id+'month_money'] = d.tmonth_money
                        data[d.period_id+'month_rate'] = d.month_rate 
                        td.push(data);
                    }else{
                        data[d.period_id+'month_money'] = d.tmonth_money
                        data[d.period_id+'month_rate'] = d.month_rate 
                        td[elIndex] = data;
                    }
                    


                    if(period_ids.indexOf(d.period_id) ==-1){
                        let onep:any = {};
                        onep.key = d.period_id
                        onep.name = d.period_name
                        period_ids.push(d.period_id)
                        this.period.push(onep);
                    }
                }
                this.tableData = td;
            }else{
                this.$notify.error(res.data.message)
            }
            // this.tableData = tdata
            this.tableLoading = false;
        }else{
            this.tableLoading = false;
        }
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
        // this.initData();
    }
    //期间发生变化
    fm_dateChange(value:any){
        this.fm_date = moment(value).format("YYYY-MM-DD")
        // this.initData();
    }
    //期间发生变化
    to_dateChange(value:any){
        this.to_date = moment(value).format("YYYY-MM-DD")
        // this.initData();
    }
    //阿米巴发生变化
    treeChange(checkData:any){
        this.amb_group_ids = checkData.keys;
        this.initData();
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
            let jsonArr = [];
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
            }
            XLSX.utils.sheet_add_json(headerbook.Sheets.Sheet1, jsonArr , {skipHeader: true, origin: "A3"});
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
</style>