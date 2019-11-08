<template>
    <div>
        <div class="Accordion">
        <!-- Accordion Title -->
            <div class="AccordionTitle">
                <slot name="title"></slot>
            </div>

        </div>
        <!-- Accordion Body -->
        <div class="AccordionBody" style="height:0px;" ref="AccordionBody">
          <!-- 接受slot的容器 -->   
          <!-- 这里我才用slot的方法把手风琴内的内容插件里，以方便控制，达到灵活的效果 -->
          <div class="ContentA" >
              <slot name="First"></slot>
          </div>
        </div>
        <div @click="Shrink" style="text-align: center;">
          <div v-show="!isShrink">
            <img src="@/assets/accordion/down.png"/>
          </div>
          <div v-show="isShrink">
            <img src="@/assets/accordion/up.png"/>
          </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import CDataSet from "@/classes/pub/CDataSet";
import SearchEntity from "@/classes/SearchEntity";
import CCliEnv from "@/classes/cenv/CCliEnv";
import { BIPUtil } from "@/utils/Request"; 
import echarts from 'echarts'; 
let tools = BIPUtil.ServApi; 
import { CommICL } from "@/utils/CommICL";

let icl = CommICL;
import { State, Action, Getter, Mutation } from "vuex-class";
import { truncate } from 'fs';
import { Menu } from "@/classes/Menu";
import { Cells } from "@/classes/pub/coob/Cells";
import CData from '../../classes/pub/CData';
import { BipLayout } from "@/classes/ui/BipLayout";
import QueryEntity from "@/classes/search/QueryEntity";
import { BIPUtils } from "@/utils/BaseUtil";
let baseTool = BIPUtils.baseUtil;
@Component({
    components: { }
})
export default class Accordion extends Vue { 
    @Prop() AccordionData:any
    @Prop() Accordionindex:any
    @Prop() isSlotSecond:any
    @Provide() isshow:any = 0;
    @Provide() isShrink:boolean = false; 

    mounted() {
      this.isshow = this.Accordionindex;
      console.log(this.isshow)
    } 
    Shrink() {
      let AllHiden:any = this.$refs.AccordionBody;
      if(AllHiden){
        let eleMoreHeight = AllHiden.childNodes[0].offsetHeight;
        AllHiden.style.height = 0 + "px";
        setTimeout(() => {
            if (this.isshow == 0) {
            AllHiden.style.height = "0px";
            this.isshow = 1;
            this.isShrink = false;
            } else {
            AllHiden.style.height = eleMoreHeight + "px";
            this.isshow = 0;
            this.isShrink = true;
            }
        }, 1);
      }
    }
}
</script>
<style scoped>
.Accordion {
  width: 100%;
  height: auto;
}
.AccordionTitle {
  width: 100%;
  display: flex;
}
/* 动画效果采用css3来实现 */
.AccordionBody {
  position: relative;
  height: auto;
  overflow: hidden;
  -webkit-transition: height 0.6s;
  -moz-transition: height 0.6s;
  -o-transition: height 0.6s;
  transition: height 0.6s;
}
.AccordionTitleL {
  float: left;
  font-size: 14px;
  background: #e4eaec;
}
.AccordionTitleR {
  float: right;
  font-size: 12px;
  color: #518bdc;
}
.LEFTTEXT {
  height: 50px;
  line-height: 50px;
}
.ClickArea {
  flex: 1;
}
.isshrink{
  width: 100%;
  height: 20px;

}
/* 后期如果有修改样式的需求，直接在你的引用页面修改就好 */
</style>