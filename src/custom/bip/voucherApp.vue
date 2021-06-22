<template>
    <el-row v-loading.fullscreen.lock="fullscreenLoading">
        <template v-if="mbs&&mbs.initOK">
            <bip-menu-bar-ui ref="mb" :mbs="mbs" :cds="dsm" @invokecmd="invokecmd"></bip-menu-bar-ui> 
        </template>
        <template v-if="searchdia">
            <bip-search-dialog ref="se" :cds_cont="dsm" @makeOK="searchfindData"></bip-search-dialog>
        </template>
        <div class="bip-border-lay" :style="billstyle">
             <el-form @submit.native.prevent label-position="right" label-width="120px" >
                <el-card style="height:100% ;">
                    <el-row class="bip-row" :gutter="4" v-if="headerLay">
                        <lay-cell :laycell="headerLay.comp" :env="env" ></lay-cell>
                    </el-row>
                </el-card>
                <el-card>
                    <vxe-toolbar>
                        <template #buttons>
                            <el-button style="margin-left:18px;" size="small" type="info" icon="el-icon-edit" @click="insertPZRow()">新增凭证行</el-button>
                        </template>
                        </vxe-toolbar>
                    <el-row>
                        <el-col :span="18">
                            <vxe-table 
                            ref="pztb"
                            :height="height-300"
                            size="small"
                            resizable
                            border
                            stripe
                            highlight-hover-row
                            show-overflow
                            align="left" style="margin:0 18px;"
                            :footer-method="footerMethod"
                            min-width="50px"
                            show-footer
                            :footer-cell-class-name="footerCellClassName"
                            :header-cell-style="headerCellStyle"
                            :cell-style="cellStyle"
                            @cell-click="table_cell_click"
                            :data="tableData">
                                <vxe-table-column type="seq" width="60"></vxe-table-column>
                                <template v-if="tableCell.length>0">
                                    <vxe-table-column  v-for="(cel,index) in tableCell" :key="index" :field="cel.id" :title="cel.labelString" :width="cel.numChar*8" :formatter="cel.type==3?formatFixedNumber:''" :align="cel.type==3?'right':'center'" >
                                        <template v-slot="{rowIndex}"> 
                                            <bip-grid-info :cds="dsm.ds_sub[0]" :cell="cel" :row="rowIndex" :bgrid="true" ></bip-grid-info>
                                        </template>
                                    </vxe-table-column>
                                </template>
                                <vxe-table-column title="操作" width="100" show-overflow align="center">
                                    <template #default="{ row }">
                                    <vxe-button type="text" icon="el-icon-edit-outline" @click="editEvent(row)" status="primary"></vxe-button>
                                    <vxe-button type="text" icon="el-icon-delete" @click="deleteEvent(row)" status="danger"></vxe-button>
                                    </template>
                                </vxe-table-column>
                            </vxe-table>
                        </el-col>
                        <el-col :span="6">
                             <el-card :style="'height:'+(height-350)+'px;'">
                                <div slot="header" class="clearfix">
                                    <span>辅助项</span>
                                </div>
                                    <el-row  v-for="(name,index) in pxnames" :key="index">
                                        <span>{{name}}</span>
                                        <!-- <bip-grid-info :cds="dsm.ds_sub[0]" :cell="cel" :row="dsm.ds_sub[0].index" :bgrid="false" ></bip-grid-info> -->
                                    </el-row>
                             </el-card>
                        </el-col>
                    </el-row>
                   
                   
                </el-card>
             </el-form>
             <el-dialog class="bip-search" width="50%" :visible.sync="editDrawer"
                :append-to-body="true" :close-on-press-escape="false" :close-on-click-modal="false">
                <span slot="title">
                    <div class="el-dialog__title" style="padding-bottom: 5px;"> <i class="el-icon-edit" ></i>
                    <span>添加/修改凭证行</span></div>
                </span>
                <el-form ref="form" :model="formData.data" label-width="120px" label-position="right" class="vouDlgForm" >
                    <el-row>
                        <el-form-item label="摘要"  required >
                            <el-input type="textarea" v-model="formData.data.remark"></el-input>
                        </el-form-item>
                    </el-row>
                     <el-row>
                        <el-form-item  label="会计科目" required >
                            <el-input  v-model="adicStrv" size="medium" disabled >
                                <el-button slot="append" icon="iconfont icon-bip-shuzhuangtu" @click="showAdicTree"></el-button>
                            </el-input>
                        </el-form-item>
                    </el-row>
                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="借方金额"  >
                                    <el-input-number size="medium" v-model="formData.data.rmbd" :precision="2" style="width:100%;" @change="rmbChange('rmbd')"></el-input-number>
                                </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="贷方金额"  >
                                <el-input-number size="medium" v-model="formData.data.rmbc" :precision="2" style="width:100%;" @change="rmbChange('rmbc')"></el-input-number>
                            </el-form-item>
                        </el-col>
                        
                    </el-row>
                    
                     <el-row>
                        <el-card>
                                <div slot="header" class="clearfix">
                                    <span>辅助项</span>
                                </div>
                                    <el-row  v-for="(cel,index) in pCells" :key="index">
                                         <bip-comm-editor  :env="env" :cell="cel" :cds="dsm.ds_sub[0]" :row="dsm.ds_sub[0].index" :bgrid="false" />
                                    </el-row>
                             </el-card>
                    </el-row>
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="editDrawer = false" size="mini">取 消</el-button>
                    &nbsp;
                    <el-button type="primary" @click="editOK" size="mini">确 定</el-button>
                </span>
             </el-dialog>
            <bip-work ref="work" @checkOK="checkOK"></bip-work>
            <el-dialog title="会计科目选择" class="bip-query" :visible.sync="treeVisible" :append-to-body="true" 
                :close-on-press-escape="true" :close-on-click-modal="false" width="30%" >
                    <el-input size="small" placeholder="输入关键字进行过滤" v-model="filterText"></el-input>
                    <el-scrollbar style="margin-top:5px;margin-bottom:0px;  margin-right: 0px; height:240px;" >
                            <el-tree node-key="id"  :data="adicTree" accordion highlight-current ref="tree" :filter-node-method="filterNode"></el-tree>
                    </el-scrollbar>
                <!-- </div> -->
                
                    <span slot="footer" class="dialog-footer">
                        <el-button size="small" type="danger" @click="treeVisible = false">取     消</el-button>  
                        <!-- <el-button size="small" @click="find">刷      新</el-button>   -->
                        <el-button size="small" type="primary" @click="selectAdicOK">确     定</el-button>
                    </span>
            </el-dialog>
        </div>
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
import CDataSet from "@/classes/pub/CDataSet";
import BipMenuBar from "@/classes/pub/BipMenuBar";
import CCliEnv from "@/classes/cenv/CCliEnv";
import CeaPars from "@/classes/cenv/CeaPars";
import { BipLayout } from "@/classes/ui/BipLayout";
import QueryEntity from "@/classes/search/QueryEntity";
import PageInfo from "@/classes/search/PageInfo";
import BipWork from '@/components/cwork/BipWork.vue';
import BipWorkProcess from '@/components/cwork/BipWorkProcess.vue';
import BipGridInfo from "@/components/editorn/grid/BipGridInfo.vue";
import CRecord from '@/classes/pub/CRecord';
import CData from '@/classes/pub/CData';
import BipLayConf from "@/classes/ui/BipLayConf";
import LayCell from '@/components/layout/LayCell.vue';
import {CurrUtils} from '@/utils/CurrUtils'
let currutil = CurrUtils.curr
let icl = CommICL;
let tools = BIPUtil.ServApi
let _ = require('lodash')

