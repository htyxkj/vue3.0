<template>
    <el-dialog class="bip-search" width="30%" title="统计项选择" :visible.sync="dialogVisible" :append-to-body="true" :close-on-press-escape="false" :close-on-click-modal="false">
        <el-form ref="form" label-width="120px">
            <el-row>
                <el-form-item label="统计项选择" :required="true">
                    <el-select v-model="selGroup" clearable  multiple collapse-tags style="margin-left: 20px;" placeholder="请选择">
                        <el-option v-for="item in env.dsm.ccells.cels" :key="item.id" :label="item.labelString" :value="item.id"
                        v-if="(item.type !== 2 && item.type !== 3 && item.type !== 4 && item.type !== 5 && item.type !== 6 && item.type !== 8) &&item.isShow"
                        ></el-option>
                    </el-select>
                </el-form-item> 
            </el-row>
            <el-row>
                <el-form-item label="数据项选择" :required="true">
                    <el-select v-model="selValue" clearable  multiple collapse-tags style="margin-left: 20px;" placeholder="请选择">
                        <el-option v-for="item in env.dsm.ccells.cels" :key="item.id" :label="item.labelString" :value="item.id"
                        v-if="(item.type == 2 || item.type == 3 || item.type == 4 || item.type == 5 || item.type == 6 || item.type == 8) &&item.isShow"
                        ></el-option>
                    </el-select>
                </el-form-item> 
            </el-row>
            <el-row>
                <el-form-item label="图表类型" :required="true">
                    <el-select v-model="chartTypeValue" collapse-tags style="margin-left: 20px;" placeholder="请选择">
                        <el-option v-for="item in chartType" :key="item.id" :label="item.name" :value="item.id"></el-option>
                    </el-select>
                </el-form-item> 
            </el-row>
            <el-row>
                <el-form-item label="是否显示图表">
                    <el-checkbox v-model="showChart"  style="margin-left: 20px;"></el-checkbox>
                </el-form-item> 
            </el-row>
            <el-row>
                <el-form-item>
                    <el-col :span="12">
                        <el-button type="text" @click="close">取消</el-button>
                    </el-col>
                    <el-col :span="12">
                        <el-button type="text" @click="searchOK">确定</el-button>
                    </el-col>
                </el-form-item>
            </el-row>
        </el-form>
    </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import CDataSet from "@/classes/pub/CDataSet";
import SearchEntity from "@/classes/SearchEntity";
import CCliEnv from "@/classes/cenv/CCliEnv";
@Component({})
export default class BipStatisticsDialog extends Vue {
    @Prop() env!:CCliEnv;
    @Provide() dialogVisible: boolean = false;
    @Provide() selGroup:any =[];
    @Provide() selValue:any = [];
    @Provide() chartTypeValue:any=0;
    @Provide() chartType:any =  [{id:"line",name:"线图"},{id:"pie",name:"饼图"},{id:"bar",name:"柱状图"}];
    @Provide() showChart:boolean = true;
    mounted() {
        this.chartTypeValue = "line"; 
    }
    open() {
        this.dialogVisible = true;
    }
    close(){
        this.dialogVisible = false;
    }
    searchOK(){
        if(this.selGroup.length <=0){
            this.$notify.warning('请勾选"统计项选择"');
            return;
        }
        if(this.selValue.length <=0){
            this.$notify.warning('请勾选"数据项选择"');
            return;
        }
        this.$emit("makeOK",this.selGroup,this.selValue,this.chartTypeValue,this.showChart);
        this.close();
    }
}
</script>

<style lang="scss">
 
.bip-search{
    .el-dialog__header{
        background-color: #20a0ff
    }
    .el-dialog__body{
        padding: 10px 10px !important;
    }
}
.el-icon-close:before {
    content: "\E6DB";
    color: white;
}
</style>