<template>
    <div>
        <el-dialog class="bip-search" width="35%" :visible.sync="dialogVisible" :append-to-body="true" :close-on-press-escape="false" :close-on-click-modal="false">
            <span slot="title">
                <div class="el-dialog__title" style="padding-bottom: 15px;border-bottom: solid 1px #D9DFEF;">统计</div>
            </span>
            <el-row style="padding:10px 25px 0px 25px">
                <el-form ref="form" label-width="120px" size="mini">
                    <el-form-item class="bip-form-item" label="已保存方案">
                        <el-select v-model="programModel" collapse-tags style="margin-left: 20px;" placeholder="请选择">
                            <el-option key="-1" label=" 　" :value="-1"> </el-option>
                            <el-option v-for="(item,index) in ProgramList" :key="index" :label="item.sname" :value="index"> </el-option>
                        </el-select>
                    </el-form-item> 
                    <el-form-item class="bip-form-item" label="统计项选择" :required="true">
                        <el-select v-model="selGroup" clearable  multiple collapse-tags style="margin-left: 20px;" placeholder="请选择">
                            <el-option v-for="item in groupCells" :key="item.id" :label="item.labelString" :value="item.id"
                            ></el-option>
                        </el-select>
                    </el-form-item> 
                    <el-form-item class="bip-form-item" label="数据项选择" :required="true">
                        <el-select v-model="selValue" clearable  multiple collapse-tags style="margin-left: 20px;" placeholder="请选择">
                            <el-option v-for="item in valuesCells" :key="item.id" :label="item.labelString" :value="item.id"
                            ></el-option>
                        </el-select>
                    </el-form-item> 
                    <el-form-item class="bip-form-item" label="图表类型" :required="true">
                        <el-select v-model="chartTypeValue" collapse-tags style="margin-left: 20px;" placeholder="请选择">
                            <el-option v-for="item in chartType" :key="item.id" :label="item.name" :value="item.id"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item class="bip-form-item" label="显示图表" :required="true">
                        <el-radio v-model="showChart"  :label='true' style="margin-left: 20px;" >显示</el-radio>
                        <el-radio v-model="showChart"  :label='false' >不显示</el-radio>
                    </el-form-item>        
                </el-form> 
            </el-row>
            <span slot="footer" class="dialog-footer" style="padding-top:0px">
                <el-button @click="close" size="mini">取  消</el-button>
                <el-button @click="searchOK" type="primary" size="mini">确  定</el-button>
                <el-button @click="showProgram" size="mini" type="warning">保存方案</el-button>
            </span>



            <el-dialog class="bip-search" width="45%" :visible.sync="saveProgram" :append-to-body="true" :close-on-press-escape="false" :close-on-click-modal="false">
                <span slot="title">
                    <div class="el-dialog__title" style="padding-bottom: 15px;border-bottom: solid 1px #D9DFEF;">保存方案</div>
                </span> 
                <el-form ref="form" label-width="120px" size="mini">
                    <el-row style="padding:10px 45px 0px 25px">
                        <el-form-item class="bip-form-item" label="方案名称" :required="true">
                            <el-input v-model="program.name" placeholder="请输入内容"></el-input>
                        </el-form-item>  
                        <el-form-item class="bip-form-item" label="保存为桌面" :required="true">
                            <el-radio v-model="program.isdesktop"  :label='true' style="margin-left: 20px;" >是</el-radio>
                            <el-radio v-model="program.isdesktop"  :label='false' >否</el-radio>
                        </el-form-item>        
                    </el-row> 
                </el-form> 
                <template v-if="program.isdesktop">
                    <el-row style="padding:10px 45px 0px 25px">
                        <bip-search-cont :env="programEnv"></bip-search-cont>
                    </el-row>
                </template>
                <span slot="footer" class="dialog-footer" style="padding-top:0px">
                    <el-button @click="saveProgram =false" size="mini">取  消</el-button>
                    <el-button @click="saveProg" type="primary" size="mini">确  定</el-button>
                </span>
            </el-dialog>
        </el-dialog>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import CDataSet from "@/classes/pub/CDataSet";
