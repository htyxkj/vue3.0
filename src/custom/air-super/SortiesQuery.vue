<template>
  <div class="sortquery">
      <div class="nav">
          <el-button  icon="el-icon-search" size="mini" @click="selectCoList">查询</el-button>
          <el-button icon="iconfont icon-bip-save" size="mini" @click="saveAll">保存</el-button>
          <el-button icon="el-icon-full-screen" size="mini" @click="fullImage">全图</el-button>
      </div>
      <div class="query">
          <el-row class="bip-lay">
                <el-form @submit.native.prevent label-position="right" label-width="100px">
                    <div v-for="(cel,index) in taskTjCell.ccells.cels" :key="'A'+index">
                        <bip-comm-editor
                            v-if="(cel.attr&0x400) <= 0 "
                            :cell="cel"
                            :bgrid="false"
                            :cds="taskTjCell"
                            :row="0"
                        />
                    </div>
                </el-form>
            </el-row>
      </div>

      <div class="sortdata">
          <vxe-table
                :height="style1"
                border
                resizable
                size="small"
                highlight-hover-row
                show-all-overflow="tooltip"
                show-header-overflow
                highlight-current-row
                class="vxe-table-element checkbox-table"
                :edit-config="{trigger: 'click', mode: 'cell',showStatus: true,showIcon:false}"
                :data.sync="jcCell.cdata.data" 
                remote-sort
                :sort-config="{trigger: 'cell'}"
                show-footer
                row-id="id"
                :optimized="true"
                @edit-actived="rowActive"
                @edit-closed="editClose"
                :selectRow="jcCell.currRecord"
                > 
                <vxe-table-column title="操作" width="60">
                    <template v-slot="{ row }">
                        <i class="el-icon-picture-outline" @click="goToSortiesTrack(row.data.tkid,row.data.bgtime1,row.data.edtime1)"></i>
                    </template>
                </vxe-table-column>
                <template v-for="(cel,index) in jcCell.ccells.cels">
                    <vxe-table-column
                        header-align="center"
                        align="center" 
                        :key="index"
                        :field="cel.id" 
                        :title="cel.labelString"
                        show-header-overflow
                        :edit-render="{name: 'default'}"
                        show-overflow
                        :disabled="(cel.attr&0x40)>0"
                        v-if="(cel.attr & 0x400) == 0"
                    >
                        <template v-slot:edit="{row,rowIndex}">
                            <bip-comm-editor  :cell="cel" :cds="jcCell" :row="rowIndex" :bgrid="true"/> 
                        </template>
                        <template v-slot="{row,rowIndex}">
                            <bip-grid-info
                                :cds="jcCell"
                                :cell="cel"
                                :row="rowIndex"
                                :bgrid="true"
                            ></bip-grid-info>
                        </template>
                    </vxe-table-column>
                </template>
            </vxe-table>
            <!-- <vxe-table
                border
                align="center"
                size="mini"
                :height="style1"
                ref="xTable1"
                :data="tableData">
                <vxe-table-column field="id" title="主键" ></vxe-table-column> 
                <vxe-table-column field="tkid" title="任务标识" ></vxe-table-column>
                <vxe-table-column title="操作" width="60">
                    <template v-slot="{ row }">
                        <i class="el-icon-picture-outline" @click="goToSortiesTrack(row.tkid,row.bgtime1,row.edtime1)"></i>
                    </template>
                </vxe-table-column>
                <vxe-table-column field="ssid" title="序号"  width="60"></vxe-table-column>
                <vxe-table-column field="asid" title="飞机编号"  width="100"></vxe-table-column>
                <vxe-table-column field="usrcode" title="终端账户" width="100" ></vxe-table-column>
                <vxe-table-column field="asidscm" title="通航公司" width="150" ></vxe-table-column>
                <vxe-table-column field="bgtime1" title="开始时间" width="100"></vxe-table-column>
                <vxe-table-column field="edtime1" title="结束时间"  width="100"></vxe-table-column>
                <vxe-table-column field="avgaltitude" title="平均海拔(m)" width="90" ></vxe-table-column>
                 <vxe-table-column field="sumtime" title="喷洒时长" width="100" ></vxe-table-column>
                <vxe-table-column field="avgspeed" title="平均航速(km/h)" width="120"></vxe-table-column>
                <vxe-table-column field="summileage" title="喷洒里程(km)" width="100"></vxe-table-column>
                <vxe-table-column field="sumarea" title="喷洒面积(亩)"  width="100"></vxe-table-column>
                <vxe-table-column field="avgflow" title="平均流量(m3/h)" width="120" ></vxe-table-column>
                <vxe-table-column field="sumflow" title="总流量(m3)" width="100" ></vxe-table-column>
            </vxe-table> -->
        </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Provide, Watch } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from "vuex-class";
