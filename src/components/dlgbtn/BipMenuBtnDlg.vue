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
                <el-form @submit.native.prevent label-position="right" label-width="100px">
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
    </el-row>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import CDataSet from "@/classes/pub/CDataSet";
import CCliEnv from "@/classes/cenv/CCliEnv";
import { BIPUtil } from "@/utils/Request"; 
let tools = BIPUtil.ServApi; 
import { CommICL } from "@/utils/CommICL";

let icl = CommICL;
import { Cells } from "@/classes/pub/coob/Cells";
import QueryEntity from "@/classes/search/QueryEntity";
import { BIPUtils } from "@/utils/BaseUtil";
import CRecord from '@/classes/pub/CRecord';
import VueQr from 'vue-qr'
let baseTool = BIPUtils.baseUtil;

import BipYgxzDia from './BipYGXZDia.vue';
@Component({
    components: {BipYgxzDia,VueQr}
})
export default class BipMenuBtnDlg extends Vue { 
    @Provide() btn:any = ""; 
    @Provide() env:CCliEnv = new CCliEnv();

    @Provide() sqlDlg0:boolean = false;//sql弹框是否显示
    @Provide() sqlDlg1:boolean = false;//sql弹框是否显示
    @Provide() sqlStyle:Array<any> = [];//sql样式
    @Provide() sqlCont:Array<any> = [];//sql提示内容
    @Provide() Title:string = "";//sql弹框标题
    @Provide() bok:boolean = false;//对象弹框是否显示

    @Provide() laycell:any;
    @Provide() uiCels:any = [];
    @Provide() openCell:boolean = false;//是否打开对象
    @Provide() cellKey:string = '';//B 打开对象的主键 字段
    @Provide() cellCds:CDataSet = new CDataSet('');

    @Provide() dlgDCell: CDataSet = new CDataSet("");//D: 弹出对象
    @Provide() showDCell:boolean =false;

    showPayQR:boolean = false;//微信收款二维码弹框
    code_url:any ="";//二维码内容
    total_fee:any = 0;//支付金额

    mounted() {

    }
    /**
     * DLG入口
     */
    async open(btn:any,env:CCliEnv){
        console.log(btn)
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
            let cellId = btn.dlgCont.split(";")[0];
            let key = btn.dlgCont.split(";")[1];
            this.cellKey = key;
            if((this.env.dsm.ccells.attr & 0x40)>0){
                if(this.env.dsm.currRecordArr.length ==0){
                    this.$message.warning("请勾选数据！")
                    return;
                }
            }
            let vl = this.env.dsm.currRecord.data[key]
            this.getCell(cellId,key,vl)
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
                this.$router.push({
                    path:'/layout',
                    name:'layout',
                    params:{method:"dlg",pmenuid:pmenuid[1],cellid:cell[1],jsoncont:jsoncont,jsontj:jsontj},
                    query: {pbuid:pbuid[1],pmenuid:pmenuid[1]},
                })
            }
            /** 旧版规则 **/
            // let cont = btn.dlgCont.split(";");
            // //H105;H103=H103P,bookclass.bid=bid,btype=btype,booklist.bcid=bcid;1=2
            // let cont0 = cont[0]; //打开的菜单
            // let cont1 = cont[1]; //数据值
            // let cont2 = cont[2]; //条件值
            // let cell = cont1.substring(0,cont1.indexOf(",")).split("=")
            // cont1 = cont1.substring(cont1.indexOf(",")+1)
            // let data = this.finCellData(this.env.dsm,cell[0])
            // let cont1arr = cont1.split(",")
            // let jsoncont:any = {};//传递的内容
            // for(var i=0;i<cont1arr.length;i++){
            //     let zd = cont1arr[i].split("=")
            //     jsoncont[zd[1]] = data[zd[0]]
            // }
            // let cont2arr = cont2.split(",")
            // let jsontj:any = {};//传递的内容
            // for(var i=0;i<cont2arr.length;i++){
            //     let zd = cont2arr[i].split("=")
            //     let vl = data[zd[1]];
            //     if(!vl)
            //         vl = "'"+zd[1]+"'"
            //     jsontj[zd[0]] = vl
            // }  
            // //打开的菜单
            // let me = baseTool.findMenu(cont0);  
            // if (!me) {
            //     this.$notify.error( "没有" + cont0 + "菜单权限!" );
            //     return false;
            // }else{
            //     let command = me.command.split("&");
            //     let pbuid = command[0].split("=");
            //     let pmenuid = command[1].split("="); 
                
            //     this.$router.push({
            //         path:'/layout',
            //         name:'layout',
            //         params:{method:"dlg",pmenuid:pmenuid[1],cellid:cell[1],jsoncont:jsoncont,jsontj:jsontj},
            //         query: {pbuid:pbuid[1],pmenuid:pmenuid[1]},
            //     })
            // }
        }else if(btn.dlgType == 'D'){ //调用后台程序 
            let opera:any = this.env.dsm.opera;
            if(opera && opera.statefld){
                let state = this.env.dsm.currRecord.data[opera.statefld];
                if(state && state !=0 && state != -1 && state !=5){
                    return;
                }
            }
            let dlgCont = this.btn.dlgCont;
            let cc = dlgCont.split(";")
            if(cc.length<4){
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
                // if ((this.env.dsm.currRecord.c_state & 2) > 0) {
                //     this.$alert(
                //         `当前数据没有保存，请先保存当前行数据`,
                //         `系统提醒`,
                //         { type: "info" }
                //     ).catch(() => {
                //         console.log("取消");
                //     });
                //     return;
                // }
                this.$message.success("操作执行中。。。。。")
                await tools.getDlgRunClass(v,b).then(res =>{
                    if(res){
                        if(res.data.id == 0 ){
                            if(cc[2] && cc[2] =='1'){
                                this.$emit("selData")
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
             
        }
    }
    async dlgDOk(){
        this.showDCell = false;
        let b = JSON.stringify(this.btn);
        let env:any = this.env;
        env["externalCell"] = this.dlgDCell
        let v = JSON.stringify(env);
        let bok = this.checkNotNull(env.dsm);
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
    async getCell(cellid:string,key:string,vl:any){
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
        await this.fetchCellData(cellid,key,vl);
        this.openCell = true;
    }
    /**
     * 获取对象数据
     */
    async fetchCellData(cellid:string,key:string,vl:any) {  
      let dataStr = "{'"+key+"':'"+vl+"'}"; 
      let qe:QueryEntity = new QueryEntity(cellid,cellid,dataStr);
      qe.page.pageSize=1
      let vv = await tools.query(qe);
      if(vv.data.id ==0){ 
        let data = vv.data.data.data.data;
        let data0:any=new CRecord(0);
        let data1:any = this.cellCds.createOne();
        if(data)
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
        this.cellCds.currRecord = data1;
        this.cellCds.cdata.data = [data1];
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
                res =  await dsm.saveData();
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
}
</script>