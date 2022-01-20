<template>
    <div class="ItemKanbanCard" :style="style">
        <el-container>
            <!-- <el-aside width="250px">
                <el-card class="box-card" :style="style">
                    <div v-for="(item,index) in DevValues" :key="index" class="text item">
                        <el-row>
                            <el-col :span="20">
                                {{item.name}}
                            </el-col>
                            <el-col :span="4">
                                <el-button type="text" size="mini" @click="showVideo(item)">查看</el-button>
                            </el-col>
                        </el-row>
                    </div>
                </el-card>
            </el-aside> -->
            <el-main>
                <el-row>
                    <frameset cols="100%">
                        <frame :src="url1">
                    </frameset>
                </el-row>
            </el-main>
        </el-container>
    </div>
</template>
<script lang="ts">
import { Vue, Provide, Prop, Component,Watch } from 'vue-property-decorator';
import { State, Action, Getter, Mutation } from 'vuex-class';
import QueryEntity from "@/classes/search/QueryEntity";
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi;
import BipInsAidNew from '@/classes/BipInsAidNew';
import QueryCont from "@/classes/search/QueryCont";

@Component({
    components: {
    }
})
export default class AgvOperation extends Vue{
    @State('bipComHeight', { namespace: 'login' }) height!: number;
    style:string="";
    bipInsAid:BipInsAidNew = new BipInsAidNew("");
    DevValues:any=[];
    url1:any = null;
    url2:any = null;
    created(){
        
    }
    async mounted(){
        this.style = "height:"+(this.height?this.height-10:'400')+"px;overflow:hidden;";
        await this.initAllDev();
    }
    /**
     * 查询任务信息
     */
    async initAllDev(){
        let qe: QueryEntity = new QueryEntity("", "");
        qe.page.currPage = 1;
        qe.page.pageSize = 500;
        // if(this.taskName && this.taskName.length>0){
        //     let qCont = new QueryCont('name',this.taskName,12);
        //     qCont.setContrast(3)
        //     let oneCont = [qCont]; 
        //     qe.cont = "~[" + JSON.stringify(oneCont)+"]";
        // }
        let cc = await tools.getBipInsAidInfo("ALLAGVCAMERA", 210, qe);
        this.DevValues = [];
        if(cc.data.id==0){
            this.DevValues = cc.data.data.data.values;
            this.showVideo(this.DevValues[0]);
        }else{
            this.$notify.error("WEBGETITEM ：获取辅助数据失败！");
        }
    }
    showVideo(item:any){
        if(item){
            let port = item.port
            let ip = item.ip;
            let http = "http"
            if(port && port =='443'){
                http="https"
            }
            this.url1 = http+"://"+ip+"/#/AGV/"
            //this.url2 = http+"://"+ip+":"+port+"/video/infrared.html"
            // 可见光视频：http://192.168.33.253/video/HDvideo.html；
            // 红外视频：http://192.168.33.253/video/infrared.html 
        }
    }
    @Watch("height")
    heightWatch(){
        this.style = "height:"+(this.height?this.height-10:'400')+"px;overflow:hidden;";
    }
}
</script>
<style scoped>
.clearfix{
    line-height: 25px;
}
</style>
<style lang="scss">
.ItemKanbanCard{
    overflow-y: auto;
    overflow-x: hidden;
    .el-card__body{
        padding:10px;
    }
}
</style>