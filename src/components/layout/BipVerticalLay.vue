<template>
<el-col span="24" v-if="laycfg">
    <template v-if="cfgUp">
        <template v-if="!cfgUp.bcells">
            <base-layout :layout="cfgUp.comp" :env="env" :config="config"></base-layout >
        </template>
        <template v-else>
            <el-row class="bip-row">
                <lay-cell :laycell="cfgUp.comp" :env="env" @handleCurrentChange="handleCurrentChange" @handleSizeChange="handleSizeChange"  @sortChange="sortChange" :config="config"></lay-cell>
            </el-row>
        </template>
    </template>
    <template v-if="cfgDown">
        <template v-if="!cfgDown.bcells">
            <base-layout :layout="cfgDown.comp" :env="env" :config="config"></base-layout >
        </template>
        <template v-else>
            <el-row class="bip-row">
                <lay-cell :laycell="cfgDown.comp" :env="env" @handleCurrentChange="handleCurrentChange" @handleSizeChange="handleSizeChange" @sortChange="sortChange" :config="config"></lay-cell>
            </el-row>
        </template>
    </template>
</el-col>
    
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
export default class BipVerticalLay extends Vue{
    @Prop() laycfg!:Array<BipLayConf>
    @Prop() env?:CCliEnv
    @Prop() config?:any
    @Provide() cfgUp!:BipLayConf
    @Provide() cfgDown!:BipLayConf
    mounted(){
        this.initLayCell()
    }

    initLayCell(){
        if(this.laycfg){
            this.cfgUp = this.laycfg[0]
            this.cfgDown = this.laycfg[1]
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
