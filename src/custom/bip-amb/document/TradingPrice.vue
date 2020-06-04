<template> 
    <el-container v-loading="loading">
        <el-header style="height:45px;padding:0px 10px">
            <Accounting @dataChange="accChange" class="topdiv1"></Accounting>
            
            <div class="topdiv2"><!-- 刷新 -->
                <el-button style="border:0px" @click="filter">      
                    <i class="el-icon-search"></i>
                    <span>过滤</span>
                </el-button>
            </div> 
            <!-- <div class="topdiv2">
                <el-button style="border:0px">      
                    <i class="el-icon-plus"></i>
                    <span>导入</span>
                </el-button>
            </div> -->
            <div class="topdiv2"><!-- 刷新 -->
                <el-button style="border:0px" @click="initDataPrice">      
                    <i class="el-icon-refresh-right"></i>
                    <span>刷新</span>
                </el-button>
            </div> 
        </el-header>
        <el-container style="border-top: 1px solid #CCCCCC;">
            <el-header style="height: auto;">
                <template v-if="showFilter">
                    <el-form label-position="right" label-width="100px" style="display: flow-root;">
                        <div v-for="(cel,index) in dataPDelTJCell.ccells.cels" :key="'A'+index">
                            <bip-comm-editor v-if="(cel.attr&0x400) <= 0 " :cell="cel" :bgrid="false" :cds="dataPDelTJCell" :row="0"/>
                        </div>
                        <el-button @click="initDataPrice" style="margin: 4px 20px;" size="mini">      
                            <i class="el-icon-search"></i>
                            <span>搜索</span>
                        </el-button>
                    </el-form>
                </template>
                <el-select class="topdiv1" v-model="priceglVal" placeholder="请选择价表" size="small">
                    <el-option v-for="item in priceglValues" :key="item.id" :label="item.name" :value="item.id"></el-option>
                </el-select>
                <el-date-picker size="small" class="topdiv1" v-model="selTime"  type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>

                <div class="topdiv2"><!-- 刷新 -->
                    <el-button style="border:0px" @click="showPriceCategories">      
                        <i class="el-icon-refresh-right"></i>
                        <span>管理价表</span>
                    </el-button>
                </div> 
            </el-header>
            <el-main style="padding:0px">
                <vxe-table border resizable :data="tableData" size="mini" :style="'height:'+tableHeight+'px'">
                    <vxe-table-column type="expand" width="60">
                        <template v-slot="{ row, }">
                            <vxe-table border resizable size="mini" :data="row.lines" style="padding:0px" align="life">
                                <vxe-table-column type="seq" width="60"></vxe-table-column>
                                <vxe-table-column field="fm_date" width="100" title="开始日期"></vxe-table-column>
                                <vxe-table-column field="to_date" width="100" title="结束日期"></vxe-table-column>
                                <vxe-table-column field="cost_price" width="100" title="价格"></vxe-table-column>
                                <vxe-table-column align="right">
                                    <template v-slot="{ row }" >
                                        <el-button type="text" @click="updateDP(row)">编辑</el-button>
                                        <el-button type="text" @click="deleteDP(row)">删除</el-button>
                                    </template>
                                </vxe-table-column>
                            </vxe-table>
                        </template>
                    </vxe-table-column> 
                    <vxe-table-column width="120" header-align="center" align="left" title="价表" show-header-overflow >
                        <template v-slot="{row}"> 
                            {{row.category_name}}
                        </template>
                    </vxe-table-column>  
                    <vxe-table-column width="500" header-align="center" align="left" title="物料" show-header-overflow >
                        <template v-slot="{row}">
                            {{row.item_name}}( {{row.item_code}})
                        </template>
                    </vxe-table-column> 
                    <vxe-table-column width="160" field="fm_group_id" align="left" title="来源巴">
                        <template v-slot="{row}"> 
                            {{row.fm_group_name}}
                        </template>
                    </vxe-table-column>
                    <vxe-table-column  width="160" field="to_group_id" align="left" title="目标巴">
                        <template v-slot="{row}"> 
                            {{row.to_group_name}}
                        </template>
                    </vxe-table-column>
                    <vxe-table-column  width="60" field="cost_price" align="left" title="最新价">
                        <template v-slot="{row}">
                            {{row.cost_price}}
                        </template>
                    </vxe-table-column>
                    <vxe-table-column align="right">
                        <template v-slot="{ row }" >
                            <el-button type="text" @click="debugPrice(row)">调价</el-button>
                            <el-button type="text" @click="deletePriceByBizKey(row)">删除</el-button>
                        </template>
                    </vxe-table-column>
                </vxe-table>
                <template v-if="priceglVal">
                    <el-button style="border:0px;width:100%" @click="goToNewData">      
                        <i class="el-icon-plus"></i>
                        <span>新增</span>
                    </el-button> 
                </template>
                <vxe-pager :current-page="tablePage.currPage" :page-size="tablePage.pageSize"
                    :total="tablePage.total" @page-change="tablePageChange"
                    :layouts="['PrevPage', 'JumpNumber', 'NextPage', 'FullJump', 'Sizes', 'Total']">
                </vxe-pager>
            </el-main>
        </el-container>


        <el-dialog title="管理价表" :close-on-click-modal="false" append-to-body :visible.sync="showPriceCategoriesDlg" width="50%" class="bip-query">
            <vxe-table height="300" resizable :data="priceCData" size="mini">
                <vxe-table-column field="code" title="编码" width="150">
                    <template v-slot="{ row }">
                        {{row.data.code}}
                    </template>
                </vxe-table-column>
                <vxe-table-column field="name" title="名称" width="300">
                    <template v-slot="{ row }">
                        {{row.data.name}}
                    </template>
                </vxe-table-column> 
                <vxe-table-column title="操作">
                    <template v-slot="{ rowIndex }">
                        <el-button @click="updatePriceC(rowIndex,'up')" type="text">编辑</el-button>
                        <el-button @click="updatePriceC(rowIndex,'dl')" type="text">删除</el-button>
                    </template>
                </vxe-table-column>
            </vxe-table>
            <el-button style="border:0px;width: 100%;" @click="createPriceC">      
                <i class="el-icon-plus"></i>
                <span>添加</span>
            </el-button>
            <vxe-pager border size="mini" :current-page="priceCPage.currPage" :page-size="priceCPage.pageSize"
                :total="priceCPage.total" :layouts="['PrevPage', 'JumpNumber', 'NextPage', 'FullJump', 'Sizes', 'Total']"
                @page-change="priceCPageChange">
            </vxe-pager>
            <el-dialog width="45%" :close-on-click-modal="false" :title="prusdlgTitle" append-to-body :visible.sync="showPriceCategoriesUSDlg">
                <el-row class="bip-lay">
                    <el-form @submit.native.prevent label-position="right" label-width="100px">
                        <div v-for="(cel,index) in priceCCell.ccells.cels" :key="'A'+index">
                            <bip-comm-editor v-if="(cel.attr&0x400) <= 0 " :cell="cel" :bgrid="false" :cds="priceCCell" :row="0"/>
                        </div>
                    </el-form>
                </el-row>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="showPriceCategoriesUSDlg = false" size="mini">取 消</el-button>
                    <el-button type="primary" @click="savePriceC" size="mini">确 定</el-button>
                </span>
            </el-dialog>
        </el-dialog>
        
        <el-dialog :title="title" :close-on-click-modal="false" append-to-body :visible.sync="showDataPriceDlg" width="50%" class="bip-query">
            <el-row class="bip-lay">
                <el-form @submit.native.prevent label-position="right" label-width="100px">
                    <div v-for="(cel,index) in dataPricesCell.ccells.cels" :key="'A'+index">
                        <bip-comm-editor v-if="(cel.attr&0x400) <= 0 " :cell="cel" :bgrid="false" :cds="dataPricesCell" :row="0"/>
                    </div>
                </el-form>
            </el-row>
            <span slot="footer" class="dialog-footer">
                <el-button @click="showDataPriceDlg = false" size="mini">取 消</el-button>
                <el-button type="primary" @click="saveUpdate" size="mini">确 定</el-button>
            </span>
        </el-dialog>

        <el-dialog title="价表" :close-on-click-modal="false" append-to-body :visible.sync="showNewDataPriceDlg" width="50%" class="bip-query">
            <el-row class="bip-lay">
                <el-form @submit.native.prevent label-position="right" label-width="100px">
                    <div v-for="(cel,index) in dataPDSaveCell.ccells.cels" :key="'A'+index">
                        <bip-comm-editor v-if="(cel.attr&0x400) <= 0 " :cell="cel" :bgrid="false" :cds="dataPDSaveCell" :row="0"/>
                    </div>
                </el-form>
            </el-row>
            <span slot="footer" class="dialog-footer">
                <el-button @click="showNewDataPriceDlg = false" size="mini">取 消</el-button>
                <el-button type="primary" @click="saveNewDate" size="mini">确 定</el-button>
            </span>
        </el-dialog>
    </el-container>
