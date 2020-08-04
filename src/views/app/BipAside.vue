<template>
  <div style="width:100%">
    <el-aside width="280px" style="float:left; position: absolute;" >
        <el-row>
            <el-col :span="24" class="menu-title" >
                <div>{{loginTitle}}</div>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="24">
            <bip-menu :menuList="menus"></bip-menu>
            </el-col>
        </el-row>
    </el-aside>
    <div style="width:100%;background-color: #5d5d5d61; float:right;height: 100%;" @click="showMenu"></div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Provide } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from 'vuex-class';
import { Menu } from "@/classes/Menu";
import BipMenu from "@/components/menu/BipMenu.vue";
import { LoginState } from '../../store/modules/login/types'; 
import { BaseVariable } from "@/utils/BaseICL";
@Component({
  components: {
    BipMenu
  }
})
export default class BipAside extends Vue {
  @State('login') profile!: LoginState
  @Provide() menus: Array<Menu> = [];
  @Getter('isOpenMenu', { namespace: 'login' }) isOpenMenu!: boolean;
  @Mutation('setIsOpenMenu', { namespace:'login' }) setIsOpenMenu: any;
  @Provide() loginTitle:any="";
  mounted() {
    this.loginTitle =  BaseVariable.Project_Name;
    this.menus = JSON.parse(window.sessionStorage.getItem("menulist") + "");
    if (this.menus == null) {
      this.menus = [];
    }
  }
  showMenu(){ 
    this.setIsOpenMenu(false)
  }
}
</script>

<style scoped>
.menu-title{
    height:60px;
    text-align: center;
    color: #ffffff;
    background-color:#20a0ff;
}
.menu-title div {
  line-height: 60px;
  font-size: 17px;
  letter-spacing: 1.5px;
}
.el-row {
  margin-bottom: 20px; 
}
</style>
