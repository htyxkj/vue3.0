<template> 
    <el-container>
        <el-header style="height:45px;padding:0px 10px;border-bottom: 1px solid #CCCCCC;    line-height: 45px;">
            <Accounting @dataChange="accChange" class="topdiv1"></Accounting> 
            <el-date-picker v-model="fm_date" format="yyyy-MM-dd" class="topdiv1" type="date" @change="fm_dateChange"  placeholder="选择日期" size="small"></el-date-picker>
            <el-date-picker v-model="to_date" format="yyyy-MM-dd" class="topdiv1" type="date" @change="to_dateChange"  placeholder="选择日期" size="small"></el-date-picker>
            <accounting-ele-dialog @dataChange="check_accountEle"  class="topdiv1" :purposesId="amb_purposes_id" :showCbox="false"></accounting-ele-dialog>
            <div class="topdiv1">
                <el-button style="border:0px" type="primary" size="small" class="bip_btn_primary" @click="initData">      
                    <i class="el-icon-search"></i>
                    <span>查询</span>
                </el-button>
            </div>
        </el-header>  
        <el-container>
            <el-aside width="300px">
                <amb-tree :style="'height:'+treeHeight+'px'" @dataChange="check_ambtree" :purposesId="amb_purposes_id" :showCbox="true" ></amb-tree>
            </el-aside>
            <el-main style="padding:0px">
               <div ref="EssentialFactorTrendChart" style="height:460px;margin-top:80px;" ></div>
            </el-main>
        </el-container>
    </el-container>
</template>
<script lang="ts">
import { Component, Vue, Provide, Watch } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from 'vuex-class';
import Accounting from "../components/Accounting.vue"//核算目的
import AccountingEleDialog from "../components/AccountingEleDialog .vue" //核算要素
import AmbTree from "../components/AmbTree.vue"//阿米巴树
import Period from "../components/Period.vue"//阿米期间
import { BIPUtil } from "@/utils/Request";
import {BipMenuBtn} from '@/classes/BipMenuBtn'
import moment from 'moment';
let tools = BIPUtil.ServApi;
import XEUtils, { template, toJSONString } from 'xe-utils'
import { values } from 'xe-utils/methods';
import { keys } from "node_modules/_highcharts@9.3.0@highcharts/highcharts";
import echarts from 'echarts';
@Component({
    components: {
        Accounting,
        AccountingEleDialog,
        AmbTree,
        Period
    }
})
/**
 * 多巴指标趋势分析
 */
export default class MultipleEssentialFactorTrend extends Vue {
    @State('bipComHeight', { namespace: 'login' }) height!: number;
    amb_purposes_id:string = "";//核算目的id
    amb_accountEle_ids:any =[];//核算要素key
    amb_groups_ids:any=[]; //阿米巴巴集合KEY
    // calendar_id:any = "";
    fm_date:any =""; //开始时间
    to_date:any=""; //结束时间  
    treeHeight:any ="500";
    chartStyle:string = "height :400px;";

    perioddata:any = []; //期间集合
    
    async created() {
        this.fm_date = moment(new Date()).add(-1, 'days').format("YYYY-MM-DD")
        this.to_date = moment(new Date()).add(-1, 'days').format("YYYY-MM-DD")
        this.treeHeight =  this.height -60
    }

