<template>
    <div class="bip-show">
       <el-switch v-model="model1" disabled></el-switch>
    </div>
</template>
<script lang="ts">
import { Component, Vue,  Prop, Watch } from "vue-property-decorator"
@Component({})
export default class BipSwitchRef extends Vue{
    @Prop() model!:string
    model1:boolean = false;
    mounted(){
       this.initModel();
    }
    initModel(){
        if(this.model && this.model == '1'){
            this.model1 = true;
        }else{
            this.model1 = false;
        }
    }
    @Watch("model")
    modelChange(){
        this.initModel();
    }
}
</script>


<style lang="scss">
.bip-show{
    width: 100%;
    padding: 0 0;
}
</style>
