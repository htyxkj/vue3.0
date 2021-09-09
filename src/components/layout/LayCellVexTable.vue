<template>
    <div v-if="laycell" class="bip-lay" style="position: relative;">
        <!-- <el-row  v-if="this.cds.cdata.sumData && this.cds.cdata.sumData.length>0 && this.cds.page.total>0" style="padding:5px 0px;">
            <template v-for="(item,index) in this.cds.cdata.sumData">
                <span class="sum" :key="index">{{item.labelString}}: {{item.initval}}</span>&nbsp;&nbsp;&nbsp;&nbsp;
            </template>
        </el-row> -->

        <!--  -->
        <template v-if="!breport">
            <!-- <vxe-toolbar v-if="isNoHomeTable" :custom="{immediate:false}" style="height: 35px;padding: 4px 0px 0px;position: absolute;right: 30px;z-index: 100;"></vxe-toolbar> -->
        </template>
        <template v-else>
            <vxe-toolbar v-if="isNoHomeTable&&config.type ==2" :custom="{immediate:false}" >
                <template #buttons>
                    <template v-if="breport&&commBtns">
                    <!-- <el-button-group v-if="breport&&commBtns"> -->
                        <template  v-for="(btn,index) in commBtns">
                            <el-button class="bip-menu-bar" :class="btn.type?'bip_btn_'+btn.type:'bip_btn_default'" :key="index" :size="'small'" @click.native="invokecmd(btn)" :disabled="!btn.enable">     
                                <template v-if="btn.hasIcon">
                                    <template v-if="btn.icon&&btn.bIconleft">
                                        <i :class="btn.icon"></i>{{btn.name}}
                                    </template>    
                                    <template v-else>
                                        {{btn.name}} <i :class="btn.icon"></i> 
                                    </template>
                                </template>
                                <template v-else>
                                    {{btn.name}}
                                </template>
                            </el-button>
                        </template>
                    <!-- </el-button-group> -->
                    </template>
                </template>
            </vxe-toolbar>
        </template>

        <template v-if="beBill">
            <!-- 单据录入表格-->
            <vxe-table :keep-source="false"
                auto-resize :ref="this.cds.ccells.obj_id" v-if="beBill" border
                :footer-method="footerMethod" :show-footer="haveFooterSum"
                size="small" :data.sync="cds.cdata.data" row-id="id" resizable
                :height="height" highlight-hover-row show-all-overflow="tooltip" show-header-overflow
                highlight-current-row class="vxe-table-element mytable-scrollbar" :optimized="true"
                :edit-config="{trigger: 'click', mode: 'cell',showStatus: true,showIcon:false,activeMethod:activeMethod}"
                :selectRow="cds.currRecord"  @cell-click="table_cell_click"
                :header-cell-style="headerCellStyle" @edit-actived="rowActive"
                @edit-closed="editClose" @checkbox-change="selectChangeEvent"
                @checkbox-all="selectChangeEvent"  @custom="toolbarCustomEvent"
                :footer-cell-class-name="footerCellClassName"
                :loading="table_loading"
                >
                <vxe-table-column v-if="cds.ds_par" type="checkbox" width="60"></vxe-table-column>

                <!-- 表格三级表头 目前写死三级 -->

                <template v-for="(item,index) in groupCells">
                    <template v-if="!item.child">
                        <vxe-table-column :key="index" header-align="center" :align="item.align"
                            :field="item.id" :width="widths[item.widthIndex]" :title="item.labelString"
                            show-header-overflow :edit-render="{name: 'default'}" show-overflow :disabled="(item.attr&0x40)>0">
                            <template #edit="{rowIndex}">
                                <bip-comm-editor  :cell="item" :cds="cds" :row="rowIndex" :bgrid="true" :env="env"/> 
                            </template>
                            <template #default="{rowIndex}">
                                <bip-grid-info :cds="cds" :cell="item" :row="rowIndex" :bgrid="true" ></bip-grid-info>
                            </template>
                        </vxe-table-column>
                    </template>
                    <vxe-table-colgroup  v-else :title="item.title" header-align="center" :key="index"><!-- 一级表头 -->
                        <template v-if="item.child.length>0">
                            <template v-for="(child_item,idx) in item.child">
                                <template v-if="child_item.child && child_item.child.length==0">
                                    <vxe-table-colgroup header-align="center" :key="idx" :title="child_item.title"><!-- 二级表头 -->
                                        <vxe-table-column v-for="(child_cel,idx1) in child_item.cels" :key="idx1" header-align="center" :align="item.align"
                                            :field="child_cel.id" :width="widths[child_cel.widthIndex]" :title="child_cel.labelString"
                                            show-header-overflow :edit-render="{name: 'default'}" show-overflow :disabled="(child_cel.attr&0x40)>0"> <!-- 三级表头 -->
                                            <template v-slot:edit="{rowIndex}">
                                                <bip-comm-editor  :cell="child_cel" :cds="cds" :row="rowIndex" :bgrid="true"/> 
                                            </template>
                                            <template v-slot="{rowIndex}">
                                                <bip-grid-info :cds="cds" :cell="child_cel" :row="rowIndex" :bgrid="true" ></bip-grid-info>
                                            </template>
                                        </vxe-table-column>
                                    </vxe-table-colgroup>
                                </template>
                                <template v-else-if="child_item.child && child_item.child.length >0">
                                    <template v-for="(grandson,idx) in child_item.child">
                                        <vxe-table-colgroup header-align="center" :align="item.align" :key="idx" :title="child_item.title"><!-- 二级表头 -->
                                            <template v-if="grandson.child && grandson.child.length==0">
                                                <vxe-table-colgroup header-align="center" :key="idx" :title="grandson.title"><!-- 三级表头 -->
                                                    <vxe-table-column v-for="(child_cel,idx1) in grandson.cels" :key="idx1" header-align="center" :align="item.align" 
                                                        :field="child_cel.id" :width="widths[child_cel.widthIndex]" :title="child_cel.labelString"
                                                        show-header-overflow :edit-render="{name: 'default'}" show-overflow :disabled="(child_cel.attr&0x40)>0"> <!-- 四级表头 -->
                                                        <template v-slot:edit="{rowIndex}">
                                                            <bip-comm-editor  :cell="child_cel" :cds="cds" :row="rowIndex" :bgrid="true"/> 
                                                        </template>
                                                        <template v-slot="{rowIndex}">
                                                            <bip-grid-info :cds="cds" :cell="child_cel" :row="rowIndex" :bgrid="true" ></bip-grid-info>
                                                        </template>
                                                    </vxe-table-column>
                                                </vxe-table-colgroup>
                                            </template>
                                            <template v-else>
                                                <vxe-table-column :key="idx" header-align="center" :align="item.align"
                                                    :field="grandson.id" :width="widths[grandson.widthIndex]" :title="grandson.labelString"
                                                    show-header-overflow :edit-render="{name: 'default'}" show-overflow :disabled="(grandson.attr&0x40)>0">
                                                    <template v-slot:edit="{rowIndex}">
                                                        <bip-comm-editor  :cell="grandson" :cds="cds" :row="rowIndex" :bgrid="true"/> 
                                                    </template>
                                                    <template v-slot="{rowIndex}">
                                                        <bip-grid-info :cds="cds" :cell="grandson" :row="rowIndex" :bgrid="true" ></bip-grid-info>
                                                    </template>
                                                </vxe-table-column>
                                            </template>
                                        </vxe-table-colgroup>
                                    </template>
                                </template>
                                <template v-else>
                                    <vxe-table-column :key="idx" header-align="center" :align="item.align"
                                        :field="child_item.id" :width="widths[child_item.widthIndex]" :title="child_item.labelString"
                                        show-header-overflow :edit-render="{name: 'default'}" show-overflow :disabled="(child_item.attr&0x40)>0">
                                        <template v-slot:edit="{rowIndex}">
                                            <bip-comm-editor  :cell="child_item" :cds="cds" :row="rowIndex" :bgrid="true"/> 
                                        </template>
                                        <template v-slot="{rowIndex}">
                                            <bip-grid-info :cds="cds" :cell="child_item" :row="rowIndex" :bgrid="true" ></bip-grid-info>
                                        </template>
                                    </vxe-table-column>
                                </template>
                            </template>
                        </template>
                        <template v-else>
                            <vxe-table-column header-align="center" :align="item.align" v-for="(s_cel,idx2) in item.cels" :key="idx2"
                                :field="s_cel.id" :width="widths[s_cel.widthIndex]" :title="s_cel.labelString"
                                show-header-overflow :edit-render="{name: 'default'}" show-overflow :disabled="(s_cel.attr&0x40)>0">
                                <template v-slot:edit="{rowIndex}">
                                    <bip-comm-editor  :cell="s_cel" :cds="cds" :row="rowIndex" :bgrid="true"/> 
                                </template>
                                <template v-slot="{rowIndex}">
                                    <bip-grid-info :cds="cds" :cell="s_cel" :row="rowIndex" :bgrid="true" ></bip-grid-info>
                                </template>
                            </vxe-table-column>
                        </template>
                    </vxe-table-colgroup>
                </template>
                <template v-slot:empty>
                    <el-button type="danger" icon="el-icon-plus" circle style="font-size: 28px;"  @click="addRecord"></el-button>
                </template>
                <template v-if="breport">
                    <vxe-table-column field="" title="操作" fixed="right"  align="center" :width="commBtns2.length*90>300?300:commBtns2.length*90">
                        <template #default="{ rowIndex }">
                            <el-button-group v-if="breport&&commBtns2">
                                <template  v-for="(btn,index) in commBtns2">
                                    <el-button class="bip-menu-bar" :class="btn.type?'bip_btn_'+btn.type:'bip_btn_default'" :key="index" :size="'mini'" @click.native="invokecmd(btn,rowIndex)">     
                                        <template v-if="btn.hasIcon">
                                            <template v-if="btn.icon&&btn.bIconleft">
                                                <i :class="btn.icon"></i>{{btn.name}}
                                            </template>    
                                            <template v-else>
                                                {{btn.name}} <i :class="btn.icon"></i> 
                                            </template>
                                        </template>
                                        <template v-else>
                                            {{btn.name}}
                                        </template>
                                    </el-button>
                                </template>
                            </el-button-group>
                        </template>
                    </vxe-table-column>
                </template>
            </vxe-table>
            <el-drawer append-to-body :visible.sync="addDrawer" direction="btt" size="50%" :withHeader="false" :wrapperClosable="false">
                <div class="myDrawer">
                    <el-scrollbar  v-if="addDrawer" style="height:100%">
                        <base-layout :layout="lay" :env="env" :config={collapseType:1}></base-layout>
                    </el-scrollbar>
                </div>
                <div style="height:15%">
                    <el-row type="flex" justify="center">
                        <!-- <el-button @click="closeDrawer(false)">  取  消  </el-button> -->
                        <el-button size="small" @click="closeDrawer(true)" class="bip_btn_primary">确&nbsp;&nbsp;&nbsp;&nbsp;定</el-button> 
                        <el-button size="small" @click="closeDrawer(false)" class="bip_btn_danger">取&nbsp;&nbsp;&nbsp;&nbsp;消</el-button>
                    </el-row>
                </div>
            </el-drawer>
        </template>
        <!-- 报表展示表格-->
        <template v-else>
            <vxe-table :keep-source="false" class="mytable-scrollbar"
                :ref="this.cds.ccells.obj_id" v-if="isTable" border resizable size="small"
                highlight-hover-row show-all-overflow="tooltip"
                show-header-overflow highlight-current-row
                :data.sync="cds.cdata.data" :optimized="true" :height="height"
                @cell-dblclick="openrefs" @cell-click="table_cell_click"
                @sort-change="sortChange" :sort-config="{trigger: 'cell',remote:true}"
                :span-method="rowspanMethod" row-id="id" :cell-style="cellStyle"
                header-cell-class-name="tableHead"
                :row-class-name="getRowStyleNew"
                @checkbox-change="checkChange" @checkbox-all="checkChange"
                :footer-method="footerMethod2"
                :footer-cell-class-name="footerCellClassName"
                :show-footer="haveFooterSum" @custom="toolbarCustomEvent"
                :loading="table_loading">


                <vxe-table-column v-if="(laycell.cells.attr & 0x40)>0" type="checkbox" width="55" fixed="left"></vxe-table-column>
                <vxe-table-column type="seq" width="55"  fixed="left"></vxe-table-column>

                <!-- 表格三级表头 目前写死三级 -->

                <template v-for="(item,index) in groupCells">
                    <template v-if="!item.child">
                        <vxe-table-column header-align="center" :align="item.align" :field="item.id" :key="index"
                            :min-width="widths[item.widthIndex]" :title="item.labelString" show-header-overflow 
                            :show-overflow="item.editType!=6" :sortable ="(item.attr&0x400000)>0" :fixed="isFixed(item.widthIndex)" >
                            <template v-slot="{rowIndex}"> 
                                <bip-grid-info :cds="cds" :cell="item" :row="rowIndex" :bgrid="true" ></bip-grid-info>
                            </template>
                        </vxe-table-column>
                    </template>
                    <template v-else>
                        <vxe-table-colgroup :title="item.title" header-align="center" :key="index">
                            <template v-if="item.child.length>0">
                                <template v-for="(child_item,idx) in item.child">
                                    <template v-if="child_item.child && child_item.child.length==0">
                                        <vxe-table-colgroup header-align="center"  :key="idx" :title="child_item.title">
                                            <vxe-table-column v-for="(s_cel,idx2) in child_item.cels"
                                            header-align="center" :align="item.align" :field="s_cel.id" :key="idx2"
                                                :min-width="widths[s_cel.widthIndex]" :title="s_cel.labelString" show-header-overflow 
                                                show-overflow :sortable ="(s_cel.attr&0x400000)>0" :fixed="isFixed(s_cel.widthIndex)" >
                                                <template v-slot="{rowIndex}"> 
                                                    <bip-grid-info :cds="cds" :cell="s_cel" :row="rowIndex" :bgrid="true" ></bip-grid-info>
                                                </template>
                                            </vxe-table-column>
                                        </vxe-table-colgroup>
                                    </template>
                                    <template v-else-if="child_item.child && child_item.child.length >0">
                                        <template v-for="(grandson,idx) in child_item.child">
                                            <template v-if="grandson.child && grandson.child.length==0">
                                                <vxe-table-colgroup header-align="center" :key="idx" :title="grandson.title">
                                                    <vxe-table-column v-for="(s_cel,idx2) in grandson.cels"
                                                    header-align="center" :align="item.align" :field="s_cel.id" :key="idx2"
                                                        :min-width="widths[s_cel.widthIndex]" :title="s_cel.labelString" show-header-overflow 
                                                        show-overflow :sortable ="(s_cel.attr&0x400000)>0" :fixed="isFixed(s_cel.widthIndex)" >
                                                        <template v-slot="{rowIndex}"> 
                                                            <bip-grid-info :cds="cds" :cell="s_cel" :row="rowIndex" :bgrid="true" ></bip-grid-info>
                                                        </template>
                                                    </vxe-table-column>
                                                </vxe-table-colgroup>
                                            </template>
                                            <template v-else>
                                                <vxe-table-column header-align="center" :align="item.align" :field="grandson.id" :key="idx"
                                                    :min-width="widths[grandson.widthIndex]" :title="grandson.labelString" show-header-overflow 
                                                    show-overflow :sortable ="(grandson.attr&0x400000)>0" :fixed="isFixed(grandson.widthIndex)" >
                                                    <template v-slot="{rowIndex}"> 
                                                        <bip-grid-info :cds="cds" :cell="grandson" :row="rowIndex" :bgrid="true" ></bip-grid-info>
                                                    </template>
                                                </vxe-table-column>
                                            </template>
                                        </template>
                                    </template>
                                    <template v-else>
                                        <vxe-table-column header-align="center" :align="item.align" :field="child_item.id" :key="idx"
                                            :min-width="widths[child_item.widthIndex]" :title="child_item.labelString" show-header-overflow 
                                            show-overflow :sortable ="(child_item.attr&0x400000)>0" :fixed="isFixed(child_item.widthIndex)" >
                                            <template v-slot="{rowIndex}"> 
                                                <bip-grid-info :cds="cds" :cell="child_item" :row="rowIndex" :bgrid="true" ></bip-grid-info>
                                            </template>
                                        </vxe-table-column>
                                    </template>
                                </template>
                            </template>
                            <template v-else>
                                <vxe-table-column v-for="(s_cel,idx2) in item.cels"
                                    header-align="center" :align="item.align" :field="s_cel.id" :key="idx2"
                                    :min-width="widths[s_cel.widthIndex]" :title="s_cel.labelString" show-header-overflow 
                                    show-overflow :sortable ="(s_cel.attr&0x400000)>0" :fixed="isFixed(s_cel.widthIndex)" >
                                    <template v-slot="{rowIndex}"> 
                                        <bip-grid-info :cds="cds" :cell="s_cel" :row="rowIndex" :bgrid="true" ></bip-grid-info>
                                    </template>
                                </vxe-table-column>
                            </template>
                        </vxe-table-colgroup>
                    </template>
                </template>
            
                <vxe-table-column v-if="commBtns2.length>0&&config.type ==2" field="" title="操作" align="center" fixed="right" :width="commBtns2.length*90>300?300:commBtns2.length*90">
                    <template #default="{row,rowIndex }">
                        <template v-if="(row.c_state&0x80) <=0">
                            <template  v-for="(btn,index) in commBtns2">
                                <el-button :class="[btn.type?'bip_btn_'+btn.type:'bip_btn_default','btn_report']" :key="index" :size="'mini'" @click.native="invokecmd(btn,rowIndex)" >     
                                    <template v-if="btn.hasIcon">
                                        <template v-if="btn.icon&&btn.bIconleft">
                                            <i :class="btn.icon"></i>{{btn.name}}
                                        </template>    
                                        <template v-else>
                                            {{btn.name}} <i :class="btn.icon"></i> 
                                        </template>
                                    </template>
                                    <template v-else>
                                        {{btn.name}}
                                    </template>
                                </el-button>
                            </template>
                        </template>
                    </template>
                </vxe-table-column>
            
            </vxe-table>
            <template v-else>
                <div v-for="(dataIt,rowIndex) in cds.cdata.data" :key="rowIndex" class="accdiv">
                    <el-collapse v-model="activeNames">
                        <el-collapse-item :title="laycell.name" name="1" >
                            <template slot="title">
                                <el-row style="width:100%">
                                    <el-col v-for="(item,index) in laycell.uiCels" :key="index" :xs="24" :sm="24" :md="Math.round(24/cds.ccells.widthCell*item.ccHorCell)" :span="Math.round(24/cds.ccells.widthCell*item.ccHorCell)">
                                        <div v-if="(item.attr & 0x200) >0" class="piece">
                                            <el-row >
                                                <el-col :span="8">
                                                    {{item.labelString}}
                                                </el-col>
                                                <el-col :span="16" style="overflow: hidden;white-space: nowrap;">
                                                    <div @dblclick="cardClick(rowIndex,index,dataIt)">
                                                        <el-popover placement="top" width="160" trigger="hover" >
                                                            <bip-grid-info :cds="cds" :cell="item" :row="rowIndex" :bgrid="true" ></bip-grid-info>
                                                            <bip-grid-info slot="reference" :cds="cds" :cell="item" :row="rowIndex" :bgrid="true" ></bip-grid-info>
                                                        </el-popover>
                                                    </div>
                                                </el-col>
                                            </el-row>
                                        </div>
                                    </el-col>
                                </el-row>
                            </template>
                            <el-row style="width:100%">
                                <el-col v-for="(item,index) in laycell.uiCels" :key="index" :xs="24" :sm="24" :md="Math.round(24/cds.ccells.widthCell*item.ccHorCell)" :span="Math.round(24/cds.ccells.widthCell*item.ccHorCell)">
                                    <div v-if="(item.attr & 0x200) <=0" class="piece">
                                        <el-row>
                                            <el-col :span="8">
                                                {{item.labelString}}
                                            </el-col>
                                            <el-col :span="16" style="overflow: hidden;white-space: nowrap;">
                                                <div @dblclick="cardClick(rowIndex,index,dataIt)">
                                                    <el-popover placement="top" width="160" trigger="hover" >
                                                        <bip-grid-info :cds="cds" :cell="item" :row="rowIndex" :bgrid="true" style="text-align: start;"></bip-grid-info>
                                                        <bip-grid-info slot="reference" :cds="cds" :cell="item" :row="rowIndex" :bgrid="true" ></bip-grid-info>
                                                    </el-popover>
                                                </div>
                                            </el-col>
                                        </el-row>
                                    </div>
                                </el-col>
                            </el-row>
                            <div style="text-align: end;padding-right:5px;">
                                <el-row>
                                    <el-col v-for="(item,index) in cardMenuList" :key="index" :span="4">
                                        <template v-if="item.cmd == 'DLG'">
                                            <el-button :size="item.size" @click.native="invokecmd(item,rowIndex)" :disabled="!item.enable">
                                                {{item.name}}
                                            </el-button>
                                        </template>
                                    </el-col>
                                </el-row>
                            </div>
                        </el-collapse-item>
                    </el-collapse>
                </div>
            </template>
        </template>
        <template v-if="beBill">
            <el-row >
                <el-pagination v-if="!cds.ds_par" 
                    style="text-align: end"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page.sync="cds.page.currPage"
                    :page-size="cds.page.pageSize"
                    :page-sizes="[10, 20, 30,40,50]"
                    layout="slot,total,prev, pager, next,sizes"
                    background
                    :total="cds.page.total">
                    <el-col slot :span="8" :xs="10" :sm="10" :md="8" style="text-align: start;float: left;margin:5px 0px 12px 0px;" >
                        <el-button v-if="canAdd" size="small" class="bip_btn_primary" @click="addRecord">添加</el-button>
                        <el-popover v-if="canDelete" placement="top" width="180" v-model="tableDelPop">
                            <div style="padding:10px">
                                <div>请确认是否删除勾选数据</div>
                                <div style="text-align: right; margin: 0;padding-top:30px">
                                    <el-button size="mini" type="text" @click="tableDelPop = false">取消</el-button>
                                    <el-button type="primary" size="mini" @click="delRecord">删除</el-button>
                                </div>
                            </div>
                            <el-button size="small" slot="reference" class="bip_btn_danger" plain >删除</el-button>
                        </el-popover>
                    </el-col>
                </el-pagination>
                <template v-else>
                    <el-col slot :span="8" :xs="10" :sm="10" :md="8" style="text-align: start;float: left;margin:5px 0px 12px 0px;" >
                        <el-button v-if="canAdd" size="small" class="bip_btn_primary" @click="addRecord">添加</el-button>
                        &nbsp;&nbsp;
                        <el-popover v-if="canDelete" placement="top" width="180" v-model="tableDelPop">
                            <div style="padding:10px">
                                <div>请确认是否删除勾选数据</div>
                                <div style="text-align: right; margin: 0;padding-top:30px">
                                    <el-button size="mini" type="text" @click="tableDelPop = false">取消</el-button>
                                    <el-button type="primary" size="mini" @click="delRecord">删除</el-button>
                                </div>
                            </div>
                            <el-button size="small" slot="reference" class="bip_btn_danger" plain >删除</el-button>
                        </el-popover>
                    </el-col>
                </template>
            </el-row>
        </template>
        <template v-else>
            <el-row type="flex" style="margin-bottom:7px;" v-if="isNoHomeTable" justify="end">
                <el-pagination  
                    background
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page.sync="cds.page.currPage"
                    :page-size="cds.page.pageSize"
                    :page-sizes="[10, 20, 30,40,50]"
                    layout="total,prev, pager, next,sizes,jumper"
                    :total="cds.page.total"
                ></el-pagination>
                </el-row>
        </template>
    </div>
