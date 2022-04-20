<template>
    <el-row v-loading="loading">
        <el-row class="menu-bar">
            <el-button class="bip_btn_default" size="mini" @click="getTML">
                <i class="el-icon-tickets"></i>模板下载
            </el-button>
            <el-button class="bip_menu_bar_success" size="mini" @click="addRecord">
                <i class="el-icon-plus"></i>新建行
            </el-button>
            <el-button class="bip_menu_bar_success" size="mini" @click="saveData">
                <i class="el-icon-folder-checked"></i>保存
            </el-button>
            <template >
                <a href="javascript:;" id="pic" class="a-upload">
                    <input type="file" accept="application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" @change="imFile($event)" name="file" ><i class="el-icon-tickets"></i>导入
                </a>
            </template>
            <template v-if="initialData">
                <el-popover placement="top" width="180" v-model="showDelAllMsg"  style="margin-left:10px ">
                    <div style="padding:10px">
                        <div>请确认是否重置报名信息</div>
                        <div style="text-align: right; margin: 0;padding-top:30px">
                            <el-button size="mini" type="text" @click="showDelAllMsg = false">取消</el-button>
                            <el-button type="primary" size="mini" @click="delAll(true)">确定</el-button>
                        </div>
                    </div>
                    <el-button size="mini" slot="reference" class="bip_btn_danger" plain ><i class="el-icon-folder-remove"></i>重置报名信息</el-button>
                </el-popover>
            </template>
            <el-popover placement="top" width="180" v-model="showDelSelMsg" style="margin:0px 10px ">
                <div style="padding:10px">
                    <div>请确认是否删除勾选数据</div>
                    <div style="text-align: right; margin: 0;padding-top:30px">
                        <el-button size="mini" type="text" @click="showDelSelMsg = false">取消</el-button>
                        <el-button type="primary" size="mini" @click="delRecord">确定</el-button>
                    </div>
                </div>
                <el-button class="bip_btn_danger" slot="reference" size="mini"  >
                    <i class="el-icon-folder-remove"></i>删除
                </el-button>
            </el-popover>

        </el-row>
        <template  v-if="table_cell">
            <vxe-table :ref="table_cell.ccells.obj_id" resizable size="mini" auto-resize show-overflow class="mytable-scrollbar" border
                stripe highlight-hover-row :data="table_cell.cdata.data" :height="table_height" @edit-actived="rowActive" @edit-closed="editClose"
                :edit-config="{trigger: 'click', mode: 'cell',showStatus: true,showIcon:false}" @checkbox-change="selectChangeEvent" @checkbox-all="selectChangeEvent"
                :header-cell-style="headerCellStyle"
                :keep-source="false" show-all-overflow="tooltip" show-header-overflow highlight-current-row :optimized="true">
                    <vxe-table-column type="seq" width="55"  fixed="left"></vxe-table-column>
                    <vxe-table-column type="checkbox" width="60"></vxe-table-column>
                    <template v-for="(item,index) in table_cell.ccells.cels"> 
                        <vxe-table-column :key="index" header-align="center" min-width="120" align="center" :field="item.id"
                            :title="item.labelString" show-header-overflow :edit-render="{name: 'default'}" v-if="!(item.attr & 0x400)>0"
                            show-overflow :sortable ="(item.attr&0x400000)>0">
                            <template #edit="{rowIndex}">
                                    <bip-comm-editor  :cell="item" :cds="table_cell" :row="rowIndex" :bgrid="true" :env="env"/> 
                                </template>
                            <template #default="{rowIndex}">
                                <bip-grid-info :cds="table_cell" :cell="item" :row="rowIndex" :bgrid="true" ></bip-grid-info>
                            </template>
                        </vxe-table-column>  
                    </template>
            </vxe-table>
        </template>
    </el-row>
</template>
<script lang="ts">
import { Component, Vue , Watch } from "vue-property-decorator";
import {  State, Getter } from 'vuex-class';
import { BIPUtil } from "@/utils/Request";
import CDataSet from '@/classes/pub/CDataSet';
import { Cells } from "@/classes/pub/coob/Cells";
import { BaseVariable } from "@/utils/BaseICL";
import { GlobalVariable } from "@/utils/ICL";
import CRecord from "@/classes/pub/CRecord";
import BipGridInfo from "@/components/editorn/grid/BipGridInfo.vue";
import CCliEnv from "@/classes/cenv/CCliEnv";
import QueryEntity from "@/classes/search/QueryEntity";
import { User } from '@/classes/User';
import {BipMenuBtn} from '@/classes/BipMenuBtn'
import { Route } from "vue-router";
@Component({
    components: {BipGridInfo }
})
/**
 * 团体报名页面
 */
