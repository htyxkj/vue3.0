<template>
    <div v-loading="loading">
        <el-tabs v-model="selMap" type="card" style="min-height: -webkit-fill-available">
            <el-tab-pane :style="style" label="天地图" name="tianMap">
                <el-container class="padding0" :style="style">
                    <el-main class="padding0" style="overflow: hidden;position: relative;">
                        <div class="nav-tools">
                            <div style="width: 110px;float: left;">
                                <el-upload action="/" ref="upload" accept=".txt" :before-upload="beforeUpload" :disabled="this.fileList.length !== 0" :default-file-list="this.fileList">
                                    <el-button type="primary" :disabled="this.fileList.length !== 0">上传文件</el-button>
                                </el-upload>
                            </div>
                            <!-- <el-button type="primary" @click="showUnitGPSRepairDlg = true">修复</el-button>
                            <el-tooltip class="item" effect="light" content="轨迹信息查询" placement="top" >
                                <el-button icon="el-icon-search" circle @click="showTaskTjCell =!showTaskTjCell"></el-button>
                            </el-tooltip>


                            <el-tooltip class="item" effect="light" content="保存" placement="top" >
                                <el-button icon="el-icon-document-add" circle @click="showSaveDlg"></el-button>
                            </el-tooltip> -->

                            <!-- 清空 -->
                            <el-button icon="el-icon-delete" circle @click="clearCover"></el-button>

                            <el-tooltip style="padding-left: 10px;" effect="light" content="显示数据点" placement="top" >
                                <el-switch
                                    v-model="isShowPoint"
                                    active-color="#13ce66"
                                    inactive-color="#ff4949">
                                </el-switch>
                            </el-tooltip>

                        </div>
                        <t-map ref="TMap" class="myTMap"></t-map>
                    </el-main>
                </el-container>
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
                <el-button @click="deleteData" size="mini">删 除</el-button>
                <el-button @click="showTaskTjCell = false" size="mini">取 消</el-button>
                <el-button type="primary" @click="getOneTask" size="mini">确 定</el-button>
            </span>
        </el-dialog>

        <el-dialog title="保存机组任务" :close-on-click-modal="false" :visible.sync="showSaveUnitDlg" width="50%" class="bip-query">
            <el-row class="bip-lay">
                <el-form @submit.native.prevent label-position="right" label-width="100px">
                    <div v-for="(cel,index) in dsm.ccells.cels" :key="'A'+index">
                        <bip-comm-editor
                            v-if="(cel.attr&0x400) <= 0 "
                            :cell="cel"
                            :bgrid="false"
                            :cds="dsm"
                            :row="0"
                        />
                    </div>
                </el-form>
                <template>
                    <el-radio v-model="deviceType" label="0">旧设备</el-radio>
                    <el-radio v-model="deviceType" label="1">新设备</el-radio>
                </template>
            </el-row>
            <span slot="footer" class="dialog-footer">
                <el-button @click="showSaveUnitDlg = false" size="mini">取 消</el-button>
                <el-button type="primary" @click="saveUnitTask" size="mini">确 定</el-button>
            </span>
        </el-dialog>

        <el-dialog title="修复" :close-on-click-modal="false" :visible.sync="showUnitGPSRepairDlg" width="50%" class="bip-query">
            <el-row class="bip-lay">
                <el-form @submit.native.prevent label-position="right" label-width="120px">
                    <div v-for="(cel,index) in unitGPSRepairCell.ccells.cels" :key="'A'+index">
                        <bip-comm-editor
                            v-if="(cel.attr&0x400) <= 0 "
                            :cell="cel"
                            :bgrid="false"
                            :cds="unitGPSRepairCell"
                            :row="0"
                        />
                    </div>
                </el-form>
            </el-row>
            <span slot="footer" class="dialog-footer">
                <el-button @click="showUnitGPSRepairDlg = false" size="mini">取 消</el-button>
                <el-button type="primary" @click="repairRun" size="mini">确 定</el-button>
            </span>
        </el-dialog>


    </div>