</template>
<script lang="ts">
import { Component, Vue, Provide, Watch } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from 'vuex-class';
import {BipMenuBtn} from '@/classes/BipMenuBtn'
import Accounting from "../components/Accounting.vue"//核算目的
import QueryCont from "@/classes/search/QueryCont";
import { Cells } from "@/classes/pub/coob/Cells";
import CDataSet from "@/classes/pub/CDataSet";
import CData from '@/classes/pub/CData';
import QueryEntity from "@/classes/search/QueryEntity";
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi;
import moment from 'moment'
import BipGridInfo from "@/components/editorn/grid/BipGridInfo.vue";
@Component({
    components: {
        Accounting,
        BipGridInfo
    }
})
/**
 * 交易价表
 */
export default class TradingPrice extends Vue {
    @State('bipComHeight', { namespace: 'login' }) height!: number;
    tableHeight:any = 500//高度 
    amb_purposes_id:any = null;//核算目的 
    loading:boolean = false;
 
    priceglVal:any = null;//选中价表
    priceglValues:any = [];//价表集合
    selTime:any = null;//查询期间

    showPriceCategoriesDlg:boolean = false;//是否显示管理价表弹出框
    showPriceCategoriesUSDlg:boolean = false;//是否显示管理报价表 新增修改 弹出框
    prusdlgTitle:any = "";//管理报价表 新增修改 弹出框标题

