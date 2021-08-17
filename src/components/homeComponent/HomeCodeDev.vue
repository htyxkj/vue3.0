<template>
    <el-row :id="sid" style="height:100%">
        <div class="bip-home-container">
            <template>
                <div class="main-title">
                    <el-row>
                        <el-col :span="20">
                            <i class="iconfont icon-bip-menu"></i>
                            {{sname}}
                        </el-col>
                    </el-row>
                </div>
                <el-scrollbar wrap-class="scrollbar-wrapper">
                    <template v-if="codeType == 'Proportion'">
                        <proportion :codeValue="codeValue" :chartHeight="chartHeight"></proportion>
                    </template>
                    <template v-else-if="codeType == 'Breeding_alarm'">
                        <breeding-alarm></breeding-alarm>
                    </template>
                </el-scrollbar>
            </template>
        </div>
    </el-row>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from "vuex-class";
import { BIPUtils } from "@/utils/BaseUtil";
let baseTool = BIPUtils.baseUtil;
import Proportion from './component/Proportion.vue'
import BreedingAlarm from '@/custom/breeding/component/BreedingAlarm.vue'

@Component({
  components: {Proportion,BreedingAlarm}
})
export default class HomeCodeDev extends Vue {
    @Prop() cont!:string;
    @Prop() rech!:string;
    @Prop() sid!:string;
    @Getter('isLogin', { namespace: 'login' }) isLogin!: boolean;
    sname:any = "";
    codeType:any = "";
    codeValue:any = null;
    chartHeight:number = 400;
    mounted() {   
        setTimeout(() => {
            var x:any =document.getElementById(this.sid);
            if(x)
                this.chartHeight = x.clientHeight-42
        }, 200); 
        this.init();
    }
    async init(){
        if(this.cont){
            let cc = JSON.parse(this.cont);
            this.sname = cc.sname
        }
        if(this.rech){
            let rech = JSON.parse(this.rech);
            this.codeType = rech.type;
            this.codeValue = rech.value
        }
    } 
    @Watch("cont")
    contChange(){
        this.init();
    }
}
</script>
<style lang="scss">
    .bg_item{
        .el-badge__content.is-fixed{
            right: 30px;
        }
    }
</style>
<style lang="scss" scoped>
    .bip-home-container {
        // border: 1px solid #dedede;
        background-color: #ffffff;
        border-radius: 6px;
        position: fixed;
        height: calc(100%)  !important;
        z-index: 1;
        overflow: hidden;
        width: calc(100%) !important;
        color: #868D94;
        box-shadow: 1px 2px 10px #dde2e4;
        .el-scrollbar {
            height: 90%;
            margin-bottom: 10px !important;
            margin-right: 0px !important;
            .el-scrollbar__wrap {
            overflow-x: hidden !important;
            padding-right: 5px;
            height: 100%;
            }
            .scrollbar-wrapper {
            overflow-x: hidden !important;
            }
        }
    }

    .main-title {
        border-bottom: 2px solid #efefef;
        height: 40px;
        line-height: 40px;
        font-size: 14px;
        padding: 0 10px;
        letter-spacing: 1px;
        font-weight: 600;
        margin-bottom: 8px;
        @include bip_text_primary
    }
    .title {
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        letter-spacing: 0.8px;
        color: #333333;
    }
    .main-title-icon {
        font-size: 20px;
        text-align: right;
    } 
</style>