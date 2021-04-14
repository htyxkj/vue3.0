<template>
    <div id="bMapDiv" style="width:100%;height:100%"></div>
</template>
<script lang="ts">
/**
 * 百度地图
 */
import { Component, Vue, Provide, Watch } from "vue-property-decorator";
@Component({
  components: {

  }
}) 
export default class MyTianMap extends Vue {
    bMap:any=null;
    bZoom:number=12;
    created(){

    }
    mounted(){
        this.createdMap();
    }
    createdMap(){
        console.log("初始化百度地图！")
        // this.bMap = new BMap.Map('bMapDiv');
        // this.bMap.centerAndZoom(new BMap.Point(116.40769, 39.89945), this.bZoom);
    }
    mapChnage(){

    }  
}
</script>
<style scoped lang="scss" >
.myTab{
    height: 600px;
}
</style>