<template>
    <el-col :span="span" :xs="24" :sm="24" :md="span">
        <template v-if="!bgrid">
            <el-form-item :label="cell.labelString" class="bip-input-item" :required="cell.isReq">
                <el-input v-model="model1" size="small" :clearable="clearable" :disabled="(cell.attr&0x40)>0" @change="dataChange"></el-input>
            </el-form-item>
        </template>
        <template v-else>
             <el-input v-model="model1" size="small" :clearable="clearable" :disabled="(cell.attr&0x40)>0" @change="dataChange"></el-input>
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
export default class BipInputEditor extends Vue{
    @Prop() cds!:CDataSet
    @Prop() cell!:Cell
    @Prop() model:any
    @Prop() bgrid!:boolean
    @Provide() model1:any = ''
    @Provide() clearable:boolean = true
    @Provide() methodName:string = ''
    @Provide() span:number = 6
    
    mounted(){
        this.model1 = this.model       
        if(this.bgrid){
            this.span = 24
        }else{
            this.span = Math.round(24/this.cds.ccells.widthCell*this.cell.ccHorCell)
        }
        this.methodName = icl.EV_CELL_CHANGE+'_'+this.cds.ccells.obj_id+'_'+this.cell.id
    }

    dataChange(value:string|number){
        if(this.cds&&this.cell){
            if(this.cds.currCanEdit()){
                if(this.model1 !== this.model){
                    this.cds.currRecord.data[this.cell.id] = this.model1;
                    this.cds.setStateOrAnd(icl.R_EDITED)
                    const record = this.cds.currRecord
                    this.cds.currRecord = Object.assign({},record);
                    this.cds.cdata._data[this.cds.index] = Object.assign({},record)
                    const key:string = this.cell.id
                    this.$bus.$emit(this.methodName,{cellId:key,value:this.model1,row:this.cds.index})

                }
            }else{
                this.model1 = this.model
            }
        }   
    }
    @Watch("model")
    cdataSetRecordChange(){
        if(this.cds&&this.cell){
            if( this.model !== this.model1){
                this.model1 = this.model
            }
        }
    }
}
</script>


