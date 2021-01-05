<template>
    <el-container>
        <el-header style="padding: 20px 0px;">
            <el-row class="bip-lay" >
                <el-form @submit.native.prevent label-position="right" label-width="100px">
                    <div v-for="(cel,index) in tjCell.ccells.cels" :key="'A'+index" >
                        <bip-comm-editor v-if="(cel.attr&0x400) <= 0 " :cell="cel" :bgrid="false" :cds="tjCell" :row="0" />
                    </div> 
                </el-form>
            </el-row>
        </el-header>
        <el-container>
            <el-aside width="400px">
                
            </el-aside>
            <el-container>
                <el-main style="padding:0px">
                    
                </el-main>
            </el-container>
        </el-container>
    </el-container>
</template>
<script lang="ts">
import { Component, Vue, Provide, Watch } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from "vuex-class";
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi;
import { Cells } from "@/classes/pub/coob/Cells";
import CDataSet from "@/classes/pub/CDataSet";
@Component({
  components: {},
})
export default class PreviewArticle extends Vue {
    tjCell:CDataSet= new CDataSet("");
    tjCellID:any="A0001917TJ";
    async created() {
        this.tjCell = await this.getCell(this.tjCellID);
    } 

    async getCell(cellid:string){
        let res = await tools.getCCellsParams(cellid); 
        let rtn: any = res.data; 
        if (rtn.id == 0) {
        let kn: Array<Cells> = rtn.data.layCels;
        let cells = kn; 
        return new CDataSet(cells[0]);  
        }else{
        return new CDataSet('');
        }
    }
}
</script>
<style scoped lang="scss" >
</style>