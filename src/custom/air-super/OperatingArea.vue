<template>
  <div v-loading="loading">
    <el-container class="padding0" :style="style">
      <el-aside :width="areaWidth+'px'">
        <el-row>
          <el-input style="width:180px" size="mini" placeholder="行政区名称如：北京" v-model="addressInput" class="input-with-select" >
            <el-button slot="append" size="mini" icon="el-icon-search" @click.native="addresSel(addressInput,1)" ></el-button>
          </el-input>
        </el-row>
        <el-row>
          <el-tree :node-key="keyID" lazy :load="loadNode" :check-strictly="false" :props="defaultProps"  show-checkbox @check="handleCheckChange" :default-expanded-keys="expandedKeys" ></el-tree>
        </el-row>
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
        <div class="nav-tools">
          <span class="tools-li">
            <el-dropdown trigger="click" @command="toolClick" size="mini" split-button >
              <span class="el-dropdown-link">作业区工具</span>
              <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="1">作业区规划(面)</el-dropdown-item>
              <el-dropdown-item command="2">作业区规划(线)</el-dropdown-item>
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
          <span class="tools-li">
            <el-dropdown trigger="click" @command="aviationToolClick" size="mini" split-button >
              <span class="el-dropdown-link">航空识别区工具</span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="1">标记四角坐标</el-dropdown-item>
                <el-dropdown-item command="2">勾选四角坐标</el-dropdown-item>
                <el-dropdown-item command="3">勾选新点</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </span>
        </div>
      </el-main>
      <!-- 右侧作业区 -->
      <el-aside :width="operaWidth+'px'">
        <div>
          <el-tabs v-model="activeName1" type="card">
            <el-tab-pane label="航空识别区" name="first" :style="activeName1Style">
              <el-checkbox :indeterminate="sbqIsIndeterminate" v-model="sbqCheckAll" @change="sbqCheckAllChange">全选</el-checkbox>
              <el-checkbox-group class="opera" v-model="checkOperaList" @change="checkBoxChange">
                <el-row v-for="(item,index) in operaSBQData" :key="index">
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
                            <el-col :span="8">
                              <el-button type="primary" @click="editOpera(item.data.kid)" style="padding:2px; font-size:0.12rem;">编辑</el-button>
                            </el-col>
                            <el-col :span="8">
                                <el-button type="info" @click="copyOpera(item.data.kid)" style="padding:2px; font-size:0.12rem;">复制</el-button>
                            </el-col>
                            <el-col :span="8">
                              <el-button type="danger" @click="delOpera(item.data.kid)" style="padding:1px; font-size:0.12rem;">删除</el-button>   
                            </el-col>
                          </el-row>                   
                        </el-col>
                      </el-row>
                    </el-col>
                  </el-row> 
                </el-row>
              </el-checkbox-group>
            </el-tab-pane>
            <el-tab-pane label="飞防作业区" name="second">
              <el-tabs v-model="activeName2" type="card">
                <el-tab-pane label="春季" name="c" :style="activeName2Style">
                  <el-checkbox :indeterminate="cIsIndeterminate" v-model="cCheckAll" @change="cCheckAllChange">全选</el-checkbox>
                  <el-checkbox-group class="opera" v-model="checkOperaList" @change="checkBoxChange">
                    <el-row v-for="(item,index) in operaCData" :key="index">
                      <el-row style="padding-top:5px;border-top: 1px solid #f1f1f1;margin-bottom: 5px;">
                        <el-col :span="4" style="height:60px;line-height:60px;text-align: center;">
                          <el-checkbox class="myOperatingAreaCheck" :label="item.data.kid" :key="item.data.kid"></el-checkbox>
                        </el-col>
                        <el-col :span="20">
                          <el-row>
                            <el-col :span="24" style="height:20px;font-size: 0.8rem; color: rgba(0,0,0,.54)">{{item.data.name}}</el-col>
                            <el-col
                              :span="24"
                              style="color: rgba(0,0,0,.54);font-size: .12rem;"
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
                                  <el-button type="danger" @click="showoperaBrData['BR'+index] = ! showoperaBrData['BR'+index]" style="padding:1px; font-size:0.12rem;">避让区</el-button>   
                                </el-col>
                              </el-row>                   
                            </el-col>
                          </el-row>
                        </el-col>
                      </el-row>
                      <el-row style="font-size:14px;">
                        <template v-if="showoperaBrData['BR'+index]">
                          <el-row v-for="(item,indexbr) in operaBrData[item.data.kid]" :key="indexbr">
                            <el-col :span="4">&nbsp;</el-col>
                            <el-col :span="12">{{item.data.name}}</el-col>
                            <el-col :span="8">
                              <el-row type="flex" justify="end">
                                <el-button v-show="item.data.type==1" type="text" @click="editOperaBr(item.data)" style="padding:2px; font-size:0.12rem;">编辑</el-button>
                                <el-button type="text" @click="delOperaBr(item.data,indexbr,index)" style="padding:2px; font-size:0.12rem;">删除</el-button>
                              </el-row>
                            </el-col>
                          </el-row>
                        </template>
                      </el-row>
                    </el-row>
                  </el-checkbox-group>
                </el-tab-pane>
                <el-tab-pane label="夏季" name="x" :style="activeName2Style">
                  <el-checkbox :indeterminate="xIsIndeterminate" v-model="xCheckAll" @change="xCheckAllChange">全选</el-checkbox>
                  <el-checkbox-group class="opera" v-model="checkOperaList" @change="checkBoxChange">
                    <el-row v-for="(item,index) in operaXData" :key="index">
                      <el-row style="padding-top:5px;border-top: 1px solid #f1f1f1;margin-bottom: 5px;">
                        <el-col :span="4" style="height:60px;line-height:60px;text-align: center;">
                          <el-checkbox class="myOperatingAreaCheck" :label="item.data.kid" :key="item.data.kid"></el-checkbox>
                        </el-col>
                        <el-col :span="20">
                          <el-row>
                            <el-col :span="24" style="height:20px;font-size: 0.8rem; color: rgba(0,0,0,.54)">{{item.data.name}}</el-col>
                            <el-col
                              :span="24"
                              style="color: rgba(0,0,0,.54);font-size: .12rem;"
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
                                  <el-button type="danger" @click="showoperaBrData['BR'+index] = ! showoperaBrData['BR'+index]" style="padding:1px; font-size:0.12rem;">避让区</el-button>   
                                </el-col>
                              </el-row>                   
                            </el-col>
                          </el-row>
                        </el-col>
                      </el-row>
                      <el-row style="font-size:14px;">
                        <template v-if="showoperaBrData['BR'+index]">
                          <el-row v-for="(item,indexbr) in operaBrData[item.data.kid]" :key="indexbr">
                            <el-col :span="4">&nbsp;</el-col>
                            <el-col :span="12">{{item.data.name}}</el-col>
                            <el-col :span="8">
                              <el-row type="flex" justify="end">
                                <el-button v-show="item.data.type==1" type="text" @click="editOperaBr(item.data)" style="padding:2px; font-size:0.12rem;">编辑</el-button>
                                <el-button type="text" @click="delOperaBr(item.data,indexbr,index)" style="padding:2px; font-size:0.12rem;">删除</el-button>
                              </el-row>
                            </el-col>
                          </el-row>
                        </template>
                      </el-row>
                    </el-row>
                  </el-checkbox-group>                  
                </el-tab-pane>
                <el-tab-pane label="秋季" name="q" :style="activeName2Style">
                  <el-checkbox :indeterminate="qIsIndeterminate" v-model="qCheckAll" @change="qCheckAllChange">全选</el-checkbox>
                  <el-checkbox-group class="opera" v-model="checkOperaList" @change="checkBoxChange">
                    <el-row v-for="(item,index) in operaQData" :key="index">
                      <el-row style="padding-top:5px;border-top: 1px solid #f1f1f1;margin-bottom: 5px;">
                        <el-col :span="4" style="height:60px;line-height:60px;text-align: center;">
                          <el-checkbox class="myOperatingAreaCheck" :label="item.data.kid" :key="item.data.kid"></el-checkbox>
                        </el-col>
                        <el-col :span="20">
                          <el-row>
                            <el-col :span="24" style="height:20px;font-size: 0.8rem; color: rgba(0,0,0,.54)">{{item.data.name}}</el-col>
                            <el-col
                              :span="24"
                              style="color: rgba(0,0,0,.54);font-size: .12rem;"
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
                                  <el-button type="danger" @click="showoperaBrData['BR'+index] = ! showoperaBrData['BR'+index]" style="padding:1px; font-size:0.12rem;">避让区</el-button>   
                                </el-col>
                              </el-row>                   
                            </el-col>
                          </el-row>
                        </el-col>
                      </el-row>
                      <el-row style="font-size:14px;">
                        <template v-if="showoperaBrData['BR'+index]">
                          <el-row v-for="(item,indexbr) in operaBrData[item.data.kid]" :key="indexbr">
                            <el-col :span="4">&nbsp;</el-col>
                            <el-col :span="12">{{item.data.name}}</el-col>
                            <el-col :span="8">
                              <el-row type="flex" justify="end">
                                <el-button v-show="item.data.type==1" type="text" @click="editOperaBr(item.data)" style="padding:2px; font-size:0.12rem;">编辑</el-button>
                                <el-button type="text" @click="delOperaBr(item.data,indexbr,index)" style="padding:2px; font-size:0.12rem;">删除</el-button>
                              </el-row>
                            </el-col>
                          </el-row>
                        </template>
                      </el-row>
                    </el-row>
                  </el-checkbox-group>                  
                </el-tab-pane>
              </el-tabs>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-aside>
    </el-container>
    <el-dialog title="查找作业区" :close-on-click-modal="false" :visible.sync="showOperaDia" width="50%"  class="bip-query">
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
    <el-dialog title="新增作业区" :close-on-click-modal="false" :visible.sync="showSaveOperaDia" width="50%" class="bip-query">
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
    <el-dialog title="新增避让区" :close-on-click-modal="false" :visible.sync="showSaveOperaBrDia" width="50%" class="bip-query">
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
    <el-dialog title="航空识别区坐标勾选" :close-on-click-modal="false" :visible.sync="aviationDia" width="50%" class="bip-query">
      <el-row class="bip-lay">
        <el-checkbox-group v-model="checkedABCD">
          <el-row v-for="(item,index) in sbqPointABCD" :key="index">
              <el-row>{{item.id}}</el-row>
              <el-checkbox v-for="p in item.point" :label="p.latlng" :key="p.latlng">{{p.name}}</el-checkbox>
          </el-row>
        </el-checkbox-group>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button @click="aviationDia = false" size="mini">取 消</el-button>
        <el-button type="primary" @click="selABCDOk" size="mini">确 定</el-button>
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
import { on } from 'cluster';
@Component({
  components: {
    tMap,
    bMap
  }
})
export default class OperatingArea extends Vue {
  @State("bipComHeight", { namespace: "login" }) height!: number;
  @Provide() style: string ="height:" + (this.height ? this.height - 20 : "400") + "px";
  @Provide() activeName1Style:string ="height:" + (this.height ? this.height - 65 : "400") + "px;";
  @Provide() activeName2Style:string ="height:" + (this.height ? this.height - 95 : "400") + "px";
  @Provide() activeName1: string = "first";
  @Provide() activeName2: string = "c";
  @Provide() sbqCheckAll:boolean =false;
  @Provide() sbqIsIndeterminate:boolean =true;
  @Provide() cCheckAll:boolean =false;
  @Provide() cIsIndeterminate:boolean =true;
  @Provide() xCheckAll:boolean =false;
  @Provide() xIsIndeterminate:boolean =true;
  @Provide() qCheckAll:boolean =false;
  @Provide() qIsIndeterminate:boolean =true;


