<template>
    <div v-if="laycell" class="bip-lay" style="position: relative;">
        <el-row  v-if="this.cds.cdata.sumData && this.cds.cdata.sumData.length>0 && this.cds.page.total>0" style="padding-bottom: 20px;">
            <template v-for="(item,index) in this.cds.cdata.sumData">
                <span class="sum" :key="index">{{item.labelString}}: {{item.initval}}</span>&nbsp;&nbsp;&nbsp;&nbsp;
            </template>
        </el-row>

        <vxe-toolbar :id="this.cds.ccells.obj_id+'toolbar'" :custom="{storage: true,immediate:true}" style="height: 35px;padding: 4px 0px 0px;position: absolute;right: 30px;z-index: 100;"></vxe-toolbar>
        <template v-if="beBill">
            <!-- 单据录入表格-->
            <vxe-table
                :ref="this.cds.ccells.obj_id"
                v-if="beBill"
                border
                size="small"
                :data.sync="cds.cdata.data"
                row-id="id"
                resizable
                height="300px"
                highlight-hover-row
                show-all-overflow="tooltip"
                show-header-overflow
                highlight-current-row
                class="vxe-table-element"
                :optimized="true"
                :edit-config="{trigger: 'click', mode: 'cell',showStatus: true,showIcon:false,activeMethod:activeMethod}"
                :selectRow="cds.currRecord"
                @cell-dblclick="openrefs"
                @cell-click="table_cell_click"
                :header-cell-style="headerCellStyle"                
                @edit-actived="rowActive"
                @edit-closed="editClose"
                @checkbox-change="selectChangeEvent"
                @checkbox-all="selectChangeEvent"
                >
                <vxe-table-column v-if="cds.ds_par" type="checkbox" width="40"></vxe-table-column>
                <template v-for="(item,index) in groupCells">
                    <template v-if="item.type == ''">
                        <vxe-table-column :key="index" header-align="center" align="center"
                            :field="item.cel.id" :width="widths[item.cel.widthIndex]" :title="item.cel.labelString"
                            show-header-overflow :edit-render="{name: 'default'}" show-overflow :disabled="(item.cel.attr&0x40)>0">
                            <template v-slot:edit="{row,rowIndex}">
                                <bip-comm-editor  :cell="item.cel" :cds="cds" :row="rowIndex" :bgrid="true"/> 
                            </template>
                            <template v-slot="{row,rowIndex}">
                                <bip-grid-info :cds="cds" :cell="item.cel" :row="rowIndex" :bgrid="true" ></bip-grid-info>
                            </template>
                        </vxe-table-column>
                    </template>
                    <template v-else-if="item.type == 'g'">
                        <vxe-table-column :key="index" :title="item.name" header-align="center">
                            <vxe-table-column 
                                v-for="(cel,indexg) in item.cel" :key="indexg"
                                header-align="center" align="center" 
                                :field="cel.id" :width="widths[cel.widthIndex]" :title="cel.labelString"
                                show-header-overflow :edit-render="{name: 'default'}" show-overflow :disabled="(cel.attr&0x40)>0">
                                <template v-slot:edit="{row,rowIndex}">
                                    <bip-comm-editor  :cell="cel" :cds="cds" :row="rowIndex" :bgrid="true"/> 
                                </template>
                                <template v-slot="{row,rowIndex}">
                                    <bip-grid-info :cds="cds" :cell="cel" :row="rowIndex" :bgrid="true" ></bip-grid-info>
                                </template>
                            </vxe-table-column> 
                        </vxe-table-column>
                    </template>
                </template>
                <template v-slot:empty>
                    <el-button type="danger" icon="el-icon-plus" circle style="font-size: 28px;"  @click="addRecord"></el-button>
                </template>
                <!-- 
                    <vxe-table-column
                        header-align="center"
                        align="center"
                        v-for="(cel,index) in laycell.uiCels"
                        :key="index"
                        :field="cel.id"
                        :width="widths[index]"
                        :title="cel.labelString"
                        show-header-overflow
                        :edit-render="{name: 'default'}"
                        show-overflow
                        :disabled="(cel.attr&0x40)>0"
                    >
                        <template v-slot:edit="{row,rowIndex}">
                            <bip-comm-editor  :cell="cel" :cds="cds" :row="rowIndex" :bgrid="true"/> 
                        </template>
                        <template v-slot="{row,rowIndex}">
                            <bip-grid-info
                                :cds="cds"
                                :cell="cel"
                                :row="rowIndex"
                                :bgrid="true"
                            ></bip-grid-info>
                        </template>
                    </vxe-table-column>
                -->
            </vxe-table>
            <el-drawer append-to-body :visible.sync="addDrawer" direction="btt" size="50%" :withHeader="false" :wrapperClosable="false">
                <div class="myDrawer">
                    <el-scrollbar style="height:100%">
                        <base-layout :layout="lay" :env="env"></base-layout>
                    </el-scrollbar>
                </div>
                <div style="height:15%">
                    <el-row type="flex" justify="center">
                        <el-button @click="closeDrawer(false)">  取  消  </el-button>
                        <el-button @click="closeDrawer(true)" type="primary">  确  定  </el-button> 
                    </el-row>
                </div>
            </el-drawer>
        </template>
        <!-- 报表展示表格-->
        <template v-else>
            
            <vxe-table
                :ref="this.cds.ccells.obj_id"
                v-if="isTable"
                border
                resizable
                size="small"
                highlight-hover-row
                show-all-overflow="tooltip"
                show-header-overflow
                highlight-current-row
                class="vxe-table-element checkbox-table"
                :data.sync="cds.cdata.data"
                :optimized="true"
                :height="height"
                @cell-dblclick="openrefs"
                @cell-click="table_cell_click"
                @sort-change="sortChange"
                remote-sort
                :sort-config="{trigger: 'cell'}"
                :span-method="rowspanMethod"
                show-footer

                row-id="id"

                :row-class-name="getRowStyleNew"
                @checkbox-change="checkChange"
                @checkbox-all="checkChange"
                :checkbox-config="{checkField: 'checked',reserve:'true'}"
                > 
                <!-- :pager-config="tablePage"
                @page-change="handlePageChange" 分页信息 -->
                <!-- @cell-dblclick="openrefs" 双击 -->
                <!-- cds.page.pageSize<cds.page.total -->
                <!-- :select-config="{checkField: 'checked', trigger: 'row'}" -->
                <!-- <vxe-table-column type="selection" width="60"></vxe-table-column> -->
                <vxe-table-column v-if="(laycell.cells.attr & 0x40)>0" type="checkbox" width="60" fixed="left"></vxe-table-column>
                <vxe-table-column type="index" width="60" fixed="left"></vxe-table-column>
                <template v-for="(item,index) in groupCells">
                    <template v-if="item.type == ''">
                        <vxe-table-column :key="index" header-align="center" align="center" :field="item.cel.id"
                            :width="widths[item.cel.widthIndex]" :title="item.cel.labelString" show-header-overflow 
                            show-overflow :sortable ="(item.cel.attr&0x400000)>0" :fixed="isFixed(item.cel.widthIndex)" >
                            <template v-slot="{row,rowIndex}"> 
                                <bip-grid-info :cds="cds" :cell="item.cel" :row="rowIndex" :bgrid="true" ></bip-grid-info>
                            </template>
                        </vxe-table-column> 
                    </template>
                    <template v-else-if="item.type == 'g'"><!-- 表头分组 -->
                        <vxe-table-column :key="index" :title="item.name" header-align="center">
                            <vxe-table-column 
                                v-for="(cel,indexg) in item.cel" :key="indexg"
                                header-align="center" align="center" :field="cel.id"
                                :width="widths[cel.widthIndex]" :title="cel.labelString" show-header-overflow
                                show-overflow :sortable ="(cel.attr&0x400000)>0" :fixed="isFixed(index)" >
                                <template v-slot="{row,rowIndex}"> 
                                    <bip-grid-info :cds="cds" :cell="cel" :row="rowIndex" :bgrid="true" ></bip-grid-info>
                                </template>
                            </vxe-table-column>
                        </vxe-table-column>
                    </template>
                </template>

                <!-- <vxe-table-column
                    header-align="center"
                    align="center"
                    v-for="(cel,index) in laycell.uiCels"
                    :key="index"
                    :field="cel.id"
                    :width="widths[index]"
                    :title="cel.labelString"
                    show-header-overflow
                    show-overflow
                    :sortable ="(cel.attr&0x400000)>0"
                    :fixed="isFixed(index)"
                >
                    <template v-slot="{row,rowIndex}"> 
                        <bip-grid-info
                            :cds="cds"
                            :cell="cel"
                            :row="rowIndex"
                            :bgrid="true"
                        ></bip-grid-info>
                    </template>
                </vxe-table-column> -->
            </vxe-table>
            <template v-else>
                <div v-for="(dataIt,rowIndex) in cds.cdata.data" :key="rowIndex" class="accdiv">
                    <Accordion class="Accordion" :Accordionindex="1" :isSlotSecond="0">
                        <template slot="title">
                            <el-row style="width:100%">
                                <el-col v-for="(item,index) in laycell.uiCels" :key="index" :xs="24" :sm="24" :md="Math.round(24/cds.ccells.widthCell*item.ccHorCell)" :span="Math.round(24/cds.ccells.widthCell*item.ccHorCell)">
                                    <div v-if="(item.attr & 0x200) >0" class="piece">
                                        <el-row >
                                            <el-col :span="8">
                                                {{item.labelString}}
                                            </el-col>
                                            <el-col :span="16" style="overflow: hidden;white-space: nowrap;">
                                                <div @dblclick="cardClick(rowIndex,index,dataIt)">
                                                    <el-popover placement="top" width="160" trigger="hover" >
                                                        <bip-grid-info :cds="cds" :cell="item" :row="rowIndex" :bgrid="true" ></bip-grid-info>
                                                        <bip-grid-info slot="reference" :cds="cds" :cell="item" :row="rowIndex" :bgrid="true" ></bip-grid-info>
                                                    </el-popover>
                                                </div>
                                            </el-col>
                                        </el-row>
                                    </div>
                                </el-col>
                            </el-row>
                        </template>
                        <div slot="First">
                            <el-row style="width:100%">
                                <el-col v-for="(item,index) in laycell.uiCels" :key="index" :xs="24" :sm="24" :md="Math.round(24/cds.ccells.widthCell*item.ccHorCell)" :span="Math.round(24/cds.ccells.widthCell*item.ccHorCell)">
                                    <div v-if="(item.attr & 0x200) <=0" class="piece">
                                        <el-row>
                                            <el-col :span="8">
                                                {{item.labelString}}
                                            </el-col>
                                            <el-col :span="16" style="overflow: hidden;white-space: nowrap;">
                                                <div @dblclick="cardClick(rowIndex,index,dataIt)">
                                                    <el-popover placement="top" width="160" trigger="hover" >
                                                        <bip-grid-info :cds="cds" :cell="item" :row="rowIndex" :bgrid="true" style="text-align: start;"></bip-grid-info>
                                                        <bip-grid-info slot="reference" :cds="cds" :cell="item" :row="rowIndex" :bgrid="true" ></bip-grid-info>
                                                    </el-popover>
                                                </div>
                                            </el-col>
                                        </el-row>
                                    </div>
                                </el-col>
                            </el-row>
                            <div style="text-align: end;padding-right:5px;">
                                <el-row>
                                    <el-col v-for="(item,index) in cardMenuList" :key="index" :span="4">
                                        <template v-if="item.cmd == 'DLG'">
                                            <el-button :size="item.size" @click.native="invokecmd(item,rowIndex)" :disabled="!item.enable">
                                                {{item.name}}
                                            </el-button>
                                        </template>
                                    </el-col>
                                </el-row>
                            </div>
                        </div>
                    </Accordion>
                </div>
            </template>
        </template>
        <template v-if="beBill">
            <el-row >
                <el-pagination  
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page.sync="cds.page.currPage"
                    :page-size="cds.page.pageSize"
                    :page-sizes="[10, 20, 30,40,50]"
                    layout="slot,total,prev, pager, next,sizes"
                    :total="cds.page.total"
                >
                <el-col :span="18" :xs="18" :sm="18" :md="18" >
                    <el-button-group size="small" v-if="cds.ds_par">  
                        <el-button icon="el-icon-edit" @click="addRecord"></el-button>
                        <el-button icon="el-icon-delete" @click="delRecord"></el-button>
                        <!-- <el-button icon="el-icon-delete" @click="openDrawer"></el-button> -->
                    </el-button-group>
                </el-col>
                </el-pagination>
            </el-row>
        </template>
        <template v-else>
            <el-row style="margin-bottom:7px;">
                <el-pagination  
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page.sync="cds.page.currPage"
                    :page-size="cds.page.pageSize"
                    :page-sizes="[10, 20, 30,40,50]"
                    layout="total,prev, pager, next,sizes"
                    :total="cds.page.total"
                ></el-pagination>
                </el-row>
        </template>

        

    </div>
