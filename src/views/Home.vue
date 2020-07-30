<template>
  <div class="bip-main-container">
    <el-scrollbar wrap-class="scrollbar-wrapper"> 
      <grid-layout class="hoem_component" :layout="layout" :auto-size="true" :col-num="24" :row-height="10" :max-rows="1000"
        :is-draggable="true" :is-resizable="true" :vertical-compact="true" :margin="[5, 5]" :use-css-transforms="true" >
        <template v-if="layout.length>0">
          <grid-item v-for="item in layout" :key="item.i" :x="item.x"
            :y="item.y" :w="item.w" :h="item.h" :i="item.i"
            :minH="item.minh" :minW="item.minw" :maxH="item.maxh" :maxW="item.maxw" 
            :isDraggable="isDraggable" :isResizable="isResizable"
            @resize="resizeEvent" @move="moveEvent" @resized="resizedEvent" @moved="movedEvent"
            style="margin:5px;"
            >
            <home-component :type="item.comtype" :cont="item.cont" :rech="item.rech" @menuChange="menuChange" :sid="item.sid"></home-component>
          </grid-item>
        </template>
      </grid-layout>
    </el-scrollbar>
    <el-dialog title="组件选择"  class="bipinsaid" :visible.sync="showCoList" width="40%"  :append-to-body="true" >
      <el-transfer :titles="['可选组件', '已选组件']" v-model="selection" :props="{key: 'sid',label: 'sname'}" 
      :data="CoList" filterable style="margin: 20px 0px 5px 26px;"></el-transfer>
      <hr/>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showCoList = false" size="small">取 消</el-button>
        <el-button type="primary" @click="selectionSelectOK" size="small">确 定</el-button>
      </span>
    </el-dialog>

    <div class="wrap">
        <div class="inner">
          <div @click="getCoList">
            <el-tooltip class="item" effect="dark" content="组件选择" placement="top-start">
              <i class="iconfont icon-bip-zujian"/>
            </el-tooltip>
          </div>
          <div @click="isDraggable =true,isResizable=true">
            <el-tooltip class="item" effect="dark" content="编辑" placement="top-start">
              <i class="iconfont icon-bip-bianji"/>
            </el-tooltip>
          </div>
          <div @click="saveCoList">
            <el-tooltip class="item" effect="dark" content="保存" placement="top-start">
              <i class="iconfont icon-bip-baocun1"/>
            </el-tooltip>
          </div>
          <div @click="reduction">
            <el-tooltip class="item" effect="dark" content="还原" placement="top-start">              
              <i class="iconfont icon-bip-fanhui"/>
            </el-tooltip>
          </div>
        </div>
        <div class="home">
          <div @click="imgMenuClikc"><i class="iconfont icon-bip-caidan"/></div>
        </div>
    </div>     
  </div>
</template>

<script lang="ts">
import { Component, Vue, Provide ,Watch} from "vue-property-decorator";
import { State, Action, Getter, Mutation } from 'vuex-class';
import { User } from '@/classes/User';
import { Menu } from "@/classes/Menu";
import BipTask from './app/taskMsg/bipTask.vue';
import BipMsg from './app/taskMsg/bipMsg.vue';
import CDataSet from "@/classes/pub/CDataSet"; 
import { Cells } from "@/classes/pub/coob/Cells";
import homeComponent from "@/components/homeComponent/HomeComponent.vue";
import VueGridLayout from 'vue-grid-layout'
import QueryCont from '@/classes/search/QueryCont';
Vue.use(VueGridLayout)
var GridLayout = VueGridLayout.GridLayout;
var GridItem = VueGridLayout.GridItem;


