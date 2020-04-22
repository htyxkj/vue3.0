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
                    <el-container class="padding0 mapMain">
                        <el-main class="padding0" style="overflow: hidden;position: relative;">
                             <div class="nav-tools">
                                <!-- 搜索 -->
                                <el-button icon="el-icon-search"  circle  @click="showTaskTJDia =!showTaskTJDia"></el-button>
                                <!-- 保存 -->
                                <el-button icon="iconfont icon-bip-save" @click="saveRoute" circle></el-button>
                                <!-- 清空 -->
                                <el-button icon="el-icon-delete"   @click="clearCover" circle></el-button>
                            </div>
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
                            <div class="task-info">
                                <el-row v-for="(item,index) in taskData" :key="index">
                                    <el-row
                                        style="padding:5px; paddingLeft:10px; border-bottom: 1px solid #f1f1f1; margin-bottom: 5px;">
                                        <el-col :span="24">
                                            <el-row>
                                                <el-col :span="24" style="font-size: 0.8rem; color: rgba(0,0,0,.54)">{{item.data.id}}</el-col>
                                            </el-row>
                                             <el-row>
                                                <el-col :span="11" style="font-size: 0.6rem; color: rgba(0,0,0,.54)">{{item.data.township}}</el-col>
                                                <el-col :span="2">~</el-col>
                                                
                                                <el-col :span="11" style="font-size: 0.6rem; color: rgba(0,0,0,.54)">{{item.data.name}}</el-col>
                                            </el-row>
                                             <el-row>
                                                <el-col :span="24" style="font-size: 0.8rem; color: rgba(0,0,0,.54)">{{item.data.address}}</el-col>
                                            </el-row>
                                        </el-col>
                                    </el-row>
                                    <el-row style="textAlign:center; border-bottom: 1px solid #f1f1f1; height:30px;">
                                         <el-col :span="8">
                                            <el-button type="primary" @click="routePlanningRech(index)" style="padding:2px; font-size:0.12rem;">航线查询</el-button>
                                        </el-col>
                                        <el-col :span="8">
                                            <el-button type="success" @click="routePlanning(index)" style="padding:2px; font-size:0.12rem;">航线规划</el-button>
                                        </el-col>
                                        <el-col :span="8">
                                            <el-button type="danger" @click="delPlanning(index)" style="padding:1px; font-size:0.12rem;">删除路线</el-button>   
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
        <el-dialog v-if="taskTJCell" title="查找作业区" :visible.sync="showTaskTJDia" width="50%" class="bip-query">
            <el-row class="bip-lay">
                <el-form @submit.native.prevent label-position="right" label-width="100px">
                    <div v-for="(cel,index) in taskTJCell.ccells.cels" :key="'A'+index">
                        <bip-comm-editor v-if="(cel.attr&0x400) <= 0 " :cell="cel" :bgrid="false" :cds="taskTJCell" :row="0"/>
                    </div>
                </el-form>
            </el-row>
            <span slot="footer" class="dialog-footer">
                <el-button @click="showTaskTJDia = false" size="mini">取 消</el-button>
                <el-button type="primary" @click="getOperarea" size="mini">确 定</el-button>
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

    @Provide() taskCellID: any = "XL2015";
    @Provide() taskTJCellID: any = "XL2015TJ";
    @Provide() taskCell: any = null; //任务对象
    @Provide() taskTJCell: any = null; //任务条件对象
    @Provide() showTaskTJDia: boolean = false; //是否显示任务查找弹框
    @Provide() taskData: any = []; //符合条件的任务
    @Provide() editTaskId: any = null; //当前正在规划路线的任务编码
    @Provide() editTaskState: boolean = false; //当前任务规划路线是否保存
    @Provide() editTaskIndex:any=null;
    @Provide() liftCell:any = null;//起降点对象
    @Provide() liftMarker:any =[];

    async created() {
        if (this.height) {
            this.style = "height:" + (this.height - 50) + "px";
        }
        this.taskTJCell = await TMapUt.getCell(this.taskTJCellID); //任务条件对象
        this.taskTJCell.createRecord();
        this.taskCell = await TMapUt.getCell(this.taskCellID); //任务对象
        this.liftCell = await TMapUt.getCell("20200203"); 
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
        this.editTaskState = true; //当前任务规划路线是否保存
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
            this.tMap.removeOverLay(this.editLine);
            this.editTaskState = true;
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
                this.editLine.disableEdit();
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
    // 查看路线
    async routePlanningRech(index: any) {
        console.log("查看路线!")
        this.getSorgLift();
        let data = this.taskData[index].data
        let avoid = data.id;//避让信息
        let airid = data.airid;//航空识别区
        TMapUt.getOperaBr(avoid,this.tMap);
        TMapUt.getOpera(airid,this.tMap);
        let points:any = await TMapUt.getOpera(data.id,this.tMap);
        if(points && points.length>0){
            let t1 = this.tMap.getViewport(points);
            this.tMap.panTo(t1.center, t1.zoom);
        }
        let route = data.route;
        TMapUt.makeRoute(data.route,"",this.tMap)
    }
    /**
     * 规划线路
     */
    async routePlanning0(index:any){
        this.getSorgLift();
        let data = this.taskData[index].data
        this.editTaskId = data.id;
        this.editTaskState = false;
        let avoid = data.id;//避让信息
        let airid = data.airid;//航空识别区
        TMapUt.getOperaBr(avoid,this.tMap);
        TMapUt.getOpera(airid,this.tMap);
        let points:any = await TMapUt.getOpera(data.id,this.tMap);
        if(points && points.length>0){
            let t1 = this.tMap.getViewport(points);
            this.tMap.panTo(t1.center, t1.zoom);
        }
        let route = data.route;
        if(route && route.length>1){//存在修改线路
            //创建线对象
            this.editLine = await TMapUt.makeRoute(data.route,"",this.tMap)
            // 开启编辑
            this.editLine.enableEdit();
        }else{//不存在从新画线路
            //创建标注工具对象
            if(!this.lineTool){
                this.lineTool = new T.PolylineTool(this.tMap);
                this.lineTool.addEventListener("draw", this.lineToolEnd);
            }
            this.lineTool.close();
            this.lineTool.open()
        }
    }
    getOperarea(){
        this.taskCellPage.currPage = 1;
        this.getOperarea0();
        this.getSorgLift();
    }
    /**
     * 获取任务
     */
    async getOperarea0() {
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
        this.getOperarea0();
    }
    @Watch("height")
    heightChange() {
        this.style = "height:" + (this.height - 50) + "px";
    }

/****************************** 起降点数据 ************************************/
    //获取区县年度 下的起降点
    async getSorgLift(){
        for (let i = 0; i < this.liftMarker.length; i++) {
            const element = this.liftMarker[i];
            this.tMap.removeOverLay(element);
        }
        this.liftMarker=[];
        let tj = this.taskTJCell.currRecord.data;
        let sorg = tj.sorg;
        let iym = tj.iym;
        let tjdate = {sorg:sorg,iym:iym};
        let qe: QueryEntity = new QueryEntity("20200203", "20200203TJ");
        qe.page =  {currPage: 1,index: 0,pageSize: 2000,total: 0};
        qe.cont = JSON.stringify(tjdate);
        qe.oprid = 13;
        await this.liftCell.queryData(qe).then((res:any) => { 
            let values = res.data.data.data.data;
            for (let i = 0; i < values.length; i++) {
                const element = values[i];
                let boundary = element.data.north.split(",");
                //创建图片对象
                var icon = new T.Icon({
                    iconUrl: require('@/assets/air-super/lift.png'),
                    iconSize: new T.Point(50, 50),
                    iconAnchor:new T.Point(20, 50),
                });
                //向地图上添加自定义标注
                let center = new T.LngLat(boundary[0], boundary[1]);
                var marker = new T.Marker(center,{icon: icon});
                this.tMap.addOverLay(marker); 

                let lng = this.doubleToDFM(boundary[0]) 
                let lat = this.doubleToDFM(boundary[1])  
                let text = "<div style='text-align: center;'>东经(E):"+lng+"   北纬(N):"+lat+"<br/>"+element.data.name+"</div>";
                // this.tMap.panTo(center);
                var label = new T.Label({
                    text: text,
                    position: center,
                    offset: new T.Point(-170, -120),
                });

                label.setBorderLine(0)
                label.setFontSize(14)
                label.setBackgroundColor(null);
                this.tMap.addOverLay(label);

                this.liftMarker.push(label)
                this.liftMarker.push(marker)
            }
        })
    }
    doubleToDFM(value:any){
        value = Math.abs(value);
        var v1 = Math.floor(value);//度
        var v2 = Math.floor((value - v1) * 60);//分
        var v3 = Math.round((value - v1) * 3600 % 60);//秒
        let data = v1 + '°' + v2 + '′' + v3 + '″'; 
        return data;
    }
/****************************** 起降点数据END *********************************/

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
    height: calc(100%-0px) !important;
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
.nav-tools {
    position: absolute;
    top: 1rem;
    left: 3rem;
    z-index: 999;
}
.task-info{
    border-top: 1px solid #f1f1f1;
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