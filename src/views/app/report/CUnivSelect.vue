<template>
    <el-row v-loading.fullscreen.lock="fullscreenLoading">
        <bip-menu-bar-ui ref="mb" :mbs="mbs" :cds="dsm" @invokecmd="invokecmd"></bip-menu-bar-ui>
        <div class="bip-main-container">
            <el-scrollbar wrap-class="scrollbar-wrapper">
                <template v-if="!isShowMap">
                    <template v-if="!initShowChar">
                        <template v-if="!TJ">
                            <div class="bip-main-container" v-if="lay.binit">
                                <el-scrollbar style="margin-bottom:0px;  margin-right: 0px;">
                                    <div ref="se" @keyup.enter="find">
                                        <bip-search-cont :env="env" v-show="CondiyionShow"></bip-search-cont>
                                    </div>
                                    <el-form @submit.native.prevent label-position="right" label-width="120px">
                                        <base-layout v-if="lay.binit" :layout="lay" :env="env" @sortChange="sortChange" :config="config" @invokecmd="invokecmd"></base-layout><!-- @handleCurrentChange="handleCurrentChange" @handleSizeChange="handleSizeChange" -->
                                    </el-form>
                                </el-scrollbar>
                            </div>
                        </template>
                        <template v-else>
                            <!-- 统计结果展示 -->
                            <bip-statistics-chart :stat="Statistics" :env="env" :showBack="true" :showTable="true" @goTable="goTable"></bip-statistics-chart>
                        </template>
                    </template>
                    <template v-else>
                        <template v-if="env && env.dsm && env.dsm.ccells">
                            <el-row :gutter="10">
                                <el-col v-for="(item ,index) in uriParams.bgroupList" :key="index" :span="parseInt(item.width)" >
                                    <bip-statistics-chart ref="childChart" :stat="item" :env="env" @goTable="goTable" :showBack="true" :showTable="true"></bip-statistics-chart>
                                </el-col>
                            </el-row>
                        </template>
                    </template>
                </template>
                <template v-else>
                    <bip-map-show :cels="dsm.ccells.cels" :pdList="dsm.cdata.data"></bip-map-show>
                </template>
                <template v-if="TJDlog">
                    <!-- 统计项弹框选择 -->
                    <bip-statistics-dlog ref="bi_tj"  :env="env" @makeOK="tjData"></bip-statistics-dlog>
                </template>
                <template>
                    <bip-menu-btn-dlg ref="bip_dlg" @selData="Recheck" @Recheck="Recheck"></bip-menu-btn-dlg>
                    <im-ex-file :cell="dsm.ccells" :cellID="uriParams.pbds.importCellId" ref="imExFile" @exFile="getExcel" @Recheck="Recheck"></im-ex-file>
                </template>
            </el-scrollbar>
        </div>
         <template v-if="nodeId">
            <bip-log ref="bipLog" :nodeId="nodeId" :nodeType="'import'"></bip-log>
        </template>
    </el-row>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import BipMenuBarUi from "@/components/menubar/BipMenuBarUi.vue";
import BipStatisticsDlog from "@/components/statistics/BipStatisticsDialog.vue";
import BipStatisticsChart from "@/components/statistics/BipStatisticsChart.vue";
import BipMenuBtnDlg from '@/components/dlgbtn/BipMenuBtnDlg.vue';
import ImExFile from '@/components/file/ImExFile.vue';
import BipMapShow from '@/components/map/ui/BipMapShow.vue';

import { URIParams } from "@/classes/URIParams";
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi
import {CommICL} from '@/utils/CommICL'
let ICL = CommICL
import { BIPUtils } from "@/utils/BaseUtil";
let baseTool = BIPUtils.baseUtil;

