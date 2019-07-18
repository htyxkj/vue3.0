<template>
    <el-col :span="span" :xs="24" :sm="24" :md="span">
        <template v-if="!bgrid">
            <el-form-item :label="cell.labelString" :required="cell.isReq">
                <el-select v-model="model1" :multiple="multiple" collapse-tags placeholder="请选择" size="small" style="width:100%" :disabled="(cell.attr&0x40)>0" clearable  @change="dataChange">
                    <el-option
                        v-for="item in options"
                        :key="item[cels[0].id]"
                        :label="item[cels[1].id]"
                        :value="item[cels[0].id]">
                    </el-option>
                </el-select>
            </el-form-item>
        </template>
        <template v-else>
            <el-select v-model="model1" :multiple="multiple" collapse-tags placeholder="请选择" size="small" style="width:100%" :disabled="(cell.attr&0x40)>0" clearable  @change="dataChange">
                <el-option
                    v-for="item in options"
                    :key="item[cels[0].id]"
                    :label="item[cels[1].id]"
                    :value="item[cels[0].id]">
                </el-option>
            </el-select>
        </template>

    </el-col>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import CDataSet from '@/classes/pub/CDataSet';
import { Cell } from '@/classes/pub/coob/Cell';
import { CommICL } from '@/utils/CommICL';
let icl = CommICL

import { State, Action, Getter, Mutation } from "vuex-class";
import BipInsAidNew from '../../classes/BipInsAidNew';
@Component({})
export default class BipListEditor extends Vue{
    @Prop() cds!:CDataSet
    @Prop() cell!:Cell
    @Prop() model:any
    @Prop() bgrid!:boolean
    @Prop() row!:number
    @Prop() bipInsAid!:BipInsAidNew
    @Provide() model1:any = ""
    @Provide() clearable:boolean = true
    @Provide() multiple:boolean = false
    @Provide() options:any = []
    @Provide() refId:string = ''
    @Provide() initOK:boolean = false
    @Provide() span:number = 6

    @Provide() methodName:string = ''
    @Provide() cels!:Array<Cell>

    mounted(){
        this.multiple = (this.cds.ccells.attr&0x80)>0
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

        console.log(this.bipInsAid,'fdsfds')
        this.initOPtions()

    }

    initOPtions(){
        if(this.bipInsAid){
            this.cels = this.bipInsAid.cells.cels
            if(!this.cell.isReq){
            let nullVal:any = {}
            this.cels.forEach(item=>{
                nullVal[item.id] = ''
            })
            this.options.push(nullVal)
        }
            this.bipInsAid.values.forEach((item:any) => {
                let items:any = {}
                items[this.bipInsAid.cells.cels[0].id] =  item[this.bipInsAid.cells.cels[0].id]+''
                items[this.bipInsAid.cells.cels[1].id] =  item[this.bipInsAid.cells.cels[1].id]+''
                this.options.push(items)
            });
        }
    }


    dataChange(value:any){
        let str = ""
        console.log(value)
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
                record[this.cell.id] = str
                this.cds.currRecord = Object.assign({},record);
                this.cds.cdata._data[this.cds.index] = Object.assign({},record)
                const key:string = this.cell.id
                this.$bus.$emit(this.methodName,{cellId:key,value:this.model1,row:this.cds.index})
                this.cds.cellChange(key,str);
            }else{
                this.model1 = this.model
            }   
        } 
    }

    @Watch('bipInsAid')
    bipInsAidChange(){
        this.initOPtions()
    }

    @Watch('model')
    valueChange(){
        // console.log(this.model)
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


