<template>
<el-row v-if="laycfg" :gutter="10">
    <el-col :span="lspan" v-if="laycfg.length>1" >
        <template v-if="!cfgL.bcells">
            <base-layout :layout="cfgL.comp" :env="env" :config="config"></base-layout>
        </template>
        <template v-else>
            <el-row class="bip-row">
                <lay-cell :laycell="cfgL.comp" :env="env" @handleCurrentChange="handleCurrentChange" @handleSizeChange="handleSizeChange" @sortChange="sortChange" :config="config"></lay-cell>
            </el-row>
        </template>
    </el-col>
    <el-col :span="rspan" v-if="laycfg.length>1">
        <template v-if="!cfgR.bcells">
            <base-layout :layout="cfgR.comp" :env="env" :config="config"></base-layout>
        </template>
        <template v-else>
            <el-row class="bip-row">
                <lay-cell :laycell="cfgR.comp" :env="env" @handleCurrentChange="handleCurrentChange" @handleSizeChange="handleSizeChange" @sortChange="sortChange" :config="config"></lay-cell>
            </el-row>
        </template>
    </el-col>
</el-row>
    
</template>
<script lang="ts">
//垂直布局 上下
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
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
    @Provide() cfgL!:BipLayConf
    @Provide() cfgR!:BipLayConf
    @Provide() lspan:number = 12
    @Provide() rspan:number = 12
    created(){
        this.initLayCell()
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
    @Watch('laycfg')
    layCfgChange(){
        this.initLayCell()
    }
}
</script>
