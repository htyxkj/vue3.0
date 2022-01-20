<template> 
    <el-container>
        <el-header style="height:45px;padding:0px 10px;border-bottom: 1px solid #CCCCCC;    line-height: 45px;">
            <Accounting @dataChange="accChange" class="topdiv1"></Accounting> 
            <!-- <Period class="topdiv1" :calendar_id="calendar_id" @dataChange="fm_Period_change"></Period> -->
              <el-date-picker v-model="fm_date" format="yyyy-MM-dd" class="topdiv1" type="date" @change="fm_dateChange"  placeholder="选择日期" size="small"></el-date-picker>
            <div class="topdiv2"><!-- 刷新 -->
                <el-button style="border:0px" @click="initData">      
                    <i class="el-icon-refresh-right"></i>
                    <span>刷新</span>
                </el-button>
            </div>
        </el-header>
        <el-container>
          <!--   <el-aside width="300px"> -->
                <amb-tree class="el-tree-node_content" :style="'height:'+treeHeight+'px'" @dataChange="treeChange" :purposesId="amb_purposes_id" :showCbox="true" ></amb-tree>
          <!--   </el-aside> -->
            <el-main style="padding:0px">
                <bip-chart :style="chartStyle" :option="chartOption" :chartStyle="chartStyle"></bip-chart>
            </el-main>
        </el-container>
    </el-container>
</template>
<script lang="ts">
import { Component, Vue, Provide, Watch } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from 'vuex-class';
import Accounting from "../components/Accounting.vue"//核算目的
import AmbTree from "../components/AmbTree.vue"//阿米巴树
import Period from "../components/Period.vue"//阿米期间
import BipChart from "@/components/chart/BipChart.vue"
import { BIPUtil } from "@/utils/Request";
import {BipMenuBtn} from '@/classes/BipMenuBtn'
import moment from 'moment';
let tools = BIPUtil.ServApi;
import XEUtils from 'xe-utils'
import { values } from 'xe-utils/methods';
@Component({
    components: {
        Accounting,
        AmbTree,
        Period,
        BipChart
    }
})
/**
 * 经营成果排名
 */
export default class ManageResultsRank extends Vue {
    @State('bipComHeight', { namespace: 'login' }) height!: number;
    amb_purposes_id:string = "";//核算目的id
    amb_group_ids:any =[];//核算阿米巴key
    calendar_id:any = "";
/*     fm_period_id:any = "";//开始期间
    to_period_id:any = "";//结束期间 */
    fm_date:any="" //开始期间
    treeHeight:any ="500";
    chartStyle:string = "height :400px;";
    chartOption:any = null;
    async created() {
        this.fm_date = moment(new Date()).add(-1, 'days').format("YYYY-MM-DD")
        this.treeHeight =  this.height -60
        this.initChartOption();
    }
    initChartOption(){
        this.chartOption = null;
        return  { 
            tooltip: {
                trigger: 'axis'
            }, 
            legend: {
                data: ['收入', '成本', '利润']
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            }, 
            xAxis: {
                type: 'value',
                name: 'Days',
                axisLabel: {
                    formatter: '{value}'
                }
            },
            yAxis: {
                type: 'category',
                data: [], 
            },
            series: [
                {
                    name: '收入',
                    type: 'bar',
                    data: [],
                    label: {
                        show: true,
                        textBorderColor: '#333',
                        textBorderWidth: 2
                    },
                },
                {
                    name: '成本',
                    type: 'bar',
                    label: {
                        show: true,
                        textBorderColor: '#333',
                        textBorderWidth: 2
                    },
                    data: []
                },
                {
                    name: '利润',
                    type: 'bar',
                    label: {
                        show: true,
                        textBorderColor: '#333',
                        textBorderWidth: 2
                    },
                    data: []
                }
            ]
        };
    }
    async initData(){
        let option:any = this.initChartOption();
        if(this.amb_purposes_id !="" && this.amb_group_ids.length>0 && this.fm_date){
            let btn1 = new BipMenuBtn("DLG","经营趋势分析")
            btn1.setDlgType("D")
            btn1.setDlgCont("amb.serv.util.report.ProfitsInvoke*202;0;0");//职能损益表
            let b = JSON.stringify(btn1)
            let prarm = {
                "purpose_id":this.amb_purposes_id,//核算目的
                "group_ids":this.amb_group_ids, //阿米巴集合
                /* "fm_period_id":this.fm_period_id,//开始期间
                "to_period_id":this.to_period_id   //结束期间 */
                "fm_date":this.fm_date,
                "to_date":this.fm_date
            }

            let v = JSON.stringify(prarm);
            let res = await tools.getDlgRunClass(v,b);
            let tdata = []; 
            if(res.data.id ==0){
                tdata = res.data.data.data  
                for(var i=0;i<tdata.length;i++){
                    let row = tdata[i];
                    option.yAxis.data.push(row.group_name);
                    option.series[0].data.push(parseFloat(row.in_money).toFixed(2))
                    option.series[1].data.push(parseFloat(row.out_money).toFixed(2))
                    option.series[2].data.push(parseFloat(row.bal_money).toFixed(2))
                } 
                this.chartOption = option
            }else{
                this.$notify.error(res.data.message)
            }
        }
    }
    
    //核算目的发生变化 value = 核算目的ID
    accChange(value:any){
        this.amb_purposes_id = value.id;
        this.calendar_id = value.calendar_id
        this.initData();
    }
    //期间发生变化
/*     fm_Period_change(value:any){
        this.fm_period_id = value;
        this.to_period_id = value;
        // this.initData();
    } */
    fm_dateChange(value:any){
        this.fm_date = moment(value).format("YYYY-MM-DD")       
    }
    //阿米巴发生变化
    treeChange(checkData:any){
        this.amb_group_ids = checkData.keys;
        this.initData();
    }
    @Watch("height")
    heightChange() {
        this.treeHeight =  this.height -60
    }
}
</script>
<style scoped lang="scss" >
.el-tree-node_content{font-family: "Microsoft YaHei"; font-size:12px !important}
.topdiv1{
    float: left;
    margin-right: 3px;
}
.topdiv2{
    float: right;
    margin-right: 3px;
}
</style>