<template>
    <el-row>  
        <el-dialog :title="Title" :visible.sync="sqlDlg0" width="40%" append-to-body>
            <el-dialog :title="Title" :visible.sync="sqlDlg1" width="30%" append-to-body>
                <span :style="sqlStyle[1]">{{sqlCont[1]}}</span>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="sqlOk(false,1)">取 消</el-button>
                    <el-button type="primary" @click="sqlOk(true,1)">确 定</el-button>
                </span>
            </el-dialog>
            <span :style="sqlStyle[0]">{{sqlCont[0]}}</span>
            <span slot="footer" class="dialog-footer">
                <el-button @click="sqlOk(false,0)">取 消</el-button>
                <el-button type="primary" @click="sqlOk(true,0)">确 定</el-button>
            </span>  
        </el-dialog> 
        <template v-if="openCell">
            <el-dialog :title="Title" :visible.sync="openCell" append-to-body>
                <div class="">
                    <el-scrollbar style="margin-bottom:0px;  margin-right: 0px;">
                        <el-form label-position="right" label-width="120px">
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
    </el-row>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import CDataSet from "@/classes/pub/CDataSet";
import SearchEntity from "@/classes/SearchEntity";
import CCliEnv from "@/classes/cenv/CCliEnv";
import { BIPUtil } from "@/utils/Request"; 
import echarts from 'echarts'; 
let tools = BIPUtil.ServApi; 
import { CommICL } from "@/utils/CommICL";

let icl = CommICL;
import { State, Action, Getter, Mutation } from "vuex-class";
import { truncate } from 'fs';
import { Menu } from "@/classes/Menu";
import { Cells } from "@/classes/pub/coob/Cells";
import CData from '../../classes/pub/CData';
import { BipLayout } from "@/classes/ui/BipLayout";
import QueryEntity from "@/classes/search/QueryEntity";
@Component({
    components: { }
})
export default class BipMenuBtnDlg extends Vue { 
    @Getter('menulist', { namespace: 'login' }) menusList!: Menu[] ;
    @Provide() btn:any = ""; 
    @Provide() env:CCliEnv = new CCliEnv();

    @Provide() sqlDlg0:boolean = false;//sql弹框是否显示
    @Provide() sqlDlg1:boolean = false;//sql弹框是否显示
    @Provide() sqlStyle:Array<any> = [];//sql样式
    @Provide() sqlCont:Array<any> = [];//sql提示内容
    @Provide() Title:string = "";//sql弹框标题

