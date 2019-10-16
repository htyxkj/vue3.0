<template>
  <div> 
  </div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop } from "vue-property-decorator";
import { User } from "@/classes/User";
import { Menu } from "@/classes/Menu";
import QueryEntity from "@/classes/search/QueryEntity";
import CDataSet from "@/classes/pub/CDataSet";
import QueryCont from '@/classes/search/QueryCont';
import { Cells } from "@/classes/pub/coob/Cells";

import qs from "qs";
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi 
import { State, Action, Getter, Mutation } from "vuex-class";
import { LoginState } from "@/store/modules/login/types";

const namespace: string = "login";
@Component
export default class WxApplets extends Vue {
  @Prop() query!:any 
  @Mutation("isLogin", { namespace }) setIsLogin: any;
  @Mutation("snkey", { namespace }) setSnkey: any;
  @Mutation("user", { namespace }) setUserInfo: any;
  @Mutation("menulist", { namespace }) setMenusInfo: any;
  @Getter("user", { namespace }) user?: User;

  @Provide() dsm: CDataSet = new CDataSet(null);
  async mounted() {
    await this.login()
    await this.getCell();
    await this.getCellData();
    // await this.saveData();
    await this.getAssistData();
  }
  async login(){
    let user:User = new User("", "", "");
    user.userCode = 'admin';
    user.password = 'system';
    let res = await tools.login(user);
    console.log(res);
    let data = res.data;
    if (data.id === 0) {
      let userI = data.data.user;
      this.user = userI
      let snkey = data.data.snkey;
      userI.password = "";
      let ms = data.data.menulist;
      // this.setIsLogin(true);
      this.setSnkey(snkey);
      this.setUserInfo(userI);
      this.setMenusInfo(ms);
      this.$notify.success("登录成功");
    } else {
      this.$notify.error(data.message);
    }
  }
  //获取对象信息
  async getCell(){
    //00USER  == 对象标识
    let res = await tools.getCCellsParams('00USER'); 
    console.log(res);
    let rtn = res.data;
    if (rtn.id == 0) {
      let kn: Array<Cells> = rtn.data.layCels;
      this.dsm = new CDataSet(kn[0]);
    }
  }
  //获取对象数据
  async getCellData(){
    //00USER  == 对象标识
    //dataStr 条件 {key:value}   {字段:值}   字段=值
    let dataStr = "{usrcode:'admin'}";
    let qe:QueryEntity = new QueryEntity("00USER","00USER",dataStr);
    qe.page.pageSize=20
    let vv = await tools.query(qe);
    console.log(vv)
  }
  //修改密码
  async upPwd(){
    let user:User = new User("", "", "");
    user.userCode = 'admin';
    let vv = await tools.upPwd(user,'system','system');
    console.log(vv)
  }
  //保存数据
  async saveData(){
    this.dsm.createRecord();
    this.dsm.currRecord.data.usrcode='123455'
    this.dsm.saveData().then(res=>{
      console.log(res);
      if(res.data.id ==0){
            
      }else{
          this.$notify.error(res.data.message);
      }
    }).finally(()=>{
    })
  }

  //调用辅助查询数据
  async getAssistData(){
    let qe:QueryEntity = new QueryEntity('','');
    qe.page.currPage = 1;
    qe.page.pageSize = 20;
    qe.cont = "";

    let allCont = [];
    let oneCont = []; 
    //classes/search/QueryCont';  有详细说明
    let qCont = new QueryCont('orgcode','1',12);
    qCont.setContrast(3);
    oneCont.push(qCont);
    if(oneCont.length !=0){
      allCont.push(oneCont);
      qe.cont = "~" + JSON.stringify(allCont);
    }else{
      qe.cont = "";
    }

    let vv = await tools.getBipInsAidInfo('SORGA',210,qe);
    console.log(vv);
  }


  // login() {
  //   const loading = this.$loading({
  //     lock: true,
  //     text: "登陆中",
  //     spinner: "el-icon-loading",
  //     background: "background:'rgba(0, 0, 0, 0.7)'"
  //   }); 
  //   BIPUtil.ServApi.loginWithOutPwd(this.query.secret).then((res: any) => {
  //     let data = res.data;
  //     if (data.id === 0) {
  //       let userI = data.data.user;
  //       let snkey = data.data.snkey;
  //       userI.password = "";
  //       let ms = data.data.menulist;
  //       this.setIsLogin(true);
  //       this.setSnkey(snkey);
  //       this.setUserInfo(userI);
  //       this.setMenusInfo(ms);
  //       this.$router.push({ path: "/", name: "home" });
  //       this.$notify.success("登录成功");
  //     } else {
  //       this.$notify.error(data.message);
  //     }
  //     loading.close();
  //   })
  //   .catch((res: any) => {
      
  //     this.$notify.error("服务没有启动！"); 
  //     loading.close();
  //   });
  // }


}
</script>


<style lang="scss" scoped>
</style>

