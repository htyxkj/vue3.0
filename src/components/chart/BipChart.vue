<template>
    <div ref="chart" style="width: 100%;height:100%;"></div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import echarts from 'echarts'; 
@Component({})
export default class BipStatisticsDialog extends Vue {
    @Prop() stat!:any; 
    @Prop() option!:any;
    @Provide() myChart:any = null;
    mounted() {  
        this.myChart = echarts.init(this.$refs.chart as HTMLCanvasElement); 
        this.myChart.setOption(this.option);  
    }
    @Watch("option")
    optionChange(){
        if(!this.myChart){
            this.myChart = echarts.init(this.$refs.chart as HTMLCanvasElement); 
        }
        this.myChart.setOption(this.option);  
    }
}
</script>