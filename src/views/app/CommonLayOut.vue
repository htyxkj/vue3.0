<template>
    <el-row v-loading.fullscreen.lock="fullscreenLoading">
        <template v-if="uriParams.beBill">
            <base-applet :uriParams="uriParams" :params="$route.params" :height="height"></base-applet>
        </template>
        <template v-else-if="uriParams.pclass=='inetbas.cli.systool.CUnivSelect' || uriParams.pclass=='inetbas.cli.systool.CRptTool'">
            <c-univ-select :uriParams="uriParams" :params="$route.params" :height="height"></c-univ-select>
        </template>
    </el-row>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import { BIPUtil } from "@/utils/Request";
// import { CommICL } from "@/utils/CommICL";
// import BipMenuBarUi from "@/components/menubar/BipMenuBarUi.vue";
import { URIParams } from "@/classes/URIParams";

import BaseApplet from './applet/BaseApplet.vue'
import CUnivSelect from './report/CUnivSelect.vue'
import { Mutation } from 'vuex-class';
// let icl = CommICL;
let tools = BIPUtil.ServApi
@Component({
    components: { BaseApplet,CUnivSelect }
})
export default class CommonLayOut extends Vue {
    @Provide() pbuid: string = "";
    @Provide() pmenuid: string = "";
    @Provide() height:number = 400;
    @Provide() uriParams: URIParams = new URIParams();
    @Provide() fullscreenLoading: boolean = false;
    @Mutation('setBipHeight', { namespace:'login' }) setBipHeight: any;
    @Provide('heightInfo') heightInfo: any = {};
    async mounted() {
        if (this.$route.query) {
            this.pbuid = this.$route.query.pbuid + "";
            this.pmenuid = this.$route.query.pmenuid + "";
        }
        if (this.pbuid && this.pmenuid) {
            this.fullscreenLoading = true;
            let res = await tools.getMenuParams(
                this.pbuid,
                this.pmenuid
            );
            this.fullscreenLoading = false;
            if (res.data.id === 0) {
                this.uriParams = res.data.data.mparams;
            } else {
                this.$notify.error("没有菜单参数！");
            }
        } else {
            this.fullscreenLoading = false;
            console.log("没有相关数据", this.pbuid, this.pmenuid);
            this.$notify.error(
                "没有相关数据" + this.pbuid + ":" + this.pmenuid
            );
        }

        this.height = document.documentElement.clientHeight
        if(this.height>70){
            this.height=this.height-90;
        }
        this.setBipHeight(this.height)
        this.heightInfo.height = this.height;
    }
}
</script>
