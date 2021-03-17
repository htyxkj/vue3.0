<template>
    <div class="ItemKanbanCard" :style="style">
        <el-row :gutter="10">
            <el-col :span="10">
                <el-card class="box-card">
                    <div slot="header" class="clearfix">
                        <span>经营计划</span>
                        <el-button icon="el-icon-refresh" @click="initItemData" circle size="mini" style="float: right;    margin-left: 9px;"></el-button>
                        <el-input placeholder="请输入内容" size="mini" v-model="taskName" style="float: right;width: 300px;">
                            <el-button slot="append" icon="el-icon-search" @click="initItemData"></el-button>
                        </el-input>
                    </div>
                    <vxe-table ref="itemKanbanTask" border resizable size="small" highlight-hover-row show-all-overflow="tooltip"
                    show-header-overflow highlight-current-row class="vxe-table-element checkbox-table"
                    @cell-click="taskDetailsGT" :loading="itemKanbanTaskLoading"
                    :data.sync="bipInsAid.values" height='300' :optimized="true">
                    <vxe-table-column type="seq" fixed="left" width="40"></vxe-table-column>
                        <template v-for="(item,index) in bipInsAid.showColsIndex">
                            <vxe-table-column :key="index" header-align="center" :align="index==0?'left':'center'"  :width="tableFWidth[index]" :field="bipInsAid.cells.cels[item].id"
                            :title="bipInsAid.cells.cels[item].labelString" show-header-overflow  show-overflow >
                            </vxe-table-column> 
                        </template>
                    </vxe-table>
                </el-card>
            </el-col>
            <el-col :span="14">
                <el-card class="box-card">
                    <div slot="header" class="clearfix">
                        <span>经营进展情况</span>
                        <el-button icon="el-icon-full-screen" v-if="!isFullScreen" @click="openFullScreen" circle size="mini" style="float: right;"></el-button>
                    </div>
                    <BipGant :config="gttConfig" :height='300'></BipGant>
                </el-card>
            </el-col>
        </el-row>
        <el-row v-if="jdhbCell && jdhbCell.ccells" style="padding-top:5px">
            <el-card class="box-card">
                <div slot="header" class="clearfix">
                    <span>相关汇报信息</span>
                </div>
                <vxe-table ref="itemKanbanTaskHB" border resizable size="small" highlight-hover-row show-all-overflow="tooltip"
                show-header-overflow highlight-current-row class="vxe-table-element checkbox-table"  :loading="itemKanbanTaskHBLoading"
                :data.sync="jdhbCell.cdata.data" height='320' :optimized="true">
                <vxe-table-column type="seq" width="40" fixed="left"></vxe-table-column>
                    <template v-for="(item,index) in jdhbCell.ccells.cels">
                        <vxe-table-column v-if="(item.attr&0x400) <= 0 " :key="index" header-align="center" align="center" :field="item.id"
                        :title="item.labelString" show-header-overflow  show-overflow>
                            <template v-slot="{rowIndex}"> 
                                <bip-grid-info :cds="jdhbCell" :cell="item" :row="rowIndex" :bgrid="true" ></bip-grid-info>
                            </template>
                        </vxe-table-column> 
                    </template>
                </vxe-table>
            </el-card>
        </el-row>
        <el-dialog class="flDialog" title="" :visible.sync="isFullScreen" fullscreen append-to-body @close="dlaClose">
            <slot slot="title">
                经营进展情况
            </slot>
           <BipGant :config="gttConfig" :height='500'></BipGant>
        </el-dialog>
    </div>
