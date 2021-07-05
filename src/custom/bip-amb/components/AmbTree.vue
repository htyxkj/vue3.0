<template> 
    <div class="amb-tree">
        <el-tree empty-text="没有阿米巴" size="mini" ref="ambTree" :data="treeData" :node-key="keyID"  @node-click="handleNodeClick" 
            @check="checkBoxClick" :expand-on-click-node="false" :highlight-current="true" :default-checked-keys="default_checked_keys"
            :props="defaultProps" :default-expanded-keys="expandedKeys" check-strictly :show-checkbox="showCbox">
            <span class="custom-tree-node" slot-scope="{ node }">
                <span>{{ node.label }}</span>
            </span>
        </el-tree>
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
</style>