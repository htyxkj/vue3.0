<template>
    <div >
        <el-dialog   class="bip-search bipinsaid" width="35%" :visible.sync="dialogVisible" :append-to-body="true" :close-on-press-escape="false" :close-on-click-modal="false">
            <!-- <span slot="title">
                <div class="el-dialog__title" style="padding-bottom: 15px;border-bottom: solid 1px #D9DFEF;">统计</div>
            </span> -->
             <!--弹出框头部-->
        <span slot="title">
            <div class="el-dialog__title" style="padding-bottom:5px">
                <i class="iconfont icon-bip-zhexian1"></i>
                图形
            </div>
        </span>
            <el-row class="statDlg">
                <el-form @submit.native.prevent ref="form" label-width="120px" size="medium">
                    <el-form-item class="bip-form-item" label="已保存方案">
                        <el-select v-model="programModel" collapse-tags class="bip-form-input" placeholder="请选择">
                            <el-option key="-1" label=" 　" :value="-1"> </el-option>
                            <el-option v-for="(item,index) in ProgramList" :key="index" :label="item.sname" :value="index"> </el-option>
                        </el-select>
                    </el-form-item> 
                    <el-form-item class="bip-form-item" label="图表类型" :required="true">
                        <el-input placeholder="请输入内容" v-model="chartT[chartTypeValue]" class="input-with-select bip-form-input">
                            <el-button slot="append" icon="el-icon-search" @click="showFigureType"></el-button>
                        </el-input>
                    </el-form-item>
                    <template v-if="chartTypeValue =='gantt-0'">
                        <el-form-item class="bip-form-item" label="统计项选择" :required="true">
                            <el-select v-model="selX1" clearable collapse-tags multiple  class="bip-form-input" placeholder="请选择">
                                <el-option v-for="item in groupCells" :key="item.id" :label="item.labelString" :value="item.id"
                                ></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item class="bip-form-item" label="时间" :required="true">
                            <el-select v-model="gtSelValue1" clearable collapse-tags class="bip-form-input" placeholder="请选择">
                                <el-option v-for="item in ganttDateCells" :key="item.id" :label="item.labelString" :value="item.id"
                                ></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item class="bip-form-item" label="时长(天)" :required="true">
                            <el-select v-model="gtSelValue2" clearable collapse-tags class="bip-form-input" placeholder="请选择">
                                <el-option v-for="item in valuesCells" :key="item.id" :label="item.labelString" :value="item.id"
                                ></el-option>
                            </el-select>
                        </el-form-item> 
                        <el-form-item class="bip-form-item" label="完成比例(实际)" :required="true">
                            <el-select v-model="gtSelValue3" clearable collapse-tags class="bip-form-input" placeholder="请选择">
                                <el-option v-for="item in valuesCells" :key="item.id" :label="item.labelString" :value="item.id"
                                ></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item class="bip-form-item" label="完成比例(应该)">
                            <el-select v-model="gtSelValue4" clearable collapse-tags class="bip-form-input" placeholder="请选择">
                                <el-option v-for="item in valuesCells" :key="item.id" :label="item.labelString" :value="item.id"
                                ></el-option>
                            </el-select>
                        </el-form-item> 
                    </template>
                    <template v-else>
                        <el-form-item class="bip-form-item" label="统计项选择" :required="true">
                            <el-select v-model="selX1" clearable collapse-tags class="bip-form-input" placeholder="请选择">
                                <el-option v-for="item in groupCells" :key="item.id" :label="item.labelString" :value="item.id"
                                ></el-option>
                            </el-select>
                        </el-form-item> 
                        <el-form-item v-if="showSelX2" class="bip-form-item" label="统计项选择" :required="true">
                            <el-select v-model="selX2" clearable collapse-tags class="bip-form-input" placeholder="请选择">
                                <el-option v-for="item in groupCells" :key="item.id" :label="item.labelString" :value="item.id"
                                ></el-option>
                            </el-select>
                        </el-form-item> 
                        <el-form-item class="bip-form-item" label="数据项选择" :required="true">
                            <el-select v-model="selValue" clearable collapse-tags class="bip-form-input" placeholder="请选择">
                                <el-option v-for="item in valuesCells" :key="item.id" :label="item.labelString" :value="item.id"
                                ></el-option>
                            </el-select>
                        </el-form-item> 
                    </template>

                    <el-form-item class="bip-form-item" label="显示图表" :required="true">
                        <el-radio v-model="showChart"  :label='true' style="margin-left: 20px;" >显示</el-radio>
                        <el-radio v-model="showChart"  :label='false' >不显示</el-radio>
                    </el-form-item>        
                </el-form> 
            </el-row>
            <hr/>
            <span slot="footer" class="dialog-footer" style="padding-top:0px">
                <el-button @click="close" size="mini">取  消</el-button>
                <el-button @click="showProgram" size="mini" type="warning">保存方案</el-button>
                <el-button @click="searchOK" type="primary" size="mini">确  定</el-button>    
            </span>
            <template>
                <bip-figure-type-dialog ref="figureTypeDialog" @setChartType="setChartType"></bip-figure-type-dialog>
            </template>


            <el-dialog title="保存方案" class="bip-search" width="45%" :visible.sync="saveProgram" :append-to-body="true" :close-on-press-escape="false" :close-on-click-modal="false">
                <!-- <span slot="title">
                    <div class="el-dialog__title" style="padding-bottom: 15px;border-bottom: solid 1px #D9DFEF;">保存方案</div>
                </span>  -->
                <el-form @submit.native.prevent ref="form" label-width="120px" size="medium">
                    <el-row class="statDlg">
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
                    <el-row style="padding:10px 45px 0px 25px" v-if="this.userAttr <=1">
                        <el-input placeholder="岗位编码分号分隔" size="small" v-model="gwCode">
                            <template slot="prepend">岗位编码</template>
                        </el-input>
                    </el-row>
                    <el-row style="padding:10px 45px 0px 25px">
                        <bip-search-cont :env="programEnv"></bip-search-cont>
                    </el-row>
                </template>
                 <hr/>
                <span slot="footer" class="dialog-footer" style="padding-top:0px">
                    <el-button @click="saveProgram =false" size="mini">取  消</el-button>
                    <el-button @click="saveProg" type="primary" size="mini">确  定</el-button>
                </span>
            </el-dialog>
        </el-dialog>
        <el-dialog title="桌面报表" class="bip-search " width="35%" :visible.sync="desktopListDlg" :append-to-body="true" :close-on-press-escape="false" :close-on-click-modal="false">
            <el-form @submit.native.prevent ref="form" label-width="120px" size="mini">
                <el-row style="padding:10px 45px 0px 25px">
                    <el-form-item class="bip-form-item" label="方案名称" :required="true">
                        <el-input v-model="dlProgram.name" placeholder="请输入内容"></el-input>
                    </el-form-item>  
                    <el-form-item class="bip-form-item" label="显示条件项" :required="true">
                        <el-radio v-model="dlProgram.ishowtj"  :label='true' style="margin-left: 20px;" >是</el-radio>
                        <el-radio v-model="dlProgram.ishowtj"  :label='false' >否</el-radio>
                    </el-form-item>        
                </el-row> 
            </el-form> 
            <hr/>
            <span slot="footer" class="dialog-footer" style="padding-top:0px">
                <el-button @click="desktopListDlg=false" size="mini">取  消</el-button>
                <el-button @click="desktopSave" type="primary" size="mini">保存组件</el-button>    
            </span>
        </el-dialog>

        <el-dialog  class="bip-search bipinsaid " width="50%" :visible.sync="dialogTstat" :append-to-body="true" :close-on-press-escape="false" :close-on-click-modal="false">
             <!--弹出框头部-->
        <span slot="title">
            <div class="el-dialog__title" style="padding-bottom:5px">
                <i class="iconfont icon-bip-tongji"></i>
                统计
            </div>
        </span>
            <el-row class="statDlg">
                <el-transfer v-model="tstatVl" :titles="['统计项', '统计项']" :data="groupCells" :props="{key: 'id',label: 'labelString'}"></el-transfer>
                <div style="margin: 15px 0;"></div>
                <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选数据项</el-checkbox>
                <div style="margin: 15px 0;"></div>
                <el-checkbox-group v-model="checkedCellsIndex" @change="checkChange">
                    <el-checkbox v-for="(item,index) in valuesCells" :label="index" :key="index">{{item.labelString}}</el-checkbox>
                </el-checkbox-group>
            </el-row>
            <hr/>
            <span slot="footer" class="dialog-footer" style="padding-top:0px">
                <el-button @click="close" size="mini">取  消</el-button>
                <el-button @click="searchTjOK" type="primary" size="mini">确  定</el-button>    
            </span>
        </el-dialog>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import  BipFigureTypeDialog  from "./BipFigureTypeDialog.vue";
