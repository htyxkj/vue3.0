<template>
    <el-card style="height:100% ; margin-bottom:5px;" :body-style="{ padding: '10px 10px 0 0' }" >
        <el-row class="bip-lay" >
            <el-form @submit.native.prevent label-position="right" label-width="120px">
                <template v-for="(cel,index) in cells" >
                    <bip-comm-editor v-show="(cel.attr&0x400) == 0" :key="index" :cell="cel" :cds="cds" :cdsCount="cdsCount" :row="0" :bgrid="false" :env="env"/>
                </template>
            </el-form>
        </el-row>
    </el-card>
</template>

<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import {Cell} from '@/classes/pub/coob/Cell';
import CCliEnv from '@/classes/cenv/CCliEnv'
import CDataSet from '@/classes/pub/CDataSet';
@Component({
})
export default class BipSearchCont extends Vue{
    @Provide() cells:Array<Cell> = new Array<Cell>()
    @Provide() cds:CDataSet = new CDataSet(null)
    @Prop() env!:CCliEnv
    @Prop() cdsCount!:CDataSet 
    mounted(){
            this.cds = this.env.ds_cont
            if(this.cds.currRecord.c_state ==0)
                this.cds.createRecord();
            this.cells = this.cds.ccells.cels;
            if(this.cells.length<2){
                this.cds.ccells.widthCell = 2
            }
    }
}
</script>