</template>
<script lang="ts">
/**
 * 表格模块
 */
import { DateUtils } from "../../utils/DateUtils";
import { GlobalVariable } from "../../utils/ICL";
import BipScriptProc from "../../classes/pub/BipScriptProc";
import { Component, Vue, Provide, Prop, Watch ,Inject} from "vue-property-decorator";
import BipLayCells from "@/classes/ui/BipLayCells";
import CCliEnv from "@/classes/cenv/CCliEnv";
import CDataSet from "@/classes/pub/CDataSet";
import BipGridInfo from "../editorn/grid/BipGridInfo.vue";
import {CommICL} from '@/utils/CommICL'
let ICL = CommICL
import { BipLayout } from "@/classes/ui/BipLayout";
import QueryEntity from '@/classes/search/QueryEntity';
import { BIPUtil } from "@/utils/Request"; 
import { BipMenuBtn } from '@/classes/BipMenuBtn';
let tools = BIPUtil.ServApi
import { State, Action, Getter, Mutation } from 'vuex-class';
import CRecord from '../../classes/pub/CRecord';
import { BIPUtils } from "@/utils/BaseUtil";
let baseTool = BIPUtils.baseUtil;
import XEUtils from 'xe-utils'
let _ = require('lodash')
// import GroupTableHeader from '@/components/layout/LayTableHeader/GroupTableHeader.vue'
@Component({
    components: {  BipGridInfo}
})
export default class LayCelVexTable extends Vue {
    @Prop() laycell!: BipLayCells;
    @Prop() cds!: CDataSet;
    @Prop() pbuid!: string;
    @Prop() beBill!: boolean;
    @Prop() env!:CCliEnv;
    @Prop() config!:any

