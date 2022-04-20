<template>
  <div class="tg_bg">
    <div class="tg_login_wrap">
      <el-row>
        <template v-if="pageType=='loginPage'">
          <el-col :span="12" class="tg_login_img"></el-col>
          <el-col :span="12"  class="tg_login"> <!-- 登陆 -->
            <div @keyup.enter="login">
              <el-row>
                <el-col>
                  <p class="tg_title">{{loginTitle}}</p>
                </el-col>
                <el-col class="text_align">
                  <el-form @submit.native.prevent label-position="left" label-width="0px" class="login-form">
                    <el-form-item class="bip-form-item padding-b" label="">
                      <el-input class="tg_input" placeholder="用户名" v-model="user.userCode"></el-input>
                    </el-form-item>
                    <el-form-item class="bip-form-item padding-t" label="">
                      <el-input class="tg_input" id="pwd" placeholder="密码" v-model="user.password" :show-password="true" type="password"></el-input>
                    </el-form-item>
                  </el-form>
                </el-col>
                <el-col>
                  <el-button class="tg_reg" type="text" @click="gotoRegPage">没有账号，立即注册</el-button>
                </el-col>
                <el-col class="text_align">
                  <el-button type="primary" class="tg_login_btn bip_btn_primary" :disabled="canClick" @click="login" >登录</el-button>
                </el-col>
              </el-row>
            </div>
          </el-col>
        </template>
        <template v-else-if="pageType='regPage'"> <!-- 注册 -->
          <el-col class="tg_reg_card">
            <el-row>
              <p class="tg_reg_title">{{loginTitle}}</p>
            </el-row>
            <el-row>
              <el-row v-if="!regType" class="text_align">
                <el-col>
                  <el-button type="primary" class="bip_btn_primary reg_type_btn" @click="regType='ks'">
                    <i class="iconfont icon-bip-renyuan1"></i>考生注册
                  </el-button>
                </el-col>
                <el-col>
                  <el-button type="primary" class="bip_btn_primary reg_type_btn" @click="regType='dw'">
                    <i class="iconfont icon-bip-renyuan2"></i>单位注册
                  </el-button>
                </el-col>
                <el-col>
                  <el-button class="tg_to_login" type="text" @click="pageType='loginPage'">已有账号，去登陆</el-button>
                </el-col>
              </el-row>
              <el-row v-if="regType" class="text_align">
                <el-col :span="6">&nbsp;</el-col>
                <el-col :span="12" v-if="regType =='ks'">
                  <el-form @submit.native.prevent label-position="right" label-width="130px">
                    <template v-if="ksCell">
                      <div v-for="(cel,index) in ksCell.ccells.cels" :key="'A'+index">
                        <bip-comm-editor v-if="(cel.attr&0x400) <= 0 " :cell="cel" :bgrid="false" :cds="ksCell" :row="0"/>
                      </div>
                    </template>
                  </el-form>
                </el-col>
                <el-col :span="12" v-if="regType =='dw'">
                  <el-form @submit.native.prevent label-position="right" label-width="130px">
                    <template v-if="dwCell">
                      <div v-for="(cel,index) in dwCell.ccells.cels" :key="'A'+index">
                        <bip-comm-editor v-if="(cel.attr&0x400) <= 0 " :cell="cel" :bgrid="false" :cds="dwCell" :row="0"/>
                      </div>
                    </template>
                  </el-form>
                </el-col>
                <el-col :span="6">&nbsp;</el-col>

                <el-col :span="24">
                  <el-button type="primary" class="bip_btn_primary reg_btn" @click="doReg">注册</el-button>
                  <el-button class="bip_btn_default reg_btn_clear" @click="pageType='loginPage'">取消</el-button>
                </el-col>
              </el-row>
            </el-row>
          </el-col>
        </template>
      </el-row>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import { User } from "@/classes/User";
