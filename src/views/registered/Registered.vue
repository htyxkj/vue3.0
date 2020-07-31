<template>
  <el-row>
    <div style="height:40px;width:auto;">
    </div>
    <el-row :gutter="20">
    <el-col :span="6">&nbsp;</el-col>
    <el-col :span="12">
        <el-container>
            <el-header style="margin: 10px 0 20px;border-bottom: 1px solid #eee;">
                <h2 style="color:#4e90ee;">注册信息</h2>
            </el-header>
            <el-container>
                <el-main>
                    <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
                        <el-row :gutter="20">
                            <el-col :span="14">
                                <el-form-item label="姓名" prop="username">
                                    <el-input v-model="ruleForm.username"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="6">&nbsp;</el-col>
                            <el-col :span="4">&nbsp;</el-col>
                        </el-row> 
                        <el-row :gutter="20">
                            <el-col :span="14">
                                <el-form-item label="手机号" prop="usrcode">
                                    <el-input v-model="ruleForm.usrcode"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="6"> <el-button @click="sendCode" type="primary" size="small" :disabled="!cansendcode">{{yzcode1Btn}}</el-button></el-col>
                            <el-col :span="4">&nbsp;</el-col>
                        </el-row>  
                        <el-row :gutter="20">
                            <el-col :span="14">
                                <el-form-item label="验证码" prop="yzcode1">
                                    <el-input v-model="ruleForm.yzcode1"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="6">&nbsp;</el-col>
                            <el-col :span="4">&nbsp;</el-col>
                        </el-row>
                        <el-row :gutter="20">
                            <el-col :span="20">
                                <el-form-item label="行业" prop="orgcode">
                                    <el-input v-model="ruleForm.orgcode1" class="input-with-select">
                                        <el-button @click="shoOrg" slot="append" icon="el-icon-search"></el-button>
                                    </el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="4">&nbsp;</el-col>
                        </el-row>                        
                        <el-row :gutter="20">
                            <el-col :span="20">
                                <el-form-item label="推荐机构" prop="address1">
                                    <el-input v-model="ruleForm.address1"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="4">&nbsp;</el-col>
                        </el-row>
                        <el-row :gutter="20">
                            <el-col :span="20">
                                <el-form-item label="公司名称" prop="orgname">
                                    <el-input v-model="ruleForm.orgname"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="4">&nbsp;</el-col>
                        </el-row>
                        <el-row :gutter="20">
                            <el-col :span="20">
                                <el-form-item label="信用代码" prop="xycode">
                                    <el-input v-model="ruleForm.xycode"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="4">&nbsp;</el-col>
                        </el-row>
                        <el-form-item>
                            <el-button type="primary" @click="submitForm('ruleForm')">提交信息</el-button>
                            <el-button @click="resetForm('ruleForm')">重置信息</el-button>
                        </el-form-item>
                    </el-form>
                </el-main>
            </el-container>
        </el-container>
    </el-col>
    <el-col :span="6">&nbsp;</el-col>
    </el-row>

    <el-dialog title="行业选择" :close-on-click-modal="false" append-to-body :visible.sync="showOrgDlg" width="50%" class="bip-query">
        <vxe-table height="300" resizable :data="tableData" size="mini" stripe border highlight-hover-row highlight-current-row
        @current-change="currentChangeEvent">
            <vxe-table-column field="orgcode" title="编码" width="150"></vxe-table-column>
            <vxe-table-column field="orgname" title="名称" min-width="300"></vxe-table-column>  
        </vxe-table> 
        <vxe-pager border size="mini" :current-page="tablePage.currPage" :page-size="tablePage.pageSize"
            :total="tablePage.total" :layouts="['PrevPage', 'JumpNumber', 'NextPage', 'FullJump', 'Sizes', 'Total']"@page-change="orgPageChange">
        </vxe-pager> 
        <span slot="footer" class="dialog-footer">
            <el-button @click="showOrgDlg = false">取 消</el-button>
            <el-button type="primary" @click="selectOrgcode">确 定</el-button>
        </span>
    </el-dialog>

  </el-row>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import { User } from "@/classes/User";
