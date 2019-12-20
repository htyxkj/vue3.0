<template>
    <div>
        <el-tabs
            v-model="selMap"
            type="card"
            @tab-click="mapChnage"
            style="min-height: -webkit-fill-available"
        >
            <el-tab-pane :style="style" label="天地图" name="tianMap">
                <el-container class="padding0" :style="style">
                    <el-header style="height:35px; padding-bottom:5px;" class="padding0">
                        <div>
                            <el-row>
                                <el-col :span="24">
                                    <div class="tools">
                                        <span class="tools-li">
                                            <el-button
                                                size="mini"
                                                icon="el-icon-delete"
                                                @click="clearCover"
                                            >清空</el-button>
                                        </span>
                                        <span class="tools-li">
                                            <el-button
                                                size="mini"
                                                icon="el-icon-search"
                                                @click="showTaskTJDia =!showTaskTJDia"
                                            >查找</el-button>
                                        </span>
                                        <span class="tools-li">
                                            <el-button
                                                size="mini"
                                                icon="iconfont icon-bip-save"
                                                @click="saveRoute"
                                            >保存</el-button>
                                        </span>
                                    </div>
                                </el-col>
                            </el-row>
                        </div>
                    </el-header>
                    <el-container class="padding0 mapMain">
                        <el-main class="padding0" style="overflow: hidden;position: relative;">
                            <t-map ref="TMap" class="myTMap"></t-map>
                            <a class="showTaskBtn" @click="taskBtnClick">
                                <template v-if="!taskBtnOpen">
                                    <i class="iconfont icon-bip-up"></i>
                                </template>
                                <template v-else>
                                    <i class="iconfont icon-bip-next"></i>
                                </template>
                            </a>
                        </el-main>
                        <el-aside :width="taskWidth+'px'">
                            <div>
                                <el-row v-for="(item,index) in taskData" :key="index">
                                    <el-row
                                        style="padding-top:5px;border-top: 1px solid #f1f1f1;margin-bottom: 5px;"
                                    >
                                        <el-col :span="24" style="height:60px;">
                                            <el-row>
                                                <el-col :span="24" style="height:20px;font-size: 0.8rem; color: rgba(0,0,0,.54)">{{item.data.taskname}}</el-col>
                                            </el-row>
                                        </el-col>
                                    </el-row>
                                    <el-row style="textAlign:center;">
                                        <el-col :span="8">
                                            <el-button type="primary" @click="routePlanning(index)" style="padding:2px; font-size:0.12rem;">规划路线</el-button>
                                        </el-col>
                                        <el-col :span="8">
                                            <el-button type="danger" @click="delPlanning(index)" style="padding:1px; font-size:0.12rem;">删除</el-button>   
                                        </el-col>
                                    </el-row>                   
                                </el-row>
                                <div class="oper-pagination">
                                    <el-pagination small layout="prev, pager, next" @current-change="pageChange" :page-size="taskCellPage.pageSize" :total="taskCellPage.total"></el-pagination>
                                </div>
                            </div>
                        </el-aside>
                    </el-container>
                </el-container>
            </el-tab-pane>
            <el-tab-pane :style="style" class="myTab" label="百度地图" name="baiduMap">
                <b-map style="width:100%;height:100%"></b-map>
            </el-tab-pane>
        </el-tabs>
        <el-dialog v-if="taskTJCell" title="查找任务" :visible.sync="showTaskTJDia" width="50%" class="bip-query">
            <el-row class="bip-lay">
                <el-form @submit.native.prevent label-position="right" label-width="100px">
                    <div v-for="(cel,index) in taskTJCell.ccells.cels" :key="'A'+index">
                        <bip-comm-editor v-if="(cel.attr&0x400) <= 0 " :cell="cel" :bgrid="false" :cds="taskTJCell" :row="0"/>
                    </div>
                </el-form>
            </el-row>
            <span slot="footer" class="dialog-footer">
                <el-button @click="showTaskTJDia = false" size="mini">取 消</el-button>
                <el-button type="primary" @click="getTask" size="mini">确 定</el-button>
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
@Component({
    components: {
        tMap,
        bMap
    }
})
export default class TaskRoutePlanning extends Vue {
    @State("bipComHeight", { namespace: "login" }) height!: number;
    @Provide() style: string =
        "height:" + (this.height ? this.height - 50 : "400") + "px";
    @Provide() selMap: string = "tianMap";
    @Provide() tMap: any = null;
    @Provide() tZoom: number = 12;

    @Provide() taskWidth: number = 0; //右侧作业区宽度
    @Provide() taskBtnOpen: boolean = false; //右侧作业区是否显示

    @Provide() lineTool: any = null; //天地图划线对象
    @Provide() editLine:any =null;//当前正在编辑的线

    @Provide() localsearch: any = null; //地址搜索对象
    @Provide() selCityLine: any = null; //搜索的地址边界线
    @Provide() addressInput: any = null; //地址框

    @Provide() taskCellPage: any = {
        currPage: 1,
        index: 0,
        pageSize: 20,
        total: 0
    }; //作业区查询分页数据

