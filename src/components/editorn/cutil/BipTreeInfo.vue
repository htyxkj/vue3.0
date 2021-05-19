<template>
    <el-dialog :title="bipInsAid.title" class="bip-query" :visible.sync="visible" :append-to-body="true" 
    :close-on-press-escape="true" :close-on-click-modal="false" width="30%" >
    <!-- <div style="height:200px;"> -->
        <el-input placeholder="输入关键字进行过滤" v-model="filterText"></el-input>
        <el-scrollbar style="margin-bottom:0px;  margin-right: 0px; height:200px;">
                <el-tree class="filter-tree" node-key="id"
                    lazy :load="loadNode"  default-expand-all
                    :show-checkbox="show_checkbox"
                    :props="defaultProps" accordion :currentNodeKey="currkey" @node-click="nodeClick" :highlight-current="true"
                    :filter-node-method="filterNode" style="height:80%"
                    ref="BipTreeInfoTree">
                    </el-tree>
        </el-scrollbar>
    <!-- </div> -->
    
         <span slot="footer" class="dialog-footer">
            <el-button size="small" type="danger" @click="close">取     消</el-button>  
             <!-- <el-button size="small" @click="find">刷      新</el-button>   -->
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

    defaultProps:any= {}
    data:any= []
    filterText:any = ''
    currkey:string = ''
    count:number = 0
    treeKey:string=''
    show_checkbox:boolean =false;
    @State("inProcess", { namespace: "insaid" }) inProcess: any;
    @State("aidValues", { namespace: "insaid" }) aidValues: any;
    @Mutation("setAidValue", { namespace: "insaid" }) setAidValue: any;
    @Mutation("setKeyMap", { namespace: "insaid" }) setKeyMap: any;

    mounted(){
        this.defaultProps = {
          children: 'children',
          label: 'label',
        }
        this.treeKey = ICL.AID_TREE+this.bipInsAid.id;
        let br = this.inProcess.get(this.treeKey);
        this.show_checkbox = (this.cell.attr & 0x200000) >0
        if(!br){
            this.setKeyMap(this.treeKey)
            let dd = JSON.parse(window.sessionStorage.getItem(this.treeKey)+'')
            if(!dd){
                this.find()
            }else{
                this.data = dd;
                this.initOK = true
                let vars = {key:this.treeKey,value:this.data}
                this.setAidValue(vars);
            }
        }
    }


    nodeClick(val:any){
        this.currkey = val.id
    }


    open(){
        this.visible = true;
        this.count++;
        if(this.count<2){
            // this.find()
        }
        if(this.count>100){
            this.count = 1;
        }
    } 

    async find(cont:any = ''){
        let aid = this.bipInsAid.id
        let qe = new QueryEntity("","")
        qe.cont = cont;
        qe.page.pageSize = 10000;
        qe.page.currPage = 1;
        return await tools.getBipInsAidInfo(aid, 210,qe).then(res=>{
            // console.log(res);
            let d0 = res.data;
            if(d0.id==0){
                let data = d0.data.data
                // console.log(data);
                this.data = data;
                let vars = {key:this.treeKey,value:this.data}
                this.setAidValue(vars);
                this.initOK = true
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
                console.log(checkedKeys)
                keys = checkedKeys.join(";");
            }else{
                keys = "";
            }
        }
        if(keys){
            this.$bus.$emit('datachange')
            this.$bus.$emit('TreeDataChange',keys)
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
        }else{
            resolve([]); 
        }
    }

    @Watch('filterText')
    filterTextChange(val:any) {
        let ref:any = this.$refs.tree;
        ref.filter(val);
    }

    @Watch('aidValues')
    aidValueChange(){
        if(!this.initOK){
            let d0 = this.aidValues.get(this.treeKey)
            if(d0){
                this.data = d0;
                this.initOK = true;
            }
        }
    }    


    
}
</script>