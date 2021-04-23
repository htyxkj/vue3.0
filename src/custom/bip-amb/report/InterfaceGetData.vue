<template> 
    <el-container>
        <el-header style="height:45px;padding:0px 10px;border-bottom: 1px solid #CCCCCC;    line-height: 45px;">
            <div class="topdiv1"><!-- 刷新 -->
                <el-date-picker size="small" v-model="date" type="date" placeholder="请选择日期"></el-date-picker>
                <el-button size="small" style="margin-left:20px" type="primary" :disabled="selData.length ==0" @click="getAPIData">      
                    <span>接口取数</span>
                </el-button>
            </div>
            <div class="topdiv2"><!-- 刷新 -->
                <el-button type="text" style="border:0px" @click="initData">      
                    <i class="el-icon-refresh-right"></i>
                    <span>刷新</span>
                </el-button>
            </div>
        </el-header>
        <el-container>
            <el-row style="width:100%">
                <vxe-table style="width:100%" :height="tableHeight" resizable :data="tableData" size="mini" stripe border highlight-hover-row highlight-current-row
                    @checkbox-all="selectChangeEvent" @checkbox-change="selectChangeEvent" :loading="tableLoading" ref="intergetdataTable">
                    <vxe-table-column type="checkbox" width="60"></vxe-table-column>
                    <vxe-table-column title="接口类型" width="200" header-align="center" align="start" show-header-overflow show-overflow>
                        <template v-slot="{ row }">
                            <div>
                                {{row.data.lname}}
                                <br/>
                                {{row.data.nname}}
                            </div>
                        </template>
                    </vxe-table-column> 

                    <vxe-table-column title="接口" min-width="300" header-align="center" align="start" show-header-overflow show-overflow>
                        <template v-slot="{ row }">
                            <div>
                                {{row.data.rname}}
                                <br/>
                                {{row.data.code}}
                            </div>
                        </template>
                    </vxe-table-column>  
                    <vxe-table-column title="时间" width="150" header-align="center" align="center" show-header-overflow show-overflow>
                        <template v-slot="{ row }">
                            <div>
                                {{row.data.fm_date}}
                                <br/>
                                <hr/>
                                {{row.data.to_date}}
                            </div>
                        </template>                    
                    </vxe-table-column>  
                    <vxe-table-column title="状态" width="100" header-align="center" align="center" show-header-overflow show-overflow>
                        <template v-slot="{ row }">
                            <div>
                                <template v-if="row.data.status_id == 'succeed'">
                                    执行成功
                                </template>
                                <template v-else-if="row.data.status_id == 'failed'">
                                    执行失败
                                </template>
                                <template v-else>
                                    正在运行
                                </template>
                                <br/>
                                <hr/>
                                <a class="log" @click="getLog(row.data)">日志</a>
                            </div>
                        </template>  
                    </vxe-table-column>  
                    <vxe-table-column title="备注" min-width="300" header-align="center" align="start" show-header-overflow show-overflow>
                        <template v-slot="{ row }">
                            <div>
                                {{row.data.msg}}
                            </div>
                        </template>  
                    </vxe-table-column>  
                </vxe-table> 
                <vxe-pager border size="mini" :current-page="tablePage.currPage" :page-size="tablePage.pageSize"
                    :total="tablePage.total" :layouts="['PrevPage', 'JumpNumber', 'NextPage', 'FullJump', 'Sizes', 'Total']" @page-change="PageChange">
                </vxe-pager>
            </el-row>
            <el-drawer :visible.sync="logDrawer" size="45%" direction="rtl">
                <div slot="title">
                    <el-button @click="getLog(null)">      
                        <i class="el-icon-refresh-right" ></i>
                        <span>刷新</span>
                    </el-button>
                    <el-button @click="delLog()">      
                        <i class="el-icon-delete" ></i>
                        <span>清除日志</span>
                    </el-button>
                </div>
                <vxe-table style="width:100%" :height="tableHeight" resizable :data="logTableData" size="mini" stripe border highlight-hover-row highlight-current-row>
                    <vxe-table-column title="时间" width="170" header-align="center" align="start" show-header-overflow show-overflow>
                        <template v-slot="{ row }">
                            <div>
                                {{row.data.created_at}} 
                            </div>
                        </template>
                    </vxe-table-column> 
                    <vxe-table-column title="日志" min-width="300" header-align="center" align="start" show-header-overflow show-overflow>
                        <template v-slot="{ row }">
                            <div>
                                {{row.data.msg}} 
                            </div>
                        </template>
                    </vxe-table-column>   
                </vxe-table> 
                <vxe-pager border size="mini" :current-page="logTablePage.currPage" :page-size="logTablePage.pageSize"
                    :total="logTablePage.total" :layouts="['PrevPage', 'JumpNumber', 'NextPage', 'FullJump', 'Sizes', 'Total']" @page-change="logPageChange">
                </vxe-pager>
            </el-drawer>
        </el-container>
    </el-container>
