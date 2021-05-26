<template v-if="showFType">
    <el-dialog title="图表选择" class="bip-search" width="50%" :visible.sync="showFType" :append-to-body="true" :close-on-press-escape="false" :close-on-click-modal="false">
        <el-tabs tab-position="left" style="height: 380px;">
            <el-tab-pane>
                <span slot="label" class="echarts-label"><i class="el-icon-date"></i>折线图</span>
                <el-row>
                    <el-col>
                        <el-switch v-model="smooth" active-text="平滑显示" inactive-text=""></el-switch>
                        <el-switch v-model="page" active-text="分页显示" inactive-text=""></el-switch>
                    </el-col>
                </el-row>
                <!-- 折线图、折线面积图、平滑折线图、平滑面积折线图、堆叠折线图、堆叠面积折线图 -->
                <el-row type="flex"  justify="space-around">
                     <el-col :span="11">
                        <div class="chart" @click="bindEcharts('line-0')">
                            <div class="grid-content bg-purple "> 折 线 图</div>
                            <img class="chart-img" src="@/assets/chart/line1.png">
                            <div class="chart-radio" v-if="chartCheck == 'line-0'">
                                <i class="el-icon-circle-check chart-radio-input"></i>
                                <!-- <el-radio v-model="chartCheck" label="line-0"  class="chart-radio-input"></el-radio> -->
                            </div> 
                        </div>
                    </el-col>
                     <el-col :span="11">
                        <div class="chart" @click="bindEcharts('line-1')">
                            <div class="grid-content bg-purple ">折线面积图</div>
                            <img class="chart-img" src="@/assets/chart/line-1.png">
                            <div class="chart-radio" v-if="chartCheck == 'line-1'">
                                 <i class="el-icon-circle-check chart-radio-input"></i>
                                 <!-- <el-radio v-model="chartCheck" label="line-1"  class="chart-radio-input"></el-radio> -->
                            </div> 
                        </div>
                    </el-col>
                  
                </el-row>
                <el-row type="flex"  justify="space-around" class="row-magin" >
                     <el-col :span="11">
                        <div class="chart" @click="bindEcharts('line-4')">
                            <div class="grid-content bg-purple ">堆叠折线图</div>
                            <img class="chart-img" src="@/assets/chart/line-4.png">
                            <div class="chart-radio" v-if="chartCheck == 'line-4'">
                                <i class="el-icon-circle-check chart-radio-input"></i>
                                 <!-- <el-radio v-model="chartCheck" label="line-4"  class="chart-radio-input"></el-radio> -->
                            </div> 
                        </div>
                    </el-col>
                    <el-col :span="11">
                        <div class="chart" @click="bindEcharts('line-5')">
                            <div class="grid-content bg-purple ">堆叠面积折线图</div>
                            <img class="chart-img" src="@/assets/chart/line-5.png">
                            <div class="chart-radio" v-if="chartCheck == 'line-5'">
                                 <i class="el-icon-circle-check chart-radio-input"></i>
                                 <!-- <el-radio v-model="chartCheck" label="line-5"  class="chart-radio-input"></el-radio> -->
                            </div> 
                        </div>
                    </el-col>
                </el-row>
            </el-tab-pane>
            <el-tab-pane>
                <span slot="label" class="echarts-label"><i class="el-icon-date"></i>柱状图</span>
                <el-scrollbar wrap-class="scrollbar-wrapper" style="height:380px;overflow-x: hidden !important;"> 
                    <el-row  type="flex"  justify="space-around">
                        <el-col :span="11">
                            <div class="chart" @click="bindEcharts('bar-0')">
                                <div class="grid-content bg-purple ">柱状图</div>
                                <img class="chart-img" src="@/assets/chart/bar1.png">
                                <div class="chart-radio" v-if="chartCheck == 'bar-0'">
                                    <i class="el-icon-circle-check chart-radio-input"></i>
                                </div> 
                            </div>
                        </el-col>
                        <el-col :span="11">
                            <div class="chart"  @click="bindEcharts('bar-1')">
                                <div class="grid-content bg-purple">条形图</div>
                                <img class="chart-img" src="@/assets/chart/bar-1.png">
                                <div class="chart-radio" v-if="chartCheck == 'bar-1'">
                                        <i class="el-icon-circle-check chart-radio-input"></i>
                                </div>
                            </div>

                        </el-col>
                    
                    </el-row>
                    <el-row type="flex"  justify="space-around" class="row-magin">
                        <el-col :span="11">
                            <div class="chart" @click="bindEcharts('bar-2')">
                                <div class="grid-content bg-purple">堆叠柱状图</div>
                                <img class="chart-img" src="@/assets/chart/bar2.png">
                                <div class="chart-radio" v-if="chartCheck == 'bar-2'">
                                    <i class="el-icon-circle-check chart-radio-input"></i>
                                </div> 
                            </div>
                        </el-col>
                        <el-col :span="11">
                            <div class="chart"  @click="bindEcharts('bar-3')">
                                <div class="grid-content bg-purple">堆叠条形图</div>
                                <img class="chart-img" src="@/assets/chart/bar-3.png">
                                <div class="chart-radio" v-if="chartCheck == 'bar-3'" >
                                    <i class="el-icon-circle-check chart-radio-input"></i>
                                </div>
                            </div>
                        </el-col>
                    </el-row>
                    <el-row type="flex"  justify="space-around" class="row-magin">
                        <el-col :span="11">
                            <div class="chart"  @click="bindEcharts('bar-4')">
                                <div class="grid-content bg-purple">堆叠柱状图</div>
                                <img class="chart-img" src="@/assets/chart/bar-4.png">
                                <div class="chart-radio" v-if="chartCheck == 'bar-4'">
                                    <i class="el-icon-circle-check chart-radio-input"></i>
                                </div>
                            </div>
                        </el-col>
                        <el-col :span="11">
                            <div class="chart"  @click="bindEcharts('bar-5')">
                                <div class="grid-content bg-purple">堆叠条形图</div>
                                <img class="chart-img" src="@/assets/chart/bar-5.png">
                                <div class="chart-radio" v-if="chartCheck == 'bar-5'" >
                                    <i class="el-icon-circle-check chart-radio-input"></i>
                                </div>
                            </div>
                        </el-col>
                    </el-row>
                </el-scrollbar>
            </el-tab-pane>
            <el-tab-pane>
                <span slot="label" class="echarts-label"><i class="el-icon-date"></i>饼状图</span>
                <el-row type="flex"  justify="space-around">
                    <el-col :span="11">
                        <div class="chart" @click="bindEcharts('pie-0')">
                            <div class="grid-content bg-purple">饼状图</div>
                            <img class="chart-img" src="@/assets/chart/pie-0.png">
                            <div class="chart-radio" v-if="chartCheck == 'pie-0'">
                                 <i class="el-icon-circle-check chart-radio-input"></i>
                            </div> 
                        </div>
                    </el-col>
                     <el-col :span="11">
                        <div class="chart" @click="bindEcharts('pie-1')">
                            <div class="grid-content bg-purple"> 环 形 图</div>
                            <img class="chart-img" src="@/assets/chart/pie-1.png">
                            <div class="chart-radio"  v-if="chartCheck == 'pie-1'">
                                <i class="el-icon-circle-check chart-radio-input"></i>
                            </div> 
                        </div>
                    </el-col>
                   
                </el-row>
                <el-row type="flex"  justify="space-around" class="row-magin">
                      <el-col :span="11">
                        <div class="chart" @click="bindEcharts('pie-2')">
                            <div class="grid-content bg-purple"> 玫 瑰 图</div>
                            <img class="chart-img" src="@/assets/chart/pie-2.png">
                            <div class="chart-radio" v-if="chartCheck == 'pie-2'">
                                <i class="el-icon-circle-check chart-radio-input"></i>
                            </div> 
                        </div>
                    </el-col>
                </el-row>
            </el-tab-pane>
            <!-- 
            <el-tab-pane>
                <span slot="label" class="echarts-label"><i class="el-icon-date"></i>散点图</span>
                <el-row :gutter="20">
                     <el-col :span="11">
                        <div class="chart" @click="bindEcharts('scatter-0')">
                            <div class="grid-content bg-purple">散点图</div>
                            <img class="chart-img" src="@/assets/chart/scatter-0.png">
                            <div class="chart-radio" v-if="chartCheck == 'scatter-0'">
                                <i class="el-icon-circle-check chart-radio-input"></i>
                            </div> 
                        </div>
                    </el-col>
                </el-row>
            </el-tab-pane>
            <el-tab-pane>
                <span slot="label" class="echarts-label"><i class="el-icon-date"></i>雷达图</span>
                <el-row :gutter="20">
                     <el-col :span="11">
                        <div class="chart" @click="bindEcharts('radar-0')">
                            <div class="grid-content bg-purple">雷达图</div>
                            <img class="chart-img" src="@/assets/chart/radar-0.png">
                            <div class="chart-radio"  v-if="chartCheck == 'radar-0'">
                                <i class="el-icon-circle-check chart-radio-input"></i>
                            </div> 
                        </div>
                    </el-col>
                </el-row>
            </el-tab-pane>
            -->
            <el-tab-pane>
                <span slot="label" class="echarts-label"><i class="el-icon-date"></i>漏斗图</span>
                <el-row :gutter="20">
                     <el-col :span="11">
                        <div class="chart" @click="bindEcharts('funnel-0')">
                            <div class="grid-content bg-purple">漏斗图</div>
                            <img class="chart-img" src="@/assets/chart/funnel-0.png">
                            <div class="chart-radio"  v-if="chartCheck == 'funnel-0'">
                                <i class="el-icon-circle-check chart-radio-input"></i>
                            </div> 
                        </div>
                    </el-col>
                </el-row>
            </el-tab-pane>
            <el-tab-pane>
                <span slot="label" class="echarts-label"><i class="el-icon-date"></i>甘特图</span>
                <el-row :gutter="20">
                     <el-col :span="11">
                        <div class="chart" @click="bindEcharts('gantt-0')">
                            <div class="grid-content bg-purple">甘特图</div>
                            <img class="chart-img" src="@/assets/chart/gantt.png">
                            <div class="chart-radio"  v-if="chartCheck == 'gantt-0'">
                                <i class="el-icon-circle-check chart-radio-input"></i>
                            </div> 
                        </div>
                    </el-col>
                </el-row>
            </el-tab-pane>
        </el-tabs>
        <hr/>
        <span slot="footer" class="dialog-footer" style="padding-top:0px">
            <el-button @click="close" size="mini">取  消</el-button>
            <el-button @click="searchOK" type="primary" size="mini">确  定</el-button>    
        </span> 
    </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
