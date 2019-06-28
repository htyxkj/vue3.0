<template>
    <div>
        <template v-if="item.haveChild">
            <template v-if="item.childMenu.length === 0">
                <el-menu-item :index="item.menuId" :route="'layout?'+item.command">
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

                    <el-menu-item v-else :key="child.menuId" :index="child.menuId" :route="'layout?'+child.command">
                        <i class="el-icon-location"></i>
                        {{child.menuName}}
                    </el-menu-item>
                </template>
            </el-submenu>
        </template>
        <template v-else>
            <el-menu-item :key="item.menuId" :index="item.menuId" :route="'layout?'+item.command">
                <i class="el-icon-menu"></i>
                {{item.menuName}}
            </el-menu-item>
        </template>
    </div>
</template>
<script lang="ts">
import { Component, Vue,Provide,Prop} from "vue-property-decorator";
import { Menu } from '@/classes/Menu';
import BipMenuItem2 from "@/components/menu/BipMenuItem2.vue";
@Component({
    components: {
        'bip-menu-item':BipMenuItem2
    }
})
export default class BipMenuItem1 extends Vue{
    @Provide() name:string="BipMenuItem1"
    @Prop() private item!:Menu;
}
</script>


