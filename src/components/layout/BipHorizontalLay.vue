<template>
    <el-row v-if="laycfg" class="h_layout_scrollbar">
        <el-col :span="lspan" v-if="laycfg.length>1" >
            <el-scrollbar :style="style">
                <template v-if="!cfgL.bcells">
                    <base-layout :layout="cfgL.comp" :env="env" @handleCurrentChange="handleCurrentChange" @handleSizeChange="handleSizeChange" @sortChange="sortChange" :config="config"  @invokecmd="invokecmd"></base-layout>
                </template>
                <template v-else>
                    <el-row class="bip-row">
                        <lay-cell :laycell="cfgL.comp" :env="env" @handleCurrentChange="handleCurrentChange" @handleSizeChange="handleSizeChange" @sortChange="sortChange" :config="config"  @invokecmd="invokecmd"></lay-cell>
                    </el-row>
                </template>
            </el-scrollbar>
        </el-col>
        <el-col :span="rspan" v-if="laycfg.length>1">
            <el-scrollbar :style="style" >
                <template v-if="!cfgR.bcells">
                    <base-layout :layout="cfgR.comp" :env="env" @handleCurrentChange="handleCurrentChange" @handleSizeChange="handleSizeChange" @sortChange="sortChange" :config="config" @invokecmd="invokecmd"></base-layout>
                </template>
                <template v-else>
                    <el-row class="bip-row">
                        <lay-cell :laycell="cfgR.comp" :env="env" @handleCurrentChange="handleCurrentChange" @handleSizeChange="handleSizeChange" @sortChange="sortChange" :config="config" @invokecmd="invokecmd"></lay-cell>
                    </el-row>
                </template>
            </el-scrollbar>
        </el-col>
    </el-row>
</template>
<script lang="ts">
/**
 * 布局 左右结构
 */
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import {  State } from 'vuex-class';
import BipLayConf from '@/classes/ui/BipLayConf';
import LayCell from './LayCell.vue'
import CCliEnv from '@/classes/cenv/CCliEnv'
@Component({
     components:{LayCell}
})
export default class BipHorizontalLay extends Vue{
    @Prop() laycfg!:Array<BipLayConf>
    @Prop() env?:CCliEnv
    @Prop() config?:any
    @State('bipComHeight', { namespace: 'login' }) bipHeight!: number;
    cfgL!:BipLayConf
    cfgR!:BipLayConf
    lspan:number = 12
    rspan:number = 12
    style:any = "height:568px"
    created(){
        this.initLayCell()
        this.initHeight();
    }

    updated(){
        this.initLayCell()
    }

    initLayCell(){
        this.cfgL = this.laycfg[0]
        this.cfgR = this.laycfg[1]
        if(this.cfgL){
            this.lspan = Math.round(24*this.cfgL.span)
            this.rspan = 24-this.lspan
        }
    }

    handleSizeChange(value:number){
        this.$emit('handleSizeChange',value)
    }

    handleCurrentChange(value:number){
        this.$emit('handleCurrentChange',value)
    }
    sortChange(orderby:string){
        this.$emit("sortChange", orderby);
    }
    invokecmd(btn:any){
        this.$emit("invokecmd",btn)
    }
    @Watch('laycfg')
    layCfgChange(){
        this.initLayCell()
    }
    @Watch("bipHeight")
    initHeight(){
        if(this.bipHeight){
            this.style = "height:"+(this.bipHeight-50)+"px"
        }
    }
}
</script>
<style lang="scss">
.h_layout_scrollbar{
    .el-scrollbar__wrap{
        overflow-x: hidden;
    }
    .el-scrollbar__bar.is-horizontal {
        display: none;
    }
    .el-scrollbar{
        margin-bottom: 0px !important;
        padding-bottom: 0px !important;
    }
}
</style>