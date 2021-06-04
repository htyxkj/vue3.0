<template>
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
        <vxe-table style="width:100%" :height="560" resizable :data="logTableData" size="mini" stripe border highlight-hover-row highlight-current-row>
            <vxe-table-column title="时间" width="130" header-align="center" align="start" show-header-overflow show-overflow>
                <template v-slot="{ row }">
                    <div>
                        {{row.data.created_at}} 
                    </div>
                </template>
            </vxe-table-column> 
            <vxe-table-column title="操作员" width="80" header-align="center" align="start" show-header-overflow show-overflow>
                <template v-slot="{ row }">
                    <div>
                        {{row.data.user_name}} 
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
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi;
import moment from 'moment'
import CDataSet from '@/classes/pub/CDataSet';
import { Cells } from "@/classes/pub/coob/Cells";
import QueryEntity from "@/classes/search/QueryEntity";
@Component({})
export default class BipLog extends Vue {
    @Prop() nodeId!:string
    @Prop() nodeType!:string
    logDrawer:boolean = false;
    logCell:CDataSet = new CDataSet("");
    logCellId:any = "WEBEXCELIMPLOG"
    logTablePage:any ={//分页信息
        total: 0,
        currPage:1,
        pageSize:20
    };
    logTableData:any =[];
    logDelCell:CDataSet = new CDataSet("");
    logDelCellId:any = "WEBEXCELILOGDEL";

    async mounted(){
        this.logCell = await this.getCell(this.logCellId);
        this.logDelCell = await this.getCell(this.logDelCellId);
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

    show(){
        this.logDrawer = true;
        this.$nextTick(()=>{
            this.getLog(null);
        })
    }

    close(){
        this.logDrawer = false;
    }
     //显示日志
    async getLog(data:any){
        if(data!=null){
            this.logTablePage.currPage = 1;
        }
        this.logTableData = [];
        let qe:QueryEntity = new QueryEntity(this.logCellId,this.logCellId);
        qe.page = this.logTablePage;
        let tj = {node_type : this.nodeType,node_id:this.nodeId}
        qe.cont = JSON.stringify(tj)
        let res = await this.logCell.queryData(qe);
        if(res.data.id ==0 ){
            let data = res.data.data.data;
            this.logTablePage = data.page;
            this.logTableData = data.data;
        }
    }
    //日志分页信息变化
    logPageChange({ currentPage, pageSize }:any) {
        this.logTablePage.currPage = currentPage
        this.logTablePage.pageSize = pageSize
        this.getLog(null);
    }
    async delLog(){
        this.logDelCell.createRecord();
        this.logDelCell.currRecord.data.node_id = this.nodeId;
        this.logDelCell.currRecord.c_state = 4;
        let res = await this.logDelCell.saveData();
        console.log(res)
        this.logTablePage.currPage = 1
        this.getLog(null);
    }
}
</script>
