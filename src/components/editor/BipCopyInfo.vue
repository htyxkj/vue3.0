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
            <el-table v-loading="mloading"  :data="cds.cdata._data" height="200" size="small" stripe border
             highlight-current-row row-class-name="bip-assist-row" @current-change="currSelectedChange">   
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

            <el-table v-if="cds.ds_sub.length>0" :data="cds.ds_sub[0].cdata._data" 
                height="150" size="small" stripe border @selection-change="mulSelectedChange" >
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
            
            <el-select v-model="buidfr" placeholder="请选择" size="small" :required="true" @change="buidfrChange">
                <el-option 
                v-for="item in flowList"
                :key="item.buidfr"
                :label="item.buidfrName"
                :value="item.buidfr">
                </el-option>
            </el-select>
            <el-button size="small" type="primary" @click="find">刷新</el-button>
            <el-button size="small" type="warning" @click="findSub">选中</el-button>

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
import BipGridLay from '../grideditor/BipGridLay.vue'
import QueryEntity from '../../classes/search/QueryEntity';
import { CommICL } from '@/utils/CommICL';
let icl = CommICL
@Component({
    components:{BipCommEditor1,BipGridLay}
})
export default class BipCopyInfo extends Vue{
    @Prop() opera!:Operation;
    @Prop() ref_cds!:CDataSet;
    @Provide() aIdTitle:string='拷贝定义'
    @Provide() visible:boolean = false
    @Provide() loading:boolean = false
    @Provide() mloading:boolean = false
    @Provide() flowList:Array<any> = []
    @Provide() buidfr:string =''
    @Provide() currFlow:any =null
    @Provide() cd_cont:CDataSet = new CDataSet(null)
    @Provide() cds:CDataSet = new CDataSet(null)
    @Provide() init:boolean = false
    @Provide() cells:Array<any> = []
    @Provide() cellsm:Array<any> = []
    @Provide() cellsms:Array<any> = []
    @Provide() widths:Array<any>=[]
    @Provide() widths1:Array<any>=[]
    @Provide() qe:QueryEntity = new QueryEntity("","")
    @Provide() qeSub:QueryEntity = new QueryEntity("","")
    @Provide() mSelection:any=null
    @Provide() sSelections:Array<any>=[]

    @Provide() mul:boolean = false
    cancel(){
        this.visible = false
    }

    find(){
        this.qe.page = this.cds.page
        this.findMainPage()

    }

    /**
     * 选择确认
     */
    selectOK(){
        //  this.visible = false
        console.log('selectOK')
        if(!this.mul){
            if(this.mSelection){
                let crd = this.ref_cds.currRecord
                let obj_id = this.cds.ccells.obj_id
                let scopys:Array<any> = this.currFlow.scopys
                let index = scopys.findIndex(item=>{
                    return item.objId == obj_id 
                })
                if(index>=0){
                    //主对象赋值
                    let scopy = scopys[index]
                    let toList:Array<string> = scopy.toFldList
                    let frList:Array<string> = scopy.fromFldList
                    let crd0 = this.makeRecord(toList,frList,this.ref_cds,this.mSelection)

                    if(this.cds.ds_sub.length>0&&this.ref_cds.ds_sub.length>0){
                        obj_id = this.cds.ds_sub[0].ccells.obj_id
                        let subV:Array<any> = this.sSelections.length>0?this.sSelections:this.cds.ds_sub[0].cdata._data
                        console.log(subV.length)
                        index = scopys.findIndex(item=>{
                            return item.objId == obj_id 
                        })
                        if(index>=0){
                            let cds1 = this.ref_cds.ds_sub[0];
                            scopy = scopys[index]
                            toList = scopy.toFldList
                            frList = scopy.fromFldList
                            cds1.clear()
                            subV.forEach(item=>{
                                cds1.createRecord();
                                let crd11 = this.makeRecord(toList,frList,cds1,item)
                                console.log(crd11)
                            })
                        }
                    }


                }


            }
            this.visible = false
        }

    }

    makeRecord(toList:Array<string>,frList:Array<string>,cds1:CDataSet,item:any):any{
        let crd:any = cds1.currRecord
        toList.forEach((fld,index)=>{
            
            let m = cds1.ccells.cels.findIndex((cel:any)=>{
                return cel.id == fld
            })
            if(m>=0){
                let f1 = frList[index]
                let v = item[f1]
                if(v!=undefined){
                    crd[fld] = v
                    let methodName=icl.EV_CELL_CHANGE+'_'+cds1.ccells.obj_id+'_'+fld
                    this.$bus.$emit(methodName,{cellId:fld,value:v,row:cds1.index})
                    this.cds.cellChange(fld,v);
                }
                
            }
        })
        crd.sys_stated = 3
        return crd
    }

    /**
     * 查询子对象数据
     */
    findSub(){
        if(this.cds.ds_sub.length<1){
            return ;
        }
        let aa:any = this.mSelection;
        if(aa){
            let _i = this.cds.ccells.x_pk;
            if(_i>=0){
                let cell = this.cds.ccells.cels[_i];
                let cont = ''
                let v = aa[cell.id];
                let canf:boolean = false
                if(cell.type==12){
                    if(v){
                        cont = cell.id+"='"+v+"'"
                        canf = true
                    }
                    
                }else{
                    cont = cell.id+"="+v
                     canf = true
                }
                if(canf){
                    this.qeSub.cont = cont
                    this.qeSub.pcell = this.cds.ds_sub[0].ccells.obj_id
                    this.cds.ds_sub[0].cdata.clearValues();
                    tools.getWorkFlowData(210,this.opera.buid,this.buidfr,this.qeSub).then(res=>{
                        console.log(res)
                        if(res.data.id==0){
                            this.cds.ds_sub[0].cdata._data = res.data.data.info.values
                        }    
                    }).catch(err=>{
                        console.log(err)
                    }).finally(()=>{
                        this.mloading = false
                    })
                }
            }
        }
    }
    /***
     * 查询主对象数据
     */
    findMainPage(){
        this.qe.cont = JSON.stringify(this.cd_cont.currRecord);
        this.qe.tcell = this.cd_cont.ccells.obj_id
        this.mloading = true;
        this.cds.clear();
        tools.getWorkFlowData(205,this.opera.buid,this.buidfr,this.qe).then(res=>{
            console.log(res)
            if(res.data.id==0){
                this.cds.cdata._data = res.data.data.info.values
                this.cds.page = res.data.data.info.page
            }    
        }).catch(err=>{
            console.log(err)
        }).finally(()=>{
            this.mloading = false
        })
    }

    /**
     * 
     */
    currSelectedChange(val:any) {
        console.log(val)
        this.mSelection = val;
        this.findSub()
    }

    mulSelectedChange(val:any){
        this.sSelections = val
    }

    buidfrChange(val:string){
        let index = this.flowList.findIndex((item:any)=>{
            return item.buidfr == val
        });
        this.initCopyInfo(index)
    }

    handleSizeChange(value:any){
        console.log(value)
        this.qe.page = this.cds.page
        this.findMainPage()
    }

    handleCurrentChange(value:any){
        console.log(value,this.qe)
        this.qe.page = this.cds.page
        console.log(this.qe)
        this.findMainPage()
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
        this.currFlow = this.flowList[index]
        this.buidfr = this.currFlow.buidfr
        let cells = this.currFlow.cells
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