</template>
<script lang="ts">
import XEUtils from 'xe-utils'
import { DateUtils } from "../../utils/DateUtils";
import { GlobalVariable } from "../../utils/ICL";
import BipScriptProc from "../../classes/pub/BipScriptProc";
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import BipLayCells from "@/classes/ui/BipLayCells";
import { Cell } from "@/classes/pub/coob/Cell";
import CCliEnv from "@/classes/cenv/CCliEnv";
import CDataSet from "@/classes/pub/CDataSet";
import BipGridInfo from "../editorn/grid/BipGridInfo.vue";
import {CommICL} from '@/utils/CommICL'
let ICL = CommICL
import Accordion from '@/components/accordion/Accordion.vue'
import { BipLayout } from "@/classes/ui/BipLayout";
import QueryEntity from '@/classes/search/QueryEntity';
import { BIPUtil } from "@/utils/Request"; 
let tools = BIPUtil.ServApi
import { State, Action, Getter, Mutation } from 'vuex-class';
import { Menu } from "@/classes/Menu";
import CRecord from '../../classes/pub/CRecord';
import { BIPUtils } from "@/utils/BaseUtil";
import { connect } from 'echarts';
import { on } from 'cluster';
import { values } from 'xe-utils/methods';
let baseTool = BIPUtils.baseUtil;
@Component({
    components: {  BipGridInfo,Accordion }
})
export default class LayCelVexTable extends Vue {
    @Prop() laycell!: BipLayCells;
    @Prop() cds!: CDataSet;
    @Prop() pbuid!: string;
    @Prop() beBill!: boolean;
    @Prop() env!:CCliEnv;
    @Prop() config?:any

