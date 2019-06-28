<template>
    <el-row v-loading.fullscreen.lock="fullscreenLoading">
        <div>
            <el-button icon="iconfont icon-bip-back" @click="goTable" size="mini">返回</el-button>
        </div>
        <div v-if="stat.showChart && option" >
            <bip-chart style="height :400px" :option="option"></bip-chart>
        </div>
        <div>
            <!-- 报表表格-->
            <vxe-table v-if="tableData && tjcell"
                ref="_vvt" border resizable size="small" highlight-hover-row show-all-overflow="tooltip"
                show-header-all-overflow class="vxe-table-element" :data.sync="tableData" 
                :optimized="true" height="200px" >
                <vxe-table-column type="index" width="60"></vxe-table-column>
                <vxe-table-column header-align="center" align="center" v-for="(cel,index) in tjcell.cels"
                    :key="index" :prop="cel.id" :label="cel.labelString" show-header-overflow show-overflow > 
                </vxe-table-column>
            </vxe-table>
            <!-- <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page.sync="cds.page.currPage"
                :page-size="cds.page.pageSize"
                :page-sizes="[10, 20, 30,40,50]"
                layout="slot,total,prev, pager, next,sizes"
                :total="cds.page.total"
            >
            <el-col :span="18" :xs="18" :sm="18" :md="18">
                <el-button-group size="small" v-if="cds.ds_par">  
                    <el-button icon="el-icon-edit" @click="addRecord"></el-button>
                    <el-button icon="el-icon-share"></el-button>
                    <el-button icon="el-icon-delete"></el-button>
                </el-button-group>
            </el-col>
            </el-pagination>  -->
        </div>
    </el-row>
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
import BipGridCellInfo from "../geditor/BipGridCellInfo.vue";
let tools = BIPUtil.ServApi;
let tool = BIPUtils.baseUtil;
import { State, Action, Getter, Mutation } from "vuex-class";

@Component({
    components: { BipChart,BipGridCellInfo}
})
export default class BipStatisticsDialog extends Vue {
    @Prop() stat!:any;
    @Prop() env!:CCliEnv; 
    @Provide() selValue:Array<any> =[];
    @Provide() selGroup:Array<any> =[];
    @Provide() option:any = null;
    @Provide() tjcell:any = null; 
    @Provide() fullscreenLoading:boolean = false;
    @Provide() tableData:any =null;

    @Getter("AID_INFOS", { namespace: "assit" }) aidMap: any;//辅助组成
    @Getter("KEY_MAPS", { namespace: "assit" }) keyMaps: any;//查没查过
    @Getter("AID_VALUES", { namespace: "assit" }) aidValues: any;//辅助的值
    @Getter("CL_INFOS", { namespace: "assit" }) clMap: any;//常量信息
    @Mutation("setAidInfo", { namespace: "assit" }) setAidInfo: any;
    @Mutation("setCLInfo", { namespace: "assit" }) setCLInfo: any;
    @Mutation("setAidValue", { namespace: "assit" }) setAidValue: any;
    @Action("fetchAssist", { namespace: "assit" }) fetchAssist: any;
    @Action("fetchCLById", { namespace: "assit" }) fetchCLById: any;
    @Action("fetchRefById", { namespace: "assit" }) fetchRefById: any;
    
    mounted() {        
        this.searchData();    
    }

