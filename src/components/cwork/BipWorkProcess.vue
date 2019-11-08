<template>
    <div>
        <el-dialog title="流程查看" :visible.sync="opendlg" width="40%" append-to-body>
            <div>
                <div v-for="(item,index) in info" >
                    <div class="div2-1" v-if=" (item.stfr == '驳回' || item.stfr == '新建')">
                        <img class="image2" src="@/assets/check/process/process_ty.png">
                        <div class="div3">
                        <div style="float:left;">&nbsp;&nbsp;{{item.namefr}}<br/>&nbsp;&nbsp;
                            <span style="color:#8FB95C;font-size: 10px">发起申请</span>
                        </div>
                        <div class="div4">
                            <span style="font-size:11px">
                            {{item.datefr}}
                            </span>
                        </div>
                        </div>
                    </div>
                    <div class="div2-1">
                        <img class="image2" v-if="item.cid < 0 && item.cid != -20000" src="@/assets/check/process/process_bh.png">
                        <img class="image2" v-else-if="item.cid == -20000" src="@/assets/check/process/process_ds.png">
                        <img class="image2" v-else src="@/assets/check/process/process_ty.png">
                        <div class="div3">
                        <div style="float:left;">&nbsp;&nbsp;{{item.nameto}}<br/>&nbsp;&nbsp;
                            <span style="color:#8FB95C;font-size: 10px">{{item.stto}}</span>
                        </div>
                        <div class="div4">
                            <span style="font-size:11px">
                            {{item.dateto}}
                            </span>
                        </div>
                        <div class="div4">
                            <img class="image3" v-if="item.cid <0 && item.cid != -20000" src="@/assets/check/process/process_bh1.png">
                            <img class="image3" v-else-if="item.cid == -20000" src="@/assets/check/process/process_ds1.png">
                            <img class="image3" v-else src="@/assets/check/process/process_ty1.png">
                        </div>
                        </div>
                    </div> 
                </div> 
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="close()">取 消</el-button>
            </span>  
        </el-dialog> 
    </div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch, Emit } from "vue-property-decorator"
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi
@Component({})
export default class BipWorkProcess extends Vue{
    @Provide() chkinfo:any;
    @Provide() info:Array<any> = [];
    @Provide() oneRow:any = {};
    @Provide() opendlg:boolean = false;

    async open(ceaParams:any){ 
        let res = await tools.getCheckInfo(ceaParams,35);
            if(res.data.id == 0){
            this.info = res.data.data.info;
        } 
        let res1 = await tools.getCheckInfo(ceaParams,35);
        if(res1.data.id == 0){
            this.chkinfo = res1.data.data.info;
        }
        if(this.chkinfo && this.chkinfo.chkInfos && this.chkinfo.chkInfos.length>0){
            let data = this.info[this.info.length-1];
            if(data && !data.nameto){
                let name ="";
                this.chkinfo.chkInfos .forEach((item:any)=> {
                    name += item.userName+" , "
                });
                name = name.substring(0,name.length-1)
                this.info[this.info.length-1].nameto=name; 
                this.info[this.info.length-1].cid=-20000; 
            }
        }
        this.oneRow = this.info[0];  
        this.opendlg = true;    
    }
    close(){
        this.opendlg = false;
    }
}
</script>