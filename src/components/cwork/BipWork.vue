<template>
    <div>
    <el-dialog v-loading="loading"
        :visible.sync="centerDialogVisible"
        width="30%"
        ref="chk" class="bip-work" :title="title" :show-close="false" :close-on-click-modal="false" :close-on-press-escape="false">
        <!-- <span slot="title">审核</span> -->
        <template v-if="!bchked && isReview">
            <el-row class="bip-work-title"><h3>审批意见</h3></el-row>
            <el-row>
                <el-input
                    type="textarea"
                    :autosize="{ minRows: 4, maxRows: 6}"
                    placeholder="请输入内容"
                    v-model="remark" resize="none">
                </el-input>
            </el-row>
        </template>
        <template v-else>
            <template v-if="!isReview">
                <template v-if="this.cea && this.cea.statefr =='6'  && this.cea.stateto =='6' ">
                    <el-row class="bip-work-title"><h4>执行</h4></el-row>
                </template>
                <template v-else>
                    <el-row class="bip-work-title"><h3>审批人员</h3></el-row>
                    <template v-if="chkInfos">
                        <el-row v-if="chkInfos.currState.hq">
                            <el-row>
                                <template v-for="cnodes in chkInfos.currState.cnodes">
                                    <el-col v-for="user in cnodes.users" :key="user.userName">{{user.userName}}</el-col>
                                </template>
                                <template v-for="cnodes in chkInfos.currState.cnodes">
                                    <el-col v-for="user in cnodes.userssh" :key="user.userName">{{user.userName}}  √</el-col>
                                </template>
                            </el-row>
                        </el-row>
                        <el-row v-if="!chkInfos.currState.hq">
                            <el-col  v-for="user in chkInfos.currState.users" :key="user.userName">{{user.userName}}</el-col>
                        </el-row>
                    </template>
                </template>
            </template>
            <template v-else>
                <el-row class="bip-work-title"><h3>审批节点</h3></el-row>
                <el-row class="bip-select-list">
                    <el-select v-model="stateId" placeholder="请选择" size="small" @change="selectChange">
                        <el-option
                        v-for="item in nodeList"
                        :key="item.stateId"
                        :label="item.stateName"
                        :value="item.stateId">
                        </el-option>
                    </el-select>
                </el-row>
                <template v-if="stateId != 6">
                    <el-row class="bip-work-title"><h3>审批人员</h3></el-row>
                    <el-row>  
                        <el-checkbox-group v-model="userListSelect">
                            <template v-for="item in userList" >
                                {{item.node}}
                                <el-checkbox :disabled="item.hq" v-for="user in item.users" :key="user.userCode" :id="user.userCode" :label="user.userCode" :md-value="user.userCode">{{user.userName}}</el-checkbox>
                            </template>
                        </el-checkbox-group>
                    </el-row>
                </template>
                <el-row v-if="signature" class="el-col-sm-24">
                    <el-form @submit.native.prevent label-position="right" label-width="60px">
                        <bip-input-autograph :cell="cell" :cds="cds" :model="signatureValue" :bgrid="false" :row="0" @dataChange="dataChange"></bip-input-autograph>
                    </el-form>
                </el-row>
            </template>
        </template>
  
        <span slot="footer" class="dialog-footer">
            <template v-if="!bchked && isReview">
                <el-button @click="centerDialogVisible = false" size="small">取 消</el-button>
                <el-button @click="overrule" size="small" v-if="currState !='0'&& currState!='1'">驳回</el-button>
                <!-- <el-button @click="bchked = false" size="small">退回111</el-button> -->
                <el-button type="primary" @click="bchked = true" size="small">确 定</el-button>
            </template>
            <template v-else>
                <el-button @click="bchked = false" size="small" :disabled="!canRetrial">重审</el-button>
                <el-button @click="centerDialogVisible = false" size="small">取 消</el-button>
                <el-button @click="returnBack" size="small" :disabled="!canBack">退回</el-button>
                <!-- <el-button @click="bchked = false" size="small">退回111</el-button> -->
                <el-button type="primary" @click="checkUp" size="small" :disabled="!isReview">确 定</el-button>
            </template>
        </span>
    </el-dialog>
    </div>
</template>
<script lang="ts">
/**
 * 审批流弹出界面
 */
