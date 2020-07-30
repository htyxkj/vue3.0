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
                        <el-dropdown trigger="click" @command="jqEditToolsClick" size="mini" split-button >
                        <span class="el-dropdown-link">架区工具</span>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item command="1">架区规划(面)</el-dropdown-item>
                            <el-dropdown-item command="2">架区规划(线)</el-dropdown-item>
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
                        <span class="el-dropdown-link">作业区区工具</span>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item command="1">标记四角坐标</el-dropdown-item>
                            <el-dropdown-item command="3">勾选新点</el-dropdown-item>
                            <el-dropdown-item command="5">删除最后一点</el-dropdown-item>
                            <el-dropdown-item command="4">保存新建作业区</el-dropdown-item>
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
            <el-aside :width="operaWidth+'px'">
                <el-tabs v-model="activeName1" type="card">
                    <el-tab-pane label="作业区" name="first" :style="activeName1Style">
                        <el-checkbox :indeterminate="zyqIsIndeterminate" v-model="zyqCheckAll" @change="zyqCheckAllChange">全选</el-checkbox>
                        <el-checkbox-group class="opera" v-model="zyqSelList" @change="zyqCheckBoxChange">
                            <el-row v-for="(item,index) in zyqJsonData" :key="index">
                                <el-row style="padding-top:5px;border-top: 1px solid #f1f1f1;margin-bottom: 5px;">
                                    <el-col :span="4" style="height:60px;line-height:60px;text-align: center;">
                                        <el-checkbox class="myOperatingAreaCheck" :label="item.id" :key="item.id"></el-checkbox>
                                    </el-col>
                                    <el-col :span="20" style="height:60px;">
                                    <el-row>
                                        <el-col :span="24" style="height:20px;font-size: 0.8rem; color: rgba(0,0,0,.54)">{{item.name}}</el-col>
                                        <el-col :span="24" style="height:20px;color: rgba(0,0,0,.54);font-size: .12rem;">{{item.address}}</el-col>
                                    </el-row>
                                    <el-row>
                                        <el-col :span="24" > 
                                        <el-row style="textAlign:center;">
                                            <el-col :span="8">
                                                <el-button type="primary" @click="editOperaZyq(item.id)" style="padding:2px; font-size:0.12rem;">编辑</el-button>
                                            </el-col>
                                            <el-col :span="8">
                                                <el-button type="info" @click="copyOperaZyq(item.id)" style="padding:2px; font-size:0.12rem;">复制</el-button>
                                            </el-col>
                                            <el-col :span="8">
                                                <el-button type="danger" @click="delOperaZyq(item.id)" style="padding:1px; font-size:0.12rem;">删除</el-button>   
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
                                <el-checkbox-group class="opera" v-model="jqSelList" @change="checkBoxChange">
                                    <el-row v-for="(item,index) in operaCData" :key="index">
                                        <el-row style="padding-top:5px;border-top: 1px solid #f1f1f1;margin-bottom: 5px;">
                                            <el-col :span="4" style="height:60px;line-height:60px;text-align: center;">
                                                <el-checkbox v-if="!item.mergeid" class="myOperatingAreaCheck" :label="item.id" :key="item.id"></el-checkbox>
                                            </el-col>
                                            <el-col :span="20">
                                                <el-row>
                                                    <el-col :span="24" style="height:20px;font-size: 0.8rem; color: rgba(0,0,0,.54)">{{item.name}}</el-col>
                                                    <el-col :span="24" style="color: rgba(0,0,0,.54);font-size: .12rem;">{{item.address}}</el-col>
                                                </el-row>
                                                <el-row v-if="!item.mergeid" style="textAlign:center;">
                                                    <el-col :span="6">
                                                        <el-button type="primary" @click="editOpera(item.id)" style="padding:2px; font-size:0.12rem;">编辑</el-button>
                                                    </el-col>
                                                    <el-col :span="6">
                                                        <el-button type="info" @click="copyOpera(item.id)" style="padding:2px; font-size:0.12rem;">复制</el-button>
                                                    </el-col>
                                                    <el-col :span="6">
                                                        <el-button type="danger" @click="delOpera(item.id)" style="padding:1px; font-size:0.12rem;">删除</el-button>   
                                                    </el-col>
                                                    <el-col :span="6">
                                                        <el-button type="danger" @click="showoperaBrData(item.id,'c')" style="padding:1px; font-size:0.12rem;">避让区</el-button>   
                                                    </el-col>
                                                </el-row>
                                                <el-row v-if="item.mergeid" style="textAlign:center;">
                                                    <el-col :span="6">
                                                        <el-button type="primary" @click="portrayHBOpera(item.id)" style="padding:2px; font-size:0.12rem;">绘制</el-button>
                                                    </el-col>
                                                    <el-col :span="6">
                                                        <el-button type="primary" @click="editHBOpera(item.id)" style="padding:2px; font-size:0.12rem;">编辑</el-button>
                                                    </el-col>
                                                    <el-col :span="6">
                                                        <el-button type="danger" @click="delOpera(item.id)" style="padding:1px; font-size:0.12rem;">删除</el-button>   
                                                    </el-col>
                                                    <el-col :span="6">
                                                        
                                                    </el-col>
                                                </el-row>  
                                            </el-col>
                                        </el-row>
                                        <el-row style="font-size:14px;">
                                            <!-- <template v-if="showoperaBrCData['BR'+index]"> -->
                                            <template v-if="operaCData[item.id] && operaCData[item.id].showbr && operaBrData[item.id]">
                                                <el-row v-if="operaBrData[item.id].length ==0">暂无避让信息</el-row>
                                                <el-row v-for="(item0,indexbr) in operaBrData[item.id]" :key="indexbr">
                                                    <el-col :span="4">&nbsp;</el-col>
                                                    <el-col :span="12">{{item0.data.name}}</el-col>
                                                    <el-col :span="8">
                                                    <el-row type="flex" justify="end">
                                                        <el-button v-show="item0.data.type==1" type="text" @click="editOperaBr(item0.data)" style="padding:2px; font-size:0.12rem;">编辑</el-button>
                                                        <el-button type="text" @click="delOperaBr(item0.data,indexbr,index,'C')" style="padding:2px; font-size:0.12rem;">删除</el-button>
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
                                <el-checkbox-group class="opera" v-model="jqSelList" @change="checkBoxChange">
                                    <el-row v-for="(item,index) in operaXData" :key="index">
                                        <el-row style="padding-top:5px;border-top: 1px solid #f1f1f1;margin-bottom: 5px;">
                                            <el-col :span="4" style="height:60px;line-height:60px;text-align: center;">
                                            <el-checkbox v-if="!item.mergeid" class="myOperatingAreaCheck" :label="item.id" :key="item.id"></el-checkbox>
                                            </el-col>
                                            <el-col :span="20">
                                                <el-row>
                                                    <el-col :span="24" style="height:20px;font-size: 0.8rem; color: rgba(0,0,0,.54)">{{item.name}}</el-col>
                                                    <el-col :span="24" style="color: rgba(0,0,0,.54);font-size: .12rem;">{{item.address}}</el-col>
                                                </el-row>
                                                <el-row v-if="!item.mergeid" style="textAlign:center;">
                                                    <el-col :span="6">
                                                        <el-button type="primary" @click="editOpera(item.id)" style="padding:2px; font-size:0.12rem;">编辑</el-button>
                                                    </el-col>
                                                    <el-col :span="6">
                                                        <el-button type="info" @click="copyOpera(item.id)" style="padding:2px; font-size:0.12rem;">复制</el-button>
                                                    </el-col>
                                                    <el-col :span="6">
                                                        <el-button type="danger" @click="delOpera(item.id)" style="padding:1px; font-size:0.12rem;">删除</el-button>   
                                                    </el-col>
                                                    <el-col :span="6">
                                                        <el-button type="danger" @click="showoperaBrData(item.id,'x')" style="padding:1px; font-size:0.12rem;">避让区</el-button>   
                                                    </el-col>
                                                </el-row>
                                                <el-row v-if="item.mergeid" style="textAlign:center;">
                                                    <el-col :span="6">
                                                        <el-button type="primary" @click="portrayHBOpera(item.id)" style="padding:2px; font-size:0.12rem;">绘制</el-button>
                                                    </el-col>
                                                    <el-col :span="6">
                                                        <el-button type="primary" @click="editHBOpera(item.id)" style="padding:2px; font-size:0.12rem;">编辑</el-button>
                                                    </el-col>
                                                    <el-col :span="6">
                                                        <el-button type="danger" @click="delOpera(item.id)" style="padding:1px; font-size:0.12rem;">删除</el-button>   
                                                    </el-col>
                                                    <el-col :span="6">
                                                        
                                                    </el-col>
                                                </el-row>  
                                            </el-col>
                                        </el-row>  
                                        <el-row style="font-size:14px;"> 
                                            <!-- <template v-if="showoperaBrXData['BR'+index]"> -->
                                            <template v-if="operaXData[item.id] && operaXData[item.id].showbr && operaBrData[item.id]">
                                                <el-row v-if="operaBrData[item.id].length ==0">暂无避让信息</el-row>
                                                <el-row v-for="(britem,indexbr) in operaBrData[item.id]" :key="indexbr">
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
                                <el-checkbox-group class="opera" v-model="jqSelList" @change="checkBoxChange">
                                    <el-row v-for="(item,index) in operaQData" :key="index">
                                        <el-row style="padding-top:5px;border-top: 1px solid #f1f1f1;margin-bottom: 5px;">
                                            <el-col :span="4" style="height:60px;line-height:60px;text-align: center;">
                                            <el-checkbox v-if="!item.mergeid" class="myOperatingAreaCheck" :label="item.id" :key="item.id"></el-checkbox>
                                            </el-col>
                                            <el-col :span="20">
                                                <el-row>
                                                    <el-col :span="24" style="height:20px;font-size: 0.8rem; color: rgba(0,0,0,.54)">{{item.name}}</el-col>
                                                    <el-col :span="24" style="color: rgba(0,0,0,.54);font-size: .12rem;">{{item.address}}</el-col>
                                                </el-row>
                                                <el-row v-if="!item.mergeid" style="textAlign:center;">
                                                    <el-col :span="6">
                                                        <el-button type="primary" @click="editOpera(item.id)" style="padding:2px; font-size:0.12rem;">编辑</el-button>
                                                    </el-col>
                                                    <el-col :span="6">
                                                        <el-button type="info" @click="copyOpera(item.id)" style="padding:2px; font-size:0.12rem;">复制</el-button>
                                                    </el-col>
                                                    <el-col :span="6">
                                                        <el-button type="danger" @click="delOpera(item.id)" style="padding:1px; font-size:0.12rem;">删除</el-button>   
                                                    </el-col>
                                                    <el-col :span="6">
                                                        <el-button type="danger" @click="showoperaBrData(item.id,'q')" style="padding:1px; font-size:0.12rem;">避让区</el-button>   
                                                    </el-col>
                                                </el-row>
                                                <el-row v-if="item.mergeid" style="textAlign:center;">
                                                    <el-col :span="6">
                                                        <el-button type="primary" @click="portrayHBOpera(item.id)" style="padding:2px; font-size:0.12rem;">绘制</el-button>
                                                    </el-col>
                                                    <el-col :span="6">
                                                        <el-button type="primary" @click="editHBOpera(item.id)" style="padding:2px; font-size:0.12rem;">编辑</el-button>
                                                    </el-col>
                                                    <el-col :span="6">
                                                        <el-button type="danger" @click="delOpera(item.id)" style="padding:1px; font-size:0.12rem;">删除</el-button>   
                                                    </el-col>
                                                    <el-col :span="6">
                                                    </el-col>
                                                </el-row>  
                                            </el-col>
                                        </el-row>
                                        <el-row style="font-size:14px;">
                                            <!-- <template v-if="showoperaBrQData['BR'+index]"> -->
                                            <template v-if="operaQData[item.id] && operaQData[item.id].showbr && operaBrData[item.id]">
                                                <el-row v-if="operaBrData[item.id].length ==0">暂无避让信息</el-row>
                                                <el-row v-for="(item0,indexbr) in operaBrData[item.id]" :key="indexbr">
                                                    <el-col :span="4">&nbsp;</el-col>
                                                    <el-col :span="12">{{item0.data.name}}</el-col>
                                                    <el-col :span="8">
                                                    <el-row type="flex" justify="end">
                                                        <el-button v-show="item0.data.type==1" type="text" @click="editOperaBr(item0.data)" style="padding:2px; font-size:0.12rem;">编辑</el-button>
                                                        <el-button type="text" @click="delOperaBr(item0.data,indexbr,index,'Q')" style="padding:2px; font-size:0.12rem;">删除</el-button>
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
                        <el-checkbox-group class="opera" v-model="liftSelList" @change="liftCheckBoxChange">
                            <el-row v-for="(item,index) in liftJsonData" :key="index">
                            <el-row style="padding-top:5px;border-top: 1px solid #f1f1f1;margin-bottom: 5px;">
                                <el-col :span="4" style="height:60px;line-height:60px;text-align: center;">
                                <el-checkbox class="myOperatingAreaCheck" :label="item.sid" :key="item.sid"></el-checkbox>
                                </el-col>
                                <el-col :span="20" style="height:80px;">
                                <el-row>
                                    <el-col :span="24" style="height:20px;font-size: 0.8rem; color: rgba(0,0,0,.54)">{{item.name}}</el-col>
                                    <el-col :span="24" style="height:20px;color: rgba(0,0,0,.54);font-size: .12rem;">{{item.name1}}</el-col>
                                    <el-col :span="24" style="height:20px;color: rgba(0,0,0,.54);font-size: .12rem;">{{item.place}}</el-col>
                                </el-row>
                                <el-row>
                                    <el-col :span="24" > 
                                    <el-row style="textAlign:center;">
                                        <el-col :span="8">
                                        <el-button type="primary" @click="editLift(item.sid)" style="padding:2px; font-size:0.12rem;">编辑</el-button>
                                        </el-col>
                                        <el-col :span="8">
                                            <!-- <el-button type="info" @click="copyOpera(item.data.sid)" style="padding:2px; font-size:0.12rem;">复制</el-button> -->
                                        </el-col>
                                        <el-col :span="8">
                                        <el-button type="danger" @click="delLift(item.sid)" style="padding:1px; font-size:0.12rem;">删除</el-button>   
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
            </el-aside>
        </el-container>


        <el-dialog title="查找作业区" :close-on-click-modal="false" :visible.sync="showOperaDia" width="50%"  class="bip-query">
            <el-row class="bip-lay">
                <el-form @submit.native.prevent label-position="right" label-width="100px">
                <div v-for="(cel,index) in operaSelCell.ccells.cels" :key="'A'+index">
                    <bip-comm-editor v-if="(cel.attr&0x400) <= 0 " :cell="cel" :bgrid="false" :cds="operaSelCell" :row="0" />
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
                        <bip-comm-editor v-if="(cel.attr&0x400) <= 0 " :cell="cel" :bgrid="false" :cds="operaSaveCell" :row="0"/>
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
                    <bip-comm-editor v-if="(cel.attr&0x400) <= 0 " :cell="cel" :bgrid="false" :cds="operaBrCell" :row="0"/>
                </div>
                </el-form>
            </el-row>
            <span slot="footer" class="dialog-footer">
                <el-button @click="showSaveOperaBrDia = false" size="mini">取 消</el-button>
                <el-button type="primary" @click="saveOperaBr" size="mini">确 定</el-button>
            </span>
        </el-dialog>

        <el-dialog title="新增/修改作业区" :close-on-click-modal="false" :visible.sync="showSavezyqDia" width="50%" class="bip-query">
            <el-row class="bip-lay">
                <el-form @submit.native.prevent label-position="right" label-width="100px">
                <div v-for="(cel,index) in zyqCell.ccells.cels" :key="'A'+index">
                    <bip-comm-editor v-if="(cel.attr&0x400) <= 0 " :cell="cel" :bgrid="false" :cds="zyqCell" :row="0"/>
                </div>
                </el-form>
            </el-row>
            <span slot="footer" class="dialog-footer">
                <el-button @click="showSavezyqDia = false" size="mini">取 消</el-button>
                <el-button type="primary" @click="saveZyq" size="mini">确 定</el-button>
            </span>
        </el-dialog>

        <el-dialog title="新增/编辑起降点" :close-on-click-modal="false" :visible.sync="showLiftDialog" width="50%" class="bip-query">
            <el-row class="bip-lay">
                <el-form @submit.native.prevent label-position="right" label-width="100px">
                    <div v-for="(cel,index) in liftCell.ccells.cels" :key="'A'+index">
                        <bip-comm-editor v-if="(cel.attr&0x400) <= 0 " :cell="cel" :bgrid="false" :cds="liftCell" :row="0"/>
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
                    <bip-comm-editor v-if="(cel.attr&0x400) <= 0 " :cell="cel" :bgrid="false" :cds="jqMergeCell" :row="0"/>
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
import { on } from 'cluster';
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
    @Provide() loading:any =0;
    @Provide() style: string ="height:" + (this.height ? this.height - 20 : "400") + "px";
    
    @Provide() zyqSbuid:any = "F2005";
    @Provide() jqSbuid:any = "F2015";

    @Provide() tMap:any = null;//地图对象
    @Provide() editKid:any =null;//当前正在编辑的地图对象id

    //左侧地址框
    @Provide() localsearch: any = null; //地址搜索对象
    @Provide() addressInput: any = null; //地址框
    @Provide() cityColor:string = "#FBFF00";//区县边界颜色
    @Provide() areaWidth:any = 0;//左侧行政区区县宽度
    @Provide() expandedKeys: any = []; //行政区默认展开的节点的 key 的数组
    @Provide() keyID: any = "id"; //每个树节点用来作为唯一标识的属性，整棵树应该是唯一的
    @Provide() expandedLevel: any = -1; //默认展开级次数
    @Provide() fatherID: any = "parid"; //树状结构上下级关系字段
    @Provide() defaultProps: any = { label: "name", children: 'children', };
    @Provide() treeData:any=[];//行政区树状数据
    @Provide() areaMap:any ={};//行政区地图覆盖物
    @Provide() areaKv:any={};//行政区域  值  key  集合
    @Provide() areaBtnOpen:boolean = false;//行政区是否展开


    //右侧作业区
    @Provide() activeName1: string = "first";//右侧选项卡默认选中卡片
    @Provide() activeName1Style:string ="height:" + (this.height ? this.height - 65 : "400") + "px;";//作业区，起降点高度样式
    @Provide() activeName2:string ='c'//春夏秋默认选中卡
    @Provide() activeName2Style:string ="height:" + (this.height ? this.height - 95 : "400") + "px";//架区高度样式
    @Provide() operaBtnOpen:boolean = false;//右侧是否展开
    @Provide() operaWidth:any =0;//右侧作业区集合列表宽度


    //查找
    @Provide() TJCELL:string = "FW2015TJ";//作业区查询条件对象
    @Provide() showOperaDia:boolean = false;//是否显示查找对象窗口
    @Provide() operaSelCell:CDataSet = new CDataSet(""); //作业区对象(查询条件)
    
    //架区
    @Provide() showSaveOperaDia:boolean = false;//架区保存弹出框是否显示
    @Provide() operaCellID:string ="FW2015";//架区对象码
    @Provide() operaTJCellID:string ="FW2015TJ";//起降点对象码
    @Provide() operaSaveCellID:string = "F2045";//架区对象
    @Provide() operaSaveCell:CDataSet = new CDataSet(""); //架区对象(保存)
    @Provide() operaCData:any ={};//架区春季数据集合
    @Provide() cIsIndeterminate:boolean = false; //用以表示 checkbox 的不确定状态，一般用于实现全选的效果
    @Provide() cCheckAll = false;//春季架区全选
    @Provide() operaXData:any ={};//架区夏季数据集合
    @Provide() xIsIndeterminate:boolean = false; //用以表示 checkbox 的不确定状态，一般用于实现全选的效果
    @Provide() xCheckAll = false;//夏季架区全选
    @Provide() operaQData:any ={};//架区秋季数据集合
    @Provide() qIsIndeterminate:boolean = false; //用以表示 checkbox 的不确定状态，一般用于实现全选的效果
    @Provide() qCheckAll = false;//秋季架区全选
    @Provide() jqSelList:any =[];//架区选中集合
    @Provide() jqMapData:any = {};//架区地图覆盖物对象
    @Provide() jqMapTextData:any = {};//架区地图文字对象
    @Provide() operaLine:any =null;//天地图架区 画线对象
    @Provide() operaPolygon:any =null;//天地图架区 画面对象
    @Provide() checkkid:any = null;//当前页选中的作业区ID 在勾选避让区域时用到

    //架区合并
    @Provide() jqMergeCell:CDataSet = new CDataSet(""); //架区合并对象(保存)
    @Provide() jqMergeCellID:string = "F2046";
    @Provide() showSaveHBOperaDia:boolean = false;//是否显示合并弹框


    //避让点
    @Provide() showSaveOperaBrDia:boolean = false;//显示比避让区 保存弹框
    @Provide() operaBrCellID:string ="F2015A";//避让
    @Provide() operaBrCell:CDataSet = new CDataSet(""); //避让对象(保存)
    @Provide() operaBrLine:any =null;//天地图架区避让点 画线对象
    @Provide() operaBrPolygon:any = null;//天地图架区避让点 画面对象
    @Provide() operaBrCircle:any = null;//天地图架区避让点 画圆对象
    @Provide() operaBrMarker:any = null;//天地图架区避让点 画点对象
    @Provide() brMapData:any = {};//必让地图标注对象
    @Provide() brMapTextData:any = null;//必让点地图标注对象
    @Provide() editBrk:any = null;//当前正在进行保存的避让点 已经弹出保存框了
    @Provide() operaBrData: any = {}; //避让区数据{架区：避让区集合}
    @Provide() operaBrJSON: any = {}; //避让区数据每一条{key : 避让区}
    


    //作业区
    @Provide() zyqCelID:string = "F2015"
    @Provide() zyqCell:CDataSet = new CDataSet("");//作业区区对象
    @Provide() showSavezyqDia:boolean = false;//是否显示作业区保存dia
    @Provide() zyqJsonData:any = {};//作业区json格式数据
    @Provide() zyqIsIndeterminate:boolean = false; //用以表示 checkbox 的不确定状态，一般用于实现全选的效果
    @Provide() zyqCheckAll:boolean = false;//作业区全选
    @Provide() zyqSelList:any =[];//作业区选中列表
    @Provide() zyqMapData:any ={};//作业区地图数据
    @Provide() zyqMapTextData:any ={};//作业区地图文字数据
    @Provide() letter:any = ['A','B','C','D','E','F','G','H','I','G','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']//作业区点
    @Provide() makeABCD:any={};//作业区四角标识
    @Provide() checkedABCD:any = [];//新填作业区四角坐标
    @Provide() ckABCDCallout:any=[];//新增作业区地图标注点
    @Provide() sbqMarkerPoint:any = null;//作业区标注点对象
    @Provide() zyqPointABCD:any=[];//已勾选的作业区的四角坐标集合

    //起降点
    @Provide() liftIsIndeterminate = false; //用以表示 checkbox 的不确定状态，一般用于实现全选的效果
    @Provide() liftCheckAll = false;//起降点全选
    @Provide() liftLableCheck = true;//起降点是否显示文字标识
    @Provide() liftSelList:any = [];//起降点选中列表
    @Provide() liftCellID:string ="20200203";//起降点对象码
    @Provide() liftTJCellID:string ="20200203TJ";//起降点对象码
    @Provide() liftCell:CDataSet = new CDataSet(""); //起降点对象
    @Provide() liftJsonData:any ={};//起降点json格式集合
    @Provide() liftMapData:any ={};//起降点地图数据
    @Provide() liftMapTextData:any ={};//起降点地图文字数据
    @Provide() liftLineTool:any =null;//起降点编辑工具
    @Provide() showLiftDialog:any =false;//起降点保存对象弹框
    

    
    //防治计划上报
    @Provide() planCelID:string ="F2030";
    @Provide() planCell:CDataSet = new CDataSet("");//防治计划上报

    //作业区地图
    @Provide() tmap1Style:string ="width:7000px;height:7000px";
    @Provide() TMap1:any = null;//作业区截图地图对象

    async created() {
        if (this.height) {
            this.style = "height:" + (this.height - 20) + "px";
            this.activeName1Style ="height:" + (this.height ? this.height - 65 : "400") + "px;";
            this.activeName2Style ="height:" + (this.height ? this.height - 95 : "400") + "px";
        }
        this.operaSelCell = await this.getCell(this.TJCELL);//作业区查询条件
        this.operaSelCell.createRecord();
        this.liftCell = await this.getCell(this.liftCellID);//起降点对象
        this.zyqCell = await this.getCell(this.zyqCelID);//作业区区对象
        this.planCell = await this.getCell(this.planCelID);//防治计划上报对象
        this.operaSaveCell = await this.getCell(this.operaSaveCellID);//作业区
        this.operaBrCell = await this.getCell(this.operaBrCellID);//避让点
        this.jqMergeCell = await this.getCell(this.jqMergeCellID)//架区合并
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

/************************ 通用方法 ************************/
    //清空
    clearCover(){
        this.checkedABCD = [];
        this.zyqPointABCD = [];
        this.checkedABCD = [];
        this.zyqMapTextData = {};
        this.zyqMapData = {};
        this.zyqSelList =[];
        this.zyqIsIndeterminate = false; //用以表示 checkbox 的不确定状态，一般用于实现全选的效果
        this.zyqCheckAll = false;//作业区全选

        this.liftSelList=[];
        this.liftMapTextData={}
        this.liftMapData={}
        this.liftIsIndeterminate = false; //用以表示 checkbox 的不确定状态，一般用于实现全选的效果
        this.liftCheckAll = false;//起降点全选

        this.jqSelList=[];
        this.jqMapData={};
        this.jqMapTextData={};
        this.cIsIndeterminate = false;
        this.xIsIndeterminate = false;
        this.qIsIndeterminate = false;
        this.cCheckAll = false;
        this.xCheckAll = false;
        this.qCheckAll = false;

        this.tMap.clearOverLays();
        this.fifthRingRoad();
    }
    //获取对象
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
    //检查非空
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
    /**
     * 创建地图面
     * @param boundary1 经纬度
     * @param fillColor 填充颜色
     * @param fillOpacity 填充透明
     * @param color 边线颜色
     * @param weight 边线宽度
     * @param opacity 线透明度
     * @returns [对象，点集合]
     */ 
    createMapSurface(boundary1:any,fillColor:any,fillOpacity:any,color:any ='blue',weight:any =1,opacity:any =0.5){
        let boundary = boundary1.split(";");
        var points = [];
        for (var j = 0; j < boundary.length; j++) {
            let poin = boundary[j].split(",");
            if (poin.length >= 2) {
            points.push(new T.LngLat(poin[0], poin[1]));
            }
        }
        var polygon = new T.Polygon(points, {
            color: color,
            weight: weight,
            opacity: opacity,
            fillColor: fillColor,
            fillOpacity: fillOpacity,
        });
        return [polygon,points];
    }
    /**
     * 创建地图文字标注
     * @param point 标注点
     * @param text 标注点
     * @fontsize text 字体
     */
    makeOperaLableTXT(point:any,text:any,fontsize:any) {
        var label = new T.Label({
            text: text,
            position: point,
            offset: new T.Point(-35, 0),
            fontsize :14,
        });
        label.setFontColor("#E600FF")
        label.setFontSize(fontsize)
        label.setBorderLine(0)
        label.setBackgroundColor(null);
        return label;
    }

    /**
     * 获取单个架区数据
     */
    getOneJqData(id:any){
        let d1 = this.operaCData[id]
        if(!d1){
            d1 = this.operaXData[id]
        }
        if(!d1){
            d1 = this.operaQData[id]
        }
        return d1;
    }


/************************ 通用方法 ************************/


/************************ 五环路 ************************/
    //五环路
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
/*********************** 五环路END **********************/


/*********************** 左侧行政区 **********************/
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
            let qCont = new QueryCont("isnull(" + this.fatherID + ",'')", "", 12);
            qCont.setContrast(0);
            oneCont.push(qCont);
            if (oneCont.length != 0) {
                allCont.push(oneCont);
                cont = "~" + JSON.stringify(allCont);
            }
        } else {
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
    //行政区区县勾选节点发生变化
    handleCheckChange(data:any, data2:any) {
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
        for(var i=0;i<address.length;i++){
            let d = address[i].name
            if(d.indexOf("北京") ==-1){
                this.areaKv[d] = address[i].id;
                if(!this.areaMap[address[i].id])
                this.addresSel(d,0);
            }
        }
    }
    //地址定位
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
    //展开/关闭 行政区列表
    areaBtnClick(){
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
/*********************** 左侧行政区END **********************/


/*********************** 右侧架区 ******************************/
    //右侧避让区开关
    async operaBtnClick() {
        this.operaBtnOpen = !this.operaBtnOpen;
        if (this.operaBtnOpen) {
            while (this.operaWidth <= 300) {
                this.operaWidth++;
            }
        } else {
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
    //查找右侧数据
    async getOpera(){
        this.getDropPoint(null)
        let tj = this.operaSelCell.currRecord.data;
        let qe: QueryEntity = new QueryEntity(this.operaCellID, this.operaTJCellID);
        qe.page.currPage = 1;
        qe.page.pageSize = 10000;
        qe.cont = JSON.stringify(tj);
        qe.oprid = 13;
        this.showOperaDia = false;
        this.operaBtnOpen = false;
        this.loading =1;
        await this.operaSelCell.queryData(qe).then(res => {
            if(res.data.id == 0){ 
                this.zyqJsonData = {};
                this.operaCData = {}
                this.operaXData = {};
                this.operaQData = {};
                let values = res.data.data.data.data;
                for (var i = 0; i < values.length; i++) {
                    let d1 = values[i].data;
                    if(d1.sbuid == this.zyqSbuid){
                        this.zyqJsonData[d1.id] = d1;
                    }else if(d1.sbuid == this.jqSbuid){
                        if(d1.season+'' == '0'){//春
                            this.operaCData[d1.id] = d1;
                        }else if(d1.season+'' == '1'){//夏
                            this.operaXData[d1.id] = d1;
                        }else if(d1.season+'' == '2'){//秋
                            this.operaQData[d1.id] = d1;
                        }
                    }
                }
            }
            this.loading =0;
            this.operaBtnClick();
        })
        .catch(err => {
            this.showOperaDia = false;
            this.loading =0;
            this.$notify.error(err+";OperatingArea getOpera");
        });
    }
/*********************** 右侧架区 ******************************/

/*********************** 架区 **********************************/
    /** 
     * 架区全选  春
     */
    cCheckAllChange(val:any){
        for(let key in this.operaCData){
            if(val){
                if(!this.operaCData[key].mergeid){
                    if(this.jqSelList.indexOf(key) ==-1){
                        this.jqSelList.push(key);
                    }
                }
            }else{
                if(this.jqSelList.indexOf(key) !=-1){
                    this.jqSelList.splice(this.jqSelList.indexOf(key),1)
                }
            }
        } 
        this.cIsIndeterminate = false; 
        this.checkBoxChange(this.jqSelList);
    }
    /** 
     * 架区全选  夏
     */
    xCheckAllChange(val:any){ 
        for(let key in this.operaXData){
            if(val){
                if(!this.operaXData[key].mergeid){
                    if(this.jqSelList.indexOf(key) ==-1){
                        this.jqSelList.push(key);
                    }
                }
            }else{
                if(this.jqSelList.indexOf(key) !=-1){
                    this.jqSelList.splice(this.jqSelList.indexOf(key),1)
                }
            }
        } 
        this.cIsIndeterminate = false;
        this.checkBoxChange(this.jqSelList);
    }
    /** 
     * 架区全选  秋
     */
    qCheckAllChange(val:any){
        for(let key in this.operaQData){
            if(val){
                if(!this.operaQData[key].mergeid){
                    if(this.jqSelList.indexOf(key) ==-1){
                        this.jqSelList.push(key);
                    }
                }
            }else{
                if(this.jqSelList.indexOf(key) !=-1){
                    this.jqSelList.splice(this.jqSelList.indexOf(key),1)
                }
            }
        } 
        this.cIsIndeterminate = false; 
        this.checkBoxChange(this.jqSelList);
    }
    /**
     * 勾选发生变化
     */
    checkBoxChange(data: any) {
        let merID:any =[];
        for (var i = 0; i < data.length; i++) {
            let id = data[i];
            if (!this.jqMapData[id]) {
                //架区
                let d1 = this.getOneJqData(id)
                if(!d1){
                    continue;
                }
                this.jqMapAddData(d1,id,false) 
                this.makrAllBr(id,null);
            }
        }
        data = data.concat(merID)
        for (let key in this.jqMapData) {
            let ka = key.split("|")[0];
            if (data.indexOf(ka) == -1) {
                if (ka.indexOf("non-") == -1 && ka.indexOf("copy-") == -1) {
                    if (this.jqMapData[key]) {
                        this.tMap.removeOverLay(this.jqMapData[key]);
                    }
                    if (this.jqMapTextData[key]){
                        this.tMap.removeOverLay(this.jqMapTextData[key]);
                    }
                    delete this.jqMapData[key];
                    delete this.jqMapTextData[key];
                    this.delAllBr(key);
                }
            }
        }
    }
    /**
     * 架区工具条选中
     */
    jqEditToolsClick(item: any) {
        if(item == 3 || item == 4 || item ==5 || item ==6){//画避让区域
            //判断一下是否只勾选了一个架区
            let num = this.jqSelList.length;
            if(num>1){
                this.$notify.warning("请勾选一个架区！")
                return;
            }else if(num ==0){
                this.$notify.warning("请勾选架区！")
                return;
            }
            let d1 = this.getOneJqData(this.jqSelList[0]) 
            this.checkkid = d1.id
        }
        if(item == 2){ //规划架区区  线
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
        }else if(item == 1){ //规划架区  面
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
     * 架区规划-线绘制结束
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
        editCover.addEventListener("dblclick", this.jqCoverDBClick);
        this.jqMapData[key] = editCover;
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
     * 架区规划-多边形绘制结束
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
        editCover.addEventListener("dblclick", this.jqCoverDBClick);
        this.jqMapData[key] = editCover;
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
     * 架区双击
     */
    jqCoverDBClick(data: any) {
        let target = data.target;
        let operid = target.kid;
        this.editKid = target.kid;
        let points = target.getLngLats()[0];
        let cover = this.jqMapData[operid];
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
            let d1 = this.getOneJqData(operid);
            this.operaSaveCell.clear();
            this.operaSaveCell.createRecord();
            let area = polygonTool.getArea(points);
            if(isNaN(area))
                area = 0;
            if (d1 && iscopy == false) {
                //存在进行修改
                this.operaSaveCell.currRecord.data = d1;
                this.operaSaveCell.currRecord.c_state = 2;
            } else {
                if(iscopy){
                    d1 = Object.assign({},d1);
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
     * 保存新增架区
     */
    async saveOpera() {
        console.log("保存作业区")
        let bok = this.checkNotNull(this.operaSaveCell);
        if (!bok) return;
        this.loading++;
        let res: any = await this.operaSaveCell.saveData();
        if (res.data && res.data.id == 0) {
            let operid = this.operaSaveCell.currRecord.data.id;
            if(res.data.data.id && operid != res.data.data.id){
                operid = res.data.data.id; 
                this.operaSaveCell.currRecord.data.id = operid;
            }
            let newDate = this.operaSaveCell.currRecord;
            if(newDate.oldpk && newDate.oldpk.length>0){
                let oldID = newDate.oldpk[0];
                if(this.jqSelList.indexOf(oldID) !=-1){
                    this.jqSelList.splice(this.jqSelList.indexOf(oldID),1)
                }
                delete this.operaCData[oldID];
                delete this.operaXData[oldID];
                delete this.operaQData[oldID] 
                if (this.jqMapData[oldID]) {
                    this.tMap.removeOverLay(this.jqMapData[oldID]);
                }
                if (this.jqMapTextData[oldID]){
                    this.tMap.removeOverLay(this.jqMapTextData[oldID]);
                }
                
                delete this.jqMapData[oldID];
                delete this.jqMapTextData[oldID];
                this.delAllBr(oldID);
            }else{
                newDate.oldpk=[];
            }
            if(newDate.data.season+'' == '0'){
                this.operaCData[operid] = newDate.data 
            }else if(newDate.data.season+'' == '1'){
                this.operaXData[operid] = newDate.data 
            }else if(newDate.data.season+'' == '2'){
                this.operaQData[operid] = newDate.data 
            }
            
            if (operid) {
                if (this.jqMapData[this.editKid]){
                    this.tMap.removeOverLay(this.jqMapData[this.editKid]);
                    delete this.jqMapData[this.editKid];
                }
                if(this.jqMapTextData[this.editKid]){
                    this.tMap.removeOverLay(this.jqMapTextData[this.editKid]);
                    delete this.jqMapTextData[this.editKid];
                }
                if(this.jqSelList.indexOf(operid) ==-1){
                    this.jqSelList.push(operid);
                }
                this.checkBoxChange(this.jqSelList);
                this.$notify.success("保存成功！");
                this.showSaveOperaDia = false;
                this.loading = 0;
            }
        } else {
            this.$notify.error("保存失败！");
            this.loading = 0;
        }
    }
    /**
     * 编辑架区  作业区唯一码
     * @param operid 作业区唯一码
     */
    editOpera(operid: any) {
        let cover = this.jqMapData[operid];
        if (cover) {
            this.tMap.removeOverLay(cover);
            this.tMap.addOverLay(cover);
            cover.removeEventListener("dblclick", this.jqCoverDBClick);
            cover.addEventListener("dblclick", this.jqCoverDBClick);
            cover.enableEdit();
            cover.kid = operid;
        } else {
            let d1 = this.getOneJqData(operid);
            this.jqMapAddData(d1,operid,true) 
        }
        if (this.jqSelList.indexOf(operid) == -1) {
            this.jqSelList.push(operid);
        }
    }
    /**
     * 删除架区
     * @param operid 作业区唯一码
     * @param type  0识别区，1春，2夏，3秋
     */
    delOpera(operid: any,type:any,index:any) {
        let d1 = this.getOneJqData(operid);
        let co = "此操作将删除架区：" + d1.name + "，是否继续？";
        this.operaSaveCell.clear();
        this.operaSaveCell.createRecord();
        this.$confirm(co, "提示", {confirmButtonText: "确定", cancelButtonText: "取消", type: "warning" }) .then(() => {
            if (d1) {
                this.operaSaveCell.currRecord.data = d1;
                this.operaSaveCell.currRecord.c_state = 4;
            }
            this.delOperaDo();
        })
        .catch(() => {
            this.$message({
            type: "info",
            message: "已取消删除"
            });
        });
    }
    //进行删除
    async delOperaDo() {
        let key = this.operaSaveCell.currRecord.data.id;
        let res: any = await this.operaSaveCell.saveData();
        if (res.data && res.data.id == 0) {
            if (this.jqMapData[key]){
                this.tMap.removeOverLay(this.jqMapData[key]);
            }
            if (this.jqMapTextData[key]){
                this.tMap.removeOverLay(this.jqMapTextData[key]);
            } 
            this.$notify.success("删除成功！");
            delete this.operaCData[key]
            delete this.operaXData[key]
            delete this.operaQData[key]
            this.delAllBr(key);
            this.$forceUpdate();
        } else {
            this.$notify.error("删除失败！");
        }
    }
    /**
     * 复制作业区  作业区唯一码
     * @param operid 作业区唯一码
     */
    copyOpera(operid: any){
        if(this.jqSelList.indexOf(operid) ==-1){
            this.jqSelList.push(operid);
        }
        let d1 = this.getOneJqData(operid);
        operid = "copy-"+operid;
        this.jqMapAddData(d1,operid,true) 
    }
    //架区地图添加数据通用方法
    jqMapAddData(d1:any,operid:any,edit:any){
        let cc:any = this.createMapSurface(d1.boundary1,d1.color,d1.opacity,d1.color,1,1);
        let polygon = cc[0];
        let points = cc[1];
        //向地图上添加面
        this.tMap.addOverLay(polygon);
        let t1 = this.tMap.getViewport(points);
        this.tMap.panTo(t1.center, t1.zoom);
        this.jqMapData[operid] = polygon;
        let text = d1.name;  
        if (d1.area != 0 && d1.sbuid != 'F2005') {
            text += "<br/>面积：" + d1.area + "亩";
        }
        let index = parseInt((points.length/2)+"")
        let label = this.makeOperaLableTXT(points[index],text,15);
        this.tMap.addOverLay(label);
        this.jqMapTextData[operid] = label;
        if(edit){
            polygon.enableEdit();
            polygon.kid = operid;
            polygon.addEventListener("dblclick", this.jqCoverDBClick);
        }
    }

/*********************** 架区 **********************************/


/*********************** 避让点 **********************************/
    /**
     * 避让区域-多边形绘制结束
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
        this.brMapData[key] = editCover;
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
     * 避让区域-线绘制结束
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
        this.brMapData[key] = editCover;
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
        this.brMapData[key] = editCover;

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
        this.brMapData[key] = editCover;
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
        let cover = this.brMapData[kid];
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
                if (this.brMapData[this.editBrk]){
                    this.tMap.removeOverLay(this.brMapData[this.editBrk]);
                    delete this.brMapData[this.editBrk];
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
     * 删除单个作业区的全部避让区域
     */
    delAllBr(operid:any){
        if(this.operaBrData[operid]){
            let br = this.operaBrData[operid]
            for(var j=0;j<br.length;j++){
                let br1 = br[j].data;
                let kk = operid+"|"+br1.oaid;
                if(this.brMapData[kk]){
                    this.tMap.removeOverLay(this.brMapData[kk]);
                    delete this.brMapData[kk];
                }
            }
        }
    }
    /**
     * 画单个作业区的全部避让区域
     */
    async makrAllBr(operid:any,koid:any){
        if(!this.operaBrData[operid]){
            await this.showOperaBr(operid)
        }
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
                        if(this.brMapData[kk]){
                            this.tMap.removeOverLay(this.brMapData[kk]);
                        } 
                        //向地图上添加标注
                        this.tMap.addOverLay(marker);
                        this.brMapData[kk] = marker;
                    }else if(br1.type ==1){//面 
                        let ccbr:any = this.createMapSurface(dbr1.boundary1,dbr1.color,0.5,dbr1.color,1,1);
                        if(this.brMapData[kk]){
                            this.tMap.removeOverLay(this.brMapData[kk]);
                        }
                        this.tMap.addOverLay(ccbr[0]);
                        this.brMapData[kk] = ccbr[0];
                    }else if(br1.type ==2){//圆圈
                        if(this.brMapData[kk]){
                            this.tMap.removeOverLay(this.brMapData[kk]);
                        }
                        let latlng = br1.avoid.split(",");
                        // 定义该矩形的显示区域
                        let radius = parseFloat(br1.radius+'')
                        var circle = new T.Circle(new T.LngLat(latlng[0], latlng[1]), radius,{color:"blue",weight:1,opacity:0.7,fillColor:br1.color,fillOpacity:0.5,lineStyle:"solid"});
                        //向地图上添加圆
                        this.tMap.addOverLay(circle); 
                        this.brMapData[kk] = circle;
                    }
                }
            }
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
            this.$notify.error(err+";OperatingArea showOperaBr");
        });
    }
    /**
     * 编辑避让区
     */
    editOperaBr(data:any){
        let kid = data.oid+"|"+data.oaid;
        let cover = this.brMapData[kid];
        if (cover) {
            this.tMap.removeOverLay(cover)
            this.tMap.addOverLay(cover);
            cover.removeEventListener("dblclick", this.operaBrDBClick);
            cover.addEventListener("dblclick", this.operaBrDBClick);
            cover.enableEdit();
            cover.kid = kid;
        } else {
            let d11 = this.operaBrJSON[kid];
            let d1 = {boundary1:d11.avoid,color:d11.color}
            let cc:any = this.createMapSurface(d1.boundary1,d1.color,0.5,d1.color,1,1);
            let polygon = cc[0];
            let points = cc[1];
            //向地图上添加面
            this.tMap.addOverLay(polygon);
            let t1 = this.tMap.getViewport(points);
            this.tMap.panTo(t1.center, t1.zoom);
            this.brMapData[kid] = polygon;
            polygon.enableEdit();
            polygon.kid = kid;
            polygon.addEventListener("dblclick", this.operaBrDBClick);
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
            let data = this.operaBrData[key.split("|")[0]];
            data.splice(indexBr,1);
            this.operaBrData[key.split("|")[0]] = data;
            
            if (this.brMapData[key]) {
                this.tMap.removeOverLay(this.brMapData[key]);
            }
            delete this.operaBrJSON[key]
            this.$notify.success("删除成功！");
            await this.showOperaBr(key.split("|")[0]);
            this.$forceUpdate();
        } else {
        this.$notify.error("删除失败！");
        }
    }

    /**
     * 显示架区下的避让区
     */
    async showoperaBrData(id:any,type:any){
        if(type =='c'){
            if(this.operaCData[id].showbr){
                this.operaCData[id].showbr = false;
            }else{
                await this.showOperaBr(id);
                this.operaCData[id].showbr = true;
            }
        }
        if(type =='x'){
            if(this.operaXData[id].showbr){
                this.operaXData[id].showbr = false;
            }else{
                await this.showOperaBr(id);
                this.operaXData[id].showbr = true;
            }
        }
        if(type =='q'){
            if(this.operaQData[id].showbr){
                this.operaQData[id].showbr = false;
            }else{
                await this.showOperaBr(id);
                this.operaQData[id].showbr = true;
            }
        }
        this.$forceUpdate();
    }

/*********************** 避让点END **********************************/


/************************ 作业区 ****************************/
    //作业区工具lan
    aviationToolClick(item:any){
        let sbqData = [];
        if(item == 1 || item ==2){     
            for(var i=0;i<this.zyqSelList.length;i++){
                let k = this.zyqSelList[i];
                let data = this.zyqJsonData[k]
                sbqData.push(data);
            }
            if(sbqData.length<=0){
                this.$notify.warning("请勾选作业区！")
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
                this.sbqMarkerPoint.addEventListener("mouseup",this.zyqMarkerPointToolEnd);
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
            this.zyqCell.clear();
            this.zyqCell.createRecord();
            this.zyqCell.currRecord.data.boundary1 = boundary1;
            this.showSavezyqDia = true;
        }else if(item ==5){//删除最后一点
            this.tMap.removeOverLay(this.ckABCDCallout[this.ckABCDCallout.length-1]);
            this.ckABCDCallout.splice(this.ckABCDCallout.length-1,1)
            this.checkedABCD.splice(this.checkedABCD.length-1,1)
        }
    }
    //作业区全选
    zyqCheckAllChange(val:any){
        if(val == true){
            this.zyqSelList = [];
            for(let key in this.zyqJsonData){
                this.zyqSelList.push(key)
            }
        }else{
            this.zyqSelList = [];
        }
        this.zyqIsIndeterminate=val
        this.fifthRingRoad();
        this.creatZyqMapData(true);
    }
    //作业区单个选中/取消
    zyqCheckBoxChange(val:any){
        this.zyqSelList = val;
        this.creatZyqMapData(false);
    }
    //创建作业区地图数据
    creatZyqMapData(selAll:any = false){
        let keys:any = [];
        let points:any = [];
        for(var i=0;i<this.zyqSelList.length;i++){
            let key = this.zyqSelList[i];
            let data = this.zyqJsonData[key];
            if(!data)
                continue;
            this.zyqMapAddData(data,key,false) 
            keys.push(data.id);
        }
        if(points.length>0 ){
            let t1 = this.tMap.getViewport(points);
            this.tMap.panTo(t1.center, t1.zoom);
        }
        for (let key in this.zyqMapData){
            if(keys.indexOf(key) ==-1)
                this.tMap.removeOverLay(this.zyqMapData[key]);
        }
        for (let key in this.zyqMapTextData){
            if(keys.indexOf(key) ==-1)
                this.tMap.removeOverLay(this.zyqMapTextData[key]);
        }
    }
    //创建作业区四角 标识
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
        this.zyqPointABCD = abcdData;
    }
    /**
     * 新点标注完成后
     */
    zyqMarkerPointToolEnd(parameter:any){
        let editCover = parameter.currentMarker; 
        this.ckABCDCallout.push(editCover)
        let lnglat = parameter.currentLnglat;
        let avoid = lnglat.getLng()+","+lnglat.getLat();
        this.checkedABCD.push(avoid)
    }
    //以创建的航空识别区四角标识点击
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
     * 保存作业区
     */
    async saveZyq(){
        let bok = this.checkNotNull(this.zyqCell);
        if (!bok) return;
        let res: any = await this.zyqCell.saveData();
        if (res.data && res.data.id == 0) {
            let data = this.ckABCDCallout;
            for(var i=0;i<data.length;i++){
                this.tMap.removeOverLay(data[i])
            }
            this.ckABCDCallout=[];
            this.checkedABCD =[];
            this.zyqPointABCD=[];
            
            let zyqid = this.zyqCell.currRecord.data.id;
            if(res.data.data.id && zyqid != res.data.data.id){
                zyqid = res.data.data.id;
                this.zyqCell.currRecord.data.id = zyqid
            }
            let newZyq = this.zyqCell.currRecord.data; 
            let oldpk = this.zyqCell.currRecord.oldpk;
            if(oldpk && oldpk.length>0){
                let oldID = oldpk[0];
                if(this.zyqSelList.indexOf(oldID) !=-1){
                    this.zyqSelList.splice(this.zyqSelList.indexOf(oldID),1)
                }
                delete this.zyqJsonData[oldID] 
                this.zyqCell.currRecord.oldpk =[];
                if(this.zyqMapData[oldID]){
                    this.tMap.removeOverLay(this.zyqMapData[oldID]);
                }
                if(this.zyqMapTextData[oldID]){
                    this.tMap.removeOverLay(this.zyqMapTextData[oldID]);
                }
            }
            this.zyqJsonData[zyqid] = newZyq;
            this.showSavezyqDia = false; 
            if (zyqid) {
                this.zyqSelList.push(zyqid);
                this.zyqCheckBoxChange(this.zyqSelList);
            }
            this.$forceUpdate()
            this.$notify.success("保存成功！");
        } else {
            this.showSavezyqDia = false;
            this.$notify.error("保存失败！");
        }
    }
    /**
     * 编辑作业区
     */
    editOperaZyq(operid: any){
        let cover = this.zyqMapData[operid];
        if (cover) {
            this.tMap.removeOverLay(cover);
            this.tMap.addOverLay(cover)
            cover.removeEventListener("dblclick", this.zyqcoverDBClick);
            cover.addEventListener("dblclick", this.zyqcoverDBClick);
            cover.enableEdit();
            cover.kid = operid;
        } else {
            let d1 = this.zyqJsonData[operid];
            this.zyqMapAddData(d1,operid,true) 
        }
        if (this.zyqSelList.indexOf(operid) == -1) {
            this.zyqSelList.push(operid);
        }
    }
    /**
     * 删除作业区
     */
    delOperaZyq(operid: any) {
        let d1 = this.zyqJsonData[operid];
        let co = "此操作将删除作业区：" + d1.name + "，是否继续？";
        this.zyqCell.clear();
        this.zyqCell.createRecord();
        this.$confirm(co, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
        })
        .then(() => {
            if (d1) {
            //存在进行修改
            this.zyqCell.currRecord.data = d1;
            this.zyqCell.currRecord.c_state = 4;
            }
            this.delDo();
        })
        .catch(() => {
            this.$message({
            type: "info",
            message: "已取消删除"
            });
        });
    }
    //进行删除
    async delDo(){
        let key = this.zyqCell.currRecord.data.id;
        let res: any = await this.zyqCell.saveData();
        if (res.data && res.data.id == 0) {
            if (this.zyqMapData[key]){
                this.tMap.removeOverLay(this.zyqMapData[key]);
            }
            if (this.zyqMapTextData[key]){
                this.tMap.removeOverLay(this.zyqMapTextData[key]);
            }
            this.$notify.success("删除成功！");
            delete this.zyqJsonData[key]
            this.$forceUpdate()
        }
    }

    /**
     * 作业区双击
     */
    zyqcoverDBClick(data: any) {
        let target = data.target;
        let operid = target.kid;
        this.editKid = target.kid;
        let points = target.getLngLats()[0];
        let cover = this.zyqMapData[operid];
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
            let d1 = this.zyqJsonData[operid];
            this.zyqCell.clear();
            this.zyqCell.createRecord();
            let area = polygonTool.getArea(points);
            if (d1 && iscopy == false) {
                //存在进行修改
                this.zyqCell.currRecord.data = d1;
                this.zyqCell.currRecord.c_state = 2;
            } else {
                if(iscopy){
                    d1 = Object.assign({},d1);
                    let id = this.zyqCell.currRecord.data.id
                    this.zyqCell.currRecord.data = d1;
                    this.zyqCell.currRecord.data.id = id;
                }
                //新增
                this.zyqCell.currRecord.c_state = 1;
            }
            this.zyqCell.currRecord.data.area = (area / 666.66).toFixed(2);
            this.zyqCell.currRecord.data.boundary1 = boundary1;
            this.showSavezyqDia = true;
        }
    }

    /**
     * 复制作业区  作业区唯一码
     * @param operid 作业区唯一码
     */
    copyOperaZyq(operid: any){
        if(this.zyqSelList.indexOf(operid) ==-1){
            this.zyqSelList.push(operid);
        }
        let d1 = this.zyqJsonData[operid];
        operid = "copy-"+operid;
        this.zyqMapAddData(d1,operid,true)
    }
    //作业区地图添加数据方法
    zyqMapAddData(d1:any,operid:any,edit:any){
        let cc:any = this.createMapSurface(d1.boundary1,null,0,"#000000",4,1);
        let polygon = cc[0];
        let points = cc[1];
        //向地图上添加面
        this.tMap.addOverLay(polygon);
        let t1 = this.tMap.getViewport(points);
        this.tMap.panTo(t1.center, t1.zoom);
        this.zyqMapData[operid] = polygon;
        let point = null;
        if(d1.startpoint){
            let poin = d1.startpoint.split(",")
            point = new T.LngLat(poin[0], poin[1])
        }else{
            point =  t1.center;
        }
        let label = this.makeOperaLableTXT(point,d1.id,55);
        this.tMap.addOverLay(label);
        this.zyqMapTextData[operid] = label;
        if(edit){
            polygon.enableEdit();
            polygon.kid = operid;
            polygon.addEventListener("dblclick", this.zyqcoverDBClick);
        }
    }
/************************ 作业区END ****************************/
 

/************************ 起降点 ****************************/
    //获取起降点
    async getDropPoint(sid:any){
        try{
            let tj = this.operaSelCell.currRecord.data;
            let sorg = tj.sorg;
            let iym = tj.iym;
            let tjdate = {sorg:sorg,iym:iym,sid:sid};
            let qe: QueryEntity = new QueryEntity(this.liftCellID, this.liftTJCellID);
            qe.page.currPage=1;
            qe.page.pageSize=2000;
            qe.cont = JSON.stringify(tjdate);
            qe.oprid = 13;
            this.liftJsonData ={};
            await this.liftCell.queryData(qe).then(res => { 
                if(res.data.id ==0 ){
                    let values = res.data.data.data.data;
                    for(var i=0;i<values.length;i++){
                        let _d1 = values[i]
                        let data = JSON.parse(JSON.stringify(_d1.data));
                        this.liftJsonData[data.sid] = _d1.data;
                    } 
                }
            })
        }catch(e){
            this.loading =0;
        }
    }
    //起降点全选
    liftCheckAllChange(val:any){
        this.liftIsIndeterminate = val;
        if(val == true){
            this.liftSelList=[];
            for(let key in this.liftJsonData){
                this.liftSelList.push(key)
            }
        }else{
            this.liftSelList = [];
        }
        this.creatLiftMapData(true);
    }
    //单个起降点勾选
    liftCheckBoxChange(val:any){
        this.liftSelList = val;
        this.creatLiftMapData(false);
    }
    //起降点文字标注 显示状态发生变化
    liftLableChange(val:any){
        for(var key in this.liftMapTextData){
            let lable = this.liftMapTextData[key];
            if(val){
                this.tMap.addOverLay(lable);
            }else{
                this.tMap.removeOverLay(lable);
            }
        }
    }
    //创建已经勾选的起降点
    creatLiftMapData(selAll:any =false){
        let keys:any = [];
        let points:any = [];
        for(var i=0;i<this.liftSelList.length;i++){
            let key = this.liftSelList[i];
            let data = this.liftJsonData[key];
            keys.push(data.sid);
            let liftdata:any = this.makeLift(data);
            let icon:any = liftdata[0];
            let text:any = liftdata[1];
            if(this.liftMapData[data.sid]){
                this.tMap.removeOverLay(this.liftMapData[data.sid]);
            }
            this.tMap.addOverLay(icon);
            this.liftMapData[data.sid] = icon;
            if(this.liftMapTextData[data.sid]){
                this.tMap.removeOverLay(this.liftMapTextData[data.sid]);
            }
            this.liftMapTextData[data.sid] = text;
            if(this.liftLableCheck){//显示文字标识
                this.tMap.addOverLay(text);
            }
            let boundary = data.north.split(","); 
            //向地图上添加自定义标注
            let center = new T.LngLat(boundary[0], boundary[1]);
            points.push(center);
        } 
        if(points.length>0 && selAll){
            let t1 = this.tMap.getViewport(points);
            this.tMap.panTo(t1.center, t1.zoom);
        }
        for (let key in this.liftMapData){
            if(keys.indexOf(key) ==-1)
                this.tMap.removeOverLay(this.liftMapData[key]);
        }
        for (let key in this.liftMapTextData){
            if(keys.indexOf(key) ==-1){
                this.tMap.removeOverLay(this.liftMapTextData[key]);
                delete this.liftMapTextData[key];
            }
        }
    }
    //创建起降点地图信息
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
            offset: new T.Point(-170, -110),
        });
        label.setBorderLine(0)
        label.setFontSize(16)
        label.setBackgroundColor(null);
        return [marker,label]
    }
    //经纬度格式转换
    doubleToDFM(value:any){
        value = Math.abs(value);
        var v1 = Math.floor(value);//度
        var v2 = Math.floor((value - v1) * 60);//分
        var v3 = Math.round((value - v1) * 3600 % 60);//秒
        let data = v1 + '°' + v2 + '′' + v3 + '″'; 
        return data;
    }
    //删除起降点
    delLift(sid: any){
        let d1 = this.liftJsonData[sid];
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
            this.delLiftDo();
        })
        .catch(() => {
            this.$message({
            type: "info",
            message: "已取消删除"
            });
        });
    }
    //进行删除
    async delLiftDo() {
        let key = this.liftCell.currRecord.data.sid;
        let res: any = await this.liftCell.saveData();
        if (res.data && res.data.id == 0) {
            if (this.liftMapData[key]){
                this.tMap.removeOverLay(this.liftMapData[key]);
                delete this.liftMapData[key];
            }
            if (this.liftMapTextData[key]){
                this.tMap.removeOverLay(this.liftMapTextData[key]);
                delete this.liftMapTextData[key];
            } 
            this.$notify.success("删除成功！");
            delete this.liftJsonData[key]
            this.$forceUpdate()
        } else {
            this.$notify.error("删除失败！");
        }
    }
    //起降点规划工具
    liftToolClick(item:any){
        if(item == '1'){ 
            //创建标注工具对象
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
    //起降点编辑完成
    liftLineToolEnd(parameter:any){
        let editCover = parameter.currentMarker;
        let key = "non-" + new Date().getTime();
        let lnglat = parameter.currentLnglat;
        let north = lnglat.getLng()+","+lnglat.getLat(); 
        this.editKid = key;
        editCover.kid = key;
        editCover.addEventListener("dblclick", this.liftDBClick);
        this.liftMapData[key] = editCover;
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
        let cover = this.liftMapData[operid];
        if (operid) {
            let d1 = this.liftJsonData[operid];
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
        this.loading =1;
        try{
            let bok = this.checkNotNull(this.liftCell);
            if (!bok) return;
            let res: any = await this.liftCell.saveData();
            if (res.data && res.data.id == 0) {
                let liftsid = this.liftCell.currRecord.data.sid;
                if(res.data.data.sid && liftsid != res.data.data.sid){
                    liftsid = res.data.data.sid;
                    this.liftCell.currRecord.data.sid =liftsid
                }
                
                this.liftJsonData[liftsid] = this.liftCell.currRecord.data;
                if (liftsid) {
                    if (this.liftMapData[this.editKid]){
                        this.tMap.removeOverLay(this.liftMapData[this.editKid]);
                        delete this.liftMapData[this.editKid];
                    }
                    if(this.liftMapTextData[this.editKid]){
                        this.tMap.removeOverLay(this.liftMapTextData[this.editKid]);
                        delete this.liftMapTextData[this.editKid];
                    }        
                    if (this.liftSelList.indexOf(liftsid) == -1) {
                        this.liftSelList.push(liftsid);
                    }
                    this.liftCheckBoxChange(this.liftSelList);
                }
                this.loading = 0;
                this.$notify.success("保存成功！");
                this.showLiftDialog = false;
                this.$forceUpdate()
            } else {
                this.loading = 0;
                this.$notify.error("保存失败！");
            }
        }catch(e){
            this.loading = 0;
            this.$notify.error("保存失败！");
        }
    }
    //编辑起降点
    editLift(sid:any){
        let cover = this.liftMapData[sid];
        if (cover) {
            cover.removeEventListener("dblclick", this.liftDBClick);
            cover.addEventListener("dblclick", this.liftDBClick);
            cover.enableDragging();
            cover.kid = sid;
        } else {
            let d1 = this.liftJsonData[sid];
            let liftData = this.makeLift(d1);
            var polygon = liftData[0];
            //向地图上添加面
            this.tMap.addOverLay(polygon);
            this.liftMapData[sid] = polygon;
            var label = liftData[1];
            if(this.liftLableCheck)
                this.tMap.addOverLay(label);
            this.liftMapTextData[sid] = label;
            polygon.enableDragging();
            polygon.kid = sid;
            polygon.addEventListener("dblclick", this.liftDBClick);
        }
        if (this.liftSelList.indexOf(sid) == -1) {
            this.liftSelList.push(sid);
        }
    }
/************************ 起降点END ****************************/


/************************* 导出作业区图片 *************************/
    Screenshot(){
        this.loading++;
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
            this.loading =0;
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
            });
        }catch(e){
            this.loading--;
            this.$notify.error("图片获取失败！");
            console.log(e);
        } 
    }