    activeNames:any = ['1'];
    height:string = "450px";
    info: string = "infos";
    clearable: boolean = true;
    widths: Array<string> = new Array<string>();
    id: string = "";
    fixedColumn:number=0;//固定列数
    span_id:any={};//合并列id
    sum_id:any={};//合计列id
    celClickTime:number =0;
    removeData :Array<CRecord> =[];
    rowClass:any = {};
    isTable:boolean = false;
    cardMenuList:any = []; 
    addDrawer:boolean = false;//子表抽屉样式添加
    lay: BipLayout = new BipLayout("");
    drawerCurrRecord:CRecord = new CRecord();//子表抽屉样式时  当前选中行  用来处理 抽屉中 取消 操作
    breport:boolean = false
    @State("aidValues", { namespace: "insaid" }) aidValues: any;
    @Action("fetchInsAid", { namespace: "insaid" }) fetchInsAid: any;
    @Mutation("setAidValue", { namespace: "insaid" }) setAidValue: any;
    @Mutation("setAidInfo", { namespace: "insaid" }) setAidInfo: any;
    
    datachangeBusID:number=0;
    tableShapeBusID:number=0;
    findBtnBusID:number=0;
    heightChangeSID:number=0;
    groupCells:any = [];

    multiple:boolean = false;//是否是多选
    checkSelected:any = [];//当前页选中行集合
    multipleSelectionAll:Array<any> = [];// 所有选中的数据包含跨页数据