    @Provide() activeNames:any = ['1'];
    @Provide() height:string = "300px";
    @Provide() info: string = "infos";
    @Provide() clearable: boolean = true;
    @Provide() widths: Array<string> = new Array<string>();
    @Provide() id: string = "";
    @Provide() fixedColumn:number=0;//固定列数
    @Provide() span_id:any={};//合并列id
    @Provide() sum_id:any={};//合计列id
    @Provide() celClickTime:number =0;
    @Provide() removeData :Array<CRecord> =[];
    @Provide() rowClass:any = {};
    @Provide() isTable:boolean = false;
    @Provide() cardMenuList:any = []; 
    @Provide() addDrawer:boolean = false;//子表抽屉样式添加
    @Provide() lay: BipLayout = new BipLayout("");
    @Provide() drawerCurrRecord:CRecord = new CRecord();//子表抽屉样式时  当前选中行  用来处理 抽屉中 取消 操作

    @State("aidValues", { namespace: "insaid" }) aidValues: any;
    @Action("fetchInsAid", { namespace: "insaid" }) fetchInsAid: any;
    @Mutation("setAidValue", { namespace: "insaid" }) setAidValue: any;
    @Mutation("setAidInfo", { namespace: "insaid" }) setAidInfo: any;
    
    @Provide() datachangeBusID:number=0;
    @Provide() tableShapeBusID:number=0;
    @Provide() findBtnBusID:number=0;
    @Provide() groupCells:any = [];

    @Provide() multiple:boolean = false;//是否是多选
    @Provide() checkSelected:any = [];//当前页选中行集合
    @Provide() multipleSelectionAll:Array<any> = [];// 所有选中的数据包含跨页数据
    created() {
        if((this.laycell.cells.attr & 0x40)>0){
            this.multiple = true;
        }
        //组成多表头
        this.initGroup();
        if(this.config){
            if(this.config.type ==2){
                this.height = "450px"
            }else if(this.config.type ==3){
                this.height = "250px"
            }
        }
        this.initSfix();
        this.initWidth();
        // this.cds = this.env.getDataSet(this.laycell.obj_id);
        // this.beBill = this.env.uriParams.beBill;
        if(this.cds.x_pk>-1)
            this.id = this.laycell.cells.cels[this.cds.x_pk].id;
        if (!this.id) {
            this.id = this.laycell.cells.cels[0].id;
        }
    }

