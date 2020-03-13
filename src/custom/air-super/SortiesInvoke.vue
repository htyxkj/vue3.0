<template>
  <div class="sortquery"  v-loading="loading">
      <div class="nav">
          <el-button  icon="el-icon-search" size="mini" @click="getCoList">查询</el-button>
          <el-button icon="iconfont icon-bip-save" size="mini" @click="saveSorties">保存</el-button>
          <el-button icon="el-icon-full-screen" size="mini" @click="mergeSorties">合并</el-button>
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
                @select-all="selectChange"
                @select-change="selectChange"
                ref="SortiesTable"
                :data="tableData">
                <vxe-table-column type="checkbox" width="60"></vxe-table-column>
                <vxe-table-column type="index" title="序号" width="60" ></vxe-table-column> >
                <vxe-table-column field="statTime" title="开始时间"></vxe-table-column>
                <vxe-table-column field="endTime" title="结束时间" ></vxe-table-column>
                <vxe-table-column field="avgHigh" title="平均海拔(m)"></vxe-table-column>
                <vxe-table-column field="sumTimeStr" title="喷洒时长" ></vxe-table-column>
                <vxe-table-column field="avgSpeed" title="平均航速(km、h)"></vxe-table-column>
                <vxe-table-column field="sumDis" title="喷洒里程(km)"></vxe-table-column>
                <vxe-table-column field="sumArea" title="喷洒面积(亩)"  ></vxe-table-column>
                <vxe-table-column field="avgFlow" title="平均流量(m3/h)(m)" ></vxe-table-column>
                <vxe-table-column field="sumFlow" title="总流量(m3)(m3/h)(m)" ></vxe-table-column>
            </vxe-table>
        </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Provide, Watch } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from "vuex-class"; 
