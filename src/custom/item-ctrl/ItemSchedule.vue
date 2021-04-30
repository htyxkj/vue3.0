<template>
  <div>
    <div class="analysis">
      <div id="load" :class="!loading?'load_hide':''">
        <div class="load_img">
          <!-- 加载动画 -->
          <img class="jzxz1" src="../../assets/item-ctrl/jzxz1.png">
          <img class="jzxz2" src="../../assets/item-ctrl/jzxz2.png">
        </div>
      </div>
      <div class="header">
        <h1>融通农发经营数据可视化分析</h1>
        <div class="showTime">{{ showtime }}</div>
      </div>
      <!-- 页面主体部分 -->
      <el-row>
        <el-col :span="8">
          左侧
        </el-col>
        <el-col :span="16">
          <el-row>
            <el-col :span="24">上</el-col>
            <el-col :span="24">中</el-col>
            <el-col :span="24">下</el-col>
          </el-row>
        </el-col>
      </el-row>
    </div>
  </div>
</template>
<script lang="ts">
import echarts from "echarts";
import { Component, Vue } from "vue-property-decorator";
import { Mutation } from "vuex-class";
import QueryEntity from "@/classes/search/QueryEntity";
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi;
let _ = require("lodash");
@Component({
  components: {},
})
export default class ItemAnalysis extends Vue {
  @Mutation("snkey", { namespace: "login" }) setSnkey: any;
  @Mutation("user", { namespace: "login" }) setUserInfo: any;
  @Mutation("menulist", { namespace: "login" }) setMenusInfo: any;
  page: any = { pageSize: 2000, currPage: 1, total: 0 };
  showtime: String = "";
  t: any = "";
  loading:boolean = false;

  async mounted() {
    this.loading = true;
    this.time();
    setTimeout(() => {
        this.loading = false;
    }, 2000);
  }
  // 定时器执行获取当前时间
  time() {
    clearTimeout(this.t); //清除定时器
    let dt = new Date();
    let y = dt.getFullYear();
    let mt = dt.getMonth() + 1;
    let day = dt.getDate();
    let h: any = dt.getHours(); //获取时
    let m: any = dt.getMinutes(); //获取分
    let s: any = dt.getSeconds(); //获取秒
    if (m < 10) {
      m = "0" + m;
    }
    if (s < 10) {
      s = "0" + s;
    }
    if (h < 10) {
      h = "0" + h;
    }
    this.showtime =
      y + "年" + mt + "月" + day + "-" + h + "时" + m + "分" + s + "秒";
    this.t = setTimeout(this.time, 1000); //设定定时器，循环运行
  }
}
</script>
<style lang="scss" scoped>
.analysis {
  background: url(../../assets/item-ctrl/images/bg.png) no-repeat;
  overflow-y: auto;
  height: 100%;
  position: absolute;
  width: 100%;
  background-size: 100% 100%;
  background-attachment: local;
}
.analysis::-webkit-scrollbar {
  width: 4px;
}
.analysis::-webkit-scrollbar-thumb {
  background-color: #d9d9d9;
}
.header {
  position: relative;
  height: 1.25rem;
  background: url(../../assets/bip-erp/image/head_bg.png) no-repeat;
  background-size: 100% 100%;
  h1 {
    color: #fff;
    text-align: center;
    font-size: 0.475rem;
    line-height: 1rem;
  }
  .showTime {
    position: absolute;
    right: 0.375rem;
    top: 0;
    line-height: 0.9375rem;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.25rem;
  }
}

/* 加载旋转动画 */
#load{width:100%;height:100%;position:absolute;background:url(../../assets/item-ctrl/data08.png) no-repeat #061537;background-size:cover;top:0;left:0;z-index:999}
#load .load_img{position:absolute;left:calc(50% - 182px);top:calc(50% - 182px);}
.load_img img{position:absolute;left:0;top:0;}
.load_img .jzxz1{animation:xz1 8s infinite linear;}
	@keyframes xz1 {
	  from {
	  transform:rotate(0deg);
	  }
	  50% {
	    transform:rotate(180deg);
	  }
	  to{
	  	transform:rotate(360deg);
	  }
	}	
.load_img .jzxz2{animation:xz2 7s infinite linear;}
	@keyframes xz2 {
	  from {
	  transform:rotate(0deg);
	  }
	  50% {
	    transform:rotate(-180deg);
	  }
	  to{
	  	transform:rotate(-360deg);
	  }
	}
  .load_hide{
    z-index: -1 !important;
    opacity: 0;
    -webkit-transition: all 1.3s ease-in;  
    -moz-transition: all 1.3s ease-in;  
    transition: all 1.3s ease-in;  
  }

</style>