@Component({
    components: { BipMenuBarUi,  BipWork ,BipWorkProcess ,BipMenuBtnDlg,AppletListDlg,LayCell,BipGridInfo}
})
export default class VoucherApp extends Vue{
    uriParams: URIParams = new URIParams();
    fullscreenLoading:boolean = false;
    // nodeId:string = "";
    cells: Array<Cells> = new Array<Cells>();
    mbs: BipMenuBar = new BipMenuBar(0);
    dsm: CDataSet = new CDataSet(null);
    dsm_cont: CDataSet = new CDataSet(null);
    ds_ext: Array<CDataSet> = Array<CDataSet>();
    lay: BipLayout = new BipLayout("");
    env: CCliEnv = new CCliEnv();
    searchdia: boolean = false;
    qe: QueryEntity = new QueryEntity("","");
    // dataCache: Array<DataCache> = [];
    listIndex: number = -1;
    cea:CeaPars = new CeaPars({});
    headerLay:any = null;
    bottomLay:any = null;
    height:number = 400;
    billstyle:string = '';
    tableData:Array<any>=[];
    tableCell:Array<any>=[];
    editDrawer:boolean = false;
    treeVisible:boolean = false;
    adicTree:Array<any> = []
    formData:any = {data:{}}
    filterText:any = '';
    attr:number = 0;
    attr2v:string = ''
    adicStrv:string = ''
    pCells:Array<any> = []
    switchHide:Array<any>=[]
    currPxname:string='';

