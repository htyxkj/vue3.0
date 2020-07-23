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
                <el-button style="border:0px" @click="initTreeData">      
                    <i class="el-icon-refresh-right"></i>
                    <span>刷新</span>
                </el-button>
            </div> 
        </el-header>
        <el-container style="border-top: 1px solid #CCCCCC;">
            <el-aside width="400px" class="tree">
                 <el-tree ref="ambUnitTree" :style="'height:'+(tableHeight-50)+'px'" empty-text="没有阿米巴单元" size="mini" :node-key="keyID"  
                    :data="treeData" @node-click="handleNodeClick"  :expand-on-click-node="false" :highlight-current="true" 
                    default-expand-all check-strictly  >
                    <span class="custom-tree-node" slot-scope="{ node,data  }">
                        <span>{{ node.data.name }}({{type_name[node.data.type_id]}})</span>
                        <span v-if="treSelData && treSelData.id == node.data.id">
                            <el-button
                                type="text"
                                size="mini"
                                @click="() => update(data)">
                                编辑
                            </el-button>
                            <el-button
                                type="text"
                                size="mini"
                                @click="() => append(data)">
                                添加下级
                            </el-button>
                            <el-button
                                type="text"
                                size="mini"
                                @click="() => remove(node, data)">
                                删除
                            </el-button>
                            </span>
                    </span>
                </el-tree>
            </el-aside>
            <el-main style="padding:0px;border-left: 1px solid rgb(204, 204, 204);"> 
                <el-container>
                    <el-header class="rightHeader">
                        <el-button type="primary" @click="saveUnit" icon="el-icon-document-add" size="small">保存</el-button>
                        <div class="rightTitle">{{title}}</div>
                    </el-header>
                    <el-main  :style="'height:'+tableHeight+'px'" style="padding:0px">
                        <el-form @submit.native.prevent label-position="right" label-width="120px">
                            <base-layout v-if="lay.binit" :layout="lay" :env="env"></base-layout>
                        </el-form>
                    </el-main>
                </el-container>
            </el-main>
        </el-container>
    </el-container>
</template>
<script lang="ts">
import { Component, Vue, Provide, Watch } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from 'vuex-class';
import BipMenuBar from "@/classes/pub/BipMenuBar";
import { URIParams } from "@/classes/URIParams";
import Accounting from "../components/Accounting.vue"//核算目的
import { Cells } from "@/classes/pub/coob/Cells";
import CDataSet from "@/classes/pub/CDataSet";
import CData from '@/classes/pub/CData';
import QueryEntity from "@/classes/search/QueryEntity";
import CCliEnv from "@/classes/cenv/CCliEnv";
import { BipLayout } from "@/classes/ui/BipLayout";
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi;
@Component({
    components: {
        Accounting
    }
})
/**
 * 阿米巴单元
 */
export default class AMBUnit extends Vue {
    @State('bipComHeight', { namespace: 'login' }) height!: number;
    tableHeight:any = 500//高度
    keyID:string = "id";//当前节点key字段   
    amb_purposes_id:any = null;//核算目的  
    title:any = "";//右侧标题

    dsm: CDataSet = new CDataSet(null);
    dsm_cont: CDataSet = new CDataSet(null);
    ds_ext: Array<CDataSet> = Array<CDataSet>();
    lay: BipLayout = new BipLayout("");
    env: CCliEnv = new CCliEnv();

    unitCell:CDataSet = new CDataSet("");//阿米巴单元
    unitCellID:any = "300103WEB";

    unitTJCell:CDataSet = new CDataSet("");//查询条件对象
    unitTJCellID:any = "300103WEBTJ";//条件对象编码

    treSelData:any = null;
    treeData:any = [];
    
    pcell:any = "300103WEB(300103AWEB;300103BWEB)";

    type_name:any = {};//类型集合
    addState:any = 1;//添加状态

    async created() {
        this.initType();
        this.unitTJCell = await this.getCell(this.unitTJCellID);
        this.unitCell = await this.getCell(this.unitCellID);
        this.tableHeight =  this.height -120
        let res = await tools.getCCellsParams(this.pcell)
        let rtn: any = res.data;
        if (rtn.id == 0) {
            let kn: Array<Cells> = rtn.data.layCels;
            let cells = kn;
            this.dsm = new CDataSet(cells[0]);
            console.log(this.dsm)
            this.dsm_cont = new CDataSet(cells[0]);
            for (let i = 1; i < cells.length; i++) {
                this.ds_ext[i - 1] = new CDataSet(cells[i]);
            } 
            let uriParams  = new URIParams();
            uriParams.pattr = 2166;
            uriParams.pcell = this.pcell;
            uriParams.playout = "B:(@300103WEB;T:(300103AWEB#728//业务单元;300103BWEB#728//成员))"
            uriParams.pflow = "300103WEB";
            uriParams.beBill = true;
            let bipLay = new BipLayout(uriParams.playout, cells);
            let mbs = new BipMenuBar(0, this.dsm);
            this.lay = bipLay;
            this.env.initInfo(
                uriParams,
                cells,
                mbs,
                this.dsm,
                this.ds_ext
            );
        }
        if(this.treeData.length>0){
            this.treSelData = this.treeData[0]
            this.update(this.treSelData);
            this.setCurrentKey();
            this.initRightData();
        }else{
            this.title = "新增根级巴";
            if(this.dsm.ccells){
                this.dsm.createRecord();
                this.dsm.currRecord.data.purpose_id = this.amb_purposes_id;
                this.addState = 3;
            }
        }
    }
    mounted() { 
    }  

