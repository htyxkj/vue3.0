<template>
    <div>
        <el-button class="refreshBtn" icon="el-icon-refresh" size="mini" @click="initItemData">刷新</el-button>
        <el-row>
            <el-col :span="10">
                <vxe-table ref="itemKanbanTask" border resizable size="small" highlight-hover-row show-all-overflow="tooltip"
                show-header-overflow highlight-current-row class="vxe-table-element checkbox-table"
                @cell-click="taskDetailsGT"
                :data.sync="bipInsAid.values" height='300' :optimized="true">
                <vxe-table-column type="seq" width="40" fixed="left"></vxe-table-column>
                    <template v-for="(item,index) in bipInsAid.showColsIndex">
                        <vxe-table-column :key="index" header-align="center" align="center" :field="bipInsAid.cells.cels[item].id"
                        :title="bipInsAid.cells.cels[item].labelString" show-header-overflow  show-overflow >
                        </vxe-table-column> 
                    </template>
                    <!-- <vxe-table-column header-align="center" align="center" title="完成情况" show-header-overflow  show-overflow >
                        <template v-slot="{row}"> 
                            <progress-bar class="progress" offsetParent="body" width="80%" :pointNum="100" :percent="row.sjrate" :canDrag="false"></progress-bar>
                        </template>
                    </vxe-table-column> -->
                </vxe-table>
            </el-col>
            <el-col :span="14">
                <div>
                    <BipGant :config="gttConfig" :height='300' @onTaskClick="onTaskClick"></BipGant>
                </div>
            </el-col>
        </el-row>
        <el-row v-if="jdhbCell && jdhbCell.ccells">
            <vxe-table ref="itemKanbanTask" border resizable size="small" highlight-hover-row show-all-overflow="tooltip"
            show-header-overflow highlight-current-row class="vxe-table-element checkbox-table"
            :data.sync="jdhbCell.cdata.data" height='300' :optimized="true">
            <vxe-table-column type="seq" width="40" fixed="left"></vxe-table-column>
                <template v-for="(item,index) in jdhbCell.ccells.cels">
                    <vxe-table-column v-if="(item.attr&0x400) <= 0 " :key="index" header-align="center" align="center" :field="item.id"
                    :title="item.labelString" show-header-overflow  show-overflow >
                        <template v-slot="{rowIndex}"> 
                            <bip-grid-info :cds="jdhbCell" :cell="item" :row="rowIndex" :bgrid="true" ></bip-grid-info>
                        </template>
                    </vxe-table-column> 
                </template>
            </vxe-table>
        </el-row>
    </div>