    oprid:number = 13
    async created(){
        this.height = document.documentElement.clientHeight
        if(this.height>70){
            this.height=this.height-104;
        }
        this.billstyle = 'margin-top:10px;height:'+this.height+"px !important;";
        let res = await tools.getBipInsAidInfo('A_CDIC',210,new QueryEntity("",""));
        console.log(res);
        if(res.data.id==0){
            this.adicTree = res.data.data.data;
        }

    }
    async mounted(){
        this.fullscreenLoading = true;
         let res = await tools.getMenuParams(
                '69021',
                '69021'
            );
            
        if (res.data.id === 0) {
            this.uriParams = res.data.data.mparams;
        } else {
            this.$notify.error("没有菜单参数！");
            this.fullscreenLoading = false;
        }
        await this.uriParamsChange();
    }

    async invokecmd(btn:any) {
        let cmd = btn.cmd
        console.log(cmd);
        if (cmd === "ADD") {
            if (this.dsm.currRecord && (this.dsm.currRecord.c_state & 2) > 0) {
                this.$alert(
                    `当前数据没有保存，请先保存当前行数据`,
                    `系统提醒`,
                    { type: "info" }
                ).catch(() => {
                    console.log("取消");
                });
                return;
            }
            if(this.dsm.currRecord && this.dsm.currRecord.c_state&icl.R_INSERT){
                return 
            }
            this.dsm.createRecord();
            this.currPxname = ''
            if(this.dsm.ds_sub){
                for(var i=0;i<this.dsm.ds_sub.length ;i++){
                    this.dsm.ds_sub[i].clear();
                    this.tableData = [];
                }
            }
            this.setListMenuName();
            this.$bus.$emit("datachange",this.dsm.ccells.obj_id)
        } else if (cmd === "SAVE") {
            await this.saveData();
        }else if (cmd === "FIND") {
            this.searchdia = true;
            setTimeout(() => {
                let dia: any = this.$refs.se;
                dia.open();
            }, 100);
        }else if(cmd=== "SUBMIT"){
            this.submint();
        }
    }

    checkOK(state:number|string){
        let i = this.dsm.i_state;
        if(i>-1){
            this.dsm.currRecord.data[this.dsm.ccells.cels[i].id] = state
        }
        
    }

    showAdicTree(){
        this.treeVisible = true
        this.$nextTick(()=>{
            let tree:any = this.$refs.tree;
            let adicv = this.formData.data['adic'];
            tree.setCurrentKey(adicv);
        })
    }