import SearchEntity from "@/classes/SearchEntity";
import CCliEnv from "@/classes/cenv/CCliEnv";
import QueryEntity from '@/classes/search/QueryEntity';
import { Cell } from '../../classes/pub/coob/Cell';
import { Cells } from "@/classes/pub/coob/Cells";
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi
import {CommICL} from '@/utils/CommICL'
let ICL = CommICL
@Component({})
export default class BipStatisticsDialog extends Vue {
    @Prop() env!:CCliEnv;
    @Provide() dialogVisible: boolean = false;
    @Provide() saveProgram: boolean = false;
    @Provide() selGroup:any =[];
    @Provide() selValue:any = [];
    @Provide() chartTypeValue:any=0;
    @Provide() chartType:any =  [{id:"line",name:"线图"},{id:"pie",name:"饼图"},{id:"bar",name:"柱状图"},{id:"lineArea",name:"面积图"}];
    @Provide() showChart:boolean = true;
    @Provide() groupCells:Array<Cell>=[]
    @Provide() valuesCells:Array<Cell>=[]
    @Provide() program:any={name:"",state:"save",isdesktop:false};
    @Provide() programEnv:any=null;
    
    // @Provide() cellsTJ:Array<Cell> = new Array<Cell>()
    // @Provide() cdsTJ:CDataSet = new CDataSet('');
    @Provide() ProgramList :Array<any> = new Array<any>()
    @Provide() programModel:any = -1;
    mounted() {
        this.chartTypeValue = "line"; 
        this.groupCells = this.env.dsm.ccells.cels.filter(item=>{
            return (item.type !== 2 && item.type !== 3 && item.type !== 4 && item.type !== 5 && item.type !== 6 && item.type !== 8) &&item.isShow
        })
        this.valuesCells = this.env.dsm.ccells.cels.filter(item=>{
            return (item.type == 2 || item.type == 3 || item.type == 4 || item.type == 5 || item.type == 6 || item.type == 8) &&item.isShow
        })
    }
    open() {
        if(this.ProgramList.length == 0)
        this.getProgram();
        this.dialogVisible = true;
    }
    close(){
        this.dialogVisible = false;
    }
    searchOK(){
        if(this.selGroup.length <=0){
            this.$notify.warning('请勾选"统计项选择"');
            return;
        }
        if(this.selValue.length <=0){
            this.$notify.warning('请勾选"数据项选择"');
            return;
        }
        this.$emit("makeOK",this.selGroup,this.selValue,this.chartTypeValue,this.showChart);
        this.close();
    }


