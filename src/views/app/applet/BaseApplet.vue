<template>
    <el-row v-loading.fullscreen.lock="fullscreenLoading">
        <template v-if="mbs&&mbs.initOK">
            <bip-menu-bar-ui ref="mb" :mbs="mbs" :cds="dsm" @invokecmd="invokecmd"></bip-menu-bar-ui> 
        </template>
        <template v-if="searchdia">
            <bip-search-dialog ref="se" :cds_cont="dsm" @makeOK="searchfindData"></bip-search-dialog>
        </template>
        <div class="bip-main-container" v-if="lay.binit">            
            <el-scrollbar :style="style">
                <el-form @submit.native.prevent label-position="right" label-width="120px">
                    <base-layout v-if="lay.binit" :layout="lay" :env="env" @handleCurrentChange="handleCurrentChange" @handleSizeChange="handleSizeChange"></base-layout>
                </el-form>
            </el-scrollbar>
        </div>
       <bip-work ref="work" @checkOK="checkOK"></bip-work>
       <bip-work-process ref="work_process"></bip-work-process>
        <template>
            <bip-menu-btn-dlg ref="bip_base_dlg" @selData="refreshCurrent" @saveData="saveData"></bip-menu-btn-dlg> <!--  @Recheck="Recheck" -->
            <applet-list-dlg ref ="bip_applet_list_dlg" @selectRow="selectRow"></applet-list-dlg>
        </template>
    </el-row>
    
</template>
<script lang="ts">
import { State, Action, Getter, Mutation } from "vuex-class";
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import { BIPUtil } from "@/utils/Request";
import { CommICL } from "@/utils/CommICL";
import BipMenuBarUi from "@/components/menubar/BipMenuBarUi.vue";
import BipMenuBtnDlg from '@/components/dlgbtn/BipMenuBtnDlg.vue';
import AppletListDlg from '@/components/appletList/AppletListDlg.vue'
import { URIParams } from "@/classes/URIParams";
import { BipMenuBtn } from "@/classes/BipMenuBtn";
import { Cells } from "@/classes/pub/coob/Cells";
import BipLayCells from "@/classes/ui/BipLayCells";
import CDataSet from "@/classes/pub/CDataSet";
import BipMenuBar from "@/classes/pub/BipMenuBar";
import CCliEnv from "@/classes/cenv/CCliEnv";
import CeaPars from "@/classes/cenv/CeaPars";
import { BipLayout } from "@/classes/ui/BipLayout";
import QueryEntity from "@/classes/search/QueryEntity";
import DataCache from "@/classes/DataCache";
import PageInfo from "@/classes/search/PageInfo";
import BipWork from '@/components/cwork/BipWork.vue';
import BipWorkProcess from '@/components/cwork/BipWorkProcess.vue';
import { stringify } from 'querystring';
import CRecord from '../../../classes/pub/CRecord';
import CData from '../../../classes/pub/CData';
import { clear } from 'xe-utils/methods';
import { t } from 'vxe-table';
let icl = CommICL;
let tools = BIPUtil.ServApi
@Component({
    components: { BipMenuBarUi,  BipWork ,BipWorkProcess ,BipMenuBtnDlg,AppletListDlg}
})
export default class BaseApplet extends Vue{
    @Prop() uriParams?: URIParams;
    @Prop() params:any;
    @Prop() height!:number;
    @Provide() cells: Array<Cells> = new Array<Cells>();
    @Provide() mbs: BipMenuBar = new BipMenuBar(0);
    @Provide() dsm: CDataSet = new CDataSet(null);
    @Provide() dsm_cont: CDataSet = new CDataSet(null);
    @Provide() ds_ext: Array<CDataSet> = Array<CDataSet>();
    @Provide() lay: BipLayout = new BipLayout("");
    @Provide() env: CCliEnv = new CCliEnv();
    @Provide() fullscreenLoading: boolean = false;
    @Provide() searchdia: boolean = false;
    @Provide() qe: QueryEntity = new QueryEntity("","");
    // @Provide() dataCache: Array<DataCache> = [];
    @Provide() listIndex: number = -1;
    @Provide() cea:CeaPars = new CeaPars({});
    @Provide() pmenuid:string ='';
    @Provide() oprid:number = 13
    @Provide() style:string='';
    @Provide() switchBusID:number=0;
    @Provide() rowClickBusID:number =0;
    @Provide() switchHide:any={};
    @Provide() switchShow:any={};

