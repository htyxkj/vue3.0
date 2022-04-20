<template>
    <el-row>
        <el-scrollbar class="invoice_upload_scrollbar"  wrap-class="scrollbar-wrapper" :style="'height:'+scrollbar_height+'px;'" >
            <!-- <el-row class="title">
                
                
            </el-row> -->
            <el-card class="box-card">
                
                <el-upload class="upload" list-type="picture-card" accept="image/*,application/pdf" :multiple="true" :action="uri" :http-request="uploadFile">
                    <i slot="default" class="el-icon-plus"></i>
                    <div slot="file" slot-scope="{file}">
                        <img class="el-upload-list__item-thumbnail" :src="file.url" :alt="file.name">
                    </div>
                </el-upload>
                 <el-alert title="点击（+）选择发票进行上传(只能上传图片/PDF文件)" type="info" show-icon  :closable="false" ></el-alert>
            </el-card>
            <vxe-table resizable size="mini" auto-resize show-overflow  
                class="vxe-table-element mytable-scrollbar" 
                @checkbox-change="selectChangeEvent"
                @checkbox-all="selectChangeEvent" border stripe highlight-hover-row :data="table_cell.cdata.data" :height="table_height">
                    <vxe-table-column type="checkbox" width="60" align="center"></vxe-table-column>
                    <template v-for="(item,index) in table_cell.ccells.cels"> 
                        <vxe-table-column :key="index" header-align="center" min-width="120" align="center" :field="item.id"
                            :title="item.labelString" show-header-overflow  v-if="!(item.attr & 0x400)>0"
                            show-overflow :sortable ="(item.attr&0x400000)>0">
                            <template v-slot="{rowIndex}"> 
                                <bip-grid-info :cds="table_cell" :cell="item" :row="rowIndex" :bgrid="true" ></bip-grid-info>
                            </template>
                        </vxe-table-column>  
                    </template>
            </vxe-table>
        </el-scrollbar>
    </el-row>
</template>


<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import {  State } from 'vuex-class';
import { GlobalVariable } from '@/utils/ICL';
import {BaseVariable} from "@/utils/BaseICL"
import {BipMenuBtn} from '@/classes/BipMenuBtn'
import { BIPUtil } from "@/utils/Request";
import { Cells } from "@/classes/pub/coob/Cells";
import CDataSet from "@/classes/pub/CDataSet";
import BipGridInfo from "@/components/editorn/grid/BipGridInfo.vue";
import CRecord from "@/classes/pub/CRecord";
@Component({
    components:{BipGridInfo}
})
/**
 * 发票上传
 */
export default class InvoiceUpload extends Vue {
    @State('bipComHeight', { namespace: 'login' }) bipHeight!: number;
    @Prop() openType!: string;
    uri:any = BaseVariable.BaseUri+''+GlobalVariable.API_UPD;
    upLoadDid:any = '';
    sbuid:any='';
    table_cell_id:any='BILLLIST'
    table_cell:any=new CDataSet("");
    table_height:any = 450;
    scrollbar_height:any = 600;
    selData:any = [];//选择的发票明细项目
    async created(){
        this.scrollbar_height = this.bipHeight
        if(this.openType && this.openType=="dialog"){
            this.table_height = 350;
            this.scrollbar_height = this.bipHeight*0.65
        }
    }
    
    async mounted() {
        let query = this.$route.query;
        if(query.pmenuid){
            this.sbuid = query.pmenuid
        }
        if(query.pbuid){
            this.sbuid = query.pbuid
        }
        this.table_cell = await this.getCell(this.table_cell_id)
        this.table_cell.cdata.data = [];
    }

     /**
     * 上传文件
     */
    async uploadFile(param:any){
        let file = param.file
        let name = file.name
        let size = file.size
        let shardSize = 2 * 1024 * 1024,    //以2MB为一个分片
        shardCount = Math.ceil(size / shardSize);  //总片数
        let fkey = this.makePath();
        let pro:any = {};
        for(let i = 0;i < shardCount;i++){
            let start = i * shardSize,end = Math.min(size, start + shardSize);
            let form = new FormData();
            let config:any  = {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                params:{
                    snkey:JSON.parse(window.sessionStorage.getItem('snkey')+''),
                },
                onUploadProgress: (progressEvent:any) => {},
            };
            config.params.name = name;
            config.params.total = shardCount;//总片数
            config.params.fkey = fkey;//一个文件一个key
            config.params.fid = 0;//当前是第几片
            config.params.fjkey = 'BILLLIST';
            config.params.updid = '33';
            form.append("index", i+'');
            form.append("total",shardCount+'');
            // form.append("fjroot",this.root?this.root:'');//fj_500301
            form.append("fjroot",this.upLoadDid);
            form.append("data", file.slice(start,end)); 
            let res = await this.$axios.post(this.uri,form,config);
            if(res.data.id==-1){
                this.$notify.error("上传失败！");
            }else{
                if(res.data.id==0){
                    let data = res.data.data;
                    this.upLoadDid = data.fj_root
                    let fname = data.fname;
                    //调用OCR识别
                    this.getInvoiceValue(fname);
                }
            }
        }
    }

    async getInvoiceValue(fname:any){
        let param = {sbuid:this.sbuid,fj_name:fname,fj_root:this.upLoadDid}
        let btn1 = new BipMenuBtn("DLG"," 数据识别")
        btn1.setDlgType("D")
        btn1.setDlgCont("bip.baidu.serv.ocr.BaiDuApiMultipleInvoice*200;0;1");//数据建模
        let b = JSON.stringify(btn1)
        let v = JSON.stringify(param);
        let res = await BIPUtil.ServApi.getDlgRunClass(v,b);
        if(res.data.id ==0){
            let table_data = res.data.data.data;
            for(var i=0;i<table_data.length;i++){
                let cr = new CRecord();
                cr.data = table_data[i];
                this.table_cell.cdata.data.push(cr);
            }
            this.$notify.success("发票上传完成！");
        }else{
            this.$notify.error(res.data.message);
        }
    }
    makePath(){
        let time = new Date().getTime();
        const key = 999;
        let add1 = Math.floor(Math.random() * (key));
        return add1+"_"+time;
    }
    //获取对象
    async getCell(cellid: string) {
        let res = await BIPUtil.ServApi.getCCellsParams(cellid);
        let rtn: any = res.data;
        if (rtn.id == 0) {
            let kn: Array<Cells> = rtn.data.layCels;
            let cells = kn;
            return new CDataSet(cells[0]);
        } else {
            return new CDataSet("");
        }
    }
    selectChangeEvent(data:any){
        this.selData = data.records;
    }
}
</script>
<style lang="scss" scoped>
.box-card {
    margin: 10px;
    // border: 1px solid red;
}
.title{
    font-size: 19px;
    padding-left: 8px;
}
.upload{
    padding: 8px;
}
</style>
<style lang="scss">
.invoice_upload_scrollbar{
    .el-scrollbar__wrap{
        // height: calc(100% + 12px);
        padding-bottom: 15px;
    }
}

</style>