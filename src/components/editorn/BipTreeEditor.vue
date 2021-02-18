<template>
        <el-col :span="span" :xs="24" :sm="24" :md="span">
        <template v-if="!bgrid">
            <el-form-item :label="cell.labelString" class="bip-input-item" :required="cell.isReq">
                <el-input :style="cell.desc?'width: calc(100% - 29px);':'width:100%'" v-model="model1" size="medium" :clearable="clearable" :disabled="disabled"
                    @focus="getFocus(true)"
                    @blur="getFocus(false)"
                    @change="dataChange"
                >
                    <el-button slot="append" icon="iconfont icon-bip-shuzhuangtu" @click="iconClick"></el-button>
                </el-input>
                <template v-if="cell.desc">
                    <span style="position:relative;line-height:32px;width:29px;padding: 5px 0px 5px 5px;">
                        <el-tooltip class="item" effect="dark" :content="cell.desc" placement="top">
                            <i class="iconfont icon-bip-shuzhuangtu" style="font-size:14px;"></i>
                        </el-tooltip>
                    </span>
                </template>
            </el-form-item>
        </template>
        <template v-else>
             <el-input v-model="model1" size="medium" :clearable="clearable" :disabled="disabled">
                 <el-button slot="append" icon="iconfont icon-bip-shuzhuangtu" @click="iconClick"></el-button>
             </el-input>
        </template>
        <template v-if="showQueryInfo">
            <bip-tree-info ref="treeinfo" :cell="cell" :cds="cds" :bipInsAid="bipInsAid" @select="select" :row="row"></bip-tree-info>
        </template>
    </el-col>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import { State, Action, Getter, Mutation } from "vuex-class";
import CDataSet from '../../classes/pub/CDataSet';
import { Cell } from '../../classes/pub/coob/Cell';
import BipInsAidNew from '../../classes/BipInsAidNew';
import CommATTR from '../../classes/CommAttr';
import BipTreeInfo from './cutil/BipTreeInfo.vue';
import { BIPUtils } from "@/utils/BaseUtil";
let baseTool = BIPUtils.baseUtil;
import {CommICL} from '@/utils/CommICL'
let ICL = CommICL
@Component({
    components:{BipTreeInfo}
})
export default class BipTreeEditor extends Vue{
    @Prop() cds!:CDataSet
    @Prop() cell!:Cell
    @Prop() row!:number
    @Prop() model!:string
    @Prop() bgrid!:boolean
    @Prop() bipInsAid!:BipInsAidNew
    @Provide() span:number = 6
    @Provide() model1:string = ''
    // @Provide() disabled:boolean = false
    @Provide() clearable:boolean = true
    @Provide() attr:CommATTR = new CommATTR()
    @Provide() showQueryInfo:boolean =false;
    @Provide() refLink:BipInsAidNew = new BipInsAidNew("")
    @Provide() linkName:string = ""    
    @Provide() aidMarkKey:string = "";
    @Provide() bcode: boolean = false;//文本编码
    @Provide() TreeDataChangeID:any =null;

    @State("aidInfos", { namespace: "insaid" }) aidInfo: any;
    @State("aidValues", { namespace: "insaid" }) aidValues: any;
    @State("inProcess", { namespace: "insaid" }) inProcess: any;
    @Action("fetchInsAid", { namespace: "insaid" }) fetchInsAid: any;
    @Action("fetchInsDataByCont", { namespace: "insaid" }) fetchInsDataByCont: any;
    @Mutation("setAidInfo", { namespace: "insaid" }) setAidInfo: any;
    @Mutation("setAidValue", { namespace: "insaid" }) setAidValue: any;

    async mounted(){
        console.log("BipTreeEditor")
        this.aidMarkKey = this.cds.ccells.obj_id + "_" + this.cell.id+'_';
        this.TreeDataChangeID = this.$bus.$on('TreeDataChange',this.dataChange)


        this.bcode = (this.cell.attr & 0x40000) > 0 ;
        if(!this.bgrid){
            this.span = Math.round(24/this.cds.ccells.widthCell*this.cell.ccHorCell)
        }else{
            this.span = 24
        }
        this.model1 = this.model
        if(baseTool.bitOperation(this.cell.attr,0x20000000000)>0 && !this.model1){
            this.iconClick();
        }
        let str = this.cell.refValue
        if(str){
            if(str.indexOf('&')>0){
                str = str.substring(2,str.length-1)
                this.linkName = str;
                if(!this.inProcess.get(ICL.AID_KEY+this.aidMarkKey+this.linkName)){
                    await this.getInsAidInfoBy(this.linkName)
                }else{
                    let rr = this.aidInfo.get(ICL.AID_KEY+this.aidMarkKey+this.linkName)
                    if(rr){
                        this.refLink = rr
                    }
                }
            }
        }else{
            if(this.bipInsAid){
                this.refLink = this.bipInsAid
                this.linkName = this.bipInsAid.id
            }
        }
        this.getRefValues();
    }

    iconClick(){
        if(this.bipInsAid){
            if (!((this.cell.attr & 0x40) > 0)) {
                this.showQueryInfo = true;
                // this.dia = true;
                setTimeout(() => {
                    let dia: any = this.$refs.treeinfo;
                    if (dia) dia.open(true);
                }, 100);
            }
        }else{
            this.$notify.warning('没有QueryEditor：'+this.cell.editName)
        }
    }

