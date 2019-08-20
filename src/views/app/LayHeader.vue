<template>
    <div>
        <el-row style="margin-bottom:0px"> 
            <el-col :span="4"> 
                <el-row style="text-align:start;margin: 16px 0px;"> 
                    <i class="iconfont icon-bip-menu menuicon pointer" @click="showMenu"></i>
                </el-row>
            </el-col>
            <el-col :span="20">
                <el-row style="text-align:end;margin-bottom:0px" > 
                    <el-badge :value="taskNum" class="header_badge_item">
                        <i class="el-icon-mobile pointer" @click="myTask"></i>    
                    </el-badge>
                    <el-badge :value="msgNum" class="header_badge_item">
                        <i class="el-icon-message-solid pointer"  @click="myMsg"></i>    
                    </el-badge> 
                    <el-popover  width="160" placement="bottom-end" >
                        <el-row style="margin: 0px;">
                            <el-col :span="24">
                                <el-row class="user_name user_padding user_hr">{{user.userName}}</el-row> 
                                <el-row class="user_code user_padding">{{user.userCode}}</el-row>
                                <el-row class="user_padding">{{user.deptInfo.cmcName}}</el-row>
                                <el-row class="user_padding user_hr"><el-button type="text" class="user_button" @click="uppwdClick">修改密码</el-button></el-row>                            
                                <el-row class="user_padding user_hr"><el-button type="text" class="user_button">客户端下载</el-button></el-row>
                                <el-row class="user_padding" style="margin-bottom:2px"><el-button @click="loginOut" type="text" class="user_button">注销</el-button></el-row>
                            </el-col>
                        </el-row>  
                        <img slot="reference" src ='../../assets/48.jpg' class="userimg pointer"/>
                    </el-popover>
                </el-row>
            </el-col>
        </el-row>
        <el-row>
            <el-dialog title="修改密码" :visible.sync="uppwddia" width="35%" >
                <el-form ref="pwdForm" :model="pwdForm" label-width="80px" :rules="rules">
                    <el-form-item label="旧密码" prop="oldPwd" style="padding-top:20px;">
                        <el-input type="password" v-model="pwdForm.oldPwd" autocomplete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="密码" prop="newPwd" style="padding-top:20px;">
                        <el-input type="password" v-model="pwdForm.newPwd" autocomplete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="确认密码" prop="newPwd1" style="padding-top:20px;">
                        <el-input type="password" v-model="pwdForm.newPwd1" autocomplete="off"></el-input>
                    </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="uppwddia = false">取 消</el-button>
                    <el-button type="primary" @click="upPwd">确 定</el-button>
                </span>
            </el-dialog>
        </el-row>
    </div>
</template>
<script lang="ts">
import { User } from '@/classes/User';
import { Component, Vue, Provide, Prop ,Watch} from "vue-property-decorator";
import { State, Action, Getter, Mutation } from 'vuex-class';
import  Stomp  from 'stompjs';
import QueryEntity from "@/classes/search/QueryEntity";
import { BIPUtil } from "@/utils/Request";
import { LoginState } from '../../store/modules/login/types'; 

