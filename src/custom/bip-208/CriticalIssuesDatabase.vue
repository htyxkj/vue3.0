<template>
 <el-row v-if="initOK" v-loading.fullscreen.lock="fullscreenLoading" class="bip-lay">
    <div>
        <el-scrollbar style="height:400px;margin-bottom:0px !important;padding-bottom:0px !important" >
            <el-form label-position="right" label-width="120px" >
                 <template>
                    <el-container>
                        <el-main>
                            <el-row>
                                <bip-comm-editor v-if="celsAll[2]"  :cell="celsAll[2]" :cds="cell" :row="cell.index" />
                                <bip-comm-editor v-if="celsAll[3]"  :cell="celsAll[3]" :cds="cell" :row="cell.index" />
                                <bip-comm-editor v-if="celsAll[46]"  :cell="celsAll[46]" :cds="cell" :row="cell.index" />
                                <bip-comm-editor v-if="celsAll[47]"  :cell="celsAll[47]" :cds="cell" :row="cell.index" />
                            </el-row>
                        </el-main>
                    </el-container>
                </template>
                <template>
                    <el-container>
                        <el-header>故障件基本信息</el-header>
                        <el-main>
                            <el-row>
                                <bip-comm-editor v-if="celsAll[4]"  :cell="celsAll[4]" :cds="cell" :row="cell.index" />
                                <bip-comm-editor v-if="celsAll[5]"  :cell="celsAll[5]" :cds="cell" :row="cell.index" />
                                <bip-comm-editor v-if="celsAll[6]"  :cell="celsAll[6]" :cds="cell" :row="cell.index" />
                                <bip-comm-editor v-if="celsAll[7]"  :cell="celsAll[7]" :cds="cell" :row="cell.index" />
                                <bip-comm-editor v-if="celsAll[8]"  :cell="celsAll[8]" :cds="cell" :row="cell.index" />
                                <bip-comm-editor v-if="celsAll[9]"  :cell="celsAll[9]" :cds="cell" :row="cell.index" />
                                <bip-comm-editor v-if="celsAll[10]"  :cell="celsAll[10]" :cds="cell" :row="cell.index" />
                                <bip-comm-editor v-if="celsAll[11]"  :cell="celsAll[11]" :cds="cell" :row="cell.index" />
                                <bip-comm-editor v-if="celsAll[12]"  :cell="celsAll[12]" :cds="cell" :row="cell.index" />
                                <bip-comm-editor v-if="celsAll[13]"  :cell="celsAll[13]" :cds="cell" :row="cell.index" />
                                <bip-comm-editor v-if="celsAll[14]"  :cell="celsAll[14]" :cds="cell" :row="cell.index" />
                            </el-row>
                        </el-main>
                    </el-container>
                </template>
                <template>
                        <el-container>
                            <el-header>质量问题信息</el-header>
                            <el-main>
                                <el-row>
                                    <bip-comm-editor v-if="celsAll[15]"  :cell="celsAll[15]" :cds="cell" :row="cell.index" />
                                    <bip-comm-editor v-if="celsAll[16]"  :cell="celsAll[16]" :cds="cell" :row="cell.index" />
                                </el-row>
                            </el-main>
                        </el-container>
                </template>
                <template>
                    <el-container style="border: 0.5px solid #EBEEF5;">
                        <el-aside width="200px">原因分类(可多选)</el-aside>
                        <el-main style="border-left: 0.5px solid #EBEEF5;padding:0px;">
                            <el-row class="nt-rowStyle">
                                <!-- 设计问题 -->
                                <bip-comm-editor v-if="celsAll[17]" :cell="celsAll[17]"  :cds="cell" :row="cell.index" />
                            </el-row>
                            <el-row class="nt-rowStyle">
                                <!-- 工艺问题 -->
                                <bip-comm-editor v-if="celsAll[19]" :cell="celsAll[19]"  :cds="cell" :row="cell.index" />
                            </el-row>
                            <el-row class="nt-rowStyle">
                                <!-- 操作问题  -->
                                <bip-comm-editor v-if="celsAll[21]" :cell="celsAll[21]"  :cds="cell" :row="cell.index" />
                            </el-row>
                            <el-row class="nt-rowStyle">
                                <!-- 生产设备问题 -->
                                <bip-comm-editor v-if="celsAll[22]" :cell="celsAll[22]"  :cds="cell" :row="cell.index" />
                            </el-row>
                            <el-row class="nt-rowStyle">
                                <!-- 试验设备问题 -->
                                <bip-comm-editor v-if="celsAll[23]" :cell="celsAll[23]"  :cds="cell" :row="cell.index" />
                            </el-row>
                            <el-row class="nt-rowStyle">
                                <!--  元器件缺陷-->
                                <bip-comm-editor v-if="celsAll[24]" :cell="celsAll[24]"  :cds="cell" :row="cell.index" />
                            </el-row>
                            <el-row class="nt-rowStyle">
                                <!--  元磁疗缺陷-->
                                <bip-comm-editor v-if="celsAll[25]" :cell="celsAll[25]"  :cds="cell" :row="cell.index" />
                            </el-row>
                            <el-row class="nt-rowStyle">
                                <!--  使用管理问题-->
                                <bip-comm-editor v-if="celsAll[26]" :cell="celsAll[26]"  :cds="cell" :row="cell.index" />
                            </el-row>
                            <el-row class="nt-rowStyle">
                                <!--  维修保养问题-->
                                <bip-comm-editor v-if="celsAll[27]" :cell="celsAll[27]"  :cds="cell" :row="cell.index" />
                            </el-row>
                            <el-row class="nt-rowStyle">
                                <!--  管理问题-->
                                <bip-comm-editor v-if="celsAll[28]" :cell="celsAll[28]"  :cds="cell" :row="cell.index" />
                            </el-row>
                            <el-row class="nt-rowStyle">
                                <!-- 软件问题 -->
                                <bip-comm-editor v-if="celsAll[30]" :cell="celsAll[30]"  :cds="cell" :row="cell.index" />
                            </el-row>
                            <el-row class="et-rowStyle">
                                <!-- 其他问题 -->
                                <bip-comm-editor v-if="celsAll[32]" :cell="celsAll[32]"  :cds="cell" :row="cell.index" /> 
                            </el-row>
                        </el-main>
                    </el-container>
                </template>
                <template>
                    <el-container>
                        <el-main>
                            <el-row>
                                 <!--  是否批次性问题-->
                                <bip-comm-editor v-if="celsAll[33]" :cell="celsAll[33]"  :cds="cell" :row="cell.index" />
                                <!--  问题发生环节-->
                                <bip-comm-editor v-if="celsAll[34]" :cell="celsAll[34]"  :cds="cell" :row="cell.index" />

                            </el-row>
                        </el-main>
                    </el-container>
                </template>
                <template>
                        <el-container>
                            <el-header>纠正措施</el-header>
                            <el-main>
                                <el-row>
                                    <!-- 纠正措施概述 -->
                                    <bip-comm-editor v-if="celsAll[36]" :cell="celsAll[36]"  :cds="cell" :row="cell.index" />
                                     <!--  归零方式-->
                                    <bip-comm-editor v-if="celsAll[37]" :cell="celsAll[37]"  :cds="cell" :row="cell.index" />
                                    <!--  问题处理方式-->
                                    <bip-comm-editor v-if="celsAll[38]" :cell="celsAll[38]"  :cds="cell" :row="cell.index" />
                                    <!-- 编辑人 -->
                                    <bip-comm-editor v-if="celsAll[40]" :cell="celsAll[40]"  :cds="cell" :row="cell.index" />
                                    <!-- 编辑时间 -->
                                    <bip-comm-editor v-if="celsAll[41]" :cell="celsAll[41]"  :cds="cell" :row="cell.index" />

                                </el-row>
                            </el-main>
                        </el-container>
                </template>
            </el-form> 
        </el-scrollbar> 
    </div>
        <template>
            <el-row class="menubar" style="text-align: center">
                <template v-if="edit_btnShow">
                    <el-button class="el-button bip-menu-bar el-button--default el-button--mini bip_btn_primary" style="border-radius:8px" @click="addData">     
                        <template>
                            <i class="iconfont icon-bip-edit"></i>新建
                        </template>      
                    </el-button> 
                </template>
                <template  v-if="copy_btnShow">
                    <el-button class="el-button bip-menu-bar el-button--default el-button--mini bip_btn_default" style="border-radius:8px" @click="copyData">     
                        <template>
                            <i class="iconfont icon-bip-copy"></i>复制
                        </template>      
                    </el-button> 
                </template>
                <template v-if="save_btnShow">
                    <el-button class="el-button bip-menu-bar el-button--default el-button--mini bip_btn_primary" style="border-radius:8px" @click="saveData">     
                        <template>
                            <i class="iconfont icon-bip-save"></i>保存
                        </template>      
                    </el-button>  
                </template>
                <template  v-if="del_btnShow">
                    <el-button class="el-button bip-menu-bar el-button--default el-button--mini bip_btn_danger" style="border-radius:8px" @click="delData">     
                        <template>
                            <i class="iconfont icon-bip-delete"></i>删除
                        </template>      
                    </el-button> 
                </template>

            </el-row>
        </template>
    
 </el-row>