    treeClose(){
        this.treeVisible = false
    }
    selectAdicOK(){
        let tree:any = this.$refs.tree;
        let selNode = tree.getCurrentNode();
        if(selNode !=null ){
            console.log(selNode);
            if(selNode.haveChildren){
                this.$message.error("请选择末级科目");
                return ;
            }
            this.formData.data['adic'] = selNode.id
            let attr = selNode.data.prj;
            if(attr==null){
                attr = 0
            }
            this.attr = attr
            if(attr>0){//有辅助项
                let a2v = (attr.toString(2)+"").split('').reverse().join('');
                console.log(a2v);
                this.attr2v = a2v;
            }else{
                this.attr2v = '';
                _.forEach(this.pCells,(cel:any) => {
                    this.formData.data[cel.id] = ''
                });
            }
            this.adicStrv = selNode.id+":"+selNode.label
            this.treeVisible = false;
            this.pCells = [];
            let rv = this.attr2v.split('');
            let subCell = this.dsm.ds_sub[0].ccells;
            for(let i=0;i<rv.length;i++){
                let v = parseInt(rv[i]);
                if(v==1){
                    let _r = _.findIndex(subCell.cels,(item:any)=>{
                        return item.id == 'p'+i;
                    })
                    if(_r>0){
                        this.pCells.push(subCell.cels[_r]);
                    }  
                }
            }
        }
    }
    @Watch('filterText')
    filterTextChange(val:any) {
        let tree:any = this.$refs.tree;
        tree.filter(val);
    }

    filterNode(value:any, data:any) {
        if (!value) return true;
        return data.label.indexOf(value) !== -1;
    }

    editEvent(row:any){
        let dssub = this.dsm.ds_sub[0];
        let _r= _.findIndex(dssub.cdata.data,(item:any)=>{
            return item.id==row.id
        });
        this.dsm.ds_sub[0].index = _r;
        let cr = dssub.getRecordAtIndex(_r);
        let adicv = cr.data['adic'];
        let node = this.getAdicStrv(adicv,this.adicTree);
        this.pCells = [];
        this.attr =0;
        if(node){
            this.adicStrv = node.id+":"+node.label
            let attr = node.data.prj;
            if(attr==null){
                attr = 0
            }
            this.attr = attr
            if(this.attr>0){
                if(attr>0){//有辅助项
                let a2v = (attr.toString(2)+"").split('').reverse().join('');
                    this.attr2v = a2v;
                }
                let rv = this.attr2v.split('');
                let subCell = this.dsm.ds_sub[0].ccells;
                for(let i=0;i<rv.length;i++){
                    let v = parseInt(rv[i]);
                    if(v==1){
                        let _r = _.findIndex(subCell.cels,(item:any)=>{
                            return item.id == 'p'+i;
                        })
                        if(_r>0){
                            this.pCells.push(subCell.cels[_r]);
                        }  
                    }
                }
            }
        }
        this.dsm.ds_sub[0].currRecord = cr;
        this.formData = cr;
        this.editDrawer = true;       
    }


    getAdicStrv(adicbm:any,tree:Array<any>):any{
        if(adicbm){
            for(let i=0;i<tree.length;i++){
                let _itme = tree[i];
                if(adicbm.startsWith(_itme.id)){
                    if(_itme.id==adicbm){
                        return _itme;
                    }
                    if(_itme.haveChildren){
                        return this.getAdicStrv(adicbm,_itme.children);
                    }
                }
            }
        }
        return "";
    }

    deleteEvent(row:any){
        console.log(row)
        let dssub = this.dsm.ds_sub[0];
        let _r= _.findIndex(dssub.cdata.data,(item:any)=>{
            return item.id==row.id
        })
        this.dsm.ds_sub[0].removeIndex(_r)
        this.tableData = this.dsm.ds_sub[0].cdata.data;
    }

    insertPZRow(){
        this.editDrawer = true
        this.$nextTick(()=>{
            let cr0:any = this.dsm.currRecord;
            let remakstr = cr0.data['remark'];
            if(this.dsm.ds_sub[0].cdata.data){
                cr0 = this.dsm.ds_sub[0].getRecordAtIndex(this.dsm.ds_sub[0].cdata.data.length-1);
                console.log(cr0)
                remakstr = cr0.data['remark'];
            }
            let cr:any = this.dsm.ds_sub[0].createRecord();
            cr.data['remark'] = remakstr;
            this.formData = cr;
            let rtb:any = this.$refs.pztb;
            console.log(rtb,'999999');
            let fdata = rtb.footerTableData[0];
            console.log(fdata,fdata[4],fdata[5]);
            let rmbd = new Number(fdata[4].replace(/,/g, "")).valueOf();
            let rmbc =new Number(fdata[5].replace(/,/g, "")).valueOf();
            let r1 = rmbd-rmbc;
            if(r1<0){
                this.formData.data.rmbd = -r1;
                this.formData.data.fcyd = -r1;
            }else{
                this.formData.data.rmbc = r1;
                this.formData.data.fcyc = r1;
            }
            this.tableData = this.dsm.ds_sub[0].cdata.data;
            this.attr = 0;
            this.attr2v = '';
            this.pCells = []
            this.adicStrv = '';
        });
        
    }

