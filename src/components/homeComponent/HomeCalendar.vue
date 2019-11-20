<template>
    <div class="bip-home-container">
        <el-scrollbar>
            <el-row style="width:100%">
                <Calendar class="homeCalendar" @choseDay="clickDay" @changeMonth="changeDate"
                    :markDateMore="markDate"></Calendar>
                <el-row>&nbsp;</el-row>
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
                        <p style="text-align: center;">{{item.data.sevent}}</p>
                        <div style="text-align: right; margin: 0;margin-right:5px;">
                            <el-button size="mini" type="text" @click="upHoliday(item)">编辑</el-button>
                            <el-button type="text" size="mini" @click="delHoliday(item)">删除</el-button>
                        </div> 
                        <el-row slot="reference" style="cursor:pointer;">
                            <el-col :span="8">
                                <div class="newstitletime">{{item.data.ddate}}</div>
                            </el-col>
                            <el-col :span="16">
                                <div class="newstitle">{{item.data.sevent}}</div>
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
                    <div>
                        <el-date-picker v-model="hDate" type="date" placeholder="节日日期" style="width:100%"> </el-date-picker>
                    </div>
                    <br/>
                    <div>
                        <el-input v-model="holidayname" placeholder="节日名称"></el-input> 
                    </div>
                    <br/>
                    <el-input placeholder="显示颜色" v-model="holidaycolor">
                        <template slot="append">
                            <el-color-picker v-model="holidaycolor" size="small"></el-color-picker>
                        </template>
                    </el-input>
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
import { Menu } from "@/classes/Menu";
import { User } from '@/classes/User';
import Calendar from 'vue-calendar-component';
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
    @Provide() taskClass:Array<any> = new Array<any>();//任务样式
    @Provide() holidayDate:Array<any> = new Array<any>();
    @Provide() dayClass:any = {};
    @Provide() holidayCell:CDataSet = new CDataSet('');//节日对象
    @Provide() holidayDialog:boolean = false;//是否显示节日弹框
    @Provide() hDate:any = null;//节日日期
    @Provide() holidayname:string = ""//节日名称
    @Provide() holidaycolor:string = ""//节日颜色
    @Provide() canAddHoliday:boolean = false;//是否可以新建节日
    @Provide() showItemHoliday:boolean  = false;//是否显示修改卡片
    @Provide() addOrUpHoliday:boolean = true;//是 新增节日，还是修改节日
    @Provide() hdayClass:Array<any> = new Array<any>();//节假日class集合
    @Provide() weekendClass:Array<any> = new Array<any>();//周六日class集合
    async mounted() {   
        let menu = baseTool.findMenu("KQ0302");
        if(menu !=  null){
            this.canAddHoliday = true;
        }
        let res = await tools.getCCellsParams('00WORKCALENDAR'); 
        let rtn = res.data;
        if (rtn.id == 0) {
            let kn: Array<Cells> = rtn.data.layCels;
            this.holidayCell = new CDataSet(kn[0]);
        }
        this.markDate =[];
        this.taskClass = [];
        this.hdayClass = [];
        this.init();
    }
    async init(){
        let res = await tools.getServerTime();
        let date1 =null;
        if(res.data.id ==0){
            date1 = new Date(res.data.data.data.time);
        }else{
            date1 = new Date();
        }
        this.hDate = date1;
        this.setSaturdaySundayColor(date1.getFullYear(),date1.getMonth()+1);
        this.getTaskNum();
        this.getAllHoliday();
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
            this.markDate = this.weekendClass;
            this.markDate = this.markDate.concat(this.taskData.concat(this.hdayClass))
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
        let qe:QueryEntity = new QueryEntity('00WORKCALENDAR','00WORKCALENDAR');
        qe.page.currPage = 1;
        qe.page.pageSize = 50;
        let dd = await this.getTJDate(date);
        let ddarr = dd.split("~");
        let cc = ddarr[0] + "~" +ddarr[1];
        qe.cont = '{"ddate" : "'+cc+'"}'
        let vv = await tools.query(qe);
        if(vv.data.id == 0){
            let data = vv.data.data.data.data;
            this.hdayClass = [];
            for(var i=0;i<data.length;i++){
                let className = "";
                if(className == ""){
                    // 创建我们的样式表
                    var style = document.createElement('style');
                    style.innerHTML =
                        '.sctrl'+data[i].data.ddate+' {' +
                            'background-color: '+data[i].data.background+' !important;' +
                            'border-radius: 50%;' +
                            'color:#FFF;' +
                        '}';
                    className = 'sctrl'+data[i].data.ddate;
                    // 获取第一个脚本标记
                    var ref:any = document.querySelector('script');
                    // 在第一个脚本标签之前插入新样式
                    if(ref != null)
                        ref.parentNode.insertBefore(style, ref);
                }
                let mk ={date:data[i].data.ddate,className:className}
                this.hdayClass.push(mk);
            }
            this.markDate = this.weekendClass;
            this.markDate = this.markDate.concat(this.taskData.concat(this.hdayClass))
        }
    }
    /**
     * 获取一个日期的 详细节日信息
     */
    async getHoliday(date:string){
        let qe:QueryEntity = new QueryEntity('00WORKCALENDAR','00WORKCALENDAR');
        qe.page.currPage = 1;
        qe.page.pageSize = 50;
        qe.cont = '{"ddate" : "'+date+'"}'
        let vv = await tools.query(qe);
        console.log(vv);
        if(vv.data.id == 0){
            this.holidayDate = vv.data.data.data.data;
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
        this.hDate = data;
        this.getTask(data);
        this.getHoliday(data);
    }
    changeDate(data:any) {
        //   console.log(data); //左右点击切换月份
        this.taskData = [];
        let dd = data.split("/")
        this.setSaturdaySundayColor(dd[0],dd[1]);
        this.getTaskNum(data)
        this.getAllHoliday(data)
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

    /**
     * 获取某个月份的 周六日 日期
     */
    setSaturdaySundayColor(y:any,m:any){
        var tempTime = new Date(y,m,0);
        var time = new Date();
        for(var i=1;i<=tempTime.getDate();i++){
            time.setFullYear(y,m-1,i);
            var day = time.getDay();
            if(day == 6){
                let mk ={date:y+"-"+m+"-"+i,className:'saturday'}
                this.weekendClass.push(mk);
            }else if(day == 0){
                let mk ={date:y+"-"+m+"-"+i,className:'sunday'}
                this.weekendClass.push(mk);
            }
        }
    }

    showAddHDialog(){
        this.holidayDialog = true;
        this.holidayCell.createRecord();
        this.addOrUpHoliday = true;
        this.holidayname = "";
        this.holidaycolor = this.holidayCell.currRecord.data.background
    }

    /**
     * 添加节假日
     */
    addHoliday(){
        this.hDate = new Date(this.hDate);// moment(this.hDate).format("YYYY-MM-DD")
        this.holidayCell.currRecord.data.ddate =this.hDate.getFullYear()+ "-"+(this.hDate.getMonth()+1)+"-"+this.hDate.getDate();
        this.holidayCell.currRecord.data.sevent = this.holidayname
        this.holidayCell.currRecord.data.background = this.holidaycolor;
        let bok = this.checkNotNull(this.holidayCell); 
        if(!bok)
            return ;
        this.holidayCell.saveData().then(res=>{//进行保存
            if(res.data.id ==0){
                this.getHoliday(this.holidayCell.currRecord.data.ddate);
                this.$notify.success("保存成功！")
                let className = "";
                if(className == ""){
                    // 创建我们的样式表
                    var style = document.createElement('style');
                    style.innerHTML =
                        '.sctrl'+this.holidayCell.currRecord.data.ddate+' {' +
                            'background-color: '+this.holidayCell.currRecord.data.background+' !important;' +
                            'border-radius: 50%;' +
                            'color:#FFF;' +
                        '}';
                    className = 'sctrl'+this.holidayCell.currRecord.data.ddate;
                    // 获取第一个脚本标记
                    var ref:any = document.querySelector('script');
                    // 在第一个脚本标签之前插入新样式
                    if(ref != null)
                        ref.parentNode.insertBefore(style, ref);
                }
                let mk ={date:this.holidayCell.currRecord.data.ddate,className:className}
                this.getAllHoliday(this.holidayCell.currRecord.data.ddate); 
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
        this.holidayDialog = true;
        this.hDate = item.data.ddate;
        this.holidayname = item.data.sevent;
        this.holidaycolor = item.data.background;
        this.holidayCell.currRecord = item;
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
                    this.getHoliday(item.data.ddate);
                    this.getAllHoliday(item.data.ddate);
                    this.$message({
                        type: 'success',
                        message: '删除成功!'
                    });
                }
            });
        }).catch(() => {
            
        });
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

    .saturday{
        background-color: blue;
        border-radius: 50%;
        color:#FFF;
    }
    .sunday{
        background-color: red;
        border-radius: 50%;
        color:#FFF;
    } 

    .mark1{
        background-color: #52D48C;
        border-radius: 50%;
        color:#FFF;
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
        border: 1px solid #0E96FE;
        border-radius: 100px !important;
    }
    .wh_content_item .wh_isToday[data-v-2ebcbc83] {
        background:#FFF;
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
        background: #0E96FE !important;
        border-radius: 100px !important;
    }
}
</style>
<!--
GitHub 地址：https://github.com/zwhGithub/vue-calendar
 -->