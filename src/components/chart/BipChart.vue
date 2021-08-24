<template>
    <div :ref="chartId" :style="chartStyle" class="chart"></div>
</template>
<script lang="ts">
/**
 * echarts 图表通用组件
 */
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import echarts from 'echarts'; 
@Component({})
export default class BipChart extends Vue {
    @Prop() stat!:any; 
    @Prop() option!:any;
    @Prop() chartStyle!:string;
    chartId:any = new Date().getTime();
    myChart:any = null;
    componentsizechangeBusID:any = null;
    mounted() {  
        this.myChart = echarts.init(this.$refs[this.chartId] as HTMLCanvasElement); 
        if(this.option){
            this.myChart.setOption(this.option);  
            this.componentsizechangeBusID= this.$bus.$on('componentsizechange',this.sizeChange)
            let _this = this;
            this.myChart.on('click',(params:any)=>{
                _this.itemClick(params)
            })
        }
        window.onresize = () => {
            this.sizeChange();
        }
    }
    itemClick(params:any){
        this.$emit("itemClick",params)
    }
    @Watch("option")
    optionChange(){
        if(this.option){
            if(!this.myChart){
                this.myChart = echarts.init(this.$refs.chart as HTMLCanvasElement); 
            }
            this.myChart.setOption(this.option);  
        }
    }
    @Watch("chartStyle")
    styleChange(){
        this.sizeChange();
    }
    sizeChange(){
        if(this.myChart)
        this.myChart.resize();
    }
    beforeDestroy(){
        this.$bus.$off('componentsizechange',this.componentsizechangeBusID)
    }
    @Watch("$route")
    changeRoute(){
        if(this.$route && this.$route.name =="Home"){
            this.sizeChange();
        }
    }
}
</script>
<style scoped>
.chart{
    background-color:#ffffff;
    width: 100%;
}
</style>