import { State, Action, Getter, Mutation } from "vuex-class";
import {BipMenuBtn} from '@/classes/BipMenuBtn'
import { Cells } from "@/classes/pub/coob/Cells";
import CDataSet from "@/classes/pub/CDataSet";
import BipMenuBar from "@/classes/pub/BipMenuBar"; 
import CCliEnv from "@/classes/cenv/CCliEnv";
import { BipLayout } from "@/classes/ui/BipLayout";
import QueryEntity from "@/classes/search/QueryEntity";
import CRecord from '../../../classes/pub/CRecord';
import CData from '../../../classes/pub/CData';
import { Menu } from '../../../classes/Menu';
import BipLog from '@/components/file/BipLog.vue';
let _ = require('lodash');
@Component({
    components: { BipMenuBarUi,BipStatisticsDlog,BipStatisticsChart,BipMenuBtnDlg,ImExFile,BipMapShow,BipLog}
})
export default class CUnivSelect extends Vue {
    @Prop() uriParams?: URIParams;
    @Prop() params:any;
    fullscreenLoading: boolean = false;
    cells: Array<Cells> = new Array<Cells>();
    mbs: BipMenuBar = new BipMenuBar(0);
    dsm: CDataSet = new CDataSet(null);
    dsm_cont: CDataSet = new CDataSet(null);
    ds_ext: Array<CDataSet> = Array<CDataSet>();
    lay: BipLayout = new BipLayout("");
    env: CCliEnv = new CCliEnv();
    listIndex: number = -1;
    qe: QueryEntity = new QueryEntity("","");
    TJ :boolean = false;//是否是统计图
    TJDlog :boolean = false;//是否显示统计dlog
    Statistics:any=null;//统计条件集
    pmenuid:string = "";
    handleSizeChangeBusID:number = 0
    handleCurrentChangeBusID:number = 0
    initShowChar:boolean = false;
    biType?:string;
    config:any={};
    nodeId:string = '';
    CondiyionShow:boolean = true;
    isMap:boolean = false;      //是否是地图页面
    isShowMap:boolean = false;  //是否是显示地图

