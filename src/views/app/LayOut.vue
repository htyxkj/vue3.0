<template>
    <keep-alive>
        <div height="100%">
            <template v-if="bshow">
                <router-view />
            </template>
        </div>
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
    @Prop() height!:number;
    @Provide() dialogVisible:boolean = false

    handleClose(){
        console.log('handleClose')
    }
}
</script>
