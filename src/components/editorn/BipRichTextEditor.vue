<template>
    <el-col :span="span" :xs="24" :sm="24" :md="span">
        <!-- <el-form-item :label="cell.labelString" class="bip-input-item" :required="cell.isReq">
            <el-input :style="cell.desc?'width: calc(100% - 29px);':''" v-model="model1" size="small" :clearable="clearable" :disabled="(cell.attr&0x40)>0" @change="dataChange"></el-input>
        </el-form-item> -->
        <div class="title" v-if="!cell.isReq">{{cell.labelString}}</div>
        <div v-else class="title2">{{cell.labelString}}*</div>
        <div class="ueditor" :id="id" ></div>
    </el-col>
</template>
<script lang="ts">
//插件 API https://github.com/wangfupeng1988/wangEditor
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
    created(){
        this.id = this.cell.id;
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
        // import('wangeditor').then( E => { 
            // var E:any = module;
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
            // let imgUrl = await _this.upLoadSliceF(files);
            // insert(imgUrl)
            }
            editor.create();
            editor.txt.html(_this.model1);
        // });
    } 
    // async upLoadSliceF(arg:any,_idx:any){ 
    //     let imgUrl = "";
    //     let dfconfig = {
    //         headers: {
    //         'Content-Type': 'multipart/form-data'
    //         },
    //         params:{
    //         snkey:JSON.parse(window.sessionStorage.getItem('snkey')),
    //         }
    //     };
    //     var file = arg[0],name = file.name,size = file.size;
    //     var succeed = 0;
    //     var shardSize = 2 * 1024 * 1024,    //以2MB为一个分片
    //     shardCount = Math.ceil(size / shardSize);  //总片数
    //     var fkey = this.makePath();
    //     const url = global.BIPAPIURL+global.API_UPD;
    //     for(var i = 0;i < shardCount;i++){
    //         var start = i * shardSize,end = Math.min(size, start + shardSize);
    //         var form = new FormData();
    //         var config  = dfconfig;
    //         config.params.name = name;
    //         config.params.total = shardCount;//总片数
    //         config.params.fkey = fkey;//当前是第几片
    //         config.params.fid = _idx;//当前是第几片
    //         config.params.fjkey = this.cell.c_par.obj_id;
    //         config.params.updid = global.APIID_FILEUP;
    //         form.append("index", i);
    //         form.append("total",shardCount);
    //         form.append("fjroot",this.upLoadDid);
    //         form.append("data", file.slice(start,end));  //slice方法用于切出文件的一部分
    //         await axios.post(url,form,config).then((res)=>{
    //         // console.log(res);
    //         if(res.data.id==-1){ 
    //             this.$notify.danger({ content: "图片上传失败！", placement: "mid-center" }); 
    //         }else{
    //             succeed++;
    //             var pro = res.data.data.pros;
    //             var id = res.data.data.fid;
    //             // this.setProgress(id,pro);
    //             if(res.data.id==0){  
    //             this.upLoadDid = res.data.data.fj_root;
    //             var name = res.data.data.fname;
    //             var snkey = JSON.parse(window.sessionStorage.getItem('snkey'));
    //             var fjroot = this.upLoadDid;
    //             var updid =  global.APIID_FILEDOWN;
    //             imgUrl = global.BIPAPIURL+global.API_UPD+'?snkey='+snkey+'&fjroot='+fjroot+'&updid='+updid+'&fjname='+name;
    //             return imgUrl;
    //             }
    //         }
    //         });
    //     }
    //     return imgUrl;
    // }

    dataChange(value:string|number){
        if(this.cds&&this.cell){
            if(this.cds.currCanEdit()){
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
