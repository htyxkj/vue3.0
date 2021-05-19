<template>
  <div v-if="baseVar">
    <template v-if="baseVar.ITEMTYPE =='RDCost'">
      <login-r-d></login-r-d>
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
@Component({
    components:{
      LoginBip,
      LoginRD
    }
})
export default class Login extends Vue {
  baseVar:any = null;
  created(){
    this.baseVar = BaseVariable;
  }
}
</script>


<style lang="scss" scoped>
</style>
