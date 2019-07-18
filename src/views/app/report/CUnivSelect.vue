<template>
    <el-row v-loading.fullscreen.lock="fullscreenLoading">
        <bip-menu-bar-ui ref="mb" :mbs="mbs" :cds="dsm" @invokecmd="invokecmd"></bip-menu-bar-ui>
        <template v-if="!TJ">
            <div class="bip-main-container" v-if="lay.binit">
                <el-scrollbar style="margin-bottom:0px;  margin-right: 0px;">
                    <div ref="se">
                        <bip-search-cont ref="se" :env="env"></bip-search-cont>
                    </div>
                    <el-form label-position="right" label-width="120px">
                        <base-layout v-if="lay.binit" :layout="lay" :env="env" @handleCurrentChange="handleCurrentChange" @handleSizeChange="handleSizeChange"></base-layout>
                    </el-form>
                </el-scrollbar>
            </div>
        </template>
        <template v-else>
            <!-- 统计结果展示 -->
            <bip-statistics-chart :stat="Statistics" :env="env" @goTable="goTable"></bip-statistics-chart>
        </template>
        <template v-if="TJDlog">
            <!-- 统计项弹框选择 -->
            <bip-statistics-dlog ref="bi_tj"  :env="env" @makeOK="tjData"></bip-statistics-dlog>
        </template>
    </el-row>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import BipMenuBarUi from "@/components/menubar/BipMenuBarUi.vue";
import BipStatisticsDlog from "@/components/statistics/BipStatisticsDialog.vue";
import BipStatisticsChart from "@/components/statistics/BipStatisticsChart.vue";
import { URIParams } from "@/classes/URIParams";
import { BIPUtil } from "@/utils/Request";

import { Cells } from "@/classes/pub/coob/Cells";
import BipLayCells from "@/classes/ui/BipLayCells";
import CDataSet from "@/classes/pub/CDataSet";
import BipMenuBar from "@/classes/pub/BipMenuBar";
let tools = BIPUtil.ServApi
import CCliEnv from "@/classes/cenv/CCliEnv";
import { BipLayout } from "@/classes/ui/BipLayout";
import BaseLayout from "@/components/layout/BaseLayout.vue";
import BipSearchCont from './BipSearchCont.vue'
import QueryEntity from "@/classes/search/QueryEntity";
@Component({
    components: { BipMenuBarUi,BaseLayout,BipSearchCont,BipStatisticsDlog,BipStatisticsChart}
})
export default class CUnivSelect extends Vue {
    @Prop() uriParams?: URIParams;
    @Provide() fullscreenLoading: boolean = false;
    @Provide() cells: Array<Cells> = new Array<Cells>();
    @Provide() mbs: BipMenuBar = new BipMenuBar(0);
    @Provide() dsm: CDataSet = new CDataSet(null);
    @Provide() dsm_cont: CDataSet = new CDataSet(null);
    @Provide() ds_ext: Array<CDataSet> = Array<CDataSet>();
    @Provide() lay: BipLayout = new BipLayout("");
    @Provide() env: CCliEnv = new CCliEnv();
    @Provide() listIndex: number = -1;
    @Provide() qe: QueryEntity = new QueryEntity("","");
    @Provide() TJ :boolean = false;//是否是统计图
    @Provide() TJDlog :boolean = false;//是否显示统计dlog
    @Provide() Statistics:any=null;//统计条件集
    async initUI() {
        if (this.uriParams&&this.uriParams.pcell) {
            let pcell = this.uriParams.pcell
            let res = await tools.getCCellsParams(pcell)
            this.fullscreenLoading = false;
            let rtn: any = res.data;
            if (rtn.id == 0) {
                let kn: Array<Cells> = rtn.data.layCels;
                this.cells = kn;
                let cds: CDataSet;
                this.dsm_cont = new CDataSet(this.cells[0]);
                this.dsm = new CDataSet(this.cells[1]);
                for (let i = 1; i < this.cells.length; i++) {
                    this.ds_ext[i - 1] = new CDataSet(this.cells[i]);
                }
                this.mbs = new BipMenuBar(this.uriParams.pattr, this.dsm,true);
                console.log(this.mbs, "mbs");
                this.listIndex = this.findListMenuIndex("LIST");
                let layout = this.uriParams.playout
                if(layout==''){
                    layout = 'B:('+this.dsm.ccells.obj_id+')'
                }
                let bipLay = new BipLayout(layout, this.cells);
                this.lay = bipLay;
                this.env.initInfo(
                    this.uriParams,
                    this.cells,
                    this.mbs,
                    this.dsm,
                    this.ds_ext
                );
                this.env.ds_cont = this.dsm_cont
                this.dsm_cont.createRecord()
                let buid = this.uriParams.pflow
                let res1 = await tools.getBULinks(buid);
                let rtn1 = res1.data;
                if(rtn1.id==0){
                    let ope = rtn1.data.opt
                    this.dsm.setOpera(ope)
                }
            } else {
                this.$notify.error("没有获取到对象定义");
            }
        }
    }

