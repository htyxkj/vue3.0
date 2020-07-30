<template>
  <div class="Workbench bip-main-container">
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-collapse v-model="activeNames" @change="handleChange">
        <el-collapse-item title="客户统计" name="1">
          <div class="cdicStat">
            <el-row type="flex" justify="space-around">
              <el-col :span="3">
                <div class="cdicCont bk1">
                  <div class="cdicTitle">客户总数量</div>
                  <div class="cdicNum" v-if="cdicdetail[0]" >{{cdicdetail[0]['round(ifnull(b.qty,a.qty),0)']}}个</div>
                  <div class="cdicNum" v-else>{{0}}个</div>
                </div>
              </el-col>
              <el-col :span="3">
                <div class="cdicCont bk2">
                  <div class="cdicTitle">所有未联系客户</div>
                   <div class="cdicNum" v-if="cdicdetail[1]" >{{cdicdetail[1]['round(ifnull(b.qty,a.qty),0)']}}个</div>
                  <div class="cdicNum" v-else>{{0}}个</div>
                </div>
              </el-col>
              <el-col :span="3">
                <div class="cdicCont bk3">
                  <div class="cdicTitle">逾期待联系客户</div>
                   <div class="cdicNum" v-if="cdicdetail[2]" >{{cdicdetail[2]['round(ifnull(b.qty,a.qty),0)']}}个</div>
                  <div class="cdicNum" v-else>{{0}}个</div>
                </div>
              </el-col>
              <el-col :span="3">
                <div class="cdicCont bk4">
                  <div class="cdicTitle">今日待联系客户</div>
                   <div class="cdicNum" v-if="cdicdetail[3]" >{{cdicdetail[3]['round(ifnull(b.qty,a.qty),0)']}}个</div>
                  <div class="cdicNum" v-else>{{0}}个</div>
                </div>
              </el-col>
              <el-col :span="3">
                <div class="cdicCont bk5">
                   <div class="cdicTitle">今天已联系客户</div>
                  <div class="cdicNum" v-if="cdicdetail[4]" >{{cdicdetail[4]['round(ifnull(b.qty,a.qty),0)']}}个</div>
                  <div class="cdicNum" v-else>{{0}}个</div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-collapse-item>
        <el-collapse-item title="本月款项统计" name="2">
          <div class="cdicStat">
            <el-row type="flex" justify="space-around">
              <el-col :span="3">
                <div class="cdicCont bk4">
                  <div class="cdicTitle">成交合同数量</div>
                  <div class="cdicNum" v-if="fcydetail[0]" >{{fcydetail[0]['round(ifnull(b.qty,a.qty),0)']}}元</div>
                  <div class="cdicNum" v-else>0个</div>
                </div>
              </el-col>
              <el-col :span="3">
                <div class="cdicCont bk3">
                  <div class="cdicTitle">成交合同金额</div>
                   <div class="cdicNum" v-if="fcydetail[1]" >{{fcydetail[1]['round(ifnull(b.qty,a.qty),0)']}}元</div>
                  <div class="cdicNum" v-else>0元</div>
                </div>
              </el-col>
              <el-col :span="3">
                <div class="cdicCont bk1">
                  <div class="cdicTitle">回款金额</div>
                   <div class="cdicNum" v-if="fcydetail[2]" >{{fcydetail[2]['round(ifnull(b.qty,a.qty),0)']}}元</div>
                  <div class="cdicNum" v-else>0元</div>
                </div>
              </el-col>
              <el-col :span="3">
                <div class="cdicCont bk2">
                  <div class="cdicTitle">开票金额</div>
                   <div class="cdicNum" v-if="fcydetail[3]" >{{fcydetail[3]['round(ifnull(b.qty,a.qty),0)']}}元</div>
                  <div class="cdicNum" v-else>0元</div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-collapse-item>
        <el-collapse-item title="预警信息" name="3">
          <div class="tableList">
            <el-tabs v-model="activeName" @tab-click="handleClick">
              <el-tab-pane label="本月到期合同" name="first">
                <el-table :data="tableData" border stripe size="small  " style="width: 100%">
                  <el-table-column prop="data.sid" label="合同编码" width="100"></el-table-column>
                  <el-table-column prop="data.conname" label="合同名称"></el-table-column>
                  <el-table-column prop="data.cbm" label="所属客户"></el-table-column>
                  <el-table-column prop="data.sopr" label="负责人" width="80"></el-table-column>
                  <el-table-column prop="data.cnstate" label="状态" width="80"></el-table-column>
                  <el-table-column prop="data.fcy" label="合同金额" width="100"></el-table-column>
                  <el-table-column prop="data.bgdate" label="起始时间" width="100"></el-table-column>
                  <el-table-column prop="data.eddate" label="终止时间" width="100"></el-table-column>
                  <el-table-column prop="data.hpdate" label="签约时间" width="100"></el-table-column>
                </el-table>
              </el-tab-pane>
              <el-tab-pane label="本月预签订信息" name="second">
                <el-table :data="popData" border stripe size="small  " style="width: 100%">
                  <el-table-column prop="data.sid" label="销售机会编码" width="100"></el-table-column>
                  <el-table-column prop="data.saname" label="销售机会名称"></el-table-column>
                  <el-table-column prop="data.cbm" label="所属客户"></el-table-column>
                  <el-table-column prop="data.cbm_sopr" label="客户联系人" width="100"></el-table-column>
                  <el-table-column prop="data.sopr" label="负责人" width="100"></el-table-column>
                  <el-table-column prop="data.yjfcy" label="预计合同金额" width="100"></el-table-column>
                  <el-table-column prop="data.yjhpdate" label="预计签单时间" width="100"></el-table-column>
                  <el-table-column prop="data.sta_id" label="阶段" width="100"></el-table-column>
                  <el-table-column prop="data.ty_id" label="分类" width="100"></el-table-column>
                  <el-table-column prop="data.re_id" label="来源" width="100"></el-table-column>
                </el-table>
              </el-tab-pane>
            </el-tabs>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-scrollbar>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Watch } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from "vuex-class";