import { Component, Vue, Provide, Prop, Watch, Emit } from "vue-property-decorator"
import BipInputAutograph from '../editorn/BipInputAutograph.vue'
import CeaPars from "@/classes/cenv/CeaPars";
import { BIPUtil } from "@/utils/Request";
import { User } from '@/classes/User';
import { State, Action, Getter, Mutation } from 'vuex-class';
import CDataSet from '../../classes/pub/CDataSet';
let tools = BIPUtil.ServApi
@Component({
    components:{BipInputAutograph}
})
export default class BipWork extends Vue{
    centerDialogVisible:boolean = false
    loading:boolean = false
    remark:string = '审批通过'
    stateId:string = ''//下一状态
    bchked:boolean = true
    userList:any = []//审批人列表
    userListSelect:any = []//审批人选中列表
    nodeList :Array<any> = []
    currState:string = ""
    cea:CeaPars = new CeaPars({});
    chkInfos:any = null;
    isReview:boolean = false;//是否是当前节点审批人
    canBack:boolean = false;//是否可以退回
    canRetrial:boolean = false;//是否可以重新审核
    smakefld:String = "";//制单人

    signature:boolean = false;//是否需要审批人签名
    signatureValue:any= null;//签名信息
    cell:any={
        id:"signature",
        labelString:"签名",
    }
    cds:CDataSet = new CDataSet("");
    @Getter('user', { namespace: 'login' }) user?: User;//当前登录人

    open(info:any,cea:CeaPars,smakefld:String){ 
        console.log("WorkOpen")
        this.smakefld = smakefld;
        this.canRetrial = false; 
        this.isReview = false;
        this.canBack = false;
        this.bchked = info.currState.checked
        this.currState = info.currState.state
        this.nodeList = info.list
        this.cea = cea
        this.chkInfos = info 
        if(!this.user){
            return;
        }

        if (this.cea.statefr == "0" || this.cea.statefr == "1" || this.cea.statefr == "5") {
            if (this.smakefld && this.smakefld !== this.user.userCode && this.smakefld != undefined) {
                this.$notify.error("只有制单人可以提交!");
                this.centerDialogVisible = false
                return;
            }
            if(this.chkInfos.list)
                this.stateId = this.chkInfos.list[0].stateId
        } else {
            if(this.chkInfos.currState.hq){//会签
                if(this.chkInfos.currState.cnodes.length <= 0){//没有人
                    if (this.cea.statefr+'' !== "6") {
                        this.$notify.error("没有审批人!"); 
                        return;
                    }
                }
                this.stateId = this.chkInfos.list[0].stateId
            }else{
                if(!this.chkInfos.currState.users && !this.chkInfos.currState.userssh){
                    if (this.cea.statefr+'' !== "6") {
                        this.$notify.error("没有审批人!"); 
                        return;
                    }
                }
                if(!this.chkInfos.list || this.chkInfos.list.length<=0){
                    if(this.cea.statefr+'' !== "6"){
                        this.$notify.error("未找到下一审批节点!"); 
                        return;
                    }
                }else{
                    this.stateId = this.chkInfos.list[0].stateId
                    this.chkInfos.list.forEach((item:any) => {
                        if(!item.users && item.stateId !='6'){
                            if(!item.cnodes){
                                this.$notify.error("节点："+item.stateName+" 未定义审批人！"); 
                            }else{
                                item.cnodes.forEach((item_n:any) => {
                                    if(!item_n.users){
                                        this.$notify.error("节点："+item_n.stateName+" 未定义审批人！"); 
                                    }
                                });
                            }
                        }
                    });
                }
            }
        }
        if(cea.statefr == "0" || cea.statefr == "1" || cea.statefr == "5"){
            this.isReview = true;
        }
        let noCheck = false;
        if(!this.chkInfos.currState.checked)
            noCheck = true;
        let noUser = false;
        if(this.chkInfos.currState.cnodes){
            this.chkInfos.currState.cnodes.forEach((node:any) => {
                if(node.users)
                node.users.forEach((user:any) =>{
                    if(this.user){
                        if(user.userCode == this.user.userCode){
                            noUser = true;
                        }
                    }
                })
            });
        }
        if(this.chkInfos.currState.users){
            this.chkInfos.currState.users.forEach((user:any) =>{
                if(this.user){
                    if(user.userCode == this.user.userCode){
                        noUser = true;
                    }
                }
            })
        }
        if(noUser && noCheck)
            this.isReview = true;
        if(this.user && info.upUser)
        if((info.upUser.userCode == this.user.userCode && !this.bchked )|| cea.statefr =="6"){
            this.canBack = true;
        }
        if(this.chkInfos.currState.checked){
            let sshu = this.chkInfos.currState.userssh
            if(sshu){
                for(var z=0;z<sshu.length;z++){
                    if(this.user){
                        if(sshu[z].userCode == this.user.userCode){
                            this.canBack = true;
                        }
                    }
                }
            }
        }
        if(this.nodeList&&this.nodeList.length>0){ 
            this.initSelectUser()
        }        
        this.centerDialogVisible = true
    }

