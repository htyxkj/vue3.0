<template>
    <div v-if="laycell" class="bip-lay">
        <template v-if="laycell&&!laycell.btable">
            <template v-if="uiCels.length == 0">
                <bip-comm-editor  v-for="(cel,index) in laycell.uiCels" :key="index" :env="env" :cell="cel" :cds="cds" :row="cds.index" :bgrid="laycell.btable" :config="config"/>
            </template>
            <template v-else>
                <el-card class="box-card my-lay-card" v-for="(item,index) in uiCels" :key="index">
                    <div slot="header" class="clearfix">
                        <span>{{item.title}}</span>
                    </div>
                    <div>
                        <bip-comm-editor  v-for="(cel,index) in item.cells" :key="index" :env="env" :cell="cel" :cds="cds" :row="cds.index" :bgrid="laycell.btable" :config="config"/>
                    </div>
                </el-card>
            </template>
        </template>
        <template v-else>
            <lay-cell-vex-table :laycell="laycell" :cds="cds" @handleCurrentChange="handleCurrentChange" @handleSizeChange="handleSizeChange" @sortChange="sortChange" :beBill="beBill" :pbuid="pbuid" :env="env" :config="config" @invokecmd="invokecmd"></lay-cell-vex-table>
        </template>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import BipLayCells from '@/classes/ui/BipLayCells';
import {Cell} from '@/classes/pub/coob/Cell';
import CCliEnv from '@/classes/cenv/CCliEnv'
import CDataSet from '@/classes/pub/CDataSet';
import LayCellVexTable from './LayCellVexTable.vue'
import CData from '../../classes/pub/CData';
@Component({
    components:{LayCellVexTable}
})
export default class LayCell extends Vue{
    @Prop() laycell!:BipLayCells
    @Prop() env!:CCliEnv
    @Prop() config?:any
    @Provide() info:string = 'infos'
    @Provide() clearable:boolean = true

    @Provide() cds:CDataSet = new CDataSet(null)
    @Provide() widths:Array<string> = new Array<string>()
    @Provide() beBill:boolean = true
    @Provide() cdata:CData = new CData("")
    @Provide() pbuid:string = "";
    uiCels:Array<any> = new Array<any>();

    created(){
        this.initWidth();
        this.initSfix();
        this.cds = this.env.getDataSet(this.laycell.obj_id);
        this.beBill = this.env.uriParams.beBill
        this.cdata = this.cds.cdata
        this.pbuid = this.env.uriParams.pbuid;
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
}
</script>

<style lang="scss">
.bip-lay{
    width: 100%;
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
</style>

