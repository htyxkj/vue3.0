<template>
    <el-aside width="280px" >
      <el-row>
        <el-col :span="24" class="menu-title" style="background-color:#20a0ff;">
          <h5>华泰益兴科技ERP系统</h5>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <bip-menu :menuList="menus"></bip-menu>
        </el-col>
      </el-row>
    </el-aside>
</template>

<script lang="ts">
import { Component, Vue, Provide } from "vue-property-decorator";
import { Menu } from "@/classes/Menu";
import BipMenu from "@/components/menu/BipMenu.vue";
@Component({
  components: {
    BipMenu
  }
})
export default class BipAside extends Vue {
  @Provide() menus: Array<Menu> = [];
  mounted() {
    this.menus = JSON.parse(window.sessionStorage.getItem("menulist") + "");
    if (this.menus == null) {
      this.menus = [];
    }
  }
}
</script>

<style>
.menu-title{
    height:60px;
    padding-left: 10px;
}
</style>
