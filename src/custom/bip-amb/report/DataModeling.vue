<template> 
    <el-container>
        <el-header style="height:45px;padding:0px 10px">
            <Accounting @dataChange="accChange" class="topdiv1"></Accounting>
            <Period class="topdiv1" :calendar_id="calendar_id" @dataChange="period_change" :type="'max'"></Period>
            <div class="topdiv1">
                <el-button style="border:0px" >      
                    <i class="el-icon-download"></i>
                    <span>数据建模</span>
                </el-button>
            </div>

            <div class="topdiv2"><!-- 导出 -->
                <el-button style="border:0px"  >      
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
        <el-main> 
            <vxe-table resizable size="mini" ref="ProfitLossAspectTable" auto-resize :loading="tableLoading" show-overflow
                border="inner" stripe highlight-hover-row :height="tableHeight" :data="tableData"
                @checkbox-all="selectAllEvent" @checkbox-change="selectChangeEvent">
                <vxe-table-column type="checkbox" width="60"></vxe-table-column>
                <vxe-table-column field="name" title="模型"></vxe-table-column>
                <vxe-table-column field="name" title="时间"></vxe-table-column>
                <vxe-table-column field="name" title="状态"></vxe-table-column>
                <vxe-table-column field="name" title="消息"></vxe-table-column>
                <vxe-table-column field="name" title="日志"></vxe-table-column>

            </vxe-table>
            <vxe-pager :current-page="tablePage.currPage" :page-size="tablePage.pageSize"
                :total="tablePage.total" @page-change="tablePageChange"
                :layouts="['PrevPage', 'JumpNumber', 'NextPage', 'FullJump', 'Sizes', 'Total']">
            </vxe-pager>
        </el-main>
    </el-container>
</template>
<script lang="ts">
import { Component, Vue, Provide, Watch } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from 'vuex-class';
import Accounting from "../components/Accounting.vue"//核算目的
import Period from "../components/Period.vue"//阿米期间
import { BIPUtil } from "@/utils/Request";
import {BipMenuBtn} from '@/classes/BipMenuBtn'
let tools = BIPUtil.ServApi;
import XEUtils from 'xe-utils'
import { values } from 'xe-utils/methods';
import moment from 'moment'
@Component({
    components: {
        Accounting,
        Period
    }
})
/**
 * 数据建模
 */
export default class DataModeling  extends Vue {
    
    @State('bipComHeight', { namespace: 'login' }) height!: number;
    tablePage:any ={
        total: 0,
        currPage:1,
        pageSize:20
    };
    dataCellID:any ="300304WEB";
    dataCell:CDataSet = new CDataSet("");

    calendar_id:any = "";//日历编码
    period_id:any = "期间编码";
    amb_purposes_id:string = "";//核算目的id
    fm_date:any = "";//期间
    tableData:any=[];
    tableHeight:any ="500";
    tableLoading:boolean = false;
    async created() {
        this.fm_date = moment(new Date()).format("YYYY-MM-DD")
        this.tableHeight =  this.height - 120
    }
    async mounted() { 
        this.dataCell = await this.getCell(this.dataCellID);
    }
    async initData(){
        this.tableLoading = true;
        let qe:QueryEntity = new QueryEntity(this.dataCellID,this.dataCellID);
        qe.page = this.tablePage;
        let res = await this.dataCell.queryData(qe);
        if(res.data.id ==0 ){
            let data = res.data.data.data;
            this.tablePage = data.page
            this.tableData = data.data
        }
        this.tableLoading = false;
    } 

    //核算目的发生变化 value = 核算目的ID
    accChange(value:any){
        this.amb_purposes_id = value.id;
        this.calendar_id = value.calendar_id
        this.initData();
    }
    //期间发生变化
    period_change(value:any){
        this.period_id = value;
        this.initData();
    } 
    
    //分页信息变化
    tablePageChange({ currentPage, pageSize }:any) {
        this.tablePage.currPage = currentPage
        this.tablePage.pageSize = pageSize
        this.initData()
    }
    
    @Watch("height")
    heightChange() {
        this.tableHeight =  this.height -120
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