</template>
<script lang="ts">
import {BipMenuBtn} from '@/classes/BipMenuBtn'
import { Component, Vue, Provide, Watch } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from "vuex-class";
import QueryEntity from "@/classes/search/QueryEntity";
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi;
import { Cells } from "@/classes/pub/coob/Cells";
import CDataSet from "@/classes/pub/CDataSet";
import tMap from "@/components/map/MyTianMap.vue";
import { T } from "@/components/map/js/TMap";
import { TMapUtils } from "./class/TMapUtils";
let TMapUt = TMapUtils.TMapUt;
import { GPSUtil } from "./class/GPSUtil";
let Gps = GPSUtil.GPS;
import moment from 'moment';
@Component({
    components: {
        tMap,
    }
})
export default class GPSRepair extends Vue {
    @State("bipComHeight", { namespace: "login" }) height!: number;
    style: string = "height:" + (this.height ? this.height - 50 : "400") + "px";
    selMap: string = "tianMap";
    tMap: any = null;
    tZoom: number = 12;
    loading: boolean = false;
    showTaskTjCell: boolean = false; //是否显示查询对象弹出框
    taskTjCell: CDataSet = new CDataSet(""); //飞防任务对象(查询条件)

    unitGPSCell: CDataSet = new CDataSet("");
    dsm: CDataSet = new CDataSet("");
    pcell:any = "UNITGPS(UNITGPSA)";
    showSaveUnitDlg:boolean = false;
    unitGPSSelCell:CDataSet = new CDataSet("");

    trackType:string = "1";//线路类型  航迹：0  航带：1    混合：2  
    pointMsg:any ={};//数据点提示
    isShowPoint:boolean = false;//是否显示数据提示点
    points:any =[];//点集合
    CloudMarkerCollection:any =null;//海量点对象

    mapLine:any = null;//地图划线
    fileList:Array<any>  = new Array<any>();//文件集合

    allData:any = [];//文件数据集合

    
    showUnitGPSRepairDlg:boolean = false;//是否显示修复弹出框
    unitGPSRepairCell:CDataSet = new CDataSet("");//修复对象

    deviceType:any = "1";//设备类型

