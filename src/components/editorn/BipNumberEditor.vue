<template>
    <el-col :span="span" :xs="24" :sm="24" :md="span">
         <template v-if="!bgrid">
            <el-form-item :label="cell.labelString" class="bip-input-item" :required="cell.isReq">
                <el-input size="medium" v-model="model1" :clearable="clearable" :style="cell.desc?'width: calc(100% - 29px);':'width:100%'"
                :disabled="(cell.attr&0x40)>0" @change="dataChange" :precision="ccPoint" controls-position="right"
                >
                <el-button slot="append" icon="iconfont icon-bip-calculator" :disabled="(cell.attr&0x40)>0" @click="calculatorClick($event)" :id="cell.id" ></el-button>
                </el-input>
                <template v-if="showCalculator">
                    <div style="position: fixed;z-index: 2014;background-color: #ececec;width: 280px;" @click="stopBubble($event)">
                        <Calculator @valueChange="valueChange"></Calculator>
                    </div>
                </template>
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
             <el-input size="medium" v-model="model1" :clearable="clearable" 
                :disabled="(cell.attr&0x40)>0" @change="dataChange" :precision="ccPoint" controls-position="right"></el-input>
         </template>
        <div></div>
    </el-col>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import CDataSet from '@/classes/pub/CDataSet';
import { Cell } from '@/classes/pub/coob/Cell';
import { CommICL } from '@/utils/CommICL';
let icl = CommICL
import Calculator from '@/components/calculator/Calculator.vue'
@Component({
    components:{Calculator}
})
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
    @Provide() showCalculator:boolean = false;
    @Provide() datachangeBusID :number =0;
    mounted(){
        if(this.model){
            this.model1 = parseFloat(this.model+'')
            if(isNaN(this.model1))
                this.model1 ='';
        }else{
            this.model1 = null
        }
       
        this.ccPoint = this.cell.ccPoint
        if(!this.bgrid){
            this.span = Math.round(24/this.cds.ccells.widthCell*this.cell.ccHorCell)
        }else{
            this.span = 24
        }
        this.datachangeBusID= this.$bus.$on('CalculatorClick',this.busCalculatorClick)
    }

    dataChange(value:string|number){
        if(this.cds.currCanEdit()){
            if(this.model1 !== this.model){
                this.cds.currRecord.data[this.cell.id] = this.model1;
                this.cds.cellChange(this.cell.id,this.model1);
                if(this.cds.baseI){
                    // console.log('cellDataChange',this.model1)
                    this.cds.baseI.cellDataChange(this.cds,this.cell.id,this.model1)
                }
                this.cds.setStateOrAnd(icl.R_EDITED)
                if(this.cds.ds_par){
                    this.cds.ds_par.setStateOrAnd(icl.R_EDITED)
                }
                this.cds.checkGS(this.cell);
                this.cds.currRecord.c_state |= 2;
                if(this.cds.ds_par){
                    this.cds.ds_par.currRecord.c_state |= 2;
                }
            }
        }else{
            this.model1 = parseFloat(this.model)
            if(isNaN(this.model1))
                this.model1 ='';
        }
    }
    @Watch("model")
    cdataSetRecordChange(){
        if( this.model !== this.model1){
            this.model1 = parseFloat(this.model)
            if(isNaN(this.model1))
                this.model1 ='';
        }
    }
    valueChange(val:number){
        this.model1 = val;
        this.dataChange(val)
    }
        
    beforeDestroy(){
        this.$bus.$off('CalculatorClick',this.datachangeBusID)
    }
    calculatorClick(event:any){
        this.$bus.$emit('CalculatorClick',this.cell.id)
        this.showCalculator = !this.showCalculator; 
        this.stopBubble(event);
        let _this = this;
        document.onclick=function(){ 
            _this.showCalculator=false;
        　　document.onclick=null;　 
        }
    }
      //阻止冒泡函数
    stopBubble(e:any){  
        if(e && e.stopPropagation){
            e.stopPropagation();  //w3c
        }else{
            if(window.event)
            window.event.cancelBubble=true; //IE
        }
    }

    busCalculatorClick(id:string){
        if(this.cell.id != id)
            this.showCalculator =false;
    }
}
</script>