import CDataSet from "@/classes/pub/CDataSet";
import CCliEnv from "@/classes/cenv/CCliEnv";
import QueryEntity from '@/classes/search/QueryEntity';
import QueryCont from '@/classes/search/QueryCont';
import { Cell } from '../../classes/pub/coob/Cell';
import { Cells } from "@/classes/pub/coob/Cells";
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi
import { BIPUtils } from "@/utils/BaseUtil";
let baseTool = BIPUtils.baseUtil;
@Component({
    components:{BipFigureTypeDialog}
})
export default class BipStatisticsDialog extends Vue {
    @Prop() env!:CCliEnv;
    dialogVisible: boolean = false;
    saveProgram: boolean = false;
    selX1:any = null;
    selX2:any = null;
    selGroup:any =[];
    selValue:any = null;
    chartTypeValue:any=0;
    showChart:boolean = true;
    groupCells:Array<Cell>=[]
    valuesCells:Array<Cell>=[]
    ganttDateCells:Array<Cell>=[]//甘特图时间cell
    gtSelValue1:any ="";//甘特图时间
    gtSelValue2:any ="";//甘特图天数
    gtSelValue3:any ="";//甘特图完成比例 实际
    gtSelValue4:any ="";//甘特图完成比例 预计
    program:any={name:"",state:"save",isdesktop:false};
    programEnv:any=null;
    showSelX2:boolean=false;//是否是堆叠系列
    ProgramList :Array<any> = new Array<any>()
    programModel:any = -1;
    gwCode:any = null;
    chartT:any = {
        'line-0':'折线图', 'line-1':'折线面积图', 'line-2':'平滑折线图', 'line-3':'平滑面积折线图', 'line-4':'堆叠折线图',
        'line-5':'堆叠面积折线图', 'line-6':'平滑堆叠折线图', 'line-7':'平滑堆叠面积折线图',
        'bar-0':'柱状图','bar-1':'条形图','bar-2':'堆叠柱状图','bar-3':'堆叠条形图','bar-4':'堆叠柱状图','bar-5':'堆叠条形图',
        'pie-0':'饼状图','pie-1':'环形图','pie-2':'玫瑰图','scatter-0':'散点图',"radar-0":'雷达图',"funnel-0":"漏斗图",'gantt-0':'甘特图'
    };
    desktopListDlg:boolean = false;
    dlProgram:any={name:"",menuid:'',ishowtj:false};
    userAttr:any = 99;

