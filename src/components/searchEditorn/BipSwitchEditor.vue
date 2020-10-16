<template>
    <el-col :span="span" :xs="24" :sm="24" :md="span">
        <template v-if="!bgrid">
            <el-form-item :label="cell.labelString" class="bip-input-item" :required="cell.isReq">
                <el-switch v-model="model1" style="padding-top:8px;" :disabled="(cell.attr&0x40)>0" @change="dataChange"></el-switch>
            </el-form-item>
        </template>
        <template v-else>
            <el-switch v-model="model1" style="padding-top:8px;" :disabled="(cell.attr&0x40)>0" @change="dataChange"></el-switch>
        </template>
    </el-col>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import { State, Action, Getter, Mutation } from 'vuex-class';
import CDataSet from '@/classes/pub/CDataSet';
import { Cell } from '@/classes/pub/coob/Cell';
import { CommICL } from '@/utils/CommICL';
let icl = CommICL
@Component({})
export default class BipSwitchEditor extends Vue{
    @Prop() cds!:CDataSet
    @Prop() cell!:Cell
    @Prop() row!:number
    @Prop() model:any
    @Prop() bgrid!:boolean
    @Provide() model1:boolean = false;
    @Provide() clearable:boolean = true
    @Provide() methodName:string = ''
    @Provide() span:number = 6
    @Provide() switchBtn:Array<any>=[];
    
    @State("aidValues", { namespace: "insaid" }) aidValues: any;
    @Action("fetchInsAid", { namespace: "insaid" }) fetchInsAid: any;
    @Mutation("setAidValue", { namespace: "insaid" }) setAidValue: any;
    @Mutation("setAidInfo", { namespace: "insaid" }) setAidInfo: any;

    async mounted(){
        this.model1 = this.model == 0 ?false:true;
        if(this.bgrid){
            this.span = 24
        }else{
            this.span = Math.round(24/this.cds.ccells.widthCell*this.cell.ccHorCell)
        }
        this.methodName = icl.EV_CELL_CHANGE+'_'+this.cds.ccells.obj_id+'_'+this.cell.id;
        let name ="STH."+this.cds.ccells.obj_id;
        let sth = await this.initSTH(name);
        if(sth){
            let slink = sth.slink.split("&");
            for(var i=0;i<slink.length;i++){
                let v = slink[i];
                let sth00 = {}; 
                let key = v.substring(0,1);
                v = v.substring(2).split(";");
                let showField = [];
                for(var j=1;j<v.length;j++){
                    showField.push(v[j]);
                } 
                sth00 = { key:key,field:v[0],showField:showField}
                this.switchBtn.push(sth00);
            }
        }
        this.switchChange();
    }

    dataChange(value:any){
        if(this.cds&&this.cell){
            if(this.cds.currCanEdit()){
                this.cds.currRecord.data[this.cell.id] = this.model1 == true?1:0;
                this.cds.cdata.data[this.cds.index] = this.cds.currRecord;
                // const key:string = this.cell.id
                if(this.cds.baseI){
                    this.cds.baseI.cellDataChange(this.cds,this.cell.id,this.model1 == true?1:0)
                }
                this.cds.setStateOrAnd(icl.R_EDITED)
                this.cds.checkGS(this.cell);
                this.cds.currRecord.c_state |= 2;
                if(this.cds.ds_par){
                    this.cds.ds_par.currRecord.c_state |= 2;
                }
                this.switchChange();
            }else{
                this.model1 = this.model == 0 ?false:true;
            }
        }   
    }

    switchChange(){
        for(var i=0;i<this.switchBtn.length;i++){
            let b = this.switchBtn[i];
            if(b.field == this.cell.id){
                let zd = b.showField;
                let cc=[];
                let c0 = zd[0];
                let c1 = zd[1];
                c0 = c0.split(":")[1];
                c1 = c1.split(":")[1];
                if(this.model1){
                    if(c0.split(":")[0] =="0"){
                        cc = [this.cds.ccells.obj_id,b.key,c0,c1]
                    }else{
                        cc = [this.cds.ccells.obj_id,b.key,c1,c0]
                    }
                }else{
                    if(c0.split(":")[0] =="0"){
                        cc = [this.cds.ccells.obj_id,b.key,c1,c0]
                    }else{
                        cc = [this.cds.ccells.obj_id,b.key,c0,c1]
                    }
                }
                this.$bus.$emit('switchChange',cc,) 
            }
        }
    }

    //获取常量中 字段隐藏 开关定义
    async initSTH(name:any){
        let str = name
        str = icl.AID_KEYCL+str;
        if(!this.aidValues.get(str)){
            let vv  = window.sessionStorage.getItem(str)
            if(!vv){
                let vars = {id:300,aid:name}
                await this.fetchInsAid(vars);
                let vv  = window.sessionStorage.getItem(str)
                if(vv){
                    let vals = {key:str,value:JSON.parse(vv)}
                    this.setAidValue(vals)
                }
            }else{
                let vals = {key:str,value:JSON.parse(vv)}
                this.setAidValue(vals)
            } 
        }
        return this.aidValues.get(str);
    }
    @Watch("model")
    cdataSetRecordChange(){
        if(this.cds&&this.cell){
            if( this.model !== this.model1){
                this.model1 = this.model == 0 ?false:true;
            }
        }
    }
}
</script>