    @Inject('isNoHomeTable') isNoHomeTable!:boolean;//显示分页
    @Inject('heightInfo') heightInfo!:any;
    canAdd:boolean = true;//是否可以增加
    canDelete:boolean = true;//是否可以删除
    tableDelPop:boolean = false;//表格删除确认

    haveFooterSum:boolean = false;//表尾合计
    footerCellKey:any=[];//合计字段
    footerCell:any=[];//合计字段对象

    commBtns:Array<any> = []
    commBtns2:Array<any> = []//表身按钮

    table_loading:boolean=false;//表格加载动画

    //初始化表格按钮
    makeCommBtns(){
        this.commBtns=[];
        this.commBtns2=[];
        let mbs = this.env.mbs.menuList

        _.forEach(mbs,(item:any) => {
            if( item.cmd == 'DLG'){
                if((this.cds.ccells.attr & 0x40 )>0){
                    this.commBtns.push(item)
                }else{
                    this.commBtns2.push(item)
                }
            }else{
                if(item.cmd != 'SAVE' && item.cmd != 'DEL'){
                    this.commBtns.push(item)
                }else{
                    this.commBtns2.push(item)
                }
                if((this.laycell.cells.attr & 0x40)>0&&item.cmd == 'DEL'){
                    this.commBtns.push(item)
                }
            }
        });
    }

    async created() {
        this.footerCell = {};
        this.footerCellKey = [];
        if((this.laycell.cells.attr & 0x40)>0){//多选
            this.multiple = true;
        }
        if((this.laycell.cells.attr & 0x1)>0){//禁删除
            this.canDelete = false;
        }
        if((this.laycell.cells.attr & 0x4)>0){//禁增加
            this.canAdd = false;
        }
        if((this.laycell.cells.attr & 0x8)>0){//只读
            this.canDelete = false;
            this.canAdd = false;
        }
        if(!this.cds.ds_par){
            this.canDelete = false;
            this.canAdd = false;
        }
        //组成多表头
        this.initTableTitleGroup();
        if(this.config){
            if(this.config.type ==2){
                if(this.heightInfo)
                    this.height = (this.heightInfo.height-114)+"px";
                else
                    this.height = "450px"
            }else if(this.config.type ==3){
                this.height = "250px"
            }
        }else{
            // this.config = {type :2};
        }
        this.initSfix();
        this.initWidth();
        // this.cds = this.env.getDataSet(this.laycell.obj_id);
        this.breport = !this.env.uriParams.beBill;
        if(this.cds.x_pk>-1)
            this.id = this.laycell.cells.cels[this.cds.x_pk].id;
        if (!this.id) {
            this.id = this.laycell.cells.cels[0].id;
        }
        this.menuChange();
    }

    /**
     * 获取表格关联属性
     */
    async getCellLinks(){
        let cells = this.cds.ccells.cels;
        for(let i=0;i<cells.length;i++){
            let item:any = cells[i];
            let index = i;
            if((item.attr&0x80000)>0){
                let item1:any = cells[i+1];
                let im1_id = item1.id;
                if(im1_id.indexOf(".")>-1){
                    im1_id = im1_id.substring(im1_id.indexOf(".")+1)
                }
                if(item1&&(im1_id=='sbuid' || im1_id.startsWith('slkbuid'))){
                    let slkbuidCell :any=cells[index+1];
                    let btn = new BipMenuBtn(item.id,slkbuidCell.labelString)
                    btn.setType("primary");
                    btn.setIconFontIcon('EDIT');
                    btn.setDlgType('SL');
                    this.commBtns2.push(btn);
                }else{
                    let name = "BL_"+this.cds.ccells.obj_id+"_"+item.id;
                    let data:any = await this.initCL(name);
                    if(data){
                        let btn = new BipMenuBtn(item.id,data.sremark)
                        btn.setType("primary");
                        btn.setIconFontIcon('EDIT');
                        btn.setDlgType('BL');
                        this.commBtns2.push(btn);
                    }
                }
            }
      
        }
    }
    /**
     * 表头最加样式
     */
    headerCellStyle(column:any){
        let celid = column.column.property;
        for(var i=0;i<this.laycell.uiCels.length;i++){
            let cel:any = this.laycell.uiCels[i];
            if(cel && cel.id == celid){
                if((cel.attr & 0x2) >0){
                    return { color: 'red' }
                }
            }
        }
    }
    /**
     * 表尾合计
     */
    footerMethod({ columns, data }:any) {
        if(this.footerCellKey.length<=0){
            return [];
        }
        let _data:any = [];
        for(var i=0;i<data.length;i++){
            _data.push(data[i].data)
        }
        const sums:any = []
        let _this = this;
        columns.forEach((column:any, columnIndex:any) => {
            if (columnIndex === 0) {
                sums.push('合计')
            } else {
                let sumCell:any = null
                if(_this.footerCellKey.indexOf(column.property)!=-1) { 
                    sumCell = XEUtils.sum(_data, column.property)
                    sumCell = parseFloat(sumCell).toFixed(this.footerCell[column.property].ccPoint);
                    if(isNaN(sumCell)){
                        sumCell = 0 ;
                    }
                }
                sums.push(sumCell)
            }
        })
        // 返回一个二维数组的表尾合计
        return [sums]
    }

    //报表表尾合计
    footerMethod2({ columns, data }:any){
        if(this.cds.hjList.length>0){
            if(this.env.uriParams.pclass && this.env.uriParams.pclass.indexOf("inetbas.cli.systool.CRptTool")>-1){
                return this.footerMethod({columns, data})
            }else{
                const sums:any = []
                let sumData = this.cds.cdata.sumData;
                columns.forEach((column:any, columnIndex:any) => {
                    if (columnIndex === 0) {
                        sums.push('合计')
                    } else {
                        let sumCell:any = null
                        if(this.cds.hjList.indexOf(column.property)!=-1) { 
                            sumData.forEach((smd:any) => {
                                if(smd.ccName == column.property){
                                    sumCell = smd.initval
                                }
                            });
                            sumCell = parseFloat(sumCell).toFixed(this.footerCell[column.property].ccPoint);
                            if(isNaN(sumCell)){
                                sumCell = 0;
                            }
                        }
                        sums.push(sumCell)
                    }
                })
                return [sums]
            }
        }else{
            return []
        }
    }
    /**
     * 表尾单元格class
     */
    footerCellClassName(column:any){
        let align = column.column.align;
        if(align){
            return "bip-text-align-"+align;
        }else{
            let index = column.itemIndex;
            if(this.cds.ds_par){
                index--;
            }
            if(index<0){
                return "bip-text-align-left";
            }
            let cel:any = this.laycell.uiCels[index];
            align = cel.align;
            if(align){
                return "bip-text-align-"+align;
            }
        }
    }
    /**
     * 报表内容单元格样式
     */
    cellStyle(column:any){
        let columnIndex = column.columnIndex;
        let _columnIndex = column._columnIndex
        if(!_columnIndex){
            _columnIndex  = columnIndex
        }
        columnIndex = _columnIndex - 1;
        if((this.laycell.cells.attr & 0x40)>0){
            columnIndex--;
        }
        let cel:any = this.laycell.uiCels[columnIndex];
        if(cel){
            if((cel.attr & (0x80000)) >0){
                return { color: '#20a0ff',cursor:'pointer' }
            }
        }
    }

