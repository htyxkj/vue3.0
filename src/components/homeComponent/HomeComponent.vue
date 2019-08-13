<template>
    <el-row>
        <template v-if="type == 'Report' ">
            <home-report :cont ="cont" :rech="rech"></home-report>
        </template>
        <template v-else-if="type == 'Menu' ">
            <home-menu :cont ="cont" :rech="rech"></home-menu>
        </template>
    </el-row>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import HomeReport from './HomeReport.vue';
import HomeMenu from './HomeMenu.vue';
@Component({
    components:{HomeReport,HomeMenu}
})
export default class BipStatisticsDialog extends Vue { 
    @Prop() type!:string;
    @Prop() cont!:string;
    @Prop() rech!:string;
    mounted() {        
       
    }
}
</script>