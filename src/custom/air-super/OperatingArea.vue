<template>
  <div>
    <el-tabs
      v-model="selMap"
      type="card"
      @tab-click="mapChnage"
      style="min-height: -webkit-fill-available">
      <el-tab-pane :style="style" label="天地图" name="tianMap">
        <el-container class="padding0" :style="style">
          <el-header style="height:35px; padding-bottom:5px;" class="padding0">
            <div>
              <el-row>
                <el-col :span="12">
                  <el-input style="width:300px" size="mini" placeholder="请输入行政名称如：北京" v-model="addressInput" class="input-with-select" >
                    <el-button slot="append" size="mini" icon="el-icon-search" @click.native="addresSel(addressInput)" ></el-button>
                  </el-input>
                </el-col>
                <el-col :span="12">
                    <div class="tools">
                        <span class="tools-li">
                            <el-dropdown trigger="click" @command="toolClick" size="mini" split-button >
                                <span class="el-dropdown-link">工具</span>
                                <el-dropdown-menu slot="dropdown">
                                <el-dropdown-item command="1">作业区规划(面)</el-dropdown-item>
                                <el-dropdown-item command="2">作业区规划(线)</el-dropdown-item>
                                <!-- <el-dropdown-item command="0">航线规划</el-dropdown-item> -->
                                <el-dropdown-item command="3">避让区规划(面)</el-dropdown-item>
                                <el-dropdown-item command="4">避让区规划(线)</el-dropdown-item>
                                <el-dropdown-item command="5">避让点</el-dropdown-item>
                                </el-dropdown-menu>
                            </el-dropdown>
                        </span>
                        <span class="tools-li">
                            <el-button  size="mini" icon="el-icon-delete" @click="clearCover">清空</el-button>
                        </span>
                        <span class="tools-li">
                            <el-button size="mini" icon="el-icon-search" @click="showOperaDia =!showOperaDia">查找</el-button>
                        </span>       
                    </div>
                </el-col>
              </el-row>
            </div>
          </el-header>
          <el-container class="padding0 mapMain">
            <el-aside :width="areaWidth+'px'">
              <el-tree :node-key="keyID" lazy :load="loadNode" :props="defaultProps" @node-click="handleNodeClick" :default-expanded-keys="expandedKeys" ></el-tree>
            </el-aside>
            <el-main class="padding0" style="overflow: hidden;position: relative;">
              <t-map ref="TMap" class="myTMap"></t-map>
              <a class="areaBtn" @click="areaBtnClick">
                <template v-if="areaBtnOpen">
                  <i class="iconfont icon-bip-up"></i>
                </template>
                <template v-else>
                  <i class="iconfont icon-bip-next"></i>
                </template>
              </a>
              <a class="operaBtn" @click="operaBtnClick">
                <template v-if="!operaBtnOpen">
                  <i class="iconfont icon-bip-up"></i>
                </template>
                <template v-else>
                  <i class="iconfont icon-bip-next"></i>
                </template>
              </a>
            </el-main>
            <el-aside :width="operaWidth+'px'">
              <div>
                <el-checkbox-group v-model="checkOperaList" @change="checkBoxChange">
                  <el-row v-for="(item,index) in operaData" :key="index">
                    <el-row style="padding-top:5px;border-top: 1px solid #f1f1f1;margin-bottom: 5px;">
                      <el-col :span="4" style="height:60px;line-height:60px;text-align: center;">
                        <el-checkbox class="myOperatingAreaCheck" :label="item.data.kid" :key="item.data.kid"></el-checkbox>
                      </el-col>
                      <el-col :span="20" style="height:60px;">
                        <el-row>
                          <el-col :span="24" style="height:20px;font-size: 0.8rem; color: rgba(0,0,0,.54)">{{item.data.name}}</el-col>
                          <el-col
                            :span="24"
                            style="height:20px;color: rgba(0,0,0,.54);font-size: .12rem;"
                          >{{item.data.address}}</el-col>
                        </el-row>
                        <el-row>
                          <el-col :span="24" > 
                            <el-row style="textAlign:center;">
                              <el-col :span="6">
                                <el-button type="primary" @click="editOpera(item.data.kid)" style="padding:2px; font-size:0.12rem;">编辑</el-button>
                              </el-col>
                              <el-col :span="6">
                                  <el-button type="info" @click="copyOpera(item.data.kid)" style="padding:2px; font-size:0.12rem;">复制</el-button>
                              </el-col>
                              <el-col :span="6">
                                <el-button type="danger" @click="delOpera(item.data.kid)" style="padding:1px; font-size:0.12rem;">删除</el-button>   
                              </el-col>
                              <el-col :span="6">
                                <el-button type="danger" @click="showOperaBr(item.data.kid)" style="padding:1px; font-size:0.12rem;">避让区</el-button>   
                              </el-col>
                            </el-row>                   
                          </el-col>
                        </el-row>
                      </el-col>
                    </el-row>
                    <el-row style="font-size:14px;">
                      <el-row v-for="(item,index) in operaBrData[item.data.kid]">
                        <el-col :span="4">&nbsp;</el-col>
                        <el-col :span="12">{{item.data.name}}</el-col>
                        <el-col :span="8">
                          <el-button type="text" @click="editOperaBr(item.data)" style="padding:2px; font-size:0.12rem;">编辑</el-button>
                          <el-button type="text" @click="delOperaBr(item.data,index)" style="padding:2px; font-size:0.12rem;">删除</el-button>
                        </el-col>
                      </el-row>
                    </el-row>
                  </el-row>
                </el-checkbox-group>
                <div class="line"></div>
                <div class="oper-pagination">
                  <el-pagination small layout="prev, pager, next" @current-change="pageChange" :page-size="operaCellPage.pageSize" :total="operaCellPage.total"></el-pagination>
                </div>
              </div>
            </el-aside>
          </el-container>
        </el-container>
      </el-tab-pane>
      <el-tab-pane :style="style" class="myTab" label="百度地图" name="baiduMap">
        <b-map style="width:100%;height:100%"></b-map>
      </el-tab-pane>
    </el-tabs>
    <el-dialog title="查找作业区" :visible.sync="showOperaDia" width="50%"  class="bip-query">
      <el-row class="bip-lay">
        <el-form @submit.native.prevent label-position="right" label-width="100px">
          <div v-for="(cel,index) in operaTjCell.ccells.cels" :key="'A'+index">
            <bip-comm-editor
              v-if="(cel.attr&0x400) <= 0 "
              :cell="cel"
              :bgrid="false"
              :cds="operaTjCell"
              :row="0"
            />
          </div>
        </el-form>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showOperaDia = false" size="mini">取 消</el-button>
        <el-button type="primary" @click="getOpera" size="mini">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="新增作业区" :visible.sync="showSaveOperaDia" width="50%" class="bip-query">
      <el-row class="bip-lay">
        <el-form @submit.native.prevent label-position="right" label-width="100px">
          <div v-for="(cel,index) in operaSaveCell.ccells.cels" :key="'A'+index">
            <bip-comm-editor
              v-if="(cel.attr&0x400) <= 0 "
              :cell="cel"
              :bgrid="false"
              :cds="operaSaveCell"
              :row="0"
            />
          </div>
        </el-form>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showSaveOperaDia = false" size="mini">取 消</el-button>
        <el-button type="primary" @click="saveOpera" size="mini">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="新增避让区" :visible.sync="showSaveOperaBrDia" width="50%" class="bip-query">
      <el-row class="bip-lay">
        <el-form @submit.native.prevent label-position="right" label-width="100px">
          <div v-for="(cel,index) in operaBrCell.ccells.cels" :key="'A'+index">
            <bip-comm-editor
              v-if="(cel.attr&0x400) <= 0 "
              :cell="cel"
              :bgrid="false"
              :cds="operaBrCell"
              :row="0"
            />
          </div>
        </el-form>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showSaveOperaBrDia = false" size="mini">取 消</el-button>
        <el-button type="primary" @click="saveOperaBr" size="mini">确 定</el-button>
      </span>
    </el-dialog>
    
  </div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Watch } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from "vuex-class";