    get title(){
        return this.bchked?"提交":"审核"
    }

    initSelectUser(){
        console.log("initSelectUser")
        if (this.chkInfos) {
            this.chkInfos.list.forEach((item:any) => {
                if(item.stateId =='6'){
                    if(item.attr && (item.attr&16)>0){//签名
                        this.signature = true;
                    }
                    return;
                }
                if(item.stateId == this.stateId){
                    if(item.hq){//会审 
                        this.userList = [];
                        this.userListSelect = [];
                        if(item.cnodes){
                            for(var j=0;j<item.cnodes.length;j++){
                                let users = item.cnodes[j].users;
                                for(var k=0;k<users.length;k++){
                                    this.userListSelect.push(users[k].userCode)
                                }
                                let u = {node:null,users:[],hq:true}
                                u.node = item.cnodes[j].stateName;
                                u.users = item.cnodes[j].users;
                                this.userList.push(u);
                            }
                        }
                    }else{
                        this.userList = [];
                        this.userListSelect = []; 
                        this.chkInfos.list.forEach((item:any) => {
                            let u = {node:null,users:[],hq:false}
                            let usrCode:any =[];
                            let users:any =[];
                            if(!item.users){
                                this.$notify.error("审批人未定义！");
                                return;
                            }
                            item.users.forEach((u:any)=>{
                                if(usrCode.indexOf(u.userCode) == -1 ){
                                    usrCode.push(u.userCode);
                                    users.push(u);
                                }
                            })
                            u.node = item.stateName;
                            u.users = users;
                            this.userList.push(u); 
                            if(this.userList.length>0){
                                let user = this.userList[0].users;
                                if(user && user.length>0){
                                    if(item.attr && (item.attr*16)>0){//签名
                                        this.signature = true;
                                    }
                                    if(item.attr && (item.attr&8)>0){//审批人全选
                                        for(var j=0;j<user.length;j++){
                                        this.userListSelect.push(user[j].userCode)
                                        }
                                    }else{
                                        this.userListSelect.push(user[0].userCode)
                                    }
                                }
                            }
                        });
                    }
                }
            });
        }
    }

    selectChange(value:any){
        this.stateId = value;
        this.initSelectUser();
    }

    //提交审核
    checkUp(){
        if(this.signature){
            if(!this.signatureValue || this.signatureValue ==''){
                this.$notify.error("请签名");
                return;
            }
        }
        const ckuser = this.makeUU()
        if(ckuser.length<=0 && this.stateId!="6"){
            this.$notify.error("没有审核人！");
            return ;
        }else{
            let check =null;//下一审批节点
            for(var i=0;i<this.chkInfos.list.length;i++){
                let item = this.chkInfos.list[i];
                if(item.stateId == this.stateId){
                check = item;
                break;
                }
            }
            this.cea.stateto = this.stateId;
            this.cea.yjcontext = this.remark;
            this.cea.ckd = this.chkInfos.checked;
            this.cea.tousr = this.makeUU();
            this.cea.signature = this.signatureValue;
            if(check.hq){ //会审
                let cnodes = check.cnodes;
                let schk_mk = "";
                for(var i=0;i<cnodes.length;i++){
                    let node = cnodes[i];
                    schk_mk+= node.stateId+","
                    node.users.forEach((item:any) =>{
                        schk_mk += item.userCode+","
                    })
                    schk_mk = schk_mk.substring(0,schk_mk.length-1);
                    schk_mk +=";"
                }
                schk_mk = schk_mk.substring(0,schk_mk.length-1);
                this.cea.schk_mk = schk_mk; 
            }

            //当前审批节点
            let cuCheck = this.chkInfos.currState;
            if(cuCheck.hq){//当前进行审批的节点是会签
                cuCheck.cnodes.forEach((item:any)=>{
                if(item.users){
                    item.users.forEach((usr:any)=>{
                        if(this.user){
                            if(usr.userCode == this.user.userCode){
                                this.cea.stateagr = item.stateId;
                            }
                        }
                    })
                }
                })
            }else{
                this.cea.stateagr = cuCheck.stateId;
            } 
            console.log("asdf")
            this.loading = true
            tools.getCheckInfo(this.cea,34).then(res=>{
                if(res.data.id ==0){
                    let msg = this.bchked?"提交":"审核";
                    msg += '成功！';
                    this.$notify.success(msg);
                    this.$emit('checkOK',this.stateId)
                    this.centerDialogVisible = false
                    this.$bus.$emit('cell_edit')
                }else{
                    this.$notify.error(res.data.message)
                }
            }).catch(err=>{
                this.$notify.error(err+";BipWork checkUp")
            }).finally(()=>{
                this.loading = false
            })
        }
    }

