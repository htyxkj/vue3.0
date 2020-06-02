<template> 
    <el-container v-loading="loading">
        <el-header style="height:45px;padding:0px 10px">
            <Accounting @dataChange="accChange" class="topdiv1"></Accounting>
            <div class="topdiv2">
                <el-button style="border:0px">      
                    <i class="el-icon-plus"></i>
                    <span>导入</span>
                </el-button>
            </div>
            <div class="topdiv2"><!-- 刷新 -->
                <el-button style="border:0px">      
                    <i class="el-icon-refresh-right"></i>
                    <span>刷新</span>
                </el-button>
            </div> 
            <div class="topdiv2"><!-- 刷新 -->
                <el-button style="border:0px">      
                    <i class="el-icon-refresh-right"></i>
                    <span>过滤</span>
                </el-button>
            </div> 
        </el-header>
        <el-container style="border-top: 1px solid #CCCCCC;">
            <el-header>
                <el-select class="topdiv1" v-model="priceglVal" placeholder="请选择价表" size="small">
                    <el-option v-for="item in priceglValues" :key="item.code" :label="item.name" :value="item.code"></el-option>
                </el-select>
                <el-date-picker size="small" class="topdiv1" v-model="selTime" type="datetimerange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>

                <div class="topdiv2"><!-- 刷新 -->
                    <el-button style="border:0px" @click="showPriceCategories">      
                        <i class="el-icon-refresh-right"></i>
                        <span>管理价表</span>
                    </el-button>
                </div> 
            </el-header>
            <el-main  :style="'height:'+tableHeight+'px'" style="padding:0px">
                <el-form @submit.native.prevent label-position="right" label-width="120px">
                    <base-layout v-if="lay.binit" :layout="lay" :env="env"></base-layout>
                </el-form>
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
            <vxe-pager border size="mini" :current-page="priceCPage.currentPage" :page-size="priceCPage.pageSize"
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

    </el-container>
</template>
<script lang="ts">
import { Component, Vue, Provide, Watch } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from 'vuex-class';
import BipMenuBar from "@/classes/pub/BipMenuBar";
import { URIParams } from "@/classes/URIParams";
import Accounting from "../components/Accounting.vue"//核算目的
import QueryCont from "@/classes/search/QueryCont";
import { Cells } from "@/classes/pub/coob/Cells";
import CDataSet from "@/classes/pub/CDataSet";
import CData from '@/classes/pub/CData';
import QueryEntity from "@/classes/search/QueryEntity";
import CCliEnv from "@/classes/cenv/CCliEnv";
import { BipLayout } from "@/classes/ui/BipLayout";
import { BIPUtil } from "@/utils/Request";
import {BipMenuBtn} from '@/classes/BipMenuBtn'
let tools = BIPUtil.ServApi;
import XEUtils from 'xe-utils'
import { values } from 'xe-utils/methods';
import moment from 'moment'
@Component({
    components: {
        Accounting
    }
})
/**
 * 交易价表
 */
export default class TradingPrice extends Vue {
    @State('bipComHeight', { namespace: 'login' }) height!: number;
    tableHeight:any = 500//高度
    expandedLevel:number = 100;//默认展开级别
    keyID:string = "id";//当前节点key字段   
    amb_purposes_id:any = null;//核算目的  
    title:any = "";//右侧标题

    dsm: CDataSet = new CDataSet(null);
    dsm_cont: CDataSet = new CDataSet(null);
    ds_ext: Array<CDataSet> = Array<CDataSet>();
    lay: BipLayout = new BipLayout("");
    env: CCliEnv = new CCliEnv();

    unitCell:CDataSet = new CDataSet("");//阿米巴单元
    unitCellID:any = "300103WEB";

    unitTJCell:CDataSet = new CDataSet("");//查询条件对象
    unitTJCellID:any = "300103WEBTJ";//条件对象编码

    treSelData:any = null;
    treeData:any = [];
    
    pcell:any = "300103WEB(300103AWEB;300103BWEB)";

    type_name:any = {};//类型集合
    addState:any = 1;//添加状态






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
    dataPricesCellID:any = "3002B05WEBSEL";
    


    async created() {
        this.priceCCell = await this.getCell(this.priceCCellID);
        this.dataPricesCell = await this.getCell(this.dataPricesCellID);
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
        }
        this.showPriceCategoriesDlg = true;
        this.loading = false;
    }
    //分页信息变化
    priceCPageChange({ currentPage, pageSize }:any) {
        this.priceCPage.currentPage = currentPage
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
    initDataPrice(){

    }


    //核算目的发生变化 value = 核算目的ID
    accChange(value:any){ 
        this.amb_purposes_id = value.id; 
        this.initWebPRICEGL();
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
        this.tableHeight =  this.height -120
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