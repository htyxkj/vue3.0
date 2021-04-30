<template>
    <div v-if="laycell" class="bip-lay" :style="isNoHomeTable?'padding:0 18px':''">
        <template v-if="laycell&&!laycell.btable">
            <template v-if="!isChild">
                <template v-if="uiCels.length == 0">
                    <bip-comm-editor  v-for="(cel,index) in laycell.uiCels" :key="index" :env="env" :cell="cel" :cds="cds" :row="cds.index" :bgrid="laycell.btable" :config="config" @focus="focus"/>
                </template>
                <template v-else>
                    <el-card class="box-card my-lay-card" v-for="(item,index) in uiCels" :key="index">
                        <div slot="header" class="clearfix">
                            <span>{{item.title}}</span>
                        </div>
                        <div>
                            <bip-comm-editor  v-for="(cel,index) in item.cells" :key="index" :env="env" :cell="cel" :cds="cds" :row="cds.index" :bgrid="laycell.btable" :config="config" @focus="focus"/>
                        </div>
                    </el-card>
                </template>
            </template>
            <template v-else>
                <div v-for="(rowData,rowId) in cds.cdata.data" :key="rowId">
                    <el-col class="childBtn">
                        <el-button size="mini" type="danger" @click="delRecord(rowId)">删除</el-button>
                    </el-col>
                    <template v-if="uiCels.length == 0">
                        <bip-comm-editor  v-for="(cel,index) in laycell.uiCels" :key="index" :env="env" :cell="cel" :cds="cds" :row="rowId" :bgrid="laycell.btable" :config="config" @focus="focus"/>
                    </template>
                    <template v-else>
                        <el-card class="box-card my-lay-card" v-for="(item,index) in uiCels" :key="index">
                            <div slot="header" class="clearfix">
                                <span>{{item.title}}</span>
                            </div>
                            <div>
                                <bip-comm-editor  v-for="(cel,index) in item.cells" :key="index" :env="env" :cell="cel" :cds="cds" :row="rowId" :bgrid="laycell.btable" :config="config" @focus="focus"/>
                            </div>
                        </el-card>
                    </template>
                </div>
                <el-button style="width:100%;color:#1890FF" size="mini" @click="addRecord">添加</el-button>
            </template>
        </template>
        <template v-else>
            <lay-cell-vex-table :laycell="laycell" :cds="cds" @handleCurrentChange="handleCurrentChange" @handleSizeChange="handleSizeChange" @sortChange="sortChange" :beBill="beBill" :pbuid="pbuid" :env="env" :config="config" @invokecmd="invokecmd"></lay-cell-vex-table>
        </template>
    </div>
</template>
<script lang="ts">
/**
 * 单据模块布局
 */
import { Component, Vue, Provide, Prop, Watch,Inject } from "vue-property-decorator"
import BipLayCells from '@/classes/ui/BipLayCells';
import CCliEnv from '@/classes/cenv/CCliEnv'
import CDataSet from '@/classes/pub/CDataSet';
import LayCellVexTable from './LayCellVexTable.vue'
@Component({
    components:{LayCellVexTable}
})
export default class LayCell extends Vue{
    @Prop() laycell!:BipLayCells
    @Prop() env!:CCliEnv
    @Prop() config?:any
    @Inject('isNoHomeTable') isNoHomeTable!:boolean;//是否是首页调用
    info:string = 'infos'
    clearable:boolean = true

    cds:CDataSet = new CDataSet(null)
    widths:Array<string> = new Array<string>()
    beBill:boolean = true
    pbuid:string = "";
    uiCels:Array<any> = new Array<any>();

    isChild:boolean = false;

    created(){
        this.initWidth();
        this.initSfix();
        this.cds = this.env.getDataSet(this.laycell.obj_id);
        this.beBill = this.env.uriParams.beBill
        this.pbuid = this.env.uriParams.pbuid;
        if(this.cds.ds_par && !this.laycell.btable){
            this.isChild =true;
            this.addRecord();
        }
    }

