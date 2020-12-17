<template>
    <el-row>
        <div class="bip-home-container">
            <el-scrollbar wrap-class="scrollbar-wrapper">
                <template v-if="!initShowChar">
                    <template v-if="!TJ">
                        <div v-if="lay.binit">
                            <template v-if="_cont">{{_cont.name}}</template>
                            <el-form @submit.native.prevent label-position="right" label-width="120px">
                                <base-layout v-if="lay.binit" :layout="lay" :env="env" ></base-layout><!-- @handleCurrentChange="handleCurrentChange" @handleSizeChange="handleSizeChange" -->
                            </el-form>
                        </div>
                    </template>
                </template>
                <template v-else>
                    <template v-if="env && env.dsm && env.dsm.ccells">
                        <el-row>
                            <el-col v-for="(item ,index) in uriParams.bgroupList" :key="index" :span="parseInt(item.width)" >
                                <bip-statistics-chart :stat="item" :env="env"  :showBack="false" :showTable="false" :height="height" @openMenu="openMenu"></bip-statistics-chart>
                            </el-col>
                        </el-row>
                    </template>
                </template>
                <template>
                    <bip-menu-btn-dlg ref="bip_dlg" @Recheck="Recheck"></bip-menu-btn-dlg>
                </template>
            </el-scrollbar>
        </div>
    </el-row>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import BipMenuBarUi from "@/components/menubar/BipMenuBarUi.vue";
import BipStatisticsDlog from "@/components/statistics/BipStatisticsDialog.vue";
import BipStatisticsChart from "@/components/statistics/BipStatisticsChart.vue";
import BipMenuBtnDlg from '@/components/dlgbtn/BipMenuBtnDlg.vue';

