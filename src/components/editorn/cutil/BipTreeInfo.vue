<template>
    <el-dialog :title="bipInsAid.title" class="bip-query" :visible.sync="visible" :append-to-body="true" 
    :close-on-press-escape="true" :close-on-click-modal="false" width="30%" >
    <!-- <div style="height:200px;"> -->
        <el-input placeholder="输入关键字进行过滤" v-model="filterText"></el-input>
        <el-scrollbar style="margin-bottom:0px;  margin-right: 0px; height:200px;">
                <el-tree class="filter-tree" :data="data" node-key="id"
                    :props="defaultProps" accordion :currentNodeKey="currkey" @node-click="nodeClick" :highlight-current="true"
                    :filter-node-method="filterNode" style="height:80%"
                    ref="tree">
                    </el-tree>
        </el-scrollbar>
    <!-- </div> -->
    
         <span slot="footer" class="dialog-footer">
            <el-button size="small" type="danger" @click="close">取     消</el-button>  
             <el-button size="small" @click="find">刷      新</el-button>  
            <el-button size="small" type="primary" @click="selectOK">选     中</el-button>    
        </span>
    </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import BipInsAidNew from '@/classes/BipInsAidNew';
import { Cells } from '@/classes/pub/coob/Cells';
import CDataSet from '@/classes/pub/CDataSet';
import { Cell } from '@/classes/pub/coob/Cell';
import { State, Action, Getter, Mutation } from "vuex-class";
import { BIPUtil } from "@/utils/Request";
import QueryEntity from '../../../classes/search/QueryEntity';
let tools = BIPUtil.ServApi;
@Component({
})
export default class BipTreeInfo extends Vue{
    @Prop() cds!:CDataSet
    @Prop() cell!:Cell
    @Prop() bipInsAid!:BipInsAidNew
    @Prop() row!:number

    @Provide() visible:boolean = false
    @Provide() initOK:boolean = false

    @Provide() defaultProps:any= {}
    @Provide() data:any= []
    @Provide() filterText:any = ''
    @Provide() currkey:string = ''
    @Provide() count:number = 0
    @Provide() treeKey:string=''
    @State("inProcess", { namespace: "insaid" }) inProcess: any;
    @State("aidValues", { namespace: "insaid" }) aidValues: any;
    @Mutation("setAidValue", { namespace: "insaid" }) setAidValue: any;
    @Mutation("setKeyMap", { namespace: "insaid" }) setKeyMap: any;

    mounted(){
        this.defaultProps = {
          children: 'children',
          label: 'label',
        }
        this.treeKey = 'TREE_KEY_'+this.bipInsAid.id;
        let br = this.inProcess.get(this.treeKey);
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
        this.currkey = ''
        if(!val.haveChildren){
            this.currkey = val.id
        }
    }


    open(){
        this.visible = true;
        this.count++;
        if(this.count<2)
            this.find()
        if(this.count>100){
            this.count = 1;
        }
    } 

    find(){
        let aid = this.bipInsAid.id
        let qe = new QueryEntity("","")
        tools.getBipInsAidInfo(aid, 210,qe).then(res=>{
            // console.log(res);
            let d0 = res.data;
            if(d0.id==0){
                let data = d0.data.data
                // console.log(data);
                this.data = data;
                let vars = {key:this.treeKey,value:this.data}
                this.setAidValue(vars);
                this.initOK = true
            }
        })
    }

    close(){
        this.visible = false
    }

    selectOK(){
        if(this.currkey){
            let r = this.row>-1?this.row:0
            let crd = this.cds.getRecordAtIndex(r);
            crd.data[this.cell.id] = this.currkey
            crd.c_state |= 2;
            this.cds.currRecord = Object.assign({},crd)
            this.$bus.$emit('datachange')
            this.$emit('select',this.currkey);
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