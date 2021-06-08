<template>
  <el-row>
    <div class="bip-home-container">
      <template>
        <div class="main-title">
          <el-row>
            <el-col :span="20">
                <i class="iconfont icon-bip-menu"></i>
                {{sname}}
            </el-col>
            <el-col :span="4" class="main-title-icon">
                <i v-if="isLogin" class="el-icon-edit pointer" @click="addNewMenu"></i>  
            </el-col>
          </el-row>
        </div>
        <el-scrollbar wrap-class="scrollbar-wrapper">
            <el-row :gutter="10">
                <template v-if="menuList.length>0" >
                    <el-col v-for="(item,index) in menuList" :key="index" style="width:120px;padding:10px 0">
                        <el-badge :value="item.bgnum" class="bg_item" :max="99">
                            <el-row >
                                <el-col :span="24" class="imgcol">
                                    <img class="img pointer" :src="uri+item.menuIcon" @click="menuClick(item.menuId,item.command)"/>
                                </el-col>
                                <el-col :span="24" class="imgcol pointer">
                                    <template v-if="item.menuName.length>7">
                                        <el-tooltip effect="dark" :content="item.menuName" placement="top">
                                            <span class="menuname"  @click="menuClick(item.menuId,item.command)" >{{item.menuName.substring(0,6)}}…</span>
                                        </el-tooltip>
                                    </template>
                                    <template v-else>
                                        <span class="menuname"  @click="menuClick(item.menuId,item.command)" >
                                            {{item.menuName}}
                                        </span>
                                    </template>
                                </el-col>
                            </el-row>
                        </el-badge>
                    </el-col>
                </template>
            </el-row>
        </el-scrollbar>
      </template>
    </div>
    <el-dialog title="菜单选择"  class="bipinsaid" :visible.sync="showMenuList" width="50%"  :append-to-body="true" >
        <el-transfer :titles="['可选菜单', '已选菜单']" v-model="selection" :props="{key: 'menuId',label: 'menuName'}" 
        :data="optionalMenu" filterable style="margin: 20px 0px 5px 26px;" @change="selectionChange">
        </el-transfer>
        <hr/>
        <span slot="footer" class="dialog-footer">
            <el-button @click="showMenuList = false" size="small">取 消</el-button>
            <el-button type="primary" @click="selectionSelectOK" size="small">确 定</el-button>
        </span>
    </el-dialog>
  </el-row>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from "vuex-class";
