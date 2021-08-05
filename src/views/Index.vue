<template >
    <div class="m-rpt" :style="styles" v-if="haveKb && initOk"> 
        <div class="contain">
            <div class="one_menu">
                <a href="javascript:;" @click="gotoIndex">
                    <el-row>
                        <el-col :span="24">
                            <img src="../assets/bip/index/1.png" alt="">
                        </el-col>
                        <el-col :span="24">
                            <span>业务系统</span>
                        </el-col>
                    </el-row>
                </a>
            </div>
            <div v-for="(item,index) in boards" :key="index" class="one_menu">
                <a href="javascript:;" @click="gotoPage(item)">
                     <el-row>
                        <el-col :span="24">
                            <img :src="uri+item.menuIcon"/>
                        </el-col>
                        <el-col :span="24">
                            <span>{{item.menuName.replace(/\s/g,"")}}</span>
                        </el-col>
                    </el-row>
                </a>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue,  } from "vue-property-decorator";
import { Getter, Mutation } from "vuex-class";
import { Menu } from "@/classes/Menu";
import { BaseVariable } from "@/utils/BaseICL";
@Component({
})
export default class Index extends Vue {
    styles:string = ''
    boards:Array<any> = []
    @Getter('menulist', { namespace: 'login' }) menusList!: Menu[] ;
    @Mutation("isOtherePage", {  namespace: 'login' }) setIsOtherePage: any;
    uri:any = "";
    initOk:boolean=false;
    mounted(){
        this.uri = BaseVariable.BaseUri+'/'
        this.styles="width:"+document.documentElement.clientWidth+'px;';
        this.styles+='height:'+document.documentElement.clientHeight+'px;';
        if(this.menusList){
            let _s = this.menusList.length-1;
            let lastNode = this.menusList[_s];
            if(lastNode.menuName == "SYSKB"){
                this.boards = lastNode.childMenu;
            }
        }
        if(!this.haveKb){
            this.gotoIndex("");
            return;
        }else{
            if(BaseVariable.ITEMTYPE == 'air-super'){
                this.gotoPage(this.boards[0])
                return;
            }
        }
        this.initOk = true;
    }
    gotoIndex(url:any){
        this.setIsOtherePage(false)
        this.$router.push({
            path:'/',
            name:"Home",
        })
    }

    gotoPage(e:any){
        this.$router.push({
            path:'/'+e.command,
            name:e.command,
        })
    }

    get haveKb(){
        return this.boards && this.boards.length>0
    }
}
</script>

<style lang="scss" scoped>
.m-rpt{
  top: 0%;
  left: 0%;
  width: 100%;
  height: 100%;
  background-image: url("../assets/bip/index/bj.jpg");
  background-size: 100% 100%;
}
.contain{
    width: 100%;
    height: 100%;
    display:flex;
    justify-content:center;
    align-items: center;
    a{
        text-align: center;
        text-decoration:none;
        color: #fff;
        font-size: .4rem;
        width: 100%;
        height: 100%;
        letter-spacing: .064rem;
    }
    .one_menu{
        width: 4rem;
        height: 4.7rem;
        margin: 0 .5rem;
    }
    img{
        width: 100%;
        height: 100%;
    }
}
</style>