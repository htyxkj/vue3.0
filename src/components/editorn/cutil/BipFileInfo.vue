<template>
  <el-dialog
    :title="title"
    class="bip-file"
    :visible.sync="outerVisible"
    :append-to-body="true"
    :close-on-press-escape="true"
    :close-on-click-modal="false"
  >
    <el-tabs v-model="activeName">
      <el-tab-pane label="文件上传" name="file-up">
        <el-upload
          class="upload-demo"
          ref="upload"
          :multiple="true"
          :action="uri"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          :before-remove="beforeRemove"
          :file-list="fileList"
          :auto-upload="false"
          list-type="text"
          :http-request="uploadFile"
        >
          <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
          <el-button
            style="margin-left: 10px;"
            size="small"
            type="success"
            @click="submitUpload"
          >上传到服务器</el-button>
          <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
        </el-upload>
      </el-tab-pane>
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
              <!-- <span style="margin-left: 10px">{{ scope.row.status}}</span> -->
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
      <el-button size="small" @click="cancel()">取 消</el-button>
      <el-button size="small" type="primary" @click="selectOK">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script lang="ts">
//辅助query
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import { BIPUtil } from "@/utils/Request";
import {BaseVariable} from "@/utils/BaseICL"
import CDataSet from '@/classes/pub/CDataSet';
import { Cell } from '@/classes/pub/coob/Cell';
let tools = BIPUtil.ServApi
import { CommICL } from '@/utils/CommICL';
let icl = CommICL
@Component({})
export default class BipFileInfo extends Vue {
    @Prop() cds!: CDataSet;
    @Prop() cell!: Cell;
    @Prop() index!: number;
    @Provide() outerVisible: boolean = false;
    @Provide() title = "文件上传下载";
    @Provide() fileList: Array<any> = [];
    @Provide() activeName: string = "file-up";
    @Provide() uri:string='upd'//附件操作接口
    @Provide() upLoadDid:string = ''
    @Provide() fj_root_index = -1
    created(){
        let snkey = window.sessionStorage.getItem('snkey');
        this.uri = BaseVariable.BaseUri+'/upd'
    }
    mounted() {
        if(this.cds&&this.cell){
            this.findFJRootIndex()
            if(this.fj_root_index>-1)
                this.makefjRoot()
        }
    }

    findFJRootIndex(){
        if(this.cds){
            let cels:Array<any> = this.cds.ccells.cels
            this.fj_root_index = cels.findIndex(cell=>cell.id==='fj_root')
        }
    }

    open() {
        this.outerVisible = true;
    }

    /**
     * 上传文件
     */
    uploadFile(param:any){
        console.log(param)
        let dfconfig:any = {
            headers: {
            'Content-Type': 'multipart/form-data'
            },
            params:{
                snkey:JSON.parse(window.sessionStorage.getItem('snkey')+''),
            }
        }
        let file = param.file
        let name = file.name
        let size = file.size
        let succeed = 0;
        let shardSize = 2 * 1024 * 1024,    //以2MB为一个分片
        shardCount = Math.ceil(size / shardSize);  //总片数
        let fkey = this.makePath();
        for(let i = 0;i < shardCount;i++){
            let start = i * shardSize,end = Math.min(size, start + shardSize);
            let form = new FormData();
            let config  = dfconfig;
            config.params.name = name;
            config.params.total = shardCount;//总片数
            config.params.fkey = fkey;//当前是第几片
            config.params.fid = 0;//当前是第几片
            config.params.fjkey = this.cds?this.cds.ccells.obj_id:'aaa';
            config.params.updid = '33';
            form.append("index", i+'');
            form.append("total",shardCount+'');
            // form.append("fjroot",this.root?this.root:'');//fj_500301
            form.append("fjroot",this.upLoadDid);
            form.append("data", file.slice(start,end)); 

            this.$axios.post(this.uri,form,config).then((res)=>{
            console.log(res);
            if(res.data.id==-1){
                this.$notify.error("上传失败！");
            }else{
                succeed++;
                if(res.data.id==0){
                    this.$notify.success( "上传完成！")
                    param.onSuccess(res)
                    let dir = res.data.data.fj_root;
                    if(!this.upLoadDid){
                        this.upLoadDid = dir
                    }
                    let name = res.data.data.fname;
                    let f1 = {name:name,url:this.uri+'/'+this.upLoadDid+'/'+name+"?imageMogr2/thumbnail/360x360/format/webp/quality/101",status:'success'}
                    this.fileList.push(f1)
                }
            }
            });
        } 

    }
    makePath(){
        const key = 999;
        let add1 = Math.floor(Math.random() * (key));
        return add1;
    }