    editOK(){
        let dssub = this.dsm.ds_sub[0];
        let _r= _.findIndex(dssub.cdata.data,(item:any)=>{
            return item.id==this.formData.id
        });
        let cr = dssub.getRecordAtIndex(_r);
        cr = this.formData;
        this.tableData = this.dsm.ds_sub[0].cdata.data;
         let rtb:any = this.$refs.pztb;
         let pxname='';
         if(this.pCells.length>0){
             let r1 = '';
             for(let i=0;i<this.pCells.length;i++){
                let c1 = this.pCells[i];
                let rv = this.formData.data[c1.id];
                if(rv==''){
                    this.$message.error(c1.labelString+"不能为空！");
                    return ;
                }
                pxname+="["+c1.labelString+"]";
                let rr:any = window.sessionStorage.getItem(c1.editName+"_"+rv);
                console.log(rr);
                rr = JSON.parse(rr);
                let str = '';
                _.forEach(rr,(key:string)=>{
                    str+=key+":";
                });
                str = str.substring(0,str.length-1);
                pxname+=str+";";
             }
         }
         if(pxname.length>0)
            pxname = pxname.substr(0,pxname.length-1)
         cr.data['pxname'] = pxname;
         this.currPxname = pxname;
         rtb.reloadData(this.tableData);
         this.$bus.$emit('datachange','')
         this.editDrawer = false
    }

    footerMethod ({ columns, data }:any) {
        return [
        columns.map((column :any, columnIndex :any) => {
            if (columnIndex === 0) {
                return '合计'
            }
            if (['rmbd'].includes(column.property)) {
            return this.sumNum(data, column.property)
            }
            if (['rmbc'].includes(column.property)) {
            return this.sumNum(data, column.property)
            }
            return null
        })
        ]
    }
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
                if(this.uriParams && this.uriParams.pbds.importCellId){
                    let btn = new BipMenuBtn(icl.B_CMD_UPFILE,"导入")
                    btn.setIconFontIcon('ruku');
                    this.mbs.menuList.push(btn)
                    let btn_log = new BipMenuBtn(icl.B_CMD_UPFILE_LOG,"日志")
                    btn_log.setIconFontIcon('shuji');
                    this.mbs.menuList.push(btn_log)
                }
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
                this.headerLay = this.lay.compconfs[0];
                let btm:any = this.lay.compconfs[2];
                this.bottomLay = btm.comp.compconfs[1];
                this.dsm.createRecord();
                 let tb1:any = this.lay.compconfs[1];
                this.tableCell = tb1.comp.uiCels;
                if(buid){
                    let res1 = await tools.getBULinks(buid);
                    let rtn1 = res1.data;
                    if(rtn1.id==0){
                        let ope = rtn1.data.opt
                        this.dsm.setOpera(ope)
                    }
                }