    async created() {
        if (this.height) {
            this.style = "height:" + (this.height - 50) + "px";
        }
        this.taskTjCell = await TMapUt.getCell("UNITGPSTJ");
        this.unitGPSCell = await TMapUt.getCell("UNITGPS");
        this.unitGPSSelCell = await TMapUt.getCell("UNITGPSASEL");
        this.unitGPSRepairCell = await TMapUt.getCell("UNITGPSREPAIR");
        this.unitGPSRepairCell.createRecord();
        this.unitGPSCell.p_cell = this.pcell;
        this.taskTjCell.createRecord();
        this.initCell();
    }
    mounted() {
        if (this.$refs.TMap) {
            let refT: any = this.$refs.TMap;
            this.tMap = refT.getMap();
        }
    } 
    async initCell(){
        let res = await tools.getCCellsParams(this.pcell)
        let rtn: any = res.data;
        if (rtn.id == 0) {
            let kn: Array<Cells> = rtn.data.layCels;
            let cells = kn;
            this.dsm = new CDataSet(cells[0]);
            this.dsm.clear()
            this.dsm.createRecord();
        }
    }
    //开始修复
    async repairRun(){
        this.showUnitGPSRepairDlg = false;
        this.loading = true;
        let btn1 = new BipMenuBtn("DLG"," 追加期间")
        btn1.setDlgSname(name);
        btn1.setDlgType("D")
        btn1.setDlgCont("airfence.upgrade.serv.repair.RepairGPS*200;0;0");//修复
        let b = JSON.stringify(btn1) 
        let prarm = this.unitGPSRepairCell.currRecord.data
        let v = JSON.stringify(prarm);
        let res = await tools.getDlgRunClass(v,b);
        if(res.data.id ==0){
            this.$notify.success(res.data.message)
        }else{
            this.$notify.error(res.data.message)
        }
        this.loading=false;
    }
    //显示保存弹框
    showSaveDlg(){
        this.showSaveUnitDlg = true;
        this.dsm.clear();
        this.dsm.createRecord();
    }
    //保存任务
    async saveUnitTask(){
        if(!this.allData || this.allData.length ==0){
            this.$notify.warning("请先上传文件")
            return;
        }
        this.loading = true;
        this.showSaveUnitDlg=false;
        this.unitGPSCell.clear();
        this.unitGPSCell.createRecord();
        this.unitGPSCell.currRecord.c_state = 4
        this.unitGPSCell.currRecord.data = this.dsm.currRecord.data;
        let res = await this.unitGPSCell.saveData();
        let subCell = this.dsm.ds_sub[0];
        let tkid = this.dsm.currRecord.data.tkid;
        subCell.clear();
        for(var i=0;i<this.allData.length;i++){
            let data = this.allData[i] 
            subCell.createRecord();
            subCell.currRecord.data = Object.assign({},data);

            if(this.deviceType == '0'){
                let latlng = Gps.gps84_To_bd09(parseFloat(data.latitude),parseFloat(data.longitude));
                subCell.currRecord.data.latitude = latlng.tempLat;
                subCell.currRecord.data.longitude = latlng.tempLon;
            }
            if(i%1000 == 0){
                res = await this.dsm.saveData();
                subCell.clear();
                if(res.data.id ==0){

                }else{
                    this.$notify.error("分段保存操作失败！")
                }
                this.dsm.currRecord.c_state = 2;
            }
        }
        res = await this.dsm.saveData();
        if(res.data.id ==0){
            this.$notify.success(res.data.message)
        }else{
            this.$notify.error(res.data.message)
        }
        this.loading = false;
    }
    //清空地图覆盖物
    clearCover() {
        this.tMap.clearOverLays();
        this.fileList = [];
        this.mapLine = null;
        this.allData = [];
    }
    beforeUpload(file:any){
        this.fileList = [file]
        // 读取数据
        this.read(file);
        return false
    } 
    read(f:any) {
        try {
            var reader = new FileReader();
            let _this = this;
            reader.onloadend = function (evt:any) {
                if (evt.target.readyState == FileReader.DONE) {
                    let text = evt.target.result;
                    let arr = text.split('\n')
                    _this.parsingText(arr)
                }
            };
            // 包含中文内容用gbk编码
            reader.readAsText(f, 'utf-8');
        } catch (error) {
            this.fileList = [];
        }
	}
    parsingText(cont:any){
        this.loading = true;
        this.allData = [];
        if(cont){
            for(var i=0;i<cont.length;i++){
                let line = cont[i]
                if(line.indexOf("Trackpoint") !=-1){
                    if(i < cont.length-1){
                        let nextRow = cont[i+1]
                        if(nextRow){
                            let nextArr = nextRow.split("	");
                            let dataArr = line.split("	");
                            let latlng = dataArr[1];//经纬度
                            let speedTime = dataArr[2];//时间
                            let height = dataArr[3].split(" ")[0];//海拔
                            let speed = nextArr[8].split(" ")[0];//速度

                            let nextLatLng = nextArr[1];//经纬度
                            let nextTime = nextArr[2];//时间

                            let oneDate = Number(moment(speedTime,'YYYY-MM-DD HH:mm:ss').format('X'))
                            let nextDate = Number(moment(nextTime,'YYYY-MM-DD HH:mm:ss').format('X'))
                            let ListData = this.parsingGPS(latlng,nextLatLng,speedTime,(nextDate-oneDate),height,speed)
                            this.allData = this.allData.concat(ListData); //c=[1,2,3,4,5,6];
                        }
                    }
                }
            }
        }
        this.pointMsg={};
        this.points = [];
        for(var i=0;i<this.allData.length;i++){
            let data = this.allData[i] 
            let lgt = new T.LngLat(data.longitude, data.latitude)
            this.points.push(lgt);
            let key = data.longitude+"_"+data.latitude;
            lgt.kid = key;
            let msg = "定位信息:"+data.latitude+","+ data.longitude+"<br/>时&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;间："+data.speedtime+"<br/>"+
            `瞬时流量：${data.flow}m³/h<br />`+`累计流量：${data.sumfolw}m³ <br />速度：${data.speed}km/h <br />高度：${data.height}/m`
            this.pointMsg[key]= msg;
        }
        let t1 = this.tMap.getViewport(this.points);
        this.tMap.panTo(t1.center, t1.zoom);
        //创建线对象
        if(this.mapLine == null)
            this.mapLine = new T.Polyline(this.points);
        //向地图上添加线
        this.tMap.addOverLay(this.mapLine);
        this.loading = false;
    }

