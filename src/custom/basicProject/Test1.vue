<template>
    <el-row>
        <el-form label-position="right" label-width="120px" >
            <bip-comm-editor  v-for="(cel,index) in cell.ccells.cels" :key="index" :cell="cel" :cds="cell" :row="cell.index" />
        </el-form>
        <el-button @click="saveData">保存</el-button>
        <el-button @click="initData">查找</el-button>
        <el-button @click="getAssistData">查找辅助</el-button>
    </el-row>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi;
import CDataSet from '@/classes/pub/CDataSet';
import { Cells } from "@/classes/pub/coob/Cells";
import QueryEntity from '@/classes/search/QueryEntity';
import QueryCont from '@/classes/search/QueryCont';
@Component({
  components: {}
})
export default class Test extends Vue {
    cell:any = new CDataSet("");
    params:any = {};
    
    async created(){
        let cellId = "EX0305"
        let res = await this.getCell(cellId);
        this.cell = res;
        if(res.ccells){
            this.cell.createRecord();
        }
    }
    mounted() {
        this.params = this.$route.params;
        this.initGetVal()
    }
    async initTj(){
         
    }
    async initData() {
        let dataStr = "{sid:'A0000001'}";
        let qe:QueryEntity = new QueryEntity("EX0305","EX0305TJ",dataStr);
        qe.page.pageSize=20
        let vv = await tools.query(qe);
        console.log(vv)
    }
    async saveData(){
        let res = await this.cell.saveData();
        console.log(res)
    }
    //获取对象
    async getCell(cellid: string) {
        let res = await tools.getCCellsParams(cellid);
        let rtn: any = res.data;
        if (rtn.id == 0) {
            let kn: Array<Cells> = rtn.data.layCels;
            let cells = kn;
            return new CDataSet(cells[0]);
        } else {
            return new CDataSet("");
        }
    }
    //调用辅助查询数据
    async getAssistData(){
        let qe:QueryEntity = new QueryEntity('','');
        qe.page.currPage = 1;
        qe.page.pageSize = 20;
        qe.cont = "";

        let allCont = [];
        let oneCont = []; 
        //classes/search/QueryCont'; 有详细说明
        let qCont = new QueryCont('usrcode','admin',12);
        qCont.setContrast(3);
        oneCont.push(qCont);
        if(oneCont.length !=0){
        allCont.push(oneCont);
            qe.cont = "~" + JSON.stringify(allCont);
        }else{
            qe.cont = "";
        }
        let vv = await tools.getBipInsAidInfo('SOPR',200,qe);
        console.log(vv);
    }
    async initGetVal(){
        if(this.params){
            if(this.params.method =='dlg'){//DLG 关联
                console.log(this.params)
            }
        }
    }
}
</script>
<style lang="scss" scoped>
    .text-align{
        padding:.3125rem;
        text-align: center;
        .value{
            font-size: .46875rem;
        }
        .data{
            font-size: .3rem;
        }
    }
</style>