    @Provide() laycell:any;
    @Provide() uiCels:any = [];
    @Provide() openCell:boolean = false;
    @Provide() cellCds:CDataSet = new CDataSet('');
    mounted() {

    }
    /**
     * DLG入口
     */
    open(btn:any,env:CCliEnv){
        this.btn = btn; 
        this.env = env;
        this.Title = btn.name;
        if(btn.dlgType == 'A'){ // 执行SQL
            this.sqlCont = [];
            this.sqlStyle = []; 
            let cont = btn.dlgCont.split(";")[0];
            let ts = cont.split(",");
            ts.forEach((item:any) => {
                let tt = item.split("_style:");
                this.sqlCont .push(tt[0]);
                let st = tt[1].replace(new RegExp("\\|",'g')," ;");    
                this.sqlStyle.push(st);
            });
            //请确认，是否注销该读者?_style:color:red|font-size:12px,请确认，是否注销该读者?_style:color:red|font-size:12px,;update insuser set  usrattr='9'  where  usrcode=@usrcode;0:注销失败;1:注销成功
            this.sqlDlg0 = true;
        }else if(btn.dlgType == 'B'){ //打开对象 
            this.openCell = false;
            this.laycell = [];
            this.uiCels  = []; 
            let cellId = btn.dlgCont.split(";")[0];
            let key = btn.dlgCont.split(";")[1];
            let vl = this.env.dsm.currRecord.data[key]
            this.getCell(cellId,key,vl)
        }else if(btn.dlgType == 'C'){ //打开菜单
        console.log("打开菜单")
            let cont = btn.dlgCont.split(";");
            //H105;H103=H103P,bookclass.bid=bid,btype=btype,booklist.bcid=bcid;1=2
            let cont0 = cont[0]; //打开的菜单
            let cont1 = cont[1]; //数据值
            let cont2 = cont[2]; //条件值
            let cell = cont1.substring(0,cont1.indexOf(",")).split("=")
            cont1 = cont1.substring(cont1.indexOf(",")+1)
            let data = this.finCellData(this.env.dsm,cell[0])
            let cont1arr = cont1.split(",")
            let jsoncont:any = {};//传递的内容
            for(var i=0;i<cont1arr.length;i++){
                let zd = cont1arr[i].split("=")
                jsoncont[zd[1]] = data[zd[0]]
            }
            let cont2arr = cont2.split(",")
            let jsontj:any = {};//传递的内容
            for(var i=0;i<cont2arr.length;i++){
                let zd = cont2arr[i].split("=")
                let vl = data[zd[1]];
                if(!vl)
                    vl = "'"+zd[1]+"'"
                jsontj[zd[0]] = vl
            }  
            //打开的菜单
            let me = null; 
            for(let i = 0;i<this.menusList.length;i++){
                let m1 = this.findMenuById(cont0,this.menusList[i])
                if(m1!=null){
                    me = m1
                    break ;
                }
            } 
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
        }else if(btn.dlgType == 'D'){

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
                let cc = await tools.getDlgRunSql(v,b)
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
        //处理二次初值
        let newData = this.cellCds.createOne()
        console.log(newData);
        let cels = this.cellCds.ccells.cels;
        for(var i =0 ;i<cels.length;i++){
            let cel = cels[i]; 
            let cc = this.bitOperation(cel.attr,0x100000000)
            if(cc >0){
                data[0].data[cel.id] = newData.data[cel.id]
            }
        }

        this.cellCds.currRecord = data[0];
        this.cellCds.cdata.data = data;
      }
    }
    /**
     * 保存对象
     */
    async cellOk(isok:boolean){
        if(isok){
            await this.saveData(); 
            this.$emit("Recheck")
        }
        this.openCell = false;
    }

    async saveData() {
        let dsm = this.cellCds
        let bok = this.checkNotNull(dsm); 
        if(!bok)
            return ;         
        let res = await dsm.saveData();
        if (res.status == 200) {
            let data = res.data;
            if (data.id == 0) { 
                this.$message.success("操作成功！");
            } else {
                this.$message.error("操作失败！");
            }
        }    
    }
    checkNotNull(cds:CDataSet):boolean{
        let bok = true;
        cds.ccells.cels.forEach(item => {
            if (item.unNull&&bok) {
                var vl = cds.currRecord.data[item.id]+'';
                if(item.type<5){
                    if(!vl){
                        vl = 0+'';
                    }
                }
                if (!vl) {
                    this.$notify.warning( "【" + item.labelString + "】不能为空!");
                    bok =  false;
                    return false;
                }
            }
        }); 
        return bok;
    }


    /**
     * 获取某个对象的当前选中的内容
     */
    finCellData(dsm:CDataSet,obj_id:string):any{
        if(dsm.ccells.obj_id == obj_id){
            return dsm.currRecord.data;
        }
        for(var i =0;i< dsm.ds_sub.length ;i++){
            return this.finCellData(dsm.ds_sub[i],obj_id)
        }
        return null;
    }
 
    /**
     * 查找菜单  判断是否有权限
     */
    findMenuById(menuId:string,menu:Menu):any{
        if(menu.menuId==menuId){
            return menu
        }else{
            if(menu.haveChild){
                for(let i = 0;i<menu.childMenu.length;i++){
                    let m1 = this.findMenuById(menuId,menu.childMenu[i])
                    if(m1!=null){
                        return m1;
                    }
                }
            }
            return null;
        }
    }

    bitOperation(attr:any,val:any){
        attr = attr.toString(2);
        val = val.toString(2);
        let a = attr.split("");
        let v = val.split("");
        let num = "";
        if(a.length < v.length){
        let b = a;
        a = v;
        v = b;
        }
        if(a.length >= v.length){
            let c = a.length - v.length;
            for(var i = v.length-1;i>=0;i--){
                let a1 = a[c+i];
                let v1 =v[i];
                if((a1 == v1) && v1== 1){
                num = '1'+num
                }else{
                num = '0'+num
                }
            }
        }
        return parseInt(num,2);
    }
}
</script>