<template> 
    <el-container>
        <el-header style="height:45px;padding:0px 10px">
            <div class="topdiv2"><!-- 刷新 -->
                <el-button style="border:0px" @click="initChileData">      
                    <i class="el-icon-refresh-right"></i>
                    <span>刷新</span>
                </el-button>
            </div>    
            <!-- <div class="topdiv2">
                <el-button style="border:0px" @click="exportDataEvent">      
                    <i class="el-icon-download"></i>
                    <span>导出</span>
                </el-button>
            </div>        -->
            <div class="topdiv2">
                <el-button style="border:0px" @click="addPeriod(null)">      
                    <i class="el-icon-plus"></i>
                    <span>追加期间</span>
                </el-button>
            </div>
        </el-header>
        <el-container style="border-top: 1px solid #CCCCCC;">
            <el-aside width="300px">
                <div class="plist" :style="'height:'+tableHeight+'px'">
                    <template v-if="periodData && periodData.length>0">
                        <el-row v-for="(item,index) in periodData" :key="index" :class="item.data.id==selPeriod.id?'selBackCol':''">
                            <el-row style="margin:0px 10px;" :class="index>0?'border_top':''">
                                <span @click="periodClick(item.data)">
                                    <el-row style="padding-top:10px">
                                        <i class="el-icon-date"></i>
                                        <span class="title">
                                            {{item.data.name}}
                                            (
                                                {{
                                                    item.data.type_id == 'months'?"月":""
                                                }}
                                                {{
                                                    item.data.type_id == 'days'?"日":""
                                                }}
                                                {{
                                                    item.data.type_id == 'weeks'?"周":""
                                                }}
                                            )
                                        </span>
                                    </el-row>
                                    <el-row class="time">{{item.data.fm_date}}~{{item.data.to_date}}</el-row>
                                    <el-row type="flex" align="middle" style="padding-bottom: 5px;">
                                        <el-col :span="16" class="code">{{item.data.code}}</el-col>
                                        <el-col :span="8">
                                            <el-button size="mini" type="text" @click="update(item.data)">编辑</el-button>
                                            <el-button size="mini" type="text" @click="deleteItem(item.data,index)">删除</el-button>
                                        </el-col>
                                    </el-row>
                                </span>
                            </el-row>
                        </el-row>
                    </template>
                    <el-button plain icon="el-icon-plus" size="small" class="addperiodbtn" @click="creatPeriod">创建日历</el-button>
                </div>
            </el-aside>
            <el-main style="padding:0px"> 
                <vxe-table resizable size="mini" ref="ProfitLossTrendTable" auto-resize :loading="tableLoading" show-overflow
                    border="inner" stripe highlight-hover-row :height="tableHeight-60"
                    :data="tableData">
                        <vxe-table-column field="name" title="期间"></vxe-table-column>
                        <vxe-table-column field="year" title="年度"></vxe-table-column>
                        <vxe-table-column field="month" title="月"></vxe-table-column>
                        <vxe-table-column field="fm_date" title="开始日期"></vxe-table-column>
                        <vxe-table-column field="to_date" title="结束日期"></vxe-table-column>
                        <vxe-table-column field="memo" title="备注"></vxe-table-column>
                </vxe-table>
                <vxe-pager :loading="tableLoading" :current-page="tablePage.currPage" :page-size="tablePage.pageSize"
                :total="tablePage.total" @page-change="handlePageChange"
                :layouts="['PrevPage', 'JumpNumber', 'NextPage', 'FullJump', 'Sizes', 'Total']"
                >
                </vxe-pager>
            </el-main>
            </el-container>
            <el-dialog title="新增日历" :close-on-click-modal="false" :visible.sync="showPeriodDialog" width="50%" class="bip-query">
                <el-row class="bip-lay">
                    <el-form @submit.native.prevent label-position="right" label-width="100px">
                        <div v-for="(cel,index) in periodCell.ccells.cels" :key="'A'+index">
                            <bip-comm-editor v-if="(cel.attr&0x400) <= 0 " :cell="cel" :bgrid="false" :cds="periodCell" :row="0"/>
                        </div>
                    </el-form>
                </el-row>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="showPeriodDialog = false" size="mini">取 消</el-button>
                    <el-button type="primary" @click="createdPeriod" size="mini">确 定</el-button>
                </span>
            </el-dialog>
            <el-dialog title="编辑日历信息" :close-on-click-modal="false" :visible.sync="showUpPeUpriodDialog" width="50%" class="bip-query">
                <el-row class="bip-lay">
                    <el-form @submit.native.prevent label-position="right" label-width="100px">
                        <div v-for="(cel,index) in periodUpCell.ccells.cels" :key="'A'+index">
                            <bip-comm-editor v-if="(cel.attr&0x400) <= 0 " :cell="cel" :bgrid="false" :cds="periodUpCell" :row="0"/>
                        </div>
                    </el-form>
                </el-row>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="showUpPeUpriodDialog = false" size="mini">取 消</el-button>
                    <el-button type="primary" @click="saveUpPeriod" size="mini">确 定</el-button>
                </span>
            </el-dialog>
    </el-container>
