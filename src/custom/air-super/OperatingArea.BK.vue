<template>
  <div v-loading.fullscreen="loading" :body="true">
    <el-container class="padding0" :style="style">
      <el-aside :width="areaWidth+'px'">
        <el-row>
          <el-input style="width:180px" size="mini" placeholder="行政区名称如：北京" v-model="addressInput" class="input-with-select" >
            <el-button slot="append" size="mini" icon="el-icon-search" @click.native="addresSel(addressInput,1)" ></el-button>
          </el-input>
          <el-input style="width:180px" size="small" placeholder="行政区边界颜色" v-model="cityColor" class="input-with-select" >
            <template slot="append">
              <el-color-picker size="mini"  v-model="cityColor"></el-color-picker>
            </template>
          </el-input>
        </el-row>
        <el-row>
          <el-tree :node-key="keyID" lazy :load="loadNode" :check-strictly="false" :props="defaultProps"  show-checkbox @check="handleCheckChange" :default-expanded-keys="expandedKeys" ></el-tree>
        </el-row>
      </el-aside>
      <el-main class="padding0" style="overflow: hidden;position: relative;">
        <div id="OperaTMap" style="width:100%;height:100%">
          <t-map ref="TMap" class="myTMap"></t-map>
        </div>
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
              <el-dropdown-item command="6">避让区规划(圆)</el-dropdown-item>
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
                <el-dropdown-item command="3">勾选新点</el-dropdown-item>
                <el-dropdown-item command="5">删除最后一点</el-dropdown-item>
                <el-dropdown-item command="4">保存新建识别区</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </span>
          <span class="tools-li">
            <el-dropdown trigger="click" @command="liftToolClick" size="mini" split-button >
              <span class="el-dropdown-link">起降点工具</span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="1">起降点规划</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </span>
          <span class="tools-li">
            <el-button size="mini" icon="el-icon-search" @click="Screenshot">截图</el-button>
          </span> 
          <span class="tools-li">
            <el-button size="mini" icon="iconfont icon-bip-save" @click="PlanToReport">防治计划上报</el-button>
          </span>
          <span class="tools-li">
            <el-button size="mini" icon="iconfont icon-bip-save" @click="shelfAreaMerge">架区合并</el-button>
          </span>          
        </div>
      </el-main>
      <!-- 右侧作业区 -->
      <el-aside :width="operaWidth+'px'">
        <div>
          <el-tabs v-model="activeName1" type="card">
            <el-tab-pane label="作业区" name="first" :style="activeName1Style">
              <el-checkbox :indeterminate="sbqIsIndeterminate" v-model="sbqCheckAll" @change="sbqCheckAllChange">全选</el-checkbox>
              <el-checkbox-group class="opera" v-model="checkOperaList" @change="checkBoxChange">
                <el-row v-for="(item,index) in operaSBQData" :key="index">
                  <el-row style="padding-top:5px;border-top: 1px solid #f1f1f1;margin-bottom: 5px;">
                    <el-col :span="4" style="height:60px;line-height:60px;text-align: center;">
                      <el-checkbox class="myOperatingAreaCheck" :label="item.data.id" :key="item.data.id"></el-checkbox>
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
                              <el-button type="primary" @click="editOperaSbq(item.data.id)" style="padding:2px; font-size:0.12rem;">编辑</el-button>
                            </el-col>
                            <el-col :span="8">
                                <el-button type="info" @click="copyOpera(item.data.id)" style="padding:2px; font-size:0.12rem;">复制</el-button>
                            </el-col>
                            <el-col :span="8">
                              <el-button type="danger" @click="delOpera(item.data.id,0,index)" style="padding:1px; font-size:0.12rem;">删除</el-button>   
                            </el-col>
                          </el-row>                   
                        </el-col>
                      </el-row>
                    </el-col>
                  </el-row> 
                </el-row>
              </el-checkbox-group>
            </el-tab-pane>
            <el-tab-pane label="架区" name="second">
              <el-tabs v-model="activeName2" type="card">
                <el-tab-pane label="春季" name="c" :style="activeName2Style">
                  <el-checkbox :indeterminate="cIsIndeterminate" v-model="cCheckAll" @change="cCheckAllChange">全选</el-checkbox>
                  <el-checkbox-group class="opera" v-model="checkOperaList" @change="checkBoxChange">
                    <el-row v-for="(item,index) in operaCData" :key="index">
                      <el-row style="padding-top:5px;border-top: 1px solid #f1f1f1;margin-bottom: 5px;">
                        <el-col :span="4" style="height:60px;line-height:60px;text-align: center;">
                          <el-checkbox class="myOperatingAreaCheck" :label="item.data.id" :key="item.data.id"></el-checkbox>
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
                                  <el-button type="primary" v-if="!item.data.mergeid" @click="editOpera(item.data.id)" style="padding:2px; font-size:0.12rem;">编辑</el-button>
                                </el-col>
                                <el-col :span="6">
                                    <el-button type="info" v-if="!item.data.mergeid" @click="copyOpera(item.data.id)" style="padding:2px; font-size:0.12rem;">复制</el-button>
                                </el-col>
                                <el-col :span="6">
                                  <el-button type="danger" @click="delOpera(item.data.id,1,index)" style="padding:1px; font-size:0.12rem;">删除</el-button>   
                                </el-col>
                                <el-col :span="6">
                                  <el-button type="danger" v-if="!item.data.mergeid" @click="showoperaBrCData['BR'+index] = ! showoperaBrCData['BR'+index]" style="padding:1px; font-size:0.12rem;">避让区</el-button>   
                                </el-col>
                              </el-row>                   
                            </el-col>
                          </el-row>
                        </el-col>
                      </el-row>
                      <el-row style="font-size:14px;">
                        <template v-if="showoperaBrCData['BR'+index]">
                            <el-row v-for="(item,indexbr) in operaBrData[item.data.id]" :key="indexbr">
                                <el-col :span="4">&nbsp;</el-col>
                                <el-col :span="12">{{item.data.name}}</el-col>
                                <el-col :span="8">
                                <el-row type="flex" justify="end">
                                    <el-button v-show="item.data.type==1" type="text" @click="editOperaBr(item.data)" style="padding:2px; font-size:0.12rem;">编辑</el-button>
                                    <el-button type="text" @click="delOperaBr(item.data,indexbr,index,'C')" style="padding:2px; font-size:0.12rem;">删除</el-button>
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
                                <el-checkbox class="myOperatingAreaCheck" :label="item.data.id" :key="item.data.id"></el-checkbox>
                                </el-col>
                                <el-col :span="20">
                                <el-row>
                                    <el-col :span="24" style="height:20px;font-size: 0.8rem; color: rgba(0,0,0,.54)">{{item.data.name}}</el-col>
                                    <el-col :span="24" style="color: rgba(0,0,0,.54);font-size: .12rem;">{{item.data.address}}</el-col>
                                </el-row>
                                <el-row style="padding-top:6px">
                                    <el-col :span="24" > 
                                    <el-row style="textAlign:center;">
                                        <el-col :span="6">
                                        <el-button type="primary" v-if="!item.data.mergeid" @click="editOpera(item.data.id)" style="padding:2px; font-size:0.12rem;">编辑</el-button>
                                        </el-col>
                                        <el-col :span="6">
                                            <el-button type="info" v-if="!item.data.mergeid" @click="copyOpera(item.data.id)" style="padding:2px; font-size:0.12rem;">复制</el-button>
                                        </el-col>
                                        <el-col :span="6">
                                        <el-button type="danger" @click="delOpera(item.data.id,2,index)" style="padding:1px; font-size:0.12rem;">删除</el-button>   
                                        </el-col>
                                        <el-col :span="6">
                                        <el-button type="danger" v-if="!item.data.mergeid" @click="showoperaBrXData['BR'+index] = ! showoperaBrXData['BR'+index]" style="padding:1px; font-size:0.12rem;">避让区</el-button>   
                                        </el-col>
                                    </el-row>                   
                                    </el-col>
                                </el-row>
                                </el-col>
                            </el-row>  
                            <el-row style="font-size:14px;"> 
                                <template v-if="showoperaBrXData['BR'+index]">
                                    <el-row v-if="operaBrData[item.data.id].length ==0">暂无避让信息</el-row>
                                    <el-row v-for="(britem,indexbr) in operaBrData[item.data.id]" :key="indexbr">
                                        <el-col :span="4">&nbsp;</el-col>
                                        <el-col :span="12">{{britem.data.name}}</el-col>
                                        <el-col :span="8">
                                        <el-row type="flex" justify="end">
                                            <el-button v-show="britem.data.type==1" type="text" @click="editOperaBr(britem.data)" style="padding:2px; font-size:0.12rem;">编辑</el-button>
                                            <el-button type="text" @click="delOperaBr(britem.data,indexbr,index,'X')" style="padding:2px; font-size:0.12rem;">删除</el-button>
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
                          <el-checkbox class="myOperatingAreaCheck" :label="item.data.id" :key="item.data.id"></el-checkbox>
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
                                  <el-button type="primary" v-if="!item.data.mergeid" @click="editOpera(item.data.id)" style="padding:2px; font-size:0.12rem;">编辑</el-button>
                                </el-col>
                                <el-col :span="6">
                                    <el-button type="info" v-if="!item.data.mergeid" @click="copyOpera(item.data.id)" style="padding:2px; font-size:0.12rem;">复制</el-button>
                                </el-col>
                                <el-col :span="6">
                                  <el-button type="danger" @click="delOpera(item.data.id,3,index)" style="padding:1px; font-size:0.12rem;">删除</el-button>   
                                </el-col>
                                <el-col :span="6">
                                  <el-button type="danger" v-if="!item.data.mergeid" @click="showoperaBrQData['BR'+index] = ! showoperaBrQData['BR'+index]" style="padding:1px; font-size:0.12rem;">避让区</el-button>   
                                </el-col>
                              </el-row>                   
                            </el-col>
                          </el-row>
                        </el-col>
                      </el-row>
                      <el-row style="font-size:14px;">
                        <template v-if="showoperaBrQData['BR'+index]">
                          <el-row v-for="(item,indexbr) in operaBrData[item.data.id]" :key="indexbr">
                            <el-col :span="4">&nbsp;</el-col>
                            <el-col :span="12">{{item.data.name}}</el-col>
                            <el-col :span="8">
                              <el-row type="flex" justify="end">
                                <el-button v-show="item.data.type==1" type="text" @click="editOperaBr(item.data)" style="padding:2px; font-size:0.12rem;">编辑</el-button>
                                <el-button type="text" @click="delOperaBr(item.data,indexbr,index,'Q')" style="padding:2px; font-size:0.12rem;">删除</el-button>
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
            <el-tab-pane label="起降点" name="third" :style="activeName1Style">
              <el-checkbox :indeterminate="liftIsIndeterminate" v-model="liftCheckAll" @change="liftCheckAllChange">全选</el-checkbox>
              <el-checkbox v-model="liftLableCheck" @change="liftLableChange">显示文字标注</el-checkbox>
              <el-checkbox-group class="opera" v-model="checkLiftList" @change="liftCheckBoxChange">
                <el-row v-for="(item,index) in liftData" :key="index">
                  <el-row style="padding-top:5px;border-top: 1px solid #f1f1f1;margin-bottom: 5px;">
                    <el-col :span="4" style="height:60px;line-height:60px;text-align: center;">
                      <el-checkbox class="myOperatingAreaCheck" :label="item.data.sid" :key="item.data.sid"></el-checkbox>
                    </el-col>
                    <el-col :span="20" style="height:80px;">
                      <el-row>
                        <el-col :span="24" style="height:20px;font-size: 0.8rem; color: rgba(0,0,0,.54)">{{item.data.name}}</el-col>
                        <el-col :span="24" style="height:20px;color: rgba(0,0,0,.54);font-size: .12rem;">{{item.data.name1}}</el-col>
                        <el-col :span="24" style="height:20px;color: rgba(0,0,0,.54);font-size: .12rem;">{{item.data.place}}</el-col>
                      </el-row>
                      <el-row>
                        <el-col :span="24" > 
                          <el-row style="textAlign:center;">
                            <el-col :span="8">
                              <el-button type="primary" @click="editLift(item.data.sid)" style="padding:2px; font-size:0.12rem;">编辑</el-button>
                            </el-col>
                            <el-col :span="8">
                                <!-- <el-button type="info" @click="copyOpera(item.data.sid)" style="padding:2px; font-size:0.12rem;">复制</el-button> -->
                            </el-col>
                            <el-col :span="8">
                              <el-button type="danger" @click="delLift(item.data.sid,index)" style="padding:1px; font-size:0.12rem;">删除</el-button>   
                            </el-col>
                          </el-row>                   
                        </el-col>
                      </el-row>
                    </el-col>
                  </el-row> 
                </el-row>
              </el-checkbox-group>
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
        <el-button type="primary" @click="getOpera(null)" size="mini">确 定</el-button>
      </span>
    </el-dialog>
    
    <el-dialog title="新增/修改 架区" :close-on-click-modal="false" :visible.sync="showSaveOperaDia" width="50%" class="bip-query">
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

    <el-dialog title="新增/修改避让区" :close-on-click-modal="false" :visible.sync="showSaveOperaBrDia" width="50%" class="bip-query">
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

    <el-dialog title="新增/修改作业区" :close-on-click-modal="false" :visible.sync="showSavesbqDia" width="50%" class="bip-query">
      <el-row class="bip-lay">
        <el-form @submit.native.prevent label-position="right" label-width="100px">
          <div v-for="(cel,index) in sbqCell.ccells.cels" :key="'A'+index">
            <bip-comm-editor
              v-if="(cel.attr&0x400) <= 0 "
              :cell="cel"
              :bgrid="false"
              :cds="sbqCell"
              :row="0"
            />
          </div>
        </el-form>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showSavesbqDia = false" size="mini">取 消</el-button>
        <el-button type="primary" @click="saveSbq" size="mini">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="新增/修改起降点" :close-on-click-modal="false" :visible.sync="showLiftDialog" width="50%" class="bip-query">
      <el-row class="bip-lay">
        <el-form @submit.native.prevent label-position="right" label-width="100px">
          <div v-for="(cel,index) in liftCell.ccells.cels" :key="'A'+index">
            <bip-comm-editor
              v-if="(cel.attr&0x400) <= 0 "
              :cell="cel"
              :bgrid="false"
              :cds="liftCell"
              :row="0"
            />
          </div>
        </el-form>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showLiftDialog = false" size="mini">取 消</el-button>
        <el-button type="primary" @click="saveLift" size="mini">确 定</el-button>
      </span>
    </el-dialog>
     
    <el-dialog title="架区合并" :close-on-click-modal="false" :visible.sync="showSaveHBOperaDia" width="50%" class="bip-query">
      <el-row class="bip-lay">
        <el-form @submit.native.prevent label-position="right" label-width="100px">
          <div v-for="(cel,index) in jqMergeCell.ccells.cels" :key="'A'+index">
            <bip-comm-editor
              v-if="(cel.attr&0x400) <= 0 "
              :cell="cel"
              :bgrid="false"
              :cds="jqMergeCell"
              :row="0"
            />
          </div>
        </el-form>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showSaveHBOperaDia = false" size="mini">取 消</el-button>
        <el-button type="primary" @click="saveHBOpera" size="mini">确 定</el-button>
      </span>
    </el-dialog>

    <div style="margin-top:20px">&nbsp;</div>
    <div id="SBQTMap" :style="tmap1Style">
      <div id="TMap1" :style="tmap1Style" ></div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Watch } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from "vuex-class";
