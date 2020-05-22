<template> 
    <div class="amb-tree">
        <el-tree empty-text="没有阿米巴" size="mini" :node-key="keyID" lazy :load="loadNode" @node-click="handleNodeClick" 
            @check="checkBoxClick" :expand-on-click-node="false" :highlight-current="true" :default-checked-keys="default_checked_keys"
            :props="defaultProps" :default-expanded-keys="expandedKeys" check-strictly :show-checkbox="showCbox"  >
            <span class="custom-tree-node" slot-scope="{ node }">
                <span>{{ node.label }}</span>
                 
            </span>
        </el-tree>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import CDataSet from '@/classes/pub/CDataSet';
import BipLayCells from '@/classes/ui/BipLayCells';
import QueryEntity from '@/classes/search/QueryEntity';
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi;
import { Cells } from "@/classes/pub/coob/Cells";
@Component({
    components: {
    }
})
//阿米巴 巴 树状结构
export default class AmbTree extends Vue {
    @Prop() purposesId?:string;//核算目的
    @Prop() showCbox?:boolean;//是否显示checkbox 
    fatherID:string = "parent_id";//父级ID字段
    expandedLevel:number = 100;//默认展开级别
    keyID:string = "id";//当前节点key字段
    valueID:string = "name";//当前节点value字段
    defaultProps:any = {};
    expandedKeys:any =[];//默认展开节点的key
    cds:CDataSet = new CDataSet(null);
    obj_id:string = "300103";
    node:any = null;
    resolve:any = null;
    default_checked_keys:any =[]
    async created() {
        this.defaultProps = { 
            label: this.valueID,
        } 
        await this.initTreeCell();
    }
    //获取阿米巴树结构对象
    async initTreeCell(){
        let res = await tools.getCCellsParams(this.obj_id); 
        let rtn = res.data;
        if (rtn.id == 0) {
            let kn: Array<Cells> = rtn.data.layCels;
            this.cds = new CDataSet(kn[0]);
        }
    }
    async loadNode(node:any, resolve:any) {
        let cont = "";
        if (node.level === 0) {
            this.node = node;
            this.resolve =resolve;
            cont = this.fatherID+" is null  and purpose_id = '"+this.purposesId+"'"
        } else {
            let v = node.data[this.keyID]
            cont = " "+this.fatherID+" = '"+v+"'  and purpose_id = '"+this.purposesId+"'"
        }
        let data:any = await this.initTreeData(cont)
        if(data){
            if(!Array.isArray(data)){
                data = [data]; 
            }
            if(this.expandedLevel>0 && (node.level+1)<=this.expandedLevel){
                for(var i=0;i<data.length;i++){
                    let cc:any = data[i]
                    this.expandedKeys.push(cc[this.keyID]);
                }
            }
            if(node.level === 0 && data.length>0){
                let checkedKeys:any = [];
                let checkedNodes:any =[];
                checkedKeys.push(data[0][this.keyID])
                checkedNodes.push(data[0])
                this.default_checked_keys = [data[0][this.keyID]];
                let checkData:any = {keys :checkedKeys,data:checkedNodes};
                this.$emit("dataChange",checkData);
            }
            resolve(data);
        }else{
            resolve([]); 
        }
    }
    async initTreeData(vl:any){
        let cont = vl;
        let qe:QueryEntity = new QueryEntity(this.obj_id,this.obj_id,cont);
        qe.oprid = 14
        qe.page.pageSize=1000
        let vv = await this.cds.queryData(qe);
        if(vv.data.id ==0){
            let value = vv.data.data.data.data;
            let retVl = [];
            for(var i=0;i<value.length;i++){
                retVl.push(value[i].data);
            }
            return retVl;
        }else{
            return null;
        }
    }
    //节点点击事件
    handleNodeClick(data:any,data1:any,data2:any) {
        if(this.showCbox == false){
            let checkedKeys:any = [];
            let checkedNodes:any =[];
            checkedKeys.push(data[this.keyID])
            checkedNodes.push(data)
            let checkData:any = {keys :checkedKeys,data:checkedNodes};
            this.$emit("dataChange",checkData);
        }
    }
    //多选框点击
    checkBoxClick(data:any,data1:any,data2:any) {
        let checkedKeys = data1.checkedKeys;
        let checkedNodes = data1.checkedNodes
        let checkData:any = {keys :checkedKeys,data:checkedNodes};
        this.$emit("dataChange",checkData);
    }
    @Watch("purposesId")
    purposesChange(){//核算目的发生变化
        this.node.childNodes = [];
        this.loadNode(this.node,this.resolve);
    }
}
</script>
<style scoped lang="scss" > 
.amb-tree {
    border-top: 1px solid #eee;
    border-right: 1px solid #eee;
    overflow: auto;
}
.amb-tree::-webkit-scrollbar {
  width: 4px;
}
.amb-tree::-webkit-scrollbar-thumb {
  background-color: #d9d9d9;
}
</style>
<style>
.custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    padding-right: 8px;
}
</style>