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
        <template v-if="initOk">
            <template v-if="isOtherePage">
                <div class="yw-sys" @click="gotoIndex">业务系统</div>
                <router-view />
            </template>
            <template v-else>
                <el-container>
                    <el-header class="my-el-header"> 
                        <lay-header :isLogin="isLogin" @loginOut="loginOut"></lay-header>
                    </el-header>
                    <el-container> 
                        <bip-menu></bip-menu>
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
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Provide, Watch } from "vue-property-decorator";
import Login from "@/views/login/Login.vue";
import Portal from "@/views/login/Portal.vue";
import Analysis from "@/custom/bip-erp/analysis.vue";
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
import BipMenu from "@/components/menu/BipMenu.vue";
@Component({
  components: {
    Login,
    Portal,
    BipAside,
    LayOut,
    LayHeader,
    Analysis,
    BipMenu,
  }
})
export default class App extends Vue {
    name: string = "app";
    editableTabsValue2: string = "1";
    editableTabs2: BipTag[] = [];
    tabIndex: any = 1;
    dialogVisible = false;
    menu1:string = "menu menu1";
    menu2:string = "menu menu2";
    isLoginPage:number = -1;
    query:any=null;
    configT:boolean = false;//配置文件是否加载完毕
    initOk:boolean = false;//初始化数据是否加载完毕
    @State('login') profile!: LoginState
    @Getter('isLogin', { namespace: 'login' }) isLogin!: boolean;
    @Getter('isOpenMenu', { namespace: 'login' }) isOpenMenu!: boolean;
    @Getter('menulist', { namespace: 'login' }) menusList!: Menu[] ;
    @Getter('user', { namespace: 'login' }) user?: User;
    @State('bipComHeight', { namespace: 'login' }) height!: number;
    @Mutation('isLogin', { namespace:'login' }) setIsLogin: any;
    @Mutation("user", { namespace:'login' }) setUserInfo: any;
    @Mutation('setIsOpenMenu', { namespace:'login' }) setIsOpenMenu: any;

    @Getter('isOtherePage', { namespace: 'login' }) isOtherePage!: boolean;
    @Mutation('isOtherePage', { namespace:'login' }) setIsOtherePage: any;

    style:string="height:"+(this.height?this.height:'400')+"px";
    @Provide('isNoHomeTable') isNoHomeTable:boolean = true;
    otherPage:any=["airSuperBI","Report","ItemAnalysis"];//单独展示页面,不在UI框架内的页面
    noLoginPage:any=["wOauthToken"];//不需要登陆展示的页面
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
            BaseVariable.AouthTokenUrl = res.data.AouthTokenUrl;
            BaseVariable.UniteLoginUrl = res.data.UniteLoginUrl;
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
            BaseVariable.AouthTokenUrl = res.data.AouthTokenUrl;
            BaseVariable.UniteLoginUrl = res.data.UniteLoginUrl;
        }).catch((err:any) => {
            console.log(err)
            window.location.reload()
        })
        if(this.height){
            this.style = "height:"+(this.height)+"px";
        }
        if(this.isLogin){
            this.editableTabs2 = [];
            if(this.editableTabs2.length==0){
                this.addIndex();
            }
        }else{
            this.isLoginPage = -1;
            if(this.$route.name == null && this.$route.path !='/'){
                this.$router.push({
                    path:'/wlogin',
                    name:'wlogin',
                })
                return;
            }
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
        this.initOk = false;
    } 
    gotoIndex(){
        this.setIsOtherePage(false)
        this.$router.push({
            path:'/',
            name:"Home",
        })
    }
    @Watch('isLogin')
    logined(){ 
        // console.log('islogin change');
        if(this.isLogin){ 
            // if(this.editableTabs2.length==0)
            //     this.addIndex();
        }else{
            this.initOk = false;
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
                }
            } else{
                this.$router.push({
                    path:'/wlogin',
                    name:'wlogin',
                })
            }
        }
    }
    @Watch("$route")
    routerChange(to: Route, from: Route) {
        if(this.noLoginPage.indexOf(to.name) !=-1){//登陆前显示的页面
            return;
        }
        if(!this.isLogin && to.name != "wlogin"){
            this.$router.push({
                path:'/wlogin',
                name:'wlogin',
            })
            return;
        }
        this.initOk = true;
        if(this.$route.name == "registered"){
            this.isLoginPage = 1;
            return;
        }
        if (to.name === "wlogin") {
            this.isLoginPage = -1;
            this.setIsLogin(false);
            return;
        }
        if (to.name === 'index' || to.name === 'Home') {
            this.$bus.$emit('componentsizechange','')
            this.editableTabsValue2 = 'index';
            if(this.editableTabs2.length==0)
                this.addIndex();
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
            if(this.otherPage.indexOf(to.name) !=-1){//其他页面不在UI框架内的页面
                this.editableTabs2 = [];
                this.setIsOtherePage(true)
                return;
            }
            if(to.fullPath != '/'){
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
}
</script>
<style scoped lang="scss">
.yw-sys{
    position: absolute;
    right: 0.2rem;
    top: 0;
    height: .625rem;
    line-height: .625rem;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.25rem;
    z-index: 999;
}
.my-el-header{
    @include head_all_style();
}
#app{
    @include overall_bg_color();
}
</style>