</template>
<script lang="ts">
import { Vue, Provide, Prop, Component,Watch } from 'vue-property-decorator';
import { State, Action, Getter, Mutation } from 'vuex-class';
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
    @State('bipComHeight', { namespace: 'login' }) height!: number;
    style:string="height:"+(this.height?this.height:'400')+"px";
    bipInsAid:BipInsAidNew = new BipInsAidNew("")
    gttConfig:any = null;
    jdhbCellId:any = "13030713";
    jdhbCell:CDataSet= new CDataSet("");
    isFullScreen:boolean = false;
    taskName:any = null;
    itemKanbanTaskLoading:boolean = false;
    itemKanbanTaskHBLoading:boolean = false;
    tableFWidth:any=[-1,95,75,63,63];
    created(){
        
    }
    async mounted(){
        await this.initItemData();
        this.jdhbCell = await this.getCell(this.jdhbCellId)
        this.style="height:"+(this.height?this.height:'400')+"px";
    }
    /**
     * 查询任务信息
     */
    async initItemData(){
        this.itemKanbanTaskLoading = true;
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
        if(this.taskName && this.taskName.length>0){
            let qCont = new QueryCont('name',this.taskName,12);
            qCont.setContrast(3)
            let oneCont = [qCont]; 
            qe.cont = "~[" + JSON.stringify(oneCont)+"]";
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
        this.itemKanbanTaskLoading = false;
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
                    out_scm:vl.out_scm,
                    out_sopr:vl.out_sopr,
                    whours:vl.whours,
                    label:"实际完成："+(vl.rate*100)+"%/预计完成："+(vl.yjrate*100).toFixed(0)+"%",
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
                    this.onTaskClick(_d,null)
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
                        click({event,data}:any) {
                            _this.onTaskClick( data,event);
                        }
                    }
                },
                {id:2,label:"负责部门",value:"out_scm",expander: true,width: 90,
                    events: {
                        click({event,data}:any) {
                            _this.onTaskClick( data,event);
                        }
                    }
                },
                {id:3,label:"负责人",value:"out_sopr",expander: true,width: 80,
                    events: {
                        click({event,data}:any) {
                            _this.onTaskClick( data,event);
                        }
                    }
                },
                {id:4,label:"持续天数",value:"whours",expander: true,width: 60,
                    events: {
                        click({event,data}:any) {
                            _this.onTaskClick( data,event);
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
                //    background:'#81C2DC'
                },
                'chart-row-text':{
                    background:'transparent'
                }
            }
        } 
    }

    /**
     * 打开全屏
     */
    openFullScreen(){ 
        this.gttConfig.maxHeight = 500
        this.isFullScreen = true;
    }
    dlaClose(){
        this.gttConfig.maxHeight = 235
        this.isFullScreen = false;
    }
    /**
     * 甘特图点击事件
     */
    async onTaskClick(data:any,event:any){
        this.itemKanbanTaskHBLoading = true;
        if(event){
            let itemDom = event.path[4];
            if(itemDom){
                let cc = document.querySelector('.gantt-task-list-item-select')
                if(cc){
                    cc.classList.remove("gantt-task-list-item-select")
                }
                itemDom.classList.add("gantt-task-list-item-select");
            }
        }
        let sid = data.sid
        let dom:any = document.querySelector('.gantt-elastic__chart-scroll-container--horizontal')
        if(dom){
            dom.scrollTo(data.x,data.y)
        }
        let qe:QueryEntity = new QueryEntity(this.jdhbCellId,this.jdhbCellId);
        qe.page.pageSize = 10000;
        qe.cont = JSON.stringify({jbno:sid})
        let res = await this.jdhbCell.queryData(qe);
        if(res.data.id ==0 ){
            let data = res.data.data.data;
            this.jdhbCell.cdata.data = data.data;
            let table:any = this.$refs['itemKanbanTaskHB'];
            table.setCurrentRow(data.data[0]);
            table.syncData();
        }
        this.itemKanbanTaskHBLoading = false;
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
    @Watch("height")
    heightWatch(){
        this.style = "height:"+(this.height?this.height:'400')+"px";
    }
}
</script>
<style scoped>
.clearfix{
    line-height: 25px;
}
</style>
<style lang="scss">
.ItemKanbanCard{
    overflow-y: auto;
    overflow-x: hidden;
    .el-card__body{
        padding:10px;
    }
}
</style>