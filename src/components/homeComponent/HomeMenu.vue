<template>
    <el-row > 
        <el-col v-for="(item,index) in menuList" :key="index" :xs="8" :sm="6" :md="4" :lg="3" :xl="1">
            {{item.menuName}}
            <el-avatar :size="60" src="https://empty" @error="errorHandler">
                <img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png"/>
            </el-avatar>
        </el-col>
    </el-row>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from "vuex-class";
import {CommICL} from '@/utils/CommICL'
let ICL = CommICL
import { Menu } from "@/classes/Menu";
import { BIPUtil } from "@/utils/Request"; 
import { URIParams } from "@/classes/URIParams";
import CUnivSelect from './CUnivSelect.vue'
import { format } from 'path';
let tools = BIPUtil.ServApi
@Component({
    components:{CUnivSelect}
})
export default class BipStatisticsDialog extends Vue { 
    @Prop() cont!:string;
    @Prop() rech!:string;
    @Getter('menulist', { namespace: 'login' }) menusList!: Menu[] ;
    @Provide() menuList:Array<any> = new Array<any>();
    mounted() {   
        this.init();
    }
    async init(){
        if(this.cont){
            let cc = JSON.parse(this.cont);
            let menu:any = cc.menuid.split(";");
            for(var i=0;i<this.menusList.length;i++){
                menu.forEach( (item:any) => {
                    let menu = this.findMenuById(item,this.menusList[i]);
                    if(menu){
                        // command: "pbuid=C105&pmenuid=C105" 
                        // menuId: "C105"
                        // menuName: "办借书证"  
                        this.menuList.push(menu);
                    }
                });
            }
            console.log(menu);
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
    menuClick(menuid:string){
        let menu = null;
        for(let i = 0;i<this.menusList.length;i++){
            let m1 = this.findMenuById(menuid,this.menusList[i])
            if(m1!=null){
                menu = m1
                break ;
            }
        }  
        if(menu ==  null){
            this.$notify.error("没有菜单"+menuid+"操作权限！");
            return;
        }

    }
}
</script>