import QueryEntity from "@/classes/search/QueryEntity";
import QueryCont from "@/classes/search/QueryCont";
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi;
import { Cells } from "@/classes/pub/coob/Cells";
import CDataSet from "@/classes/pub/CDataSet";
import tMap from "@/components/map/MyTianMap.vue";
import bMap from "@/components/map/MyBaiMap.vue";
import {T} from "@/components/map/js/TMap";
@Component({
  components: {
    tMap,
    bMap
  }
})
export default class OperatingArea extends Vue {
  @State("bipComHeight", { namespace: "login" }) height!: number;
  @Provide() style: string =
    "height:" + (this.height ? this.height - 50 : "400") + "px";
  @Provide() selMap: string = "tianMap";
  @Provide() tMap: any = null;
  @Provide() tZoom: number = 12;
  @Provide() areaWidth: number = 0; //测边行政区宽度
  @Provide() areaBtnOpen: boolean = false; //左侧行政区是否显示
  @Provide() expandedKeys: any = []; //行政区默认展开的节点的 key 的数组
  @Provide() keyID: any = "id"; //每个树节点用来作为唯一标识的属性，整棵树应该是唯一的
  @Provide() expandedLevel: any = -1; //默认展开级次数
  @Provide() fatherID: any = "parid"; //树状结构上下级关系字段
  @Provide() defaultProps: any = { label: "name" };

  @Provide() operaWidth: number = 0; //右侧作业区宽度
  @Provide() operaBtnOpen: boolean = false; //右侧作业区是否显示

  @Provide() polygonTool: any = null; //天地图画面对象
  @Provide() lineTool:any = null;//天地图划线对象
  @Provide() markerTool:any = null;//天地图画点对象

  @Provide() localsearch: any = null; //地址搜索对象
  @Provide() selCityLine: any = null; //搜索的地址边界线
  @Provide() addressInput: any = null; //地址框

  @Provide() showOperaDia: boolean = false; //是否显示作业区查找框
  @Provide() operaTjCell: CDataSet = new CDataSet(""); //作业区对象(查询条件)
  @Provide() operaData: any = []; //作业区数据
  @Provide() operaJSON: any = {}; //k v 格式作业区
  @Provide() checkOperaList: any = []; //作业区勾选数据
  @Provide() operaCellPage: any = {currPage: 1,index: 0,pageSize: 20,total: 0}; //作业区查询分页数据

  @Provide() operaBrData: any = {}; //避让区数据
  @Provide() operaBrJSON: any = {}; //避让区数据每一条

  @Provide() operaBrCell:CDataSet = new CDataSet("");//避让点对象
  @Provide() showSaveOperaBrDia:boolean =false;//是否显示新增避让点弹框

  @Provide() mapOpera: any = {}; //地图作业区覆盖集合
  @Provide() mapOperaTxt: any = {}; //地图作业区文字说明集合

  @Provide() operaSaveCell: CDataSet = new CDataSet(""); //作业区对象（保存对象）
  @Provide() showSaveOperaDia: boolean = false; //是否显示新增作业区弹框
  @Provide() editKid: any = null; //当前正在进行保存的kid 已经弹出保存框了

