<template>
    <el-row>
         <div class="bip-home-container">
            <el-scrollbar wrap-class="scrollbar-wrapper">
             <div class="main-title">
                <el-row>
                    <el-col :span="20">
                        <i class="iconfont icon-bip-menu"></i>
                        快捷菜单
                    </el-col>
                    <el-col :span="4" class="main-title-icon"  >
                        <i class="el-icon-edit pointer" @click="showMenuList = true"></i>  
                    </el-col>
                </el-row>
             </div>
                <el-row :gutter="10">
                    <template v-if="menuList.length>0" >
                        <el-col v-for="(item,index) in menuList" :key="index" style="width:120px;padding:10px 0">
                            <el-row >
                                <el-col :span="24" class="imgcol">
                                    <img class="img pointer" src="../../assets/48.jpg" @click="menuClick(item.menuId,item.command)"/>
                                </el-col>
                                <el-col :span="24" class="imgcol pointer">
                                    <span @click="menuClick(item.menuId,item.command)" class="menuname">
                                        {{item.menuName}}
                                    </span>
                                </el-col>
                            </el-row>
                        </el-col>
                    </template>
                    <!-- <el-col style="width:120px;padding-top:5px">
                        <el-row >
                            <el-col :span="24" class="imgcol">
                                <i class=" iconfont icon-bip-xinjian2 insertMenu" @click="showMenuList = true"></i>
                            </el-col> 
                            <el-col :span="24" class="imgcol pointer">
                                &nbsp;
                            </el-col>
                        </el-row>
                    </el-col>  -->
                </el-row>
                <el-dialog title="菜单选择"  class="bipinsaid" :visible.sync="showMenuList" width="40%"  :append-to-body="true" >
                    <el-transfer :titles="['可选菜单', '已选菜单']" v-model="selection" :props="{key: 'menuId',label: 'menuName'}" 
                    :data="optionalMenu" filterable style="margin: 20px 0px 5px 26px;" @change="selectionChange">
                    </el-transfer>
                    <span slot="footer" class="dialog-footer">
                        <el-button @click="showMenuList = false">取 消</el-button>
                        <el-button type="primary" @click="selectionSelectOK">确 定</el-button>
                    </span>
                </el-dialog>
            </el-scrollbar>
         </div>
    </el-row>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from "vuex-class";
import { Menu } from "@/classes/Menu";
import { BIPUtils } from "@/utils/BaseUtil";
let baseTool = BIPUtils.baseUtil;
@Component({
    components:{}
})
export default class HomeMenu extends Vue { 
    @Prop() cont!:string;
    @Prop() rech!:string;
    @Getter('menulist', { namespace: 'login' }) menusList!: Menu[] ;
    @Provide() menuList:Array<any> = new Array<any>();
    @Provide() showMenuList:boolean = false;
    @Provide() selection:Array<any> = new Array<any>();
    @Provide() optionalMenu:Array<any> = new Array<any>();
    mounted() {   
        this.init();
    }
    async init(){
        this.selection=[];
        this.menuList = [];
        if(this.cont){
            let cc = JSON.parse(this.cont);
            let menu:any = cc.menuid.split(";");
            for(var i=0;i<this.menusList.length;i++){
                menu.forEach( (item:any) => {
                    let menu = baseTool.findMenuById(item,this.menusList[i]);
                    if(menu){
                        this.menuList.push(menu);
                        this.selection.push(menu.menuId)
                    }
                });
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
    /**
     * 菜单点击
     */
    menuClick(menuid:string,command:string){
        let menu = baseTool.findMenu(menuid);
        if(menu ==  null){
            this.$notify.error("没有菜单"+menuid+"操作权限！");
            return;
        }
        "pbuid=C107&pmenuid=C107"
        command = command.split("&")[0].split("=")[1];
        this.$router.push({
            path:'/layout',
            name:'layout',
            query: {pbuid:command,pmenuid:menu.menuId},
        })
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
<style lang="scss" scoped>
    .img{
        width: 50px;
        height: 50px;
        border-radius: 50%;
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
        border:  1px solid #dedede;
        background-color: #ffffff;
        position: fixed; 
        height: 95% !important;
        z-index: 1;
        overflow: hidden;  
        width: calc(100% - 3px) !important;
        .el-scrollbar {
            height: 100%;
            margin-bottom: 10px !important;
            margin-right: 0px !important; 
            .el-scrollbar__wrap {
                overflow-x: hidden !important;
                padding-right: 5px;
                height: 100%;
            }
            .scrollbar-wrapper{
            overflow-x: hidden !important;
            }
        }
    }
    .main-title{
        border-bottom:  1px solid #dedede;
        height: 30px;
        line-height: 30px;
        font-size: 14px;
        padding: 0 10px; 
    }
    .main-title-icon {
        font-size: 20px;
        text-align: right;
    } 
</style>