    @Provide() taskCellID: any = "F2018";
    @Provide() taskTJCellID: any = "B07ATJ";
    @Provide() taskCell: any = null; //任务对象
    @Provide() taskTJCell: any = null; //任务条件对象
    @Provide() showTaskTJDia: boolean = false; //是否显示任务查找弹框
    @Provide() taskData: any = []; //符合条件的任务
    @Provide() editTaskId: any = null; //当前正在规划路线的任务编码
    @Provide() editTaskState: boolean = false; //当前任务规划路线是否保存
    @Provide() editTaskIndex:any=null;

    async created() {
        if (this.height) {
            this.style = "height:" + (this.height - 50) + "px";
        }
        this.taskTJCell = await this.getCell(this.taskTJCellID); //任务条件对象
        this.taskTJCell.createRecord();
        this.taskCell = await this.getCell(this.taskCellID); //任务对象
    }
    mounted() {
        if (this.$refs.TMap) {
            let refT: any = this.$refs.TMap;
            this.tMap = refT.getMap();
        }
    }
    mapChnage() {
        console.log("地图切换！");
    }
    //清空地图覆盖物
    clearCover() {
        this.tMap.clearOverLays();
        this.editTaskId = null; //当前正在规划路线的任务编码
        this.editTaskState = false; //当前任务规划路线是否保存
        this.editTaskIndex =null;//
        this.editLine = null;
    }
    //右侧作业区开关
    async taskBtnClick() {
        this.taskBtnOpen = !this.taskBtnOpen;
        if (this.taskBtnOpen) {
            //进行打开右侧作业区开关
            while (this.taskWidth <= 300) {
                this.taskWidth++;
            }
        } else {
            //关闭右侧作业区开关
            while (this.taskWidth > 0) {
                this.taskWidth--;
            }
        }
        if (!this.tMap) {
            if (this.$refs.TMap) {
                let refT: any = this.$refs.TMap;
                this.tMap = refT.getMap();
                setTimeout(() => {
                    this.tMap.checkResize();
                }, 200);
            }
        } else {
            setTimeout(() => {
                this.tMap.checkResize();
            }, 200);
        }
    }

