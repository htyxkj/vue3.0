<template>
        <el-col :span="span" :xs="24" :sm="24" :md="span">
        <template v-if="!bgrid">
            <el-form-item :label="cell.labelString" class="bip-input-item" :required="cell.isReq">
                <el-input :style="cell.desc?'width: calc(100% - 29px);':'width:100%'" v-model="model1" size="medium" :clearable="clearable" :disabled="disabled">
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
             <el-input v-model="model1" size="medium" :clearable="clearable" :disabled="disabled">
                 <el-button slot="append" icon="el-icon-share" @click="iconClick"></el-button>
             </el-input>
        </template>
        <template v-if="showQueryInfo">
            <bip-query-info ref="queryinfo" :cell="cell" :cds="cds" :bipInsAid="bipInsAid" @select="select"></bip-query-info>
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
let baseTool = BIPUtils.baseUtil;
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

    iconClick(){
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

    @Watch('model')
    valuesChange(){
        this.model1 = this.model
    }

}
</script>