  @Provide() tMap: any = null;
  @Provide() tZoom: number = 12;
  @Provide() loading:number = 0;
  @Provide() areaWidth: number = 0; //测边行政区宽度
  @Provide() areaBtnOpen: boolean = false; //左侧行政区是否显示
  @Provide() expandedKeys: any = []; //行政区默认展开的节点的 key 的数组
  @Provide() keyID: any = "id"; //每个树节点用来作为唯一标识的属性，整棵树应该是唯一的
  @Provide() expandedLevel: any = -1; //默认展开级次数
  @Provide() fatherID: any = "parid"; //树状结构上下级关系字段
  @Provide() defaultProps: any = { label: "name", children: 'children', };
  @Provide() treeData:any=[];

  @Provide() operaWidth: number = 0; //右侧作业区宽度
  @Provide() operaBtnOpen: boolean = false; //右侧作业区是否显示

  @Provide() localsearch: any = null; //地址搜索对象
  @Provide() selCityLine: any = null; //搜索的地址边界线
  @Provide() addressInput: any = null; //地址框

  @Provide() showOperaDia: boolean = false; //是否显示作业区查找框
  @Provide() operaTjCell: CDataSet = new CDataSet(""); //作业区对象(查询条件)
  @Provide() operaData: any = []; //作业区数据    全部数据
  @Provide() operaSBQData: any = []; //作业区数据 识别区
  @Provide() operaCData: any = []; //作业区数据   春季
  @Provide() operaXData: any = []; //作业区数据   夏季
  @Provide() operaQData: any = []; //作业区数据   秋季
  @Provide() operaJSON: any = {}; //k v 格式作业区
  
