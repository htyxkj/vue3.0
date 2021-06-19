<template>
    <div>
        <template v-if="item.haveChild && canShowChile">
            <template v-if="item.childMenu.length === 0">
                <el-menu-item class="my-menu-item" :index="item.menuId" v-if="item.menuattr != 4"  @click="closeMenu(item.command)"> <!-- :route="'layout?'+item.command" -->
                    <i class="el-icon-menu"></i>
                    {{item.menuName}}
                </el-menu-item>
            </template>
            <template v-else :index="item.menuId">
                <bip-sub-menu :item="item" :appendBody="false" @lastClick="lastClick"/>
            </template>
        </template>
        <template v-else>
            <el-menu-item class="my-menu-item" :key="item.menuId" :index="item.menuId" v-if="item.menuattr != 4" @click="closeMenu(item.command)"> <!-- :route="'layout?'+item.command"  -->
                <template v-if="item.menuIcon">
                    <img class="imgpointer" :src="uri+item.menuIcon"/>
                    </template>
                <template v-else>
                    <i class="el-icon-menu"></i>
                </template>
                {{item.menuName}}
            </el-menu-item>
        </template>
    </div>
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
})
export default class BipMenuItem extends Vue{
    name:string="BipMenuItem"
    @Prop() private item!:Menu;
    uri:string='';
    canShowChile:boolean = true;
    closeMenu(command:any){
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
            this.lastClick()
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
    //末级菜单点击
    lastClick(){
        this.$emit("lastClick")
    }
}
</script>
<style lang="scss" scoped>
.imgpointer{
    width: 18px;
    height: 18px;
}
.my-menu-item{
    font-size: 14px;
}
</style>