    /**
     * 第一条GPS
     * 第二条GPS
     * 开始时间
     * 时间差
     */
    parsingGPS(oneGPS:any,towGPS:any,speedTime:any,time:any,height:any,speed:any){
        let _oneGPS = oneGPS.split(" ");
        let _towGPS = towGPS.split(" ");

        let latd1 = _oneGPS[0].replace("N","")
        let latf1 = _oneGPS[1]
        let lngd1 = _oneGPS[2].replace("E","")
        let lngf1 = _oneGPS[3]

        let lat1:any = this.ChangeToDu(latd1,latf1,0).toFixed(5);
        let lng1:any = this.ChangeToDu(lngd1,lngf1,0).toFixed(5);


        let latd2 = _towGPS[0].replace("N","")
        let latf2 = _towGPS[1]
        let lngd2 = _towGPS[2].replace("E","")
        let lngf2 = _towGPS[3]

        let lat2:any = this.ChangeToDu(latd2,latf2,0).toFixed(5);
        let lng2:any = this.ChangeToDu(lngd2,lngf2,0).toFixed(5);

        let latc = (parseFloat(lat2) - parseFloat(lat1))/time;
        let lngc = (parseFloat(lng2) - parseFloat(lng1))/time;

        let listData:Array<any> = new Array<any>(); 
        for(var i=0;i<time;i++){
            let data:any = this.getEntity();
            if(i>0){
                speedTime = moment(speedTime,'YYYY-MM-DD HH:mm:ss').add(1, 's').format('YYYY-MM-DD HH:mm:ss');
            }
            data.speedtime = speedTime;
            data.datetime = speedTime;
            data.longitude = (parseFloat(lng1) + (lngc*i)).toFixed(5);
            data.latitude = (parseFloat(lat1) + (latc*i)).toFixed(5);
            data.height = height;
            data.speed = speed;
            listData.push(data);
        }
        return listData;
    }

    //格式转换   度分秒转度
	ChangeToDu(d:any,f:any,m:any){
		var f:any = parseFloat(f) + parseFloat((m/60)+"");
        var du = parseFloat((f/60)+"") + parseFloat(d);
        return du;
    }
    getEntity(){
        let data = {
            speedtime:null,//时间
            tkid:null,//任务编码
            longitude:null,//经度
            latitude:null,//纬度
            speed:null,//速度
            height:null,//高度
            direction:null,//方向
            flow:0,//瞬时流量
            sumfolw:0,//总流量
            pressure:0,//压力
            temperature:0,//温度
            effective:1,//定位状态
            sbid:null,//设备编码
            datetime:null//数据时间
        }
        return data
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
            this.clearCover();
            this.showTaskTjCell =false;
            this.loading = true;
            this.dsm.clear();
            let qe:QueryEntity = new QueryEntity("UNITGPSASEL","UNITGPSASEL");
            qe.page.pageSize = 100000;
            qe.cont = JSON.stringify({tkid:this.taskTjCell.currRecord.data.tkid})
            let res = await this.dsm.queryData(qe);
            
            if(res.data.id ==0){
                let alldata = res.data.data.data.data;
                this.pointMsg={};
                this.points = [];
                for(var i=0;i<alldata.length;i++){
                    let data = alldata[i].data;
                    let lgt = new T.LngLat(data.longitude, data.latitude)
                    this.points.push(lgt);
                    let key = data.longitude+"_"+data.latitude;
                    lgt.kid = key;
                    let msg = "定位信息:"+data.latitude+","+ data.longitude+"<br/>时&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;间："+data.speedtime+"<br/>"+
                    `瞬时流量：${data.flow}m³/h<br />`+`累计流量：${data.sumfolw}m³ <br />速度：${data.speed}km/h <br />高度：${data.height}/m`
                    this.pointMsg[key]= msg;
                }
                let t1 = this.tMap.getViewport(this.points);
                this.tMap.panTo(t1.center, t1.zoom);
                //创建线对象
                if(this.mapLine == null)
                    this.mapLine = new T.Polyline(this.points);
                //向地图上添加线
                this.tMap.addOverLay(this.mapLine);
            }

            this.showTaskTjCell =false;
            this.loading = false;
        } catch (error) {
            this.loading = false;
        }
    }
    async deleteData(){
        let bok = TMapUt.checkNotNull(this.taskTjCell);
        if(bok.length>1){
            this.$notify.warning(bok);
            return;
        }
        this.loading = true;
        this.showTaskTjCell = false;
        this.unitGPSCell.clear();
        this.unitGPSCell.createRecord();
        this.unitGPSCell.currRecord.c_state = 4
        this.unitGPSCell.currRecord.data = this.taskTjCell.currRecord.data;
        let res = await this.unitGPSCell.saveData();
        if(res.data.id ==0){
            this.$notify.success(res.data.message)
        }else{
            this.$notify.error(res.data.message)
        }
        this.loading = false;
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
                //创建信息窗口对象
                var infoWin = new T.InfoWindow();
                infoWin.setLngLat(lnglat);
                //设置信息窗口要显示的内容
                infoWin.setContent(_this.pointMsg[lnglat.kid]);
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
.tdt-map-pane canvas {
    z-index: 300 !important;
}
</style>
