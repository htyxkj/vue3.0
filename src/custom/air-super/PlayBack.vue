<template>
    <div v-loading="loading">
        <el-tabs
            v-model="selMap"
            type="card"
            @tab-click="mapChnage"
            style="min-height: -webkit-fill-available"
        >
            <el-tab-pane :style="style" label="天地图" name="tianMap">
                <el-container class="padding0" :style="style">
                    <el-container class="padding0 mapMain">
                        <!-- 左侧显示区域 -->
                        <el-aside :width="areaWidth+'px'">
                            <div class="taskdata">
                                <div class="taskdata-cont">
                                    <vxe-table
                                        border
                                        size="mini"
                                        :height="style1"
                                        ref="xTable1"
                                        @select-change="selectChangeEvent"
                                        :data="currentPageData">
                                        <vxe-table-column type="checkbox" width="30"></vxe-table-column>
                                        <vxe-table-column field="speedtime1" title="时间" width="90"></vxe-table-column>
                                        <vxe-table-column field="speed" title="速度" width="60"></vxe-table-column>
                                        <vxe-table-column field="height" title="高度" width="60"></vxe-table-column>
                                        <vxe-table-column field="flow" title="流量"  width="60"></vxe-table-column>
                                        <vxe-table-column field="sumfolw" title="累计流量" width="80" ></vxe-table-column>
                                    </vxe-table>
                                </div>
                                <div class="page-turn">
                                    <el-row >
                                        <el-col :span="4" :offset="1"><i class="el-icon-d-arrow-left" @click="firstPage"></i></el-col>
                                        <el-col :span="4"><i class="el-icon-arrow-left" @click="prevPage"></i></el-col>
                                        <el-col :span="6">共{{taskData.length}}条</el-col>
                                        <el-col :span="4"><i class="el-icon-arrow-right" @click="nextPage"></i></el-col>
                                        <el-col :span="4"><i class="el-icon-d-arrow-right" @click="lastPage"></i></el-col>
                                    </el-row>  
                                </div>
                            </div>
                        </el-aside>
                        <el-main class="padding0" style="overflow: hidden;position: relative;">
                            <div class="nav-tools">
                                <!-- 搜索 -->
                                 <el-tooltip class="item" effect="light" content="搜索任务" placement="top" >
                                      <el-button
                                            icon="el-icon-search"
                                            circle
                                            @click="showTaskTjCell =!showTaskTjCell"
                                        ></el-button>
                                </el-tooltip>
                               
                                <!-- 播放 -->
                                 <el-tooltip class="item" effect="light" content="开始播放" placement="top" >
                                     <el-button icon="el-icon-video-play" circle @click="start"></el-button>
                                </el-tooltip>
                                
                                <!-- 暂停 -->
                                <el-tooltip class="item" effect="light" content="暂停播放" placement="top" >
                                     <el-button icon="el-icon-video-pause" circle @click="stop"></el-button>
                                </el-tooltip>
                                
                                <!-- 快进 -->
                                <el-tooltip class="item" effect="light" :content="'播放快进'+forward+'倍'" placement="top" >
                                     <el-button icon="el-icon-d-arrow-right" circle @click="fastForward(forward++)"></el-button>
                                </el-tooltip>

                                 <!-- 清空 -->
                                <el-tooltip class="item" effect="light" content="轨迹清空" placement="top" >
                                     <el-button icon="el-icon-delete" circle @click="clearCover"></el-button>
                                </el-tooltip>

                                 <!-- 画面跟随 -->
                                 <span class="follow">
                                    <el-switch
                                        v-model="isFollow"
                                        active-color="#13ce66"
                                        inactive-color="#ff4949">
                                    </el-switch>
                                 </span>
                                
                                <!-- <el-tooltip class="item" effect="light" content="画面跟随" placement="top" >
                                     <el-button icon="el-icon-video-pause" circle @click="fastForward(forward++)"></el-button>
                                </el-tooltip> -->
                            </div>
                            <t-map ref="TMap" class="myTMap"></t-map>
                            <!-- 进度条 --> 
                            <progress-bar class="progress" offsetParent="body" width="80%" :pointNum="taskData.length>0?taskData.length:100" :percent="percent" @pbar-seek="seek"></progress-bar>
                            <a class="areaBtn" @click="areaBtnClick">
                                <template v-if="areaBtnOpen">
                                    <i class="iconfont icon-bip-up"></i>
                                </template>
                                <template v-else>
                                    <i class="iconfont icon-bip-next"></i>
                                </template>
                            </a>
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
                                <div class="nowtitle">
                                    <div class="nowtime-header">
                                        回放任务
                                    </div>
                                    <div class="nowtaskname">
                                        <p class="nowtaskname-p">{{taskname}}</p>   
                                    </div>
                                </div>
                               <div class="nowtime">
                                    <div class="nowtime-header">
                                        回放时间
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
                                                     <span>当前流量</span>
                                                 </div>
                                                 <div class="time">
                                                     {{nowflow}}m³/h
                                                 </div>
                                             </div>
                                        </el-col>
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
                                    <div class="speed-content">
                                            <div class="sp-title nowtime-header">
                                            <span> 喷洒面积</span>
                                            </div>
                                            <div class="time">
                                            {{sumareaFixed}}/亩
                                            </div>
                                        </div>
                                     <!-- <el-row>
                                        <el-col :span="12">
                                             <div class="speed-content">
                                                 <div class="sp-title ">
                                                     <span>喷洒里程</span>
                                                 </div>
                                                 <div class="time">
                                                     {{mileage}}/km
                                                 </div>
                                             </div>
                                        </el-col>
                                        <el-col :span="12">
                                            <div class="speed-content">
                                                <div class="sp-title nowtime-header">
                                                <span> 喷洒面积</span>
                                                </div>
                                                <div class="time">
                                                {{sumareaFixed}}/亩
                                                </div>
                                            </div>
                                        </el-col>
                                    </el-row> -->
                                </div>
                           </div>
                         
                            
                            
                            <!-- <el-row style="width:100%">
                                <el-col :span="12">
                                    <div ref="speedChart" style="height:200px;background-color:#ffffff;width:145px;"></div> 
                                </el-col>
                                <el-col :span="12">
                                    <div ref="pressureChart" style="height:200px;background-color:#ffffff;width:145px;"></div> 
                                </el-col>
                            </el-row>
                            <el-row style="width:100%">
                                <el-col :span="24">
                                    <div ref="flowChart" style="height:200px;background-color:#ffffff;width:290px;"></div> 
                                </el-col>
                            </el-row>
                            <el-row style="width:100%">
                                <el-col :span="24">
                                   <div ref="heightChart" style="height:200px;background-color:#ffffff;width:290px;"></div> 
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
        <el-dialog title="查找飞防任务" :close-on-click-modal="false" :visible.sync="showTaskTjCell" width="50%" class="bip-query">
            <el-row class="bip-lay">
                <el-form @submit.native.prevent label-position="right" label-width="100px">
                    <div v-for="(cel,index) in taskTjCell.ccells.cels" :key="'A'+index">
                        <bip-comm-editor
                            v-if="(cel.attr&0x400) <= 0 "
                            :cell="cel"
                            :bgrid="false"
                            :cds="taskTjCell"
                            :row="0"
                        />
                    </div>
                </el-form>
            </el-row>
            <span slot="footer" class="dialog-footer">
                <el-button @click="showTaskTjCell = false" size="mini">取 消</el-button>
                <el-button type="primary" @click="getOneTask" size="mini">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Watch } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from "vuex-class";
