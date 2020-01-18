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
                                                        <span>当前高度</span>
                                                    </div>
                                                    <div class="time">
                                                        {{nowheight}}km
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
                                                        <span>当前流量</span>
                                                    </div>
                                                    <div class="time">
                                                        {{nowflow}}m3/h
                                                    </div>
                                                </div>
                                            </el-col>
                                            <el-col :span="12">
                                                <div class="speed-content">
                                                    <div class="sp-title nowtime-header">
                                                        <span>累计流量</span>
                                                    </div>
                                                    <div class="time">
                                                        {{sumflow}}m3/h
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
                                                        <span>已飞行时长</span>
                                                    </div>
                                                    <div class="time">
                                                        {{sumtime}}/s
                                                    </div>
                                                </div>
                                            </el-col>
                                            <el-col :span="12">
                                                <div class="speed-content">
                                                    <div class="sp-title nowtime-header">
                                                        <span>已喷洒时长</span>
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
                                            喷洒面积
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
import echarts from 'echarts'; 
import { tmpdir } from 'os';
@Component({
    components: {
        tMap,
        bMap
    }
})
export default class RealTimeTrack extends Vue {
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
    @Provide() plane:any = null;//单个飞机实时点
    @Provide() rotate:number = 0;//飞机旋转角度

    @Provide() _timer:any = null;//计时器  画线
    @Provide() _timer1:any = null;//计时器 查询数据
    @Provide() interval:any = 1000;//飞行间隔时间 毫秒    
    @Provide() isFollow:boolean = true;//画面跟随


    @Provide() sprayLine0:any=[];//喷洒轨迹（农药范围）
    @Provide() sprayLine1:any=[];//喷洒轨迹（一像素的线）
    @Provide() sprayLine2:any=[];//飞行轨迹（没有喷洒农药的轨迹线）
    @Provide() sprayBreak:boolean = true;//喷洒是否中断
    @Provide() flightBeltColor:string = "#ADFF2F"//行带颜色
    @Provide() flightBeltOpacity:number = 0.3;//航道透明度
    @Provide() flightBeltWidth:number = 45;//航带宽度 米
    @Provide() trackColor:string = "#FFFF00";//航迹颜色
    @Provide() noFlowColor:string = "#F40";//未喷洒农药时的轨迹颜色

    @Provide() speedChart:any = null;//速度仪表盘对象
    @Provide() speedChartOption:any = null;//速度数据

    @Provide() pressureChart:any = null;//压强仪表盘对象
    @Provide() pressureChartOption:any = null;//压强仪表盘对象

    @Provide() flowChart:any = null;//流量图对象
    @Provide() flowChartOption:any = null;
    @Provide() flowChartData:any = [];//数据

    @Provide() heightChart:any = null;//高度图对象
    @Provide() heightChartOption:any = null;//
    @Provide() heightChartData:any = [];//数据

    @Provide() operaWidth: number = 0; //右侧作业数据区宽度
    @Provide() operaBtnOpen: boolean = false; //右侧作业数据是否显示

    @Provide() rightState:Boolean = true; //右侧显示内容状态判断
    @Provide() newTaskList:any = []; //当天任务集合
    
    // 实时时间对应的数据
    @Provide() nowtime:String = '----';
    @Provide() nowspeed:String = '--';
    @Provide() nowflow:String = '--';
    @Provide() sumflow:String = '';
    @Provide() nowheight:String = '--';
    @Provide() sumtimeflow:number = 0;
    @Provide() sumtime:number = 0;
    @Provide() taskname:String = "";
    sumarea:number = 0;

