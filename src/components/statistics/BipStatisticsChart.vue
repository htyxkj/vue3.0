<template> 
<div>
    <el-row v-loading="fullscreenLoading" class="bi-chart">
        <div>
            <el-row>
                <el-col :span="24" >
                    <div class="main-title">
                        <el-row>
                            <el-col :span="16">
                                <template v-if="showBack">
                                    <el-button icon="iconfont icon-bip-back" @click="goTable" size="mini">
                                        返回
                                    </el-button>
                                    &nbsp;&nbsp;
                                </template>
                                <i class="iconfont icon-bip-shuju"></i>
                                <template v-if="title">
                                    {{title}}
                                </template>
                                <template v-else> 
                                    统计维度：{{getTitle()}}
                                </template>
                            </el-col>
                            <el-col :span="8" class="main-title-icon pointer"  >
                                <el-button icon="el-icon-refresh" @click="searchData" circle size="mini" style="margin-right:5px"></el-button>
                                <el-button icon="el-icon-full-screen" v-if="!isFullScreen" @click="openFullScreen" circle size="mini" style="margin-right:15px"></el-button>
                                <i class="iconfont icon-bip-kucun"></i> &nbsp;
                                <span @click="openMenu">MORE</span>
                            </el-col>
                        </el-row>
                    </div>
                </el-col>
            </el-row>
        </div>
        <div v-if="stat.showChart && option"  class="showchart" :style="chartStyle" >
            <BipGant v-if="stat.chartTypeValue=='gantt-0'" :config="option" :height='300'></BipGant>
            <bip-chart v-else :style="chartStyle" :option="option" :chartStyle="chartStyle" @itemClick="itemClick"></bip-chart>
        </div>
        <div>
            <!-- 报表表格-->
            <vxe-table v-if="tableData && tjcell && showTable"
                ref="_vvt" border resizable size="small" highlight-hover-row show-all-overflow="tooltip"
                show-header-overflow class="vxe-table-element" :data.sync="tableData" style="padding-bottom: 15px;"
                :optimized="true" height="350px" :footer-method="footerMethod2" :show-footer="showFooterHj">
                <vxe-table-column type="seq" width="60"></vxe-table-column>
                <vxe-table-column header-align="center" align="center" v-for="(cel,index) in tjcell.cels"
                    :key="index" :field="cel.id" :title="cel.labelString" show-header-overflow show-overflow > 
                </vxe-table-column>
            </vxe-table>
        </div>

        <el-dialog class="flDialog" title="" :visible.sync="isFullScreen" fullscreen append-to-body @close="dlgClose">
            <slot slot="title">
                <template v-if="title">
                    {{title}}
                </template>
                <template v-else> 
                    统计维度：{{getTitle()}}
                </template>
            </slot>
            <div v-if="stat.showChart && option"  class="showchart" :style="chartStyle" >
                <BipGant v-if="stat.chartTypeValue=='gantt-0'" :config="option" :height='300'></BipGant>
                <bip-chart v-else :style="chartStyle" :option="option" :chartStyle="chartStyle" @itemClick="itemClick"></bip-chart>
            </div>
            <div>
                <!-- 报表表格-->
                <vxe-table v-if="tableData && tjcell && showTable"
                    ref="_vvt" border resizable size="small" highlight-hover-row show-all-overflow="tooltip"
                    show-header-all-overflow class="vxe-table-element" :data.sync="tableData" style="padding-bottom: 15px;"
                    :optimized="true" height="350px">
                    <vxe-table-column type="seq" width="60"></vxe-table-column>
                    <vxe-table-column header-align="center" align="center" v-for="(cel,index) in tjcell.cels"
                        :key="index" :prop="cel.id" :label="cel.labelString" show-header-overflow show-overflow > 
                    </vxe-table-column>
                </vxe-table>
            </div>
        </el-dialog>
    </el-row>
</div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import CCliEnv from "@/classes/cenv/CCliEnv";
import { BIPUtil } from "@/utils/Request";
import { BIPUtils } from "@/utils/BaseUtil";
import BipChart from "@/components/chart/BipChart.vue"
import QueryEntity from "@/classes/search/QueryEntity";
let tools = BIPUtil.ServApi;
let tool = BIPUtils.baseUtil;
import { State, Action, Getter, Mutation } from "vuex-class";
import {CommICL} from '@/utils/CommICL'
let ICL = CommICL
import BipGant from '@/components/chart/BipGant.vue';
import moment from "moment"
@Component({
    components: { BipChart,BipGant}
})
export default class BipStatisticsDialog extends Vue {
    @Prop() stat!:any;
    @Prop() env!:CCliEnv; 
    @Prop() showBack!:boolean
    @Prop() showTable!:boolean
    @Prop() height!:number;
    pbuid:any="";
    selValue:Array<any> =[];
    selGroup:Array<any> =[];
    option:any = null;
    tjcell:any = null; 
    fullscreenLoading:boolean = false;
    tableData:any =null;
    title:any = null;
    restoreICON:string = "";
    dlConfig:any = null;
    comparedData:any={};
    chartStyle:string = "height :400px;";
    color:any = ["#3AA1FF","#975FE5","#F2637B","#FBD437","#4ECB73","#5AD4D4"];
    @State("aidValues", { namespace: "insaid" }) aidValues: any;
    @Action("fetchInsAid", { namespace: "insaid" }) fetchInsAid: any;
    @Mutation("setAidValue", { namespace: "insaid" }) setAidValue: any;
    @Mutation("setAidInfo", { namespace: "insaid" }) setAidInfo: any;
    @Action("fetchInsDataByCont", { namespace: "insaid" }) fetchInsDataByCont: any;
    isFullScreen:boolean = false;
    mounted() {
        this.restoreICON ="path://M49.07,31.35l-3.36-5.82a.31.31,0,0,0-.21-.16.33.33,0,0,0-.4.09L40.78,30.6a.35.35,0,0,0,0,.49.36.36,0,0,0,.49,0L45,26.64A20,20,0,0,1,8.67,37.57a.35.35,0,0,0-.49-.08A.34.34,0,0,0,8.1,38,20.73,20.73,0,0,0,45.7,26.89l2.77,4.8a.35.35,0,0,0,.48.13A.34.34,0,0,0,49.07,31.35ZM.67,19.36,4,25.18a.34.34,0,0,0,.21.16.34.34,0,0,0,.41-.09L9,20.11a.34.34,0,0,0,0-.49.36.36,0,0,0-.49,0l-3.7,4.41A20,20,0,0,1,41.08,13.14a.34.34,0,0,0,.56-.4A20.73,20.73,0,0,0,4,23.82L1.27,19a.34.34,0,0,0-.47-.13A.34.34,0,0,0,.67,19.36Z";
        this.comparedData={};
        this.pbuid = this.env.uriParams.pbuid;
        if(this.height){
            this.chartStyle = "height :"+(this.height)+"px;";
        }else{
            this.chartStyle = "height :400px;";
        }
        this.searchData();    
    }

