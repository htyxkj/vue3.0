<template>
    <el-submenu :index="item.menuId" popper-class='bip-nav-menu' :popper-append-to-body="appendBody">
        <div slot="title"  class="my-menu-item">
            <template v-if="item.menuIcon">
                <img class="bip-menu-icon" :src="uri+item.menuIcon"/>
            </template>
            <template v-else>
                <i class="el-icon-menu"></i>
            </template>
            <span slot="title">{{item.menuName}}</span>
        </div>
        <template v-for="child in item.childMenu">
            <bip-menu-item class="my-menu-item" v-if="child.childMenu&&child.childMenu.length>0" :item="child" :key="child.menuId" @lastClick="lastClick"></bip-menu-item>
            <template v-else>
                <el-menu-item class="my-menu-item" v-if="child.menuattr != 4" :key="child.menuId" :index="child.menuId"  @click="closeMenu(child.command)"> 
                    <template slot="title" >
                        <template v-if="child.menuIcon">
                            <img class="bip-menu-icon" :src="uri+child.menuIcon"/>
                        </template>
                        <template v-else>
                            <i class="el-icon-location"></i>
                        </template>
                        <span slot="title">{{child.menuName}}</span>
                    </template>
                </el-menu-item> 
            </template>
        </template>
    </el-submenu>
</template>
<script lang="ts">
/**
 * 菜单
 */
import { Component, Vue,Provide,Prop,Watch} from "vue-property-decorator";
import { Menu } from '@/classes/Menu';
import { State, Action, Getter, Mutation } from 'vuex-class';
import {BaseVariable} from "@/utils/BaseICL"

@Component({
    components:{}
})
export default class BipSubMenu extends Vue{
    @Mutation('isOtherePage', { namespace:'login' }) setIsOtherePage: any;
    name:string="BipSubMenu"
    @Prop() private item!:Menu;
    @Prop() appendBody!:boolean
    uri:string='';
    canShowChile:boolean = true;
    closeMenu(command:any){
        console.log(command)
        if(command.indexOf("&") >-1){
            let cc = command.split("&");
            let pbuid = cc[0].split("=");
            let pmenuid = cc[1].split("=");
            if(pbuid[0] == 'pbuid'){
                this.$router.push({
                    path:'/layout',
                    name:'layout',
                    query: {pbuid:pbuid[1],pmenuid:pmenuid[1]},
                })
            }else if(pbuid[0] == 'pmenu'){
                this.$router.push({
                    path:'/'+pbuid[1],
                    name:pbuid[1],
                    query: {pmenuid:pmenuid[1]},
                })
            }
            this.lastClick();
        }else{
            if(this.item.menuId == 'SYSKB'){
                this.setIsOtherePage(true)
            }
            this.$router.push({
                path:'/'+command,
                name:command
            })
        }
    }
    created(){
        if(this.item.haveChild){
            this.canShowChile = false;
            for(var i=0;i<this.item.childMenu.length;i++){
                let cm:any = this.item.childMenu[i];
                if(cm.menuattr != 4){
                    this.canShowChile = true;
                    break;
                }
            }
        }
        this.uri = BaseVariable.BaseUri+'/'
    }
    lastClick(){
        this.$emit("lastClick")
    }
}
</script>
<style lang="scss" scoped>
.bip-menu-icon{
    width: 18px;
    height: 18px;
    vertical-align: middle;
    text-align: center;
    font-size: 18px;
    margin-right: 8px;
}
.my-menu-item{
    font-size: 14px;
    vertical-align:middle;
}
</style>