</template>


<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi;
import CDataSet from '@/classes/pub/CDataSet';
import { Cells } from "@/classes/pub/coob/Cells";
import { Cell } from "@/classes/pub/coob/Cell";
import QueryEntity from '@/classes/search/QueryEntity';
import QueryCont from '@/classes/search/QueryCont';
import BipInsAidNew from '@/classes/BipInsAidNew';
import BipMenuBar from "@/classes/pub/BipMenuBar";
import BipMenuBtnDlg from '@/components/dlgbtn/BipMenuBtnDlg.vue';
import { CommICL } from "@/utils/CommICL";
let icl = CommICL;
 
@Component({
  components:{
     BipMenuBtnDlg
  }
})
/* 严重及以上质量问题数据库 */
export default class CriticalIssuesDatabase extends Vue {
    
    cell:any = new CDataSet("");
    params:any = {};  //参数
    celsAll:Array<Cell> = [];
    mcels:Array<Cell> = [];  //调用通用组件字段
    model1:any=[];
    bipInsAid!:BipInsAidNew  //参照数据集合
    cellId:any = ""
    initOK:Boolean =false;
    mbs: BipMenuBar = new BipMenuBar(0);
    problemElementHeight:any =""
    switchHide:any={};
    fullscreenLoading: boolean = false;
    edit_btnShow:boolean = false;
    copy_btnShow:boolean = false;
    save_btnShow:boolean = false;
    del_btnShow:boolean = false;

