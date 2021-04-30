<template>
    <div class="sidebar-container menu-list">
        <el-scrollbar wrap-class="scrollbar-wrapper">
            <el-menu mode="vertical"  :unique-opened="false" router active-text-color="#1890FF"><!--background-color="#545c64" text-color="#fff" active-text-color="#ffd04b"-->
                <bip-menu-item v-for="menu in menuList" :key="menu.path" :item="menu"/>
            </el-menu>
        </el-scrollbar>
    </div>
</template>
<script lang="ts">
/**
 * 菜单
 */
import { Component, Vue, Provide, Prop } from "vue-property-decorator";
import { Menu } from "@/classes/Menu";

@Component({
})
export default class BipMenu extends Vue {
  @Prop() private menuList!: Menu[];
}
</script>
<style scoped lang="scss">
    .menu-list{
        @include menu_list_style();
    }
</style>