import QueryEntity from '@/classes/search/QueryEntity';
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi
@Component({
  components: {
    GridLayout,
    GridItem,
    BipTask,
    BipMsg,
    homeComponent,
  }
})
export default class Home extends Vue { 
    @Mutation('setBipHeight', { namespace:'login' }) setBipHeight: any;
    @Getter('user', { namespace: 'login' }) user?: User;
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
    mounted() {
      this.cc=[{id:"1"},{id:"2"},{id:"1"},{id:"1"},{id:"1"}];
      this.initHeight();
    }
    async created(){
      this.isDraggable = false;
      this.isResizable = false;
      let dataStr = "usrcode = '*' ";
      if(this.user){
        dataStr = " usrcode ='"+this.user.userCode+"'";
        await this.selectCoList(dataStr);
        if(this.layout.length ==0 && this.user.userCode != 'portal'){
          dataStr = "usrcode = '*' ";
          await this.selectCoList(dataStr);
        }
      }
    }
    //组件移动时
    moveEvent(i:any, newX:any, newY:any,e:any){
        //console.log(e)
        // console.log("MOVE i=" + i + ", X=" + newX + ", Y=" + newY);
    }
    //组件大小改变时
    resizeEvent(i:any, newH:any, newW:any){
        // console.log("RESIZE i=" + i + ", H=" + newH + ", W=" + newW);
    }
    //组件移动结束时
    movedEvent(i:any, newX:any, newY:any,e:any){
        //console.log(e)
        //console.log("MOVED i=" + i + ", X=" + newX + ", Y=" + newY);
    }
    //组件大小改变结束时
    resizedEvent(i:any, newH:any, newW:any, newHPx:any, newWPx:any){
      let dl = this.layout[i];
      if(dl.comtype =='Report'){//报表组件
        this.$bus.$emit('componentsizechange','')
      }
        // console.log("RESIZED i=" + i + ", H=" + newH + ", W=" + newW + ", H(px)=" + newHPx + ", W(px)=" + newWPx);
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
     *设置选中桌面
     *  */ 
    selectionSelectOK(){
      let newLayout:Array<any> = [];
      for(var i =0;i<this.selection.length;i++){
        let layout ={i:i,x:0,y:0,w:0,h:0,minh:0,minw:0,maxh:0,maxw:0,sid:"",cont:"",comtype:"",rech:"",state:1,sname:"",usrcode:""}
        let dd = this.selection[i];
        let cc = this.mapList[dd];
        if(this.layout.length==0){ 
          layout.x=0;
          layout.y=0,
          layout.w=cc.minw,
          layout.h=cc.minh,
          layout.minw = cc.minw;
          layout.minh = cc.minh;
          layout.maxw = cc.maxw;
          layout.maxh = cc.maxh;
          layout.sid = cc.sid;
          layout.rech = cc.rech;
          cc.cont = JSON.parse(cc.cont)
          cc.cont.sname = cc.sname;
          layout.cont = JSON.stringify(cc.cont);
          layout.comtype = cc.comtype; 
          let userAttr = JSON.parse(window.sessionStorage.getItem("user") + "").attr;
          if(userAttr <=1){
            layout.usrcode = "*"
          }else{
            if(this.user)
              layout.usrcode = this.user.userCode 
          }
          newLayout.push(layout);
          continue;
        }
        let bh = false;
        for(var j= this.layout.length-1 ;j>=0;j--){
          let dd = this.layout[j];
          dd.i=i;
          if(dd.sid == cc.sid){
            dd.state=2;
            newLayout.push(dd);
            bh =true;
            this.layout.splice(j,1);
          }
        }  

        if(!bh){
          layout.x=0;
          layout.y=0,
          layout.w=cc.minw,
          layout.h=cc.minh,
          layout.minw = cc.minw;
          layout.minh = cc.minh;
          layout.maxw = cc.maxw;
          layout.maxh = cc.maxh;
          layout.sid = cc.sid;
          layout.rech = cc.rech;
          cc.cont = JSON.parse(cc.cont)          
          cc.cont.sname = cc.sname;
          layout.cont = JSON.stringify(cc.cont);
          layout.comtype = cc.comtype; 
          let userAttr = JSON.parse(window.sessionStorage.getItem("user") + "").attr;
          if(userAttr <=1){
            layout.usrcode = "*"
          }else{
            if(this.user)
              layout.usrcode = this.user.userCode 
          }
          newLayout.push(layout); 
        }  
      } 

      
      this.delLayout=this.delLayout.concat(JSON.parse(JSON.stringify(this.layout)));
      this.layout = []
      this.layout = newLayout;
      this.showCoList = false;
    }
    /**
     * 快捷菜单发生改变
     */
    menuChange(selection:any,sid:string){
      let menuid = "";
      for(var i=0;i<selection.length;i++){
        if(i == selection.length -1){
          menuid+=selection[i]
        }else{
          menuid+=selection[i]+";"
        }
      }
      this.layout.forEach(item => {
        if(item.sid == sid){
          let cont = JSON.parse(item.cont)
          cont.menuid = menuid;
          item.cont = JSON.stringify(cont);
        }
      });
    }
    /**
     * 保存我的桌面
     */
    async saveCoList(){
        let state =0;
        for(var i=0;i<this.delLayout.length;i++){
            this.myDesktop.currRecord.data = this.delLayout[i];
            this.myDesktop.currRecord.c_state=4
            let userAttr = JSON.parse(window.sessionStorage.getItem("user") + "").attr;
            if(this.myDesktop.currRecord.data.usrcode != "*" || userAttr<=1){
                let res = await this.myDesktop.saveData()
                if(res.data.id == 0 ){
                    state++;
                }
            }
        }
        this.delLayout = [];
        for(var i =0;i<this.layout.length;i++){
            let cc = this.layout[i]; 
            cc.x = this.layout[i].x
            cc.y = this.layout[i].y
            cc.w = this.layout[i].w
            cc.h = this.layout[i].h
            if(cc.state !=1)
            cc.state =2;
            this.myDesktop.currRecord = this.myDesktop.createOne();
            let usrcode = this.myDesktop.currRecord.data.usrcode
            this.myDesktop.currRecord.data = cc;   
            let userAttr = JSON.parse(window.sessionStorage.getItem("user") + "").attr;
            if(userAttr <=1 && usrcode!='portal'){
                this.myDesktop.currRecord.data.usrcode = "*"
            }else{
                if(cc.usrcode == '*'){
                    cc.state = 1;
                    this.myDesktop.currRecord.data.usrcode = usrcode;
                }
            }
            this.myDesktop.currRecord.c_state=cc.state;
            let res = await this.myDesktop.saveData()
            if(res.data.id == 0 ){
                state++;
            }
            cc.state =2;
        }
        this.isDraggable = false;
        this.isResizable = false;
        if(state == (this.layout.length+this.delLayout.length)){
            this.$notify.success("保存成功！");
        }else{
            this.$notify.error("保存失败！")
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
    /**
     * 还原桌面为管理员设置桌面
     */
    async reduction(){
      for(var i=0;i<this.layout.length;i++){
        this.myDesktop.currRecord.data = this.layout[i];
        this.myDesktop.currRecord.c_state=4
        if(this.myDesktop.currRecord.data.usrcode != "*"){
          this.myDesktop.saveData()
        }
      }
      this.layout=[];
      let dataStr = "usrcode = '*' ";
      await this.selectCoList(dataStr);
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

    /** 右下角扇形菜单 */
    imgMenuClikc(){
      if (this.menuIsShow) {
          // this.style.transform = 'rotate(0deg)'
          this.showInners()
      } else {
          // this.style.transform = 'rotate(-720deg)'
          this.showInners()
      }
      this.menuIsShow = !this.menuIsShow
    }
    showInners() {
      let long = 100
      let delay = 0.1
      let deg = 90

      let inners = document.querySelectorAll('.inner > div')
      let _this = this;
      inners.forEach((item:any, index) => {
          if (this.menuIsShow) {
              item.style.transition = `1s ${delay * (inners.length - index)}s`;
              item.style.transform = 'rotate(0deg) scale(1)'
              item.style.top = 0 + 'px'
              item.style.left = 0 + 'px'
          } else {
              let itemTranslate = this.getTranslate(index)
              let itemDelay = delay * (index + 1)
              item.style.transition = `1s ${itemDelay}s`;
              item.style.transform = `rotate(-360deg) scale(1)`
              item.style.top = -itemTranslate.y + 'px'
              item.style.left = -itemTranslate.x + 'px' 
              item.addEventListener('click', function () {
                  item.style.transition = `0.3s`
                  item.style.transform = `rotate(-360deg) scale(1.8)`
                  item.style.opacity = 0.1
                  item.addEventListener('transitionend', _this.scaleFun)
              })
              item.addEventListener('mousemove', function () {
                  item.style.transition = `0.2s`
                  item.style.transform = `rotate(-360deg) scale(1)`
                  item.style.opacity = 0.5
                  item.addEventListener('transitionend', _this.scaleFun)
              })
          }
      })
    }
    scaleFun(event:any) {
      let item = event.target, tmpTransform
      item.style.transform = `rotate(-360deg) scale(1)`
      item.style.opacity = 1
      item.removeEventListener('transitionend', this.scaleFun)
    }
    getTranslate(index:any) {
      let long = 100
      let deg = 90
      let inners = document.querySelectorAll('.inner > div')
      let x = 0, y = 0, itemDeg = 0
      itemDeg = (deg / (inners.length - 1)) * index
      // 角度转弧度 (deg * Math.PI) / 180
      x = Math.round(long * Math.sin((itemDeg * Math.PI) / 180))
      y = Math.round(long * Math.cos((itemDeg * Math.PI) / 180))
      return {x, y}
    }
    /** 右下角扇形菜单 end */
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
    height: calc(100% - 104px) !important;
    width: calc(100% - 30px) !important;
    z-index: 1;
    overflow: hidden;
    margin-right: 20px;
    background-color: #f8f8f8;
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
  .home {
    position: absolute;
    top: 0;
    left: 0;
    transition: 2s;
    border-radius: 50%;
    width: 100%;
  }
  .home > div {
    width: 45px;
    height: 45px;
    background-color: white;
    text-align: center;
    line-height: 45px;
    border-radius: inherit;
    color: #20a2FF;
  }
  .home > div > i{
    font-size: 30px;
  }
  .home > div:hover {
    transform: scale(1.1);
  }
</style>




