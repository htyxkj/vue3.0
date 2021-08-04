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
                <el-input :placeholder="cell.placeholder" :style="cell.desc?'width: calc(100% - 29px);':'width:100%'" v-model="model1" size="medium" :clearable="clearable" :disabled="disabled" :readonly="readonly" @focus="focus">
                    <template v-if="this.model1">
                        <i slot="suffix" class="el-input__icon el-icon-circle-close" @click="clearvalue"></i>
                    </template>
                    <el-button slot="append" icon="el-icon-share" @click="iconClick"></el-button>
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
             <el-input :placeholder="cell.placeholder" v-model="model1" size="medium" :clearable="clearable" :disabled="disabled" :readonly="readonly" @focus="focus">
                    <template v-if="this.model1&&canEdit">
                        <i slot="suffix" class="el-input__icon el-icon-circle-close" @click="clearvalue"></i>
                    </template>
                 <el-button slot="append" icon="el-icon-share" @click="iconClick"></el-button>
             </el-input>
        </template>
        <template v-if="showQueryInfo">
            <bip-query-info ref="queryinfo" :cell="cell" :cds="cds" :bipInsAid="bipInsAid" @select="select" :env0="env"></bip-query-info>
        </template>
    </el-col>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import CDataSet from '../../classes/pub/CDataSet';
import { Cell } from '../../classes/pub/coob/Cell';
import BipInsAidNew from '../../classes/BipInsAidNew';
import CommATTR from '../../classes/CommAttr';
import BipQueryInfo from './grid/BipQueryInfo.vue';
import { BIPUtils } from "@/utils/BaseUtil";
import CCliEnv from '@/classes/cenv/CCliEnv'
let baseTool = BIPUtils.baseUtil;
let _ = require('lodash')
@Component({
    components:{BipQueryInfo}
})
export default class BipQueryEditor extends Vue{
    @Prop() cds!:CDataSet
    @Prop() cell!:Cell
    @Prop() row!:number
    @Prop() model!:string
    @Prop() bgrid!:boolean
    @Prop() bipInsAid!:BipInsAidNew
    @Prop() env!:CCliEnv

    @Provide() span:number = 6

    @Provide() model1:string = ''

    // @Provide() disabled:boolean = false
    @Provide() clearable:boolean = true

    @Provide() attr:CommATTR = new CommATTR()
    @Provide() showQueryInfo:boolean =false;
    mounted(){
        if(!this.bgrid){
            this.span = Math.round(24/this.cds.ccells.widthCell*this.cell.ccHorCell)
        }else{
            this.span = 24
        }
        this.model1 = this.model
        if(baseTool.bitOperation(this.cell.attr,0x20000000000)>0 && !this.model1){
            this.iconClick();
        }
    }

    clearvalue(){
        this.model1 = '';
        if(this.bipInsAid){
            let str = this.bipInsAid.sref;
            let strv = str.split(";");
            let mstrv = strv[0].split(",");
            console.log(mstrv)
            for(let i=1;i<mstrv.length;i++){
                let f1 = mstrv[i];
                let k1 = f1.split("=")[1];
                console.log(k1)
                let _r = _.findIndex(this.cds.ccells.cels,(cel:any)=>{
                    return cel.id == k1;
                })
                console.log(_r);
                if(_r>-1){
                     this.$set(this.cds.currRecord.data,k1,null);

                }
            }
        }
    }

    iconClick(){
        this.focus();
        if(this.bipInsAid){
            if (!((this.cell.attr & 0x40) > 0)) {
                this.showQueryInfo = true;
                // this.dia = true;
                setTimeout(() => {
                    let dia: any = this.$refs.queryinfo;
                    if (dia) dia.open(true);
                }, 100);
            }
        }else{
            this.$notify.warning('没有QueryEditor：'+this.cell.editName)
        }
    }

    select(bcl:boolean){
        let dia: any = this.$refs.queryinfo;
        if (dia){
            dia.open(false);
            this.showQueryInfo = false;
        }
    }

    /**
     *能否编辑
     */
    get disabled(){
        let dis = (this.cell.attr&this.attr.READ)>0
        if(dis){
            return dis;
        }
        return !this.cds.currCanEdit(this.row>-1?this.row:0)
    }
    /**
     * 是否只读 非输入滤0
     */
    get readonly(){
        let dis = (this.cell.attr&this.attr.NOENIT)>0
        if(dis){
            return dis;
        }
        return false;
    }
    get canEdit(){
        return this.cds.currCanEdit(this.row>-1?this.row:0);
    }
    focus(){
        this.$emit("focus",{})
    }
    @Watch('model')
    valuesChange(){
        this.model1 = this.model
    }

}
</script>
