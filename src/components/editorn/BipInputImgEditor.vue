<template>
    <el-col :span="span" :xs="24" :sm="24" :md="span" :style="'height:'+cell.ccVerCell*20+'px'">
        <el-form-item :label="cell.labelString" class="bip-input-item" :class="cell.labelString.indexOf('.,') == 0 ?'bip-input-item-notitle':''" :required="cell.isReq">
            <span slot="label" v-if="cell.labelString">
                <template v-if="cell.labelString.length>(cell.isReq?4:6)">
                    <el-tooltip class="item" effect="dark" :content="cell.labelString" placement="top">
                        <span>{{cell.labelString.substring(0,(cell.isReq?4:5))}}…</span>
                    </el-tooltip>
                </template>
                <template v-else>
                    {{cell.labelString}}
                </template>
            </span>            
            <div>
                <img v-if="!url" :style="imgStyle" :src='upimgSrc' @click="imgClick"/> 
                <img v-else :style="imgStyle" :src="url" @click="imgClick"/>
            </div>
        </el-form-item>
        <el-dialog title="图片选择" width="40%" class="bip-file" :visible.sync="outerVisible" :append-to-body="true" :close-on-press-escape="true" :close-on-click-modal="false" >
            <el-row class="padding" :gutter="40" v-if="outerVisible"> 
                <el-col :span="24">
                    <el-card shadow="never" class="myCard">
                        <el-row>
                            <img v-if="!url" style="width: 100px; height: 110px" :src="upimgSrc"/> 
                            <img v-else style="width: 100px; height: 110px" :src="url"/>
                        </el-row>
                        <el-row>
                            <a href="javascript:;" id="pic" class="el-upload__text a-upload">
                                <input type="file" accept="image/*"  @change="upImg($event)" name="file" > 点击这里上传图片
                            </a>
                        </el-row>
                        <el-row style="text-align: start;color: #518dff;cursor:pointer">
                            <a @click="getImg">图片下载</a>
                        </el-row>
                    </el-card>
                </el-col>
            </el-row>
        </el-dialog>
    </el-col>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import {BaseVariable} from "@/utils/BaseICL"
import { GlobalVariable } from '@/utils/ICL';
import CDataSet from '@/classes/pub/CDataSet';
import { Cell } from '@/classes/pub/coob/Cell';
import { CommICL } from '@/utils/CommICL';
let icl = CommICL
import upimg from '@/assets/bip/upimg.png'
@Component({})
export default class BipInputImgEditor extends Vue{
    @Prop() cds!:CDataSet
    @Prop() cell!:Cell
    @Prop() row!:number
    @Prop() model:any
    @Prop() bgrid!:boolean
    uri:string=GlobalVariable.API_UPD//附件操作接口
    model1:any = ''
    span:number = 6
    url:any = "";
    outerVisible:boolean = false;
    imgStyle:any = "width: 100px; height: 110px";
    upimgSrc:any = upimg
    mounted(){
        if(this.$route.name == 'layoutDlg'){
            this.upimgSrc = "../"+this.upimgSrc;
        }
        this.uri = BaseVariable.BaseUri+''+GlobalVariable.API_UPD
        this.model1 = this.model       
        if(this.bgrid){
            this.span = 24
        }else{
            this.span = Math.round(24/this.cds.ccells.widthCell*this.cell.ccHorCell)
        }
        this.makeUrl();
        let ccVerCell = this.cell.ccVerCell;
        if(ccVerCell){
            let height = 40 * ccVerCell -4;
            this.imgStyle = "width: 100%; height: "+height+"px";
        }
    }
    makeUrl(){
        this.url = BaseVariable.BaseUri+"/db_"+BaseVariable.COMM_FLD_VALUE_DBID+"/"+this.model1
        if(!this.model1){
            this.url = null;
        }
    }
    imgClick(){
        this.$emit("focus",{})
        this.outerVisible = !this.outerVisible
    }
    //上传图片
    async upImg(event:any){
        let dfconfig:any = {
            headers: {
            'Content-Type': 'multipart/form-data'
            },
            params:{
                snkey:JSON.parse(window.sessionStorage.getItem('snkey')+''),
                usercode: JSON.parse(window.sessionStorage.getItem("user") + "").userCode,
            }
        }
        var file = event.target.files[0];
        let name = file.name
        let size = file.size
        let form = new FormData();
        let config  = dfconfig;
        config.params.name = name;
        config.params.dbid = BaseVariable.COMM_FLD_VALUE_DBID;
        config.params.cellID = this.cds.ccells.obj_id;
        config.params.updid = 40;//40平台编辑器是6的图片
        form.append("data", file); 
        form.append("name", name); 
        await this.$axios.post(this.uri,form,config).then((res)=>{
            if(res.data.id==-1){
                this.$notify.error("上传失败！");
            }else{
                this.model1 = res.data.data.fj_root;
                if(this.cds.currCanEdit()){
                    this.cds.currRecord.data[this.cell.id] = this.model1;
                    this.cds.cdata.data[this.cds.index] = this.cds.currRecord;
                    // const key:string = this.cell.id
                    if(this.cds.baseI){
                        this.cds.baseI.cellDataChange(this.cds,this.cell.id,this.model1)
                    }
                    this.cds.setStateOrAnd(icl.R_EDITED)
                    this.cds.checkGS(this.cell);
                    this.cds.currRecord.c_state |= 2;
                    if(this.cds.ds_par){
                        this.cds.ds_par.currRecord.c_state |= 2;
                    }
                }else{
                    this.model1 = this.model
                }
                this.makeUrl();
            }
        });
    }
    getImg(){
        window.open(this.url)
    }
    @Watch("model")
    cdataSetRecordChange(){
        if(this.cds&&this.cell){
            if( this.model !== this.model1){
                this.model1 = this.model
                this.makeUrl();
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.padding{
    padding: 20px;
}
.myCard{
    text-align: center;
    .icon{
        font-size: 80px;
        color: #a7a7a7;
    }
}
.pointer{
    cursor:pointer;
}
.a-upload {
    position: relative;
    display: inline-block;
    background: #D0EEFF;
    border: 1px solid #99D3F5;
    border-radius: 4px;
    padding: 4px 12px;
    overflow: hidden;
    color: #1E88C7;
    text-decoration: none;
    text-indent: 0;
    line-height: 20px;
}
.a-upload input {
    position: absolute;
    font-size: 100px;
    right: 0;
    top: 0;
    opacity: 0;
}
.a-upload:hover {
    background: #AADFFD;
    border-color: #78C3F3;
    color: #004974;
    text-decoration: none;
}
</style>