import { Menu } from "@/classes/Menu";
import qs from "qs";
import QueryEntity from "@/classes/search/QueryEntity";
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi;
import { BaseVariable } from "@/utils/BaseICL";
import { State, Action, Getter, Mutation } from "vuex-class";
import { LoginState } from "@/store/modules/login/types";
import { Row } from "element-ui";

const namespace: string = "login";
@Component
export default class Registered extends Vue {
    @Mutation("snkey", { namespace }) setSnkey: any;
    @Mutation("user", { namespace }) setUserInfo: any;
    ruleForm:any =  {
        username: '',
        usrcode:'',
        yzcode1:'',
        address1:'',
        orgname:'',
        orgcode:'',
        orgcode1:'',
        xycode:'',
    };
    rules:any = {
        username: [
            { required: true, message: '用户名不能为空!', trigger: 'blur' }
        ],
        orgcode: [
            { required: true, message: '行业不能为空!', trigger: 'blur' }
        ],
        usrcode: [
            { required: true, validator: this.checkTel, trigger: 'blur' }
        ], 
        yzcode1: [
            { required: true, validator:this.checkCode }
        ],
    }
    yzcode1Btn:any = "发送验证码";
    cansendcode:boolean = true;//是否可以发送验证码
    seconds:number = 60;
    smsurl:any = "";
    tableData:any = [];//行业信息
    tableSelRow:any = null;
    showOrgDlg:boolean = false;
    tablePage:any ={//分页信息
        total: 0,
        currPage:1,
        pageSize:20
    };
    async mounted() {
        let res:any = await tools.loginWithOutPwd("admin");
        let data:any = res.data;
        if (data.id === 0) {
            let userI = data.data.user;
            let snkey = data.data.snkey;
            userI.password = "";
            this.setSnkey(snkey);
            this.setUserInfo(userI);
        }
        this.smsurl = BaseVariable.SMSURL;
    } 
    //发送验证码
    async sendCode(formName:any){
        var myreg=/^[1][3,4,5,7,8][0-9]{9}$/;
        if (myreg.test(this.ruleForm.usrcode)) {
            let param = {tels : this.ruleForm.usrcode};
            let data = qs.stringify(param);
            let res = await Vue.$axios.post(this.smsurl+"xcode", data);
            this.$notify.success(res.data.info)
            this.cansendcode = false;
            this.seconds = 60;
            this.countDown();
        }else{
            this.$notify.error("请输入正确的手机号！");
        }
    }
    //发送验证码
    async countDown() {  
        this.seconds = this.seconds - 1;
        this.yzcode1Btn = this.seconds+ "秒后重新发送";
        if (this.seconds == 0) {  
            this.yzcode1Btn = "发送验证码"; 
            this.cansendcode = true;
            return;  
        }  
        setTimeout(() => {
            this.countDown();
        }, 1000);
    }  
    //校验手机号
    async checkTel(rule:any, value:any, callback:any){
        var myreg=/^[1][3,4,5,7,8][0-9]{9}$/;
        if (!myreg.test(value)) {
            callback(new Error('请输入正确的手机号!'));
            return;
        }
        //校验手机号是否注册过
        let param = {dbid:BaseVariable.COMM_FLD_VALUE_DBID,ckid:2,usrcode:value};
        let data = qs.stringify(param);
        let res = await Vue.$axios.post(BaseVariable.BaseUri+"/reginfoCK", data);
        if(res.data ==0){
            callback();
        }else{
            callback(new Error('该手机号已注册过！！'));
        }
    };
    //校验验证码
    async checkCode(rule:any, value:any, callback:any){
        var myreg=/^[0-9]{5}$/;
        if (!myreg.test(value)) {
            callback(new Error('验证码需要5位数字!'));
            return 
        }else{
            callback();
        }
    };
    //注册
    submitForm(formName:any) {
        let res:any = this.$refs[formName];
        if(res){
            res.validate((valid:any) => {
            if (valid) {
                this.registered();
            } else {
                return false;
            }
            });
        }
    }
    //注册
    async registered(){
        let param = {tels:this.ruleForm.usrcode,xcode:this.ruleForm.yzcode1};
        let data = qs.stringify(param);
        let res:any = await Vue.$axios.post(this.smsurl+"/ckxcode", data);
        if(res.data.type=="-1"){
            this.$message.error(res.data.info);
        }else if(res.data.type=="0"){
            const loading = this.$loading({
                lock: true,
                text: "注册中!",
                spinner: "el-icon-loading",
                background: "background:'rgba(0, 0, 0, 0.7)'"
            });
            BIPUtil.ServApi.registered(this.ruleForm).then((res: any) => {
                if(res.data ==0){
                    this.$notify.success('注册成功！用户名：' + this.ruleForm.usrcode+",密码是手机号后8位！");
                    loading.close();
                    setTimeout(() => {
                        this.$router.push({ path: "/wlogin", name: "login" });
                    }, 2000);
                }else{
                    this.$notify.success("注册失败！");
                }
            })
            .catch((res: any) => {
                loading.close();
            });
        }else {
            this.$message.error("系统错误！！");
        }
    }
    //清空
    resetForm(formName:any) {
        let res:any = this.$refs[formName];
        if(res)
            res.resetFields();
    }
    //获取行业信息
    async getOrgContent(){
        let qe:QueryEntity = new QueryEntity('','');
        qe.page.currPage = this.tablePage.currPage;
        qe.page.pageSize = this.tablePage.pageSize;
        qe.cont = "";
        let vv = await tools.getBipInsAidInfo('INDUS',210,qe);
        if(vv.data.id ==0){
            let values = vv.data.data.data.values;
            this.tablePage = vv.data.data.data.page
            this.tableData = values;
        }
    }
    async shoOrg(){
        await this.getOrgContent();
        this.showOrgDlg = true;
    }
    //分页信息变化
    orgPageChange({ currentPage, pageSize }:any) {
        this.tablePage.currPage = currentPage
        this.tablePage.pageSize = pageSize
        this.getOrgContent()
    }
    selectOrgcode(){
        this.ruleForm.orgcode = this.tableSelRow.orgcode
        this.ruleForm.orgcode1 = this.tableSelRow.orgname
        this.showOrgDlg = false;
    }
    currentChangeEvent({row}:any){
        this.tableSelRow = row;
    }
}
</script>


