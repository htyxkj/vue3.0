<template>
  <div> 
  </div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop } from "vue-property-decorator";
import { User } from "@/classes/User";
import { Menu } from "@/classes/Menu";
import qs from "qs";
import { BIPUtil } from "@/utils/Request";

import { State, Action, Getter, Mutation } from "vuex-class";
import { LoginState } from "@/store/modules/login/types";
@Component
export default class WxApplets extends Vue {
  @Prop() query!:any 
  @Getter("user", { namespace:'login' }) user?: User;
  @Getter("menulist", { namespace:'login' }) menus?: Menu[];
  @Mutation("isLogin", { namespace:'login' }) setIsLogin: any;
  @Mutation("snkey", { namespace:'login' }) setSnkey: any;
  @Mutation("user", { namespace:'login' }) setUserInfo: any;
  @Mutation("menulist", { namespace:'login' }) setMenusInfo: any;
  mounted() {
    this.login()
  }

  login() {
    const loading = this.$loading({
      lock: true,
      text: "登陆中",
      spinner: "el-icon-loading",
      background: "background:'rgba(0, 0, 0, 0.7)'"
    }); 
    BIPUtil.ServApi.loginWithOutPwd(this.query.secret).then((res: any) => {
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
        this.$router.push({ path: "/", name: "home" });
        this.$notify.success("登录成功");
      } else {
        this.$notify.error(data.message);
      }
      loading.close();
    })
    .catch((res: any) => {
      
      this.$notify.error("服务没有启动！"); 
      loading.close();
    });
  }
}
</script>


<style lang="scss" scoped>
</style>

