<template>
    <el-row>
        <div ref="se" @keyup.enter="find">
            <bip-search-cont2 :env="envTj" @invokecmd="invokecmd"></bip-search-cont2>
        </div>
        <el-row v-if="data">
            <el-row>
                <el-col :span="8" class="text-align">
                    <el-card class="box-card">
                        <div class="value">{{data.meat_bl}}</div>
                        <div class="data">料肉比</div>
                    </el-card>
                </el-col>
                <el-col :span="8" class="text-align">
                    <el-card class="box-card">
                        <div class="value">{{data.st_bl}}</div>
                        <div class="data">死淘率</div>
                    </el-card>
                </el-col>
                <el-col :span="8" class="text-align">
                    <el-card class="box-card">
                        <div class="value">{{data.ss_bl}}</div>
                        <div class="data">上市率</div>
                    </el-card>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="8" class="text-align">
                    <el-card class="box-card">
                        <div class="value">{{data.jml_num}}</div>
                        <div class="data">猪苗进量(头)</div>
                    </el-card>
                </el-col>
                <el-col :span="8" class="text-align">
                    <el-card class="box-card">
                        <div class="value">{{data.xsl_num}}</div>
                        <div class="data">猪苗出量(头)</div>
                    </el-card>
                </el-col>
                <el-col :span="8" class="text-align">
                    <el-card class="box-card">
                        <div class="value">{{data.xs_fcy}}</div>
                        <div class="data">成交额(万元)</div>
                    </el-card>
                </el-col>
            </el-row>
        </el-row>
    </el-row>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import {BipMenuBtn} from '@/classes/BipMenuBtn'
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi;
import CDataSet from '@/classes/pub/CDataSet';
import { Cells } from "@/classes/pub/coob/Cells";
import CCliEnv from "@/classes/cenv/CCliEnv";
@Component({
  components: {}
})
export default class FatPigStatistics1 extends Vue {
    //8010TJ
    cellTj:any = new CDataSet("");
    envTj: CCliEnv = new CCliEnv();
    data:any = null;
    created(){
        this.initTj();
    }
    mounted() {   
    }
    async initTj(){
        this.cellTj = await this.getCell("8010TJ");
        this.cellTj.createRecord();
        this.envTj.ds_cont = this.cellTj;
    }
    async initData() {
        let bok = this.checkNotNull(this.cellTj); 
        if(!bok)
            return ; 
        let btn1 = new BipMenuBtn("DLG"," 追加期间")
        btn1.setDlgType("D")
        btn1.setDlgCont("breeding.serv.FatPigManage*200;0;0");//职能损益表
        let b = JSON.stringify(btn1)
        let prarm = {
            "pc":this.cellTj.currRecord.data.pc
        }
        let v = JSON.stringify(prarm);
        let res = await tools.getDlgRunClass(v,b);
        if(res.data.id ==0){
            this.data = res.data.data;
        }else{
            this.$notify.error(res.data.message)
        }
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
    //按钮 点击是回调方法
    invokecmd(type:any){
        let cmd = type.cmd;
        if(cmd == "CLEAR"){
            if(this.cellTj.ccells && this.cellTj.ccells.cels.length){
                for(var i=0;i<this.cellTj.ccells.cels.length;i++){
                    let cel = this.cellTj.ccells.cels[i];
                    if((cel.attr & 0x400 )<=0)
                        this.cellTj.currRecord.data[cel.id] = null;
                }
            }
        }else if(cmd == "FIND"){
            this.initData();
        }
    }
    
    //条件非空校验
    checkNotNull(cds:CDataSet,showMsg:boolean=true):boolean{ 
        let bok = true;
        cds.ccells.cels.forEach(item => {
            if (item.unNull&&bok) {
                let vl = null; 
                if(cds.currRecord.data[item.id]!=null)
                    vl = cds.currRecord.data[item.id]+'';
                if (!vl) {
                    if(showMsg)
                    this.$notify.warning( "【" + item.labelString + "】不能为空!");
                    bok =  false;
                    return false;
                }
            }
        }); 
        return bok;
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