</template>
<script lang="ts">
import { Vue, Provide, Prop, Component,Watch } from 'vue-property-decorator';
import QueryEntity from "@/classes/search/QueryEntity";
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi;
import BipInsAidNew from '@/classes/BipInsAidNew';
import BipGant from '@/components/chart/BipGant.vue';
import ProgressBar from "@/components/progressBar/ProgressBar.vue"
import QueryCont from "@/classes/search/QueryCont";
import { Cells } from "@/classes/pub/coob/Cells";
import CDataSet from "@/classes/pub/CDataSet";
import BipGridInfo from "@/components/editorn/grid/BipGridInfo.vue";
import moment from "moment"
@Component({
    components: {
        BipGant,
        ProgressBar,
        BipGridInfo
    }
})
export default class ItemKanban extends Vue{
    bipInsAid:BipInsAidNew = new BipInsAidNew("")
    gttConfig:any = null;
    jdhbCellId:any = "13030713";
    jdhbCell:CDataSet= new CDataSet("");
    created(){
        
    }
    async mounted(){
        await this.initItemData();
        this.jdhbCell = await this.getCell(this.jdhbCellId)
    }
    /**
     * 查询任务信息
     */
    async initItemData(){
        let qe: QueryEntity = new QueryEntity("", "");
        qe.page.currPage = 1;
        qe.page.pageSize = 500;
        let cc = await tools.getBipInsAidInfo("WEBGETITEM", 200, qe);
        if(cc.data.id ==0){
            let rr = cc.data.data.data;
            if(rr && rr.cells && rr.cells.cels && rr.cells.cels.length>0){
                this.bipInsAid = rr
            }
        }else{
            this.$notify.error("WEBGETITEM ：获取辅助信息失败！");
        }
        cc = await tools.getBipInsAidInfo("WEBGETITEM", 210, qe);
        this.bipInsAid.values = [];
        if(cc.data.id==0){
            this.bipInsAid.values = cc.data.data.data.values;
            let table:any = this.$refs['itemKanbanTask'];
            table.setCurrentRow(this.bipInsAid.values[0]);
            let d={rowIndex:0}
            this.taskDetailsGT(d);
            setTimeout(() => {
                this.taskDetailsGT(d);
            }, 500);
        }else{
            this.$notify.error("WEBGETITEM ：获取辅助数据失败！");
        }
    }
    async taskDetailsGT(d:any){
        let row =  this.bipInsAid.values[d.rowIndex];
        let qe: QueryEntity = new QueryEntity("", "");
        let obno = row.obno
        let qCont = new QueryCont('obno',obno,12);
        let oneCont = [qCont]; 
        qe.cont = "~[" + JSON.stringify(oneCont)+"]";
        qe.page.currPage = 1;
        qe.page.pageSize = 500;
        let cc = await tools.getBipInsAidInfo("WEBITEMGT", 210, qe);
        let data = [];
        let sidNum:any={};
        if(cc.data.id ==0){
            let values = cc.data.data.data.values;
            for(var i=0;i<values.length;i++){
                let vl = values[i];
                if(!vl.bdate)
                    continue;
                if(!vl.rate)
                    vl.rate=0;
                if(!vl.whours)
                    vl.whours=0
                sidNum[vl.sid] = (i+1);

                vl.bdate = moment(vl.bdate).format('YYYY-MM-DD')+" 00:00:00";
                let _d = {
                    id:(i+1),
                    sid:vl.sid,
                    taskname:vl.taskname,
                    itemsopr:vl.usrname,
                    whours:vl.whours,
                    label:(vl.rate*100)+"%/"+(vl.yjrate*100).toFixed(0)+"%",
                    start: new Date(vl.bdate).getTime(),
                    duration:vl.whours *24* 60 * 60 * 1000 ,
                    percent:vl.rate*100,
                    parentId:sidNum[vl.taskno],
                    type: "task",
                    style: {
                        base: {
                            fill: "#F9D820",
                            stroke: "#7E349D"
                        }
                    }
                }
                data.push(_d);
                if(i ==0 ){
                    this.onTaskClick(_d.sid)
                }
            }
        }else{
                
        }
        let _this = this
        this.gttConfig= {
            data: data,
            columns : [
                {id:1,label:"工作事项",value:"taskname",expander: true,width: 200,
                    events: {
                        click({ data }:any) {
                            _this.onTaskClick( data.sid);
                        }
                    }
                },
                {id:2,label:"负责人",value:"itemsopr",expander: true,width: 80,
                    events: {
                        click({ data }:any) {
                            _this.onTaskClick( data.sid);
                        }
                    }
                },
                {id:3,label:"持续天数",value:"whours",expander: true,width: 100,
                    events: {
                        click({ data }:any) {
                            _this.onTaskClick( data.sid);
                        }
                    }
                }
            ],
            maxHeight:235,
            dynamicStyle:{
                'task-list-item-value': {
                    background: 'transparent'
                },
                'task-list-item':{
                    // background:'#81C2DC'
                },
            }
        } 
    }


    /**
     * 甘特图点击事件
     */
    async onTaskClick(sid:any){
        let qe:QueryEntity = new QueryEntity(this.jdhbCellId,this.jdhbCellId);
        qe.page.pageSize = 10000;
        qe.cont = JSON.stringify({jbno:sid})
        let res = await this.jdhbCell.queryData(qe);
        if(res.data.id ==0 ){
            let data = res.data.data.data;
            this.jdhbCell.cdata.data = data.data;
        }
    }
    async getCell(cellid:string){
        let res = await tools.getCCellsParams(cellid); 
        let rtn: any = res.data; 
        if (rtn.id == 0) {
        let kn: Array<Cells> = rtn.data.layCels;
        let cells = kn; 
            return new CDataSet(cells[0]);  
        }else{
            return new CDataSet('');
        }
    }
}
</script>

<style scoped>
.refreshBtn{
    margin: 5px
}
</style>