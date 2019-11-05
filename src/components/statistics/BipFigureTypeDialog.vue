<template v-if="showFType">
    <el-dialog title="图表选择" class="bip-search" width="50%" :visible.sync="showFType" :append-to-body="true" :close-on-press-escape="false" :close-on-click-modal="false">
        <el-tabs tab-position="left" style="height: 380px;">
            <el-tab-pane>
                <span slot="label"><i class="el-icon-date"></i> 折线图</span>
                <el-row>
                    <el-col>
                        <el-switch v-model="smooth" active-text="平滑显示" inactive-text=""></el-switch>
                    </el-col>
                </el-row>
                <!-- 折线图、折线面积图、平滑折线图、平滑面积折线图、堆叠折线图、堆叠面积折线图 -->
                <el-row :gutter="20">
                    <el-col :span="8">
                        <div class="grid-content bg-purple">折线图</div>
                        <img class="chart-img" src="@/assets/chart/line.png">
                        <el-radio v-model="chartCheck" label="line-0"></el-radio>
                    </el-col>
                    <el-col :span="8">
                        <div class="grid-content bg-purple">折线面积图</div>
                        <img class="chart-img" src="@/assets/chart/line.png">
                        <el-radio v-model="chartCheck" label="line-1"></el-radio>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="8">
                        <div class="grid-content bg-purple">堆叠折线图</div>
                        <img class="chart-img" src="@/assets/chart/line.png">
                        <el-radio v-model="chartCheck" label="line-4"></el-radio>
                    </el-col>
                    <el-col :span="8">
                        <div class="grid-content bg-purple">堆叠面积折线图</div>
                        <img class="chart-img" src="@/assets/chart/line.png">
                        <el-radio v-model="chartCheck" label="line-5"></el-radio>
                    </el-col>
                </el-row>
            </el-tab-pane>
            <el-tab-pane>
                <span slot="label"><i class="el-icon-date"></i> 柱状图</span>
                <el-row :gutter="20">
                    <el-col :span="8">
                        <div class="grid-content bg-purple">柱状图</div>
                        <img class="chart-img" src="@/assets/chart/line.png">
                        <el-radio v-model="chartCheck" label="bar-0"></el-radio>
                    </el-col>
                    <el-col :span="8">
                        <div class="grid-content bg-purple">堆叠柱状图</div>
                        <img class="chart-img" src="@/assets/chart/line.png">
                        <el-radio v-model="chartCheck" label="bar-2"></el-radio>
                    </el-col>
                    <el-col :span="8">
                        <div class="grid-content bg-purple">条形图</div>
                        <img class="chart-img" src="@/assets/chart/line.png">
                        <el-radio v-model="chartCheck" label="bar-1"></el-radio>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="8">
                        <div class="grid-content bg-purple">堆叠条形图</div>
                        <img class="chart-img" src="@/assets/chart/line.png">
                        <el-radio v-model="chartCheck" label="bar-3"></el-radio>
                    </el-col>
                </el-row>
            </el-tab-pane>
            <el-tab-pane>
                <span slot="label"><i class="el-icon-date"></i> 饼状图</span>
                <el-row :gutter="20">
                    <el-col :span="8">
                        <div class="grid-content bg-purple">饼状图</div>
                        <img class="chart-img" src="@/assets/chart/line.png">
                        <el-radio v-model="chartCheck" label="pie-0"></el-radio>
                    </el-col>
                    <el-col :span="8">
                        <div class="grid-content bg-purple">环形图</div>
                        <img class="chart-img" src="@/assets/chart/line.png">
                        <el-radio v-model="chartCheck" label="pie-1"></el-radio>
                    </el-col>
                    <el-col :span="8">
                        <div class="grid-content bg-purple">玫瑰图</div>
                        <img class="chart-img" src="@/assets/chart/line.png">
                        <el-radio v-model="chartCheck" label="pie-2"></el-radio>
                    </el-col>
                </el-row>
            </el-tab-pane>
            <el-tab-pane>
                <span slot="label"><i class="el-icon-date"></i> 散点图</span>
                <el-row :gutter="20">
                    <el-col :span="8">
                        <div class="grid-content bg-purple">散点图</div>
                        <img class="chart-img" src="@/assets/chart/line.png">
                    </el-col> 
                </el-row>
            </el-tab-pane>
            <el-tab-pane>
                <span slot="label"><i class="el-icon-date"></i> 雷达图</span>
                <el-row :gutter="20">
                    <el-col :span="8">
                        <div class="grid-content bg-purple">雷达图</div>
                        <img class="chart-img" src="@/assets/chart/line.png">
                    </el-col> 
                </el-row>
            </el-tab-pane>
            <el-tab-pane>
                <span slot="label"><i class="el-icon-date"></i> 漏斗图</span>
                <el-row :gutter="20">
                    <el-col :span="8">
                        <div class="grid-content bg-purple">漏斗图</div>
                        <img class="chart-img" src="@/assets/chart/line.png">
                        <el-radio v-model="chartCheck" label="funnel-0"></el-radio>
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
    @Provide() showFType:boolean = false;
    @Provide() smooth:boolean = false;
    @Provide() chartCheck:string='line-0';
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
}
</script>
<style lang="scss" scoped>
.chart-img{
    width: 140px;
    height: 140px;
}
</style>