    async addRecord() {
        if(this.cds.currCanEdit()){
            if(this.cds.cdata.data.length>0){
                let bok = this.checkNotNull(this.cds); 
                if(!bok)
                    return ; 
            }
            //判断是否是第一次新建
            if(this.cds.cdata.data.length ==0){
                // 第一次新建 判断一下sctrl 是否是需要中常量中取数
                let cc:boolean = await this.init9DData();// 返回false 继续执行之后的程序  返回true 跳出添加方法
                if(cc){
                    if(!this.isTable)
                        this.openDrawer();
                    if(this.cds.ds_par){//处理 合计字段
                        let cels = this.cds.ccells.cels;
                        cels.forEach(cel => {
                            if((cel.attr & 0x2000)>0){
                                this.cds.checkGS(cel)
                            }
                        });
                    }
                    return ;
                }
            }
            await this.cds.createRecord();
            let cc:any = this.$refs[this.cds.ccells.obj_id];
            if(cc){ 
                cc.clearCurrentRow();
                cc.setCurrentRow(this.cds.currRecord);
                cc.syncData();
            }
            
            this.openInitEdit();
            this.cds.currRecord.c_state |= 2;
            if(this.cds.ds_par){
                this.cds.ds_par.currRecord.c_state |= 2;
            }
            if(!this.isTable)
                this.openDrawer();
            if(this.cds.ds_par){//处理 合计字段
                let cels = this.cds.ccells.cels;
                cels.forEach(cel => {
                    if((cel.attr & 0x2000)>0){
                        this.cds.checkGS(cel)
                    }
                });
            }
        }
    }
    /**
     * 处理对象上  控制字段中的 `9D = 常量
     */
    async init9DData(){
        let bool = false;
        let sctrls = this.cds.ccells.sctrl;
        if(sctrls){
            let cc = sctrls.split(";");
            for(var i=0;i<cc.length;i++){
                let oneSc = cc[i];
                if(oneSc.indexOf('`9D')!=-1){
                    bool = true;
                    oneSc = oneSc.split('=')[1];
                    let data = await this.initCL(oneSc);
                    if(data && data.values.length >0){
                        let value = data.values;
                        let slink = data.slink;
                        slink = slink.substring(slink.indexOf("{")+1,slink.indexOf("}"))
                        let kvArr = slink.split(",");
                        for(var i=0;i<value.length;i++){
                            let vl = value[i];
                            this.cds.createRecord();
                            for(var key in this.cds.currRecord.data){
                                let cel:any = this.cds.getCell(key)
                                if(cel.initValue){
                                    this.cds.currRecord.data[key] = '';
                                }
                            }
                            for(var j =0;j<kvArr.length;j++){
                                let kv = kvArr[j].split("=");
                                this.cds.currRecord.data[kv[0]] = vl[data.cells.cels[kv[1]].id]
                            }
                            this.cds.checkAllGS();
                            let cc:any = this.$refs[this.cds.ccells.obj_id];
                            if(cc){ 
                                cc.setCurrentRow(this.cds.currRecord); 
                            }
                        }
                        this.cds.currRecord.c_state |= 2;
                        if(this.cds.ds_par){
                            this.cds.ds_par.currRecord.c_state |= 2;
                            let cels = this.cds.ccells.cels;
                            for(var i=0;i<cels.length;i++){
                                let cel = cels[i];
                                let script = cel.script;
                                if(script && script.indexOf("^") !=-1){
                                    let _id = script.substring(script.indexOf("^")+1,script.length-1);
                                    this.cds.checkGSByParID(_id);
                                }
                            }
                        }
                    }else{
                        bool = false;
                    }
                }
            }
        }
        return bool;
    }
    delRecord(){
        this.tableDelPop = false;
        if(this.cds.currCanEdit() && this.removeData.length>0){
            this.cds.cdata.rmdata = this.removeData;
            for(var i=this.cds.cdata.data.length-1;i>=0;i --){
                let data = this.cds.cdata.data[i];
                for(var j =0;j<this.removeData.length;j++){
                    let rem = this.removeData[j];
                    if(rem.id == data.id){
                        this.cds.cdata.data.splice(i,1); 
                        this.cds.setState(2);
                    }
                }
            }
            let xinc = -1;
            if (this.cds.ccells.pkindex) xinc = this.cds.ccells.pkindex[0];
            if (xinc >= 0) {
                let cel = this.cds.ccells.cels[xinc];
                let s0 = cel.psAutoInc;
                if (s0 == null || s0 == undefined || s0.length < 1 || cel.type !== 12) {
                    for(var i=0;i<this.cds.cdata.data.length;i++){
                        let oldKey = this.cds.cdata.data[i].data[cel.id];
                        if(!this.cds.cdata.data[i].oldpk){
                            this.cds.cdata.data[i].oldpk = [];
                        }
                        this.cds.cdata.data[i].oldpk.push(oldKey);
                        this.cds.cdata.data[i].data[cel.id] = i + 1
                        this.cds.cdata.data[i].c_state |= 16;
                    }
                }
            }
            let cc:any = this.$refs[this.cds.ccells.obj_id];
            if(cc){
                if(this.cds.currRecord){
                    setTimeout(() => {
                        // cc.refreshData();
                        cc.clearCurrentRow()
                    }, 200);
                }
            }
            this.cds.currRecord.c_state |= 2;
            if(this.cds.ds_par){
                this.cds.ds_par.currRecord.c_state |= 2;
                let cels = this.cds.ccells.cels;
                cels.forEach(cel => {
                    if((cel.attr & 0x2000)>0){
                        this.cds.checkGS(cel)
                    }
                });
            }
        }
    }
    initWidth() {
        if (this.laycell) {
            this.laycell.uiCels.forEach(cel => {
                if (cel.isShow) {
                    let w1 = cel.ccCharleng;
                    if (!cel.id.startsWith("cid")) {
                        w1 = w1 < 10 ? 8 : w1;
                    }
                    let w = w1 * 9 + 20;
                    if (w > 200) w = 200;
                    this.widths.push(w + "");
                    if((cel.attr &0x2000) >0){
                        this.footerCellKey.push(cel.id)
                        this.footerCell[cel.id] = cel;
                        this.haveFooterSum = true;
                    }
                }
            });
        }
    }

    getNumChar(cell: any): number {
        let cn = cell.ccCharleng;
        return cn;
    }

    rowActive(rowInfo: any, event: any) {
        this.cds.currRecord = this.cds.getRecordAtIndex(rowInfo.rowIndex);
        this.cds.index = rowInfo.rowIndex;
    }

    editClose(rowInfo: any, event: any) {
        this.cds.currRecord = this.cds.getRecordAtIndex(rowInfo.rowIndex);
    }

    activeMethod() {
        if((this.cds.ccells.attr & 0x8 )>0){
            return false;
        }
        return true;
    }

    handleSizeChange(value: number) {
        if(this.multiple){
            this.changePageCoreRecordData();
        }
        if(this.cds.currRecord &&　(this.cds.currRecord.c_state&1)>0){
            return ;
        }
        this.cds.cdata.clearValues();
        this.table_loading = true;
        this.$emit("handleSizeChange", value);
    }

