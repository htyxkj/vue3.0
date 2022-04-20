<template>
  <div></div>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi;
import { BaseVariable } from "@/utils/BaseICL";
import { State, Action, Getter, Mutation } from "vuex-class";
import DataCache from "../classes/DataCache";
@Component({})
export default class OauthToken extends Vue {
  @Mutation("isLogin", { namespace: "login" }) setIsLogin: any;
  @Mutation("snkey", { namespace: "login" }) setSnkey: any;
  @Mutation("user", { namespace: "login" }) setUserInfo: any;
  @Mutation("menulist", { namespace: "login" }) setMenusInfo: any;
  loading: any = null;
  oauthTokenUrl: any = null;
  cookieKey: string = "dev.sso.login.account.operation.auth";
  async created() {
    this.cookieKey = BaseVariable.CookieKey;
    this.check_token();
  }

  check_token() {
    this.loading = this.$loading({
      lock: true,
      text: "登陆校验中……",
      spinner: "el-icon-loading",
      background: "rgba(0, 0, 0, 0.7)",
    });
    console.log(BaseVariable.ITEMTYPE);
    if (BaseVariable.ITEMTYPE == "bip-zzz") {
      //农村集体三资管理平台
      this.bip_zzz_outh_token();
    } else if (BaseVariable.ITEMTYPE == "bip-amb") {
      //南钢阿米巴
      this.bip_amb_outh_token();
    } else if (BaseVariable.ITEMTYPE == "JINAN-bip-amb") {
      //高金阿米巴
      this.gaojin_amb_outh_token();
    }
  }

  async gaojin_amb_outh_token() {
    let cookieValue = this.getCookie2();
    console.log("获取到本地cookie:", cookieValue);
    // if (!cookieValue) {
    //   cookieValue =
    //     "eyJhbGciOiJIUzI1NiJ9.eyJ1bmlvbklkIjoiQkluM0U4YlRScGxYUUNSSGlTWWxaQmdpRWlFIiwiaW5zdGFuY2VJZCI6MiwibG9naW5OYW1lIjoiMTU2NTI1Mjc4OTQiLCJ0ZW5hbnRJZCI6MSwiaWQiOjEzMDQ1NzU3OTc3MTc0NzA0NDQsImxvZ2luU291cmNlIjoiMSIsImp0aSI6ImJjZGZiMzcyLTUyYWUtNDBkNC1hOTE0LWEwZjI1NGFmOWQ4YSIsIm5iZiI6MTY0OTQ3MDkzNSwiZXhwIjoxNjQ5NTU3MzM1fQ.Nfzp1PP62-eNQzYTWldn7yyWeF-bjXfmyYORLP7SdyM";
    //   console.log("测试手工cookie:", cookieValue);
    // }

    let data = { token: cookieValue, kid: "login" };
    let auth = Vue.$axios.defaults.headers.common["Authorization"];
    if (auth) {
      this.$delete(Vue.$axios.defaults.headers.common, "Authorization");
    }
    let res: any = await Vue.$axios.get("/gaojinOauthLogin", { params: data });
    console.log(res);
    let datav = res.data;
    if (datav.id == 302) {
      this.loading.close();
      let msg = res.data.message;
      if (msg.indexOf("/error") > -1) {
        this.gotoErrorPage();
      } else location.href = res.data.message;
    } else if (datav.id == 0) {
      console.log(datav.data);
      Vue.$axios.defaults.headers.common["Authorization"] = cookieValue;
      let user_name = datav.data.user.phoneNo;
      res = await tools.loginWithOutPwd(user_name);
      this.loading.close();
      this.loginAfter(res);
    } else {
      this.loading.close();
      this.$notify.error({
        title: "",
        type: "error",
        message: "系统错误，请联系管理员！",
        offset: 40,
      });
    }
  }

  getCookie2() {
    return this.getCookie(this.cookieKey);
  }

  getCookie(name: string) {
    var arr,
      reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    if ((arr = document.cookie.match(reg))) return arr[2];
    else return null;
  }

  async bip_zzz_outh_token() {
    try {
      let query = this.$route.query;
      let token = query.token;
      let data = { token: token, apiId: "checkYZTToken" };
      let res: any = await Vue.$axios.get("/commapi", { params: data });
      res = res.data;
      if (res.code == 200) {
        let user_name = res.data.user_name;
        res = await tools.loginWithOutPwd(user_name);
        this.loginAfter(res);
      } else {
        this.gotoPage();
      }
      this.loading.close();
    } catch (e) {
      this.$notify.error({
        title: "",
        type: "error",
        message: "认证失败！",
        offset: 40,
      });
      this.loading.close();
      this.gotoPage();
    }
  }

  async bip_amb_outh_token() {
    try {
      let query = this.$route.query;
      let token = query.token;
      let data = { token: token, apiId: "ossToken" };
      let res: any = await Vue.$axios.get("/commapi", { params: data });
      res = res.data;
      if (res.code == 200) {
        let user_name = res.data.user_name;
        res = await tools.loginWithOutPwd(user_name);
        this.loginAfter(res);
      } else {
        this.gotoPage();
      }
      this.loading.close();
    } catch (e) {
      this.$notify.error({
        title: "",
        type: "error",
        message: "认证失败！",
        offset: 40,
      });
      this.loading.close();
      this.gotoPage();
    }
  }
  /**
   * 进行登陆后
   * @param res 登陆返回数据
   */
  loginAfter(res: any) {
    let data = res.data;
    if (data.id === 0) {
      let userI = data.data.user;
      let snkey = data.data.snkey;
      userI.password = "";
      let ms = data.data.menulist;
      this.setIsLogin(true);
      this.setSnkey(snkey);
      this.setUserInfo(userI);
      this.setMenusInfo(ms);

      setTimeout(() => {
        this.gotoPage();
        this.loading.close();
      }, 500);
    } else {
      this.$notify.error({
        title: "",
        type: "error",
        message: data.message,
        offset: 40,
      });
      this.gotoErrorPage();
    }
  }
  gotoPage() {
    this.$router.push({ path: "/report", name: "Report" });
  }

  gotoErrorPage() {
    this.$router.push({ path: "/error" });
  }
}
</script>