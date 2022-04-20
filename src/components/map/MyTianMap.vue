<template>
    <div :id="tMapDiv" class="TMap"></div>
</template>
<script lang="ts">
/**
 * 天地图
 */
import { Component, Vue, Provide, Watch } from "vue-property-decorator";
// import {TMap} from "@/lib/TMap";
import {T} from "./js/TMap"
@Component({
  components: {

  }
})
export default class MyTianMap extends Vue {
    tMap:any=null;
    tZoom:number=12;
    tMapDiv:any= "MAP"+new Date().getTime();
    mapType:any=null
    created(){

    }
    mounted(){
        this.createdMap();
    }
    createdMap(){
        console.log("初始化天地图！")
        // var imageURL = 'http://t0.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=7b036021d9213378213ecdefb18162db';
        // //创建自定义图层对象
        // var lay = new T.TileLayer(imageURL, {minZoom: 1, maxZoom: 18,zIndex:6});
        // this.tMap = new T.Map('tMapDiv', {layers: [lay]});
        //初始化地图对象
        this.tMap = new T.Map(this.tMapDiv,{projection:"EPSG:4326"});
        // this.tMap = new T.Map(this.tMapDiv);
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
        this.mapType = new T.Control.MapType();
        //添加控件
        this.tMap.addControl(this.mapType);
        console.log("天地图初始化完成")
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
    getMap(){
        return this.tMap;
    }
    removeControl(type:any){
        if(this.tMap){
            if(type=='MapType'){
                this.tMap.removeControl(this.mapType)
            }
        }
    }
}
</script>
<style scoped lang="scss" >
.TMap{
    height: 100%;
    width: 100%;
}
</style>