    handleCurrentChange(value: number) {
        if(this.multiple){
            this.changePageCoreRecordData();
        }
         if(this.cds.currRecord && (this.cds.currRecord.c_state&1)>0){
            return ;
        }
        this.cds.cdata.clearValues();
        this.cds.clear();
        this.table_loading = true;
        this.$emit("handleCurrentChange", value);
    }
    /**排序发生变化 */
    sortChange(column:any){
        let orderby = column.property+" "+column.order;
        this.$emit("sortChange", orderby);
    }
    async cardClick(rowIndex:any,index:any,data:any){
        let data1 = {rowIndex:rowIndex,columnIndex:index+1,row:{data:data.data}};
        await this.openrefs(data1,null)
    }
    /** 
     * 字段点击进行跳转操作
     */
    async openrefs(data:any,event:any){
        this.cds.currRecord = this.cds.getRecordAtIndex(data.rowIndex);
        let row = data.row.data
        let columnIndex = data.columnIndex
        if(columnIndex >= 0){
            let cell = data.cell
            if(!cell){
                cell = this.laycell.uiCels[columnIndex]
                if(!this.beBill){
                    cell = this.laycell.uiCels[columnIndex-1]
                    if((this.laycell.cells.attr & 0x40)>0){
                        cell = this.laycell.uiCels[columnIndex-2]
                    }
                }else{
                    if(this.cds.ds_par){
                        cell = this.laycell.uiCels[columnIndex-1]
                    }
                }
            }
            if( (cell.attr & 1) >0 || (cell.attr & (0x80000)) >0 ) { // 0主键   0x80000关联
                let slkid = row[cell.id];
                if ((cell.attr & 0x80000) > 0) {//关联
                    let allCels = this.laycell.cells.cels;
                    let slkbuidCell = null;
                    for(var i=0;i<allCels.length;i++){
                        let oneCel = allCels[i];
                        if(oneCel.id == cell.id){
                            slkbuidCell = allCels[i+1];
                            break;
                        }
                    } 
                    let slkbuid = ''
                    if(slkbuidCell)
                        slkbuid = row[slkbuidCell.id];
                    let bl_data = null;//获取常量定义的 BL_菜单参数_字段ID 进行菜单打开
                    let name = "BL_"+this.cds.ccells.obj_id+"_"+cell.id;
                    bl_data = await this.initCL(name);
                    if(bl_data == null || bl_data == undefined){
                        await this.openRefsDo(slkid , slkbuid);
                    }else{
                        //BL字段点击
                        let slink = bl_data.slink;
                        if(slink){
                            slink = slink.split("&");
                            let menuid = slink[0]
                            let me = baseTool.findMenu(menuid);
                            if (!me) {
                                this.$notify.error( "没有" + menuid + "菜单权限!" );
                                return false;
                            }else{
                                let jsontj:any={};
                                for(var i=1;i<slink.length;i++){
                                    let oneTJ = slink[i].split("=")
                                    let key = oneTJ[0];
                                    let vl = oneTJ[1]
                                    if(vl.indexOf("*") !=-1 ){
                                        let cds = this.env.getDataSet(vl.split("*")[0]);
                                        vl = cds.currRecord.data[vl.split("*")[1]]
                                    }else{
                                        vl = this.cds.currRecord.data[vl]
                                    }
                                    jsontj[key] = vl;
                                }

                                let command = me.command.split("&");
                                let pbuid = command[0].split("=");
                                let pmenuid = command[1].split("="); 
                                this.$router.push({
                                    path:'/layout',
                                    name:'layout',
                                    params:{method:"BL",pmenuid:pmenuid[1],jsontj:jsontj },
                                    query: {pbuid:pbuid[1],pmenuid:pmenuid[1]},
                                })
                            }
                        }
                    }
                }else{
                    console.log('主键点击')
                }
            }else{
                //判断是否是行关联
                if(baseTool.bitOperation(this.laycell.cells.attr,0x1000000000)>0){
                    let pk = this.laycell.cells.pkindex;
                    cell = this.laycell.cells.cels[pk[0]]
                    let slkid = row[cell.id];  
                    let slkbuidCell = this.laycell.cells.cels[pk[0]+1]
                    let slkbuid = row[slkbuidCell.id];
                    await this.openRefsDo(slkid , slkbuid);
                }
            }
        }
    }
    async openRefsDo(slkid:any,slkbuid:any){
        if (slkid && slkbuid) { 
            //获取业务定义
            let param = await tools.getBULinks(slkbuid);
            if(param.data.id ==0){
                let opera = param.data.data.opt;
                if (opera&&!opera.pmenuid) {
                    this.$notify.error("业务" + slkbuid + "没有绑定菜单!"); 
                    return false;
                }
                let me = baseTool.findMenu(opera.pmenuid);
                if (!me) {
                    this.$notify.error( "没有" + opera.pmenuid + "菜单权限!" );
                    return false;
                }else{
                    let command = me.command.split("&");
                    let pbuid = command[0].split("=");
                    let pmenuid = command[1].split("="); 
                    let res = await tools.getMenuParams(pbuid[1],pmenuid[1]);
                    if (res.data.id === 0) {
                        let uriParams = res.data.data.mparams;
                        let dialog = uriParams.pbds["Dialog"]
                        if(dialog){
                            let param = {
                                childDlg_width:dialog,
                                childDlg_title:me.menuName,
                                obj_id:this.cds.ccells.obj_id,
                                router:{
                                    path:'/layoutDlg',
                                    name:'layoutDlg',
                                    params:{method:"pkfld",pkfld:opera.pkfld,value:slkid},
                                    query: {pbuid:pbuid[1],pmenuid:pmenuid[1],time:new Date().getTime()},
                                }
                            };
                            this.$bus.$emit("openChildDlg",param);
                            return;
                        }
                    }
                    this.$router.push({
                        path:'/layout',
                        name:'layout',
                        params:{method:"pkfld",pkfld:opera.pkfld,value:slkid},
                        query: {pbuid:pbuid[1],pmenuid:pmenuid[1]},
                    })    
                }
            }  
        }
    }

    table_cell_click(data:any,event:any){
        if(data.column.title == '操作')
            return;
        let rowChange = false;
        if(this.cds.index != data.rowIndex){
            rowChange = true;
        }
        this.cds.index = data.rowIndex;
        let value = {row:data.row,rowIndex:data.rowIndex,columnIndex:data.columnIndex,dsm:this.cds};
        let curr = this.cds.getRecordAtIndex(data.rowIndex);
        this.cds.currRecord = curr;
        this.$bus.$emit("row_click",value);
        if(rowChange){
            this.cds.checkCelUi();
        }
    }
    invokecmd(btn:any,rowIndex:any){
        if(btn.dlgType == 'SL'||btn.dlgType == 'BL'){
            let cr = this.cds.getRecordAtIndex(rowIndex);
            let _col:number = this.laycell.uiCels.findIndex((cel:any)=>{
                return cel.id == btn.cmd;
            });
            let cell = null;
            if(_col<0){
                _col = this.laycell.cells.cels.findIndex((cel:any)=>{
                    return cel.id == btn.cmd;
                });
                if(_col<0){
                    return;
                }
                cell = this.laycell.cells.cels[_col];
            }
            let _col2 = _col;
            if(!this.beBill){
                _col2 = _col+1;
                if((this.laycell.cells.attr & 0x40)>0){
                    _col2 = _col+2;
                }
            }
            this.cds.currRecord = cr;
            let data1 = {rowIndex:rowIndex,columnIndex:_col2,row:{data:cr.data},cell:cell};
            this.openrefs(data1,null)
        }else{
            this.cds.index = rowIndex;
            this.cds.currRecord = this.cds.getRecordAtIndex(rowIndex);
            if((this.cds.ccells.attr & 0x40 )<=0){
                this.cds.currRecordArr = [this.cds.currRecord];
                if(btn.cmd =='DEL'){
                    this.table_loading = true;
                }
            }else{
                if(this.cds.currRecordArr && this.cds.currRecordArr.length>0){
                    if(btn.cmd =='DEL'){
                        this.table_loading = true;
                    }
                }
            }
            this.$emit("invokecmd",btn)
        }

    }

    checkChange(data:any){
        this.checkSelected =  data.records;
        let cc:any = this.$refs[this.cds.ccells.obj_id];
        if(cc){
            setTimeout(() => {
                cc.setCurrentRow(this.cds.cdata.data[data.rowIndex]);
            }, 200);
        }
        this.changePageCoreRecordData();
        this.cds.currRecordArr = this.multipleSelectionAll;
    }
    /**current 发送变化  键盘事件 暂未用到 */
    current_change(data:any,event:any){ 
        this.table_cell_click(data,event)
    }

    selectChangeEvent (data:any) {
        this.removeData = data.records;;
        for(var i=0;i<this.removeData.length;i++){
            this.removeData[i].c_state =4;
        }
    }

    /**
     * BL_菜单参数_字段ID 定义
     */
    async initCL(name:string){
        let str = name
        str = ICL.AID_KEYCL+str;
        let eq = new QueryEntity('','');
        if(this.cds.ds_par){
            eq.pcell = this.cds.ds_par.ccells.obj_id
            eq.cont = JSON.stringify(this.cds.ds_par.currRecord.data)
        }
        let vars = {id:300,aid:name,eq:eq}
        await this.fetchInsAid(vars);
        let vv  = window.sessionStorage.getItem(str)
        if(vv){
            let vals = {key:str,value:JSON.parse(vv)}
            this.setAidValue(vals)
        }
        return this.aidValues.get(str);
    }
    mounted(){ 
        let pbds = this.env.uriParams.pbds;
        if(pbds.layout && pbds.layout == 'card'){
            this.isTable = false;
        }else{
            this.isTable = true;
        }
        this.datachangeBusID = this.$bus.$on('tableDatachange',this.datachange)
        this.tableShapeBusID = this.$bus.$on('ReportTableShape',this.ReportTableShape);
        this.findBtnBusID = this.$bus.$on('findBtnClick',this.findBtnClick);
        this.heightChangeSID = this.$bus.$on('totalHChange',this.totalHChange);
    }

    totalHChange(){
        this.$nextTick(()=>{
        if(this.heightInfo){
                this.height = (this.heightInfo.height-114)+"px";
            }
        })
    }
    beforeDestroy(){
        this.$bus.$off('tableDatachange',this.datachangeBusID)
        this.$bus.$off('ReportTableShape',this.tableShapeBusID)
        this.$bus.$off('findBtnClick',this.findBtnBusID)
        this.$bus.$off('totalHChange',this.heightChangeSID)
    }
    findBtnClick(obj_id:string =''){
        this.multipleSelectionAll=[];
        this.checkSelected=[];
        this.cds.currRecordArr=[];
        this.datachange(obj_id);
    }

