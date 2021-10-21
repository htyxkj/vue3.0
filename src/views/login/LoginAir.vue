<template>
  <div class="rd_bg">
    <div class="rd_login_wrap">
      <el-row>
        <el-col :span="14">
          &nbsp;
        </el-col>
        <el-col :span="10"  class="rd_login">
          <div class="login_card">
            <div @keyup.enter="login">
              <p class="rd_title">{{loginTitle}}</p>
              <input class="rd_input rd_input_margin" placeholder="账户" v-model="user.userCode"/>
              <input class="rd_input" placeholder="密码" id="pwd" v-model="user.password" :show-password="true" type="password"/>
              <el-row type="flex" justify="start">
                <el-col :span="12">
                  <el-checkbox v-model="checked" class="rd_save_user">记住账户</el-checkbox>
                </el-col>
                <el-col :span="12" class="no_pwd">
                  <!-- 忘记密码 -->
                  <el-button type="text" class="no_pwd"></el-button>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="24">
                  <el-button type="primary" class="rd_login_btn" :disabled="canClick" @click="login" >登录</el-button>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { User } from "@/classes/User";
import { Menu } from "@/classes/Menu";
import { BIPUtil } from "@/utils/Request";
import { BaseVariable } from "@/utils/BaseICL";
import { Getter, Mutation } from "vuex-class";
const namespace: string = "login";
@Component({
  components:{
  }
})
export default class LoginRD extends Vue {
  fullscreenLoading: boolean = false;
  @Getter("user", { namespace }) user?: User;
  @Getter("menulist", { namespace }) menus?: Menu[];
  @Mutation("isLogin", { namespace }) setIsLogin: any;
  @Mutation("snkey", { namespace }) setSnkey: any;
  @Mutation("user", { namespace }) setUserInfo: any;
  @Mutation("menulist", { namespace }) setMenusInfo: any;
  @Mutation("isOtherePage", { namespace: "login" }) setIsOtherePage: any;
  regData:any={name:"",tel:"",scmName:"",creditCode:"",vCode:""}
  checked: boolean = false;
  loginTitle = "";
  COPYRIGHT = "";
  SCM = "";
  styleR = "";
  getVCodeTime:any=0;
  mounted() {
    if (!this.user) {
      this.user = new User("", "", "");
    } else {
      this.user.userCode = "";
    }
    this.getlocalStorage();
    this.loginTitle = BaseVariable.Project_Name;
    this.COPYRIGHT = BaseVariable.COPYRIGHT;
    this.SCM = BaseVariable.SMC;
    this.setIsOtherePage(true);
    let screenWidth = document.body.clientWidth;
    let screenHeight = document.body.clientHeight;
    this.styleR =
      "text-align: center;width:" +
      screenWidth / 2 +
      "px;height:" +
      screenHeight +
      "px";
  }

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
    this.COPYRIGHT = BaseVariable.COPYRIGHT;
  }
  gotoPage() {
    this.$router.push({ path: "/report", name: "Report" });
  }
}
</script>
<style lang="scss" scoped>
.rd_title{
  text-align: center;
  line-height:.546875rem;
  margin-bottom:.99rem;
  font-size:.3rem;
  font-weight: 600;
}
.rd_bg{
  background: url(../../assets/login/airSuper/login_bk.png) no-repeat;
  background-size: 100%;
  height: 100%;
  width: 100%;
  position: fixed;
  background-size: 100% 100%;
}
.rd_login_wrap {
  width: 18rem;
  min-height: 8.25rem;
  border-radius: .09375rem;
  overflow: hidden;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%,-50%);
}
.rd_input{
  width: 4.6875rem;
  height: .46875rem;
  font-size: 16px;
  background: none;
  outline: none;
  border: none;
  border-bottom: 1px solid #eee;
  color: #000;
  padding: 0px;
}
.rd_input_margin{
  margin-bottom: .4125rem;
}
.rd_input_phone{
  width: 2.8rem;
}
input::-webkit-input-placeholder {
  /* 修改字体颜色 */
  color: #ccc;
}
.login_card{
  width: 4.6875rem;
  left: 50%;
  border-radius: .09375rem;
  overflow: hidden;
  position: absolute;
  top: 45%;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}
.rd_login{
  position: relative;
  background-color: #fff;
  min-height: 8.25rem;
  border-radius: .09375rem;
}
.rd_login-footer {
  text-align: center;
  font-family: Arial;
  font-size: .125rem;
  height: 30px;
  line-height: 30px;
}
.rd_text_center{
  text-align: center;
}
.rd_login_btn{
  margin-top: 20px;
  width: 100%;
  background-color: #008eff;
}
.rd_reg_btn{
  width: 100%;
  float: right;
  font-size:10px
}
.no_pwd{
  font-size:10px;
  text-align: end;
  padding-top: 2px;
}
</style>
<style lang="scss">
.rd_save_user{
  .el-checkbox__label{
    font-size: .125rem;
  }
}
</style>