    headerCellStyle(column:any){
        let columnIndex = column.columnIndex;
        if(this.cds.ds_par){
            columnIndex--;
        }
        let cel =this.groupCells[columnIndex];
        if(cel){
            cel =cel.cel;
            if((cel.attr & 0x2) >0){
                return { color: 'red' }
            }
        }
    }

    async addRecord() {
        if(this.cds.currCanEdit()){
            if(this.cds.cdata.data.length>0){
                let bok = this.checkNotNull(this.cds); 
                if(!bok)
                    return ; 
            }
            //判断是否是第一次新建
            if(this.cds.cdata.data.length ==0){
                //第一次新建 判断一下sctrl 是否是需要中常量中取数
                let cc:boolean = await this.init9DData();// 返回false 继续执行之后的程序  返回true 跳出添加方法
                if(cc){
                    if(!this.isTable)
                        this.openDrawer();
                    return ;
                }
            }
            this.cds.createRecord();
            let cc:any = this.$refs[this.cds.ccells.obj_id];
            if(cc){ 
                cc.setCurrentRow(this.cds.currRecord); 
            }
            this.openInitEdit();
            this.cds.currRecord.c_state |= 2;
            if(this.cds.ds_par){
                this.cds.ds_par.currRecord.c_state |= 2;
            }
            if(!this.isTable)
                this.openDrawer();
        }
    }
    /**
     * 处理对象上  控制字段中的 `9D = 常量
     */
    async init9DData(){
        let bool = false;
        let sctrls = this.cds.ccells.sctrl;
        if(sctrls){
            let cc = sctrls.split(";");
            for(var i=0;i<cc.length;i++){
                let oneSc = cc[i];
                if(oneSc.indexOf('`9D')!=-1){
                    bool = true;
                    oneSc = oneSc.split('=')[1];
                    let data = await this.initCL(oneSc);
                    if(data && data.values.length >0){
                        let value = data.values;
                        let slink = data.slink;
                        slink = slink.substring(slink.indexOf("{")+1,slink.indexOf("}"))
                        let kvArr = slink.split(",");
                        for(var i=0;i<value.length;i++){
                            let vl = value[i];
                            this.cds.createRecord();
                            for(var key in this.cds.currRecord.data){
                                let cel:any = this.cds.getCell(key)
                                if(cel.initValue){
                                    this.cds.currRecord.data[key] = '';
                                }
                            }
                            for(var j =0;j<kvArr.length;j++){
                                let kv = kvArr[j].split("=");
                                this.cds.currRecord.data[kv[0]] = vl[data.cells.cels[kv[1]].id]
                            }
                            let cc:any = this.$refs[this.cds.ccells.obj_id];
                            if(cc){ 
                                cc.setCurrentRow(this.cds.currRecord); 
                            }
                        }
                        this.cds.currRecord.c_state |= 2;
                        if(this.cds.ds_par){
                            this.cds.ds_par.currRecord.c_state |= 2;
                        }
                    }else{
                        bool = false;
                    }
                }
            }
        }
        return bool;
    }
    delRecord(){
        console.log("delRecord")
        if(this.cds.currCanEdit() && this.removeData.length>0){
            this.cds.cdata.rmdata = this.removeData;
            // console.log(this.cds)
            for(var i=this.cds.cdata.data.length-1;i>=0;i --){
                let data = this.cds.cdata.data[i];
                for(var j =0;j<this.removeData.length;j++){
                    let rem = this.removeData[j];
                    if(rem.id == data.id){
                        this.cds.cdata.data.splice(i,1); 
                        this.cds.setState(2);
                    }
                }
            }
            let xinc = -1;
            if (this.cds.ccells.pkindex) xinc = this.cds.ccells.pkindex[0];
            if (xinc >= 0) {
                let cel = this.cds.ccells.cels[xinc];
                let s0 = cel.psAutoInc;
                if (s0 == null || s0 == undefined || s0.length < 1 || cel.type !== 12) {
                    for(var i=0;i<this.cds.cdata.data.length;i++){
                        this.cds.cdata.data[i].data[cel.id] = i + 1
                    }
                }
            }
            let cc:any = this.$refs[this.cds.ccells.obj_id];
            if(cc){
                if(this.cds.currRecord){
                    setTimeout(() => {
                        // cc.refreshData();
                        cc.clearCurrentRow()
                    }, 200);
                }
            }
            this.cds.currRecord.c_state |= 2;
            if(this.cds.ds_par){
                this.cds.ds_par.currRecord.c_state |= 2;
            }
        }
    }
    initWidth() {
        if (this.laycell) {
            this.laycell.uiCels.forEach(cel => {
                if (cel.isShow) {
                    let w1 = cel.ccCharleng;
                    if (!cel.id.startsWith("cid")) {
                        w1 = w1 < 10 ? 8 : w1;
                    }
                    let w = w1 * 9 + 20;
                    if (w > 200) w = 200;
                    this.widths.push(w + "");
                }
            });
        }
    }

    getNumChar(cell: any): number {
        let cn = cell.ccCharleng;
        return cn;
    }