  @Provide() checkOperaList: any = []; //作业区勾选数据
  @Provide() sbqCheckOperaList: any = []; //识别区勾选数据
  @Provide() cCheckOperaList: any = []; //作业区春勾选数据
  @Provide() xCheckOperaList: any = []; //作业区夏勾选数据
  @Provide() qCheckOperaList: any = []; //作业区秋勾选数据

  @Provide() operaCellPage: any = {currPage: 1,index: 0,pageSize: 2000,total: 0}; //作业区查询分页数据

  @Provide() operaPolygon:any=null;//天地图作业区 画面对象
  @Provide() operaLine:any=null;//天地图作业区 画线对象

  @Provide() areaKv:any={};//行政区域  值  key  集合
  @Provide() areaMap:any={};//行政区域地图集合

  @Provide() operaBrPolygon:any=null;//天地图避让区 画面对象
  @Provide() operaBrLine:any=null;//天地图避让区 画线对象
  @Provide() operaBrMarker:any = null;//天地图避让区 画点对象

 
  @Provide() showoperaBrData:any ={'BR0':false,'BR1':false,'BR2':false,'BR3':false,'BR4':false,'BR5':false,'BR6':false,'BR7':false,'BR8':false,'BR9':false,'BR10':false,
  'BR11':false,'BR12':false,'BR13':false,'BR14':false,'BR15':false,'BR16':false,'BR17':false,'BR18':false,'BR19':false,'BR20':false};//是否显示每一条作业区的避让点

  @Provide() operaBrData: any = {}; //避让区数据
  @Provide() operaBrJSON: any = {}; //避让区数据每一条
  @Provide() mapOperaBr: any = {}; //地图避让区覆盖集合

  @Provide() operaBrCell:CDataSet = new CDataSet("");//避让点对象
  @Provide() showSaveOperaBrDia:boolean =false;//是否显示新增避让点弹框


  @Provide() mapOpera: any = {}; //地图作业区覆盖集合
  @Provide() mapOperaTxt: any = {}; //地图作业区文字说明集合

  @Provide() letter:any = ['A','B','C','D','E','F','G','H','I','G','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']
  @Provide() aviationDia:boolean = false;//航空识别区坐标点勾选弹出框
  @Provide() makeABCD:any={};//航空识别区四角标识
  @Provide() sbqPointABCD:any=[];//已勾选的识别区的四角坐标集合
  @Provide() checkedABCD:any = [];//新填识别区四角坐标

