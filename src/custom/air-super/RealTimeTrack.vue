<template>
    <div v-loading="loading">
        <el-tabs v-model="selMap" type="card" @tab-click="mapChnage" style="min-height: -webkit-fill-available">
            <el-tab-pane :style="style" label="天地图" name="tianMap">
                <el-container class="padding0" :style="style">
                    <el-container class="padding0 mapMain">
                        <el-main class="padding0" style="overflow: hidden;position: relative;">
                            <div class="nav-tools">
                                <!-- 返回 -->
                                <el-button icon="el-icon-back" circle @click="refresh"></el-button>
                                <!-- 刷新 -->
                                <el-button icon="el-icon-refresh-left" circle @click="refresh"></el-button>
                                <!-- 查找 -->
                                <el-button icon="el-icon-search" circle @click="dialogShow = true"></el-button>
                                <!-- 画面跟随 -->
                                 <span class="follow">
                                    <el-tooltip class="item" effect="light" content="画面跟随" placement="top" >
                                        <el-switch
                                            v-model="isFollow"
                                            active-color="#13ce66"
                                            inactive-color="#ff4949">
                                        </el-switch>
                                    </el-tooltip>
                                 </span>
                            </div>
                            <t-map ref="TMap" class="myTMap"></t-map>
                            <a class="operaBtn" @click="operaBtnClick">
                                <template v-if="!operaBtnOpen">
                                    <i class="iconfont icon-bip-up"></i>
                                </template>
                                <template v-else>
                                    <i class="iconfont icon-bip-next"></i>
                                </template>
                            </a>
                        </el-main>
                        <!-- 右侧隐藏区域 -->
                        <el-aside :width="operaWidth+'px'">
                            <div class="right-content">
                                <div class="header">
                                   <img  class="header-img" src="../../assets/air-super/header.png" alt="">
                                   <div class="header-title">
                                       飞防驾驶舱
                                   </div>
                               </div>

                                <div v-if="rightState">
                                    <div class="nowtitle pointer" v-for="(item,index) in newTaskList" :key="index" @click="detailTask(item.sid)">
                                        <div class="nowtime-header">
                                            实时任务
                                        </div>
                                        <div class="nowtaskname">
                                            <p class="nowtaskname-p">
                                                {{item.taskname}}
                                            </p>       
                                        </div>
                                    </div>
                                    <!-- <p v-for="(item,index) in newTaskList" :key="index">
                                        {{item.sid}}
                                        {{item.taskname}}
                                    </p> -->
                                </div>
                                <div v-else>
                                    <div class="nowtitle">
                                        <div class="nowtime-header">
                                            当前任务
                                        </div>
                                        <div class="nowtaskname">
                                            <p class="nowtaskname-p">{{taskname}}</p>   
                                        </div>
                                    </div>
                                    <div class="nowtime">
                                        <div class="nowtime-header">
                                            当前时间
                                        </div>
                                        <div class="time">
                                            {{nowtime}}
                                        </div>
                                    </div>
                                    <div class="speed-flow">
                                        <el-row>
                                            <el-col :span="12">
                                                <div class="speed-content">
                                                    <div class="sp-title ">
                                                        <span>当前速度</span>
                                                    </div>
                                                    <div class="time">
                                                        {{nowspeed}}km/h
                                                    </div>
                                                </div>
                                            </el-col>
                                            <el-col :span="12">
                                                <div class="speed-content">
                                                    <div class="sp-title nowtime-header">
                                                        <span>海拔高度</span>
                                                    </div>
                                                    <div class="time">
                                                        {{nowheight}}m
                                                    </div>
                                                </div>
                                            </el-col>
                                        </el-row>
                                    </div>
                                    <div class="speed-flow">
                                        <el-row>
                                            <el-col :span="12">
                                                <div class="speed-content">
                                                    <div class="sp-title ">
                                                        <span>当前压力</span>
                                                    </div>
                                                    <div class="time">
                                                        {{nowpressure}}kpa
                                                    </div>
                                                </div>
                                            </el-col>
                                            <el-col :span="12">
                                                <div class="speed-content">
                                                    <div class="sp-title ">
                                                        <span>当前流量</span>
                                                    </div>
                                                    <div class="time">
                                                        {{nowflow}}m³/h
                                                    </div>
                                                </div>
                                            </el-col>
                                            
                                        </el-row>
                                    </div> 
                                    <div class="speed-flow">
                                        <el-row>
                                            <el-col :span="12">
                                                <div class="speed-content">
                                                    <div class="sp-title nowtime-header">
                                                        <span>累计流量</span>
                                                    </div>
                                                    <div class="time">
                                                        {{sumflow}}m³
                                                    </div>
                                                </div>
                                            </el-col>
                                            <el-col :span="12">
                                                <div class="speed-content">
                                                    <div class="sp-title nowtime-header">
                                                        <span>当前风速</span>
                                                    </div>
                                                    <div class="time">
                                                        {{windSpeed}}m/s
                                                    </div>
                                                </div>
                                            </el-col>
                                        </el-row>
                                    </div>
                                    <div class="speed-flow">
                                        <el-row>
                                            <el-col :span="12">
                                                <div class="speed-content">
                                                    <div class="sp-title nowtime-header">
                                                        <span>当前温度</span>
                                                    </div>
                                                    <div class="time">
                                                        {{nowtemperature}}℃
                                                    </div>
                                                </div>
                                            </el-col>
                                            <el-col :span="12">
                                                <div class="speed-content">
                                                    <div class="sp-title nowtime-header">
                                                        <span>当前湿度</span>
                                                    </div>
                                                    <div class="time">
                                                        {{humidity}}%rh
                                                    </div>
                                                </div>
                                            </el-col>
                                        </el-row>
                                    </div> 
                                    <div class="speed-flow">
                                        <el-row>
                                            <el-col :span="12">
                                                <div class="speed-content">
                                                    <div class="sp-title ">
                                                        <span>累计飞行时长</span>
                                                    </div>
                                                    <div class="time">
                                                        {{sumtime}}/s
                                                    </div>
                                                </div>
                                            </el-col>
                                            <el-col :span="12">
                                                <div class="speed-content">
                                                    <div class="sp-title nowtime-header">
                                                        <span>累计喷洒时长</span>
                                                    </div>
                                                    <div class="time">
                                                        {{sumtimeflow}}/s
                                                    </div>
                                                </div>
                                            </el-col>
                                        </el-row>
                                    </div>
                                    <div class="nowtime">
                                        <div class="nowtime-header">
                                            累计喷洒面积
                                        </div>
                                        <div class="time">
                                            {{sumareaFixed}}/亩
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- <el-row style="width:100%">
                                <el-col :span="12">
                                    <div ref="speedChart" style="height:200px;background-color:#ffffff;width:195px;"></div> 
                                </el-col>
                                <el-col :span="12">
                                    <div ref="pressureChart" style="height:200px;background-color:#ffffff;width:195px;"></div> 
                                </el-col>
                            </el-row>
                            <el-row style="width:100%">
                                <el-col :span="24">
                                    <div ref="flowChart" style="height:200px;background-color:#ffffff;width:390px;"></div> 
                                </el-col>
                            </el-row>
                            <el-row style="width:100%">
                                <el-col :span="24">
                                   <div ref="heightChart" style="height:200px;background-color:#ffffff;width:390px;"></div> 
                                </el-col>
                            </el-row> -->
                        </el-aside>
                    </el-container>
                </el-container>
            </el-tab-pane>
            <el-tab-pane :style="style" class="myTab" label="百度地图" name="baiduMap">
                <b-map style="width:100%;height:100%"></b-map>
            </el-tab-pane>
        </el-tabs>
        <el-dialog title="查询" :close-on-click-modal="false" :visible.sync="dialogShow" width="50%" class="bip-query">
            <el-row class="bip-lay">
                <el-form ref="form" label-width="80px">
                    <el-form-item label="查询年份">
                        <el-input v-model="conditionYera"></el-input>
                    </el-form-item>
                    <el-form-item label="查询内容">
                        <el-checkbox-group v-model="checkList" style="padding-top: 10px;">
                            <el-checkbox label="1">航空识别区</el-checkbox>
                            <el-checkbox label="2">作业区</el-checkbox>
                            <el-checkbox label="3">航线</el-checkbox>
                            <el-checkbox label="4">避让点</el-checkbox>
                            <el-checkbox label="5">起降点</el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                </el-form>

            </el-row>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogShow = false" size="mini">取 消</el-button>
                <el-button type="primary" @click="selData" size="mini">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Watch } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from "vuex-class";