</template>
<script lang="ts">
import { Component, Vue, Provide, Watch } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from 'vuex-class';
import { Cells } from "@/classes/pub/coob/Cells";
import CDataSet from "@/classes/pub/CDataSet";
import QueryEntity from "@/classes/search/QueryEntity";

import { BIPUtil } from "@/utils/Request";
import {BipMenuBtn} from '@/classes/BipMenuBtn'
let tools = BIPUtil.ServApi;
import XEUtils from 'xe-utils'
import { values, toStringJSON } from 'xe-utils/methods';
import moment from 'moment'
@Component({
    components: {
    }
})
/**
 * 会计期间
 */
export default class AccountingPeriod extends Vue {
    @State('bipComHeight', { namespace: 'login' }) height!: number;
    tableData:any=[];
    tablePage:any ={
        total: 0,
        currPage:1,
        pageSize:20
    };
    tableLoading:boolean = true;
    tableHeight:any ="500";
    periodCell:CDataSet = new CDataSet(""); //期间主表
    periodCellID:any = "100601";//期间主表对象ＩＤ
    periodUpCell:CDataSet = new CDataSet(""); //期间主表
    periodUpCellID:any = "100601UP";//期间主表对象ＩＤ
    periodChileCell:CDataSet = new CDataSet(""); //期间子表
    periodChileCellID:any = "100601B";//期间主表对象ＩＤ
    periodData:Array<any> = new Array<any>();//期间主表集合
    selPeriod:any = null;//当前选中期间 
    showPeriodDialog:boolean = false;//
    showUpPeUpriodDialog:boolean = false;//

