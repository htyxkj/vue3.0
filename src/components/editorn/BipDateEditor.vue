<template>
    <el-col :span="span" :xs="24" :sm="24" :md="span">
        <template v-if="!bgrid">
            <el-form-item :label="cell.labelString" class="bip-input-item" :required="cell.isReq">
                <el-date-picker size="small" style="width:100%"
                v-model="model1"
                :type="dateType"
                :format="dateFormat"
                :value-format="dateFormat"
                placeholder="选择日期" :clearable="clearable" :disabled="(cell.attr&0x40)>0" @change="dataChange">
                </el-date-picker>
            </el-form-item>
        </template>
        <template v-else>
            <el-date-picker size="small" style="width:100%"
                v-model="model1"
                :type="dateType"
                :format="dateFormat"
                :value-format="dateFormat"
                placeholder="选择日期" :clearable="clearable" :disabled="(cell.attr&0x40)>0" @change="dataChange">
            </el-date-picker>
        </template>
    </el-col>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import CDataSet from '@/classes/pub/CDataSet';
import { Cell } from '@/classes/pub/coob/Cell';
import { BIPUtils } from "@/utils/BaseUtil";
let baseTool = BIPUtils.baseUtil;
import { CommICL } from '@/utils/CommICL';
let icl = CommICL
import BipInsAidNew from '../../classes/BipInsAidNew';
@Component({})
export default class BipDateEditor extends Vue{
    @Prop() cds!:CDataSet
    @Prop() cell!:Cell
    @Prop() model:any
    @Prop() bgrid!:boolean
    @Prop() bipInsAid!:BipInsAidNew
    @Prop() row!:number
    @Provide() model1:any = ''
    @Provide() clearable:boolean = true
    @Provide() dateType="date"
    @Provide() dateFormat="yyyy-MM-dd"
    @Provide() methodName:string = ''

    @Provide() span:number = 6
    mounted(){
        this.model1 = this.model
        if(!this.bgrid){
            this.span = Math.round(24/this.cds.ccells.widthCell*this.cell.ccHorCell)
        }else{
            this.span = 24
        }
        // if(this.cds&&this.cell){
            if(this.cell.type===93){
                this.dateType = 'datetime'
                this.dateFormat = 'yyyy-MM-dd HH:mm:ss'
            }else if(this.cell.editName == 'YM'){
                this.dateType = 'month';
                this.dateFormat = 'yyyyMM'
            }
            this.methodName = icl.EV_CELL_CHANGE+'_'+this.cds.ccells.obj_id+'_'+this.cell.id
        // }
    }

    dataChange(value:string|number){
        if(this.cds&&this.cell){
            console.log(value)
            if(this.cds.currCanEdit()){
                // console.log(value)
                this.cds.setStateOrAnd(icl.R_EDITED)
                if(value==null){
                    this.model1 = ''
                    this.cds.currRecord[this.cell.id] = this.model1
                    this.cds.currRecord = Object.assign({},this.cds.currRecord)
                    this.cds.cdata._data[this.cds.index] = this.cds.currRecord
                }else{
                    if(value != this.model){
                        // this.model1 = value
                        //TODO 公式关联
                        this.cds.currRecord[this.cell.id] = value
                        this.cds.currRecord = Object.assign({},this.cds.currRecord)
                        this.cds.cdata._data[this.cds.index] = Object.assign({},this.cds.currRecord)
                        const key:string = this.cell.id
                        this.$bus.$emit(this.methodName,{cellId:key,value:value,row:this.cds.index})
                        this.cds.checkGS()
                        this.model1 = value
                        this.cds.setStateOrAnd(icl.R_EDITED)
                    }
                }
            }else{
                this.model1 = this.model
            }
        }   
    }
    @Watch("model")
    cdataSetRecordChange(){
        if(this.cds&&this.cell){
            console.log('date model change',this.model)
            if( this.model1 != this.model){
                this.model1 = this.model
            }
        }
    }
}
</script>