    rowActive(rowInfo: any, event: any) {
        this.cds.currRecord = this.cds.getRecordAtIndex(rowInfo.rowIndex);
        this.cds.index = rowInfo.rowIndex;
    }

    editClose(rowInfo: any, event: any) {
        this.cds.currRecord = this.cds.getRecordAtIndex(rowInfo.rowIndex);
    }

    activeMethod() {
        if((this.cds.ccells.attr & 0x8 )>0){
            return false;
        }
        return true;
    }

    handleSizeChange(value: number) {
        if(this.multiple){
            this.changePageCoreRecordData();
        }
        if((this.cds.currRecord.c_state&1)>0){
            return ;
        }
        this.cds.cdata.clearValues();
        this.$emit("handleSizeChange", value);
    }

    handleCurrentChange(value: number) {
        if(this.multiple){
            this.changePageCoreRecordData();
        }
         if((this.cds.currRecord.c_state&1)>0){
            return ;
        }
        this.cds.cdata.clearValues();
        this.cds.clear();
        this.$emit("handleCurrentChange", value);
    }
    /**排序发生变化 */
    sortChange(column:any){
        let orderby = column.prop+" "+column.order;
        this.$emit("sortChange", orderby);
    }
    async cardClick(rowIndex:any,index:any,data:any){
        let data1 = {rowIndex:rowIndex,columnIndex:index+1,row:{data:data.data}};
        await this.openrefs(data1,null)
    }
    /** 
     * 字段点击进行跳转操作
     */
    async openrefs(data:any,event:any){
        this.cds.currRecord = this.cds.getRecordAtIndex(data.rowIndex);
        let row = data.row.data
        let rowIndex = data.rowIndex
        let columnIndex = data.columnIndex
        if(columnIndex > 0){
            let cell = this.laycell.uiCels[columnIndex]

            if(!this.beBill){
                cell = this.laycell.uiCels[columnIndex-1]
                if((this.laycell.cells.attr & 0x40)>0){
                    cell = this.laycell.uiCels[columnIndex-2]
                }
            }else{
                if(this.cds.ds_par){
                    cell = this.laycell.uiCels[columnIndex-1]
                }
            }
            if( (cell.attr & 1) >0 || (cell.attr & (0x80000)) >0 ) { // 0主键   0x80000关联
                let slkid = row[cell.id];
                if ((cell.attr & 0x80000) > 0) {//关联
                    let allCels = this.laycell.cells.cels;
                    let slkbuidCell = null;
                    for(var i=0;i<allCels.length;i++){
                        let oneCel = allCels[i];
                        if(oneCel.id == cell.id){
                            slkbuidCell = allCels[i+1];
                            break;
                        }
                    } 
                    let slkbuid = ''
                    if(slkbuidCell)
                        slkbuid = row[slkbuidCell.id];
                    let data = null;//获取常量定义的 BL_菜单参数_字段ID 进行菜单打开
                    let name = "BL_"+this.pbuid+"_"+cell.id;
                    data = await this.initCL(name);
                    if(data == null){
                        if (slkid && slkbuid) { 
                            //获取业务定义
                            let param = await tools.getBULinks(slkbuid);
                            if(param.data.id ==0){
                                let opera = param.data.data.opt;
                                if (opera&&!opera.pmenuid) {
                                    this.$notify.error("业务" + slkbuid + "没有绑定菜单!"); 
                                    return false;
                                }
                                let me = baseTool.findMenu(opera.pmenuid);
                                if (!me) {
                                    this.$notify.error( "没有" + opera.pmenuid + "菜单权限!" );
                                    return false;
                                }else{
                                    let command = me.command.split("&");
                                    let pbuid = command[0].split("=");
                                    let pmenuid = command[1].split("="); 
                                    setTimeout(() => {
                                        this.$router.push({
                                            path:'/layout',
                                            name:'layout',
                                            params:{method:"pkfld",pkfld:opera.pkfld,value:slkid},
                                            query: {pbuid:pbuid[1],pmenuid:pmenuid[1]},
                                        })    
                                    }, 600);
                                }
                            }  
                        }
                    }else{
                        //BL字段点击
                        let slink = data.slink;
                        if(slink){
                            slink = slink.split("&");
                            let menuid = slink[0]
                            let me = baseTool.findMenu(menuid);
                            if (!me) {
                                this.$notify.error( "没有" + menuid + "菜单权限!" );
                                return false;
                            }else{
                                let jsontj:any={};
                                for(var i=1;i<slink.length;i++){
                                    let oneTJ = slink[i].split("=")
                                    let key = oneTJ[0];
                                    let vl = oneTJ[1]
                                    if(vl.indexOf("*") !=-1 ){
                                        let cds = this.env.getDataSet(vl.split("*")[0]);
                                        vl = cds.currRecord.data[vl.split("*")[1]]
                                    }else{
                                        vl = this.cds.currRecord.data[vl]
                                    }
                                    jsontj[key] = vl;
                                }

                                let command = me.command.split("&");
                                let pbuid = command[0].split("=");
                                let pmenuid = command[1].split("="); 
                                this.$router.push({
                                    path:'/layout',
                                    name:'layout',
                                    params:{method:"BL",pmenuid:pmenuid[1],jsontj:jsontj },
                                    query: {pbuid:pbuid[1],pmenuid:pmenuid[1]},
                                })
                            }
                        }

                        console.log(data);
                    }
                }else{
                    console.log('主键点击')
                }
            }
        }
    }