import QueryEntity from "@/classes/search/QueryEntity";
import QueryCont from "@/classes/search/QueryCont";
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi;
import { TMapUtils } from "./class/TMapUtils";
let TMapUt = TMapUtils.TMapUt;
import { Cells } from "@/classes/pub/coob/Cells";
import CDataSet from "@/classes/pub/CDataSet";
import tMap from "@/components/map/MyTianMap.vue";
import bMap from "@/components/map/MyBaiMap.vue";
import {T} from "@/components/map/js/TMap";
import domtoimage from 'dom-to-image';
import { GlobalVariable } from '@/utils/ICL';
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
    @Provide() cityColor:string = "#FFEA00";//行政区边线颜色
    @Provide() sbqCheckAll:boolean =false;//识别区全选
    @Provide() liftCheckAll:boolean = false;//起降点全选
    @Provide() liftLableCheck:boolean = true;//起降点是否显示文字标识
    @Provide() sbqIsIndeterminate:boolean =false;
    @Provide() liftIsIndeterminate:boolean = false;
    @Provide() cCheckAll:boolean =false;
    @Provide() cIsIndeterminate:boolean =false;
    @Provide() xCheckAll:boolean =false;
    @Provide() xIsIndeterminate:boolean =false;
    @Provide() qCheckAll:boolean =false;
    @Provide() qIsIndeterminate:boolean = false;

    @Provide() tmap1Style:string ="width:7000px;height:7000px";
    @Provide() downloadUrl:any = null;
    @Provide() downloadfilename:any = null;

    @Provide() TMap1: any = null;
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
    @Provide() operaBrCircle:any = null;//天地图避让区 画园对象


    @Provide() showoperaBrCData:any ={"BR0":false,"BR1":false,"BR2":false,"BR3":false,"BR4":false,"BR5":false,"BR6":false,"BR7":false,"BR8":false,"BR9":false,"BR10":false,"BR11":false,"BR12":false,"BR13":false,"BR14":false,"BR15":false,"BR16":false,"BR17":false,"BR18":false,"BR19":false,"BR20":false,"BR21":false,"BR22":false,"BR23":false,"BR24":false,"BR25":false,"BR26":false,"BR27":false,"BR28":false,"BR29":false,"BR30":false,"BR31":false,"BR32":false,"BR33":false,"BR34":false,"BR35":false,"BR36":false,"BR37":false,"BR38":false,"BR39":false,"BR40":false,"BR41":false,"BR42":false,"BR43":false,"BR44":false,"BR45":false,"BR46":false,"BR47":false,"BR48":false,"BR49":false,"BR50":false,"BR51":false,"BR52":false,"BR53":false,"BR54":false,"BR55":false,"BR56":false,"BR57":false,"BR58":false,"BR59":false,"BR60":false,"BR61":false,"BR62":false,"BR63":false,"BR64":false,"BR65":false,"BR66":false,"BR67":false,"BR68":false,"BR69":false,"BR70":false,"BR71":false,"BR72":false,"BR73":false,"BR74":false,"BR75":false,"BR76":false,"BR77":false,"BR78":false,"BR79":false,"BR80":false,"BR81":false,"BR82":false,"BR83":false,"BR84":false,"BR85":false,"BR86":false,"BR87":false,"BR88":false,"BR89":false,"BR90":false,"BR91":false,"BR92":false,"BR93":false,"BR94":false,"BR95":false,"BR96":false,"BR97":false,"BR98":false,"BR99":false,"BR100":false,"BR101":false,"BR102":false,"BR103":false,"BR104":false,"BR105":false,"BR106":false,"BR107":false,"BR108":false,"BR109":false,"BR110":false,"BR111":false,"BR112":false,"BR113":false,"BR114":false,"BR115":false,"BR116":false,"BR117":false,"BR118":false,"BR119":false,"BR120":false,"BR121":false,"BR122":false,"BR123":false,"BR124":false,"BR125":false,"BR126":false,"BR127":false,"BR128":false,"BR129":false,"BR130":false,"BR131":false,"BR132":false,"BR133":false,"BR134":false,"BR135":false,"BR136":false,"BR137":false,"BR138":false,"BR139":false,"BR140":false,"BR141":false,"BR142":false,"BR143":false,"BR144":false,"BR145":false,"BR146":false,"BR147":false,"BR148":false,"BR149":false,"BR150":false,"BR151":false,"BR152":false,"BR153":false,"BR154":false,"BR155":false,"BR156":false,"BR157":false,"BR158":false,"BR159":false,"BR160":false,"BR161":false,"BR162":false,"BR163":false,"BR164":false,"BR165":false,"BR166":false,"BR167":false,"BR168":false,"BR169":false,"BR170":false,"BR171":false,"BR172":false,"BR173":false,"BR174":false,"BR175":false,"BR176":false,"BR177":false,"BR178":false,"BR179":false,"BR180":false,"BR181":false,"BR182":false,"BR183":false,"BR184":false,"BR185":false,"BR186":false,"BR187":false,"BR188":false,"BR189":false,"BR190":false,"BR191":false,"BR192":false,"BR193":false,"BR194":false,"BR195":false,"BR196":false,"BR197":false,"BR198":false,"BR199":false,"BR200":false,"BR201":false,"BR202":false,"BR203":false,"BR204":false,"BR205":false,"BR206":false,"BR207":false,"BR208":false,"BR209":false,"BR210":false,"BR211":false,"BR212":false,"BR213":false,"BR214":false,"BR215":false,"BR216":false,"BR217":false,"BR218":false,"BR219":false,"BR220":false,"BR221":false,"BR222":false,"BR223":false,"BR224":false,"BR225":false,"BR226":false,"BR227":false,"BR228":false,"BR229":false,"BR230":false,"BR231":false,"BR232":false,"BR233":false,"BR234":false,"BR235":false,"BR236":false,"BR237":false,"BR238":false,"BR239":false,"BR240":false,"BR241":false,"BR242":false,"BR243":false,"BR244":false,"BR245":false,"BR246":false,"BR247":false,"BR248":false,"BR249":false,"BR250":false,"BR251":false,"BR252":false,"BR253":false,"BR254":false,"BR255":false,"BR256":false,"BR257":false,"BR258":false,"BR259":false,"BR260":false,"BR261":false,"BR262":false,"BR263":false,"BR264":false,"BR265":false,"BR266":false,"BR267":false,"BR268":false,"BR269":false,"BR270":false,"BR271":false,"BR272":false,"BR273":false,"BR274":false,"BR275":false,"BR276":false,"BR277":false,"BR278":false,"BR279":false,"BR280":false,"BR281":false,"BR282":false,"BR283":false,"BR284":false,"BR285":false,"BR286":false,"BR287":false,"BR288":false,"BR289":false,"BR290":false,"BR291":false,"BR292":false,"BR293":false,"BR294":false,"BR295":false,"BR296":false,"BR297":false,"BR298":false,"BR299":false,"BR300":false,"BR301":false,"BR302":false,"BR303":false,"BR304":false,"BR305":false,"BR306":false,"BR307":false,"BR308":false,"BR309":false,"BR310":false,"BR311":false,"BR312":false,"BR313":false,"BR314":false,"BR315":false,"BR316":false,"BR317":false,"BR318":false,"BR319":false,"BR320":false,"BR321":false,"BR322":false,"BR323":false,"BR324":false,"BR325":false,"BR326":false,"BR327":false,"BR328":false,"BR329":false,"BR330":false,"BR331":false,"BR332":false,"BR333":false,"BR334":false,"BR335":false,"BR336":false,"BR337":false,"BR338":false,"BR339":false,"BR340":false,"BR341":false,"BR342":false,"BR343":false,"BR344":false,"BR345":false,"BR346":false,"BR347":false,"BR348":false,"BR349":false,"BR350":false,"BR351":false,"BR352":false,"BR353":false,"BR354":false,"BR355":false,"BR356":false,"BR357":false,"BR358":false,"BR359":false,"BR360":false,"BR361":false,"BR362":false,"BR363":false,"BR364":false,"BR365":false,"BR366":false,"BR367":false,"BR368":false,"BR369":false,"BR370":false,"BR371":false,"BR372":false,"BR373":false,"BR374":false,"BR375":false,"BR376":false,"BR377":false,"BR378":false,"BR379":false,"BR380":false,"BR381":false,"BR382":false,"BR383":false,"BR384":false,"BR385":false,"BR386":false,"BR387":false,"BR388":false,"BR389":false,"BR390":false,"BR391":false,"BR392":false,"BR393":false,"BR394":false,"BR395":false,"BR396":false,"BR397":false,"BR398":false,"BR399":false,"BR400":false,"BR401":false,"BR402":false,"BR403":false,"BR404":false,"BR405":false,"BR406":false,"BR407":false,"BR408":false,"BR409":false,"BR410":false,"BR411":false,"BR412":false,"BR413":false,"BR414":false,"BR415":false,"BR416":false,"BR417":false,"BR418":false,"BR419":false,"BR420":false,"BR421":false,"BR422":false,"BR423":false,"BR424":false,"BR425":false,"BR426":false,"BR427":false,"BR428":false,"BR429":false,"BR430":false,"BR431":false,"BR432":false,"BR433":false,"BR434":false,"BR435":false,"BR436":false,"BR437":false,"BR438":false,"BR439":false,"BR440":false,"BR441":false,"BR442":false,"BR443":false,"BR444":false,"BR445":false,"BR446":false,"BR447":false,"BR448":false,"BR449":false,"BR450":false,"BR451":false,"BR452":false,"BR453":false,"BR454":false,"BR455":false,"BR456":false,"BR457":false,"BR458":false,"BR459":false,"BR460":false,"BR461":false,"BR462":false,"BR463":false,"BR464":false,"BR465":false,"BR466":false,"BR467":false,"BR468":false,"BR469":false,"BR470":false,"BR471":false,"BR472":false,"BR473":false,"BR474":false,"BR475":false,"BR476":false,"BR477":false,"BR478":false,"BR479":false,"BR480":false,"BR481":false,"BR482":false,"BR483":false,"BR484":false,"BR485":false,"BR486":false,"BR487":false,"BR488":false,"BR489":false,"BR490":false,"BR491":false,"BR492":false,"BR493":false,"BR494":false,"BR495":false,"BR496":false,"BR497":false,"BR498":false,"BR499":false}//是否显示作业区避让点集合
    @Provide() showoperaBrXData:any ={"BR0":false,"BR1":false,"BR2":false,"BR3":false,"BR4":false,"BR5":false,"BR6":false,"BR7":false,"BR8":false,"BR9":false,"BR10":false,"BR11":false,"BR12":false,"BR13":false,"BR14":false,"BR15":false,"BR16":false,"BR17":false,"BR18":false,"BR19":false,"BR20":false,"BR21":false,"BR22":false,"BR23":false,"BR24":false,"BR25":false,"BR26":false,"BR27":false,"BR28":false,"BR29":false,"BR30":false,"BR31":false,"BR32":false,"BR33":false,"BR34":false,"BR35":false,"BR36":false,"BR37":false,"BR38":false,"BR39":false,"BR40":false,"BR41":false,"BR42":false,"BR43":false,"BR44":false,"BR45":false,"BR46":false,"BR47":false,"BR48":false,"BR49":false,"BR50":false,"BR51":false,"BR52":false,"BR53":false,"BR54":false,"BR55":false,"BR56":false,"BR57":false,"BR58":false,"BR59":false,"BR60":false,"BR61":false,"BR62":false,"BR63":false,"BR64":false,"BR65":false,"BR66":false,"BR67":false,"BR68":false,"BR69":false,"BR70":false,"BR71":false,"BR72":false,"BR73":false,"BR74":false,"BR75":false,"BR76":false,"BR77":false,"BR78":false,"BR79":false,"BR80":false,"BR81":false,"BR82":false,"BR83":false,"BR84":false,"BR85":false,"BR86":false,"BR87":false,"BR88":false,"BR89":false,"BR90":false,"BR91":false,"BR92":false,"BR93":false,"BR94":false,"BR95":false,"BR96":false,"BR97":false,"BR98":false,"BR99":false,"BR100":false,"BR101":false,"BR102":false,"BR103":false,"BR104":false,"BR105":false,"BR106":false,"BR107":false,"BR108":false,"BR109":false,"BR110":false,"BR111":false,"BR112":false,"BR113":false,"BR114":false,"BR115":false,"BR116":false,"BR117":false,"BR118":false,"BR119":false,"BR120":false,"BR121":false,"BR122":false,"BR123":false,"BR124":false,"BR125":false,"BR126":false,"BR127":false,"BR128":false,"BR129":false,"BR130":false,"BR131":false,"BR132":false,"BR133":false,"BR134":false,"BR135":false,"BR136":false,"BR137":false,"BR138":false,"BR139":false,"BR140":false,"BR141":false,"BR142":false,"BR143":false,"BR144":false,"BR145":false,"BR146":false,"BR147":false,"BR148":false,"BR149":false,"BR150":false,"BR151":false,"BR152":false,"BR153":false,"BR154":false,"BR155":false,"BR156":false,"BR157":false,"BR158":false,"BR159":false,"BR160":false,"BR161":false,"BR162":false,"BR163":false,"BR164":false,"BR165":false,"BR166":false,"BR167":false,"BR168":false,"BR169":false,"BR170":false,"BR171":false,"BR172":false,"BR173":false,"BR174":false,"BR175":false,"BR176":false,"BR177":false,"BR178":false,"BR179":false,"BR180":false,"BR181":false,"BR182":false,"BR183":false,"BR184":false,"BR185":false,"BR186":false,"BR187":false,"BR188":false,"BR189":false,"BR190":false,"BR191":false,"BR192":false,"BR193":false,"BR194":false,"BR195":false,"BR196":false,"BR197":false,"BR198":false,"BR199":false,"BR200":false,"BR201":false,"BR202":false,"BR203":false,"BR204":false,"BR205":false,"BR206":false,"BR207":false,"BR208":false,"BR209":false,"BR210":false,"BR211":false,"BR212":false,"BR213":false,"BR214":false,"BR215":false,"BR216":false,"BR217":false,"BR218":false,"BR219":false,"BR220":false,"BR221":false,"BR222":false,"BR223":false,"BR224":false,"BR225":false,"BR226":false,"BR227":false,"BR228":false,"BR229":false,"BR230":false,"BR231":false,"BR232":false,"BR233":false,"BR234":false,"BR235":false,"BR236":false,"BR237":false,"BR238":false,"BR239":false,"BR240":false,"BR241":false,"BR242":false,"BR243":false,"BR244":false,"BR245":false,"BR246":false,"BR247":false,"BR248":false,"BR249":false,"BR250":false,"BR251":false,"BR252":false,"BR253":false,"BR254":false,"BR255":false,"BR256":false,"BR257":false,"BR258":false,"BR259":false,"BR260":false,"BR261":false,"BR262":false,"BR263":false,"BR264":false,"BR265":false,"BR266":false,"BR267":false,"BR268":false,"BR269":false,"BR270":false,"BR271":false,"BR272":false,"BR273":false,"BR274":false,"BR275":false,"BR276":false,"BR277":false,"BR278":false,"BR279":false,"BR280":false,"BR281":false,"BR282":false,"BR283":false,"BR284":false,"BR285":false,"BR286":false,"BR287":false,"BR288":false,"BR289":false,"BR290":false,"BR291":false,"BR292":false,"BR293":false,"BR294":false,"BR295":false,"BR296":false,"BR297":false,"BR298":false,"BR299":false,"BR300":false,"BR301":false,"BR302":false,"BR303":false,"BR304":false,"BR305":false,"BR306":false,"BR307":false,"BR308":false,"BR309":false,"BR310":false,"BR311":false,"BR312":false,"BR313":false,"BR314":false,"BR315":false,"BR316":false,"BR317":false,"BR318":false,"BR319":false,"BR320":false,"BR321":false,"BR322":false,"BR323":false,"BR324":false,"BR325":false,"BR326":false,"BR327":false,"BR328":false,"BR329":false,"BR330":false,"BR331":false,"BR332":false,"BR333":false,"BR334":false,"BR335":false,"BR336":false,"BR337":false,"BR338":false,"BR339":false,"BR340":false,"BR341":false,"BR342":false,"BR343":false,"BR344":false,"BR345":false,"BR346":false,"BR347":false,"BR348":false,"BR349":false,"BR350":false,"BR351":false,"BR352":false,"BR353":false,"BR354":false,"BR355":false,"BR356":false,"BR357":false,"BR358":false,"BR359":false,"BR360":false,"BR361":false,"BR362":false,"BR363":false,"BR364":false,"BR365":false,"BR366":false,"BR367":false,"BR368":false,"BR369":false,"BR370":false,"BR371":false,"BR372":false,"BR373":false,"BR374":false,"BR375":false,"BR376":false,"BR377":false,"BR378":false,"BR379":false,"BR380":false,"BR381":false,"BR382":false,"BR383":false,"BR384":false,"BR385":false,"BR386":false,"BR387":false,"BR388":false,"BR389":false,"BR390":false,"BR391":false,"BR392":false,"BR393":false,"BR394":false,"BR395":false,"BR396":false,"BR397":false,"BR398":false,"BR399":false,"BR400":false,"BR401":false,"BR402":false,"BR403":false,"BR404":false,"BR405":false,"BR406":false,"BR407":false,"BR408":false,"BR409":false,"BR410":false,"BR411":false,"BR412":false,"BR413":false,"BR414":false,"BR415":false,"BR416":false,"BR417":false,"BR418":false,"BR419":false,"BR420":false,"BR421":false,"BR422":false,"BR423":false,"BR424":false,"BR425":false,"BR426":false,"BR427":false,"BR428":false,"BR429":false,"BR430":false,"BR431":false,"BR432":false,"BR433":false,"BR434":false,"BR435":false,"BR436":false,"BR437":false,"BR438":false,"BR439":false,"BR440":false,"BR441":false,"BR442":false,"BR443":false,"BR444":false,"BR445":false,"BR446":false,"BR447":false,"BR448":false,"BR449":false,"BR450":false,"BR451":false,"BR452":false,"BR453":false,"BR454":false,"BR455":false,"BR456":false,"BR457":false,"BR458":false,"BR459":false,"BR460":false,"BR461":false,"BR462":false,"BR463":false,"BR464":false,"BR465":false,"BR466":false,"BR467":false,"BR468":false,"BR469":false,"BR470":false,"BR471":false,"BR472":false,"BR473":false,"BR474":false,"BR475":false,"BR476":false,"BR477":false,"BR478":false,"BR479":false,"BR480":false,"BR481":false,"BR482":false,"BR483":false,"BR484":false,"BR485":false,"BR486":false,"BR487":false,"BR488":false,"BR489":false,"BR490":false,"BR491":false,"BR492":false,"BR493":false,"BR494":false,"BR495":false,"BR496":false,"BR497":false,"BR498":false,"BR499":false}//是否显示作业区避让点集合
    @Provide() showoperaBrQData:any ={"BR0":false,"BR1":false,"BR2":false,"BR3":false,"BR4":false,"BR5":false,"BR6":false,"BR7":false,"BR8":false,"BR9":false,"BR10":false,"BR11":false,"BR12":false,"BR13":false,"BR14":false,"BR15":false,"BR16":false,"BR17":false,"BR18":false,"BR19":false,"BR20":false,"BR21":false,"BR22":false,"BR23":false,"BR24":false,"BR25":false,"BR26":false,"BR27":false,"BR28":false,"BR29":false,"BR30":false,"BR31":false,"BR32":false,"BR33":false,"BR34":false,"BR35":false,"BR36":false,"BR37":false,"BR38":false,"BR39":false,"BR40":false,"BR41":false,"BR42":false,"BR43":false,"BR44":false,"BR45":false,"BR46":false,"BR47":false,"BR48":false,"BR49":false,"BR50":false,"BR51":false,"BR52":false,"BR53":false,"BR54":false,"BR55":false,"BR56":false,"BR57":false,"BR58":false,"BR59":false,"BR60":false,"BR61":false,"BR62":false,"BR63":false,"BR64":false,"BR65":false,"BR66":false,"BR67":false,"BR68":false,"BR69":false,"BR70":false,"BR71":false,"BR72":false,"BR73":false,"BR74":false,"BR75":false,"BR76":false,"BR77":false,"BR78":false,"BR79":false,"BR80":false,"BR81":false,"BR82":false,"BR83":false,"BR84":false,"BR85":false,"BR86":false,"BR87":false,"BR88":false,"BR89":false,"BR90":false,"BR91":false,"BR92":false,"BR93":false,"BR94":false,"BR95":false,"BR96":false,"BR97":false,"BR98":false,"BR99":false,"BR100":false,"BR101":false,"BR102":false,"BR103":false,"BR104":false,"BR105":false,"BR106":false,"BR107":false,"BR108":false,"BR109":false,"BR110":false,"BR111":false,"BR112":false,"BR113":false,"BR114":false,"BR115":false,"BR116":false,"BR117":false,"BR118":false,"BR119":false,"BR120":false,"BR121":false,"BR122":false,"BR123":false,"BR124":false,"BR125":false,"BR126":false,"BR127":false,"BR128":false,"BR129":false,"BR130":false,"BR131":false,"BR132":false,"BR133":false,"BR134":false,"BR135":false,"BR136":false,"BR137":false,"BR138":false,"BR139":false,"BR140":false,"BR141":false,"BR142":false,"BR143":false,"BR144":false,"BR145":false,"BR146":false,"BR147":false,"BR148":false,"BR149":false,"BR150":false,"BR151":false,"BR152":false,"BR153":false,"BR154":false,"BR155":false,"BR156":false,"BR157":false,"BR158":false,"BR159":false,"BR160":false,"BR161":false,"BR162":false,"BR163":false,"BR164":false,"BR165":false,"BR166":false,"BR167":false,"BR168":false,"BR169":false,"BR170":false,"BR171":false,"BR172":false,"BR173":false,"BR174":false,"BR175":false,"BR176":false,"BR177":false,"BR178":false,"BR179":false,"BR180":false,"BR181":false,"BR182":false,"BR183":false,"BR184":false,"BR185":false,"BR186":false,"BR187":false,"BR188":false,"BR189":false,"BR190":false,"BR191":false,"BR192":false,"BR193":false,"BR194":false,"BR195":false,"BR196":false,"BR197":false,"BR198":false,"BR199":false,"BR200":false,"BR201":false,"BR202":false,"BR203":false,"BR204":false,"BR205":false,"BR206":false,"BR207":false,"BR208":false,"BR209":false,"BR210":false,"BR211":false,"BR212":false,"BR213":false,"BR214":false,"BR215":false,"BR216":false,"BR217":false,"BR218":false,"BR219":false,"BR220":false,"BR221":false,"BR222":false,"BR223":false,"BR224":false,"BR225":false,"BR226":false,"BR227":false,"BR228":false,"BR229":false,"BR230":false,"BR231":false,"BR232":false,"BR233":false,"BR234":false,"BR235":false,"BR236":false,"BR237":false,"BR238":false,"BR239":false,"BR240":false,"BR241":false,"BR242":false,"BR243":false,"BR244":false,"BR245":false,"BR246":false,"BR247":false,"BR248":false,"BR249":false,"BR250":false,"BR251":false,"BR252":false,"BR253":false,"BR254":false,"BR255":false,"BR256":false,"BR257":false,"BR258":false,"BR259":false,"BR260":false,"BR261":false,"BR262":false,"BR263":false,"BR264":false,"BR265":false,"BR266":false,"BR267":false,"BR268":false,"BR269":false,"BR270":false,"BR271":false,"BR272":false,"BR273":false,"BR274":false,"BR275":false,"BR276":false,"BR277":false,"BR278":false,"BR279":false,"BR280":false,"BR281":false,"BR282":false,"BR283":false,"BR284":false,"BR285":false,"BR286":false,"BR287":false,"BR288":false,"BR289":false,"BR290":false,"BR291":false,"BR292":false,"BR293":false,"BR294":false,"BR295":false,"BR296":false,"BR297":false,"BR298":false,"BR299":false,"BR300":false,"BR301":false,"BR302":false,"BR303":false,"BR304":false,"BR305":false,"BR306":false,"BR307":false,"BR308":false,"BR309":false,"BR310":false,"BR311":false,"BR312":false,"BR313":false,"BR314":false,"BR315":false,"BR316":false,"BR317":false,"BR318":false,"BR319":false,"BR320":false,"BR321":false,"BR322":false,"BR323":false,"BR324":false,"BR325":false,"BR326":false,"BR327":false,"BR328":false,"BR329":false,"BR330":false,"BR331":false,"BR332":false,"BR333":false,"BR334":false,"BR335":false,"BR336":false,"BR337":false,"BR338":false,"BR339":false,"BR340":false,"BR341":false,"BR342":false,"BR343":false,"BR344":false,"BR345":false,"BR346":false,"BR347":false,"BR348":false,"BR349":false,"BR350":false,"BR351":false,"BR352":false,"BR353":false,"BR354":false,"BR355":false,"BR356":false,"BR357":false,"BR358":false,"BR359":false,"BR360":false,"BR361":false,"BR362":false,"BR363":false,"BR364":false,"BR365":false,"BR366":false,"BR367":false,"BR368":false,"BR369":false,"BR370":false,"BR371":false,"BR372":false,"BR373":false,"BR374":false,"BR375":false,"BR376":false,"BR377":false,"BR378":false,"BR379":false,"BR380":false,"BR381":false,"BR382":false,"BR383":false,"BR384":false,"BR385":false,"BR386":false,"BR387":false,"BR388":false,"BR389":false,"BR390":false,"BR391":false,"BR392":false,"BR393":false,"BR394":false,"BR395":false,"BR396":false,"BR397":false,"BR398":false,"BR399":false,"BR400":false,"BR401":false,"BR402":false,"BR403":false,"BR404":false,"BR405":false,"BR406":false,"BR407":false,"BR408":false,"BR409":false,"BR410":false,"BR411":false,"BR412":false,"BR413":false,"BR414":false,"BR415":false,"BR416":false,"BR417":false,"BR418":false,"BR419":false,"BR420":false,"BR421":false,"BR422":false,"BR423":false,"BR424":false,"BR425":false,"BR426":false,"BR427":false,"BR428":false,"BR429":false,"BR430":false,"BR431":false,"BR432":false,"BR433":false,"BR434":false,"BR435":false,"BR436":false,"BR437":false,"BR438":false,"BR439":false,"BR440":false,"BR441":false,"BR442":false,"BR443":false,"BR444":false,"BR445":false,"BR446":false,"BR447":false,"BR448":false,"BR449":false,"BR450":false,"BR451":false,"BR452":false,"BR453":false,"BR454":false,"BR455":false,"BR456":false,"BR457":false,"BR458":false,"BR459":false,"BR460":false,"BR461":false,"BR462":false,"BR463":false,"BR464":false,"BR465":false,"BR466":false,"BR467":false,"BR468":false,"BR469":false,"BR470":false,"BR471":false,"BR472":false,"BR473":false,"BR474":false,"BR475":false,"BR476":false,"BR477":false,"BR478":false,"BR479":false,"BR480":false,"BR481":false,"BR482":false,"BR483":false,"BR484":false,"BR485":false,"BR486":false,"BR487":false,"BR488":false,"BR489":false,"BR490":false,"BR491":false,"BR492":false,"BR493":false,"BR494":false,"BR495":false,"BR496":false,"BR497":false,"BR498":false,"BR499":false}//是否显示作业区避让点集合

    @Provide() operaBrData: any = {}; //避让区数据
    @Provide() operaBrJSON: any = {}; //避让区数据每一条
    @Provide() mapOperaBr: any = {}; //地图避让区覆盖集合

    @Provide() operaBrCell:CDataSet = new CDataSet("");//避让点对象
    @Provide() showSaveOperaBrDia:boolean =false;//是否显示新增避让点弹框


    @Provide() mapOpera: any = {}; //地图作业区覆盖集合
    @Provide() mapOperaTxt: any = {}; //地图作业区文字说明集合

    @Provide() showSavesbqDia:boolean = false;
    @Provide() sbqCell:CDataSet = new CDataSet("");//航空识别区对象
    @Provide() letter:any = ['A','B','C','D','E','F','G','H','I','G','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']
    @Provide() aviationDia:boolean = false;//航空识别区坐标点勾选弹出框
    @Provide() makeABCD:any={};//航空识别区四角标识
    @Provide() sbqPointABCD:any=[];//已勾选的识别区的四角坐标集合
    @Provide() checkedABCD:any = [];//新填识别区四角坐标
    @Provide() ckABCDCallout:any=[];//新增航空识别区地图标注点
    @Provide() sbqMarkerPoint:any = null;//识别区标注点对象


    @Provide() showLiftDialog:boolean = false;//是否显示新增起降点
    @Provide() liftCell:CDataSet = new CDataSet("");//起降点对象
    @Provide() liftLineTool:any=null;//天地图作业区 画线对象(起降点)
    @Provide() liftData:any=[];//起降点数据集合
    @Provide() liftJSON:any={};//起降点json格式数据集合
    @Provide() checkLiftList:any=[];//起降点勾选集合
    @Provide() mapLift:any={};//地图上的起降点集合
    @Provide() mapLiftTxt:any={};//地图上的起降点文字标识集合


    @Provide() operaSaveCell: CDataSet = new CDataSet(""); //作业区对象（保存对象）
    @Provide() showSaveOperaDia: boolean = false; //是否显示新增作业区弹框
    @Provide() editKid: any = null; //当前正在进行保存的kid 已经弹出保存框了

    @Provide() editBrk:any = null;//当前正在进行保存的kid 已经弹出保存框了
    @Provide() checkkid:any = null;//当前页选中的作业区ID 在勾选避让区域时用到

    @Provide() showScreenshot:boolean = false;//导出图片弹出框
    @Provide() mapImgType:string ='vector';

    @Provide() planCell:CDataSet = new CDataSet("");//防治计划上报

    @Provide() jqMergeCell:CDataSet = new CDataSet("");//架区合并
    @Provide() showSaveHBOperaDia:boolean = false;//是否显示架区合并弹框
    async created() {
        if (this.height) {
            this.style = "height:" + (this.height - 20) + "px";
            this.activeName1Style ="height:" + (this.height ? this.height - 65 : "400") + "px;";
            this.activeName2Style ="height:" + (this.height ? this.height - 95 : "400") + "px";
        }
        this.operaTjCell = await this.getCell("FW2015TJ");//作业区查询条件
        this.operaTjCell.createRecord();
        this.operaSaveCell = await this.getCell("F2045");//作业区
        this.operaBrCell = await this.getCell("F2015A");//避让点
        this.sbqCell = await this.getCell("F2015");//航空识别区对象
        this.liftCell = await this.getCell("20200203");//起降点对象
        this.planCell = await this.getCell("F2030");//防治计划上报对象
        this.jqMergeCell = await this.getCell("F2046")//架区合并
    }
    mounted() {
        if (this.$refs.TMap) {
        let refT: any = this.$refs.TMap;
        this.tMap = refT.getMap();
        this.fifthRingRoad();
        }
        
        this.TMap1 = new T.Map("TMap1",{projection:"EPSG:4326"});
        this.TMap1.centerAndZoom(new T.LngLat(116.40969, 39.89945), 14);
    }
