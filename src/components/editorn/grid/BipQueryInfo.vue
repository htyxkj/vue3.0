<template>
    <el-dialog :title="bipInsAid.title" class="bip-query" :visible.sync="visible" :append-to-body="true" 
    :close-on-press-escape="true" :close-on-click-modal="false">
        <!-- <el-scrollbar style="margin-bottom:0px;  margin-right: 0px;"> -->
            <bip-search-cont :env="env" />
            <el-form label-position="right" label-width="120px">
                <BaseLayout v-if="biplay&&biplay.binit" :layout="biplay" :env="env" @handleCurrentChange="handleCurrentChange" @handleSizeChange="handleSizeChange" />
            </el-form>
        <!-- </el-scrollbar> -->
         <span slot="footer" class="dialog-footer">
            <el-button size="small" @click="open(false)">取 消</el-button>
            <el-button size="small" type="primary" @click="selectOK">确 定</el-button>            
            <el-button size="small" type="primary" @click="find">查找</el-button>
            <!-- <el-button size="small" type="warning" @click="findSub">选中</el-button> -->
        </span>
    </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import BipInsAidNew from '@/classes/BipInsAidNew';
import { Cells } from '@/classes/pub/coob/Cells';
import { BipLayout } from '@/classes/ui/BipLayout';
import CDataSet from '@/classes/pub/CDataSet';
import { Cell } from '@/classes/pub/coob/Cell';
import CCliEnv from "@/classes/cenv/CCliEnv";
import {BIPUtil} from '@/utils/Request';
import QueryEntity from '../../../classes/search/QueryEntity';
const tools = BIPUtil.ServApi
@Component({
})
export default class BipQueryInfo extends Vue{
    @Prop() cds!:CDataSet
    @Prop() cell!:Cell
    @Prop() bipInsAid!:BipInsAidNew
    @Provide() contCell!:Cells
    @Provide() cells!:Cells
    @Provide() biplay:BipLayout = new BipLayout("")
    @Provide() env: CCliEnv = new CCliEnv();
    @Provide() dsm!:CDataSet
    @Provide() ds_cont!:CDataSet
    @Provide() visible:boolean = false
    @Provide() qe:QueryEntity = new QueryEntity("","");
    mounted(){
        this.cells = this.bipInsAid.cells
        this.contCell = this.bipInsAid.contCells
        let arrcell = []
        arrcell[0] = this.cells
        // console.log(this.bipInsAid.sflag,arrcell)
        this.biplay = new BipLayout(this.bipInsAid.sflag,arrcell);
        this.dsm = new CDataSet(this.cells);
        this.ds_cont = new CDataSet(this.contCell)


        this.env.dsm = this.dsm
        this.env.cells = arrcell
        this.env.ds_cont = this.ds_cont
        console.log(this.biplay) 
        this.$bus.$on("row_click",this.row_click) 
    }

    open(vis:boolean){
        this.visible = vis
    }

    handleCurrentChange(curr:number){
        this.qe.page.currPage = curr
        this.find()
    }

    handleSizeChange(size:number){
        this.qe.page.pageSize = size
        this.find()
    }

    selectOK(){}

    find(){
        let crdc = this.ds_cont.currRecord;
        this.qe.cont = JSON.stringify(crdc)
        tools.getBipInsAidInfo(this.bipInsAid.id,210,this.qe).then(res=>{
            if(res.data.id==0){
                let vr = res.data.data.data
                console.log(vr,'99990')
                if(vr&&vr.values){
                    this.dsm.setValues(vr.values)
                    this.dsm.page = vr.page
                }
            }
            console.log(res)
        }).catch(err=>{
            console.log(err)
        })
    }

    row_click(data:any){
        console.log(data.row)
        console.log(data.rowIndex)
        console.log(data.columnIndex)
        this.dsm.currRecord = data.row;
        console.log(this.dsm)
        if(this.dsm.ds_sub && this.dsm.ds_sub.length>0){
            let pkindex = this.dsm.ccells.pkindex;
            let crdc = "";
            for(var i=0;i<pkindex.length;i++){
                let cel = this.dsm.ccells.cels[pkindex[i]];
                if(i == pkindex.length -1)
                    crdc += cel.id + " = '"+data.row[cel.id]+"' "
                else
                    crdc += cel.id + " = '"+data.row[cel.id]+"' and  "
            } 
            this.qe.cont = crdc
            this.qe.oprid = 14;
            this.qe.tcell = this.dsm.ds_sub[0].ccells.obj_id;
            tools.getBipInsAidInfo(this.bipInsAid.id,210,this.qe).then(res=>{
                if(res.data.id==0){
                    let vr = res.data.data.data
                    console.log(vr) 
                    this.dsm.ds_sub[0].setValues(vr.values)
                }
                console.log(res)
            }).catch(err=>{
                console.log(err)
            })
        }
    }
}
</script>
