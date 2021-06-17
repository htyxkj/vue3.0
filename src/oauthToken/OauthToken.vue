<template>
    <div>
        
    </div>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi;
import { BaseVariable } from "@/utils/BaseICL";
import { State, Action, Getter, Mutation } from "vuex-class";
import qs from "qs";
@Component({

})
export default class OauthToken extends Vue{
    @Mutation("isLogin", { namespace:'login' }) setIsLogin: any;
    @Mutation("snkey", { namespace:'login' }) setSnkey: any;
    @Mutation("user", { namespace:'login' }) setUserInfo: any;
    @Mutation("menulist", { namespace:'login' }) setMenusInfo: any;
    loading:any = null;
    oauthTokenUrl:any = null;
    async created(){
        this.check_token();
    }

    check_token(){
        this.loading = this.$loading({
          lock: true,
          text: '登陆校验中……',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });
        if(BaseVariable.ITEMTYPE == "bip-zzz"){//农村集体三资管理平台
            this.bip_zzz_outh_token();
        }
    }
    async bip_zzz_outh_token(){
        try{
            let query = this.$route.query;
            let token = query.token;
            let data = {"token":token,apiId:"checkYZTToken"}
            let res:any = await Vue.$axios.get("/commapi", {params: data});
            res = res.data;
            if(res.code == 200){
                let user_name = res.data.user_name;
                res = await tools.loginWithOutPwd(user_name);
                this.loginAfter(res);
            }else{
                this.gotoPage();
            }
            this.loading.close()
        }catch(e){
            this.$notify.error({
                title:"",
                type: 'error',
                message: "认证失败！",
                offset: 40
            })
            this.loading.close()
            this.gotoPage();
        }
    }
    /**
     * 进行登陆后
     * @param res 登陆返回数据
     */
    loginAfter(res:any){
        let data = res.data;
        if (data.id === 0) {
            let userI = data.data.user;
            let snkey = data.data.snkey;
            userI.password = "";
            let ms = data.data.menulist;
            this.setIsLogin(true);
            this.setSnkey(snkey);
            this.setUserInfo(userI);
            this.setMenusInfo(ms);
            setTimeout(() => {
                this.gotoPage();
                this.loading.close();
            }, 500);
        }else{
            this.$notify.error({
                title:"",
                type: 'error',
                message: data.message,
                offset: 40
            })
            this.gotoPage();
        }
    }
    gotoPage(){
        this.$router.push({ path: "/report", name: "Report" });
    }
}
</script>