/************************** 航空识别区图片导出START **************************/ 
    /**
     * 导出图片
     */
    Screenshot(){
        this.loading++;
        this.showScreenshot = false; 
        let zx = this.tMap.getCenter();
        this.TMap1.panTo(zx);
        this.TMap1.clearOverLays();
        this.makeImg();
    } 
    makeImg(){
        this.TMap1.checkResize();
        try{
        let overLays = this.tMap.getOverlays();
        let pointsArr:any =[];
        for(var i=0;i<overLays.length;i++){
            let onel = overLays[i];
            let type = onel.getType();
            // Label 类型为 1;
            // Marker 类型为 2;
            // InfoWindow类型为 3;
            // Polyline 类型为 4;
            // Polygon 类型为 5;
            // Rectangle 类型为 6;
            // Circle 类型为 8;
            let newOL = null;
            if(type ==1){//Table  文本标注
                let lgt = onel.getLngLat()
                newOL = new T.Label({
                    text: onel.NP,
                    position: lgt,
                    offset: new T.Point(-55, 0),
                }); 
                newOL.setFontSize(55)
                newOL.setBorderLine(0)
                newOL.setBackgroundColor(null); 
            }else if(type ==2){//Marker  图像标注
            let url = onel.options.icon.getIconUrl()
            //创建图片对象
            var icon = new T.Icon({
                    iconUrl: url,
                    iconSize: new T.Point(70, 70),
                    iconAnchor:new T.Point(35,70),
            });
            //向地图上添加自定义标注
            newOL = new T.Marker(onel.or,{icon: icon});
            }else if(type ==3){

            }else if(type ==4){
            newOL = new T.Polyline(onel.getLngLats()	, {
                color: onel.getColor(),
                weight: onel.getWeight(),
                opacity: onel.getOpacity()	,
                lineStyle: onel.getLineStyle(),
            });
            }else if(type ==5){
            //创建面对象
            newOL = new T.Polygon(onel.getLngLats(), {
                color: onel.getColor(),
                weight: onel.getWeight(),
                opacity: onel.getOpacity(),
                fillColor: onel.getFillColor(),
                fillOpacity: onel.getFillOpacity(),
            });
            }
            if(onel.ht){
            let ht = onel.ht[0];
            if(ht instanceof Array){
                ht = onel.ht[0]
            }else{
                ht = onel.ht
            }
            pointsArr = pointsArr.concat(ht);
            }
            if(newOL != null){
            this.TMap1.addOverLay(newOL);
            }
        }
        // //显示最佳比例尺
        this.TMap1.setViewport(pointsArr);
        }catch(e){
            console.log(e)
            this.loading--;
            this.$notify.error("图片获取失败！");
            return;
        }
        let _this = this; 
        try{
            console.log("开始导出图片！")
            domtoimage.toBlob(document.getElementById('SBQTMap')).then(function (data:any) {
                let blob = new Blob([data], {
                    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document;charset=utf-8"
                });
                let date = TMapUt.dateFormat(new Date(),"yyyy-MM-dd_HH:mm:ss")
                var url = window.URL.createObjectURL(blob); 
                var a = document.createElement('a');
                a.href = url;
                a.download = date+'HKSBQ.png';
                a.click(); 
                _this.loading--;
            })
            .catch(function (error:any) {
                console.log(error)
                _this.loading--;
                _this.$notify.error("图片获取失败！");
                // _this.makeImg();
            });
        }catch(e){
            this.loading--;
            this.$notify.error("图片获取失败！");
            console.log(e);
        } 
    }

