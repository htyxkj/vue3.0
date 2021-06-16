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
                                    <vxe-table-column  v-for="(cel,index) in tableCell" :key="index" :field="cel.id" :title="cel.labelString" :width="cel.numChar*8" :formatter="cel.type==3?formatFixedNumber:''" :align="cel.type==3?'right':'center'" ></vxe-table-column>
                                </template>
                                <!-- <vxe-table-column field="name" title="摘要" ></vxe-table-column>
                                <vxe-table-column field="sex" title="科目"></vxe-table-column>
                                <vxe-table-column field="rmbd" title="借方金额" align="right"></vxe-table-column>
                                <vxe-table-column field="fcyc" title="贷方金额" align="right"></vxe-table-column>

                                <vxe-table-column field="address" title="Address" show-overflow></vxe-table-column> -->
                                <vxe-table-column title="操作" width="100" show-overflow align="center">
                                    <template #default="{ row }">
                                    <vxe-button type="text" icon="el-icon-edit-outline" @click="editEvent(row)" status="primary"></vxe-button>
                                    <vxe-button type="text" icon="el-icon-delete" status="danger"></vxe-button>
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
                <!-- <el-card>
                    <el-row class="bip-row" :gutter="4" v-if="bottomLay" :style="'margin-top:10px;'">
                        <lay-cell :laycell="bottomLay.comp" :env="env" ></lay-cell>
                    </el-row>
                </el-card> -->
             </el-form>
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
import CRecord from '../../../classes/pub/CRecord';
import CData from '../../../classes/pub/CData';
import BipLayConf from "@/classes/ui/BipLayConf";
import LayCell from '@/components/layout/LayCell.vue';
import {CurrUtils} from '@/utils/CurrUtils'
let currutil = CurrUtils.curr
let icl = CommICL;
let tools = BIPUtil.ServApi
@Component({
    components: { BipMenuBarUi,  BipWork ,BipWorkProcess ,BipMenuBtnDlg,AppletListDlg,LayCell}
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
    created(){
        this.height = document.documentElement.clientHeight
        if(this.height>70){
            this.height=this.height-104;
        }
        this.billstyle = 'margin-top:10px;height:'+this.height+"px !important;";
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
        this.tableData= [
                { adic: 10001, name: 'Test1', role: 'Develop', sex: 'Man', rmbd: 28, remark: 'vxe-table 从入门到放弃vxe-table 从入门到放弃vxe-table 从入门到放弃vxe-table 从入门到放弃' },
                { adic: 10002, name: 'Test2', role: 'Test', sex: 'Women', rmbd: 22, remark: 'Guangzhou' },
                { adic: 10003, name: 'Test3', role: 'PM', sex: 'Man', rmbc: -32, remark: 'Shanghai' },
                { adic: 10004, name: 'Test4', role: 'Designer', sex: 'Women', rmbd: 23, remark: 'vxe-table 从入门到放弃' },
                { adic: 10005, name: 'Test5', role: 'Develop', sex: 'Women', rmbd: 30, remark: 'Shanghai' },
                { adic: 10006, name: 'Test6', role: 'Designer', sex: 'Women', rmbd: 21, remark: 'vxe-table 从入门到放弃' },
                { adic: 10007, name: 'Test7', role: 'Test', sex: 'Man', rmbd: 29, remark: 'vxe-table 从入门到放弃' },
                { adic: 10008, name: 'Test8', role: 'Develop', sex: 'Man', rmbd: 35, remark: 'vxe-table 从入门到放弃' }
              ]
    }

    async invokecmd(btn:any) {
        console.log(btn);
    }

    editEvent(row:any){
        console.log(row)
    }

    insertPZRow(){}



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
                
                if(buid){
                    let res1 = await tools.getBULinks(buid);
                    let rtn1 = res1.data;
                    if(rtn1.id==0){
                        let ope = rtn1.data.opt
                        this.dsm.setOpera(ope)
                    }
                }
                this.dsm.createRecord();
                 let tb1:any = this.lay.compconfs[1];
                this.tableCell = tb1.comp.uiCels;
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
                        color: 'red'
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
            let nd =  Number(item[field]);
            if(isNaN(nd))
                nd = 0.0;
            count += nd;
        });
        return currutil.currency(count,'',2);
    }


}
</script>

<style>
.col-hj{
    background-color: #56b9bc;
    color: #fff;
}
</style>