<template>
    <div height="100%">
        <keep-alive>
                <template v-if="bshow">
                    <router-view />
                </template>
        </keep-alive>
    </div>
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
    @Prop() height!:number;
    @Provide() dialogVisible:boolean = false

    handleClose(){
        console.log('handleClose')
    }
}
</script>