import { User } from '@/classes/User';
import QueryEntity from "@/classes/search/QueryEntity";
import QueryCont from "@/classes/search/QueryCont";
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi;
import { Cells } from "@/classes/pub/coob/Cells";
import CDataSet from "@/classes/pub/CDataSet";
import tMap from "@/components/map/MyTianMap.vue";
import bMap from "@/components/map/MyBaiMap.vue";
import { T } from "@/components/map/js/TMap";
import { TMapUtils } from "./class/TMapUtils";
let TMapUt = TMapUtils.TMapUt;
import { GPSUtil } from "./class/GPSUtil";
let Gps = GPSUtil.GPS;
import moment from 'moment'
import { GlobalVariable } from "@/utils/ICL";
import { BaseVariable } from "@/utils/BaseICL";
import qs from "qs";
import { Route, RawLocation } from "vue-router";
@Component({
    components: {
        tMap,
        bMap
    }
})
export default class RealTimeTrack extends Vue {
    @Mutation('setBipHeight', { namespace:'login' }) setBipHeight: any;
    @State("bipComHeight", { namespace: "login" }) height!: number;
    @Getter('user', { namespace: 'login' }) user?: User;

    @Provide() style: string ="height:" + (this.height ? this.height - 50 : "400") + "px";
    @Provide() selMap: string = "tianMap";
    @Provide() tMap: any = null;
    @Provide() tZoom: number = 12;

    @Provide() sleepTime:number = 5*60*1000;//延迟时间
    @Provide() maxTime:number = 0;//当前查询的最大时间
    @Provide() loading: boolean = false;


    @Provide() taskData:any={};//当天任务集合
    @Provide() airPoint:any=[];//初始化飞机任务点  用来确认地图基本以及中心点
    @Provide() taskPoint:any=[];//任务点
    @Provide() taskPointJSON:any=[];//任务点
    @Provide() plane:any = null;//单个飞机实时点
    @Provide() rotate:number = 0;//飞机旋转角度

    @Provide() _timer:any = null;//计时器  画线
    @Provide() _timer1:any = null;//计时器 查询数据
    @Provide() _timer2:any = null;//计时器 无数据时查询数据
    @Provide() interval:any = 1000;//飞行间隔时间 毫秒    
    @Provide() isFollow:boolean = true;//画面跟随

    @Provide() PreviousFlowPoint:any = null;//上一个流量点
    @Provide() sprayLine0:any=[];//喷洒轨迹（农药范围）
    @Provide() sprayLine1:any=[];//喷洒轨迹（一像素的线）
    @Provide() sprayLine2:any=[];//飞行轨迹（没有喷洒农药的轨迹线）
    @Provide() sprayBreak:boolean = true;//喷洒是否中断
    @Provide() flightBeltColor:string = "#ADFF2F"//行带颜色
    @Provide() flightBeltOpacity:number = 0.3;//航道透明度
    @Provide() flightBeltWidth:number = 45;//航带宽度 米
    @Provide() trackColor:string = "#FFFF00";//航迹颜色
    @Provide() noFlowColor:string = "#F40";//未喷洒农药时的轨迹颜色

    @Provide() operaWidth: number = 0; //右侧作业数据区宽度
    @Provide() operaBtnOpen: boolean = false; //右侧作业数据是否显示

    @Provide() rightState:Boolean = true; //右侧显示内容状态判断
    @Provide() newTaskList:any = []; //当天任务集合
    
    @Provide() dialogShow:boolean = false;
    @Provide() conditionYera:any = new Date().getFullYear();
    @Provide() checkList:any = [];
    @Provide() operaCell: CDataSet = new CDataSet(""); //作业区对象(查询条件)
    @Provide() liftCell: CDataSet = new CDataSet(""); //起降点区对象(查询条件)
    @Provide() operaBrCell: CDataSet = new CDataSet(""); //起降点区对象(查询条件)
    @Provide() allCover:any=[];