import QueryEntity from "@/classes/search/QueryEntity";
import QueryCont from "@/classes/search/QueryCont";
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi;
import { Cells } from "@/classes/pub/coob/Cells";
import CDataSet from "@/classes/pub/CDataSet";
import tMap from "@/components/map/MyTianMap.vue";
import bMap from "@/components/map/MyBaiMap.vue";
import ProgressBar from "@/components/progressBar/ProgressBar.vue"
import { T } from "@/components/map/js/TMap";
import { TMapUtils } from "./class/TMapUtils";
let TMapUt = TMapUtils.TMapUt;
import { GPSUtil } from "./class/GPSUtil";
let Gps = GPSUtil.GPS;
import echarts from 'echarts'; 
@Component({
    components: {
        tMap,
        bMap,
        ProgressBar
    }
})
export default class OperatingArea extends Vue {
    @State("bipComHeight", { namespace: "login" }) height!: number;
    @Provide() style: string =
        "height:" + (this.height ? this.height - 50 : "400") + "px";
    @Provide() style1: string = ""+ (this.height ? this.height - 85 : "400");
    @Provide() selMap: string = "tianMap";
    @Provide() tMap: any = null;
    @Provide() tZoom: number = 12;
    @Provide() areaWidth: number = 0; //测边行政区宽度
    @Provide() areaBtnOpen: boolean = false; //左侧区域是否显示