                // console.log(this.tableCell);

            } else {
                this.$notify.error("没有获取到对象定义");
            }
        }
    }

    findListMenuIndex(cmd: string): number {
        return this.mbs.menuList.findIndex(item => {
            return item.cmd === cmd;
        });
    }

    footerCellClassName ({ $rowIndex, columnIndex }:any) {
        return 'col-hj'
    }

     // 四舍五入,默认两位数
    formatFixedNumber ({ cellValue }:any, digits = 2) {
        return  currutil.currency(cellValue,'',digits);
    }

    headerCellStyle ({ column, columnIndex }:any) {
        if(columnIndex>0&&this.tableCell){
            let rr = this.tableCell[columnIndex-1];
            if(rr){
                if (rr.isReq) {
                    return {
                        // backgroundColor: '#f60',
                        color: '#d62121'
                    }
                }
                if (rr.type === 3) {
                    return {
                        color: 'green'
                    }
                }
            }
        }

    }

    cellStyle ({ row,columnIndex }:any) {
         if(columnIndex>0&&this.tableCell){
            let rr = this.tableCell[columnIndex-1];
            if(rr&&rr.type ===3 ){
                let v = row[rr.id];
                if (v<0) {
                    return {
                        color: 'red'
                    }
                }
            }
        }
    }

    sumNum (list:any, field:any) {
        let count = 0
        list.forEach((item:any) => {
            let nd =  Number(item.data[field]);
            if(isNaN(nd))
                nd = 0.0;
            count += nd;
        });
        return currutil.currency(count,'',2);
    }

    rmbChange(fld:string){
        if(fld == 'rmbd'){
            if(this.formData.data.rmbd!=0){
                this.formData.data.rmbc = ''
                this.formData.data.fcyc = ''
                this.formData.data.fcyd = this.formData.data.rmbd
            }
        }

        if(fld == 'rmbc'){
            if(this.formData.data.rmbc!=0){
                this.formData.data.rmbd = ''
                this.formData.data.fcyd = ''
                 this.formData.data.fcyc = this.formData.data.rmbc
            }
        }
        
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
//#region 

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
                    this.$notify.error(err+";BaseApplet submint")
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

    async saveData() {
        let bok = this.checkNotNull(this.dsm); 
        if(!bok)
            return ;
        //检查对象字段 规则中  0~50 定义
        bok = this.checkAccessRange(this.dsm); 
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
                            this.$bus.$emit("datachange",this.dsm.ccells.obj_id)
                        }else{
                            this.$message.warning(data.message);
                        }
                        if(this.uriParams){
                            let canSubmit = true;
                            if(this.mbs){
                                for(var i=0;i<this.mbs.menuList.length;i++){
                                    let btn = this.mbs.menuList[i];
                                    if(btn.cmd == 'DLG'){
                                        canSubmit =false;
                                        break;
                                    }
                                }
                            }
                            if(canSubmit && (this.uriParams.pattr & CommICL.B_IWORKEA)>0 && this.uriParams.pbds.sToSubmit){
                                this.submint();
                            }
                        }
                        //清空主健旧值
                        this.dsm.clearOldpk();
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
                                let vl = crd.data[item.id]+'';
                                if (!vl) {
                                    this.$notify.warning( "【" + cd0.ccells.desc + "】第"+(i+1)+"行【" + item.labelString + "】不能为空!");//"+item.id+"
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

    /**
     * 检查对象字段规则中的 ~  XXX~XXX 定义
     */
    checkAccessRange(cds:CDataSet):boolean{
        let bok = true;
        cds.ccells.cels.forEach(item => {
            if (item.editName && bok) {
                let edName = item.editName.split(";");
                for(var i=0;i<edName.length;i++){
                    let ename = edName[i];
                    if(ename.indexOf("~") !=-1){
                        let vl = cds.currRecord.data[item.id];
                        vl = parseFloat(vl);
                        let numArr = ename.split("~");
                        if(numArr.length <2){
                            if(ename.indexOf("~") == 0){//小于某个数
                                if(vl > numArr[0]){
                                    this.$notify.warning( "【" + item.labelString + "】值应小于等于："+numArr[1]);
                                    bok =  false;
                                    return false;
                                }
                            }else{//大于某个数
                                if(vl < numArr[0]){
                                    this.$notify.warning( "【" + item.labelString + "】值应大于等于："+numArr[0]);
                                    bok =  false;
                                    return false;
                                }
                            }
                        }else if(numArr.length == 2){
                            if(vl > numArr[1]){
                                this.$notify.warning( "【" + item.labelString + "】值应小于等于："+numArr[1]);
                                bok =  false;
                                return false;
                            }
                            if(vl < numArr[0]){
                                this.$notify.warning( "【" + item.labelString + "】值应大于等于："+numArr[0]);
                                bok =  false;
                                return false;
                            }
                        }
                    }
                }
            }
        });
        if(bok){
            if (cds.ds_sub.length>0) {
                return this.checkChildAccessRange(cds);
            }
        }
        return bok;
    }

    /**
     * 检查子对象字段规则中的 ~  XXX~XXX 定义
     */
    checkChildAccessRange(cds:CDataSet):boolean{
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
                            if (item.editName && isok) {
                                let edName = item.editName.split(";");
                                for(var i=0;i<edName.length;i++){
                                    let ename = edName[i];
                                    if(ename.indexOf("~") !=-1){
                                        let vl = crd.data[item.id];
                                        let numArr = ename.split("~");
                                        if(numArr.length <2){
                                            if(ename.indexOf("~") == 0){//小于某个数
                                                if(vl > numArr[0]){
                                                    this.$notify.warning( "【" + item.labelString + "】值应小于等于："+numArr[1]);
                                                    isok =  false;
                                                    return false;
                                                }
                                            }else{//大于某个数
                                                if(vl < numArr[0]){
                                                    this.$notify.warning( "【" + item.labelString + "】值应大于等于："+numArr[0]);
                                                    isok =  false;
                                                    return false;
                                                }
                                            }
                                        }else if(numArr.length == 2){
                                            if(vl > numArr[1]){
                                                this.$notify.warning( "【" + item.labelString + "】值应小于等于："+numArr[1]);
                                                isok =  false;
                                                return false;
                                            }
                                            if(vl < numArr[0]){
                                                this.$notify.warning( "【" + item.labelString + "】值应大于等于："+numArr[0]);
                                                isok =  false;
                                                return false;
                                            }
                                        }
                                    }
                                }
                            }
                        })
                    }
                }
            }
            if(cd0.ds_sub.length>0){
                isok = this.checkChildAccessRange(cd0);
            }

        })
        return isok;
    }

    async searchfindData(cont: any) {
        this.searchdia = true;
        this.qe.oprid = this.oprid;
        this.qe.page.currPage = 1;
        this.qe.page.index = 0;
        this.oprid = 13;
        if(JSON.stringify(cont) == '{}'){
            if(this.uriParams && this.uriParams.pdata){
                this.oprid = 14;
                cont = this.uriParams.pdata
            }
        }
        await this.findData(cont); 
    }