import { URIParams } from "@/classes/URIParams";
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi
import {CommICL} from '@/utils/CommICL'
let ICL = CommICL
import { State, Action, Getter, Mutation } from "vuex-class";
import {BipMenuBtn} from '@/classes/BipMenuBtn'
import { Cells } from "@/classes/pub/coob/Cells";
import CDataSet from "@/classes/pub/CDataSet";
import BipMenuBar from "@/classes/pub/BipMenuBar"; 
import CCliEnv from "@/classes/cenv/CCliEnv";
import { BipLayout } from "@/classes/ui/BipLayout";
import QueryEntity from "@/classes/search/QueryEntity";
import CRecord from '../../classes/pub/CRecord';
import CData from '../../classes/pub/CData';
@Component({
    components: { BipMenuBarUi,BipStatisticsDlog,BipStatisticsChart,BipMenuBtnDlg}
})
export default class HomeCUnivSelect extends Vue {
    @Prop() uriParams?: URIParams;
    @Prop() params:any;
    @Prop() cont:any;
    @Prop() height!:number;
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
    @Provide() pmenuid:string = "";
    @Provide() handleSizeChangeBusID:number = 0
    @Provide() handleCurrentChangeBusID:number = 0
    @Provide() initShowChar:boolean = false;
    @Provide() biType?:string;
    @State("aidValues", { namespace: "insaid" }) aidValues: any;
    @Action("fetchInsAid", { namespace: "insaid" }) fetchInsAid: any;
    @Mutation("setAidValue", { namespace: "insaid" }) setAidValue: any;
    @Mutation("setAidInfo", { namespace: "insaid" }) setAidInfo: any;
    _cont:any = {};
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
        if(this.cont){
            this._cont = JSON.parse(this.cont);
        }
        this.biType="SEL" 
        if(this.uriParams){
            if(this.uriParams.pclass=='inetbas.cli.systool.CRptTool'){
                this.biType="RPT"
            }
            if((this.uriParams.pattr & 0x10000) >0){
                this.biType="SQL"
            }
        }
        await this.initUI()
        this.initDlgBtn();
        this.qe.pcell = this.dsm.ccells.obj_id
        this.qe.tcell = this.dsm_cont.ccells.obj_id
        let he = document.documentElement.clientHeight;
        console.log('height:'+he)
        if(!this.params || !this.params.method){ 
            this.initData(); 
        }else{
            this.pmenuid = this.$route.query.pmenuid+'';
            this.initVal(); 
        } 
        this.$bus.$on("row_click",this.getCRecordByPk2) 
        this.handleSizeChangeBusID = this.$bus.$on('handleSizeChange',this.handleSizeChangebus)
        this.handleCurrentChangeBusID = this.$bus.$on('handleCurrentChange',this.handleCurrentChangebus)
        if(this.uriParams && this.uriParams.bgroup){
            if(this.uriParams.bgroupList.length ==0){
                this.initShowChar = false;
            }else{
                this.initShowChar = true;
            }
        }

    }
    initData(){
        if(this.uriParams && this.uriParams.pbds){
            let pbds:any = this.uriParams.pbds;
            if(pbds.ptran){
                let ptran = pbds.ptran;//.substring(0,pbds.ptran.lastIndexOf());
                ptran = ptran.split("&")
                for(var i=0 ; i< ptran.length;i++){
                    let cc = ptran[i].split("=");
                    this.dsm_cont.currRecord.data[cc[0]] = cc[1];
                }
                this.find();
            }
        }
    }
    async invokecmd(btn:any) {
        let cmd = btn.cmd
        console.log(cmd);
        if(cmd == 'CLEAR'){
        　　for(var key in this.dsm_cont.currRecord.data){ 
                this.dsm_cont.currRecord.data[key] = "";
        　　} 
        }else if(cmd == 'FIND' ) {
            this.qe.page.currPage=1;
            this.find()
        }else if(cmd == 'ISTAT'){
            this.TJDlog = true;
            setTimeout(() => {
                let dia: any = this.$refs.bi_tj;
                dia.open();
            }, 100);
        }else if(cmd == 'DLG'){
            let cc = JSON.stringify(this.dsm.currRecord.data);
            if(cc.length>2){
                setTimeout(() => {
                    let dia: any = this.$refs.bip_dlg;
                    dia.open(btn,this.env); 
                }, 100);
            }
        }
        console.log(this.dsm_cont.currRecord)
    }
    find(){
        this.qe.pcell = this.dsm.ccells.obj_id
        this.qe.tcell = this.dsm_cont.ccells.obj_id
        if(this.biType == "SEL")
            this.qe.cont = JSON.stringify(this.dsm_cont.currRecord.data);
        else if(this.biType == "RPT" || this.biType == "SQL"){
            this.qe.cont = JSON.stringify(this.dsm_cont.currRecord);
        }
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
        if(this.biType =="SEL"){
            this.dsm.queryData(queryCont).then(res=>{
                this.processingData(res,"SEL");
                this.getCRecordByPk2(-1);
            }).catch(err=>{
                this.fullscreenLoading = false
                console.log(err)
            });
        }else if(this.biType == "RPT"){
            queryCont.type = 2
            this.dsm.queryRPTData(queryCont).then(res=>{
                this.processingData(res,"RPT");
            }).catch(err=>{
                this.fullscreenLoading = false
                console.log(err)
            });
        }else if(this.biType == "SQL"){
            queryCont.type = 3
            this.dsm.queryRPTData(queryCont).then(res=>{
                this.processingData(res,"RPT");
            }).catch(err=>{
                this.fullscreenLoading = false
                console.log(err)
            });
        }
    }
    processingData(res:any,type:string){
        this.fullscreenLoading = false
        let data = res.data;
        if(data.id === 0){
            let cd : CData = new CData('');
            let retdata = null
            if(type == 'SEL')
                retdata = data.data.data
            else if(type == "RPT")
                retdata = data.data.rpt
            cd.obj_id = retdata.obj_id;
            cd.data = retdata.data;
            cd.page = retdata.page; 
            let page = retdata.page; 
            this.dsm.setCData(cd)
            this.dsm.index = (page.currPage - 1) * page.pageSize;
        }else{
            this.$notify.error(data)
        }
        this.$bus.$emit("datachange",this.dsm.ccells.obj_id)
    }
    beforeDestroy(){
        this.$bus.$off('handleSizeChange',this.handleSizeChangeBusID)
        this.$bus.$off('handleCurrentChange',this.handleCurrentChangeBusID)
    }
    handleSizeChangebus(value:any){
        if(this.env.dsm.ccells.obj_id == value.obj_id){
            this.handleSizeChange(value.value)
        }
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
    handleCurrentChangebus(value:any){
        if(this.env.dsm.ccells.obj_id == value.obj_id){
            this.handleCurrentChange(value.value)
        }
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
        this.Statistics["title"] = null; 
        this.initShowChar=false;
        this.TJ =true;
    }
    /**
     * 获取自定义按钮
     */
    async initDlgBtn(){
        if(this.uriParams){
            let name = "DLG."+this.uriParams.pbuid;
            let str = name
            // let dlg = await pubMethod.getConstant(str);
            str = ICL.AID_KEYCL+str;
            if(!this.aidValues.get(str)){
                let vv  = window.sessionStorage.getItem(str)
                if(!vv){
                    let vars = {id:300,aid:name}
                    await this.fetchInsAid(vars);
                    let vv  = window.sessionStorage.getItem(str)
                    if(vv){
                        let vals = {key:str,value:JSON.parse(vv)}
                        this.setAidValue(vals)
                    }
                }else{
                    let vals = {key:str,value:JSON.parse(vv)}
                    this.setAidValue(vals)
                } 
            }
            let dlg = this.aidValues.get(str);
            if(dlg && dlg.slink){ 
                let dlgBtn = dlg.slink.split("&")
                dlgBtn.forEach((item:any) => {
                    let cc = item.substring(0,item.indexOf(";")); 
                    let type = cc.substring(0,1);
                    let bname = cc.substring(2,item.indexOf(","));  
                    let btn1 = new BipMenuBtn("DLG",bname)
                    btn1.setDlgSname(name);
                    btn1.setDlgType(type)
                    btn1.setDlgCont(item.substring(item.indexOf(";")+1))
                    this.mbs.menuList.push(btn1)
                });
            }
        }
    } 
    async initVal(){
        if(this.params){
            this.qe.page.currPage = 1;
            this.qe.page.index = 0;
            if(this.params.method =='BL'){
                if(JSON.stringify(this.params.jsontj).length >2){
                    this.dsm_cont.currRecord.data = this.params.jsontj;
                    this.find();
                } 
            }
        }
    }
    @Watch('params')
    paramsWatch(){ 
        if(this.pmenuid == this.$route.query.pmenuid){ 
            this.initVal();
        }
    }
    /**
     * DLG 弹出框后重新查询
     */
    Recheck(){
        this.find()
    }

    getCRecordByPk2(value:any){
        if(this.dsm){
            if(value == -1 && this.dsm.ds_sub && this.dsm.ds_sub.length>0){
                this.getCRecordByPk(this.dsm.currRecord)
            }else if(value!=null && value!=-1 && value.dsm.ds_sub  && value.dsm.ds_sub.length>0){
                this.getCRecordByPk(value.dsm.currRecord)
            }
        }
    }
    /**
     * @description 根据主键获取记录
     * @param crd 查询条件
     */
    async getCRecordByPk(crd: CRecord) {
        if (crd.c_state == undefined || crd.c_state == 0) {
            this.qe.pcell = this.dsm.p_cell
            this.qe.tcell = this.dsm.ccells.obj_id
            this.qe.oprid = 15;
            this.qe.cont = JSON.stringify(crd.data);
            this.qe.values = [];
            let vv = await this.findDataFromServe(this.qe);
            if (vv != null) {
                this.dsm.currRecord = vv.data[0]
                // this.dsm.setRecordAtIndex(vv.data[0],this.dsm.index)
                // this.qe.values = vv.data;
                // this.qe.page = vv.page;
                // this.dataLoaded(this.qe,vv);
                // console.log('getdataBack')
                this.setSubData()
            }
        } else {
            this.dsm.currRecord = crd;
            this.setSubData()
        }
    }
    /***
     * @description 从服务端获取数据
     * @param qes 查询条件和页次对象
     */
    async findDataFromServe(qes: QueryEntity) {
        this.fullscreenLoading = true;
        let res = await this.dsm.queryData(qes);
        let data = res.data;
        this.fullscreenLoading = false;
        if (data.id == 0) {
            console.log(data.data.data)
            let vv:CData = data.data.data;
            let cd :CData = this.initCData(vv)
            return cd;
        } else {
            return new CData('');
        }
    }
    setSubData(){
        let n = this.dsm.ds_sub.length
        for(let i=0;i<n;i++){
            let cds1 = this.dsm.ds_sub[i]
            cds1.clear();
            if(this.dsm.currRecord && this.dsm.currRecord.subs){
                for(let j=0;j<this.dsm.currRecord.subs.length;j++){
                    let oneSubs:any = this.dsm.currRecord.subs[j]
                    if(oneSubs.obj_id == cds1.ccells.obj_id){
                        let vals = oneSubs.data;
                        if(oneSubs){
                            cds1.clear();
                            cds1.setCData(oneSubs)
                            cds1.page.total = vals.length||0
                            this.$bus.$emit("datachange",cds1.ccells.obj_id)
                        }
                    }
                }
            }
        }
    }
    initCData(vv:CData){
        let cd :CData = new CData('');
        cd.data = vv.data
        cd.page = vv.page
        cd.obj_id = vv.obj_id
        vv.data.forEach((item,index)=>{
            if(item.subs.length>0){
                item.subs.forEach((icd,index)=>{
                    let cc:CData = this.initCData(icd)
                    item.subs[index] = cc;
                })
            }
        })
        return cd;
    }
    /***
     * 打开菜单
     */
    openMenu(){
        this.$emit("openMenu");
    }
}
</script>
<style  lang="scss" scoped>
.bip-home-container {
    background-color: white;
    position: fixed; 
    height: calc(100%)  !important;
    z-index: 1;
    overflow: hidden;  
    width: calc(100%) !important;
    .el-scrollbar {
        height: 100%;
        margin-bottom: 0px !important;
        margin-right: 0px !important; 
        .el-scrollbar__wrap {
            overflow-x: hidden !important;
            padding-right: 5px;
            height: 100%;
        }
        .scrollbar-wrapper{
          overflow-x: hidden !important;
        }
    }
}
</style>
