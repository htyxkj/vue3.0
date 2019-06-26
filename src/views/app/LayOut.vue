<template>
    <keep-alive>
        <template v-if="bshow">
            <router-view />
        </template>
    </keep-alive>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop } from "vue-property-decorator";
@Component({
})
export default class LayOut extends Vue {
    @Provide() msg:string = '1111';
    @Provide() msg1:string = Math.random()+'';
    @Prop() name!:string;
    @Prop() bshow!:boolean;
    @Provide() dialogVisible:boolean = false
    handleClose(){
        console.log('handleClose')
    }
    openDia(){
       
    }

}
</script>
