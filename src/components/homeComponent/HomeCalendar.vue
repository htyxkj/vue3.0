<template>
    <div class="bip-home-container">
        <el-scrollbar>
            <el-row style="width:100%">
                <Calendar @next="changeMonth" @prev="changeMonth"
                    lunar @select="clickDay" ref="calendar" completion monFirst
                    @selectMonth="selectMonth" :almanacs="almanacs"
                    :tileContent="tileContent" responsive 
                /> 
            <el-row v-if="canAddHoliday" type="flex" justify="end" style="width:100%;text-align:end;padding-right:25px;">
                <el-col>
                    <span @click="showAddHDialog()" style="cursor:pointer;">
                        添加
                    </span>
                </el-col>
            </el-row>
            <!-- 节日 -->
            <el-row style="width:100%;padding: 6px 30px;" v-for="(item,index) in holidayDate" :key="index">
                <el-popover :key="index" placement="top-start" width="200" trigger="hover">
                    <p style="text-align: center;">{{item.data.holiday}}</p>
                    <div style="text-align: right; margin: 0;margin-right:5px;"  v-if="canAddHoliday">
                        <el-button size="mini" type="text" @click="upHoliday(item)">编辑</el-button>
                        <el-button type="text" size="mini" @click="delHoliday(item)">删除</el-button>
                    </div> 
                    <el-row slot="reference" style="cursor:pointer;">
                        <el-col :span="8">
                            <div class="newstitletime">{{item.data.hpdate}}</div>
                        </el-col>
                        <el-col :span="16">
                            <div class="newstitle">{{item.data.holiday}}</div>
                        </el-col>
                    </el-row>
                </el-popover>
            </el-row>
            <el-row>&nbsp;</el-row>
                <el-row style="width:100%;padding: 0px 30px;" v-for="(item,index) in taskData" :key="index">
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
            <!-- 节日 -->
            <el-row>
                <el-dialog title="节日操作" :close-on-click-modal="false" :visible.sync="holidayDialog" width="30%" :append-to-body="true">
                    <el-form @submit.native.prevent label-position="right" label-width="100px">
                        <div  v-for="(cel,index) in holidayCell.ccells.cels" :key="'A'+index" >
                            <bip-comm-editor v-if="(cel.attr&0x400) <= 0 && cel.id !='background'" :cell="cel" :bgrid="false" :cds="holidayCell" :row="holidayCell.index" />
                            <div v-if ="(cel.attr&0x400) <= 0 && cel.id =='background'">
                                <el-col :xs="24" :sm="24"  >
                                    <template >
                                        <el-form-item :label="cel.labelString" class="bip-input-item" :required="cel.isReq">
                                            <el-input v-model="holidayCell.currRecord.data[cel.id]" size="small">
                                                <template slot="append">
                                                    <el-color-picker v-model="holidayCell.currRecord.data[cel.id]" size="mini"></el-color-picker>
                                                </template>
                                            </el-input>
                                        </el-form-item>
                                    </template>
                                </el-col>
                            </div>
                        </div> 
                    </el-form>
                    <span slot="footer" class="dialog-footer">
                        <el-button @click="holidayDialog = false">取 消</el-button>
                        <el-button type="primary" @click="addHoliday()">保 存</el-button>
                    </span>
                </el-dialog>
            </el-row>
        </el-scrollbar>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from "vuex-class";
import Calendar from 'mpvue-calendar'
import 'mpvue-calendar/src/browser-style.css' 
import { Menu } from "@/classes/Menu";
import { User } from '@/classes/User';
import CDataSet from "@/classes/pub/CDataSet"; 
import { Cells } from "@/classes/pub/coob/Cells";
import QueryEntity from '@/classes/search/QueryEntity';
import QueryCont from '@/classes/search/QueryCont';
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
export default class HomeCalendar extends Vue { 
    @Prop() cont!:string;
    @Prop() rech!:string;
    @Getter('user', { namespace: 'login' }) user?: User;
    @Provide() cds:CDataSet = new CDataSet('');
    @Provide() markDate:Array<any> = new Array<any>();//全部样式
    @Provide() taskData:Array<any> = new Array<any>();
    

    @Provide() dayClass:any = {};
    @Provide() holidayDialog:boolean = false;//是否显示节日弹框
    @Provide() showItemHoliday:boolean  = false;//是否显示修改卡片
    @Provide() addOrUpHoliday:boolean = true;//是 新增节日，还是修改节日


    @Provide() calendarYear:any=0;//日历年
    @Provide() calendarMonth:any=0;//日历月
    @Provide() holidayDate:Array<any> = new Array<any>();//自定义节日列表
    @Provide() taskClass:Array<any> = new Array<any>();//任务样式class集合 
    @Provide() hdayClass:Array<any> = new Array<any>();//节假日class集合 
    @Provide() chekcDate:any = null;//选中日期
    @Provide() canAddHoliday:boolean = false;//是否有新建节日权限
    @Provide() holidayCell:CDataSet = new CDataSet('');//节日对象
    @Provide() tileContent:any = [];//自定义日期样式
    @Provide() almanacs:any={};