    //查询阿米巴数据
    async initTreeData(){
        this.treeData = [];
        if(!this.unitCell){
            return;
        }
        let qe:QueryEntity = new QueryEntity(this.unitCellID,this.unitCellID);
        qe.page.pageSize = 9999;
        this.unitTJCell.currRecord.data.purpose_id  = this.amb_purposes_id
        qe.cont = JSON.stringify(this.unitTJCell.currRecord.data) 
        let res = await this.unitCell.queryData(qe);
        let treeData = [];
        if(res.data.id ==0 ){
            let data:any = res.data.data.data.data; 
            let tData = [];
            for(var i=0;i<data.length;i++){ 
                let d1 = data[i].data;
                let pid = d1.id;
                if(d1.parent_id == null || d1.parent_id ==''){
                    d1.children=[];
                    this.traverseList(pid, data, d1);
                    tData.push(d1);
                }
            } 
            this.treeData = tData;
            if(tData.length>0){
                this.treSelData = this.treeData[0]
                this.update(this.treSelData);
                this.setCurrentKey();
                this.initRightData();
            }else{
                this.title = "新增根级巴";
                if(this.dsm.ccells){
                    this.dsm.createRecord();
                    this.dsm.currRecord.data.purpose_id = this.amb_purposes_id;
                    this.addState = 3;
                }
            }
        }
    }
    traverseList(pid:any,data:any,d1:any){
        for(var i=0;i<data.length;i++){
            let d2 = data[i].data;
            let parent_id = d2.parent_id;
            let id = d2.id;
            if(parent_id != null && parent_id == pid) { 
                if (!d1.children) {
                    this.$set(d1, 'children', []);
                }
                d1.children.push(d2);
                this.traverseList(id,data,d2);
            }
        }
    }
    //查询右侧数据信息
    async initRightData(){
        this.dsm.clear();
        let qe:QueryEntity = new QueryEntity(this.pcell,this.unitTJCellID);
        qe.page.pageSize = 1;
        qe.cont = JSON.stringify({id:this.treSelData.id})
        let res = await this.dsm.queryData(qe);
        if(res.data.id == 0){
            let data:any = res.data.data.data.data; 
            this.dsm.cdata.data = data;
            if(this.dsm.cdata.data.length>0){
                this.dsm.currRecord = data[0];
                this.getChildData();
            }else{
                this.title = "新增根级巴";
                this.dsm.createRecord();
            }
        }
    }
    /**
     * 获取当前主表对应的子表信息
     */
    async getChildData(){
        let qe:QueryEntity = new QueryEntity(this.pcell,this.unitTJCellID);
        qe.page.pageSize = 10000;
        qe.cont = JSON.stringify({id:this.treSelData.id})
        if(this.dsm.ds_sub && this.dsm.ds_sub.length>0){
                qe.cont = this.dsm.currRecord.data;
                let res = await tools.queryChild(qe);
                if(res.data.id == 0){
                    let data = res.data;
                    let vv:CData = data.data.data;
                    let child = vv.data[0].subs;
                    for(var z=0;z<child.length;z++){
                        let cd :CData = this.initCData(child[z])
                        cd.page.currPage =1;
                        cd.page.total = cd.data.length
                        for(var j=0;j<this.dsm.ds_sub.length;j++){
                            if(this.dsm.ds_sub[j].cdata.obj_id == cd.obj_id){
                                this.dsm.currRecord.subs[j] = cd;
                            }
                        }
                    }
                }
            this.setSubData();
        }
    }
    initCData(vv:CData){
        let cd :CData = new CData('');
        cd.data = vv.data
        cd.page = vv.page
        cd.obj_id = vv.obj_id
        vv.data.forEach((item,index)=>{
            if(item.subs.length>0){
                item.subs.forEach((icd,index)=>{
                    let cc:CData = this.initCData(icd)
                    item.subs[index] = cc;
                })
            }
        })
        return cd;
    }
    setSubData(){
        let n = this.dsm.ds_sub.length
        for(let i=0;i<n;i++){
            let cds1 = this.dsm.ds_sub[i]
            cds1.clear();
            for(let j=0;this.dsm.currRecord.subs&&j<this.dsm.currRecord.subs.length;j++){
                let oneSubs:any = this.dsm.currRecord.subs[j]
                if(oneSubs.obj_id == cds1.ccells.obj_id){
                    let vals = oneSubs.data;
                    if(oneSubs){
                        cds1.clear();
                        cds1.setCData(oneSubs)
                        // cds1.page.total = vals.length||0
                        this.$bus.$emit("datachange", cds1.p_cell);
                    }
                }
            }
        }
    }
    //设置Tree初始选中
    setCurrentKey(){
        this.$nextTick(function(){
            let ref:any = this.$refs['ambUnitTree']
            let id = this.treSelData.id;
            ref.setCurrentKey(id);
        })
    }
    //修改
    update(data:any){
        this.title = "编辑["+data.name+"]信息";
        this.treSelData = data;
        this.initRightData();
        this.addState = 1;//修改
    }
    //添加下一级
    append(data:any) { 
        this.title = "在["+data.name+"]新增下级巴"
        this.dsm.clear();
        this.dsm.createRecord();
        this.dsm.currRecord.data.parent_id = data.id;
        this.dsm.currRecord.data.type_id = data.type_id
        this.dsm.currRecord.data.employees = data.employees
        this.dsm.currRecord.data.enabled = data.enabled
        this.dsm.currRecord.data.purpose_id = this.amb_purposes_id;
        this.addState = 2;//修改
    } 
    //删除
    remove(node:any, data:any) {
        this.$confirm('确定删除该记录吗?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(() => {
            this.doRemove(node,data);
        }).catch(() => {
              
        });
    }
    async doRemove(node:any, data:any){
        if(!data.children || data.children.length ==0){
            this.dsm.currRecord.c_state = 4;
            this.dsm.currRecord.data = data;
            let res = await this.dsm.saveData()
            if(res.data.id ==0 ){
                const parent = node.parent;
                const children = parent.data.children || parent.data;
                const index = children.findIndex((d:any) => d.id === data.id);
                children.splice(index, 1);
                if(this.treeData.length == 0){
                    this.title = "新增根级巴";
                    if(this.dsm.ccells){
                        this.dsm.clear();
                        this.dsm.createRecord();
                        this.dsm.currRecord.data.purpose_id = this.amb_purposes_id;
                        this.addState = 3;
                    }
                }
            }
        }else{

        }
    }

    async saveUnit(){
        let bok = this.checkNotNull(this.dsm); 
        if(!bok)
            return ;  
        let res = await this.dsm.saveData(); 
        if(res.data.id ==0){
            if(this.addState ==2){ 
                this.dsm.currRecord.data.id = res.data.data.id;
                const newChild = this.dsm.currRecord.data;
                if (!this.treSelData.children) {
                    this.$set(this.treSelData, 'children', []);
                }
                this.treSelData.children.push(newChild);
            }else if(this.addState == 3){
                this.initTreeData();
            }
            this.$notify.success(res.data.message)
        }else{
            this.$notify.error(res.data.message)
        }
    }

    //节点点击事件
    handleNodeClick(data:any,data1:any,data2:any) {
        this.treSelData = data; 
    }
    //核算目的发生变化 value = 核算目的ID
    accChange(value:any){ 
        this.amb_purposes_id = value.id;
        this.initTreeData();
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
    
    //获取类型参照
    async initType(){
        let qe: QueryEntity = new QueryEntity("", "");
        qe.page.currPage = 1;
        qe.page.pageSize = 50000; 
        let res = await tools.getBipInsAidInfo("TYPE_AMB", 210, qe);
        if(res.data.id ==0 ){
            let vals = res.data.data.data.values;
            for(var i=0;i<vals.length;i++){
                let vl = vals[i]
                this.type_name[vl.id ] = vl.name;
            }
        }
    }

    //检查主表非空
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
        if(bok){
            if (cds.ds_sub.length>0) {
                return this.checkChildNotNull(cds);
        }
      }
        return bok;
    }
    //检查子表非空
    checkChildNotNull(cds:CDataSet):boolean{
        let isok = true;
        cds.ds_sub.forEach(cd0=>{
            if(isok){
                if(cd0.cdata.data.length===0 && !cd0.ccells.unNull){
                    this.$notify.warning( "【" + cd0.ccells.desc + "】不能为空!");
                    isok =  false;
                    return false;
                }else{
                    for(let i=0;i<cd0.cdata.data.length;i++){
                        let crd = cd0.getRecordAtIndex(i);
                        cd0.ccells.cels.forEach(item=>{
                            if(isok&&item.unNull){
                                let vl = crd.data[item.id];+'';
                                if (!vl) {
                                    this.$notify.warning( "子表第"+(i+1)+"行"+item.id+"【" + item.labelString + "】不能为空!");
                                    isok =  false;
                                    return false
                                }
                            }
                        });
                    }
                }
            }
            if(cd0.ds_sub.length>0){
                isok = this.checkChildNotNull(cd0);
            }

        })
        return isok;
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
.rightHeader{
    height: 50px !important;;
    line-height: 50px;
    border-bottom: 1px solid rgb(204, 204, 204);
}
.rightTitle{
    float:right;
    color: rgba(0,0,0,.65);
    font-weight: 400;
    font-size: 12px;
}
</style>