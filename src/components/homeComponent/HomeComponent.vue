<template>
    <el-row>
        <template v-if="type == 'Report' ">
            <home-report :cont ="cont" :rech="rech"></home-report>
        </template>
    </el-row>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import HomeReport from './HomeReport.vue';
@Component({
    components:{HomeReport}
})
export default class BipStatisticsDialog extends Vue { 
    @Prop() type!:string;
    @Prop() cont!:string;
    @Prop() rech!:string;
    mounted() {        
       
    }
}
</script>