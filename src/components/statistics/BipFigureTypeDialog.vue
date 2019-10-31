<template v-if="showFType">
    <el-dialog title="图表选择" class="bip-search" width="60%" :visible.sync="showFType" :append-to-body="true" :close-on-press-escape="false" :close-on-click-modal="false">
        <el-tabs tab-position="left" style="height: 200px;">
            <el-tab-pane>
                <span slot="label"><i class="el-icon-date"></i> 折线图</span>
                折线图、折线面积图、平滑折线图、平滑面积折线图、堆叠折线图、堆叠面积折线图
            </el-tab-pane>
            <el-tab-pane>
                <span slot="label"><i class="el-icon-date"></i> 柱状图</span>
                柱状图、条形图、堆叠柱状图、堆叠条形图
            </el-tab-pane>
            <el-tab-pane>
                <span slot="label"><i class="el-icon-date"></i> 饼状图</span>
                饼状图、环形图、玫瑰图
            </el-tab-pane>
            <el-tab-pane>
                <span slot="label"><i class="el-icon-date"></i> 散点图</span>
                散点图
            </el-tab-pane>
            <el-tab-pane>
                <span slot="label"><i class="el-icon-date"></i> 雷达图</span>
                雷达图
            </el-tab-pane>
            <el-tab-pane>
                <span slot="label"><i class="el-icon-date"></i> 漏斗图</span>
                漏斗图
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
import CDataSet from "@/classes/pub/CDataSet";
import SearchEntity from "@/classes/SearchEntity";
import CCliEnv from "@/classes/cenv/CCliEnv";
import QueryEntity from '@/classes/search/QueryEntity';
import QueryCont from '@/classes/search/QueryCont';
import { Cell } from '../../classes/pub/coob/Cell';
import { Cells } from "@/classes/pub/coob/Cells";
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi
import {CommICL} from '@/utils/CommICL'
let ICL = CommICL
@Component({})
export default class BipFigureTypeDialog extends Vue {
    @Provide() showFType:boolean = false;

    mounted() {

    }
    open() {
        this.showFType=true;
    }
    close(){
        this.showFType = !this.showFType;
    }
    searchOK(){
        this.showFType = !this.showFType;
    }
}
</script>
<style lang="scss" scoped>

</style>