    addRecord(){
        this.cds.createRecord()
    }

    initWidth(){
        if(this.laycell){         
            this.laycell.uiCels.forEach(cel => {
                if(cel.isShow){
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
    }

    initSfix(){
        if(this.laycell){
            let sfix = this.laycell.cells.sfix;
            if(sfix && sfix.startsWith("[R]")){
                sfix = sfix.replace("[R]","")
                let sfixs =  sfix.split(";");
                for(var i=0;i<sfixs.length;i++){
                    let json:any = {title:"",cells:[]};
                    let onesf = sfixs[i].split("&");
                    let zd = onesf[0];
                    json.title = onesf[2];
                    let stzd = zd.split("-")[0];
                    let edzd = zd.split("-")[1];
                    let isadd = false;
                    for(var z=0;z<this.laycell.uiCels.length;z++){
                        let cel = this.laycell.uiCels[z];
                        if(cel.id == stzd || isadd ){
                            json.cells.push(cel)
                            isadd = true;
                        }
                        if(cel.id == edzd){
                            break;
                        }
                    }
                    this.uiCels.push(json)
                }
            }else{
                // this.uiCels[0] = {title:"",cells:this.laycell.uiCels};
            }
        }
    }

    /**
     * 删除行
     * @param rowId 行号
     */
    delRecord(rowId:any){
        if(this.cds.currCanEdit()){
            this.cds.cdata.rmdata.push(this.cds.getRecordAtIndex(rowId));
            this.cds.cdata.data.splice(rowId,1); 
            this.cds.setState(2);
            let xinc = -1;
            if (this.cds.ccells.pkindex) xinc = this.cds.ccells.pkindex[0];
            if (xinc >= 0) {
                let cel = this.cds.ccells.cels[xinc];
                let s0 = cel.psAutoInc;
                if (s0 == null || s0 == undefined || s0.length < 1 || cel.type !== 12) {
                    for(var i=0;i<this.cds.cdata.data.length;i++){
                        let oldKey = JSON.stringify(this.cds.cdata.data[i].data[cel.id]);
                        this.cds.cdata.data[i].oldpk.push(oldKey);
                        this.cds.cdata.data[i].data[cel.id] = i + 1
                        this.cds.cdata.data[i].c_state |= 16;
                    }
                }
            }
            this.cds.currRecord.c_state |= 2;
            if(this.cds.ds_par){
                this.cds.ds_par.currRecord.c_state |= 2;
            }
        }
    }

    
    focus(res:any){
        this.cds.index = res.rowId;
        this.cds.currRecord = this.cds.getRecordAtIndex(res.rowId);
    }

    getNumChar(cell:any):number{
        let cn = cell.ccCharleng
        return cn
    }


    handleSizeChange(value:number){
        this.$emit('handleSizeChange',value)
    }

    handleCurrentChange(value:number){
        this.$emit('handleCurrentChange',value)
    }
    sortChange(orderby:string){
        this.$emit("sortChange", orderby);
    }
    invokecmd(btn:any){
        this.$emit("invokecmd",btn)
    }
    // @Watch("cds.cdata",{deep:true})
    // cdataChange(){
    //     if(this.cds.ds_par && !this.laycell.btable && this.cds.cdata.data.length ==0){
    //         this.isChild =true;
    //         this.addRecord();
    //     }
    // }
}
</script>

<style lang="scss">
.bip-lay{
    // width: 100%;
    max-width: 100%;
    .el-form-item__content{
        line-height: 0px !important
    }
}
.bip-number{
    color: rgb(54, 180, 121)
}
.bip-req{
    color: rgb(167, 8, 8)
}
.my-lay-card{
    margin-bottom: 5px;
    .el-card__body{
        padding: 5px;
    }
}
.childBtn{
    text-align: end;
    padding-top: 5px;
    padding-bottom: 5px;
    button{
        width: 120px;
    }
}
</style>

