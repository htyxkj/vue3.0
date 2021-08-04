<template>
    <el-dialog :title="bipInsAid.title" class="bip-query" :visible.sync="visible" :append-to-body="true" 
    :close-on-press-escape="true" :close-on-click-modal="false" width="60%">
            <bip-search-cont :env="env" :cdsCount="env.ds_cont"/>
            <el-form @submit.native.prevent label-position="right" label-width="120px">
                <BaseLayout v-if="biplay&&biplay.binit" :layout="biplay" :env="env" @handleCurrentChange="handleCurrentChange" @handleSizeChange="handleSizeChange" :config="config" />
            </el-form>
         <hr/>
         <span slot="footer" class="dialog-footer">
            <el-button size="small" @click="close">取 消</el-button>   
            <el-button size="small" type="info" @click="find">查 找</el-button>
            <el-button size="small" type="primary" @click="selectOK">选中并关闭</el-button>  
           
        </span>
    </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import BipInsAidNew from '@/classes/BipInsAidNew';
import { Cells } from '@/classes/pub/coob/Cells';
import QCopyConf  from '@/classes/pub/copy/QCopyConf';
import { BipLayout } from '@/classes/ui/BipLayout';
import CDataSet from '@/classes/pub/CDataSet';
import { Cell } from '@/classes/pub/coob/Cell';
import CCliEnv from "@/classes/cenv/CCliEnv";
import {BIPUtil} from '@/utils/Request';
import QueryEntity from '../../../classes/search/QueryEntity';
import CData from '../../../classes/pub/CData';
import CRecord from '../../../classes/pub/CRecord';
const tools = BIPUtil.ServApi
@Component({
})
export default class BipQueryInfo extends Vue{
    @Prop() cds!:CDataSet
    @Prop() cell!:Cell
    @Prop() bipInsAid!:BipInsAidNew
    @Prop() env0!:CCliEnv
    @Provide() contCell!:Cells
    @Provide() cells!:Cells
    @Provide() biplay:BipLayout = new BipLayout("")
    @Provide() env: CCliEnv = new CCliEnv();
    @Provide() dsmfrom!:CDataSet
    @Provide() ds_cont!:CDataSet
    @Provide() visible:boolean = false
    @Provide() qe:QueryEntity = new QueryEntity("","");
    @Provide() mkey:number = 0
    @Provide() tomaps:string = ''
    @Provide() qcopyconf:QCopyConf = new QCopyConf();
    @Provide() config:any={};
    mounted(){
        this.config['type']=3
        this.cells = this.bipInsAid.cells
        this.contCell = this.bipInsAid.contCells
        let arrcell = []
        arrcell[0] = this.cells
        // console.log(this.bipInsAid.sflag,arrcell)
        this.biplay = new BipLayout(this.bipInsAid.sflag,arrcell);
        this.dsmfrom = new CDataSet(this.cells);
        this.ds_cont = new CDataSet(this.contCell)
        this.env.dsm = this.dsmfrom
        this.env.cells = arrcell
        this.env.ds_cont = this.ds_cont
        // console.log(this.biplay) 
        this.mkey = this.$bus.$on("row_click",this.row_click) 
        this.tomaps = this.bipInsAid.sref
        // console.log(this.tomaps)
         let fid = this.cells.obj_id;
        let toid = this.cds.ccells.obj_id
        this.qcopyconf.fromID = fid
        this.qcopyconf.toId = toid
        if(!this.tomaps){
            //普通的拷贝定义赋值
             this.getCopyFlds(this.cells,this.cds.ccells,this.qcopyconf)
        }else{
            let map0 = '',s0 = '',maps=this.tomaps
            if(maps.startsWith(this.cells.obj_id+'=')){
                let i = maps.indexOf(';')
                if(i>0){
                    s0 = maps.substring(0,i)
                    maps = maps.substring(i+1)
                    console.log(s0,maps)
                }else{
                    s0 = maps
                    maps = ''
                }
                i = s0.indexOf(',')
                if(i>0)
                    map0 = s0.substring(i+1)
            }
            let rr = this.mapToArray(map0);
            this.qcopyconf.trans = rr;
            this.qcopyconf = this.getCopyFlds(this.cells,this.cds.ccells,this.qcopyconf)
            // console.log(rr,this.qcopyconf);
            if(maps){
                let _n = maps.indexOf(',');
                let frId = '',toId = ''
                let s1 = new QCopyConf()
                if(_n>0){
                    let n1 = maps.substring(0,_n);
                    console.log(n1)
                    let n2 = n1.split('=')
                    frId = n2[0]
                    toId = n2[1]
                    maps = maps.substring(_n+1)
                    let rr = this.mapToArray(maps);
                    s1.trans = rr;
                }else{
                    let n2 = maps.split('=')
                    frId = n2[0]
                    toId = n2[1]
                    maps = ''
                }
                s1.fromID = frId
                s1.toId = toId
                let c1 = this.findCells(this.cells,frId);
                let c2 = this.findCells(this.cds.ccells,toId);
                if(c1&&c2){
                    s1 = this.getCopyFlds(c1,c2,s1)
                    this.qcopyconf.subs.push(s1)
                }    
            }
            this.qcopyconf.makeTrans()
        }

    }