    // 实时时间对应的数据
    @Provide() nowtime:String = '----';
    @Provide() nowspeed:String = '--';
    @Provide() nowflow:String = '--';
    @Provide() nowpressure:String = '--';//压强
    @Provide() nowtemperature:String = '--';//温度
    @Provide() sumflow:number = 0;
    @Provide() nowheight:String = '--';
    @Provide() sumtimeflow:number = 0;
    @Provide() sumtime:number = 0;
    @Provide() taskname:String = "";
    sumarea:number = 0;
    windSpeed:any = 0;//风速
    humidity:any = 0;//湿度
    //当前任务起降点
    @Provide() takeoff:any = null;//起降点
    @Provide() takeoffRange:any = 50;//起降点范围

    @Provide() warn:any =null;
    @Provide() warnInterval:any= 0;

    async created() {
        if (this.height) {
            this.style = "height:" + (this.height - 50) + "px";
        }     
        this.operaCell = await this.getCell("FW2015");//作业区查询条件
        this.liftCell = await this.getCell("20200203");//作业区查询条件
        this.operaBrCell = await this.getCell("F2015A");//避让点
        this.initWarn();
    }
    async mounted() {
        try{
            if (this.$refs.TMap) {
                let refT: any = this.$refs.TMap;
                this.tMap = refT.getMap();
                this.tMap.addEventListener("zoomend", this.zoomend);//地图缩放结束
            }
            this.loading = !this.loading;
            this.airPoint=[];
            await this.initTask();
            for(var k in this.taskData){
                await this.initOperDevice(this.taskData[k]);
            }
            let t1 = this.tMap.getViewport(this.airPoint);
            if(t1)
                this.tMap.panTo(t1.center, t1.zoom);
            this.loading = !this.loading;
        }catch(err){
            this.loading = false;
            this.$notify.error("出错了！")
        }
        this.initHeight();
    }
    /**
     * 查询正在今天的任务
     */
    async initTask(){
        let res = await tools.getServerTime();
        let time:number = res.data.data.data.time;
        let date = TMapUt.dateFormat(time,"yyyy-MM-dd HH:mm:ss")
        let qe: QueryEntity = new QueryEntity("", "");
        qe.page.currPage = 1;
        qe.page.pageSize = 50000;
        let cont ="bgtime<='"+date+"' and edtime>='"+date+"' and  tkst='1' ";
        qe.cont = cont;
        let cc = await tools.getBipInsAidInfo("TKMSG", 210, qe);
        console.log(cc);
        if(cc.data.id ==0){
            let values = cc.data.data.data.values;
            this.newTaskList = cc.data.data.data.values;
            for(var i=0;i<values.length;i++){
                let vl = values[i];
                let tlid = await this.initNewTlid(vl.asid)
                vl.tlid = tlid[0];
                vl.trtype = tlid[1];
                // vl.tlid = "20003720032"
                this.taskData[vl.sid]= vl;
            }
        }
    }
    /**
     * 查询任务最新设备  可能会做设备便跟
     * @param asid 器械标识
     */
    async initNewTlid(asid:any){
        let qe: QueryEntity = new QueryEntity("", "");
        qe.page.currPage = 1;
        qe.page.pageSize = 20;
        let oneCont =[];
        let allCont = [];
        let cont = "";
        let qCont = new QueryCont('asid',asid, 12);
        qCont.setContrast(0);
        oneCont.push(qCont);
        if (oneCont.length != 0) {
            allCont.push(oneCont);
            cont = "~" + JSON.stringify(allCont);
        }
        qe.cont = cont;
        let tlid = [];
        let cc = await tools.getBipInsAidInfo("EQUI", 210, qe);
        if(cc.data.id ==0){
            let values = cc.data.data.data.values; 
            if(values.length>=1){
                tlid[0] = values[0].tlid;
                tlid[1] = values[0].trtype;
            }
        }
        return tlid;
    }
    /**
     * 查询正在作业的设备
     */
    async initOperDevice(task:any){
        let rest = await tools.getServerTime();
        let time:number = rest.data.data.data.time;
        this.maxTime = time; 
        if(task.trtype == '0'){
            time = parseInt(((time - this.sleepTime)/1000)+"");
            // time = 1566597121;
        }else{
            time = time - 10000;
        }
        let key = task.tlid;
        let trtype = task.trtype;
        let condition ={key:key,time:time,trtype:trtype};
        let data = {
            apiId: GlobalVariable.APIID_MPARAMS,
            dbid: BaseVariable.COMM_FLD_VALUE_DBID,
            usercode: JSON.parse(window.sessionStorage.getItem("user") + "").userCode,
            condition:JSON.stringify(condition),
            oprid:200,
        }
        let data1 = qs.stringify(data);
        let res = await Vue.$axios.post("/realTimeServlet", data1);

        if(res.data.id ==0){
            let v = res.data.data.data;
            if(v){
                let key = task.sid;
                let lnglat = [v.latitude,v.longitude];
                let offline = false;
                if(task.trtype =='0'){
                    lnglat = Gps.bd09_To_gps84(v.latitude,v.longitude);
                }else if(task.trtype == '1'){
                    if(v.offline+'' == '1'){
                        offline = true;
                    }
                }
                let cc = lnglat[1]+","+lnglat[0]
                let poin = new T.LngLat(lnglat[1], lnglat[0]);
                this.airPoint.push(poin);
                v.speedtime = new Date(v.speedtime)
                v.speedtime = moment(v.speedtime).format("YYYY-MM-DD HH:mm:ss")
                let msg = "<div>任务编码："+task.sid+"<br/>任务名称："+task.taskname+"<br/>定位信息:"+lnglat[1]+","+ lnglat[0]+"<br/>时&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;间："+v.speedtime
                if(offline){//离线
                    msg += "<br/>状&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;态：<span style='color:red;'>离线</span>"
                }else{//在线
                    msg += "<br/>状&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;态：<span style='color:green;'>在线</span>"
                }
                msg +="</div>";

                TMapUt.markRealTimeAir(cc,this.tMap,key,this.ariClick,msg,offline)
            }
        } 
    }
    // 点击右侧任务跳转至详情页面
    detailTask(tkid:String){
        let data1 = {target:{key:tkid}}
        this.ariClick(data1);
    }
    /**
     * 点击单个飞机
     */
    ariClick(data:any){
        this.rightState = false;
        this.clearCover();
        this.loading = true;
        let tkid = data.target.key;
        let task = this.taskData[tkid];
        this.taskname = this.taskData[tkid].taskname;
        this.flightBeltWidth = this.taskData[tkid].widcloth;
        let route = task.route
        let hoaid = task.hoaid;
        let oaid = task.oaid;
        let takeoff = task.takeoff;
        this.initTakeoff(takeoff);
        if(route){
            TMapUt.makeRoute(route,"",this.tMap);
        }
        if(hoaid){
            TMapUt.getOpera(hoaid,this.tMap);
        }
        if(oaid){
            TMapUt.getOperaRoute(oaid,this.tMap);
            TMapUt.getOpera(oaid,this.tMap);
            TMapUt.getOperaBr(oaid,this.tMap);
        }
        if(task.trtype=='0'){
            this.maxTime = parseInt(((this.maxTime - this.sleepTime)/1000)+"");
            // this.maxTime = 1566597121;
        }else{
            this.maxTime = this.maxTime -5000;
        }
        this.getPointList(task.tlid,true,task.trtype)
        this.tMap.setZoom(17)//设置地图放大级次

    }
    
