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
                  <el-input
                    style="width:300px"
                    size="mini"
                    placeholder="请输入行政名称如：北京"
                    v-model="addressInput"
                    class="input-with-select"
                  >
                    <el-button
                      slot="append"
                      size="mini"
                      icon="el-icon-search"
                      @click.native="addresSel(addressInput)"
                    ></el-button>
                  </el-input>
                </el-col>
                <el-col :span="12">
                    <div class="tools">
                        <span class="tools-li">
                            <el-dropdown trigger="click" @command="toolClick" size="mini" split-button >
                                <span class="el-dropdown-link">工具</span>
                                <el-dropdown-menu slot="dropdown">
                                <el-dropdown-item command="0">测量</el-dropdown-item>
                                <el-dropdown-item command="1">测面</el-dropdown-item>
                                <el-dropdown-item command="2">标点</el-dropdown-item>
                                <el-dropdown-item command="3">标线</el-dropdown-item>
                                <el-dropdown-item command="4">标面</el-dropdown-item>
                                </el-dropdown-menu>
                            </el-dropdown>
                        </span>
                        <span class="tools-li">
                            <el-button  size="mini" icon="el-icon-delete" @click="clearCover">清空</el-button>
                        </span>
                        <span class="tools-li">
                            <el-button
                                size="mini"
                                icon="el-icon-search"
                                @click="showOperaDia =!showOperaDia"
                            >查找</el-button>
                        </span>       
                    </div>
                </el-col>
              </el-row>
            </div>
          </el-header>
          <el-container class="padding0 mapMain">
            <el-aside :width="areaWidth+'px'">
              <el-tree
                :node-key="keyID"
                lazy
                :load="loadNode"
                :props="defaultProps"
                @node-click="handleNodeClick"
                :default-expanded-keys="expandedKeys"
              ></el-tree>
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
                  <el-row
                    v-for="(item,index) in operaData"
                    :key="index"
                    style="padding-top:5px;border-top: 1px solid #f1f1f1;margin-bottom: 5px;" >
                    <el-col :span="4" style="height:60px;line-height:60px;text-align: center;">
                      <el-checkbox
                        class="myOperatingAreaCheck"
                        :label="item.data.kid"
                        :key="item.data.kid"
                      ></el-checkbox>
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
                            <el-col :span="8">
                              
                              <el-button
                                  type="primary"
                                  @click="editOpera(item.data.kid)"
                                  style="padding:2px; font-size:0.12rem;">
                                  编辑
                                </el-button>
                            </el-col>
                            <el-col :span="8">
                                <el-button
                                  type="info"
                                  @click="copyOpera(item.data.kid)"
                                  style="padding:2px; font-size:0.12rem;">
                                  复制
                                </el-button>
                            </el-col>
                            <el-col :span="8">
                              <el-button
                                type="danger"
                                @click="delOpera(item.data.kid)"
                                style="padding:1px; font-size:0.12rem;">
                                删除
                              </el-button>   
                            </el-col>
                          </el-row>                   
                        </el-col>
                      </el-row>
                    </el-col>
                  </el-row>
                </el-checkbox-group>
                <div class="line"></div>
                <div class="oper-pagination">
                   <el-pagination
                      small
                      layout="prev, pager, next"
                      @current-change="pageChange"
                      :page-size="operaCellPage.pageSize"
                      :total="operaCellPage.total">
                    </el-pagination>
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
  @Provide() localsearch: any = null; //地址搜索对象
  @Provide() selCityLine: any = null; //搜索的地址边界线
  @Provide() addressInput: any = null; //地址框

  @Provide() showOperaDia: boolean = false; //是否显示作业区查找框
  @Provide() operaTjCell: CDataSet = new CDataSet(""); //作业区对象(查询条件)
  @Provide() operaData: any = []; //作业区数据
  @Provide() operaJSON: any = {}; //k v 格式作业区
  @Provide() checkOperaList: any = []; //作业区勾选数据
  @Provide() operaCellPage: any = {
    currPage: 1,
    index: 0,
    pageSize: 20,
    total: 0
  }; //作业区查询分页数据

  @Provide() mapOpera: any = {}; //地图作业区覆盖集合
  @Provide() mapOperaTxt: any = {}; //地图作业区文字说明集合

  @Provide() operaSaveCell: CDataSet = new CDataSet(""); //作业区对象（保存对象）
  @Provide() showSaveOperaDia: boolean = false; //是否显示新增作业区弹框
  @Provide() editKid: any = null; //当前正在进行保存的kid 已经弹出保存框了

  async created() {
    if (this.height) {
      this.style = "height:" + (this.height - 50) + "px";
    }
    this.operaTjCell = await this.getCell("F2015TJ");
    this.operaTjCell.createRecord();
    this.operaSaveCell = await this.getCell("F2015");
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
        this.tMap.checkResize();
      }
    } else {
      this.tMap.checkResize();
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
        this.tMap.checkResize();
      }
    } else {
      this.tMap.checkResize();
    }
  }
  //工具下拉选中
  toolClick(item: any) {
    if (item == 0 || item == 3) {
      //线
      let config = {
        showLabel: true
      };
      if (item == 3) {
        config.showLabel = false;
      }
      //创建标注工具对象
      let lineTool = new T.PolylineTool(this.tMap, config);
      lineTool.open();
      lineTool.addEventListener("draw", this.lineToolEnd);
    } else if (item == 1 || item == 4) {
      //面
      let config = {
        showLabel: false,
        color: "blue",
        weight: 3,
        opacity: 0.5,
        fillColor: "#FFFFFF",
        fillOpacity: 0.5
      };
      if (item == 4) {
        config.showLabel = false;
      }
      //创建标注工具对象
      if (!this.polygonTool) {
        this.polygonTool = new T.PolygonTool(this.tMap, config);
        this.polygonTool.addEventListener("draw", this.polygonToolEnd);
      }
      this.polygonTool.open();
      //绑定draw事件 用户每次完成拉框操作时触发事件。
    } else if (item == 2) {
      //点
      //创建标注工具对象
      let markerTool = new T.MarkTool(this.tMap, { follow: true });
      markerTool.open();
    }
  }
  /**
   * 线绘制结束
   */
  lineToolEnd() {
    console.log("绘制完一条线");
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
    this.operaSaveCell.clear();
    this.operaSaveCell.createRecord();
    this.operaSaveCell.currRecord.data.area = (
      parameter.currentArea / 666.66
    ).toFixed(2);
    this.operaSaveCell.currRecord.data.boundary1 = boundary1;
    this.showSaveOperaDia = true;
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
      let d1 = this.operaJSON[kid];
      //创建标注工具对象 用来计算面积
      let polygonTool = new T.PolygonTool(this.tMap);

      let boundary1 = "";
      for (var i = 0; i < points.length; i++) {
        let point = points[i];
        boundary1 += point.getLng() + "," + point.getLat() + ";";
      }
      boundary1 = boundary1.substring(0, boundary1.length - 1);
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
   * 保存新增作业区
   */
  async saveOpera() {
    let bok = this.checkNotNull(this.operaSaveCell);
    if (!bok) return;
    let res: any = await this.operaSaveCell.saveData();
    if (res.data && res.data.id == 0) {
      await this.getOpera();
      let kid = res.data.data.kid;
      // this.operaSaveCell.currRecord.data.kid = kid;
      // this.operaJSON[kid] = this.operaSaveCell.currRecord.data;
      // this.operaData.unshift(this.operaSaveCell.currRecord)
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
      case 3:
        //解析行政区划边界
        this.area(result.getArea());
        break;
    }
  }
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
    await this.operaTjCell
      .queryData(qe)
      .then(res => {
        if (res.data.id == 0) {
          this.operaData = res.data.data.data.data;
          for (var i = 0; i < this.operaData.length; i++) {
            let d1 = this.operaData[i].data;
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
      }
    }
    for (let key in this.mapOpera) {
      if (data.indexOf(key) == -1) {
        if (key.indexOf("non-") == -1 && key.indexOf("copy-") == -1) {
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