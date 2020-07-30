<template>
  <div class="followTimesLine">
    <div class="search-cont">
      <el-row>
        <el-col :span="12">
          <el-form label-width="80px" size="mini">
            <el-form-item label="客户名称">
              <el-input v-model="cdic">
                <el-button slot="append" icon="el-icon-search" @click="getCdicData()"></el-button>
              </el-input>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="12">
          <div class="right-button">
            <el-button type="primary" @click="getData()" size="mini">查询</el-button>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="content bip-main-container">
      <el-scrollbar wrap-class="scrollbar-wrapper">
        <!-- <div v-if="record"  class="nodata">
          暂无数据
        </div>-->
        <el-timeline>
          <el-timeline-item
            v-for="(activity, index) in record"
            :key="index"
            :timestamp="activity.thismkdate"
            placement="top"
          >
            <el-card>
              <div class="record-title">
                <span>联系人：</span>
                <span>{{activity.cbm_sopr}}</span>
              </div>
              <div v-html="activity.remark" class="record-cont"></div>
              <div class="record-footer">
                <span>下次联系时间：</span>
                <span>{{activity.nextmkdate}}</span>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </el-scrollbar>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Provide, Watch } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from "vuex-class";
import { User } from "@/classes/User";
import CDataSet from "@/classes/pub/CDataSet";
import { Cells } from "@/classes/pub/coob/Cells";
import QueryEntity from "@/classes/search/QueryEntity";
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi;
@Component({
  components: {
  }
})
export default class followTimesLine extends Vue {
  @Provide() page: any = { pageSize: 2000, currPage: 1, total: 0 };
  @Provide() record: Array<any> = [];
  @Provide() tableData: Array<any> = [];
  @Provide() myDesktop: CDataSet = new CDataSet("");
  @Provide() popData: Array<any> = [];
  @Provide() cdic: String = "KH19090006";
  mounted() {}
  // ------------------------数据请求-----------------
  // 1. 获取客户辅助
  getCdicData() {}
  // 2.获取客户相对应的跟进记录
  async getData() {
    if (this.cdic) {
      let qe: QueryEntity = new QueryEntity("", "");
      qe.page.currPage = this.page.currPage;
      qe.page.pageSize = this.page.pageSize;
      let cont = "~" + "cbm  = " + "'" + this.cdic + "'";
      qe.cont = cont;
      let cc = await tools.getBipInsAidInfo("RECORD", 210, qe);
      console.log(cc);
      if (cc.data.id == 0) {
        this.record = cc.data.data.data.values;  
      }
      console.log(this.record);
    } else {
      this.$notify.error("请输入客户名称！");
    }
  }

  //  3.获取本月合同信息
  async selectCoList(dataStr: string) {
    this.myDesktop = await this.getCell("400000");
    let qe: QueryEntity = new QueryEntity("400000", "400000", dataStr);
    qe.oprid = 14;
    qe.page.pageSize = 1000;
    let vv = await tools.query(qe);
    console.log(vv);
    if (vv.data.id == 0) {
      this.tableData = vv.data.data.data.data;
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

<style>
.search-cont {
  padding: 10px 10px 10px 10px;
  border-bottom: 10px solid #f9f9f9;
}
.right-button {
  text-align: right;
  padding: 0px 30px 0px 0px;
}
.content {
  padding: 10px 10px 10px 0px;
}
.record-cont {
  border-top: 2px solid #f9f9f9;
  border-bottom: 2px solid #f9f9f9;
}
.record-title {
  margin-bottom: 10px;
}
.record-footer {
  margin-top: 10px;
}
.nodata {
  text-align: center;
  height: 400px;
  line-height: 400px;
  font-size: 14px;
}
</style>