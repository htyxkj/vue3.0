<template> 
    <el-container>
        <el-header style="height:45px;padding:0px 10px">
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
            <el-aside width="400px">
                <el-tree ref="elementTree" :style="'height:'+(tableHeight-50)+'px'" empty-text="没有核算要素" size="mini" :node-key="keyID"  
                    :data="treeData" @node-click="handleNodeClick"  :expand-on-click-node="false" :highlight-current="true" 
                    default-expand-all check-strictly  >
                    <span class="custom-tree-node" slot-scope="{ node,data  }">
                        <span>{{ node.data.name }}({{node.data.code}})</span>
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
                <el-button plain icon="el-icon-plus" size="small" class="addelembtn" @click="creatElement">新增核算要素</el-button>
                
            </el-aside>
            <el-main style="padding:0px;border-left: 1px solid rgb(204, 204, 204);"> 
                <el-container>
                    <el-header class="rightHeader">{{title}}</el-header>
                    <el-main  :style="'height:'+tableHeight+'px'" style="padding:0px;">
                        <el-form @submit.native.prevent label-position="right" label-width="100px">
                            <template v-if="elementCell">
                                <div v-for="(cel,index) in elementCell.ccells.cels" :key="'A'+index">
                                    <bip-comm-editor v-if="(cel.attr&0x400) <= 0 " :cell="cel" :bgrid="false" :cds="elementCell" :row="0"/>
                                </div>
                            </template>
                        </el-form>
                        <el-button plain icon="el-icon-plus" size="small" class="saveelebtn" @click="saveElem">保存</el-button>
                    </el-main>
                </el-container>
            </el-main>
        </el-container>
    </el-container>
</template>
<script lang="ts">
import { Component, Vue, Provide, Watch } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from 'vuex-class';
import Accounting from "../components/Accounting.vue"//核算目的
import { Cells } from "@/classes/pub/coob/Cells";
import CDataSet from "@/classes/pub/CDataSet";
import QueryEntity from "@/classes/search/QueryEntity";
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi;
@Component({
    components: {
        Accounting
    }
})
/**
 * 会计期间
 */
export default class AccountingElement extends Vue {
    @State('bipComHeight', { namespace: 'login' }) height!: number;
    tableHeight:any = 500//高度
    expandedLevel:number = 100;//默认展开级别
    keyID:string = "id";//当前节点key字段   
    amb_purposes_id:any = null;//核算目的

    elementCell:CDataSet = new CDataSet(""); //核算要素主表
    elementCellID:any = "300102WEB";//核算要素对象ＩＤ
    elementTJCell:CDataSet = new CDataSet(""); //核算要素主表
    elementTJCellID:any = "300102WEBTJ";//核算要素对象ＩＤ
    title:any = "";//右侧标题

    treSelData:any = null;//树当前选中节点
    addState:any = null;//右侧保存状态  0 新增   1 修改    2新增下一级

    treeData:any=[];//树状结构数据

