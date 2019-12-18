<template>
    <div id="tMapDiv" class="TMap"></div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Watch } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from "vuex-class";
import {T} from "./js/TMap";
@Component({
  components: {

  }
})
export default class MyTianMap extends Vue {
    @Provide() tMap:any=null;
    @Provide() tZoom:number=12;
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
}
</script>
<style scoped lang="scss" >
.TMap{
    height: 100%;
    width: 100%;
}
</style>