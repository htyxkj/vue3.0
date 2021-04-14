<template>
    <el-row v-if="visibles">
        <el-dialog class="bipinsaid" :visible.sync="visibles" :append-to-body="true" :close-on-press-escape="true" :close-on-click-modal="false">
            <!--弹出框头部-->
            <span slot="title">
                <div class="el-dialog__title" style="padding-bottom:5px">系统窗口</div>
            </span>
            <el-table ref="assTable" height="260" :data="data" size="mini" border stripe
                style="width: 100%" highlight-current-row  row-class-name="bip-assist-row" cell-class-name="bip-assist-cell"
                @row-click="rowClick" @row-dblclick="rowDbClick">
                <el-table-column type="index" width="40"></el-table-column>
                <template v-for="(item,index) in dsm.ccells.cels" >
                    <el-table-column v-if="(item.attr & 0x200) >0" :key="index" :prop="item['id']" 
                    :label="item.labelString" :showOverflowTooltip="true" :resizable="true" >
                        <template slot-scope="scope">
                            <bip-grid-info :cds="dsm" :cell="item" :row="scope.$index" :bgrid="true" ></bip-grid-info>
                        </template>
                    </el-table-column>
                </template>
            </el-table>
            <div class="block">
                <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="qe.page.currPage"
                :page-sizes="[10, 20, 30, 40,50,100]"
                :page-size="qe.page.pageSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="qe.page.total">
                </el-pagination>
            </div>
            <hr />
            <span slot="footer" class="dialog-footer">
                <el-button size="small" @click="cancel()">取 消</el-button>
                <el-button size="small" type="primary" @click="selectOK()">选中</el-button>
            </span>

        </el-dialog>
    </el-row>
</template>
<script lang="ts">
/**
 * 单据页面弹出列表框  点击页数弹出   1/10
 */
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import CDataSet from "@/classes/pub/CDataSet";
import BipGridInfo from "@/components/editorn/grid/BipGridInfo.vue";
import QueryEntity from "@/classes/search/QueryEntity";
@Component({
    components: {BipGridInfo }
})
export default class AppletListDlg extends Vue { 
    qe: QueryEntity = new QueryEntity("","");
    dsm: CDataSet = new CDataSet(null);
    visibles:boolean = false; 
    data:Array<any> = [];
    rowID:number=0;
    mounted() {

    }
    open(dsm:CDataSet,qe:QueryEntity){
        this.dsm = dsm;
        this.data = dsm.cdata.data;
        console.log(this.data)
        this.qe = qe;
        console.log(this.dsm)
        this.visibles=true;
    }
    //每页数据条数发生变化
    async handleSizeChange(val:number) {
        let totalPage = this.qe.page.total/this.qe.page.pageSize
        if(val<this.qe.page.total||this.qe.page.currPage<totalPage){
            this.qe.page.pageSize = val
            await this.findDataFromServe(this.qe)
        }
    }
    //当前选中页发生变化
    async handleCurrentChange(val:number) {
        if(val!= this.qe.page.currPage){
            this.qe.page.currPage = val
            await this.findDataFromServe(this.qe)
        } 
    }
    /***
     * @description 从服务端获取数据
     * @param qes 查询条件和页次对象
     */
    async findDataFromServe(qes: QueryEntity) {
        let res = await this.dsm.queryData(qes);
        let data = res.data;
        if (data.id == 0) {
            this.data = []
            this.data = data.data.data.data;
            this.dsm.cdata.data = this.data;
        } else {
            this.data = [];
        }
    }
    rowDbClick(val:any,column:any, event:any){
        for(var i=0;i<this.data.length;i++){
            if(this.data[i].id == val.id){
                this.rowID =i;
                break;
            }
        }
        this.selectOK();        
    }
    rowClick(val:any,column:any, event:any){
        for(var i=0;i<this.data.length;i++){
            if(this.data[i].id == val.id){
                this.rowID =i;
                break;
            }
        }
    }
    cancel(){
        this.visibles = false;
    }
    selectOK(){
        this.rowID = this.qe.page.pageSize * (this.qe.page.currPage-1) + this.rowID;
        console.log(this.rowID)
        this.$emit('selectRow',this.rowID)
        this.visibles = false;
    }
}
</script>