    priceCCell:CDataSet = new CDataSet("");//管理价表
    priceCCellID:any ="3002B03WEB";//管理价表
    priceCPage:any = { total: 0, currPage:1, pageSize:20 };//管理价表分页信息
    priceCData:any = [];


    dataPricesCell:CDataSet = new CDataSet("");
    dataPricesCellID:any = "3002B05WEB";
    showDataPriceDlg:boolean = false;
    title:any = "价表";
    tablePage:any ={
        total: 0,
        currPage:1,
        pageSize:20
    };
    tableData:any =[];

    
    dataPDelCell:CDataSet = new CDataSet("");
    dataPDelCellID:any = "3002B05WEBDEL";

    dataPDSaveCell:CDataSet = new CDataSet("");
    dataPDSaveCellID:any = "3002B05WEBSAVE";

    showNewDataPriceDlg:boolean = false;

    dataPDelTJCell:CDataSet = new CDataSet("");
    dataPDelTJCellID:any = "3002B05WEBTJ";

    showFilter:boolean = false;

    async created() {
        this.tableHeight =  this.height -200
        this.priceCCell = await this.getCell(this.priceCCellID); 
        this.dataPricesCell = await this.getCell(this.dataPricesCellID); 
        this.dataPDelCell = await this.getCell(this.dataPDelCellID); 
        this.dataPDSaveCell = await this.getCell(this.dataPDSaveCellID); 
        this.dataPDelTJCell = await this.getCell(this.dataPDelTJCellID);
    }

