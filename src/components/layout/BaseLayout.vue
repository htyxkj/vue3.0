<template>
<div class="bip-con-main">
    <template v-if="layout&&layout.layType === 'B'">
        <border-layout :laycfg="comps" :env="env" @handleCurrentChange="handleCurrentChange" @handleSizeChange="handleSizeChange" @sortChange="sortChange" :config="config" @invokecmd="invokecmd"></border-layout>
    </template>
    <template v-else-if="layout&&layout.layType === 'T'">
        <tabs-layout :laycfg="comps" :env="env" @handleCurrentChange="handleCurrentChange" @handleSizeChange="handleSizeChange" @sortChange="sortChange" :config="config" @invokecmd="invokecmd"></tabs-layout>
    </template>
    <template v-else-if="layout&&layout.layType === 'T1'">
        <bip-tabs1-layout :laycfg="comps" ></bip-tabs1-layout>
    </template>
    <template v-else-if="layout&&layout.layType === 'H'">
        <bip-horizontal-lay :laycfg="comps" :env="env" @handleCurrentChange="handleCurrentChange" @handleSizeChange="handleSizeChange" @sortChange="sortChange" :config="config" @invokecmd="invokecmd"></bip-horizontal-lay>
    </template>
    <template v-else-if="layout&&layout.layType === 'V'">
        <bip-vertical-lay :laycfg="comps" :env="env" @handleCurrentChange="handleCurrentChange" @handleSizeChange="handleSizeChange" @sortChange="sortChange" :config="config" @invokecmd="invokecmd"></bip-vertical-lay>
    </template>
    <template v-else-if="layout&&layout.layType === 'U'">
        <bip-customize-layout  :laycfg="comps" :env="env" @handleCurrentChange="handleCurrentChange" @handleSizeChange="handleSizeChange" @sortChange="sortChange" :config="config" @invokecmd="invokecmd"></bip-customize-layout>
    </template>
</div>
</template>

<script lang="ts">
//B:(@60HT111#40726[-remark];T:60HTA111#725;@60HT111#70725[jyfs-])
/**
 * 布局拆分入口
 */
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import { BipLayout } from '@/classes/ui/BipLayout';
import BorderLayout from '@/components/layout/BorderLayout.vue'
import TabsLayout from '@/components/layout/TabsLayout.vue'
import BipHorizontalLay from '@/components/layout/BipHorizontalLay.vue'
import BipVerticalLay from '@/components/layout/BipVerticalLay.vue'
import BipCustomizeLayout from '@/components/layout/BipCustomizeLayout.vue'
import BipTabs1Layout from '@/components/layout/customize/BipTabs1Layout.vue'
import BipLayConf from '@/classes/ui/BipLayConf';
import CCliEnv from '@/classes/cenv/CCliEnv'
@Component({
    components:{BorderLayout,TabsLayout,BipHorizontalLay,BipVerticalLay,BipCustomizeLayout,BipTabs1Layout}
})
export default class BaseLayout extends Vue{
    @Prop() layout?:BipLayout
    @Prop() env?:CCliEnv
    @Prop() config!:any //{type:2,collapseType:0}  type 是单据页面还是报表页面(2) 用来区分表格高度  collapseType  子表折叠样式，0：显示全部数据，1：显示当前行数据
    comps:Array<BipLayConf> = []
    mounted(){
        if(this.layout)
            this.comps = this.layout.compconfs
    }

    handleSizeChange(value:number){
        this.$emit('handleSizeChange',value)
        if(this.env){
            let v = {value:value,obj_id:this.env.dsm.ccells.obj_id};
            this.$bus.$emit('handleSizeChange',v)
        }
    }

    handleCurrentChange(value:number){
        this.$emit('handleCurrentChange',value)
        if(this.env){
            let v = {value:value,obj_id:this.env.dsm.ccells.obj_id};
            this.$bus.$emit('handleCurrentChange',v)
        }
    }
    sortChange(orderby:string){
        this.$emit("sortChange", orderby);
    }
    invokecmd(btn:any){
        this.$emit('invokecmd',btn)
    }
}
</script>
<style scoped lang="scss">
.bip-con-main{
    background-color: white;
}
</style>