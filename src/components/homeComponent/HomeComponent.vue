<template>
    <el-row style="height:100%">
        <template v-if="type == 'Report' ">
            <home-report :cont ="cont" :rech="rech" :sid="sid"></home-report>
        </template>
        <template v-else-if="type == 'Menu' ">
            <home-menu :cont ="cont" :rech="rech" @menuChange="menuChange"></home-menu>
        </template>
        <template v-else-if="type == 'Calendar'">
            <home-calendar :cont ="cont" :rech="rech"></home-calendar>
        </template>
        <template v-else-if="type == 'news'">
            <home-news :type="type"></home-news>
        </template>
        <template v-else-if="type == 'bulletin'">
            <home-news :type="type"></home-news>
        </template>
    </el-row>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import HomeReport from './HomeReport.vue';
import HomeMenu from './HomeMenu.vue';
import HomeCalendar from './HomeCalendar.vue';
import HomeNews from './HomeNews.vue';
@Component({
    components:{HomeReport,HomeMenu,HomeCalendar,HomeNews}
})
export default class HomeComponent extends Vue { 
    @Prop() type!:string;
    @Prop() cont!:string;
    @Prop() rech!:string;
    @Prop() sid!:string;
    mounted() {        
       
    }
    menuChange(selection:any){
        this.$emit("menuChange",selection,this.sid);
    }
}
</script>