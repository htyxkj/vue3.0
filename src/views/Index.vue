<template >
    <div class="m-rpt" :style="styles" v-if="haveKb"> 
        <div class="contain">
        <ul>
            <li>
                <a href="javascript:;" @click="gotoIndex">
                    <img src="../assets/item-ctrl/jinrong.png" alt="">
                    <span>业务系统</span>
                </a>
            </li>
            <li v-for="(item,index) in boards" :key="index">
                <a href="javascript:;" @click="gotoPage(item)">
                    <img src="../assets/item-ctrl/xinyong.png" alt="">
                    <span>{{item.menuName}}</span>
                </a>
            </li>
        </ul>
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
    mounted(){
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
        }else{
            if(BaseVariable.ITEMTYPE == 'air-super'){
                this.gotoPage(this.boards[0])
            }
        }
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

<style scoped>


.m-rpt{
  top: 0%;
  left: 0%;
  position: fixed;
  width: 100%;
  height: 100%;
  /* background-image: url("../assets/login/login.png"); */
  background-size: 100% 100%;
  background-color: #0a6863;
}
.m-rpt li{
    list-style: none;
}

.contain{
    width: 1260px;
    margin: 0 auto;
    margin-top: 80px;
    height: 400px;
}
.contain ul li img{
    display: inline-block;
    margin-left: -45px;
}
.contain ul li span{
    display: inline-block;
    vertical-align:16px;
    font-size: 30px;
    color: #57daff;
    margin-left: 20px;
}
.contain ul{
    width: 100%;
    height: 100%;
}
.contain ul li{
    width: 600px;
    height: 200px;
    line-height: 210px;
    float: left;
    /* background-image: url('../images/kuang.png'); */
    background-position: center center;
    background-repeat: no-repeat;
    margin-bottom: 50px;
    background-color:transparent;
}
.contain ul li:hover{
    /* background: url('../images/chooseKuang.png') center center no-repeat; */
    /*background-color: -webkit-linear-gradient(red, blue); /* Safari 5.1 - 6.0 */
    /*background-color: -o-linear-gradient(red, blue); /* Opera 11.1 - 12.0 */
    /*background-color: -moz-linear-gradient(red, blue); /* Firefox 3.6 - 15 */
    /*background-color: linear-gradient(red, blue); /* 标准的语法 */
}
.contain ul li a{
    display: block;
    width: 100%;
    height: 100%;
    text-align: center;
}
        
      
</style>