    async initData(){
        let seriesP:any={};

        let qjData:any=[];
            let option:any={
            title:{
              text: '',
              x:'center',
              y:'top',
              top:'middle',
              textStyle:{
                  color:'#909399',
                  fontStyle:'微软雅⿊',
                  fontSize:'26px',
              }
            },
            dataset:{
                 source: []
            },
            legend: {},
            tooltip: {
                trigger: 'axis'
            },
            xAxis: {
                type: 'category'
                
            },
            yAxis: {gridIndex: 0},
            series: []
            }



        if(this.amb_purposes_id !="" && this.amb_accountEle_ids.length>0 && this.amb_groups_ids.length>0){
            let btn1 = new BipMenuBtn("DLG","多巴指标趋势分析")
            btn1.setDlgType("D")
            btn1.setDlgCont("amb.serv.util.report.IncomeInvoke*206;0;0");//
            let b = JSON.stringify(btn1)
            let prarm = {
                "purpose_id":this.amb_purposes_id,//核算目的
                "amb_accountEle_ids":this.amb_accountEle_ids, //核算要素key
                "group_ids":this.amb_groups_ids,//阿米巴巴 集合
                "fm_date":this.fm_date,//开始时间
                "to_date":this.to_date   //结束时间
            }
            let v = JSON.stringify(prarm);
            let res = await tools.getDlgRunClass(v,b);
            
            let tdata:any = []; 
            if(res.data.id ==0){
               
                if(res.data.data.data.length>0){
                tdata = res.data.data.data  // 要素 金额数据
                this.perioddata = res.data.data.period; //期间数据
                qjData.push('qj');
                    for(var j=0;j<this.perioddata.length;j++){
                        qjData.push(this.perioddata[j].name)     
                    }
                    option.dataset.source.push(qjData);
                    for(var i=0;i<tdata.length;i++){  
                        
                        seriesP = {
                            type: 'line', 
                            smooth: false, 
                            seriesLayoutBy: 'row'
                            };
                        let fseData:any =[];
                        fseData.push(tdata[i].group_name); 
                    
                        for(var z=0;z<this.perioddata.length;z++){
                            fseData.push(parseFloat(tdata[i][this.perioddata[z].key+'month_money']));   
                        } 
                        
                        option.dataset.source.push(fseData);
                        option.series.push(seriesP);
                    
                    } 
                    let myChart = echarts.init(this.$refs.EssentialFactorTrendChart as HTMLCanvasElement); 
                    myChart.setOption(option,true);

               }else{
                    option.title.text="暂无数据"
                    option.dataset.source=[];
                    option.series=[];
                    let myChart = echarts.init(this.$refs.EssentialFactorTrendChart as HTMLCanvasElement); 
                    myChart.setOption(option,true);        
               }      
            }else{
                this.$notify.error(res.data.message)
            } 
        } else{
            console.info("2222");
            console.info("this.amb_purposes_id:"+this.amb_purposes_id);
            console.info("this.amb_accountEle_ids.length:"+this.amb_accountEle_ids.length);
            console.info("this.amb_groups_ids.length:"+this.amb_groups_ids.length);
            

            if(this.amb_purposes_id==""){
                this.$notify.error("核算目的不能为空！")
            }else if(this.amb_accountEle_ids.length ==0){
                this.$notify.error("核算要素不能为空！")
            }else if(this.amb_groups_ids.length == 0){
                this.$notify.error("请选择阿米巴！")
            }

        }

       
    }
    
    //核算目的发生变化 value = 核算目的ID
    accChange(value:any){
        this.amb_purposes_id = value.id;
        //this.calendar_id = value.calendar_id
        // this.initData();
    }
  
    //选择阿米巴
    check_ambtree(checkData:any){
        this.amb_groups_ids = checkData.keys;
    }
    //选择核算要素
    check_accountEle(checkData:any){
        this.amb_accountEle_ids = checkData.keys;
    }

   //期间发生变化
    fm_dateChange(value:any){
        this.fm_date = moment(value).format("YYYY-MM-DD")       
    }
    //期间发生变化
    to_dateChange(value:any){
        this.to_date = moment(value).format("YYYY-MM-DD")  
    }
    @Watch("height")
    heightChange() {
        this.treeHeight =  this.height -60
    }

   
}
</script>
<style scoped lang="scss" >
.topdiv1{
    float: left;
    margin-right: 3px;
}
.topdiv2{
    float: right;
    margin-right: 3px;

    
}
</style>