    @Provide() loading: boolean = false;
    @Provide() showTaskTjCell: boolean = false; //是否显示查询对象弹出框
    @Provide() taskTjCell: CDataSet = new CDataSet(""); //飞防任务对象(查询条件)
    @Provide() taskTrack:any = null;//轨迹对象
    @Provide() taskData:any=[];//任务数据集
    @Provide() isFollow:boolean = true;//画面跟随
    @Provide() sprayLine0:any=[];//喷洒轨迹（农药范围）
    @Provide() sprayLine1:any=[];//喷洒轨迹（一像素的线）
    @Provide() sprayBreak:boolean = true;//喷洒是否中断
    @Provide() flightBeltColor:string = "#ADFF2F"//行带颜色
    @Provide() flightBeltOpacity:number = 0.3;//航道透明度
    @Provide() flightBeltWidth:number = 0;//航带宽度 米
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

    @Provide() interval:number = 1000;//数据上报间隔

    @Provide() forward:number = 1;//快进倍数


    @Provide() operaWidth: number = 0; //右侧作业区宽度
    @Provide() operaBtnOpen: boolean = false; //右侧作业区是否显示
 

    // 回放时间对应的数据
    @Provide() nowtime:String = '----';
    @Provide() nowspeed:Number = 0;
    @Provide() nowflow:String = '0';
    @Provide() sumflow:String = '0';
    @Provide() nowheight:String = '0';
    @Provide() sumtimeflow:number = 0;
    @Provide() sumtime:number = 0;
    @Provide() taskname:String = "";
    @Provide() sumarea:number = 0;
    @Provide() mileage:number = 0;//喷洒里程
    @Provide() haveFlow:any=[];//有流量的节点

     // 前端分页显示数据
    @Provide() totalPage:number= 1; // 统共页数，默认为1
    @Provide() currentPage:number= 1     //前页数 ，默认为1
    @Provide() pageSize:number= 100; // 每页显示数量
    @Provide() currentPageData:any =[]; //当前页显示内容
    @Provide() lngLatList:any = []; //选中点集合

    @Provide() percent:any = 0;//进度条当前百分比
    @Provide() dragPoints:number =0;

    @Provide() warn:any={};//飞行预警参数

    //起降点信息
    @Provide() takeoff:any = null;//起降点
    @Provide() takeoffRange:any = 50;//起降点范围

    async created() {
        if (this.height) {
            this.style = "height:" + (this.height - 50) + "px";
            this.style1 = ""+ (this.height - 80);
        }
        this.taskTjCell = await TMapUt.getCell("B07ATJ");
        this.taskTjCell.createRecord();
    }
    mounted() {
        if (this.$refs.TMap) {
            let refT: any = this.$refs.TMap;
            this.tMap = refT.getMap();
            this.tMap.addEventListener("zoomend", this.zoomend);//地图缩放结束
        }
        this.initWarn();
        //初始化图表参数
        // this.initOptions();
    }
   
