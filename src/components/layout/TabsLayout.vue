<template>
    <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane v-for="(cfg,index) in laycfg" :key="index" :label="cfg.name" :name="index+''">
            <!-- {{cfg.name}} -->
            <template v-if="!cfg.bcells">
                <!-- {{111}} -->
                <bip-comm-lay :layout="cfg.comp" :env="env"></bip-comm-lay >
            </template>
            <template v-else>
                <!-- {{222}} -->
                <el-row>
                    <lay-cell :laycell="cfg.comp" :env="env" @handleCurrentChange="handleCurrentChange" @handleSizeChange="handleSizeChange"></lay-cell>
                </el-row>
            </template>
        </el-tab-pane>
    </el-tabs>
</template>
<script lang="ts">
//多页面布局
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import BipLayConf from '@/classes/ui/BipLayConf';
import LayCell from './LayCell.vue'
import BipCommLay from './BipCommLay.vue'
import CCliEnv from '@/classes/cenv/CCliEnv'
@Component({
    components:{LayCell,BipCommLay}
})
export default class TabsLayout extends Vue{
    @Prop() laycfg!:Array<BipLayConf>
    @Prop() env?:CCliEnv
    @Provide() activeName:string = ""

    handleClick(tab:any, event:EventListener){
        console.log(tab,event)
    }

    mounted(){
        this.activeName = '0'
    }

    handleSizeChange(value:number){
        console.log('handleSizeChange',value)
        this.$emit('handleSizeChange',value)
    }

    handleCurrentChange(value:number){
        console.log('handleCurrentChange',value)
        this.$emit('handleCurrentChange',value)
    }
}
</script>