    table_cell_click(data:any,event:any){ 
        console.log("单元格单击事件")
        setTimeout(() => {
            this.cds.index = data.rowIndex;
            let value = {row:data.row,rowIndex:data.rowIndex,columnIndex:data.columnIndex,dsm:this.cds};
            this.cds.currRecord = this.cds.getRecordAtIndex(data.rowIndex);
            this.$bus.$emit("row_click",value);    
            // if(this.cds.ds_sub){
            //     for(var i=0;i<this.cds.ds_sub.length;i++){
            //         let cc = this.cds.ds_sub[i];
            //         this.$bus.$emit("datachange",cc.ccells.obj_id)
            //     }
            // }
        }, 250);
    }
    invokecmd(btn:any,rowIndex:any){
        this.cds.index = rowIndex;
        this.cds.currRecord = this.cds.getRecordAtIndex(rowIndex);
        let value = {row:this.cds.currRecord ,rowIndex:rowIndex,dsm:this.cds};
        this.$bus.$emit("row_click",value);    
        this.$emit("invokecmd",btn)
    }
    checkChange(data:any){
        this.checkSelected =  data.selection;
        let cc:any = this.$refs[this.cds.ccells.obj_id];
        if(cc){
            setTimeout(() => {
                cc.setCurrentRow(this.cds.cdata.data[data.rowIndex]);
            }, 200);
        }
        this.changePageCoreRecordData();
        this.cds.currRecordArr = this.multipleSelectionAll;
    }
    /**current 发送变化  键盘事件 暂未用到 */
    current_change(data:any,event:any){ 
        this.table_cell_click(data,event)
    }

    selectChangeEvent ({ selection,checked,}:any) {
        this.removeData = selection;
        for(var i=0;i<this.removeData.length;i++){
            this.removeData[i].c_state =4;
        }
    }

