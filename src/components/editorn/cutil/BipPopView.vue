<template>
    <el-dialog class="bipinsaid" :visible.sync="visibles" :append-to-body="true" :close-on-press-escape="true" :close-on-click-modal="false">
        <!--弹出框头部-->
        <span slot="title">
            <div class="el-dialog__title" style="padding-bottom:5px">{{Title}}</div>
        </span>
         <div @keyup.enter="searchInsAidDatas" class="search">
                <el-input placeholder="请输入筛选条件" v-model="conditionValue" class="input-with-select"  size="small" clearable >
                    <el-select v-model="conditionItem" slot="prepend" placeholder="请选择" style="width:120px">
                        <el-option label="全局匹配" value="-1"></el-option>
                        <el-option v-for="(item,index) in showCols" :key="index" :label="item.labelString" :value="item.id"></el-option>
                    </el-select>
                    <el-button slot="append" icon="el-icon-search" @click="searchInsAidDatas"></el-button>
                </el-input>
        </div>
        <el-table ref="assTable" height="250"
            :data="datas" size="mini" border stripe
            style="width: 100%" highlight-current-row 
            row-class-name="bip-assist-row" cell-class-name="bip-assist-cell"
            @current-change="selectionChange"
            @selection-change="handleSelectionChange"
            >
            <el-table-column type="index" width="40"></el-table-column>
            <el-table-column v-if="multiple" type="selection" width="55"></el-table-column>
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
            <el-button size="small" type="info" @click="selectOK(false)">选 中</el-button>
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
import QueryCont from '../../../classes/search/QueryCont';

import { BIPUtil } from '@/utils/Request';
let tools = BIPUtil.ServApi
@Component({})
export default class BipPopView extends Vue{
    @Prop() cds!:CDataSet
    @Prop() cell!:Cell
    @Prop() bipInsAid!:BipInsAidNew
    @Prop() row!:number
    @Prop() value!:string

    @Provide() visibles:boolean = false
    @Provide() showCols:Array<Cell> = new Array<Cell>();
    @Provide() conditionItem:string = "-1";
    @Provide() conditionValue:string = "";
    @Provide() datas:Array<any> = []
    @Provide() qe:QueryEntity = new QueryEntity("","")
    @Provide() currSelected:any = null // 当前页选中的数据

    @Provide() multiple:boolean = false;
    @Provide() checkSelected:any = [];
    @Provide() multipleSelectionAll:Array<any> = [];// 所有选中的数据包含跨页数据
    @Provide() idKey:string = "usrcode"; // 标识列表数据中每一行的唯一键的名称(需要按自己的数据改一下)

    mounted(){
        if(this.bipInsAid&&this.bipInsAid.bType !== ''&&this.bipInsAid.cells&&this.bipInsAid.cells.cels){
            this.showCols = this.bipInsAid.cells.cels.filter((item,index)=>{
                let _indexs:number[] = this.bipInsAid.showColsIndex
                let en = _indexs.find(it=>{
                    return it == index
                })
                if(en == undefined){
                    return false
                }
                return en>-1;
                // return item.isReq||item.isShow;
            })
            this.idKey = this.bipInsAid.cells.cels[0].id;

        }

    }

    updated(){
        if(this.showCols.length==0){
            this.showCols = this.bipInsAid.cells.cels.filter(item=>{
                return item.isReq||item.isShow;
            })
        }

    }

    open(){
        this.multiple = (this.cell.attr & 0x200000)>0
        this.visibles = true
        if(this.bipInsAid.bType === 'CGroupEditor'){
            let gfld = this.bipInsAid.sref;
            if(gfld){
                let crd = this.cds.getRecordAtIndex(this.row>-1?this.row:0);
                let cont = crd.data[gfld]
                if(cont&&cont.length>0){
                    this.qe.groupV = cont 
                        this.searchInsAidDatas()
                }
            }
        }else{
            if(this.datas.length==0)
                this.searchInsAidDatas()
        }
        if(this.value){
            let cc = this.value.split(";")
            this.multipleSelectionAll =[];
            for(var i=0;i<cc.length;i++){
                let k = this.idKey;
                let kk:any = {};
                kk[k] = cc[i];
                this.multipleSelectionAll.push(kk)
            }
        }
        this.setSelectRow();
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
        let allCont = [];
        let oneCont = [];
        for(var i=0;i<this.showCols.length;i++){
            let cell = this.showCols[i]
            if(this.conditionItem !='-1' && this.conditionValue){
                if(cell.id == this.conditionItem){
                    let qCont = new QueryCont(this.conditionItem,this.conditionValue,cell.type);
                    qCont.setContrast(3);
                    oneCont.push(qCont);
                }
            }else if(this.conditionItem =='-1' && this.conditionValue){
                let qCont = new QueryCont(cell.id,this.conditionValue,cell.type);
                qCont.setLink(0)
                qCont.setContrast(3);
                oneCont.push(qCont);
            }
        }
        if(oneCont.length !=0){
            allCont.push(oneCont);
            cont = "~"+JSON.stringify(allCont)
        }
        // if(this.conditionItem =='-1' && this.conditionValue){
        //     cont = "~";
        //     for(var i=0;i<this.showCols.length;i++){
        //         let cell = this.showCols[i]
        //         cont += cell.id +" like '%"+this.conditionValue+"%' or " 
        //     }
        //     cont = cont.substring(0,cont.length-4);
        // }
        if(cont.length>0){
            this.qe.cont = cont
        }else{
            this.qe.cont = ''
        }
    }

