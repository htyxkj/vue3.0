<template>
    <el-col :span="span" :xs="24" :sm="24" :md="span">
        <template v-if="!bgrid">
            <el-form-item :label="cell.labelString" class="bip-input-item" :required="cell.isReq">
                <el-input :style="cell.desc?'width: calc(100% - 29px);':''" v-model="model1" size="small" :clearable="clearable" :disabled="(cell.attr&0x40)>0" @change="dataChange"></el-input>
                <template v-if="cell.desc">
                    <span style="position:relative;line-height:32px;width:29px;padding: 5px 0px 5px 5px;">
                        <el-tooltip class="item" effect="dark" :content="cell.desc" placement="top">
                            <i class="iconfont icon-bip-bangzhu" style="font-size:14px;"></i>
                        </el-tooltip>
                    </span>
                </template>
                <div v-if="cell.type <=90 && model1.length>cell.ccLeng" class="el-form-item__error">长度应小于等于{{cell.ccLeng}}个字符</div>
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
    @Prop() row!:number
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
                //修改字段是主键
                if((this.cell.attr & 0x1) >0 ){//是主键
                    this.cds.makeOldPK();
                }
                this.cds.currRecord.data[this.cell.id] = this.model1;
                this.cds.cdata.data[this.cds.index] = this.cds.currRecord;
                // const key:string = this.cell.id
                if(this.cds.baseI){
                    this.cds.baseI.cellDataChange(this.cds,this.cell.id,this.model1)
                }
                this.cds.setStateOrAnd(icl.R_EDITED)
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


