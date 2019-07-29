<template>
    <div>
        <template v-if="item.haveChild">
            <template v-if="item.childMenu.length === 0">
                <el-menu-item :index="item.menuId" v-if="item.menuattr != 4" :route="'layout?'+item.command" @click="closeMenu">
                    <i class="el-icon-menu"></i>
                    {{item.menuName}}
                </el-menu-item>
            </template>

            <el-submenu v-else :index="item.menuId">
                <template slot="title" >
                    <i class="el-icon-menu"></i>
                    {{item.menuName}}
                </template>

                <template v-for="child in item.childMenu">
                    <bip-menu-item v-if="child.childMenu&&child.childMenu.length>0" :item="child" :key="child.menuId"></bip-menu-item>
                    <template v-else>
                        <el-menu-item v-if="child.menuattr != 4" :key="child.menuId" :index="child.menuId"  :route="'layout?'+child.command" @click="closeMenu">
                            <i class="el-icon-location"></i>
                            {{child.menuName}}
                        </el-menu-item> 
                    </template>
                </template>
            </el-submenu>
        </template>
        <template v-else>
            <el-menu-item :key="item.menuId" :index="item.menuId" v-if="item.menuattr != 4" :route="'layout?'+item.command" @click="closeMenu">
                <i class="el-icon-menu"></i>
                {{item.menuName}}
            </el-menu-item>
        </template>
    </div>
</template>
<script lang="ts">
import { Component, Vue,Provide,Prop} from "vue-property-decorator";
import { Menu } from '@/classes/Menu';
import { LoginState } from '../../store/modules/login/types';
import { State, Action, Getter, Mutation } from 'vuex-class';

@Component({
})
export default class BipMenuItem extends Vue{
    @Provide() name:string="BipMenuItem"
    @Prop() private item!:Menu;
    @Getter('isOpenMenu', { namespace: 'login' }) isOpenMenu!: boolean;
    @Mutation('setIsOpenMenu', { namespace:'login' }) setIsOpenMenu: any;

    closeMenu(){
        this.setIsOpenMenu(false);
    }

}
</script>