    @State("aidValues", { namespace: "insaid" }) aidValues: any;
    @Action("fetchInsAid", { namespace: "insaid" }) fetchInsAid: any;
    @Mutation("setAidValue", { namespace: "insaid" }) setAidValue: any;
    @Mutation("setAidInfo", { namespace: "insaid" }) setAidInfo: any;
    async invokecmd(btn:any) {
        let cmd = btn.cmd
        console.log(cmd);
        if (cmd === "ADD") {
            if ((this.dsm.currRecord.c_state & 2) > 0) {
                this.$alert(
                    `当前数据没有保存，请先保存当前行数据`,
                    `系统提醒`,
                    { type: "info" }
                ).catch(() => {
                    console.log("取消");
                });
                return;
            }
            if(this.dsm.currRecord.c_state&icl.R_INSERT){
                return 
            }
            this.dsm.createRecord();
            if(this.dsm.ds_sub){
                for(var i=0;i<this.dsm.ds_sub.length ;i++){
                    this.dsm.ds_sub[i].clear();
                }
            }
            this.setListMenuName();
            this.$bus.$emit("datachange",this.dsm.ccells.obj_id)
        } else if (cmd === "SAVE") {
            await this.saveData();
        } else if (cmd === "FIND") {
            this.searchdia = true;
            this.qe.oprid = this.oprid;
            this.qe.page.currPage = 1;
            this.qe.page.index = 0;
            setTimeout(() => {
                let dia: any = this.$refs.se;
                dia.open();
            }, 100);
        } else if (cmd === "LIST") {
            let dia: any = this.$refs.bip_applet_list_dlg;
            dia.open(this.dsm,this.qe);
        } else if (cmd === "NEXT") {
            await this.getNextOrPrior(true);
        } else if (cmd === "PRIOR") {
            await this.getNextOrPrior(false);
        } else if (cmd === "LAST") {
            let page = this.qe.page;
            let _idx = page.total - 1;
            if (page.total > 0) {
                this.JumpToIndexCRecord(_idx);
            }
        } else if (cmd === "FIRST") {
            if (this.dsm.index !== 0) 
            this.JumpToIndexCRecord(0);
        }else if(cmd === "DEL"){
            let states = this.dsm.currRecord.c_state
            if((states&icl.R_INSERT)>0){
                //新建状态
                this.dsm.removeIndex(this.dsm.index)
            }else{
                let candel = this.dsm.canDel()
                if(candel){
                    let crd = this.dsm.currRecord
                    let _idx = this.dsm.ccells.x_pk;
                    let id = this.dsm.ccells.cels[_idx].id
                    let sid = crd.data[id]
                    this.$confirm(`确定删除当前${sid}记录吗？`,
                        `系统提醒`,
                        { type: "warning" }
                    ).then(()=>{
                        this.dsm.currRecord.c_state = 4
                        this.fullscreenLoading = true
                        this.dsm.saveData(this.uriParams?this.uriParams.pflow:'').then(res=>{
                            if(res.data.id ==0){
                                this.dsm.cdata.data.splice(this.dsm.page.index,1); 
                                if( this.dsm.cdata.data.length ==0){
                                    this.dsm.createRecord();
                                    if(this.dsm.ds_sub){
                                        for(var i=0;i<this.dsm.ds_sub.length ;i++){
                                            this.dsm.ds_sub[i].clear();
                                        }
                                    }
                                } else {
                                    if(this.dsm.page.index >= this.dsm.cdata.data.length){
                                        this.findData(true,this.dsm.cont)
                                    }else{
                                        this.dsm.currRecord = this.dsm.cdata.data[this.dsm.page.index]
                                    }
                                }
                                this.$bus.$emit("datachange",this.dsm.ccells.obj_id)
                                this.dsm.page.total--;
                                this.setListMenuName();
                            }else{
                                this.$notify.error(res.data.message);
                            }
                        }).finally(()=>{
                            this.fullscreenLoading = false
                        })
                    }).catch(() => {
                        return;
                    });
                }
            }

        }else if(cmd === "CHECK"){
            // tools.test();
        }else if(cmd=== "SUBMIT"){
            this.submint();
        }else if(cmd === 'CHECKPROCESS'){
            let crd:any = this.dsm.currRecord.data;
            if(this.dsm.opera){
                var state = crd[this.dsm.opera.statefld];
                var params = {
                    sid: crd[this.dsm.opera.pkfld],
                    sbuid: crd[this.dsm.opera.buidfld],
                    statefr: state,
                    stateto: state,
                    tousr: ""
                };
                var ceaParams = new CeaPars(params);
                let wp:any = this.$refs['work_process'];
                if(wp)
                    wp.open(ceaParams);
            }
        }else if(cmd == 'DLG'){
            let cc = JSON.stringify(this.dsm.currRecord.data);
            if(cc.length>2){
                setTimeout(() => {
                    let dia: any = this.$refs.bip_base_dlg;
                    dia.open(btn,this.env); 
                }, 100);
            }
        }else if(cmd == 'COPY'){
            if ((this.dsm.currRecord.c_state & 2) > 0) {
                this.$alert(
                    `当前数据没有保存，请先保存当前行数据`,
                    `系统提醒`,
                    { type: "info" }
                ).catch(() => {
                    console.log("取消");
                });
                return;
            }
            var currRecord = this.dsm.currRecord;
            let u = window.sessionStorage.getItem('user');
            if(u){
                this.dsm.currRecord = this.dsm.createRecord();
                this.dsm.currRecord.c_state=3; 
                let user = JSON.parse(u)
                for(var i=0;i<this.dsm.ccells.cels.length;i++){
                    let cell = this.dsm.ccells.cels[i]
                    if(!cell.initValue){
                        this.dsm.currRecord.data[cell.id] = currRecord.data[cell.id]
                    }
                }
                this.dsm.cdata.data.push(this.dsm.currRecord)
            }
        }
    }

