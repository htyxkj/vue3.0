<template>
    <div>
        <template v-if="item.haveChild">
            <template v-if="item.childMenu.length === 0">
                <el-menu-item :index="item.menuId" :route="'layout?'+item.command" @click="closeMenu">
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

                    <el-menu-item v-else :key="child.menuId" :index="child.menuId" :route="'layout?'+child.command" @click="closeMenu">
                        <i class="el-icon-location"></i>
                        {{child.menuName}}
                    </el-menu-item>
                </template>
            </el-submenu>
        </template>
        <template v-else>
            <el-menu-item :key="item.menuId" :index="item.menuId" :route="'layout?'+item.command" @click="closeMenu">
                <i class="el-icon-menu"></i>
                {{item.menuName}}
            </el-menu-item>
        </template>
    </div>
</template>
<script lang="ts">
import { Component, Vue,Provide,Prop} from "vue-property-decorator";
import { Menu } from '@/classes/Menu';
import BipMenuItem from "@/components/menu/BipMenuItem.vue";
import { LoginState } from '../../store/modules/login/types';
import { State, Action, Getter, Mutation } from 'vuex-class';
@Component({
    components: {
        'bip-menu-item':BipMenuItem
    }
})
export default class BipMenuItem2 extends Vue{
    @Provide() name:string="BipMenuItem1"
    @Prop() private item!:Menu;
    @Getter('isOpenMenu', { namespace: 'login' }) isOpenMenu!: boolean;
    @Mutation('setIsOpenMenu', { namespace:'login' }) setIsOpenMenu: any;

    closeMenu(){
        this.setIsOpenMenu(false);
    }

}
</script>


