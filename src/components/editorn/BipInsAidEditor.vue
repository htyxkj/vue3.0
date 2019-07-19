<template>
    <el-col :span="span" :xs="24" :sm="24" :md="span">
        <template v-if="!bgrid">
            <el-form-item :label="cell.labelString" class="bip-input-item" :required="cell.isReq">
                <el-input v-model="model1" size="small" :clearable="clearable" :disabled="(cell.attr&0x40)>0" 
                        @focus="getFocus(true)"
                        @blur="getFocus(false)"
                    >
                    <el-button slot="append" icon="el-icon-search" @click="iconClick"></el-button>
                </el-input>
            </el-form-item>
        </template>
        <template v-else>
             <el-input v-model="model1" size="small" :clearable="clearable" :disabled="(cell.attr&0x40)>0">
                 <el-button slot="append" icon="el-icon-search" @click="iconClick"></el-button>
             </el-input>
        </template>

        <!-- <template v-if="dia"> -->
            <bip-pop-view :cell="cell" :cds="cds" :bipInsAid="bipInsAid" :row="row"
                ref="ak" @select="selectOK"
            ></bip-pop-view>
        <!-- </template> -->

    </el-col>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import CDataSet from '@/classes/pub/CDataSet';
import { Cell } from '@/classes/pub/coob/Cell';
import {CommICL} from '@/utils/CommICL'
let ICL = CommICL

import { State, Action, Getter, Mutation } from "vuex-class";
import BipInsAidNew from '../../classes/BipInsAidNew';
import { BIPUtil } from '@/utils/Request';
import BipPopView from './cutil/BipPopView.vue'
let tools = BIPUtil.ServApi
@Component({
    components:{BipPopView}
})
export default class BipInsAidEditor extends Vue{
    @Prop() cds!:CDataSet
    @Prop() cell!:Cell
    @Prop() model:any
    @Prop() row!:number
    @Prop() bgrid!:boolean
    @Prop() bipInsAid!:BipInsAidNew
    @Provide() model1:any = ""
    @Provide() clearable:boolean = false
    @Provide() multiple:boolean = false
    @Provide() refId:string = ''
    @Provide() initOK:boolean = false
    @Provide() span:number = 6

    @Provide() methodName:string = ''

    @Provide() dia:boolean = false;


    @Provide() mulcols: boolean = false;//多列
    @Provide() bcode: boolean = false;//文本编码
    @Provide() bfmt: boolean = false;//格式化
    @Provide() othCols: Array<string> = [];
    @Provide() othColsIndex: Array<number> = [];
    @Provide() refLink:BipInsAidNew = new BipInsAidNew("")
    @Provide() linkName:string = ""

    @State("aidInfos", { namespace: "insaid" }) aidInfo: any;
    @State("aidValues", { namespace: "insaid" }) aidValues: any;
    @State("inProcess", { namespace: "insaid" }) inProcess: any;
    @Action("fetchInsAid", { namespace: "insaid" }) fetchInsAid: any;
    @Action("fetchInsDataByCont", { namespace: "insaid" }) fetchInsDataByCont: any;
    @Mutation("setAidInfo", { namespace: "insaid" }) setAidInfo: any;
    @Mutation("setAidValue", { namespace: "insaid" }) setAidValue: any;
    async mounted(){
        this.multiple = (this.cds.ccells.attr&0x80)>0
        this.mulcols = (this.cell.attr & 0x100000) > 0;
        this.bfmt = (this.cell.attr & 0x10000) > 0;
        this.bcode = (this.cell.attr & 0x40000) > 0 || (this.bipInsAid!=null && this.bipInsAid.bType === 'CGroupEditor');
        if(!this.bgrid){
            this.span = Math.round(24/this.cds.ccells.widthCell*this.cell.ccHorCell)
        }else{
            this.span = 24
        }
        this.model1 = this.model
        let str = this.cell.refValue
        if(str){
            if(str.indexOf('&')>0){
                str = str.substring(2,str.length-1)
                this.linkName = str;
                if(!this.inProcess.get(ICL.AID_KEY+this.linkName)){
                    // console.log(this.linkName)
                    await this.getInsAidInfoBy(this.linkName)
                }else{
                    let rr = this.aidInfo.get(ICL.AID_KEY+this.linkName)
                    console.log(rr)
                    if(rr)
                        this.refLink = rr
                }
            }
        }else{
            if(this.bipInsAid){
                this.refLink = this.bipInsAid
                this.linkName = this.bipInsAid.id
            }

        }
        // this.refLink = Object.assign({},this.refLink,this.bipInsAid)
        if(this.refLink){
            this.refLink.realV = this.model
            this.refLink.showV = this.model
        }

        this.getRefValues()
        this.methodName = ICL.EV_CELL_CHANGE+'_'+this.cds.ccells.obj_id+'_'+this.cell.id
        if(this.mulcols)
            this.initMulColInfo()

    }

    iconClick() {
        if(this.bipInsAid){
            if (!((this.cell.attr & 0x40) > 0)) {
                // this.dia = true;
                setTimeout(() => {
                    let dia: any = this.$refs.ak;
                    if (dia) dia.open();
                }, 100);
            }
        }else{
            this.$notify.warning('没有辅助：'+this.cell.editName)
        }

    }

