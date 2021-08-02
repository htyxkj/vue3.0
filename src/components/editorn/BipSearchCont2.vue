<template>
    <el-card style="height:100% ; margin-bottom:5px;" :body-style="{ padding: '10px 10px 5px 20px' }" >
         <el-row class="bip-lay"  :gutter="10">
            <el-form @submit.native.prevent label-position="right" label-width="120px">
                <template v-for="(cel,index) in cells" >
                    <bip-comm-editor v-show="(cel.attr&0x400) == 0" :key="index" :cell="cel" :cds="cds" :cdsCount="cdsCount" :row="0" :bgrid="false" :env="env"/>
                </template>
                <div style="margin-left: 5px;">
                    <el-button size="small" class="bip-menu-bar bip_btn_primary" :class="'bip_btn_default'"  @click.native="invokecmd(btnFind)">
                        <i data-v-4ec4dbea="" class="iconfont icon-bip-search">查找</i></el-button>
                    <el-button size="small" class="bip-menu-bar" :class="'bip_btn_default'"  @click.native="invokecmd(btnClear)">
                        <i data-v-4ec4dbea="" class="iconfont icon-bip-zk">重置</i></el-button> 
                </div>
            </el-form>
        </el-row>
    </el-card>
</template>

<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import {Cell} from '@/classes/pub/coob/Cell';
import CCliEnv from '@/classes/cenv/CCliEnv'
import CDataSet from '@/classes/pub/CDataSet';
import { BipMenuBtn } from '@/classes/BipMenuBtn';
import { CommICL } from "@/utils/CommICL";
@Component({
})
export default class BipSearchCont2 extends Vue{
    @Provide() cells:Array<Cell> = new Array<Cell>()
    @Provide() cds:CDataSet = new CDataSet(null)
    @Prop() env!:CCliEnv
    @Prop() cdsCount!:CDataSet 
    btnFind:BipMenuBtn = new BipMenuBtn("","");
    btnClear:BipMenuBtn = new BipMenuBtn("","");
    mounted(){
        this.btnFind = new BipMenuBtn(CommICL.B_CMD_FIND,"查找")
        this.btnFind.setIconFontIcon('search');
        this.btnClear = new BipMenuBtn(CommICL.B_CMD_CLEAR,"重置")
        this.btnClear.setIconFontIcon('zk');
        this.envChamge();
    }
    @Watch("env.ds_cont")
    envChamge(){
        this.cds = this.env.ds_cont
        if(this.cds.currRecord.c_state ==0)
            this.cds.createRecord();
        if(this.cds.ccells){
            this.cells = this.cds.ccells.cels;
            if(this.cells.length<2){
                this.cds.ccells.widthCell = 2
            }
        }
    }

    invokecmd(btn:any){
        this.$emit('invokecmd',btn);
    }
}
</script>

