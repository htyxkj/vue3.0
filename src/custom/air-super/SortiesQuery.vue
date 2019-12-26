<template>
  <div class="sortquery">
      <div class="nav">
          <el-button  icon="el-icon-search" size="mini" @click="selectCoList">查询</el-button>
          <el-button icon="iconfont icon-bip-save" size="mini" >保存</el-button>
          <el-button icon="el-icon-full-screen" size="mini">全图</el-button>
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
                border
                align="center"
                size="mini"
                :height="style1"
                ref="xTable1"
                :data="tableData">
                <vxe-table-column field="id" title="主键" ></vxe-table-column> 
                <vxe-table-column field="tkid" title="任务标识" ></vxe-table-column>
                <vxe-table-column field="ssid" title="序号" ></vxe-table-column>
                <vxe-table-column field="asid" title="飞机编号"  ></vxe-table-column>
                <vxe-table-column field="usrcode" title="终端账户"  ></vxe-table-column>
                <vxe-table-column field="asidscm" title="通航公司" ></vxe-table-column>
                <vxe-table-column field="bgtime1" title="开始时间" width="60"></vxe-table-column>
                <vxe-table-column field="edtime1" title="结束时间"  width="60"></vxe-table-column>
                <vxe-table-column field="avgaltitude" title="平均海拔(m)" width="80" ></vxe-table-column>
                 <vxe-table-column field="sumtime" title="喷洒时长" width="80" ></vxe-table-column>
                <vxe-table-column field="avgspeed" title="平均航速(km、h)" width="60"></vxe-table-column>
                <vxe-table-column field="summileage" title="喷洒里程(km)" width="60"></vxe-table-column>
                <vxe-table-column field="sumarea" title="喷洒面积(亩)"  width="60"></vxe-table-column>
                <vxe-table-column field="avgflow" title="平均流量(m3/h)(m)" width="80" ></vxe-table-column>
                <vxe-table-column field="sumflow" title="总流量(m3)(m3/h)(m)" width="80" ></vxe-table-column>
            </vxe-table>
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
@Component({
  components: {
    
  }
})
export default class followTimesLine extends Vue {
    @State("bipComHeight", { namespace: "login" }) height!: number;
    @Provide() style1: string = ""+ (this.height ? this.height - 85 : "400");
    @Provide() page: any = { pageSize: 100, currPage: 1, total: 0 };
    @Provide() tableData: Array<any> = [];
    @Provide() taskTjCell: CDataSet = new CDataSet(""); //飞防任务对象(查询条件)
  
  async created() {
        if (this.height) {
            this.style1 = ""+ (this.height - 250);
        }

        // 初始化条件查询区域
        this.taskTjCell = await this.getCell("FW0320TJ");
        this.taskTjCell.createRecord();
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
      this.tableData = vv.data.data.data.data;  
    }
    console.log(this.tableData)
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