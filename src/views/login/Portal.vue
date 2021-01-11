<template>
  <div class="bip-main-container" v-if="showPortal">
    <div class="top">
      <el-button type="text" class="btn" @click="gaotoPage('wlogin')">登陆</el-button>
      <el-button type="text" class="btn" @click="gaotoPage('registered')">注册</el-button>
    </div>
    <el-scrollbar wrap-class="scrollbar-wrapper"> 
      <grid-layout class="hoem_component" :layout="layout" :auto-size="true" :col-num="24" :row-height="10" :max-rows="1000"
        :is-draggable="true" :is-resizable="true" :vertical-compact="true" :margin="[5, 5]" :use-css-transforms="true" >
        <template v-if="layout.length>0">
          <grid-item v-for="item in layout" :key="item.i" :x="item.x"
            :y="item.y" :w="item.w" :h="item.h" :i="item.i"
            :minH="item.minh" :minW="item.minw" :maxH="item.maxh" :maxW="item.maxw" 
            :isDraggable="isDraggable" :isResizable="isResizable" >
            <home-component :type="item.comtype" :cont="item.cont" :rech="item.rech" :sid="item.sid"></home-component>
          </grid-item>
        </template>
      </grid-layout>
    </el-scrollbar>  
  </div>
</template>

<script lang="ts">
import { Component, Vue, Provide ,Watch} from "vue-property-decorator";
import { State, Action, Getter, Mutation } from 'vuex-class';
import { User } from '@/classes/User';
import { Menu } from "@/classes/Menu";
import CDataSet from "@/classes/pub/CDataSet"; 
import { Cells } from "@/classes/pub/coob/Cells";
import homeComponent from "@/components/homeComponent/HomeComponent.vue";
import VueGridLayout from 'vue-grid-layout'
import QueryCont from '@/classes/search/QueryCont';
Vue.use(VueGridLayout)
var GridLayout = VueGridLayout.GridLayout;
var GridItem = VueGridLayout.GridItem;
import { BaseVariable } from "@/utils/BaseICL";
import QueryEntity from '@/classes/search/QueryEntity';
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi
@Component({
  components: {
    GridLayout,
    GridItem,
    homeComponent
  }
})
export default class Portal extends Vue { 
    @Mutation('setBipHeight', { namespace:'login' }) setBipHeight: any;
    @Getter('user', { namespace: 'login' }) user?: User;
    @Mutation("snkey", { namespace: 'login' }) setSnkey: any;
    @Mutation("user", { namespace: 'login' }) setUserInfo: any;
    @Mutation("menulist", { namespace: 'login' }) setMenusInfo: any;
    @Provide() layout:Array<any> = [];
    @Provide() delLayout:Array<any> = [];
    @Provide() curBox:any;
    @Provide() historyLayout:Array<any> = [];
    @Provide() showCoList:boolean = false;
    @Provide() CoList:Array<any> = new Array<any>();
    @Provide() mapList:any = {};
    @Provide() page:any ={pageSize:2000,currPage:1,total:0};
    @Provide() conditionValue:any = null;
    @Provide() conditionItem:any = "-1";
    @Provide() selection:Array<any> = [];
    @Provide() myDesktop:CDataSet = new CDataSet('');
    @Provide() isDraggable:boolean = false;//是否可拖动位置
    @Provide() isResizable:boolean = false;//是否可改变大小
    @Provide() menuIsShow:boolean=false //右下角菜单是否显示
    @Provide() height:number=400;
    @Provide() cc:Array<any> = new Array<any>();
    showPortal:boolean = false;
    async mounted() {
      this.initHeight();
      this.cc=[{id:"1"},{id:"2"},{id:"1"},{id:"1"},{id:"1"}];
      this.isDraggable = false;
      this.isResizable = false;
      await this.initPortal();
    } 
    /**
     * 获取全部组件
     */
    async getCoList(){
      this.isDraggable = true;
      this.isResizable = true;
      let qe:QueryEntity = new QueryEntity('','');
      qe.page.currPage = this.page.currPage;
      qe.page.pageSize = this.page.pageSize;
      if(this.conditionValue!=null){
        // if(this.conditionItem != '-1'){
        //   qe.cont = "~"+this.conditionItem +" like '%"+this.conditionValue+"%'"
        // }else{
        //   qe.cont = "~sid like '%"+this.conditionValue+"%' or sname like '%"+this.conditionValue+"%'"
        // }
        let allCont = [];
        let oneCont = []; 
        if(this.conditionItem != '-1'){
          let qCont = new QueryCont(this.conditionItem,this.conditionValue,12);
          qCont.setContrast(3);
          oneCont.push(qCont);
        }else{
          let qCont = new QueryCont('sid',this.conditionValue,12);
          qCont.setContrast(3);
          oneCont.push(qCont);
          qCont = new QueryCont('sname',this.conditionValue,12);
          qCont.setContrast(3);
          oneCont.push(qCont);
        }
        if(oneCont.length !=0){
          allCont.push(oneCont);
          qe.cont = "~" + JSON.stringify(allCont);
        }else{
          qe.cont = "";
        }
      }
      let cc = await tools.getBipInsAidInfo("COMPU",210,qe)
      if(cc.data.id ==0 ){

        
        this.CoList = cc.data.data.data.values;
        this.page = cc.data.data.data.page;
        this.showCoList = true;
        for(var i=0;i<this.CoList.length;i++){
          let dd = this.CoList[i];
          this.mapList[dd.sid] = dd;
        }
      }  
    }
    /**
     * 查询我的桌面
     */
    async selectCoList(dataStr:string){
      this.myDesktop = await this.getCell("INSMYDESK") 
      let qe:QueryEntity = new QueryEntity("INSMYDESK","INSMYDESK",dataStr);
      qe.oprid = 14
      qe.page.pageSize=1000
      let vv = await tools.query(qe);
      console.log(vv)
      if(vv.data.id==0){
        let cc = vv.data.data.data.data;
        for(var i=0; i<cc.length;i++){
          let data = cc[i].data;
          data.i = i;
          if(data.w == null){
            data.w=0
          }
          if(data.x == null){
            data.x=0
          }
          if(data.y == null){
            data.y=0
          }
          if(data.z == null){
            data.z=0
          }
          if(data.h == null){
            data.h=0
          }
          this.layout.push(data)
          this.selection.push(data.sid);
        }
      }
    }
    gaotoPage(url:any){
      this.$router.push({
        path:'/'+url,
        name:url,
      })
    }
    async initPortal(){
      const loading = this.$loading({
        lock: true,
        text: "加载中",
        spinner: "el-icon-loading",
        background: "background:'rgba(0, 0, 0, 0.7)'"
      });
      let res = await tools.loginWithOutPwd("portal");
      let data = res.data;
      if (data.id === 0) {
        let userI = data.data.user;
        let snkey = data.data.snkey;
        userI.password = "";
        this.setSnkey(snkey);
        this.setUserInfo(userI);
        let ms = data.data.menulist;
        this.setMenusInfo(ms);
        let dataStr = "usrcode = 'portal' ";
        await this.selectCoList(dataStr);
        loading.close();
        if(this.layout.length ==0){//跳转至登陆页面
          this.$router.push({
            path:'/wlogin',
            name:'wlogin',
          })
        }else{
          this.showPortal = true;
        }
      }else{
        loading.close();
        if(this.layout.length ==0){//跳转至登陆页面
          this.$router.push({
            path:'/wlogin',
            name:'wlogin',
          })
        }        
      }
    }

