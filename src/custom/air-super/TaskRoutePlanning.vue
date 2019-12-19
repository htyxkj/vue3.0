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
                                <el-col :span="12">
                                    <el-input
                                        style="width:300px"
                                        size="mini"
                                        placeholder="请输入行政名称如：北京"
                                        v-model="addressInput"
                                        class="input-with-select"
                                    >
                                        <el-button
                                            slot="append"
                                            size="mini"
                                            icon="el-icon-search"
                                            @click.native="addresSel(addressInput)"
                                        ></el-button>
                                    </el-input>
                                </el-col>
                                <el-col :span="12">
                                    <div class="tools">
                                        <span class="tools-li">
                                            <el-dropdown
                                                trigger="click"
                                                @command="toolClick"
                                                size="mini"
                                                split-button
                                            >
                                                <span class="el-dropdown-link">工具</span>
                                                <el-dropdown-menu slot="dropdown">
                                                    <el-dropdown-item command="1">线路规划</el-dropdown-item>
                                                </el-dropdown-menu>
                                            </el-dropdown>
                                        </span>
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
                                    </div>
                                </el-col>
                            </el-row>
                        </div>
                    </el-header>
                    <el-container class="padding0 mapMain">
                        <el-aside :width="areaWidth+'px'">左侧</el-aside>
                        <el-main class="padding0" style="overflow: hidden;position: relative;">
                            <t-map ref="TMap" class="myTMap"></t-map>
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
                        <el-aside :width="operaWidth+'px'">
                            <div>
                                <el-row v-for="(item,index) in taskData" :key="index">
                                    <el-row
                                        style="padding-top:5px;border-top: 1px solid #f1f1f1;margin-bottom: 5px;"
                                    >
                                        <el-col :span="20" style="height:60px;">
                                            <el-row>
                                                <el-col
                                                    :span="24"
                                                    style="height:20px;font-size: 0.8rem; color: rgba(0,0,0,.54)"
                                                >{{item.data.taskname}}</el-col>
                                                <el-col
                                                    :span="24"
                                                    style="height:20px;color: rgba(0,0,0,.54);font-size: .12rem;"
                                                >{{item.data.sid}}</el-col>
                                            </el-row>
                                        </el-col>
                                        <el-col
                                            :span="4"
                                            style="height:60px;line-height:60px;text-align: center;"
                                        >
                                            <el-button
                                                type="text"
                                                @click="routePlanning(index)"
                                                size="mini"
                                            >规划路线</el-button>
                                        </el-col>
                                    </el-row>
                                </el-row>
                                <div class="oper-pagination">
                                    <el-pagination
                                        small
                                        layout="prev, pager, next"
                                        @current-change="pageChange"
                                        :page-size="taskCellPage.pageSize"
                                        :total="taskCellPage.total"
                                    ></el-pagination>
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
        <el-dialog
            v-if="taskTJCell"
            title="查找任务"
            :visible.sync="showTaskTJDia"
            width="50%"
            class="bip-query"
        >
            <el-row class="bip-lay">
                <el-form @submit.native.prevent label-position="right" label-width="100px">
                    <div v-for="(cel,index) in taskTJCell.ccells.cels" :key="'A'+index">
                        <bip-comm-editor
                            v-if="(cel.attr&0x400) <= 0 "
                            :cell="cel"
                            :bgrid="false"
                            :cds="taskTJCell"
                            :row="0"
                        />
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
    @Provide() areaWidth: number = 0; //测边行政区宽度
    @Provide() areaBtnOpen: boolean = false; //左侧行政区是否显示

    @Provide() operaWidth: number = 0; //右侧作业区宽度
    @Provide() operaBtnOpen: boolean = false; //右侧作业区是否显示

    @Provide() lineTool: any = null; //天地图划线对象

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
    }
    //左侧行政区开关
    async areaBtnClick() {
        this.areaBtnOpen = !this.areaBtnOpen;
        if (this.areaBtnOpen) {
            //进行打开左侧行政区
            while (this.areaWidth <= 200) {
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
    //工具下拉选中
    toolClick(item: any) {
        if (item == 1) {
        }
    }
    /**
     * 线绘制结束
     * currentLnglats：用户当前绘制的折线的点坐标数组。
     * currentDistance：用户当前绘制的折线的地理长度。
     * currentPolyline：当前测距所画线的对象。
     * allPolylines：返回所有工具绘制的线对象。
     */
    lineToolEnd(parameter: any) {}
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
               this.routePlanning0(index);
            })
            .catch(() => {
                
            });
        }else{
            this.routePlanning0(index);
        }
    }
    routePlanning0(index:any){
        let data = this.taskData[index]
        this.editTaskId = data.data.sid;
        this.editTaskState = false;
        let oaid = data.oaid;
        let hoaid = data.oaid;
        if(oaid){
            let aid = oaid.split(";")
            for(var i=0;i<aid.length;i++){
                this.getOpera(aid[i]);
                this.getOperaBr(aid[i]);
            }
        }
        if(hoaid){
            let haid = hoaid.split(";")
            for(var i=0;i<haid.length;i++){
                this.getOpera(haid[i]);
                this.getOperaBr(haid[i]);
            }
        }
        let route = data.route;
    }
    //获取作业区、航空区
    async getOpera(oid:any){
        let oneCont =[];
        let allCont = [];
        let cont = "";
        let qCont = new QueryCont('a.name', oid, 12);
        qCont.setContrast(3);
        oneCont.push(qCont);
        if (oneCont.length != 0) {
        allCont.push(oneCont);
        cont = "~" + JSON.stringify(allCont);
        }
        let qe: QueryEntity = new QueryEntity("", "");
        qe.page.currPage = 1;
        qe.page.pageSize = 400;
        qe.cont = cont;
        let vv = await tools.getBipInsAidInfo("ORGBYAREAN", 210, qe);
        if(vv.data.id == 0){
            let values = vv.data.data.data.values;
             
        }
    }
    //获取避让区域
    async getOperaBr(oid:any){
        let oneCont =[];
        let allCont = [];
        let cont = "";
        let qCont = new QueryCont('a.name', oid, 12);
        qCont.setContrast(3);
        oneCont.push(qCont);
        if (oneCont.length != 0) {
        allCont.push(oneCont);
        cont = "~" + JSON.stringify(allCont);
        }
        let qe: QueryEntity = new QueryEntity("", "");
        qe.page.currPage = 1;
        qe.page.pageSize = 400;
        qe.cont = cont;
        let vv = await tools.getBipInsAidInfo("ORGBYAREAN", 210, qe);
        if(vv.data.id == 0){
            let values = vv.data.data.data.values;
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
            })
            .catch((err: any) => {
                this.showTaskTJDia = false;
                this.$notify.error(err);
            });
    }
    //定位地址
    async addresSel(address: string) {
        if (!this.localsearch) {
            var config = {
                pageCapacity: 10, //每页显示的数量
                onSearchComplete: this.localSearchResult //接收数据的回调函数
            };
            //创建搜索对象
            this.localsearch = new T.LocalSearch(this.tMap, config);
        }
        let oneCont = [];
        let allCont = [];
        let cont = "";
        let qCont = new QueryCont("a.name", address, 12);
        qCont.setContrast(3);
        oneCont.push(qCont);
        if (oneCont.length != 0) {
            allCont.push(oneCont);
            cont = "~" + JSON.stringify(allCont);
        }
        let qe: QueryEntity = new QueryEntity("", "");
        qe.page.currPage = 1;
        qe.page.pageSize = 400;
        qe.cont = cont;
        let vv = await tools.getBipInsAidInfo("ORGBYAREAN", 210, qe);
        if (vv.data.id == 0) {
            let values = vv.data.data.data.values;
            if (values.length > 0) {
                let orgcode = "";
                for (var i = 0; i < values.length; i++) {
                    orgcode += values[i].orgcode + ";";
                }
                orgcode = orgcode.substring(0, orgcode.length - 1);
            } else {
            }
        }
        this.clearCover();
        this.localsearch.search(address);
    }
    //搜索返回结果
    localSearchResult(result: any) {
        //根据返回类型解析搜索结果
        switch (parseInt(result.getResultType())) {
            case 1:
                //解析点数据结果
                this.pois(result.getPois());
                break;
            case 3:
                //解析行政区划边界
                this.area(result.getArea());
                break;
        }
    }
    //行政区
    area(obj: any) {
        if (obj) {
            if (obj.points) {
                //坐标数组，设置最佳比例尺时会用到
                var pointsArr = [];
                var points = obj.points;
                for (var i = 0; i < points.length; i++) {
                    var regionLngLats = [];
                    var regionArr = points[i].region.split(",");
                    for (var m = 0; m < regionArr.length; m++) {
                        var lnglatArr = regionArr[m].split(" ");
                        var lnglat = new T.LngLat(lnglatArr[0], lnglatArr[1]);
                        regionLngLats.push(lnglat);
                        pointsArr.push(lnglat);
                    }
                    //创建线对象
                    var line = new T.Polyline(regionLngLats, {
                        color: "blue",
                        weight: 3,
                        opacity: 1,
                        lineStyle: "dashed"
                    });
                    //向地图上添加线
                    this.tMap.addOverLay(line);
                }
                //显示最佳比例尺
                this.tMap.setViewport(pointsArr);
            }
            if (obj.lonlat) {
                var regionArr = obj.lonlat.split(",");
                this.tMap.panTo(new T.LngLat(regionArr[0], regionArr[1]));
            }
        }
    }
    //点
    pois(obj: any) {
        if (obj) {
            //坐标数组，设置最佳比例尺时会用到
            var zoomArr = [];
            for (var i = 0; i < obj.length; i++) {
                //闭包
                (function(i) {
                    //坐标
                    var lnglatArr = obj[i].lonlat.split(" ");
                    var lnglat = new T.LngLat(lnglatArr[0], lnglatArr[1]);
                    zoomArr.push(lnglat);
                })(i);
            }
            //显示地图的最佳级别
            this.tMap.setViewport(zoomArr);
        }
    }

    /**
     * 作业区页数发生变化
     */
    pageChange(page: number) {
        this.taskCellPage.currPage = page;
        this.getTask();
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
    height: calc(100% - 35px) !important;
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
</style>
<style lang="scss" >
.myOperatingAreaCheck {
    font-size: 0px !important;
    .el-checkbox__label {
        font-size: 0px !important;
    }
}
</style>