    /***
     * 获取实时数据
     * 设备号
     * 是否第一次
     * 设备类型
     */
    async getPointList(key:any,frist:boolean,trtype:string){ 
        try{
            let condition ={key:key,time:this.maxTime,trtype:trtype};
            let data = {
                apiId: GlobalVariable.APIID_MPARAMS,
                dbid: BaseVariable.COMM_FLD_VALUE_DBID,
                usercode: JSON.parse(window.sessionStorage.getItem("user") + "").userCode,
                condition:JSON.stringify(condition),
                oprid:210,
            }
            let data1 = qs.stringify(data);
            let cc = await Vue.$axios.post("/realTimeServlet", data1);
            if(cc.data.id ==0 ){
                let values = cc.data.data.data;
                if(frist){
                    this.taskPoint = [];
                    this.taskPointJSON = [];
                }
                for(var i =0;i<values.length;i++){
                    let v = values[i];
                    this.maxTime = v.speedtime;
                    let lnglat = [v.latitude,v.longitude];
                    if(trtype =='0'){
                        lnglat = Gps.bd09_To_gps84(v.latitude,v.longitude);
                        v.speedtime = v.speedtime * 1000
                    }
                    v.latitude = lnglat[0];
                    v.longitude = lnglat[1];
                    v.speedtime = new Date(v.speedtime)
                    v.speedtime = moment(v.speedtime).format("YYYY-MM-DD HH:mm:ss")
                    if(this.taskPointJSON.indexOf(this.maxTime) ==-1){
                        this.taskPoint.push(v); 
                        this.taskPointJSON.push(this.maxTime);
                    } 
                }
            }
            if(frist){
                this.drawPointLine(key,false,trtype);
            }
            this.loading = false;
            // this._timer1 = window.setTimeout(() => {
            //     this.getPointList(key,false,trtype)
            // }, 2500);
        }catch(err){
            this.$notify.error("出错了！")
            this.loading = false;
        }
    }
    /**
     * 开始画作业记录
     */
    drawPointLine(key:any,frist:boolean,trtype:string){
        let t1 = new Date().getTime();
        if(this.taskPoint.length==0){
            this._timer2 = window.setTimeout(() => {
                this.getPointList(key,false,trtype);
                this.drawPointLine(key,false,trtype)
            }, 1000);
            return;
        }
        if(this.taskPoint.length<=2){
            this.getPointList(key,false,trtype);
        }
        this.passOneNode(this.taskPoint[0]);
        if(this.taskPoint.length>0){
            if(this.taskPoint.length>1){
                this.loadPlane(this.taskPoint[0],this.taskPoint[1]);
            } 
            else{
                this.loadPlane(this.taskPoint[0],this.taskPoint[0]);
            }
        }
        if(this.taskPointJSON.length>30){
            this.taskPointJSON = this.taskPointJSON.splice(1,1)
        }
        this.taskPoint = this.taskPoint.slice(1);
        let t2 = new Date().getTime();
        let t=1000;
        if(t2-t1<this.interval){ 
            t=t-(t2-t1);
        }else{
            t=0;
        } 
        this._timer = window.setTimeout(() => {
           this.drawPointLine(key,false,trtype);
        }, t);
    }
    /**
     * 路线节点变化
     * lnglat:LngLat, index:Number, length:Number
     */
    passOneNode(data:any){
        if(data.longitude == '0' || data.latitude == '0')
            return;
        if(this.isFollow){//画面跟随
            this.tMap.panTo(new T.LngLat(data.longitude, data.latitude));
        }
        if(data){
            let flow = data.flow;
            
            // this.nowtime = TMapUt.dateFormat(data.speedtime*1000,"yyyy-MM-dd HH:mm:ss")
            if(data.speedtime){
                this.nowtime = data.speedtime;
            }
            this.nowspeed = (data.speed).toFixed(3);

            if(data.windspeed)
                this.windSpeed = data.windspeed;//风速
            if(data.humidity)
                this.humidity = data.humidity;//湿度

            this.nowpressure = (data.pressure).toFixed(1);
            this.nowtemperature = (data.temperature).toFixed(1);

            this.nowflow = ( data.flow).toFixed(2);;
            // this.sumflow = (data.sumfolw).toFixed(3);
            this.nowheight = data.height;
            this.sumtime = this.sumtime+1;
            let lgt = new T.LngLat(data.longitude, data.latitude)
            if(this.takeoff){
                let jl = this.tMap.getDistance(this.takeoff,lgt);
                if(jl<=this.takeoffRange){
                    this.sumflow= 0;
                    this.sumarea = 0;
                }
            }

            if(flow>=0.9){//有流量去划线
                this.sumflow += flow/60/60;
                this.sumflow = parseFloat((this.sumflow).toFixed(3));
                let nowArea = this.flightBeltWidth  * data.speed *1000/3600 /666.67;
                this.sumarea = (this.sumarea + nowArea);
                let msg = "";
                //预警信息
                //this.flightBeltWidth  幅宽
                //Flow = （Loading÷1000）÷（ （（ Area÷1500）÷（Swath÷1000）） ÷ Speed）  
                let standard=[];
                this.warnInterval++;
                let flow0 = (this.warn.drugload/1000)/(((this.warn.area/this.warn.area)/(this.flightBeltWidth/1000))/data.speed);
                if(!isNaN(flow0) && this.warnInterval >= this.warn.interval){
                    standard[0] = (flow0*(1-(this.warn.drugfloat/100))).toFixed(2);
                    standard[1] = (flow0*(1+(this.warn.drugfloat/100))).toFixed(2);
                    if(flow>standard[1] || flow<standard[0]){
                        msg = "当前速度："+data.speed+"km/h<br/>瞬时流量异常("+flow+"),超出当前速度标准范围("+standard[0]+"~"+standard[1]+")"
                    }
                    this.warnInterval = 0;
                }
                if(msg != ""){
                    //创建图片对象
                    var icon = new T.Icon({
                        iconUrl: require('@/assets/air-super/avoid.png'),
                        iconSize: new T.Point(20, 20),
                        iconAnchor:new T.Point(10, 20),
                    });
                    //向地图上添加自定义标注
                    var marker = new T.Marker(lgt, {icon: icon});
                    var markerInfoWin = new T.InfoWindow(msg);
                    marker.addEventListener("click", function () {
                        marker.openInfoWindow(markerInfoWin);
                    });// 将标注添加到地图中
                    this.tMap.addOverLay(marker)
                }
                this.sumtimeflow = this.sumtimeflow + 1;
                if(this.sprayBreak){//中断过需要从起一条线
                    if(this.sprayLine2.length>0){
                        let line2 = this.sprayLine2[this.sprayLine2.length-1];
                        let points2 = line2.getLngLats();
                        points2.push(lgt);
                        line2.setLngLats(points2)
                    }
                    let points = [];
                    let zoom = this.tMap.getZoom();
                    let cc = 256 * Math.pow(2, zoom) / 40075017 //换算一米转多少像素
                    let opts0 = {color:this.flightBeltColor,weight:cc*this.flightBeltWidth,opacity:this.flightBeltOpacity};
                    points.push(lgt);
                    var newLine0 = new T.Polyline(points,opts0);
                    this.tMap.addOverLay(newLine0);
                    this.sprayLine0.push(newLine0)

                    let opts1 = {color:this.trackColor,weight:4,opacity:1};
                    var newLine1 = new T.Polyline(points,opts1);
                    this.tMap.addOverLay(newLine1);     
                    this.sprayLine1.push(newLine1)
                }else{//没有中断需要在最后一条线追加点 或重画最后一条线
                    let line0 = this.sprayLine0[this.sprayLine0.length-1];
                    let points0 = line0.getLngLats();
                    points0.push(lgt);
                    line0.setLngLats(points0)

                    let line1 = this.sprayLine1[this.sprayLine1.length-1];
                    let points1 = line1.getLngLats();
                    points1.push(lgt);
                    line1.setLngLats(points1)
                }
                this.sprayBreak = false;
            }else{
                this.warnInterval =0;
                if(this.sprayBreak && this.sprayLine2.length>0){
                    let line2 = this.sprayLine2[this.sprayLine2.length-1];
                    let points2 = line2.getLngLats();
                    points2.push(lgt);
                    line2.setLngLats(points2)
                }else{
                    let opts2 = {color:this.noFlowColor,weight:4,opacity:1};
                    let points = [];
                    if(this.PreviousFlowPoint)
                    points.push(this.PreviousFlowPoint);
                    points.push(lgt);
                    var newLine2 = new T.Polyline(points,opts2);
                    this.tMap.addOverLay(newLine2);     
                    this.sprayLine2.push(newLine2)
                }   
                this.sprayBreak = true;
            }
            let speed = data.speed;
            this.PreviousFlowPoint = lgt;
        }
    }
    /**
     * 设置飞机
     */
    loadPlane(lnglat1:any,lnglat2:any) {
        let cc = lnglat1.longitude + "," + lnglat1.latitude
        if(lnglat1.longitude == 0 || lnglat1.latitude == 0)
            return;
        if(!this.plane){
            this.plane = TMapUt.markRealTimeAir(cc,this.tMap,"",null)
        }else{
            this.plane.setLngLat(new T.LngLat(lnglat1.longitude, lnglat1.latitude))
        }

        let jl = this.tMap.getDistance(new T.LngLat(lnglat1.longitude, lnglat1.latitude),new T.LngLat(lnglat2.longitude, lnglat2.latitude));
        if(jl>0.5){
            let curPos = new T.LngLat(lnglat1.longitude, lnglat1.latitude)
            let targetPos = new T.LngLat(lnglat2.longitude, lnglat2.latitude)
            this.rotate =  TMapUt.setRotation(curPos,targetPos,this.tMap);
            this.rotate = parseFloat( this.rotate+'')  
            // if(lnglat1.sbid)
            //     this.rotate = lnglat1.direction || "0";  
        } 
        if(this.rotate){
            let style = this.plane.Fr.style[TMapUt.CSS_TRANSFORM()];
            this.plane.Fr.style[TMapUt.CSS_TRANSFORM()]= style+" rotate(" +this.rotate + "deg)";
            this.plane.Fr.style["transform-origin"] = "50% 50%";
        }
    }
    //右侧作业区开关
    async operaBtnClick() {
        this.operaBtnOpen = !this.operaBtnOpen;
        if (this.operaBtnOpen) {
            //进行打开右侧作业区开关
            while (this.operaWidth <= 300) {
                this.operaWidth++;
            }
        } else {
            //关闭右侧作业区开关
            while (this.operaWidth > 0) {
                this.operaWidth--;
            }
        }
        if (!this.tMap) {
            if (this.$refs.TMap) {
                let refT: any = this.$refs.TMap;
                this.tMap = refT.getMap();
            }
        } 
        setTimeout(() => {
            this.tMap.checkResize();
        }, 200);
    }
    //清空地图覆盖物
    async clearCover() {
        if(this._timer){
            window.clearTimeout(this._timer);
            delete this._timer;
            this._timer = null;
        }
        if(this._timer1){
            window.clearTimeout(this._timer1);
            delete this._timer1;
            this._timer1 = null;
        } 
        if(this._timer2){
            window.clearTimeout(this._timer2);
            delete this._timer2;
            this._timer2 = null;
        } 
        this.tMap.clearOverLays();
    }
    /**
     * 刷新
     */
    async refresh(){
        try{
            this.PreviousFlowPoint = null;
            this.rightState = true;
            this.clearCover();
            this.loading = true;
            this.taskData={};//当天任务集合
            this.airPoint=[];//初始化飞机任务点  用来确认地图基本以及中心点
            this.taskPoint=[];//任务点
            this.plane = null;//单个飞机实时点
            this.isFollow = true;//画面跟随
            this.sprayLine0=[];//喷洒轨迹（农药范围）
            this.sprayLine1=[];//喷洒轨迹（一像素的线）
            this.sprayLine2=[];//飞行轨迹（没有喷洒农药的轨迹线）
            this.sprayBreak = true;//喷洒是否中断
            this.airPoint=[];
            this.sumtime = 0;
            this.sumtimeflow = 0;
            await this.initTask();
            for(var k in this.taskData){
                await this.initOperDevice(this.taskData[k]);
            }
            let t1 = this.tMap.getViewport(this.airPoint);
            if(t1)
                this.tMap.panTo(t1.center, t1.zoom);
            this.loading = false;
        }catch(err){
            this.loading = false;
            this.$notify.error("出错了！")
        }
    }
    /**
     * 地图缩放结束
     */
    zoomend(){
        if(this.plane){
            let style = this.plane.Fr.style[TMapUt.CSS_TRANSFORM()];
            this.plane.Fr.style[TMapUt.CSS_TRANSFORM()]= style+" rotate(" +this.rotate + "deg)";
            this.plane.Fr.style["transform-origin"] = "50% 50%";
        }
        let zoom = this.tMap.getZoom();
        let cc = 256 * Math.pow(2, zoom) / 40075017 //换算一米转多少像素
        let opts0 = {color:this.flightBeltColor,weight:cc*this.flightBeltWidth,opacity:this.flightBeltOpacity};
        //重新画 农药喷洒范围
        for(var i=0;i<this.sprayLine0.length;i++){
            let line = this.sprayLine0[i];
            let points = line.getLngLats();
            var newLine = new T.Polyline(points,opts0);
            this.tMap.addOverLay(newLine);
            this.sprayLine0[i] = newLine;
            this.tMap.removeOverLay(line);
        }
    }
    /**
     * 页面关闭后
     */
    beforeDestroy(){
        this.clearCover();
    }
    /** 显示航空识别区、作业区、起降点、避让点、航线 查询框 */
    /** 查找数据 */
    selData(){
        for(var i=0;i<this.allCover.length;i++){
            this.tMap.removeOverLay(this.allCover[i]);
        }
        this.allCover=[];
        for(var i=0;i<this.checkList.length;i++){
            if(this.checkList[i] == '1'){//航空识别区
                this.getHKSBQ();
            }else if(this.checkList[i] =='5'){//起降点
                this.getLift();
            }
        }
        if(this.checkList.indexOf('2') !=-1 ||this.checkList.indexOf('3') !=-1 ||this.checkList.indexOf('4') !=-1 ){//作业区 航线 避让点
            this.getHKZYQ();
        }
        this.dialogShow = false;
    }
    /**
     * 获取航空识别区
     */
    async getHKSBQ(){    
        let sorg ='';
        if(this.user){
            sorg = this.user.deptInfo.deptCode;
        }
        let qe: QueryEntity = new QueryEntity("FW2015", "FW2015TJ");
        let tj={iym:this.conditionYera,sbuid:'F2005',sorg:sorg}
        qe.page.currPage = 1;
        qe.page.pageSize = 4000;
        qe.cont = JSON.stringify(tj);
        qe.oprid = 13;
        await this.operaCell.queryData(qe)
        .then((res:any) => {
            if(res.data.id ==0){
                let data = res.data.data.data.data;
                for(var i=0;i<data.length;i++){
                    let onesbq = data[i]
                    this.makeOpera(onesbq);
                }
            }
        })
        .catch((err:any) => {
            
        });
    }
    /**
     * 获取航空作业区区
     */
    async getHKZYQ(){            
        let sorg ='';
        if(this.user){
            sorg = this.user.deptInfo.deptCode;
        }
        let qe: QueryEntity = new QueryEntity("FW2015", "FW2015TJ");
        let tj={iym:this.conditionYera,sbuid:'F2015',sorg:sorg}
        qe.page.currPage = 1;
        qe.page.pageSize = 4000;
        qe.cont = JSON.stringify(tj);
        qe.oprid = 13;
        await this.operaCell.queryData(qe)
        .then((res:any) => {
            if(res.data.id ==0){
                let data = res.data.data.data.data;
                for(var i=0;i<data.length;i++){
                    let onesbq = data[i]
                    if(this.checkList.indexOf('2') !=-1){//作业区
                        this.makeOpera(onesbq);
                    }
                    if(this.checkList.indexOf('3') !=-1){//航线
                        if(onesbq.data.route){
                            let points:any = [];
                            let boundary = onesbq.data.route.split(";");
                            for (var j = 0; j < boundary.length; j++) {
                                let poin = boundary[j].split(",");
                                if (poin.length >= 2) {
                                points.push(new T.LngLat(poin[0], poin[1]));
                                }
                            }
                            //创建线对象
                            let editLine = new T.Polyline(points);
                            //向地图上添加线
                            this.tMap.addOverLay(editLine);
                            this.allCover.push(editLine);
                        }
                    }
                    if(this.checkList.indexOf('4') !=-1){//避让点
                        let qe: QueryEntity = new QueryEntity("F2015A", "F2015A");
                        qe.page = {currPage: 1,index: 0,pageSize: 20000,total: 0};
                        qe.cont = "{'oid':'"+onesbq.data.id+"'}";
                        qe.oprid = 13;
                        this.operaBrCell.queryData(qe).then((res:any) => {
                            if (res.data.id == 0) {
                                if(res.data.data.data.data.length>0){
                                    let Brdata = res.data.data.data.data;
                                    for(var j=0;j<Brdata.length;j++){
                                        let br1 = Brdata[j].data;
                                        if(br1.type ==0){//点的
                                            //创建标注对象
                                            var marker = new T.Marker(new T.LngLat(br1.avoid.split(",")[0], br1.avoid.split(",")[1]));
                                            //创建图片对象
                                            var icon = new T.Icon({
                                                iconUrl: require('@/assets/air-super/avoid.png'),
                                                iconSize: new T.Point(50, 50),
                                                iconAnchor:new T.Point(20, 50),
                                            });
                                            //向地图上添加自定义标注
                                            let center =new T.LngLat(br1.avoid.split(",")[0], br1.avoid.split(",")[1]);
                                            var marker = new T.Marker(center,{icon: icon});
                                            var markerInfoWin = new T.InfoWindow(br1.name);
                                            marker.addEventListener("mouseover", function () {
                                                marker.openInfoWindow(markerInfoWin);
                                            });
                                            this.tMap.addOverLay(marker);
                                            this.allCover.push(marker);
                                        }else{//面
                                            let boundary = br1.avoid.split(";");
                                            var points = [];
                                            for (var j = 0; j < boundary.length; j++) {
                                                let poin = boundary[j].split(",");
                                                if (poin.length >= 2) {
                                                points.push(new T.LngLat(poin[0], poin[1]));
                                                }
                                            }
                                            //创建面对象
                                            var polygon = new T.Polygon(points, {
                                                color: "blue",
                                                weight: 1,
                                                opacity: 0.5,
                                                fillColor: br1.color,
                                                fillOpacity: 0.5
                                            });
                                            this.tMap.addOverLay(polygon);
                                            this.allCover.push(polygon);
                                            let t1 = this.tMap.getViewport(points);
                                            let text = br1.name;
                                            var label = new T.Label({
                                                text: text,
                                                position: t1.center,        
                                                offset: new T.Point(-30, 0),
                                            });
                                            label.setBorderLine(0)
                                            label.setFontSize(16)
                                            label.setBackgroundColor(null);
                                            this.tMap.addOverLay(label);
                                            this.allCover.push(label);
                                        }
                                    }
                                }
                            }
                        })
                        .catch((err:any) => {
                            this.$notify.error(err+";RealTimeTrack getHKZYQ");
                        });
                    }
                }
            }
        })
        .catch((err:any) => {
            
        });
    }
    /**
     * 航空识别区 面文字   飞防作业区 面 文字
     */
    makeOpera(onesbq:any){
        let boundary = onesbq.data.boundary1.split(";");
        var points = [];
        for (var j = 0; j < boundary.length; j++) {
            let poin = boundary[j].split(",");
            if (poin.length >= 2) {
            points.push(new T.LngLat(poin[0], poin[1]));
            }
        }
        //创建面对象
        var polygon = new T.Polygon(points, {
            color: "blue",
            weight: 1,
            opacity: 0.5,
            fillColor: onesbq.data.color,
            fillOpacity: 0.5
        });
        this.tMap.addOverLay(polygon);
        this.allCover.push(polygon);
        let t1 = this.tMap.getViewport(points);
        let text = onesbq.data.id;
        var label = new T.Label({
            text: text,
            position: t1.center,        
            offset: new T.Point(-30, 0),
        });
        label.setBorderLine(0)
        label.setFontSize(16)
        label.setBackgroundColor(null);
        this.tMap.addOverLay(label);
        this.allCover.push(label);
    }
    /**
     * 获取起降点
     */
    async getLift(){
        let sorg ='';
        if(this.user){
            sorg = this.user.deptInfo.deptCode;
        }
        let tj={iym:this.conditionYera,sorg:sorg}
        let qe: QueryEntity = new QueryEntity("20200203", "20200203TJ");
        qe.page.currPage = 1;
        qe.page.pageSize = 4000;
        qe.cont = JSON.stringify(tj);
        qe.oprid = 13;
        await this.liftCell.queryData(qe).then((res:any) => {  
            if(res.data.id==0){
                let liftD = res.data.data.data.data;
                for(var i=0;i<liftD.length;i++){
                    this.makeLift(liftD[i].data);                    
                }
            }
        })
    }
    makeLift(d1:any){
        let boundary1 = d1.north;
        let boundary = boundary1.split(",");
        //创建图片对象
        var icon = new T.Icon({
            iconUrl: require('@/assets/air-super/lift.png'),
            iconSize: new T.Point(50, 50),
            iconAnchor:new T.Point(20, 50),
        });
        //向地图上添加自定义标注
        let center = new T.LngLat(boundary[0], boundary[1]);
        var marker = new T.Marker(center,{icon: icon});
    
        let lng = this.doubleToDFM(boundary[0]) 
        let lat = this.doubleToDFM(boundary[1])  
        let text = "<div style='text-align: center;'>东经(E):"+lng+"   北纬(N):"+lat+"<br/>"+d1.name+"</div>";
         var markerInfoWin = new T.InfoWindow(text);
        marker.addEventListener("mouseover", function () {
            marker.openInfoWindow(markerInfoWin);
        });
        this.tMap.addOverLay(marker);
        this.allCover.push(marker);
    }
    /** 小数转度分秒 */
    doubleToDFM(value:any){
        value = Math.abs(value);
        var v1 = Math.floor(value);//度
        var v2 = Math.floor((value - v1) * 60);//分
        var v3 = Math.round((value - v1) * 3600 % 60);//秒
        let data = v1 + '°' + v2 + '′' + v3 + '″'; 
        return data;
    }