    submitUpload() {
        let upload: any = this.$refs.upload;
        if (upload) upload.submit();
    }

    beforeRemove(file:any, fileList:any) {
        return this.$confirm(`确定移除 ${ file.name }？`);
    }
    async handleRemove(file: any, fileList: any) {
        console.log(file, fileList);
        var name = file.name;
        var params = {
        snkey: JSON.parse(window.sessionStorage.getItem('snkey')+''),
        fjroot: this.upLoadDid,
        fjname: name,
        updid: '34'
      }
      if(file&&file.name){
            let res = await tools.fileOPeration(params);
            if(res.data.id==0){
                let i = this.fileList.findIndex(f1=>{
                    return f1 == file
                });
                this.fileList.splice(i,1)
            }
      }
        
       
    }
    handlePreview(file: any) {
        console.log(file);
    }

    cancel() {
        console.log("取消");
        this.outerVisible = false;
    }

    selectOK() {
        if(this.$refs.upload){
            let upload:any = this.$refs.upload
            let files:Array<any> = upload.uploadFiles
            console.log(files)
            if(files&&files.length>0){
                let f2:Array<any> = files.filter(f1=>f1.status != 'success')
                if(f2&&f2.length>0){
                    this.$alert('有未上传的文件，请上传文件！','',{type:'error'});
                    return 
                }
                if(this.cds&&this.cell){
                    let record:any = this.cds.currRecord
                    if(this.fj_root_index>0){
                        record['fj_root'] = this.upLoadDid
                    }
                    let fis = ''
                    this.fileList.forEach(file => {
                        fis += file.name+';'
                    });
                    if(fis.length>0)
                        fis = fis.substring(0,fis.length-1)
                    record[this.cell.id] = fis   
                    this.cds.setStateOrAnd(icl.R_EDITED)
                    this.$bus.$emit('cell_edit');
                }
            }else{
                if(this.cds&&this.cell){
                    let record:any = this.cds.currRecord
                    if(this.fj_root_index>0){
                        record['fj_root'] = this.upLoadDid
                    }
                    let fis = ''
                    this.fileList.forEach(file => {
                        fis += file.name+';'
                    });
                    if(fis.length>0)
                        fis = fis.substring(0,fis.length-1)
                    record[this.cell.id] = fis   
                    this.cds.setStateOrAnd(icl.R_EDITED)
                    this.$bus.$emit('cell_edit');
                }
            }
        }
        console.log(this.$refs.upload);
        this.outerVisible = false
        console.log("确定");
        this.$emit('select',true)
        // this.outerVisible = false
    }

    close(){
        this.outerVisible = false;
    }

    handleDown(index:number,file:any) {
        let name = file.name;
        let snkey = JSON.parse(window.sessionStorage.getItem('snkey')+'');
        let fjroot = this.upLoadDid
        let updid =  '36';
        window.open(this.uri+'?snkey='+snkey+'&fjroot='+fjroot+'&updid='+updid+'&fjname='+name);
    }

    makefjRoot(){
        if(this.cds&&this.cell){
            let record:any
            let _i = this.index==-1?0:this.index
            if(this.index){
                record = this.cds.cdata.data[this.index]
            }else{
                record = this.cds.currRecord
            }
            this.upLoadDid = record?record['fj_root']:'';
            if(!this.upLoadDid){
                this.upLoadDid = ''
            }
        }
    }
}
</script>


