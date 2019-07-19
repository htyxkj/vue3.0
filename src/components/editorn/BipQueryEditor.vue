<template>
        <el-col :span="span" :xs="24" :sm="24" :md="span">
        <template v-if="!bgrid">
            <el-form-item :label="cell.labelString" class="bip-input-item" :required="cell.isReq">
                <el-input v-model="model1" size="small" :clearable="clearable" :disabled="disabled">
                    <el-button slot="append" icon="el-icon-share" @click="iconClick"></el-button>
                </el-input>
            </el-form-item>
        </template>
        <template v-else>
             <el-input v-model="model1" size="small" :clearable="clearable" :disabled="disabled">
                 <el-button slot="append" icon="el-icon-share" @click="iconClick"></el-button>
             </el-input>
        </template>
        <bip-query-info ref="queryinfo" :cell="cell" :cds="cds" :bipInsAid="bipInsAid"></bip-query-info>
    </el-col>
</template>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import CDataSet from '../../classes/pub/CDataSet';
import { Cell } from '../../classes/pub/coob/Cell';
import BipInsAidNew from '../../classes/BipInsAidNew';
import CommATTR from '../../classes/CommAttr';
import BipQueryInfo from './grid/BipQueryInfo.vue';
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

    mounted(){
        
        if(!this.bgrid){
            this.span = Math.round(24/this.cds.ccells.widthCell*this.cell.ccHorCell)
        }else{
            this.span = 24
        }
    }

    iconClick(){
        if(this.bipInsAid){
            if (!((this.cell.attr & 0x40) > 0)) {
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

}
</script>
