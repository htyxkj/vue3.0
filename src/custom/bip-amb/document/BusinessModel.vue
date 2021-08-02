<template> 
    <el-container>
        <el-header style="height:45px;padding:0px 10px;border-bottom: 1px solid #CCCCCC;    line-height: 45px;">
            <Accounting @dataChange="accChange" class="topdiv1"></Accounting>
            <!-- <div class="topdiv2">
                <el-button style="border:0px">      
                    <i class="el-icon-plus"></i>
                    <span>导入</span>
                </el-button>
            </div> -->
            <div class="topdiv2"><!-- 刷新 -->
                <el-button style="border:0px" @click="ininModalAData">      
                    <i class="el-icon-refresh-right" ></i>
                    <span>刷新</span>
                </el-button>
            </div>
            <div class="topdiv2"><!-- 日志 -->
                <el-button style="border:0px" @click="openLogs">      
                    <i class="el-icon-document" ></i>
                    <span>日志</span>
                </el-button>
            </div> 
            <div class="topdiv2"><!-- 导入 -->
                <el-button style="border:0px" @click="impExcel">      
                    <i class="iconfont icon-bip-ruku" ></i>
                    <span>导入</span>
                </el-button>
            </div> 
        </el-header>
        <el-container style="border-top: 1px solid #CCCCCC;">
            <el-aside width="350px">
                <el-header class="myheader">
                    <el-button type="primary" @click="creatModel" icon="el-icon-document-add" size="small">新建</el-button>
                    <el-button @click="updateModel" icon="el-icon-edit" size="small">编辑</el-button>
                    <el-button @click="delModel" icon="el-icon-delete"  size="small">删除</el-button>
                </el-header>
                <el-main  :style="'height:'+tableHeight+'px'" style="padding:0px">
                    <el-tree ref="modelTree" :data="treeData" :props="defaultProps" @node-click="handleNodeClick" highlight-current node-key="id" default-expand-all ></el-tree>
                </el-main>
            </el-aside>
            <el-main style="padding:0px"> 
                <el-container>
                    <el-header class="myheader">
                        <el-button type="primary" @click="createModalA" icon="el-icon-document-add" size="small">新建</el-button>
                        <el-button @click="delModalA" icon="el-icon-delete"  size="small" :disabled="removeData.length==0">删除</el-button>
                    </el-header>
                    <el-main  :style="'height:'+tableHeight+'px'" style="padding:0px">
                        <vxe-table resizable size="mini" ref="BusinessModelTable" auto-resize :loading="tableLoading" show-overflow
                            @checkbox-all="selectChangeEvent" @checkbox-change="selectChangeEvent"
                            border="inner" stripe highlight-hover-row :height="tableHeight-60"
                            :data="modelACell.cdata.data">
                                <vxe-table-column type="checkbox" width="60"></vxe-table-column>
                                <template v-for="(item,index) in modelACell.ccells.cels"> 
                                    <vxe-table-column :key="index" header-align="center" min-width="120" align="center" :field="item.id"
                                        :title="item.labelString" show-header-overflow  v-if="!(item.attr & 0x400)>0"
                                        show-overflow :sortable ="(item.attr&0x400000)>0">
                                        <template v-slot="{row,rowIndex}"> 
                                            <bip-grid-info :cds="modelACell" :cell="item" :row="rowIndex" :bgrid="true" ></bip-grid-info>
                                        </template>
                                    </vxe-table-column>  
                                </template>
                                <vxe-table-column title="操作" width="90">
                                    <template v-slot="{ rowIndex }">
                                        <el-button @click="updateModelA(rowIndex)" type="text">编辑</el-button>
                                    </template>
                                </vxe-table-column>
                        </vxe-table>
                        <vxe-pager :loading="tableLoading" :current-page="tablePage.currPage" :page-size="tablePage.pageSize"
                            :total="tablePage.total" @page-change="handlePageChange"
                            :layouts="['PrevPage', 'JumpNumber', 'NextPage', 'FullJump', 'Sizes', 'Total']"
                            >
                        </vxe-pager>
                    </el-main>
                </el-container>
            </el-main>
        </el-container>
        <el-dialog :title="modelTitle" :close-on-click-modal="false" :visible.sync="showModelDlg" width="50%" class="bip-query">
            <el-row class="bip-lay">
                <el-form @submit.native.prevent label-position="right" label-width="100px">
                    <div v-for="(cel,index) in modelCell.ccells.cels" :key="'A'+index">
                        <bip-comm-editor v-if="(cel.attr&0x400) <= 0 " :cell="cel" :bgrid="false" :cds="modelCell" :row="0"/>
                    </div>
                </el-form>
            </el-row>
            <span slot="footer" class="dialog-footer">
                <el-button @click="modalCancel" size="mini">取 消</el-button>
                <el-button type="primary" @click="addModel" size="mini">确 定</el-button>
            </span>
        </el-dialog>
        <el-dialog :title="modelATitle" :close-on-click-modal="false" :visible.sync="showModelADlg" width="50%" class="bip-query">
            <el-row class="bip-lay">
                <el-form @submit.native.prevent label-position="right" label-width="100px">
                    <div v-for="(cel,index) in modelA2Cell.ccells.cels" :key="'A'+index">
                        <bip-comm-editor v-if="(cel.attr&0x400) <= 0 " :cell="cel" :bgrid="false" :cds="modelA2Cell" :row="0"/>
                    </div>
                </el-form>
            </el-row>
            <span slot="footer" class="dialog-footer">
                <el-button @click="showModelADlg = false" size="mini">取 消</el-button>
                <el-button type="primary" @click="addModelA" size="mini">确 定</el-button>
            </span>
        </el-dialog>
        <im-ex-file :cellID="'IMP300104A2WEB'" ref="imExFile" @Recheck="initModelData"></im-ex-file>
        <bip-log ref="bipLog" :nodeId="'IMP300104A2WEB'" :nodeType="'import'"></bip-log>
    </el-container>
