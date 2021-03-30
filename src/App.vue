<template >
  <div id="app" v-if="configT">
    <template v-if="!isLogin"> 
        <template v-if="isLoginPage == 0">
            <portal></portal>
        </template>
        <template v-else-if="isLoginPage == 2">
            <analysis></analysis>
        </template>
        <template v-else>
            <router-view />
        </template>
    </template>
    <template v-else>
        <template v-if="isOtherPage">
            <router-view />
        </template>
        <template v-else>
            <el-container> 
                <bip-aside v-show="isOpenMenu" ref="menu" :class="isOpenMenu?menu1:menu2"></bip-aside> 
                <el-container>
                    <el-header style="background-color:#20a0ff;height:50px"> 
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
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Provide, Watch } from "vue-property-decorator";
import Login from "@/views/login/Login.vue";
import Portal from "@/views/login/Portal.vue";
import Analysis from "@/custom/bip-erp/analysis.vue";
import airSuperBI from "@/custom/air-super/airSuperBI.vue";
import BipAside from "@/views/app/BipAside.vue";
import LayOut from "@/views/app/LayOut.vue";
import LayHeader from "@/views/app/LayHeader.vue";
import { Route, RawLocation } from "vue-router";
import { BipTag } from "./classes/BipTag";
import { Menu } from "@/classes/Menu";
import { User } from '@/classes/User';
import { BaseVariable } from "@/utils/BaseICL";
import { BIPUtils } from "@/utils/BaseUtil";
let baseTool = BIPUtils.baseUtil;
import { State, Action, Getter, Mutation } from 'vuex-class';
import { LoginState } from './store/modules/login/types';
import { BIPUtil } from "@/utils/Request";
@Component({
  components: {
    Login,
    Portal,
    BipAside,
    LayOut,
    LayHeader,
    Analysis,
    airSuperBI
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
    @Provide() isLoginPage:number = -1;
    @Provide() query:any=null;
    @Provide() configT:boolean = false;
    @State('login') profile!: LoginState
    @Getter('isLogin', { namespace: 'login' }) isLogin!: boolean;
    @Getter('isOpenMenu', { namespace: 'login' }) isOpenMenu!: boolean;
    @Getter('menulist', { namespace: 'login' }) menusList!: Menu[] ;
    @Getter('user', { namespace: 'login' }) user?: User;
    @State('bipComHeight', { namespace: 'login' }) height!: number;
    @Mutation('isLogin', { namespace:'login' }) setIsLogin: any;
    @Mutation("user", { namespace:'login' }) setUserInfo: any;
    @Mutation('setIsOpenMenu', { namespace:'login' }) setIsOpenMenu: any;
    @Provide() style:string="height:"+(this.height?this.height:'400')+"px";
    @Provide('isNoHomeTable') isNoHomeTable:boolean = true;
    isOtherPage:boolean = true;
    otherPagehangeBusID:any = null;
    async created(){
        await this.$axios.get('./static/config.json').then((res:any) => { 
            this.$axios.defaults.baseURL = res.data.ApiUrl; 
            let url = res.data.ApiUrl;
            if(url.lastIndexOf("/") == url.length-1){
                url = url.substring(0,url.length-1);
            }
            BaseVariable.BaseUri = url; 
            BaseVariable.COMM_FLD_VALUE_DBID = res.data.dbid; 
            BaseVariable.MQTT_SERVICE = res.data.MQTT_SERVICE;
            BaseVariable.MQTT_USERNAME = res.data.MQTT_USERNAME;
            BaseVariable.MQTT_PASSWORD = res.data.MQTT_PASSWORD;
            BaseVariable.MQTT_HOST = res.data.MQTT_HOST;
            BaseVariable.Project_Name = res.data.Project_Name;
            BaseVariable.COPYRIGHT = res.data.COPYRIGHT;
            BaseVariable.SMSURL = res.data.SMSURL;
            BaseVariable.ITEMTYPE = res.data.ITEMTYPE;
            
        }).catch((err:any) => {
            console.log(err)
            window.location.reload()
        }) 
        this.configT=true;
    }
    async mounted() {
        await this.$axios.get('./static/config.json').then((res:any) => { 
            this.$axios.defaults.baseURL = res.data.ApiUrl; 
            let url = res.data.ApiUrl;
            if(url.lastIndexOf("/") == url.length-1){
                url = url.substring(0,url.length-1);
            }
            BaseVariable.BaseUri = url; 
            BaseVariable.COMM_FLD_VALUE_DBID = res.data.dbid; 
            BaseVariable.MQTT_SERVICE = res.data.MQTT_SERVICE;
            BaseVariable.MQTT_USERNAME = res.data.MQTT_USERNAME;
            BaseVariable.MQTT_PASSWORD = res.data.MQTT_PASSWORD;
            BaseVariable.MQTT_HOST = res.data.MQTT_HOST;
            BaseVariable.Project_Name = res.data.Project_Name;
            BaseVariable.COPYRIGHT = res.data.COPYRIGHT;
            BaseVariable.SMSURL = res.data.SMSURL;
            BaseVariable.ITEMTYPE = res.data.ITEMTYPE;
        }).catch((err:any) => {
            console.log(err)
            window.location.reload()
        })
        this.$bus.$off('otherPagehange',this.otherPagehangeBusID);
        this.otherPagehangeBusID = this.$bus.$on('otherPagehange',this.isOtherPageChange)
        if(this.height){
            this.style = "height:"+(this.height)+"px";
        }
        if(this.isLogin){
            if(this.isOtherPage){
                 this.$router.push({ path: "/report",name:'Report' }); 
            }else{
                this.$router.push({ path: "/" }); 
                if(this.editableTabs2.length==0){
                    this.addIndex();
                } 
            }
             
        }else{
            this.isLoginPage = -1;
            if (this.$route.query) {
                this.query = this.$route.query;
                if(this.query.isLoginPage){
                    this.isLoginPage = parseInt(this.query.isLoginPage+'');
                }
                if(BaseVariable.ITEMTYPE == 'bip-flexible'){
                    this.isLoginPage = 0;
                }
                if(BaseVariable.ITEMTYPE == 'bip-erp-bi'){
                    this.isLoginPage = 2;
                }
                if(this.isLoginPage == -1){
                    this.$router.push({
                        path:'/wlogin',
                        name:'wlogin',
                    })
                    return;
                }
            } else{
                this.$router.push({ path: "/" });
            }
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
    async loginOut(){
        if(this.user!=null)
            await BIPUtil.ServApi.loginOut(this.user);
        this.editableTabs2=[];
        this.setIsLogin(false);
        sessionStorage.clear(); 
        this.isLoginPage = -1
    } 
    @Watch('isLogin')
    logined(){ 
        // console.log('islogin change');
        if(this.isLogin){ 
            if(this.editableTabs2.length==0)
                this.addIndex();
        }else{
            this.editableTabs2=[];
            if (this.$route.query) {
                this.query = this.$route.query;
                if(this.query.isLoginPage){
                    this.isLoginPage = parseInt(this.query.isLoginPage+'');
                }
                if(BaseVariable.ITEMTYPE == 'bip-flexible'){
                    this.isLoginPage = 0;
                }
                if(BaseVariable.ITEMTYPE == 'bip-erp-bi'){
                    this.isLoginPage = 2;
                }
                if(this.isLoginPage == -1){
                    this.$router.push({
                        path:'/wlogin',
                        name:'wlogin',
                    })
                    return;
                }
            } else{
                this.$router.push({ path: "/" });
            }
        }
    } 

    @Watch("editableTabs2")
    tabsCange(){
        if(this.editableTabs2.length==0)
            this.addIndex();
    }
    @Watch("$route")
    routerChange(to: Route, from: Route) {
        if(this.$route.name == "registered"){
            this.isLoginPage = 1;
            return;
        }
        if (to.name === "wlogin") {
            this.isLoginPage = -1;
            this.setIsLogin(false);
            return;
        }
        if (to.name === 'index') {
            this.$bus.$emit('componentsizechange','')
            this.editableTabsValue2 = 'index';
        }
        if(to.fullPath ==='layout?undefined'){
            return
        }
        if (to.name === 'layout') {
            if (this.menusList.length > 0) { 
                let me:any = baseTool.findMenu(to.query.pmenuid+''); 
                // console.log(me)
                let menu:Menu = me;
                let currTag = this.editableTabs2.filter(
                tab => 
                    tab.name == menu.menuId
                )[0];
                // console.log(currTag)
                if (!currTag) {
                    let strName = menu.menuName;//.substring(0,6)
                    let tag = new BipTag(menu.menuId, strName, to.fullPath, true, menu.menuName);
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
        }else{
            if(to.name == 'airSuperBI' || to.name =="Report"){
                this.isOtherPage = true;
                return;
            }
            if(to.fullPath != '/'){
                // if(this.isLogin)
                // {
                //     if(this.editableTabs2.length==0){
                //         this.addIndex();
                //         return ;
                //     }
                // }
                if (this.menusList.length > 0) { 
                    let me:any = baseTool.findMenu(to.query.pmenuid+''); 
                    console.log(me)
                    let menu:Menu = me;
                    if(!me)
                        return;
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
            }
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
        console.log(this.style)
    }
    isOtherPageChange(val:any) {
        this.isOtherPage = val;
        console.log('值改变。。。')
        if(!this.isOtherPage){
            setTimeout(()=>{
                if(this.editableTabs2.length==0){
                    this.addIndex();
                }
                this.$router.push({
                path:'/index',
                name:'Home',
            })
        },200);
        }

    }
}
</script>