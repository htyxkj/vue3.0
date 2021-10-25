<template>
    <div>
        <el-dialog class="bipinsaid"  :visible.sync="opendlg" width="40%" append-to-body>
            <span slot="title">
                <div class="el-dialog__title" style="padding-bottom:5px">流程查看</div>
            </span>
            <div v-if="info.length > 0">
                <div v-for="(item,index) in info" :key="index" >
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
                        <div class="div5">
                            <span style="font-size:11px">
                            {{item.dscto}}
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
            <div v-else class="nodata-box">
                暂无审批流程
            </div>
            <!-- <span slot="footer" class="dialog-footer">
                <el-button @click="close()">关   闭</el-button>
            </span>   -->
        </el-dialog> 
    </div>
</template>
<script lang="ts">
/**
 * 审批流程查看页面
 */
import { Component, Vue, Provide, Prop, Watch, Emit } from "vue-property-decorator"
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi
@Component({})
export default class BipWorkProcess extends Vue{
    chkinfo:any;
    info:Array<any> = [];
    oneRow:any = {};
    opendlg:boolean = false;

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
<style lang="scss" scoped> 
  .image2 {
    margin-left: -13px;
    margin-top: 34px;
    width: 26px;
    height: 26px;
    border-radius: 200px;
  }
  .div1 {
    background-color: #eeeeee;
    width: 100%;
    height: 100%; 
  }
  .div2-1 {
    background-color: #F0EFF4;
    border-left: 3px solid #E6E5EA;
    padding: 10px 15px;
    // margin-left: 20px;
    // padding-bottom: 13px;
  }
  .div3 {
    background-color: #FFFFFF;
    height: 65px;
    // width: 85%;
    margin: auto;
    margin-top: -43px;
    color: #999;
    font-size: 11px;
    padding-bottom: 8px;
    padding-top: 8px;
    padding-left: 14px;
  }
  .div4 {
    margin-top: -5px;
    float: right;
    height: 100%;
    margin-right: 3px;
    // max-width: 80px;
  }
  .div5{
    margin-top: 34px;
    float:left; 
    height:100%;
    margin-left: 6px;
    position: relative;
  }
  .image3 {
    width: 50px;
    height: 34px;
    position: absolute;
    right: 30%;
    margin-top: 14px;
  }
  .nodata-box {
      height: 100px;
      line-height: 100px;
      text-align: center;
      letter-spacing: 8px;
  }
</style>