<template>
    <el-col :span="span" :xs="24" :sm="24" :md="span">
        <template v-if="!bgrid">
            <el-form-item :label="cell.labelString" class="bip-input-item" :required="cell.isReq">
                <span slot="label" v-if="cell.labelString">
                    <template v-if="cell.labelString.length>(cell.isReq?4:6)">
                        <el-tooltip class="item" effect="dark" :content="cell.labelString" placement="top">
                            <span>{{cell.labelString.substring(0,(cell.isReq?4:5))}}…</span>
                        </el-tooltip>
                    </template>
                    <template v-else>
                        {{cell.labelString}}
                    </template>
                </span>                 
                <el-input :placeholder="cell.placeholder" :style="cell.desc?'width: calc(100% - 29px);':''" v-model="model1" size="medium" :clearable="clearable" :disabled="(cell.attr&0x40)>0" :readonly="true" @change="dataChange" @focus='focus'>
                    <el-button slot="append" icon="el-icon-tickets" @click="iconClick"></el-button>
                </el-input>
                <template v-if="cell.desc">
                    <span style="position:relative;line-height:32px;width:29px;padding: 5px 0px 5px 5px;">
                        <el-tooltip class="item" effect="dark" :content="cell.desc" placement="top">
                            <i class="iconfont icon-bip-bangzhu" style="font-size:14px;"></i>
                        </el-tooltip>
                    </span>
                </template>
            </el-form-item>
        </template>
        <template v-else>
             <el-input :placeholder="cell.placeholder" v-model="model1" size="medium" :clearable="clearable" :disabled="(cell.attr&0x40)>0" :readonly="true" @change="dataChange" @focus='focus'>
                 <el-button slot="append" icon="el-icon-tickets" @click="iconClick"></el-button>
             </el-input>
        </template>

        <!-- <template v-if="dia"> -->
        <bip-copy-info
            ref="ak"
            :opera='opera'
            :ref_cds="cds"
            @select="selectCallBack"
        ></bip-copy-info>
        <!-- </template> -->

    </el-col>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import CDataSet from '@/classes/pub/CDataSet';
import { Cell } from '@/classes/pub/coob/Cell';
import { CommICL } from '@/utils/CommICL';
let icl = CommICL
import BipInsAidNew from '../../classes/BipInsAidNew';
import BipCopyInfo from './cutil/BipCopyInfo.vue'
@Component({
    components:{BipCopyInfo}
})
export default class BipFlowEditor extends Vue{
    @Prop() cds!:CDataSet
    @Prop() cell!:Cell
    @Prop() model:any
    @Prop() row!:number
    @Prop() bgrid!:boolean
    @Prop() bipInsAid!:BipInsAidNew
    model1:any = ""
    clearable:boolean = true
    multiple:boolean = false
    refId:string = ''
    initOK:boolean = false
    span:number = 6

    methodName:string = ''

    dia:boolean = false;


    mulcols: boolean = false;//多列
    bcode: boolean = false;//文本编码
    bfmt: boolean = false;//格式化
    othCols: Array<string> = [];
    othColsIndex: Array<number> = [];
    opera:any=null;

    mounted(){
        this.opera = this.cds.opera;
        if(!this.opera && this.cds.ds_par){
            this.opera = this.cds.ds_par.opera;
        }
        this.multiple = (this.cds.ccells.attr&0x80)>0
        this.mulcols = (this.cell.attr & 0x100000) > 0;
        this.bfmt = (this.cell.attr & 0x10000) > 0;
        this.bcode = (this.cell.attr & 0x40000) > 0;
        if(!this.bgrid){
            this.span = Math.round(24/this.cds.ccells.widthCell*this.cell.ccHorCell)
        }else{
            this.span = 24
        }
        if(this.multiple){
            this.model1 = []
            if(this.model)
                this.model1 = this.model.split(',')||this.model.split(';')
        }else{
            this.model1 = this.model
        }
        this.methodName = icl.EV_CELL_CHANGE+'_'+this.cds.ccells.obj_id+'_'+this.cell.id
        if(this.mulcols)
        this.initMulColInfo()

    }


    dataChange(value:any){
        let str = ""
        if(this.multiple){
            this.model1 = []
            value.forEach((item:string)=>{
                if(item!==''){
                    str+=item+';'
                    this.model1.push(item)
                }       
            })
            str = str.substring(0,str.length-1)
        }else{
            str = this.model1
        }
        if( str !== this.model){
            if(this.cds.currCanEdit()){ 
                this.cds.setStateOrAnd(icl.R_EDITED)
                let record = this.cds.currRecord
                record.data[this.cell.id] = str
                this.cds.currRecord = Object.assign({},record);
                this.cds.cdata.data[this.cds.index] = Object.assign({},record)
                const key:string = this.cell.id
                this.$bus.$emit(this.methodName,{cellId:key,value:this.model1,row:this.cds.index})
                this.cds.cellChange(key,str);
                this.cds.checkGS(this.cell);
                this.cds.currRecord.c_state |= 2;
                if(this.cds.ds_par){
                    this.cds.ds_par.currRecord.c_state |= 2;
                }
            }else{
                this.model1 = this.model
            }   
        } 
    }

    iconClick() {
        this.focus();
        if (!((this.cell.attr & 0x40) > 0)) {
            // this.dia = true;
            setTimeout(() => {
                let dia: any = this.$refs.ak;
                if (dia) dia.open();
            }, 100);
        }
    }

    selectCallBack(val:any,close:boolean = false){
  
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
    
    focus(){
        this.$emit("focus",{})
    }
//#endregion

    @Watch('model')
    valueChange(){
        if(this.multiple){
            let str = this.model||''
            if(str.length>0){
                this.model1 = str.split(';')||str.split(',')
            }
        }else{
            if(this.model!=this.model1){
                this.model1 = this.model
            }
        }

    }



}
</script>




