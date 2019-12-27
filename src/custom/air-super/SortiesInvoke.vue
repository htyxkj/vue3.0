<template>
  <div class="sortquery"  v-loading="loading">
      <div class="nav">
          <el-button  icon="el-icon-search" size="mini" @click="getCoList">查询</el-button>
          <el-button icon="iconfont icon-bip-save" size="mini" >保存</el-button>
          <el-button icon="el-icon-full-screen" size="mini">合并</el-button>
      </div>
      <div class="query">
          <el-row class="bip-lay">
                <el-form @submit.native.prevent label-position="right" label-width="100px">
                    <div v-for="(cel,index) in sortiesCell.ccells.cels" :key="'A'+index">
                        <bip-comm-editor v-if="(cel.attr&0x400) <= 0 " :cell="cel"
                            :bgrid="false" :cds="sortiesCell" :row="0"/>
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
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi;
import { Cells } from "@/classes/pub/coob/Cells";
import CDataSet from "@/classes/pub/CDataSet";

import { GlobalVariable } from "@/utils/ICL";
import { BaseVariable } from "@/utils/BaseICL";
import qs from "qs";
@Component({
  components: {
    
  }
})
export default class SortiesInvoke extends Vue {
    @State("bipComHeight", { namespace: "login" }) height!: number;
    @Provide() style1: string = ""+ (this.height ? this.height - 85 : "400");
    @Provide() tableData: Array<any> = [];
    @Provide() sortiesCell: CDataSet = new CDataSet(""); //飞防任务对象(查询条件)
    @Provide() loading:boolean = false;
    async created() {
        if (this.height) {
            this.style1 = ""+ (this.height - 250);
        }
        // 初始化条件查询区域
        this.sortiesCell = await this.getCell("WF0317TJ");
        this.sortiesCell.createRecord();
    }
    mounted() {

    }
    
    // ------------------------数据请求-----------------

    //  1.获取任务对应架次信息
    async getCoList() {
        try{
            let bok = this.checkNotNull(this.sortiesCell); 
            if(!bok)
                return ;    
            this.loading = true;
            let data = {
                apiId: GlobalVariable.APIID_MPARAMS,
                dbid: BaseVariable.COMM_FLD_VALUE_DBID,
                usercode: JSON.parse(window.sessionStorage.getItem("user") + "").userCode,
                sortiesData:JSON.stringify(this.sortiesCell.currRecord.data)
            }
            let data1 = qs.stringify(data);
            let res = await Vue.$axios.post("/SortiesServlet", data1);
            console.log(res);
            this.loading = false;
        }catch(err){
            this.loading = false;
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
    checkNotNull(cds:CDataSet):boolean{
        let bok = true;
        cds.ccells.cels.forEach(item => {
            if (item.unNull&&bok) {
                let vl = null; 
                if(cds.currRecord.data[item.id]!=null)
                    vl = cds.currRecord.data[item.id]+''; 
                if (!vl) {
                    this.$notify.warning( "【" + item.labelString + "】不能为空!");
                    bok =  false;
                    return false;
                }
            }
        });
        return bok;
    }
    @Watch("height")
        heightChange() {
            this.style1 = "" + (this.height - 250) ;
        }
}
</script>

<style scoped>
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