    async searchData() {
        this.tjcell=null;
        this.fullscreenLoading = true;
        this.selValue = this.stat.selValue;
        this.selGroup = this.stat.selGroup;
        this.title = this.stat.title;
        this.option=null;

        let param:any=null;
        let  groupdatafilds,groupfilds ; 
        groupfilds = JSON.stringify(this.selGroup);
        groupdatafilds = JSON.stringify(this.selValue); 
        let qe: QueryEntity = new QueryEntity("","");
        qe.pcell = this.env.dsm.ccells.obj_id
        qe.tcell = this.env.ds_cont.ccells.obj_id
        let tj_row = JSON.parse(JSON.stringify(this.env.ds_cont.currRecord));
        for(var i=0;i<this.env.ds_cont.ccells.cels.length;i++){
            let cel = this.env.ds_cont.ccells.cels[i];
            if((cel.attr & (0x4)) >0){
                tj_row.data[cel.id] = null;
            }
        }
        qe.cont = JSON.stringify(tj_row.data,this.testReplacer);
        param = tool.getBipStatisticsParams(JSON.stringify(qe),groupfilds,groupdatafilds,this.stat.chartTypeValue);
        let chartData = await tools.getFromServer(param); 

        if(chartData.data.id == 0){
            this.tableData = chartData.data.data.tjpages.celData
            this.tjcell = chartData.data.data.tjlayCels
            await this.initChartData(chartData);
        }else{ 
            this.$notify.warning(chartData.data.message);
        }
        this.fullscreenLoading = false;
    }
    testReplacer(key:any,value:any){//key为对象属性名，value为对象属性值，会遍历testObj或testArr来执行该函数
        if(value== null){
            value = "";
        }
        return value;
    }
    //图表类型
    //折线图：折线图、折线面积图、平滑折线图、平滑面积折线图、堆叠折线图、堆叠面积折线图
    //       line-0  line-1     line-2     line-3        line-4     line-5
    //柱状图：柱状图、条形图、堆叠柱状图、堆叠条形图
    //       bar-0   bra-1  bar-2      bar-3
    //饼状图：饼状图、环形图、玫瑰图
    //       pie-0   pie-1  pie-2
    //分页：折线图、折线面积图、平滑折线图、平滑面积折线图、堆叠折线图、堆叠面积折线图
    //       split-line-0 split-line-1 split-line-2 split-line-3 split-line-4 split-line-5
    //       柱状图、条形图、堆叠柱状图、堆叠条形图
    //       split-bar-0 split-bra-1 split-bar-2 split-bar-3
    //散点图：散点图
    //
    //雷达图：雷达图
    //
    //漏斗图：漏斗图
    //

    async initChartData(chartData:any){
        let type = this.stat.chartTypeValue.split("-");
        if(type.length ==1){
            type.push[0]
        }
        let cc = await this.initDL(type[0]);
        if(cc){
            this.dlConfig = cc;
        }
        if(type[0] == 'line'){//折线类            
            await this.meakeLine(chartData,type[1]);
        }else if(type[0] == 'bar'){//柱状类
            await this.makeBar(chartData,type[1]);
        }else if(type[0] == 'pie'){//饼状类
            await this.makePie(chartData,type[1]);
        }else if(type[0] == 'funnel'){//漏斗图
            await this.makeFunnel(chartData,type[1]);
        }else if(type[0] == 'gantt'){//甘特图
            await this.makeGantt(chartData);
        }else if(type[0] == 'split'){
            await this.meakeSplit(chartData,type);
        }
    }

