<template>
    <el-col :span="span" :xs="24" :sm="24" :md="span">
        <el-form-item :label="cell.labelString" class="bip-input-item" :required="cell.isReq">
            <div class="ueditor" :id="id" ></div>
        </el-form-item>
        <!-- <div class="title" v-if="!cell.isReq">{{cell.labelString}}</div>
        <div v-else class="title2">{{cell.labelString}}*</div>
        <div class="ueditor" :id="id" ></div> -->
    </el-col>
</template>
<script lang="ts">
//插件 API https://github.com/wangfupeng1988/wangEditor
import {BaseVariable} from "@/utils/BaseICL"
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import CDataSet from '@/classes/pub/CDataSet';
import { Cell } from '@/classes/pub/coob/Cell';
import { CommICL } from '@/utils/CommICL';
import E  from 'wangeditor';
let icl = CommICL
@Component({})
export default class BipRichTextEditor extends Vue{
    @Prop() cds!:CDataSet
    @Prop() cell!:Cell
    @Prop() row!:number
    @Prop() model:any
    @Prop() bgrid!:boolean
    @Provide() model1:any = ''
    @Provide() clearable:boolean = true
    @Provide() methodName:string = ''
    @Provide() span:number = 6
    @Provide() id :any = ""
    @Provide() upLoadDid:string = ''//附件路径
    @Provide() uri:string='upd'//附件操作接口
    created(){
        this.id = this.cell.id;
        let snkey = window.sessionStorage.getItem('snkey');
        this.uri = BaseVariable.BaseUri+'/upd'
    }
    mounted(){
        this.model1 = this.model       
        if(this.bgrid){
            this.span = 24
        }else{
            this.span = Math.round(24/this.cds.ccells.widthCell*this.cell.ccHorCell)
        }
        this.methodName = icl.EV_CELL_CHANGE+'_'+this.cds.ccells.obj_id+'_'+this.cell.id 
        this.create();
    }
    create(){ 
        var _this = this;
        var editor:any = new E('#'+this.id) 
        editor.customConfig.uploadImgShowBase64 = true;//以base64保存图片文件
        editor.customConfig.menus = [
            'head',  // 标题 
            'bold',  // 粗体
            'fontSize',  // 字号
            'fontName',  // 字体
            'italic',  // 斜体
            'underline',  // 下划线
            'strikeThrough',  // 删除线
            'foreColor',  // 文字颜色
            'backColor',  // 背景颜色
            'link',  // 插入链接
            'list',  // 列表
            'justify',  // 对齐方式
            'quote',  // 引用
            'emoticon',  // 表情
            'image',  // 插入图片
            'table',  // 表格
            // 'video',  // 插入视频
            // 'code',  // 插入代码
            'undo',  // 撤销
            'redo'  // 重复
        ]
        //内容发生变化
        editor.customConfig.onchange = function (html:any) {
            // html 即编辑器中的内容 
            _this.dataChange(html);
        }
        editor.customConfig.customUploadImg = async function (files:any, insert:any) {
            // files 是 input 中选中的文件列表
            // insert 是获取图片 url 后，插入到编辑器的方法 上传代码返回结果之后，将图片插入到编辑器中
            let imgUrl = await _this.uploadFile(files);
            insert(imgUrl)
        }
        editor.create();
        let snkey = JSON.parse(window.sessionStorage.getItem('snkey')+'')
        snkey = encodeURIComponent(snkey);
        let cc = this.model1.replace(/snkey={BIPSNKEY}/g,'snkey='+snkey);
        editor.txt.html(cc);
    } 
    async uploadFile(param:any){
        let imgUrl = "";
        let dfconfig:any = {
            headers: {
            'Content-Type': 'multipart/form-data'
            },
            params:{
                snkey:JSON.parse(window.sessionStorage.getItem('snkey')+''),
            }
        }
        let file = param[0]
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
            form.append("fjroot",this.upLoadDid);
            form.append("data", file.slice(start,end)); 

            await this.$axios.post(this.uri,form,config).then((res)=>{
                if(res.data.id==-1){
                    this.$notify.error("上传失败！");
                }else{
                    succeed++;
                    if(res.data.id==0){
                        let dir = res.data.data.fj_root;
                        if(!this.upLoadDid){
                            this.upLoadDid = dir
                        }
                        let name = res.data.data.fname;
                        let snkey = JSON.parse(window.sessionStorage.getItem('snkey')+'');
                        let fjroot = this.upLoadDid
                        let updid =  '36';
                        snkey = encodeURIComponent(snkey);
                        imgUrl = this.uri+'?snkey='+snkey+'&fjroot='+fjroot+'&updid='+updid+'&fjname='+name;
                        return imgUrl;
                    }
                }
            });
        }
        return imgUrl;
    }
    makePath(){
        const key = 999;
        let add1 = Math.floor(Math.random() * (key));
        return add1;
    } 

    dataChange(value:string){
        if(this.cds&&this.cell){
            if(this.cds.currCanEdit()){
                let snkey = JSON.parse(window.sessionStorage.getItem('snkey')+'')
                snkey = encodeURIComponent(snkey);
                let cc = 'snkey='+snkey;
                // this.model1= value.replace(/'+cc+'/g,'{BIPSNKEY}');
                this.model1= value.replace(new RegExp(cc,'gm'),'snkey={BIPSNKEY}')
                console.log(this.model1)
                this.cds.currRecord.data[this.cell.id] = this.model1;
                this.cds.cdata.data[this.cds.index] = this.cds.currRecord;
                if(this.cds.baseI){
                    this.cds.baseI.cellDataChange(this.cds,this.cell.id,this.model1)
                }
                this.cds.setStateOrAnd(icl.R_EDITED)
                this.cds.checkGS(this.cell);
                this.cds.currRecord.c_state |= 2;
            }else{
                this.model1 = this.model
            }
        }   
    }
    @Watch("model")
    cdataSetRecordChange(){
        if(this.cds&&this.cell){
            if( this.model !== this.model1){
                this.model1 = this.model
                this.create();
            }
        }
    }
}
</script>
<style scoped>
.ueditor{
    z-index:1;
    width:100%
}
.title{
    color: #303439;
    font-size: 14px;
    line-height: 40px;
}
.title2{
  font-weight: 700;
  font-size:  14px;
  color: rgba(179, 1, 19, 0.81);
}
</style>