    @State("aidValues", { namespace: "insaid" }) aidValues: any;
    @Action("fetchInsAid", { namespace: "insaid" }) fetchInsAid: any;
    @Mutation("setAidValue", { namespace: "insaid" }) setAidValue: any;
    @Mutation("setAidInfo", { namespace: "insaid" }) setAidInfo: any;
    async initUI() {
        if (this.uriParams&&this.uriParams.pcell) {
            let pcell = this.uriParams.pcell
            let drId = this.uriParams.pbds.importCellId;
            if(drId){
                this.nodeId = drId.split(';')[0];
            }
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
                if(this.uriParams && this.uriParams.pbds.importCellId){
                    let btn = new BipMenuBtn(ICL.B_CMD_UPFILE,"导入")
                    btn.setIconFontIcon('ruku');
                    this.mbs.menuList.push(btn);
                    let btn_log = new BipMenuBtn(ICL.B_CMD_UPFILE_LOG,"日志")
                    btn_log.setIconFontIcon('shuji');
                    this.mbs.menuList.push(btn_log)
                }
                let _isMp = false;
                if(this.uriParams && this.uriParams.pbds.ismap){
                    _isMp = JSON.parse(this.uriParams.pbds.ismap)
                }
                if(_isMp){
                    this.isMap = true;
                    this.isShowMap = true;
                    let btn = new BipMenuBtn(ICL.B_CMD_SHOWMAP,"地图/列表")
                    btn.setIconFontIcon('icon-ditu');
                    this.mbs.menuList.push(btn)
                }
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
        console.log("mounted")
        this.config['type']=2;
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
        // let he = document.documentElement.clientHeight;
        // console.log('height:'+he)
        // let ses:any = this.$refs.se
        // console.log(ses)
        // let height= ses.offsetHeight;
        // console.log('ses height:'+height,he-height)
        if(!this.params || !this.params.method){ 
            if(this.uriParams && this.uriParams.pbds){
                if(this.uriParams.pbds.polnk){
                    this.dsm.polnk = this.uriParams.pbds.polnk;
                }
            }
            let bok = this.checkNotNull(this.dsm_cont,false); 
            if(bok)
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
        let pbds = this.env.uriParams.pbds;
        if(pbds.layout && pbds.layout == 'card'){
            let mb:any = this.$refs['mb'];
            if(mb){
                mb.ReportTableShape();
                this.$bus.$emit('ReportTableShape',[this.env.uriParams.pbuid,this.mbs,true])
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
                let canFind = true;
                for(var i=0;i<this.dsm_cont.ccells.cels.length;i++){
                    let cel = this.dsm_cont.ccells.cels[i];
                    if((cel.attr & 0x800)>0){
                        let val = this.dsm_cont.currRecord.data[cel.id]
                        if(!val){
                            canFind = false;
                        }
                    }
                }
                if(canFind){
                    this.find();
                }else{
                    setTimeout(() => {
                        this.find();
                    }, 500);
                }
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
            if(!this.dsm.currRecord || !this.dsm.currRecord.data)
                return;
            let cc = JSON.stringify(this.dsm.currRecord.data);
            if(cc.length>2){
                setTimeout(() => {
                    let dia: any = this.$refs.bip_dlg;
                    dia.open(btn,this.env); 
                }, 100);
            }
        }else if(cmd === 'DOWNLOADFILE'){
            this.fullscreenLoading=true;
            this.getExcel();
        }else if(cmd === ICL.B_CMD_UPFILE){
            let file:any = this.$refs.imExFile
            file.open()
        }else if(cmd === ICL.B_CMD_UPFILE_LOG){
            let log:any = this.$refs.bipLog
            log.show()
        }else if(cmd === 'ROWCOLUMN'){
            if(this.uriParams){
                this.$bus.$emit('ReportTableShape',[this.uriParams.pbuid,this.mbs])
            }
            let mb:any = this.$refs['mb'];
            if(mb){
                mb.ReportTableShape();
            }
        }else if(cmd === 'ADD'){
            if(this.uriParams){
                let pclass = this.uriParams.plistener;
                let MID_ = this.uriParams.pbds["MID_"]
                if(pclass.indexOf("zxks.cli.SelectAddMenu") !=-1 && MID_){
                    let menu = baseTool.findMenu(MID_);
                    if(menu){
                        let command = menu.command;
                        let p = command.split("&");
                        let pbuid = p[0].split("=")
                        let pmenuid = p[1].split("=")
                        this.$router.push({
                            path:'/layout',
                            name:'layout',
                            query: {pbuid:pbuid[1],pmenuid:pmenuid[1]},
                        })    
                    }else{
                        this.$notify.error( "没有" + MID_ + "菜单权限!" );
                    }
                }
            }
        }else if(cmd === 'CONDITIONSHOW'){
            this.CondiyionShow = !this.CondiyionShow
        }else if(cmd === 'SHOWMAP'){
            await this.find();
            this.isShowMap = !this.isShowMap;
            
        }else if(cmd === ICL.B_CMD_DESKTOPLIST){
            this.TJDlog = true;
            setTimeout(() => {
                let dia: any = this.$refs.bi_tj;
                dia.openDesktopList();
            }, 200);
        }
        if(cmd != 'SHOWMAP'){
            this.isShowMap = false;
        }
    }
    /**导出Excel */
    async getExcel(){
        let file:any = this.$refs.imExFile
        file.close()
        this.fullscreenLoading=true;
        this.qe.pcell = this.dsm.ccells.obj_id
        this.qe.tcell = this.dsm_cont.ccells.obj_id
        this.qe.type = 1
        if(this.biType == "SEL")
            this.qe.cont = JSON.stringify(this.dsm_cont.currRecord.data);
        else if(this.biType == "RPT" || this.biType == "SQL"){
            this.qe.type = 2
            this.qe.cont = JSON.stringify(this.dsm_cont.currRecord);
        }
        this.qe.oprid = 13
        this.qe.page.pageSize = 20
        setTimeout(() => {
            this.fullscreenLoading=false;
        }, 6000);
        var res = await tools.queryExcel(this.qe,this.biType);
        this.fullscreenLoading=false;
        const content = res.data;
        let me:Menu = baseTool.findMenu(this.$route.query.pmenuid+'');
        let title = "文件导出";
        if(me !=null)
            title = me.menuName;
        this.exportFilesServ(content,title);
    }
    /**导出Excel */
    exportFilesServ(content:any,title:string){
      const blob = new Blob([content]);
      const fileName = title+'.xls'
      if ('download' in document.createElement('a')) { // 非IE下载
        const elink = document.createElement('a')
        elink.download = fileName
        elink.style.display = 'none'
        elink.href = URL.createObjectURL(blob)
        document.body.appendChild(elink)
        elink.click()
        URL.revokeObjectURL(elink.href) // 释放URL 对象
        document.body.removeChild(elink)
      } else { // IE10+下载
        navigator.msSaveBlob(blob, fileName)
      }
    }
    find(){
        let bok = this.checkNotNull(this.dsm_cont); 
        if(!bok)
            return ; 
        this.dsm.clear()
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
        if(this.isMap){
            this.qe.page.pageSize = 50000;
            this.qe.page.currPage = 1;
        }
        this.findServerData(this.qe);
    }
    //条件非空校验
    checkNotNull(cds:CDataSet,showMsg:boolean=true):boolean{ 
        let bok = true;
        cds.ccells.cels.forEach(item => {
            if (item.unNull&&bok) {
                let vl = null; 
                if(cds.currRecord.data[item.id]!=null)
                    vl = cds.currRecord.data[item.id]+'';
                if (!vl) {
                    if(showMsg)
                    this.$notify.warning( "【" + item.labelString + "】不能为空!");
                    bok =  false;
                    return false;
                }
            }
        }); 
        return bok;
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
                this.getCRecordByPk2();
            }).catch(err=>{
                this.fullscreenLoading = false
                this.$notify.error(err+";CUnivSelect findServerData")
            });
        }else if(this.biType == "RPT"){
            queryCont.type = 2
            this.dsm.queryRPTData(queryCont).then(res=>{
                this.processingData(res,"RPT");
            }).catch(err=>{
                this.fullscreenLoading = false
                this.$notify.error(err+";CUnivSelect findServerData")
            });
        }else if(this.biType == "SQL"){
            queryCont.type = 3
            this.dsm.queryRPTData(queryCont).then(res=>{
                this.processingData(res,"RPT");
            }).catch(err=>{
                this.fullscreenLoading = false
                this.$notify.error(err+";CUnivSelect findServerData")
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
            cd.sumData = retdata.sumData;
            let page = retdata.page; 
            this.dsm.setCData(cd)
            this.dsm.index = (page.currPage - 1) * page.pageSize;
        }else{
            this.$notify.error(data)
        }
        this.$bus.$emit("findBtnClick",this.dsm.ccells.obj_id)
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

        this.qe.pcell = this.dsm.p_cell
        this.qe.tcell = this.dsm_cont.ccells.obj_id
        console.log('handleSizeChange',value)
        if(this.biType == "SEL")
            this.qe.cont = JSON.stringify(this.dsm_cont.currRecord.data);
        else if(this.biType == "RPT" || this.biType == "SQL"){
            this.qe.cont = JSON.stringify(this.dsm_cont.currRecord);
        }
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
        this.qe.pcell = this.dsm.p_cell
        this.qe.tcell = this.dsm_cont.ccells.obj_id
        console.log('handleCurrentChange',value)
        // this.$emit('handleCurrentChange',value)
        if(this.biType == "SEL")
            this.qe.cont = JSON.stringify(this.dsm_cont.currRecord.data);
        else if(this.biType == "RPT" || this.biType == "SQL"){
            this.qe.cont = JSON.stringify(this.dsm_cont.currRecord);
        }
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
    goTable(){
        this.TJ = false;
        this.initShowChar = false;
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
                    btn1.setIconFontIcon(cc.split(",")[1])
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
                console.log("BL")
                if(JSON.stringify(this.params.jsontj).length >2){
                    this.dsm_cont.currRecord.data = this.params.jsontj;
                    this.find();
                    let cc:any = this.$refs['childChart'];
                    if(cc){
                        if(cc instanceof  Array)
                        {
                            cc = cc[0]
                        }
                        cc.searchData();
                    }
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

    @Watch('env.dsmcurr')
    envCurrChange(){
        this.dsm = this.env.dsmcurr;
        let data = this.env.ds_cont.currRecord.data;
        if(data){
            let b = false;
            _.forEach(data,(v:any,k:any) => {
                if(v && v.length>0){
                    b =true;
                }
            });
            if(this.dsm.cdata.data.length==0 && b){
                this.qe.page.currPage =1;
                let bok = this.checkNotNull(this.dsm_cont,false); 
                if(bok)
                    this.find();
            }
        }
    }

    /**
     * DLG 弹出框后重新查询
     */
    Recheck(res:any){
        if(res && res.type=='imp'){
            let imp_batch = res.imp_batch;
            if(imp_batch && imp_batch>1){
                this.dsm_cont.currRecord.data['imp_batch'] = imp_batch;
            }
        }
        this.find()
        setTimeout(() => {
            this.dsm_cont.currRecord.data['imp_batch'] = null;
        }, 1000);
    }

    getCRecordByPk2(value:any=null){
        if(this.dsm){
            if(value == null && this.dsm.ds_sub && this.dsm.ds_sub.length>0){
                this.getCRecordByPk(this.dsm.currRecord)
            }else if(value!=null && this.dsm.ds_sub && value.dsm.ds_sub.length>0){
                this.getCRecordByPk(value.dsm.currRecord)
            }
        }
    }
    /**
     * @description 根据主键获取记录
     * @param crd 查询条件
     */
    async getCRecordByPk(crd: CRecord) {
        console.log(crd)
        if (crd && (crd.c_state == undefined || crd.c_state == 0)) {
            this.qe.pcell = this.dsm.p_cell
            this.qe.tcell = this.dsm.ccells.obj_id
            this.qe.oprid = 15;
            this.qe.cont = JSON.stringify(crd.data);
            this.qe.values = [];
            let vv = await this.findDataFromServe(this.qe);
            console.log(vv)
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

    /** 进行排序 */
    sortChange(orderby:string){
        this.qe.orderBy=orderby;
        this.find();
    }
}
</script>