import QueryEntity from "@/classes/search/QueryEntity";
import QueryCont from "@/classes/search/QueryCont";
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi;
import { Cells } from "@/classes/pub/coob/Cells";
import CDataSet from "@/classes/pub/CDataSet";
import BipGridInfo from "@/components/editorn/grid/BipGridInfo.vue";
@Component({
  components: {
    BipGridInfo
  }
})
export default class followTimesLine extends Vue {
    @State("bipComHeight", { namespace: "login" }) height!: number;
    @Provide() style1: string = ""+ (this.height ? this.height - 85 : "400");
    @Provide() page: any = { pageSize: 100, currPage: 1, total: 0 };
    @Provide() tableData: Array<any> = [];
    @Provide() taskTjCell: CDataSet = new CDataSet(""); //飞防任务对象(查询条件)
    @Provide() jcCell:CDataSet = new CDataSet("");//架次对象
    async created() {
        if (this.height) {
            this.style1 = ""+ (this.height - 250);
        }

        // 初始化条件查询区域
        this.taskTjCell = await this.getCell("FW0320TJ");
        this.taskTjCell.createRecord();
        this.jcCell = await this.getCell("FW0320");
        
    }
  mounted() {

  }
 
  // ------------------------数据请求-----------------

  //  1.获取任务对应架次信息
  async selectCoList() {
    let tkid = this.taskTjCell.currRecord.data.sid; 
    if(tkid == "" || tkid == null){
        this.$notify.error("请选择任务名称！");
        return;
    }
    let qe: QueryEntity = new QueryEntity("FW0320", "FW0320");
    qe.page = this.page;
    qe.cont = "{'tkid':'"+tkid+"'}";
    qe.oprid = 13;
    let vv = await tools.query(qe);
    if (vv.data.id == 0) {
    //     console.log(vv)
    //   let _tableData = vv.data.data.data.data;  
      this.jcCell.cdata.data = vv.data.data.data.data;  
    //   this.tableData = [];
    //   for (let index = 0; index < _tableData.length; index++) {
    //     this.tableData.push(_tableData[index].data);
    //   }
    }
  }
    rowActive(rowInfo: any, event: any) {
        this.jcCell.currRecord = this.jcCell.getRecordAtIndex(rowInfo.rowIndex);
        this.jcCell.index = rowInfo.rowIndex;
    }

    editClose(rowInfo: any, event: any) {
        this.jcCell.currRecord = this.jcCell.getRecordAtIndex(rowInfo.rowIndex);
    }
    /**
     * 航迹全图
     */
    fullImage(){
        let tkid = this.taskTjCell.currRecord.data.sid; 
        if(tkid == "" || tkid == null){
            this.$notify.error("请选择任务名称！");
            return;
        }
        let bgtime = this.taskTjCell.currRecord.data.bgtime;
        let edtime = this.taskTjCell.currRecord.data.edtime;
        this.goToSortiesTrack(tkid,bgtime,edtime);
    }
    goToSortiesTrack(tkid:any,bgtime:any,edtime:any){
        console.log(tkid,bgtime,edtime)
        this.$router.push({
            path:'/TrackShow',
            name:'TrackShow',
            params:{tkid:tkid,bgtime:bgtime,edtime:edtime},
            query: {pmenuid:"F0313"},
        })
    }
    async saveAll(){
        this.taskTjCell.currRecord.c_state = 2; 
        this.taskTjCell.ds_sub=[];
        this.taskTjCell.ds_sub.push(this.jcCell)
        let restj = await this.taskTjCell.saveData();
        if(restj.data.id == 0){ 
            this.$notify.success("保存成功！")
        }else{
            this.$notify.error("保存失败！")
        }
    }
  // 获取对象信息
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
        this.style1 = "" + (this.height - 250) ;
    }
}
</script>

<style>
.nav {
    padding-bottom: 10px;
    background-color: #f9f9f9;
}
.query {
    padding-top: 10px;
    padding-bottom: 5px;
    padding-right: 10px;
    -webkit-box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.sortdata {
    margin-top: 10px;
    padding: 20px;
     -webkit-box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>