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
                        <el-main class="padding0" style="overflow: hidden;position: relative;">
                            <div class="nav-tools">
                                <!-- 搜索 -->
                                <el-button icon="el-icon-search" circle @click="showTaskTjCell =!showTaskTjCell"></el-button>
                                <!-- 播放 -->
                                <el-button icon="el-icon-video-play" circle @click="start"></el-button>
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
                            <el-row style="width:100%">
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
                            </el-row>
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
import echarts from 'echarts'; 
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

    @Provide() scmDevice:any = {};
    @Provide() _timer:any = null;//计时器  画线
    @Provide() _timer1:any = null;//计时器 查询数据
    @Provide() interval:any = 1000;//飞行间隔时间 毫秒




    @Provide() taskTrack:any = null;//轨迹对象
    @Provide() taskData:any=[];//任务数据集
    @Provide() isFollow:boolean = true;//画面跟随
    @Provide() sprayLine0:any=[];//喷洒轨迹（农药范围）
    @Provide() sprayLine1:any=[];//喷洒轨迹（一像素的线）
    @Provide() sprayBreak:boolean = true;//喷洒是否中断
    @Provide() flightBeltColor:string = "#382518"//行带颜色
    @Provide() flightBeltOpacity:number = 0.5;//航道透明度
    @Provide() flightBeltWidth:number = 45;//航带宽度 米
    @Provide() trackColor:string = "#CEFF00";//航迹颜色
    @Provide() noFlowColor:string = "#C00000";//未喷洒农药时的轨迹颜色

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


    @Provide() forward:number = 1;//快进倍数


    @Provide() operaWidth: number = 0; //右侧作业区宽度
    @Provide() operaBtnOpen: boolean = false; //右侧作业区是否显示
 
    @Provide() tableData: any = null;

     // 前端分页显示数据
    @Provide() totalPage:number= 1; // 统共页数，默认为1
    @Provide() currentPage:number= 1     //前页数 ，默认为1
    @Provide() pageSize:number= 100; // 每页显示数量
    @Provide() currentPageData:any =[] //当前页显示内容
    created() {
        if (this.height) {
            this.style = "height:" + (this.height - 50) + "px";
        }     
    }
    async mounted() {
        this.loading = !this.loading;
        await this.initScmDevice();
        this.initOperDevice();
        if (this.$refs.TMap) {
            let refT: any = this.$refs.TMap;
            this.tMap = refT.getMap();
            this.tMap.addEventListener("zoomend", this.zoomend);//地图缩放结束
        }
        //初始化图表参数
        this.initOptions();
    }
    /**
     * 查询正在今天的任务
     */
    async initTask(){
        let res = await tools.getServerTime();
        let time:number = res.data.data.data.time;
        let qe: QueryEntity = new QueryEntity("", "");
        qe.page.currPage = 1;
        qe.page.pageSize = 50000;
        let cont ="bgtime,edtime";
        qe.cont = cont;
        let t1 = new Date().getTime();
        let cc = await tools.getBipInsAidInfo("TKMSG", 210, qe);
        if(cc.data.id ==0){
            let values = cc.data.data.data.values;
            for(var i=0;i<values.length;i++){
                let v = values[i];
                this.scmDevice[v.id] = v;
            }
             
        }
    }
    /**
     * 初始化公司设备
     */
    async initScmDevice(){
        if(this.user){
            let cmcCode = this.user.deptInfo.cmcCode
            let k = cmcCode+"scmDevice";
            let dev = window.sessionStorage.getItem(k);
            if(dev){
                this.scmDevice = JSON.parse(dev);
                return;
            }
            let qe: QueryEntity = new QueryEntity("", "");
            qe.page.currPage = 1;
            qe.page.pageSize = 50000;
            let cont =" scm like '"+cmcCode+"%' ";
            qe.cont = cont;
            let t1 = new Date().getTime();
            let cc = await tools.getBipInsAidInfo("GETSCMTER", 210, qe);
            if(cc.data.id ==0){
                let values = cc.data.data.data.values;
                for(var i=0;i<values.length;i++){
                    let v = values[i];
                    this.scmDevice[v.id] = v;
                }
                if(values.length>0){
                    window.sessionStorage.setItem(k,JSON.stringify(this.scmDevice));
                }
            }
        }
    }
    /**
     * 查询正在作业的设备
     */
    async initOperDevice(){
        let devID = "";
        for(var k in  this.scmDevice){
            devID += k+";"
        }
        devID = devID.substring(0,devID.length-1);
        let res = await tools.getServerTime();
        let time:number = res.data.data.data.time;
        this.maxTime = time = this.sleepTime;
        let oneCont =[];
        let allCont = [];
        let cont = "";
        // let qCont = new QueryCont('time',(this.maxTime)+"", 2);
        let qCont = new QueryCont('time',(1557017484)+"", 2);
        qCont.setContrast(1);
        qCont.setLink(1);
        oneCont.push(qCont);
        qCont = new QueryCont('number',devID, 12);
        qCont.setContrast(5);
        oneCont.push(qCont);
        if (oneCont.length != 0) {
            allCont.push(oneCont);
            cont = "~" + JSON.stringify(allCont);
        }
        let qe: QueryEntity = new QueryEntity("", "");
        qe.page.currPage = 1;
        qe.page.pageSize = 50000;
        qe.cont = cont;
        let t1 = new Date().getTime();
        let cc = await tools.getBipInsAidInfo("GETRUNDEV", 300, qe);
        let t2 = new Date().getTime();
        console.log("用时（秒）" + (t2 - t1) / 1000);
        if(cc.data.id == 0){
            let values = cc.data.data.data.values;
            let gd_id="";
            for(var i = 0; i<values.length;i++){
                let vl = values[i];
                gd_id += vl.gd_id+";"
            }
            gd_id = gd_id.substring(0,gd_id.length-1);
            if(gd_id.length>1){
                this.initAri(gd_id);
            }else{
                this.loading = false;
            }
        }else{            
            this.loading = false;
        }
    }
    /**
     * 初始化飞机初始位置
     */
    async initAri(gd_id:any){
        let oneCont =[];
        let allCont = [];
        let cont = "";
        let qCont = new QueryCont('gd_id',gd_id, 12);
        qCont.setContrast(5);
        oneCont.push(qCont);
        if (oneCont.length != 0) {
            allCont.push(oneCont);
            cont = "~" + JSON.stringify(allCont);
        }
        let qe: QueryEntity = new QueryEntity("", "");
        qe.page.currPage = 1;
        qe.page.pageSize = 50000;
        qe.cont = cont;
        let t1 = new Date().getTime();
        let cc = await tools.getBipInsAidInfo("RUNDEVDATA", 210, qe);
        let t2 = new Date().getTime();
        console.log("用时（秒）" + (t2 - t1) / 1000);
        if(cc.data.id == 0){
            let values = cc.data.data.data.values;
            for(var i=0;i<values.length;i++){
                let v = values[i];
                let key = v.number;
                let lnglat = v.gd_longitude+","+v.gd_latitude;
                TMapUt.markRealTimeAir(lnglat,this.tMap,key,this.ariClick)
            }
        }
        this.loading = false;
    }
    ariClick(data:any){
        this.loading = true;
        this.clearCover();
        let key = data.target.key;
        this.getPointList(key);
    }
    lineDrawing(key:any){
        return "";
    }
    //获取实时数据
    async getPointList(key:any){ 
        try{
            let oneCont =[];
            let allCont = [];
            let cont = "";
            let qCont = new QueryCont('time',(this.maxTime)+"", 2);
            qCont.setContrast(1);
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
            let cc = await tools.getBipInsAidInfo("RUNDEVDATA", 210, qe);
            console.log(cc)
            this.loading = false;
            this._timer1 = setTimeout(() => {
                this.getPointList(key)
            }, 4000);
        }catch(err){
            this.loading = false;
        }
    }
    mapChnage() {
        console.log("地图切换！");
    }
    //清空地图覆盖物
    clearCover() {
        this.tMap.clearOverLays();
    }
    //右侧作业区开关
    async operaBtnClick() {
        this.operaBtnOpen = !this.operaBtnOpen;
        if (this.operaBtnOpen) {
            //进行打开右侧作业区开关
            while (this.operaWidth <= 400) {
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
</style>
<style lang="scss" >
.myOperatingAreaCheck {
    font-size: 0px !important;
    .el-checkbox__label {
        font-size: 0px !important;
    }
}
</style>