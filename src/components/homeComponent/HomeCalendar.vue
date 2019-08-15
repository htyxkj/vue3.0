<template>
    <div class="bip-home-container">
        <el-scrollbar>
            <el-row style="width:100%">
                <Calendar class="homeCalendar" @choseDay="clickDay" @changeMonth="changeDate"
                    :markDateMore="markDate"></Calendar>
                <el-row>&nbsp;</el-row>
                <el-row style="width:100%" v-for="(item,index) in taskDate" :key="index">
                    <el-col :span="8">{{item.data.ddate}}</el-col>
                    <el-col :span="16">{{item.data.sevent}}</el-col>
                </el-row>
            </el-row>
        </el-scrollbar>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from "vuex-class";
import { Menu } from "@/classes/Menu";
import { User } from '@/classes/User';
import Calendar from 'vue-calendar-component';
import CDataSet from "@/classes/pub/CDataSet"; 
import { Cells } from "@/classes/pub/coob/Cells";
import QueryEntity from '@/classes/search/QueryEntity';
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi

@Component({
    components:{
        Calendar
    }
})
export default class HomeMenu extends Vue { 
    @Prop() cont!:string;
    @Prop() rech!:string;
    @Getter('user', { namespace: 'login' }) user?: User;
    @Provide() cds:CDataSet = new CDataSet('');
    @Provide() markDate:Array<any> = new Array<any>();
    @Provide() taskDate:Array<any> = new Array<any>();
    mounted() {   
        this.markDate =[];
        this.init();
    }
    async init(){
        this.getTaskNum();
    } 
    /**获取每天的任务数量 */
    async getTaskNum(){
        let qe:QueryEntity = new QueryEntity('','');
        qe.page.currPage = 1;
        qe.page.pageSize = 50;
        let dd = await this.getTJDate();
        let ddarr = dd.split("~");
        let sql = "~ddate >='"+ddarr[0]+"'  and ddate<='"+ddarr[1]+"'";
        let cc = await tools.getBipInsAidInfo("MYNOTEBK",210,qe)
        if(cc.data.id == 0) {
            let vl:Array<any> = cc.data.data.data.values;
            vl.forEach((item:any) => {
                let mk ={date:item.ddate,className:"mark1"}
                this.markDate.push(mk);
            });
        }
    }
    /** 获取一个日期的任务信息 */
    async getTask(data:any){
        this.cds = await this.getCell("INSNOTEBK") 
        let usrcode = "*"
        if(this.user)
            usrcode = this.user.userCode;
        let tj = {usrcode:usrcode,ddate:data}
        let qe:QueryEntity = new QueryEntity("INSNOTEBK","INSNOTEBK",JSON.stringify(tj));
        qe.page.pageSize=1000
        let vv = await tools.query(qe);
        if(vv.data.id == 0){
            this.taskDate = vv.data.data.data.data;
        }else{
            console.log(data+"数据查询错误！")
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

    async getTJDate(){
        let vl = await tools.getServerTime();
        let date =null;
        if(vl.data.id ==0){
            date = new Date(vl.data.data.data.time);
        }else{
            date = new Date();
        } 
        let d1m = date.getMonth()+1;//当前月份
        let styear = date.getFullYear();
        let stmonth = date.getMonth()+1;
        if(d1m == 1){
            styear--;
            stmonth=12;
        }else{
            stmonth--;
        }
        let edyear = date.getFullYear();
        let edmonth = date.getMonth()+1;
        edmonth ++;
        if(d1m == 12){
            edmonth=1
            edyear++;
        }
        let ddate = styear+"-"+stmonth+"-22~"+edyear+"-"+edmonth+"-14";
        console.log(ddate)
        return ddate
    }

    clickDay(data:any) {
      console.log(data); //选中某天
      this.getTask(data);
    }
    changeDate(data:any) {
    //   console.log(data); //左右点击切换月份
    }
}
</script>
<style  lang="scss" scoped>
.bip-home-container {
    position: fixed; 
    height: 95% !important;
    z-index: 1;
    overflow: hidden;  
    width: calc(100% - 3px) !important;
    .el-scrollbar {
        height: 100%;
        margin-bottom: 10px !important;
        margin-right: 0px !important; 
        .el-scrollbar__wrap {
            overflow-x: hidden !important;
            padding-right: 5px;
            height: 100%;
        }
        .scrollbar-wrapper{
          overflow-x: hidden !important;
        }
    }
}
</style>
<style lang="scss">
.homeCalendar {
    .mark1{
        background-color: red;
        border-radius: 50%;
    }
}
</style>