<template>
    <el-row>
        <el-col :span="6" v-for="(item,index) in chartOption" :key="index">
            <el-row>
                <el-col :span="24" class="title">{{item.series[0].name}}</el-col>
                <el-col :span="24">
                    <bip-chart :style="item.chartStyle" :option="item" :chartStyle="chartStyle"></bip-chart>
                </el-col>
            </el-row>
        </el-col>
    </el-row>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import { BIPUtil } from "@/utils/Request";
import BipChart from "@/components/chart/BipChart.vue"
@Component({
  components: {BipChart}
})
export default class Proportion extends Vue {
    @Prop() codeValue!:any;
    @Prop() chartHeight!:number;
    chartOption:any = [];
    chartStyle:any ='height:'+(this.chartHeight-30)+'px;'
    mounted(){
        this.init();
    }
    async init(){
        this.chartOption = [];
        for(var i=0;i<this.codeValue.length;i++){
            let v1 = this.codeValue[i];
            let st = v1.style;
            if(st == "1"){
                let option = await this.initStyle1(v1);
                if(option){
                    this.chartOption.push(option);
                }
            }
            
        }
    }
    async initStyle1(v1:any){
        let total = v1.total;
        let value = v1.value;
        let name = v1.name;
        let res = await BIPUtil.ServApi.getBipLongTextData(total,undefined);
        let cont = null;
        if(res.data.code == 200){
            cont = res.data.data.count
        }
        res = await BIPUtil.ServApi.getBipLongTextData(value,undefined);
        let vv = null;
        if(res.data.code == 200){
            vv = res.data.data.count
        }
        if(cont != null && vv != null){
            let _vv = vv/cont * 100;
            cont = 100 - _vv
            let centerValue = "　"+vv+"　";
            var srData = [];
            srData.push({value:_vv,name:centerValue,textStyle: {color: "#3999dd"}});
            srData.push({value:cont});
            var srRing = {
                color:	['#02A7F0','#DDDDDD'],
                series: [{
                    hoverAnimation:false,
                    name: name,
                    type: 'pie',
                    radius: ['70%', '90%'],
                    center:['50%','50%'],
                    labelLine: {normal: {show: false}},
                    data: srData,
                    label: {
                        normal: {
                            show: true,
                            position: 'center',
                            textStyle: {
                                fontSize: '35',
                                fontWeight: 'bold'
                            }
                        }
                    },
                }]
            };
            return srRing;
        }
    }
    @Watch("codeValue")
    contChange(){
        this.init();
    }
    @Watch("chartHeight")
    chartHeightChange(){
        this.chartStyle = 'height:'+(this.chartHeight-30)+'px;';
    }
}
</script>
<style lang="scss" scoped>
    .title {
        text-align: center;
        color: #333333;
        font-size: 18px;
    }
</style>