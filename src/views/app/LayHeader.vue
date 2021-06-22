<template>
    <div>
        <el-row> 
            <el-col :span="14" style="text-align:start" class="my-header"> 
                <svg v-if="base_variable && base_variable.ITEMTYPE == 'itemCtrl'" class="iconfont menuicon pointer my-icon" aria-hidden="true">
                    <use xlink:href="#icon-bip-rongtong "></use>
                </svg>
                <img v-else src="../../assets/bip/logo1.png"/>
                <div style="color: white;font-size: 18px;">
                    {{base_variable.Project_Name}}
                </div>
                <!-- <i v-else class="iconfont icon-bip-menu menuicon pointer" @click="showMenu" style="font-size: 34px;"></i> -->
            </el-col>
            <el-col :span="10" style="text-align:end" class="my-header">
                <el-badge :value="taskNum" class="header_badge_item" style="margin-left: auto;">
                    <i class="el-icon-mobile pointer" @click="myTask"></i>    
                </el-badge>
                <el-badge :value="msgNum" class="header_badge_item">
                    <i class="el-icon-message-solid pointer"  @click="myMsg"></i>    
                </el-badge> 
                <el-badge class="header_badge_item">
                    <i :class="icon "  @click="isQP"></i>    
                </el-badge> 
                <el-popover  width="220" placement="bottom-end" >
                    <el-row style="margin: 0px;">
                        <el-col :span="24">
                            <el-row class="user_name user_padding user_hr">
                                <el-col :span="6">
                                    姓名：
                                </el-col>
                                <el-col :span="18">
                                {{user.userName}}
                                </el-col>
                            </el-row> 
                            <!-- <el-row class="user_code user_padding">{{user.userCode}}</el-row> -->
                            <el-row class="user_padding">
                                <el-col :span="6">
                                    单位：
                                </el-col>
                                <el-col :span="18">
                                    {{user.deptInfo.cmcName}}
                                </el-col>
                            </el-row>
                            <el-row class="user_padding">
                                <el-col :span="6">
                                    角色：
                                </el-col>
                                <el-col :span="18">
                                    <template v-if="base_variable && base_variable.ITEMTYPE == 'trainPro'">
                                        {{user.deptInfo.deptName}}-
                                    </template>
                                    <template v-if="gwName">{{gwName}}</template>
                                </el-col>
                            </el-row>
                            <el-row class="user_padding user_hr"><el-button type="text" class="user_button" @click="uppwdClick">修改密码</el-button></el-row>                            
                            <!-- <el-row class="user_padding user_hr"><el-button type="text" class="user_button">客户端下载</el-button></el-row> -->
                            <el-row class="user_padding user_hr" v-if="user.mulscm && user.mulscm.length>0">
                                <el-popover  width="160" placement="left-start" >
                                    <el-row style="margin: 0px;">
                                        <el-col :span="24"> 
                                            <el-row class="user_padding user_hr" v-for="(item,index) in user.mulscm" :key="index">
                                                <el-button type="text" class="user_button" @click="switchCMC(item)">{{item.cmcName}}</el-button>
                                            </el-row>                            
                                        </el-col>
                                    </el-row>  
                                    <el-button slot="reference" type="text" class="user_button">切换单位</el-button>
                                </el-popover>
                            </el-row>
                            <!-- <el-row class="user_padding user_hr" >
                                <el-popover  width="160" placement="left-start" >
                                    <el-row style="margin: 0px;">
                                        <el-col :span="24"> 
                                            <el-row class="user_padding user_hr" v-for="(item,index) in skin" :key="index">
                                                <el-button type="text" class="user_button" @click="switchSKIN(item)">{{item.name}}</el-button>
                                            </el-row>                            
                                        </el-col>
                                    </el-row>  
                                    <el-button slot="reference" type="text" class="user_button">换肤</el-button>
                                </el-popover>
                            </el-row> -->
                            <el-row class="user_padding" style="margin-bottom:2px"><el-button @click="loginOut" type="text" class="user_button">退出登录</el-button></el-row>
                        </el-col>
                    </el-row>
                    <template v-if="!user.avatar">
                        <img slot="reference" src ='../../assets/48.jpg' class="userimg pointer"/>
                    </template>
                    <template v-else>
                        <img slot="reference" v-if="base_variable" :src="base_variable.BaseUri+'/db_'+base_variable.COMM_FLD_VALUE_DBID+'/'+user.avatar" class="userimg pointer"/>
                    </template>
                </el-popover>
            </el-col>
        </el-row>
        <el-row>
            <el-dialog title="修改密码"  :visible.sync="uppwddia" width="35%"  class="changePass">
                <el-form ref="pwdForm" :model="pwdForm" label-width="120px" :rules="rules">
                    <el-form-item label="旧密码" prop="oldPwd" class="bip-password-input-item" style="padding-top:20px;">
                        <el-input type="password" v-model="pwdForm.oldPwd" autocomplete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="密码" prop="newPwd" class="bip-password-input-item" style="padding-top:20px;">
                        <el-input type="password" v-model="pwdForm.newPwd" autocomplete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="确认密码" prop="newPwd1" class="bip-password-input-item" style="padding-top:20px;">
                        <el-input type="password" v-model="pwdForm.newPwd1" autocomplete="off"></el-input>
                    </el-form-item>
                </el-form>

                <span slot="footer" class="dialog-footer">
                    <el-button @click="uppwddia = false" size="small">取 消</el-button>
                    <el-button type="primary" @click="upPwd" size="small">确 定</el-button>
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
import { BIPUtil } from "@/utils/Request";
import { LoginState } from '../../store/modules/login/types'; 
import QueryCont from "@/classes/search/QueryCont";
let tools = BIPUtil.ServApi
import { BaseVariable } from "@/utils/BaseICL";
import QueryEntity from "@/classes/search/QueryEntity";
const BIPTASK : string = "BIP_TASK",BIPMSG : string = "BIP_MSG"; 
@Component({
})
export default class LayHeader extends Vue { 
    base_variable = BaseVariable;
    haveTask:boolean = false;
    client:any = null;
    taskNum:Number = 0;
    msgNum:Number = 0;
    uppwddia:boolean = false;
    pwdForm:any={oldPwd:"",newPwd:"",newPwd1:"",};
    rules:any = null;
    @Getter('user', { namespace: 'login' }) user?: User;
    @Mutation("user", { namespace: 'login' }) setUserInfo: any;
    @Mutation("menulist", { namespace: 'login' }) setMenusInfo: any;
    @Mutation("isLogin", { namespace: 'login' }) setIsLogin: any;
    @Mutation("snkey", { namespace: 'login' }) setSnkey: any;    
    @Prop() isLogin!:boolean;
    @State('login') profile!: LoginState 
    qp:boolean = false;
    icon:String = "el-icon-full-screen pointer"
    skin:any=[];