import { Menu } from "@/classes/Menu";
import { BIPUtils } from "@/utils/BaseUtil";
let baseTool = BIPUtils.baseUtil;
import {BaseVariable} from "@/utils/BaseICL"
import { BIPUtil } from "@/utils/Request";
@Component({
  components: {}
})
export default class HomeMenu extends Vue {
   @Prop() cont!:string;
    @Prop() rech!:string;
    @Getter('isLogin', { namespace: 'login' }) isLogin!: boolean;
    @Getter('menulist', { namespace: 'login' }) menusList!: Menu[] ;
    menuList:Array<any> = new Array<any>();
    showMenuList:boolean = false;
    selection:Array<any> = new Array<any>();
    optionalMenu:Array<any> = new Array<any>();
    uri:string = '';
    sname:any = "快捷菜单";
    created(){
        this.uri = BaseVariable.BaseUri+'/'
    }
    mounted() {   
        this.init();
    }
    async init(){
        this.selection=[];
        this.menuList = [];
        if(this.cont){
            let cc = JSON.parse(this.cont);
            this.sname = cc.sname
            let menus:Array<any> = cc.menuid.split(";");
            for(var i=0;i<this.menusList.length;i++){
                for(var z=0;z<menus.length;z++){
                    let item = menus[z];
                    let menu = baseTool.findMenuById(item,this.menusList[i]);
                    if(menu){
                        let lid = "BG."+menu.menuId
                        let res = await BIPUtil.ServApi.getBipLongTextData(lid,undefined);
                        let bgnum = undefined;
                        if(res.data.code ==200){
                            bgnum = res.data.data.bgnum;
                        }
                        menu.bgnum = bgnum;
                        this.menuList.push(menu);
                        this.selection.push(menu.menuId)
                    }
                };
            }
        }
        this.optionalMenu = [];
        this.menusList.forEach(item => {
            this.findLastMenu(item);            
        });
    }
    /**
     * 查询最后一个节点的菜单
     */
    findLastMenu(menu:any):any{ 
        if(menu.haveChild){
            for(let i = 0;i<menu.childMenu.length;i++){
                let m1 = this.findLastMenu(menu.childMenu[i])
                if(m1!=null){
                    let m ={menuId:m1.menuId,menuName:m1.menuName};
                    if(m1.menuattr != 4)
                    this.optionalMenu.push(m);
                }
            }
        }else{
            let m ={menuId:menu.menuId,menuName:menu.menuName};
            if(menu.menuattr != 4)
            this.optionalMenu.push(m);
        } 
    }
    addNewMenu(){
        if(!this.isLogin){
            this.$router.push({
                path:'/wlogin',
                name:'wlogin',
            })
            return;
        }
        this.showMenuList = true
    }
    /**
     * 菜单点击
     */
    menuClick(menuid:string,command:string){
        if(!this.isLogin){
            this.$router.push({
                path:'/wlogin',
                name:'wlogin',
            })
            return;
        }
        let menu = baseTool.findMenu(menuid);
        if(menu ==  null){
            this.$notify.error("没有菜单"+menuid+"操作权限！");
            return;
        }
        if(command.indexOf("pmenu=") !=-1){
            command = command.split("&")[0].split("=")[1];
            command = "/"+command;
            this.$router.push({
                path:command,
                name:command,
                query: {pmenuid:menu.menuId},
            })
        }else{ 
            command = command.split("&")[0].split("=")[1];
            this.$router.push({
                path:'/layout',
                name:'layout',
                query: {pbuid:command,pmenuid:menu.menuId},
            })
        }
    }
    /**
     * 添加新的自定义菜单
     */
    selectionSelectOK(){
        this.$emit("menuChange",this.selection);
        this.showMenuList = false;
    }
    /**
     * 
     */
    selectionChange(option:any){
        // if(option.length>8){
        //     this.selection.splice(8,this.selection.length-8)
        //     this.$notify.warning("最多可设置8个快捷菜单！");
        // }
    }
    @Watch("cont")
    contChange(){
        this.init();
    }
}
</script>
<style lang="scss">
    .bg_item{
        .el-badge__content.is-fixed{
            right: 30px;
        }
    }
</style>
<style lang="scss" scoped>
    .img{
        width: 50px;
        height: 50px;
        // border-radius: 50%;//2019年10月20日11:06:29 ch注
    }
    .imgcol{
        text-align: center;
    }
    .pointer{
        cursor:pointer;
    }
    .insertMenu{
        font-size: 50px;
    }
    .menuname {
        font-size: 14px;
    }
    .bip-home-container {
        // border: 1px solid #dedede;
        background-color: #ffffff;
        border-radius: 6px;
        position: fixed;
        height: calc(100%)  !important;
        z-index: 1;
        overflow: hidden;
        width: calc(100%) !important;
        color: #868D94;
        box-shadow: 1px 2px 10px #dde2e4;
        .el-scrollbar {
            height: 90%;
            margin-bottom: 10px !important;
            margin-right: 0px !important;
            .el-scrollbar__wrap {
            overflow-x: hidden !important;
            padding-right: 5px;
            height: 100%;
            }
            .scrollbar-wrapper {
            overflow-x: hidden !important;
            }
        }
    }

    .main-title {
        border-bottom: 2px solid #efefef;
        height: 40px;
        line-height: 40px;
        font-size: 14px;
        padding: 0 10px;
        color: #4A77FA;
        letter-spacing: 1px;
        font-weight: 600;
        margin-bottom: 8px;
    }
    .title {
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        letter-spacing: 0.8px;
        color: #333333;
    }
    .main-title-icon {
        font-size: 20px;
        text-align: right;
    } 
</style>