<template>
    <el-row>
        <div style="height:30px;">
            <el-dropdown @command="toolClick">
                <span class="el-dropdown-link">
                    工具<i class="el-icon-arrow-down el-icon--right"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="0">测量</el-dropdown-item>
                    <el-dropdown-item command="1">测面</el-dropdown-item>
                    <el-dropdown-item command="2">标点</el-dropdown-item>
                    <el-dropdown-item command="3">标线</el-dropdown-item>
                    <el-dropdown-item command="4">标面</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
            <el-input style="width:150px" size="mini" placeholder="如：北京" v-model="addressInput" class="input-with-select">
                <el-button slot="append" size="mini" icon="el-icon-search" @click.native="addresSel"></el-button>
            </el-input>
        </div>
        <div id="tMapDiv" class="myTMap"></div>
    </el-row>
</template>
<script lang="ts">
import { Component, Vue, Provide, Watch } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from "vuex-class";
@Component({
  components: {

  }
})
export default class MyTianMap extends Vue {
    @Provide() tMap:any=null;
    @Provide() tZoom:number=12;
    @Provide() polygonTool:any=null;//天地图画面对象
    @Provide() localsearch:any = null;//地址搜索对象
    @Provide() selCityLine:any = null;//搜索的地址边界线
    @Provide() addressInput:any = null;
    created(){

    }
    mounted(){
        this.createdMap();
    }
    createdMap(){
        console.log("初始化天地图！")
        //初始化地图对象
        this.tMap = new T.Map("tMapDiv");
        //设置显示地图的中心点和级别
        this.tMap.centerAndZoom(new T.LngLat(116.40969, 39.89945), this.tZoom);
        //创建缩放平移控件对象
        let control = new T.Control.Zoom();
        //添加缩放平移控件
        this.tMap.addControl(control);
        //创建比例尺控件对象
        let scale = new T.Control.Scale();
        //添加比例尺控件
        this.tMap.addControl(scale);
        //创建对象
        var ctrl = new T.Control.MapType();
        //添加控件
        this.tMap.addControl(ctrl);
    }
    //工具下拉选中
    toolClick(item:any){
        if(item == 0 || item ==3){//线
            let config = {
                showLabel: true
            };
            if(item==3){
                config.showLabel =false;
            }
            //创建标注工具对象
            let lineTool = new T.PolylineTool(this.tMap, config);
            lineTool.open()
            lineTool.addEventListener("draw",this.lineToolEnd);
        }else if(item == 1 || item ==4){//面    
            let config = {
                showLabel: false,
                color: "blue", weight: 3, opacity: 0.5, fillColor: "#FFFFFF", fillOpacity: 0.5
            };
            if(item==4){
                config.showLabel =false;
            }
            //创建标注工具对象
            if(!this.polygonTool){
                this.polygonTool = new T.PolygonTool(this.tMap, config);
                this.polygonTool.addEventListener("draw",this.polygonToolEnd);
            }
            this.polygonTool.open();
            //绑定draw事件 用户每次完成拉框操作时触发事件。
        }else if(item == 2){//点
            //创建标注工具对象
            let markerTool = new T.MarkTool(this.tMap, {follow: true});
            markerTool.open();
        }
    }
    /** 
    * 多边形绘制结束 
    *  currentLnglats：用户当前绘制的多边形的点坐标数组。
    *  currentArea：用户最后绘制的多边形的地理面积。
    *  currentPolygon：当前所画多边形的对象。
    *  allPolygons： 获取工具所有绘制的多边形。
    */
    polygonToolEnd(parameter:any){
        console.log(parameter)
    }
    /**
     * 线绘制结束
     */
    lineToolEnd(){
        console.log("绘制完一条线")
    }

    //添加鼠标滑过事件
    addMapMousemove(){
		this.removeMapMousemove();
		this.tMap.addEventListener("mousemove",this.MapMousemove);
	}
	//移除鼠标滑过事件
	removeMapMousemove(){
		this.tMap.removeEventListener("mousemove",this.MapMousemove);
	}
    //鼠标滑过
	MapMousemove(e:any){
		console.log(e);
    }
    //定位地址
    addresSel(){
        if(!this.localsearch){
            var config = {
                pageCapacity: 10,	//每页显示的数量
                onSearchComplete: this.localSearchResult	//接收数据的回调函数
            };
            //创建搜索对象
            this.localsearch = new T.LocalSearch(this.tMap, config);
        }else{
            this.localsearch.search(this.addressInput)
        }
    }
    //搜索返回结果
    localSearchResult(result:any){
        console.log(result)
        this.area(result.getArea());
    }
    area(obj:any) {
        if (obj) {
            if(obj.points){
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
                    if(this.selCityLine)
                        this.tMap.clearOverLays(this.selCityLine);
                    //创建线对象
                    this.selCityLine = new T.Polyline(regionLngLats, {
                        color: "blue",
                        weight: 3,
                        opacity: 1,
                        lineStyle: "dashed"
                    });
                    //向地图上添加线
                    this.tMap.addOverLay(this.selCityLine);
                }
                //显示最佳比例尺
                this.tMap.setViewport(pointsArr);
            }
            if(obj.lonlat){
                var regionArr = obj.lonlat.split(",");
                this.tMap.panTo(new T.LngLat(regionArr[0], regionArr[1]));
            }
        }
    }
    
}
</script>
<style scoped lang="scss" >
.myTMap{
    height: calc(100% - 30px)  !important;
    width: 100%；
}
</style>