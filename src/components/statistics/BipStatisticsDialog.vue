<template>
    <el-dialog class="bip-search" width="35%" :visible.sync="dialogVisible" :append-to-body="true" :close-on-press-escape="false" :close-on-click-modal="false">
        <span slot="title">
            <div class="el-dialog__title" style="padding-bottom: 15px;border-bottom: solid 1px #D9DFEF;">统计</div>
        </span>
        <el-row style="padding:10px 25px 0px 25px">
            <el-form ref="form" label-width="120px" size="mini">
                <el-form-item class="bip-form-item" label="统计项选择" :required="true">
                        <el-select v-model="selGroup" clearable  multiple collapse-tags style="margin-left: 20px;" placeholder="请选择">
                            <el-option v-for="item in groupCells" :key="item.id" :label="item.labelString" :value="item.id"
                            ></el-option>
                        </el-select>
                </el-form-item> 
                <el-form-item class="bip-form-item" label="数据项选择" :required="true">
                    <el-select v-model="selValue" clearable  multiple collapse-tags style="margin-left: 20px;" placeholder="请选择">
                        <el-option v-for="item in valuesCells" :key="item.id" :label="item.labelString" :value="item.id"
                        ></el-option>
                    </el-select>
                </el-form-item> 
                <el-form-item class="bip-form-item" label="图表类型" :required="true">
                    <el-select v-model="chartTypeValue" collapse-tags style="margin-left: 20px;" placeholder="请选择">
                        <el-option v-for="item in chartType" :key="item.id" :label="item.name" :value="item.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item class="bip-form-item" label="显示图表" :required="true">
                    <el-radio v-model="showChart"  :label='true' style="margin-left: 20px;" >显示</el-radio>
                    <el-radio v-model="showChart"  :label='false' >不显示</el-radio>
                </el-form-item>        
            </el-form> 
        </el-row>
        <span slot="footer" class="dialog-footer" style="padding-top:0px">
            <el-button @click="close" size="mini">取  消</el-button>
            <el-button @click="searchOK" type="primary" size="mini">确  定</el-button>
        </span>
    </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import CDataSet from "@/classes/pub/CDataSet";
import SearchEntity from "@/classes/SearchEntity";
import CCliEnv from "@/classes/cenv/CCliEnv";
import { Cell } from '../../classes/pub/coob/Cell';
@Component({})
export default class BipStatisticsDialog extends Vue {
    @Prop() env!:CCliEnv;
    @Provide() dialogVisible: boolean = false;
    @Provide() selGroup:any =[];
    @Provide() selValue:any = [];
    @Provide() chartTypeValue:any=0;
    @Provide() chartType:any =  [{id:"line",name:"线图"},{id:"pie",name:"饼图"},{id:"bar",name:"柱状图"}];
    @Provide() showChart:boolean = true;
    @Provide() groupCells:Array<Cell>=[]
    @Provide() valuesCells:Array<Cell>=[]
    mounted() {
        this.chartTypeValue = "line"; 
        this.groupCells = this.env.dsm.ccells.cels.filter(item=>{
            return (item.type !== 2 && item.type !== 3 && item.type !== 4 && item.type !== 5 && item.type !== 6 && item.type !== 8) &&item.isShow
        })
        this.valuesCells = this.env.dsm.ccells.cels.filter(item=>{
            return (item.type == 2 || item.type == 3 || item.type == 4 || item.type == 5 || item.type == 6 || item.type == 8) &&item.isShow
        })
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
<style lang="scss" scoped>
.bip-form-item {
  margin-bottom: 22px !important;
}
</style>
