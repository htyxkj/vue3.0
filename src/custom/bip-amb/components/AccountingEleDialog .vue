<template> 
    <div >
        <el-input placeholder="核算要素" :readonly="true" v-model="selectName"  size="small" @click.native="select"> 
                <el-button slot="append" icon="el-icon-search" @click="select"></el-button>
        </el-input>
        <el-dialog :visible.sync="showDialog" class="bipinsaid" :close-on-click-modal="false">
            <!--弹出框头部-->
            <span slot="title">
                <div class="el-dialog__title" style="padding-bottom:5px">核算要素</div>
            </span>
            <div style="padding-top:0px;border-bottom:1px solid #f0f0f0">
                <el-input placeholder="输入关键字进行过滤" size="small" v-model="filterText"> 
                    <el-button slot="append" icon="el-icon-search" @click="filterTree"></el-button>
                </el-input>
                <div class="amb-tree">
                    <el-tree empty-text="没有核算要素" size="mini" ref="ambTree" :data="treeData" :node-key="keyID"  @node-click="handleNodeClick1" 
                        @check="checkBoxClick" :expand-on-click-node="false" :highlight-current="true" :default-checked-keys="default_checked_keys"
                        :props="defaultProps" :default-expanded-keys="expandedKeys" check-strictly :show-checkbox="showCbox" :filter-node-method="filterNode"  >
                        <span class="custom-tree-node" slot-scope="{ node }">
                            <template v-if="node.disabled">
                                <span style="color:#bcbcbc">{{ node.label }}{{node.data}}</span>
                            </template>
                            <template v-else>
                                <span >{{ node.label }}</span>
                            </template>
                        </span>
                    </el-tree>
                </div>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button @click="showDialog = false" size="mini">取 消</el-button>
                <el-button type="primary" @click="selectOk" size="mini">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi;
import {BipMenuBtn} from '@/classes/BipMenuBtn'
import { debounce } from "node_modules/xe-utils";
@Component({
    components: {
    }
})
//核算要素（指标）
export default class AccountingEle extends Vue {
    @Prop() purposesId?:string;//核算目的
    @Prop() showCbox?:boolean;//是否显示checkbox 
    @Prop() lCheckData?:any;
    @Prop() showEleId?:any;
    expandedLevel:number = 100;//默认展开级别
    keyID:string = "id";//当前节点key字段
    defaultProps:any = {children: 'children',label: 'name'};
    expandedKeys:any =[];//默认展开节点的key
    default_checked_keys:any =[]
    treeData:any = [];
    showDialog:boolean = false;
    selectName:any = "";
    checkData:any = null;
    filterText:any = "";
    newData:any=[];

    async created() {
        await this.initTreeData();
    }
    async select(){
        this.initTreeData();
        this.showDialog = true;
    }

    selectOk(){
        this.selectName = "";
        if(this.checkData){
            let data = this.checkData.data;
            for(var i=0;i<data.length;i++){
                this.selectName += data[i].name;
                if(i<data.length-1){
                    this.selectName += ";"
                }
            }
        }
        this.$emit("dataChange",this.checkData );
        this.showDialog = false;
    }
    async initTreeData(){ 
        if(this.purposesId){
            let btn1 = new BipMenuBtn("DLG","ambAccountEleTree")
            btn1.setDlgType("D")
            btn1.setDlgCont("amb.serv.java.service.AmbGroupsTree*202;0;0");//
           // btn1.setDlgCont("amb.serv.java.util.AccountingElementTree*201;0;0");//
            let b = JSON.stringify(btn1)
            let prarm = {
                "purpose_id":this.purposesId,
            }
            let v = JSON.stringify(prarm);
            let res = await tools.getDlgRunClass(v,b);
            if(res.data.id == 0){
                this.treeData = res.data.data.treeList;
                if(this.showEleId && this.showEleId.length>0){
                    this.newData=[];
                    for(var i=0;i<this.treeData.length;i++){
                        let node = this.treeData[i];
                        if(node.id == this.showEleId){
                            this.newData.push(node)
                        }   
                    }
                    for(var j=0;j<this.newData.length;j++){
                        this.initOpenKey(this.newData[j],0);
                    }
                    this.treeData = [];
                    this.treeData=this.newData;
                }else{
                    for(var i=0;i<this.treeData.length;i++){
                        this.initOpenKey(this.treeData[i],0);  
                    }
                }  
            }
        }
    }
    initOpenKey(node:any,index:any){
        this.expandedKeys.push(node.id);
        if(index<this.expandedLevel){
            for(var i=0;i<node.children.length;i++){
                let nn = node.children[i];
                this.initOpenKey(nn,index++);
            }
        }
    }
    //节点点击事件
    handleNodeClick(data:any,data1:any,data2:any) {
        if(this.showCbox == false){
            if(data.disabled){
                return;
            }
            let checkedKeys:any = [];
            let checkedNodes:any =[];
            checkedKeys.push(data[this.keyID])
            checkedNodes.push(data)
            this.checkData  = {keys :checkedKeys,data:checkedNodes};
        }
    }
    //多选框点击
    checkBoxClick(data:any,data1:any,data2:any) {
        let checkedKeys = data1.checkedKeys;
        let checkedNodes = data1.checkedNodes
        this.checkData = {keys :checkedKeys,data:checkedNodes};
    }
    //筛选
    @Watch("filterText")
    filterTree(){
        let ref:any = this.$refs.ambTree;
        if(ref)
            ref.filter(this.filterText);
    }
    filterNode(value:any, data:any) {
        if (!value) return true;
        return data.name.indexOf(value) !== -1;
    }
    @Watch("purposesId")
    purposesChange(){//核算目的发生变化
        this.initTreeData();
    }
    @Watch("lCheckData")
    ambChange(){
        this.checkData = this.lCheckData;
        this.selectName = "";
        if(this.checkData && this.checkData.data){
            this.selectOk();
        }
    }
    treeClickCount = 0;
    timer:any ="";
    handleNodeClick1(data:any, node:any) {
		//记录点击次数
		this.treeClickCount++;
		//单次点击次数超过2次不作处理,直接返回,也可以拓展成多击事件
		if (this.treeClickCount >= 2) {
			return;
		}
		//计时器,计算300毫秒为单位,可自行修改
	    this.timer = window.setTimeout(() => {
			if (this.treeClickCount == 1) {
				//把次数归零
				this.treeClickCount = 0;
				//单击事件处理
				
               if(this.showCbox == false){
                    if(data.disabled){
                        return;
                    }
                    let checkedKeys:any = [];
                    let checkedNodes:any =[];
                    checkedKeys.push(data[this.keyID])
                    checkedNodes.push(data)
                    this.checkData  = {keys :checkedKeys,data:checkedNodes};
                }
			} else if (this.treeClickCount > 1) {
				//把次数归零
				this.treeClickCount = 0;
				//双击事件
                 if(this.showCbox == false){
                    if(data.disabled){
                        return;
                    }
                    let checkedKeys:any = [];
                    let checkedNodes:any =[];
                    checkedKeys.push(data[this.keyID])
                    checkedNodes.push(data)
                    this.checkData  = {keys :checkedKeys,data:checkedNodes};
                }
                console.info("双击");
				this.selectOk();
			} 
		}, 200);
    }
  
}
</script>
<style scoped lang="scss" > 
.amb-tree {
    border-top: 1px solid #eee;
    border-right: 1px solid #eee;
    overflow: auto;
    height: 5.25rem;
}
.amb-tree::-webkit-scrollbar {
  width: 4px;
}
.amb-tree::-webkit-scrollbar-thumb {
  background-color: #d9d9d9;
}
</style>