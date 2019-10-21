<template>
    <div class="bip-home-container">
        <el-scrollbar>
            <el-row style="width:100%">
                <Calendar class="homeCalendar" @choseDay="clickDay" @changeMonth="changeDate"
                    :markDateMore="markDate"></Calendar>
                <el-row>&nbsp;</el-row>
                <el-row style="width:100%;padding: 0px 30px;" v-for="(item,index) in taskDate" :key="index">
                    <el-col :span="8">
                        <div class="newstitletime">{{item.data.ddate}}</div>
                    </el-col>
                    <el-col :span="16">
                        <span @click="taskClick(item)">
                            <div class="newstitle">{{item.data.sevent}}</div>
                        </span>
                    </el-col>
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
import { BIPUtils } from "@/utils/BaseUtil";
let baseTool = BIPUtils.baseUtil;
import moment from 'moment';
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
        let vl = await tools.getServerTime();
        let date =null;
        if(vl.data.id ==0){
            date = new Date(vl.data.data.data.time);
        }else{
            date = new Date();
        }
        date = moment(date).format("YYYY-MM-DD")
        this.getTask(date);
    } 
    /**获取每天的任务数量 */
    async getTaskNum(date:string = ''){
        let qe:QueryEntity = new QueryEntity('','');
        qe.page.currPage = 1;
        qe.page.pageSize = 50;
        // let dd = await this.getTJDate(date);
        // let ddarr = dd.split("~");
        // let sql = "~ddate >='"+ddarr[0]+"'  and ddate<='"+ddarr[1]+"'";
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

    async getTJDate(dd:string){
        let vl = await tools.getServerTime();
        let date =null;
        if(vl.data.id ==0){
            date = new Date(vl.data.data.data.time);
        }else{
            date = new Date();
        } 
        if(dd != ''){
            date = new Date(dd);
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
      this.getTask(data);
    }
    changeDate(data:any) {
        //   console.log(data); //左右点击切换月份
        this.taskDate = [];
        this.getTaskNum(data)
    }

    async taskClick(item:any){
        let slkbuid = item.data.slkbuid,slkid=item.data.slkid;
        if (slkid && slkbuid) { 
            //获取业务定义
            let param = await tools.getBULinks(slkbuid);
            if(param.data.id ==0){
                let opera = param.data.data.opt;
                if (opera&&!opera.pmenuid) {
                    this.$notify.error("业务" + slkbuid + "没有绑定菜单!"); 
                    return false;
                }
                let me = baseTool.findMenu(opera.pmenuid);  
                if (!me) {
                    this.$notify.error( "没有" + opera.pmenuid + "菜单权限!" );
                    return false;
                }else{
                    let command = me.command.split("&");
                    let pbuid = command[0].split("=");
                    let pmenuid = command[1].split("="); 
                    this.$router.push({
                        path:'/layout',
                        name:'layout',
                        params:{method:"pkfld",pkfld:opera.pkfld,value:slkid},
                        query: {pbuid:pbuid[1],pmenuid:pmenuid[1]},
                    })
                }
            } else{
                this.$notify.error("没有业务：" + slkbuid ); 
            }
        }
    }
}
</script>
<style  lang="scss" scoped>
.bip-home-container {
    background-color: #ffffff !important;
    position: fixed; 
    height: calc(100% - 20px)  !important;
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
.newstitle {
  padding: 3px 0;
  font-size: 13px;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: 0.8px;
  color: #333333; 
}
.newstitletime {
  padding: 3px 0;
  font-size: 13px;
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  color: #868D94;
}
</style>
<style lang="scss">
.homeCalendar .wh_content_all {
    border-radius: 6px 6px 0px 0px;
    box-shadow: 1px 2px 10px #dde2e4;
}
.homeCalendar {

    .mark1{
        background-color: red;
        border-radius: 50%;
    }
   
    .wh_content_all {
        background-color: #ffffff !important;
        box-shadow: none !important;
    }
    .wh_jiantou1 {
        width: 8px;
        height: 8px;
        border-top: 2px solid #4A77FA !important;
        border-left: 2px solid #4A77FA !important;
        transform: rotate(-45deg) !important;
    }
    .wh_top_changge .wh_content_li {
        cursor: auto !important;
        flex: 2.5 !important;
        font-size: 14px;
    }
    .wh_jiantou2 {
        width: 8px !important;
        height: 8px !important;
        border-top: 2px solid #4A77FA !important;
        border-right: 2px solid #4A77FA !important;
        transform: rotate(45deg) !important;
    }
    .wh_top_changge li {
       color: #4A77FA !important;
       font-weight: 500 !important;
       letter-spacing: 2px !important;
    }
    .wh_content_item {
        color: #60656A !important;
    }
    .wh_content_item .wh_isToday {
        color: #ffffff !important;
        background: #4A77FA !important;
        border-radius: 100px !important;
    }
    .wh_item_date:hover {
         color: #ffffff !important;
        background: #71c7a5 !important;
        border-radius: 100px !important;
        cursor: pointer;
    }
    .wh_item_date:active {
         color: #ffffff !important;
        
    }
    .wh_content_item .wh_chose_day{
        color: #ffffff !important;
        background: green !important;
        border-radius: 100px !important;
    }
}
</style>
<!--
GitHub 地址：https://github.com/zwhGithub/vue-calendar
 -->