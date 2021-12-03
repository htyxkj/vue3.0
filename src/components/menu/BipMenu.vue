<template>
    <div>
        <div class="menuSW" @click="isCollapse = !isCollapse">
            <i v-if="isCollapse" class="iconfont icon-bip-fold menuicon pointer"></i>
            <i v-else class="iconfont icon-bip-unfold menuicon pointer"></i>
        </div>
        <el-row class="bip-menu-scrollbar" :style="style">
            <el-scrollbar style="height:100%">
                <el-menu mode="vertical" :collapse-transition="false"  :unique-opened="false" router :collapse="isCollapse" :style="!isCollapse?'min-width:240px;max-width:400px':''">
                    <template v-for="menu in menuList" >
                        <bip-sub-menu v-if="menu.haveChild" :key="menu.path" :item="menu" :appendBody="false" @lastClick="lastClick"/>
                        <bip-menu-item v-else :key="menu.path"  :item="menu" @lastClick="lastClick"/>
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
    heightChangeSID:number  = 0;
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
        this.heightChangeSID = this.$bus.$on('totalHChange',this.totalHChange);

    }

    totalHChange(){
        this.$nextTick(()=>{
             let height = document.documentElement.clientHeight
            if(height>70){
                height=height-85;
            }
            this.style = "height:"+(height)+"px"
        })
    }

    beforeDestroy(){
        this.$bus.$off('totalHChange',this.heightChangeSID)
    }
    
    //末级菜单点击
    lastClick(){
        console.log("lastClick")
        this.isCollapse=true
    }
}
</script>
<style scoped lang="scss">
    .menu-list{
        @include menu_list_style();
    }
    .menuSW{        
        @include bip_text_primary;
        height: .78125rem;
        line-height: .78125rem;
        background-color: #fff;
        border-bottom: .015625rem solid rgba(99, 99, 99, 0.322);
        i {
            padding-top: .228125rem;
            padding-left: .24rem;
            font-size: 28px;
        }
    }
</style>