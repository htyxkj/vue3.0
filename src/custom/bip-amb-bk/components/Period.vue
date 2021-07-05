<template> 
    <div> 
       <el-input placeholder="请输入内容" v-model="selectName"  size="small"> 
                <el-button slot="append" icon="el-icon-search" @click="select"></el-button>
        </el-input>

        <el-dialog title="期间" :visible.sync="showPeriod" class="bipinsaid">
             
            <div style="padding-top:0px">
                <el-table :data="tableData" height="350px" highlight-current-row size="small" @row-click="tableClick">
                    <el-table-column property="name" label="期间" width="150"></el-table-column>
                    <el-table-column property="year" label="年度" width="200"></el-table-column>
                    <el-table-column property="month" label="月份"></el-table-column>
                    <el-table-column property="fm_date" label="开始日期"></el-table-column>
                    <el-table-column property="to_date" label="结束日期"></el-table-column>
                </el-table> 
                <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                    :current-page="page.currPage" :page-sizes="[10, 20, 30, 40]"
                    :page-size="10"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="page.total">
                </el-pagination>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button @click="showPeriod = false" size="mini">取 消</el-button>
                <el-button type="primary" @click="selectOk" size="mini">确 定</el-button>
            </div>
        </el-dialog>
    </div>    
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop,Watch } from "vue-property-decorator";
import QueryEntity from "@/classes/search/QueryEntity";
import QueryCont from "@/classes/search/QueryCont";
import { BIPUtil } from "@/utils/Request";
import {BipMenuBtn} from '@/classes/BipMenuBtn'
let tools = BIPUtil.ServApi;
@Component({
    components: {
    }
})
//核算目的
export default class Period extends Vue {
    @Prop() calendar_id?:string;//日历id 
    @Prop() type?:string ;//日历id 
    showPeriod:boolean = false;//是否显示期间弹框
    page:any={pageSize:10,currPage:1,total:0} 
    tableData:any = [];

    selectID:any = null;
    selectName:any = "";

    async created() {
        await this.initData();
        let row = this.tableData[0];
        if(row){
            this.selectName = row.name;
            this.selectID = row.id;
            this.$emit("dataChange",this.selectID);
        }
    }
    select(){
        this.showPeriod = true;
        this.initData();
    }

    async initData(){
        let qe: QueryEntity = new QueryEntity("", "");
        qe.page.currPage = this.page.currPage;
        qe.page.pageSize = this.page.pageSize; 
        if(!this.calendar_id)
            this.calendar_id = "";
        let oneCont = [];  
        let qCont = new QueryCont('zbid',this.calendar_id,12);
        oneCont.push(qCont); 
        qe.cont = "~["+JSON.stringify(oneCont)+"]";
        let res = await tools.getBipInsAidInfo("REPORTPERIOD", 210, qe);
        if(res.data.id ==0 ){ 
            this.page = res.data.data.data.page;
            this.tableData = res.data.data.data.values;
        }else{
            this.$notify.error("获取期间出错！");
        }
    }
    selectOk(){
        this.showPeriod = false;
         this.$emit("dataChange",this.selectID);
    }
    tableClick(row:any){
        this.selectID = row.id;
        this.selectName = row.name;
    }

    //每页显示条数
    handleSizeChange(val:any){
        this.page.pageSize = val;
        this.initData()
    }
    //选中页数
    handleCurrentChange(val:any){
        this.page.currPage = val;
        this.initData()
    } 
    @Watch("calendar_id")
    async purposesChange(){//日历编码发生变化
        let data = null;
        if(this.calendar_id){
            let prarm = {
                "calendar_id":this.calendar_id,//日历编码 
            }
            let btn1 = new BipMenuBtn("DLG"," 追加期间")
            btn1.setDlgType("D")
            btn1.setDlgCont("amb.serv.util.report.CalendarMAXMIN*202;0;0");//交易价表
            let b = JSON.stringify(btn1)
            let v = JSON.stringify(prarm);
            let res = await tools.getDlgRunClass(v,b);
            if(res.data.id ==0){
                let data  = res.data.data;
                if(this.type && this.type=='min'){
                    this.selectName = data.minName;
                    this.selectID = data.minID;
                }else{
                    this.selectName = data.maxName;
                    this.selectID = data.maxID;
                }
                this.$emit("dataChange",this.selectID);
            }
        }
    }

    @Watch("selectName")
    selChange(){
        if(!this.selectName){
            this.selectID="";
            this.$emit("dataChange",this.selectID);
        }
    }
}
</script>
<style scoped lang="scss" > 
</style>