    mapToArray(s0:string){
        let cc:Array<Array<string>> = []
        if(s0){
            s0 = s0.replace('/','=')
            if(s0.indexOf(',')>0){
                let r0 = s0.split(',')
                for(let i=0;i<r0.length;i++){
                    let r1 = r0[i]
                    if(r1.indexOf('=')>0){
                        cc.push(r1.split('='))
                    }
                }
            }else{
                if(s0.indexOf('=')>0){
                    cc.push(s0.split('='))
                }
            }
        }
        return cc;
    }

    findCells(cell:Cells,objid:string){
        if(cell.obj_id == objid){
            return cell;
        }else{
            let _n = cell.subLayCells.findIndex(item=>{
                return item.obj_id == objid
            })
            if(_n>-1){
                return cell.subLayCells[_n]
            }else{
                return null;
            }

        }
    }

    /**
     * 生成对象参照数据
     */
    getCopyFlds(fromCell:Cells,toCells:Cells,qcopy:QCopyConf):QCopyConf{
        console.log(fromCell.obj_id,toCells.obj_id)
        let cels = fromCell.cels
        let tcels = toCells.cels
        let fcels:Array<string> = []
        let tocels:Array<string> = []
        console.log(cels.length)
        for(let i=0;i<cels.length;i++){
            let id = cels[i].id
            let _i = tcels.findIndex(item=>{
                return item.id == id
            })
            if(_i>-1){
                fcels.push(id)
                tocels.push(id)
            }
        }
        qcopy.fromCols = fcels
        qcopy.toCols = tocels
        return qcopy
    }

    beforeDestroy(){
        this.$bus.$off("row_click",this.mkey)
    }

    open(vis:boolean){
        this.initTJ();
        this.visible = vis
        if(vis){
            setTimeout(() => {
                this.find()
            }, 300);
        }
    }
    close(){
        this.$emit('select')
    }

    handleCurrentChange(curr:number){
        this.qe.page.currPage = curr
        this.find()
    }

    handleSizeChange(size:number){
        this.qe.page.pageSize = size
        this.find()
    }

    selectOK(){
        let listCrd =[];
        if(this.dsmfrom.currRecordArr.length>0){
            listCrd = this.dsmfrom.currRecordArr;
        }else{
            listCrd.push(this.dsmfrom.currRecord)
        }
        let cc = this.cds.currRecord;
        for(var i=0;i<listCrd.length;i++){
            let crd = listCrd[i];
            if(i>0){
                this.cds.createRecord()
            }
            let crd0:CRecord = new CRecord();
            crd0 = Object.assign({},this.cds.currRecord);
            crd0 = this.makeUIRecord(this.qcopyconf,crd,crd0,this.cds.ccells)
            crd0.c_state |= 2
            if(this.qcopyconf.subs.length>0){
                crd.subs.forEach(cdata=>{
                    let id = cdata.obj_id
                    let _index = this.qcopyconf.subs.findIndex(item=>{
                        // console.log(item.toId,id)
                        return item.fromID == id;
                    })
                    //  console.log(_index)
                    if(_index>-1){
                        let conf = this.qcopyconf.subs[_index]
                        // console.log(conf)
                        let cells = this.findCells(this.cds.ccells,conf.toId);
                        let _mm = crd0.subs.findIndex(item=>{
                            return item.obj_id == conf.toId
                        })
                        if(_mm>-1){
                            crd0.subs[_mm].clearValues();
                        }
                        if(cells){
                            let sdata = new CData(id)
                            let _nn = this.cds.ds_sub.findIndex(item=>{
                                // console.log(item.ccells.obj_id,conf.toId,'7777777')
                                return item.ccells.obj_id == conf.toId
                            })
                            if(_nn>-1){
                                let subcds = this.cds.ds_sub[_nn]
                                subcds.clear()
                                for(let m=0;m<cdata.data.length;m++){
                                    let cr1 = cdata.data[m];
                                    let cr2 = subcds.createRecord()
                                    cr2 = this.makeUIRecord(conf,cr1,cr2,cells)
                                    cr2.c_state |= 2;
                                    sdata.addRecord(cr2,-1);
                                }
                            }
                            if(_mm>-1){
                                crd0.subs[_mm] = sdata
                            }else{
                                crd0.subs.push(sdata)   
                            }
                        }
                        // console.log(crd0,cells,'99999')

                    }
                })
            }
        }
        this.cds.currRecord =cc;
        // this.cds.index = 0;
        // this.cds.currRecord = this.cds.cdata.data[0];
        // this.$bus.$emit('datachange',this.cds.ccells.obj_id)
        this.$emit('select')
    }