    async created(){
        this.params = this.$route.params;
        this.cellId = "P30035" //this.params.cellid;
        this.cell = await this.getCell(this.cellId);
        this.celsAll = this.cell.ccells.cels;
        for (var i = 0; i < 18; i++) {
            this.mcels.push(this.cell.ccells.cels[i]);
        }  
         if(this.params.method =='dlg'){
            await this.initData()
             this.edit_btnShow =true;
             this.copy_btnShow =true;
             this.save_btnShow =true;
             this.del_btnShow =true;
        }  
        if(this.params.method=='CUSADD'){
            this.cell.createRecord();
            this.initOK = true;
            this.save_btnShow = true;
        }
        
     
      
    }
    
    mounted() {
     console.log("AAA");
      
    }
  
    //查询数据
    async initData() {
        let sid = this.params.jsoncont[0].sid;
        
        let dataStr = "{sid:'"+sid+"'}";
        let qe:QueryEntity = new QueryEntity(this.cellId,this.cellId,dataStr);
        qe.page.pageSize=1
        let vv = await tools.query(qe);
        this.cell.clear();
        this.cell.createRecord();
        this.cell.currRecord = vv.data.data.data.data[0];
        this.cell.cdata.data = vv.data.data.data.data;
        this.initOK = true;
    }
 