    makeUU() {
      let ids = "";
      for (let i = 0; i < this.userListSelect.length; i++) {
        ids += this.userListSelect[i] + ",";
      }
      if (ids.length > 0) {
        ids = ids.substring(0, ids.length - 1);
      }
      return ids;
    }

    //提交退回
    async returnBack(){
      if (this.chkInfos) {
        this.loading = true;
        let check = false;
        if(this.chkInfos.currState.hq){//是回去 查询 当前人是否审批过
            if(this.chkInfos.currState.cnodes){
                this.chkInfos.currState.cnodes.forEach((nodes:any) => {
                    if(nodes.userssh){
                        nodes.userssh.forEach((user:any) => {
                            if(this.user){
                                if(user.userCode == this.user.userCode){
                                    check = true;
                                }
                            }
                        });
                    }
                });
            }
        }
        if (this.chkInfos.currState.checked || check) {
            this.cea.stateto = this.chkInfos.currState.stateId;
            this.cea.statefr = this.chkInfos.currState.stateId;
            var id = 39;
            if (this.chkInfos.currState.stateId !== "6") {
                id = 40;
            } 
            tools.getCheckInfo(this.cea,id).then(res=>{
                if(res.data.id ==0){
                    this.$notify.success('退回成功！')
                    this.$emit('checkOK',this.chkInfos.upState)
                    this.centerDialogVisible = false
                }else{
                    this.$notify.error(res.data.message)
                }
            }).catch(err=>{
                this.$notify.error(err+";BipWork returnBack")
            }).finally(()=>{
                this.loading = false
            }) 
        } else {
            this.cea.stateto = this.chkInfos.upState;
            this.cea.statefr = this.chkInfos.currState.stateId;
            var id = 39; 
            tools.getCheckInfo(this.cea,id).then(res=>{
                if(res.data.id ==0){
                    this.$notify.success('退回成功！')
                    this.$emit('checkOK',this.chkInfos.upState)
                    this.centerDialogVisible = false
                }else{
                    this.$notify.error(res.data.message)
                }
            }).catch(err=>{
                this.$notify.error(err+";BipWork returnBack")
            }).finally(()=>{
                this.loading = false
            })
        }
      }
    }
    //驳回
    overrule(){ 
        let cuCheck = this.chkInfos.currState;
        if(cuCheck.hq){//当前进行审批的节点是会签
            cuCheck.cnodes.forEach((item:any)=>{
            if(item.users){
                item.users.forEach((usr:any)=>{
                    if(this.user){
                        if(usr.userCode == this.user.userCode){
                            this.cea.stateto = item.stateId;
                        }
                    }
                })
            }
            })
        }else{
            this.cea.stateto = this.chkInfos.currState.stateId;
        }
        this.cea.bup = "2";
        this.cea.tousr =this.smakefld; 
        this.cea.yjcontext = this.remark;
        this.cea.signature = this.signatureValue;
        var id=34;
        this.loading = true;
        tools.getCheckInfo(this.cea,id).then(res=>{
            if(res.data.id==0){
                this.$notify.success('驳回成功！')
                this.$emit('checkOK',this.chkInfos.upState)
                this.centerDialogVisible = false
            }else{
                this.$notify.error('驳回失败！')
            }
        }).catch(err=>{
            this.$notify.error(err+";BipWork overrule")
        }).finally(()=>{
            this.loading = false
        })
    }

    //签名变化
    dataChange(value:any){
        this.signatureValue = value;
    }
}
</script>