</template>
<script lang="ts">
import { Component, Vue, Provide, Watch } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from 'vuex-class';
import Accounting from "../components/Accounting.vue"//核算目的
import { Cells } from "@/classes/pub/coob/Cells";
import CDataSet from "@/classes/pub/CDataSet";
import QueryEntity from "@/classes/search/QueryEntity";

import ImExFile from '@/components/file/ImExFile.vue';
import BipLog from '@/components/file/BipLog.vue';
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi;
import BipGridInfo from "@/components/editorn/grid/BipGridInfo.vue";
@Component({
    components: {
        Accounting,
        BipGridInfo,
        ImExFile,
        BipLog
    }
})
/**
 * 经营模型
 */
export default class BusinessModel extends Vue {
    @State('bipComHeight', { namespace: 'login' }) height!: number;
    tableHeight:any = 500//高度
    amb_purposes_id:any = null;//核算目的

    modelCell:CDataSet = new CDataSet(""); //经营模型主表
    modelCellID:any = "300104WEB";//经营模型对象ＩＤ
    modelTJCell:CDataSet = new CDataSet(""); //经营模型主表
    modelTJCellID:any = "300104WEBTJ";//经营模型对象ＩＤ


    modelACell:CDataSet = new CDataSet(""); //经营模型主表
    modelACellID:any = "300104AWEB";//经营模型对象ＩＤ
    modelA2Cell:CDataSet = new CDataSet(""); //经营模型主表
    modelA2CellID:any = "300104A2WEB";//经营模型对象ＩＤ
    showModelADlg:boolean = false;
    removeData:any = [];//子表删除数据集合

    tableData:any=[];
    tablePage:any ={
        total: 0,
        currPage:1,
        pageSize:20
    };
    tableLoading:boolean = false;
    
    defaultProps:any =  {
        children: 'children',
        label: 'name'
    }
    treeData:any = [];
    showModelDlg:boolean = false;//新建模型弹出框
    modelTitle:any = "";//标题
    isUpModel:boolean = false;//是否是编辑模型

    treSelData:any = null;//选中节点

    modelATitle:any = "";

