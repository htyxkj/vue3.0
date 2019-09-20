<template> 
<div class="bipchart">
    <el-row v-loading.fullscreen.lock="fullscreenLoading" class="bi-chart">
        <div class="titlebg">
            <el-row>
                <el-col :span="24" >
                    <div class="charttitle">
                        <el-row>
                            <el-col :span="20">
                                <div class="charttitle-left">
                                    <el-button v-if="showBack" icon="iconfont icon-bip-back" @click="goTable" size="mini" class="returnbak">
                                        返回
                                    </el-button>
                                    <i class="iconfont icon-bip-shuju"></i>
                                    <template v-if="title">
                                        {{title}}  
                                    </template>
                                    <template v-else> 
                                        统计维度：{{this.getTitle()}}
                                    </template>
                                </div>
                            </el-col>
                            <el-col :span="4">
                                <div class="charttitle-right">
                                    <i class="iconfont icon-bip-kucun"></i> 
                                    <span>MORE</span>
                                </div>
                            </el-col>
                        </el-row>

                     </div>
                </el-col>
            </el-row>
        </div>
        <div v-if="stat.showChart && option"  class="showchart" >
            <bip-chart :style="chartStyle" :option="option" :chartStyle="chartStyle"></bip-chart>
        </div>
        <div>
            <!-- 报表表格-->
            <vxe-table v-if="tableData && tjcell && showTable"
                ref="_vvt" border resizable size="small" highlight-hover-row show-all-overflow="tooltip"
                show-header-all-overflow class="vxe-table-element" :data.sync="tableData" 
                :optimized="true" height="350px">
                <vxe-table-column type="index" width="60"></vxe-table-column>
                <vxe-table-column header-align="center" align="center" v-for="(cel,index) in tjcell.cels"
                    :key="index" :prop="cel.id" :label="cel.labelString" show-header-overflow show-overflow > 
                </vxe-table-column>
            </vxe-table>
        </div>
    </el-row>
</div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import CDataSet from "@/classes/pub/CDataSet";
import SearchEntity from "@/classes/SearchEntity";
import CCliEnv from "@/classes/cenv/CCliEnv";
import { BIPUtil } from "@/utils/Request";
import { BIPUtils } from "@/utils/BaseUtil";
import echarts from 'echarts';
import BipChart from "@/components/chart/BipChart.vue"
import QueryEntity from "@/classes/search/QueryEntity";
let tools = BIPUtil.ServApi;
let tool = BIPUtils.baseUtil;
import { State, Action, Getter, Mutation } from "vuex-class";
import {CommICL} from '@/utils/CommICL'
let ICL = CommICL
@Component({
    components: { BipChart}
})
export default class BipStatisticsDialog extends Vue {
    @Prop() stat!:any;
    @Prop() env!:CCliEnv; 
    @Prop() showBack!:boolean
    @Prop() showTable!:boolean
    @Prop() height!:number;
    @Provide() selValue:Array<any> =[];
    @Provide() selGroup:Array<any> =[];
    @Provide() option:any = null;
    @Provide() tjcell:any = null; 
    @Provide() fullscreenLoading:boolean = false;
    @Provide() tableData:any =null;
    @Provide() title:any = null;
    @Provide() chartStyle:string = "height :400px;";