@Component({})
export default class BipFigureTypeDialog extends Vue {
    showFType:boolean = false;
    smooth:boolean = false;
    page:boolean = false;
    chartCheck:String='line-0';
    mounted() {

    }
    open() {
        this.showFType=true;
    }
    close(){
        this.showFType = !this.showFType;
    }
    searchOK(){
        let ct = this.chartCheck;
        if(this.chartCheck.indexOf("line") != -1){
            if(this.smooth){
                if(this.chartCheck=='line-0'){
                    ct = "line-2";
                }else if(this.chartCheck=='line-1'){
                    ct = "line-3";
                }else if(this.chartCheck=='line-4'){
                    ct = "line-6";
                }else if(this.chartCheck=='line-5'){
                    ct = "line-7";
                }
            }
        }
        this.$emit("setChartType",ct)
        this.showFType = !this.showFType;

    }
    bindEcharts(types:String){
        this.chartCheck =types;
        console.log(this.chartCheck)
    }
}
</script>
<style lang="scss" scoped>
.echarts-label {
    letter-spacing: 3px;
}
.row-magin {
    margin-top: 10px;
}
.chart {
    cursor: pointer;
    height: 170px;
    width: 100%;
    border: 1px solid #e3e3e3;
}
.grid-content {
    line-height: 25px;
    font-size: 14px;
    text-align: center;
    font-weight: 600;
    letter-spacing: 2px;
    border-bottom: 1px solid #e3e3e3;
}
.chart-radio {
    width: 100%;
    text-align: right;
    position: relative;
}
.chart-radio-input {
    position: absolute;
    right: 0px;
    top: -20px;
    font-size: 20px;
}
.chart-img{
    width: 100%;
    height: 140px;
}
.scrollbar-wrapper{
    overflow-x: hidden !important;
}
</style>
