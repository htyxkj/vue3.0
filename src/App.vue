<template >
  <div id="app">
    <template v-if="!isLogin">
      <login></login>
    </template>
    <template v-else>
      <el-container> 
        <bip-aside v-show="isOpenMenu" ref="menu" :class="isOpenMenu?menu1:menu2"></bip-aside> 
        <el-container>
            <el-header style="background-color:#20a0ff;"> 
                <lay-header :isLogin="isLogin" @loginOut="loginOut"></lay-header>
            </el-header>
            <el-main class="bip-main">
                <el-tabs
                v-model="editableTabsValue2"
                type="border-card"
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
                    :style="style"
                >    
                    <lay-out :name="item.name" :bshow="item.name === editableTabsValue2">     
                    </lay-out>
                </el-tab-pane>
                </el-tabs>
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
import LayHeader from "@/views/app/LayHeader.vue";
import { Route, RawLocation } from "vue-router";
import { BipTag } from "./classes/BipTag";
import { Menu } from "@/classes/Menu";
import router from "@/router";
import { User } from '@/classes/User';
import { BaseVariable } from "@/utils/BaseICL";

import { State, Action, Getter, Mutation } from 'vuex-class';
import { LoginState } from './store/modules/login/types';
import { AxiosPromise } from 'axios'
const namespace: string = 'login'; 

@Component({
  components: {
    Login,
    BipAside,
    LayOut,
    LayHeader
  }
})
export default class App extends Vue {
    name: string = "app";
    @Provide() editableTabsValue2: string = "1";
    @Provide() editableTabs2: BipTag[] = [];
    @Provide() tabIndex: any = 1;
    @Provide() dialogVisible = false;
    @Provide() menu1:string = "menu menu1";
    @Provide() menu2:string = "menu menu2";
    @State('login') profile!: LoginState
    @Getter('isLogin', { namespace: 'login' }) isLogin!: boolean;
    @Getter('isOpenMenu', { namespace: 'login' }) isOpenMenu!: boolean;
    @Getter('menulist', { namespace: 'login' }) menusList!: Menu[] ;
    @Getter('user', { namespace: 'login' }) user?: User;
    @Getter('bipHeight', { namespace: 'login' }) height!: number;
    @Mutation('isLogin', { namespace:'login' }) setIsLogin: any;
    @Mutation('setIsOpenMenu', { namespace:'login' }) setIsOpenMenu: any;
    @Provide() style:string="height:400px";
    // @Provide() height:number = 400;
    async mounted() {
        // console.log('321321')
        await this.$axios.get('./static/config.json').then((res:any) => { 
            this.$axios.defaults.baseURL = res.data.ApiUrl; 
            BaseVariable.BaseUri = res.data.ApiUrl; 
            BaseVariable.COMM_FLD_VALUE_DBID = res.data.dbid; 
            BaseVariable.MQTT_SERVICE = res.data.MQTT_SERVICE;
            BaseVariable.MQTT_USERNAME = res.data.MQTT_USERNAME;
            BaseVariable.MQTT_PASSWORD = res.data.MQTT_PASSWORD;
            BaseVariable.MQTT_HOST = res.data.MQTT_HOST;
        }).catch((err:any) => {
            console.log(err)
        }) 

        // this.height = document.documentElement.clientHeight
        // console.log('style',this.height)
        // if(this.height>70){
        //     this.height=this.height-104;
        // }
        // this.style= "height:"+this.height+"px";

        if(this.isLogin){
            this.$router.push({ path: "/" }); 
            if(this.editableTabs2.length==0){
                this.addIndex();
            }  
        }else{
            this.$router.push({ path: "/" });
        }
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
    loginOut(){
        this.editableTabs2=[];
        this.$router.push({ path: "/" });
        this.setIsLogin(false);
        sessionStorage.clear(); 
    } 
    @Watch('isLogin')
    logined(){ 
        // console.log('islogin change');
        if(this.isLogin){ 
            if(this.editableTabs2.length==0)
                this.addIndex();
        }else{
            this.editableTabs2=[];
        }
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
                let me:any
                for(let i = 0;i<this.menusList.length;i++){
                    let m1 = this.findMenuById(to.query.pmenuid+'',this.menusList[i])
                    if(m1!=null){
                        me = m1
                        break ;
                    }
                }
                // console.log(me)
                let menu:Menu = me;
                let currTag = this.editableTabs2.filter(
                tab => 
                    tab.name == menu.menuId
                )[0];
                // console.log(currTag)
                if (!currTag) {
                    let tag = new BipTag(menu.menuId, menu.menuName, to.fullPath, true);
                    this.editableTabs2.push(tag);
                    this.editableTabsValue2 = menu.menuId;
                } else {
                    this.editableTabsValue2 = menu.menuId;
                }
            }
        }else if(to.name === 'myTask' ){
            let currTag = this.editableTabs2.filter(
            tab => 
                tab.name == 'myTask'
            )[0]; 
            if (!currTag) {
                let tag = new BipTag('myTask', '我的任务', to.fullPath, true);
                this.editableTabs2.push(tag);
                this.editableTabsValue2 = 'myTask';
            } else {
                this.editableTabsValue2 = 'myTask';
            }
        }else if(to.name === 'myMsg' ){
            let currTag = this.editableTabs2.filter(
            tab => 
                tab.name == 'myMsg'
            )[0]; 
            if (!currTag) {
                let tag = new BipTag('myMsg', '我的消息', to.fullPath, true);
                this.editableTabs2.push(tag);
                this.editableTabsValue2 = 'myMsg';
            } else {
                this.editableTabsValue2 = 'myMsg';
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

    @Watch('height')
    heightChange(){
        this.style= "height:"+this.height+"px";
    }

}
</script>