    /********* 统计 ***********/
    dialogTstat:boolean = false;//统计dialog
    tstatVl:any=[];//统计勾选字段
    isIndeterminate:boolean = true;
    checkedCellsIndex:any=[];
    checkAll:boolean= true

    mounted() {
        this.init();
    }
    init(){
        this.chartTypeValue = "line-0"; 
        this.groupCells = this.env.dsm.ccells.cels.filter(item=>{
            return (item.type !== 2 && item.type !== 3 && item.type !== 4 && item.type !== 5 && item.type !== 6 && item.type !== 8) &&item.isShow
        })
        this.valuesCells = this.env.dsm.ccells.cels.filter(item=>{
            return (item.type == 2 || item.type == 3 || item.type == 4 || item.type == 5 || item.type == 6 || item.type == 8) && item.isShow && (item.attr & 0x2000)>0
        })
        this.ganttDateCells = this.env.dsm.ccells.cels.filter(item=>{
            return (item.type == 93 || item.type == 91 || item.type == 92) &&item.isShow
        })
    }
    openPic() {//图形统计
        let userAttr = JSON.parse(window.sessionStorage.getItem("user") + "").attr;
        userAttr = parseInt(userAttr)
        if(isNaN(userAttr))
            userAttr = 99
        this.userAttr = userAttr;
        if(this.ProgramList.length == 0)
        this.getProgram();
        this.dialogVisible = true;
    }

