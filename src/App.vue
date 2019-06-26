<template >
  <div id="app">
    <template v-if="!isLogin">
      <login></login>
    </template>
    <template v-else>
      <el-container>
        <bip-aside></bip-aside>
        <el-container>
          <el-header style="background-color:#20a0ff">Header=={{user.userName}}</el-header>
          <el-main class="bip-main">
            <!-- <el-button @click="addTab(editableTabsValue2)">添加Tab</el-button> -->
            <el-tabs
              v-model="editableTabsValue2"
              type="card"
              :closable="false"
              @tab-remove="removeTab"
              class="bip-tabs"
            >
              <el-tab-pane
                v-for="(item) in editableTabs2"
                :key="item.name"
                :label="item.title"
                :name="item.name"
                :closable="item.closable"
                :lazy="true"
              >
                
                <lay-out :name="item.name" :bshow="item.name === editableTabsValue2">
                    
                </lay-out>
                <!-- <router-view/> -->
              </el-tab-pane>
            </el-tabs>
            <!-- <router-view /> -->
          </el-main>
        </el-container>
      </el-container>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Provide, Watch } from "vue-property-decorator";
import Login from "@/views/login/Login.vue";
import BipAside from "@/views/app/BipAside.vue";
import LayOut from "@/views/app/LayOut.vue";
import { Route, RawLocation } from "vue-router";
import { BipTag } from "./classes/BipTag";
import { Menu } from "@/classes/Menu";
import router from "@/router";
import { User } from '@/classes/User';

import { State, Action, Getter, Mutation } from 'vuex-class';
import { ProfileState } from './store/modules/profile/types';
import { LoginState } from './store/modules/login/types';
import { AxiosPromise } from 'axios'
const namespace: string = 'login';
@Component({
  components: {
    Login,
    BipAside,
    LayOut
  }
})
export default class App extends Vue {
  name: string = "app";
  @Provide() editableTabsValue2: string = "1";
  @Provide() editableTabs2: BipTag[] = [];
  @Provide() tabIndex: any = 1;
  private menusList: Menu[] = [];


  @State('login') profile!: LoginState
   // MapGetter
//   @Getter('firstName', { namespace:'profile' }) firstName?: string;
  @Getter('isLogin', { namespace: 'login' }) isLogin?: boolean;
  @Getter('user', { namespace: 'login' }) user?: User;
//   @Getter('lastName', { namespace }) lastName?: string;
//   @Action('fetchName', { namespace:'profile' }) fetchName?: any;
  @Mutation('isLogin', { namespace:'login' }) setIsLogin: any;
  async mounted() {
    if(this.isLogin){
        this.$router.push({ path: "/" });
        this.menusList = JSON.parse(window.sessionStorage.getItem("menulist") + "");
        if (this.menusList == null) {
            this.menusList = [];
        }
        if(this.editableTabs2.length==0){
            this.addIndex();
        }

    }else{
        this.$router.push({ path: "/login" });
    }
  }
  updated() {
    if (this.menusList == null || this.menusList.length == 0) {
      this.menusList = JSON.parse(
        window.sessionStorage.getItem("menulist") + ""
      );
      if (this.menusList == null) {
        this.menusList = [];
      }
    }

  }
  loginOK() {
    // this.isLogin = true;
    // if(this.editableTabs2.length==0){
    //     this.addIndex();
    // }
  }
  addIndex() {
    let tag = new BipTag("index", "首页", "/", false);
    this.editableTabs2.push(tag);
    this.editableTabsValue2 = "index";
  }
  removeTab(targetName: any) {
    let tabs = this.editableTabs2;
    let activeName = this.editableTabsValue2;
    if (activeName === targetName) {
        tabs.forEach((tab, index) => {
            if (tab.name === targetName) {
                let nextTab = tabs[index + 1] || tabs[index - 1];
                if (nextTab) {
                        activeName = nextTab.name;
                        this.$router.push({ path: nextTab.path });
                }
            }
        });
    }
    this.editableTabsValue2 = activeName;
    this.editableTabs2 = tabs.filter(tab => tab.name !== targetName);
  }

  @Watch('isLogin')
  logined(){
      console.log('islogin change');
      if(this.isLogin){
          if(this.editableTabs2.length==0)
            this.addIndex();
      }
  }

  @Watch('profile.isLogin')
  entityChange(){
      console.log('pro change');
  }

  @Watch("$route")
  routerChange(to: Route, from: Route) {
    if (to.name === "login") {
      this.setIsLogin(false);
      return;
    }
    // console.log(to,from)
    if (to.name === 'index') {
        this.editableTabsValue2 = 'index';
    }
    if(to.fullPath ==='layout?undefined'){
      return
    }
    if (to.name === 'layout') {
      if (this.menusList.length > 0) {
        // let menu = this.menusList.filter(
        // //   menu => menu.menuId === to.query.pmenuid
        // menu => this.findMenuById(to.query.pmenuid+'',menu)
        // )[0];
        let me:any 
        for(let i = 0;i<this.menusList.length;i++){
            let m1 = this.findMenuById(to.query.pmenuid+'',this.menusList[i])
            if(m1!=null){
                me = m1
                break ;
            }
        }
        console.log(me)
        let menu:Menu = me;
        let currTag = this.editableTabs2.filter(
          tab => 
            tab.name == menu.menuId
        )[0];
        console.log(currTag)
        if (!currTag) {
          let tag = new BipTag(menu.menuId, menu.menuName, to.fullPath, true);
          this.editableTabs2.push(tag);
          this.editableTabsValue2 = menu.menuId;
        } else {
          this.editableTabsValue2 = menu.menuId;
        }
      }
    }
  }

    findMenuById(menuId:string,menu:Menu):any{
        if(menu.menuId==menuId){
            return menu
        }else{
            if(menu.haveChild){
                for(let i = 0;i<menu.childMenu.length;i++){
                    let m1 = this.findMenuById(menuId,menu.childMenu[i])
                    if(m1!=null){
                        return m1;
                    }
                }
            }
            return null;
        }
    }

  @Watch("editableTabsValue2")
  currTagChange() {
    let currTag = this.editableTabs2.filter(tab => tab.name === this.editableTabsValue2)[0];
    if(this.$route.path !== currTag.path){
        this.$router.push({ path: currTag.path });
    }
  }
}
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  display: block;
  margin: 0px;
}
.bip-main {
  padding-left: 10px;
  padding-top: 0px !important;
  margin-top: 2px !important;
}
.el-tabs__item {
    padding: 0 20px;
    height: 30px !important;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    line-height: 30px !important;
    display: inline-block;
    list-style: none;
    font-size: 14px;
    font-weight: 500;
    color: #303133;
    position: relative;
}
.bip-tabs .el-tabs__header{
    padding: 0;
    position: relative;
    margin: 0 0 5px;
}
</style>
