<template>
    <el-row v-loading.fullscreen.lock="fullscreenLoading">
        <template v-if="mbs&&mbs.initOK">
            <bip-menu-bar-ui ref="mb" :mbs="mbs" :cds="dsm" @invokecmd="invokecmd"></bip-menu-bar-ui> 
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
                             <el-card>
                                <div slot="header" class="clearfix">
                                    <span>辅助项</span>
                                </div>
                                    <el-row :style="'height:'+(height-350)+'px;'"></el-row>
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
                <el-form ref="form" :model="formData.data" label-width="120px" label-position="right" style="margin :5px 10px;" >
                    <el-row>
                        <el-form-item class="bip-s-dia" label="摘要"  required>
                            <el-input type="textarea" v-model="formData.data.remark"></el-input>
                        </el-form-item>
                    </el-row>
                     <el-row>
                        <el-form-item class="bip-s-dia" label="会计科目" required>
                            <el-input  v-model="formData.data.adic" >
                                <template slot="append"> <i slot="suffix" class="el-input__icon el-icon-share"></i></template>
                            </el-input>
                        </el-form-item>
                    </el-row>
                    <el-row>
                        <el-col :span="12">
                            <el-form-item class="bip-s-dia" label="借方金额"  >
                                    <el-input-number class="m-number"  v-model="formData.data.rmbd" :precision="2" style="min-width:220px;" @change="rmbChange('rmbd')"></el-input-number>
                                </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item class="bip-s-dia" label="贷方金额"  >
                                <el-input-number class="m-number" v-model="formData.data.rmbc" :precision="2" style="min-width:220px;" @change="rmbChange('rmbc')"></el-input-number>
                            </el-form-item>
                        </el-col>
                        
                    </el-row>
                    
                     <el-row>
                        <el-card>
                                <div slot="header" class="clearfix">
                                    <span>辅助项</span>
                                </div>
                                    <el-row></el-row>
                             </el-card>
                    </el-row>
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="editDrawer = false" size="mini">取 消</el-button>
                    &nbsp;
                    <el-button type="primary" @click="editOK" size="mini">确 定</el-button>
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
import { values } from 'xe-utils/methods';
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
    editDrawer:boolean = false
    formData:any = {data:{}}
    async created(){
        this.height = document.documentElement.clientHeight
        if(this.height>70){
            this.height=this.height-104;
        }
        this.billstyle = 'margin-top:10px;height:'+this.height+"px !important;";
        let res = await tools.getBipInsAidInfo('A_CDIC',210);
        console.log(res);
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
        console.log(btn);
    }

    editEvent(row:any){
        let dssub = this.dsm.ds_sub[0];
        let _r= _.findIndex(dssub.cdata.data,(item:any)=>{
            return item.id==row.id
        });
        let cr = dssub.getRecordAtIndex(_r);
        this.formData = cr;
        this.editDrawer = true;
       
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
        let cr0:any = this.dsm.currRecord;
        let remakstr = cr0.data['remark'];;
        if(this.dsm.ds_sub[0].cdata.data){
            cr0 = this.dsm.ds_sub[0].getRecordAtIndex(this.dsm.ds_sub[0].cdata.data.length-1);
            // console.log(cr0)
            remakstr = cr0.data['remark'];
        }
        let cr:any = this.dsm.ds_sub[0].createRecord();
        cr.data['remark'] = remakstr;
        this.formData = cr;
         let rtb:any = this.$refs.pztb;
         let fdata = rtb.footerData[0];
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
    }
    editOK(){
        this.editDrawer = false
         let dssub = this.dsm.ds_sub[0];
        let _r= _.findIndex(dssub.cdata.data,(item:any)=>{
            return item.id==this.formData.id
        });
        let cr = dssub.getRecordAtIndex(_r);
        cr = this.formData;
        this.tableData = this.dsm.ds_sub[0].cdata.data;
         console.log(this.formData,cr,this.tableData);
         let rtb:any = this.$refs.pztb;
         console.log(rtb);
         rtb.reloadData(this.tableData);
         this.$bus.$emit('datachange','')
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


}
</script>

<style>
.col-hj{
    background-color: #56b9bc;
    color: #fff;
}

</style>