//#endregion

//#region 查询数据
    /**
     * @description 查询按钮获取数据
     * @param bok 是否确定查询
     * @param cont 查询条件对象
     */
    async findData(cont: any) {
        console.log("单据查询！")
        this.dsm.clear();
        if(this.dsm.ds_sub && this.dsm.ds_sub.length>0){
            for(var i=0;i<this.dsm.ds_sub.length;i++){
                this.dsm.ds_sub[i].clear();
            } 
        }
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
        let vv:CData = await this.findDataFromServe(this.qe);
        if (vv != null) { 
            this.qe.page = vv.page;
            this.dsm.page = vv.page;
            this.dsm.cdata.page = vv.page;
            console.log('服务器获取数据',vv)
            await this.dataLoaded(this.qe,vv);
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
                    if(vv.data.length>0){
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
                }
            this.setSubData();
        }
    }

    /**
     * @description 数据从新加载
     * @param vv 查询返回的结果集
     */
    async dataLoaded(vv: QueryEntity,cd:CData) {
        if ((vv.oprid == 13) || (vv.oprid == 14)) {
            let page = cd.page;
            if(page.total >0){
                await this.dsm.setCData(cd);
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
            this.dsm.setRecordAtIndex(rec, i);
            this.dsm.currRecord = rec;
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
                        this.$bus.$emit("datachange", cds1.p_cell);
                    }
                }
            }
            this.tableData = cds1.cdata.data;
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
    get pxnames(){
        return this.currPxname.split(';');
    }

    table_cell_click(data:any,event:any){ 
        let _r = data.rowIndex;
        this.dsm.ds_sub[0].index = _r;
        let cr = this.dsm.ds_sub[0].getRecordAtIndex(_r);
        this.dsm.ds_sub[0].currRecord = cr;
        this.currPxname = cr.data['pxname']
    }

}
</script>

<style lang="scss">
.col-hj{
    background-color: #56b9bc;
    color: #fff;
}
.vouDlgForm{
    margin :5px 10px;
    .el-form-item__content{
        line-height: 0px !important;
    }
}
.el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content {
    background-color: #8adabb;
}
</style>