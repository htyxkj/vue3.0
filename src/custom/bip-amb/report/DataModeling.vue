<template> 
    <el-container>
        <el-header style="height:45px;padding:0px 10px;border-bottom: 1px solid #CCCCCC;    line-height: 45px;">
            <Accounting @dataChange="accChange" :class="screenWidth<1600?'topdiv1_min':'topdiv1'"></Accounting>
            <!-- <Period class="topdiv1" :calendar_id="calendar_id" @dataChange="period_change" :type="'max'"></Period> -->
            <el-date-picker v-model="period_date" format="yyyy-MM-dd" :class="screenWidth<1600?'topdiv1_min':'topdiv1'"
             type="date" @change="period_dateChange" placeholder="选择日期" size="small"></el-date-picker>
            <div :class="screenWidth<1600?'topdiv1_min':'topdiv1'">
                <el-button size="small" style="margin-left:20px" type="primary" :disabled="selData.length ==0" @click="doDataM">      
                    <span>数据建模</span>  
                </el-button>
            </div>

            <div class="topdiv2"><!-- 导出 -->
                <el-button type="text" @click="getUnpriced">查看未定价信息</el-button>
            </div>
            <div class="topdiv2"><!-- 刷新 -->
                <el-button style="border:0px" @click="initData">      
                    <i class="el-icon-refresh-right"></i>
                    <span>刷新</span>
                </el-button>
            </div>

        </el-header>
        <el-main> 
            <vxe-table resizable size="mini" ref="ProfitLossAspectTable" auto-resize :loading="tableLoading" show-overflow
                stripe highlight-hover-row :height="tableHeight" :data="tableData" row-id="compo_id"
                border show-header-overflow
                @checkbox-all="selectAllEvent" @checkbox-change="selectEvent">
                
                <vxe-table-column type="checkbox" width="60"> </vxe-table-column>

                <vxe-table-column header-align="center" min-width="120" align="center" field="compo_name" title="模型" show-header-overflow show-overflow></vxe-table-column>  
                <vxe-table-column header-align="center" min-width="120" align="center" field="fm_date" title="时间" show-header-overflow show-overflow></vxe-table-column>  
                <vxe-table-column header-align="状态" min-width="120" align="center" field="status_id" title="" show-header-overflow show-overflow></vxe-table-column>  
                <vxe-table-column header-align="center" min-width="120" align="center" field="msg" title="消息" show-header-overflow show-overflow></vxe-table-column>  
                <vxe-table-column title="日志" align="center" >
                    <template v-slot="{ row }" >
                        <el-button type="text" @click="getLog(row)">日志</el-button>
                    </template>
                </vxe-table-column>
            </vxe-table>
            <vxe-pager :current-page="tablePage.currPage" :page-size="tablePage.pageSize"
                :total="tablePage.total" @page-change="tablePageChange"
                :layouts="['PrevPage', 'JumpNumber', 'NextPage', 'FullJump', 'Sizes', 'Total']">
            </vxe-pager>
            <!-- 日志 -->
            <el-drawer :visible.sync="logDrawer" size="45%" direction="rtl">
                <div slot="title">
                    <el-button @click="getLog(null)">      
                        <i class="el-icon-refresh-right" ></i>
                        <span>刷新</span>
                    </el-button>
                    <el-button @click="delLog()">      
                        <i class="el-icon-delete" ></i>
                        <span>清除日志</span>
                    </el-button>
                </div>
                <vxe-table style="width:100%" :height="tableHeight" resizable :data="logTableData" size="mini" stripe border highlight-hover-row highlight-current-row>
                    <vxe-table-column title="时间" width="170" header-align="center" align="start" show-header-overflow show-overflow>
                        <template v-slot="{ row }">
                            <div>
                                {{row.data.created_at}} 
                            </div>
                        </template>
                    </vxe-table-column> 
                    <vxe-table-column title="日志" min-width="300" header-align="center" align="start" show-header-overflow show-overflow>
                        <template v-slot="{ row }">
                            <div>
                                {{row.data.msg}} 
                            </div>
                        </template>
                    </vxe-table-column>   
                </vxe-table> 
                <vxe-pager border size="mini" :current-page="logTablePage.currPage" :page-size="logTablePage.pageSize"
                    :total="logTablePage.total" :layouts="['PrevPage', 'JumpNumber', 'NextPage', 'FullJump', 'Sizes', 'Total']" @page-change="logPageChange">
                </vxe-pager>
            </el-drawer>
            <el-drawer :visible.sync="unpricedDrawer" size="45%" direction="rtl">
                <div slot="title">
                    <el-button @click="getUnpriced()">      
                        <i class="el-icon-refresh-right" ></i>
                        <span>刷新</span>
                    </el-button>
                    <el-input style="width: 230px;padding-left:9px" v-model="item_code_name" placeholder="按物料编码或者名称搜索"></el-input>
                </div>
                <vxe-table style="width:100%" :height="tableHeight" resizable :data="unpricedTableData" size="mini" stripe border highlight-hover-row highlight-current-row>
                    <vxe-table-column title="料号"  field="item_code" width="170" header-align="center" align="start" show-header-overflow show-overflow></vxe-table-column> 
                    <vxe-table-column title="物料" field="item_name"  min-width="300" header-align="center" align="start" show-header-overflow show-overflow></vxe-table-column>   
                    <vxe-table-column title="时间" field="date"  min-width="300" header-align="center" align="start" show-header-overflow show-overflow></vxe-table-column>   
                </vxe-table> 
                <vxe-pager border size="mini" :current-page="unpricedTablePage.currPage" :page-size="unpricedTablePage.pageSize"
                    :total="unpricedTablePage.total" :layouts="['PrevPage', 'JumpNumber', 'NextPage', 'FullJump', 'Sizes', 'Total']" @page-change="unpricedPageChange">
                </vxe-pager>
            </el-drawer>
        </el-main>
    </el-container>
