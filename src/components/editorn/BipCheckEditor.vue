<template>
    <el-col :span="span" :xs="24" :sm="24" :md="span">
        <template v-if="!bgrid">
            <el-form-item :label="cell.labelString" :required="cell.isReq">
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
                <div class="checkbox_div">
                    <el-checkbox-group v-model="model1" :style="cell.desc?'width: calc(100% - 29px);':'width:100%'" :disabled="(cell.attr&0x40)>0" clearable  @change="dataChange">
                        <el-checkbox  v-for="item in options" 
                        :key="item[cels[0].id]" 
                        :label="item[cels[0].id]" 
                        :value="item[cels[0].id]">{{item[cels[1].id]}}</el-checkbox>
                    </el-checkbox-group>
                    <template v-if="cell.desc">
                        <span style="position:relative;line-height:32px;width:29px;padding: 5px 0px 5px 5px;">
                            <el-tooltip class="item" effect="dark" :content="cell.desc" placement="top">
                                <i class="iconfont icon-bip-bangzhu" style="font-size:14px;"></i>
                            </el-tooltip>
                        </span>
                    </template>
                </div>
            </el-form-item>
        </template>
        <template v-else>
            <div class="checkbox_div">
                <el-checkbox-group v-model="model1" :disabled="(cell.attr&0x40)>0" clearable  @change="dataChange">
                    <el-checkbox  v-for="item in options" 
                        :key="item[cels[0].id]"  :label="item[cels[0].id]" 
                        :value="item[cels[0].id]" >
                        {{item[cels[1].id]}}
                    </el-checkbox>
                </el-checkbox-group>
            </div>
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
export default class BipCheckEditor extends Vue{
    @Prop() cds!:CDataSet
    @Prop() cell!:Cell
    @Prop() model:any
    @Prop() bgrid!:boolean
    @Prop() row!:number
    @Prop() bipInsAid!:BipInsAidNew
    @Provide() model1:any = [];
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
        this.model1 = []
        if(this.model)
            this.model1 = this.model.split(';') || this.model.split(',')
        this.methodName = icl.EV_CELL_CHANGE+'_'+this.cds.ccells.obj_id+'_'+this.cell.id
        this.initOPtions()
    }

    initOPtions(){
        this.options = [];
        if(this.bipInsAid){
            this.cels = this.bipInsAid.cells.cels
            // if(!this.cell.isReq){
            //     let nullVal:any = {}
            //     this.cels.forEach(item=>{
            //         nullVal[item.id] = ''
            //     })
            //     this.options.push(nullVal)
            // }
            this.bipInsAid.values.forEach((item:any) => {
                let items:any = {}
                items[this.bipInsAid.cells.cels[0].id] =  item[this.bipInsAid.cells.cels[0].id]+''
                items[this.bipInsAid.cells.cels[1].id] =  item[this.bipInsAid.cells.cels[1].id]+''
                this.options.push(items)
            });
        }
    }


    dataChange(value:any){
        this.$emit("focus",{})
        let str = ""
        this.model1 = []
        value.forEach((item:string)=>{
            if(item!==''){
                str+=item+';'
                this.model1.push(item)
            }       
        })
        str = str.substring(0,str.length-1)
        
        if( str !== this.model){
            if(this.cds.currCanEdit()){
                this.cds.setStateOrAnd(icl.R_EDITED)
                let record = this.cds.currRecord
                record.data[this.cell.id] = str
                this.cds.currRecord = Object.assign({},record);
                this.cds.cdata.data[this.cds.index] = Object.assign({},record)
                const key:string = this.cell.id
                if(this.cds.baseI){
                    this.cds.baseI.cellDataChange(this.cds,this.cell.id,str)
                }
                this.cds.cellChange(key,str);
                this.cds.checkGS(this.cell);
                this.cds.currRecord.c_state |= 2;
                if(this.cds.ds_par){
                    this.cds.ds_par.currRecord.c_state |= 2;
                }
            }else{
                this.model1 = this.model.split(";");
            }   
        } 
    }

    @Watch('bipInsAid')
    bipInsAidChange(){
        this.initOPtions()
    }

    @Watch('model')
    valueChange(){
        let str = this.model||''
        if(str.length>0){
            this.model1 = str.split(';')||str.split(',')
        }else{
            this.model1=[];
        }
    }
}
</script>
<style scoped>
.checkbox_div{
    height: 36px;
    line-height: 36px
}
</style>