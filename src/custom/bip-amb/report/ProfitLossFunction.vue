<template> 
    <el-container>
        <el-header style="height:45px;padding:0px 10px">
            <Accounting @dataChange="accChange" class="topdiv1"></Accounting>
            <el-date-picker v-model="fm_date" format="yyyy-MM-dd" class="topdiv1" type="date" @change="fm_dateChange" placeholder="选择日期" size="small"></el-date-picker>
            <div class="topdiv1"><!-- 显示类别 -->
                <el-select v-model="showType" placeholder="请选择" size="small">
                    <el-option v-for="item in showTypeData" :key="item.id" :label="item.label" :value="item.id"></el-option>
                </el-select>
            </div>
            
            <div class="topdiv2"><!-- 导出 -->
                <el-button style="border:0px" @click="exportDataEvent">      
                    <i class="el-icon-download"></i>
                    <span>导出</span>
                </el-button>
            </div>
            <div class="topdiv2"><!-- 刷新 -->
                <el-button style="border:0px" @click="initData">      
                    <i class="el-icon-refresh-right"></i>
                    <span>刷新</span>
                </el-button>
            </div>

        </el-header>
        <el-container>
            <el-aside width="300px">
                <amb-tree :style="'height:'+tableHeight+'px'" @dataChange="treeChange" :purposesId="amb_purposes_id" :showCbox="false" ></amb-tree>
            </el-aside>
            <el-main style="padding:0px">
                <vxe-table resizable size="mini" ref="FIncomeTable" auto-resize :loading="tableLoading" show-overflow
                    border="inner" stripe highlight-hover-row :height="tableHeight"
                    :data="tableData">
                    <vxe-table-column field="element_name" title="收支项目" min-width="200">
                        <template v-slot="{row}"> 
                            <span v-for="(item) in row.level" :key="item">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                            {{ row.element_name }}
                        </template>
                    </vxe-table-column>
                    <vxe-table-column field="tmonth_money" title="当期发生额" width="150">
                        <template v-slot="{row}"> 
                            {{ (parseFloat(row.tmonth_money)/showType).toFixed(2) }}
                        </template>
                    </vxe-table-column>
                    <vxe-table-column field="month_rate" title="当期结构比例" width="150"></vxe-table-column>
                     <vxe-table-column field="month_money" title="月度发生额" width="150">
                        <template v-slot="{row}"> 
                            {{ (parseFloat(row.month_money)/showType).toFixed(2) }}
                        </template>
                     </vxe-table-column>
                    <vxe-table-column field="year_money" title="年度发生额" width="150">
                        <template v-slot="{row}"> 
                            {{ (parseFloat(row.year_money)/showType).toFixed(2) }}
                        </template>
                    </vxe-table-column>
                    <vxe-table-column field="year_rate" title="年度结构比例" width="150"></vxe-table-column>
                </vxe-table>
            </el-main>
        </el-container>
    </el-container>
</template>
<script lang="ts">
import { Component, Vue, Provide, Watch } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from 'vuex-class';
import Accounting from "../components/Accounting.vue"//核算目的
import AmbTree from "../components/AmbTree.vue"//阿米巴树
import { BIPUtil } from "@/utils/Request";
import {BipMenuBtn} from '@/classes/BipMenuBtn'
let tools = BIPUtil.ServApi;
import XEUtils from 'xe-utils'
import { values } from 'xe-utils/methods';
import moment from 'moment'
@Component({
    components: {
        Accounting,
        AmbTree
    }
})
/**
 * 职能式损益表
 */
export default class ProfitLossFunction extends Vue {
    
    @State('bipComHeight', { namespace: 'login' }) height!: number;
    amb_purposes_id:string = "";//核算目的id
    amb_period_kj:string = "";//核算目的中的会计期间ID
    amb_group_ids:any =[];//核算阿米巴key
    fm_date:any = "";//期间
    tableData:any=[];
    tableHeight:any ="500";
    tableLoading:boolean = false;
    showType:any = 1;//选中显示类别 默认
    showTypeData:any =[
        {id:1,label:"按元显示"},
        {id:1000,label:"按千元显示"},
        {id:10000,label:"按万元显示"},
        {id:100000000,label:"按亿元显示"}
    ];
    async created() {
        this.fm_date = moment(new Date()).format("YYYY-MM-DD")
        this.tableHeight =  this.height - 60
    }
    mounted() { 
    }
    async initData(){

        this.tableData =[];
        this.tableLoading = true;
        if(this.amb_purposes_id !="" && this.amb_group_ids.length>0 && this.fm_date){
            let btn1 = new BipMenuBtn("DLG","职能式损益表")
            btn1.setDlgSname(name);
            btn1.setDlgType("D")
            btn1.setDlgCont("amb.serv.util.report.IncomeInvoke*202;0;0");//职能损益表
            let b = JSON.stringify(btn1)
            let prarm = {
                "purpose_id":this.amb_purposes_id,
                "group_ids":this.amb_group_ids, 
                "fm_date":this.fm_date,
                "to_date":this.fm_date   
            }
            let v = JSON.stringify(prarm);
            let res = await tools.getDlgRunClass(v,b);
            let tdata = [];
            if(res.data.id ==0){
                tdata = res.data.data.data
            }else{
                this.$notify.error(res.data.message)
            }
            this.tableData = tdata
            this.tableLoading = false;
        }
    }
    getUpLevel(resData:any,i:any,level:any){
        let data = null;
        for(;i>=0;i--){
            let od = resData[i];
            if(od.level<level){
                data = od
                break;
            }
        }
        return data;
    }
    //核算目的发生变化 value = 核算目的ID
    accChange(value:any){
        this.amb_purposes_id = value.id;
        this.amb_period_kj = value.calendar_id;
        this.initData();
    }
    //期间发生变化
    fm_dateChange(value:any){
        this.fm_date = moment(value).format("YYYY-MM-DD")
        this.initData();
    }
    //阿米巴发生变化
    treeChange(checkData:any){
        this.amb_group_ids = checkData.keys;
        this.initData();
    }
    
    //导出excel
    exportDataEvent () {
        let refT:any = this.$refs["FIncomeTable"]
        if(refT){
            refT.exportData({ type: 'csv' })
        }
        // // 转换数据
        // let table = this.$refs.xGrid2.$el.querySelector('.body--wrapper>.vxe-table--body')
        // let book = XLSX.utils.book_new()
        // let sheet = XLSX.utils.table_to_sheet(table)
        // XLSX.utils.book_append_sheet(book, sheet)
        // let wbout = XLSX.write(book, { bookType: 'xlsx', bookSST: false, type: 'binary' })
        // let blob = new Blob([this.toBuffer(wbout)], { type: 'application/octet-stream' })
        // // 保存导出
        // FileSaver.saveAs(blob, '数据导出.xlsx')
    }
    @Watch("height")
    heightChange() {
        this.tableHeight =  this.height -60
    }
}
</script>
<style scoped lang="scss" >
.topdiv1{
    float: left;
    margin-right: 3px;
}
.topdiv2{
    float: right;
    margin-right: 3px;
}
</style>