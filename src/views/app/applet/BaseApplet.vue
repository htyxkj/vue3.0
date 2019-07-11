<template>
    <el-row v-loading.fullscreen.lock="fullscreenLoading">
        <template v-if="mbs&&mbs.initOK">
            <bip-menu-bar-ui ref="mb" :mbs="mbs" :cds="dsm" @invokecmd="invokecmd"></bip-menu-bar-ui> 
        </template>
        <template v-if="searchdia">
            <bip-search-dialog ref="se" :cds_cont="dsm" @makeOK="findData"></bip-search-dialog>
        </template>
        
        <div class="bip-main-container" v-if="lay.binit">

            <el-scrollbar style="margin-bottom:0px;  margin-right: 0px;">
                <el-form label-position="right" label-width="120px">
                    <base-layout v-if="lay.binit" :layout="lay" :env="env" @handleCurrentChange="handleCurrentChange" @handleSizeChange="handleSizeChange"></base-layout>
                </el-form>
            </el-scrollbar>
            
        </div>
       <bip-work ref="work" @checkOK="checkOK"></bip-work>
    </el-row>
    
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import { BIPUtil } from "@/utils/Request";
import { CommICL } from "@/utils/CommICL";
import BipMenuBarUi from "@/components/menubar/BipMenuBarUi.vue";
import { URIParams } from "@/classes/URIParams";
import { BipMenuBtn } from "@/classes/BipMenuBtn";
import { Cells } from "@/classes/pub/coob/Cells";
import BipLayCells from "@/classes/ui/BipLayCells";
import CDataSet from "@/classes/pub/CDataSet";
import BipMenuBar from "@/classes/pub/BipMenuBar";
import CCliEnv from "@/classes/cenv/CCliEnv";
import CeaPars from "@/classes/cenv/CeaPars";
import Operation from "@/classes/operation/Operation";
import BaseLayout from "@/components/layout/BaseLayout.vue";
import { BipLayout } from "@/classes/ui/BipLayout";
import BipSearchDialog from "@/components/searchdialog/BipSearchDialog.vue";
import QueryEntity from "@/classes/search/QueryEntity";
import DataCache from "@/classes/DataCache";
import PageInfo from "@/classes/search/PageInfo";
import BipWork from '@/components/cwork/BipWork.vue';
let icl = CommICL;
let tools = BIPUtil.ServApi
@Component({
    components: { BipMenuBarUi, BaseLayout, BipSearchDialog,BipWork }
})
export default class BaseApplet extends Vue{
    @Prop() uriParams?: URIParams;
    @Prop() params:any;
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
    @Provide() dataCache: Array<DataCache> = [];
    @Provide() listIndex: number = -1;
    @Provide() cea:CeaPars = new CeaPars({});

