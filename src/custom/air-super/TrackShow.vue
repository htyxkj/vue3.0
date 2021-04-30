<template>
    <div v-loading="loading">
        <el-tabs v-model="selMap" type="card" @tab-click="mapChnage" class="ff-tabs" style="min-height: -webkit-fill-available">
            <el-tab-pane :style="style" label="天地图" name="tianMap">
                <el-container class="padding0" :style="style">
                    <el-main class="padding0" style="overflow: hidden;position: relative;">
                        <div class="nav-tools">
                            <!-- 搜索 -->
                            <el-button icon="el-icon-search" circle @click="showTaskTjCell =!showTaskTjCell"></el-button>
                            <!-- 清空 -->
                            <el-button icon="el-icon-delete" circle @click="clearCover"></el-button> 
                            <el-tooltip style="padding-left: 10px;" effect="light" content="显示数据点" placement="top" >
                                <el-switch
                                    v-model="isShowPoint"
                                    active-color="#13ce66"
                                    inactive-color="#ff4949">
                                </el-switch>
                            </el-tooltip>
                            <el-button v-if="showTKName" style="padding-left: 10px;margin-left: 10px;">{{taskTjCell.currRecord.data.taskname}}</el-button>
                        </div>
                        <t-map ref="TMap" class="myTMap"></t-map>
                    </el-main>
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
import CDataSet from "@/classes/pub/CDataSet";
import tMap from "@/components/map/MyTianMap.vue";
import bMap from "@/components/map/MyBaiMap.vue";
import { T } from "@/components/map/js/TMap";
import { TMapUtils } from "./class/TMapUtils";
let TMapUt = TMapUtils.TMapUt;
import { GPSUtil } from "./class/GPSUtil";
let Gps = GPSUtil.GPS;
import {BipMenuBtn} from '@/classes/BipMenuBtn'
@Component({
    components: {
        tMap,
        bMap
    }
})
export default class TrackShow extends Vue {
    @State("bipComHeight", { namespace: "login" }) height!: number;
    style: string =
        "height:" + (this.height ? this.height - 50 : "400") + "px";
    selMap: string = "tianMap";
    tMap: any = null;
    tZoom: number = 12;
    areaWidth: number = 0; //测边行政区宽度
    areaBtnOpen: boolean = false; //左侧区域是否显示
    PreviousFlowPoint:any = null;//上一个流量点
    loading: boolean = false;
    showTaskTjCell: boolean = false; //是否显示查询对象弹出框
    taskTjCell: CDataSet = new CDataSet(""); //飞防任务对象(查询条件)
    taskData:any=[];//全部数据记录
    sprayLine0:any=[];//喷洒轨迹（农药范围）
    sprayLine1:any=[];//喷洒轨迹（一像素的线）
    sprayLine2:any=[];//飞行轨迹（没有喷洒农药的轨迹线）
    sprayBreak:boolean = true;//喷洒是否中断
    flightBeltColor:string = "#ADFF2F"//行带颜色
    flightBeltOpacity:number = 0.3;//航道透明度
    flightBeltWidth:number = 0;//航带宽度 米
    trackColor:string = "#FFFF00";//航迹颜色
    noFlowColor:string = "#F40";//未喷洒农药时的轨迹颜色
    params:any = null;
    isShowPoint:boolean = false;//是否显示数据提示点
    points:any =[];//点集合
    CloudMarkerCollection:any =null;//海量点对象
    trackType:string = "1";//线路类型  航迹：0  航带：1    混合：2  
    //起降点信息
    takeoff:any = null;//起降点
    takeoffRange:any = 50;//起降点范围
    showTKName:boolean = false;//显示任务名称
    async created() {
        this.params = this.$route.params;
        if (this.height) {
            this.style = "height:" + (this.height - 50) + "px";
        }
        this.taskTjCell = await TMapUt.getCell("F0313TJ");
        this.taskTjCell.createRecord();
    }
    mounted() {
        if (this.$refs.TMap) {
            let refT: any = this.$refs.TMap;
            this.tMap = refT.getMap();
            this.tMap.addEventListener("zoomend", this.zoomend);//地图缩放结束
        }
        if(this.$route.params){
            let params = this.$route.params;
            let tkid = params.tkid;
            let bgtime = params.bgtime;
            let edtime = params.edtime;
            if(tkid && bgtime && edtime){
                this.sortiesTrack(tkid,bgtime,edtime)
            }
        } 
    }
    mapChnage() {
        console.log("地图切换！");
    }
    //清空地图覆盖物
    clearCover() {
        this.showTKName = false;
        this.tMap.clearOverLays();
        this.sprayLine0 = [];
        this.sprayLine1 = [];
        this.sprayLine2 = [];
        this.sprayBreak = true;
    }

