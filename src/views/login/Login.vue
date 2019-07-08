<template>
  <!-- <div class="login-page">
    <div class="login-card">
      <div class="login-title">
        <span>系统登陆窗口</span>
      </div>
      <div class="login-box" @keyup.enter="login">
        <el-form>
        <el-row>
          <el-col :span="20" :offset="2">
            <el-input id="name" v-model="user.userCode" placeholder="请输入帐号">
              <template slot="prepend">帐号</template>
            </el-input>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="20" :offset="2">
            <el-input id="pwd" v-model="user.password" :show-password="true" placeholder="请输入密码" type="password">
              <template slot="prepend">密码</template>
            </el-input>
          </el-col>
        </el-row>
        </el-form>
        <el-row>
          <el-col :span="20" :offset="2">
            <el-button id="login" style="width:100%" type="primary" :disabled="canClick" @click="login" >登录</el-button>
          </el-col>
        </el-row>
      </div>
    </div>
    <img class="login-img" src = "../../assets/login/login.png"/>
    <div class="login-card" >
      <el-row>
        <el-col :span="20" :offset="2">系统登陆</el-col>
      </el-row>
      <div  @keyup.enter="login">
        <el-row>
          <el-col :span="20" :offset="2">用户名</el-col>
          <el-col :span="20" :offset="2">
            <el-input id="name" v-model="user.userCode" placeholder="请输入帐号"></el-input>
          </el-col>
          <el-col :span="20" :offset="2">密码</el-col>
          <el-col :span="20" :offset="2">
            <el-input id="pwd" v-model="user.password" :show-password="true" placeholder="请输入密码" type="password"></el-input>
          </el-col>
        </el-row>
      </div> 
      <el-row>
        <el-col :span="20" :offset="2">
          <el-button id="login" style="width:100%" type="primary" :disabled="canClick" @click="login" >登录</el-button>
        </el-col>
      </el-row>
    </div> 
  </div> -->
  <div>
    <div style="position:fixed;left:0;top:0;">
      <img class="login-img" src = "../../assets/login/login.png"/>
    </div>
    <div @keyup.enter="login" style="position:fixed;right:15%;top:15%;">
      <div class="login-form">
        <el-row>
          <el-col :span="20" :offset="2">
            <h2 style="color:#248EE9">系统登陆</h2>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="20" :offset="2" style="color:#555555;margin-bottom: 6px;">
            用户名
          </el-col>
          <el-col :span="20" :offset="2">
            <el-input id="name" v-model="user.userCode"></el-input>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="20" :offset="2" style="color:#555555;margin-bottom: 6px;">
            登陆密码
          </el-col>
          <el-col :span="20" :offset="2">
            <el-input id="pwd" v-model="user.password" :show-password="true" type="password"></el-input>
          </el-col>
        </el-row>
        <el-row> 
          <el-col :span="20" :offset="2" style="margin-top:10px">
            <el-button id="login" style="width:100%" type="primary" :disabled="canClick" @click="login" >登录</el-button>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Provide,Prop } from "vue-property-decorator";
import { User } from "@/classes/User";
import { Menu } from "@/classes/Menu";
import qs from 'qs';
import { BIPUtil } from '@/utils/Request';

import { State, Action, Getter, Mutation } from 'vuex-class';
import { LoginState } from '@/store/modules/login/types';
const namespace: string = 'login';
@Component
export default class Login extends Vue {
//   @Provide() user: User = new User("", "", "");

    @Provide() fullscreenLoading:boolean = false;
//   @Provide() menus:Array<Menu> = [];
    @Getter('user', { namespace }) user?: User;
    @Getter('menulist', { namespace }) menus?:Menu[];
    @Mutation('isLogin', { namespace }) setIsLogin: any;
    @Mutation('snkey', { namespace }) setSnkey: any;
    @Mutation('user', { namespace }) setUserInfo: any;
    @Mutation('menulist', { namespace }) setMenusInfo: any;
  // @Prop() isLogin:boolean = false;
  mounted() {
      if(!this.user){
          this.user = new User('','','');
      }
    // this.user.userCode = "";
    // this.user.password = "";
    let ii:string[] = ['1','2']
    console.log(ii instanceof Array);
  }

  login() {
    const loading = this.$loading({
      lock: true,
      text: "登陆中",
      spinner: "el-icon-loading",
      background: "background:'rgba(0, 0, 0, 0.7)'"
    });
    if(!this.user){
        return ;
    }
    BIPUtil.ServApi.login(this.user).then((res:any)=>{
      let data = res.data;
      console.log(data);
      if(data.id === 0){
        // this.menus = data.data.menulist;
        let userI = data.data.user;
        let snkey = data.data.snkey
        userI.password = ''
        // window.sessionStorage.setItem('user', JSON.stringify(userI));
        // window.sessionStorage.setItem('menulist', JSON.stringify(this.menus))
        // window.sessionStorage.setItem('isLogin', JSON.stringify(true))
        // window.sessionStorage.setItem('snkey', JSON.stringify(snkey))
        let ms = data.data.menulist
        this.setIsLogin(true);
        this.setSnkey(snkey);
        this.setUserInfo(userI);
        this.setMenusInfo(ms);
        // this.$store.commit('isLogin',true);
        // this.$store.commit('user',userI);
        // this.$store.commit('menulist',this.menus);
        // this.$store.commit('snkey',snkey);
        // this.$emit("loginok")
        console.log(this.user);
        this.$router.push({path:'/',name:'home'})
        this.$notify.success("登录成功");
      }else{
        this.$notify.error(data.message);
      }
      loading.close();
    }).catch((res:any)=>{
      this.$notify.error('服务没有启动！');
      loading.close();
    });
  }

  get canClick() {
      if(!this.user){
          return false;
      }
    return this.user.userCode === "";
  }  
}
</script>


<style lang="scss">
$--color-primary: #20a0ff;
.login-card {
  width: 420px; 
  position: fixed;
  right:15%;
  top: 20%;
}
.el-row {
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 20px;
  }
}

.el-card__header {
  background-color: $--color-primary;
}
.login-title {
  font-size: 1.6em;
  color: #ffffff;
}
.login-page {  
  width: 100%;
  height: 100%;
}
.login-img{
  top: 45%;
  left: 50%;
  transform: translate(-90%,-50%);
  position: fixed;
}
.login-form{
  min-width: 300px;
  margin: 20px 20px;
  padding: 50px 22px;
  border: 1px solid #f0f0f0;
}
</style>

