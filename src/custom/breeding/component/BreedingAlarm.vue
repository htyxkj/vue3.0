<template>
    <el-row :gutter="10">
        <template v-if="menuList.length>0" >
            <el-col v-for="(item,index) in menuList" :key="index" style="width:120px;padding:10px 0">
                <el-badge :value="item.bgnum" class="bg_item" :max="99">
                    <el-row >
                        <el-col :span="24" class="imgcol">
                            <img class="img pointer" :src="uri+item.menuIcon" @click="menuClick(item.menuName,item.menuId,item.command)"/>
                        </el-col>
                        <el-col :span="24" class="imgcol pointer">
                            <template v-if="item.menuName.length>7">
                                <el-tooltip effect="dark" :content="item.menuName" placement="top">
                                    <span class="menuname"  @click="menuClick(item.menuName,item.menuId,item.command)" >{{item.menuName.substring(0,6)}}…</span>
                                </el-tooltip>
                            </template>
                            <template v-else>
                                <span class="menuname"  @click="menuClick(item.menuName,item.menuId,item.command)" >
                                    {{item.menuName}}
                                </span>
                            </template>
                        </el-col>
                    </el-row>
                </el-badge>
            </el-col>
        </template>
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
import QueryEntity from "@/classes/search/QueryEntity";
@Component({
  components: {}
})
export default class BreedingAlarm extends Vue {
    @Getter('isLogin', { namespace: 'login' }) isLogin!: boolean;
    @Getter('menulist', { namespace: 'login' }) menusList!: Menu[];
    menuList:Array<any> = new Array<any>();
    uri:string = '';
    created(){
        this.uri = BaseVariable.BaseUri+'/'
    }
    mounted() {   
        this.init();
    }
    async init(){
         //调用辅助查询数据
        let qe:QueryEntity = new QueryEntity('','');
        qe.page.currPage = 1;
        qe.page.pageSize = 20;
        let vv = await BIPUtil.ServApi.getBipInsAidInfo('ALLALARM',210,qe);
        this.menuList = [];
        if(vv.data.id ==0){
            let vl = vv.data.data.data.values;
            for(var i=0;i<vl.length;i++){
                let one_v = vl[i];
                let menu = baseTool.findMenu(one_v.tipisno);
                if(menu){
                    menu.menuName = one_v.tipname
                    let lid = "BG."+menu.menuId
                    let res = await BIPUtil.ServApi.getBipLongTextData(lid,undefined);
                    let bgnum = undefined;
                    if(res.data.code ==200){
                        bgnum = res.data.data.bgnum;
                    }
                    menu.bgnum = bgnum;
                    this.menuList.push(menu);
                }
            }
        }
    } 
    /**
     * 菜单点击
     */
    menuClick(menuName:any,menuid:string,command:string){
        let menu = baseTool.findMenu(menuid);
        if(menu ==  null){
            this.$notify.error("没有菜单"+menuid+"操作权限！");
            return;
        }
        menu.menuName = menuName;
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
                query: {pbuid:command,pmenuid:menu.menuId,menuName:menuName},
            })
        }
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
        letter-spacing: 1px;
        font-weight: 600;
        margin-bottom: 8px;
        @include bip_text_primary
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