import { User } from "@/classes/User";
import CDataSet from "@/classes/pub/CDataSet";
import { Cells } from "@/classes/pub/coob/Cells";
import VueGridLayout from "vue-grid-layout";
Vue.use(VueGridLayout);
var GridLayout = VueGridLayout.GridLayout;
var GridItem = VueGridLayout.GridItem;

import QueryEntity from "@/classes/search/QueryEntity";
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi;
@Component({
  components: {
    GridLayout,
    GridItem
  }
})
export default class workBench extends Vue {
  @Provide() page: any = { pageSize: 2000, currPage: 1, total: 0 };
  @Provide() activeName: String = "first";
  @Provide() activeNames: Array<any> = ["1", "2", "3"];
  @Provide() cdicdetail: any = {};
  @Provide() cdicdetail1: Array<any> = [];
  @Provide() fcydetail: Array<any> = [];
  @Provide() serch: String = "0";
  @Provide() tableData: Array<any> = [];
  @Provide() myDesktop: CDataSet = new CDataSet("");
  @Provide() popData: Array<any> = [];
  @Provide() search:String = "CT19020001"
  mounted() {
    this.getCoList();
    this.getFcyist();
    this.selectCoList("");
    this.selectPoList("");
  }
  // ------------------------数据请求-----------------
  // 1.获取客户统计数据
  async getCoList() {
    let qe: QueryEntity = new QueryEntity("", "");
    qe.page.currPage = this.page.currPage;
    qe.page.pageSize = this.page.pageSize;
    let cc = await tools.getBipInsAidInfo("INDEXCONT1", 210, qe);
    this.cdicdetail = cc.data.data.data.values;
    console.log(this.cdicdetail);
  }
  // 2.获取款项信息
  async getFcyist() {
    let qe: QueryEntity = new QueryEntity("", "");
    qe.page.currPage = this.page.currPage;
    qe.page.pageSize = this.page.pageSize;
    let cc = await tools.getBipInsAidInfo("INDEXCONT", 210, qe);
    this.fcydetail = cc.data.data.data.values;
  }
  //  3.获取本月合同信息
  async selectCoList(dataStr: string) {
    this.myDesktop = await this.getCell("400000");
    let qe: QueryEntity = new QueryEntity("400000", "400000", dataStr);
    qe.oprid = 14;
    qe.page.pageSize = 1000;
    // 对象条件
    // qe.cont = " sid = " + "'" + this.search + "'";
    let vv = await tools.query(qe);
    console.log(vv);
    if (vv.data.id == 0) {
      this.tableData = vv.data.data.data.data;
    }
  }
  // 4.获取本月预签订信息
  async selectPoList(dataStr: string) {
    this.myDesktop = await this.getCell("500000");
    let qe: QueryEntity = new QueryEntity("500000", "500000", dataStr);
    qe.oprid = 14;
    qe.page.pageSize = 1000;
  
    let vv = await tools.query(qe);
    console.log(vv);
    if (vv.data.id == 0) {
      this.popData = vv.data.data.data.data;
    }
  }
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
  handleClick() {}
  handleChange() {}
}
</script>


<style  lang="scss" >
.Workbench {
  height: 100%;
}
.el-scrollbar {
  height: 100%;
}

.el-collapse-item__header {
  padding-left: 30px;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 1px;
  color: #4a77fa;
  background-color: azure;
}
.cdicCont {
  margin-top: 25px;
  text-align: center;
  color: #fff;
  border-radius: 8px;
  letter-spacing: 1px;
}
.cdicTitle {
  padding: 10px 0;
  font-size: 16px;
}
.cdicNum {
  padding: 8px 0;
  font-size: 14px;
}
.bk1 {
  background-color: #38435f;
}
.bk2 {
  background-color: #3598d9;
}
.bk3 {
  background-color: #1bbc9b;
}
.bk4 {
  background-color: #f4ad41;
}
.bk5 {
  background-color: #4a77fa;
}
.tableList {
  padding: 10px;
}
</style>