    datachange(obj_id:string =''){
        if(this.cds.ccells)
        if(obj_id == this.cds.ccells.obj_id){
            let cc:any = this.$refs[this.cds.ccells.obj_id];
            if(cc){
                cc.clearCurrentRow();
                if(this.cds.currRecord && Object.keys(this.cds.currRecord.data).length>0){
                        // cc.syncData();
                        // cc.reloadData(this.cds.cdata.data)
                        if(this.isNoHomeTable){
                            cc.setCurrentRow(this.cds.currRecord);
                        }
                        // cc.toggleRowSelection(this.cds.currRecord);
                        // this.checkChange({selection:[this.cds.currRecord],rowIndex:0})
                }else{
                    cc.clearCurrentRow();
                }
                cc.refreshColumn();
            }
            this.table_loading = false;
        }
        // this.rowCheckGS();
    }
    async rowCheckGS(){
        for(var i=0;i<this.cds.cdata.data.length;i++){
            let crd = this.cds.getRecordAtIndex(i);
            let scriptProc = new BipScriptProc(crd, this.cds.ccells);
            for(var i =0;i< this.cds.ccells.cels.length;i++){
                let col:any = this.cds.ccells.cels[i];
                let scstr = col.script;
                if (scstr && scstr.indexOf("=:") === 0) {
                    scstr = scstr.replace("=:", "");
                    // 公式计算
                    var vl:any = "";
                    if(scstr.indexOf("=:sql")>0){
                        let res:any = await BIPUtil.ServApi.execClientGsSQL(this.cds.ccells.obj_id,this.cds.currRecord,col.id)
                        if(res.data.id == 0){
                            vl =  res.data.data.data
                        }else{
                            vl =  "";
                        }
                    }else{
                        vl  = scriptProc.execute(scstr, "", col);
                    }
                    if (vl instanceof Array) {
                    } else {
                        if (vl == "Invalid date") {
                            let dd = DateUtils.DateTool.now();
                            if (col.type == 91) {
                                crd.data[col.id] = DateUtils.DateTool.getDate(dd,GlobalVariable.DATE_FMT_YMD);
                            } else {
                                crd.data[col.id] = dd;
                            }
                        } else {
                            crd.data[col.id] = vl;
                        }
                    } 
                }
                if(scstr){
                    if(col.initValue && (col.attr &0x80 )>0){
                        if(col.initValue.indexOf("%") >0 ){
                            let scval = "%";
                            if(crd.data[scstr]){
                            scval = crd.data[scstr];
                            }
                            let vl = col.initValue.replace("%",scval);
                            crd.data[col.id] = vl;
                        }
                    }
                }
            }
            // }); 
        }
    }
    /**解析分组字段 目前只解析了固定表头 */
    initSfix(){
        let sfix = this.cds.ccells.sfix;
        this.fixedColumn =0;
        if(sfix){
            let num:string = '';
            if(sfix.indexOf("/") >=0){
                num = sfix.substring(0,sfix.indexOf("/") )
            }else{
                if(sfix.indexOf("&") >=0){ 
                num = "0";
                }else{
                num = sfix;
                }
            }
            this.fixedColumn = parseInt(num);
          }
    }
    //固定列
    isFixed(index:number) {
      if (this.cds.ccells.sfix) {
        if (index < this.fixedColumn) {
          return "left";
        }
      }
    }
    //合并行或列，该函数 Function({seq, row, rowIndex, column, columnIndex, data}) 返回计算后的值
    rowspanMethod (row:any) {  
        let $rowIndex = row.$rowIndex;
        let data = row.data;
        let column = row.column;
        if(this.span_id !=null){ 
            var arr = Object.keys(this.span_id);
            if(arr.length ==0){
            let cels = this.cds.ccells.cels;
            for(var i=0 ;i<cels.length;i++){
                let cel = cels[i];
                if((cel.attr & 0x10000000)>0){
                this.span_id[cel.id]=cel.id;
                }
            }
            var arr = Object.keys(this.span_id);
                if(arr.length ==0){ 
                    this.span_id =null;
                    return;
                }
            }
            let prevRow = data[$rowIndex - 1]
            let nextRow = data[$rowIndex + 1]
            if (this.span_id[column.property]) {
                let cellValue = row.row.data[column.property]
                if (prevRow && prevRow.data[column.property] === cellValue) {
                    return {rowspan: 0,colspan: 0}
                }else{
                    let countRowspan = 1
                    while (nextRow && nextRow.data[column.property] === cellValue) {
                        nextRow = data[++countRowspan + $rowIndex]
                    }
                    if (countRowspan > 1) {
                        return { rowspan: countRowspan, colspan: 1 }
                    }
                }
            }
        }
    } 
    /**
     * 表格工具栏点击
     */
    toolbarCustomEvent(params:any){
        let cc:any = this.$refs[this.cds.ccells.obj_id];
        if(cc){
            switch (params.type) {
                case 'confirm': {
                    cc.syncData();
                    break
                }
                case 'reset': {
                    cc.syncData();
                    break
                }
                case 'close': {
                    cc.syncData();
                    break
                }
            }
        }
    }
    /**
     * 初始化行调用的辅助
     */
    openInitEdit(){
        for(var i=0;i<this.laycell.uiCels.length;i++){
            let cel = this.laycell.uiCels[i];
            if(baseTool.bitOperation(cel.attr,0x20000000000)>0){
                let cc:any = this.$refs[this.cds.ccells.obj_id];
                if(cc){
                    if(this.cds.currRecord){
                        setTimeout(() => {
                            cc.setActiveCell(this.cds.currRecord,cel.id);
                        }, 200);
                    }
                }
                break;
            }
        }
    }
    //表头分组解析
    initTableTitleGroup(){
        let sfix = this.laycell.cells.sfix;
        let titles=[];
        if(sfix){
            let arr = sfix.split("&")
            sfix = arr[arr.length-1];
            let group = sfix.split(";")
            for(var i=0;i<group.length;i++){
                let g1 = group[i];
                let oneG = g1.split(",");//day2,0,2,1,下班时间 || day2,0,day3,1,下班时间
                let cels = [];
                let labes = [];
                let num:number = parseInt(oneG[2]);
                let j:any = parseInt(oneG[0]);
                if(isNaN(j)){
                    j = this.laycell.uiCels.findIndex((item:any)=>{
                        return item.id == oneG[0]
                    });
                }
                if(isNaN(num)){
                    let canAdd = false;
                    for(var z =0;z<this.laycell.uiCels.length;z++){
                        let cc:any = this.laycell.uiCels[z];
                        cc.widthIndex = z
                        cc.align = this.getCleeAlign(cc);
                        if(canAdd){
                            cels.push(cc)
                            labes.push(cc.id)
                        }
                        if(cc.id == oneG[0]){
                            canAdd = true;
                            cels.push(cc)
                            labes.push(cc.id)
                        }
                        if(cc.id == oneG[2]){
                            break;
                        }
                    }
                }
                for(var p=0;p<num;p++){
                    let cc:any = this.laycell.uiCels[j+p];
                    cc.widthIndex = j+p;
                    cc.align = this.getCleeAlign(cc);
                    cels.push(cc);
                    labes.push(cc.id)
                }
                let row:any ={cels:cels,id:labes,child:[],title:oneG[4]}
                if(oneG[1] == '0'){
                    titles.push(row);
                }else if(oneG[1] == '1'){
                    titles[titles.length-1].child.push(row);
                }else if(oneG[1] == '2'){
                    titles[titles.length-1].child[titles[titles.length-1].child.length-1].child.push(row);
                }
            }
        }
        //检查主子结构数量是否一致
        for(let i=0;i<titles.length;i++){
            let cel = titles[i];
            if(cel.child && cel.child.length>0){
                let child_id:any = [];
                cel.child.forEach((element:any) => { 
                    child_id = child_id.concat(element.id);
                });
                if(child_id.length < cel.id.length){//主子结构数量不一致
                    let cels:any = cel.cels;
                    let isLast = true;
                    for(var z=0;z<cel.id.length;z++){
                        if(cel.id[z] != child_id[z]){
                            if(z==0){
                                isLast = false;
                            }
                            let cel1:any=null;
                            for(var k=0;k<cels.length;k++){
                                if(cels[k].id == cel.id[z]){
                                    cel1 = cels[k]
                                }
                            }
                            cel1.align = this.getCleeAlign(cel1);
                            if(isLast){
                                titles[i].child.push(cel1)
                            }else{
                                titles[i].child.unshift(cel1)
                            }
                            child_id.unshift(cel.id[z])
                        }
                    }
                }
            }
        }
        let uiCels = [];
        let groupCelId:any = [];
        for(let i=0;i<this.laycell.uiCels.length;i++){
            let cel:any = this.laycell.uiCels[i];
            cel.widthIndex = i;
            cel.align = this.getCleeAlign(cel);
            if(titles.length>0){
                if(titles[0].id.indexOf(cel.id)!=-1){
                    uiCels.push(titles[0]);
                    groupCelId = groupCelId.concat(titles[0].id);
                    titles.splice(0,1)
                    continue;
                }
            }
            if(groupCelId.indexOf(cel.id) == -1){
                uiCels.push(cel);
            }
        }
        this.groupCells = uiCels
    }
    //字段对齐方法
    getCleeAlign(cell:any){
        let chkRule = cell.chkRule
        let align = "left";
        if(chkRule){
            if(chkRule.indexOf("&") >0){
                let type:any = chkRule.split("&")[0];
                type = parseInt(type);
                if(type == 1){
                    align ="center"
                }else if(type == 2){
                    align ="right"
                }
            }
        }else{
            if(cell.type ==2 || cell.type ==3){
                align ="right"
            }else if(cell.type >=4 || cell.type <=6){
                align ="center"
            }
        }
        return align; 
    }
    //为行添加新的样式
    getRowStyleNew(column:any){
        let sctrls =this.cds.ccells.sctrl;
        let row = column.row;
        if(sctrls){
            let cc = sctrls.split(";");
            for(var i=0;i<cc.length;i++){
                let oneSc = cc[i];
                if(oneSc.indexOf('`5')!=-1){
                    //`5tkstate/A:red,B:blue,C:green
                    let zd = oneSc.substring(2,oneSc.indexOf("/"))
                    let vl =  sctrls.split("/")[1].split(",");
                    let rowVl = row.data[zd];
                    for(var j=0;j<vl.length;j++){
                        let oneV = vl[j].split(":");
                        if(rowVl == oneV[0]){
                            if(this.rowClass['sctrl'+oneV[0]]){
                                return this.rowClass['sctrl'+oneV[0]];
                            }
                            // 创建我们的样式表
                            var style = document.createElement('style');
                            style.innerHTML =
                                '.sctrl'+oneV[0]+' {' +
                                    'background-color: '+oneV[1]+' !important;' +
                                    'color: #FFFFFF !important;' +
                                '}';
                            // 获取第一个脚本标记
                            var ref:any = document.querySelector('script');
                            // 在第一个脚本标签之前插入新样式
                            if(ref != null)
                                ref.parentNode.insertBefore(style, ref);
                            this.rowClass['sctrl'+oneV[0]]='sctrl'+oneV[0];
                            return 'sctrl'+oneV[0];
                        }
                    }
                }else{
                    return {
                        'row-checked': column.row.checked
                    }
                }
            } 
        }else{
            return {
                'row-checked': column.row.checked
            }
        }
    }