    openTstat(){//表格统计
        this.init();
        if(this.valuesCells && this.valuesCells.length ==0){
            this.$notify.warning('当前页面不存在可统计的数据项字段！');
        }else{
            this.handleCheckAllChange(true);
            this.dialogTstat = true;
        }
    }
    //表格统计 数据项全选
    handleCheckAllChange(val:any){
        if(val){
            if(this.checkedCellsIndex.length == 0)
            for(var i=0;i<this.valuesCells.length;i++){
                this.checkedCellsIndex.push(i);
            }
        }else{
            this.checkedCellsIndex=[];
        }
        this.isIndeterminate = false;
    }
    //表格统计数据项单个选择
    checkChange(value:any){
        let checkedCount = value.length;
        this.checkAll = checkedCount === this.valuesCells.length;
        this.isIndeterminate = checkedCount > 0 && checkedCount < this.valuesCells.length;
    }
    searchTjOK(){
        if(this.tstatVl.length ==0){
            this.$notify.warning('请勾选统计项字段！');
            return;
        }
        if(this.checkedCellsIndex.length==0){
            this.$notify.warning('请勾选数据项字段！');
            return;
        }
        let selValue = [];
        for(var i=0;i<this.checkedCellsIndex.length;i++){
            let cel = this.valuesCells[this.checkedCellsIndex[i]];
            if((cel.attr & 0x2000)>0){
                selValue.push(cel.id)
            }
        }
        this.$emit("makeOK",this.tstatVl,selValue,this.chartTypeValue,false);
        this.close();
    }

    //将报表界面保存为桌面组件
    openDesktopList(){
        let MID_  = this.$route.query.pmenuid + "";
        let menu = baseTool.findMenu(MID_);
        if(menu){
            this.dlProgram.name = menu.menuName;
            this.dlProgram.menuid = MID_;
        }
        this.desktopListDlg=true;
    }
    //将报表保存为桌面组件
    async desktopSave(){
        let cds1:any = await this.getCell("INSDESK");
        if(cds1 !=null){
            let cell:CDataSet = cds1; 
            cell.currRecord = cell.createOne();
            if(this.userAttr <=1){
                cell.currRecord.data.usrcode = "*";
            }
            cell.currRecord.data.rech="{}"
            cell.currRecord.data.comtype= "ReportList";
            cell.currRecord.data.cont = JSON.stringify(this.dlProgram);
            cell.currRecord.data.sname= this.dlProgram.name;
            cell.currRecord.data.gwcode = this.gwCode;
            let res = await cell.saveData();
            if(res.data.id == 0 ){
                this.$notify.success("桌面组件保存成功！");
            }else{
                this.$notify.success("桌面组件保存失败！");
            }
        }
        this.desktopListDlg=false;
    }