  @Provide() operaSaveCell: CDataSet = new CDataSet(""); //作业区对象（保存对象）
  @Provide() showSaveOperaDia: boolean = false; //是否显示新增作业区弹框
  @Provide() editKid: any = null; //当前正在进行保存的kid 已经弹出保存框了

  @Provide() editBrk:any = null;//当前正在进行保存的kid 已经弹出保存框了
  @Provide() checkkid:any = null;//当前页选中的作业区ID 在勾选避让区域时用到

  async created() {
    if (this.height) {
      this.style = "height:" + (this.height - 20) + "px";
      this.activeName1Style ="height:" + (this.height ? this.height - 65 : "400") + "px;";
      this.activeName2Style ="height:" + (this.height ? this.height - 95 : "400") + "px";
    }
    this.operaTjCell = await this.getCell("FW2015TJ");//作业区查询条件
    this.operaTjCell.createRecord();
    this.operaSaveCell = await this.getCell("FW2015");//作业区
    this.operaBrCell = await this.getCell("F2015A");//避让点
  }
  mounted() {
    if (this.$refs.TMap) {
      let refT: any = this.$refs.TMap;
      this.tMap = refT.getMap();
    }
  }
  //清空地图覆盖物
  clearCover() {
    this.mapOpera = {};
    this.mapOperaBr = {};
    this.mapOperaTxt = {};
    this.checkOperaList = [];
    this.tMap.clearOverLays();
  }
  //工具下拉选中
  toolClick(item: any) {
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
    if(item == 2){ //规划作业区  线
      //创建标注工具对象
      if(!this.operaLine){
        this.operaLine = new T.PolylineTool(this.tMap);        
        this.operaLine.addEventListener("draw", this.operaLineToolEnd);
      }
      this.operaLine.close();
      this.operaLine.open();
    }else if(item == 4){//规划避让区
      //创建标注工具对象
      if(!this.operaBrLine){
        this.operaBrLine = new T.PolylineTool(this.tMap);        
        this.operaBrLine.addEventListener("draw", this.operaBrLineToolEnd);
      }
      this.operaBrLine.close();
      this.operaBrLine.open();
    }else if(item == 1){ //规划作业区  面
      let config = { showLabel: false,
        color: "blue", weight: 1, opacity: 0.5,
        fillColor: "#FFFFFF", fillOpacity: 0.5
      };
      //创建标注工具对象
      if (!this.operaPolygon) {
        this.operaPolygon = new T.PolygonTool(this.tMap, config);
        //绑定draw事件 用户每次完成拉框操作时触发事件。
        this.operaPolygon.addEventListener("draw", this.operaPolygonToolEnd);
      }
      this.operaPolygon.close();
      this.operaPolygon.open();
    }else if(item == 3){//避让区规划 面
      let config = { showLabel: false,
        color: "blue", weight: 1, opacity: 0.5,
        fillColor: "#FFFFFF", fillOpacity: 0.5
      };
      //创建标注工具对象
      if (!this.operaBrPolygon) {
        this.operaBrPolygon = new T.PolygonTool(this.tMap, config);
        //绑定draw事件 用户每次完成拉框操作时触发事件。
        this.operaBrPolygon.addEventListener("draw", this.operaBrPolygonToolEnd);
      }
      this.operaBrPolygon.close();
      this.operaBrPolygon.open();
    }else if(item == 5){//避让点规划
      //创建标注工具对象
      if(!this.operaBrMarker){
        this.operaBrMarker = new T.MarkTool(this.tMap, { follow: true });
        this.operaBrMarker.addEventListener("mouseup",this.operaBrMarkerToolEnd);
      }
      this.operaBrMarker.close();
      this.operaBrMarker.open();
    }
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
        this.makrAllBr(kid,null);
      }
    }
    for (let key in this.mapOpera) {
      let ka = key.split("_")[0];
      if (data.indexOf(ka) == -1) {
        if (ka.indexOf("non-") == -1 && ka.indexOf("copy-") == -1) {
          if (this.mapOpera[key]) this.tMap.removeOverLay(this.mapOpera[key]);
          if (this.mapOperaTxt[key])
            this.tMap.removeOverLay(this.mapOperaTxt[key]);
          if(this.makeABCD[key]){
            let data = this.makeABCD[key];
            for(var i=0;i<data.length;i++){
              this.tMap.removeOverLay(data[i])
            }
          }
          delete this.makeABCD[key];
          delete this.mapOpera[key];
          delete this.mapOperaTxt[key];
          this.delAllBr(key);
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
      co =d1.id; 
      //   d1.id +
      //   "<br/>" +
      //   d1.name +
      //   "<br/>" +
      //   d1.township +
      //   "<br/>" +
      //   d1.address;
      // if (d1.area != 0) {
      //   co += "<br/>面积：" + d1.area + "亩";
      // }
      var label = new T.Label({
        text: co,
        position: t1.center,
        offset: new T.Point(-30, 0),
        fontsize :14
      });
      if(d1.sbuid == 'F2005'){
        label.setFontSize(16)
      }
      label.setBorderLine(0)
      label.setBackgroundColor(null);
      return label;
    } else {
      return null;
    }
  }
  /**
   * 创建覆盖面
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
        weight: 1,
        opacity: 0.5,
        fillColor: d1.color,
        fillOpacity: 0.5
      });
      return [polygon, points];
    } else {
      return null;
    }
  }

  /***************** 航空识别区 ****************/
  //航空识别区工具
  aviationToolClick(item:any){
    let sbqData = [];
    if(item == 1 || item ==2){     
      for(var i=0;i<this.checkOperaList.length;i++){
        let k = this.checkOperaList[i];
        let data = this.operaJSON[k]
        if(data.sbuid =='F2005'){//航空识别区
          sbqData.push(data);
        }
      }
      if(sbqData.length<=0){
        this.$notify.warning("请勾选航空识别区！")
        return ;
      }
    }
    if(item ==1){
      for(var k in this.makeABCD){
        let data = this.makeABCD[k];
        for(var i=0;i<data.length;i++){
          this.tMap.removeOverLay(data[i])
        }
      }
      this.createABCD(sbqData)
    }else if(item ==2){
      this.sbqPointABCD = [];
      this.checkedABCD = [];
      this.aviationToolClick(1);
      console.log(this.sbqPointABCD);
      this.aviationDia = true;
    }else if(item == 3){

    }
  }
  //创建航空识别区四角 标识
  createABCD(data:any){
    let abcdData = [];
    for(var i=0;i<data.length;i++){
      let d1 = data[i];
      let id = d1.id;
      let boundary1 = d1.boundary1;
      if(boundary1){
        let boundary = boundary1.split(";");
        let abcd = [];
        let _abcd:any = [];
        for(var j=0;j<boundary.length;j++){
          let atng = boundary[j].split(",");
          var latlng = new T.LngLat(atng[0],atng[1]);
          var label = new T.Label({
            text: id+this.letter[j],
            position:latlng,
            offset: new T.Point(-30, 0),
          });
          label.setFontSize(16)
          label.setBorderLine(0)
          label.setBackgroundColor(null);
          abcd.push(label)
          this.tMap.addOverLay(label);

          let point = {name:id+this.letter[j],latlng:boundary[j]}
          _abcd.push(point);
        }
        this.makeABCD[d1.kid] = abcd;
        let point4 = {id:id,point:_abcd}
        abcdData.push(point4);
      }
    }
    this.sbqPointABCD = abcdData;
  }
  //勾选完上一级作业区
  selABCDOk(){
    this.aviationDia = false;
    for(var i=0;i<this.checkedABCD.length;i++){
      let latlng = this.checkedABCD[i];
      
    }
  }


  /**************** 避让区 **************/
   //右侧避让区开关
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
   * 保存新增避让区
   */
  async saveOperaBr() {
    let bok = this.checkNotNull(this.operaBrCell);
    if (!bok) return;
    let res: any = await this.operaBrCell.saveData();
    if (res.data && res.data.id == 0) {
      let id = res.data.data.oaid;
      let oaid = this.operaBrCell.currRecord.data.oaid
      if(id){
        oaid = id;
        if (this.mapOperaBr[this.editBrk]){
          this.tMap.removeOverLay(this.mapOperaBr[this.editBrk]);
          delete this.mapOperaBr[this.editBrk];
        }
      }
      let oid = this.operaBrCell.currRecord.data.oid;
      let k = oid + "_" + oaid;
      await this.showOperaBr(oid);
      this.makrAllBr(oid,k);
      this.$notify.success("保存成功！");
      this.showSaveOperaBrDia = false;
    } else {
      this.showSaveOperaBrDia = false;
      this.$notify.error("保存失败！");
    }
  }
    /**
   * 删除避让区
   */
  delOperaBr(data:any,indexBr:any,index:any){
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
        this.delBr(k,indexBr,index);
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
  async delBr(key:string,indexBr:any,index:any){
    let res: any = await this.operaBrCell.saveData();
    if (res.data && res.data.id == 0) {
      this.showoperaBrData["BR"+index] = false;
      let data = this.operaBrData[key.split("_")[0]];
      data.splice(indexBr,1);
      this.operaBrData[key.split("_")[0]] = data;
      this.showoperaBrData["BR"+index] = true;
      if (this.mapOperaBr[key]) this.tMap.removeOverLay(this.mapOperaBr[key]);
      delete this.operaBrJSON[key]
      this.$notify.success("删除成功！");
      await this.showOperaBr(key.split("_")[0]);
    } else {
      this.$notify.error("删除失败！");
    }
  }
  /**
   * 画单个作业区的全部避让区域
   */
  makrAllBr(kid:any,koid:any){
    if(this.operaBrData[kid]){
      let br = this.operaBrData[kid]
      for(var j=0;j<br.length;j++){
        let br1 = br[j].data;
        let dbr1 ={boundary1: br1.avoid,color:br1.color}
        let kk = kid+"_"+br1.oaid;
        if(!koid || koid == kk){
          if(br1.type ==0){//点的
            //创建标注对象
            var marker = new T.Marker(new T.LngLat(br1.avoid.split(",")[0], br1.avoid.split(",")[1]));
            if(this.mapOperaBr[kk]){
              this.tMap.removeOverLay(this.mapOperaBr[kk]);
            } 
            //向地图上添加标注
            this.tMap.addOverLay(marker);
            this.mapOperaBr[kk] = marker;
          }else{//面
            let ccbr:any = this.makeOpera(dbr1);
            if(this.mapOperaBr[kk]){
              this.tMap.removeOverLay(this.mapOperaBr[kk]);
            }
            this.tMap.addOverLay(ccbr[0]);
            this.mapOperaBr[kk] = ccbr[0];
          }
        }
      }
    }
  }
  /**
   * 删除单个作业区的全部避让区域
   */
  delAllBr(kid:any){
    if(this.operaBrData[kid]){
      let br = this.operaBrData[kid]
      for(var j=0;j<br.length;j++){
        let br1 = br[j].data;
        let kk = kid+"_"+br1.oaid;
        if(this.mapOperaBr[kk]){
          this.tMap.removeOverLay(this.mapOperaBr[kk]);
          delete this.mapOperaBr[kk];
        }
      }
    }
  }
  /**
   * 编辑避让区
   */
  editOperaBr(data:any){
    let kid = data.oid+"_"+data.oaid;
    let cover = this.mapOperaBr[kid];
    if (cover) {
      cover.removeEventListener("dblclick", this.operaBrDBClick);
      cover.addEventListener("dblclick", this.operaBrDBClick);
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
      this.mapOperaBr[kid] = polygon;
      polygon.enableEdit();
      polygon.kid = kid;
      polygon.addEventListener("dblclick", this.operaBrDBClick);
    }
  }
  /**
   * 避让区双击
   */
  operaBrDBClick(data: any) {
    let target = data.target;
    let kid = target.kid;
    this.editBrk = kid;
    if(kid.indexOf("non-") == 1){
      kid = this.checkkid;
    }else{
      // kid = kid.split("_")[0];
    }
    let points = target.getLngLats()[0];
    let cover = this.mapOperaBr[kid];
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
      let d1 = this.operaBrJSON[kid];
      this.operaBrCell.clear()
      this.operaBrCell.createRecord();
      if(d1){
        this.operaBrCell.currRecord.data = d1;
        this.operaBrCell.currRecord.c_state = 2;
      }else{
        this.operaBrCell.currRecord.c_state = 1;
        this.operaBrCell.currRecord.data.oid = kid.split("_")[0];
      }
      this.operaBrCell.currRecord.data.type = 1;
      this.operaBrCell.currRecord.data.avoid = boundary1;
      this.showSaveOperaBrDia = true;
    }
  }
  /**
   * 线绘制结束
   * currentLnglats：用户当前绘制的折线的点坐标数组。
   * currentDistance：用户当前绘制的折线的地理长度。
   * currentPolyline：当前测距所画线的对象。
   * allPolylines：返回所有工具绘制的线对象。
   */
  operaBrLineToolEnd(parameter:any){
    this.tMap.removeOverLay(parameter.currentPolyline)
    //创建面对象
    let editCover = new T.Polygon(parameter.currentLnglats, {
      color: "blue",
      weight: 1,
      opacity: 0.5,
      fillColor: '#FFFFFF',
      fillOpacity: 0.5
    });
    this.tMap.addOverLay(editCover);
    let key = "non-" + new Date().getTime();
    editCover.kid = key;
    this.editBrk = key;
    editCover.addEventListener("dblclick", this.operaBrDBClick);
    this.mapOperaBr[key] = editCover;
    editCover.enableEdit();
    let boundary1 = "";
    for (var i = 0; i < parameter.currentLnglats.length; i++) {
      let point = parameter.currentLnglats[i];
      boundary1 += point.getLng() + "," + point.getLat() + ";";
    }
    boundary1 = boundary1.substring(0, boundary1.length - 1);
    this.operaBrCell.clear()
    this.operaBrCell.createRecord();
    this.operaBrCell.currRecord.data.oid = this.checkkid;
    this.operaBrCell.currRecord.data.type = 1;
    this.operaBrCell.currRecord.data.avoid = boundary1;
    this.showSaveOperaBrDia = true;
  }
   /**
   * 多边形绘制结束
   *  currentLnglats：用户当前绘制的多边形的点坐标数组。
   *  currentArea：用户最后绘制的多边形的地理面积。
   *  currentPolygon：当前所画多边形的对象。
   *  allPolygons： 获取工具所有绘制的多边形。
   */
  operaBrPolygonToolEnd(parameter: any) {
    let editCover = parameter.currentPolygon;
    let key = "non-" + new Date().getTime();
    editCover.kid = key;
    this.editBrk = key;
    editCover.addEventListener("dblclick", this.operaBrDBClick);
    this.mapOperaBr[key] = editCover;
    editCover.enableEdit();
    let boundary1 = "";
    for (var i = 0; i < parameter.currentLnglats.length; i++) {
      let point = parameter.currentLnglats[i];
      boundary1 += point.getLng() + "," + point.getLat() + ";";
    }
    boundary1 = boundary1.substring(0, boundary1.length - 1);
    this.operaBrCell.clear()
    this.operaBrCell.createRecord();
    this.operaBrCell.currRecord.data.oid = this.checkkid;
    this.operaBrCell.currRecord.data.type = 1;
    this.operaBrCell.currRecord.data.avoid = boundary1;
    this.showSaveOperaBrDia = true;
  }
  /**
   * 点绘制完成
   * currentLnglat:：用户在地图上标的坐标。
   * currentMarker：用户当前的标注点对象。
   * allMarkers：用户使用工具所有的标注点对象。
   */
  operaBrMarkerToolEnd(parameter:any){
    let editCover = parameter.currentMarker;
    let key = "non-" + new Date().getTime();
    this.editBrk = key;
    this.mapOperaBr[key] = editCover;

    let lnglat = parameter.currentLnglat;
    let avoid = lnglat.getLng()+","+lnglat.getLat();
    this.operaBrCell.clear()
    this.operaBrCell.createRecord();
    this.operaBrCell.currRecord.data.oid = this.checkkid;
    this.operaBrCell.currRecord.data.type = 0;
    this.operaBrCell.currRecord.data.avoid = avoid;
    this.showSaveOperaBrDia = true;
  }
  /**************** END **************/











  /**************** 作业区 **************/
  //查找作业区
  async getOpera() {
    let qe: QueryEntity = new QueryEntity("FW2015", "FW2015TJ");
    qe.page = this.operaCellPage;
    qe.cont = JSON.stringify(this.operaTjCell.currRecord.data);
    qe.oprid = 13;
    this.showOperaDia = false;
    this.operaBtnOpen = false;
    this.loading++;
    await this.operaTjCell
      .queryData(qe)
      .then(res => {
        if (res.data.id == 0) {
          this.operaData = res.data.data.data.data;
          for (var i = 0; i < this.operaData.length; i++) {
            let d1 = this.operaData[i].data;
            this.showOperaBr(d1.kid);
            this.operaJSON[d1.kid] = d1;
          }
          if(res.data.data.data.data.length == 0)
            this.operaData = [];
          this.operaSBQData = [];
          this.operaCData = [];
          this.operaXData = [];
          this.operaQData = [];
          for(var i=0;i<this.operaData.length;i++){
            let dd = this.operaData[i];
            if(dd.data.sbuid == 'F2005'){
              this.operaSBQData.push(dd);
            }else if(dd.data.sbuid == 'F2015'){
              if(dd.data.season == 0){
                this.operaCData.push(dd);
              }else if(dd.data.season == 1){
                this.operaXData.push(dd);
              }else if(dd.data.season == 2){
                this.operaQData.push(dd);
              }
            }
          }
          
        }
        this.operaCellPage = res.data.data.data.page;
        this.loading--;
        this.operaBtnClick();
      })
      .catch(err => {
        this.showOperaDia = false;
        this.loading--;
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
   * 线绘制结束
   * currentLnglats：用户当前绘制的折线的点坐标数组。
   * currentDistance：用户当前绘制的折线的地理长度。
   * currentPolyline：当前测距所画线的对象。
   * allPolylines：返回所有工具绘制的线对象。
   */
  operaLineToolEnd(parameter:any){
    this.tMap.removeOverLay(parameter.currentPolyline)
    //创建面对象
    let editCover = new T.Polygon(parameter.currentLnglats, {
      color: "blue",
      weight: 1,
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
    this.operaSaveCell.clear();
    this.operaSaveCell.createRecord();
    this.operaSaveCell.currRecord.data.area = (parameter.currentArea / 666.66).toFixed(2);
    this.operaSaveCell.currRecord.data.boundary1 = boundary1;
    this.showSaveOperaDia = true;
  }
  /**
   * 多边形绘制结束
   *  currentLnglats：用户当前绘制的多边形的点坐标数组。
   *  currentArea：用户最后绘制的多边形的地理面积。
   *  currentPolygon：当前所画多边形的对象。
   *  allPolygons： 获取工具所有绘制的多边形。
   */
  operaPolygonToolEnd(parameter:any){
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
    this.operaSaveCell.currRecord.data.area = (parameter.currentArea / 666.66).toFixed(2);
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
      //创建标注工具对象 用来计算面积
      let polygonTool = new T.PolygonTool(this.tMap);
      let boundary1 = "";
      for (var i = 0; i < points.length; i++) {
        let point = points[i];
        boundary1 += point.getLng() + "," + point.getLat() + ";";
      }
      boundary1 = boundary1.substring(0, boundary1.length - 1);
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
    }
  }
  /** 
   * 航空识别区全选
  */
  sbqCheckAllChange(val:any){
    this.sbqCheckOperaList = [];
    if(val){
      for(var i=0;i<this.operaSBQData.length;i++){
        this.sbqCheckOperaList.push(this.operaSBQData[i].data.kid)
      }
    }
    this.sbqIsIndeterminate = false;
    this.checkOperaList = this.sbqCheckOperaList.concat(this.cCheckOperaList)
    this.checkOperaList = this.checkOperaList.concat(this.xCheckOperaList)
    this.checkOperaList = this.checkOperaList.concat(this.qCheckOperaList)
    this.checkBoxChange(this.checkOperaList);
  }
  /** 
   * 作业区全选  春
  */
  cCheckAllChange(val:any){
    this.cCheckOperaList = [];
    if(val){
      for(var i=0;i<this.operaCData.length;i++){
        this.cCheckOperaList.push(this.operaCData[i].data.kid)
      }
    }
    this.cIsIndeterminate = false;
    this.checkOperaList = this.sbqCheckOperaList.concat(this.cCheckOperaList)
    this.checkOperaList = this.checkOperaList.concat(this.xCheckOperaList)
    this.checkOperaList = this.checkOperaList.concat(this.qCheckOperaList)
    this.checkBoxChange(this.checkOperaList);
  }
  /** 
   * 作业区全选  夏
  */
  xCheckAllChange(val:any){
    this.xCheckOperaList = [];
    if(val){
      for(var i=0;i<this.operaXData.length;i++){
        this.xCheckOperaList.push(this.operaXData[i].data.kid)
      }
    }
    this.xIsIndeterminate = false;
    this.checkOperaList = this.sbqCheckOperaList.concat(this.cCheckOperaList)
    this.checkOperaList = this.checkOperaList.concat(this.xCheckOperaList)
    this.checkOperaList = this.checkOperaList.concat(this.qCheckOperaList)
    this.checkBoxChange(this.checkOperaList);
  }
  /** 
   * 作业区全选  秋
  */
  qCheckAllChange(val:any){
    this.qCheckOperaList = [];
    if(val){
      for(var i=0;i<this.operaQData.length;i++){
        this.qCheckOperaList.push(this.operaQData[i].data.kid)
      }
    }
    this.sbqIsIndeterminate = false;
    this.checkOperaList = this.sbqCheckOperaList.concat(this.cCheckOperaList)
    this.checkOperaList = this.checkOperaList.concat(this.xCheckOperaList)
    this.checkOperaList = this.checkOperaList.concat(this.qCheckOperaList)
    this.checkBoxChange(this.checkOperaList);
  }
  /**************** 地址定位 **************/  





  /**************** 左侧树状行政区 **************/
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
  /**
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
  handleCheckChange(data:any, data2:any) {
    this.operaData = [];
    this.operaCellPage.total=0;
    let checkedNodes = data2.checkedNodes;
    let checkedKeys =data2.checkedKeys;
    for(var k in this.areaMap){
      if(checkedKeys.indexOf(k) ==-1){
        let area = this.areaMap[k]
        for(var i=0;i<area.length;i++){
            this.tMap.removeOverLay(area[i])
        }
        delete this.areaMap[k];
      }
    }
    if(checkedKeys.length>0){
      let area = "";
      for(var i=0;i<checkedKeys.length;i++){
        area += checkedKeys[i]+";";
      }
      area = area.substring(0,area.length-1);
      this.handleNodeClick(area,checkedNodes)
    }
  }
  /**
   * 节点点击事件
   */
  async handleNodeClick(data: any,address:any) {
    //classes/search/QueryCont'; 有详细说明
    let oneCont =[];
    let allCont = [];
    let cont = "";
    let qCont = new QueryCont('area', data, 12);
    qCont.setContrast(5);
    oneCont.push(qCont);
    if (oneCont.length != 0) {
      allCont.push(oneCont);
      cont = "~" + JSON.stringify(allCont);
    }
    let qe: QueryEntity = new QueryEntity("", "");
    qe.page.currPage = 1;
    qe.page.pageSize = 8000;
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
        // this.operaData=[];
        // this.clearCover();
      }
    }
    for(var i=0;i<address.length;i++){
      let d = address[i].name
      this.areaKv[d] = address[i].id;
      if(!this.areaMap[address[i].id])
        this.addresSel(d,0);
    }
  }
  /*********** END *************/


  /**************** 地址定位 **************/  
  async addresSel(address: string,type:number) {
    if (!this.localsearch) {
      var config = {
        pageCapacity: 10, //每页显示的数量
        onSearchComplete: this.localSearchResult //接收数据的回调函数
      };
      //创建搜索对象
      this.localsearch = new T.LocalSearch(this.tMap, config);
    }
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
        this.area(result.getArea(),result.keyWord);
        break;
    }
  }
  //行政区
  area(obj: any,keyWord:any) {
    if (obj) {
      let area = [];
      if(obj.points){
        //坐标数组，设置最佳比例尺时会用到
            var pointsArr = [];
            var points = obj.points;
            let area1 = this.areaMap[this.areaKv[keyWord]]
            if(area1){
                for(var i=0;i<area.length;i++){
                    this.tMap.removeOverLay(area1[i])
                }
            }
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
                    weight: 2,
                    opacity: 0.5,
                    lineStyle: "dashed"
                });
                //向地图上添加线
                this.tMap.addOverLay(line);
                area.push(line)
            }
            if(this.areaKv[keyWord]){
              this.areaMap[this.areaKv[keyWord]] = area;
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
      for(var i=0;i<zoomArr.length;i++){
        let marker = new T.Marker(zoomArr[i]);// 创建标注
        this.tMap.addOverLay(marker);             // 将标注添加到地图中
      }
      //显示地图的最佳级别
      this.tMap.setViewport(zoomArr);
    }
  }
  /*********** END *************/

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
    this.style = "height:" + (this.height - 20) + "px";
    this.activeName1Style ="height:" + (this.height ? this.height - 65 : "400") + "px;";
    this.activeName2Style ="height:" + (this.height ? this.height - 95 : "400") + "px";
  }
}
</script>
<style scoped lang="scss" >
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
.opera{
  height: calc(100% - 15px) !important;
  overflow: auto;
}
.myTMap {
  height: calc(100% - 0px) !important;
  width: 100%;
  outline: none;
}
.mapMain {
  height: calc(100% - 0px) !important;
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
.nav-tools {
    position: absolute;
    top: 1rem;
    left: 3rem;
    z-index: 999;
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