    created() {
        if (this.height) {
            this.style = "height:" + (this.height - 50) + "px";
        }     
    }
    async mounted() {
        try{
            //初始化图表参数
            // this.initOptions();
            if (this.$refs.TMap) {
                let refT: any = this.$refs.TMap;
                this.tMap = refT.getMap();
                this.tMap.addEventListener("zoomend", this.zoomend);//地图缩放结束
            }
            this.loading = !this.loading;
            this.airPoint=[];
            let t1 = new Date().getTime();
            await this.initTask();
            for(var k in this.taskData){
                await this.initOperDevice(this.taskData[k]);
            }
            let t2 = new Date().getTime();
            console.log("用时(S)："+(t2-t1)/1000)
            this.loading = !this.loading;
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
        let cont ="bgtime<='"+date+"' and edtime>='"+date+"'";
        qe.cont = cont;
        let cc = await tools.getBipInsAidInfo("TKMSG", 210, qe);
        if(cc.data.id ==0){
            let values = cc.data.data.data.values;
            this.newTaskList = cc.data.data.data.values;
            for(var i=0;i<values.length;i++){
                let vl = values[i];
                let tlid = await this.initNewTlid(vl.asid)
                vl.tlid = tlid;
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
        let tlid = "";
        let cc = await tools.getBipInsAidInfo("EQUI", 210, qe);
        if(cc.data.id ==0){
            let values = cc.data.data.data.values;
            if(values.length>=1){
                tlid = values[0].tlid;
            }
        }
        return tlid;
    }
    /**
     * 查询正在作业的设备
     */
    async initOperDevice(task:any){
        let tlid = task.tlid;
        let res = await tools.getServerTime();
        let time:number = res.data.data.data.time;
        this.maxTime = parseInt(''+(time - this.sleepTime)/1000);
        // this.maxTime = 1566597121;
        let oneCont =[];
        let allCont = [];
        let cont = "";
        let qCont = new QueryCont('time',(this.maxTime)+"", 2);
        qCont.setContrast(1);
        qCont.setLink(1);
        oneCont.push(qCont);
        qCont = new QueryCont('number',tlid, 12);
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
        let cc = await tools.getBipInsAidInfo("GETRUNDEV", 300, qe);
        if(cc.data.id == 0){
            let values = cc.data.data.data.values;
            let vl = values[0];
            let time = vl.time;
            this.initAri(time,task)
        }
    }
    /**
     * 初始化飞机初始位置
     */
    async initAri(time:any,task:any){
        let number = task.tlid;
        let oneCont =[];
        let allCont = [];
        let cont = "";
        let qCont = new QueryCont('time',time, 12);
        qCont.setContrast(0);
        qCont.setLink(1);
        oneCont.push(qCont);
        qCont = new QueryCont('number',number, 12);
        qCont.setContrast(0);
        qCont.setLink(1);
        oneCont.push(qCont);
        if (oneCont.length != 0) {
            allCont.push(oneCont);
            cont = "~" + JSON.stringify(allCont);
        }
        let qe: QueryEntity = new QueryEntity("", "");
        qe.page.currPage = 1;
        qe.page.pageSize = 20;
        qe.cont = cont;
        let cc = await tools.getBipInsAidInfo("RUNDEVDATA", 210, qe);
        if(cc.data.id == 0){
            let values = cc.data.data.data.values;
            for(var i=0;i<values.length;i++){
                let v = values[i];
                let key = task.sid;
                let lnglat = Gps.bd09_To_gps84(v.gd_latitude,v.gd_longitude);
                let cc = lnglat[1]+","+lnglat[0]
                let poin = new T.LngLat(lnglat[1], lnglat[0]);
                this.airPoint.push(poin);
                TMapUt.markRealTimeAir(cc,this.tMap,key,this.ariClick)
            }
        }
        if(this.airPoint.length>0){
            let d1 = this.tMap.getViewport(this.airPoint);
            this.tMap.panTo(d1.center, d1.zoom);
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
        this.getPointList(task.tlid,true)
        this.tMap.setZoom(16)//设置地图放大级次

    }
    //获取实时数据
    async getPointList(key:any,frist:boolean){ 
        try{
            let oneCont =[];
            let allCont = [];
            let cont = "";
            let qCont = new QueryCont('time',(this.maxTime)+"", 2);
            qCont.setContrast(6);
            qCont.setLink(1);
            oneCont.push(qCont);
            qCont = new QueryCont('number',key, 12);
            qCont.setContrast(0);
            oneCont.push(qCont);
            if (oneCont.length != 0) {
                allCont.push(oneCont);
                cont = "~" + JSON.stringify(allCont);
            }
            let qe: QueryEntity = new QueryEntity("", "");
            qe.page.currPage = 1;
            qe.page.pageSize = 5;
            qe.cont = cont;
            let t1 = new Date().getTime();
            let cc = await tools.getBipInsAidInfo("RUNDEVDATA", 210, qe);
            let t2 = new Date().getTime();
            console.log("用时（S）"+(t2-t1)/1000)
            if(cc.data.id ==0 ){
                let values = cc.data.data.data.values;
                for(var i =0;i<values.length;i++){
                    let v = values[i];
                    this.maxTime = v.time;
                    let lnglat = Gps.bd09_To_gps84(v.gd_latitude,v.gd_longitude);
                    v.gd_latitude = lnglat[0];
                    v.gd_longitude = lnglat[1];
                    this.taskPoint.push(v);            
                }
            }
            if(frist){
                this.drawPointLine();
            }
            this.loading = false;
            this._timer1 = window.setTimeout(() => {
                this.getPointList(key,false)
            }, 3000);
        }catch(err){
            this.$notify.error("出错了！")
            this.loading = false;
        }
    }
    /**
     * 开始画作业记录
     */
    drawPointLine(){
        if(this.taskPoint.length==0){
            setTimeout(this.drawPointLine, 1000)
            return;
        }   
        let t1 = new Date().getTime();
        this.passOneNode(this.taskPoint[0]);
        if(this.taskPoint.length>1){
            this.loadPlane(this.taskPoint[0],this.taskPoint[1]);
        }else{
            this.loadPlane(this.taskPoint[0],this.taskPoint[0]);
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
           this.drawPointLine();
        }, t);
    }
    /**
     * 路线节点变化
     * lnglat:LngLat, index:Number, length:Number
     */
    passOneNode(data:any){
        if(this.isFollow){//画面跟随
            this.tMap.panTo(new T.LngLat(data.gd_longitude, data.gd_latitude));
        }
        if(data){
            let flow = data.speed;
            this.nowtime = TMapUt.dateFormat(data.time*1000,"yyyy-MM-dd HH:mm:ss")
            this.nowspeed = (data.gd_speed).toFixed(3);
            this.nowflow = data.speed;
            this.sumflow = (data.totalflow).toFixed(3);
            this.nowheight = data.gd_altitude;
            this.sumtime = this.sumtime+1;
            let lgt = new T.LngLat(data.gd_longitude, data.gd_latitude)
            if(flow>0){//有流量去划线
                this.sumtimeflow = this.sumtimeflow + 1;
                this.sumarea = (this.sumarea +  (this.flightBeltWidth  * data.speed /666.67));
                if(this.sprayBreak){//中断过需要从起一条线
                    let points = [];
                    let zoom = this.tMap.getZoom();
                    let cc = 256 * Math.pow(2, zoom) / 40075017 //换算一米转多少像素
                    let opts0 = {color:this.flightBeltColor,weight:cc*this.flightBeltWidth,opacity:this.flightBeltOpacity};
                    points.push(lgt);
                    var newLine0 = new T.Polyline(points,opts0);
                    this.tMap.addOverLay(newLine0);
                    this.sprayLine0.push(newLine0)

                    let opts1 = {color:this.trackColor,weight:1,opacity:1};
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
                if(this.sprayBreak && this.sprayLine2.length>0){
                    let line2 = this.sprayLine2[this.sprayLine2.length-1];
                    let points2 = line2.getLngLats();
                    points2.push(lgt);
                    line2.setLngLats(points2)
                }else{
                    let opts2 = {color:this.noFlowColor,weight:1,opacity:1};
                    let points = [];
                    points.push(lgt);
                    var newLine2 = new T.Polyline(points,opts2);
                    this.tMap.addOverLay(newLine2);     
                    this.sprayLine2.push(newLine2)
                }   
                this.sprayBreak = true;
            }
            let speed = data.gd_speed;
            // this.speedChartOption.series[0].data[0].value = data.gd_speed;
            // this.speedChart.setOption(this.speedChartOption, true);
            //压强暂时没有

            //高度
            let hData = {
                name:data.time,
                value:[data.time,data.gd_altitude],
            };
            if(this.heightChartData.length>=5){
                this.heightChartData.shift();
            }
            this.heightChartData.push(hData);
            // this.heightChart.setOption({
            //     series: [{
            //         data: this.heightChartData
            //     }]
            // });
            //流量
            let fData = {
                name:data.time,
                value:[data.time,data.speed],
            };
            if(this.flowChartData.length>=5){
                this.flowChartData.shift();
            }
            this.flowChartData.push(fData);
            // this.flowChart.setOption({
            //     series: [{
            //         data: this.flowChartData
            //     }]
            // });
        }
    }
    /**
     * 设置飞机
     */
    loadPlane(lnglat1:any,lnglat2:any) {
        let cc = lnglat1.gd_longitude + "," + lnglat1.gd_latitude
        if(!this.plane){
            this.plane = TMapUt.markRealTimeAir(cc,this.tMap,"",null)
        }else{
            this.plane.setLngLat(new T.LngLat(lnglat1.gd_longitude, lnglat1.gd_latitude))
        }
        let curPos = new T.LngLat(lnglat1.gd_longitude, lnglat1.gd_latitude)
        let targetPos = new T.LngLat(lnglat2.gd_longitude, lnglat2.gd_latitude)
        this.rotate =  TMapUt.setRotation(curPos,targetPos,this.tMap);
        if(this.rotate!=0&&this.rotate!=360&&this.rotate!=-90){
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
        this.tMap.clearOverLays();
    }
    /**
     * 刷新
     */
    async refresh(){
        try{
            this.rightState = true;
            this.clearCover();
            this.loading = true;
            this.plane = null;
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
            await this.initTask();
            for(var k in this.taskData){
                await this.initOperDevice(this.taskData[k]);
            }
            this.loading = false;
        }catch(err){
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
    /**
     * 初始化右侧图表
     */
    // initOptions(){
    //     this.speedChart = echarts.init(this.$refs.speedChart as HTMLCanvasElement); 
    //     this.speedChartOption  = { series: [{
    //         name: '飞行速度',
    //         type: 'gauge',
    //         axisLine: {
    //             lineStyle: {
    //                 width: 8 // 这个是修改宽度的属性
    //             }
    //         },splitLine:{
    //             length:12
    //         },
    //         pointer:{
    //             width:4
    //         },
    //         max: 220,
    //         detail: {formatter:'{value}km/h',fontSize:12},
    //         data: [{value: 0, name: '速度'}]}]};
    //     this.speedChart.setOption(this.speedChartOption);  

    //     this.pressureChart = echarts.init(this.$refs.pressureChart as HTMLCanvasElement); 
    //     this.pressureChartOption  = { series: [{
    //         name: '喷雾压强',
    //         type: 'gauge', 
    //        axisLine: {
    //             lineStyle: {
    //                 width: 8 // 这个是修改宽度的属性
    //             }
    //         },splitLine:{
    //             length:12
    //         },
    //         pointer:{
    //             width:4
    //         },
    //         detail: {formatter:'{value}Kpa',fontSize:12},
    //         data: [{value: 0, name: 'Kpa'}]}]};
    //     this.pressureChart.setOption(this.pressureChartOption);  

    //     let datanow = new Date();

    //     this.heightChart = echarts.init(this.$refs.heightChart as HTMLCanvasElement); 
    //     this.heightChartOption = {
    //         title: {
    //             text: '海拔高度'
    //         },
    //         xAxis: {
    //             type: 'time',
    //             splitLine: {
    //                 show: false
    //             }
    //         },
    //         yAxis: {
    //             type: 'value',
    //             boundaryGap: [0, '100%'],
    //             splitLine: {
    //                 show: false
    //             }
    //         },
    //         series: [{
    //             name: '模拟数据',
    //             type: 'line',
    //             showSymbol: false,
    //             hoverAnimation: false,
    //             data: [{
    //                 name:datanow,
    //                 value:[
    //                     datanow,
    //                     0
    //                 ]}
    //             ]
    //         }]
    //     };
    //     this.heightChart.setOption(this.heightChartOption);  

    //     this.flowChart = echarts.init(this.$refs.flowChart as HTMLCanvasElement); 
    //     this.flowChartOption= {
    //         title: {
    //             text: '瞬时流量'
    //         },
    //         xAxis: {
    //             type: 'time',
    //             splitLine: {
    //                 show: false
    //             }
    //         },
    //         yAxis: {
    //             type: 'value',
    //             boundaryGap: [0, '100%'],
    //             splitLine: {
    //                 show: false
    //             }
    //         },
    //         series: [{
    //             name: '模拟数据',
    //             type: 'line',
    //             showSymbol: false,
    //             hoverAnimation: false,
    //             data: [{
    //                 name:datanow,
    //                 value:[
    //                     datanow,
    //                     0
    //                 ]}
    //             ]
    //         }]
    //     };
    //     this.flowChart.setOption(this.flowChartOption);  
    // }
    mapChnage() {
        console.log("地图切换！");
    }
    @Watch("height")
    heightChange() {
        this.style = "height:" + (this.height - 50) + "px";
    }
    get sumareaFixed(){
        return this.sumarea.toFixed(3)
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
</style>
<style lang="scss" >
.myOperatingAreaCheck {
    font-size: 0px !important;
    .el-checkbox__label {
        font-size: 0px !important;
    }
}
</style>