    gwName:any="";

    async mounted() {
        this.skin = [
            {name:'默认',id:'theme'},{name:'默认1',id:'theme1'}
        ];
        this.rules={
            // oldPwd: [
            //     { required: true, message: '请填写旧密码！', trigger: 'blur' }
            // ],
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
            this.initGWName();
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
        try {
            if(this.client){
                this.client.disconnect();
                this.client = null;
            }
            this.$emit('loginOut');
        } catch (error) {
            this.$emit('loginOut');
        }
    }
    //切换公司
    async switchCMC(item:any){ 
        let cmcCode = item.cmcCode;
        let ret = await tools.switchCMC(cmcCode);
        console.log(ret);
        if(ret.data.id ==0){
            let user = ret.data.data.user;
            let snkey = ret.data.data.snkey;
            if(!snkey){
                snkey = JSON.parse(window.sessionStorage.getItem('snkey')+'');
            }
            sessionStorage.clear();
            this.setUserInfo(user);
            let ms = ret.data.data.menulist;
            this.setMenusInfo(ms);
            this.setIsLogin(true);
            this.setSnkey(snkey); 
            this.$router.go(0)
        }else{
            this.$notify.error(ret.data.message)
        }
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
        console.log(info);
        if (info.type === 1) {
            if (this.taskNum !== info.count) {
                this.taskNum = info.count;
                if(this.taskNum>0){
                    this.$notify.success({
                        title:"",
                        type: 'success',
                        message: "您有" + this.taskNum + "条任务未处理！",
                        offset: 40
                    })
                }
            }
            this.$bus.$emit('MyTaskChange')
        }
        if (info.type === 2) {
            if(typeof info.count === "number"){
                if (this.msgNum !== info.count) {
                    this.msgNum = info.count;
                    if(this.msgNum>0){
                        this.$notify.success({
                            title:"",
                            type: 'success',
                            message: "您有" + this.taskNum + "条消息未处理！",
                            offset: 40
                        })
                    }
                }
                this.$bus.$emit('MyMsghange')
            }else{
                this.$message(info.count)
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
    isQP(){
        if(this.qp==true){
        this.exitFullScreen();
        this.icon ="el-icon-full-screen  pointer"
        this.qp=false;
      }else{
        this.fullScreen();
        this.qp=true;
         this.icon ="el-icon-full-screen  pointer"
      }
    }
    //全屏
    fullScreen() {
        let el:any;
         el = document.documentElement;
        var rfs = el.requestFullscreen || el.webkitRequestFullscreen || 
            el.mozRequestFullScreen  || el.msRequestFullScreen ;
        if(typeof rfs != "undefined" && rfs) {
            rfs.call(el);
        } else {
            try{
                //for IE，这里其实就是模拟了按下键盘的F11，使浏览器全屏
                var wscript = new ActiveXObject("WScript.Shell");
                if(wscript != null) {
                    wscript.SendKeys("{F11}");
                }
            }catch(e){

            }
      }
    }
     //退出全屏
    exitFullScreen() {
        let el :any;
        el = document;
        var cfs = el.exitFullscreen || el.webkitCancelFullScreen || 
          el.mozCancelFullScreen || el.exitFullScreen;
        if(typeof cfs != "undefined" && cfs) {
            cfs.call(el);
        } else {
            try{
                var wscript = new ActiveXObject("WScript.Shell");
                if(wscript != null) {
                    wscript.SendKeys("{F11}");
                }
            }catch(e){
            }
        }
    }
    //切换皮肤
    switchSKIN(item:any){
      window.document.documentElement.setAttribute('data-theme', item.id)
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
            let _this = this;
            let ref:any = this.$refs['pwdForm']
            if(ref){
                ref.validate((valid:any) => {
                    if (valid) {
                        _this.upPwd1();
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
            }
        }else{
            this.loginOut()
        }
    }
    async upPwd1(){
        if(this.user){
            let cc = await tools.upPwd(this.user,this.pwdForm.newPwd,this.pwdForm.oldPwd);
            if(cc.data.id ==0){
                this.$notify.success(cc.data.message)
                this.uppwddia = false;
            }else{
                this.$notify.error(cc.data.message)
            }
        }
    }

    async initGWName(){
        if(this.user){
            let _u:any = this.user;
            let qe: QueryEntity = new QueryEntity("", "");
            let gwCode = _u.gwCode;
            if(gwCode && gwCode.length>0){
                let qCont = new QueryCont('gwcode',gwCode,12);
                qCont.setContrast(5)
                let oneCont = [qCont]; 
                qe.cont = "~[" + JSON.stringify(oneCont)+"]";
            }
            let cc = await tools.getBipInsAidInfo("GW", 210, qe);
            this.gwName = "";
            if(cc.data.id ==0){
                let value = cc.data.data.data.values;
                for(var i=0;i<value.length;i++){
                    this.gwName += value[i].gwname+";"
                }
                if(this.gwName.length>1){
                    this.gwName = this.gwName.substring(0,this.gwName.length-1)
                }
            }
        }
    }
}
</script>
<style lang="scss" scoped>
.menuicon{
    color: #fff;
    font-size: 46px; 
}
.pointer{
    cursor:pointer;
}
.userimg{
    border-radius: 50%;padding: 0px;width: 40px;height: 40px;margin-top: 3px;margin-right:10px;
}
.my-icon{
    width: .8rem;
    height: .8rem;
}
.header_badge_item{
    color: white;
    font-size: 22px;
    margin-right: 25px;
}
.my-header{
    @include head_height_style;
    display: flex;
    align-items: center;
}

</style>
<style lang="scss">
.bip-password-input-item{
    .el-form-item__label{
        height: 40px !important;
        margin-top: 1px;
    }
}
</style>