import { BIPUtil } from "@/utils/Request";
import QueryEntity from "@/classes/search/QueryEntity";
let tools = BIPUtil.ServApi;
import { Cells } from "@/classes/pub/coob/Cells";
import CDataSet from "@/classes/pub/CDataSet";
import { User } from '@/classes/User';
import { GlobalVariable } from "@/utils/ICL";
import { BaseVariable } from "@/utils/BaseICL";
import qs from "qs";
import { on } from 'cluster';
@Component({
  components: {
    
  }
})
export default class SortiesInvoke extends Vue {
    @State("bipComHeight", { namespace: "login" }) height!: number;
    @Getter('user', { namespace: 'login' }) user?: User;
    @Provide() style1: string = ""+ (this.height ? this.height - 85 : "400");
    @Provide() tableData: Array<any> = [];
    @Provide() sortiesCell: CDataSet = new CDataSet(""); //飞防任务对象(查询条件)
    @Provide() loading:boolean = false;
    @Provide() checkData:any=[];
    @Provide() saveCell:CDataSet = new CDataSet("");
    @Provide() delCell:CDataSet = new CDataSet("");
    @Provide() 
    async created() {
        if (this.height) {
            this.style1 = ""+ (this.height - 250);
        }
        // 初始化条件查询区域
        this.sortiesCell = await this.getCell("WF0317TJ");
        this.sortiesCell.createRecord();
        this.saveCell = await this.getCell("FW0320");
        this.delCell = await this.getCell("FW0320DEL");
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
            this.tableData = [];
            if(res.data.id == 0){
                this.tableData =  res.data.data.data;
            }
            this.loading = false;
        }catch(err){
            this.loading = false;
        }
    }
    //架次合并
    mergeSorties(){ 
        if(!this.checkData || this.checkData.length ==0){
            this.$notify.warning( "请勾选要合并的架次！");
            return;
        }
        var flow:any=0,avgFlow:any=0,high:any=0,avgHigh:any=0,speed:any=0,avgSpeed:any='',endTime:any='',syl:any=0,getSYL:any='',jcCid:any='',statTime:any='',sumArea:any=0,sumDis:any=0,sumFlow:any=0,sumPoints:any=0,sumTime:any=0,sumPoints:any=0;
        let jcList = this.tableData//全部架次
        var jc:any = this.checkData[0];//勾选架次

        for(var i = 0; i<this.checkData.length;i++){
            var _jcListOne =  this.checkData[i];
            if(i>=1 && _jcListOne.jcCid-this.checkData[i-1].jcCid!=1){
                this.$notify.warning( "请勾选连续架次！");
                return;
            } 
            jcList[_jcListOne.jcCid-1]=null;
            if(i==this.checkData.length-1){
                jc.endTime = _jcListOne.endTime; 
            }
            //平均海拔(m)
            high += (parseFloat(_jcListOne.avgHigh)*parseFloat(_jcListOne.sumTime));
            //喷洒时长
            sumTime += parseFloat(_jcListOne.sumTime);
            //(总航速) 用来计算平均航速
            speed +=(parseFloat(_jcListOne.avgSpeed)*parseFloat(_jcListOne.sumTime));
            //喷洒里程(km)
            sumDis += parseFloat(_jcListOne.sumDis);
            //喷洒面积(亩)
            sumArea += parseFloat(_jcListOne.sumArea);
            //每亩药量
            syl += (parseFloat(_jcListOne.getSYL)*parseFloat(_jcListOne.sumArea));
            //平均流量
            flow +=(parseFloat(_jcListOne.avgFlow)*parseFloat(_jcListOne.sumTime));
            //总流量
            sumFlow += parseFloat(_jcListOne.sumFlow); 
            //有效喷洒点
            sumPoints += parseInt(_jcListOne.sumPoints);
        }
        avgHigh = high/sumTime;
        avgSpeed = speed/sumTime
        getSYL = syl/sumArea;
        avgFlow = flow/sumTime
        
        jc.avgHigh=avgHigh.toFixed(4);
        jc.sumTime = sumTime;
        jc.avgSpeed = avgSpeed.toFixed(4);
        jc.sumDis = sumDis.toFixed(4);
        jc.sumArea = sumArea;
        jc.getSYL = getSYL.toFixed(4);
        jc.avgFlow = avgFlow.toFixed(4);
        jc.sumFlow = sumFlow.toFixed(4);
        jc.sumPoints = sumPoints;
        var second:any =  parseInt(sumTime);
        var hours =parseInt((second/3600)+"");
        second =parseInt((second % 3600)+"");
        var minutes =parseInt((second /60)+"");
        second = parseInt((second % 60)+"");
        
        jc.sumTimeStr = hours+"时"+minutes+"分"+second+"秒";
        this.tableData=[];
        var _jcCid = 1;
        for(var j =0;j<=jcList.length;j++){
            let _jc =null;
            if(jc.jcCid==j+1){
                _jc=jc;
            }else{
                _jc = jcList[j];
            }
            if(_jc!=null){
                _jc.jcCid=_jcCid
                    this.tableData.push(_jc);
                _jcCid++;
            }        
        }
        this.$notify.success("合并成功！")
        // let cc:any = this.$refs["SortiesTable"];
        // if(cc){
        //     cc.refreshData();
        // }
        // console.log(this.tableData)
    }
    selectChange(data:any){
        this.checkData = data.selection;
    }
    //保存架次
    async saveSorties(){
        let bok = this.checkNotNull(this.sortiesCell); 
            if(!bok)
                return;
        let tjData = this.sortiesCell.currRecord.data;
        let taskid = tjData.sid;//任务编码
        this.delCell.createRecord();
        this.delCell.currRecord.data.tkid = taskid;
        this.delCell.currRecord.c_state = 4
        this.delCell.saveData();
        let taskbt = tjData.bgtime;//任务开始时间
        let tasket = tjData.edtime;//任务结束时间
        let widcloth = tjData.width;//幅宽
        let asid = tjData.asid//飞机编号
        let asidscm = await this.getTHSCM(asid);//通航公司
        let scm = "";//公司
        let sorg = "";//部门
        let usrcode = tjData.tlid;//账户标识
        if(this.user){
            sorg = this.user.deptInfo.deptCode
            scm = this.user.deptInfo.cmcCode
        }
        this.saveCell.cdata.data = [];
        for(var i=0;i<this.tableData.length;i++){
            let oneJD = this.tableData[i];
            let curr = this.saveCell.createRecord();
            curr.data.tkid = taskid;
            curr.data.ssid = (i+1);
            curr.data.bgtime = taskbt;
            curr.data.edtime = tasket;
            curr.data.widcloth = widcloth;
            curr.data.asid = asid;
            curr.data.asidscm = asidscm;
            curr.data.scm = scm;
            curr.data.sorg = sorg;
            curr.data.bgtime1 = oneJD.statTime;//架次开始时间
            curr.data.edtime1 = oneJD.endTime;//架次结束时间
            curr.data.cooordpoint = oneJD.sumPoints;//有效喷洒点数
            curr.data.avgaltitude = oneJD.avgHigh;//平均海拔
            curr.data.avgspeed= oneJD.avgSpeed;//平均航速(km、h)
            curr.data.avgflow = oneJD.avgFlow;//平均流量(m3/h)
            curr.data.sumtime = oneJD.sumTimeStr;//总时长
            curr.data.sumflow = oneJD.sumFlow;//累积流量(m3)
            curr.data.summileage =  oneJD.sumDis;//总里程;
            curr.data.sumarea =  oneJD.sumArea;//总面积(亩)
            curr.data.avgyl = oneJD.getSYL;//每亩施药量
            curr.data.usrcode = usrcode;
            let res = await this.saveCell.saveData();
            if(res.data.id == -1){
                this.$notify.error("保存失败！")
                this.delCell.saveData();
                return;
            }
        } 
        this.$notify.success("保存成功！")
    }
    /**
     * 获取通航公司名称
     */
    async getTHSCM(id:any){
        let scmName = "";
        let qe: QueryEntity = new QueryEntity("", "");
        qe.page.currPage = 1;
        qe.page.pageSize = 50000;
        let cont ="a.id = '"+id+"'";
        qe.cont = cont;
        let cc = await tools.getBipInsAidInfo("THSCM", 210, qe);
        if(cc.data.id ==0){
            scmName = cc.data.data.data.values[0].orgname
        }
        return scmName;
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