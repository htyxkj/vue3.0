<template>
    <div v-loading="loading">
        <el-tabs v-model="selMap" type="card" @tab-click="mapChnage" style="min-height: -webkit-fill-available">
            <el-tab-pane :style="style" label="天地图" name="tianMap">
                <el-container class="padding0" :style="style">
                    <el-main class="padding0" style="overflow: hidden;position: relative;">
                        <div class="nav-tools">
                            <!-- 搜索 -->
                            <el-button icon="el-icon-search" circle @click="showTaskTjCell =!showTaskTjCell"></el-button>
                            <!-- 播放 -->
                            <el-button icon="el-icon-video-play" circle @click="clearCover"></el-button>
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
export default class TrackShow extends Vue {
    @State("bipComHeight", { namespace: "login" }) height!: number;
    @Provide() style: string =
        "height:" + (this.height ? this.height - 50 : "400") + "px";
    @Provide() selMap: string = "tianMap";
    @Provide() tMap: any = null;
    @Provide() tZoom: number = 12;
    @Provide() areaWidth: number = 0; //测边行政区宽度
    @Provide() areaBtnOpen: boolean = false; //左侧区域是否显示

    @Provide() loading: boolean = false;
    @Provide() showTaskTjCell: boolean = false; //是否显示查询对象弹出框
    @Provide() taskTjCell: CDataSet = new CDataSet(""); //飞防任务对象(查询条件)
    @Provide() taskData:any=[];//任务数据集
    @Provide() sprayLine0:any=[];//喷洒轨迹（农药范围）
    @Provide() sprayLine1:any=[];//喷洒轨迹（一像素的线）
    @Provide() sprayLine2:any=[];//飞行轨迹（没有喷洒农药的轨迹线）
    @Provide() sprayBreak:boolean = true;//喷洒是否中断
    @Provide() flightBeltColor:string = "#00FF68"//行带颜色
    @Provide() flightBeltOpacity:number = 0.5;//航道透明度
    @Provide() flightBeltWidth:number = 45;//航带宽度 米
    @Provide() trackColor:string = "#CEFF00";//航迹颜色
    @Provide() noFlowColor:string = "#C00000";//没有喷洒农药时的轨迹颜色

    @Provide() trackType:string = "1";//线路类型  航迹：0  航带：1    混合：2  

    async created() {
        if (this.height) {
            this.style = "height:" + (this.height - 50) + "px";
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
    }
    mapChnage() {
        console.log("地图切换！");
    }
    //清空地图覆盖物
    clearCover() {
        this.tMap.clearOverLays();
        this.taskData = [];
        this.sprayLine0 = [];
        this.sprayLine1 = [];
        this.sprayLine2 = [];
        this.sprayBreak = true;
    }

    /**
     * 查找飞防轨迹信息
     */
    async getOneTask() {
        try {
            let bok = TMapUt.checkNotNull(this.taskTjCell);
            if(bok.length>1){
                this.$notify.warning(bok);
                return;
            }
            let oaid = this.taskTjCell.currRecord.data.oaid;  //作业区
            let hoaid = this.taskTjCell.currRecord.data.hoadi;//航空识别区
            let route = this.taskTjCell.currRecord.data.route;//路线
            TMapUt.getOpera(oaid,this.tMap);//作业区
            TMapUt.getOpera(hoaid,this.tMap);//航空识别区
            TMapUt.getOperaBr(oaid,this.tMap);//避让区
            TMapUt.makeRoute(route,"",this.tMap)//路线

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
                this.drawTrack();
            }
        } catch (error) {
            this.loading = !this.loading;
        }
    }
    /**
     * 绘制 航带 航迹 
     */
    drawTrack(){
        let po = [];
        for(var i=0;i<this.taskData.length;i++){
            let data = this.taskData[i];
            if(data){
                let flow = data.flow;
                let lgt = new T.LngLat(data.longitude, data.latitude)
                po.push(lgt);
                if(flow>0){//有流量去划线
                    if(this.sprayBreak){//中断过需要从起一条线
                        let points = [];
                        
                        if(this.trackType == "1" || this.trackType == "2"){
                            let zoom = this.tMap.getZoom();
                            let cc = 256 * Math.pow(2, zoom) / 40075017 //换算一米转多少像素
                            let opts0 = {color:this.flightBeltColor,weight:cc*this.flightBeltWidth,opacity:this.flightBeltOpacity};
                            points.push(lgt);
                            var newLine0 = new T.Polyline(points,opts0);
                            this.tMap.addOverLay(newLine0);
                            this.sprayLine0.push(newLine0)
                        }

                        let opts1 = {color:this.trackColor,weight:1,opacity:1};
                        var newLine1 = new T.Polyline(points,opts1);
                        this.tMap.addOverLay(newLine1);     
                        this.sprayLine1.push(newLine1)
                    }else{//没有中断需要在最后一条线追加点 或重画最后一条线
                        if(this.trackType == "1" || this.trackType == "2"){
                            let line0 = this.sprayLine0[this.sprayLine0.length-1];
                            let points0 = line0.getLngLats();
                            points0.push(lgt);
                            line0.setLngLats(points0)
                        }
                        let line1 = this.sprayLine1[this.sprayLine1.length-1];
                        let points1 = line1.getLngLats();
                        points1.push(lgt);
                        line1.setLngLats(points1)
                    }
                    this.sprayBreak = false;
                }else{
                    if(this.trackType =="0" || this.trackType =="2"){
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
                    }
                    this.sprayBreak = true;
                }
            }
        }
        let t1 = this.tMap.getViewport(po);
        this.tMap.panTo(t1.center, t1.zoom);
        this.zoomend();
        this.loading = !this.loading;
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
</style>
<style lang="scss" >
.myOperatingAreaCheck {
    font-size: 0px !important;
    .el-checkbox__label {
        font-size: 0px !important;
    }
}
</style>