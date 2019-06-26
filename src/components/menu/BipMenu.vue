<template>
    <div class="sidebar-container">
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
import BipMenuItem from "./BipMenuItem.vue";

@Component({
  components: {
    BipMenuItem
  }
})
export default class BipMenu extends Vue {
  @Prop() private menuList!: Menu[];
}
</script>


<style lang="scss">
.sidebar-container {
  transition: width 0.28s;
  width: 280px;
  height: 92%;
  position: fixed;
  font-size: 0px;
  top: 60px;
  bottom: 0;
  left: 0;
  z-index: 10;
  overflow: hidden;
  .horizontal-collapse-transition {
    transition: 0s width ease-in-out, 0s padding-left ease-in-out,
      0s padding-right ease-in-out;
  }
  .el-scrollbar {
    height: 100%;
  }
  .scrollbar-wrapper {
    overflow-x: hidden !important;
    .el-scrollbar__view {
      height: 100%;
    }
  }
  .el-scrollbar__bar.is-vertical {
    right: 0px;
  }
  .is-horizontal {
    display: none;
  }
  a {
    display: inline-block;
    width: 100%;
    overflow: hidden;
  }
  .el-menu {
    border: none;
    height: 100%;
    width: 100% !important;
  }
  .is-active > .el-submenu__title {
    color: #111111 !important;
  }
}
</style>


