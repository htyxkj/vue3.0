<template>
    <div class="month_statistics_scrollbar">
        <el-scrollbar style="height:600px" >
            <!-- 条件区域 -->
            <el-row style="padding-top:5px">
                <el-form @submit.native.prevent label-position="right" label-width="110px">
                    <template v-for="(cel,index) in tj_cell.ccells.cels">
                        <div :key="index" v-if="index == 0">
                            <bip-comm-editor v-if="(cel.attr&0x400) <= 0 " :cell="cel" :bgrid="false" :cds="tj_cell" :row="0"/>
                        </div>
                    </template>
                    <el-col :span="4" style="padding-right: 5px;">
                        <el-form-item label="周数" class="bip-input-item" :required="true"> 
                            <el-select v-model="weekNum" placeholder="请选择" size="medium" class="el-input-group">
                                <el-option v-for="item in weekNumOption" :key="item.value" :label="item.label" :value="item.value"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <template v-for="(cel,index) in tj_cell.ccells.cels">
                        <div :key="index" v-if="index > 0">
                            <bip-comm-editor v-if="(cel.attr&0x400) <= 0 " :cell="cel" :bgrid="false" :cds="tj_cell" :row="0"/>
                        </div>
                    </template>
                </el-form>
                <el-col :span="6">
                    <el-button type="primary" size="medium" icon="el-icon-search" @click="selData()">搜索</el-button>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="24">
                    <el-row v-show="showChartmx">
                        <el-col :span="12">
                            <div ref="monthChart1" style="height:400px" class="chart"></div>
                        </el-col>
                        <el-col :span="12">
                            <div ref="monthChart2" style="height:400px" class="chart"></div>
                        </el-col>
                    </el-row>
                </el-col>
                <el-col :span="24">
                    <div ref="monthChart3" style="height:400px" class="chart"></div>
                </el-col>
            </el-row>
        </el-scrollbar>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import {BipMenuBtn} from '@/classes/BipMenuBtn'
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi;
import CDataSet from '@/classes/pub/CDataSet';
import { Cells } from "@/classes/pub/coob/Cells";
import echarts from 'echarts'; 
import moment from "moment"
@Component({

})
export default class YearStatistics extends Vue{
    obj_id:any ="WEBSTATWEEKTJ";
    tj_cell:CDataSet = new CDataSet("");
    color:any = ["#3AA1FF","#975FE5","#F2637B","#FBD437","#4ECB73","#5AD4D4"];
    showChartmx:boolean = true;
    weekNum:any =1;
    weekNumOption:any = [];
    async created(){
        await this.initTjCell();
        setTimeout(() => {
            this.selData();
        }, 100);
    }
    async mounted(){
    }
    //查询数据
    async　selData(){
        let bok = this.checkNotNull(this.tj_cell); 
        if(!bok)
            return ;
        this.tj_cell.currRecord.data.weeknum = this.weekNum;
        let btn1 = new BipMenuBtn("DLG"," 周统计")
        btn1.setDlgType("D")
        btn1.setDlgCont("trainPro.serv.TrainingStatisticsServ*202;0;0");//修复
        let b = JSON.stringify(btn1) 
        let prarm = this.tj_cell.currRecord.data
        let v = JSON.stringify(prarm);
        let res = await tools.getDlgRunClass(v,b);
        if(res.data.id ==0){
            let chart1 = res.data.data.chart1;
            if(chart1){
                this.showChartmx = true;
                this.initChart1(chart1)
            }else{
                this.showChartmx = false;
            }
            let chart2 = res.data.data.chart2;
            if(chart2){
                this.showChartmx = true;
                this.initChart2(chart2);
            }else{
                this.showChartmx = false;
            }
            let chart3 = res.data.data.chart3;
            if(chart3){
                this.initChart3(chart3);
            }
        }
    }
    initChart1(chart1:any){
        let c1Option:any = {
            color:this.color,
            title: {
                text: '训练时长统计',
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            legend: {
                data: ['计划', '实际']
            },
            grid: {
                left: '3%',
                right: '9%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'value',
                boundaryGap: [0, 0.01]
            },
            yAxis: {
                type: 'category',
                data: []
            },
            dataZoom: [
                {
                    type: 'inside',
                    start: 0,
                    end: 100,
                    yAxisIndex: 0,
                },{
                    type: 'slider',
                    show: true,
                    yAxisIndex: 0,
                    width: 20,
                    height: '80%',
                    left: '92%'
                }
            ],
            series: [
                {
                    name: '计划',
                    type: 'bar',
                    data: []
                },
                {
                    name: '实际',
                    type: 'bar',
                    data: []
                }
            ]
        };
        let title = "";
        for(var i=0;i<chart1.length;i++){
            title = chart1[i].sorg+"训练时长统计";
            c1Option.yAxis.data.push(chart1[i].type)
            c1Option.series[0].data.push(chart1[i].plantime)
            c1Option.series[1].data.push(chart1[i].percentage)
        }
        c1Option.title.text = title;
        let chart1Chart = echarts.init(this.$refs.monthChart1 as HTMLCanvasElement); 
        chart1Chart.setOption(c1Option);  
    }
    initChart2(chart2:any){
        let option:any = {
            color:this.color,
            title: {
                text: '各周实际训练时长统计'
            },
            legend: {
                data: []
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            grid: {
                left: '3%',
                right: '9%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: []
            },
            yAxis: {
                type: 'value'
            },
            series: [
            ]
        };
        let xAxis = [];
        let legend = [];
        for(var i=0;i<chart2.length;i++){
            xAxis.push(chart2[i].week)
            legend.push(chart2[i].type);
        }
        legend = Array.from(new Set(legend));
        xAxis = Array.from(new Set(xAxis));
        option.legend.data = legend;
        option.xAxis.data = xAxis;
        let series = [];
        for(var i=0;i<legend.length;i++){
            let one_sj:any = {
                name: legend[i],
                type: 'line',
                data: []
            }
            for(var j=0;j<xAxis.length;j++){
                let type = xAxis[j];
                for(var z=0;z<chart2.length;z++){
                    if(chart2[z].week == type &&chart2[z].type == legend[i]){
                        one_sj.data.push(chart2[z].percentage)
                        break;
                    }
                }
            }
            series.push(one_sj)
        }
        option.series = series;
        let monthChart2 = echarts.init(this.$refs.monthChart2 as HTMLCanvasElement); 
        monthChart2.setOption(option);
    }
    initChart3(chart3:any){
        let c1Option:any = {
            color:this.color,
            title: {
                text: '各部门训练时长统计',
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            legend: {
                data: []
            },
            grid: {
                left: '3%',
                right: '3%',
                bottom: '9%',
                containLabel: true
            },
            yAxis: {
                type: 'value',
                boundaryGap: [0, 0.01]
            },
            xAxis: {
                type: 'category',
                data: []
            },
            dataZoom: [
                {
                show: true,
                start: 0,
                end: 100
                },
                {
                    type: 'inside',
                    start: 0,
                    end: 100
                }
            ],
            series: [ 
            ]
        };
        let legend = [];
        let legend1 = [];
        let xAxis = [];
        for(var i=0;i<chart3.length;i++){
            legend.push(chart3[i].type);
            xAxis.push(chart3[i].sorg)
            legend1.push(chart3[i].type+'(计划)');
            legend1.push(chart3[i].type+'(实际)');
        }
        legend = Array.from(new Set(legend));
        xAxis = Array.from(new Set(xAxis));
        legend1 = Array.from(new Set(legend1));
        let series = [];
        for(var i=0;i<legend.length;i++){
            let one_jh:any = {
                name: legend[i]+'(计划)',
                type: 'bar',
                data: []
            }
            let one_sj:any = {
                name: legend[i]+'(实际)',
                type: 'bar',
                data: []
            }
            for(var j=0;j<xAxis.length;j++){
                let sorg = xAxis[j];
                for(var z=0;z<chart3.length;z++){
                    if(chart3[z].sorg == sorg &&　chart3[z].type == legend[i]){
                        one_jh.data.push(chart3[z].plantime);
                        one_sj.data.push(chart3[z].percentage)
                        break;
                    }
                }
            }
            series.push(one_jh)
            series.push(one_sj)
        }
        c1Option.legend.data = legend1;
        c1Option.xAxis.data = xAxis;
        c1Option.series = series;
        let chart1Chart = echarts.init(this.$refs.monthChart3 as HTMLCanvasElement); 
        chart1Chart.setOption(c1Option);  
    }
    //获取对象
    async initTjCell(){
        let res = await tools.getCCellsParams(this.obj_id); 
        let rtn = res.data;
        if (rtn.id == 0) {
            let kn: Array<Cells> = rtn.data.layCels;
            this.tj_cell = new CDataSet(kn[0]);
            this.tj_cell.createRecord();
        }
    }
    @Watch("tj_cell.currRecord.data.month",{deep:true})
    tjChange(){
        let date = this.tj_cell.currRecord.data.month+"-01";
        let days = moment(date).endOf('month').date();
        let wkn = days/7
        wkn = Math.ceil(wkn);
        this.weekNumOption = [];
        for(var i=0;i<wkn;i++){
            let d1={value:(i+1),label:"第"+(i+1)+"周"}
            this.weekNumOption.push(d1);
        }
        this.weekNum = 1;
    }
    checkNotNull(cds:CDataSet):boolean{
        let bok = true;
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
        return bok;
    }
}
</script>
<style lang="scss">
.month_statistics_scrollbar{
    .el-scrollbar__wrap{
        overflow-x: hidden;
    }
    .el-scrollbar__bar.is-horizontal {
        display: none;
    }
}
</style>