    selectOK(val:any,close:boolean = false){
        let record: any = this.cds.getRecordAtIndex(this.row<0?0:this.row);
        this.cds.currRecord = record;
        this.cds.setStateOrAnd(ICL.R_EDITED);
        this.model1 = val[this.bipInsAid.cells.cels[0].id]
        record[this.cell.id] = this.model1
        this.setAidValue({key:this.bipInsAid.id+"_"+this.model1,value:val})
        if (this.mulcols) {
            this.othCols.forEach((fld, index) => {
                let idx = this.othColsIndex[index];
                let layC = this.bipInsAid.cells.cels[idx];
                if (layC) {
                    record[fld] = val[layC.id]||"";
                }
            });
        }
        if(this.refLink){
            this.refLink.realV = this.model1
            this.refLink.showV = val[this.bipInsAid.cells.cels[1].id]
            this.refLink.values = []
            this.refLink.values[0] = val
        }

        record = Object.assign({},record)
        this.cds.currRecord = record
        this.cds.setRecordAtIndex(record,this.row<0?0:this.row)
        this.$bus.$emit('cell_edit')
        this.getRefValues()
        if(close){
            setTimeout(() => {
                let dia: any = this.$refs.ak;
                if (dia) dia.close();
            }, 100);
        }
    }
//#region /**初始化多列参照 */
    initMulColInfo() {
        let script = this.cell ? this.cell.script : "";
        if (script) {
            let vals = script.split("&");
            if (vals.length < 2) {
                this.$notify.error("多列定义错误" + script);
            } else {
                let flds = vals[0].split(",");
                let flds_index: Array<number> = vals[1]
                    .split(",")
                    .map(value => {
                        return parseInt(value);
                    });
                if (flds.length != flds_index.length) {
                    this.$notify.error(
                        "多列参照定义的字段和下标的个数不对" + script
                    );
                } else {
                    this.othCols = flds;
                    this.othColsIndex = flds_index;
                }
            }
        }
    }
//#endregion

    makeShow() {
        if(!this.bcode){
            if(this.refLink.values&&this.refLink.values.length>0){
                let vv = this.refLink.values[0];
                console.log(this.refLink)
                if(vv){
                    this.refLink.showV = vv[this.refLink.cells.cels[1].id]||this.refLink.realV
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

    getRefValues(){
        if(this.refLink&&this.refLink.id.length>0&&this.model1.length>0){
            console.log(this.refLink,'fdsfdsfdsfd')
             this.refLink.values = []
            if(this.model&&this.model.length>0){
                let cont = this.refLink.cells.cels[0].id+"='"+this.model+"' "
                let key = ICL.AID_KEY+this.linkName+"_"+this.model
                console.log('获取辅助值',key)
                let vrs = this.aidValues.get(key);
                console.log('获取辅助值',key,vrs)
                if(!vrs){
                    console.log('缓存没有',key,vrs)
                    let str = window.sessionStorage.getItem(key)
                    console.log('session没有',key,vrs)
                    if(!str){
                        let vvs = {id:this.linkName,key:key,cont:cont}
                        console.log('服务器获取',vvs)
                        this.fetchInsDataByCont(vvs)
                    }else{
                        vrs = JSON.parse(str);
                        this.setAidValue({key:key,value:vrs})
                        this.refLink.values = []
                        this.refLink.values[0] = vrs
                        this.makeShow()
                    }
                }else{
                    this.refLink.values = []
                    this.refLink.values[0] = vrs
                    this.makeShow()
                }

            }else{
                this.refLink.realV = this.model
                this.refLink.showV = this.refLink.realV
                this.makeShow()
            }
        }
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
            str = ICL.AID_KEYCL+str;
        }else{
            str = ICL.AID_KEY+str;
        }
        let vv = this.aidInfo.get(str)
        if(!vv){
            vv  = window.sessionStorage.getItem(str)
            if(!vv){
                    let vars = {id:bcl?300:200,aid:editName}
                    console.log(vars)
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

    @Watch('aidInfo')
    mapChanges(){
        if(!this.refLink.id){
            let rr = this.aidInfo.get(ICL.AID_KEY+this.linkName)
            if(rr){
                this.refLink = rr
            }
            this.getRefValues()      
        }
    }

    @Watch('model')
    valueChanges(){
        console.log(this.model,'model change')
        this.refLink.realV = this.model
        if(this.model1 === this.model){
            console.log('相等',this.model,this.model1,this.cell.id)
            this.refLink.realV = this.model
            this.refLink.showV = this.model
        }else{
            this.refLink.realV = this.model
            this.refLink.showV = this.model
            this.model1 = this.model
            console.log('不相等',this.model,this.model1,this.cell.id)
        }
        if(this.model.length>0)
            this.getRefValues()
        else{
            this.refLink.values = []
            this.makeShow() 
        }
        
    }

    @Watch('aidValues')
    aidValuesChange(){
    console.log('aidValues change',this.model)
        if(this.refLink&&this.refLink.id.length>0&&this.model1){
            let key = ICL.AID_KEY+this.linkName+"_"+this.model
            let vvs = this.aidValues.get(key);
            console.log('获取到值：',key,vvs);
            if(vvs){
                this.refLink.realV = this.model
                this.refLink.values = []
                this.refLink.values[0] = vvs
                this.makeShow()
            }

        }
    }

    @Watch('bipInsAid')
    bipInsAidChange(){
        this.bcode = (this.cell.attr & 0x40000) > 0 || (this.bipInsAid!=null && this.bipInsAid.bType === 'CGroupEditor');
        if(this.refLink.id.length==0){
           this.refLink = this.bipInsAid 
        }
    }
    



}
</script>