  @Provide() checkkid:any = null;//当前页选中的作业区ID 在勾选避让区域时用到

  @Provide() selTool:any = null;//当前选中工具

  async created() {
    if (this.height) {
      this.style = "height:" + (this.height - 50) + "px";
    }
    this.operaTjCell = await this.getCell("F2015TJ");//作业区查询条件
    this.operaTjCell.createRecord();
    this.operaSaveCell = await this.getCell("F2015");//作业区
    this.operaBrCell = await this.getCell("F2015A");//避让点
  }
  mounted() {
    if (this.$refs.TMap) {
      let refT: any = this.$refs.TMap;
      this.tMap = refT.getMap();
    }
  }
  mapChnage() {
    console.log("地图切换！");
  }
  //清空地图覆盖物
  clearCover() {
    this.mapOpera = {};
    this.mapOperaTxt = {};
    this.checkOperaList = [];
    this.tMap.clearOverLays();
  }
  //左侧行政区开关
  async areaBtnClick() {
    this.areaBtnOpen = !this.areaBtnOpen;
    if (this.areaBtnOpen) {
      //进行打开左侧行政区
      while (this.areaWidth <= 200) {
        this.areaWidth++;
      }
    } else {
      //关闭左侧行政区
      while (this.areaWidth > 0) {
        this.areaWidth--;
      }
    }
    if (!this.tMap) {
      if (this.$refs.TMap) {
        let refT: any = this.$refs.TMap;
        this.tMap = refT.getMap();
        setTimeout(() => {
          this.tMap.checkResize();  
        }, 200);        
      }
    } else {
      setTimeout(() => {
        this.tMap.checkResize();  
      }, 200);
    }
  }
  //右侧作业区开关
  async operaBtnClick() {
    this.operaBtnOpen = !this.operaBtnOpen;
    if (this.operaBtnOpen) {
      //进行打开右侧作业区开关
      while (this.operaWidth <= 300) {
        this.operaWidth++;
      }
    } else {
      //关闭右侧作业区开关
      while (this.operaWidth > 0) {
        this.operaWidth--;
      }
    }
    if (!this.tMap) {
      if (this.$refs.TMap) {
        let refT: any = this.$refs.TMap;
        this.tMap = refT.getMap();
        setTimeout(() => {
          this.tMap.checkResize();  
        }, 200);
      }
    } else {
      setTimeout(() => {
        this.tMap.checkResize();  
      }, 200);
    }
  }
  //工具下拉选中
  toolClick(item: any) {
    // <el-dropdown-item command="1">作业区规划(面)</el-dropdown-item>
    // <el-dropdown-item command="2">作业区规划(线)</el-dropdown-item>
    // <el-dropdown-item command="3">避让区规划(面)</el-dropdown-item>
    // <el-dropdown-item command="4">避让区规划(线)</el-dropdown-item>
    // <el-dropdown-item command="5">避让点</el-dropdown-item>
    if(item == 3 || item == 4 || item ==5){//画避让区域
      //判断一下是否只勾选了一个作业区
      let num =0;
      for(var i =0;i<this.operaData.length;i++){
        let d1 = this.operaData[i].data
        if(this.checkOperaList.indexOf(d1.kid) !=-1){
          this.checkkid = d1.kid;
          num++
        }
        if(num == 2)
          break;
      }
      if(num>1){
        this.$notify.warning("请勾选一个作业区！")
        return;
      }else if(num ==0){
        this.$notify.warning("请勾选作业区！")
        return;
      }      
    }
    this.selTool = item;
    if (item == 2 || item == 4) {
      //线
      let config = {
        showLabel: false
      };
      //创建标注工具对象
      if(!this.lineTool){
        this.lineTool = new T.PolylineTool(this.tMap, config);        
        this.lineTool.addEventListener("draw", this.lineToolEnd);
      }
      this.lineTool.open();
      if(this.polygonTool)
        this.polygonTool.close();
      if(this.markerTool)
        this.markerTool.close();
    } else if (item == 1 || item == 3) {
      //面
      let config = {
        showLabel: false,
        color: "blue",
        weight: 3,
        opacity: 0.5,
        fillColor: "#FFFFFF",
        fillOpacity: 0.5
      };
      //创建标注工具对象
      if (!this.polygonTool) {
        this.polygonTool = new T.PolygonTool(this.tMap, config);
        //绑定draw事件 用户每次完成拉框操作时触发事件。
        this.polygonTool.addEventListener("draw", this.polygonToolEnd);
      }
      this.polygonTool.open();
      if(this.markerTool)
        this.markerTool.close();
      if(this.lineTool)
        this.lineTool.close();
    } else if (item == 5) {
      //点
      //创建标注工具对象
      if(!this.markerTool){
        this.markerTool = new T.MarkTool(this.tMap, { follow: true });
        this.markerTool.addEventListener("mouseup",this.markerToolEnd);
      }
      this.markerTool.open();
      if(this.lineTool)
        this.lineTool.close();
      if(this.polygonTool)
        this.polygonTool.close();
    }
  }
  /**
   * 线绘制结束
   * currentLnglats：用户当前绘制的折线的点坐标数组。
   * currentDistance：用户当前绘制的折线的地理长度。
   * currentPolyline：当前测距所画线的对象。
   * allPolylines：返回所有工具绘制的线对象。
   */
  lineToolEnd(parameter: any) {
    this.tMap.removeOverLay(parameter.currentPolyline)
    //创建面对象
    let editCover = new T.Polygon(parameter.currentLnglats, {
      color: "blue",
      weight: 3,
      opacity: 0.5,
      fillColor: '#FFFFFF',
      fillOpacity: 0.5
    });
    this.tMap.addOverLay(editCover);
    let key = "non-" + new Date().getTime();
    editCover.kid = key;
    this.editKid = key;
    editCover.addEventListener("dblclick", this.coverDBClick);
    this.mapOpera[key] = editCover;
    editCover.enableEdit();
    let boundary1 = "";
    for (var i = 0; i < parameter.currentLnglats.length; i++) {
      let point = parameter.currentLnglats[i];
      boundary1 += point.getLng() + "," + point.getLat() + ";";
    }
    boundary1 = boundary1.substring(0, boundary1.length - 1);
    if(this.selTool == 2){//作业区规划  线
      console.log("作业区规划 线")
      this.operaSaveCell.clear();
      this.operaSaveCell.createRecord();
      this.operaSaveCell.currRecord.data.area = (
        parameter.currentArea / 666.66
      ).toFixed(2);
      this.operaSaveCell.currRecord.data.boundary1 = boundary1;
      this.showSaveOperaDia = true;
    }else if(this.selTool == 4){//避让区规划  线
      this.operaBrCell.clear()
      this.operaBrCell.createRecord();
      this.operaBrCell.currRecord.data.oid = this.checkkid;
      this.operaBrCell.currRecord.data.type = 1;
      this.operaBrCell.currRecord.data.avoid = boundary1;
      this.showSaveOperaBrDia = true;
    }
  }
  /**
   * 多边形绘制结束
   *  currentLnglats：用户当前绘制的多边形的点坐标数组。
   *  currentArea：用户最后绘制的多边形的地理面积。
   *  currentPolygon：当前所画多边形的对象。
   *  allPolygons： 获取工具所有绘制的多边形。
   */
  polygonToolEnd(parameter: any) {
    let editCover = parameter.currentPolygon;
    let key = "non-" + new Date().getTime();
    editCover.kid = key;
    this.editKid = key;
    editCover.addEventListener("dblclick", this.coverDBClick);
    this.mapOpera[key] = editCover;
    editCover.enableEdit();
    let boundary1 = "";
    for (var i = 0; i < parameter.currentLnglats.length; i++) {
      let point = parameter.currentLnglats[i];
      boundary1 += point.getLng() + "," + point.getLat() + ";";
    }
    boundary1 = boundary1.substring(0, boundary1.length - 1);
    if(this.selTool == 1){//作业区规划  面      
      this.operaSaveCell.clear();
      this.operaSaveCell.createRecord();
      this.operaSaveCell.currRecord.data.area = (
        parameter.currentArea / 666.66
      ).toFixed(2);
      this.operaSaveCell.currRecord.data.boundary1 = boundary1;
      this.showSaveOperaDia = true;
    }else if(this.selTool == 3){//避让区规划  面
      this.operaBrCell.clear()
      this.operaBrCell.createRecord();
      this.operaBrCell.currRecord.data.oid = this.checkkid;
      this.operaBrCell.currRecord.data.type = 1;
      this.operaBrCell.currRecord.data.avoid = boundary1;
      this.showSaveOperaBrDia = true;
    }
  }
  /**
   * 点绘制完成
   * currentLnglat:：用户在地图上标的坐标。
   * currentMarker：用户当前的标注点对象。
   * allMarkers：用户使用工具所有的标注点对象。
   */
  markerToolEnd(parameter: any){
    if(this.selTool == 5){
      console.log("避让点")
      let lnglat = parameter.currentLnglat;
      let avoid = lnglat.getLng()+","+lnglat.getLat();
      this.operaBrCell.clear()
      this.operaBrCell.createRecord();
      this.operaBrCell.currRecord.data.oid = this.checkkid;
      this.operaBrCell.currRecord.data.type = 0;
      this.operaBrCell.currRecord.data.avoid = avoid;
      this.showSaveOperaBrDia = true;
    }
  }
  /**
   * 作业区双击
   */
  coverDBClick(data: any) {
    let target = data.target;
    let kid = target.kid;
    this.editKid = target.kid;
    let points = target.getLngLats()[0];
    let cover = this.mapOpera[kid];
    if (kid) {
      let iscopy:boolean = false;
      if(kid.indexOf("copy-") !=-1){//是复制的图层
        kid = kid.split("-")[1];
        iscopy = true;
      }
      //创建标注工具对象 用来计算面积
      let polygonTool = new T.PolygonTool(this.tMap);
      let boundary1 = "";
      for (var i = 0; i < points.length; i++) {
        let point = points[i];
        boundary1 += point.getLng() + "," + point.getLat() + ";";
      }
      boundary1 = boundary1.substring(0, boundary1.length - 1);
      if(this.selTool == 1 || this.selTool == 2){//作业区域
        let d1 = this.operaJSON[kid];
        this.operaSaveCell.clear();
        this.operaSaveCell.createRecord();
        let area = polygonTool.getArea(points);
        if (d1 && iscopy == false) {
          //存在进行修改
          this.operaSaveCell.currRecord.data = d1;
          this.operaSaveCell.currRecord.c_state = 2;
        } else {
          if(iscopy){
            this.operaSaveCell.currRecord.data = d1;
          }
          //新增
          this.operaSaveCell.currRecord.c_state = 1;
        }
        this.operaSaveCell.currRecord.data.area = (area / 666.66).toFixed(2);
        this.operaSaveCell.currRecord.data.boundary1 = boundary1;
        this.showSaveOperaDia = true;
      }else if(this.selTool == 3 || this.selTool == 4){//避让区域
        let d1 = this.operaBrJSON[kid];
        this.operaBrCell.clear()
        this.operaBrCell.createRecord();
        if(d1){
          this.operaBrCell.currRecord.data = d1;
          this.operaBrCell.currRecord.c_state = 2;
        }else{
          this.operaBrCell.currRecord.c_state = 1;
          this.operaBrCell.currRecord.data.oid = this.checkkid;
        }
        this.operaBrCell.currRecord.data.type = 1;
        this.operaBrCell.currRecord.data.avoid = boundary1;
        this.showSaveOperaBrDia = true;
      }
    }
  }
  /**
   * 复制作业区  作业区唯一码
   * @param kid 作业区唯一码
   */
  copyOpera(kid: any){
    if(this.checkOperaList.indexOf(kid) ==-1){
      this.checkOperaList.push(kid);
    }
    let d1 = this.operaJSON[kid];
    kid = "copy-"+kid;
    let cc:any = this.makeOpera(d1);
    let polygon = cc[0];
    let points = cc[1];
    //向地图上添加面
    this.tMap.addOverLay(polygon);
    let t1 = this.tMap.getViewport(points);
    this.tMap.panTo(t1.center, t1.zoom);
    this.mapOpera[kid] = polygon;
    let label = this.makeOperaLableTXT(d1, t1);
    this.tMap.addOverLay(label);
    this.mapOperaTxt[kid] = label;
    polygon.enableEdit();
    polygon.kid = kid;
    polygon.addEventListener("dblclick", this.coverDBClick);
  }
  /**
   * 编辑作业区  作业区唯一码
   * @param kid 作业区唯一码
   */
  editOpera(kid: any) {
    let cover = this.mapOpera[kid];
    if (cover) {
      cover.removeEventListener("dblclick", this.coverDBClick);
      cover.addEventListener("dblclick", this.coverDBClick);
      cover.enableEdit();
      cover.kid = kid;
    } else {
      let d1 = this.operaJSON[kid];
      let cc:any = this.makeOpera(d1);
      let polygon = cc[0];
      let points = cc[1];
      //向地图上添加面
      this.tMap.addOverLay(polygon);
      let t1 = this.tMap.getViewport(points);
      this.tMap.panTo(t1.center, t1.zoom);
      this.mapOpera[kid] = polygon;
      let label = this.makeOperaLableTXT(d1, t1);
      this.tMap.addOverLay(label);
      this.mapOperaTxt[kid] = label;
      polygon.enableEdit();
      polygon.kid = kid;
      polygon.addEventListener("dblclick", this.coverDBClick);
    }
    if (this.checkOperaList.indexOf(kid) == -1) {
      this.checkOperaList.push(kid);
    }
  }
  /**
   * 删除作业区
   * @param kid 作业区唯一码
   */
  delOpera(kid: any) {
    let d1 = this.operaJSON[kid];
    let co = "此操作将删除作业区：" + d1.name + "，是否继续？";
    this.operaSaveCell.clear();
    this.operaSaveCell.createRecord();
    this.$confirm(co, "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    })
      .then(() => {
        if (d1) {
          //存在进行修改
          this.operaSaveCell.currRecord.data = d1;
          this.operaSaveCell.currRecord.c_state = 4;
        }
        this.del();
      })
      .catch(() => {
        this.$message({
          type: "info",
          message: "已取消删除"
        });
      });
  }
  //进行删除
  async del() {
    let key = this.operaSaveCell.currRecord.data.kid;
    let res: any = await this.operaSaveCell.saveData();
    if (res.data && res.data.id == 0) {
      if (this.mapOpera[key]) this.tMap.removeOverLay(this.mapOpera[key]);
      if (this.mapOperaTxt[key]) this.tMap.removeOverLay(this.mapOperaTxt[key]);
      this.$notify.success("删除成功！");
      this.getOpera();
    } else {
      this.$notify.error("删除失败！");
    }
  }
  /**
   * 编辑避让区
   */
  editOperaBr(data:any){
    this.selTool = 3;
    let kid = data.oid+"_"+data.oaid;
    let cover = this.mapOpera[kid];
    if (cover) {
      cover.removeEventListener("dblclick", this.coverDBClick);
      cover.addEventListener("dblclick", this.coverDBClick);
      cover.enableEdit();
      cover.kid = kid;
    } else {
      let d11 = this.operaBrJSON[kid];
      let d1 = {boundary1:d11.avoid,color:d11.color}
      let cc:any = this.makeOpera(d1);
      let polygon = cc[0];
      let points = cc[1];
      //向地图上添加面
      this.tMap.addOverLay(polygon);
      let t1 = this.tMap.getViewport(points);
      this.tMap.panTo(t1.center, t1.zoom);
      this.mapOpera[kid] = polygon;
      polygon.enableEdit();
      polygon.kid = kid;
      polygon.addEventListener("dblclick", this.coverDBClick);
    }
  }
  /**
   * 删除避让区
   */
  delOperaBr(data:any,index:any){
    let k = data.oid+"_"+data.oaid;
    let d1 = this.operaBrJSON[k];
    let co = "此操作将删除避让区区：" + d1.name + "，是否继续？";
    this.operaBrCell.clear();
    this.operaBrCell.createRecord();
    this.$confirm(co, "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    })
      .then(() => {
        if (d1) {
          //存在进行修改
          this.operaBrCell.currRecord.data = d1;
          this.operaBrCell.currRecord.c_state = 4;
        }
        this.delBr(k);
      })
      .catch(() => {
        this.$message({
          type: "info",
          message: "已取消删除"
        });
      });
  }
  /**
   * 进行删除避让区
   */
  async delBr(key:string){
    let res: any = await this.operaBrCell.saveData();
    if (res.data && res.data.id == 0) {
      if (this.mapOpera[key]) this.tMap.removeOverLay(this.mapOpera[key]);
      delete this.operaBrJSON[key]
      this.$notify.success("删除成功！");
      await this.showOperaBr(key.split("_")[0]);
    } else {
      this.$notify.error("删除失败！");
    }
  }
  /**
   * 保存新增作业区
   */
  async saveOpera() {
    let bok = this.checkNotNull(this.operaSaveCell);
    if (!bok) return;
    let res: any = await this.operaSaveCell.saveData();
    if (res.data && res.data.id == 0) {
      await this.getOpera();
      let kid = res.data.data.kid;
      if (kid) {
        if (this.mapOpera[this.editKid]){
          this.tMap.removeOverLay(this.mapOpera[this.editKid]);
          delete this.mapOpera[this.editKid];
        }
        if(this.mapOperaTxt[this.editKid]){
          this.tMap.removeOverLay(this.mapOperaTxt[this.editKid]);
          delete this.mapOperaTxt[this.editKid];
        }
        this.checkOperaList.push(kid);
        this.checkBoxChange(this.checkOperaList);
      }
      this.$notify.success("保存成功！");
      this.showSaveOperaDia = false;
    } else {
      this.$notify.error("保存失败！");
    }
  }
  /**
   * 保存新增避让区
   */
  async saveOperaBr() {
    let bok = this.checkNotNull(this.operaBrCell);
    if (!bok) return;
    let res: any = await this.operaBrCell.saveData();
    if (res.data && res.data.id == 0) {
      if (this.mapOpera[this.editKid]){
        this.tMap.removeOverLay(this.mapOpera[this.editKid]);
        delete this.mapOpera[this.editKid];
      }
      await this.showOperaBr(this.editKid.split("_")[0]);
      this.makrAllBr(this.editKid.split("_")[0]);
      this.$notify.success("保存成功！");
      this.showSaveOperaBrDia = false;
    } else {
      this.$notify.error("保存失败！");
    }
  }
  //定位地址
  async addresSel(address: string) {
    if (!this.localsearch) {
      var config = {
        pageCapacity: 10, //每页显示的数量
        onSearchComplete: this.localSearchResult //接收数据的回调函数
      };
      //创建搜索对象
      this.localsearch = new T.LocalSearch(this.tMap, config);
    }
    let oneCont =[];
    let allCont = [];
    let cont = "";
    let qCont = new QueryCont('a.name', address, 12);
    qCont.setContrast(3);
    oneCont.push(qCont);
    if (oneCont.length != 0) {
      allCont.push(oneCont);
      cont = "~" + JSON.stringify(allCont);
    }
    let qe: QueryEntity = new QueryEntity("", "");
    qe.page.currPage = 1;
    qe.page.pageSize = 400;
    qe.cont = cont;
    let vv = await tools.getBipInsAidInfo("ORGBYAREAN", 210, qe);
    if(vv.data.id == 0){
      let values = vv.data.data.data.values;
      if(values.length>0){
        let orgcode = "";
        for(var i=0;i<values.length;i++){
          orgcode +=values[i].orgcode+";"
        }
        orgcode = orgcode.substring(0,orgcode.length-1);
        this.operaTjCell.currRecord.data.sorg = orgcode;
        this.getOpera()
      }else{
        this.operaData=[];
      }
    }
    this.clearCover();
    this.localsearch.search(address);
  }
  //搜索返回结果
  localSearchResult(result: any) {
    //根据返回类型解析搜索结果
    switch (parseInt(result.getResultType())) {
      case 1:
        //解析点数据结果
        this.pois(result.getPois());
        break;
      case 3:
        //解析行政区划边界
        this.area(result.getArea());
        break;
    }
  }
  //行政区
  area(obj: any) {
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
                //创建线对象
                var line = new T.Polyline(regionLngLats, {
                    color: "blue",
                    weight: 3,
                    opacity: 1,
                    lineStyle: "dashed"
                });
                //向地图上添加线
                this.tMap.addOverLay(line);
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
  //点
  pois(obj:any) {
    if (obj) {
      //坐标数组，设置最佳比例尺时会用到
      var zoomArr = [];
      for (var i = 0; i < obj.length; i++) {
          //闭包
          (function (i) {
              //坐标
              var lnglatArr = obj[i].lonlat.split(" ");
              var lnglat = new T.LngLat(lnglatArr[0], lnglatArr[1]);
              zoomArr.push(lnglat);
          })(i);
      }
      //显示地图的最佳级别
      this.tMap.setViewport(zoomArr);
    }
  }
  /**
   * 懒加载
   * 获取下一节点树状行政区
   */
  async loadNode(node: any, resolve: any) {
    let cont = "";
    let allCont = [];
    let oneCont = [];
    let v = null;
    if (node.data) v = node.data[this.keyID];
    if (node.level === 0) {
      cont = "isnull(" + this.fatherID + ",'') = '' ";
      //classes/search/QueryCont'; 有详细说明
      let qCont = new QueryCont("isnull(" + this.fatherID + ",'')", "", 12);
      qCont.setContrast(0);
      oneCont.push(qCont);
      if (oneCont.length != 0) {
        allCont.push(oneCont);
        cont = "~" + JSON.stringify(allCont);
      }
    } else {
      //classes/search/QueryCont'; 有详细说明
      let qCont = new QueryCont(this.fatherID, v, 12);
      qCont.setContrast(0);
      oneCont.push(qCont);
      if (oneCont.length != 0) {
        allCont.push(oneCont);
        cont = "~" + JSON.stringify(allCont);
      }
    }
    let data: any = await this.initTree(cont, v);
    if (data) {
      if (!Array.isArray(data)) {
        data = [data];
      }
      if (this.expandedLevel > 0 && node.level + 1 <= this.expandedLevel) {
        for (var i = 0; i < data.length; i++) {
          let cc: any = data[i];
          this.expandedKeys.push(cc[this.keyID]);
        }
      }
      resolve(data);
    } else {
      resolve([]);
    }
  }
  /**
   * 获取节点数据
   */
  async initTree(vl: any, v: any) {
    let key = "city" + v;
    if (v) {
      let retVl = window.sessionStorage.getItem(key);
      if (retVl) return JSON.parse(retVl);
    }
    let qe: QueryEntity = new QueryEntity("", "");
    qe.page.currPage = 1;
    qe.page.pageSize = 400;
    qe.cont = vl;
    let vv = await tools.getBipInsAidInfo("GETAREA", 210, qe);
    if (vv.data.id == 0) {
      let value = vv.data.data.data.values;
      let retVl = [];
      for (var i = 0; i < value.length; i++) {
        retVl.push(value[i]);
      }
      if (v) {
        window.sessionStorage.setItem(key, JSON.stringify(retVl));
      }
      return retVl;
    } else {
      return null;
    }
  }
  /**
   * 节点点击事件
   */
  async handleNodeClick(data: any, data1: any, data2: any) {
    let id = data.id;
    //classes/search/QueryCont'; 有详细说明
    let oneCont =[];
    let allCont = [];
    let cont = "";
    let qCont = new QueryCont('area', id, 12);
    qCont.setContrast(0);
    oneCont.push(qCont);
    if (oneCont.length != 0) {
      allCont.push(oneCont);
      cont = "~" + JSON.stringify(allCont);
    }
    let qe: QueryEntity = new QueryEntity("", "");
    qe.page.currPage = 1;
    qe.page.pageSize = 400;
    qe.cont = cont;
    let vv = await tools.getBipInsAidInfo("SORG", 210, qe);
    if(vv.data.id == 0){
      let values = vv.data.data.data.values;
      if(values.length>0){
        let orgcode = "";
        for(var i=0;i<values.length;i++){
          orgcode +=values[i].orgcode+";"
        }
        orgcode = orgcode.substring(0,orgcode.length-1);
        this.operaTjCell.currRecord.data.sorg = orgcode;
        this.getOpera()
      }else{
        this.operaData=[];
        this.clearCover();
      }
    }
    this.addresSel(data.name);
  }
  /**
   * 查找作业区
   */
  async getOpera() {
    let qe: QueryEntity = new QueryEntity("F2015", "F2015TJ");
    qe.page = this.operaCellPage;
    qe.cont = JSON.stringify(this.operaTjCell.currRecord.data);
    qe.oprid = 13;
    await this.operaTjCell
      .queryData(qe)
      .then(res => {
        console.log(res);
        if (res.data.id == 0) {
          this.operaData = res.data.data.data.data;
          for (var i = 0; i < this.operaData.length; i++) {
            let d1 = this.operaData[i].data;
            this.showOperaBr(d1.kid);
            this.operaJSON[d1.kid] = d1;
          }
        }
        this.operaCellPage = res.data.data.data.page;
        this.showOperaDia = false;
        this.operaBtnOpen = false;
        this.operaBtnClick();
      })
      .catch(err => {
        this.showOperaDia = false;
        this.$notify.error(err);
      });
  }
  /**
   * 查找避让区
   */
  async showOperaBr(kid:string){
    let qe: QueryEntity = new QueryEntity("F2015A", "F2015A");
    qe.page = {currPage: 1,index: 0,pageSize: 20000,total: 0};
    qe.cont = "{'oid':'"+kid+"'}";
    qe.oprid = 13;
    await this.operaBrCell
      .queryData(qe)
      .then(res => {
        if (res.data.id == 0) {
          this.operaBrData[kid] = res.data.data.data.data
          for (var i = 0; i < this.operaBrData[kid].length; i++) {
            let d1 = this.operaBrData[kid][i].data;
            let k = d1.oid+"_"+d1.oaid
            this.operaBrJSON[k] = d1;
          }
        }
      })
      .catch(err => {
        this.$notify.error(err);
      });
  }
  /**
   * 作业区页数发生变化
   */
  pageChange(page: number) {
    this.operaCellPage.currPage = page;
    this.getOpera();
  }
  /**
   * 勾选发生变化
   */
  checkBoxChange(data: any) {
    for (var i = 0; i < data.length; i++) {
      let kid = data[i];
      if (!this.mapOpera[kid]) {
        //作业区
        let d1 = this.operaJSON[kid];
        let cc:any = this.makeOpera(d1);
        let polygon = cc[0];
        let points = cc[1];
        //向地图上添加面
        this.tMap.addOverLay(polygon);
        let t1 = this.tMap.getViewport(points);
        this.tMap.panTo(t1.center, t1.zoom);
        this.mapOpera[kid] = polygon;
        let label = this.makeOperaLableTXT(d1, t1);
        this.tMap.addOverLay(label);
        this.mapOperaTxt[kid] = label;
        this.makrAllBr(kid);
      }
    }
    for (let key in this.mapOpera) {
      let ka = key.split("_")[0];
      if (data.indexOf(ka) == -1) {
        if (ka.indexOf("non-") == -1 && ka.indexOf("copy-") == -1) {
          if (this.mapOpera[key]) this.tMap.removeOverLay(this.mapOpera[key]);
          if (this.mapOperaTxt[key])
            this.tMap.removeOverLay(this.mapOperaTxt[key]);
          delete this.mapOpera[key];
          delete this.mapOperaTxt[key];
        }
      }
    }
  }

  /**
   * 画单个作业区的全部避让区域
   */
  makrAllBr(kid:any){
    if(this.operaBrData[kid]){
      let br = this.operaBrData[kid]
      for(var j=0;j<br.length;j++){
        let br1 = br[j].data;
        let dbr1 ={boundary1: br1.avoid,color:br1.color}
        let kk = kid+"_"+br1.oaid;
        if(br1.type ==0){//点的
          //创建标注对象
          var marker = new T.Marker(new T.LngLat(br1.avoid.split(",")[0], br1.avoid.split(",")[1]));
          //向地图上添加标注
          this.tMap.addOverLay(marker);
          this.mapOpera[kk] = marker;
        }else{//面
          let ccbr:any = this.makeOpera(dbr1);
          this.tMap.addOverLay(ccbr[0]);
          this.mapOpera[kk] = ccbr[0];
        }
      }
    }
  }
  /**
   * 创建作业区文字说明
   */
  makeOperaLableTXT(d1: any, t1: any) {
    if (d1) {
      var co = "";
      co =
        d1.id +
        "<br/>" +
        d1.name +
        "<br/>" +
        d1.township +
        "<br/>" +
        d1.address;
      if (d1.area != 0) {
        co += "<br/>面积：" + d1.area + "亩";
      }
      var label = new T.Label({
        text: co,
        position: t1.center,
        offset: new T.Point(-50, -50)
      });
      label.setBackgroundColor(null);
      return label;
    } else {
      return null;
    }
  }
  /**
   * 创建作业区
   */
  makeOpera(d1: any) {
    if (d1) {
      let boundary1 = d1.boundary1;
      let boundary = boundary1.split(";");
      var points = [];
      for (var j = 0; j < boundary.length; j++) {
        let poin = boundary[j].split(",");
        if (poin.length >= 2) {
          points.push(new T.LngLat(poin[0], poin[1]));
        }
      }
      //创建面对象
      var polygon = new T.Polygon(points, {
        color: "blue",
        weight: 3,
        opacity: 0.5,
        fillColor: d1.color,
        fillOpacity: 0.5
      });
      return [polygon, points];
    } else {
      return null;
    }
  }
  async getCell(cellid: string) {
    let res = await tools.getCCellsParams(cellid);
    let rtn: any = res.data;
    if (rtn.id == 0) {
      let kn: Array<Cells> = rtn.data.layCels;
      let cells = kn;
      return new CDataSet(cells[0]);
    } else {
      return new CDataSet("");
    }
  }
  checkNotNull(cds: CDataSet): boolean {
    let bok = true;
    cds.ccells.cels.forEach(item => {
      if (item.unNull && bok) {
        let vl = null;
        let hide: any = [];
        if (cds.currRecord.data[item.id] != null)
          vl = cds.currRecord.data[item.id] + "";
        if (!vl && hide.indexOf(item.id) == -1) {
          this.$notify.warning("【" + item.labelString + "】不能为空!");
          bok = false;
          return false;
        }
      }
    });
    return bok;
  }
  @Watch("height")
  heightChange() {
    this.style = "height:" + (this.height - 50) + "px";
  }
}
</script>
<style scoped lang="scss" >
.myTab {
  height: 600px;
}
.heightWidth {
  // height: 100%;
  width: 100%;
  padding: 0px;
}
.areaBtn {
  height: 63px;
  line-height: 63px;
  width: 15px;
  float: left;
  top: 40%;
  position: absolute;
  z-index: 999;
  background-color: #fff;
  border-top-width: 1px;
  border-right-width: 1px;
  border-bottom-width: 1px;
  border-top-style: solid;
  border-right-style: solid;
  border-bottom-style: solid;
  border-top-color: #ccc;
  border-right-color: #ccc;
  border-bottom-color: #ccc;
  -moz-border-radius: 0 6px 6px 0;
  -webkit-border-radius: 0 6px 6px 0;
  border-radius: 0 6px 6px 0;
}
.operaBtn {
  height: 63px;
  line-height: 63px;
  width: 15px;
  float: right;
  top: 40%;
  right: 0px;
  position: absolute;
  z-index: 999;
  background-color: #fff;
  border-top-width: 1px;
  border-left-width: 1px;
  border-bottom-width: 1px;
  border-top-style: solid;
  border-left-style: solid;
  border-bottom-style: solid;
  border-top-color: #ccc;
  border-left-color: #ccc;
  border-bottom-color: #ccc;
  -moz-border-radius: 6px 0px 0px 6px;
  -webkit-border-radius: 6px 0px 0px 6px;
  border-radius: 6px 0px 0px 6px;
}
.myTMap {
  height: calc(100% - 0px) !important;
  width: 100%;
  outline: none;
}
.mapMain {
  height: calc(100% - 35px) !important;
}
.padding0 {
  padding: 0px;
}
.operaCheck {
  line-height: 50px;
  text-align: center;
}
.tools {
    text-align: right;
}
.tools-li {
    margin-left: 5px;
}
.bip-lay {
  margin-top: 20px;
}
.line {
  height: 1px;
  border-bottom: 1px solid #f1f1f1;
}
.oper-pagination {
  text-align: center;
}

.op-drop {
  background-color: #fff;
}
</style>
<style lang="scss" >
.myOperatingAreaCheck {
  font-size: 0px !important;
  .el-checkbox__label {
    font-size: 0px !important;
  }
}
</style>