    /**
     * 线绘制结束
     * currentLnglats：用户当前绘制的折线的点坐标数组。
     * currentDistance：用户当前绘制的折线的地理长度。
     * currentPolyline：当前测距所画线的对象。
     * allPolylines：返回所有工具绘制的线对象。
     */
    lineToolEnd(parameter: any) {
        this.editLine = parameter.currentPolyline;
        this.editLine.enableEdit()
    }
    async delPlanning(index:any){
        this.taskCell.clear();
        this.taskCell.createRecord();
        this.taskCell.currRecord.data = this.taskData[index].data
        this.taskCell.currRecord.data.route = "";
        this.taskCell.currRecord.c_state = 2;
        let res: any = await this.taskCell.saveData();
        if (res.data && res.data.id == 0) {
            this.$notify.success("删除成功！");
        } else {
            this.$notify.error("删除失败！");
        }
    }
    /**
     * 保存线路
     */
    async saveRoute(){
        if(this.editLine){
            let poins:any = this.editLine.getLngLats();
            let boundary1 = "";
            for (var i = 0; i < poins.length; i++) {
            let point = poins[i];
            boundary1 += point.getLng() + "," + point.getLat() + ";";
            }
            this.taskCell.clear();
            this.taskCell.createRecord();
            this.taskCell.currRecord.data = this.taskData[this.editTaskIndex].data
            this.taskCell.currRecord.data.route = boundary1;
            this.taskCell.currRecord.c_state = 2;
            let res: any = await this.taskCell.saveData();
            if (res.data && res.data.id == 0) {
                this.$notify.success("保存成功！");
                this.editTaskState = true;
            } else {
                this.$notify.error("保存失败！");
            }
        }
    }
    /**
     * 规划路线
     * 第几条任务
     */
    routePlanning(index: any) {
        if(this.editTaskState == false && this.editTaskId){
            let co = "任务："+this.editTaskId+" 规划路线尚未保存，是否放弃？"
            this.$confirm(co, "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
            })
            .then(() => {
                this.clearCover();
                this.editTaskIndex=index;
               this.routePlanning0(index);
            })
            .catch(() => {
                
            });
        }else{
            this.clearCover();
            this.editTaskIndex=index;
            this.routePlanning0(index);
        }
    }
    async routePlanning0(index:any){
        let data = this.taskData[index].data
        this.editTaskId = data.sid;
        this.editTaskState = false;
        let oaid = data.oaid;
        let hoaid = data.hoaid;
        if(oaid){
            let aid = oaid.split(";")
            let points:any = [];
            for(var i=0;i<aid.length;i++){
                let cc = await this.getOpera(aid[i]);
                points = points.concat(cc);
                this.getOperaBr(aid[i]);
            }
            let t1 = this.tMap.getViewport(points);
            this.tMap.panTo(t1.center, t1.zoom);
        }
        if(hoaid){
            let haid = hoaid.split(";")
            for(var i=0;i<haid.length;i++){
                this.getOpera(haid[i]);
            }
        }
        let route = data.route;
        if(route && route.length>1){//存在修改线路
            let points:any = [];
            let boundary = route.split(";");
            for (var j = 0; j < boundary.length; j++) {
                let poin = boundary[j].split(",");
                if (poin.length >= 2) {
                points.push(new T.LngLat(poin[0], poin[1]));
                }
            }
            //创建线对象
            this.editLine = new T.Polyline(points);
            //向地图上添加线
            this.tMap.addOverLay(this.editLine);
            this.editLine.enableEdit();
        }else{//不存在从新画线路
            var config = {
                showLabel: false
            };
            //创建标注工具对象
            if(!this.lineTool){
                this.lineTool = new T.PolylineTool(this.tMap, config);
                this.lineTool.addEventListener("draw", this.lineToolEnd);
            }
            this.lineTool.open()
        }
    }
    //获取作业区、航空区
    async getOpera(oid:any){
        let oneCont =[];
        let allCont = [];
        let cont = "";
        let qCont = new QueryCont('id', oid, 12);
        qCont.setContrast(0);
        oneCont.push(qCont);
        if (oneCont.length != 0) {
        allCont.push(oneCont);
        cont = "~" + JSON.stringify(allCont);
        }
        let qe: QueryEntity = new QueryEntity("", "");
        qe.page.currPage = 1;
        qe.page.pageSize = 400;
        qe.cont = cont;
        let vv = await tools.getBipInsAidInfo("ROUTEOPERA", 210, qe);
        let points:any =[];
        if(vv.data.id == 0){
            let values = vv.data.data.data.values;
            for(var i =0;i<values.length;i++){
                let vl = values[i];
                let cc = this.markSurface(vl.boundary1,vl.color)
                points = points.concat(cc);
            }
        }
        return points;
    }
    //获取避让区域
    async getOperaBr(oid:any){
        let oneCont =[];
        let allCont = [];
        let cont = "";
        let qCont = new QueryCont('oid', oid, 12);
        qCont.setContrast(0);
        oneCont.push(qCont);
        if (oneCont.length != 0) {
        allCont.push(oneCont);
        cont = "~" + JSON.stringify(allCont);
        }
        let qe: QueryEntity = new QueryEntity("", "");
        qe.page.currPage = 1;
        qe.page.pageSize = 400;
        qe.cont = cont;
        let vv = await tools.getBipInsAidInfo("ROUTEOPERAA", 210, qe);
        if(vv.data.id == 0){
            let values = vv.data.data.data.values;
            for(var i =0;i<values.length;i++){
                let vl = values[i];
                if(vl.type ==1){
                    this.markSurface(vl.avoid,vl.color)
                }else{
                    this.markpoint(vl.avoid)
                }
            }
        }
    }
    /**
     * 获取任务
     */
    async getTask() {
        let qe: QueryEntity = new QueryEntity(
            this.taskCellID,
            this.taskTJCellID
        );
        qe.page = this.taskCellPage;
        qe.cont = JSON.stringify(this.taskTJCell.currRecord.data);
        qe.oprid = 13;
        await this.taskTJCell
            .queryData(qe)
            .then((res: any) => {
                if (res.data.id == 0) {
                    this.taskData = res.data.data.data.data;
                }
                this.taskCellPage = res.data.data.data.page;
                this.showTaskTJDia = false;
                this.taskBtnOpen = false;
                this.taskBtnClick();
            })
            .catch((err: any) => {
                this.showTaskTJDia = false;
                this.$notify.error(err);
            });
    }
    /**
     * 作业区页数发生变化
     */
    pageChange(page: number) {
        this.taskCellPage.currPage = page;
        this.getTask();
    }
    //画面
    markSurface(lngLat:string,color:string){
        let boundary = lngLat.split(";");
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
            weight: 3,
            opacity: 0.5,
            fillColor: color,
            fillOpacity: 0.5
        });
        this.tMap.addOverLay(polygon);
        return points;
    }
    //画点
    markpoint(lngLat:string){
        var marker = new T.Marker(new T.LngLat(lngLat.split(",")[0], lngLat.split(",")[1]));
        //向地图上添加标注
        this.tMap.addOverLay(marker);
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
    checkNotNull(cds: CDataSet): boolean {
        let bok = true;
        cds.ccells.cels.forEach(item => {
            if (item.unNull && bok) {
                let vl = null;
                let hide: any = [];
                if (cds.currRecord.data[item.id] != null)
                    vl = cds.currRecord.data[item.id] + "";
                if (!vl && hide.indexOf(item.id) == -1) {
                    this.$notify.warning(
                        "【" + item.labelString + "】不能为空!"
                    );
                    bok = false;
                    return false;
                }
            }
        });
        return bok;
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
.showTaskBtn {
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
    height: calc(100% - 35px) !important;
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
.oper-pagination {
    text-align: center;
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