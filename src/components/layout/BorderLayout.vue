<template>
<div class="bip-border-lay">
    <template v-if="btop">
        <el-card v-if="!laycfg[0].bcells" style="height:100%; margin-bottom:10px;">
            <base-layout :layout="laycfg[0].comp" :env="env" :config="config" @invokecmd="invokecmd"></base-layout >
        </el-card>
        <el-card v-else style="height:100% ; margin-bottom:10px;">
            <el-row class="bip-row" :gutter="4">
                <lay-cell :laycell="laycfg[0].comp" :env="env" @handleCurrentChange="handleCurrentChange" @handleSizeChange="handleSizeChange" @sortChange="sortChange" :config="config" @invokecmd="invokecmd"></lay-cell>
            </el-row>
        </el-card>
    </template>
    <template v-if="bcenter">
        <el-row class="bip-row" :gutter="4">
            <template v-if="bleft">
                <el-col :span="wleft">
                    <el-card v-if="!laycfg[3].bcells">
                        <base-layout :layout="laycfg[3].comp" :env="env" :config="config" @invokecmd="invokecmd"></base-layout >
                    </el-card>
                    <el-card v-else>
                        <lay-cell :laycell="laycfg[3].comp" :env="env" @handleCurrentChange="handleCurrentChange" @handleSizeChange="handleSizeChange" @sortChange="sortChange" :config="config" @invokecmd="invokecmd"></lay-cell>
                    </el-card>
                </el-col>
            </template>
            <template v-if="bcenter">
                <el-card v-if="!laycfg[wcenterIndex].bcells"  style="height:100% ; margin-bottom:10px;">
                    <base-layout :layout="laycfg[wcenterIndex].comp" :env="env" :config="config" @invokecmd="invokecmd"></base-layout >
                </el-card>
                <el-card v-else style="height:100% ; margin-bottom:10px;">
                    <el-col :span="wcenter"><lay-cell :laycell="laycfg[wcenterIndex].comp" :env="env" @handleCurrentChange="handleCurrentChange" @handleSizeChange="handleSizeChange" @sortChange="sortChange" :config="config" @invokecmd="invokecmd"></lay-cell></el-col>
                </el-card>
            </template>
            <template v-if="bright">
                <el-col :span="wright">
                    <el-card v-if="!laycfg[4].bcells">
                        <base-layout :layout="laycfg[4].comp" :env="env" :config="config" @invokecmd="invokecmd"></base-layout >
                    </el-card>
                    <el-card v-else >
                        <lay-cell :laycell="laycfg[4].comp" :env="env" @handleCurrentChange="handleCurrentChange" @handleSizeChange="handleSizeChange" @sortChange="sortChange" :config="config" @invokecmd="invokecmd"></lay-cell>
                    </el-card>
                </el-col>
            </template>
        </el-row>
    </template>
    <template v-if="bbuttom">
        <el-row class="bip-row" :gutter="4">
            <el-card v-if="!laycfg[2].bcells">
                <bip-comm-lay :layout="laycfg[2].comp" :env="env" :config="config" @invokecmd="invokecmd"></bip-comm-lay >
            </el-card>
            <el-card v-else style="height:100% ; margin-bottom:10px;">
                <lay-cell :laycell="laycfg[2].comp" :env="env" @handleCurrentChange="handleCurrentChange" @handleSizeChange="handleSizeChange" @sortChange="sortChange" :config="config" @invokecmd="invokecmd"></lay-cell>
            </el-card>
            
        </el-row>
    </template>
</div>

</template>
<script lang="ts">
//BorderLayout 上中下左右布局
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import BipLayConf from '@/classes/ui/BipLayConf';
import LayCell from './LayCell.vue'
import CCliEnv from '@/classes/cenv/CCliEnv'
@Component({
    components:{LayCell}
})
export default class BorderLayout extends Vue{
    @Prop() laycfg!:Array<BipLayConf>
    @Prop() env?:CCliEnv
    @Prop() height!:number
    @Prop() config?:any
    @Provide() len:number = 0
    @Provide() btop:boolean = false
    @Provide() bcenter:boolean = false
    @Provide() bbuttom:boolean = false
    @Provide() bleft:boolean = false
    @Provide() bright:boolean = false
    @Provide() wleft = 0
    @Provide() wright = 0
    @Provide() wcenter = 0
    @Provide() wcenterIndex = 1
    @Provide() style="";
    mounted(){
        this.initInfo()
    }
    @Watch("laycfg")
    layChange(){
        this.initInfo()
    }
    initInfo(){
        if(this.laycfg){
            this.len = this.laycfg.length
            this.wcenter = 24
            if(this.len==1){
                this.btop = false
                this.bcenter = true
                this.wcenter = 24
                this.wleft = this.wright = 0
                this.wcenterIndex = 0
            }else{
                this.wcenterIndex = 1
                this.btop = this.len>0
                this.bcenter = this.len>1
                this.bbuttom = this.len>2
                this.bleft = this.len>3
                this.bright = this.len>4
                if(this.bright&&this.bleft){
                    this.wleft = 4
                    this.wcenter = 16
                    this.wright = 4
                }else if(this.bright){
                    this.wcenter = 20
                    this.wright = 4
                }else if(this.bleft){
                    this.wleft = 4;
                    this.wcenter = 20;
                }
            }
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

}
</script>

<style lang="scss">
.bip-border-lay{
    width: 100%;
    height: 100%;
    .el-card__body{
        padding: 2px;
    }
}
</style>