    async created() {
        this.tableHeight =  this.height -120
        this.modelCell = await this.getCell(this.modelCellID);//经营模型主表
        this.modelTJCell = await this.getCell(this.modelTJCellID);//经营模型主表条件项
        this.modelACell = await this.getCell(this.modelACellID);//经营模型 子表
        this.modelA2Cell = await this.getCell(this.modelA2CellID);//经营模型 子表
        this.modelTJCell.createRecord();
        this.initModelData();
    }
    mounted() { 
    } 
    //新建模型
    creatModel(){
        this.isUpModel = false;
        this.modelTitle = "新增模型";
        this.showModelDlg = true;
        this.modelCell.clear();
        this.modelCell.createRecord();
        this.modelCell.currRecord.data.purpose_id = this.amb_purposes_id;
    }
    //保存模型
    async addModel(){
        let bok =this.checkNotNull(this.modelCell);
        if(!bok)
            return ;  
        if(this.isUpModel)
            this.modelCell.currRecord.c_state = 2;
        let res = await this.modelCell.saveData();
        if(res.data.id ==0){
            if(!this.isUpModel){
                this.modelCell.currRecord.data.id = res.data.data.id
                // this.treeData.push(this.modelCell.currRecord.data);
            }
            this.$notify.success(res.data.message)
            this.treSelData = this.modelCell.currRecord.data
            this.showModelDlg = false;
            for(var i=0;i<this.treeData.length;i++){
                let item = this.treeData[i];
                if( this.treSelData.id.localeCompare(item.id) ){
                    this.treeData.splice(i,0,this.treSelData);
                    this.setCurrentKey();
                    this.ininModalAData();
                    break;
                }
            }
            if(this.treeData.length == 0){ 
                this.initModelData();
            }
        }else{
            this.$notify.error(res.data.message)
        }
    }
    //编辑模型
    updateModel(){
        this.isUpModel = true;
        this.modelTitle = "编辑模型信息";
        this.showModelDlg = true;
        this.modelCell.clear();
        this.modelCell.createRecord();
        this.modelCell.currRecord.data = Object.assign({},this.treSelData);
    }
    //取消
    modalCancel(){
        this.showModelDlg = false;
    }
    //删除
    delModel(){
        //删除
        this.$confirm('确定删除该记录吗?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(() => {
            this.dodelModel();
        }).catch(() => {
              
        });
    }
    async dodelModel(){
        this.modelCell.currRecord.c_state = 4
        this.modelCell.currRecord.data = this.treSelData;
        this.modelCell.p_cell=this.modelCellID+"(300104AWEBDEL)";
        let res = await this.modelCell.saveData();
        if(res.data.id == 0){
            this.$notify.success(res.data.message)
            this.modelCell.p_cell=this.modelCellID
            this.treeData.forEach((item:any,index:any) => {
                if(item.id == this.treSelData.id){
                    this.treeData.splice(index,1)
                    if(index<this.treeData.length-1){
                        this.treSelData = this.treeData[index]
                    }else{
                        this.treSelData = this.treeData[this.treeData.length-1]
                    }
                    this.setCurrentKey();
                }
            });
            this.ininModalAData();
        }else{
            this.$notify.error(res.data.message)
        }
    }
    //查询模型数据
    async initModelData(){
        this.treeData =[];
        let qe:QueryEntity = new QueryEntity(this.modelCellID,this.modelCellID);
        qe.page.pageSize = 9999;
        // this.modelTJCell.currRecord.data.purpose_id  = this.amb_purposes_id
        qe.cont = JSON.stringify(this.modelTJCell.currRecord.data)
        let res = await this.modelCell.queryData(qe);
        if(res.data.id ==0){
            let data = res.data.data.data.data;
            for(var i=0;i<data.length;i++){
                this.treeData.push(data[i].data)
            } 
        } 
        if(this.treeData.length>0){
            this.treSelData = this.treeData[0];
            this.setCurrentKey();
            this.ininModalAData();
        }
    }
    //设置Tree初始选中    
    setCurrentKey(){
        if(this.treSelData){
            this.$nextTick(function(){
                let ref:any = this.$refs['modelTree']
                let id = this.treSelData.id;
                ref.setCurrentKey(id);
            })
        }
    }
    //查询子表数据
    async ininModalAData(){
        if(this.treSelData){
            this.removeData = [];
            this.modelACell.cdata.data = [];
            this.tableLoading = true;
            let qe:QueryEntity = new QueryEntity(this.modelACellID,this.modelACellID);
            qe.page = this.tablePage;
            qe.cont = JSON.stringify({compo_id:this.treSelData.id})
            let res = await this.modelACell.queryData(qe);
            if(res.data.id ==0){
                let data = res.data.data.data.data;
                this.modelACell.cdata.data = data;
                this.tablePage = res.data.data.data.page
            }
        }
        this.tableLoading = false;
    }
    //新建子表数据
    createModalA(){
        this.modelATitle = "新增"
        this.modelA2Cell.clear();
        this.modelA2Cell.createRecord();
        this.modelA2Cell.currRecord.data.compo_id = this.treSelData.id;
        this.modelA2Cell.currRecord.data.purpose_id = this.amb_purposes_id;
        this.modelA2Cell.currRecord.data.match_group_id = this.treSelData.group_id
        this.showModelADlg = true;
    }
    //保存子表
    async addModelA(){
        let bok =this.checkNotNull(this.modelA2Cell);
        if(!bok)
            return ;  
        if(this.modelATitle == "编辑"){
            this.modelA2Cell.currRecord.c_state = 2;
        }
        let res = await this.modelA2Cell.saveData();
        if(res.data.id == 0){
            let id = res.data.data.id;
            this.modelA2Cell.currRecord.data.id = id;
            this.tableData.push(this.modelA2Cell.currRecord.data)
            this.ininModalAData();
            this.showModelADlg = false;
        }else{
            this.$notify.error(res.data.message)
        }
    }
    //子表修改
    async updateModelA(rowIndex:any){
        this.modelATitle = "编辑"
        let data = this.modelACell.cdata.data[rowIndex];
        let id = data.data.id;
        let qe:QueryEntity = new QueryEntity(this.modelA2CellID,this.modelA2CellID);
        qe.page.pageSize = 9999; 
        qe.cont = JSON.stringify({id:id})
        let res = await this.modelA2Cell.queryData(qe);
        if(res.data.id ==0){
            let d1 = res.data.data.data.data[0]
            if(d1){
                this.modelA2Cell.clear();
                this.modelA2Cell.createRecord();
                this.modelA2Cell.currRecord.data = d1.data;
                this.showModelADlg = true;
            }
        }
    }
    //删除子表
    async delModalA(){ 
        this.modelACell.currRecord.c_state = 4;
        let sucNum = 0
        for(var i=0;i<this.removeData.length;i++){
            sucNum ++;
            this.modelACell.currRecord.data = this.removeData[i].data;
            let res = await this.modelACell.saveData();
            if(res.data.id != 0){
                this.$notify.error(res.data.message)
            }
        }
        if(sucNum == this.removeData.length){
            this.$notify.success("操作成功！")
        }
        this.removeData = [];
        this.ininModalAData();
    }
    selectChangeEvent (data:any) {
        this.removeData = data.records;
        for(var i=0;i<this.removeData.length;i++){
            this.removeData[i].c_state =4;
        }
    }

    //分页信息发生变化
    handlePageChange ({ currentPage, pageSize }:any) {
        this.tablePage.currPage = currentPage
        this.tablePage.pageSize = pageSize
        this.ininModalAData();
    }
    //核算目的发生变化 value = 核算目的ID
    accChange(value:any){
        this.modelCell.clear();
        this.amb_purposes_id = value.id;
        this.ininModalAData();
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
    //节点点击事件
    handleNodeClick(data:any,data1:any,data2:any) {
        if(this.treSelData.id == data.id)
            return;
        this.treSelData = data;
        this.ininModalAData();
    }
    checkNotNull(cds:CDataSet):boolean{
        let bok = true;
        cds.ccells.cels.forEach(item => {
            if (item.unNull&&bok) {
                let vl = null; 
                if(cds.currRecord.data[item.id]!=null)
                    vl = cds.currRecord.data[item.id]+''; 
                if (!vl) {
                    this.$notify.warning( "【" + item.labelString + "】不能为空!");
                    bok =  false;
                    return false;
                }
            }
        }); 
        return bok;
    }
    //导入
    impExcel(){
        let file:any = this.$refs.imExFile
        file.open()
    }

    openLogs(){
        let file:any = this.$refs.bipLog
        file.show()
    }
    @Watch("height")
    heightChange() {
        this.tableHeight =  this.height -120
    }
}
</script>
<style scoped lang="scss" >
.topdiv2{
    float: right;
    margin-right: 3px;
}
.topdiv1{
    float: left;
    margin-right: 3px;
}
.tree{
    overflow-y: auto;
}
.tree::-webkit-scrollbar {
  width: 4px;
}
.tree::-webkit-scrollbar-thumb {
  background-color: #d9d9d9;
}
.custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
}
.addelembtn{
    width: 70%;
    margin-left: 10%;
}
.saveelebtn{
    margin-top: 20px;
    margin-left:45%;
}
.myheader{
    height: 46px !important;
    line-height: 46px;
}
</style>