<template>
    <el-col :span="span" :xs="24" :sm="24" :md="span" style="padding-bottom:8px">
        <el-form-item :label="cell.labelString" class="bip-input-item" :required="cell.isReq">
            <vue-ueditor-wrap :id="id" v-model="model1" :config="myConfig"></vue-ueditor-wrap>
        </el-form-item>
    </el-col>
</template>
<script lang="ts">
//插件 API https://github.com/wangfupeng1988/wangEditor
import {BaseVariable} from "@/utils/BaseICL"
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import CDataSet from '@/classes/pub/CDataSet';
import { Cell } from '@/classes/pub/coob/Cell';
import { CommICL } from '@/utils/CommICL';
import { GlobalVariable } from '@/utils/ICL';
import E  from 'wangeditor';
let icl = CommICL
import VueUeditorWrap from 'vue-ueditor-wrap'
@Component({
    components: {VueUeditorWrap}
})
export default class BipRichTextUEditor extends Vue{
    @Prop() cds!:CDataSet
    @Prop() cell!:Cell
    @Prop() row!:number
    @Prop() model:any
    @Prop() bgrid!:boolean
    myConfig:any = {};//配置文件
    snkey:any ="";
    @Provide() model1:any = null
    @Provide() span:number = 6
    @Provide() id :any = ""
    @Provide() upLoadDid:string = ''//附件路径
    @Provide() uri:string=GlobalVariable.API_UPD//附件操作接口
    created(){
        this.id = this.cell.id;
        let sk = window.sessionStorage.getItem('snkey')
        if(sk)
            this.snkey = JSON.parse(sk);
        this.uri = BaseVariable.BaseUri+''+GlobalVariable.API_UPD
    }
    mounted(){
        if(this.bgrid){
            this.span = 24
        }else{
            this.span = Math.round(24/this.cds.ccells.widthCell*this.cell.ccHorCell)
        }
        this.create();
    }
    create(){ 
        this.myConfig = {
            // 编辑器不自动被内容撑高
            autoHeightEnabled: false,
            // 初始容器高度
            initialFrameHeight: 240,
            // 初始容器宽度
            initialFrameWidth: '100%',
            // 上传文件接口（这个地址是我为了方便各位体验文件上传功能搭建的临时接口，请勿在生产环境使用！！！）
            // serverUrl: 'http://35.201.165.105:8000/controller.php',
            serverUrl:'http://192.168.124.4:8089/UeditorServer/FileUDPServlet?updid=38&snkey=yI6tKRPR$W9S',
            // UEditor 资源文件的存放路径，如果你使用的是 vue-cli 生成的项目，通常不需要设置该选项，vue-ueditor-wrap 会自动处理常见的情况，如果需要特殊配置，参考下方的常见问题2
            UEDITOR_HOME_URL: '/static/UEditor/'
        }
    }
    dataChange(value:string){
        if(this.cds&&this.cell){
            if(this.cds.currCanEdit()){
                let cc = 'snkey='+this.snkey;
                value= value.replace(new RegExp(cc,'gm'),'snkey={BIPSNKEY}')
                value= value.replace(new RegExp(this.uri,'gm'),'{BIPURI}')
                this.cds.currRecord.data[this.cell.id] = value;
                this.cds.cdata.data[this.cds.index] = this.cds.currRecord;
                if(this.cds.baseI){
                    this.cds.baseI.cellDataChange(this.cds,this.cell.id,value)
                }
                this.cds.setStateOrAnd(icl.R_EDITED)
                this.cds.checkGS(this.cell);
                this.cds.currRecord.c_state |= 2;
                if(this.cds.ds_par){
                    this.cds.ds_par.currRecord.c_state |= 2;
                }
            }else{
                this.model1 = this.model
                this.model1 = this.model1.replace(/snkey={BIPSNKEY}/g,'snkey='+this.snkey);
                this.model1 = this.model1.replace(/{BIPURI}/g,this.uri)
            }
        }   
    }
    @Watch("model1")
    dataVlaueChange(){
        this.dataChange(this.model1);
    }

    @Watch("model")
    cdataSetRecordChange(){
        if(this.cds&&this.cell){
            if( this.model !== this.model1 && this.model1 == null){
                this.model1 = this.model
                this.model1 = this.model1.replace(/snkey={BIPSNKEY}/g,'snkey='+this.snkey);
                this.model1 = this.model1.replace(/{BIPURI}/g,this.uri)
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