    async created() {
        this.tableHeight =  this.height -60
        this.elementCell = await this.getCell(this.elementCellID);//核算要素主表
        this.elementTJCell = await this.getCell(this.elementTJCellID);//核算要素主表条件项
        this.elementCell.createRecord();
    }
    mounted() { 
    } 
    //修改
    update(data:any){
        this.treSelData = data;
        this.title = "基本信息 - 编辑["+data.name+"]信息";
        this.addState = 1;//修改
        this.elementCell.clear();
        this.elementCell.createRecord()
        this.elementCell.currRecord.data = data;
        
            for(var i=0;i<this.elementCell.ccells.cels.length;i++){
                let cel = this.elementCell.ccells.cels[i]
                if(cel.id == 'type_id'){
                    if(data.parent_id != null){
                        this.elementCell.ccells.cels[i].attr = this.elementCell.ccells.cels[i].attr | 0x40;
                    }else{
                        this.elementCell.ccells.cels[i].attr = 2;
                    }
                }
            }
    }
    //添加下一级
    append(data:any) { 
        this.title = "基本信息 - 在["+data.name+"]新增下级核算要素"
        this.elementCell.clear();
        this.elementCell.createRecord();
        for(var i=0;i<this.elementCell.ccells.cels.length;i++){
            let cel = this.elementCell.ccells.cels[i]
            if(cel.id == 'type_id'){
                this.elementCell.ccells.cels[i].attr = this.elementCell.ccells.cels[i].attr | 0x40;
            }
        }
        this.elementCell.currRecord.data.type_id = data.type_id;
        this.elementCell.currRecord.data.direction_id = data.direction_id;
        this.elementCell.currRecord.data.factor_id = data.factor_id
        this.elementCell.currRecord.data.is_manual = data.is_manual
        this.elementCell.currRecord.data.enabled = data.enabled
        this.elementCell.currRecord.data.purpose_id = this.amb_purposes_id
        this.elementCell.currRecord.data.parent_id = data.id;
        this.treSelData = data;
        this.addState = 2;
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
            this.elementCell.clear();
            this.elementCell.currRecord.data = data;
            this.elementCell.currRecord.c_state = 4;
            let res = await this.elementCell.saveData()
            if(res.data.id ==0 ){
                const parent = node.parent;
                const children = parent.data.children || parent.data;
                const index = children.findIndex((d:any) => d.id === data.id);
                children.splice(index, 1);
            }
        }else{

        }
    }
    //加载数据
    async initTreeData(){
        this.treeData = []; 
        this.elementTJCell.currRecord.data.purpose_id = this.amb_purposes_id;
        let qe:QueryEntity = new QueryEntity(this.elementCellID,this.elementCellID);
        qe.page.pageSize = 9999;
        qe.cont = JSON.stringify(this.elementTJCell.currRecord.data)
        let res = await this.elementCell.queryData(qe);
        let treeData = [];
        if(res.data.id ==0 ){
            let data:any = res.data.data.data.data; 
            let tData = [];
            for(var i=0;i<data.length;i++){ 
                let d1 = data[i].data;
                let pid = d1.id;
                if(d1.parent_id == null){
                    d1.children=[];
                    this.traverseList(pid, data, d1);
                    tData.push(d1);
                }
            } 
            this.treeData = tData;
        }
        if(this.treeData.length>0){
            this.treSelData = this.treeData[0];
            this.update(this.treSelData);
            this.setCurrentKey();
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
    //新增核算要素
    creatElement(){
        this.elementCell.clear();
        this.title = "基本信息 - 新增根级核算要素";
        this.elementCell.createRecord();
        this.elementCell.currRecord.data.purpose_id = this.amb_purposes_id
        this.addState = 0;
        for(var i=0;i<this.elementCell.ccells.cels.length;i++){
            let cel = this.elementCell.ccells.cels[i]
            if(cel.id == 'type_id'){
                this.elementCell.ccells.cels[i].attr = 2
            }
        }
    }
    //设置Tree初始选中
    setCurrentKey(){
        this.$nextTick(function(){
            let ref:any = this.$refs['elementTree']
            let id = this.treSelData.id;
            ref.setCurrentKey(id);
        })
    }
    //节点点击事件
    handleNodeClick(data:any,data1:any,data2:any) {
        this.treSelData = data;
        // this.title = "基本信息 - 编辑["+data.name+"]信息";
        // this.addState = 1;//修改
        // this.elementCell.createRecord()
        // this.elementCell.currRecord.data = data;
    }
    //核算目的发生变化 value = 核算目的ID
    accChange(value:any){
        this.treSelData = null;
        this.elementCell.clear();
        this.amb_purposes_id = value.id;
        this.initTreeData();
    }
    //保存
    async saveElem(){
        if(this.addState ==1){//修改
            this.elementCell.currRecord.c_state = 2;
        }
        let res = await this.elementCell.saveData();
        
        if(res.data.id == 0){
            this.$notify.success(res.data.message)
            this.elementCell.currRecord.data.id = res.data.data.id
        }
        if(this.addState == 0){
            this.treeData.push(this.elementCell.currRecord.data);
        }
        if(this.addState ==2){ 
            const newChild = this.elementCell.currRecord.data;
            if (!this.treSelData.children) {
                this.$set(this.treSelData, 'children', []);
            }
            this.treSelData.children.push(newChild);
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
    padding-left: 50px;
}
</style>