    @State("aidValues", { namespace: "insaid" }) aidValues: any;
    @Action("fetchInsAid", { namespace: "insaid" }) fetchInsAid: any;
    @Mutation("setAidValue", { namespace: "insaid" }) setAidValue: any;
    @Mutation("setAidInfo", { namespace: "insaid" }) setAidInfo: any;
    @Action("fetchInsDataByCont", { namespace: "insaid" }) fetchInsDataByCont: any;
    mounted() {
        if(this.height){
            this.chartStyle = "height :"+(this.height-50)+"px;";
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
        qe.cont = JSON.stringify(this.env.ds_cont.currRecord.data);
        param = tool.getBipStatisticsParams(JSON.stringify(qe),groupfilds,groupdatafilds);
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
    // data:
    // data:
    // tjlayCels: {pkid: 0, obj_id: "60HTA111TJ", x_co: -1, editble: true, cels: Array(4), …}
    // tjpages: {celData: Array(0), queryCriteria: "ht.sid>='0' and [%Dht.hpdate=2019-06-21]", totalItem: 0, totalPage: 0, orderBy: "", …}
    // __proto__: Object
    // id: 0
    // message: "操作成功！"
    // __proto__: Object

    // chartTypeValue: "line"
    // selGroup: (2) ["ht.cdic", "ht.sorg", __ob__: Observer]
    // selValue: (2) ["hta.qty", "hta.usd", __ob__: Observer]
    // showChart: true
    async initChartData(chartData:any){
        if(this.stat.chartTypeValue == "pie"){
            await this.makePieOpitons(chartData);
        }else if ( this.stat.chartTypeValue =="barGraph"){
            await this.makebarGraph(chartData);
        }else if( this.stat.chartTypeValue == "pieAnnular"){
            await this.makepieAnnular(chartData);
        }else {
            await this.makeColumnOpitons(chartData);
        }
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
                                if(cc >colorList.length)
                                    cc = cc -colorList.length;
                                return colorList[cc];
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
                    // magicType: {show: true, type: ['line', 'bar']},
                    // restore: {show: true},
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
                left: '1%',
                right: '1%',
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
                                    if(cc >colorList.length)
                                        cc = cc -colorList.length;
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
                                if(cc >colorList.length)
                                    cc = cc -colorList.length;
                                return colorList[cc];
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
                    // magicType: {show: true, type: ['line', 'bar']},
                    // restore: {show: true},
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
                left: '1%',
                right: '1%',
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
                                    if(cc >colorList.length)
                                        cc = cc -colorList.length;
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
                    if(cc >colorList.length)
                        cc = cc -colorList.length;
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
    //获取参照
    async getGroupFldName(item:any,j:any){ 
        var name = "";
        for(let i=0;i<this.selGroup.length;i++){
            var id = this.selGroup[i];
            var code = item[id];
            var cell:any = this.getCellById(id);
            if(cell !=null)
            var rr = cell.refValue;
            if(!rr)
                return code;
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
                        let key = cl.cells.cels[0].labelString;
                        let value = cl.cells.cels[1].labelString;
                        cl.values.forEach((item:any)=> { 
                            if (item[key] == code) {
                                name += item[value] + "-";
                                this.tableData[j][id] = item[value];
                            }
                        });
                    }else{
                        name += code + "-";
                    }
                }else if(rr.indexOf("&")>=0){ 
                    rr = rr.replace("&","")
                    editName = rr;
                    rr = ICL.AID_KEY+rr;
                    let vl:any = await this.getAidValues(rr+"_"+code);
                    if(vl){
                        if(vl instanceof Array)
                            vl = vl[0];
                        let ref = this.aidValues.get(rr);
                        if(vl && ref){
                            name +=vl[ref.cells.cels[ref.showColsIndex[1]].id]+"-"
                            this.tableData[j][id] = vl[ref.cells.cels[ref.showColsIndex[1]].id];
                        }else{
                            let vars = {id:200,aid:editName}
                            let ref1 = await this.fetchInsAid(vars); 
                            if(ref1 && ref1 != undefined){
                                ref1 = ref1.data.data.data;
                                name +=vl[ref1.cells.cels[ref1.showColsIndex[1]].id]+"-"
                                this.tableData[j][id] = vl[ref1.cells.cels[ref1.showColsIndex[1]].id];
                            }else{
                                name += code;
                            }
                        }
                    }
                }
            } 
        }
        if (name.indexOf("-") > 0) name = name.substring(0, name.length - 1);
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
            let ref = this.aidValues.get(karr[0]+"_"+karr[1]);
            if(!ref){
                let vars = {id:200,aid:karr[1]}
                ref = await this.fetchInsAid(vars); 
                ref = ref.data.data.data
            }
            if(ref){
                let cont = ref.cells.cels[0].id+"='"+karr[2]+"' "
                let vvs = {id:karr[1],key:key,cont:cont}
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
            this.chartStyle = "height :"+(this.height-50)+"px;";
        }else{
            this.chartStyle = "height :400px;";
        }
    }
}
</script>