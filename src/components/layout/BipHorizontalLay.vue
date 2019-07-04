<template>
<el-row v-if="laycfg">
    <el-col :span="12" v-if="laycfg.length>1" >
        <template v-if="!cfgL.bcells">
            <bip-comm-lay :layout="cfgL.comp" :env="env"></bip-comm-lay>
        </template>
        <template v-else>
            <el-row class="bip-row">
                <lay-cell :laycell="cfgL.comp" :env="env" @handleCurrentChange="handleCurrentChange" @handleSizeChange="handleSizeChange"></lay-cell>
            </el-row>
        </template>
    </el-col>
    <el-col :span="12" v-if="laycfg.length>1">
        <template v-if="!cfgR.bcells">
            <bip-comm-lay :layout="cfgR.comp" :env="env"></bip-comm-lay>
        </template>
        <template v-else>
            <el-row class="bip-row">
                <lay-cell :laycell="cfgR.comp" :env="env" @handleCurrentChange="handleCurrentChange" @handleSizeChange="handleSizeChange"></lay-cell>
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
import BipCommLay from './BipCommLay.vue'
import CCliEnv from '@/classes/cenv/CCliEnv'
@Component({
     components:{LayCell,BipCommLay}
})
export default class BipHorizontalLay extends Vue{
    @Prop() laycfg!:Array<BipLayConf>
    @Prop() env?:CCliEnv
    @Provide() cfgL!:BipLayConf
    @Provide() cfgR!:BipLayConf
    created(){
        console.log(this.laycfg)
        this.initLayCell()
    }

    updated(){
        this.initLayCell()
    }

    initLayCell(){
            this.cfgL = this.laycfg[0]
            this.cfgR = this.laycfg[1]
    }

    handleSizeChange(value:number){
        console.log('handleSizeChange',value)
        this.$emit('handleSizeChange',value)
    }

    handleCurrentChange(value:number){
        console.log('handleCurrentChange',value)
        this.$emit('handleCurrentChange',value)
    }

    @Watch('laycfg')
    layCfgChange(){
        this.initLayCell()
    }
}
</script>