    async invokecmd(cmd: string) {
        console.log(cmd);
        if (cmd === "ADD") {
            if ((this.dsm.currRecord.sys_stated & 2) > 0) {
                this.$alert(
                    `当前数据没有保存，请先保存当前行数据`,
                    `系统提醒`,
                    { type: "info" }
                ).catch(() => {
                    console.log("取消");
                });
                return;
            }
            if(this.dsm.currRecord.sys_stated&icl.R_INSERT){
                return 
            }
            this.dsm.createRecord();
            this.setListMenuName();
        } else if (cmd === "SAVE") {
            await this.saveData();
        } else if (cmd === "FIND") {
            this.searchdia = true;
            this.qe.oprid = 13;
            this.qe.page.currPage = 1;
            this.qe.page.index = 0;
            setTimeout(() => {
                let dia: any = this.$refs.se;
                dia.open();
            }, 100);
        } else if (cmd === "LIST") {

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
            if (this.dsm.index !== 0) this.JumpToIndexCRecord(0);
        }else if(cmd === "DEL"){
            console.log('删除')
            let states = this.dsm.currRecord.sys_stated
            if((states&icl.R_INSERT)>0){
                //新建状态
                this.dsm.removeIndex(this.dsm.index)
            }else{
                let candel = this.dsm.canDel()
                if(candel){
                    let crd = this.dsm.currRecord
                    let _idx = this.dsm.ccells.x_pk;
                    let id = this.dsm.ccells.cels[_idx].id
                    let sid = crd[id]
                    this.$alert(`确定删除当前${sid}记录吗？`,
                        `系统提醒`,
                        { type: "warning" }
                    ).catch(() => {
                        console.log("取消")
                    }).then(()=>{
                        this.dsm.currRecord.sys_stated = 4
                        this.fullscreenLoading = true
                        this.dsm.saveData().then(res=>{
                            console.log(res);

                        }).finally(()=>{
                            this.fullscreenLoading = false
                        })
                    });
                }
                
            }

        }else if(cmd === "CHECK"){
            // tools.test();
        }else if(cmd=== "SUBMIT"){
            
            console.log(this.dsm.opera)
            if(this.dsm.opera){
                if(this.dsm.isPosted()){
                    console.log(123)
                    //可以提交
                    let crd = this.dsm.currRecord
                    let params = {
                        sid: crd[this.dsm.opera.pkfld],
                        sbuid: crd[this.dsm.opera.buidfld],
                        statefr: crd[this.dsm.opera.statefld],
                        stateto: crd[this.dsm.opera.statefld],
                        spuserId: ""
                    }  
                    this.cea = new CeaPars(params)
                    console.log(this.cea)
                    this.fullscreenLoading = true
                    tools.getCheckInfo(this.cea,33).then((res:any)=>{
                        if(res.data.id==0){
                            let data = res.data.data.info
                            console.log(data)
                            let work:any = this.$refs.work;
                            let smakefld:string='';
                            if(this.dsm.opera)
                                smakefld = crd[this.dsm.opera.smakefld];
                            work.open(data,this.cea,smakefld);
                        }
                        console.log(res)
                    }).catch(err=>{
                        console.log(err);
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
    }

    checkOK(state:number|string){
        let i = this.dsm.i_state;
        if(i>-1){
            this.dsm.currRecord[this.dsm.ccells.cels[i].id] = state
        }
        
    }


//#region 根据主键获取记录

    /**
     * @description 根据主键获取记录
     * @param crd 查询条件
     */
    async getCRecordByPk(crd: any) {
        if (crd.sys_stated == undefined) {
            this.qe.oprid = 15;
            this.qe.cont = JSON.stringify(crd);
            this.qe.values = [];
            let vv = await this.findDataFromServe(this.qe);
            // console.log(vv)
            if (vv != null) {
                this.dataLoaded(vv);
                console.log('getdataBack')
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
        page.currPage = Math.floor(index / size) + 1;
        page.index = index % size;
        return page;
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
        // this.dsm.index = _idx;
        if (crd) {
            await this.getCRecordByPk(crd);
        } else {
            let vv = await this.findDataFromServe(this.qe);
            if (vv && vv.values.length > 0) {
                console.log(vv);
                let dc = new DataCache(vv.page.currPage, vv.values);
                console.log(dc, "缓存数据");
                this.dataCache.push(dc);
                this.dsm.setValues(vv.values, true);
                crd = vv.values[vv.page.index];
                await this.getCRecordByPk(crd);
            }
            console.log(vv);
        }
        this.setListMenuName();
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
        let page = this.getPageInfo(_idx, this.qe.page.pageSize);
        console.log(page);
        this.dsm.page = page;
        let page0 = this.qe.page;
        page.total = page0.total;
        this.qe.page = page;
        let crd;
        if (page.currPage == page0.currPage) {
            crd = this.dsm.getRecordAtIndex(page.index);
        } else {
            let vr = this.dataCache.find(item => {
                return item.page == page.currPage;
            });
            if (vr) {
                this.dsm.setValues(vr.values, true);
                crd = vr.values[page.index];
            } else {
                this.qe.oprid = 13;
                this.qe.cont = JSON.stringify(this.dsm.cont);
            }
        }
        // console.log(JSON.stringify(crd), "获取记录");
        return crd;
    }

//#endregion
//#region 查询数据
    /**
     * @description 查询按钮获取数据
     * @param bok 是否确定查询
     * @param cont 查询条件对象
     */
    async findData(bok: boolean, cont: any) {
        // console.log(bok,cont,this.dsm.ccells.obj_id)
        if (!bok) {
            return;
        }
        this.dsm.cont = cont;
        this.qe.oprid = 13;
        if (this.qe.pcell === "")
            this.qe = new QueryEntity(
                this.dsm.p_cell,
                this.dsm.p_cell,
                JSON.stringify(cont)
            );
        else {
            if (cont) this.qe.cont = JSON.stringify(cont);
        }
        // console.log(this.qe,'qe')
        this.dataCache = []
        let vv = await this.findDataFromServe(this.qe);
        if (vv != null) {
            this.qe = vv;
            this.dataLoaded(vv);
            this.setListMenuName();
        }
    }

    /**
     * @description 数据从新加载
     * @param vv 查询返回的结果集
     */
    dataLoaded(vv: QueryEntity) {
        if (vv.oprid == 13) {
            let rec: any = vv.values[0];
            if (rec) {
                // this.qe = vv;
                let page = this.qe.page;
                this.dsm.setValues(vv.values, true);
                this.dsm._total = page.total;
                this.dsm.index = page.index;
                this.dsm.currRecord = rec;
                this.dsm.page = Object.assign({},page);
                this.setSubData()
                let dc = new DataCache(page.currPage, vv.values);
                console.log(dc, "缓存数据");
                this.dataCache.push(dc);
                // this.setListMenuName()
            } else {
                this.$notify.info("没有查询到数据");
            }
        } else if (vv.oprid == 15) {
            let rec: any = vv.values[0]; //后台返回的数据当前行
            let page = this.qe.page;
            this.dsm.index = page.index;
            this.dsm.page = Object.assign({},page);
            console.log(JSON.stringify(page));
            let i = vv.page.index; //数据的第几个
            let vr = this.dataCache.find(item => {
                return item.page == page.currPage;
            });
            // console.log(vr);
            let _ii = this.dataCache.findIndex(item => {
                return item.page == page.currPage;
            });
            if (_ii !== -1) {
                let v = this.dataCache[_ii];
                // console.log("缓存第几个," + _ii);
                v.values[i] = rec;
            }
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
            let vals = this.dsm.currRecord[cds1.ccells.obj_id]
            if(vals){
                cds1.clear();
                cds1.setValues(vals,true)
                cds1.page.total = vals.length||0
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
            let vv: QueryEntity = data.data.data;
            return vv;
        } else {
            return null;
        }
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
            mm.name = currIndex + 1 + "/" + this.dsm._total;
        }

    }
//#endregion
//#region 保存数据
    async saveData() {
        let bok = this.checkNotNull(this.dsm); 
        if(!bok)
            return ;        
        //保存数据
        if ((this.dsm.currRecord.sys_stated & icl.R_EDITED) > 0) {
            this.fullscreenLoading = true;
            let res = await this.dsm.saveData();
            this.fullscreenLoading = false;
            if (res.status == 200) {
                let data = res.data;
                if (data.id == 0) {
                    let ord: any = data.data;
                    this.dsm.currRecord = Object.assign(
                        this.dsm.currRecord,
                        ord
                    );
                    this.dsm.setState(icl.R_POSTED);
                    this.$message.success("保存成功！");
                    console.log(this.dsm.currRecord);
                }
            } else {
            }
            console.log(res);
        } else {
            console.log(
                this.dsm.currRecord.sys_stated,
                this.dsm.currRecord.sys_stated & icl.R_EDITED
            );
            return;
        }
    }

    checkNotNull(cds:CDataSet):boolean{
        let bok = true;
        cds.ccells.cels.forEach(item => {
            if (item.unNull&&bok) {
                var vl = cds.currRecord[item.id]+'';
                if(item.type<5){
                    if(!vl){
                        vl = 0+'';
                    }
                }
                if (!vl) {
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
                if(cd0.cdata._data.length===0 && !cd0.ccells.unNull){
                    this.$notify.warning( "【" + cd0.ccells.desc + "】不能为空!");
                    isok =  false;
                    return false;
                }else{
                    for(let i=0;i<cd0.cdata._data.length;i++){
                        let crd = cd0.getRecordAtIndex(i);
                        cd0.ccells.cels.forEach(item=>{
                            if(isok&&item.unNull){
                                var vl = crd[item.id];
                                if(item.type<5){
                                    if(!vl){
                                        vl = 0;
                                    }
                                }
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

    async mounted(){
        // console.log(this.uriParams,'bbb')
        await this.uriParamsChange()
        if(!this.params){
            this.dsm.createRecord();
            this.dsm.currRecord.sys_stated = 1
        }else{
            let data:any = {};
            data[this.params.pkfld] = this.params.value
            this.findData(true,data);
        }
        
    }

    async handleSizeChange(value:number){
        // console.log('handleSizeChange',value)
        this.qe.oprid = 13
        this.qe.type = 0
        this.qe.page.pageSize = value
        this.qe.page.currPage = 1
        console.log(this.qe)
        this.qe.cont = JSON.stringify(this.dsm.cont);
         let vv = await this.findDataFromServe(this.qe);
        if (vv != null) {
            this.qe = vv;
            this.dataLoaded(vv);
            this.setListMenuName();
        }
    }

    async handleCurrentChange(value:number){
        // console.log('handleCurrentChange',value)
        this.qe.oprid = 13
        this.qe.type = 0
        this.qe.page.currPage = value
        this.qe.cont = JSON.stringify(this.dsm.cont);
         let vv = await this.findDataFromServe(this.qe);
        if (vv != null) {
            this.qe = vv;
            this.dataLoaded(vv);
            this.setListMenuName();
        }
    }

    @Watch('params')
    paramsWatch(){ 
        if(this.params && this.params.pkfld){
            let data:any = {};
            data[this.params.pkfld] = this.params.value
            this.findData(true,data);
        }
    }
//#endregion
}
</script>

<style lang="scss" scoped>
/* .bip-main-container{
    background-color:red;
} */
</style>

