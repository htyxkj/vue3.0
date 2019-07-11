<template>
    <el-dialog class="bip-assist" :visible.sync="outerVisible" :append-to-body="true" :close-on-press-escape="true" :close-on-click-modal="false">
        <span slot="title">
            <div class="el-dialog__title" style="padding-bottom:5px">{{aIdTitle}}</div>
            <div @keyup.enter="aidselect">
                <el-input placeholder="请输入筛选条件" v-model="conditionValue" class="input-with-select" clearable >
                    <el-select v-model="conditionItem" slot="prepend" placeholder="请选择" style="width:120px">
                        <el-option label="全局匹配" value="-1"></el-option>
                        <el-option v-for="(item,index) in showCols" :key="index" :label="labers[index]" :value="allCols[item].id"></el-option>
                    </el-select>
                    <el-button slot="append" icon="el-icon-search" @click="aidselect"></el-button>
                </el-input>
            </div>
        </span>
        <template v-if="bInit">
            <template v-if="multiple">
                <el-table ref="assTable" height="250"
                    :data="items" size="mini" border stripe
                    style="width: 100%" highlight-current-row row-class-name="bip-assist-row" cell-class-name="bip-assist-cell"
                    @selection-change="selectionChange">
                    <el-table-column v-if="multiple" type="selection" width="40"></el-table-column>
                    <el-table-column v-for="(item,index) in showCols" :key="index" 
                    :prop="allCols[item].id"
                    :label="labers[index]" :showOverflowTooltip="true" :resizable="true" >
                    </el-table-column>
                    <!-- <div slot="append" style="text-align: center">
                        ------我是有底线的------
                    </div> -->
                </el-table>
            </template>
            <template v-else>
                <el-table ref="assTable" height="250"
                    :data="items" size="mini" border stripe
                    style="width: 100%" highlight-current-row 
                    row-class-name="bip-assist-row" cell-class-name="bip-assist-cell"
                    @current-change="selectionChange">
                    <el-table-column v-for="(item,index) in showCols" :key="index"
                    :prop="allCols[item].id"
                    :label="labers[index]" :showOverflowTooltip="true" :resizable="true" >
                    </el-table-column>
                </el-table>
            </template>
            <div class="block">
                <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="page.currPage"
                :page-sizes="[10, 20, 30, 40,50,100]"
                :page-size="page.pageSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="page.total">
                </el-pagination>
            </div>
            <hr />
            <span slot="footer" class="dialog-footer">
                <el-button size="small" @click="cancel()">取 消</el-button>
                <el-button size="small" type="primary" @click="selectOK">确 定</el-button>
            </span>
        </template>
        <template v-else>
            <el-row>没有辅助{{aId}}</el-row>
        </template>
    </el-dialog>
</template>
<script lang="ts">
//辅助query
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import { BIPUtil } from '@/utils/Request';
import { fips } from 'crypto';
@Component({})
export default class BipAssistEditor extends Vue{
    @Prop() aId?:string 
    @Prop() multiple?:boolean
    @Provide() outerVisible:boolean = false
    @Provide() aIdTitle='辅助窗口'
    @Provide() bInit:boolean = false
    @Provide() labers:Array<string> = []
    @Provide() showCols:Array<number> = []
    @Provide() allCols:Array<any> = []
    @Provide() items:Array<any> = []
    @Provide() multipleSelection:any = null
    @Provide() page:any = {currPage:1,pageSize:20,total:0,cont:'' }
    @Provide() conditionItem:string = "-1";
    @Provide() conditionValue:string = "";
    async mounted(){
        if(this.aId){
            this.findData()
        }
    }

    async findData(){
        if(this.aId){
            let res = await BIPUtil.ServApi.getAidValuesById('&'+this.aId,this.page.cont,this.page.currPage,this.page.pageSize)
            let v = res.data
            console.log(v)
            if(v.id === 0){
                v = v.data.values
                console.log(v)
                // if(this.bInit){
                //     this.items = v.values
                // }else{
                    this.page.total = v.total
                    this.aIdTitle = v.title
                    this.labers = v.labers
                    this.showCols = v.showColsIndex
                    this.allCols = v.layCells
                    this.items = v.values
                    this.bInit = true
                // }
            }else{
                this.outerVisible = false
                this.$notify.error(v.message+","+this.aId)
            }
        }
    }

    open(){
        this.outerVisible = true
    }

    cancel(){
        let refst:any = this.$refs.assTable;
        refst.clearSelection();
        this.outerVisible = false
        this.$emit('select',null)
    }

    selectOK(){
        this.outerVisible = false
        this.$emit('select',this.multipleSelection)
    }

    selectionChange(val:any) {
        this.multipleSelection = val;
    }
    handleSizeChange(val:number) {
        if(val<this.page.total){
            this.page.pageSize = val
            this.findData()
        }
    }
    handleCurrentChange(val:number) {
        if(val!= this.page.currPage){
            this.page.currPage = val
            this.findData()
        }
    }

    aidselect(){ 
        let cont = "";
        if(this.conditionItem !='-1' && this.conditionValue)
            cont = "~"+this.conditionItem+" like '%"+this.conditionValue+"%'"
        if(this.conditionItem =='-1' && this.conditionValue){
            cont = "~";
            for(var i=0;i<this.showCols.length;i++){
                let cols = this.showCols[i];
                cont += this.allCols[cols].id +" like '%"+this.conditionValue+"%' or " 
            }
            cont = cont.substring(0,cont.length-4);
        }
        this.page.cont = cont; 
        this.findData();
    }

    @Watch('conditionValue')
    condValue(){
        let cont = "";
        if(this.conditionItem && this.conditionValue)
            cont = "~"+this.conditionItem+" like '%"+this.conditionValue+"%'"
        this.page.cont = cont;
        if(!this.conditionValue){
            this.findData();
        }
    } 
}
</script>

<style lang="scss">
.bip-assist {
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