    select(vv:string,data:any){
        let dia: any = this.$refs.treeinfo;
        if (dia){
            this.model1 = vv
            this.showQueryInfo = false;
            this.getRefValues();
        }
    }
    dataChange(vv:string){ 
        if(this.cds&&this.cell){
            if(this.cds.currCanEdit()){
                let r = this.row>-1?this.row:0
                let crd = this.cds.getRecordAtIndex(r);
                crd.data[this.cell.id] = vv
                crd.c_state |= 2;
                this.cds.currRecord = Object.assign({},crd) 
                this.cds.checkGS(this.cell); 
                if(this.cds.ds_par){
                    this.cds.ds_par.currRecord.c_state |= 2;
                }
            }else{
                this.model1 = this.model
            }
        }  
    }
   beforeDestroy(){
        this.$bus.$off('TreeDataChange',this.TreeDataChangeID)
    }
    /**
     *能否编辑
     */
    get disabled(){
        let dis = (this.cell.attr&this.attr.READ)>0
        if(dis){
            return dis;
        }
        return !this.cds.currCanEdit(this.row>-1?this.row:0)
    }

    getFocus(gets: boolean) {
        if (gets) {
            if (this.refLink && this.refLink.realV) {
                this.model1 = this.refLink.realV;
            } else {
                this.model1 = this.model;
            }
        } else {
            if (this.refLink && this.refLink.showV) {
                if (this.bcode) {
                    this.model1 = this.refLink.showV;
                } else{
                    this.model1 = this.refLink.showV;
                } 
            } else {
                this.model1 = this.model;
            }
        }
    }
    async getInsAidInfoBy(editName:string,bcl:boolean = false){
        let str = editName
        if(bcl){
            str = ICL.AID_KEYCL+this.aidMarkKey+str;
        }else{
            str = ICL.AID_KEY+this.aidMarkKey+str;
        }
        let vv = this.aidInfo.get(str)
        if(!vv){
            vv  = window.sessionStorage.getItem(str)
            if(!vv){
                    let vars = {id:bcl?300:200,aid:editName,ak:this.aidMarkKey}
                    await this.fetchInsAid(vars);
            }else{
                this.refLink = JSON.parse(vv)
                let vals = {key:str,value:this.refLink}
                this.setAidInfo(vals)
            }
        }else{
            this.refLink = vv;
        }
    }
    async getRefValues(){
        if(this.refLink&&this.refLink.id.length>0&&this.model1.length>0){
             this.refLink.values = []
            if(this.model&&this.model.length>0){
                let vlarr = this.model.split(";")
                let values = [];
                for(var i=0;i<vlarr.length;i++){
                    let val = vlarr[i]
                    let cont = this.refLink.cells.cels[0].id+"='"+val+"' "
                    let key = ICL.AID_KEY+this.aidMarkKey+this.linkName+"_"+val
                    let vrs = this.aidValues.get(key);
                    if(!vrs){
                        let str = window.sessionStorage.getItem(key)
                        if(!str){
                            let vvs = {id:this.linkName,key:key,cont:cont}
                            await this.fetchInsDataByCont(vvs)
                            vrs = this.aidValues.get(key);
                            if(vrs)
                                values.push(vrs)
                        }else{
                            vrs = JSON.parse(str);
                            this.setAidValue({key:key,value:vrs})
                            values.push(vrs);
                            this.makeShow()
                        }
                    }else{
                        values.push(vrs);
                    }

                }
                this.refLink.values = []
                this.refLink.values = values
                this.makeShow() 

            }else{
                this.refLink.realV = this.model
                this.refLink.showV = this.refLink.realV
                this.makeShow()
            }
        }
    }
    makeShow() {
        if(!this.bcode){
            if(this.refLink.values&&this.refLink.values.length>0){
                if(this.refLink.values){
                    this.refLink.showV = ''
                    for(var i=0;i<this.refLink.values.length;i++){
                        let vv = this.refLink.values[i];
                        this.refLink.showV += vv[this.refLink.cells.cels[1].id]+";"||this.refLink.realV+";"
                    }
                    if(this.refLink.showV.length>1)
                    this.refLink.showV = this.refLink.showV.substring(0,this.refLink.showV.length-1)
                }else{
                    this.refLink.showV = this.refLink.realV
                }
            }else{
                this.refLink.realV = this.model1
                this.refLink.showV = this.refLink.realV
            }
        }else{
            this.refLink.realV = this.model
            this.refLink.showV = this.refLink.realV
        }
        this.getFocus(false)
    }
    @Watch('aidValues')
    aidValuesChange(){
        if(this.refLink&&this.refLink.id.length>0&&this.model1){
            if(this.model&&this.model.length>0){
                let vlarr = this.model.split(";")
                var values:any = [];
                for(var i=0;i<vlarr.length;i++){
                    let key = ICL.AID_KEY+this.aidMarkKey+this.linkName+"_"+vlarr[i]
                    let vvs = this.aidValues.get(key);
                    if(vvs){
                        this.refLink.realV = this.model
                        values.push(vvs);
                    }
                }
                this.refLink.values = []
                this.refLink.values = values
                this.makeShow()
            }
        }
    }
    @Watch('aidInfo')
    mapChanges(){
        if(!this.refLink.id){
            let rr = this.aidInfo.get(ICL.AID_KEY+this.aidMarkKey+this.linkName)
            if(rr){
                this.refLink = rr
            }
            this.getRefValues()      
        }
    }
    @Watch('model')
    valuesChange(){
        this.refLink.realV = this.model
        if(this.model1 === this.model){
            this.refLink.realV = this.model
            this.refLink.showV = this.model
        }else{
            this.refLink.realV = this.model
            this.refLink.showV = this.model
            this.model1 = this.model
        }
        this.model1 = this.model
        this.getRefValues()
    }

}
</script>