/************************** 航空识别区图片导出END **************************/

    //清空地图覆盖物
    clearCover() {
        this.checkedABCD = [];
        this.sbqPointABCD = [];
        this.checkedABCD = [];
        this.mapOpera = {};
        this.mapOperaBr = {};
        this.mapOperaTxt = {};
        this.checkOperaList = [];
        this.checkLiftList = [];
        this.mapLift={};//地图上的起降点集合
        this.mapLiftTxt={};//地图上的起降点文字标识集合
        this.tMap.clearOverLays();
        this.fifthRingRoad();
    }
    //工具下拉选中
    toolClick(item: any) {
        if(item == 3 || item == 4 || item ==5 || item ==6){//画避让区域
        //判断一下是否只勾选了一个作业区
        let num =0;
        for(var i =0;i<this.operaData.length;i++){
            let d1 = this.operaData[i].data
            if(d1.sbuid == 'F2015'){
                if(this.checkOperaList.indexOf(d1.id) !=-1){
                    this.checkkid = d1.id;
                    num++
                }
                if(num == 2)
                    break;
            }
        }
        if(num>1){
            this.$notify.warning("请勾选一个架区！")
            return;
        }else if(num ==0){
            this.$notify.warning("请勾选架区！")
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
            var icon = new T.Icon({
                iconUrl: require('@/assets/air-super/avoid.png'),
                iconSize: new T.Point(50, 50),
                iconAnchor: new T.Point(25, 50)
            });
            this.operaBrMarker = new T.MarkTool(this.tMap, { follow: true ,icon:icon});
            this.operaBrMarker.addEventListener("mouseup",this.operaBrMarkerToolEnd);
        }
        this.operaBrMarker.close();
        this.operaBrMarker.open();
        }else if(item ==6){//避让点  圆圈
            if(!this.operaBrCircle){
                this.operaBrCircle = new T.CircleTool(this.tMap ,{ color: "blue", weight:1, opacity: 0.5, fillColor: "#FFFFFF", fillOpacity: 0.5});
                this.operaBrCircle.addEventListener("drawend", this.operaBrCircleToolEnd);
            }
            this.operaBrCircle.close();
            this.operaBrCircle.open();
        }
    }
    /**
     * 勾选发生变化
     */
    checkBoxChange(data: any) {
        for (var i = 0; i < data.length; i++) {
        let id = data[i];
        if (!this.mapOpera[id]) {
            //作业区
            let d1 = this.operaJSON[id];
            if(d1.mergeid){
                
            }else{

            }
            if(d1){
            let cc:any = this.makeOpera(d1);
            let polygon = cc[0];
            let points = cc[1];
            //向地图上添加面
            this.tMap.addOverLay(polygon);
            let t1 = this.tMap.getViewport(points);
            this.tMap.panTo(t1.center, t1.zoom);
            this.mapOpera[id] = polygon;
            let label = this.makeOperaLableTXT(d1, t1);
            this.tMap.addOverLay(label);
            this.mapOperaTxt[id] = label;
            this.makrAllBr(id,null);
            }
        }
        }
        for (let key in this.mapOpera) {
        let ka = key.split("|")[0];
        if (data.indexOf(ka) == -1) {
            if (ka.indexOf("non-") == -1 && ka.indexOf("copy-") == -1) {
            if (this.mapOpera[key]) {
                this.tMap.removeOverLay(this.mapOpera[key]);
            }
            if (this.mapOperaTxt[key]){
                this.tMap.removeOverLay(this.mapOperaTxt[key]);
            }
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
            co =d1.name; 
            if(d1.sbuid == 'F2005'){
                co = d1.id;
            }
        if (d1.area != 0 && d1.sbuid != 'F2005') {
            co += "<br/>面积：" + d1.area + "亩";
        }
        let lgt =  t1.center;
            if(d1.sbuid == 'F2005' && d1.startpoint){
                let poin = d1.startpoint.split(",")
                lgt = new T.LngLat(poin[0], poin[1])
            }
            var label = new T.Label({
                text: co,
                position: lgt,
                offset: new T.Point(-35, 0),
                fontsize :14
            });
            if(d1.sbuid == 'F2005'){
                label.setFontSize(55)
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
        if(d1.sbuid == 'F2005'){
            //创建面对象
            var polygon = new T.Polygon(points, {
                color: "#000000",
                weight: 4,
                opacity: 1,
                fillOpacity: 0
            });
        }
       
        return [polygon, points];
    } else {
      return null;
    }
  }

/********************* 架区合并 ************************/
    shelfAreaMerge(){
        let num =0;
        let season = null;
        let operid = "";
        for(var i=0;i<this.checkOperaList.length;i++){
            let key = this.checkOperaList[i];
            let d1 = this.operaJSON[key];
            if(d1.sbuid == 'F2015'){
                if(season == null){
                    season = d1.season;
                }else{
                    if(season != d1.season){
                        this.$notify.warning("请勾选同一季节架区！")
                        return;
                    }
                }
                num++;
                operid+= d1.id+";"
            }
        }
        if(num ==0){
            this.$notify.warning("请勾选架区！")
            return;
        } 
        operid = operid.substring(0,operid.length-1);
        this.jqMergeCell.clear();
        this.jqMergeCell.createRecord();
        this.jqMergeCell.currRecord.data.mergeid = operid;
        this.jqMergeCell.currRecord.data.season = season;
        this.showSaveHBOperaDia = true;
    }
    async saveHBOpera(){
        this.loading++;
        let bok = this.checkNotNull(this.jqMergeCell);
        if (!bok) return;
        let res: any = await this.jqMergeCell.saveData();
        if (res.data && res.data.id == 0) {
            let operid = this.jqMergeCell.currRecord.data.id;
            if(res.data.data.id && operid != res.data.data.id)
                operid = res.data.data.id; 
            let newDate = this.jqMergeCell.currRecord;
            let newID = newDate.data.id  
            if(newDate.data.sbuid == 'F2015'){    
                if(newDate.data.season+'' == '0'){       
                    this.operaCData.push(newDate); 
                }else if(newDate.data.season+'' == '1'){ 
                    this.operaXData.push(newDate);
                }else if(newDate.data.season+'' == '2'){  
                    this.operaQData.push(newDate);
                }
            }
            this.operaJSON[newID] = newDate.data 
        }
        this.$notify.success("合并成功！")
        this.showSaveHBOperaDia = false;
        this.loading--;
    }

/*************************** 架区合并END ********************************/

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
        if(item ==1){//显示四角标注
            for(var k in this.makeABCD){
                let data = this.makeABCD[k];
                for(var i=0;i<data.length;i++){
                this.tMap.removeOverLay(data[i])
                }
            }
            this.createABCD(sbqData)
        }else if(item == 3){//添加新点
                //创建标注工具对象
                var icon = new T.Icon({
                    iconUrl: require('@/assets/air-super/letter/'+this.letter[this.checkedABCD.length]+'.png'),
                    iconSize: new T.Point(19, 27),
                    iconAnchor: new T.Point(10, 25)
                });
                this.sbqMarkerPoint = new T.MarkTool(this.tMap, { follow: true,icon:icon });
                this.sbqMarkerPoint.addEventListener("mouseup",this.sbqMarkerPointToolEnd);
                this.sbqMarkerPoint.close();
                this.sbqMarkerPoint.open();
        }else if(item==4){//保存识别区 
            if(this.checkedABCD.length<=2){
                this.$notify.warning("请勾选正确的航空识别区！")
                return;
            }
            let boundary1 = "";
            for (var i = 0; i < this.checkedABCD.length; i++) {
            let point = this.checkedABCD[i];
                boundary1 += point + ";";
            }
            boundary1 = boundary1.substring(0, boundary1.length - 1);
            this.sbqCell.clear();
            this.sbqCell.createRecord();
            // this.operaSaveCell.currRecord.data.area = (parameter.currentArea / 666.66).toFixed(2);
            this.sbqCell.currRecord.data.boundary1 = boundary1;
            this.showSavesbqDia = true;
        }else if(item ==5){//删除最后一点
            this.tMap.removeOverLay(this.ckABCDCallout[this.ckABCDCallout.length-1]);
            this.ckABCDCallout.splice(this.ckABCDCallout.length-1,1)
            this.checkedABCD.splice(this.checkedABCD.length-1,1)
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
                label.setFontSize(18)
                label.setBorderLine(0)
                label.setBackgroundColor(null);
                label.addEventListener("click",this.lableClick);
                abcd.push(label)
                this.tMap.addOverLay(label);

                let point = {name:id+this.letter[j],latlng:boundary[j]}
                _abcd.push(point);
                }
                this.makeABCD[d1.id] = abcd;
                let point4 = {id:id,point:_abcd}
                abcdData.push(point4);
            }
        }
        this.sbqPointABCD = abcdData;
    }
    lableClick(lable:any){
        let lnglat = lable.lnglat;
        let l = lnglat.lng+","+lnglat.lat;
        this.checkedABCD.push(l);
        var icon = new T.Icon({
        iconUrl: require('@/assets/air-super/letter/'+this.letter[this.checkedABCD.length-1]+'.png'),
        iconSize: new T.Point(19, 27),
        iconAnchor: new T.Point(10, 25)
        });
        var marker = new T.Marker(lable.lnglat,{icon:icon});
        this.ckABCDCallout.push(marker)
        //向地图上添加标注
        this.tMap.addOverLay(marker);
    }
    /**
     * 新点标注完成后
     */
    sbqMarkerPointToolEnd(parameter:any){
        let editCover = parameter.currentMarker; 
        this.ckABCDCallout.push(editCover)
        let lnglat = parameter.currentLnglat;
        let avoid = lnglat.getLng()+","+lnglat.getLat();
        this.checkedABCD.push(avoid)
    }
    /**
     * 保存识别区
     */
    async saveSbq(){
        let bok = this.checkNotNull(this.sbqCell);
        if (!bok) return;
        let res: any = await this.sbqCell.saveData();
        if (res.data && res.data.id == 0) {
        let data = this.ckABCDCallout;
        for(var i=0;i<data.length;i++){
            this.tMap.removeOverLay(data[i])
        }
        this.ckABCDCallout=[];
        this.checkedABCD =[];
        this.sbqPointABCD=[];
        let id = res.data.data.id;
        
        this.showSavesbqDia = false;
        await this.getOpera(id);
        if (id) {
            this.checkOperaList.push(id);
            this.checkBoxChange(this.checkOperaList);
        }
            this.$notify.success("保存成功！");
        } else {
            this.showSavesbqDia = false;
            this.$notify.error("保存失败！");
        }
    }
    //边界航空识别区
    editOperaSbq(operid: any){
        let cover = this.mapOpera[operid];
        if (cover) {
            cover.removeEventListener("dblclick", this.sbqcoverDBClick);
            cover.addEventListener("dblclick", this.sbqcoverDBClick);
            cover.enableEdit();
            cover.kid = operid;
        } else {
            let d1 = this.operaJSON[operid];
            let cc:any = this.makeOpera(d1);
            let polygon = cc[0];
            let points = cc[1];
            //向地图上添加面
            this.tMap.addOverLay(polygon);
            let t1 = this.tMap.getViewport(points);
            this.tMap.panTo(t1.center, t1.zoom);
            this.mapOpera[operid] = polygon;
            let label = this.makeOperaLableTXT(d1, t1);
            this.tMap.addOverLay(label);
            this.mapOperaTxt[operid] = label;
            polygon.enableEdit();
            polygon.kid = operid;
            polygon.addEventListener("dblclick", this.sbqcoverDBClick);
        }
        if (this.checkOperaList.indexOf(operid) == -1) {
            this.checkOperaList.push(operid);
        }
    }
    /**
     * 作业区双击
     */
    sbqcoverDBClick(data: any) {
        console.log("作业区双击")
        let target = data.target;
        let operid = target.kid;
        this.editKid = target.kid;
        let points = target.getLngLats()[0];
        let cover = this.mapOpera[operid];
        if (operid) {
            let iscopy:boolean = false;
            if(operid.indexOf("copy-") !=-1){//是复制的图层
                operid = operid.replace("copy-",'');
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
            let d1 = this.operaJSON[operid];
            this.sbqCell.clear();
            this.sbqCell.createRecord();
            let area = polygonTool.getArea(points);
            if (d1 && iscopy == false) {
                //存在进行修改
                this.sbqCell.currRecord.data = d1;
                this.sbqCell.currRecord.c_state = 2;
            } else {
                if(iscopy){
                    let id = this.sbqCell.currRecord.data.id
                    this.sbqCell.currRecord.data = d1;
                    this.sbqCell.currRecord.data.id = id;
                }
                //新增
                this.sbqCell.currRecord.c_state = 1;
            }
            this.sbqCell.currRecord.data.area = (area / 666.66).toFixed(2);
            this.sbqCell.currRecord.data.boundary1 = boundary1;
            this.showSavesbqDia = true;
        }
    }
/***************** 航空识别区END ****************/






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
    async showOperaBr(operid:string){
        let qe: QueryEntity = new QueryEntity("F2015A", "F2015A");
        qe.page = {currPage: 1,index: 0,pageSize: 20000,total: 0};
        qe.cont = "{'oid':'"+operid+"'}";
        qe.oprid = 13;
        await this.operaBrCell
        .queryData(qe)
        .then(res => {
            if (res.data.id == 0) {
                this.operaBrData[operid] = res.data.data.data.data
                for (var i = 0; i < this.operaBrData[operid].length; i++) {
                    let d1 = this.operaBrData[operid][i].data;
                    let k = d1.oid+"|"+d1.oaid
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
            let k = oid + "|" + oaid;
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
    delOperaBr(data:any,indexBr:any,index:any,type:any){
        let k = data.oid+"|"+data.oaid;
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
            this.delBr(k,indexBr,index,type);
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
    async delBr(key:string,indexBr:any,index:any,type:any){
        let res: any = await this.operaBrCell.saveData();
        if (res.data && res.data.id == 0) {
            if(type == 'C'){
                this.showoperaBrCData['BR'+index] = false;
            }else if(type == 'X'){
                this.showoperaBrXData['BR'+index] = false;
            }else if(type == 'Q'){
                this.showoperaBrQData['BR'+index] = false;
            }
            let data = this.operaBrData[key.split("|")[0]];
            data.splice(indexBr,1);
            this.operaBrData[key.split("|")[0]] = data;
            if(type == 'C'){
                this.showoperaBrCData['BR'+index] = true;
            }else if(type == 'X'){
                this.showoperaBrXData['BR'+index] = true;
            }else if(type == 'Q'){
                this.showoperaBrQData['BR'+index] = true;
            }
            if (this.mapOperaBr[key]) {
                this.tMap.removeOverLay(this.mapOperaBr[key]);
            }
            delete this.operaBrJSON[key]
            this.$notify.success("删除成功！");
            await this.showOperaBr(key.split("|")[0]);
        } else {
            this.$notify.error("删除失败！");
        }
    }
    /**
     * 画单个作业区的全部避让区域
     */
    makrAllBr(operid:any,koid:any){
        if(this.operaBrData[operid]){
            let br = this.operaBrData[operid]
            for(var j=0;j<br.length;j++){
                let br1 = br[j].data;
                let dbr1 ={boundary1: br1.avoid,color:br1.color}
                let kk = operid+"|"+br1.oaid;
                if(!koid || koid == kk){
                    if(br1.type ==0){//点的
                        //创建标注对象
                        var icon = new T.Icon({
                            iconUrl: require('@/assets/air-super/avoid.png'),
                            iconSize: new T.Point(50, 50),
                            iconAnchor: new T.Point(25, 50)
                        });
                        var marker = new T.Marker(new T.LngLat(br1.avoid.split(",")[0], br1.avoid.split(",")[1]),{icon:icon});
                        if(this.mapOperaBr[kk]){
                        this.tMap.removeOverLay(this.mapOperaBr[kk]);
                        } 
                        //向地图上添加标注
                        this.tMap.addOverLay(marker);
                        this.mapOperaBr[kk] = marker;
                    }else if(br1.type ==1){//面
                        let ccbr:any = this.makeOpera(dbr1);
                        if(this.mapOperaBr[kk]){
                        this.tMap.removeOverLay(this.mapOperaBr[kk]);
                        }
                        this.tMap.addOverLay(ccbr[0]);
                        this.mapOperaBr[kk] = ccbr[0];
                    }else if(br1.type ==2){//圆圈
                        console.log(br1)
                        if(this.mapOperaBr[kk]){
                        this.tMap.removeOverLay(this.mapOperaBr[kk]);
                        }
                        let latlng = br1.avoid.split(",");
                        // 定义该矩形的显示区域
                        let radius = parseFloat(br1.radius+'')
                        var circle = new T.Circle(new T.LngLat(latlng[0], latlng[1]), radius,{color:"blue",weight:1,opacity:0.7,fillColor:br1.color,fillOpacity:0.5,lineStyle:"solid"});
                        //向地图上添加圆
                        this.tMap.addOverLay(circle); 
                        this.mapOperaBr[kk] = circle;
                    }
                }
            }
        }
    }
    /**
     * 删除单个作业区的全部避让区域
     */
    delAllBr(operid:any){
        if(this.operaBrData[operid]){
            let br = this.operaBrData[operid]
            for(var j=0;j<br.length;j++){
                let br1 = br[j].data;
                let kk = operid+"|"+br1.oaid;
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
        let kid = data.oid+"|"+data.oaid;
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
                this.operaBrCell.currRecord.data.oid = kid.split("|")[0];
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
    /**
     * 用户完成绘制圆时触发。
     * 参数说明：
     * currentCenter：中心点的地理坐标。
     * currentRadius：半径，单位为米。
     * currentCircle：用户最后绘制的圆对象。
     * allCircles:用户所有绘制的圆对象。
     */
    operaBrCircleToolEnd(parameter:any){
        let editCover = parameter.currentCircle;
        let key = "non-" + new Date().getTime();
        this.editBrk = key;
        this.mapOperaBr[key] = editCover;
        let radius = parameter.currentRadius;
        let lnglat = parameter.currentCenter;
        let avoid = lnglat.getLng()+","+lnglat.getLat();
        this.operaBrCell.clear()
        this.operaBrCell.createRecord();
        this.operaBrCell.currRecord.data.oid = this.checkkid;
        this.operaBrCell.currRecord.data.type = 2;
        this.operaBrCell.currRecord.data.avoid = avoid;
        this.operaBrCell.currRecord.data.radius = radius;
        this.showSaveOperaBrDia = true;
    }
/**************** END **************/



/***************** 起降点 ********************/
    //起降点工具选中
    liftToolClick(item:any){
        if(item == '1'){
            var icon = new T.Icon({
                iconUrl: require('@/assets/air-super/lift.png'),
                iconSize: new T.Point(70, 70),
                iconAnchor:new T.Point(35,70),
            });
            this.liftLineTool = new T.MarkTool(this.tMap, { follow: true,icon:icon });
            this.liftLineTool.addEventListener("mouseup",this.liftLineToolEnd);
            this.liftLineTool.close();
            this.liftLineTool.open();
        }
    }
    //起降点勾选完成
    /**
     * 线绘制结束
     * currentLnglats：用户当前绘制的折线的点坐标数组。
     * currentDistance：用户当前绘制的折线的地理长度。
     * currentPolyline：当前测距所画线的对象。
     * allPolylines：返回所有工具绘制的线对象。
     */
    liftLineToolEnd(parameter:any){

        let editCover = parameter.currentMarker;
        let key = "non-" + new Date().getTime();
        this.editBrk = key;
        this.mapOperaBr[key] = editCover;
        let lnglat = parameter.currentLnglat;
        let north = lnglat.getLng()+","+lnglat.getLat(); 
        editCover.kid = key;
        this.editKid = key;
        editCover.addEventListener("dblclick", this.liftDBClick);
        this.mapLift[key] = editCover;
        editCover.enableDragging();
        this.liftCell.clear();
        this.liftCell.createRecord();
        this.liftCell.currRecord.data.north = north;
        this.showLiftDialog = true;
    }
    /**
     * 起降点双击
     */
    liftDBClick(data: any) {
        let target = data.target;
        let operid = target.kid;
        this.editKid = target.kid;
        let lnglat = data.lnglat;
        let north = lnglat.getLng()+","+lnglat.getLat(); 
        let cover = this.mapLift[operid];
        if (operid) {
        let d1 = this.liftJSON[operid];
        this.liftCell.clear();
        this.liftCell.createRecord();
        if (d1 ) {
            //存在进行修改
            this.liftCell.currRecord.data = d1;
            this.liftCell.currRecord.c_state = 2;
        } else {
            //新增
            this.liftCell.currRecord.c_state = 1;
        }
        this.liftCell.currRecord.data.north = north;
        this.showLiftDialog = true;
        }
    }
    //保存起降点信息
    async saveLift(){
        console.log("保存起降点")
        let bok = this.checkNotNull(this.liftCell);
        if (!bok) return;
        let res: any = await this.liftCell.saveData();
        if (res.data && res.data.id == 0) {
        let liftsid = this.liftCell.currRecord.data.sid;
        if(res.data.data.sid && liftsid != res.data.data.sid)
            liftsid = res.data.data.sid;
        await this.getDropPoint(liftsid);
        if (liftsid) {
            if (this.mapLift[this.editKid]){
            this.tMap.removeOverLay(this.mapLift[this.editKid]);
            delete this.mapLift[this.editKid];
            }
            if(this.mapLiftTxt[this.editKid]){
            this.tMap.removeOverLay(this.mapLiftTxt[this.editKid]);
            delete this.mapLiftTxt[this.editKid];
            }        
            if (this.checkLiftList.indexOf(liftsid) == -1) {
            this.checkLiftList.push(liftsid);
            }
            this.liftCheckBoxChange(this.checkLiftList);
        }
        this.$notify.success("保存成功！");
        this.showLiftDialog = false;
        } else {
        // this.showSaveOperaDia = false;
        this.$notify.error("保存失败！");
        }
    }
    //获取起降点
    async getDropPoint(sid:any){
        let tj = this.operaTjCell.currRecord.data;
        let sorg = tj.sorg;
        let iym = tj.iym;
        let tjdate = {sorg:sorg,iym:iym,sid:sid};
        let qe: QueryEntity = new QueryEntity("20200203", "20200203TJ");
        qe.page = this.operaCellPage;
        qe.cont = JSON.stringify(tjdate);
        qe.oprid = 13;
        await this.liftCell
        .queryData(qe)
        .then(res => { 
            let values = res.data.data.data.data;
            if(sid == null){
            for (var i = 0; i < values.length; i++) {
                let d1 = values[i].data;
                this.liftJSON[d1.sid] = d1;
            }
            this.liftData = values;
            }else{
            let d1 = values[0].data;
            if(!this.liftJSON[d1.sid]){
                this.liftJSON[d1.sid] = d1;
                this.liftData.push(values[0]);
                this.checkLiftList.push(d1.sid)
                this.liftCheckBoxChange(this.checkLiftList);
            }
            }
        })
    }
    //编辑起降点
    editLift(sid:any){
        let cover = this.mapLift[sid];
        if (cover) {
        cover.removeEventListener("dblclick", this.liftDBClick);
        cover.addEventListener("dblclick", this.liftDBClick);
        cover.enableDragging();
        cover.kid = sid;
        } else {
        let d1 = this.liftJSON[sid];
        let liftData = this.makeLift(d1);
        var polygon = liftData[0];
        //向地图上添加面
        this.tMap.addOverLay(polygon);
        this.mapLift[sid] = polygon;
        var label = liftData[1];
        if(this.liftLableCheck)
            this.tMap.addOverLay(label);
        this.mapLiftTxt[sid] = label;
        polygon.enableDragging();
        polygon.kid = sid;
        polygon.addEventListener("dblclick", this.liftDBClick);
        }
        if (this.checkLiftList.indexOf(sid) == -1) {
        this.checkLiftList.push(sid);
        }
    }
    //删除起降点
    delLift(sid: any,index:any){
        let d1 = this.liftJSON[sid];
        let co = "此操作将删除起降点：" + d1.name + "，是否继续？";
        this.liftCell.clear();
        this.liftCell.createRecord();
        this.$confirm(co, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
        })
        .then(() => {
            if (d1) {
            //存在进行修改
            this.liftCell.currRecord.data = d1;
            this.liftCell.currRecord.c_state = 4;
            }
            this.delLiftDo(index);
        })
        .catch(() => {
            this.$message({
            type: "info",
            message: "已取消删除"
            });
        });
    }
    //进行删除
    async delLiftDo(index:any) {
        let key = this.liftCell.currRecord.data.sid;
        let res: any = await this.liftCell.saveData();
        if (res.data && res.data.id == 0) {
        if (this.mapLift[key]){
            this.tMap.removeOverLay(this.mapLift[key]);
            delete this.mapLift[key];
        }
        if (this.mapLiftTxt[key]){
            this.tMap.removeOverLay(this.mapLiftTxt[key]);
            delete this.mapLiftTxt[key];
        } 
            this.$notify.success("删除成功！");
                this.liftData.splice(index,1)
        } else {
        this.$notify.error("删除失败！");
        }
    }
    //起降点全选勾选
    liftCheckAllChange(val:any){
        this.checkLiftList = [];
        if(val){
        for(var i=0;i<this.liftData.length;i++){
            this.checkLiftList.push(this.liftData[i].data.sid)
        }
        }
        this.liftIsIndeterminate = false;
        this.liftCheckBoxChange(this.checkLiftList);
    }
    //显示或隐藏文字标识
    liftLableChange(val:any){
        for(var key in this.mapLiftTxt){
            let lable = this.mapLiftTxt[key];
            if(val){
                this.tMap.addOverLay(lable);
            }else{
                this.tMap.removeOverLay(lable);
            }
    　　}
    }
    /**
     * 勾选发生变化
     */
    liftCheckBoxChange(data: any) {
        for (var i = 0; i < data.length; i++) {
        let id = data[i];
        if (!this.mapLift[id]) {
            //作业区
            let d1 = this.liftJSON[id];
            if(d1){
            let liftData = this.makeLift(d1);
            var polygon = liftData[0];
            //向地图上添加面
            this.tMap.addOverLay(polygon);
            this.mapLift[id] = polygon;
            var label = liftData[1];
            if(this.liftLableCheck)
                this.tMap.addOverLay(label);
            this.mapLiftTxt[id] = label;
            }
        }
        }
        for (let key in this.mapLift) {
        let ka = key.split("|")[0];
        if (data.indexOf(ka) == -1) {
            if (ka.indexOf("non-") == -1 && ka.indexOf("copy-") == -1) {
            if (this.mapLift[key]) {
                this.tMap.removeOverLay(this.mapLift[key]);
            }
            if (this.mapLiftTxt[key]){
                this.tMap.removeOverLay(this.mapLiftTxt[key]);
            }
            delete this.mapLift[key];
            delete this.mapLiftTxt[key];
            }
        }
        }
    }
    makeLift(d1:any){
        let boundary1 = d1.north;
        let boundary = boundary1.split(",");
        //创建图片对象
        var icon = new T.Icon({
            iconUrl: require('@/assets/air-super/lift.png'), 
            iconSize: new T.Point(70, 70),
            iconAnchor:new T.Point(35,70),
        });
        //向地图上添加自定义标注
        let center = new T.LngLat(boundary[0], boundary[1]);
        var marker = new T.Marker(center,{icon: icon});
    
        let lng = this.doubleToDFM(boundary[0]) 

        let lat = this.doubleToDFM(boundary[1])  
        let text = "<div style='text-align: center;'>东经(E):"+lng+"   北纬(N):"+lat+"<br/>"+d1.name+"</div>";
        this.tMap.panTo(center);
        var label = new T.Label({
        text: text,
        position: center,
        offset: new T.Point(-170, -90),
        });
        label.setBorderLine(0)
        label.setFontSize(16)
        label.setBackgroundColor(null);
        return [marker,label]
    }
    doubleToDFM(value:any){
        value = Math.abs(value);
        var v1 = Math.floor(value);//度
        var v2 = Math.floor((value - v1) * 60);//分
        var v3 = Math.round((value - v1) * 3600 % 60);//秒
        let data = v1 + '°' + v2 + '′' + v3 + '″'; 
        return data;
    }
/***************** 起降点END ********************/






/**************** 作业区 **************/
  //查找作业区
  async getOpera(operid:any) {
    this.getDropPoint(null)
    let tj = this.operaTjCell.currRecord.data;
    if(operid){
	  	tj.id = operid
    }else{
      tj.id = "";
    }
    let qe: QueryEntity = new QueryEntity("FW2015", "FW2015TJ");
    qe.page = this.operaCellPage;
    qe.cont = JSON.stringify(tj);
    qe.oprid = 13;
    this.showOperaDia = false;
    this.operaBtnOpen = false;
    this.loading++;
    await this.operaTjCell
      .queryData(qe)
      .then(res => {
        if (res.data.id == 0) {
          let values = res.data.data.data.data;
          for (var i = 0; i < values.length; i++) {
            let d1 = values[i].data;
            this.showOperaBr(d1.id);
            this.operaJSON[d1.id] = d1;
          }
          this.operaData = values;
          if(values.length==0 && operid == null)
              this.operaData = [];
          if(operid == null){
            this.operaSBQData = [];
            this.operaCData = [];
            this.operaXData = [];
            this.operaQData = [];
          }
          for(var k=0;k<this.operaData.length;k++){
            let dd = this.operaData[k];
            dd.showBr = 1;
              if(dd.data.sbuid == 'F2005'){
              this.operaSBQData.push(dd);
            }else if(dd.data.sbuid == 'F2015'){    
              if(dd.data.season == 0){       
                let _index0 = -1
                for(var i=0;i<this.operaCData.length;i++){
                  if(this.operaCData[i].data.id == dd.data.id){
                    _index0=i;
                    break;
                  }
                }
                if(_index0>=0){
                  this.operaCData[_index0] = dd;
                }else{
                  this.operaCData.push(dd);
                }
                this.showoperaBrCData[(this.operaCData.length-1)] = false
              }else if(dd.data.season == 1){
                let _index1 = -1
                for(var i=0;i<this.operaXData.length;i++){
                  if(this.operaXData[i].data.id == dd.data.id){
                    _index1=i;
                    break;
                  }
                }
                if(_index1>=0){
                  this.operaXData[_index1] = dd;
                }else{
                  this.operaXData.push(dd);
                }
                this.showoperaBrXData[(this.operaXData.length-1)] = false
              }else if(dd.data.season == 2){ 
                let _index2 = -1
                for(var i=0;i<this.operaQData.length;i++){
                  if(this.operaQData[i].data.id == dd.data.id){
                    _index2=i;
                    break;
                  }
                }
                if(_index2>=0){
                  this.operaQData[_index2] = dd;
                }else{
                  this.operaQData.push(dd);
                }
                this.showoperaBrQData[(this.operaQData.length-1)] = false
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
   * 保存新增作业区
   */
  async saveOpera() {
    console.log("保存作业区")
    this.loading++;
    let bok = this.checkNotNull(this.operaSaveCell);
    if (!bok) return;
    let res: any = await this.operaSaveCell.saveData();
    if (res.data && res.data.id == 0) {
      let operid = this.operaSaveCell.currRecord.data.id;
      if(res.data.data.id && operid != res.data.data.id)
        operid = res.data.data.id;
      // await this.getOpera(operid);
      let newDate = this.operaSaveCell.currRecord;
      let newID = newDate.data.id
      if(newDate.oldpk && newDate.oldpk.length>0){
        let oldID = newDate.oldpk[0];
        if(this.checkOperaList.indexOf(oldID) !=-1){
            this.checkOperaList.splice(this.checkOperaList.indexOf(oldID),1)
        }
        if(newDate.data.season == 0){
            for(var i=0;i<this.operaCData.length;i++){
                if(this.operaCData[i].data.id == oldID){
                    this.operaCData.splice(i,1)
                    break;
                }
            } 
            if(this.cCheckOperaList.indexOf(oldID) !=-1){
                this.cCheckOperaList.splice(this.cCheckOperaList.indexOf(oldID),1)
            }
        }else if(newDate.data.season == 1){
            for(var i=0;i<this.operaXData.length;i++){
                if(this.operaXData[i].data.id == oldID){
                    this.operaXData.splice(i,1)
                    break;
                }
            }  
            if(this.xCheckOperaList.indexOf(oldID) !=-1){
                this.xCheckOperaList.splice(this.xCheckOperaList.indexOf(oldID),1)
            }            
        }else if(newDate.data.season == 2){ 
            for(var i=0;i<this.operaQData.length;i++){
                if(this.operaQData[i].data.id == oldID){
                    this.operaQData.splice(i,1)
                    break;
                }
            }
            if(this.qCheckOperaList.indexOf(oldID) !=-1){
                this.qCheckOperaList.splice(this.qCheckOperaList.indexOf(oldID),1)
            }              
        }
        this.operaJSON[newID] = newDate.data 
        let key = oldID;
        if (this.mapOpera[key]) {
        this.tMap.removeOverLay(this.mapOpera[key]);
        }
        if (this.mapOperaTxt[key]){
        this.tMap.removeOverLay(this.mapOperaTxt[key]);
        }
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
      }else{
          newDate.oldpk=[];
      }
      if(newDate.data.sbuid == 'F2005'){
        this.operaSBQData.push(newDate);
      }else if(newDate.data.sbuid == 'F2015'){    
        if(newDate.data.season == 0){       
          let _index0 = -1
          for(var i=0;i<this.operaCData.length;i++){
            if(this.operaCData[i].data.id == newID){
              _index0=i;
              break;
            }
          }
          if(_index0>=0){
            this.operaCData[_index0] = newDate;
          }else{
            this.operaCData.push(newDate);
          }
        }else if(newDate.data.season == 1){
          let _index1 = -1
          for(var i=0;i<this.operaXData.length;i++){
            if(this.operaXData[i].data.id == newID){
              _index1=i;
              break;
            }
          }
          if(_index1>=0){
            this.operaXData[_index1] = newDate;
          }else{
            this.operaXData.push(newDate);
          }
        }else if(newDate.data.season == 2){ 
          let _index2 = -1
          for(var i=0;i<this.operaQData.length;i++){
            if(this.operaQData[i].data.id == newID){
              _index2=i;
              break;
            }
          }
          if(_index2>=0){
            this.operaQData[_index2] = newDate;
          }else{
            this.operaQData.push(newDate);
          }
        }
      }
      if (operid) {
        if (this.mapOpera[this.editKid]){
          this.tMap.removeOverLay(this.mapOpera[this.editKid]);
          delete this.mapOpera[this.editKid];
        }
        if(this.mapOperaTxt[this.editKid]){
          this.tMap.removeOverLay(this.mapOperaTxt[this.editKid]);
          delete this.mapOperaTxt[this.editKid];
        }
        if(this.checkOperaList.indexOf(operid) ==-1){
          this.checkOperaList.push(operid);
        }
        this.checkBoxChange(this.checkOperaList);
        this.$notify.success("保存成功！");
        this.showSaveOperaDia = false;
        this.loading--;
      }
    } else {
      this.$notify.error("保存失败！");
      this.loading--;
    }
  }
   /**
   * 编辑作业区  作业区唯一码
   * @param operid 作业区唯一码
   */
  editOpera(operid: any) {
    let cover = this.mapOpera[operid];
    if (cover) {
      cover.removeEventListener("dblclick", this.coverDBClick);
      cover.addEventListener("dblclick", this.coverDBClick);
      cover.enableEdit();
      cover.kid = operid;
    } else {
      let d1 = this.operaJSON[operid];
      let cc:any = this.makeOpera(d1);
      let polygon = cc[0];
      let points = cc[1];
      //向地图上添加面
      this.tMap.addOverLay(polygon);
      let t1 = this.tMap.getViewport(points);
      this.tMap.panTo(t1.center, t1.zoom);
      this.mapOpera[operid] = polygon;
      let label = this.makeOperaLableTXT(d1, t1);
      this.tMap.addOverLay(label);
      this.mapOperaTxt[operid] = label;
      polygon.enableEdit();
      polygon.kid = operid;
      polygon.addEventListener("dblclick", this.coverDBClick);
    }
    if (this.checkOperaList.indexOf(operid) == -1) {
      this.checkOperaList.push(operid);
    }
  }
  /**
   * 删除作业区
   * @param operid 作业区唯一码
   * @param type  0识别区，1春，2夏，3秋
   */
  delOpera(operid: any,type:any,index:any) {
    let d1 = this.operaJSON[operid];
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
        this.del(type,index);
      })
      .catch(() => {
        this.$message({
          type: "info",
          message: "已取消删除"
        });
      });
  }
  //进行删除
  async del(type:any,index:any) {
    let key = this.operaSaveCell.currRecord.data.id;
    let res: any = await this.operaSaveCell.saveData();
    if (res.data && res.data.id == 0) {
		if (this.mapOpera[key]){
      this.tMap.removeOverLay(this.mapOpera[key]);
    }
		if (this.mapOperaTxt[key]){
      this.tMap.removeOverLay(this.mapOperaTxt[key]);
    } 
		this.$notify.success("删除成功！");
		if(type ==0){
			this.operaSBQData.splice(index,1)
		}else if(type ==1){
			this.operaCData.splice(index,1)
		}else if(type ==2){
			this.operaXData.splice(index,1)
		}else if(type ==3){
			this.operaQData.splice(index,1)
		}
    } else {
      this.$notify.error("删除失败！");
    }
  }
    /**
   * 复制作业区  作业区唯一码
   * @param operid 作业区唯一码
   */
  copyOpera(operid: any){
    if(this.checkOperaList.indexOf(operid) ==-1){
      this.checkOperaList.push(operid);
    }
    let d1 = this.operaJSON[operid];
    operid = "copy-"+operid;
    let cc:any = this.makeOpera(d1);
    let polygon = cc[0];
    let points = cc[1];
    //向地图上添加面
    this.tMap.addOverLay(polygon);
    let t1 = this.tMap.getViewport(points);
    this.tMap.panTo(t1.center, t1.zoom);
    this.mapOpera[operid] = polygon;
    let label = this.makeOperaLableTXT(d1, t1);
    this.tMap.addOverLay(label);
    this.mapOperaTxt[operid] = label;
    polygon.enableEdit();
    polygon.kid = operid;
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
    console.log("作业区双击")
    let target = data.target;
    let operid = target.kid;
    this.editKid = target.kid;
    let points = target.getLngLats()[0];
    let cover = this.mapOpera[operid];
    if (operid) {
      let iscopy:boolean = false;
      if(operid.indexOf("copy-") !=-1){//是复制的图层
        operid = operid.replace("copy-",'');
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
      let d1 = this.operaJSON[operid];
      this.operaSaveCell.clear();
      this.operaSaveCell.createRecord();
      let area = polygonTool.getArea(points);
      if (d1 && iscopy == false) {
        //存在进行修改
        this.operaSaveCell.currRecord.data = d1;
        this.operaSaveCell.currRecord.c_state = 2;
      } else {
        if(iscopy){
            let id = this.operaSaveCell.currRecord.data.id
            this.operaSaveCell.currRecord.data = d1;
            this.operaSaveCell.currRecord.data.id = id;
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
        this.sbqCheckOperaList.push(this.operaSBQData[i].data.id)
      }
    }
    this.sbqIsIndeterminate = false;
    this.checkOperaList = this.sbqCheckOperaList.concat(this.cCheckOperaList)
    this.checkOperaList = this.checkOperaList.concat(this.xCheckOperaList)
    this.checkOperaList = this.checkOperaList.concat(this.qCheckOperaList)
    this.checkBoxChange(this.checkOperaList);
    this.fifthRingRoad();
  }
  /** 
   * 作业区全选  春
  */
  cCheckAllChange(val:any){
    this.cCheckOperaList = [];
    if(val){
      for(var i=0;i<this.operaCData.length;i++){
        this.cCheckOperaList.push(this.operaCData[i].data.id)
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
        this.xCheckOperaList.push(this.operaXData[i].data.id)
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
        this.qCheckOperaList.push(this.operaQData[i].data.id)
      }
    }
    this.sbqIsIndeterminate = false;
    this.checkOperaList = this.sbqCheckOperaList.concat(this.cCheckOperaList)
    this.checkOperaList = this.checkOperaList.concat(this.xCheckOperaList)
    this.checkOperaList = this.checkOperaList.concat(this.qCheckOperaList)
    this.checkBoxChange(this.checkOperaList);
  }
/**************** 作业区 **************/  





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
        // let oneCont =[];
        // let allCont = [];
        // let cont = "";
        // let qCont = new QueryCont('area', data, 12);
        // qCont.setContrast(5);
        // oneCont.push(qCont);
        // if (oneCont.length != 0) {
        // allCont.push(oneCont);
        // cont = "~" + JSON.stringify(allCont);
        // }
        // let qe: QueryEntity = new QueryEntity("", "");
        // qe.page.currPage = 1;
        // qe.page.pageSize = 8000;
        // qe.cont = cont;
        // let vv = await tools.getBipInsAidInfo("SORG", 210, qe);
        // if(vv.data.id == 0){
        //     let values = vv.data.data.data.values;
        //     if(values.length>0){
        //         let orgcode = "";
        //         for(var i=0;i<values.length;i++){
        //         orgcode +=values[i].orgcode+";"
        //         }
        //         orgcode = orgcode.substring(0,orgcode.length-1);
        //         this.operaTjCell.currRecord.data.sorg = orgcode;
        //         this.getOpera(null)
        //     }else{
        //         // this.operaData=[];
        //         // this.clearCover();
        //     }        
        //     this.getOpera(null)
        // }
        for(var i=0;i<address.length;i++){
            let d = address[i].name
            if(d.indexOf("北京") ==-1){
                this.areaKv[d] = address[i].id;
                if(!this.areaMap[address[i].id])
                this.addresSel(d,0);
            }
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
        this.localsearch.type = type;
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
                for (var i = 0; i < 1; i++) {
                // for (var i = 0; i < points.length; i++) {
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
                        color: this.cityColor,
                        weight: 4,
                        opacity: 1,
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
        var lableTxt =[];
        for (var i = 0; i < obj.length; i++) {
            //闭包
            (function (i) {
                //坐标 
                var lnglatArr = obj[i].lonlat.split(" ");
                var lnglat = new T.LngLat(lnglatArr[0], lnglatArr[1]);
                zoomArr.push(lnglat); 
                let text = "<div style='text-align: center;'>"+obj[i].name+" <br/>"+obj[i].address+"</div>";
                var lable = new T.Label({
                    text: text,
                    position: lnglat,
                    offset: new T.Point(-100, -90),
                });
                lable.setBorderLine(0)
                lable.setFontSize(14)
                lable.setBackgroundColor(null);
                lableTxt.push(lable)
            })(i);
        }
        if(this.localsearch.type!=0){
            for(var i=0;i<zoomArr.length;i++){
            let marker = new T.Marker(zoomArr[i]);// 创建标注
            this.tMap.addOverLay(marker);             // 将标注添加到地图中
            }
            for(var i=0;i<lableTxt.length;i++){
            this.tMap.addOverLay(lableTxt[i]);   
            }
        }
        //显示地图的最佳级别
        this.tMap.setViewport(zoomArr);
        }
    }
/*********** END *************/
    
/******************* 五环路 ***************/    
    /**
     * 五环路
     */
    fifthRingRoad(){
        let lnglat = "116.45031,40.01465;116.45349,40.01388;116.4725,40.01375;116.47575,40.01328;116.47939,40.01186;116.48154,40.0104;116.49197,39.99989;116.50353,39.98779;116.51729,39.97002;116.51922,39.96663;116.52519,39.95314;116.53056,39.94683;116.53408,39.94314;116.53622,39.93855;116.53812,39.90921;116.53962,39.90179;116.54211,39.88887;116.54274,39.88184;116.54304,39.87231;116.54209,39.86476;116.54239,39.86066;116.54372,39.8535;116.5436,39.85139;116.54317,39.84968;116.53849,39.84487;116.50634,39.82123;116.47497,39.80944;116.45794,39.79237;116.45343,39.78988;116.44749,39.78932;116.43329,39.78898;116.42689,39.78658;116.42058,39.7804;116.4162,39.76986;116.41263,39.7663;116.40731,39.76373;116.37682,39.75652;116.37334,39.75716;116.37128,39.75853;116.3698,39.76061;116.36902,39.76396;116.36696,39.77186;116.36478,39.77443;116.36061,39.77602;116.34152,39.77718;116.30119,39.78059;116.29647,39.77978;116.28849,39.77566;116.28377,39.77337;116.27913,39.77229;116.27334,39.77311;116.27055,39.77457;116.26695,39.77813;116.25995,39.7973;116.25939,39.80414;116.25755,39.80993;116.24218,39.82793;116.23539,39.83089;116.22999,39.83262;116.21587,39.84773;116.21431,39.85532;116.21011,39.86175;116.20278,39.8718;116.20183,39.87767;116.2041,39.88544;116.2054,39.89003;116.20488,39.89483;116.20524,39.91463;116.20609,39.93215;116.20593,39.9419;116.20923,39.94843;116.21471,39.97644;116.21513,39.98862;116.2165,39.9921;116.22097,39.99467;116.23461,39.99772;116.24069,40.00058;116.24502,40.00139;116.25803,40.00199;116.26202,40.00319;116.26515,40.00654;116.26751,40.00959;116.27077,40.01083;116.27734,40.01173;116.29152,40.01323;116.30288,40.01595;116.31876,40.01852;116.33026,40.02182;116.3467,40.02169;116.42959,40.02049;116.45031,40.01465";
        let boundary = lnglat.split(";");
        var points = [];
        for (var j = 0; j < boundary.length; j++) {
            let poin = boundary[j].split(",");
            if (poin.length >= 2) {
            points.push(new T.LngLat(poin[0], poin[1]));
            }
        }
        var line = new T.Polyline(points);
        line.setColor("#C00000");
        line.setWeight(4);
        line.setOpacity(1);
        //向地图上添加线
        this.tMap.addOverLay(line);
    }
/******************* 五环路END ***************/    

/******************* 防治计划上报 ***************/    
    PlanToReport(){
        this.loading = 1;
        this.planCell.createRecord();
        let _this = this;
        let operaid = "";
        if(this.checkOperaList.length ==0){
            this.$notify.warning("请勾选飞防作业区!");
            return;
        }
        for(var i=0;i<this.checkOperaList.length;i++){
            let id = this.checkOperaList[i];
            let data = this.operaJSON[id]
            if(data.sbuid== 'F2015'){
                operaid+=id+";"
            }
        }
        operaid = operaid.substring(0,operaid.length-1)
        this.planCell.currRecord.data.oaid = operaid;
        domtoimage.toBlob(document.getElementById('OperaTMap')).then(function (data:any) {
            let blob:any = new Blob([data], {
                type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document;charset=utf-8"
            });
            blob.lastModifiedDate =new Date();
            blob.name = TMapUt.dateFormat(new Date(),"yyyyMMddHHmmss")+"Plan.png";
            _this.planReportSave(blob);
        })
        .catch(function (error:any) {
            _this.$notify.error("防治计划图片生成失败！");
            console.log(error) 
            _this.loading =0;
        });
    }
    async planReportSave(file:any){
        
        let dfconfig:any = {
            headers: {
            'Content-Type': 'multipart/form-data'
            },
            params:{
                snkey:JSON.parse(window.sessionStorage.getItem('snkey')+''),
            }
        }
        this.planCell.currRecord.data.fj_name=file.name;
        let name = file.name
        let size = file.size
        let succeed = 0;
        let shardSize = 2 * 1024 * 1024,    //以2MB为一个分片
        shardCount = Math.ceil(size / shardSize);  //总片数
        let fkey = this.makePath();
        for(let i = 0;i < shardCount;i++){
            let start = i * shardSize,end = Math.min(size, start + shardSize);
            let form = new FormData();
            let config  = dfconfig;
            config.params.name = name;
            config.params.total = shardCount;//总片数
            config.params.fkey = fkey;//当前是第几片
            config.params.fid = 0;//当前是第几片
            config.params.fjkey = this.planCell?this.planCell.ccells.obj_id:'aaa';
            config.params.updid = '33';
            form.append("index", i+'');
            form.append("total",shardCount+'');
            // form.append("fjroot",this.root?this.root:'');//fj_500301
            form.append("fjroot","");
            form.append("data", file.slice(start,end)); 

            await this.$axios.post(GlobalVariable.API_UPD,form,config).then((res)=>{
                if(res.data.id==-1){
                    this.$notify.error("上传失败！");
                }else{
                    succeed++;
                    if(res.data.id==0){
                        let dir = res.data.data.fj_root;
                        this.planCell.currRecord.data.fj_root=dir;
                    }
                }
            });
        } 
        if(shardCount == succeed){
            this.loading = 0;
            let res = await this.planCell.saveData();
            if(res.data.id ==0){
                let sid = res.data.data.sid;
                this.$router.push({
                    path:'/layout',
                    name:'layout',
                    params:{method:"pkfld",pkfld:"sid",value:sid},
                    query: {pbuid:"F2030",pmenuid:"M2030"},
                })
            }else{
                this.$notify.error("防治计划上报失败！");
            }
        }else{
            this.loading = 0;
            this.$notify.error("防治计划上报失败！");
        }
    }
    makePath(){
        const key = 999;
        let add1 = Math.floor(Math.random() * (key));
        return add1;
    }
/******************* 防治计划上报END ***************/    



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