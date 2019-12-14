<template>
    <el-tabs v-model="selMap" type="card" @tab-click="mapChnage">
        <el-tab-pane :style="style" label="天地图" name="tianMap">
            <t-map style="width:100%;height:100%"></t-map>
        </el-tab-pane>
        <el-tab-pane :style="style" class="myTab" label="百度地图" name="baiduMap">
            <b-map style="width:100%;height:100%"></b-map>
        </el-tab-pane>
    </el-tabs>
</template>
<script lang="ts">
import { Component, Vue, Provide, Watch } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from "vuex-class";
import tMap from '@/components/map/MyTianMap.vue'
import bMap from '@/components/map/MyBaiMap.vue'
@Component({
  components: {
    tMap,bMap
  }
}) 
export default class OperatingArea extends Vue {
    @State('bipComHeight', { namespace: 'login' }) height!: number;
    @Provide() style:string="height:"+(this.height?this.height-50:'400')+"px";
    @Provide() selMap:string = 'tianMap';
    @Provide() tMap:any=null;
    @Provide() tZoom:number=12;
    created(){
        if(this.height){
            this.style = "height:"+(this.height-50)+"px";
        }
    }
    mounted(){ 
    }
    mapChnage(){

    } 
    @Watch('height')
    heightChange(){
        this.style= "height:"+(this.height-50)+"px";
    }  
}
</script>
<style scoped lang="scss" >
.myTab{
    height: 600px;
}
</style>