<template>
    <el-tabs class="bip-tabs-layout" v-model="activeName" @tab-click="handleClick">
        <el-tab-pane v-for="(cfg,index) in laycfg" :key="index" :label="'　'+cfg.name+'　'" :name="index+''">
            <!-- {{cfg.name}} -->
            <template v-if="!cfg.bcells">
                <!-- {{111}} -->
                <base-layout :layout="cfg.comp" :env="env" :config="config" @invokecmd="invokecmd"></base-layout >
            </template>
            <template v-else>
                <!-- {{222}} -->
                <el-row>
                    <lay-cell :laycell="cfg.comp" :env="env" :isTabs="true" @handleCurrentChange="handleCurrentChange" @handleSizeChange="handleSizeChange" :config="config" @invokecmd="invokecmd"></lay-cell>
                </el-row>
            </template>
        </el-tab-pane>
    </el-tabs>
</template>
<script lang="ts">
//多页面布局 选项卡布局
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import BipLayConf from '@/classes/ui/BipLayConf';
import LayCell from './LayCell.vue'
import CCliEnv from '@/classes/cenv/CCliEnv'
@Component({
    components:{LayCell}
})
export default class TabsLayout extends Vue{
    @Prop() laycfg!:Array<BipLayConf>
    @Prop() env?:CCliEnv
    @Prop() config?:any
    @Provide() activeName:string = ""

    handleClick(tab:any, event:EventListener){
        let index = parseInt(tab.index);
        let r:any = this.laycfg[index];
        if(this.env){
            let cds = this.env.getDataSet(r.comp.obj_id);
            this.env.dsmcurr = cds;
            this.$bus.$emit("tableDatachange",cds.ccells.obj_id)
        }
    }

    mounted(){
        this.activeName = '0'
        
    }

    handleSizeChange(value:number){
        this.$emit('handleSizeChange',value)
    }

    handleCurrentChange(value:number){
        this.$emit('handleCurrentChange',value)
    }
    invokecmd(btn:any){
        this.$emit("invokecmd",btn)
    }
}
</script>
