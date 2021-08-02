<template>
    <el-dialog :title="bipInsAid.title" class="bip-query" :visible.sync="visible" :append-to-body="true" 
    :close-on-press-escape="true" :close-on-click-modal="false" width="40%" >
        <el-input placeholder="输入关键字进行过滤" v-model="filterText"></el-input>
        <div class="BipTreeInfoTree">
            <el-scrollbar style="height:100%;">
                <el-tree v-if="bipInsAid.sref" :node-key="treeKey"
                    lazy :load="loadNode"  
                    :show-checkbox="show_checkbox"
                    :props="defaultProps" accordion :currentNodeKey="currkey" @node-click="nodeClick" :highlight-current="true"
                    :filter-node-method="filterNode" :default-expanded-keys="expandedKeys"
                    ref="BipTreeInfoTree">
                    </el-tree>
                <el-tree v-else :node-key="treeKey" :show-checkbox="show_checkbox" :data="data" accordion highlight-current ref="BipTreeInfoTree" @node-click="nodeClick" :filter-node-method="filterNode"></el-tree>
            </el-scrollbar>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button size="small" type="danger" @click="close">取     消</el-button>
            <el-button size="small" type="primary" @click="selectOK">确     定</el-button>
        </span>
    </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import BipInsAidNew from '@/classes/BipInsAidNew';
import CDataSet from '@/classes/pub/CDataSet';
import { Cell } from '@/classes/pub/coob/Cell';
import { State, Mutation } from "vuex-class";
import { BIPUtil } from "@/utils/Request";
import QueryEntity from '../../../classes/search/QueryEntity';
let tools = BIPUtil.ServApi;
import {CommICL} from '@/utils/CommICL'
let ICL = CommICL
@Component({
})
export default class BipTreeInfo extends Vue{
    @Prop() cds!:CDataSet
    @Prop() cell!:Cell
    @Prop() bipInsAid!:BipInsAidNew
    @Prop() row!:number

    visible:boolean = false
    initOK:boolean = false

    defaultProps:any= {children: 'children',label: 'label',}
    data:any= []
    filterText:any = ''
    currkey:string = ''
    treeKey:string=''
    show_checkbox:boolean =false;    
    expandedKeys:any = [];//默认展开key
    expandedLevel = 3;//默认展开级次

    mounted(){
    }
    nodeClick(val:any){
        this.currkey = val.id
    }
    open(){
        this.visible = true;
        if(this.bipInsAid.sref == null){
            this.treeKey = ICL.AID_TREE+this.bipInsAid.id;
            this.show_checkbox = (this.cell.attr & 0x200000) >0
            this.find()
        }
    } 

    async find(cont:any = ''){
        let aid = this.bipInsAid.id
        let qe = new QueryEntity("","")
        qe.cont = cont;
        qe.page.pageSize = 10000;
        qe.page.currPage = 1;
        return await tools.getBipInsAidInfo(aid, 210,qe).then(res=>{
            let d0 = res.data;
            if(d0.id==0){
                let data = d0.data.data
                this.data = data;
                return data;
            }
        })
    }

    close(){
        this.visible = false
    }

    selectOK(){
        let keys = this.currkey
        if(this.show_checkbox){
            let ref:any = this.$refs.BipTreeInfoTree;
            if(ref){
                let checkedKeys = ref.getCheckedKeys();
                keys = checkedKeys.join(";");
            }else{
                keys = "";
            }
        }
        if(keys){
            this.$bus.$emit('datachange')
            this.$emit('TreeDataChange',keys)
            // this.$emit('select',this.currkey);
            this.visible = false;
            return 
        }else{
            this.$notify.info("请选择节点!");
            return ;
        }
    }

    filterNode(value:any, data:any) {
        if (!value) return true;
        return data.label.indexOf(value) !== -1;
    }

    async loadNode(node:any, resolve:any) {
        let cont = "";
        if (node.level === 0) {
          cont = ""
        } else {
            let v = node.data.id
            cont = v;
        }
        let data = await this.find(cont)
        if(data){
            if(Array.isArray(data)){
                resolve(data);
            }else{
                resolve([data]); 
            } 
            if(this.expandedLevel>0 && (node.level+1)<=this.expandedLevel){
                for(var i=0;i<data.length;i++){
                    let cc:any = data[i]
                    this.expandedKeys.push(cc[this.treeKey]);
                }
            }
        }else{
            resolve([]); 
        }
    }

    @Watch('filterText')
    filterTextChange(val:any) {
        let ref:any = this.$refs.tree;
        ref.filter(val);
    }
}
</script>
<style lang="scss">
.BipTreeInfoTree{
    height: 3.90625rem;
    .el-scrollbar__wrap{
        overflow: auto;
    }
}
</style>