<template>
    <el-row v-loading.fullscreen.lock="fullscreenLoading">
        <template v-if="uriParams.beBill">
            <base-applet :uriParams="uriParams" :params="$route.params"></base-applet>
        </template>
        <template v-else-if="uriParams.pclass=='inetbas.cli.systool.CUnivSelect'">
            <c-univ-select :uriParams="uriParams"></c-univ-select>
        </template>
        <!-- <template v-if="mbs&&mbs.initOK">
            <bip-menu-bar-ui ref="mb" :mbs="mbs" :cds="dsm" @invokecmd="invokecmd"></bip-menu-bar-ui>
        </template>
        <template v-if="searchdia">
            <bip-search-dialog ref="se" :cds_cont="dsm" @makeOK="findData"></bip-search-dialog>
        </template>
        <div class="bip-main-container" v-if="lay.binit">
            <el-scrollbar style="margin-bottom:0px;  margin-right: 0px;">
                <el-form label-position="right" label-width="120px">
                    <template v-if="uriParams.beBill">
                        <base-layout v-if="lay.binit" :layout="lay" :env="env"></base-layout>
                    </template>
                    <template v-else>报表


                    </template>
                </el-form>
            </el-scrollbar>
        </div> -->
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
// let icl = CommICL;
let tools = BIPUtil.ServApi
@Component({
    components: { BaseApplet,CUnivSelect }
})
export default class CommonLayOut extends Vue {
    @Provide() pbuid: string = "";
    @Provide() pmenuid: string = "";
    @Provide() uriParams: URIParams = new URIParams();
    @Provide() fullscreenLoading: boolean = false;
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
    }
}
</script>

<style lang="scss">
.bip-input-item {
    margin-bottom: 2px !important;
}
.bip-row {
    margin-bottom: 2px !important;
}
.el-form-item {
    margin-bottom: 0px !important;
}
.bip-main-container {
    position: fixed; 
    height: calc(100% - 135px) !important;
    width: calc(100% - 30px) !important;
    z-index: 1;
    overflow: hidden;
    margin-right: 20px;
    .el-scrollbar {
        height: 100%;
        margin-bottom: 10px !important;
        margin-right: 0px !important;
        padding-bottom: 20px;
        .el-scrollbar__wrap {
            overflow-x: hidden !important;
            padding-right: 5px;
            height: 100%;
        }
    }
}
</style>
