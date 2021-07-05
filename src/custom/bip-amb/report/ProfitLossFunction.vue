<template> 
    <el-container>
        <el-header style="height:45px;padding:0px 10px;border-bottom: 1px solid #CCCCCC;    line-height: 45px;">
            <Accounting @dataChange="accChange" class="topdiv1"></Accounting>
            <el-date-picker v-model="fm_date" format="yyyy-MM-dd" class="topdiv1" type="date" @change="fm_dateChange" placeholder="选择日期" size="small"></el-date-picker>
            <amb-tree-dialog  @dataChange="treeChange" :purposesId="amb_purposes_id" class="topdiv1" :showCbox="false" ></amb-tree-dialog>
            <div class="topdiv1"><!-- 显示类别 -->
                <el-select v-model="showType" placeholder="请选择" size="small">
                    <el-option v-for="item in showTypeData" :key="item.id" :label="item.label" :value="item.id"></el-option>
                </el-select>
                &nbsp;&nbsp;
                <el-button style="border:0px" type="primary" size="small" class="bip_btn_primary" @click="initData">      
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
            <el-main style="padding:0px">
                <template v-if="tableLoading">
                    <div v-loading="valueTableLoading" :style="'height:'+tableHeight+'px'">
                        <table class="tableTitle">
                            <tr>
                                <th style="text-align: left">收支项目</th>
                                <th style="text-align: right">当期发生额</th>
                                <th style="text-align: right">月度发生额</th>
                                <th style="text-align: right">年度发生额</th>
                            </tr>
                        </table>
                    </div>
                </template>
                <template v-else>
                    <vxe-table resizable size="mini" class="mytable-scrollbar" ref="FIncomeTable" auto-resize highlight-current-row
                        show-overflow :tree-config="{children: 'children',expandRowKeys: this.defaultExpandKeys }" row-id="element_id"
                        border stripe highlight-hover-row :height="tableHeight" :column-config="{'minWidth':'90px','width':'auto'}"
                        @cell-dblclick="cellDBClick"
                        :data="tableData">
                        <vxe-table-column field="element_name" title="收支项目" min-width="200" width="200" tree-node></vxe-table-column>
                        <vxe-table-column field="tmonth_money" title="当期发生额" align="right">
                            <template v-slot="{row}"> 
                                {{getFormatValue(row.tmonth_money)}}
                            </template>
                        </vxe-table-column>
                        <vxe-table-column field="tmonth_qty" title="当期数量" align="right">
                            <template v-slot="{row}"> 
                                {{getFormatValue(row.tmonth_qty,4)}}
                            </template>
                        </vxe-table-column>
                        <!-- <vxe-table-column field="month_rate" title="当期结构比例" align="right"></vxe-table-column> -->
                        <vxe-table-column field="month_money" title="月度发生额" align="right">
                            <template v-slot="{row}"> 
                                {{getFormatValue(row.month_money)}}
                            </template>
                        </vxe-table-column>
                        <vxe-table-column field="year_money" title="年度发生额" align="right">
                            <template v-slot="{row}"> 
                                {{getFormatValue(row.year_money)}}
                            </template>
                        </vxe-table-column>
                        <!-- <vxe-table-column field="year_rate" title="年度结构比例" width="150" align="right"> </vxe-table-column> -->
                    </vxe-table>
                </template>
            </el-main>
        </el-container>
    </el-container>
</template>
<script lang="ts">
import { Component, Vue, Provide, Watch } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from 'vuex-class';
import Accounting from "../components/Accounting.vue"//核算目的
import AmbTreeDialog from "../components/AmbTreeDialog.vue"//阿米巴树
import { BIPUtil } from "@/utils/Request";
import {BipMenuBtn} from '@/classes/BipMenuBtn'
let tools = BIPUtil.ServApi;
import moment from 'moment'
import {CurrUtils} from '@/utils/CurrUtils'
let currutil = CurrUtils.curr
@Component({
    components: {
        Accounting,
        AmbTreeDialog
    }
})
/**
 * 职能式损益表
 */
export default class ProfitLossFunction extends Vue {
    
    @State('bipComHeight', { namespace: 'login' }) height!: number;
    amb_purposes_id:string = "";//核算目的id
    amb_period_kj:string = "";//核算目的中的会计期间ID
    amb_group_ids:any =[];//核算阿米巴key
    fm_date:any = "";//期间
    tableData:any=[];
    tableHeight:any ="500";
    tableLoading:boolean = true;
    valueTableLoading:boolean = false;
    showType:any = 1;//选中显示类别 默认
    showTypeData:any =[
        {id:1,label:"按元显示"},
        {id:1000,label:"按千元显示"},
        {id:10000,label:"按万元显示"},
        {id:100000000,label:"按亿元显示"}
    ];
    defaultExpandKeys:any = null;//树形表格默认展开节点
    treeConfig:any=null;

    period_fm_date:any = null;
    period_to_date:any = null;

    async created() {
        this.fm_date = moment(new Date()).add(-1, 'days').format("YYYY-MM-DD")
        this.tableHeight =  this.height - 60
    }
    mounted() { 
    }
    async initData(){
        this.tableLoading = true;
        this.valueTableLoading = true;
        this.tableData =[];
        this.defaultExpandKeys = null;
        if(this.amb_purposes_id !="" && this.amb_group_ids.length>0 && this.fm_date){
            let btn1 = new BipMenuBtn("DLG","职能式损益表")
            btn1.setDlgType("D")
            btn1.setDlgCont("amb.serv.util.report.IncomeInvoke*202;0;0");//职能损益表
            let b = JSON.stringify(btn1)
            let prarm = {
                "purpose_id":this.amb_purposes_id,
                "group_ids":this.amb_group_ids, 
                "fm_date":this.fm_date,
                "to_date":this.fm_date   
            }
            let v = JSON.stringify(prarm);
            let res = await tools.getDlgRunClass(v,b);
            let tdata = [];
            if(res.data.id ==0){
                tdata = res.data.data.data
                this.defaultExpandKeys = res.data.data.expandRowKeys;
            }else{
                this.$notify.error(res.data.message)
            }
            this.tableData = tdata
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
    getFormatValue(value:any,num:any =2){
        let cc = value/this.showType;
        return currutil.currency(cc,'',num);
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
        this.initPeriodDate();
    }
    //阿米巴发生变化
    treeChange(checkData:any){
        this.amb_group_ids = checkData.keys;
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
            params:{method:"BL",pmenuid:'300403',jsontj:jsontj },
            query: {pbuid:'300403',pmenuid:'300403'}
        })
    }
    //导出excel
    exportDataEvent () {
        let refT:any = this.$refs["FIncomeTable"]
        if(refT){
            refT.setAllTreeExpand(true);
            setTimeout(() => {
                refT.exportData({
                    filename: '职能式损益表',
                    sheetName: 'Sheet1',
                    type: 'xlsx'
                })
            }, 200);
        }
    }
    /**
     * 获取期间的开始时间接收时间
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
            "to_date":this.fm_date   
        }
        let v = JSON.stringify(prarm);
        let res = await tools.getDlgRunClass(v,b);
        console.log(res)
        let fm_date = res.data.data.fm_date;
        this.period_fm_date = moment(fm_date).format("YYYY-MM-DD")+" 00:00:00"
        let to_date = res.data.data.to_date;
        this.period_to_date = moment(to_date).format("YYYY-MM-DD")+" 23:59:59"
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
            background-color: #f8f8f9;
            background-size: 1px 100%,100% 1px;
            background-position: 100% 0,100% 100%;
        }
    }
}
</style>