    /**
     * 查找飞防轨迹信息
     */
    async getOneTask() {
        this.showTKName = true;
        this.PreviousFlowPoint = null;        
        this.sprayLine0 = [];
        this.sprayLine1 = [];
        this.sprayLine2 = [];
        this.sprayBreak = true;
        this.points = [];
        try {
            let bok = TMapUt.checkNotNull(this.taskTjCell);
            if(bok.length>1){
                this.$notify.warning(bok);
                return;
            }
            let tkid = this.taskTjCell.currRecord.data.sid;//任务编码
            let bgtime = this.taskTjCell.currRecord.data.bgtime;//开始时间
            let edtime = this.taskTjCell.currRecord.data.edtime;//结束时间
            let oaid = this.taskTjCell.currRecord.data.oaid;  //作业区
            let hoaid = this.taskTjCell.currRecord.data.hoaid;//航空识别区
            let route = this.taskTjCell.currRecord.data.route;//路线
            this.trackType = this.taskTjCell.currRecord.data.type;//航迹类型
            let showarea = this.taskTjCell.currRecord.data.showarea;//显示作业区
            let showhkarea = this.taskTjCell.currRecord.data.showhkarea;//显示识别区
            let showroot = this.taskTjCell.currRecord.data.showhkarea;//显示航线
            this.flightBeltWidth = this.taskTjCell.currRecord.data.widcloth;
            let takeoff = this.taskTjCell.currRecord.data.takeoff;//起降点信息
            let tlid = this.taskTjCell.currRecord.data.tlid;//设备信息
            if(!tlid && !tkid){
                this.$notify.warning("任务编码和设备标识不能同时为空！");
                return;
            }
            this.initTakeoff(takeoff);
            if(showarea == '1'){
                TMapUt.getOpera(oaid,this.tMap);//作业区
                TMapUt.getOperaBr(oaid,this.tMap);//避让区
            }
            if(showhkarea =='1'){
                 TMapUt.getOpera(hoaid,this.tMap);//航空识别区
            }
           if(showroot == '1'){
                TMapUt.getOperaRoute(oaid,this.tMap);
                if(route){
                    TMapUt.makeRoute(route,"",this.tMap)//路线
                }
           }
            // TMapUt.getOpera(oaid,this.tMap);//作业区
            // TMapUt.getOpera(hoaid,this.tMap);//航空识别区
            // TMapUt.getOperaBr(oaid,this.tMap);//避让区
            // TMapUt.makeRoute(route,"",this.tMap)//路线
            this.showTaskTjCell = false;
            // let condition = {bgTime:bgtime,edTime:edtime,tkid:tkid,sbid:tlid};
            // let btn1 = new BipMenuBtn("DLG"," 数据建模")
            // btn1.setDlgType("D")
            // btn1.setDlgCont("airfence.upgrade.serv.realTime.RealTimeInvoke*240;0;0");//数据建模
            // let b = JSON.stringify(btn1)
            // let v = JSON.stringify(condition);
            // let t1 = new Date().getTime();
            // let res:any = await tools.getDlgRunClass(v,b);
            // let t2 = new Date().getTime();
            // this.$notify.success("查询任务数据用时（秒）" + (t2 - t1) / 1000);
            // if(res.data.id ==0){
            //     let data = res.data.data.data;
            //     let sprayLine0 = data[0];//有流量集合
            //     let sprayLine1 = data[1];//没有流量集合
            //     for(var i=0;i<sprayLine0.length;i++){
            //         this.drawTrack(sprayLine0[i],true)
            //     }
            //     for(var i=0;i<sprayLine1.length;i++){
            //         this.drawTrack(sprayLine1[i],false)
            //     }
            //     this.drawLine();
            // }else{
            //     this.$notify.error("查询任务数据出错");
            // }
            // this.loading = false;

            let qe: QueryEntity = new QueryEntity("", "");
            qe.page.currPage = 1;
            qe.page.pageSize = 50000;
            let cont ="speedtime >=" +"'" +bgtime +"'" +" and " +"speedtime<=" + "'" +edtime +"'";
            if(tkid){
                cont+= " and tkid ='" +tkid +"' ";
            }
            if(tlid){
                cont+= " and sbid ='" +tlid +"' ";
            }
            qe.cont = cont;
            this.loading = !this.loading;
            this.showTaskTjCell = false;
            let t1 = new Date().getTime();
            let cc = await tools.getBipInsAidInfo("CORRD", 210, qe);
            let t2 = new Date().getTime();
            this.$notify.success("查询任务数据用时（秒）" + (t2 - t1) / 1000);
            if (cc.data.id == 0) {
                this.taskData = cc.data.data.data.values;
                let sprayLine0 = [];//有流量集合
                let sprayLine1 = [];//没有流量集合
                for(var i=0;i< this.taskData.length;i++){
                    this.taskData[i].index =i;
                    let data = this.taskData[i];
                    if(data){
                        let lnglat = [data.latitude, data.longitude]
                        if(!data.sbid){
                            lnglat = Gps.bd09_To_gps84(data.latitude,data.longitude);
                            data.longitude = lnglat[1];
                            data.latitude = lnglat[0]
                        }
                        let flow = data.flow;
                        if(flow>0){//有流量去划线
                            if(this.sprayBreak){//中断过需要从起一条线
                                if(sprayLine1.length>0){
                                    sprayLine1[sprayLine1.length-1].push(data);
                                }
                                sprayLine0.push([data]);
                            }else{//没有中断需要在最后一条线追加点 或重画最后一条线
                                sprayLine0[sprayLine0.length-1].push(data);
                            }
                            this.sprayBreak = false;
                        }else{
                            if(this.trackType =="0" || this.trackType =="2"){
                                if(this.sprayBreak && sprayLine1.length>0){
                                    sprayLine1[sprayLine1.length-1].push(data);
                                }else{
                                    let points = [];
                                    if(this.PreviousFlowPoint)
                                        points.push(this.PreviousFlowPoint);
                                    points.push(data)
                                    sprayLine1.push(points);
                                }
                            }
                            this.sprayBreak = true;
                        }
                        this.PreviousFlowPoint = data;
                    }
                }
                for(var i=0;i<sprayLine0.length;i++){
                    this.drawTrack(sprayLine0[i],true)
                }
                for(var i=0;i<sprayLine1.length;i++){
                    this.drawTrack(sprayLine1[i],false)
                }
                this.drawLine();
            }else{
                this.loading = !this.loading;
            }
        } catch (error) {
            this.loading = !this.loading;
        }
    }
    /**
     * 绘制架次航带
     * @param tkid:任务编码
     * @param bgtime:开始时间
     * @param edtime:结束时间
     */
    async sortiesTrack(tkid:any,bgtime:any,edtime:any){
        let qe: QueryEntity = new QueryEntity("", "");
        qe.page.currPage = 1;
        qe.page.pageSize = 1; 
        let cont =" sid ='" +tkid +"'";
        qe.cont = cont;
        let vv = await tools.getBipInsAidInfo("TKMSG", 210, qe);
        if(vv.data.id == 0){
            let data = vv.data.data.data.values[0] 
            if(data){
                this.taskTjCell.createRecord()
                this.taskTjCell.currRecord.data.sid = tkid;
                this.taskTjCell.currRecord.data.bgtime = bgtime;
                this.taskTjCell.currRecord.data.edtime = edtime;
                this.taskTjCell.currRecord.data.taskname = data.taskname;
                this.taskTjCell.currRecord.data.asid = data.asid;
                this.taskTjCell.currRecord.data.tlid = data.tlid;
                this.taskTjCell.currRecord.data.oaid = data.oaid;
                this.taskTjCell.currRecord.data.hoaid = data.hoaid;
                this.taskTjCell.currRecord.data.route = data.route;

                console.log(this.taskTjCell)
                this.getOneTask();
            }
        }else{
            console.log(vv)
            this.$notify.error("查询任务出错")
        }
    }
    /**
     *  绘制 航带 航迹 
     * @param values:数据
     * @param isFlow:是否是流量线
     */
    drawTrack(values:any,isFlow:any){
        let zoom = this.tMap.getZoom();
        let cc = 256 * Math.pow(2, zoom) / 40075017 //换算一米转多少像素
        let weight = this.flightBeltWidth *cc; //换算一米转多少像素
        let points = [];
        for(var i=0;i<values.length;i++){
            let data = values[i];
            if(data){
                let lnglat = [data.latitude, data.longitude]
                if(!data.sbid){
                    lnglat = Gps.bd09_To_gps84(data.latitude,data.longitude);
                    data.longitude = lnglat[1];
                    data.latitude = lnglat[0]
                }
                let lgt = new T.LngLat(data.longitude, data.latitude)
                lgt.kid = data.index;
                points.push(lgt);
            }
        }
        if(isFlow){
            if(this.trackType == "1" || this.trackType == "2"){
                let opts0 = {color:this.flightBeltColor,weight:weight,opacity:this.flightBeltOpacity};
                var newLine0 = new T.Polyline(points,opts0);
                this.sprayLine0.push(newLine0)
            }
            let opts1 = {color:this.trackColor,weight:3,opacity:1};
            var newLine1 = new T.Polyline(points,opts1);
            this.sprayLine1.push(newLine1)
        }else{
            if(this.trackType =="0" || this.trackType =="2"){
                let opts2 = {color:this.noFlowColor,weight:3,opacity:1};
                var newLine2 = new T.Polyline(points,opts2);
                this.sprayLine2.push(newLine2)
            }
        }
        this.points = this.points.concat(points);
    }
    drawLine(){
        let t1 = this.tMap.getViewport(this.points);
        if(t1){
            this.tMap.panTo(t1.center, t1.zoom);
        }
        this.loading = !this.loading;
        this.zoomend();
        if(this.isShowPoint){
            this.CloudMarkerCollection = new T.CloudMarkerCollection(this.points,{
                color:'blue',
                SizeType:'TDT_POINT_SIZE_SMALL'
            })
            let _this = this;
            this.CloudMarkerCollection.addEventListener("click", function (e:any) {
                var lnglat = e.lnglat;
                let data = _this.taskData[lnglat.kid];
                let msg = "<div>任务编码："+_this.taskTjCell.currRecord.data.sid+"<br/>任务名称："+_this.taskTjCell.currRecord.data.taskname+"<br/>定位信息:"+
                data.longitude+","+ data.latitude+"<br/>时&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;间："+data.speedtime+"<br/>"+
                "瞬时流量："+data.flow+"m³/h<br />"+`累计流量：${data.sumfolw}m³ <br />速度：${data.speed}km/h <br />高度：${data.height}/m`
                //创建信息窗口对象
                var infoWin = new T.InfoWindow();
                infoWin.setLngLat(lnglat);
                //设置信息窗口要显示的内容
                infoWin.setContent(msg);
                _this.tMap.addOverLay(infoWin);
            });// 将标注添加到地图中 
            this.tMap.addOverLay(this.CloudMarkerCollection);
        }
        for(var i=0;i<this.sprayLine0.length;i++){
            this.tMap.addOverLay(this.sprayLine0[i]);
        }
        for(var i=0;i<this.sprayLine1.length;i++){
            this.tMap.addOverLay(this.sprayLine1[i]);
        }
        for(var i=0;i<this.sprayLine2.length;i++){
            this.tMap.addOverLay(this.sprayLine2[i]);
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
    @Watch("isShowPoint")
    isShowPointChange(){
        if(this.isShowPoint){
            this.CloudMarkerCollection = new T.CloudMarkerCollection(this.points,{
                color:'blue',
                SizeType:'TDT_POINT_SIZE_SMALL'
            })
            let _this = this;
            this.CloudMarkerCollection.addEventListener("click", function (e:any) {
                var lnglat = e.lnglat;
                let data = _this.taskData[lnglat.kid];
                let msg = "<div>任务编码："+_this.taskTjCell.currRecord.data.sid+"<br/>任务名称："+_this.taskTjCell.currRecord.data.taskname+"<br/>定位信息:"+
                data.longitude+","+ data.latitude+"<br/>时&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;间："+data.speedtime+"<br/>"+
                "瞬时流量："+data.flow+"m³/h<br />"+`累计流量：${data.sumfolw}m³ <br />速度：${data.speed}km/h <br />高度：${data.height}/m`
                //创建信息窗口对象
                var infoWin = new T.InfoWindow();
                infoWin.setLngLat(lnglat);
                //设置信息窗口要显示的内容
                infoWin.setContent(msg);
                _this.tMap.addOverLay(infoWin);
            });// 将标注添加到地图中 
            this.tMap.addOverLay(this.CloudMarkerCollection);
        }else{
            this.CloudMarkerCollection.clear()	
        }
    }

    @Watch("height")
    heightChange() {
        this.style = "height:" + (this.height - 50) + "px";
    }
    @Watch("$route")
    getTrack(){
        if(this.$route && this.$route.path =="/TrackShow"){
            if(this.tMap)
                this.tMap.checkResize();
            if(this.$route.params){
                let params = this.$route.params;
                let tkid = params.tkid;
                let bgtime = params.bgtime;
                let edtime = params.edtime;
                if(tkid && bgtime && edtime){
                    this.clearCover()
                    this.trackType = '2';
                    this.sortiesTrack(tkid,bgtime,edtime)
                }
            } 
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
    top: 0.1rem;
    left: 1rem;
    z-index: 999;
}
</style>
<style lang="scss" >
.myOperatingAreaCheck {
    font-size: 0px !important;
    .el-checkbox__label {
        font-size: 0px !important;
    }
}
.tdt-map-pane canvas {
    z-index: 300 !important;
}
.ff-tabs{
    .el-tabs__header{
        margin-left: 0px;
        padding: 0;
        margin: 0px;
        background-color: #fff !important;
    }
    .el-tabs__item{
        height: 30px !important;
        line-height: 30px !important;
    }
}
</style>