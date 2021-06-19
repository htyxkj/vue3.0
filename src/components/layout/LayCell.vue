<template>
    <div v-if="laycell" class="bip-lay" :style="isNoHomeTable?'padding:0 18px':''">
        <template v-if="laycell&&!laycell.btable">
            <template v-if="!isChild">
                <template v-if="uiCels.length == 0">
                    <el-row class="title" v-if="laycell.name && !isTabs">{{laycell.name}}</el-row>
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
                <el-collapse v-model="activeName">
                    <el-collapse-item :title="laycell.name" name="1" >
                        <div v-for="(rowData,rowId) in cds.cdata.data" :key="rowId">
                            <el-row>
                                <el-col class="row_data">
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
                                </el-col>
                                <el-col class="row_btn">
                                    <!-- <el-button size="mini" @click="insertRow(rowId)">插入</el-button>
                                    <el-button size="mini" :disabled="rowId == 0" @click="moveUp(rowId)">上移</el-button>
                                    <el-button size="mini" :disabled="rowId == cds.cdata.data.length-1" @click="moveDown(rowId)">下移</el-button> -->
                                    <el-button size="mini" type="danger" icon="el-icon-delete" circle @click="delRecord(rowId)"></el-button>
                                </el-col>
                            </el-row>
                        </div>
                        <el-button style="width:100%;color:#1890FF" size="mini" @click="addRecord">添加</el-button>
                    </el-collapse-item>
                </el-collapse>
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
    @Prop() isTabs!:boolean;//是否是页签
    @Inject('isNoHomeTable') isNoHomeTable!:boolean;//是否是首页调用
    info:string = 'infos'
    clearable:boolean = true

    cds:CDataSet = new CDataSet(null)
    widths:Array<string> = new Array<string>()
    beBill:boolean = true
    pbuid:string = "";
    uiCels:Array<any> = new Array<any>();

    isChild:boolean = false;

    activeName:any = ['1']
    created(){
        this.initSfix();
        this.cds = this.env.getDataSet(this.laycell.obj_id);
        this.beBill = this.env.uriParams.beBill
        if(this.beBill == false){//报表页面
            if((this.env.uriParams.pattr & 0x40)>0){
                this.beBill = true;
            }
        }
        this.pbuid = this.env.uriParams.pbuid;
        if(this.cds.ds_par && !this.laycell.btable){
            this.isChild =true;
            this.addRecord();
        }
    }

    addRecord(){
        this.cds.createRecord()
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
            let delData = this.cds.getRecordAtIndex(rowId);
            delData.c_state =4;
            this.cds.cdata.rmdata.push(delData);
            this.cds.cdata.data.splice(rowId,1); 
            this.cds.setState(2);
            this.updateKeyVl();
            this.cds.currRecord.c_state |= 2;
            if(this.cds.ds_par){
                this.cds.ds_par.currRecord.c_state |= 2;
                this.cds.ds_par.getRecordAtIndex(this.cds.ds_par.index).c_state |= 2;
            }
        }
    }

    /**
     * 插入行
     */
    ins1ertRow(rowId:any){

    }
    /**
     * 上移
     */
    moveUp(rowId:any){
        this.swapArray(rowId,rowId-1);
        this.updateKeyVl();
    }
    /**
     * 下移
     */
    moveDown(rowId:any){
        this.swapArray(rowId,rowId+1);
        this.updateKeyVl();
    }
    swapArray(index1:any, index2:any) {
        if(index1 >=0 && index2 >=0){
            let arr = this.cds.cdata.data;
            let idx_1 = arr[index1]; 
            let idx_2 = arr[index2];
            if(index1 > index2){
                this.cds.cdata.data.splice(index1,1)
                this.cds.cdata.data.splice(index2,1)
                this.cds.cdata.data.splice(index2,0,idx_1);
                setTimeout(() => {
                    this.cds.cdata.data.splice(index1,0,idx_2);    
                }, 1000);
            }else{
                this.cds.cdata.data.splice(index2,1)
                this.cds.cdata.data.splice(index1,1)
                this.cds.cdata.data.splice(index1,0,idx_2);
                setTimeout(() => {
                    this.cds.cdata.data.splice(index2,0,idx_1);
                }, 1000);
            }
        }
    }
    /**
     * 更新主健值
     */
    updateKeyVl(){
        let xinc = -1;
        if (this.cds.ccells.pkindex) xinc = this.cds.ccells.pkindex[0];
        if (xinc >= 0) {
            let cel = this.cds.ccells.cels[xinc];
            let s0 = cel.psAutoInc;
            if (s0 == null || s0 == undefined || s0.length < 1 || cel.type !== 12) {
                for(var i=0;i<this.cds.cdata.data.length;i++){
                    let oldKey = JSON.stringify(this.cds.cdata.data[i].data[cel.id]);
                    if(!this.cds.cdata.data[i].oldpk){
                        this.cds.cdata.data[i].oldpk=[];
                    }
                    if(this.cds.cdata.data[i].oldpk.length == 0){
                        this.cds.cdata.data[i].oldpk.push(oldKey);
                    }
                    this.cds.cdata.data[i].data[cel.id] = i + 1
                    this.cds.cdata.data[i].c_state |= 16;
                }
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

<style lang="scss" scoped>
.title{
    height: 34px;
    line-height: 34px;
    padding-left: 2px;
    font-size: 14px;
}
</style>
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
.row_data{
    width: calc(100% - .625rem) !important;
}
.row_btn{
    text-align: center;
    padding-top: 5px;
    padding-bottom: 5px;
    width: .625rem !important;
    // button{
    //     width: 120px;
    // }
}
</style>