    /**
     * BL_菜单参数_字段ID 定义
     */
    async initCL(name:string){
        // let name = "BL_"+this.pbuid+"_"+id;
        let str = name
        // let dlg = await pubMethod.getConstant(str);
        str = ICL.AID_KEYCL+str;
        let eq = new QueryEntity('','');
        if(this.cds.ds_par){
            eq.pcell = this.cds.ds_par.ccells.obj_id;
            eq.cont = this.cds.ds_par.currRecord.data;
        }else{
            eq.pcell = this.cds.ccells.obj_id;
            eq.cont = this.cds.currRecord.data;
        }
        let vars = {id:300,aid:name,eq:eq}
        await this.fetchInsAid(vars);
        let vv  = window.sessionStorage.getItem(str)
        if(vv){
            let vals = {key:str,value:JSON.parse(vv)}
            this.setAidValue(vals)
        }
        return this.aidValues.get(str);
    }
    mounted(){ 
        let pbds = this.env.uriParams.pbds;
        if(pbds.layout && pbds.layout == 'card'){
            this.isTable = false;
        }else{
            this.isTable = true;
        }
        this.datachangeBusID = this.$bus.$on('datachange',this.datachange)
        this.tableShapeBusID = this.$bus.$on('ReportTableShape',this.ReportTableShape);
        this.findBtnBusID = this.$bus.$on('findBtnClick',this.findBtnClick);
    }
    beforeDestroy(){
        this.$bus.$off('datachange',this.datachangeBusID)
        this.$bus.$off('ReportTableShape',this.tableShapeBusID)
        this.$bus.$off('findBtnClick',this.findBtnBusID)
    }
    findBtnClick(obj_id:string =''){
        this.multipleSelectionAll=[];
        this.checkSelected=[];
        this.cds.currRecordArr=[];
        this.datachange(obj_id);
    }
    datachange(obj_id:string =''){
        console.log("dataChange")
        if(this.cds.ccells)
        if(obj_id == this.cds.ccells.obj_id){
            let cc:any = this.$refs[this.cds.ccells.obj_id];
            if(cc){
                if(this.cds.currRecord && Object.keys(this.cds.currRecord.data).length>0){
                    setTimeout(() => {
                        // cc.loadData(this.cds.cdata.data)
                        cc.clearCurrentRow()
                        cc.setCurrentRow(this.cds.currRecord);
                        // cc.syncData();
                        // cc.refreshData();
                        // cc.toggleRowSelection(this.cds.currRecord);
                        // this.checkChange({selection:[this.cds.currRecord],rowIndex:0})
                    }, 200);
                }
            }
        }
        
        // this.rowCheckGS();
    }
    rowCheckGS(){
        console.log("CheckGS")
        for(var i=0;i<this.cds.cdata.data.length;i++){
            let crd = this.cds.getRecordAtIndex(i);
            let scriptProc = new BipScriptProc(crd, this.cds.ccells);
            this.cds.ccells.cels.forEach(col => {
                let scstr = col.script;
                if (scstr && scstr.indexOf("=:") === 0) {
                    scstr = scstr.replace("=:", "");
                    // 公式计算
                    var vl = scriptProc.execute(scstr, "", col);
                    if (vl instanceof Array) {
                    } else {
                        if (vl == "Invalid date") {
                            let dd = DateUtils.DateTool.now();
                            if (col.type == 91) {
                                crd.data[col.id] = DateUtils.DateTool.getDate(dd,GlobalVariable.DATE_FMT_YMD);
                            } else {
                                crd.data[col.id] = dd;
                            }
                        } else {
                            crd.data[col.id] = vl;
                        }
                    } 
                }
                if(scstr){
                    if(col.initValue && (col.attr &0x80 )>0){
                        if(col.initValue.indexOf("%") >0 ){
                            let scval = "%";
                            if(crd.data[scstr]){
                            scval = crd.data[scstr];
                            }
                            console.log(crd.data[col.id]);
                            let vl = col.initValue.replace("%",scval);
                            crd.data[col.id] = vl;
                        }
                    }
                }
            }); 
        }
    }
    /**解析分组字段 目前只解析了固定表头 */
    initSfix(){
        let sfix = this.cds.ccells.sfix;
        this.fixedColumn =0;
        if(sfix){
            let num:string = '';
            if(sfix.indexOf("/") >=0){
                num = sfix.substring(0,sfix.indexOf("/") )
            }else{
                if(sfix.indexOf("&") >=0){ 
                num = "0";
                }else{
                num = sfix;
                }
            }
            this.fixedColumn = parseInt(num);
          }
    }
    isFixed(index:number) {
      //固定列
      if (this.cds.ccells.sfix) {
        if (index < this.fixedColumn) {
          return "left";
        }
      }
    }
    //合并行或列，该函数 Function({seq, row, rowIndex, column, columnIndex, data}) 返回计算后的值
    rowspanMethod (row:any) {  
        let $rowIndex = row.$rowIndex;
        let data = row.data;
        let column = row.column;
        if(this.span_id !=null){ 
            var arr = Object.keys(this.span_id);
            if(arr.length ==0){
            let cels = this.cds.ccells.cels;
            for(var i=0 ;i<cels.length;i++){
                let cel = cels[i];
                if((cel.attr & 0x10000000)>0){
                this.span_id[cel.id]=cel.id;
                }
            }
            var arr = Object.keys(this.span_id);
                if(arr.length ==0){ 
                    this.span_id =null;
                    return;
                }
            }
            let prevRow = data[$rowIndex - 1]
            let nextRow = data[$rowIndex + 1]
            if (this.span_id[column.property]) {
                let cellValue = row.row.data[column.property]
                if (prevRow && prevRow.data[column.property] === cellValue) {
                    return {rowspan: 0,colspan: 0}
                }else{
                    let countRowspan = 1
                    while (nextRow && nextRow.data[column.property] === cellValue) {
                        nextRow = data[++countRowspan + $rowIndex]
                    }
                    if (countRowspan > 1) {
                        return { rowspan: countRowspan, colspan: 1 }
                    }
                }
            }
        }
    } 
    /**
     * 初始化行调用的辅助
     */
    openInitEdit(){
        for(var i=0;i<this.laycell.uiCels.length;i++){
            let cel = this.laycell.uiCels[i];
            if(baseTool.bitOperation(cel.attr,0x20000000000)>0){
                let cc:any = this.$refs[this.cds.ccells.obj_id];
                if(cc){
                    if(this.cds.currRecord){
                        setTimeout(() => {
                            cc.setActiveCell(this.cds.currRecord,cel.id);
                        }, 200);
                    }
                }
                break;
            }
        }
    }
    //组成表头分组
    initGroup(){
        let cells = [];
        let sfix = this.laycell.cells.sfix;
        if(sfix){
            let arr = sfix.split("&")
            sfix = arr[arr.length-1];
            let group = sfix.split(";") 
            for(var j=0;j<this.laycell.uiCels.length;j++){
                let g:any = {type:'',name:'',cel:null};
                let cel = this.laycell.uiCels[j];
                cel.widthIndex = j;
                let cc = null;
                for(var i=0;i<group.length;i++){//day2,0,2,1,下班时间
                    let oneG = group[i].split(",");
                    if(cel.id == oneG[0]){
                        let num:number = parseInt(oneG[2]);
                        let cels =[]
                        for(var p=0;p<num;p++){
                            let cc = this.laycell.uiCels[j+p];
                            cc.widthIndex = j+p
                            cels.push(cc);
                        }
                        g.type = 'g';
                        g.name = oneG[4];
                        g.cel = cels;
                        j = j+num-1;
                        break;
                    }
                }
                if(g.cel ==null){
                    g.type = '';
                    g.name = '';
                    g.cel = cel;
                }
                cells.push(g);
            }
        }else{
             for(var j=0;j<this.laycell.uiCels.length;j++){
                let g:any = {type:'',name:'',cel:null};
                let cel = this.laycell.uiCels[j];
                cel.widthIndex=j;
                g.type = '';
                g.name = '';
                g.cel = cel; 
                cells.push(g);
             }
        } 
        this.groupCells = cells;
    }
    //为行添加新的样式
    getRowStyleNew(column:any){
        let sctrls =this.cds.ccells.sctrl;
        let row = column.row;
        if(sctrls){
            let cc = sctrls.split(";");
            for(var i=0;i<cc.length;i++){
                let oneSc = cc[i];
                if(oneSc.indexOf('`5')!=-1){
                    //`5tkstate/A:red,B:blue,C:green
                    let zd = oneSc.substring(2,oneSc.indexOf("/"))
                    let vl =  sctrls.split("/")[1].split(",");
                    let rowVl = row.data[zd];
                    for(var j=0;j<vl.length;j++){
                        let oneV = vl[j].split(":");
                        if(rowVl == oneV[0]){
                            if(this.rowClass['sctrl'+oneV[0]]){
                                return this.rowClass['sctrl'+oneV[0]];
                            }
                            console.log("动态创建CSS")
                            // 创建我们的样式表
                            var style = document.createElement('style');
                            style.innerHTML =
                                '.sctrl'+oneV[0]+' {' +
                                    'background-color: '+oneV[1]+' !important;' +
                                    'color: #FFFFFF !important;' +
                                '}';
                            // 获取第一个脚本标记
                            var ref:any = document.querySelector('script');
                            // 在第一个脚本标签之前插入新样式
                            if(ref != null)
                                ref.parentNode.insertBefore(style, ref);
                            this.rowClass['sctrl'+oneV[0]]='sctrl'+oneV[0];
                            return 'sctrl'+oneV[0];
                        }
                    }
                }else{
                    return {
                        'row-checked': column.row.checked
                    }
                }
            } 
        }else{
            return {
                'row-checked': column.row.checked
            }
        }
    }

