<template>
<div>
    <template v-if="layout&&layout.layType === 'B'">
        <border-layout :laycfg="comps" :env="env" @handleCurrentChange="handleCurrentChange" @handleSizeChange="handleSizeChange" @sortChange="sortChange" :config="config"></border-layout>
    </template>
    <template v-else-if="layout&&layout.layType === 'T'">
        <tabs-layout :laycfg="comps" :env="env" @handleCurrentChange="handleCurrentChange" @handleSizeChange="handleSizeChange" @sortChange="sortChange" :config="config"></tabs-layout>
    </template>
    <template v-else-if="layout&&layout.layType === 'H'">
        <bip-horizontal-lay :laycfg="comps" :env="env" @handleCurrentChange="handleCurrentChange" @handleSizeChange="handleSizeChange" @sortChange="sortChange" :config="config"></bip-horizontal-lay>
    </template>
    <template v-else-if="layout&&layout.layType === 'V'">
        <bip-vertical-lay :laycfg="comps" :env="env" @handleCurrentChange="handleCurrentChange" @handleSizeChange="handleSizeChange" @sortChange="sortChange" :config="config"></bip-vertical-lay>
    </template>
    <template v-else-if="layout&&layout.layType === 'U'">
        <div>自定义布局</div>
    </template>
</div>
</template>

<script lang="ts">
//B:(@60HT111#40726[-remark];T:60HTA111#725;@60HT111#70725[jyfs-])
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import { BipLayout } from '@/classes/ui/BipLayout';
import BorderLayout from '@/components/layout/BorderLayout.vue'
import TabsLayout from '@/components/layout/TabsLayout.vue'
import BipHorizontalLay from '@/components/layout/BipHorizontalLay.vue'
import BipVerticalLay from '@/components/layout/BipVerticalLay.vue'
import BipLayConf from '@/classes/ui/BipLayConf';
import CCliEnv from '@/classes/cenv/CCliEnv'
@Component({
    components:{BorderLayout,TabsLayout,BipHorizontalLay,BipVerticalLay}
})
export default class BaseLayout extends Vue{
    @Prop() layout?:BipLayout
    @Prop() env?:CCliEnv
    @Prop() config?:any
    @Provide() comps:Array<BipLayConf> = []
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
}
</script>