    ent_id:any = null;
    async created() {
        let dep = JSON.parse(window.sessionStorage.getItem("user") + "").deptInfo;
        if(dep)
            this.ent_id = dep.cmcCode
        this.periodCell = await this.getCell(this.periodCellID);//期间主表
        this.periodChileCell = await this.getCell(this.periodChileCellID);//期间子表
        this.periodUpCell = await this.getCell(this.periodUpCellID);//期间子表
        this.tableHeight =  this.height - 60
        this.initData();
    }
    mounted() { 
    }
    //创建会计期间日历
    creatPeriod(){ 
        this.periodCell.clear();
        this.periodCell.createRecord();
        this.showPeriodDialog = true;
        this.periodCell.p_cell = "100601";
    }
    //进行保存
    async createdPeriod(){
        let res = await this.periodCell.saveData();
        if(res.data.id ==0){
            this.tablePage.currPage = 1;
            let id = res.data.data.id;
            this.periodCell.currRecord.data.id = id;
            this.periodData.push(this.periodCell.currRecord);
            this.selPeriod = this.periodCell.currRecord.data;
            this.$notify.success("创建成功！")
            this.showPeriodDialog = false;
            await this.addPeriod(this.selPeriod.fm_date)
        }else{
            this.$notify.error("创建失败！" + res.data.message)
        }
    }
    //修改
    update(data:any){
        this.periodCell.p_cell = "100601";
        this.periodUpCell.clear();
        this.periodUpCell.createRecord();
        this.periodUpCell.currRecord.data = data;
        this.showUpPeUpriodDialog = true;
    }
    //保存修改
    async saveUpPeriod(){
        this.periodUpCell.currRecord.c_state = 2;
        let res = await this.periodUpCell.saveData();
        if(res.data.id ==0){
            this.showUpPeUpriodDialog = false;
            this.$notify.success(res.data.message)
        }else{
            this.$notify.error(res.data.message)
        }
    }
    //删除
    deleteItem(data:any,index:any){
        this.$confirm('确定删除该记录吗?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(() => {
            this.doDeleteItem(data,index);
        }).catch(() => {
              
        });
    }
    //进行删除
    async doDeleteItem(data:any,index:any){
        this.periodCell.currRecord.data = data;
        this.periodCell.currRecord.c_state = 4;
        this.periodCell.p_cell="100601(100601B)";
        let res = await this.periodCell.saveData();
        if(res.data.id ==0){
            this.periodData.splice(index,1)
            this.$notify.success(res.data.message);
            index = index <= this.periodData.length-1?index:this.periodData.length-1
            this.selPeriod = this.periodData[index]
            this.initChileData();
        }else{
            this.$notify.error(res.data.message)
        }
    }
    //追加期间
    async addPeriod(fm_date:any){
        this.tableLoading = true;
        console.log("追加期间")
        let btn1 = new BipMenuBtn("DLG"," 追加期间")
        btn1.setDlgSname(name);
        btn1.setDlgType("D")
        btn1.setDlgCont("amb.serv.util.accounting.AccountingPeriod*201;0;0");//职能损益表
        let b = JSON.stringify(btn1)
        let prarm = {
            "id":this.selPeriod.id,
            "type":this.selPeriod.type_id,
            "ent_id":this.selPeriod.ent_id,
            "fm_date":fm_date,
        }
        let v = JSON.stringify(prarm);
        let res = await tools.getDlgRunClass(v,b);
        console.log(res)
        if(res.data.id !=0){
            this.$notify.error("追加期间失败！")
        }else{
            this.selPeriod.to_date = res.data.data.to_date;
        }
        this.initChileData();
    }

    //查询期间数据
    async initData(){
        this.tableData =[];
        let qe:QueryEntity = new QueryEntity(this.periodCellID,this.periodCellID);
        qe.page.pageSize = 9999;
        qe.cont = JSON.stringify({ent_id:this.ent_id})
        let res = await this.periodCell.queryData(qe);
        if(res.data.id ==0)
            this.periodData = res.data.data.data.data;
        if(this.periodData.length>0){
            this.selPeriod = this.periodData[0].data;
            this.initChileData();
        }
    }
    //查询期间详情
    async initChileData(){
        this.tableLoading = true;
        this.tableData =[];
        let keyid = this.selPeriod.id;//主键
        let cont = {calendar_id:keyid};
        let qe:QueryEntity = new QueryEntity(this.periodChileCellID,this.periodChileCellID);
        qe.page = this.tablePage;
        qe.cont = JSON.stringify(cont);
        qe.orderBy = "fm_date";
        let res = await this.periodChileCell.queryData(qe);
        if(res.data.id ==0 ){
            let data = res.data.data.data.data;
            this.tablePage = res.data.data.data.page
            if(data && data.length>0){
                for(var i=0;i<data.length;i++){
                    let od = data[i].data;
                    this.tableData.push(od);
                }
            }
        }
        this.tableLoading = false;
    }
    handlePageChange ({ currentPage, pageSize }:any) {
        this.tablePage.currPage = currentPage
        this.tablePage.pageSize = pageSize
        this.initChileData();
    }
    //会计期间选中
    periodClick(data:any){
        if(this.selPeriod.id == data.id)
            return;
        this.tablePage.currPage =1;
        this.selPeriod = data;
        this.initChileData();
    }
    //导出excel
    exportDataEvent () {
        let refT:any = this.$refs["FIncomeTable"]
        if(refT){
            refT.exportData({ type: 'csv' })
        }
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
    @Watch("height")
    heightChange() {
        this.tableHeight =  this.height -60
    }
}
</script>
<style scoped lang="scss" >
.topdiv2{
    float: right;
    margin-right: 3px;
}
.plist{
    overflow-y: auto;
}
.plist::-webkit-scrollbar {
  width: 4px;
}
.plist::-webkit-scrollbar-thumb {
  background-color: #d9d9d9;
}
.time{
    font-size: 13px;
    color: rgba(0,0,0,.45);
    padding:10px 0px;
}
.code{
    font-size: 13px;
    color: rgba(0,0,0,.45);
}
.title{
    font-weight: 500;
}
.addperiodbtn{
    width: 70%;
    margin-left: 10%;
}
.border_top{
    border-top: 1px solid #CCCCCC;
}
.selBackCol{
    background-color: rgb(247, 240, 255);
}
</style>