<template>
    <el-row class="home-carousel">
        <el-carousel height="height:100%" :type="carouselType">
            <el-carousel-item v-for="(item,index) in listCar" :key="index" style="width: 100%;height: 100%;">
                <img @click="menuClick(item.url)" :src="item.images" style="width: 100%;height: 100%;" />
            </el-carousel-item>
        </el-carousel>
    </el-row>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from "vuex-class";
import { Menu } from "@/classes/Menu";
import { BIPUtils } from "@/utils/BaseUtil";
let baseTool = BIPUtils.baseUtil;
import {BaseVariable} from "@/utils/BaseICL"

@Component({
  components: {}
})
export default class HomeCarousel extends Vue {
    @Getter('isLogin', { namespace: 'login' }) isLogin!: boolean;
    @Prop() cont!:string;
    @Prop() rech!:string;
    uri:string = '';
    carouselType = "";
    listCar:any =[];
    created(){
        this.uri = BaseVariable.BaseUri+'/'
        this.init();
    }
    mounted() {
    }
    init(){
        let cont = JSON.parse(this.cont);
        if(cont.type ==1){
            this.carouselType="card"
        }else{
            this.carouselType=""
        }
        this.listCar = [];
        for(var i =0;i <cont.list.length;i++){
            let img = cont.list[i];
            let imgUrl = this.uri+img.images;
            let caro = {images : imgUrl,url:img.url};
            this.listCar.push(caro)
        }
    }

    /**
     * 菜单点击
     */
    menuClick(menuid:string){
        if(!this.isLogin){
            this.$router.push({
                path:'/wlogin',
                name:'wlogin',
            })
            return;
        }
        let menu = baseTool.findMenu(menuid);
        if(menu ==  null){
            this.$notify.error("没有菜单"+menuid+"操作权限！");
            return;
        }
        let command = menu.command;
        if(command.indexOf("pmenu=") !=-1){
            command = command.split("&")[0].split("=")[1];
            command = "/"+command;
            this.$router.push({
                path:command,
                name:command,
                query: {pmenuid:menu.menuId},
            })
        }else{ 
            command = command.split("&")[0].split("=")[1];
            this.$router.push({
                path:'/layout',
                name:'layout',
                query: {pbuid:command,pmenuid:menu.menuId},
            })
        }
    }
    @Watch("cont")
    contChange(){
        this.init();
    }
}
</script>
<style lang="scss" scoped>
.el-carousel{
    height: 100% !important;
} 
</style>
<style lang="scss" lang="scss">
.home-carousel{
    width: 100%;
    height: 100%;
    .el-carousel__container{
        height: 100% !important;
    }
}
</style>