    async getCell(cellid:string){
      let res = await tools.getCCellsParams(cellid); 
      let rtn: any = res.data; 
      if (rtn.id == 0) {
        let kn: Array<Cells> = rtn.data.layCels;
        let cells = kn; 
        return new CDataSet(cells[0]);  
      }else{
        return new CDataSet('');
      }
    }

    initHeight(){
      this.height = document.documentElement.clientHeight
      if(this.height>70){
          this.height=this.height-94;
      }
      this.setBipHeight(this.height)
      window.onresize = () => {
          return (() => {
              this.height = document.documentElement.clientHeight
              // console.log(this.height)
              if(this.height>70){
                  this.height=this.height-94;
              }
              this.setBipHeight(this.height)
          })()
      }
    }
}
</script>
<style lang="scss" scoped>
.bip-main-container {
    position: fixed; 
    height: 100% !important;
    width: 100% !important;
    z-index: 1;
    overflow: hidden;
    .el-scrollbar {
        height: 100%;
        .el-scrollbar__wrap {
            overflow-x: hidden !important;
            height: 100%;
        }
        .scrollbar-wrapper{
          overflow-x: hidden !important;
        }
    }

} 
  .vue-grid-layout {
     position: relative;
     width:100%;
     height:450px;
  }
  .vue-grid-layout>div {
     position: absolute;
  } 
  .wrap {
    position: fixed;
    right: 10px;
    bottom: 10px;
    width: 50px;
    height: 50px;
  }
  .inner {
    height: 100%;
    width: 100%;
    border-radius: 50%;
  }
  .inner > div {
    position: absolute;
    top: 0;
    left: 0;
    margin: 8px;
    width: 70%;
  }
  .inner > div > i{
    font-size: 30px;
    color:#20a2FF;
  }
  .top{
    position: absolute;
    z-index: 999999;
    width: 100%;
    height: 50px;
    line-height: 50px;
    background-color: #eaeaea52;
  }
  .btn{
    color: #ffffff !important;
    float: right;
    padding-right: 50px;
    font-size: 17px;
  }
</style>




