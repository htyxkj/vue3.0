<template>
    <el-dialog v-loading="loading" 
    element-loading-text="拼命加载中"
    element-loading-body="false"
    :title="aIdTitle" class="bip-copy" :visible.sync="visible" :append-to-body="true" :close-on-press-escape="true" :close-on-click-modal="false">
    <!-- <template v-if="init"> -->
        <el-row class="bip-row">
            <el-form @submit.native.prevent label-position="right" label-width="120px">
                <bip-comm-editor  v-for="(cel,index) in cells" :key="index" :cell="cel" :cds="cd_cont" :row="cds.index" :bgrid="false"></bip-comm-editor>
            </el-form>
        </el-row>
        <el-row>
            <el-table v-loading="mloading"  :data="cds.cdata.data" height="200" size="small" stripe border
             highlight-current-row row-class-name="bip-assist-row" @current-change="currSelectedChange">   
                <el-table-column v-for="(cel,index) in cellsm" :key="index" :prop="cel.id"
                :label="cel.labelString"
                :width="widths[index]" :resizable="true" :show-overflow-tooltip="true" :align="'center'">
                    <template slot-scope="scope">
                        <bip-grid-info :cds="cds" :cell="cel" :row="scope.$index" :model="scope.row[cel.id]" :bill="false"></bip-grid-info>
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

            <el-table v-if="cds.ds_sub.length>0" :data="cds.ds_sub[0].cdata.data" 
                height="150" size="small" stripe border @selection-change="mulSelectedChange" >
                <el-table-column type="selection"></el-table-column>
                <el-table-column v-for="(cel,index) in cellsms" :key="index" :prop="cel.id"
                :label="cel.labelString"
                :width="widths1[index]" :resizable="true" :show-overflow-tooltip="true" :align="'center'">
                    <template slot-scope="scope">
                        <bip-grid-info :cds="cds.ds_sub[0]" :cell="cel" :row="scope.$index" :bill="false"></bip-grid-info>
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
import CDataSet from '@/classes/pub/CDataSet';
import { Cell } from '@/classes/pub/coob/Cell';
import BipGridInfo from '../grid/BipGridInfo.vue'
import QueryEntity from '@/classes/search/QueryEntity';
import { CommICL } from '@/utils/CommICL';
import CData from '../../../classes/pub/CData';
import CRecord from '../../../classes/pub/CRecord';
let icl = CommICL
@Component({
    components:{BipGridInfo}
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
        if(!this.mul){
            if(this.mSelection){
                let crd:CRecord = this.ref_cds.currRecord
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
                    let crd0:CRecord = this.makeRecord(toList,frList,this.ref_cds,this.mSelection)
                    if(this.cds.ds_sub.length>0&&this.ref_cds.ds_sub.length>0){
                        obj_id = this.cds.ds_sub[0].ccells.obj_id
                        let subV:Array<any> = this.sSelections.length>0?this.sSelections:this.cds.ds_sub[0].cdata.data
                        index = scopys.findIndex(item=>{
                            return item.objId == obj_id 
                        })
                        if(index>=0){
                            let cds1 = this.ref_cds.ds_sub[0];
                            scopy = scopys[index]
                            toList = scopy.toFldList
                            frList = scopy.fromFldList
                            cds1.clear()
                            subV.forEach((item,index)=>{
                                cds1.createRecord();
                                let crd11 = this.makeRecord(toList,frList,cds1,item)
                                cds1.currRecord = crd11
                                cds1.setRecordAtIndex(crd11,index)
                            })
                            crd0.subs.push(cds1.cdata)
                        }
                    }
                    this.ref_cds.currRecord = crd0


                }


            }
            this.visible = false
        }

    }

    makeRecord(toList:Array<string>,frList:Array<string>,cds1:CDataSet,item:CRecord):CRecord{
        let crd:CRecord = cds1.currRecord
        toList.forEach((fld,index)=>{
            let m = cds1.ccells.cels.findIndex((cel:Cell)=>{
                return cel.id == fld
            })
            if(m>-1){
                let f1 = frList[index]
                let v = item.data[f1]
                if(v!=undefined){
                    crd.data[fld] = v                    
                }   
            }
        })
        crd.c_state = 3
        // cds1.checkGS()
        return crd
    }

    /**
     * 查询子对象数据
     */
    findSub(){
        if(this.cds.ds_sub.length<1){
            return ;
        }
        let aa:CRecord = this.mSelection;
        if(aa){
            let _i = this.cds.ccells.x_pk;
            if(_i>=0){
                let cell = this.cds.ccells.cels[_i];
                let cont = ''
                let v = aa.data[cell.id];
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
                        if(res.data.id==0){
                            
                            let cd:CData = res.data.data.info
                            console.log(cd)
                            this.cds.ds_sub[0].cdata.data = cd.data
                            this.cds.ds_sub[0].cdata.page = cd.page
                        }    
                    }).catch(err=>{
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
        this.qe.cont = JSON.stringify(this.cd_cont.currRecord.data);
        this.qe.tcell = this.cd_cont.ccells.obj_id
        this.mloading = true;
        this.cds.clear();
        tools.getWorkFlowData(205,this.opera.buid,this.buidfr,this.qe).then(res=>{
            if(res.data.id==0){
                console.log(res.data.data)
                let cd:CData = res.data.data.info
                this.cds.cdata.data = cd.data
                this.cds.page = cd.page
            }    
        }).catch(err=>{
        }).finally(()=>{
            this.mloading = false
        })
    }

    /**
     * 
     */
    currSelectedChange(val:any) {
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
        this.qe.page = this.cds.page
        this.findMainPage()
    }

    handleCurrentChange(value:any){
        this.qe.page = this.cds.page
        this.findMainPage()
    }

    open(){
        this.visible = true
        let buid = this.opera.buid;
        if(buid){
            this.loading = true
            tools.getWorkFlows(buid).then(res=>{
                if(res.data.id==0){
                    this.flowList = res.data.data.flowlist
                    this.initCopyInfo(0);
                    this.find()   
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