/************************* 导出作业区图片END *************************/

/************************* 防治计划上报 ***************************/
    PlanToReport(){
        this.planCell.createRecord();
        let _this = this;
        let operaid = "";
        if(this.jqSelList.length ==0){
            this.$notify.warning("请勾选飞防作业区!");
            return;
        }
        for(var i=0;i<this.jqSelList.length;i++){
            let id = this.jqSelList[i]; 
            operaid+=id+";"
        }
        this.loading = 1;
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
    //上传防治计划图片
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
/************************* 防治计划上报END ***************************/

/********************* 架区合并 ************************/
    //架区合并按钮点击
    shelfAreaMerge(){
        let num =0;
        let season = null;
        let area = 0;
        let operid = "";
        for(var i=0;i<this.jqSelList.length;i++){
            let key = this.jqSelList[i];
            let d1 = this.getOneJqData(key);
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
            area+=d1.area
        }
        if(num <= 1){
            this.$notify.warning("请勾选多个架区！")
            return;
        } 
        operid = operid.substring(0,operid.length-1);
        this.jqMergeCell.clear();
        this.jqMergeCell.createRecord();
        this.jqMergeCell.currRecord.data.mergeid = operid;
        this.jqMergeCell.currRecord.data.season = season;
        this.jqMergeCell.currRecord.data.area = area;
        this.showSaveHBOperaDia = true;
    }
    //保存架区合并数据
    async saveHBOpera(){
        let bok = this.checkNotNull(this.jqMergeCell);
        if (!bok) return;
        this.loading++;
        let res: any = await this.jqMergeCell.saveData();
        if (res.data && res.data.id == 0) {
            let operid = this.jqMergeCell.currRecord.data.id;
            if(res.data.data.id && operid != res.data.data.id){
                operid = res.data.data.id; 
                this.jqMergeCell.currRecord.data.id = operid;
            }
            let newDate = this.jqMergeCell.currRecord.data;
            if(newDate.season+'' == '0'){       
                this.operaCData[operid] = newDate; 
            }else if(newDate.season+'' == '1'){ 
                this.operaXData[operid] = newDate; 
            }else if(newDate.season+'' == '2'){  
                this.operaQData[operid] = newDate; 
            } 
        }
        this.$notify.success("保存成功！")
        this.showSaveHBOperaDia = false;
        this.loading--;
    }
    /**
     * 编辑合并架区
     * */
    editHBOpera(id:any){
        let data = this.getOneJqData(id);
        this.jqMergeCell.clear();
        this.jqMergeCell.createRecord();
        this.jqMergeCell.currRecord.data  = data
        this.jqMergeCell.currRecord.c_state = 2;
        this.showSaveHBOperaDia = true;
    }
    /**
     * 绘制合并架区
     */
    portrayHBOpera(id:any){
        let d1 = this.getOneJqData(id)
        if(!d1){
            return;
        } 
        let mergeidArr = d1.mergeid.split(";")
        for(var j=0;j<mergeidArr.length;j++){
            id = mergeidArr[j];
            d1 = this.getOneJqData(id)
            if(this.jqSelList.indexOf(id) == -1 ){
                this.jqSelList.push(id);
            }
        }
        this.checkBoxChange(this.jqSelList);
    }

/*************************** 架区合并END ********************************/

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