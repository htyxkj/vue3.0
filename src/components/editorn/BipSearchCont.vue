<template>
    <el-card style="height:100% ; margin-bottom:10px;">
    <el-row class="bip-lay" >
        <el-form label-position="right" label-width="120px">
            <bip-comm-editor  v-for="(cel,index) in cells" :key="index" :cell="cel" :cds="cds" :row="0" :bgrid="false"/>
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
    mounted(){
            this.cds = this.env.ds_cont
            this.cells = this.cds.ccells.cels.filter(item=>{
                return item.attr>0?(item.attr&0x400)==0:true
            })
            if(this.cells.length<2){
                this.cds.ccells.widthCell = 2
            }
    }
}
</script>