    //保存
   async saveData() {
        let bok = this.checkNotNull(this.cell); 
        if(!bok)
            return ;
        //检查对象字段 规则中  0~50 定义
        bok = this.checkAccessRange(this.cell); 
        if(!bok)
            return ;
        //保存数据
        if ((this.cell.currRecord.c_state & icl.R_EDITED) > 0) {
            this.fullscreenLoading = true;
            this.cell.saveData().then((res:any)=>{
                this.fullscreenLoading = false;
                if (res.status == 200) {
                    let data = res.data;
                    if (data.id == 0) {
                        let ord: any = data.data; 
                        this.cell.currRecord.data = Object.assign(
                            this.cell.currRecord.data,
                            ord
                        );
                        this.cell.setState(icl.R_POSTED);
                        if(data.message == '操作成功！'){
                            this.$message.success(data.message);
                            this.$bus.$emit("tableDatachange",this.cell.ccells.obj_id)
                        }else{
                            this.$message.warning(data.message);
                        }
                         
                        //清空主健旧值
                        this.cell.clearOldpk();

                        this.edit_btnShow = true;
                        this.copy_btnShow = true;
                        this.del_btnShow = true;
                    }else{
                        this.$message.warning(data.message);
                    }
                } else {
                }   
            }).catch((err:any)=>{
                this.fullscreenLoading = false;
                this.$message.error(err);
            });
        } else {
            console.log(
                this.cell.currRecord.c_state,
                this.cell.currRecord.c_state & icl.R_EDITED
            );
            return;
        }
    }
    /* 非空校验 */
 checkNotNull(cds:CDataSet):boolean{
        console.log("非空校验")
        let bok = true;
        cds.ccells.cels.forEach(item => {
            if (item.unNull&&bok) {
                let vl = null;
                let hide:any = [];
                for(var key in this.switchHide){
                    if(key.indexOf(cds.ccells.obj_id+"_")!=-1){
                        hide = hide.concat(this.switchHide[key])
                    }
                }
                if(cds.currRecord.data[item.id]!=null)
                    vl = cds.currRecord.data[item.id]+'';
                // if(item.type<5){
                //     if(!vl){
                //         vl = 0+'';
                //     }
                // }
                if (!vl && hide.indexOf(item.id) == -1) {
                    this.$notify.warning( "【" + item.labelString + "】不能为空!");
                    bok =  false;
                    return false;
                }
            }
        });
        
        return bok;
    }