    /**
     * 初始化单个任务起降点信息
     */
    async initTakeoff(sid:any){
        if(sid){
            let oneCont =[];
            let allCont = [];
            let cont = "";
            let qCont = new QueryCont('sid', sid, 12);
            qCont.setContrast(0);
            oneCont.push(qCont);
            if (oneCont.length != 0) {
            allCont.push(oneCont);
                cont = "~" + JSON.stringify(allCont);
            }
            let qe: QueryEntity = new QueryEntity("", "");
            qe.page.currPage = 1;
            qe.page.pageSize = 1;
            qe.cont = cont;
            let vv = await tools.getBipInsAidInfo("TAKEOFF", 210, qe);
            if(vv.data.id ==0){
                let takoff = vv.data.data.data.values[0];
                let north = takoff.north 
                if(takoff.range)
                    this.takeoffRange = takoff.range 
                let boundary = north.split(",");
                //创建图片对象
                var icon = new T.Icon({
                    iconUrl: require('@/assets/air-super/lift.png'), 
                    iconSize: new T.Point(70, 70),
                    iconAnchor:new T.Point(35,70),
                });
                //向地图上添加自定义标注
                this.takeoff = new T.LngLat(boundary[0], boundary[1]);
                var marker = new T.Marker(this.takeoff,{icon: icon});
                this.tMap.addOverLay(marker);
            }
        }
    }

/********************************* 预警信息 *******************************/
        /**
     * 初始化飞行预警参数
     */
    async initWarn(){
        let qe: QueryEntity = new QueryEntity("", "");
        qe.page.currPage = 1;
        qe.page.pageSize = 1;
        let res = await tools.getBipInsAidInfo("GETWARN", 210, qe);
        if(res.data.id ==0){
            this.warn = res.data.data.data.values[0] 
        }
    }
/********************************* 预警信息 *******************************/
    mapChnage() {
    }
    @Watch("height")
    heightChange() {
        this.style = "height:" + (this.height - 50) + "px";
        setTimeout(() => {
            this.tMap.checkResize();  
        }, 200);
    }
    get sumareaFixed(){
        return this.sumarea.toFixed(3)
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
    initHeight(){
        let height = document.documentElement.clientHeight
        if(height>70){
            height=height-94;
        }
        this.setBipHeight(height)
        window.onresize = () => {
            return (() => {
                let height = document.documentElement.clientHeight
                if(height>70){
                    height=height-94;
                }
                this.setBipHeight(height)
            })()
        }
    }

    @Watch("$route")
    routerChange(to: Route, from: Route) { 
        if (to.name === "RealTimeTrack" || to.name === "home") {
            if(this.tMap)
                this.tMap.checkResize();
        }
    }
}
</script>
<style scoped lang="scss" >
.myTab {
    height: 600px;
}
.heightWidth {
    // height: 100%;
    width: 100%;
    padding: 0px;
}
.areaBtn {
    height: 63px;
    line-height: 63px;
    width: 15px;
    float: left;
    top: 40%;
    position: absolute;
    z-index: 999;
    background-color: #fff;
    border-top-width: 1px;
    border-right-width: 1px;
    border-bottom-width: 1px;
    border-top-style: solid;
    border-right-style: solid;
    border-bottom-style: solid;
    border-top-color: #ccc;
    border-right-color: #ccc;
    border-bottom-color: #ccc;
    -moz-border-radius: 0 6px 6px 0;
    -webkit-border-radius: 0 6px 6px 0;
    border-radius: 0 6px 6px 0;
}
.operaBtn {
    height: 63px;
    line-height: 63px;
    width: 15px;
    float: right;
    top: 40%;
    right: 0px;
    position: absolute;
    z-index: 999;
    background-color: #fff;
    border-top-width: 1px;
    border-left-width: 1px;
    border-bottom-width: 1px;
    border-top-style: solid;
    border-left-style: solid;
    border-bottom-style: solid;
    border-top-color: #ccc;
    border-left-color: #ccc;
    border-bottom-color: #ccc;
    -moz-border-radius: 6px 0px 0px 6px;
    -webkit-border-radius: 6px 0px 0px 6px;
    border-radius: 6px 0px 0px 6px;
}
.myTMap {
    height: calc(100% - 0px) !important;
    width: 100%;
    outline: none;
}
.mapMain {
    height: calc(100%) !important;
}
.padding0 {
    padding: 0px;
}
.operaCheck {
    line-height: 50px;
    text-align: center;
}
.tools {
    text-align: right;
}
.tools-li {
    margin-left: 5px;
}
.bip-lay {
    margin-top: 20px;
}
.line {
    height: 1px;
    border-bottom: 1px solid #f1f1f1;
}
.oper-pagination {
    text-align: center;
}

.op-drop {
    background-color: #fff;
}
.nav-tools {
    position: absolute;
    top: 1rem;
    left: 3rem;
    z-index: 999;
}
.taskdata {
    height: 100%;
    width: 100%;
    position: relative;
}
.page-turn {
    position: absolute;
    bottom: 0px;
    width: 99%;
    text-align: center;
    height: 30px;
    line-height: 30px;
    border: 1px solid #f6f6f6;
    font-size: 14px;
}
.right-content {
    height: 100%;
    width: 100%;
    overflow-y: auto;
    // height: calc(100%) !important;
    background-color: #004981;
}
.header{
    position: relative;
}
.header-img{
    width: 100%;
    height: 35px;
}
.header-title {
    position: absolute;
    top:5px;
    left: 110px;
    color:#f9f9f9;
}
.nowtitle {
    width: 290px;
    height: 150px;
    margin: 0px auto;
    background-image: url(../../assets/air-super/box.png);
    background-size:100% 100%;
    box-sizing: border-box;   
    color: #f9f9f9;
}
// .nowtaskname{
//     text-indent: 2px;
//     line-height: 30px;
// }
.nowtaskname-p {
    padding-left: 5px;
    text-indent: 20px;
    line-height: 30px;
}
.nowtime {
    width: 290px;
    height: 80px;
    margin: 0px auto;
    margin-top: 10px;
    background-image: url(../../assets/air-super/box.png);
    background-size:100% 100%;
    box-sizing: border-box;   
     color: #f9f9f9;
}
.nowtime-header {
    width: 270px;
    height: 25px;
    line-height: 25px;
    border-left: 5px solid #185BFF;
    margin: 0px auto;
    padding-left: 10px;
    font-size: 14px;
}
.time {
    height: 55px;
    line-height: 55px;
    text-align: center;
    font-size: 20px;
}
.speed-flow{
    margin-top: 5px;
    padding: 5px;
}
.speed-content {
    height: 80px;
    // width: 140px;
    background-image: url(../../assets/air-super/box.png);
    background-size:100% 100%;
    box-sizing: border-box;  
    color: #f9f9f9;
}
.sp-title {
    width: 130px;
    height: 25px;
    line-height: 25px;
    border-left: 5px solid #185BFF;
    margin: 0px auto;
    padding-left: 10px;
    font-size: 14px;
}
.pointer {
    cursor: pointer;
}

.follow {
    margin-left: 15px;
    color: #20A0ff;
    font-size: 14px;
}
</style>
<style lang="scss" >
.myOperatingAreaCheck {
    font-size: 0px !important;
    .el-checkbox__label {
        font-size: 0px !important;
    }
}
</style>