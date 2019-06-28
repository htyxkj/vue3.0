<template>
    <el-row>
        <el-badge :value="taskNum" class="header_badge_item">
            <i class="el-icon-mobile"></i>    
        </el-badge>
        <el-badge :value="msgNum" class="header_badge_item">
            <i class="el-icon-message-solid"></i>    
        </el-badge>

        <el-popover  width="160" placement="bottom-end" >
            <el-row style="margin: 0px;">
                <el-col :span="24">
                    <el-row class="user_name user_padding user_hr">{{user.userName}}</el-row> 
                    <el-row class="user_code user_padding">{{user.userCode}}</el-row>
                    <el-row class="user_padding">{{user.deptInfo.cmcName}}</el-row>
                    <el-row class="user_padding user_hr"><el-button type="text" class="user_button">修改密码</el-button></el-row>                            
                    <el-row class="user_padding user_hr"><el-button type="text" class="user_button">客户端下载</el-button></el-row>
                    <el-row class="user_padding" style="margin-bottom:2px"><el-button @click="loginOut" type="text" class="user_button">退出</el-button></el-row>
                </el-col>
            </el-row>  
            <img slot="reference" src ='../../assets/48.jpg' style="border-radius: 50%;padding: 0px;width: 40px;height: 40px;margin-top: 10px;margin-right:10px" />
        </el-popover>
    </el-row>
</template>
<script lang="ts">
import { User } from '@/classes/User';
import { Component, Vue, Provide, Prop ,Watch} from "vue-property-decorator";
import { State, Action, Getter, Mutation } from 'vuex-class';
import  Stomp  from 'stompjs';
import QueryEntity from "@/classes/search/QueryEntity";
import { BIPUtil } from "@/utils/Request";

let tools = BIPUtil.ServApi
import { BaseVariable } from "@/utils/BaseICL";
const BIPTASK : string = "biptask",BIPMSG : string = "bipmsg"; 
@Component({
})
export default class LayHeader extends Vue { 
    @Provide() haveTask:boolean = false;
    @Provide() client:any = null;
    @Provide() taskNum:Number = 0;
    @Provide() msgNum:Number = 0;
    @Getter('user', { namespace: 'login' }) user?: User;
    @Prop() isLogin!:boolean;
    async mounted() {
        if(this.isLogin){ 
            this.getTaskMsgNum();
            this.connectQ();
        } 
    }
    loginOut(){
        if(this.client){
            this.client.disconnect();
            this.client = null;
        }
        this.$emit('loginOut');
    }
    @Watch("isLogin")
    logined(){
        if(this.client){
            this.client.disconnect();
            this.client = null;
        }
        if(this.isLogin){
            this.getTaskMsgNum();
            this.connectQ() 
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
        console.log(frame)
        var info = JSON.parse(frame.body);
        if (info.type === 1) {
            if (this.taskNum !== info.count) {
            this.taskNum = info.count;
            if(this.taskNum>0)
                this.$notify.success("您有" + this.taskNum + "条任务未处理！" );
            }
        }
        if (info.type === 2) {
            this.msgNum = info.count;
            if(this.msgNum>0)
            this.$notify.success("您有" + this.msgNum + "条消息未处理！" ); 
        }
        // console.log(frame);
        // 接收消息
    }
    //初始化mqtt客户端失败！
    onFailed(){
        console.log("初始化mqtt客户端失败！");
    }

    async getTaskMsgNum(){
        var data1 = { 
            pcell: "SYRW",
            pdata: "{brd:0,}",
            bebill: 1,
            currentPage: 1,
            pageSize: 1,
            cellid: ""
        };
        let qe:QueryEntity = new QueryEntity("SYRW","SYRW","{brd:0,}");
        let vv = await tools.query(qe); 
        let data = vv.data; 
        if(data)
        if (data.id == 0) {
            let vv: QueryEntity = data.data.data;
            this.taskNum = vv.values.length;
        }else{
            this.taskNum = 0;
        }

        // var data1 = { 
        //     pcell: "SYRW",
        //     pdata: "{brd:0,}",
        //     bebill: 1,
        //     currentPage: 1,
        //     pageSize: 1,
        //     cellid: ""
        // };
        // let qe:QueryEntity = new QueryEntity("SYRW","SYRW","{brd:0,}");
        // let vv = await tools.query(qe); 
        // let data = vv.data; 
        // if(data)
        // if (data.id == 0) {
        //     let vv: QueryEntity = data.data.data;
        //     this.taskNum = vv.values.length;
        // }else{
        //     this.taskNum = 0;
        // } 
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
}
</script>
