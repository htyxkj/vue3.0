<template>
    <el-row>
        <div ref="se" @keyup.enter="find">
            <bip-search-cont2 :env="env" @invokecmd="invokecmd"></bip-search-cont2>
        </div>
        <vxe-table resizable size="mini" auto-resize show-overflow class="vxe-table-element mytable-scrollbar"  border="inner"
            stripe highlight-hover-row :data="table_cell.cdata.data" :height="table_height">
                <!-- <vxe-table-column type="checkbox" width="60"></vxe-table-column> -->
                <template v-for="(item,index) in table_cell.ccells.cels"> 
                    <vxe-table-column :key="index" header-align="center" min-width="120" align="center" :field="item.id"
                        :title="item.labelString" show-header-overflow  v-if="!(item.attr & 0x400)>0"
                        show-overflow :sortable ="(item.attr&0x400000)>0">
                        <template v-slot="{rowIndex}"> 
                            <bip-grid-info :cds="table_cell" :cell="item" :row="rowIndex" :bgrid="true" ></bip-grid-info>
                        </template>
                    </vxe-table-column>  
                </template>
        </vxe-table>
    </el-row>
</template>
<script lang="ts">
import { Vue,Component } from 'vue-property-decorator';
import { State} from 'vuex-class';
import {BipMenuBtn} from '@/classes/BipMenuBtn'
import { BIPUtil } from "@/utils/Request";
import CDataSet from "@/classes/pub/CDataSet";
import {CommICL} from '@/utils/CommICL'
import CCliEnv from "@/classes/cenv/CCliEnv";
let ICL = CommICL
import { Cells } from "@/classes/pub/coob/Cells";
import CRecord from "@/classes/pub/CRecord";
import BipGridInfo from "@/components/editorn/grid/BipGridInfo.vue";

@Component({
    components: {BipGridInfo }
})
export default class AgvDataList extends Vue{
    @State('bipComHeight', { namespace: 'login' }) height!: number;
    dsm_cont: CDataSet = new CDataSet(null);
    env: CCliEnv = new CCliEnv();
    table_cell:any=new CDataSet("");
    table_height:any = 450
    async created(){
        this.dsm_cont = await this.getCell("AGVDATANEWTJ");
        this.env.ds_cont = this.dsm_cont
        this.dsm_cont.createRecord()
        this.table_cell = await this.getCell("AGVDATANEW")
        this.table_cell.cdata.data = [];
    }
    async mounted(){
        
    }
    invokecmd(btn:any){
        let cmd = btn.cmd
        // 重置功能
        if(cmd == ICL.B_CMD_CLEAR){
            if(this.dsm_cont.ccells && this.dsm_cont.ccells.cels.length){
                for(var i=0;i<this.dsm_cont.ccells.cels.length;i++){
                    let cel = this.dsm_cont.ccells.cels[i];
                    if((cel.attr & 0x400 )<=0 && (cel.attr & 0x40)<=0)
                        this.dsm_cont.currRecord.data[cel.id] = null;
                }
            }
        }else if(cmd == ICL.B_CMD_FIND ) {
            this.find()
        }
    }
    async find(){
        let bok = this.dsm_cont.checkNotNull()
        if(bok){
            this.$notify.warning(bok);
            return;
        }
        this.table_cell.cdata.data=[]
        let tj = this.dsm_cont.currRecord.data;
        let param = {start_time:tj.start_time,end_time:tj.end_time,dev_id:tj.dev_id}
        let btn1 = new BipMenuBtn("DLG"," 数据列表")
        btn1.setDlgType("D")
        btn1.setDlgCont("agv.serv.AgvApiDataNew*200;0;1");
        let b = JSON.stringify(btn1)
        let v = JSON.stringify(param);
        let res = await BIPUtil.ServApi.getDlgRunClass(v,b);
        console.log(res)
        if(res.data.id ==0){
            let table_data = res.data.data.data;
            for(var i=0;i<table_data.length;i++){
                let cr = new CRecord();
                cr.data = table_data[i];
                this.table_cell.cdata.data.push(cr);
            }
            this.$notify.success("查询完成！");
        }else{
            this.$notify.error(res.data.message);
        }
    }
    //获取对象
    async getCell(cellid: string) {
        let res = await BIPUtil.ServApi.getCCellsParams(cellid);
        let rtn: any = res.data;
        if (rtn.id == 0) {
            let kn: Array<Cells> = rtn.data.layCels;
            let cells = kn;
            return new CDataSet(cells[0]);
        } else {
            return new CDataSet("");
        }
    }
}
</script>
<style scoped>
</style>