     /**
     * 检查对象字段规则中的 ~  XXX~XXX 定义
     */
    checkAccessRange(cds:CDataSet):boolean{
        let bok = true;
        cds.ccells.cels.forEach(item => {
            if (item.editName && bok) {
                let edName = item.editName.split(";");
                for(var i=0;i<edName.length;i++){
                    let ename = edName[i];
                    if(ename.indexOf("~") !=-1){
                        let vl = cds.currRecord.data[item.id];
                        vl = parseFloat(vl);
                        let numArr = ename.split("~");
                        if(numArr.length <2){
                            if(ename.indexOf("~") == 0){//小于某个数
                                if(vl > numArr[0]){
                                    this.$notify.warning( "【" + item.labelString + "】值应小于等于："+numArr[1]);
                                    bok =  false;
                                    return false;
                                }
                            }else{//大于某个数
                                if(vl < numArr[0]){
                                    this.$notify.warning( "【" + item.labelString + "】值应大于等于："+numArr[0]);
                                    bok =  false;
                                    return false;
                                }
                            }
                        }else if(numArr.length == 2){
                            if(vl > numArr[1]){
                                this.$notify.warning( "【" + item.labelString + "】值应小于等于："+numArr[1]);
                                bok =  false;
                                return false;
                            }
                            if(vl < numArr[0]){
                                this.$notify.warning( "【" + item.labelString + "】值应大于等于："+numArr[0]);
                                bok =  false;
                                return false;
                            }
                        }
                    }
                }
            }
        });
        
        return bok;
    }
    //新建数据
    addData(){
        if (this.cell.currRecord && (this.cell.currRecord.c_state & 2) > 0) {
                this.$alert(
                    `当前数据没有保存，请先保存当前行数据`,
                    `系统提醒`,
                    { type: "info" }
                ).catch(() => {
                    console.log("取消");
                });
                return;
            }
            if(this.cell.currRecord && this.cell.currRecord.c_state&icl.R_INSERT){
                return 
            }
            this.cell.createRecord();
            if(this.cell.ds_sub){
                for(var i=0;i<this.cell.ds_sub.length ;i++){
                    this.cell.ds_sub[i].clear();
                }
            }
            this.edit_btnShow =false;
            this.copy_btnShow =false;
            this.del_btnShow =false;
            this.save_btnShow =true;
            this.$bus.$emit("tableDatachange",this.cell.ccells.obj_id)
    }
    //删除数据
    delData(){
        let states = this.cell.currRecord.c_state
            if((states&icl.R_INSERT)>0){
                //新建状态
                this.cell.removeIndex(this.cell.index)
            }else{
                let candel = this.cell.canDel()
                if(candel){
                    let crd = this.cell.currRecord
                    let _idx = this.cell.ccells.x_pk;
                    if(_idx == -1){
                        let pkindex = this.cell.ccells.pkindex;
                        if(pkindex){
                            _idx = pkindex[0];
                        }
                    }
                    let id = this.cell.ccells.cels[_idx].id
                    let sid = crd.data[id]
                    this.$confirm(`确定删除当前${sid}记录吗？`,
                        `系统提醒`,
                        { type: "warning" }
                    ).then(()=>{
                        this.cell.currRecord.c_state = 4
                        this.fullscreenLoading = true
                        this.cell.saveData().then((res:any)=>{
                            if(res.data.id ==0){
                                // this.dsm.currRecord.clear();
                                this.cell.cdata.data.splice(this.cell.page.index,1); 
                                this.cell.currRecord = this.cell.cdata.data[this.cell.page.index]
                                if(this.cell.ds_sub){
                                    for(var i=0;i<this.cell.ds_sub.length ;i++){
                                        this.cell.ds_sub[i].clear();
                                    }
                                }
                                 
                                this.$bus.$emit("tableDatachange",this.cell.ccells.obj_id)
                                this.cell.page.total--;
                                this.del_btnShow = false;
                                this.copy_btnShow = false;
                                this.save_btnShow = false;
                               // this.setListMenuName();
                            }else{
                                this.$notify.error(res.data.message);
                            }
                        }).finally(()=>{
                            this.fullscreenLoading = false
                        })
                    }).catch(() => {
                        return;
                    });
                }
            }
    }
    //复制数据
    async copyData(){
         if ((this.cell.currRecord.c_state & 2) > 0) {
                this.$alert(
                    `当前数据没有保存，请先保存当前行数据`,
                    `系统提醒`,
                    { type: "info" }
                ).catch(() => {
                    console.log("取消");
                });
                return;
            }
            let oldData = Object.assign({},this.cell.currRecord.data);
            let oldPage = Object.assign({},this.cell.page);
            let u = window.sessionStorage.getItem('user');
            if(u){
                this.cell.currRecord = this.cell.createRecord();
                this.cell.currRecord.c_state=3; 
                for(var i=0;i<this.cell.ccells.cels.length;i++){
                    let cell = this.cell.ccells.cels[i]
                    if(!cell.initValue && (cell.attr & 1) <= 0 && (cell.attr & 0x8000)<=0){
                        this.cell.currRecord.data[cell.id] = oldData[cell.id]
                    }
                }
                this.cell.page = oldPage;
                let crd = this.cell.currRecord;
                this.cell.page.index = this.cell.cdata.data.length - 1;
                this.edit_btnShow = false;
                this.copy_btnShow = false;
                this.del_btnShow = false;
                //this.setListMenuName();
                //设置当前记录审批流程信息
                /* if(crd != null && this.cell.opera){
                    let params = {
                        sid: crd.data[this.cell.opera.pkfld],
                        sbuid: crd.data[this.cell.opera.buidfld],
                        statefr: crd.data[this.cell.opera.statefld],
                        stateto: crd.data[this.cell.opera.statefld],
                        spuserId: ""
                    }  
                    this.cea = new CeaPars(params);
                    this.cell.ceaPars = this.cell;
                } */
                await this.cell.checkAllGS()
                this.$bus.$emit("tableDatachange",this.cell.ccells.obj_id)
                this.$message.success("复制成功！")
            }
    }

    //获取对象
    async getCell(cellid: string) {
        let res = await tools.getCCellsParams(cellid);
        let rtn: any = res.data;
        console.log(rtn);
        
        if (rtn.id == 0) {
            let kn: Array<Cells> = rtn.data.layCels;
            let cells = kn;
            return new CDataSet(cells[0]);
        } else {
            return new CDataSet("");
        }
    }
    
    async initGetVal(){
        if(this.params){
            if(this.params.method =='dlg'){//DLG 关联
                console.log(this.params)
            }
        }
    }
   
   
  
}
</script>
<style lang="scss" scoped>
   .el-header {
    color: #333;
    text-align: center;
    line-height: 40px;
    border-top:0.5px solid #EBEEF5;
    padding-top: 30px;
    font-weight:bold;

  }
   .el-aside {
    color: #333;
    text-align: center;
    line-height: 200px;
    margin: auto 0;
    font-weight:bold;
  }
  .nt-rowStyle{
      padding: 10px 10px 3px 10px;
      border-bottom: 0.5px solid #EBEEF5;
  }
  .et-rowStyle{
      padding: 10px 10px 3px 10px;
      
  }
</style>