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
                <el-row class="bip-work-title"><h3>审批人员</h3></el-row>
                <el-row>  
                    <el-col  v-for="user in chkInfos" :key="user.userName">{{user.userName}}</el-col>
                </el-row>
            </template>
            <template v-else>
                <el-row class="bip-work-title"><h3>审批节点</h3></el-row>
                <el-row class="bip-select-list">
                        <el-select v-model="value" placeholder="请选择" size="small" @change="selectChange">
                        <el-option
                        v-for="item in nodeList"
                        :key="item.stateId"
                        :label="item.stateName"
                        :value="item.stateId">
                        </el-option>
                    </el-select>
                </el-row>
                <el-row class="bip-work-title"><h3>审批人员</h3></el-row>
                <el-row>  
                    <el-checkbox-group v-model="userListSelect">
                        <el-checkbox v-for="user in userList" :key="user.userCode" :label="user.userCode">{{user.userName}}</el-checkbox>
                    </el-checkbox-group>
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
import { Component, Vue, Provide, Prop, Watch, Emit } from "vue-property-decorator"
import CeaPars from "@/classes/cenv/CeaPars";
import { BIPUtil } from "@/utils/Request";
import { User } from '@/classes/User';
import { State, Action, Getter, Mutation } from 'vuex-class';
import { LoginState } from '@/store/modules/login/types';
let tools = BIPUtil.ServApi
@Component({})
export default class BipWork extends Vue{
    @Provide() centerDialogVisible:boolean = false
    @Provide() loading:boolean = false
    @Provide() remark:string = '审批通过'
    @Provide() value:string = ''
    @Provide() bchked:boolean = true
    @Provide() userList:any = []
    @Provide() userListSelect:any = []
    @Provide() nodeList :Array<any> = []
    @Provide() currState:string = ""
    @Provide() cea:CeaPars = new CeaPars({});
    @Provide() chkInfos:Array<any> = []
    @Provide() info:any=null;
    @Provide() isReview:boolean = false;//是否是当前节点审批人
    @Provide() canBack:boolean = false;//是否可以退回
    @Provide() canRetrial:boolean = false;//是否可以重新审核
    @Provide() smakefld:String = "";//制单人
    @Getter('user', { namespace: 'login' }) user?: User;//当前登录人

    open(info:any,cea:CeaPars,smakefld:String){ 
        this.smakefld = smakefld;
        this.canRetrial = false; 
        this.info = info;
        this.isReview = false;
        this.canBack = false;
        this.centerDialogVisible = true
        this.bchked = info.checked
        this.currState = info.state
        this.nodeList = info.list
        this.cea = cea
        this.chkInfos = info.chkInfos 

        if (cea.statefr == "0" || cea.statefr == "1" || cea.statefr == "5") {
            this.canRetrial = false;
            if(this.user)
            if(smakefld !='' && smakefld != this.user.userCode){
                this.$notify.error("只有制单人可以提交!");
                this.centerDialogVisible = false
                return;
            }
        }


        if(this.chkInfos){
            this.chkInfos.forEach(item => { 
                if(this.user)
                if(item.userCode == this.user.userCode){
                    this.isReview = true; 
                    this.canRetrial = true;
                    if(this.bchked)
                        this.canBack = true;
                }
            });
        }
        if(cea.statefr == "0" || cea.statefr == "1" || cea.statefr == "5"){
            this.isReview = true;
        }
        if(this.user && info.upUser)
        if((info.upUser.userCode == this.user.userCode && !this.bchked )|| cea.statefr =="6"){
            this.canBack = true;
        }

        if(this.nodeList&&this.nodeList.length>0){ 
            this.value = this.nodeList[0].stateId
            this.userList = this.nodeList[0].users
            this.initSelectUser()
        }
    }

    get title(){
        return this.bchked?"提交":"审核"
    }

    initSelectUser(){
        this.userListSelect = []
        if(this.userList&&this.userList.length>0){
            this.userListSelect[0] = this.userList[0].userCode
        }
    }

    selectChange(value:any){
        const i = this.nodeList.findIndex((item:any)=>{
            return item.stateId == value
        })
        if(i>-1){
            this.userList = this.nodeList[i].users
            this.initSelectUser()
        }
    }

    //提交审核
    checkUp(){
        const ckuser = this.makeUU()
        if(ckuser.length<=0 && this.value!="6"){
            this.$notify.error("没有审核人！");
            return ;
        }else{
            this.cea.stateto = this.value;
            this.cea.yjcontext = this.remark;
            this.cea.tousr =ckuser;
            this.loading = true
            tools.getCheckInfo(this.cea,34).then(res=>{
                let msg = this.bchked?"提交":"审核";
                msg += '成功！';
                this.$notify.success(msg);
                this.$emit('checkOK',this.value)
                this.centerDialogVisible = false
                this.$bus.$emit('cell_edit')
            }).catch(err=>{
                this.$notify.error(err)
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
      if (this.info) {
        this.loading = true;
        if (this.info.checked) {
            this.cea.stateto = this.info.state;
            this.cea.statefr = this.info.state;
            var id = 39;
            if (this.info.state !== "6") {
                id = 40;
            } 
            tools.getCheckInfo(this.cea,id).then(res=>{
                this.$notify.success('退回成功！')
                this.$emit('checkOK',this.info.upState)
                this.centerDialogVisible = false
            }).catch(err=>{
                this.$notify.error(err)
            }).finally(()=>{
                this.loading = false
            }) 
        } else {
            this.cea.stateto = this.info.upState;
            this.cea.statefr = this.info.state;
            var id = 39; 
            tools.getCheckInfo(this.cea,id).then(res=>{
                this.$notify.success('退回成功！')
                this.$emit('checkOK',this.info.upState)
                this.centerDialogVisible = false
            }).catch(err=>{
                this.$notify.error(err)
            }).finally(()=>{
                this.loading = false
            })
        }
      }
    }
    //驳回
    overrule(){ 
        this.cea.stateto = this.info.state;
        this.cea.bup = "2";
        this.cea.tousr =this.smakefld; 
        var id=34;
        this.loading = true;
        tools.getCheckInfo(this.cea,id).then(res=>{
            this.$notify.success('驳回成功！')
            this.$emit('checkOK',this.info.upState)
            this.centerDialogVisible = false
        }).catch(err=>{
            this.$notify.error(err)
        }).finally(()=>{
            this.loading = false
        })
    }
}
</script>