</template>
<script lang="ts">
import { Component, Vue, Provide, Watch } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from 'vuex-class';
import Accounting from "../components/Accounting.vue"//核算目的
import Period from "../components/Period.vue"//阿米期间
import QueryEntity from "@/classes/search/QueryEntity";
import QueryCont from '@/classes/search/QueryCont';
import { Cells } from "@/classes/pub/coob/Cells";
import CDataSet from '@/classes/pub/CDataSet';
import { BIPUtil } from "@/utils/Request";
import {BipMenuBtn} from '@/classes/BipMenuBtn'
let tools = BIPUtil.ServApi;
import XEUtils from 'xe-utils'
import { values } from 'xe-utils/methods';
import moment from 'moment'
import BipGridInfo from "@/components/editorn/grid/BipGridInfo.vue";

@Component({
    components: {
        Accounting,
        Period,
        BipGridInfo
    }
})
/**
 * 数据建模
 */
export default class DataModeling  extends Vue {
    
    @State('bipComHeight', { namespace: 'login' }) height!: number;
    screenWidth:number=1920;
    tablePage:any ={
        total: 0,
        currPage:1,
        pageSize:20
    };
    tableData:any =[];

    calendar_id:any = "";//日历编码
    period_date:any = "";//期间日期

    amb_purposes_id:string = "";//核算目的id
    selData:any =[];
    tableHeight:any ="500";
    tableLoading:boolean = false;

    logDrawer:boolean = false;
    logTj:any = null;
    logCell:CDataSet = new CDataSet("");
    logCellId:any = "100104"
    logTablePage:any ={//分页信息
        total: 0,
        currPage:1,
        pageSize:20
    };
    logTableData:any =[];
    logDelCell:CDataSet = new CDataSet("");
    logDelCellId:any = "100104WEBDEL";

    unpricedDrawer:boolean = false;
    unpricedTablePage:any ={//分页信息
        total: 0,
        currPage:1,
        pageSize:20
    };
    unpricedTableData:any =[];
    item_code_name:any = "";

    
    selectedCompo_ids:any = new Set();
    
    async created() {
        this.period_date = moment(new Date()).format("YYYY-MM-DD")
        this.tableHeight =  this.height - 120
    }
    async mounted() { 
        this.logDelCell = await this.getCell(this.logDelCellId);
        this.screenWidth= document.body.clientWidth;
        
    }
     
    
    async initData(){
        //this.selData = [];
        this.tableLoading = true;
        let param = {purpose_id: this.amb_purposes_id,period_date:this.period_date,page:this.tablePage}
        let btn1 = new BipMenuBtn("DLG"," 数据建模")
        btn1.setDlgType("D")
        btn1.setDlgCont("amb.serv.util.accounting.DataModeling*202;0;1");//数据建模
        let b = JSON.stringify(btn1)
        let v = JSON.stringify(param);
        let res:any = await tools.getDlgRunClass(v,b);
        if(res.data.id ==0){
            let d = res.data.data.data;
            this.tableData = d.data;
            this.tablePage = d.page;
        }
        if(this.selectedCompo_ids.size>0){
             this.setCheckboxRows(this.tableData);
        }
        this.tableLoading = false;   
    } 
     setCheckboxRows(rows:any) {
        const ref:any = this.$refs.ProfitLossAspectTable;
        if (rows) {
            for(let i=0;i<rows.length;i++){
                if(this.selectedCompo_ids.has(rows[i].compo_id)>0){
                    //ref.toggleCheckboxRow(rows[i]);
                    ref.setCheckboxRow(rows[i], true);
                }
            }
        } else {
             ref.clearCheckboxRow();
        }
      }
    selectAllEvent({records, checked}:any) {       
        if (checked) {
           records.forEach((item:any) => this.selectedCompo_ids.add(item.compo_id))
        } else {
            // 注意取消全选时需要遍历当前表格数据来删除，records不管用
            this.tableData.forEach((item:any) =>  this.selectedCompo_ids.delete(item.compo_id)); 
        } 
        this.selData=[...this.selectedCompo_ids];
    }
    