    mounted() { 
    }  
    //获取价表
    async initWebPRICEGL(){
        this.loading = true;
        let qe: QueryEntity = new QueryEntity("", "");
        qe.page.currPage = 1;
        qe.page.pageSize = 50000; 
        let oneCont = [];  
        let qCont = new QueryCont('purpose_id',this.amb_purposes_id,12);
        oneCont.push(qCont); 
        qe.cont = "~["+JSON.stringify(oneCont)+"]";
        let res = await tools.getBipInsAidInfo("PRICEGLWEB", 210, qe);
        if(res.data.id ==0 ){
            let vals = res.data.data.data.values;
            this.priceglValues = vals;
        }
        this.loading = false;
    }
    //管理价表
    async showPriceCategories(){
        this.loading = true;
        let qe:QueryEntity = new QueryEntity(this.priceCCellID,this.priceCCellID);
        qe.page = this.priceCPage;
        qe.cont = JSON.stringify({purpose_id:this.amb_purposes_id})
        let res = await this.priceCCell.queryData(qe);
        if(res.data.id == 0){
            this.priceCData = res.data.data.data.data;
            this.priceCPage = res.data.data.data.page
        }
        this.showPriceCategoriesDlg = true;
        this.loading = false;
    }
    //分页信息变化
    priceCPageChange({ currentPage, pageSize }:any) {
        this.priceCPage.currPage = currentPage
        this.priceCPage.pageSize = pageSize
        this.showPriceCategories()
    }
    //增加新价表 按钮点击
    createPriceC(){
        this.showPriceCategoriesUSDlg = true;
        this.prusdlgTitle = "增加新价表"
        this.priceCCell.clear();
        this.priceCCell.createRecord();
        this.priceCCell.currRecord.data.purpose_id = this.amb_purposes_id;
    }
    //保存 价表
    async savePriceC(){
        let bok = this.checkNotNull(this.priceCCell); 
        if(!bok)
            return ;
        let res = await this.priceCCell.saveData();
        if(res.data.id == 0){
            this.showPriceCategoriesUSDlg = false;
            this.$notify.success(res.data.message)
        }else{
            this.$notify.error(res.data.message)
        }
        this.showPriceCategories()
        this.initWebPRICEGL();
    }
    //编辑或删除
    updatePriceC(rowIndex:any,type:any){
        this.priceCCell.clear();
        this.priceCCell.createRecord();
        this.priceCCell.currRecord.data = this.priceCData[rowIndex].data;
        if(type == 'up'){
            this.showPriceCategoriesUSDlg = true;
            this.prusdlgTitle = "编辑价表信息"
            this.priceCCell.currRecord.c_state = 2;
        }else if(type == 'dl'){
            //删除
            this.$confirm('确定删除该记录吗?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.priceCCell.currRecord.c_state = 4;
                this.dodelPriceC();
            }).catch(() => {
                
            });
        }
    }
    //进行删除
    async dodelPriceC(){ 
        let res = await this.priceCCell.saveData();
        if(res.data.id == 0){
            this.$notify.success(res.data.message)
            this.showPriceCategories()
            this.initWebPRICEGL();
        }else{
            this.$notify.error(res.data.message)
        }
    }
    //查询数据
    async initDataPrice(){
        this.loading = true;
        let btn1 = new BipMenuBtn("DLG"," 追加期间")
        btn1.setDlgSname(name);
        btn1.setDlgType("D")
        btn1.setDlgCont("amb.serv.util.report.TradingPrice*202;0;0");//交易价表
        let b = JSON.stringify(btn1)
        let fm_date = null;
        let to_date = null;
        if(this.selTime != null && this.selTime.length ==2){
            fm_date = moment(this.selTime[0]).format("YYYY-MM-DD")
            to_date = moment(this.selTime[1]).format("YYYY-MM-DD")
        }
        let fm_group_id = null;
        let to_group_id = null;
        let item = null
        if(this.dataPDelTJCell.currRecord && this.dataPDelTJCell.currRecord.data){
            item = this.dataPDelTJCell.currRecord.data.item_id
            to_group_id = this.dataPDelTJCell.currRecord.data.to_group_id
            fm_group_id = this.dataPDelTJCell.currRecord.data.fm_group_id
        }
        let prarm = {
            "fm_group_id":fm_group_id,//来源巴
            "to_group_id":to_group_id,//目标巴
            "item":item,//物料
            "purpose_id":this.amb_purposes_id,//核算目的
            // "purpose_id":'01e9723843934bb8947920040fea85bd',
            "category_id":this.priceglVal,//价表ID
            "fm_date":fm_date,//开始时间
            "to_date":to_date,//结束时间
            "currPage":this.tablePage.currPage,//当前页数
            "pageSize":this.tablePage.pageSize,//每页条数
        }
        let v = JSON.stringify(prarm);
        this.tableData = [];
        let res = await tools.getDlgRunClass(v,b);
        if(res.data.id ==0){
            this.$notify.success(res.data.message)
            let data = res.data.data;
            this.tablePage.total = data.total;
            this.tableData = data.data;
        }else{
            this.$notify.error(res.data.message)
        } 
        this.loading = false;
    }
    //分页信息变化
    tablePageChange({ currentPage, pageSize }:any) {
        this.tablePage.currPage = currentPage
        this.tablePage.pageSize = pageSize
        this.initDataPrice()
    }
    //编辑价表
    async updateDP(row:any){
        for(var i=0;i<this.dataPricesCell.ccells.cels.length;i++){
            let cel = this.dataPricesCell.ccells.cels[i]
            if(cel.id == 'item_id' || cel.id == 'fm_group_id' || cel.id == 'to_group_id'){
                this.dataPricesCell.ccells.cels[i].attr = this.dataPricesCell.ccells.cels[i].attr | 0x40;
            }
        }
        let id = row.id;
        let qe:QueryEntity = new QueryEntity(this.dataPricesCellID,this.dataPricesCellID);
        qe.page.pageSize = 1; 
        qe.cont = JSON.stringify({id:id})
        let res = await this.dataPricesCell.queryData(qe);
        if(res.data.id == 0){
            let data = res.data.data.data.data;
            this.dataPricesCell.clear();
            this.dataPricesCell.createRecord();
            this.dataPricesCell.currRecord.c_state = 2
            this.dataPricesCell.currRecord.data = data[0].data;
            this.showDataPriceDlg = true;
        }else{
            this.$notify.error(res.data.message)
        }
    }
    //删除价表
    deleteDP(row:any){
        //删除
        this.$confirm('确定删除该记录吗?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(() => {
            this.doDeleteDP(row);
        }).catch(() => {
              
        });
        
    }
    async doDeleteDP(row:any){
        let id = row.id;
        this.dataPricesCell.clear();
        this.dataPricesCell.createRecord();
        this.dataPricesCell.currRecord.c_state = 4
        this.dataPricesCell.currRecord.data.id = id
        let res:any = await this.dataPricesCell.saveData();
        if(res.data.id == 0){
            this.initDataPrice();
        }else{
            this.$notify.error(res.data.message)
        }
    }
    //调价
    debugPrice(row:any){
        for(var i=0;i<this.dataPricesCell.ccells.cels.length;i++){
            let cel = this.dataPricesCell.ccells.cels[i]
            if(cel.id == 'item_id' || cel.id == 'fm_group_id' || cel.id == 'to_group_id'){
                this.dataPricesCell.ccells.cels[i].attr = this.dataPricesCell.ccells.cels[i].attr | 0x40;
            }
        }
        this.dataPricesCell.clear();
        this.dataPricesCell.createRecord();
        this.dataPricesCell.currRecord.data.purpose_id = this.amb_purposes_id;
        this.dataPricesCell.currRecord.data.fm_group_id = row.fm_group_id;
        this.dataPricesCell.currRecord.data.to_group_id = row.to_group_id;
        this.dataPricesCell.currRecord.data.item_id = row.item_id;
        this.dataPricesCell.currRecord.data.category_id = row.category_id;
        this.dataPricesCell.currRecord.data.bizkey = row.bizkey;
        this.showDataPriceDlg = true;
    }
    //根据BizKey 删除
    async deletePriceByBizKey(row:any){ 
        this.dataPDelCell.clear();
        this.dataPDelCell.createRecord();
        this.dataPDelCell.currRecord.c_state = 4
        this.dataPDelCell.currRecord.data.bizkey = row.bizkey;
        let res:any = await this.dataPDelCell.saveData();
        if(res.data.id == 0){
            this.initDataPrice();
        }else{
            this.$notify.error(res.data.message)
        }
    }

    //保存修改
    async saveUpdate(){
        let bok =this.checkNotNull(this.dataPricesCell);
        if(!bok)
            return ;  
        let res:any = await this.dataPricesCell.saveData();
        if(res.data.id == 0){
            this.initDataPrice();
            this.showDataPriceDlg = false;
        }else{
            this.$notify.error(res.data.message)
        }
    }
    goToNewData(){
        this.dataPDSaveCell.clear();
        this.dataPDSaveCell.createRecord();
        this.dataPDSaveCell.currRecord.data.purpose_id = this.amb_purposes_id; 
        this.dataPDSaveCell.currRecord.data.category_id = this.priceglVal;
        this.showNewDataPriceDlg = true
    }
    //保存新增
    async saveNewDate(){
        let bok =this.checkNotNull(this.dataPDSaveCell);
        if(!bok)
            return ;
        let res:any = await this.dataPDSaveCell.saveData();
        if(res.data.id == 0){
            this.initDataPrice();
            this.showNewDataPriceDlg = false;
        }else{
            this.$notify.error(res.data.message)
        }
    }
    //过滤
    filter(){
        this.showFilter = !this.showFilter;
        this.dataPDelTJCell.clear();
        this.dataPDelTJCell.createRecord();
        if(this.showFilter){
            this.tableHeight =  this.height -250
        }else{
            this.tableHeight =  this.height -200
        }
    }

    //核算目的发生变化 value = 核算目的ID
    accChange(value:any){ 
        this.amb_purposes_id = value.id; 
        this.priceglVal = null;
        this.initWebPRICEGL();
        this.initDataPrice();
    }
    //获取对象
    async getCell(cellid: string) {
        let res = await tools.getCCellsParams(cellid);
        let rtn: any = res.data;
        if (rtn.id == 0) {
            let kn: Array<Cells> = rtn.data.layCels;
            let cells = kn;
            return new CDataSet(cells[0]);
        } else {
            return new CDataSet("");
        }
    } 
    //检查主表非空
    checkNotNull(cds:CDataSet):boolean{
        let bok = true;
        cds.ccells.cels.forEach(item => {
            if (item.unNull&&bok) {
                let vl = null; 
                if(cds.currRecord.data[item.id]!=null)
                    vl = cds.currRecord.data[item.id]+''; 
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
    //检查子表非空
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
    @Watch("height")
    heightChange() {
        this.tableHeight =  this.height -200
    }
    @Watch("priceglVal")
    priceglValChange() {
        this.initDataPrice();
    }
    
}
</script>
<style scoped lang="scss" >
.topdiv2{
    float: right;
    margin-right: 3px;
}
.topdiv1{
    float: left;
    margin-right: 3px;
}
.tree{
    overflow-y: auto;
}
.tree::-webkit-scrollbar {
  width: 4px;
}
.tree::-webkit-scrollbar-thumb {
  background-color: #d9d9d9;
}
.custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
}
.addelembtn{
    width: 70%;
    margin-left: 10%;
}
.saveelebtn{
    margin-top: 20px;
    margin-left:45%;
}
</style>