    /**
     * 报表是Card布局还是Table布局
     */
    ReportTableShape(data:Array<any>){
        if(data){
            let pbuid = data[0]
            if(pbuid)
            if(pbuid == this.pbuid){
                this.isTable = !this.isTable;
            }
            if(data.length ==3){
                this.isTable =false;
            }
            this.cardMenuList = data[1].menuList
        }
    }
    //子表添加转抽屉样式
    openDrawer(){
        this.lay.layType="B";
        this.lay.laystr="B:(@"+this.cds.ccells.obj_id+")";
        this.lay.ccells = [this.cds.ccells];
        this.lay = new BipLayout(this.lay.laystr,this.lay.ccells)
        this.addDrawer = !this.addDrawer;
    }
    closeDrawer(isOk:boolean){
        this.addDrawer = !this.addDrawer;
        if(!isOk){//取消 需要删除当前行
            this.cds.cdata.data.splice(this.cds.cdata.data.length-1,1); 
        }
    }

    // 设置选中的方法
    @Watch("cds")//,{deep:true}
    cdsChageSetSelectRow(){
        if(this.multiple){
            this.checkSelected = this.multipleSelectionAll;
            this.setSelectRow();    
        }
    }
    @Watch("env.mbs.menuList")
    menuChange(){
        this.$nextTick(()=>{
            this.makeCommBtns();
            this.getCellLinks();
             if(this.config && this.config.type ==2 && this.heightInfo){
                    this.height = (this.heightInfo.height-114)+"px";
            }
        })
    }
    
    /**
     * 设置选中行
     */
    setSelectRow() {
        if (!this.multipleSelectionAll || this.multipleSelectionAll.length <= 0) {
            return;
        }
        
        let selectAllIds:any = [];
        let that = this;
        this.multipleSelectionAll.forEach(row => {
            selectAllIds.push(JSON.stringify(row.data));
        }); 
        let reft:any = this.$refs[this.cds.ccells.obj_id];
        if(reft){
            reft.clearSelection();
            let currD=[]
            for (var i = 0; i < this.cds.cdata.data.length; i++) {
                if (selectAllIds.indexOf(JSON.stringify(this.cds.cdata.data[i].data)) >= 0) {
                    currD.push(this.cds.cdata.data[i]);
                }
            }
            reft.setSelection(currD, true)
        }
        this.cds.currRecordArr = this.multipleSelectionAll;
    }
    // 记忆选择核心方法
    changePageCoreRecordData() {
        
      let that = this;
      // 如果总记忆中还没有选择的数据，那么就直接取当前页选中的数据，不需要后面一系列计算
      if (!this.multipleSelectionAll || this.multipleSelectionAll.length <= 0) {
        this.multipleSelectionAll = this.checkSelected;
        return;
      }
      // 总选择里面的key集合
      let selectAllIds:any = [];
      this.multipleSelectionAll.forEach(row => {
        selectAllIds.push(JSON.stringify(row.data));
      });
      let selectIds:any = [];
      // 获取当前页选中的id
      this.checkSelected.forEach((row:any) => {
        selectIds.push(JSON.stringify(row.data));
        // 如果总选择里面不包含当前页选中的数据，那么就加入到总选择集合里
        if (selectAllIds.indexOf(JSON.stringify(row.data)) < 0) {
          that.multipleSelectionAll.push(row);
        }
      });
      let noSelectIds:any = [];
      // 得到当前页没有选中的id
      this.cds.cdata.data.forEach(row => {
        if (selectIds.indexOf(JSON.stringify(row.data)) < 0) {
          noSelectIds.push(JSON.stringify(row.data));
        }
      });
      noSelectIds.forEach((id:any) => {
        if (selectAllIds.indexOf(id) >= 0) {
          for (let i = 0; i < that.multipleSelectionAll.length; i++) {
            if (JSON.stringify(that.multipleSelectionAll[i].data) == id) {
              // 如果总选择中有未被选中的，那么就删除这条
              that.multipleSelectionAll.splice(i, 1);
              break;
            }
          }
        }
      });
    }

    /**
    检查非空
     */
    checkNotNull(cds:CDataSet):boolean{
        let bok = true;
        if(this.cds.cdata.data.length>0){
            this.cds.currRecord = this.cds.cdata.data[this.cds.cdata.data.length-1]
            cds.ccells.cels.forEach(item => {
                if (item.unNull&&bok) {
                    let vl = null;
                    let hide:any = [];
                    if(cds.currRecord.data[item.id]!=null)
                        vl = cds.currRecord.data[item.id]+'';
                    if (!vl && hide.indexOf(item.id) == -1) {
                        this.$notify.warning( "【" + item.labelString + "】不能为空!");
                        bok =  false;
                        return false;
                    }
                }
            }); 
        }
        return bok;
    }
}


</script>
<style>
.tableHead{
  font-weight: 100;
  color: #000;
}
</style>
<style lang="scss" scoped>
.sum{
    min-width: 130px;
    padding: 5px 10px;
    height: 32px;
    text-align: center;
    line-height: 32px;
    background: #fff;
    border-radius: 20px;
    color: #1ab394;
    font-size: 14px;
    border: 1px solid;
}
.Accordion{
    background-color: #fff;
}
.accdiv{
    padding: 6px;
    background-color: #eaeaea;
}
.piece{
    padding: 5px 10px;
    width:95%;
}
.myDrawer{
    
    overflow: hidden;
    height:85%;
    overflow: hidden;
    .el-scrollbar {
        height: calc(100% + 40px) !important; 
        padding-bottom: 20px;
        .el-scrollbar__wrap {
            overflow-x: hidden !important;
            padding-right: 5px;
            height: 100%;
        }
    }
}
</style>
<style>
.vxe-table--body-wrapper .body--wrapper::-webkit-scrollbar {
    width: 4px;
}
.vxe-table--body-wrapper .body--wrapper::-webkit-scrollbar-thumb {
    background-color: #d9d9d9;
}
.btn_report{
    padding: 6px 5px !important;
}
</style>