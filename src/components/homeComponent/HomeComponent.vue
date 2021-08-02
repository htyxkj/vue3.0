<template>
    <el-row style="height:100%">
        <template v-if="type == 'Report' ">
            <home-report :cont ="cont" :rech="rech" :sid="sid" :type="'Report'"></home-report>
        </template>
        <template v-if="type == 'ReportList' ">
            <home-report :cont ="cont" :rech="rech" :sid="sid" :type="'ReportList'"></home-report>
        </template>
        <template v-else-if="type == 'Menu' ">
            <home-menu :cont ="cont" :rech="rech" @menuChange="menuChange"></home-menu>
        </template>
        <template v-else-if="type == 'Calendar'">
            <home-calendar :cont ="cont" :rech="rech"></home-calendar>
        </template>
        <template v-else-if="type == 'news'">
            <home-news :type="type" :cont ="cont"></home-news>
        </template>
        <template v-else-if="type == 'bulletin'">
            <home-news :type="type" :cont ="cont"></home-news>
        </template>
        <template v-else-if="type == 'Carousel'">
            <home-carousel :cont ="cont" :rech="rech"></home-carousel>
        </template>
        <template v-else-if="type == 'CodeDev'">
            <home-code-dev :cont ="cont" :rech="rech" :sid="sid" ></home-code-dev>
        </template>
    </el-row>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import HomeReport from './HomeReport.vue';
import HomeMenu from './HomeMenu.vue';
import HomeCalendar from './HomeCalendar.vue';
import HomeNews from './HomeNews.vue';
import HomeCarousel from './HomeCarousel.vue';
import HomeCodeDev from './HomeCodeDev.vue';
@Component({
    components:{HomeReport,HomeMenu,HomeCalendar,HomeNews,HomeCarousel,HomeCodeDev}
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
<style>
.vue-grid-item>.vue-resizable-handle{
    z-index: 9999;
}   
</style>