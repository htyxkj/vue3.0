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
import { Mutation } from 'vuex-class';
@Component({
})
export default class LayOut extends Vue {
    @Mutation('setBipHeight', { namespace:'login' }) setBipHeight: any;
    @Provide() msg:string = '1111';
    @Provide() msg1:string = Math.random()+'';
    @Prop() name!:string;
    @Prop() bshow!:boolean;
    @Provide() dialogVisible:boolean = false

    handleClose(){
        console.log('handleClose')
    }
    async mounted() { 
        const that = this
        window.onresize = () => {
            return (() => {
                let h = document.documentElement.clientHeight;
                let height = h
                if(height>70){
                    height=height-90;
                }
                that.setBipHeight(height) 
                this.$bus.$emit('totalHChange')
            })();
        }
    }
}
</script>