    async searchData() {
        this.tjcell=null;
        this.fullscreenLoading = true;
        this.selValue = this.stat.selValue;
        this.selGroup = this.stat.selGroup;
        this.option=null;

        let param:any=null;
        let pcell,pdata,pageSize,currentPage,groupdatafilds,groupfilds,psearch;
        pdata = JSON.stringify(this.env.ds_cont.currRecord);
        pcell = this.env.dsm.ccells.obj_id;
        psearch = this.env.ds_cont.ccells.obj_id;
        groupfilds = JSON.stringify(this.selGroup);
        groupdatafilds = JSON.stringify(this.selValue);
        pageSize = 10000;
        currentPage =1; 
        param = tool.getBipStatisticsParams(pcell,pdata,pageSize,currentPage,groupfilds,groupdatafilds,psearch);
        let chartData = await tools.getFromServer(param); 
         
        this.tableData = chartData.data.data.tjpages.celData
        if(chartData.data.id == 0){
            this.tjcell = chartData.data.data.tjlayCels
            await this.initChartData(chartData);
        }else{ 
            this.$notify.warning(chartData.data.data.message);
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
        }else{
            await this.makeColumnOpitons(chartData);
        }
    }
    //饼图
    async makePieOpitons(chartData:any){  
        let chartD = chartData.data.data.tjpages.celData; 
        var id = this.selValue[0];
        var cell:any = this.getCellById(id);
        let labelString = cell.labelString 
        let pie = {
            title : {
                text: this.getTitle()+'  '+"统计", 
                x:'center'
            },
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            // legend: {
            //     x : 'center',
            //     y : 'bottom',
            // },
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
            title: {
                left: 'left',
                text: this.getTitle()+'  '+"统计", 
            },
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
                    magicType: {show: true, type: ['line', 'bar']},
                    restore: {show: true},
                    saveAsImage: {show: true}
                }
            },
            xAxis: {
                type: 'category',
                data: [],
                axisLabel: {  
                    interval:0,  
                    rotate:20  
                }  
            },
            legend: { 
            },
            yAxis: {
                type: 'value'
            },
            series: []
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
                var bb:any = { name: colname, data: [] ,type:chartType};
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
            rr = rr.substring(rr.indexOf("{"),rr.indexOf("}"));

            if(rr !=null && rr){
                if(rr.indexOf("$")>=0){                   
                    rr = rr.replace("$","")
                    let cl = this.clMap.get("CL_"+rr);
                    if(cl && cl.values.length>0){
                        cl.values.forEach((item:any)=> { 
                            if (item.code == code) {
                                name += item.name + "-";
                                this.tableData[j][id] = item.name;
                            }
                        });
                    }else{
                        let dd = await this.fetchCLById(rr);
                        let cl = this.clMap.get("CL_"+rr);
                        if(cl && cl.values.length>0){
                            cl.values.forEach((item:any)=> { 
                                if (item.code == code) {
                                    name += item.name + "-";
                                    this.tableData[j][id] = item.name;
                                }
                            });
                        }else{
                            name += code + "-";
                        }
                    }
                }else if(rr.indexOf("&")>=0){ 
                    rr = rr.replace("&","")
                    let vl:any = await this.getAidValues(rr+"_"+code);
                    if(vl && vl.length>0){
                        if(vl instanceof Array)
                            vl = vl[0];
                        let ref = this.aidMap.get(rr);
                        if(vl && ref){
                            name +=vl[ref.layCells[ref.showColsIndex[1]].id]+"-"
                            this.tableData[j][id] = vl[ref.layCells[ref.showColsIndex[1]].id];
                        }else{
                            let ref1 = await this.fetchRefById({key:rr,model:code,cont:code}); 
                            if(ref1 && ref1 != undefined){
                                ref1 = ref1.data.data.values;
                                name +=vl[ref1.layCells[ref1.showColsIndex[1]].id]+"-"
                                this.tableData[j][id] = vl[ref1.layCells[ref1.showColsIndex[1]].id];
                            }else{
                                name += code;
                            }
                        }

                    }else{
                        name +=code+"-"
                        this.tableData[j][id] = code;
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
        console.log(res)
        if(res && res.length>0){
            return res;
        }
        if(!res ){
            res = JSON.parse(window.sessionStorage.getItem(key) + "");
            if(res && res.length>0){
                this.setAidInfo({ key: key, value: res });
                return res;
            }
        }
        if(!res || res.length ==0){
            let karr = key.split("_");
            return await this.fetchAssist({ id: karr[0], value: karr[1] })
            .then((res: any) => {
                if (res && res.data.id === 0) { 
                    console.log(res) 
                    return res.data.data.values.values;
                } else {
                    this.$notify.error(res.message);
                }
            })
            .catch((err: any) => {
                    
            });
        }
    } 
    getFldName(id:any) {
      var _idx = this.tjcell.cels.findIndex(function(cell:any) {
        return cell.id == id;
      });
      if (_idx == -1) {
        return id;
      } else {
        return this.tjcell.cels[_idx].labelString;
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
}
</script>

<style lang="scss"> 
</style>