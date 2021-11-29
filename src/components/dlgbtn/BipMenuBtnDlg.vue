<template>
    <el-row>  
        <el-dialog class="dlgbtn" :title="Title" :visible.sync="sqlDlg0" width="40%" append-to-body>
            <el-dialog class="dlgbtn" :title="Title" :visible.sync="sqlDlg1" width="30%" append-to-body>
                <span :style="sqlStyle[1]">{{sqlCont[1]}}</span>
                <span slot="footer" class="dialog-footer">
                 <hr>
                    <el-button @click="sqlOk(false,1)">取 消</el-button>
                    <el-button type="primary" @click="sqlOk(true,1)">确 定</el-button>
                </span>
            </el-dialog>
            <span :style="sqlStyle[0]">{{sqlCont[0]}}</span>
            <span  slot="footer" class="dialog-footer">
            <hr>
                <el-button @click="sqlOk(false,0)">取 消</el-button>
                <el-button type="primary" @click="sqlOk(true,0)">确 定</el-button>
            </span>  
        </el-dialog> 
        <el-dialog :title="dlgDCell.ccells.desc" :close-on-click-modal="false" :visible.sync="showDCell" width="50%" append-to-body>
            <el-row class="bip-lay">
                <el-form @submit.native.prevent label-position="right" label-width="120px">
                    <div v-for="(cel,index) in dlgDCell.ccells.cels" :key="'A'+index">
                        <bip-comm-editor
                            v-if="(cel.attr&0x400) <= 0 "
                            :cell="cel"
                            :bgrid="false"
                            :cds="dlgDCell"
                            :row="0"
                        />
                    </div>
                </el-form>
            </el-row>
            <span slot="footer" class="dialog-footer">
                <el-button @click="showDCell = false" size="mini">取 消</el-button>
                <el-button type="primary" @click="dlgDOk" size="mini">确 定</el-button>
            </span>
        </el-dialog>
        <template v-if="openCell">
            <el-dialog :title="Title" :visible.sync="openCell" append-to-body>
                <div class="">
                    <el-scrollbar style="margin-bottom:0px;  margin-right: 0px;">
                        <el-form @submit.native.prevent label-position="right" label-width="120px">
                            <bip-comm-editor  v-for="(cel,index) in laycell.uiCels" :key="index" :cell="cel" :cds="cellCds" :row="cellCds.index" :bgrid="false"/>
                        </el-form> 
                    </el-scrollbar>
                </div>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="cellOk(false)">取 消</el-button>
                    <el-button type="primary" @click="cellOk(true)">确 定</el-button>
                </span>   
            </el-dialog> 
        </template>
        <bip-ygxz-dia ref="ygxz"></bip-ygxz-dia> 
        <el-dialog title="微信扫码支付" :visible.sync="showPayQR" append-to-body :close-on-click-modal="false" width="400px" class="bip-query">
            <div style="text-align: center;">
                <vue-qr :text="code_url" :size="200"></vue-qr>
            </div>
            <div style="text-align: center;">
                {{total_fee}}
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="showPayQR =false">取 消</el-button>
            </span>   
        </el-dialog> 
        <!-- 三资股权打印 -->
        <el-dialog class="dlgbtn" :title="'系统提示'" :visible.sync="printShow" width="40%" append-to-body>
            <el-row :gutter="20">
                <el-col :span="12">
                    当前页：
                    <el-input-number v-model="pageInfo.page" size="small" :max="4" :min="1"></el-input-number>
                </el-col>

                <el-col :span="12">
                    当前行：
                    <el-input-number v-model="pageInfo.row" size="small" :min="1" :max="15"></el-input-number>
                </el-col>
            </el-row>

            <span  slot="footer" class="dialog-footer">
            <hr>
                <el-button size="small" @click="printShow = false">取 消</el-button>
                <el-button size="small" class="bip_btn_primary" @click="doPrint()">确 定</el-button>
            </span>  
        </el-dialog> 
        <!-- DLG  G -->
        <el-dialog class="dlgbtn" :title="this.btn.name" :visible.sync="dlgGShow" width="40%" append-to-body>
            <vxe-table :keep-source="false" class="mytable-scrollbar" border resizable size="small"
                highlight-hover-row show-all-overflow="tooltip" show-footer
                show-header-overflow highlight-current-row
                :data.sync="dlgGCell.cdata.data" :optimized="true" height="250" row-id="id"  
                header-cell-class-name="tableHead" :loading="g_table_loading"> 
                <template v-for="(item,index) in dlgGCell.ccells.cels">
                    <vxe-table-column header-align="center" :align="item.align" :field="item.id" :key="index"
                        :title="item.labelString" show-header-overflow v-if="(item.attr&0x400)<=0"
                        :show-overflow="item.editType!=6" :sortable ="(item.attr&0x400000)>0"  >
                        <template v-slot="{rowIndex}"> 
                            <bip-grid-info :cds="dlgGCell" :cell="item" :row="rowIndex" :bgrid="true" ></bip-grid-info>
                        </template>
                    </vxe-table-column>
                </template>
            </vxe-table>
            <el-pagination background layout="prev, pager, next, jumper" :page-size="20" :total="dlgGCell.cdata.page.total" :current-page="dlgGCell.cdata.page.currPage" @current-change="dlgGTablePC"></el-pagination>
            <span  slot="footer" class="dialog-footer">
            <hr>
                <el-button size="small" class="bip_btn_primary" @click="dlgGShow = false">确 定</el-button>
            </span>  
        </el-dialog> 
        <!-- DLG  G1 -->
        <el-drawer :title="this.btn.name" :visible.sync="dlgG1Show" size="40%" style="z-index:1000">
            <vxe-table :keep-source="false" class="mytable-scrollbar" border resizable size="small"
                :scroll-y="{enabled: false}" :scroll-x="{enabled: false}" highlight-current-row
                :data.sync="dlgGCell.cdata.data" :optimized="true" :height="drawerTableH" row-id="id"  
                header-cell-class-name="tableHead" :loading="g_table_loading"> 
                <template v-for="(item,index) in dlgGCell.ccells.cels">
                    <vxe-table-column header-align="center" :align="item.align" :field="item.id" :key="index"
                        :title="item.labelString" show-header-overflow v-if="(item.attr&0x400)<=0"
                        :sortable ="(item.attr&0x400000)>0"  >
                        <template v-slot="{rowIndex}"> 
                            <bip-grid-info :cds="dlgGCell" :cell="item" :row="rowIndex" :bgrid="true" ></bip-grid-info>
                        </template>
                    </vxe-table-column>
                </template>
            </vxe-table>
            <el-pagination background layout="prev, pager, next, jumper" :page-size="20" :total="dlgGCell.cdata.page.total" :current-page="dlgGCell.cdata.page.currPage" @current-change="dlgGTablePC"></el-pagination>
        </el-drawer>
    </el-row>
