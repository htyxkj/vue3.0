<template>
    <div v-loading="loading">
        <el-container class="padding0" style="height:7.25rem">
            <el-container class="padding0 mapMain">
                <el-main class="padding0" style="overflow: hidden;position: relative;">
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
                            <img  class="header-img" src="../../../assets/air-super/header.png" alt="">
                            <div class="header-title">
                                飞防驾驶舱
                            </div>
                        </div>
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
                </el-aside>
            </el-container>
        </el-container>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Watch,Prop } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from "vuex-class";
import { User } from '@/classes/User';
import QueryEntity from "@/classes/search/QueryEntity";
import QueryCont from "@/classes/search/QueryCont";
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi;
import tMap from "@/components/map/MyTianMap.vue";
import { T } from "@/components/map/js/TMap";
import { TMapUtils } from "@/custom/air-super/class/TMapUtils";
let TMapUt = TMapUtils.TMapUt;
import { GPSUtil } from "@/custom/air-super/class/GPSUtil";
let Gps = GPSUtil.GPS;
import moment from 'moment'
import { GlobalVariable } from "@/utils/ICL";
import { BaseVariable } from "@/utils/BaseICL";
import qs from "qs";
import { Route, RawLocation } from "vue-router";
@Component({
    components: {
        tMap
    }
})
export default class BIRealTimeTrack extends Vue {
    @Getter('user', { namespace: 'login' }) user?: User;
    @Prop() sbKeys!:any;
    tMap: any = null;
    tZoom: number = 12;

    sleepTime:number = 5*60*1000;//延迟时间
    maxTime:number = 0;//当前查询的最大时间
    loading: boolean = false;

    taskData:any={};//当天任务集合
    taskPoint:any=[];//任务点
    taskPointJSON:any=[];//任务点
    plane:any = null;//单个飞机实时点
    rotate:number = 0;//飞机旋转角度

    _timer:any = null;//计时器  画线
    _timer1:any = null;//计时器 查询数据
    _timer2:any = null;//计时器 无数据时查询数据
    interval:any = 1000;//飞行间隔时间 毫秒    

    PreviousFlowPoint:any = null;//上一个流量点
    sprayLine0:any=[];//喷洒轨迹（农药范围）
    sprayLine1:any=[];//喷洒轨迹（一像素的线）
    sprayLine2:any=[];//飞行轨迹（没有喷洒农药的轨迹线）
    sprayBreak:boolean = true;//喷洒是否中断
    flightBeltColor:string = "#ADFF2F"//行带颜色
    flightBeltOpacity:number = 0.3;//航道透明度
    flightBeltWidth:number = 45;//航带宽度 米
    trackColor:string = "#FFFF00";//航迹颜色
    noFlowColor:string = "#F40";//未喷洒农药时的轨迹颜色

    operaWidth: number = 0; //右侧作业数据区宽度
    operaBtnOpen: boolean = false; //右侧作业数据是否显示

    // 实时时间对应的数据
    nowtime:String = '----';
    nowspeed:String = '--';
    nowflow:String = '--';
    nowpressure:String = '--';//压强
    nowtemperature:String = '--';//温度
    sumflow:number = 0;
    nowheight:String = '--';
    sumtimeflow:number = 0;
    sumtime:number = 0;
    taskname:String = "";
    sumarea:number = 0;
    windSpeed:any = 0;//风速
    humidity:any = 0;//湿度
    //当前任务起降点
    takeoff:any = null;//起降点
    takeoffRange:any = 50;//起降点范围
    warn:any =null;
    warnInterval:any= 0;

    async created() {
        this.initWarn();
    }
    async mounted() {
        try{
            if (this.$refs.TMap) {
                let refT: any = this.$refs.TMap;
                this.tMap = refT.getMap();
                this.tMap.addEventListener("zoomend", this.zoomend);//地图缩放结束
            }
            this.initTask();
        }catch(err){
            this.loading = false;
            this.$notify.error("出错了！")
        }
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
            for(var i=0;i<values.length;i++){
                let vl = values[i];
                this.taskData[vl.sid]= vl;
            }
        }
    }
    /**
     * 点击单个飞机
     */
    ariClick(keys:any){
        // let keys = data.target.key.split("_");//v.taskid+"_"+v.sbid+"_"+v.offline+"_"+v.sbtype;
        let tkid = keys[0];
        let sbid = keys[1];
        let offline = keys[2];
        let sbtype = keys[3];
        let task = this.taskData[tkid];
        if(offline =='1'){
            return;
        }
        this.clearCover();
        this.loading = true;
        if(task){
            this.taskname = task.taskname;
            this.flightBeltWidth = task.widcloth;
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
        }
        if(sbtype=='0'){
            this.maxTime = parseInt(((this.maxTime - this.sleepTime)/1000)+"");
        }else{
            this.maxTime = this.maxTime -5000;
        }
        this.getPointList(sbid,true,sbtype)
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
        //画面跟随
        this.tMap.panTo(new T.LngLat(data.longitude, data.latitude));
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
        this.plane=null;
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
    get sumareaFixed(){
        return this.sumarea.toFixed(3)
    }
    @Watch("sbKeys")
    sbChange() { 
        this.clearCover();
        let keys = this.sbKeys.split("_");
        this.ariClick(keys);
    }
}
</script>
<style scoped lang="scss" >
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
    background-image: url(../../../assets/air-super/box.png);
    background-size:100% 100%;
    box-sizing: border-box;   
    color: #f9f9f9;
}
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
    background-image: url(../../../assets/air-super/box.png);
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
    background-image: url(../../../assets/air-super/box.png);
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
</style>