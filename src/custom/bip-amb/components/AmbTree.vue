<template> 
    <div>
        <div class="menuSW" @click="isCollapse = !isCollapse">
            <i v-if="isCollapse" class="iconfont el-icon-d-arrow-right menuicon pointer"></i>
            <i v-else class="iconfont el-icon-d-arrow-left menuicon pointer"></i>
        </div>
        <el-menu mode="vertical" :collapse-transition="false"  :unique-opened="false" router :collapse="isCollapse" :style="!isCollapse?'width:300px;height:100%;':'width:36px;height:100%;'">
            <div class="amb-tree" :style='isCollapse?"display:none;":"width:300px;height:95%"'>
                <el-tree empty-text="没有阿米巴" size="mini" ref="ambTree" :data="treeData" :node-key="keyID"  @node-click="handleNodeClick" 
                     @check="checkBoxClick" :expand-on-click-node="false" :highlight-current="true" :default-checked-keys="default_checked_keys"
                        :props="defaultProps" :default-expanded-keys="expandedKeys" check-strictly :show-checkbox="showCbox">
                    <span class="custom-tree-node" slot-scope="{ node }">
                        <template v-if="node.disabled">
                            <span style="color:#bcbcbc">{{ node.label }}</span>
                        </template>
                        <template v-else>
                            <span>{{ node.label }}</span>
                        </template>
                    </span>
                </el-tree>
            </div>             
        </el-menu>
    </div>
  
  
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi;
import {BipMenuBtn} from '@/classes/BipMenuBtn'
@Component({
    components: {
    }
})
//阿米巴 巴 树状结构
export default class AmbTree extends Vue {
    @Prop() purposesId?:string;//核算目的
    @Prop() showCbox?:boolean;//是否显示checkbox 
    expandedLevel:number = 100;//默认展开级别
    keyID:string = "id";//当前节点key字段
    defaultProps:any = {children: 'children',label: 'name'};
    expandedKeys:any =[];//默认展开节点的key
    default_checked_keys:any =[]
    treeData:any = [];
    selectName:any = "";
    checkData:any = null;
    isCollapse:boolean=false;
    async created() {
        await this.initTreeData();
    }
    async initTreeData(){ 
        if(this.purposesId){
            let btn1 = new BipMenuBtn("DLG","ambTree")
            btn1.setDlgType("D")
            btn1.setDlgCont("amb.serv.java.service.AmbGroupsTree*201;0;0");//职能损益表
            let b = JSON.stringify(btn1)
            let prarm = {
                "purpose_id":this.purposesId,
            }
            let v = JSON.stringify(prarm);
            let res = await tools.getDlgRunClass(v,b);
            if(res.data.id == 0){
                this.treeData = res.data.data.treeList;
                for(var i=0;i<this.treeData.length;i++){
                    let node = this.treeData[i];
                    this.initOpenKey(node,0);
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
                this.checkData  = {keys :null,data:null};
                this.$emit("dataChange",this.checkData );
                return;
            }
            let checkedKeys:any = [];
            let checkedNodes:any =[];
            checkedKeys.push(data[this.keyID])
            checkedNodes.push(data)
            this.checkData  = {keys :checkedKeys,data:checkedNodes};
            this.$emit("dataChange",this.checkData );
        }
    }
    //多选框点击
    checkBoxClick(data:any,data1:any,data2:any) {
        let checkedKeys = data1.checkedKeys;
        let checkedNodes = data1.checkedNodes
        this.checkData = {keys :checkedKeys,data:checkedNodes};
        this.$emit("dataChange",this.checkData );
    }
    @Watch("purposesId")
    purposesChange(){//核算目的发生变化
        this.initTreeData();
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
.menuSW{        
       // @include bip_text_primary;
        height: 35px;
        line-height: 35px;
        background-color: #fff;
        border-bottom: 0.1px solid rgba(99, 99, 99, 0.322);
        text-align: right;
        cursor: pointer;
        i {
            padding-top: 8px;
            padding-right: 8px;
            font-size: 20px;
            color:#606266;
        }
    }
</style>