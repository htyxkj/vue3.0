<template>
    <el-dialog v-loading="loading" 
    element-loading-text="拼命加载中"
    element-loading-body="false"
    :title="aIdTitle" class="bip-copy" :visible.sync="visible" :append-to-body="true" :close-on-press-escape="true" :close-on-click-modal="false">
    <!-- <template v-if="init"> -->
        <el-row class="bip-row">
            <el-form label-position="right" label-width="120px">
                <bip-comm-editor1  v-for="(cel,index) in cells" :key="index" :cell="cel" :cds="cd_cont"></bip-comm-editor1>
            </el-form>
        </el-row>
        <el-row>
            <el-table :data="cds.cdata._data" height="200" size="small" stripe border >
                
                <el-table-column v-for="(cel,index) in cellsm" :key="index" :prop="cel.id"
                :label="cel.labelString"
                :width="widths[index]" :resizable="true" :show-overflow-tooltip="true" :align="'center'">
                    <template slot-scope="scope">
                        <bip-grid-lay :cds="cds" :cell="cel" :index="scope.$index" :model="scope.row[cel.id]" :bill="false"></bip-grid-lay>
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

            <el-table v-if="cds.ds_sub.length>0" :data="cds.ds_sub[0].cdata._data" height="150" size="small" stripe border >
                <el-table-column type="selection"></el-table-column>
                <el-table-column v-for="(cel,index) in cellsms" :key="index" :prop="cel.id"
                :label="cel.labelString"
                :width="widths1[index]" :resizable="true" :show-overflow-tooltip="true" :align="'center'">
                    <template slot-scope="scope">
                        <bip-grid-lay :cds="cds.ds_sub[0]" :cell="cel" :index="scope.$index" :model="scope.row[cel.id]" :bill="false"></bip-grid-lay>
                    </template>
                </el-table-column>
            </el-table>
        </el-row>
        <span slot="footer" class="dialog-footer">
            <el-button size="small" @click="cancel()">取 消</el-button>
            <el-button size="small" type="primary" @click="selectOK">确 定</el-button>
            
            <el-select v-model="buidfr" placeholder="请选择" size="small" :required="true">
                <el-option 
                v-for="item in flowList"
                :key="item.buidfr"
                :label="item.buidfrName"
                :value="item.buidfr">
                </el-option>
            </el-select>
            <el-button size="small" type="primary" @click="find">刷新</el-button>
            <el-button size="small" type="warning" @click="find">选中</el-button>

        </span>
        <!-- </template>
        <template v-else>
            <h1>没有工作流定义</h1>
        </template> -->
    </el-dialog>
</template>
<script lang="ts">
import { Component, Vue,  Provide, Prop,  Watch} from "vue-property-decorator";
import Operation from '@/classes/operation/Operation'
import { BIPUtil } from '@/utils/Request';
let tools = BIPUtil.ServApi
import CDataSet from '../../classes/pub/CDataSet';
import { Cell } from '../../classes/pub/coob/Cell';
import BipCommEditor1 from './BipCommEditor1.vue'

@Component({
    components:{BipCommEditor1}
})
export default class BipCopyInfo extends Vue{
    @Prop() opera!:Operation;
    @Provide() aIdTitle:string='拷贝定义'
    @Provide() visible:boolean = false
    @Provide() loading:boolean = false
    @Provide() flowList:any = []
    @Provide() buidfr:string =''
    @Provide() cd_cont:CDataSet = new CDataSet(null)
    @Provide() cds:CDataSet = new CDataSet(null)
    @Provide() init:boolean = false
    @Provide() cells:Array<any> = []
    @Provide() cellsm:Array<any> = []
    @Provide() cellsms:Array<any> = []
    @Provide() widths:Array<any>=[]
    @Provide() widths1:Array<any>=[]
    cancel(){
        this.visible = false
        console.log('cancel')
    }

    find(){

    }

    selectOK(){
         this.visible = false
        console.log('selectOK')
    }

    updated(){
        console.log('updated')
    }
    mounted(){
        
    }

    handleSizeChange(value:any){
        console.log(value)
    }

    handleCurrentChange(value:any){
        console.log(value)
    }
    open(){
        this.visible = true
        let buid = this.opera.buid;
        console.log(this.opera)
        if(buid){
            this.loading = true
            tools.getWorkFlows(buid).then(res=>{
                if(res.data.id==0){
                    this.flowList = res.data.data.flowlist
                    this.initCopyInfo(0);    
                }
            }).catch(err=>{
                console.log(err)
            }).finally(()=>{
                this.loading = false;
            });
        }   
    }


    initCopyInfo(index:number){
        this.buidfr = this.flowList[index].buidfr
        let cells = this.flowList[index].cells
        this.cd_cont = new CDataSet(cells[0])
        this.cd_cont.createRecord()
        this.cds = new CDataSet(cells[1])
        this.init = true
        this.cells = this.cd_cont.ccells.cels.filter(cell=>{
            return cell.isShow;
        })
        this.cellsm = this.cds.ccells.cels.filter(cell=>{
            return cell.isShow;
        })
        this.widths = this.initWidth(this.cellsm)
        if(this.cds.ds_sub.length>0){
            let sub:CDataSet = this.cds.ds_sub[0];
            this.cellsms = sub.ccells.cels.filter(cell=>{
                return cell.isShow;
            })
            this.widths1 = this.initWidth(this.cellsms)
        }
    }

    initWidth(cells:Array<any>):Array<any>{
        let ww:Array<any> = []
        cells.forEach(cel => {
            if(cel.isShow){
                let w1 = cel.ccCharleng;
                if(!cel.id.startsWith('cid')){
                    w1 = w1<10?8:w1
                }
                let w = w1*9+20;
                if(w>200)
                    w = 200
                ww.push(w+'')
            }
        });
        return ww;
    }

}
</script>

<style lang="scss">
.bip-copy {
    .el-dialog__body{
        padding:4px 12px;
    }
    .el-dialog__footer{
        padding-top: 5px;
        padding-bottom: 10px;
        text-align: center;
    }
    hr{
        color:#ccc;
    }
    .el-table__body tr.current-row > td {
        background-color: #13a8a1 !important;
    }
}
</style>