</template>
<script lang="ts">
/**
 * 常量定义 DLG.  解析
 */
import { Component, Vue ,Inject} from "vue-property-decorator";
import CDataSet from "@/classes/pub/CDataSet";
import CCliEnv from "@/classes/cenv/CCliEnv";
import { BIPUtil } from "@/utils/Request"; 
let tools = BIPUtil.ServApi;
import { Cells } from "@/classes/pub/coob/Cells";
import QueryEntity from "@/classes/search/QueryEntity";
import { BIPUtils } from "@/utils/BaseUtil";
import CRecord from '@/classes/pub/CRecord';
import VueQr from 'vue-qr'
let baseTool = BIPUtils.baseUtil;
import { GlobalVariable } from '@/utils/ICL';
import {BaseVariable} from "@/utils/BaseICL"
import BipYgxzDia from './BipYGXZDia.vue';
import BipGridInfo from "../editorn/grid/BipGridInfo.vue";
@Component({
    components: {BipYgxzDia,VueQr,BipGridInfo}
})
export default class BipMenuBtnDlg extends Vue { 
    @Inject('heightInfo') heightInfo!:any;
    btn:any = ""; 
    env:CCliEnv = new CCliEnv();
    sqlDlg0:boolean = false;//sql弹框是否显示
    sqlDlg1:boolean = false;//sql弹框是否显示
    sqlStyle:Array<any> = [];//sql样式
    sqlCont:Array<any> = [];//sql提示内容
    Title:string = "";//sql弹框标题
    bok:boolean = false;//对象弹框是否显示
    laycell:any;
    uiCels:any = [];
    openCell:boolean = false;//是否打开对象
    cellKey:string = '';//B 打开对象的主键 字段
    cellCds:CDataSet = new CDataSet('');
    dlgDCell: CDataSet = new CDataSet("");//D: 弹出对象
    showDCell:boolean =false;
    showPayQR:boolean = false;//微信收款二维码弹框
    code_url:any ="";//二维码内容
    total_fee:any = 0;//支付金额
    uri:string=""//附件操作接口
    currBtn:any = null;
    pageInfo:any = {
        page:1,
        row:1
    }
    printShow:boolean = false;
    dlgGCell: CDataSet = new CDataSet("");//G: 弹出对象表格形式
    dlgGShow:boolean = false;
    dlgG1Show:boolean = false;
    g_table_loading:boolean = false;
    drawerTableH:any = 400;
    mounted() {

    }
    /**
     * DLG入口
     */
    async open(btn:any,env:CCliEnv){
        this.uri = BaseVariable.BaseUri+''+GlobalVariable.API_UPD
        this.btn = btn; 
        this.env = env;
        this.Title = btn.name;
        if(btn.dlgType == 'A'){ // 执行SQL
            if((this.env.dsm.ccells.attr&0x40)>0 && this.env.dsm.currRecordArr.length ==0){
                this.$notify.warning("请勾选数据行！")
                return;
            }
            this.sqlCont = [];
            this.sqlStyle = []; 
            let cont = btn.dlgCont.split(";")[0];
            let ts = cont.split(",");
            ts.forEach((item:any) => {
                let tt = item.split("_style:");
                this.sqlCont .push(tt[0]);
                if(tt[1]){
                    let st = tt[1].replace(new RegExp("\\|",'g')," ;");    
                    this.sqlStyle.push(st);
                }
            });
            //请确认，是否注销该读者?_style:color:red|font-size:12px,请确认，是否注销该读者?_style:color:red|font-size:12px,;update insuser set  usrattr='9'  where  usrcode=@usrcode;0:注销失败;1:注销成功
            this.sqlDlg0 = true;
        }else if(btn.dlgType == 'B'){ //打开对象 
            this.openCell = false;
            this.laycell = [];
            this.uiCels  = []; 
            let arr_cont = btn.dlgCont.split(";");
            let cellId = arr_cont[0];
            let key = arr_cont[1];
            let value = null;
            if(arr_cont.length>2){
                value =  arr_cont[2];
            }
            this.cellKey = key;
            if((this.env.dsm.ccells.attr & 0x40)>0){
                if(this.env.dsm.currRecordArr.length ==0){
                    this.$message.warning("请勾选数据！")
                    return;
                }
            }
            let vl = this.env.dsm.currRecord.data[key]
            this.getCell(cellId,key,vl,value)
        }else if(btn.dlgType == 'C'){ //打开菜单
            console.log("打开菜单")
            //D:人员补签,cdlgxx1;KQ0713;KQ0715=KQ0713A,sopr=sopr
            let cont = btn.dlgCont.split(";");
            let cont0 = cont[0]; //打开的菜单
            let cont1 = cont[1]; //数据值
            let cont2 = "";
            if(cont.length>=3){
                cont2 = cont[2]; //条件值
            }
            let cell = cont1.substring(0,cont1.indexOf(",")).split("=")
            if(cont1.indexOf(",") !=-1){
				cont1 = cont1.substring(cont1.indexOf(",")+1)
			}else{
				cell = cont1.split("=");
			}
            let data = this.finCellData(this.env.dsm,cell[0])
            if(data.length ==0){
                this.$message.warning("请勾选数据！")
                return;
            }
            let cont1arr = cont1.split(",")
            let jsoncont:any = [];//传递的内容
            for(var j=0;j<data.length;j++){
                let d1:any={}
                for(var i=0;i<cont1arr.length;i++){
                    let zd = cont1arr[i].split("=")
                    d1[zd[1]] = data[j][zd[0]]
                }
                jsoncont.push(d1);
            }
            let jsontj:any = {};//传递的条件
            if(cont2 != ""){
                let cont2arr = cont2.split(",")
                for(var i=0;i<cont2arr.length;i++){
                    let zd = cont2arr[i].split("=")
                    let vl = data[0][zd[1]];
                    if(!vl)
                        vl = zd[1]
                    jsontj[zd[0]] = vl
                }  
            }
            //打开的菜单
            let me = baseTool.findMenu(cont0);  
            if (!me) {
                this.$notify.error( "没有" + cont0 + "菜单权限!" );
                return false;
            }else{
                let command = me.command.split("&");
                let pbuid = command[0].split("=");
                let pmenuid = command[1].split("="); 
                if(pbuid[0] == 'pbuid'){
                    this.$router.push({
                        path:'/layout',
                        name:'layout',
                        params:{method:"dlg",pmenuid:pmenuid[1],cellid:cell[1],jsoncont:jsoncont,jsontj:jsontj},
                        query: {pbuid:pbuid[1],pmenuid:pmenuid[1]},
                    })
                }else if(pbuid[0] == 'pmenu'){
                    if(this.btn.cmd=='DLG'){
                        this.$router.push({
                                path:'/'+pbuid[1],
                                name:pbuid[1],
                                params:{method:"dlg",pmenuid:pmenuid[1],cellid:cell[1],jsoncont:jsoncont,jsontj:jsontj},
                                query: {pmenuid:pmenuid[1]},
                            })
                    }else if(this.btn.cmd == 'DLG1'){
                        let param = {
                            childDlg_width:"50%",
                            childDlg_title:me.menuName,
                            obj_id:this.env.dsm.ccells.obj_id,
                            router:{
                                path:'/'+pbuid[1],
                                name:pbuid[1],
                                params:{method:"dlg",pmenuid:pmenuid[1],cellid:cell[1],jsoncont:jsoncont,jsontj:jsontj},
                                query: {pbuid:pbuid[1],pmenuid:pmenuid[1],time:new Date().getTime()},
                            }
                        };
                        this.$bus.$emit("openChildDlg",param);
                    }
                }
            }
        }else if(btn.dlgType == 'D'){ //调用后台程序 
            // let opera:any = this.env.dsm.opera;
            // if(opera && opera.statefld){
            //     let state = this.env.dsm.currRecord.data[opera.statefld];
            //     if(state && state !=0 && state != -1 && state !=5){
            //         return;
            //     }
            // }
            let dlgCont = this.btn.dlgCont;
            let cc = dlgCont.split(";")
            if(cc.length<4){
                let b = JSON.stringify(this.btn);
                let _env:any = {
                    uriParams:this.env.uriParams,
                    cells:this.env.cells,
                    dsm:this.env.dsm.currRecord,
                    dsmArr:this.env.dsm.currRecordArr,
                    ds_cont:this.env.ds_cont,
                    ds_ext:this.env.ds_ext
                }
                _env.ds_cont.scriptProc = null;
                if(_env.ds_ext){
                    _env.ds_ext.forEach((element:any) => {
                        element.scriptProc = null;
                    });
                }
                let v = JSON.stringify(_env);
                let bok = this.checkNotNull(this.env.dsm);
                if(!bok){
                    return ; 
                }
                this.$message.success("操作执行中。。。。。")
                await tools.getDlgRunClass(v,b).then(res =>{
                    if(res){
                        if(res.data.id == 0 ){
                            if(res.data.data){
                                let fj_root = res.data.data.fj_root;
                                let fj_name = res.data.data.fj_name;
                                if(fj_root && fj_name){
                                    this.handleDown(fj_root,fj_name);
                                }
                            }
                            if(cc[2] && cc[2] =='1'){
                                let tj =null;
                                if(res.data.data){
                                    let key = res.data.data.t_key;
                                    let value = res.data.data.t_value;
                                    if(key && value)
                                        tj = [key,value];
                                }
                                this.$emit("selData",tj)
                            }
                            this.$notify.success(res.data.message)
                        }else if(res.data.id == -2){
                            console.log(res);
                        }else {
                            this.$notify.error(res.data.message)
                        }
                    }
                })
            }else{
                let cellID = cc[3];
                if(cellID){
                    this.dlgDCell = await this.getCells(cellID);
                    this.dlgDCell.createRecord();
                    this.showDCell = true;
                }
            }
        }else if(btn.dlgType == 'E'){ //开支录入表员工按钮点击
            let opera:any = this.env.dsm.opera;
            if(opera && opera.statefld){
                let state = this.env.dsm.currRecord.data[opera.statefld];
                if(state && state !=0 && state != -1 && state !=5){
                    return;
                }
            }
            const loading = this.$loading({
                lock: true,
                text: '拼命加载中',
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.7)'
            });
            let dlgCont = this.btn.dlgCont;
            let cc = dlgCont.split(";")
            if(cc.length<3){
                let b = JSON.stringify(this.btn);
                let jsonv = {pbds:this.env.uriParams.pbds,data:this.env.dsm.currRecord}
                let v = JSON.stringify(jsonv); 
                await tools.getDlgRunClass(v,b).then(res =>{
                    if(res.data.id==0){
                        let values = res.data.data.values;
                        let Refer = res.data.data.refer;
                        let lbno = res.data.data.lbno;//页面上的类别
                        let yymm = res.data.data.yymm;//页面上的日期
                        let dia: any = this.$refs.ygxz;
                        if (dia) dia.open(values,Refer,b,lbno,yymm,this.env);
                        loading.close()
                    }else{
                        loading.close()
                        this.$notify.error(res.data.message)
                    }
                })
            }
        }else if(btn.dlgType == 'F'){ //生成微信收款二维码
            if ((this.env.dsm.currRecord.c_state & 2) > 0) {
                this.$alert(
                    `当前数据没有保存，请先保存当前行数据`,
                    `系统提醒`,
                    { type: "info" }
                ).catch(() => {
                    console.log("取消");
                });
                return;
            }
            const loading = this.$loading({
                lock: true,
                text: '拼命加载中',
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.7)'
            });
            let dlgCont = this.btn.dlgCont;
            let cc = dlgCont.split(";")
            let b = JSON.stringify(this.btn);
            let _env = {
                uriParams:this.env.uriParams,
                cells:this.env.cells,
                dsm:this.env.dsm.currRecord,
                dsmArr:this.env.dsm.currRecordArr,
                ds_cont:this.env.ds_cont,
                ds_ext:this.env.ds_ext
            }
            let v = JSON.stringify(_env);
            let bok = this.checkNotNull(this.env.dsm);
            if(!bok){
                return ; 
            }
            this.code_url = null;
            await tools.getDlgRunClass(v,b).then(res =>{
                loading.close();
                if(res.data.id ==0){
                    if(res.data.data){
                        this.code_url = res.data.data.code_url; 
                        let fee = res.data.data.total_fee;
                        this.total_fee =parseFloat(fee) /100;
                    }
                    if(this.code_url){
                        this.showPayQR = true;
                    }else{
                        this.$notify.success(res.data.message);
                    }
                }else{
                    this.$notify.error(res.data.message);
                }
            }).catch(e =>{
                loading.close();
            }) 
             
        }else if(btn.dlgType == 'P'){
            let b = JSON.stringify(this.btn);
            let state = this.env.dsm.currRecord.c_state
            if((state&1)>0||(state&2)>0){
                this.$message({
                        type: "error",
                        message: '请先保存!',
                        center:true
                    });
                    return ;
            }
            let _env:any = {
                dsm:this.env.dsm.currRecord,
                dsmArr:this.env.dsm.currRecordArr,
            }
            let v = JSON.stringify(_env);
            let res = await tools.getDlgRunClass(v,b);
            console.log(res);
            if(res.status == 200){
                let data= res.data;
                if(data.id==0){
                    window.open(data.message);
                }else{
                    this.$message({
                        type: "error",
                        message: data.message,
                        center:true
                    });
                }
            }else{
                this.$notify.error("操作失败！")
            }
        }else if(btn.dlgType == 'P1'){
             let state = this.env.dsm.currRecord.c_state
            if((state&1)>0||(state&2)>0){
                this.$message({
                        type: "error",
                        message: '请先保存!',
                        center:true
                    });
                    return ;
            }
            let b = JSON.stringify(this.btn);
            let _env:any = {
                dsm:this.env.dsm.currRecord,
                type:0
            }
            let v = JSON.stringify(_env);
            let res = await tools.getDlgRunClass(v,b);
            console.log(res);
            
            if(res.status == 200){
                let data= res.data;
                if(data.id==0){
                    this.currBtn = this.btn;
                    this.pageInfo = res.data.data.pageInfo
                    this.printShow = true;
                }else{
                    this.$message({
                        type: "error",
                        message: data.message,
                        center:true
                        
                    });
                }
            }else{
                this.$notify.error("操作失败！")
            }
            
        }else if(btn.dlgType.startsWith("G") == true){//点击按钮弹出一个表格(对象定义)
            this.initDLGGData(btn,1);
        }
    }
    async initDLGGData(btn:any,page:any){
        if(btn.dlgType =="G"){
            this.dlgGShow = true;
        }else {
            this.dlgG1Show = true;
        }
        if(this.heightInfo){
            this.drawerTableH = this.heightInfo.height;
        }
        this.g_table_loading = true;
        let cont = btn.dlgCont.split(";")
        this.dlgGCell = await this.getCells(cont[0]);
        let selTj:any = {};
        if(cont.length>=2){
            let tj = cont[1];
            if(tj){
                let tjs = tj.split(",");
                for(var i=0;i<tjs.length;i++){
                    let t = tjs[i].split("=");
                    selTj[t[0]] = this.env.dsm.currRecord.data[t[1]];
                }
            }
        }
        let qe:QueryEntity = new QueryEntity(cont[0],cont[0],selTj);
        qe.page.pageSize = 20
        qe.page.currPage = page;
        let vv = await tools.query(qe);
        if(vv.data.id ==0){
            let data = vv.data.data.data.data;
            let page = vv.data.data.data.page;
            this.dlgGCell.cdata.data = data;
            this.dlgGCell.cdata.page = page;
        }
        this.g_table_loading = false;
    }

    /**
     * DLG 表格页数发生变化
     */
    dlgGTablePC(page:any){
        this.initDLGGData(this.btn,page);
    }

    async dlgDOk(){
        this.showDCell = false;
        let b = JSON.stringify(this.btn);
        let _env:any = {
            uriParams:this.env.uriParams,
            cells:this.env.cells,
            dsm:this.env.dsm.currRecord,
            dsmArr:this.env.dsm.currRecordArr,
            ds_cont:this.env.ds_cont,
            ds_ext:this.env.ds_ext,
            externalCell:this.dlgDCell
        }
        _env.externalCell.scriptProc = null;
        _env.ds_cont.scriptProc = null;
        if(_env.ds_ext){
            _env.ds_ext.forEach((element:any) => {
                element.scriptProc = null;
            });
        }
        let v = JSON.stringify(_env);
        let bok = this.checkNotNull(this.env.dsm);
        if(!bok){
            return ; 
        }
        this.$message.success("操作执行中。。。。。")
        await tools.getDlgRunClass(v,b).then(res =>{
            if(res){
                if(res.data.id == 0 ){
                    this.$notify.success(res.data.message)
                    let dlgCont = this.btn.dlgCont;
                    let cc = dlgCont.split(";")
                    if(cc[2] && cc[2] =='1'){
                        this.$emit("selData")
                    }
                }else if(res.data.id == -2){
                    console.log(res);
                }else {
                    this.$notify.error(res.data.message)
                }
            }
        })
    }

    /**
     * 
     */
    async doPrint(){
        let b = JSON.stringify(this.currBtn);
            let _env:any = {
                dsm:this.env.dsm.currRecord,
                type:1,
                pageInfo:this.pageInfo
            }
            let v = JSON.stringify(_env);
            let res = await tools.getDlgRunClass(v,b);
            console.log(res);
            this.printShow = false
            if(res.status == 200){
                let data= res.data;
                if(data.id==0){
                    window.open(data.message);
                }else{
                    this.$notify.error(data.message)
                }
            }else{
                this.$notify.error("操作失败！")
            }
  
    }

    /**
     * sql弹出框确定
     */
    async sqlOk(ok:boolean,index:number){
        if(ok){
            if(index < this.sqlCont.length -1){ 
                this.sqlDlg1 = true;
            }else{
                console.log("执行SQL语句修改")
                let b = JSON.stringify(this.btn);
                let v = JSON.stringify(this.env.dsm.currRecord.data);
                let vs = JSON.stringify(this.env.dsm.currRecordArr);

                let cc = await tools.getDlgRunSql(v,b,vs)
                if(cc.data.id ==0){
                    this.$notify.success(cc.data.message)
                }else {
                    this.$notify.error(cc.data.message) 
                }
                this.sqlDlg0 = false;
                this.sqlDlg1 = false;
                this.$emit("Recheck")
            }
            
        }else{
            this.sqlDlg0 = false;
            this.sqlDlg1 = false;
        }
    }

    /**
     * 获取对象
     */
    async getCell(cellid:string,key:string,vl:any,value:any){
        let res = await tools.getCCellsParams(cellid); 
        let rtn: any = res.data; 
        if (rtn.id == 0) {
            let kn: Array<Cells> = rtn.data.layCels;
            let cells = kn; 
            this.cellCds = new CDataSet(cells[0]); 
            let cels = cells[0].cels; 
            for(var i=0;i<cels.length;i++){
            let cel = cels [i];
            if(cel.attr>0){ 
                if((cel.attr&0x400)===0)
                this.uiCels.push(cel)
            }else{
                this.uiCels.push(cel)
            }
            }
            this.laycell={};
            this.laycell.cells = cells[0];
            this.laycell.uiCels = this.uiCels; 
        } 
        await this.fetchCellData(cellid,key,vl,value);
        this.openCell = true;
    }
    /**
     * 获取对象数据
     */
    async fetchCellData(cellid:string,key:string,vl:any,value:any) {  
      let dataStr = "{'"+key+"':'"+vl+"'}"; 
      let qe:QueryEntity = new QueryEntity(cellid,cellid,dataStr);
      qe.page.pageSize=1
      let vv = await tools.query(qe);
      if(vv.data.id ==0){ 
        let data = vv.data.data.data.data;
        let data0:any=new CRecord(0);
        let data1:any = this.cellCds.createOne();
        if(data.length>0)
            data1.c_state = 2;
        //处理二次初值
        let newData = this.cellCds.createOne();
        let cels = this.cellCds.ccells.cels;
        for(var i =0 ;i<cels.length;i++){
            let cel = cels[i]; 
            let cc = baseTool.bitOperation(cel.attr,0x100000000);
            if(cc >0){
                data0.data[cel.id] = newData.data[cel.id]
            }
        }
        if(data && data.length>0){
            for (var obj in data[0].data) {
            data1.data[obj] = data[0].data[obj];
            }
        }
        for (var obj in data0.data) {
           data1.data[obj] = data0.data[obj];
        }
        if(value && data.length == 0){//需要传递值
            let aa:Array<any> = value.split(",")
            aa.forEach(item=>{
                let cc = item.split("=");
                let c0 = this.env.dsm.currRecord.data[cc[0]]
                data1.data[cc[1]] = c0;
            })
        }
        this.cellCds.currRecord = data1;
        this.cellCds.cdata.data = [data1];
        this.cellCds.checkAllGS();
      }
    }
    /**
     * 保存对象
     */
    async cellOk(isok:boolean){
        if(isok){
            await this.saveData(); 
            let dsm = this.cellCds
            if(this.bok){
                this.openCell = false;
                this.$emit("Recheck")
            } 
        }else{
            this.openCell = false;
        }
    }
    async saveData() {
        let dsm = this.cellCds
        let bok = this.checkNotNull(dsm); 
        if(!bok){
            return ; 
        }
        let res = await dsm.saveData();
        if (res.status == 200) {
            for(var i=0;i<this.env.dsm.currRecordArr.length;i++){
                let curr = this.env.dsm.currRecordArr[i];
                dsm.currRecord.data[this.cellKey] = curr.data[this.cellKey];
            }
            let data = res.data;
            if (data.id == 0) { 
                this.$message.success("操作成功！");
            } else {
                this.$message.error("操作失败！");
            }
        }    
    }
    /** 检查主表非空 */
    checkNotNull(cds:CDataSet):boolean{
        this.bok = true;
        cds.ccells.cels.forEach(item => {
            if (item.unNull&&this.bok) {
                let vl = null;
                if(cds.currRecord.data[item.id]!=null)
                    vl = cds.currRecord.data[item.id]+'';
                // if(item.type<5){
                //     if(!vl){
                //         vl = 0+'';
                //     }
                // }
                if (!vl) {
                    this.$notify.warning( "【" + item.labelString + "】不能为空!");
                    this.bok =  false;
                    return false;
                }
            }
        });
        if(this.bok){
            if (cds.ds_sub.length>0) {
                return this.checkChildNotNull(cds);
        }
      }
        return this.bok;
    }
    /**检查子表非空 */
    checkChildNotNull(cds:CDataSet):boolean{
        let isok = true;
        cds.ds_sub.forEach(cd0=>{
            if(isok){
                if(cd0.cdata.data.length===0 && !cd0.ccells.unNull){
                    this.$notify.warning( "【" + cd0.ccells.desc + "】不能为空!");
                    isok =  false;
                    return false;
                }else{
                    for(let i=0;i<cd0.cdata.data.length;i++){
                        let crd = cd0.getRecordAtIndex(i);
                        cd0.ccells.cels.forEach(item=>{
                            if(isok&&item.unNull){
                                var vl = crd.data[item.id];
                                if(item.type<5){
                                    if(!vl){
                                        vl = 0;
                                    }
                                }
                                if (!vl) {
                                    this.$notify.warning( "子表第"+(i+1)+"行"+item.id+"【" + item.labelString + "】不能为空!");
                                    isok =  false;
                                    return false
                                }
                            }
                        });
                    }
                }
            }
            if(cd0.ds_sub.length>0){
                isok = this.checkChildNotNull(cd0);
            }

        })
        return isok;
    }

    async getCells(cellid: string) {
        let res = await tools.getCCellsParams(cellid);
        let rtn: any = res.data;
        if (rtn.id == 0) {
        let kn: Array<Cells> = rtn.data.layCels;
        let cells = kn;
        return new CDataSet(cells[0]);
        } else {
        return new CDataSet("");
        }
    }

    /**
     * 获取某个对象的当前选中的内容
     */
    finCellData(dsm:CDataSet,obj_id:string):any{
        if(dsm.ccells.obj_id == obj_id){
            if((dsm.ccells.attr & 0x40)>0){
                if(dsm.currRecordArr.length>0){
                    let data =[];
                    for(var i=0;i<dsm.currRecordArr.length;i++){
                        data.push(dsm.currRecordArr[i].data);
                    }
                    return data;
                }else{
                    return [];
                }
            }else{            
                return [dsm.currRecord.data];
            }
        }
        for(var i =0;i< dsm.ds_sub.length ;i++){
            return this.finCellData(dsm.ds_sub[i],obj_id)
        }
        return null;
    }
    /**
     * 下载文件
     */
    handleDown(fjroot:any,name:any) {
        let snkey = JSON.parse(window.sessionStorage.getItem('snkey')+'');
        let updid =  '36';
        snkey = encodeURIComponent(snkey);
        let url = this.uri+'?snkey='+snkey+'&fjroot='+fjroot+'&updid='+updid+'&fjname='+name;
        console.log(url)
        window.open(url);
    }
}
</script>