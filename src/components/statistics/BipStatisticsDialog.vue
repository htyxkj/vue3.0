<template>
    <el-dialog class="bip-search" width="30%" title="统计" :visible.sync="dialogVisible" :append-to-body="true" :close-on-press-escape="false" :close-on-click-modal="false">
        <el-form ref="form" label-width="120px">
            <el-row>
                <el-form-item class="bip-form-item" label="统计项选择" :required="true">
                    <el-select v-model="selGroup" clearable  multiple collapse-tags style="margin-left: 20px;" placeholder="请选择">
                        <el-option v-for="item in groupCells" :key="item.id" :label="item.labelString" :value="item.id"
                        ></el-option>
                    </el-select>
                </el-form-item> 
            </el-row>
            <el-row>
                <el-form-item class="bip-form-item" label="数据项选择" :required="true">
                    <el-select v-model="selValue" clearable  multiple collapse-tags style="margin-left: 20px;" placeholder="请选择">
                        <el-option v-for="item in valuesCells" :key="item.id" :label="item.labelString" :value="item.id"
                        ></el-option>
                    </el-select>
                </el-form-item> 
            </el-row>
            <el-row>
                <el-form-item class="bip-form-item" label="图  表  类  型" :required="true">
                    <el-select v-model="chartTypeValue" collapse-tags style="margin-left: 20px;" placeholder="请选择">
                        <el-option v-for="item in chartType" :key="item.id" :label="item.name" :value="item.id"></el-option>
                    </el-select>
                </el-form-item> 
            </el-row>
            <el-row>
                <el-form-item class="bip-form-item" label="显  示  图  表" :required="true">
                    <!-- <el-checkbox v-model="showChart"  style="margin-left: 20px;"></el-checkbox> -->
                    <el-radio v-model="showChart"  :label='true' style="margin-left: 20px;" >显示</el-radio>
                    <el-radio v-model="showChart"  :label='false' >不显示</el-radio>
                     <!-- <el-checkbox-group 
                        v-model="checkedCities1"
                        :min="1"
                        :max="1">
                        <el-checkbox v-for="city in cities" :label="city" :key="city">{{city}}</el-checkbox>
                    </el-checkbox-group> -->
                </el-form-item> 
            </el-row>
            <!-- <el-row>
                <el-form-item>
                    <el-col :span="12">
                        <el-button  @click="close" >取  消</el-button>
                    </el-col>
                    <el-col :span="12">
                        <el-button  @click="searchOK" type="primary" >确  定</el-button>
                    </el-col>
                </el-form-item>
            </el-row> -->
           
            
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button  @click="close" >取  消</el-button>
            <el-button  @click="searchOK" type="primary" >确  定</el-button>
        </div>
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
