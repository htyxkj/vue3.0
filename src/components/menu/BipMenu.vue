<template>
    <div>
        <el-row class="menuSW">
            <i :class="isCollapse?'el-icon-s-fold':'el-icon-s-unfold'" @click="isCollapse = !isCollapse"></i>
        </el-row>
        <el-row class="bip-menu-scrollbar" :style="style">
            <el-scrollbar style="height:100%">
                <el-menu mode="vertical"  :unique-opened="false" router :collapse="isCollapse" :style="!isCollapse?'min-width:240px;max-width:240px':''">
                    <template v-for="menu in menuList" >
                        <bip-sub-menu v-if="menu.haveChild" :key="menu.path" :item="menu" :appendBody="false"/>
                        <bip-menu-item v-else :key="menu.path"  :item="menu"/>
                    </template>
                </el-menu>
            </el-scrollbar>
        </el-row>
    </div>
</template>
<script lang="ts">
/**
 * 菜单
 */
import { Component, Vue, Watch } from "vue-property-decorator";
import { Menu } from "@/classes/Menu";

@Component({
    components: { }
})
export default class BipMenu extends Vue {
    menuList: Menu[] = [];
    isCollapse:boolean = true;
    style:any = "";
    mounted() {
        this.menuList = JSON.parse(window.sessionStorage.getItem("menulist") + "");
        if (this.menuList == null) {
            this.menuList = [];
        }
        let height = document.documentElement.clientHeight
        if(height>70){
            height=height-85;
        }
        this.style = "height:"+(height)+"px"
    }
}
</script>
<style scoped lang="scss">
    .menu-list{
        @include menu_list_style();
    }
    .menuSW{
        height: .78125rem;
        line-height: .78125rem;
        padding-left: .3125rem;
        background-color: #fff;
        border-bottom: .015625rem solid rgba(99, 99, 99, 0.322);
    }
    .bip-menu-scrollbar{
        background-color: #fff;
    }
</style>