    makeUIRecord(conf:QCopyConf,crd:CRecord,crd0:CRecord,cells:Cells){
        let tr:Array<any> = conf.trans 
        for(var i=0;i<tr.length;i++){
            let cc = tr[i];
            let ff = cc[0]
            let tf = cc[1]
            let cels;
            let _i = cells.cels.findIndex(item=>{
                if(item.id == tf)
                    cels = item;
                return item.id == tf
            })
            crd0.data[cc[1]] = crd.data[cc[0]]||'' 
            this.cds.checkGS(cels)
        }

        let fc = conf.fromCols
        let tcols = conf.toCols
        for(let i=0;i<fc.length;i++){
            let ff = fc[i]
            let tf = tcols[i]
            let cels;
            let _i = cells.cels.findIndex(item=>{
                if(item.id == tf)
                    cels = item;
                return item.id == tf
            })
            if(_i>-1){
                crd0.data[tf] = crd.data[ff]||''
                this.cds.checkGS(cels)
            }
        }
        return crd0
    }

    find(){
        let crdc = this.ds_cont.currRecord; 
        let canSel = true;
        this.ds_cont.ccells.cels.forEach(item => {
            if (item.unNull) {
                var vl = this.ds_cont.currRecord.data[item.id]+'';
                if(item.type<5){
                    if(!vl){
                        vl = 0+'';
                    }
                }
                if (!vl || vl == "undefined") {
                    this.$notify.warning( "【" + item.labelString + "】不能为空!");
                    canSel = false;
                    return ;
                }
            }
        });
        if(canSel){
            this.qe.oprid = 13;
            this.qe.cont = JSON.parse(JSON.stringify(crdc.data));
            tools.getBipInsAidInfo(this.bipInsAid.id,210,this.qe).then(res=>{
                if(res.data.id==0){
                    let vr = res.data.data.data
                    console.log(vr,'99990')
                    if(vr){
                        let cd : CData = new CData('');
                        let retdata = vr
                        cd.obj_id = retdata.obj_id;
                        cd.data = retdata.data;
                        cd.page = retdata.page; 
                        this.dsmfrom.setCData(cd)
                        // this.dsmfrom.page = vr.page
                    }
                }
                console.log(res)
            }).catch(err=>{
                console.log(err)
            })
        }
    }

    row_click(data:any){
        let crd = this.dsmfrom.currRecord
        if(this.dsmfrom.ds_sub && this.dsmfrom.ds_sub.length>0){
            let pkindex = this.dsmfrom.ccells.pkindex;
            let crdc = "";
            for(var i=0;i<pkindex.length;i++){
                let cel = this.dsmfrom.ccells.cels[pkindex[i]];
                if(i == pkindex.length -1)
                    crdc += cel.id + " = '"+crd.data[cel.id]+"' "
                else
                    crdc += cel.id + " = '"+crd.data[cel.id]+"' and  "
            } 
            let qq = Object.assign({},this.qe);
            qq.cont = crdc
            qq.oprid = 14;
            qq.tcell = this.dsmfrom.ds_sub[0].ccells.obj_id;
            tools.getBipInsAidInfo(this.bipInsAid.id,210,qq).then(res=>{
                if(res.data.id==0){
                    let vr = res.data.data.data
                    if(vr){
                        let cd : CData = new CData('');
                        let retdata = vr
                        cd.obj_id = retdata.obj_id;
                        cd.data = retdata.data;
                        cd.page = retdata.page; 
                        this.dsmfrom.currRecord.subs[0] = cd
                        crd.subs[0] =cd
                        this.dsmfrom.ds_sub[0].setCData(cd)
                    }
                }
                console.log(res)
            }).catch(err=>{
                console.log(err)
            })
        }
    }
    /**
     * 初始化条件
     * 处理条件对象公式  对象ID*字段
     */
    initTJ(){
        let cells = this.env.ds_cont.ccells.cels;
        if(this.env.ds_cont.currRecord.c_state ==0)
            this.env.ds_cont.createRecord();
        for(var i=0;i<cells.length;i++){
            let cel = cells[i];
            if(cel.script && cel.script.indexOf("*")>0){
                let cellID = cel.script.split("*")[0];
                let valueID = cel.script.split("*")[1];
                let cell = null;
                if(this.env0.dsm.ccells){
                    cell = this.env0.dsm.getCdsByObjID(cellID);
                }
                if(!cell){
                    if(this.env0.ds_cont.ccells){
                        cell = this.env0.ds_cont.getCdsByObjID(cellID);
                    }
                }
                if(cell){
                    let vl = cell.currRecord.data[valueID];
                    this.env.ds_cont.currRecord.data[cel.id] = vl;
                }
            }
        }
    }
}
</script>