export default class GroupRegistration extends Vue{
    @State('bipComHeight', { namespace: 'login' }) bipHeight!: number;
    @Getter('user', { namespace: 'login' }) user?: User;
    env: CCliEnv = new CCliEnv();
    table_height:any="";
    cell_id:any="S3035";
    table_cell:any= null;
    removeData:any=[];//多选框选中数据
    loading:boolean = false;
    initialData:boolean = false;//是否以报名
    rtItem:any = null;//资讯记录
    showDelAllMsg:boolean = false;//重置报名信息 提示语
    showDelSelMsg:boolean = false;//删除勾选数据 提示语
    async created(){
        this.loading = true;
        this.table_cell = await this.getCell(this.cell_id);
        this.table_cell.cdata.data = [];
        if (this.$route.query) {
            this.rtItem = this.$route.query;
        }
        this.init()
    }
    async mounted(){
        this.initHeight();
    }
    async init(){
        if(!this.user){
            this.loading = false;
            return;
        }
        this.table_cell.cdata.data = [];
        let tj = {sorg:this.user.deptInfo.cmcCode,ex_id:this.rtItem.sid};
        let qe: QueryEntity = new QueryEntity("","");
        qe.pcell = this.table_cell.ccells.obj_id
        qe.tcell = this.table_cell.ccells.obj_id
        qe.oprid = 13;
        qe.cont = JSON.stringify(tj);
        qe.values = [];
        let res = await this.table_cell.queryData(qe)
        if(res.data.id ==0){
            let data = res.data.data.data.data;
            this.table_cell.cdata.data = data;
            if(data.length>0){
                this.table_cell.currRecord = this.table_cell.cdata.data[0];
                this.table_cell.index = 0;
                this.initialData = true;
            }
        }
        this.loading = false;
    }
    //保存数据
    async saveData(){
        let param:any = {values:[],rtItem:this.rtItem}
        let data:any = this.table_cell.cdata.data;
        if(data.length ==0){
            this.$notify.error("请先导入报名数据");
            return;
        }
        this.loading = true;
        for(var i=0;i<data.length;i++){
            param.values.push(data[i].data);
        }
        let btn1 = new BipMenuBtn("DLG"," 数据识别")
        btn1.setDlgType("D")
        btn1.setDlgCont("dyzs.serv.GroupRegistration*201;0;1");//数据保存
        let b = JSON.stringify(btn1)
        let v = JSON.stringify(param);
        let res = await BIPUtil.ServApi.getDlgRunClass(v,b);
        if(res.data.id ==0){
            this.$notify.success(res.data.message);
            this.initialData = true;
            this.init();
        }else{
            this.$notify.error(res.data.message);
        }
        this.loading = false;
    }
    //删除当前公司全部报名信息
    async delAll(delAll:boolean=false){
        let param:any = {values:this.removeData,rtItem:this.rtItem}
        if(delAll){
            param.values = [];
        }
        let btn1 = new BipMenuBtn("DLG"," 数据删除")
        btn1.setDlgType("D")
        btn1.setDlgCont("dyzs.serv.GroupRegistration*202;0;1");//数据保存
        let b = JSON.stringify(btn1)
        let v = JSON.stringify(param);
        let res = await BIPUtil.ServApi.getDlgRunClass(v,b);
        if(res.data.id ==0){
            this.$notify.success(res.data.message);
            this.removeData = [];
            if(delAll){
                this.initialData = false;
                this.table_cell.cdata.data = [];
            }else {
                if(this.table_cell.cdata.data.length ==0){
                    this.initialData = false;
                }
            }
        }else{
            this.$notify.error(res.data.message);
        }
    }
    //删除
    delRecord(){
        this.showDelSelMsg = false;
        if(this.table_cell.currCanEdit() && this.removeData.length>0){
            this.table_cell.cdata.rmdata = this.removeData;
            for(var i=this.table_cell.cdata.data.length-1;i>=0;i --){
                let data = this.table_cell.cdata.data[i];
                for(var j =0;j<this.removeData.length;j++){
                    let rem = this.removeData[j];
                    if(rem.id == data.id){
                        this.table_cell.cdata.data.splice(i,1); 
                        this.table_cell.setState(2);
                    }
                }
            }
            let cc:any = this.$refs[this.table_cell.ccells.obj_id];
            if(cc){ 
                cc.clearCurrentRow();
                cc.setCurrentRow(this.table_cell.currRecord);
                cc.syncData();
            }
            this.delAll(false)
        }
    }
    //添加行
    async addRecord() {
        if(this.table_cell.currCanEdit()){
            if(this.table_cell.cdata.data.length>0){
                let bok = this.checkNotNull(this.table_cell); 
                if(!bok)
                    return ; 
            }
            await this.table_cell.createRecord();
            let cc:any = this.$refs[this.table_cell.ccells.obj_id];
            if(cc){ 
                cc.clearCurrentRow();
                cc.setCurrentRow(this.table_cell.currRecord);
                cc.syncData();
            }
            this.table_cell.currRecord.c_state |= 2;
        }
    }
    //多选框勾选发生变化
    selectChangeEvent (data:any) {
        this.removeData = data.records;
        for(var i=0;i<this.removeData.length;i++){
            this.removeData[i].c_state =4;
        }
    }
    //行编辑开始
    rowActive(rowInfo: any, event: any) {
        this.table_cell.currRecord = this.table_cell.getRecordAtIndex(rowInfo.rowIndex);
        this.table_cell.index = rowInfo.rowIndex;
    }
    //编辑结束
    editClose(rowInfo: any, event: any) {
        this.table_cell.currRecord = this.table_cell.getRecordAtIndex(rowInfo.rowIndex);
    }
    //获取对象
    async getCell(cellid: string) {
        let res = await BIPUtil.ServApi.getCCellsParams(cellid);
        let rtn: any = res.data;
        if (rtn.id == 0) {
            let kn: Array<Cells> = rtn.data.layCels;
            let cells = kn;
            return new CDataSet(cells[0]);
        } else {
            return new CDataSet("");
        }
    }
    //获取模板
    getTML(){
        let userid = JSON.parse(window.sessionStorage.getItem("user") + "").userCode
        let uri = BaseVariable.BaseUri+''+GlobalVariable.API+"?apiId="+ GlobalVariable.APIID_IMPORTEXPDATA
        uri += "&usercode="+userid+"&cellID="+this.cell_id+"&template=1&dbid="+BaseVariable.COMM_FLD_VALUE_DBID;
        window.open(uri)
    }
    //导入文件
    imFile(event:any) {
        let dfconfig:any = {
            headers: {
            'Content-Type': 'multipart/form-data'
            },
            params:{
                snkey:JSON.parse(window.sessionStorage.getItem('snkey')+''),
                usercode: JSON.parse(window.sessionStorage.getItem("user") + "").userCode,
            }
        }
        var file = event.target.files[0];
        let name = file.name
        let size = file.size
        let form = new FormData();
        let config  = dfconfig;
        config.params.name = name;
        config.params.dbid = BaseVariable.COMM_FLD_VALUE_DBID;
        if(this.cell_id)
            config.params.cellID = this.cell_id
        else
            config.params.cellID = this.table_cell.obj_id;
        config.params.apiId = GlobalVariable.APIID_IMPORTEXPDATA;
        form.append("data", file); 
        form.append("name", name); 
        this.$message('数据导入中！');
        this.$axios.post(GlobalVariable.API,form,config).then((res)=>{
            if(res.data.id ==0){
                let table_data = res.data.data.data;
                for(var i=0;i<table_data.length;i++){
                    let cr = new CRecord();
                    cr.data = table_data[i];
                    this.table_cell.cdata.data.push(cr);
                }
                if(table_data.length>0){
                    this.table_cell.currRecord = this.table_cell.cdata.data[0];
                    this.table_cell.index = 0;
                }
                this.$notify.success("文件解析成功！");
            }else{
                this.$notify.error(res.data.message);
            }
        });
    }
    /**
    检查非空
     */
    checkNotNull(cds:CDataSet):boolean{
        let bok = true;
        if(cds.cdata.data.length>0){
            cds.currRecord = cds.cdata.data[cds.cdata.data.length-1]
            cds.ccells.cels.forEach(item => {
                if (item.unNull&&bok) {
                    let vl = null;
                    let hide:any = [];
                    if(cds.currRecord.data[item.id]!=null)
                        vl = cds.currRecord.data[item.id]+'';
                    if (!vl && hide.indexOf(item.id) == -1) {
                        this.$notify.warning( "【" + item.labelString + "】不能为空!");
                        bok =  false;
                        return false;
                    }
                }
            }); 
        }
        return bok;
    }
    /**
     * 表头追加样式
     */
    headerCellStyle(column:any){
        let celid = column.column.property;
        for(var i=0;i<this.table_cell.ccells.cels.length;i++){
            let cel:any = this.table_cell.ccells.cels[i];
            if(cel && cel.id == celid){
                if((cel.attr & 0x2) >0){
                    return { color: 'red' }
                }
            }
        }
    }
    @Watch("bipHeight")
    initHeight(){
        if(this.bipHeight){
            this.table_height = this.bipHeight-50
        }
    }
    
    @Watch("$route")
    routeChange(to: Route, from: Route) { 
        if (to.name === "GroupRegistration") {
            if (this.$route.query) {
                this.rtItem = this.$route.query;
                this.init()
            }
        }
    }
}
</script>
<style lang="scss" scoped>
.bip-menu-bar{
    @include bip_menu_bar();
}
.a-upload {
    margin: 0 10px;
    position: relative;
    border: 1px solid #d0d0d0;
    font-size: 12px;
    border-radius: 4px;
    padding: 5px 18px;
    overflow: hidden;
    color: #000000;
    text-decoration: none;
    line-height: 16px;
}
.a-upload input {
    position: absolute;
    width: 48px;
    opacity: 0;
}
.a-upload:hover {
    background: #d7e8f3;
    border-color: #cae6f8;
    color: #004974;
    text-decoration: none;
}
.menu-bar{
    padding-top: 6px;
    padding-bottom: 6px;
    padding-left: 4px;
}
</style>