    async created(){
        let menu = baseTool.findMenu("KQ0303");
        if(menu !=  null){
            this.canAddHoliday = true;
        }
        //获取假日对象
        let res = await tools.getCCellsParams('HOLIDAYCALENDAR'); 
        let rtn = res.data;
        if (rtn.id == 0) {
            let kn: Array<Cells> = rtn.data.layCels;
            this.holidayCell = new CDataSet(kn[0]);
        }
        this.markDate =[];
        this.taskClass = [];
        this.hdayClass = [];
        await this.init();
    }
    
    async mounted() {   
        
    }
    async init(){
        let res = await tools.getServerTime();
        let date1 =null;
        if(res.data.id ==0){
            date1 = new Date(res.data.data.data.time);
        }else{
            date1 = new Date();
        }
        this.chekcDate = date1;
        this.calendarYear = this.chekcDate.getFullYear();
        this.calendarMonth = this.chekcDate.getMonth()+1;
        this.getTaskNum();//获取当月的任务数
        this.getAllHoliday();//获取当月的节假日
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
        let dd = await this.getTJDate(date);
        let ddarr = dd.split("~");
        let oneCont = [];  
        let qCont = new QueryCont('ddate',ddarr[1],93);
        qCont.setContrast(2);
        oneCont.push(qCont);
        qCont = new QueryCont('ddate',ddarr[0],93);
        qCont.setContrast(1);
        oneCont.push(qCont);
        qe.cont = "~["+JSON.stringify(oneCont)+"]";
        let cc = await tools.getBipInsAidInfo("MYNOTEBK",210,qe)
        if(cc.data.id == 0) {
            let vl:Array<any> = cc.data.data.data.values;
            this.taskData = [];
            vl.forEach((item:any) => {
                let className = "mark1";
                if(className == ""){
                    // 创建我们的样式表
                    var style = document.createElement('style');
                    style.innerHTML =
                        '.sctrl'+item.ddate+' {' +
                            'background-color: '+item.background+' !important;' +
                            'border-radius: 50%;' +
                            'color:#FFF;' +
                        '}';
                    className = 'sctrl'+item.ddate;
                    // 获取第一个脚本标记
                    var ref:any = document.querySelector('script');
                    // 在第一个脚本标签之前插入新样式
                    if(ref != null)
                        ref.parentNode.insertBefore(style, ref);
                }
                let mk ={date:item.ddate,className:className}
                this.taskClass.push(mk);
            });
            // this.markDate = this.weekendClass;
            // this.markDate = this.markDate.concat(this.taskData.concat(this.hdayClass))
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
            this.taskData = vv.data.data.data.data;
        }else{
            console.log(data+"数据查询错误！")
        }
    }
    /**
     * 获取近期 的节假日数据
     */
    async getAllHoliday(date:string = ''){

        let qe:QueryEntity = new QueryEntity('HOLIDAYCALENDAR','HOLIDAYCALENDAR');
        qe.page.currPage = 1;
        qe.page.pageSize = 50;
        let dd = await this.getTJDate(date);
        let ddarr = dd.split("~");
        let cc = ddarr[0] + "~" +ddarr[1];
        qe.cont = '{"hpdate" : "'+cc+'"}'
        let vv = await tools.query(qe);
        if(vv.data.id == 0){
            let data = vv.data.data.data.data;
            this.hdayClass = [];
            this.almanacs ={};
            for(var i=0;i<data.length;i++){
                let d1 = data[i].data;
                let dat = d1.hpdate.split("-");
                let month = dat[1].split("");
                if(month[0] =="0"){
                    month = month[1]
                }else{
                    month = dat[1]
                }
                let day = dat[2].split("");
                if(day[0] =="0"){
                    day = day[1]
                }else{
                    day = dat[2]
                }
                let dd = dat[0]+"-"+ month+"-"+day;

                if(d1.holiday){
                    this.almanacs[month+"-"+day] = d1.holiday;
                }
                let mk = {date: dd, className: 'holiday', content: '休'}
                if(d1.eventtype == 2){
                    mk.content="休";
                    mk.className= 'holiday';
                }else if(d1.eventtype == 1){
                    mk.content="休";
                    mk.className= 'holiday';
                }else if(d1.eventtype == 0){
                    mk.content="班";
                    mk.className= 'working';
                }
                let background = d1.background;
                if(background){
                    // 创建我们的样式表
                    var style = document.createElement('style');
                    style.innerHTML =
                        '.holiday'+d1.hpdate+' {' +
                            'background-color: '+d1.background+';}';
                    let className = 'holiday'+d1.hpdate;
                    // 获取第一个脚本标记
                    var ref:any = document.querySelector('script');
                    // 在第一个脚本标签之前插入新样式
                    if(ref != null)
                        ref.parentNode.insertBefore(style, ref);
                    mk.className= className;
                }
                this.hdayClass.push(mk);
            }
            this.tileContent = this.hdayClass;
        }
        setTimeout(() => {
            let calendar:any = this.$refs.calendar;
            if(calendar){
                calendar.renderer(this.calendarYear, this.calendarMonth);
            }
        }, 200);
    }
    /**
     * 获取一个日期的 详细节日信息
     */
    async getHoliday(date:string){
        this.holidayDate=[];
        let qe:QueryEntity = new QueryEntity('HOLIDAYCALENDAR','HOLIDAYCALENDAR');
        qe.page.currPage = 1;
        qe.page.pageSize = 50;
        qe.cont = '{"hpdate" : "'+date+'"}'
        let vv = await tools.query(qe);
        if(vv.data.id == 0){
            let dat = vv.data.data.data.data;
            for(var i =0;i<dat.length;i++){
                let d = dat[i];
                if(d.data.holiday){
                    this.holidayDate.push(d);
                }
            }
        }
    }
    //获取对象
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
    //获取取数时间范围  上个月22 到下个月 10号
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
        let ddate = styear+"-"+stmonth+"-22~"+edyear+"-"+edmonth+"-10";
        console.log(ddate)
        return ddate
    }
    //日期点击事件
    clickDay(date:any,dateDetial:any) {
        let date0 = date[0]+"-"+date[1]+"-"+date[2]
        this.calendarYear = date[0];
        this.calendarMonth = date[1];
        this.chekcDate = date0;
        this.getTask(date0);
        this.getHoliday(date0);
    }
    //月份变化
    changeMonth(year:any, month:any, weekIndex:any) {
        this.taskData = [];
        this.calendarYear = year;
        this.calendarMonth = month;
        this.getTaskNum(year+"-"+month+"-01")
        this.getAllHoliday(year+"-"+month+"-01")
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
  
    //添加按钮点击
    showAddHDialog(){
        this.holidayDialog = true;
        this.holidayCell.clear();
        this.holidayCell.createRecord();
        this.addOrUpHoliday = true;
        this.holidayCell.currRecord.data.hpdate =this.chekcDate;
    }

    /**
     * 添加节假日
     */
    addHoliday(){
        let bok = this.checkNotNull(this.holidayCell); 
        if(!bok)
            return ;
        this.holidayCell.saveData().then(res=>{//进行保存
            if(res.data.id ==0){
                this.getHoliday(this.holidayCell.currRecord.data.hpdate);
                this.$notify.success("保存成功！")
                this.getAllHoliday(this.holidayCell.currRecord.data.hpdate)
            }else{
                this.$notify.error(res.data.message);
            }
        }).finally(()=>{
            this.holidayDialog = false;
        })
    }
    /**
     * 修改节假日
     */
    upHoliday(item:any){
        this.holidayCell.clear();
        this.holidayDialog = true;
        this.chekcDate = item.data.ddate;
        this.holidayCell.currRecord.data = item.data;
        this.holidayCell.cdata.data.push(this.holidayCell.currRecord)
        this.holidayCell.index=0;
        this.holidayCell.currRecord.c_state =2;
    }
    /**
     * 删除节假日
     */
    delHoliday(item:any){
        this.$confirm('此操作将删除该节日, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(() => {
            item.c_state = 4;
            this.holidayCell.currRecord = item;
            this.holidayCell.saveData().then(res=>{//进行保存
                if(res.data.id ==0){  
                    this.getHoliday(item.data.hpdate);
                    this.getAllHoliday(item.data.hpdate)
                    this.$message({
                        type: 'success',
                        message: '删除成功!'
                    });
                }
            });
        }).catch(() => {
            
        });
    }
    //对象非空检查
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
    selectMonth(month:any, year:any) {
      this.changeMonth(year,month,null);
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
.holiday{
    background-color: #fff0f0;
    .slot-element {
        position: absolute;
        top: 0;
        left: 0;
        font-size: 12px;
        background-color: #f43;
        color: #fff;
        padding: 0 2px;
        border-radius: 3px;
        display: inline-block;
    }
}
.working{
    background-color: #f5f5f5;
    .slot-element {
        position: absolute;
        top: 0;
        left: 0;
        font-size: 12px;
        background-color: #969799;
        color: #fff;
        padding: 0 2px;
        border-radius: 3px;
        display: inline-block;
    }
}
.slot-element {
    position: absolute;
    top: 0;
    left: 0;
    font-size: 12px;
    background-color: #969799;
    color: #fff;
    padding: 0 2px;
    border-radius: 3px;
    display: inline-block;
}
</style>
<!--
GitHub 地址：https://github.com/Hzy0913/mpvue-calendar
 -->