    mapChnage() {
        console.log("地图切换！");
    }
    //清空地图覆盖物
    clearCover() {
        this.sprayBreak = true;
        this.stop()
        if(this.taskTrack){
            this.taskTrack.clear();
        }
        this.taskTrack = null;
        this.sprayLine0=[];//喷洒轨迹（农药范围）
        this.sprayLine1=[];//喷洒轨迹（一像素的线）
        this.dragPoints = 0;
        this.percent = 0;
        this.tMap.clearOverLays();
    }
    //左侧行政区开关
    async areaBtnClick() {
        this.areaBtnOpen = !this.areaBtnOpen;
        if (this.areaBtnOpen) {
            //进行打开左侧行政区
            while (this.areaWidth <= 400) {
                this.areaWidth++;
            }
        } else {
            //关闭左侧行政区
            while (this.areaWidth > 0) {
                this.areaWidth--;
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

    /**
     * 查找飞防轨迹信息
     */
    async getOneTask() {
        if(this.taskTrack != null){
            this.taskTrack.clear();
            this.taskTrack = null;
        }
        try {
            let bok = TMapUt.checkNotNull(this.taskTjCell);
            if(bok.length>1){
                this.$notify.warning(bok);
                return;
            }
            this.clearCover();
            this.taskname = this.taskTjCell.currRecord.data.taskname; 
            this.flightBeltWidth = this.taskTjCell.currRecord.data.widcloth;
            if(!this.flightBeltWidth)
                this.flightBeltWidth=45;
            let oaid = this.taskTjCell.currRecord.data.oaid;  //作业区
            let hoaid = this.taskTjCell.currRecord.data.hoaid;//航空识别区
            let route = this.taskTjCell.currRecord.data.route;//路线
            let showarea = this.taskTjCell.currRecord.data.showarea;//显示作业区
            let showhkarea = this.taskTjCell.currRecord.data.showhkarea;//显示识别区
            let showroot = this.taskTjCell.currRecord.data.showhkarea;//显示航线
            let takeoff = this.taskTjCell.currRecord.data.takeoff;//起降点信息
            this.initTakeoff(takeoff);

            if(showarea == 1){
                 TMapUt.getOpera(oaid,this.tMap);//作业区
                 TMapUt.getOperaBr(oaid,this.tMap);//避让区
            }
            if(showhkarea ==1){
                 TMapUt.getOpera(hoaid,this.tMap);//航空识别区
            }
           if(showroot == 1){
                TMapUt.getOperaRoute(oaid,this.tMap);
                if(route){
                    TMapUt.makeRoute(route,"",this.tMap)//路线
                }
           }
            let qe: QueryEntity = new QueryEntity("", "");
            qe.page.currPage = 1;
            qe.page.pageSize = 50000;
            let tkid = this.taskTjCell.currRecord.data.sid;
            let bgtime = this.taskTjCell.currRecord.data.bgtime;
            let edtime = this.taskTjCell.currRecord.data.edtime;
            let cont =" tkid ='" +tkid +"' and " +"speedtime >=" +"'" +bgtime +"'" +" and " +"speedtime<=" + "'" +edtime +"'";
            qe.cont = cont;
            this.loading = !this.loading;
            this.showTaskTjCell = false;
            let t1 = new Date().getTime();
            let cc = await tools.getBipInsAidInfo("CORRD", 210, qe);
            let t2 = new Date().getTime();
            console.log("用时（秒）" + (t2 - t1) / 1000);
            if (cc.data.id == 0) {
                let values = cc.data.data.data.values;
                this.taskData = values;
                let opt:any = {interval: this.interval,dynamicLine: true,
                                polylinestyle: {color:this.noFlowColor, weight: 1, opacity: 0.9},Datas: [],
                                carstyle:{display:true, iconUrl:require('@/assets/air-super/plane.png'), width:42, height:30},
                                passOneNode:this.passOneNode}
                let noFlow  = true;
                this.haveFlow =[];
                for(var i=0;i<values.length;i++){
                    let v = values[i];
                    let lnglat = Gps.bd09_To_gps84(v.latitude,v.longitude);
                    let poin = new T.LngLat(lnglat[1],lnglat[0]);
                    this.taskData[i].latitude = lnglat[0];
                    this.taskData[i].longitude = lnglat[1];
                    opt.Datas.push(poin);
                    if(v.flow>0){
                        if(noFlow){
                            v.cid = i;
                            this.haveFlow.push(v);
                        }
                        noFlow = false;
                    }else{
                        noFlow = true;
                    }
                }
                 // 前端分页
                this.totalPage = Math.ceil(this.taskData.length / this.pageSize);
                // // 计算得0时设置为1
                this.totalPage = this.totalPage == 0 ? 1 : this.totalPage;
                this.getCurrentPageData();

                this.taskTrack = new T.CarTrack(this.tMap,opt);
                this.taskTrack.start();
                this.tMap.setZoom(15)
                // this.operaBtnOpen = false;
                // this.operaBtnClick();
               
            }
            this.loading = !this.loading;
        } catch (error) {
            console.log("查询回放记录出错！")
            this.loading = !this.loading;
        }
    }
    /**
     * 路线节点变化
     * lnglat:LngLat, index:Number, length:Number
     */
    passOneNode(LngLat:any,index:any,length:any){
        this.loading = false;
        if(this.isFollow){//画面跟随
            this.tMap.panTo(LngLat);
        }
        let data = this.taskData[this.dragPoints+index-1];
        this.percent = (index+this.dragPoints)/this.taskData.length *100;
        if(data){
            this.nowtime = data.speedtime;
            this.nowspeed = data.speed; 
            this.nowflow = data.flow;
            this.nowheight = data.height;
            this.sumtime = this.sumtime + 1;
            let flow = data.flow
            if(this.takeoff){
                let jl = this.tMap.getDistance(this.takeoff,LngLat);
                if(jl<=this.takeoffRange){
                    this.sumflow='0';
                    this.sumarea = 0;
                }
            }
            this.sumflow = ((parseFloat(this.sumflow+'') + parseFloat((parseFloat(this.nowflow+'')/60/60)+'')).toFixed(3))+'';
            
            if(flow>0){//有流量去划线
                // 有流量的点喷洒时长+1s
                this.sumtimeflow = this.sumtimeflow + 1;
                this.mileage = this.mileage+data.speed /3600
                this.mileage = parseFloat(this.mileage.toFixed(4))
                this.sumarea = (this.sumarea +  (this.flightBeltWidth  * data.speed *1000/3600 /666.67));
                let lgt = new T.LngLat(data.longitude, data.latitude)
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
                
                let msg = "";
                //预警信息
                if(flow>this.warn.maxflow){//流量异常
                    msg = "瞬时流量异常("+flow+"),超出预警值("+this.warn.maxflow+")<br/>"
                }
                if(data.speed>this.warn.maxspeed){//速度异常
                    msg += "飞行速度异常("+data.speed+"),超出预警值("+this.warn.maxspeed+")<br/>"
                }
                if(msg != ""){
                    //创建图片对象
                    var icon = new T.Icon({
                        iconUrl: require('@/assets/air-super/avoid.png'),
                        iconSize: new T.Point(20, 20),
                        iconAnchor:new T.Point(10, 20),
                    });
                    //向地图上添加自定义标注
                    var marker = new T.Marker(LngLat, {icon: icon});
                    var markerInfoWin = new T.InfoWindow(msg);
                    marker.addEventListener("click", function () {
                        marker.openInfoWindow(markerInfoWin);
                    });// 将标注添加到地图中
                    this.tMap.addOverLay(marker)
                }
            }else{
                this.sprayBreak = true;
            }
          
            let speed = data.speed;
            

            // this.speedChartOption.series[0].data[0].value = speed;
            // this.speedChart.setOption(this.speedChartOption, true);
            //压强暂时没有

            //高度
            // let hData = {
            //     name:data.speedtime1,
            //     value:[data.speedtime,data.height],
            // };
            // if(this.heightChartData.length>=5){
            //     this.heightChartData.shift();
            // }
            // this.heightChartData.push(hData);
            // this.heightChart.setOption({
            //     series: [{
            //         data: this.heightChartData
            //     }]
            // });
            // //流量
            // let fData = {
            //     name:data.speedtime1,
            //     value:[data.speedtime,data.flow],
            // };
            // if(this.flowChartData.length>=5){
            //     this.flowChartData.shift();
            // }
            // this.flowChartData.push(fData);
            // this.flowChart.setOption({
            //     series: [{
            //         data: this.flowChartData
            //     }]
            // });
        }
        // this.taskData[index-1] = null;
        if(index >= length){//最后一点
            this.taskTrack.pause()
        }
    }
    /**
     * 地图缩放结束
     */
    zoomend(){
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
    //开始
    start(){
        if( this.taskTrack)
            this.taskTrack.start()
    }
    //暂停
    stop(){
        if( this.taskTrack)
            this.taskTrack.pause()
    }
    //快进
    fastForward(forward:number){
        if(this.taskTrack){
            if(forward >=5){
                this.forward =1;
                forward =1
            }
            let interval = this.interval/forward;
            this.taskTrack.options.interval= interval
            this.stop();
            this.start();
        }
    }
    /**
     * 页面关闭后
     */
    beforeDestroy(){
        if(this.taskTrack){
            this.taskTrack.clear()
        }
    }

     // 获取当前页数对应的数据
    getCurrentPageData() {
        let begin = (this.currentPage - 1) * this.pageSize;
        let end = this.currentPage * this.pageSize;
        this.currentPageData = this.taskData.slice(
            begin,
            end
        );
     }
     //上一页
    prevPage() {
        if (this.currentPage == 1) {
            return false;
        } else {
            this.currentPage--;
            this.getCurrentPageData();
        }
    }
    //首页
    firstPage() {
        this.currentPage = 1;
        this.getCurrentPageData();  
    }
    // 下一页
    nextPage() {
        if (this.currentPage == this.totalPage) {
            return false;
        } else {
            this.currentPage++;
            this.getCurrentPageData();
        }
    }
    //末页
    lastPage() {
        this.currentPage = this.totalPage;
        this.getCurrentPageData();  
    }
    // 页面勾选数据点
    selectChangeEvent ({ checked, row }:any) {
        if(checked ){
            let lngLat = row.longitude +","+ row.latitude;
            let lngLat_bak= TMapUt.markpoint1(lngLat,this.tMap);
            let lngObject = {item:row.speedtime,values:lngLat_bak};
            this.lngLatList.push(lngObject)
        }else {
            let that = this;
            this.lngLatList.forEach( function(item:any){
                if(item.item == row.speedtime){
                      that.tMap.removeOverLay(item.values);
                }
             })
        }
    }
    //点击进度条
    seek(percent1:any){  
        try{
            if(this.taskData.length<=0){
                return;
            }
            this.loading = true;
            this.sumtimeflow = 0;
            this.sumtime = 0;
            this.sumarea = 0
            this.sumflow ='0';
            this.forward=1;
            this.mileage =0;
            this.clearCover()
            let begin = parseInt((this.taskData.length*percent1/100)+"")
            this.dragPoints = begin;
            let values:any = this.taskData.slice(begin,this.taskData.length-1);
            let opt:any = {interval: this.interval,dynamicLine: true,
                                    polylinestyle: {color:this.noFlowColor, weight: 1, opacity: 0.9},Datas: [],
                                    carstyle:{display:true, iconUrl:require('@/assets/air-super/plane.png'), width:42, height:30},
                                    passOneNode:this.passOneNode}
            for(var i=0;i<values.length;i++){
                let v = values[i];
                // let lnglat = Gps.bd09_To_gps84(v.latitude,v.longitude);
                // let poin = new T.LngLat(lnglat[1],lnglat[0]); 
                let poin = new T.LngLat(v.longitude,v.latitude); 
                opt.Datas.push(poin);
            } 
            this.taskTrack = new T.CarTrack(this.tMap,opt);
            this.taskTrack.start();
            
            if(this.takeoff){
                var icon = new T.Icon({
                    iconUrl: require('@/assets/air-super/lift.png'), 
                    iconSize: new T.Point(70, 70),
                    iconAnchor:new T.Point(35,70),
                });
                //向地图上添加自定义标注
                var marker = new T.Marker(this.takeoff,{icon: icon});
                this.tMap.addOverLay(marker);
            }
        }catch(err){
            console.log(err)
        }
    }
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
            console.log(this.warn);
        }
    }
    /**
     * 初始化起降点信息
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
    /**
     * 初始化右侧图表
     */
    initOptions(){
        this.speedChart = echarts.init(this.$refs.speedChart as HTMLCanvasElement); 
        this.speedChartOption  = { series: [{
            name: '飞行速度',
            type: 'gauge',
            axisLine: {
                lineStyle: {
                    width: 8 // 这个是修改宽度的属性
                }
            },splitLine:{
                length:12
            },
            pointer:{
                width:4
            },
            max: 220,
            detail: {formatter:'{value}km/h',fontSize:12},
            data: [{value: 0, name: '速度'}]}]};
        this.speedChart.setOption(this.speedChartOption);  

        this.pressureChart = echarts.init(this.$refs.pressureChart as HTMLCanvasElement); 
        this.pressureChartOption  = { series: [{
            name: '喷雾压强',
            type: 'gauge', 
           axisLine: {
                lineStyle: {
                    width: 8 // 这个是修改宽度的属性
                }
            },splitLine:{
                length:12
            },
            pointer:{
                width:4
            },
            detail: {formatter:'{value}Kpa',fontSize:12},
            data: [{value: 0, name: 'Kpa'}]}]};
        this.pressureChart.setOption(this.pressureChartOption);  

        let datanow = new Date();

        this.heightChart = echarts.init(this.$refs.heightChart as HTMLCanvasElement); 
        this.heightChartOption = {
            title: {
                text: '海拔高度'
            },
            xAxis: {
                type: 'time',
                splitLine: {
                    show: false
                }
            },
            yAxis: {
                type: 'value',
                boundaryGap: [0, '100%'],
                nameTextStyle:{
                    color:'#f9f9f9'
                },
                splitLine: {
                    show: false
                }
            },
            series: [{
                name: '模拟数据',
                type: 'line',
                showSymbol: false,
                hoverAnimation: false,
                data: [{
                    name:datanow,
                    value:[
                        datanow,
                        0
                    ]}
                ]
            }]
        };
        this.heightChart.setOption(this.heightChartOption);  

        this.flowChart = echarts.init(this.$refs.flowChart as HTMLCanvasElement); 
        this.flowChartOption= {
            title: {
                text: '瞬时流量'
            },
            xAxis: {
                type: 'time',
                splitLine: {
                    show: false
                }
            },
            yAxis: {
                type: 'value',
                boundaryGap: [0, '100%'],
                splitLine: {
                    show: false
                }
            },
            series: [{
                name: '模拟数据',
                type: 'line',
                showSymbol: false,
                hoverAnimation: false,
                data: [{
                    name:datanow,
                    value:[
                        datanow,
                        0
                    ]}
                ]
            }]
        };
        this.flowChart.setOption(this.flowChartOption);  
    }
    @Watch("height")
    heightChange() {
        this.style = "height:" + (this.height - 50) + "px";
        this.style1 = "" + (this.height - 85) ;
    }

    get sumareaFixed(){
        return this.sumarea.toFixed(3)
    }
}
</script>
<style scoped lang="scss" >
.progress{
    position: absolute;
    bottom: 1rem;
    left: 6rem;
    z-index: 999;
}
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
// .taskdata-cont{
//     height: 400px;
//     width: 100%;
//     overflow: auto;
//     overflow-x: hidden;
//     // height: calc(100%-30px) !important;
// }
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
.follow {
    margin-left: 15px;
    color: #20A0ff;
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
</style>
<style lang="scss" >
.myOperatingAreaCheck {
    font-size: 0px !important;
    .el-checkbox__label {
        font-size: 0px !important;
    }
}
</style>