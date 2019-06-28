<template>
    <el-col :span="span" :xs="24" :sm="24" :md="span">
        <el-form-item :label="cell.labelString" class="bip-input-item" :required="cell.isReq">
            <el-input
                v-model="model1"
                size="small"
                :clearable="clearable"
                :disabled="(cell.attr&0x40)>0"
            >
                <i
                    slot="suffix"
                    class="el-input__icon el-icon-c-scale-to-original"
                    @click="iconClick()"
                    :disabled="disabled>0"
                ></i>
            </el-input>
        </el-form-item>
        <bip-copy-info v-if="dia"
            ref="ak"
            :opera='opera'
            :ref_cds="cds"
            @select="selectCallBack"
        ></bip-copy-info>
    </el-col>
</template>
<script lang="ts">
import {
    Component,
    Vue,
    Provide,
    Prop,
    Watch
} from "vue-property-decorator";
import CDataSet from "@/classes/pub/CDataSet";
import { Cell } from "@/classes/pub/coob/Cell";
import BipCopyInfo from './BipCopyInfo.vue'
import Operation from '../../classes/operation/Operation';
@Component({
    components: { BipCopyInfo }
})
export default class BipCopyEditor extends Vue{
    @Prop() cds!: CDataSet;
    @Prop() cell!: Cell;
    @Prop() model?: any;
    @Provide() model1: any = "";
    @Provide() clearable: boolean = false;
    @Provide() disabled: boolean = true;
    @Provide() dia: boolean = false;
    @Provide() opera:Operation = new Operation()
    // @Provide() multiple: boolean = false;
    @Provide() span:number = 6

    mounted(){
        this.disabled = (this.cell.attr&0x40)>0
        this.span = 24/this.cds.ccells.widthCell*this.cell.ccHorCell
    }

    iconClick(){
        if(this.disabled)
            return
        if(this.cds.opera!=null)
            this.opera = this.cds.opera
        this.dia = true;

         setTimeout(() => {
                let dia: any = this.$refs.ak;
                console.log(this.dia)
                if (dia) dia.open();
            }, 400);
         
    }

    selectCallBack(){

    }

    @Watch('model')
    modelChange(){
        this.model1 = this.model
    }
}
</script>
