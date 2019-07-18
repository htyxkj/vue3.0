<template>
    <el-dialog class="bipinsaid" :visible.sync="visibles" :append-to-body="true" :close-on-press-escape="true" :close-on-click-modal="false">
        <!--弹出框头部-->
        <span slot="title">
            <div class="el-dialog__title" style="padding-bottom:5px">{{Title}}</div>
            <div @keyup.enter="searchInsAidDatas">
                <el-input placeholder="请输入筛选条件" v-model="conditionValue" class="input-with-select"  size="small" clearable >
                    <el-select v-model="conditionItem" slot="prepend" placeholder="请选择" style="width:120px">
                        <el-option label="全局匹配" value="-1"></el-option>
                        <el-option v-for="(item,index) in showCols" :key="index" :label="item.labelString" :value="item.id"></el-option>
                    </el-select>
                    <el-button slot="append" icon="el-icon-search" @click="searchInsAidDatas"></el-button>
                </el-input>
            </div>
        </span>
        <el-table ref="assTable" height="250"
            :data="datas" size="mini" border stripe
            style="width: 100%" highlight-current-row 
            row-class-name="bip-assist-row" cell-class-name="bip-assist-cell"
            @current-change="selectionChange">
            <el-table-column type="index" width="40"></el-table-column>
            <el-table-column v-for="(item,index) in showCols" :key="index"
            :prop="item['id']"
            :label="item.labelString" :showOverflowTooltip="true" :resizable="true" >
            <template slot-scope="scope">
                <span style="margin-left: 10px">{{ scope.row[item.id]}}</span>
            </template>
            </el-table-column>
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
            <el-button size="small" type="info" @click="selectOK(false)">选中</el-button>
            <el-button size="small" type="primary" @click="selectOK(true)">选中并关闭</el-button>
        </span>

    </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import CDataSet from '../../../classes/pub/CDataSet';
import { Cell } from '../../../classes/pub/coob/Cell';
import BipInsAidNew from '../../../classes/BipInsAidNew';
import QueryEntity from '../../../classes/search/QueryEntity';

import { BIPUtil } from '@/utils/Request';
let tools = BIPUtil.ServApi
@Component({})
export default class BipPopView extends Vue{
    @Prop() cds!:CDataSet
    @Prop() cell!:Cell
    @Prop() bipInsAid!:BipInsAidNew
    @Prop() row!:number

    @Provide() visibles:boolean = false
    @Provide() showCols:Array<Cell> = new Array<Cell>();
    @Provide() conditionItem:string = "-1";
    @Provide() conditionValue:string = "";

    @Provide() datas:Array<any> = []

    @Provide() qe:QueryEntity = new QueryEntity("","")
    @Provide() currSelected:any = null
    mounted(){
        if(this.bipInsAid&&this.bipInsAid.bType !== ''&&this.bipInsAid.cells&&this.bipInsAid.cells.cels){
            this.showCols = this.bipInsAid.cells.cels.filter(item=>{
                return item.isReq||item.isShow;
            })
        }

    }

    updated(){
        console.log('updated')
        if(this.showCols.length==0){
            this.showCols = this.bipInsAid.cells.cels.filter(item=>{
                return item.isReq||item.isShow;
            })
        }

    }

    open(){
        this.visibles = true
        if(this.bipInsAid.bType === 'CGroupEditor'){
            let gfld = this.bipInsAid.sref;
            if(gfld){
                let crd = this.cds.getRecordAtIndex(this.row>-1?this.row:0);
                let cont = crd[gfld]
                if(cont&&cont.length>0){
                    this.qe.groupV = cont
                    if(this.datas.length==0)
                        this.searchInsAidDatas()

                }
            }
            console.log(this.bipInsAid.groupFld)
        }else{
            if(this.datas.length==0)
                this.searchInsAidDatas()
        }

    }

    close(){
        this.visibles = false
    }

    cancel(){
        this.currSelected = null
        let tabs:any = this.$refs.assTable
        tabs.setCurrentRow(this.currSelected)
        this.visibles = false    
    }

    makeCont(){
        let cont = "";
        if(this.conditionItem !='-1' && this.conditionValue)
            cont = "~"+this.conditionItem+" like '%"+this.conditionValue+"%'"
        if(this.conditionItem =='-1' && this.conditionValue){
            cont = "~";
            for(var i=0;i<this.showCols.length;i++){
                let cell = this.showCols[i]
                cont += cell.id +" like '%"+this.conditionValue+"%' or " 
            }
            cont = cont.substring(0,cont.length-4);
        }
        if(cont.length>0){
            this.qe.cont = cont
        }else{
             this.qe.cont = ''
        }
    }

    selectOK(close:boolean){
        if(this.currSelected)
            this.$emit('select',this.currSelected,close)
    }

    searchInsAidDatas(){
        this.makeCont();
        tools.getBipInsAidInfo(this.bipInsAid.id,210,this.qe).then(res=>{
            console.log(res)
            if(res.data.id==0){
                this.datas = res.data.data.data.values
                this.qe.page = res.data.data.data.page
            }
        }).catch(err=>{
            console.log(err)
        });
    }

    selectionChange(val:any){
        this.currSelected = val
    }

    handleSizeChange(val:number) {
        let totalPage = this.qe.page.total/this.qe.page.pageSize
        console.log(totalPage,'totalPage')
        if(val<this.qe.page.total||this.qe.page.currPage<totalPage){
            this.qe.page.pageSize = val
            this.searchInsAidDatas()
        }
    }
    handleCurrentChange(val:number) {
        if(val!= this.qe.page.currPage){
            this.qe.page.currPage = val
            this.searchInsAidDatas()
        }
    }

    get Title():string{
        if(this.bipInsAid&&this.bipInsAid.bType){
            return this.bipInsAid.title;
        }
        return ""
    }
    
}
</script>

<style lang="scss">
.bipinsaid {
    .el-dialog__header{
        background-color: #4db3ff !important;
        .el-icon-close{
            color: black;
        }
    }
    .el-dialog__body{
        padding:2px 2px;
        
    }
    .el-dialog__footer{
        padding-top: 5px;
        padding-bottom: 10px;
    }
    hr{
        color:#ccc;
    }
    .el-table__body tr.current-row > td {
        background-color: #13a8a1 !important;
    }
}
</style>