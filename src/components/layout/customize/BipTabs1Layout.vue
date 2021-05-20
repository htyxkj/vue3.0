<template>
    <el-row v-loading.fullscreen.lock="fullscreenLoading">
        <el-tabs v-model="editableTabsValue" type="border-card" :closable="false" class="bip-tabs">
            <el-tab-pane v-for="(item) in tabs" :key="item.name" :label="item.name" :name="item.name" :style="style" :lazy="true">
                <template v-if="item.uriParams.beBill">
                    <base-applet :uriParams="item.uriParams" :params="null" :height="height"></base-applet>
                </template>
                <template v-else-if="item.uriParams.pclass=='inetbas.cli.systool.CUnivSelect' || item.uriParams.pclass=='inetbas.cli.systool.CRptTool'">
                    <c-univ-select :uriParams="item.uriParams" :params="null" :height="height"></c-univ-select>
                </template>
            </el-tab-pane>
        </el-tabs>
    </el-row>
</template>
<script lang="ts">
/**
 * 自定义布局  T1 卡片布局（卡片下是菜单）
 */
import { Component, Vue, Prop,Watch } from "vue-property-decorator";
import { BIPUtil } from "@/utils/Request";
import { URIParams } from "@/classes/URIParams";
import BaseApplet from '@/views/app/applet/BaseApplet.vue'
import CUnivSelect from '@/views/app/report/CUnivSelect.vue'
import { Mutation } from 'vuex-class';
let tools = BIPUtil.ServApi
import {BIPUtils}from '@/utils/BaseUtil'
let tool = BIPUtils.baseUtil
@Component({
    components: { BaseApplet,CUnivSelect }
})
export default class BipTabs1Layout extends Vue {
    @Prop() laycfg?:any
    fullscreenLoading: boolean = false;
    @Mutation('setBipHeight', { namespace:'login' }) setBipHeight: any;
    tabs:Array<any>=[];
    height:number = 400;
    editableTabsValue:any = null;
    style:string="height:"+(this.height?this.height:'400')+"px";
    async mounted() {
        this.init();
    }
    async init(){
        this.tabs = [];
        for (let i = 0; i < this.laycfg.length; i++) {
            const item:any = this.laycfg[i];
            let name = item.name;
            if(i ==0){
                this.editableTabsValue = name;
            }
            let oneTabs:any = {name:name,uriParams:null}
            let menuId = item.comp.obj_id;
            let menu = tool.findMenu(menuId);
            let command =menu.command;
            let _pbuid = "";
            let _pmenuid = "";
            if(command.indexOf("&") >-1){
                let cc = command.split("&");
                let pbuid = cc[0].split("=");
                let pmenuid = cc[1].split("=");
                if(pbuid[0] == 'pbuid'){
                    _pbuid = pbuid[1];
                    _pmenuid = pmenuid[1];
                }else if(pbuid[0] == 'pmenu'){
                    
                }
            }
            if (_pbuid && _pmenuid) {
                this.fullscreenLoading = true;
                let res = await tools.getMenuParams(_pbuid,_pmenuid);
                this.fullscreenLoading = false;
                if (res.data.id === 0) {
                    let uriParams = new URIParams();
                    uriParams = res.data.data.mparams;
                    oneTabs.uriParams = uriParams;
                } else {
                    this.$notify.error("没有菜单参数！");
                }
            }
            this.tabs.push(oneTabs);
        };
        this.height = document.documentElement.clientHeight
        if(this.height>70){
            this.height=this.height-104;
        }
        this.style="height:"+(this.height?this.height:'400')+"px";
    }
    @Watch("laycfg")
    layoutChange(){
        this.init()
    }
}
</script>
<style scoped>
</style>