    selectOK(close:boolean){
        let cc = [];
        if(this.multiple){
            // let reft:any = this.$refs.assTable;
            // if(reft){
            //     reft.toggleRowSelection(this.currSelected, true);
            // }
            this.changePageCoreRecordData();            
            cc = this.multipleSelectionAll;
        }else{
            cc = this.currSelected
        }
        if(cc)
            this.$emit('select',cc,close)
    }

    async searchInsAidDatas(){
        this.makeCont();
        await tools.getBipInsAidInfo(this.bipInsAid.id,210,this.qe).then(res=>{
            if(res.data.id==0){
                this.datas = res.data.data.data.values
                this.qe.page = res.data.data.data.page
            }
        }).catch(err=>{
            this.$notify.error(err)
        });
    }

    selectionChange(val:any){
        // let reft:any = this.$refs.assTable;
        // if(reft){
        //     reft.toggleRowSelection(val, true);
        // }
        this.currSelected = [];
        this.currSelected.push(val);
    }

    async handleSizeChange(val:number) {
        this.changePageCoreRecordData();
        let totalPage = this.qe.page.total/this.qe.page.pageSize
        if(val<this.qe.page.total||this.qe.page.currPage<totalPage){
            this.qe.page.pageSize = val
            await this.searchInsAidDatas()
        }
        this.setSelectRow();
    }
    async handleCurrentChange(val:number) {
        this.changePageCoreRecordData();
        if(val!= this.qe.page.currPage){
            this.qe.page.currPage = val
            await this.searchInsAidDatas()
        } 
        this.setSelectRow();
    }

    get Title():string{
        if(this.bipInsAid&&this.bipInsAid.bType){
            return this.bipInsAid.title;
        }
        return ""
    }
    
    //清空所有选中
    handleClearData () {				
        this.multipleSelectionAll = []
        this.$emit('handleChooseData', [])
        this.visibles = false
    }
    //确定按钮
    handleAddData () {				
        this.changePageCoreRecordData();
        if (this.multipleSelectionAll.length <= 0) {           
            this.$message({  message: '无勾选数据！', type: 'warning' });
                return;
            }
        this.$emit('handleChooseData', this.multipleSelectionAll);
        this.visibles = false;
    }
    // 设置选中的方法
    setSelectRow() {
        if (!this.multipleSelectionAll || this.multipleSelectionAll.length <= 0) {
            return;
        }
        // 标识当前行的唯一键的名称
        let idKey = this.idKey;
        let selectAllIds:any = [];
        let that = this;
        this.multipleSelectionAll.forEach(row => {
            selectAllIds.push(row[idKey]);
        });
        let reft:any = this.$refs.assTable;
        if(reft){
            reft.clearSelection();
            for (var i = 0; i < this.datas.length; i++) {
                if (selectAllIds.indexOf(this.datas[i][idKey]) >= 0) {
                    // 设置选中，记住table组件需要使用ref="table"
                    reft.toggleRowSelection(this.datas[i], true);
                }
            }
        }
    }
    // 记忆选择核心方法
    changePageCoreRecordData() {
      // 标识当前行的唯一键的名称
      let idKey = this.idKey;
      let that = this;
      // 如果总记忆中还没有选择的数据，那么就直接取当前页选中的数据，不需要后面一系列计算
      if (this.multipleSelectionAll.length <= 0) {
        this.multipleSelectionAll = this.checkSelected;
        return;
      }
      // 总选择里面的key集合
      let selectAllIds:any = [];
      this.multipleSelectionAll.forEach(row => {
        selectAllIds.push(row[idKey]);
      });
      let selectIds:any = [];
      // 获取当前页选中的id
      this.checkSelected.forEach((row:any) => {
        selectIds.push(row[idKey]);
        // 如果总选择里面不包含当前页选中的数据，那么就加入到总选择集合里
        if (selectAllIds.indexOf(row[idKey]) < 0) {
          that.multipleSelectionAll.push(row);
        }
      });
      let noSelectIds:any = [];
      // 得到当前页没有选中的id
      this.datas.forEach(row => {
        if (selectIds.indexOf(row[idKey]) < 0) {
          noSelectIds.push(row[idKey]);
        }
      });
      noSelectIds.forEach((id:any) => {
        if (selectAllIds.indexOf(id) >= 0) {
          for (let i = 0; i < that.multipleSelectionAll.length; i++) {
            if (that.multipleSelectionAll[i][idKey] == id) {
              // 如果总选择中有未被选中的，那么就删除这条
              that.multipleSelectionAll.splice(i, 1);
              break;
            }
          }
        }
      });
    } 
    handleSelectionChange(val:any) {
      // table组件选中事件,记得加上@selection-change="handleSelectionChange"
        this.checkSelected = val; 
    }
     // 得到选中的所有数据
    getAllSelectionData() {
      // 再执行一次记忆勾选数据匹配，目的是为了在当前页操作勾选后直接获取选中数据
      this.changePageCoreRecordData(); 
    }
    rowClass(val:any){
        // console.log(val)
    }
}
</script>
<style lang="scss">
    .assTable{
        .vxe-table--body{
            .vxe-body--row.row-checked {
                background-color:#61b3d3cc ;
            }
        }
    }
</style>