    /**
     * 显示保存查询方案页面
     */
    showProgram(){
        if(this.selGroup.length <=0){
            this.$notify.warning('请勾选"统计项选择"');
            return;
        }
        if(this.selValue.length <=0){
            this.$notify.warning('请勾选"数据项选择"');
            return;
        }
        this.programEnv =  Object.assign(new CCliEnv(), this.env);
        this.programEnv.ds_cont.ccells.widthCell =2;  
        this.saveProgram = true;
    }
    /**
     * 进行方案保存
     */
    async saveProg(){
        let cds1:any = await this.getCell("INSPARA");
        if(cds1 !=null){
            let cell:CDataSet = cds1; 
            cell.currRecord = cell.createOne();
            if(this.program.name ==null ||this.program.name.length<=0){
                this.$notify.warning('请输入方案名称');
                return;
            }
            let selValue = "";
            for(var i =0; i<this.selValue.length;i++){
                selValue+= (this.selValue[i]+",")
            }
            selValue = selValue.substring(0,selValue.length-1)
            let selGroup="";
            for(var i =0; i<this.selGroup.length;i++){
                selGroup+= (this.selGroup[i]+",")
            }
            selGroup = selGroup.substring(0,selGroup.length-1)
            cell.currRecord.data.spflds = selValue
            cell.currRecord.data.spbds = selGroup
            cell.currRecord.data.sname = this.program.name
            cell.currRecord.data.charttype = this.chartTypeValue;
            cell.currRecord.data.showchart = this.showChart?1:0;
            cell.currRecord.data.cid = 10;
            cell.currRecord.data.c_corp = 0;
            cell.currRecord.data.cellid = this.env.dsm.ccells.obj_id;
            let userAttr = JSON.parse(window.sessionStorage.getItem("user") + "").attr;
            if(userAttr <=1){
                cell.currRecord.data.usrcode = "*";
            } 
            let res = await cell.saveData();
            if(res.data.id == 0 ){
                this.$notify.success("统计方案保存成功！");
            }else{
                this.$notify.success("统计方案保存失败！");
            }
            if(this.program.isdesktop){//保存桌面组件
                let cds1:any = await this.getCell("INSDESK");
                if(cds1 !=null){
                    let cell:CDataSet = cds1; 
                    cell.currRecord = cell.createOne();
                    let cont = {spflds:selValue,spbds:selGroup,charttype:this.chartTypeValue,
                                showchart:this.showChart?1:0,menuid:this.$route.query.pmenuid,};
                    let userAttr = JSON.parse(window.sessionStorage.getItem("user") + "").attr;
                    if(userAttr <=1){
                        cell.currRecord.data.usrcode = "*";
                    } 
                    cell.currRecord.data.rech = JSON.stringify(this.programEnv.ds_cont.currRecord.data);
                    cell.currRecord.data.comtype= "Report";
                    cell.currRecord.data.cont = JSON.stringify(cont);
                    cell.currRecord.data.sname= this.program.name;
                    let res = await cell.saveData();
                    if(res.data.id == 0 ){
                        this.$notify.success("桌面组件保存成功！");
                    }else{
                        this.$notify.success("桌面组件保存失败！");
                    }
                }
            }
            this.getProgram();
            this.saveProgram = false;
        } 
    }
    /**
     * 查询统计方案
     */
    async getProgram(){
        //没有做数据格式处理 直接返回数组
        //cid,sname,spflds,spbds,charttype,showchart
        //序号,名称,数据项,统计项,图表类型,是否显示图表
        let qe:QueryEntity = new QueryEntity('','');
        qe.cont="~cellid='"+this.env.dsm.ccells.obj_id+"'"
        qe.page.currPage = 1;
        qe.page.pageSize = 100;

        let cc = await tools.getBipInsAidInfo("INSPARA",210,qe)
        console.log(cc);
        if(cc.data.id == 0){
            this.ProgramList = cc.data.data.data.values
        }
    }

    @Watch("programModel")
    programModelWatch(){
        if(this.programModel >=0 ){
            let cc = this.ProgramList[this.programModel]
            if(cc){
                if(cc.spflds)
                    this.selValue = cc.spflds.split(",")
                else
                    this.selValue = [];
                if(cc.spbds)
                    this.selGroup = cc.spbds.split(",")
                else
                    this.selGroup = []
                if(cc.charttype)
                    this.chartTypeValue = cc.charttype
                else
                    this.chartTypeValue = "line" 
                this.showChart = cc.showchart==0?false:true;
            }else{
                this.selValue = []
                this.selGroup = []
                this.chartTypeValue = "line"
                this.showChart = true;
            }
            // this.program.name= cc.sname;
            // this.program.cid = cc.cid; 
        }else{ 
            this.program.name = '' ;
            this.program.isdesktop = false;
            this.selValue = []
            this.selGroup = []
            this.chartTypeValue = "line"
            this.showChart = true;
        }
    } 

    /**
     * 获取对象
     */
    async getCell(cellid:string){
        let res = await tools.getCCellsParams(cellid); 
        let rtn: any = res.data; 
        if (rtn.id == 0) {
            let kn: Array<Cells> = rtn.data.layCels;
            let cells = kn; 
            return new CDataSet(cells[0]);  
        }else{
            return null;
        }
    }
}
</script>
<style lang="scss" scoped>
.bip-form-item {
  margin-bottom: 22px !important;
}
</style>