    close(){
        this.dialogVisible = false;
        this.dialogTstat = false;
    }
    searchOK(){
        let selValue = [];
        if(this.chartTypeValue != 'gantt-0'){
            this.selGroup = [this.selX1]
            if(this.selX2)
                this.selGroup.push(this.selX2)
            if(this.selGroup == null){
                this.$notify.warning('请勾选"统计项选择"');
                return;
            }
            if(this.selValue == null){
                this.$notify.warning('请勾选"数据项选择"');
                return;
            }
            selValue = [this.selValue];
        }else{
            this.selGroup = this.selX1
            if(this.selGroup == null){
                this.$notify.warning('请勾选"统计项选择"');
                return;
            }
            if(this.gtSelValue1 == null){
                this.$notify.warning('请勾选"时间"');
                return
            }
            if(this.gtSelValue2 == null){
                this.$notify.warning('请勾选"时长"');
                return
            }
            selValue = [this.gtSelValue1,this.gtSelValue2,this.gtSelValue3]
            if(this.gtSelValue4 && this.gtSelValue4!='""')
            selValue.push(this.gtSelValue4)
        }
        this.$emit("makeOK",this.selGroup,selValue,this.chartTypeValue,this.showChart);
        this.close();
    }
    /**
     * 显示统计图全部类型
     */
    showFigureType(){
        let figureTypeDialog:any = this.$refs["figureTypeDialog"];
        if(figureTypeDialog)
            figureTypeDialog.open();
    }
    /**
     */
    setChartType(chartType:any){
        this.chartTypeValue = chartType;
        if(chartType=="line-4" || chartType == "line-5" || chartType == "line-6" || chartType == "line-7" || chartType == "bar-2" || chartType == "bar-3"|| chartType == "bar-4"|| chartType == "bar-5"){
            this.showSelX2 = true;
        }else{
            this.selX2 = null;
            this.showSelX2 = false;
        }
    }
    /**
     * 显示保存查询方案页面
     */
    showProgram(){
        // this.selGroup = [this.selX1]
        // if(this.selX2)
        //     this.selGroup.push(this.selX2)
        // if(this.selGroup == null){
        //     this.$notify.warning('请勾选"统计项选择"');
        //     return;
        // }
        // if(this.selValue ==null){
        //     this.$notify.warning('请勾选"数据项选择"');
        //     return;
        // }
        let selValue = [];
        if(this.chartTypeValue != 'gantt-0'){
            this.selGroup = [this.selX1]
            if(this.selX2)
                this.selGroup.push(this.selX2)
            if(this.selGroup == null){
                this.$notify.warning('请勾选"统计项选择"');
                return;
            }
            if(this.selValue == null){
                this.$notify.warning('请勾选"数据项选择"');
                return;
            }
            selValue = [this.selValue];
        }else{
            this.selGroup = this.selX1
            if(this.selGroup == null){
                this.$notify.warning('请勾选"统计项选择"');
                return;
            }
            if(this.gtSelValue1 == null){
                this.$notify.warning('请勾选"时间"');
                return
            }
            if(this.gtSelValue2 == null){
                this.$notify.warning('请勾选"时长"');
                return
            }
            if(this.gtSelValue3 == null){
                this.$notify.warning('请勾选"完成比例-实"');
                return
            }
            selValue = [this.gtSelValue1,this.gtSelValue2,this.gtSelValue3]
            if(this.gtSelValue4 && this.gtSelValue4!='""')
            selValue.push(this.gtSelValue4)
        }
        this.selValue = selValue.toString();
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
            let selValue = this.selValue;
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
            if(this.userAttr <=1){
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
                    if(this.userAttr <=1){
                        cell.currRecord.data.usrcode = "*";
                    } 
                    let cc = JSON.stringify(this.programEnv.ds_cont.currRecord.data,this.testReplacer);
                    cell.currRecord.data.rech = cc;
                    cell.currRecord.data.comtype= "Report";
                    cell.currRecord.data.cont = JSON.stringify(cont);
                    cell.currRecord.data.sname= this.program.name;
                    cell.currRecord.data.gwcode = this.gwCode;
                    let res = await cell.saveData();
                    console.log(res);
                
                    if(res.data.id == 0 ){
                        this.$notify.success("桌面组件保存成功！");
                    }else{
                        this.$notify.success("桌面组件保存失败！");
                    }
                }
            }
            this.getProgram();
            this.saveProgram = false;
        }else{
            this.$notify.error("对象INSPARA不存在！")
        }
    }
    testReplacer(key:any,value:any){//key为对象属性名，value为对象属性值，会遍历testObj或testArr来执行该函数
        if(value== null){
            value = "";
        }
        return value;
    }
    /**
     * 查询统计方案
     */
    async getProgram(){
        //没有做数据格式处理 直接返回数组
        //cid,sname,spflds,spbds,charttype,showchart
        //序号,名称,数据项,统计项,图表类型,是否显示图表
        let qe:QueryEntity = new QueryEntity('','');
        // qe.cont="~cellid='"+this.env.dsm.ccells.obj_id+"'"
        let allCont = [];
        let oneCont = []; 
        let qCont = new QueryCont('cellid',this.env.dsm.ccells.obj_id,12);
        qCont.setContrast(0);
        oneCont.push(qCont);
        allCont.push(oneCont);
        qe.cont = "~"+JSON.stringify(allCont);
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
                    this.selValue = cc.spflds
                else
                    this.selValue = null;
                if(cc.spbds)
                    this.selGroup = cc.spbds.split(",")
                this.selX1 = this.selGroup[0];
                if(cc.charttype){
                    this.chartTypeValue = cc.charttype;
                    if(cc.charttype=="line-4" || cc.charttype == "line-5" || cc.charttype == "line-6" || cc.charttype == "line-7" || cc.charttype == "bar-2" || cc.charttype == "bar-3" || cc.charttype == "bar-4" || cc.charttype == "bar-5"){
                        this.showSelX2 = true;
                        this.selX2 = this.selGroup[1];
                    }else{
                        this.selX2 = null;
                        this.showSelX2 = false;
                    }
                }
                this.showChart = cc.showchart==0?false:true;
            }else{
                this.selValue = ""
                this.selGroup = []
                this.selX2 = null;
                this.selX1 = null;
                this.showSelX2 = false;
                this.showChart = true;
            }
        }else{ 
            this.program.name = '' ;
            this.program.isdesktop = false;
            this.selValue = ""
            this.selGroup = []
            this.selX2 = null;
            this.selX1 = null;
            this.showSelX2 = false;
            this.chartTypeValue = "line-0"
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
.bip-form-input {
    // margin-left: 20px;
    width: 70%
}
</style>
<style>
.statDlg{
    padding:10px 25px 0px 25px;
}
.statDlg .el-form-item__label{
    padding: 0px 15px !important;
}
</style>