    selectEvent({rowid, checked}:any){
        if (checked) {
            this.selectedCompo_ids.add(rowid);
        } else {
            this.selectedCompo_ids.delete(rowid);
        }
        this.selData=[...this.selectedCompo_ids];  
    }
    //查询日志
    async getLog(data:any){
        if(data!=null){
            this.logTj = data;
            this.logTablePage.currPage = 1;
        }
        this.logTableData = [];
        let qe:QueryEntity = new QueryEntity(this.logCellId,this.logCellId);
        qe.page = this.logTablePage;
        let tj = {node_id : this.logTj.compo_id,node_type:'AmbDataModeling'}
        qe.cont = JSON.stringify(tj)
        let res = await this.logCell.queryData(qe);
        if(res.data.id ==0 ){
            let data = res.data.data.data;
            this.logTablePage = data.page;
            this.logTableData = data.data;
        }
        this.logDrawer = true;
    }
    //日志分页信息变化
    logPageChange({ currentPage, pageSize }:any) {
        this.logTablePage.currPage = currentPage
        this.logTablePage.pageSize = pageSize
        this.getLog(null);
    }
    async delLog(){
        this.logDelCell.createRecord();
        this.logDelCell.currRecord.data.node_id = this.logTj.compo_id;
        this.logDelCell.currRecord.data.node_type = 'AmbDataModeling';
        this.logDelCell.currRecord.c_state = 4;
        let res = await this.logDelCell.saveData();
        console.log(res)
        this.logTablePage.currPage = 1
        this.getLog(null);
    }
    //数据建模
    async doDataM(){
        if(this.period_date == null || this.period_date ==''){
            this.$notify.error("没有选择期间")
            return;
        }
        let compo_ids = [...this.selectedCompo_ids];
        console.log(compo_ids);
        /* for(var i=0;i<this.selData.length;i++){
            compo_ids.push(this.selData[i].compo_id);
        } */
        let prarm = {
            compo_ids: compo_ids,
            purpose_id:this.amb_purposes_id,
            period_date:this.period_date
        }
        let btn1 = new BipMenuBtn("DLG"," 数据建模")
        btn1.setDlgType("D")
        btn1.setDlgCont("amb.serv.util.accounting.DataModeling*201;0;1");//交易价表
        let b = JSON.stringify(btn1)
        let v = JSON.stringify(prarm);
        let res = await tools.getDlgRunClass(v,b);
        if(res.data.id ==0){
            this.$notify.success(res.data.message)
        }else{
            this.$notify.error(res.data.message)
        }
        this.initData();
    }
    //查询未定价信息
    async getUnpriced(){
        this.unpricedTableData = [];
        let allCont = [];
        let oneCont = []; 
        let qe: QueryEntity = new QueryEntity("", "");
        qe.page = this.unpricedTablePage;
        let qCont = new QueryCont('purpose_id',this.amb_purposes_id,12);
        qCont.setContrast(0);
        qCont.setLink(1)
        oneCont.push(qCont);
        allCont.push(oneCont);
        if(this.item_code_name && this.item_code_name.length>0){
            let arr = [];
            let qC = new QueryCont('item_code',this.item_code_name,12);
            qC.setContrast(3);
            arr.push(qC);
            qC = new QueryCont('item_name',this.item_code_name,12);
            qC.setContrast(3);
            arr.push(qC);
            allCont.push(arr);
        }
        qe.cont = "~" + JSON.stringify(allCont)
        let cc = await tools.getBipInsAidInfo("UNPRICED", 210, qe);
        if(cc.data.id ==0 ){
            this.unpricedTableData = cc.data.data.data.values;
            this.unpricedTablePage = cc.data.data.data.page
        }
        this.unpricedDrawer = true;
    }
    //分页数据发送变化
    unpricedPageChange({ currentPage, pageSize }:any) {
        this.unpricedTablePage.currPage = currentPage
        this.unpricedTablePage.pageSize = pageSize
        this.getUnpriced();
    }
    //核算目的发生变化 value = 核算目的ID
    accChange(value:any){
        this.amb_purposes_id = value.id;
        this.calendar_id = value.calendar_id
        if(this.period_date && this.amb_purposes_id)
            this.initData();
    }
    //期间发生变化
    period_dateChange(value:any){
        if(value){
            this.period_date = moment(value).format("YYYY-MM-DD")
            if(this.period_date !=null && this.amb_purposes_id)
                this.initData();
        }else{
            this.period_date = "";
        }
    } 
    
    //分页信息变化
    tablePageChange({ currentPage, pageSize }:any) {
        this.tablePage.currPage = currentPage
        this.tablePage.pageSize = pageSize
        this.initData()
    }
    //获取对象
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
    @Watch("item_code_name")
    item_code_name_Change(){
        this.getUnpriced();
    }
    @Watch("height")
    heightChange() {
        this.tableHeight =  this.height -120
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
</style>