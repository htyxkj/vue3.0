<template>
  <div v-if="baseVar">
    <template v-if="baseVar.ITEMTYPE =='RDCost'">
      <login-r-d></login-r-d>
    </template>
    <template v-else-if="baseVar.ITEMTYPE =='air-super'">
      <login-air></login-air>
    </template>
    <template v-else>
      <login-bip></login-bip>
    </template>
  </div>
</template>
<script lang="ts">
import { BaseVariable } from "@/utils/BaseICL";
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import LoginBip from '@/views/login/LoginBIP'
import LoginRD from '@/views/login/LoginRD'
import LoginAir from '@/views/login/LoginAir'
@Component({
    components:{
      LoginBip,
      LoginRD,
      LoginAir
    }
})
export default class Login extends Vue {
  baseVar:any = null;
  created(){
    if(BaseVariable.ITEMTYPE == 'bip-zzz'){
      let url = BaseVariable.UniteLoginUrl;
      url = url+="?callback="; 
      let route:any = this.$route;
      let href ="";
      if(route && route.name=='wlogin'){
        href = location.href;
        href = href.substring(0,href.lastIndexOf("/"))
        href += "/wOauthToken"
      }else{
        href += "/wOauthToken"
      }
      href = encodeURIComponent(href);
      location.href = (url+href);
    }else{
      this.baseVar = BaseVariable;
    }
  }
}
</script>


<style lang="scss" scoped>
</style>
