<template>
    <div>
        <div>
            <el-row :gutter="20">
                <el-col :span="18" @click="open()">
                    <div style="line-height: 38px;">{{model}}</div>
                </el-col>
                <el-col :span="6">
                    <i class="el-input__icon el-icon-document" @click="open()"></i>
                </el-col>
            </el-row>
        </div>
        <el-dialog :title="title" class="bip-file" :visible.sync="outerVisible" :append-to-body="true" :close-on-press-escape="true" :close-on-click-modal="false" :before-close="cancel">
            <el-tabs v-model="activeName">
                <el-tab-pane label="文件下载" name="file-down">
                    <el-table size="small" stripe :data="fileList" style="width: 100%">
                        <el-table-column label="文件名称" :show-overflow-tooltip="true">
                            <template slot-scope="scope">
                            <i class="el-icon-document"></i>
                            <span style="margin-left: 10px">{{ scope.row.name }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column :align="'center'" label="状态">
                            <template slot-scope="scope">
                            <el-tag :type="scope.row.status">{{ scope.row.status}}</el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column :show-overflow-tooltip="true" :align="'center'" label="地址">
                            <template slot-scope="scope">
                            <span style="margin-left: 10px">{{ scope.row.url}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                            <el-button size="mini" type="danger" @click="handleDown(scope.$index, scope.row)">下载</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>

            <span slot="footer" class="dialog-footer">
            <el-button size="small" type="primary" @click="cancel">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script lang="ts">
//辅助query
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import {BaseVariable} from "@/utils/BaseICL"
import CDataSet from '@/classes/pub/CDataSet';
import { Cell } from '@/classes/pub/coob/Cell';
import { GlobalVariable } from '@/utils/ICL';
import CCliEnv from '@/classes/cenv/CCliEnv'
@Component({})
export default class BipFileInfo extends Vue {
    @Prop() env!:CCliEnv    
    @Prop() cds!: CDataSet;
    @Prop() cell!: Cell;
    @Prop() model!:string
    @Prop() index!: number;
    outerVisible: boolean = false;
    title = "文件下载";
    fileList: Array<any> = [];
    activeName: string = "file-down";
    uri:string=GlobalVariable.API_UPD//附件操作接口
    upLoadDid:string = ''
    showUpPage:boolean = true;
    canUpFile:boolean = true;
    fjrootCell:Cell = new Cell();//附件路径对象
    created(){
        let snkey = window.sessionStorage.getItem('snkey');
        this.uri = BaseVariable.BaseUri+''+GlobalVariable.API_UPD
        if(this.env){
            let pattr = this.env.uriParams.pattr;
            if((pattr & 0x40 ) <= 0){//菜单参数中未勾选保存属性
                this.showUpPage = false;
            }
        }
    }
    mounted() {
        console.log("mounted")
        if(this.cds&&this.cell){
            if(this.cds){
                let cels = this.cds.ccells.cels;
                for(var i=0;i<cels.length;i++){
                    let cel = cels[i];
                    if(cel.id == 'fj_root'){
                        this.fjrootCell = cel;
                        break;
                    }
                    if(cel.id == this.cell.id){
                        this.fjrootCell = cels[i-1];
                    }
                }
            }
            this.makefjRoot()
        }
    }
    open() {
        this.makefjRoot();
        this.canUpFile = true;
        this.fileList = [];
        if(!this.upLoadDid)
            this.upLoadDid = "";
        let fileName = this.model
        if(fileName && fileName.length>0){
            let nameArr = fileName.split(";");
            for(var i=0;i<nameArr.length;i++){
                let name = nameArr[i];
                let f1 = {name:name,url:this.uri+'/'+this.upLoadDid+'/'+name+"?imageMogr2/thumbnail/360x360/format/webp/quality/101",status:'success'}
                this.fileList.push(f1)
            }
        }
        this.outerVisible = true;
    }
    uploadVideoProcess(){
    }
    makePath(){
        let time = new Date().getTime();
        const key = 999;
        let add1 = Math.floor(Math.random() * (key));
        return add1+"_"+time;
    }
    cancel() {
        this.outerVisible = false;
    }
    close(){
        this.outerVisible = false;
    }
    /**
     * 下载文件
     */
    handleDown(index:number,file:any) {
        let name = file.name;
        let snkey = JSON.parse(window.sessionStorage.getItem('snkey')+'');
        let fjroot = this.upLoadDid
        let updid =  '36';
        snkey = encodeURIComponent(snkey);
        window.open(this.uri+'?snkey='+snkey+'&fjroot='+fjroot+'&updid='+updid+'&fjname='+name);
    }
    makefjRoot(){
        if(this.cds&&this.cell){
            let record:any = this.cds.getRecordAtIndex(this.index>-1?this.index:0);
            this.upLoadDid = record?record.data[this.fjrootCell.id]:'';
            if(!this.upLoadDid){
                this.upLoadDid = ''
            }
        }
    }
}
</script>