    /**
     * 报表是Card布局还是Table布局
     */
    ReportTableShape(data:Array<any>){
        if(data){
            let pbuid = data[0]
            if(pbuid)
            if(pbuid == this.pbuid){
                this.isTable = !this.isTable;
            }
            if(data.length ==3){
                this.isTable =false;
            }
            this.cardMenuList = data[1].menuList
            console.log(this.cardMenuList);
        }
    }
    //子表添加转抽屉样式
    openDrawer(){
        this.lay.layType="B";
        this.lay.laystr="B:(@"+this.cds.ccells.obj_id+")";
        this.lay.ccells = [this.cds.ccells];
        this.lay = new BipLayout(this.lay.laystr,this.lay.ccells)
        this.addDrawer = !this.addDrawer;
        this.drawerCurrRecord = JSON.parse(JSON.stringify(Object.assign({},this.cds.currRecord)));
    }
    closeDrawer(isOk:boolean){
        this.addDrawer = !this.addDrawer;
        if(isOk == false){
            console.log("取消")
            this.cds.currRecord = this.drawerCurrRecord;
            this.cds.cdata.data[this.cds.index] = this.cds.currRecord
            this.datachange(this.cds.ccells.obj_id)
        }
    }

    // 设置选中的方法
    @Watch("cds",{deep:true})
    cdsChageSetSelectRow(){
        if(this.multiple){
            this.checkSelected = this.multipleSelectionAll;
            this.setSelectRow();    
        }
    }

    setSelectRow() {
        if (!this.multipleSelectionAll || this.multipleSelectionAll.length <= 0) {
            return;
        }
        
        let selectAllIds:any = [];
        let that = this;
        this.multipleSelectionAll.forEach(row => {
            selectAllIds.push(JSON.stringify(row.data));
        }); 
        let reft:any = this.$refs[this.cds.ccells.obj_id];
        if(reft){
            reft.clearSelection();
            let currD=[]
            for (var i = 0; i < this.cds.cdata.data.length; i++) {
                if (selectAllIds.indexOf(JSON.stringify(this.cds.cdata.data[i].data)) >= 0) {
                    currD.push(this.cds.cdata.data[i]);
                }
            }
            reft.setSelection(currD, true)
        }
        this.cds.currRecordArr = this.multipleSelectionAll;
    }
    // 记忆选择核心方法
    changePageCoreRecordData() {
        
      let that = this;
      // 如果总记忆中还没有选择的数据，那么就直接取当前页选中的数据，不需要后面一系列计算
      if (this.multipleSelectionAll.length <= 0) {
        this.multipleSelectionAll = this.checkSelected;
        return;
      }
      // 总选择里面的key集合
      let selectAllIds:any = [];
      this.multipleSelectionAll.forEach(row => {
        selectAllIds.push(JSON.stringify(row.data));
      });
      let selectIds:any = [];
      // 获取当前页选中的id
      this.checkSelected.forEach((row:any) => {
        selectIds.push(JSON.stringify(row.data));
        // 如果总选择里面不包含当前页选中的数据，那么就加入到总选择集合里
        if (selectAllIds.indexOf(JSON.stringify(row.data)) < 0) {
          that.multipleSelectionAll.push(row);
        }
      });
      let noSelectIds:any = [];
      // 得到当前页没有选中的id
      this.cds.cdata.data.forEach(row => {
        if (selectIds.indexOf(JSON.stringify(row.data)) < 0) {
          noSelectIds.push(JSON.stringify(row.data));
        }
      });
      noSelectIds.forEach((id:any) => {
        if (selectAllIds.indexOf(id) >= 0) {
          for (let i = 0; i < that.multipleSelectionAll.length; i++) {
            if (JSON.stringify(that.multipleSelectionAll[i].data) == id) {
              // 如果总选择中有未被选中的，那么就删除这条
              that.multipleSelectionAll.splice(i, 1);
              break;
            }
          }
        }
      });
    }


    checkNotNull(cds:CDataSet):boolean{
            let bok = true;
            cds.ccells.cels.forEach(item => {
                if (item.unNull&&bok) {
                    let vl = null;
                    let hide:any = [];
                    if(cds.currRecord.data[item.id]!=null)
                        vl = cds.currRecord.data[item.id]+'';
                    if (!vl && hide.indexOf(item.id) == -1) {
                        this.$notify.warning( "【" + item.labelString + "】不能为空!");
                        bok =  false;
                        return false;
                    }
                }
            }); 
            return bok;
        }
    }
</script>
<style lang="scss" scoped>
.sum{
    min-width: 130px;
    padding: 5px 10px;
    height: 32px;
    text-align: center;
    line-height: 32px;
    background: #1ab394;
    border-radius: 20px;
    color: #fff;
    font-size: 14px;
}
.Accordion{
    background-color: #fff;
}
.accdiv{
    padding: 6px;
    background-color: #eaeaea;
}
.piece{
    padding: 5px 10px;
    width:95%;
}
.myDrawer{
    
    overflow: hidden;
    height:85%;
    overflow: hidden;
    .el-scrollbar {
        height: calc(100% + 40px) !important; 
        padding-bottom: 20px;
        .el-scrollbar__wrap {
            overflow-x: hidden !important;
            padding-right: 5px;
            height: 100%;
        }
    }
}
</style>