<template>
    <div class="sidebar-container myMenuDiv">
        <el-scrollbar wrap-class="scrollbar-wrapper">
            <el-menu mode="vertical" :unique-opened="false" router background-color="#545c64" text-color="#fff" active-text-color="#ffd04b">
                <bip-menu-item v-for="menu in menuList" :key="menu.path" :item="menu"/>
            </el-menu>
        </el-scrollbar>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop } from "vue-property-decorator";
import { Menu } from "@/classes/Menu";
// import BipMenuItem from "./BipMenuItem.vue";

@Component({
})
export default class BipMenu extends Vue {
  @Prop() private menuList!: Menu[];
}
</script>
<style>
    .myMenuDiv{
        top: 50px !important;
        height: calc(100% - 50px) !important;
    }
</style>