    /**
     * 折线图  ==》折线图、折线面积图、平滑折线图、平滑折线面积图、
     * 数据，图表类型
     */
    async meakeLine(chartData:any,type:any){
        let _this = this;
        if(type >=4 ){
            await this.makeStackLine(chartData,type)
            return ;
        }
        let chartD = chartData.data.data.tjpages.celData; 
        //条形图是  xAxis属性 与 yAxis 属性互换
        let option = {
            color:this.color,
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    crossStyle: {
                        color: '#999'
                    }
                }
            },
            grid: {
                left: '2%',
                right: '2%',
                bottom: '1%',
                top:'8%',
                containLabel: true
            },
            toolbox: {
                feature: {
                    dataView: {show: true, readOnly: false},
                    saveAsImage: {show: true},
                    myTool : {
                        show : true,
                        title : '刷新',
                        icon : this.restoreICON,
                        onclick : function (){
                            _this.searchData();
                        }
                    }
                },
                right:"2%"
            },
            xAxis: {
                type: 'category',
                boundaryGap: true,//是否留有边界X轴 距 0.0 是否有距离
                data: []
            },
            yAxis: {
                type: 'value'
            },
            series: [{
                data: [0, 0, 0, 0, 0, 0, 0],
                type: 'line',//图形类型     bar柱状图  line 折线图
                areaStyle: null,//折线图是有效：是否是面积 {} 为面积样式默认   null  不显示面积
                smooth: true,//折线图时 是否平滑显示
            }]
        };
        var categories:any = [];
        var series0:any = []; 
        for(let i=0;i<chartD.length;i++){
            var item = chartD[i];
            var name = await this.getGroupFldName(item,i);
            categories.push(name);
            
            this.selValue.forEach((fld, key1) => {
                let colname = this.getFldName(fld);
                var _idx = series0.findIndex(function(im:any) {
                    return im.name == colname;
                });
                if (_idx >= 0) {
                    var bb = series0[_idx];
                    bb.data[i] = item[fld];
                    series0[_idx] = bb;
                } else {
                    var bb:any ={}
                    bb = { name: colname, data: [] ,type:'line',itemStyle: {},smooth:false,areaStyle:null};
                    //折线图、折线面积图、平滑折线图、平滑面积折线图、堆叠折线图、堆叠面积折线图
                    if(type == 1 || type == 3){
                        option.xAxis.boundaryGap=false
                        bb.areaStyle={};
                    }
                    if(type ==3 || type ==2)
                        bb.smooth=true;
                    bb.data[i] = item[fld];
                    series0.push(bb);
                }
            });
        }
        option.xAxis.data = categories;
        option.series = series0;
        this.option = option;
    }
    /**
     * 折线图  ==》堆叠折线图、堆叠面积折线图
     * 数据，图表类型
     */
    async makeStackLine(chartData:any,type:any){
        let _this = this;
        let option:any = {
            color:this.color,
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    crossStyle: {
                        color: '#999'
                    }
                }
            },
            grid: {
                left: '2%',
                right: '2%',
                bottom: '1%',
                top:'8%',
                containLabel: true
            },
            toolbox: {
                feature: {
                    dataView: {show: true, readOnly: false},
                    saveAsImage: {show: true},
                    myTool : {
                        show : true,
                        title : '刷新',
                        icon : this.restoreICON,
                        onclick : function (){
                            _this.searchData();
                        }
                    }
                },
                right:"2%"
            },
            legend: {
                data: [''],
                top: 5,
            },
            xAxis: {
                type: 'category',
                boundaryGap: true,//是否留有边界X轴 距 0.0 是否有距离
                data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            },
            yAxis: {
                type: 'value'
            },
            series: []
        };
        let legendD = [];
        let xAxisD = [];
        let xD = this.selGroup[0];
        let lD = this.selGroup[1]
        let allData = chartData.data.data.tjpages.celData; 
        for(var i=0;i<allData.length;i++){
            let data = allData[i]
            var name = await this.getGroupFldName(data,i);
            legendD.push(data[lD]);
            xAxisD.push(data[xD]);
        }
        legendD = Array.from(new Set(legendD));
        xAxisD = Array.from(new Set(xAxisD));
        option.legend.data = legendD
        option.xAxis.data = xAxisD
        for(var k=0;k<legendD.length;k++){
            let dd:any  = {
                name: '',
                type: 'line',
                data: [],
                areaStyle: null,//折线图是有效：是否是面积 {} 为面积样式默认   null  不显示面积
                smooth: false,//折线图时 是否平滑显示
            }
            if(type == 7 || type == 5){
                option.xAxis.boundaryGap=false
                dd.areaStyle={};
            }
            if(type ==7 || type ==6)
                dd.smooth=true;
            
            for(var j=0;j<xAxisD.length;j++){
                let ispush = false;
                for(var i=0;i<this.tableData.length;i++){
                    let data = this.tableData[i]
                    if(data[lD] == legendD[k]&&xAxisD[j] == data[xD]){
                        dd.data.push(data[this.selValue[0]])
                        dd.name=data[lD]
                        ispush = true;
                    }
                }
                if(!ispush){
                    dd.data.push(0);
                }
            }
            option.series.push(dd);
        }
        this.option = option;
    }

    /**
     * 柱状图  ==》柱状图、条形图、
     * 数据，图表类型
     */
    async makeBar(chartData:any,type:any){
        let _this = this;
        if(type>=2){
            await this.makeStackBar(chartData,type)
            return;
        }
        let chartD = chartData.data.data.tjpages.celData; 
        //条形图是  xAxis属性 与 yAxis 属性互换
        let option:any = {
            color:this.color,
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    crossStyle: {
                        color: '#999'
                    }
                }
            },
            grid: {
                left: '2%',
                right: '2%',
                bottom: '1%',
                top:'8%',
                containLabel: true
            },
            toolbox: {
                feature: {
                    dataView: {show: true, readOnly: false},
                    saveAsImage: {show: true},
                    myTool : {
                        show : true,
                        title : '刷新',
                        icon : this.restoreICON,
                        onclick : function (){
                            _this.searchData();
                        }
                    }
                },
                right:"2%"
            },
            xAxis: {
                type: 'category',
                boundaryGap: true,//是否留有边界X轴 距 0.0 是否有距离
                data: [],
                axisLabel: {  
                    interval:0,  
                    rotate:20 ,                   
                }
            },
            yAxis: {
                type: 'value'
            },
            series: [{
                data: [],
                type: 'bar',//图形类型     bar柱状图  line 折线图
                areaStyle: null,//折线图是有效：是否是面积 {} 为面积样式默认   null  不显示面积
                smooth: true,//折线图时 是否平滑显示
            }]
        };
        var categories:any = [];
        var series0:any = []; 
        for(let i=0;i<chartD.length;i++){
            var item = chartD[i];
            var name = await this.getGroupFldName(item,i);
            categories.push(name);
            this.selValue.forEach((fld, key1) => {
                let colname = this.getFldName(fld);
                var _idx = series0.findIndex(function(im:any) {
                    return im.name == colname;
                });
                if (_idx >= 0) {
                    var bb = series0[_idx];
                    bb.data[i] = item[fld];
                    series0[_idx] = bb;
                } else {
                    var bb:any ={}
                    bb = { name: colname, data: [] ,type:'bar',itemStyle: {},smooth:false,areaStyle:null};
                    bb.data[i] = item[fld];
                    series0.push(bb);
                }
            });
        }
        option.xAxis.data = categories;
        option.series = series0;
        if(type == 1){
            let x1 = option.xAxis;
            option.xAxis = option.yAxis;
            option.yAxis = x1;
        }
        this.option = option;
    }
    /**
     * 柱状图  ==》堆叠柱状图、堆叠面积柱状图
     * 数据，图表类型
     */
    async makeStackBar(chartData:any,type:any){
        let _this = this;
        let Stacking = false;
        if(type ==4 || type ==5){
            Stacking = true;
        }
        let option:any = {
            color:this.color,
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
            },
            toolbox: {
                feature: {
                    dataView: {show: true, readOnly: false},
                    saveAsImage: {show: true},
                    myTool : {
                        show : true,
                        title : '刷新',
                        icon : this.restoreICON,
                        onclick : function (){
                            _this.searchData();
                        }
                    }
                },
                right:"2%"
            },
            legend: {
                data: [''],
                top: 8,
                left:80,
                right:250
            },
            grid: {
                left: '2%',
                right: '2%',
                bottom: '1%',
                top:'8%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: [''],
                axisLabel: {  
                    interval:0,  
                    rotate:20 ,                   
                }
            },
            yAxis: {
                type: 'value',
                boundaryGap: [0, 0.01]
            },
            series: [
            ]
        };
        let legendD = [];
        let xAxisD = [];
        let xD = this.selGroup[0];
        let lD = this.selGroup[1]
        let allData = chartData.data.data.tjpages.celData; 
        for(var i=0;i<allData.length;i++){
            let data = allData[i]
            var name = await this.getGroupFldName(data,i);
            legendD.push(data[lD]);
            xAxisD.push(data[xD]);
        }
        legendD = Array.from(new Set(legendD));
        xAxisD = Array.from(new Set(xAxisD));
        option.legend.data = legendD
        option.xAxis.data = xAxisD
        for(var k=0;k<legendD.length;k++){
            let dd:any = {};
            if(Stacking){
                dd = {
                    name: '',
                    type: 'bar',
                    stack: '总量',
                    label: {
                        normal: {
                            show: true,
                            position: 'insideRight'
                        }
                    },
                    data: []
                }
            }else{
                dd = {
                    name: '',
                    type: 'bar',
                    data: []
                }
            }
            for(var j=0;j<xAxisD.length;j++){
                let ispush = false;
                for(var i=0;i<this.tableData.length;i++){
                    let data = this.tableData[i]
                    if(data[lD] == legendD[k]&&xAxisD[j] == data[xD]){
                        dd.data.push(data[this.selValue[0]])
                        dd.name=data[lD]
                        ispush = true;
                    }
                }
                if(!ispush){
                    dd.data.push(0);
                }
            }
            option.series.push(dd);
        }
        if(type == 3 || type == 5){
            let x1 = option.xAxis;
            option.xAxis = option.yAxis;
            option.yAxis = x1;
        }
        this.option = option;
    }

    /**
     * 饼状图  ==》饼状图、环形图、玫瑰图
     * 数据，图表类型
     */
    async makePie(chartData:any,type:any){
        let _this = this;
        let chartD = chartData.data.data.tjpages.celData; 
        var id = this.selValue[0];
        var cell:any = this.getCellById(id);
        let labelString = cell.labelString 
        let pie:any = {
            tooltip : {
                trigger: 'item',
                formatter: "{b} <br/>{a} : {c} ({d}%)"
            },
            toolbox: {
                feature: {
                    dataView: {show: true, readOnly: false},
                    saveAsImage: {show: true},
                    myTool : {
                        show : true,
                        title : '刷新',
                        icon : this.restoreICON,
                        onclick : function (){
                            _this.searchData();
                        }
                    }
                },
                right:"2%"
            },            
            legend: {
                type: 'scroll',
                orient: 'vertical', 
                right: 10,
                top: 20,
                bottom: 20,
            },
            series : [
                {
                    name: '值',
                    type: 'pie',
                    radius : '55%',
                    center: ['40%', '50%'],
                    data: [],//统计结果值 seriesData: [{name: "赵杜", value: 13525},{name: "董奚孔萧常·伍陶", value: 23335}{name: "殷闵", value: 57860}]
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        },
                        normal: {
                            //定义一个list，然后根据所以取得不同的值，这样就实现了，
                            color: function(params:any) {
                                var colorList = [
                                    "#3AA1FF","#975FE5","#F2637B","#FBD437","#4ECB73","#5AD4D4"
                                ];
                                let cc = params.dataIndex;
                                if(cc >=colorList.length)
                                    cc = cc %colorList.length;
                                return colorList[cc];
                            }
                        }
                    },
                    label: {
                        normal: {
                            formatter: '{b|{b}({d}%)}',
                            rich: { 
                                b: {
                                    fontSize: 12,
                                    lineHeight: 33
                                },
                            }
                        }
                    }
                }
            ]
        };
        if(labelString){
            pie.series[0].name = labelString;
        }
        var data:any = [];
        for(let i=0;i<chartD.length;i++){
            var item = chartD[i];
            var name = await this.getGroupFldName(item,i);
            let d1 = { name: name, value: item[this.selValue[0]] }
            data.push(d1);
        }
        pie.series[0].data = data;
        if(type == 1){
            pie.series[0].radius= ['50%', '70%'];
        }
        if(type == 2){
            pie.series[0].roseType='radius';
        }
        this.option = pie;
    }

    /**
     * 漏斗图  ==》漏斗图
     * 数据，图表类型
     */
    async makeFunnel(chartData:any,type:any){
        let _this = this;
        let chartD = chartData.data.data.tjpages.celData; 
        let option:any = {
            color:this.color,
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c}"
            },
            toolbox: {
                feature: {
                    dataView: {show: true, readOnly: false},
                    saveAsImage: {show: true},
                    myTool : {
                        show : true,
                        title : '刷新',
                        icon : this.restoreICON,
                        onclick : function (){
                            _this.searchData();
                        }
                    }
                },
                right:"2%"
            },
            legend: {
                data: []
            },
            calculable: true,
            series: [
                {
                    name:"值",
                    type:'funnel',
                    left: '10%',
                    top: 60,
                    bottom: 60,
                    width: '80%',
                    min: 0,
                    max: 100,
                    minSize: '0%',
                    maxSize: '100%',
                    sort: 'descending',
                    gap: 2,
                    label: {
                        show: true,
                        position: 'inside'
                    },
                    labelLine: {
                        length: 10,
                        lineStyle: {
                            width: 1,
                            type: 'solid'
                        }
                    },
                    itemStyle: {
                        borderColor: '#fff',
                        borderWidth: 1
                    },
                    emphasis: {
                        label: {
                            fontSize: 20
                        }
                    },
                    data: [
                        
                    ]
                }
            ]
        };
        var categories:any = [];
        for(let i=0;i<chartD.length;i++){
            var item = chartD[i];
            var name = await this.getGroupFldName(item,i);
            categories.push(name);
            let dd:any =  {value: 0, name: ''};
            dd.name = name;
            dd.value = item[this.selValue[0]];
            option.series[0].data.push(dd);
            option.series[0].name = this.getFldName(this.selValue[0]);
        }
        option.legend.data = categories;
        this.option = option;
    }

    // 环形图
    async makepieAnnular(chartData:any){
        let chartD = chartData.data.data.tjpages.celData; 
        var id = this.selValue[0];
        var cell:any = this.getCellById(id);
        let labelString = cell.labelString 
        let pie = {
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            toolbox: {
                feature: {
                    dataView: {show: true, readOnly: false},
                    saveAsImage: {show: true}
                },
                right:"2%"
            },            
            legend: {
                type: 'scroll',
                orient: 'vertical', 
                right: 10,
                top: 20,
                bottom: 20,
                // data: [], //统计轴 //["赵杜", "董奚孔萧常·伍陶", "殷闵", "姚"] 图例
            },
            series : [
                {
                    name: '值',
                    type: 'pie',
                    radius : ['50%', '70%'],
                    center: ['40%', '50%'],
                    data: [],//统计结果值 seriesData: [{name: "赵杜", value: 13525},{name: "董奚孔萧常·伍陶", value: 23335}{name: "殷闵", value: 57860}]
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        },
                        normal: {
                            //定义一个list，然后根据所以取得不同的值，这样就实现了，
                            color: function(params:any) {
                                var colorList = [
                                   "#3AA1FF","#975FE5","#F2637B","#FBD437","#4ECB73","#5AD4D4"
                                ];
                                let cc = params.dataIndex;
                                if(cc >=colorList.length)
                                    cc = cc %colorList.length;
                                return colorList[cc];
                            }
                        }
                    },
                    label: {
                        normal: {
                            formatter: '{b|{b}({d}%)}',
                            rich: { 
                                b: {
                                    fontSize: 12,
                                    lineHeight: 33
                                },
                            }
                        }
                    }
                }
            ]
        };
        if(labelString){
            pie.series[0].name = labelString;
        }
        var data:any = [];
        for(let i=0;i<chartD.length;i++){
            var item = chartD[i];
            var name = await this.getGroupFldName(item,i);
            // let name = item[this.selGroup[0]]
            let d1 = { name: name, value: item[this.selValue[0]] }
            data.push(d1);
        }
        pie.series[0].data = data;
        this.option = pie;
    }
    // 条形图
    async makebarGraph(chartData:any){
       let chartD = chartData.data.data.tjpages.celData; 
        let option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    crossStyle: {
                        color: '#999'
                    }
                }
            },
            toolbox: {
                feature: {
                    dataView: {show: true, readOnly: false},
                    saveAsImage: {show: true}
                },
                right:"2%"
            },
            xAxis: {
                type: 'value',
                axisLabel: {  
                    interval:0,  
                    rotate:20 ,
                   
                }
            },
            grid: {
                left: '2%',
                right: '2%',
                bottom: '1%',
                top:'8%',
                containLabel: true
            },
            legend: { 
                 left: '45%',
                 top: 5,
            },
            yAxis: {
                type: 'category',
                data: [],
                splitLine:{
                    show:false
                },
                axisLabel: {
                    show: true,
                    textStyle: {
                         color:'#333333'  
                    }
                },
            },
            series : [ ]
        };
        let chartType = this.stat.chartTypeValue;
        
        var categories:any = [];
        var series0:any = []; 

        for(let i=0;i<chartD.length;i++){
            var item = chartD[i];
            var name = await this.getGroupFldName(item,i);
            categories.push(name);
            
            this.selValue.forEach((fld, key1) => {
            let colname = this.getFldName(fld);
            var _idx = series0.findIndex(function(im:any) {
                return im.name == colname;
            });
            if (_idx >= 0) {
                var bb = series0[_idx];
                bb.data[i] = item[fld];
                series0[_idx] = bb;
            } else {
                var bb:any ={}
                bb = { name: colname, data: [] ,type:'bar',
                        itemStyle: {
                            emphasis: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            },
                            normal: {
                                //定义一个list，然后根据所以取得不同的值，这样就实现了，
                                color: function(params:any) {
                                    var colorList = [
                                        "#3AA1FF","#975FE5","#F2637B","#FBD437","#4ECB73","#5AD4D4"
                                    ];
                                    let cc = params.dataIndex;
                                    if(cc >=colorList.length)
                                        cc = cc %colorList.length;
                                    return colorList[cc];
                                },
                            }
                        },
                };
                bb.data[i] = item[fld];
                series0.push(bb);
            }
            });
        }
        option.yAxis.data = categories;
        option.series = series0;
        this.option = option;
    }

    //饼图
    async makePieOpitons(chartData:any){  
        let chartD = chartData.data.data.tjpages.celData; 
        var id = this.selValue[0];
        var cell:any = this.getCellById(id);
        let labelString = cell.labelString 
        let pie = {
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            toolbox: {
                feature: {
                    dataView: {show: true, readOnly: false},
                    saveAsImage: {show: true}
                },
                right:"2%"
            },            
            legend: {
                type: 'scroll',
                orient: 'vertical', 
                right: 10,
                top: 20,
                bottom: 20,
                // data: [], //统计轴 //["赵杜", "董奚孔萧常·伍陶", "殷闵", "姚"] 图例
            },
            series : [
                {
                    name: '值',
                    type: 'pie',
                    radius : '55%',
                    center: ['40%', '50%'],
                    data: [],//统计结果值 seriesData: [{name: "赵杜", value: 13525},{name: "董奚孔萧常·伍陶", value: 23335}{name: "殷闵", value: 57860}]
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        },
                        normal: {
                            //定义一个list，然后根据所以取得不同的值，这样就实现了，
                            color: function(params:any) {
                                var colorList = [
                                    "#3AA1FF","#975FE5","#F2637B","#FBD437","#4ECB73","#5AD4D4"
                                ];
                                let cc = params.dataIndex;
                                if(cc >=colorList.length)
                                    cc = cc %colorList.length;
                                return colorList[cc];
                            }
                        }
                    },
                    label: {
                        normal: {
                            formatter: '{b|{b}({d}%)}',
                            rich: { 
                                b: {
                                    fontSize: 12,
                                    lineHeight: 33
                                },
                            }
                        }
                    }
                }
            ]
        };
        if(labelString){
            pie.series[0].name = labelString;
        }
        var data:any = [];
        for(let i=0;i<chartD.length;i++){
            var item = chartD[i];
            var name = await this.getGroupFldName(item,i);
            // let name = item[this.selGroup[0]]
            let d1 = { name: name, value: item[this.selValue[0]] }
            data.push(d1);
        }
        pie.series[0].data = data;
        this.option = pie;
    }
    //柱状图 和折线图
    async makeColumnOpitons(chartData:any){ 
        let chartD = chartData.data.data.tjpages.celData; 
        let option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    crossStyle: {
                        color: '#999'
                    }
                }
            },
            toolbox: {
                feature: {
                    dataView: {show: true, readOnly: false},
                    saveAsImage: {show: true}
                },
                right:"2%"
            },
            xAxis: {
                type: 'category',
                data: [],
                axisLabel: {  
                    interval:0,  
                    rotate:20 ,
                   
                }
            },
            grid: {
                left: '2%',
                right: '2%',
                bottom: '1%',
                top:'8%',
                containLabel: true
            },
            legend: { 
                 left: '45%',
                 top: 5,
            },
            yAxis: {
                type: 'value',
                splitLine:{
                    show:false
                },
                axisLabel: {
                    show: true,
                    textStyle: {
                         color:'#333333'  
                    }
                },
            },
            series : [ ]
        };
        let chartType = this.stat.chartTypeValue;
        
        var categories:any = [];
        var series0:any = []; 

        for(let i=0;i<chartD.length;i++){
            var item = chartD[i];
            var name = await this.getGroupFldName(item,i);
            categories.push(name);
            
            this.selValue.forEach((fld, key1) => {
            let colname = this.getFldName(fld);
            var _idx = series0.findIndex(function(im:any) {
                return im.name == colname;
            });
            if (_idx >= 0) {
                var bb = series0[_idx];
                bb.data[i] = item[fld];
                series0[_idx] = bb;
            } else {
                var bb:any ={}
                bb = { name: colname, data: [] ,type:chartType,
                        itemStyle: {
                            emphasis: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            },
                            normal: {
                                //定义一个list，然后根据所以取得不同的值，这样就实现了，
                                color: function(params:any) {
                                    var colorList = [
                                       "#3AA1FF","#975FE5","#F2637B","#FBD437","#4ECB73","#5AD4D4"
                                    ];
                                    let cc = params.dataIndex;
                                    if(cc >=colorList.length)
                                        cc = cc%colorList.length;
                                    return colorList[cc];
                                },
                            }
                        },
                };
                if(chartType == 'line' || chartType =='lineArea'){
                    let color = "";
                    var colorList = [
                        "#3AA1FF","#975FE5","#F2637B","#FBD437","#4ECB73","#5AD4D4"];
                    let cc = key1;
                    if(cc >=colorList.length)
                        cc = cc %colorList.length;
                    color = colorList[cc];
                    if(chartType == 'line')
                        bb ={ name: colname, data: [] ,type:chartType,color:color,smooth:true};
                    if(chartType =='lineArea'){
                        bb ={ name: colname, data: [] ,type:'line',color:color,areaStyle: {},smooth:true};
                    }
                            
                }
                bb.data[i] = item[fld];
                series0.push(bb);
            }
            });
        }
        option.xAxis.data = categories;
        option.series = series0;
        this.option = option;
    }
    //二维柱状图
    async makeDimensionBar(chartData:any,Stacking:boolean){
        let option:any = {
            color:["#3AA1FF","#975FE5","#F2637B","#FBD437","#4ECB73","#5AD4D4"],
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
            },
            toolbox: {
                feature: {
                    dataView: {show: true, readOnly: false},
                    saveAsImage: {show: true}
                },
                right:"2%"
            },
            legend: {
                data: [''],
                top: 5,
            },
            grid: {
                left: '2%',
                right: '2%',
                bottom: '1%',
                top:'8%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: ['']
            },
            yAxis: {
                type: 'value',
                boundaryGap: [0, 0.01]
            },
            series: [
            ]
        };
        let legendD = [];
        let xAxisD = [];
        let xD = this.selGroup[0];
        let lD = this.selGroup[1]
        let allData = chartData.data.data.tjpages.celData; 
        for(var i=0;i<allData.length;i++){
            let data = allData[i]
            var name = await this.getGroupFldName(data,i);
            legendD.push(data[lD]);
            xAxisD.push(data[xD]);
        }
        legendD = Array.from(new Set(legendD));
        xAxisD = Array.from(new Set(xAxisD));
        option.legend.data = legendD
        option.xAxis.data = xAxisD
        for(var k=0;k<legendD.length;k++){
            let dd:any = {};
            if(Stacking){
                dd = {
                    name: '',
                    type: 'bar',
                    stack: '总量',
                    label: {
                        normal: {
                            show: true,
                            position: 'insideRight'
                        }
                    },
                    data: []
                }
            }else{
                dd = {
                    name: '',
                    type: 'bar',
                    data: []
                }
            }
            for(var j=0;j<xAxisD.length;j++){
                for(var i=0;i<this.tableData.length;i++){
                    let data = this.tableData[i]
                    if(data[lD] == legendD[k]&&xAxisD[j] == data[xD]){
                        dd.data.push(data[this.selValue[0]])
                        dd.name=data[lD]
                    }
                }
            }
            option.series.push(dd);
        }
        this.option = option;
    }

    //甘特图
    async makeGantt(chartData:any){
        if(chartData.data.id ==0){
            let data = chartData.data.data;
            let values = data.tjpages.celData
            let gantt_data = [];
            for(var i=0;i<values.length;i++){
                let vl = values[i];

                let _d:any = {
                    id:(i+1),
                    label:"",
                    start: 0,
                    duration:0,
                    percent:0,
                    type: "task",
                    style: {
                        base: {
                            fill: "#F9D820",
                            stroke: "#7E349D"
                        }
                    }
                }
                let seg = this.stat.selGroup;
                for(var z=0;z<seg.length;z++){
                    let key = seg[z];
                    _d[key] = vl[key]
                }
                let sev = this.stat.selValue;
                if(!vl[sev[1]]){
                    continue;
                }
                vl[sev[0]] = moment(vl[sev[0]]).format('YYYY-MM-DD')+" 00:00:00";
                _d.start= new Date( vl[sev[0]]).getTime();
                _d.duration = vl[sev[1]] *24* 60 * 60 * 1000;
                if(sev[2] && sev[2]!='""'){
                    let jd = vl[sev[2]];
                    let yjjd = vl[sev[3]];
                    _d.percent = jd*100
                    _d.label = "实际完成："+(jd*100)+"%"
                    if(yjjd != null){
                        _d.label += "/预计完成："+(yjjd*100).toFixed(0)+"%"
                    }
                }
                gantt_data.push(_d);
            }
            let tjlayCels = data.tjlayCels;
            let cels = tjlayCels.cels;
            let seg = this.stat.selGroup;
            let columns =[];
            let _this = this;
            for(var z=0;z<seg.length;z++){
                let _c:any = { id:1,label:"",value:"",expander: true,width: 200,events: {
                        click({event,data}:any) {
                            _this.onTaskClick( data,event);
                        }
                    } };
                let key = seg[z];
                for(var j=0;j<cels.length;j++){
                    if(cels[j].id == key){
                        _c.id= (z+1)
                        _c.value = key;
                        _c.label = cels[j].labelString
                    }
                }
                columns.push(_c)
            }
            this.option= {
                data: gantt_data,
                columns :columns,
                maxHeight:270,
                dynamicStyle:{
                    'task-list-item-value': {
                        background: 'transparent'
                    },
                    'task-list-item':{
                    },
                    'chart-row-text':{
                        background:'transparent'
                    }
                }
            }
        }
    }

    //折线柱状 分页
    async meakeSplit(chartData:any,types:any){
        let type1 = types[1];//柱状或折线
        let type = types[2];
        let splitNum = types[3]
        if(!splitNum){
            splitNum = 10
        }
        splitNum = parseInt(splitNum);
        let chartD = chartData.data.data.tjpages.celData;
        //条形图是  xAxis属性 与 yAxis 属性互换
        let option:any = {
            baseOption: {
                timeline: {   
                    playInterval:4000,
                    color:this.color,
                    axisType: 'category',
                    show: true,
                    autoPlay: true,
                    data: []
                },
                xAxis: [{
                    type: 'category',
                }, ],
                yAxis: { type: 'value' }, 
                tooltip: {}
            },
            options:[]
        }
        if((type1 == 'line' && type<4) || (type1=='bar' && type<2)){//单条的
            let oneOpSer:any = null;
            for(let i=0;i<chartD.length;i++){
                var item = chartD[i];
                var name:any = await this.getGroupFldName(item,i);
                if(i ==0 || i%splitNum ==0){
                    if(oneOpSer!=null){
                        option.options.push(oneOpSer)
                    }
                    option.baseOption.timeline.data.push("");
                    oneOpSer={
                        xAxis: [{ data: [] }],
                        color:this.color,
                        tooltip: {
                            trigger: 'axis',
                            axisPointer: {
                                type: 'shadow'
                            },
                        },
                        legend:{
                            data:[],
                            top: 8,
                            left:80,
                            right:250
                        },
                        grid: {
                            left: '2%',
                            right: '2%',
                            bottom: '1%',
                            top:'8%',
                            containLabel: true
                        },
                        series: []
                    }
                    oneOpSer.xAxis[0].data.push(name)
                }else{
                    oneOpSer.xAxis[0].data.push(name)
                }
                this.selValue.forEach((fld, key1) => {
                    let colname = this.getFldName(fld);
                    var _idx = oneOpSer.series.findIndex(function(im:any) {
                        return im.name == colname;
                    });
                    if (_idx >= 0) {
                        var bb = oneOpSer.series[_idx];
                        bb.data.push(item[fld]);
                        oneOpSer.series[_idx] = bb;
                    } else {
                        var bb:any ={}
                        bb = { name: colname, data: [] ,type:type1,itemStyle: {},smooth:false,areaStyle:null};
                        //折线图、折线面积图、平滑折线图、平滑面积折线图、堆叠折线图、堆叠面积折线图
                        if(type == 1 || type == 3){
                            option.xAxis.boundaryGap=false
                            bb.areaStyle={};
                        }
                        if(type ==3 || type ==2)
                            bb.smooth=true;
                        bb.data.push(item[fld]);
                        oneOpSer.series.push(bb);
                    }
                });
            }
            if(oneOpSer != null){
                option.options.push(oneOpSer)
            }
        }else{//堆叠的
            let legendD = [];
            let xAxisD = [];
            let xD = this.selGroup[0];
            let lD = this.selGroup[1]
            for(var i=0;i<chartD.length;i++){
                let data = chartD[i]
                await this.getGroupFldName(data,i);
                legendD.push(data[lD]);
                xAxisD.push(data[xD]);
            }
            legendD = Array.from(new Set(legendD));
            xAxisD = Array.from(new Set(xAxisD));
            let oneOpSer:any = null;
            for(var j=0;j<xAxisD.length;j++){
                let name = xAxisD[j];
                if(j ==0 || j%splitNum ==0){
                    if(oneOpSer!=null){
                        option.options.push(oneOpSer)
                    }
                    option.baseOption.timeline.data.push("");
                    oneOpSer={
                        xAxis: [{ data: [] }],
                        legend:{
                            top: 8,
                            left:80,
                            right:250,
                            data:legendD
                        },
                        tooltip: {
                            trigger: 'axis',
                            axisPointer: {
                                type: 'shadow'
                            },
                        },                        
                        color:this.color,
                        grid: {
                            left: '2%',
                            right: '2%',
                            bottom: '12%',
                            top:'10%',
                            containLabel: true
                        },
                        series: []
                    }
                    oneOpSer.xAxis[0].data.push(name)
                }else{
                    oneOpSer.xAxis[0].data.push(name)
                }
                for(var k=0;k<legendD.length;k++){
                    let value = 0;
                    let name1 = legendD[k];
                    for(var i=0;i<this.tableData.length;i++){
                        let data = this.tableData[i]
                        if(data[lD] == legendD[k]&&xAxisD[j] == data[xD]){
                            value = data[this.selValue[0]]
                            break
                        }
                    }
                    let colname = legendD[k];
                    var _idx = oneOpSer.series.findIndex(function(im:any) {
                        return im.name == colname;
                    });
                    if (_idx >= 0) {
                        var bb = oneOpSer.series[_idx];
                        bb.data.push(value);
                        oneOpSer.series[_idx] = bb;
                    } else {
                        var bb:any = { name: colname, data: [] ,type:type1,itemStyle: {},smooth:false,areaStyle:null};
                        //折线图、折线面积图、平滑折线图、平滑面积折线图、堆叠折线图、堆叠面积折线图
                        if(type == 1 || type == 3){
                            option.xAxis.boundaryGap=false
                            bb.areaStyle={};
                        }
                        if(type ==3 || type ==2)
                            bb.smooth=true;
                        bb.data.push(value);
                        bb.name = name1;
                        oneOpSer.series.push(bb);
                    } 
                }
            }          
            if(oneOpSer!=null){
                option.options.push(oneOpSer)
            }
        }
        this.option = option;
    }

    /**
    * DL_菜单参数_图表类型 
    * 定义图表下钻功能
    * id：图表类型
    */
    async initDL(id:string){
        let name = "DL_"+this.pbuid+"_"+id;
        let str = name
        // let dlg = await pubMethod.getConstant(str);
        str = ICL.AID_KEYCL+str;
        if(!this.aidValues.get(str)){
            let vv  = window.sessionStorage.getItem(str)
            if(!vv){
                let vars = {id:300,aid:name}
                await this.fetchInsAid(vars);
                let vv  = window.sessionStorage.getItem(str)
                if(vv){
                    let vals = {key:str,value:JSON.parse(vv)}
                    this.setAidValue(vals)
                }
            }else{
                let vals = {key:str,value:JSON.parse(vv)}
                this.setAidValue(vals)
            } 
        }
        return this.aidValues.get(str);
    }

    /**
     * 图表下钻点击事件
     */
    itemClick(params:any){
        if(this.dlConfig){
            let link = this.dlConfig.slink.split(";");
            for(var i = 0;i<link.length;i++){
                let oneLink = link[i];
                let key = this.selGroup[0]
                if(this.selGroup.length ==2)
                    key+=","+ this.selGroup[1]
                key+=","+this.selValue[0]
                if(oneLink.startsWith(key)){
                    let x12 = oneLink.substring(0,oneLink.indexOf("&")).split(",")
                    x12.splice(x12.length-1,1);
                    
                    oneLink = oneLink.substring(oneLink.indexOf("&")+1,oneLink.length)
                    oneLink = oneLink.split("&");
                    let menuid = oneLink[0]
                    let me = tool.findMenu(menuid);
                    if (!me) {
                        this.$notify.error( "没有" + menuid + "菜单权限!" );
                        return false;
                    }else{
                        let jsontj:any={};
                        for(var i=1;i<oneLink.length;i++){
                            let oneTJ = oneLink[i].split("=")
                            let key = oneTJ[0];
                            let vl = oneTJ[1]
                            if(vl.indexOf("*") !=-1 ){
                                let cds = this.env.getDataSet(vl.split("*")[0]);
                                vl = cds.currRecord.data[vl.split("*")[1]]
                            }else{
                                if(x12[0] == vl){
                                    vl = this.comparedData[params.name];
                                }else if(x12[1] && x12[1] == vl){
                                    vl = this.comparedData[params.seriesName]; 
                                }else{
                                    vl = this.env.dsm.currRecord.data[vl]
                                }
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
                    break;
                }
            }
        }
    }


    //获取参照
    async getGroupFldName(item:any,j:any){ 
        var name = "";
        let code = "";
        for(let i=0;i<this.selGroup.length;i++){
            let keyName ="";
            var id = this.selGroup[i];
            code = item[id];
            var cell:any = this.getCellById(id);
            if(cell !=null)
            var rr = cell.refValue;
            if(!rr){
                keyName = code
                if(i==0){
                    name = code;
                }else{
                    name += "-"+code;
                }
                continue;
            }
            rr = rr.substring(rr.indexOf("{")+1,rr.indexOf("}"));
            if(rr !=null && rr){
                let editName = rr;
                if(rr.indexOf("$")>=0){                   
                    rr = rr.replace("$","")
                    editName = rr;
                    rr = ICL.AID_KEYCL+rr;
                    if(!this.aidValues.get(rr)){
                        let vv  = window.sessionStorage.getItem(rr)
                        if(!vv){
                            let vars = {id:300,aid:editName}
                            await this.fetchInsAid(vars);
                            let vv  = window.sessionStorage.getItem(rr)
                            if(vv){
                                let vals = {key:rr,value:JSON.parse(vv)}
                                this.setAidValue(vals)
                            }
                        }else{
                            let vals = {key:rr,value:JSON.parse(vv)}
                            this.setAidValue(vals)
                        } 
                    }
                    let cl = this.aidValues.get(rr);
                    if(cl && cl.values.length>0){
                        let key = cl.cells.cels[0].id;
                        let value = cl.cells.cels[1].id;
                        cl.values.forEach((item:any)=> { 
                            if (item[key] == code) {
                                name += item[value] + "-";
                                keyName = item[value]
                                this.tableData[j][id] = item[value];
                            }
                        });
                    }else{
                        keyName = code;
                        name += code + "-";
                    }
                }else if(rr.indexOf("&")>=0){ 
                    rr = rr.replace("&","")
                    editName = rr;
                    rr = ICL.AID_KEY+rr;
                    let vl:any = await this.getAidValues(rr+"_"+code);
                    if(vl){
                        if(vl instanceof Array){
                            vl = vl[0];
                        }
                        let ref = this.aidValues.get(rr);
                        if(vl){
                            if(vl && ref){
                                name +=vl[ref.cells.cels[ref.showColsIndex[1]].id]+"-"
                                keyName =vl[ref.cells.cels[ref.showColsIndex[1]].id]
                                this.tableData[j][id] = vl[ref.cells.cels[ref.showColsIndex[1]].id];
                            }else{
                                let vars = {id:200,aid:editName}
                                let ref1 = await this.fetchInsAid(vars); 
                                if(ref1 && ref1 != undefined){
                                    ref1 = ref1.data.data.data;
                                    name +=vl[ref1.cells.cels[ref1.showColsIndex[1]].id]+"-"
                                    keyName=vl[ref1.cells.cels[ref1.showColsIndex[1]].id]
                                    this.tableData[j][id] = vl[ref1.cells.cels[ref1.showColsIndex[1]].id];
                                }else{
                                    keyName=code
                                    name += code;
                                }
                            }
                        }
                    }
                }
            }
            this.comparedData[keyName] = code;
        }
        name = name +'';
        if (name.indexOf("-") > 0 && name.lastIndexOf("-")== name.length-1) {
            name = name.substring(0, name.length - 1);
        }
        return name;
    }
    getCellById(id:any) {
        var cc = null;
        this.tjcell.cels.forEach((item:any) => {
            if (item.id == id) {
                cc = item;
            }
        });
      return cc;
    }
    
    async getAidValues(key:string){
        let res = this.aidValues.get(key)
        if(res){
            return res;
        }
        if(!res ){
            res = JSON.parse(window.sessionStorage.getItem(key) + "");
            if(res){
                this.setAidInfo({ key: key, value: res });
                return res;
            }
        }
        if(!res){
            let karr = key.split("_"); 
            let k0 = karr[0];
            let kid = key.substring(key.indexOf("_")+1,key.lastIndexOf("_"));
            let kv = karr[karr.length-1];
            let ref = this.aidValues.get(karr[0]+"_"+kid);
            if(!ref){
                let vars = {id:200,aid:kid}
                ref = await this.fetchInsAid(vars); 
                if(ref.data.id == -1)
                    return;
                ref = ref.data.data.data
            }
            if(ref){
                let cont = ref.cells.cels[0].id+"='"+kv+"' "
                let vvs = {id:kid,key:key,cont:cont}
                return await this.fetchInsDataByCont(vvs).then((res: any) => {
                    if (res && res.data.id === 0) { 
                        return res.data.data.data.values;
                    } else {
                        this.$notify.error(res.data.message);
                    }
                })
                .catch((err: any) => {
                        
                });
            }
        }
    } 

    getFldName(id:any) {
        if(this.tjcell){
            var _idx = this.tjcell.cels.findIndex(function(cell:any) {
                return cell.id == id;
            });
            if (_idx == -1) {
                return id;
            } else {
                return this.tjcell.cels[_idx].labelString;
            }
        }
    } 
     
    getTitle() {
      var title = "";
      this.selGroup.forEach((fld:any, indx:any) => {
        title += this.getFldName(fld) + "-";
      });
      return (title = title.substring(0, title.length - 1));
    }
    /**
     * 打开全屏
     */
    openFullScreen(){
        if(this.stat.chartTypeValue=='gantt-0'){
            this.option.maxHeight=500
        }
        this.isFullScreen = true;
    }
    dlgClose(){
        if(this.stat.chartTypeValue=='gantt-0'){
            this.option.maxHeight=270
        }
        this.isFullScreen = false;
    }
    /**
     * 甘特图点击事件
     */
    async onTaskClick(data:any,event:any){
        if(event){
            let itemDom = event.path[4];
            if(itemDom){
                let cc = document.querySelector('.gantt-task-list-item-select')
                if(cc){
                    cc.classList.remove("gantt-task-list-item-select")
                }
                itemDom.classList.add("gantt-task-list-item-select");
            }
        }
        let dom:any = document.querySelector('.gantt-elastic__chart-scroll-container--horizontal')
        if(dom){
            dom.scrollTo(data.x,data.y)
        }
    }
    goTable(){
        this.$emit("goTable");
    }

    @Watch('stat')
    StatisticsWatch(){
        this.searchData(); 
    } 
    @Watch("height")
    chartHeightChange(){
        if(this.height){
            this.chartStyle = "height :"+(this.height-2)+"px;";
        }else{
            this.chartStyle = "height :400px;";
        }
    }
    /**
     * 打开菜单
     */
    openMenu(){
        this.$emit('openMenu');
    }
    //报表表尾合计
    footerMethod2({ columns, data }:any){
        const sums:any = []
        let sumData = this.tableData;
        sums.push('合计')
        this.tjcell.cels.forEach((item:any) => {
            let sumCell:any = null;
            if((item.attr & 0x2000)>0){
                for(var i=0;i<sumData.length;i++){
                    let row = sumData[i];
                    sumCell += parseFloat(row[item.id])
                }
                if(sumCell){
                    sumCell = sumCell.toFixed(item.ccPoint);
                }
            }
            sums.push(sumCell)
        })
        return [sums]
    }
    get showFooterHj(){
        this.tjcell.cels.forEach((item:any) => {
            if((item.attr & 0x2000)>0){
                return true;    
            }
        })
        return false;
    }
}
</script>
<style lang="scss" scoped>
.main-title{
    border-bottom:  1px solid #dedede;
    height: 40px;
    line-height: 40px;
    font-size: 14px;
    padding: 0 10px; 
    font-weight: 600;
    background-color: white;
    @include bip_text_primary
}
.main-title-icon {
    text-align: right;
}      
.pointer{
    cursor:pointer;
}
</style>
<style lang="scss">
.flDialog{
    .el-dialog__body{
        padding: 0px 15px;
    }
}
</style>