</template>
<script lang="ts">
import { Component, Vue, Provide, Watch } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from 'vuex-class';
import { BIPUtil } from "@/utils/Request";
import {BipMenuBtn} from '@/classes/BipMenuBtn'
let tools = BIPUtil.ServApi;
import moment from 'moment'
import CDataSet from '@/classes/pub/CDataSet';
import { Cells } from "@/classes/pub/coob/Cells";
import QueryEntity from "@/classes/search/QueryEntity";
import { User } from '@/classes/User';
@Component({
    components: {
    }
})
/**
 * 接口取数
 */
export default class InterfaceGetData extends Vue {
    @State('bipComHeight', { namespace: 'login' }) height!: number;
    @Getter('user', { namespace: 'login' }) user?: User;
    tableHeight:any =500
    date:any = null//日期
    cellID:any ="300304WEB";
    cell:CDataSet = new CDataSet("");
    tablePage:any ={//分页信息
        total: 0,
        currPage:1,
        pageSize:20
    };
    tableData:any =[];
    selData:any =[];//勾选接口集合
    logDrawer:boolean = false;

    logTj:any = null;
    logCell:CDataSet = new CDataSet("");
    logCellId:any = "100104"
    logTablePage:any ={//分页信息
        total: 0,
        currPage:1,
        pageSize:20
    };
    logTableData:any =[];

    logDelCell:CDataSet = new CDataSet("");
    logDelCellId:any = "100104WEBDEL";

    tableLoading:boolean = false;
    async created() {
        this.date = moment(new Date()).format("YYYY-MM-DD");
        this.cell = await this.getCell(this.cellID);
        this.logCell = await this.getCell(this.logCellId);
        this.logDelCell = await this.getCell(this.logDelCellId);
        this.tableHeight =  this.height - 90
        this.initData();
    } 
    //查询接口信息
    async initData(){
        this.tableLoading = true;
        let qe:QueryEntity = new QueryEntity(this.cellID,this.cellID);
        qe.page = this.tablePage;
        let res = await this.cell.queryData(qe);
        if(res.data.id ==0 ){
            let data = res.data.data.data;
            this.tablePage = data.page
            this.tableData = data.data
        }
        this.selData=[];
        this.tableLoading = false;
    }
    //进行取数
    async getAPIData(){
        if(this.date == null || this.date ==''){
            this.$notify.error("没有选择日期");
            return;
        }
        let ids = [];
        for(var i=0;i<this.selData.length;i++){
            let d = this.selData[i];
            ids.push(d.data.id);
        }
        let btn1 = new BipMenuBtn("DLG","接口取数")
        btn1.setDlgType("D")
        btn1.setDlgCont("amb.serv.util.report.InterfaceGetData*202;0;0");//职能损益表
        let b = JSON.stringify(btn1)
        let ClientID = "";
        if(this.user){
            ClientID = this.user.deptInfo.cmcCode
            let prarm = {
                "date":this.date,//时间
                "ids":ids, //接口ID
                "ClientID":ClientID,
                "userId":this.user.userCode,
            }
            let v = JSON.stringify(prarm);
            this.$message.success("程序执行中！")
            let res = await tools.getDlgRunClass(v,b);
        }
        setTimeout(()=>{
            this.initData();
        },200); 
    }
    //分页信息变化
    PageChange({ currentPage, pageSize }:any) {
        this.tablePage.currPage = currentPage
        this.tablePage.pageSize = pageSize
        this.initData()
    }
    //勾选
    selectChangeEvent ({ checked, records }:any) {
        this.selData = records;
    }
    //显示日志
    async getLog(data:any){
        if(data!=null){
            this.logTj = data;
            this.logTablePage.currPage = 1;
        }
        this.logTableData = [];
        let qe:QueryEntity = new QueryEntity(this.logCellId,this.logCellId);
        qe.page = this.logTablePage;
        let tj = {node_id : this.logTj.code}
        qe.cont = JSON.stringify(tj)
        let res = await this.logCell.queryData(qe);
        if(res.data.id ==0 ){
            let data = res.data.data.data;
            this.logTablePage = data.page;
            this.logTableData = data.data;
        }
        this.logDrawer = true;
    }
    //日志分页信息变化
    logPageChange({ currentPage, pageSize }:any) {
        this.logTablePage.currPage = currentPage
        this.logTablePage.pageSize = pageSize
        this.getLog(null);
    }
    async delLog(){
        this.logDelCell.createRecord();
        this.logDelCell.currRecord.data.node_id = this.logTj.code;
        this.logDelCell.currRecord.c_state = 4;
        let res = await this.logDelCell.saveData();
        console.log(res)
        this.logTablePage.currPage = 1
        this.getLog(null);
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
    @Watch("height")
    heightChange() {
        this.tableHeight =  this.height - 90
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
hr{
    border-width: 0.1px;
    border-style: solid;
    border-color: #CCCCCC;
}
.log{
    color: #6e4dc2;
    text-decoration: none;
    background-color: transparent;
    outline: none;
    cursor: pointer;
    transition: color .3s;
}
</style>