<template>
    <div>
        <template v-if="item.haveChild">
            <template v-if="item.childMenu.length === 0">
                <el-menu-item :index="item.menuId" v-if="item.menuattr != 4"  @click="closeMenu(item.command)"> <!-- :route="'layout?'+item.command" -->
                    <i class="el-icon-menu"></i>
                    {{item.menuName}}
                </el-menu-item>
            </template>

            <el-submenu v-else :index="item.menuId">
                <template slot="title" >
                    <template v-if="item.menuIcon">
                        <img class="imgpointer" :src="uri+item.menuIcon"/>
                    </template>
                    <template v-else>
                        <i class="el-icon-menu"></i>
                    </template>
                    {{item.menuName}}
                </template>
                <template v-for="child in item.childMenu">
                    <bip-menu-item v-if="child.childMenu&&child.childMenu.length>0" :item="child" :key="child.menuId"></bip-menu-item>
                    <template v-else>
                        <el-menu-item v-if="child.menuattr != 4" :key="child.menuId" :index="child.menuId"  @click="closeMenu(child.command)"> <!-- :route="'layout?'+child.command"  -->
                            <template v-if="child.menuIcon">
                                <img class="imgpointer" :src="uri+child.menuIcon"/>
                            </template>
                            <template v-else>
                                <i class="el-icon-location"></i>
                            </template>
                            {{child.menuName}}
                        </el-menu-item> 
                    </template>
                </template>
            </el-submenu>
        </template>
        <template v-else>
            <el-menu-item :key="item.menuId" :index="item.menuId" v-if="item.menuattr != 4" @click="closeMenu(item.command)"> <!-- :route="'layout?'+item.command"  -->
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
import { Component, Vue,Provide,Prop,Watch} from "vue-property-decorator";
import { Menu } from '@/classes/Menu';
import { LoginState } from '../../store/modules/login/types';
import { State, Action, Getter, Mutation } from 'vuex-class';
import {BaseVariable} from "@/utils/BaseICL"

@Component({
})
export default class BipMenuItem extends Vue{
    @Provide() name:string="BipMenuItem"
    @Prop() private item!:Menu;
    @Getter('isOpenMenu', { namespace: 'login' }) isOpenMenu!: boolean;
    @Mutation('setIsOpenMenu', { namespace:'login' }) setIsOpenMenu: any;
    @Provide() uri:string='';
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
        }
        
        this.setIsOpenMenu(false);
    }
    created(){
        console.log(BaseVariable.BaseUri)
        this.uri = BaseVariable.BaseUri+'/'
    }
}
</script>
<style lang="scss" scoped>
.imgpointer{
    width: 18px;
    height: 18px;
}
</style>

