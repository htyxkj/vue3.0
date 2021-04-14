<template>
    <div>
        <template v-if="layType == 'TREE'">
            <bip-tree-layout :laycell="laycfg[0].comp" :env="env" @handleCurrentChange="handleCurrentChange" @handleSizeChange="handleSizeChange" @sortChange="sortChange" :config="config"  @invokecmd="invokecmd"></bip-tree-layout>
        </template>
        <template v-else>
            自定义布局
        </template>
    </div>
</template>

<script lang="ts">
/**
 * 自定义布局页面
 */
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import BipTreeLayout from '@/components/layout/customize/BipTreeLayout.vue'
import BipLayConf from '@/classes/ui/BipLayConf';
import CCliEnv from '@/classes/cenv/CCliEnv'
@Component({
    components:{BipTreeLayout}
})
export default class BipCustomizeLayout extends Vue{
    @Prop() laycfg!:Array<BipLayConf>
    @Prop() env?:CCliEnv
    @Prop() height!:number
    @Prop() config?:any
    comps:Array<BipLayConf> = []
    layType:string = ""
    mounted(){
        this.initInfo();
    }
    created(){
        
    }
    initInfo(){
        if(this.laycfg && this.laycfg.length>0){
            if(this.laycfg[0].comp){
                let comp:any = this.laycfg[0].comp;
                if(comp.obj_id.indexOf("TREE")){
                    this.layType = "TREE";
                }
            }
        }
    }
    @Watch("laycfg")
    layChange(){
        this.initInfo()
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
        this.$emit("invokecmd",btn)
    }
}
</script>