    async mounted(){
        await this.initUI()
        this.qe.pcell = this.dsm.ccells.obj_id
        this.qe.tcell = this.dsm_cont.ccells.obj_id
        let he = document.documentElement.clientHeight;
        console.log('height:'+he)
        let ses:any = this.$refs.se
        console.log(ses)
        let height= ses.offsetHeight;
        console.log('ses height:'+height,he-height)
        this.initData();
    }
    initData(){
        if(this.uriParams && this.uriParams.pbds){
            let pbds:any = this.uriParams.pbds;
            let ptran = pbds.ptran.substring(1,pbds.ptran.length-1);
            ptran = ptran.split("&")
            for(var i=0 ; i< ptran.length;i++){
                let cc = ptran[i].split("=");
                this.dsm_cont.currRecord[cc[0]] = cc[1];
            }
            this.find();
        }
    }
    invokecmd(cmd:string){
        console.log(cmd)
        if(cmd == 'CLEAR'){
            this.dsm_cont.currRecord = Object.assign({},{})
        }else if(cmd == 'FIND' ) {
            this.find()
        }else if(cmd == 'ISTAT'){
            this.TJDlog = true;
            setTimeout(() => {
                let dia: any = this.$refs.bi_tj;
                dia.open();
            }, 100);
        }
        console.log(this.dsm_cont.currRecord)
    }
    find(){
        this.qe.cont = JSON.stringify(this.dsm_cont.currRecord);
        this.qe.oprid = 13
        this.qe.type = 1
        this.qe.page.pageSize = 20
        this.findServerData(this.qe);
    }
    findListMenuIndex(cmd: string): number {
        let index = -1;
        return this.mbs.menuList.findIndex(item => {
            return item.cmd === cmd;
        });
    }

    findServerData(queryCont:any){
        this.fullscreenLoading = true
        this.dsm.queryData(queryCont).then(res=>{
            this.fullscreenLoading = false
            let data = res.data;
            if(data.id === 0){
                this.qe = data.data.data
                console.log(this.qe,this.qe.values)
                let page = this.qe.page;
                this.dsm.page = page;
                this.dsm.setValues(this.qe.values,true)
                // this.dsm._total = page.total;
                this.dsm.index = (page.currPage - 1) * page.pageSize;
            }else{
                this.$notify.error(data)
            }

        }).catch(err=>{
            this.fullscreenLoading = false
            this.$notify.error(err)
        });
    }

    
    handleSizeChange(value:number){
        console.log('handleSizeChange',value)
        this.qe.cont = JSON.stringify(this.dsm_cont.currRecord);
        this.qe.oprid = 13
        this.qe.type = 1
        this.qe.page.pageSize = value
        this.qe.page.currPage = 1
        this.qe.values = []
        this.findServerData(this.qe);
        // this.$emit('handleSizeChange',value)
    }

    handleCurrentChange(value:number){
        console.log('handleCurrentChange',value)
        // this.$emit('handleCurrentChange',value)
        this.qe.cont = JSON.stringify(this.dsm_cont.currRecord);
        this.qe.oprid = 13
        this.qe.type = 1
        this.qe.page.currPage = value
        this.qe.values = []
        this.findServerData(this.qe);
    }

    tjData(selGroup:Array<any>,selValue:Array<any>,chartTypeValue:string,showChart:boolean){
        this.Statistics = {};
        this.Statistics["selGroup"] = selGroup;
        this.Statistics["selValue"] = selValue;
        this.Statistics["chartTypeValue"] = chartTypeValue;
        this.Statistics["showChart"] = showChart; 
        this.TJ =true;
    }
    goTable(){
        this.TJ = false;
    }
}
</script>
