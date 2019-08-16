<template>
    <div ref="chart" :style="chartStyle" class="chart"></div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import echarts from 'echarts'; 
@Component({})
export default class BipStatisticsDialog extends Vue {
    @Prop() stat!:any; 
    @Prop() option!:any;
    @Prop() chartStyle!:string;
    @Provide() myChart:any = null;
    @Provide() componentsizechangeBusID:any = null;
    mounted() {  
        this.myChart = echarts.init(this.$refs.chart as HTMLCanvasElement); 
        this.myChart.setOption(this.option);  
        this.componentsizechangeBusID= this.$bus.$on('componentsizechange',this.sizeChange)
    }
    @Watch("option")
    optionChange(){
        if(!this.myChart){
            this.myChart = echarts.init(this.$refs.chart as HTMLCanvasElement); 
        }
        this.myChart.setOption(this.option);  
    }
    @Watch("chartStyle")
    styleChange(){
        this.sizeChange();
    }
    sizeChange(){
        this.myChart.resize();
    }
    beforeDestroy(){
        this.$bus.$off('componentsizechange',this.componentsizechangeBusID)
    }
}
</script>
<style scoped>
.chart{
    background-color:#ffffff;
    width: 100%;
}
</style>