import { Menu } from "@/classes/Menu";
import { BIPUtil } from "@/utils/Request";
import { BaseVariable } from "@/utils/BaseICL";
import CDataSet from "@/classes/pub/CDataSet";
import {BipMenuBtn} from '@/classes/BipMenuBtn'
import { State, Action, Getter, Mutation } from "vuex-class";
const namespace: string = "login";
import { Cells } from "@/classes/pub/coob/Cells";
@Component({
  components:{
  }
})
export default class LoginTG extends Vue {
  fullscreenLoading: boolean = false;
  @Getter("user", { namespace }) user?: User;
  @Getter("menulist", { namespace }) menus?: Menu[];
  @Mutation("isLogin", { namespace }) setIsLogin: any;
  @Mutation("snkey", { namespace }) setSnkey: any;
  @Mutation("user", { namespace }) setUserInfo: any;
  @Mutation("menulist", { namespace }) setMenusInfo: any;
  @Mutation("isOtherePage", { namespace: "login" }) setIsOtherePage: any;
  regType:any= null;//注册类型 默认考生
  checked: boolean = false;
  loginTitle = "";
  pageType:any="loginPage"
  getVCodeTime:any=0;
  ksCell:CDataSet = new CDataSet(""); //考生
  ksCellId:any="S2012WEBKS"; 
  dwCell:CDataSet = new CDataSet(""); //单位
  dwCellId:any="S2012WEBDW";
  async mounted() {
    this.loginTitle = BaseVariable.Project_Name;
    this.getlocalStorage();
    this.setIsOtherePage(true);
    let res:any = await BIPUtil.ServApi.loginWithOutPwd("portal")
    let data:any = res.data;
    if (data.id === 0) {
        let userI = data.data.user;
        let snkey = data.data.snkey;
        userI.password = "";
        this.setSnkey(snkey);
        this.setUserInfo(userI);
    }
    if (!this.user) {
      this.user = new User("", "", "");
    } else {
      this.user.userCode = "";
    }
  }
  //进行登陆
  login() {
    if (this.fullscreenLoading) return;
    this.fullscreenLoading = true;
    const loading = this.$loading({
      lock: true,
      text: "登陆中",
      spinner: "el-icon-loading",
      background: "background:'rgba(0, 0, 0, 0.7)'",
    });
    if (!this.user) {
      return;
    }
    BIPUtil.ServApi.login(this.user).then((res: any) => {
        let data = res.data;
        let _u: any = Object.assign({}, this.user);
        if (data.id === 0) {
          let userI = data.data.user;
          let snkey = data.data.snkey;
          userI.password = "";
          let ms = data.data.menulist;
          this.setIsLogin(true);
          this.setSnkey(snkey);
          this.setUserInfo(userI);
          this.setMenusInfo(ms);
          // 判断记住账户是否为true,是将新账户存储至localStroge，否则清除localStroge中的账户
          if (this.checked) {
            if (_u) {
              this.setlocalStorage(_u.userCode);
            }
          } else {
            this.clear();
          }
          setTimeout(() => {
            this.$notify.success({
              title: "",
              type: "success",
              message: "登录成功",
              offset: 40,
            });
            this.gotoPage();
            loading.close();
          }, 500);
        } else {
          this.$notify.error(data.message);
          loading.close();
        }
        this.fullscreenLoading = false;
      })
      .catch((res: any) => {
        this.$notify.error("服务没有启动！");
        loading.close();
        this.fullscreenLoading = false;
      });
  }
  async gotoRegPage(){
    this.ksCell = await this.getCell(this.ksCellId);
    this.dwCell = await this.getCell(this.dwCellId);
    this.ksCell.createRecord();
    this.dwCell.createRecord();
    this.pageType='regPage'
    this.regType='ks';
  }
  //进行注册
  async doReg(){
    let data = "";
    if(this.regType == "ks"){
      let bok = this.checkNotNull(this.ksCell); 
      if(!bok)
        return ;
      data = this.ksCell.currRecord.data;
    }else if(this.regType == "dw"){
      let bok = this.checkNotNull(this.dwCell); 
      if(!bok)
        return ;
      data = this.dwCell.currRecord.data;
    }
    const loading = this.$loading({
      lock: true,
      text: "注册中",
      spinner: "el-icon-loading",
      background: "background:'rgba(0, 0, 0, 0.7)'",
    });
    let btn1 = new BipMenuBtn("DLG","注册")
    btn1.setDlgType("D")
    btn1.setDlgCont("dyzs.serv.UserRegServ*201;0;0");//注册
    let b = JSON.stringify(btn1)
    let prarm = {
        "type" : this.regType,//注册类型
        "data" : data //具体数据
    }
    let v = JSON.stringify(prarm);
    let res = await BIPUtil.ServApi.getDlgRunClass(v,b);
    if(res.data.id !=0){
      this.$notify.error(res.data.message);
    }else{
      this.$notify.success(res.data.message);
      this.pageType = 'loginPage'
      this.regType = null;
    }
    loading.close();
  }
  get canClick() {
    if (!this.user) {
      return false;
    }
    return this.user.userCode === "";
  }
  // 将账户信息存储值localStroge
  setlocalStorage(c_name: String) {
    if (c_name && c_name != "undefined") {
      localStorage.siteName = c_name;
    }
  }
  // 获取localStroge中的账户信息
  getlocalStorage() {
    var c_usrname = localStorage.getItem("siteName");
    if (this.user) {
      if (c_usrname && c_usrname != "undefined") {
        this.user.userCode = c_usrname;
        this.checked = true;
      }
    }
  }
  // 清除localStroge中的账户信息
  clear() {
    localStorage.removeItem("siteName");
  }
  @Watch("BaseVariable")
  titleWatch() {
    this.loginTitle = BaseVariable.Project_Name;
  }
  gotoPage() {
    this.$router.push({ path: "/report", name: "Report" });
  }
  //获取对象
  async getCell(cellid: string) {
    let res = await BIPUtil.ServApi.getCCellsParams(cellid);
    let rtn: any = res.data;
    if (rtn.id == 0) {
      let kn: Array<Cells> = rtn.data.layCels;
      let cells = kn;
      return new CDataSet(cells[0]);
    } else {
      return new CDataSet("");
    }
  }
  checkNotNull(cds:CDataSet):boolean{
    let bok = true;
    cds.ccells.cels.forEach(item => {
        if (item.unNull&&bok) {
            let vl = null;
            let hide:any = [];
            if(cds.currRecord.data[item.id]!=null)
                vl = cds.currRecord.data[item.id]+'';
            if (!vl && hide.indexOf(item.id) == -1) {
                this.$notify.warning( "【" + item.labelString + "】不能为空!");
                bok =  false;
                return false;
            }
        }
    });
    return bok;
  }
}
</script>
<style lang="scss" scoped>
.tg_title{
  text-align: center;
  line-height: 1.5rem;
  font-size: .3rem;
  font-weight: 600;
  color: #14ad85;
}
.tg_reg_title{
  text-align: center;
  line-height: .8rem;
  font-size: .3rem;
  font-weight: 600;
  color: #14ad85;
}
.tg_bg{
  background: url(../../assets/login/registration/tg_bk.png) no-repeat;
  background-size: 100% 100%;
  height: 100%;
  width: 100%;
  position: fixed;
}
.tg_login_wrap {
  width: 15.439rem;
  height: 7.3rem;
  border-radius: .09375rem;
  overflow: hidden;
  position: absolute;
  left: 50%;
  top: 46%;
  transform: translate(-50%,-50%);
  background-color: #fff;
}
.tg_login_img{
  background: url(../../assets/login/registration/tg_left_bk.png) no-repeat;
  min-height: 7.3rem;
  background-color: #fff;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}
.tg_login{
  position: relative;
  background-color: #fff;
  min-height: 7.3rem;
}
.text_align{
  text-align: center;
}
.padding-b{
  padding-bottom: .1563rem;
}
.tg_reg{
  color: #14ad85;
  font-size: 13px;
  padding-left: 1.5rem;
  cursor:pointer;
}
.tg_to_login{
  color: #14ad85;
  font-size: 13px;
  cursor:pointer;
}
.tg_login_btn{
  margin-top: 30px;
  width: 4.6875rem;
}
.tg_reg_card{
  background-color: #fff;
}
.reg_type_btn{
  border: 0px;
  width: 4rem;
  height: 1.2rem;
  margin-bottom: 20px;
  font-size: 24px;
  i{
    font-size: 24px;
  }
}
.reg_btn{
  width: 1.7813rem;
  border: 0px;
  margin-right: .2344rem;
  margin-top: .1563rem;
}
.reg_btn_clear{
  width: 1.7813rem;
  margin-left: .2344rem;
  margin-top: .1563rem;
}
</style>
<style lang="scss">
.tg_input{
  width: 4.6875rem !important;
  input{
    border: none;
    border-bottom: 1px solid rgba(236, 236, 236, 0.877);
  }
}
</style>