<style lang="scss" scoped>
.login-img {
  top: 0%;
  left: 0%;
  position: fixed;
  width: 100%;
  height: 100%;
  background-image: url("../../assets/login/login.png");
  background-size: 100% 100%;
}
.login-card {
  height: 350px;
  width: 480px;
  position: fixed;
  left: 50%;
  top: 50%;
  border: 1px solid #127ace;
  margin-top: -175px;
  margin-left: -240px;
  border-radius: 5px;
}
.login-title {
  height: 60px;
  line-height: 60px;
  text-align: center;
  font-size: 20px;
  color: #ffffff;
  font-family: "华文楷体";
}
.login-cont {
  background-color: #f0fcfa;
  padding: 40px 70px;
}

.el-row {
  margin-bottom: 30px !important;
  height: 30px;
  line-height: 30px;
  font-size: 16px;
  &:last-child {
    margin-bottom: 20px;
  }
}
.bip-form-item {
  margin-bottom: 22px !important;
}
.login-footer {
  text-align: center;
  font-family: Arial;
  font-size: 10px;
  height: 30px;
  line-height: 30px;
}
address {
  color: #fafbfc;
}
.rt {
  text-align: right;
  width: 120px;
  float: right;
}
.reg {
  width: 50px;
  float: left;
  padding-left: 60px;
  font-weight: 500;
  font-size: 14px;
  color: #a0a0a0;
}
</style>