    checkOK(state:number|string){
        let i = this.dsm.i_state;
        if(i>-1){
            this.dsm.currRecord.data[this.dsm.ccells.cels[i].id] = state
        }
        
    }


//#region 根据主键获取记录

    /**
     * @description 根据主键获取记录
     * @param crd 查询条件
     */
    async getCRecordByPk(crd: CRecord) {
        console.log(crd)
        if (crd.c_state == undefined || crd.c_state == 0) {
            this.qe.oprid = 15;
            this.qe.cont = JSON.stringify(crd.data);
            this.qe.values = [];
            let vv = await this.findDataFromServe(this.qe);
            console.log(vv)
            if (vv != null) {
                this.dsm.currRecord = vv.data[0]
                this.dsm.setRecordAtIndex(vv.data[0],this.dsm.index)
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
//#endregion
//#region 页面导航
    /**
     * @param {number} index 下标，从0开始
     * @param {Number} size 每页的条数
     */
    getPageInfo(index: number, size: number): PageInfo {
        let page = new PageInfo(1, size);
        page.currPage = index==0?1: Math.floor(index / size) + 1;
        page.index = index==0?0:index % size;
        return page;
    }
    selectRow(rowID:number){
        this.JumpToIndexCRecord(rowID);
    }
    /**
     * @description 数据导航条，上一条，下一条
     * @param next 是否是下一条，如果是为true，反之false
     */
    async getNextOrPrior(next: boolean = false) {
        let page = this.dsm.page;
        let currIndex = (page.currPage-1)*page.pageSize+page.index;
        let total = this.qe.page.total - 1;
        let _idx = next ? currIndex + 1 : currIndex - 1; //下一条下标或者是上一条下标
        if (_idx > total || _idx < 0) {
            console.log("到头了");
            return;
        }
        this.JumpToIndexCRecord(_idx);
    }
    /**
     * @description 跳转到第几条记录
     * @param _idx 跳转到第几条
     */
    async JumpToIndexCRecord(_idx: number) {
        let crd = this.caclPageAndCRecord(_idx);
        console.log('跳转'+_idx,crd)
        if(crd){
            this.dsm.currRecord  =crd
            if(this.dsm.ds_sub.length>0 && this.dsm.currRecord.subs){
                this.getChildData();
            }
        }else{
            let vv = await this.findDataFromServe(this.qe);
            if (vv && vv.data.length > 0) {
                console.log(vv);
                // let dc = new DataCache(this.dsm.page.currPage, vv);
                // console.log(dc, "缓存数据");
                // this.dataCache.push(dc);
                this.dsm.setValues(vv.data, true);
                crd = vv.data[vv.page.index];
                this.dsm.currRecord = crd
                this.getChildData();
            }
        }
        this.setListMenuName();
        //设置当前记录审批流程信息
        if(crd != null && this.dsm.opera){
            let params = {
                sid: crd.data[this.dsm.opera.pkfld],
                sbuid: crd.data[this.dsm.opera.buidfld],
                statefr: crd.data[this.dsm.opera.statefld],
                stateto: crd.data[this.dsm.opera.statefld],
                spuserId: ""
            }  
            this.cea = new CeaPars(params);
            this.dsm.ceaPars = this.cea;
        }
        this.$bus.$emit("datachange",this.dsm.ccells.obj_id)
    }
//#endregion
//#region 计算页码和获取缓存记录，记录有可能不存在
    /**
     * @param _idx 数据下标
     * @description 根据下标计算页码信息，并且从缓存中获取行记录，行记录可能不存在
     *
     */
    caclPageAndCRecord(_idx: number) {
        //计算或者获取当前页次
        console.log('数据下标:'+_idx)
        let page = this.getPageInfo(_idx, this.qe.page.pageSize);
        
        let p0 = this.dsm.page
        this.dsm.index = page.index
        if(p0.currPage == page.currPage){
            this.dsm.page.index = page.index;
            return this.dsm.cdata.getDataAtIndex(page.index);
        }else{
            this.dsm.page.index = page.index;
            this.dsm.page.currPage = page.currPage
            // let _idex = this.dataCache.findIndex(item => {
            //     return item.page == page.currPage;
            // });
            // if(_idex>-1){
            //     let cdata:CData = this.dataCache[_idex].values
            //     console.log(cdata,'fdfds');
            //     this.dsm.setCData(cdata);
            //     return cdata.getDataAtIndex(page.index);
            // }else{
            //     this.qe.oprid = this.oprid;
            //     if(this.oprid == 13)
            //         this.qe.cont = JSON.stringify(this.dsm.cont);
            //     else
            //         this.qe.cont = this.dsm.cont;
            // }
            this.qe.oprid = this.oprid;
                // if(this.oprid == 13){
                //     let cont = this.qe.cont==null?"":JSON.stringify(this.dsm.cont);
                //     this.qe.cont = cont;
                // } else{
                //     this.qe.cont = this.dsm.cont;
                // }
            return null;
        }
        return null;
    }
    /**
     * 获取当前主表对应的子表信息
     */
    async getChildData(){
        if(this.dsm.ds_sub && this.dsm.ds_sub.length>0){
                let qq =JSON.parse(JSON.stringify(Object.assign({},this.qe)));
                qq.cont = this.dsm.currRecord.data;
                let res = await tools.queryChild(qq);
                if(res.data.id == 0){
                    let data = res.data;
                    let vv:CData = data.data.data;
                    let child = vv.data[0].subs;
                    for(var z=0;z<child.length;z++){
                        let cd :CData = this.initCData(child[z])
                        cd.page.currPage =1;
                        cd.page.total = cd.data.length
                        for(var j=0;j<this.dsm.ds_sub.length;j++){
                            if(this.dsm.ds_sub[j].cdata.obj_id == cd.obj_id){
                                this.dsm.currRecord.subs[j] = cd;
                            }
                        }
                    }
                }
            this.setSubData();
        }
    }
    
    async searchfindData(bok: boolean, cont: any) {
        this.oprid = 13;
        await this.findData(bok, cont); 
    }
    /**
     * 点击按钮执行后端程序后刷新当前单据
     */
    async refreshCurrent(){
        let pkindex = this.dsm.ccells.pkindex
        let cont:any ={};
        if(pkindex){
            for(var i=0;i<pkindex.length;i++){
                let index = pkindex[i];
                let cel = this.dsm.ccells.cels[index];
                cont[cel.id]= this.dsm.currRecord.data[cel.id];
            }
        }
        await this.findData(true,cont);
        // this.JumpToIndexCRecord(0);
    }
//#endregion
//#region 查询数据
    /**
     * @description 查询按钮获取数据
     * @param bok 是否确定查询
     * @param cont 查询条件对象
     */
    async findData(bok: boolean, cont: any) {
        console.log("单据查询！")
        // console.log(bok,cont,this.dsm.ccells.obj_id)
        this.dsm.clear();
        if(this.dsm.ds_sub && this.dsm.ds_sub.length>0){
            for(var i=0;i<this.dsm.ds_sub.length;i++){
                this.dsm.ds_sub[i].clear();
            } 
        }
        if (!bok) {
            return;
        }
        // this.dsm.cont = cont;
        this.qe.oprid = this.oprid;
        if (!this.qe.pcell || this.qe.pcell === "")
            this.qe = new QueryEntity(
                this.dsm.p_cell,
                this.dsm.p_cell,
                JSON.stringify(cont)
            );
        else {
            if (cont) this.qe.cont = JSON.stringify(cont);
        }
        if(this.oprid == 14 ){
            this.qe.oprid = this.oprid;
            this.qe.cont = cont;
        }
        // console.log(this.qe,'qe')
        // this.dataCache = []
        let vv:CData = await this.findDataFromServe(this.qe);
        if (vv != null) { 
            // this.qe.values = vv.data;
            this.qe.page = vv.page;
            console.log('服务器获取数据',vv)
            this.dataLoaded(this.qe,vv);
            this.setListMenuName();
            this.$bus.$emit('dataloadchange')
            
            this.$bus.$emit("datachange",this.dsm.ccells.obj_id)
            if(this.dsm.ds_sub && this.dsm.ds_sub.length>0){
                for(var i=0;i<this.dsm.ds_sub.length;i++){
                    this.$bus.$emit("datachange",this.dsm.ds_sub[i].ccells.obj_id)
                }
                this.getChildData();
            }
        }else{
            this.$notify.info("没有查询到数据");
            this.$bus.$emit('dataloadchange')
        }
        let crd = this.dsm.currRecord;
        if(crd != null && this.dsm.opera){
            let params = {
                sid: crd.data[this.dsm.opera.pkfld],
                sbuid: crd.data[this.dsm.opera.buidfld],
                statefr: crd.data[this.dsm.opera.statefld],
                stateto: crd.data[this.dsm.opera.statefld],
                spuserId: ""
            }  
            this.cea = new CeaPars(params);
            this.dsm.ceaPars = this.cea;
        }
        return vv;
    }

    /**
     * @description 数据从新加载
     * @param vv 查询返回的结果集
     */
    dataLoaded(vv: QueryEntity,cd:CData) {
        if ((vv.oprid == 13) || (vv.oprid == 14)) {
            let page = cd.page;
            if(page.total >0){
                this.dsm.setCData(cd);
                this.dsm.index = page.index;
                this.setSubData()
            }
        } else if (vv.oprid == 15) {
            let rec: any = vv.values[0]; //后台返回的数据当前行
            let page = this.qe.page;
            this.dsm.index = page.index;
            this.dsm.page = Object.assign({},page);
            console.log(JSON.stringify(page));
            let i = vv.page.index; //数据的第几个
            // let vr = this.dataCache.find(item => {
            //     return item.page == page.currPage;
            // });
            // // console.log(vr);
            // let _ii = this.dataCache.findIndex(item => {
            //     return item.page == page.currPage;
            // });
            // if (_ii !== -1) {
            //     let v = this.dataCache[_ii];
            //     // console.log("缓存第几个," + _ii);
            //     v.values = cd
            // }
            this.dsm.setRecordAtIndex(rec, i);
            this.dsm.currRecord = rec;
            // this.setSubData()
        }
    }

    setSubData(){
        let n = this.dsm.ds_sub.length
        for(let i=0;i<n;i++){
            let cds1 = this.dsm.ds_sub[i]
            cds1.clear();
            for(let j=0;this.dsm.currRecord.subs&&j<this.dsm.currRecord.subs.length;j++){
                let oneSubs:any = this.dsm.currRecord.subs[j]
                if(oneSubs.obj_id == cds1.ccells.obj_id){
                    let vals = oneSubs.data;
                    if(oneSubs){
                        cds1.clear();
                        cds1.setCData(oneSubs)
                        // cds1.page.total = vals.length||0
                        this.$bus.$emit("datachange", cds1.p_cell);
                    }
                }
            }
        }
    }
//#endregion
//#region 服务端获取数据
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
//#endregion
//#region 找到按钮的下标，设置list按钮名称
    findListMenuIndex(cmd: string): number {
        let index = -1;
        return this.mbs.menuList.findIndex(item => {
            return item.cmd === cmd;
        });
    }

    setListMenuName() {
        if (this.listIndex == -1) {
            this.listIndex = this.findListMenuIndex("LIST");
        }
        if(this.listIndex>-1){
            let mm = this.mbs.menuList[this.listIndex];
            let page = this.dsm.page;
            let currIndex = (page.currPage-1)*page.pageSize+page.index;
            mm.name = currIndex + 1 + "/" + page.total;
        }

    }
//#endregion
//#region 保存数据
    async saveData() {
        let bok = this.checkNotNull(this.dsm); 
        if(!bok)
            return ;        
        //保存数据
        if ((this.dsm.currRecord.c_state & icl.R_EDITED) > 0) {
            this.fullscreenLoading = true;
            this.dsm.saveData(this.uriParams?this.uriParams.pflow:'').then(res=>{
                this.fullscreenLoading = false;
                if (res.status == 200) {
                    let data = res.data;
                    if (data.id == 0) {
                        this.dsm.currRecord.oldpk=[];
                        let ord: any = data.data; 
                        this.dsm.currRecord.data = Object.assign(
                            this.dsm.currRecord.data,
                            ord
                        );
                        this.dsm.setState(icl.R_POSTED);
                        if(data.message == '操作成功！'){
                            this.$message.success(data.message);
                        }else{
                            this.$message.warning(data.message);
                        }
                        if(this.uriParams){
                            if((this.uriParams.pattr & CommICL.B_IWORKEA)>0){
                                this.submint();
                            }
                        }
                    }else{
                        this.$message.warning(data.message);
                    }
                } else {
                }   
            }).catch(err=>{
                this.fullscreenLoading = false;
                this.$message.error(err);
            });
        } else {
            console.log(
                this.dsm.currRecord.c_state,
                this.dsm.currRecord.c_state & icl.R_EDITED
            );
            return;
        }
    }
    /**
     * 审批流提交
     */
    submint(){
        if(this.dsm.opera){
            if(this.dsm.isPosted()){
                //可以提交
                let crd = this.dsm.currRecord
                let params = {
                    sid: crd.data[this.dsm.opera.pkfld],
                    sbuid: crd.data[this.dsm.opera.buidfld],
                    statefr: crd.data[this.dsm.opera.statefld],
                    stateto: crd.data[this.dsm.opera.statefld],
                    sorg:crd.data[this.dsm.opera.sorgfld],
                    spuserId: ""
                }  
                this.cea = new CeaPars(params)
                this.fullscreenLoading = true
                tools.getCheckInfo(this.cea,33).then((res:any)=>{
                    if(res.data.id==0){
                        let data = res.data.data.info
                        let work:any = this.$refs.work;
                        let smakefld:string='';
                        if(this.dsm.opera){
                            if(this.dsm.opera.smakefld){
                                smakefld = crd.data[this.dsm.opera.smakefld];
                            }
                        }
                        this.dsm.ceaPars = this.cea
                        work.open(data,this.cea,smakefld);
                    }
                }).catch(err=>{
                    this.$notify.error(err)
                }).finally(()=>{
                    this.fullscreenLoading = false
                });
            }
        }
        if(this.dsm.isPosted()){
            console.log('保存过了')
        }else{
            console.log('没保存')
            this.$notify.warning("请先保存数据！");
        }
    }

    checkNotNull(cds:CDataSet):boolean{
        console.log("非空校验")
        let bok = true;
        cds.ccells.cels.forEach(item => {
            if (item.unNull&&bok) {
                let vl = null;
                let hide:any = [];
                for(var key in this.switchHide){
                    if(key.indexOf(cds.ccells.obj_id+"_")!=-1){
                        hide = hide.concat(this.switchHide[key])
                    }
                }
                if(cds.currRecord.data[item.id]!=null)
                    vl = cds.currRecord.data[item.id]+'';
                // if(item.type<5){
                //     if(!vl){
                //         vl = 0+'';
                //     }
                // }
                if (!vl && hide.indexOf(item.id) == -1) {
                    this.$notify.warning( "【" + item.labelString + "】不能为空!");
                    bok =  false;
                    return false;
                }
            }
        });
        if(bok){
            if (cds.ds_sub.length>0) {
                return this.checkChildNotNull(cds);
        }
      }
        return bok;
    }

    checkChildNotNull(cds:CDataSet):boolean{
        let isok = true;
        cds.ds_sub.forEach(cd0=>{
            if(isok){
                if(cd0.cdata.data.length===0 && !cd0.ccells.unNull){
                    this.$notify.warning( "【" + cd0.ccells.desc + "】不能为空!");
                    isok =  false;
                    return false;
                }else{
                    for(let i=0;i<cd0.cdata.data.length;i++){
                        let crd = cd0.getRecordAtIndex(i);
                        cd0.ccells.cels.forEach(item=>{
                            if(isok&&item.unNull){
                                let vl = crd.data[item.id];+'';
                                if (!vl) {
                                    this.$notify.warning( "子表第"+(i+1)+"行"+item.id+"【" + item.labelString + "】不能为空!");
                                    isok =  false;
                                    return false
                                }
                            }
                        });
                    }
                }
            }
            if(cd0.ds_sub.length>0){
                isok = this.checkChildNotNull(cd0);
            }

        })
        return isok;
    }
//#endregion
//#region 监听URIParams
    // @Watch("uriParams",{deep:true})
    async uriParamsChange() {
        if (this.uriParams&&this.uriParams.pcell) {
            let pcell = this.uriParams.pcell
            let res = await tools.getCCellsParams(pcell)
            this.fullscreenLoading = false;
            let rtn: any = res.data;
            if (rtn.id == 0) {
                let kn: Array<Cells> = rtn.data.layCels;
                this.cells = kn;
                let cds: CDataSet;
                this.dsm = new CDataSet(this.cells[0]);
                this.dsm_cont = new CDataSet(this.cells[0]);
                for (let i = 1; i < this.cells.length; i++) {
                    this.ds_ext[i - 1] = new CDataSet(this.cells[i]);
                }
                this.mbs = new BipMenuBar(this.uriParams.pattr, this.dsm);
                // console.log(this.mbs, "mbs");
                this.listIndex = this.findListMenuIndex("LIST");
                let bipLay = new BipLayout(this.uriParams.playout, this.cells);
                this.lay = bipLay;
                this.env.initInfo(
                    this.uriParams,
                    this.cells,
                    this.mbs,
                    this.dsm,
                    this.ds_ext
                );
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
    getCRecordByPk2(value:any){
        if(this.dsm.ccells){
            if(value.dsm.ccells.obj_id == this.dsm.ccells.obj_id){
                this.dsm.page.index = value.rowIndex
                this.setListMenuName();
                // this.JumpToIndexCRecord(this.dsm.page.index);
            }
        }
    }
    /**
     * 获取自定义按钮
     */
    async initDlgBtn(){
        if(this.uriParams){
            let name = "DLG."+this.uriParams.pbuid;
            let str = name
            // let dlg = await pubMethod.getConstant(str);
            str = icl.AID_KEYCL+str;
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
    created(){
        this.switchBusID = this.$bus.$on('switchChange',this.switchChange)
    }
    async mounted(){
        // console.log(this.uriParams,'bbb')
        if(this.height>0){
            this.style = "margin-bottom:0px;  margin-right: 0px; height:"+(this.height-30)+"px;"
        }else{
             this.style = "margin-bottom:0px;  margin-right: 0px; ";
        }
        this.rowClickBusID = this.$bus.$on("row_click",this.getCRecordByPk2) 
        await this.uriParamsChange()
        if(!this.params || !this.params.method){
            this.dsm.createRecord();
            this.dsm.currRecord.c_state = 1
            if(this.uriParams && this.uriParams.pbds){
                if(this.uriParams.pbds.polnk){
                    this.dsm.polnk = this.uriParams.pbds.polnk;
                }
            }
            if(this.uriParams && this.uriParams.pdata && this.uriParams.pdata.length>1){ 
                this.oprid = 14;
                this.dsm.cont = this.uriParams.pdata;
                await this.findData(true,this.uriParams.pdata); 
            } 
        }else{

            this.pmenuid = this.$route.query.pmenuid+'';
            this.initGetVal();
        } 
        this.initDlgBtn();
    }
    beforeDestroy(){
        this.$bus.$off('switchChange',this.switchBusID)
        this.$bus.$off("row_click",this.rowClickBusID)
    }
    //页面上的Switch值发生变化 0对象编码 1 需要显示的字段  2 需要隐藏的字段
    switchChange(value:any){
        if(this.uriParams && this.cells){
            let uiCell=[];
            let show = value[2].split(",");
            let hide = value[3].split(",");
            this.switchHide[value[0]+"_"+value[1]]=hide;
            this.switchShow[value[0]+"_"+value[1]]=show;

            for(var key in this.switchShow){
                show = show.concat(this.switchShow[key])
            }
            for(var key in this.switchHide){
                hide = hide.concat(this.switchHide[key])
            }


            for(var i=0;i<this.cells.length;i++){
                let cell = this.cells[i]
                if(cell.obj_id == value[0]){
                    for(var j=0;j<cell.cels.length;j++){
                        let cel = cell.cels[j];
                        if((cel.attr&0x400) == 0 && hide.indexOf(cel.id)==-1){
                            uiCell.push(cel);
                        }else{
                            if(show.indexOf(cel.id)>-1){
                                uiCell.push(cel);
                            }
                        }
                    } 
                }
            }
            for(var i=0;i<this.lay.compconfs.length;i++){
                let comp:any = this.lay.compconfs[i];
                if(comp.comp.obj_id == value[0]){
                    comp.comp.uiCels = [];
                    comp.comp.uiCels = uiCell;
                }
            }
        }
    }
    async handleSizeChange(value:number){
        // console.log('handleSizeChange',value)
        this.qe.oprid = this.oprid
        this.qe.type = 0
        this.qe.page.pageSize = value
        this.qe.page.currPage = 1
        // if(this.oprid == 13)
        // this.qe.cont = JSON.stringify(this.dsm.cont);
        // else
        // this.qe.cont = this.dsm.cont;
        let vv = await this.findDataFromServe(this.qe);
        if (vv != null) {
            this.qe.values = vv.data;
            this.qe.page = vv.page;
            // this.qe.values = vv;

            this.dataLoaded(this.qe,vv);
            this.setListMenuName();
        }
    }

    async handleCurrentChange(value:number){
        // console.log('handleCurrentChange',value)
        this.qe.oprid = this.oprid
        this.qe.type = 0
        this.qe.page.currPage = value
        // if(this.oprid == 13)
        // this.qe.cont = JSON.stringify(this.dsm.cont);
        // else
        // this.qe.cont = this.dsm.cont;
        let vv = await this.findDataFromServe(this.qe);
        if (vv != null) {
            // this.qe = vv;
            // this.qe.values = vv.data;
            
            this.qe.page = vv.page;
            this.dataLoaded(this.qe,vv);
            this.setListMenuName();
        }
        this.$bus.$emit("datachange",this.dsm.ccells.obj_id)
    }
    /**
     * dlg弹出框
     * 业务关联
     * BL下钻
     */
    async initGetVal(){
        if(this.params){
            this.oprid = 13;
            this.searchdia = true;
            this.qe.oprid = this.oprid;
            this.qe.page.currPage = 1;
            this.qe.page.index = 0;
            if(this.params.method =='pkfld'){
                let data:any = {};
                data[this.params.pkfld] = this.params.value
                this.findData(true,data);
            }else if(this.params.method =='dlg'){
                console.log(this.params)
                if(JSON.stringify(this.params.jsontj).length >2)
                var cData  = await this.findData(true,this.params.jsontj);
                if(!cData || (cData && cData.page && cData.page.total ==0)){
                    this.dsm.currRecord = new CRecord();
                    this.dsm.createRecord();                   
                    let cell:any = this.dsm.getCdsByObjID(this.params.cellid);
                    if(cell){
                        cell.clear();
                        let cont = this.params.jsoncont;
                        for(var i=0;i<cont.length;i++){
                            let dvl = cont[i];
                            let data:any=cell.createRecord();
                        　　for(var key in dvl){ 
                                data.data[key] = dvl[key]
                        　　}
                        }
                    }
                    this.$bus.$emit("datachange",cell.ccells.obj_id)
                    let pk = this.dsm.ccells.pkindex
                    for(var i=0;i<pk.length;i++){
                        let cel = this.dsm.ccells.cels[pk[i]];
                        if((cel.attr & 0x80 )>0){
                            this.env.dsm.incCalc(this.dsm.ccells,this.dsm.currRecord);
                        }
                    }
                }
            }else if(this.params.method =='BL'){
                if(JSON.stringify(this.params.jsontj).length >2)
                await this.findData(true,this.params.jsontj);
            }
        }
    }

    @Watch('params')
    paramsWatch(){ 
        if(this.pmenuid == this.$route.query.pmenuid){ 
            this.initGetVal();
        }
    }

    @Watch('height')
    heightChanges(){
        if(this.height>0){
            this.style = "margin-bottom:0px;  margin-right: 0px; height:"+(this.height-30)+"px;"
        }else{
             this.style = "margin-bottom:0px;  margin-right: 0px; ";
        }
    }
//#endregion
}
</script>

