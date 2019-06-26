<template>
    <div v-if="laycell" class="bip-lay">
        <template v-if="laycell&&!laycell.btable">
            <bip-comm-editor  v-for="(cel,index) in cells" :key="index" :cell="cel" :cds="cds"/>
        </template>
        <template v-else>
            <!-- <lay-cell-etable :laycell="laycell" :env="env"></lay-cell-etable> -->
            <lay-cell-vex-table :laycell="laycell" :env="env" @handleCurrentChange="handleCurrentChange" @handleSizeChange="handleSizeChange"></lay-cell-vex-table>
            <!-- <el-table :data="cds.cdata._data" style="width: 100%" height="300" size="small" stripe border >
                <el-table-column v-if="beBill" type="selection" width="45" :align="'center'"></el-table-column>
                <el-table-column v-for="(cel,index) in cells" :key="index" :prop="cel.id"
                :label="cel.labelString"
                :width="widths[index]" :resizable="true" :show-overflow-tooltip="true" :align="'center'" :label-class-name="cel.isReq?'bip-req':(cel.type==3?'bip-number':'')">
                    <template slot-scope="scope">
                        <bip-grid-lay :cds="cds" :cell="cel" :index="scope.$index" :model="scope.row[cel.id]" :bill="beBill"></bip-grid-lay>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page.sync="cds.page.currPage"
                :page-size="cds.page.pageSize"
                :page-sizes="[10, 20, 30,40,50]"
                layout="sizes,total, prev, pager, next"
                :total="cds.page.total">
            </el-pagination>
            <el-button-group size="small" v-if="cds.ds_par">
            <el-button icon="el-icon-edit" @click="addRecord"></el-button>
            <el-button icon="el-icon-share"></el-button>
            <el-button icon="el-icon-delete"></el-button>
            </el-button-group> -->
        </template>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import BipLayCells from '@/classes/ui/BipLayCells';
import {Cell} from '@/classes/pub/coob/Cell';
import CCliEnv from '@/classes/cenv/CCliEnv'
import CDataSet from '@/classes/pub/CDataSet';
import BipCommEditor from '../editor/BipCommEditor.vue'
// import BipGridLay from '../grideditor/BipGridLay.vue'
import LayCellVexTable from './LayCellVexTable.vue'
import LayCellEtable from './LayCellEtable.vue'
@Component({
    components:{BipCommEditor,LayCellEtable,LayCellVexTable}
})
export default class LayCell extends Vue{
    @Prop() laycell!:BipLayCells
    @Prop() env!:CCliEnv
    @Provide() info:string = 'infos'
    @Provide() clearable:boolean = true
    @Provide() cells:Array<Cell> = new Array<Cell>()
    // @Provide() tableData:Object[] = []
    @Provide() cds:CDataSet = new CDataSet(null)
    @Provide() widths:Array<string> = new Array<string>()
    // @Provide() status1:Array<Array<any>> = []
    @Provide() beBill:boolean = true

    created(){
        // if(this.laycell){
            this.cells = this.laycell.cells.cels.slice(this.laycell.start===-1?0:this.laycell.start,this.laycell.endP===-1?this.laycell.cells.cels.length:(this.laycell.endP+1))
            this.initWidth();
            // if(this.env){
            this.cds = this.env.getDataSet(this.laycell.obj_id);
            this.beBill = this.env.uriParams.beBill
        //     }
            
        // }
    }

    addRecord(){
        this.cds.createRecord()
    }

    initWidth(){
        let layCell:Cell[] = []
        if(this.laycell){         
            this.cells.forEach(cel => {
                if(cel.isShow){
                    layCell.push(cel)
                    let w1 = cel.ccCharleng;
                    if(!cel.id.startsWith('cid')){
                        w1 = w1<10?8:w1
                    }
                    let w = w1*9+20;
                    if(w>200)
                        w = 200
                    this.widths.push(w+'')
                }
            });          
        }
        this.cells = layCell
    }

    getNumChar(cell:any):number{
        let cn = cell.ccCharleng
        return cn
    }

    // cellClick(row:any, column:any, cell:any, event:any){
    //     console.log(row,'hang')
    //     console.log(column,'lie')
    //     console.log(cell,'cell')
    // }

    handleSizeChange(value:number){
        console.log('handleSizeChange',value)
        this.$emit('handleSizeChange',value)
    }

    handleCurrentChange(value:number){
        console.log('handleCurrentChange',value)
        this.$emit('handleCurrentChange',value)
    }

    @Watch('laycell')
    layCellChange(){
        if(this.laycell){
            this.cells = this.laycell.cells.cels.slice(this.laycell.endP)
            let layCell:Cell[] = []
            this.cells.forEach(cel => {
                if(cel.isShow){
                    layCell.push(cel)
                }
            });
            this.cells = layCell
        }
    }
}
</script>

<style>
.bip-lay{
    width: 100%;
    max-width: 100%;
}
.bip-number{
    color: rgb(54, 180, 121)
}
.bip-req{
    color: rgb(167, 8, 8)
}
</style>