let tools = BIPUtil.ServApi
import { BaseVariable } from "@/utils/BaseICL";
const BIPTASK : string = "biptask",BIPMSG : string = "bipmsg";  
import { Menu } from "@/classes/Menu";
@Component({
})
export default class LayHeader extends Vue { 
    @Provide() haveTask:boolean = false;
    @Provide() client:any = null;
    @Provide() taskNum:Number = 0;
    @Provide() msgNum:Number = 0;
    @Provide() uppwddia:boolean = false;
    @Provide() pwdForm:any={oldPwd:"",newPwd:"",newPwd1:"",};
    @Provide() rules:any = null;
    @Getter('user', { namespace: 'login' }) user?: User;
    @Prop() isLogin!:boolean;
    @State('login') profile!: LoginState 
    @Getter('isOpenMenu', { namespace: 'login' }) isOpenMenu!: boolean;
    @Mutation('setIsOpenMenu', { namespace:'login' }) setIsOpenMenu: any;
    async mounted() {
        this.rules={
            oldPwd: [
                { required: true, message: '请填写旧密码！', trigger: 'blur' }
            ],
            newPwd: [
                { required: true,validator: this.validatePass, trigger: 'blur' }
            ], 
            newPwd1: [
               { required: true,validator: this.validatePass2, trigger: 'blur' }
            ] 
        }
        if(this.isLogin){ 
            await this.connectQ(); 
            this.getTaskMsgNum();
        } 
    }
    validatePass = (rule:any, value:any, callback:any) => {
        if (value === '') {
          callback(new Error('请输入密码'));
        } else {
          callback();
        }
      };
    validatePass2 = (rule:any, value:any, callback:any) => {
        if (value === '') {
          callback(new Error('请再次输入密码'));
        } else if (value !== this.pwdForm.newPwd) {
          callback(new Error('两次输入密码不一致!'));
        } else {
          callback();
        }
    };
    loginOut(){
        if(this.client){
            this.client.disconnect();
            this.client = null;
        }
        this.$emit('loginOut');
    }
    @Watch("isLogin")
    async logined(){
        if(this.client){
            this.client.disconnect();
            this.client = null;
        }
        if(this.isLogin){
            await this.connectQ()  
            this.getTaskMsgNum();
        }
    }
    //初始化mqtt客户端，并连接mqtt服务 
    connectQ() {      
      let ws = new WebSocket(BaseVariable.MQTT_SERVICE);
      this.client = Stomp.over(ws);
      const headers = {
        login: BaseVariable.MQTT_USERNAME, //用户名
        passcode: BaseVariable.MQTT_PASSWORD, //密码
        host: BaseVariable.MQTT_HOST // 虚拟空间
      };
      this.client.connect(headers, this.onConnected, this.onFailed);
    }
    //初始化mqtt客户端成功！
    onConnected() { 
        //订阅频道
        if(this.user){
            var topic = "/exchange/" + BIPTASK + "/" + BIPTASK + "." + BaseVariable.COMM_FLD_VALUE_DBID + "." + this.user.userCode;
            var topic1 = "/exchange/" + BIPMSG + "/" + BIPMSG + "." + BaseVariable.COMM_FLD_VALUE_DBID + "." + this.user.userCode;
            this.client.subscribe(topic, this.responseCallback);
            this.client.subscribe(topic1, this.responseCallback); 
        }
    }
    responseCallback(frame : any) { 
        var info = JSON.parse(frame.body);
        if (info.type === 1) {
            if (this.taskNum !== info.count) {
                this.taskNum = info.count;
                if(this.taskNum>0)
                    this.$notify.success("您有" + this.taskNum + "条任务未处理！" );
            }
        }
        if (info.type === 2) {
            if (this.msgNum !== info.count) {
                this.msgNum = info.count;
                if(this.msgNum>0)
                    this.$notify.success("您有" + this.msgNum + "条消息未处理！" ); 
            }
        }
        // console.log(frame);
        // 接收消息
    }
    //初始化mqtt客户端失败！
    onFailed(){
        console.log("初始化mqtt客户端失败！");
    }

    async getTaskMsgNum(){
        setTimeout(() => {
            let cc = tools.getTaskMsgData(200,null,null,null,null,null,null,null,null);             
        }, 500);
    }
    showMenu(){
        this.setIsOpenMenu(true)
    }

    myTask(){
        this.$router.push({
            path:'/myTask',  
        })
    }
    myMsg(){
        this.$router.push({
            path:'/myMsg',  
        })
    }
    @Watch('taskNum')
    uptaskNum(){
        if(this.taskNum >0 || this.msgNum>0)
            this.haveTask = true;
    }
    @Watch('msgNum')
    upmsgNum(){
        if(this.taskNum >0 || this.msgNum>0)
            this.haveTask = true;
    }
    /**点击修改密码按钮 */
    uppwdClick(){
        this.pwdForm.oldPwd= ''
        this.pwdForm.newPwd= ''
        this.pwdForm.newPwd1= ''
        this.uppwddia = true;
    }
    /**进行密码修改 */
    async upPwd(){
        if(this.user){
            let cc = await tools.upPwd(this.user,this.pwdForm.newPwd,this.pwdForm.oldPwd);
            if(cc.data.id ==0){
                this.$notify.success(cc.data.message)
                this.uppwddia = false;
            }else{
                this.$notify.error(cc.data.message)
            }
        }else{
            this.loginOut()
        }
    }
}
</script>
<style scoped>
.menuicon{
    color: white;
    font-size: 28px; 
}
.pointer{
    cursor:pointer;
}
.userimg{
    border-radius: 50%;padding: 0px;width: 40px;height: 40px;margin-top: 10px;margin-right:10px 
}
</style>
