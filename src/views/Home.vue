<template>
<div class="bip-main-container">
  <el-scrollbar wrap-class="scrollbar-wrapper">
    <grid-layout :layout="layout" :auto-size="true" :col-num="20" :row-height="50" :max-rows="100"
      :is-draggable="true" :is-resizable="true" :vertical-compact="true" :margin="[10, 10]" :use-css-transforms="true" >
      <grid-item v-for="item in layout" :key="item.i" :x="item.x"
        :y="item.y" :w="item.w" :h="item.h" :i="item.i" @resize="resizeEvent" @move="moveEvent" @resized="resizedEvent" @moved="movedEvent" >
        <template v-if="item.b_type == 'bipMsg'">
          <bip-msg></bip-msg>
        </template>
        <template v-else-if="item.b_type == 'bipTask'">
          <bip-task></bip-task>
        </template>
      </grid-item>
    </grid-layout>
  </el-scrollbar>
</div>
</template>

<script lang="ts">
import { Component, Vue, Provide } from "vue-property-decorator";
import echarts from 'echarts'; 
import { Menu } from "@/classes/Menu";
import BipMenu from "@/components/menu/BipMenu.vue";
import { Route, RawLocation } from 'vue-router';
import BipTask from './app/taskMsg/bipTask.vue';
import BipMsg from './app/taskMsg/bipMsg.vue';

import VueGridLayout from 'vue-grid-layout'
Vue.use(VueGridLayout)
var GridLayout = VueGridLayout.GridLayout;
var GridItem = VueGridLayout.GridItem;

@Component({
  components: {
    BipMenu,
    GridLayout,
    GridItem,
    BipTask,
    BipMsg,
  }
})
export default class Home extends Vue { 
    @Provide() layout:Array<any> = [];
    @Provide() curBox:any;
    @Provide() historyLayout:Array<any> = [];
    mounted() {
    }
    created(){
        this.layout = [
            {"x":0,"y":0,"w":10,"h":10,"i":"0","b_type":"bipMsg"},
            {"x":10,"y":10,"w":10,"h":10,"i":"1","b_type":"bipTask"},
        ];
    }
    moveEvent(i:any, newX:any, newY:any,e:any){
        //console.log(e)
        //console.log("MOVE i=" + i + ", X=" + newX + ", Y=" + newY);
    }
    resizeEvent(i:any, newH:any, newW:any){
        //console.log("RESIZE i=" + i + ", H=" + newH + ", W=" + newW);
    }
    movedEvent(i:any, newX:any, newY:any,e:any){
        //console.log(e)
        //console.log("MOVED i=" + i + ", X=" + newX + ", Y=" + newY);
    }
    resizedEvent(i:any, newH:any, newW:any, newHPx:any, newWPx:any){
        //console.log("RESIZED i=" + i + ", H=" + newH + ", W=" + newW + ", H(px)=" + newHPx + ", W(px)=" + newWPx);
    }
}
</script>
<style lang="scss" >
.bip-main-container {
    position: fixed; 
    height: calc(100% - 135px) !important;
    width: calc(100% - 30px) !important;
    z-index: 1;
    overflow: hidden;
    margin-right: 20px;
    
    .el-scrollbar {
        height: 100%;
        margin-bottom: 10px !important;
        margin-right: 0px !important; 
        .el-scrollbar__wrap {
            overflow-x: hidden !important;
            padding-right: 5px;
            height: 100%;
        }
        .scrollbar-wrapper{
          overflow-x: hidden !important;
        }
    }
}
</style>
<style lang="scss" scoped>
  .vue-grid-layout {
     position: relative;
     width:100%;
     height:450px;
  }
  .vue-grid-layout>div {
     position: absolute;
    //  background: indianred;
  }
</style>




