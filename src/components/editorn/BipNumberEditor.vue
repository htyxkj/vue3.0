<template>
    <el-col :span="span" :xs="24" :sm="24" :md="span">
         <template v-if="!bgrid">
            <el-form-item :label="cell.labelString" class="bip-input-item" :required="cell.isReq">
                <el-input size="small" v-model="model1" :clearable="clearable" 
                :disabled="(cell.attr&0x40)>0" @change="dataChange" :precision="ccPoint" controls-position="right"></el-input>
            </el-form-item>
         </template>
         <template v-else>
             <el-input size="small" v-model="model1" :clearable="clearable" 
                :disabled="(cell.attr&0x40)>0" @change="dataChange" :precision="ccPoint" controls-position="right"></el-input>
         </template>
    </el-col>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import CDataSet from '@/classes/pub/CDataSet';
import { Cell } from '@/classes/pub/coob/Cell';
import { CommICL } from '@/utils/CommICL';
let icl = CommICL
@Component({})
export default class BipNumberEditor extends Vue{
    @Prop() cds!:CDataSet
    @Prop() cell!:Cell
    @Prop() model:any
    @Prop() bgrid!:boolean
    @Prop() row!:number
    @Provide() model1:any = ''
    @Provide() clearable:boolean = false
    @Provide() ccPoint:number = 0
    @Provide() span:number=  6
    mounted(){
        if(this.model){
            this.model1 = parseFloat(this.model+'')
        }else{
            this.model1 = null
        }
       
        this.ccPoint = this.cell.ccPoint
        if(!this.bgrid){
            this.span = Math.round(24/this.cds.ccells.widthCell*this.cell.ccHorCell)
        }else{
            this.span = 24
        }
    }

    dataChange(value:string|number){
        if(this.cds.currCanEdit()){
            if(this.model1 !== this.model){
                this.cds.currRecord.data[this.cell.id] = this.model1;
                this.cds.cellChange(this.cell.id,this.model1);
                if(this.cds.baseI){
                    console.log('cellDataChange',this.model1)
                    this.cds.baseI.cellDataChange(this.cds,this.cell.id,this.model1)
                }
                this.cds.setStateOrAnd(icl.R_EDITED)
                if(this.cds.ds_par){
                    this.cds.ds_par.setStateOrAnd(icl.R_EDITED)
                }
                this.cds.checkGS(this.cell);
            }
        }else{
            this.model1 = parseFloat(this.model)
        }
    }
    @Watch("model")
    cdataSetRecordChange(){
        if( this.model !== this.model1){
            this.model1 = parseFloat(this.model)
        }
    }
}
</script>
