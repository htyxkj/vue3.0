<template>
    <div v-if="laycell" class="bip-lay">
        <vxe-table
            ref="_vvt"
            v-if="beBill"
            border
            size="small"
            highlight-hover-row
            show-all-overflow="tooltip"
            show-header-all-overflow
            class="vxe-table-element"
            :data.sync="cds.cdata._data"
            :optimized="true"
            :edit-config="{key:`${id}`,trigger: 'click', mode: 'cell',showStatus: true,showIcon:false,activeMethod:activeMethod}"
            resizable
            @edit-actived="rowActive"
            @edit-closed="editClose"
            height="300px"
            :selectRow="cds.currRecord"
        >
            <!-- <vxe-table-column type="index" width="60"></vxe-table-column> -->
            <vxe-table-column
                header-align="center"
                align="center"
                v-for="(cel,index) in cells"
                :key="index"
                :prop="cel.id"
                :width="widths[index]"
                :label="cel.labelString"
                show-header-overflow
                :edit-render="{name: 'default'}"
                show-overflow
            >
                <template v-slot:edit="{row,rowIndex}">
                    <bip-grid-input-lay
                        :cds="cds"
                        :cell="cel"
                        :index="rowIndex"
                        :bill="beBill"
                        :row="row"
                    ></bip-grid-input-lay>
                </template>
                <template v-slot="{row,rowIndex}">
                    <bip-grid-cell-info
                        :cds="cds"
                        :cell="cel"
                        :index="rowIndex"
                        :bill="beBill"
                        :row="row"
                    ></bip-grid-cell-info>
                </template>
            </vxe-table-column>
        </vxe-table>
        <!-- 报表表格-->
        <vxe-table
            ref="_vvt"
            v-else
            border
            resizable
            size="small"
            highlight-hover-row
            show-all-overflow="tooltip"
            show-header-all-overflow
            class="vxe-table-element"
            :data.sync="cds.cdata._data"
            :optimized="true"
            height="300px"
        >
            <vxe-table-column type="index" width="60"></vxe-table-column>
            <vxe-table-column
                header-align="center"
                align="center"
                v-for="(cel,index) in cells"
                :key="index"
                :prop="cel.id"
                :width="widths[index]"
                :label="cel.labelString"
                show-header-overflow
                show-overflow
            >
                <template v-slot="{row,rowIndex}">
                    <bip-grid-cell-info
                        :cds="cds"
                        :cell="cel"
                        :index="rowIndex"
                        :bill="beBill"
                        :row="row"
                    ></bip-grid-cell-info>
                </template>
            </vxe-table-column>
        </vxe-table>
        <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page.sync="cds.page.currPage"
            :page-size="cds.page.pageSize"
            :page-sizes="[10, 20, 30,40,50]"
            layout="slot,total,prev, pager, next,sizes"
            :total="cds.page.total"
        >
        <el-col :span="18" :xs="18" :sm="18" :md="18">
            <el-button-group size="small" v-if="cds.ds_par">  
                <el-button icon="el-icon-edit" @click="addRecord"></el-button>
                <el-button icon="el-icon-share"></el-button>
                <el-button icon="el-icon-delete"></el-button>
            </el-button-group>
        </el-col>
        </el-pagination>

    </div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import BipLayCells from "@/classes/ui/BipLayCells";
import { Cell } from "@/classes/pub/coob/Cell";
import CCliEnv from "@/classes/cenv/CCliEnv";
import CDataSet from "@/classes/pub/CDataSet";
import BipCommEditor from "../editor/BipCommEditor.vue";
import BipGridInputLay from "../geditor/BipGridInputLay.vue";
import BipGridCellInfo from "../geditor/BipGridCellInfo.vue";
@Component({
    components: { BipCommEditor, BipGridInputLay, BipGridCellInfo }
})
export default class LayCelVexTable extends Vue {
    @Prop() laycell!: BipLayCells;
    @Prop() env!: CCliEnv;
    @Provide() info: string = "infos";
    @Provide() clearable: boolean = true;
    @Provide() cells: Array<Cell> = new Array<Cell>();
    @Provide() tableData: Object[] = [];
    @Provide() cds: CDataSet = new CDataSet(null);
    @Provide() widths: Array<string> = new Array<string>();
    // @Provide() status1:Array<Array<any>> = []
    @Provide() beBill: boolean = true;

    @Provide() id: string = "";

    created() {
        if (this.laycell) {
            this.cells = this.laycell.cells.cels.slice(
                this.laycell.start === -1 ? 0 : this.laycell.start,
                this.laycell.endP === -1
                    ? this.laycell.cells.cels.length
                    : this.laycell.endP + 1
            );

            this.initWidth();
            if (this.env) {
                this.cds = this.env.getDataSet(this.laycell.obj_id);
                this.beBill = this.env.uriParams.beBill;
                if(this.cds.x_pk>-1)
                    this.id = this.laycell.cells.cels[this.cds.x_pk].id;
                if (!this.id) {
                    this.id = this.laycell.cells.cels[0].id;
                }
            }
        }
    }


    addRecord() {
        this.cds.createRecord();
    }

    initWidth() {
        let layCell: Cell[] = [];
        if (this.laycell) {
            this.cells.forEach(cel => {
                if (cel.isShow) {
                    layCell.push(cel);
                    let w1 = cel.ccCharleng;
                    if (!cel.id.startsWith("cid")) {
                        w1 = w1 < 10 ? 8 : w1;
                    }
                    let w = w1 * 9 + 20;
                    if (w > 200) w = 200;
                    this.widths.push(w + "");
                }
            });
        }
        this.cells = layCell;
    }

    getNumChar(cell: any): number {
        let cn = cell.ccCharleng;
        return cn;
    }

    rowActive(rowInfo: any, event: any) {
        this.cds.currRecord = this.cds.getRecordAtIndex(rowInfo.rowIndex);
        this.cds.index = rowInfo.rowIndex;
    }

    editClose(rowInfo: any, event: any) {
        this.cds.currRecord = this.cds.getRecordAtIndex(rowInfo.rowIndex);
    }

    activeMethod() {
        return true;
    }

    handleSizeChange(value: number) {
        if((this.cds.currRecord['sys_stated']&1)>0){
            return ;
        }
        this.cds.cdata.clearValues();
        this.$emit("handleSizeChange", value);
    }

    handleCurrentChange(value: number) {
         if((this.cds.currRecord['sys_stated']&1)>0){
            return ;
        }
        this.cds.cdata.clearValues();
        this.$emit("handleCurrentChange", value);
    }

    @Watch("laycell")
    layCellChange() {
        if (this.laycell) {
            this.cells = this.laycell.cells.cels.slice(this.laycell.endP);
            let layCell: Cell[] = [];
            this.cells.forEach(cel => {
                if (cel.isShow) {
                    layCell.push(cel);
                }
            });
            this.cells = layCell;
        }
    }
}
</script>

<style>
/* .bip-lay {
    width: 100%;
    max-width: 100%;
}
.bip-number {
    color: rgb(54, 180, 121);
}
.bip-req {
    color: rgb(167, 8, 8);
} */
</style>

