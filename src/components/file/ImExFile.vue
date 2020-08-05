<template>
    <el-dialog :title="mytitle" class="bip-file" :visible.sync="outerVisible" :append-to-body="true" :close-on-press-escape="true" :close-on-click-modal="false" >
        <el-row class="padding" :gutter="40" v-if="outerVisible">
            <el-col :span="12" v-if="myCanExport">
                <el-card shadow="never" class="myCard">
                    <el-row>
                        <i class="el-icon-download icon pointer" @click="exFile"></i>
                    </el-row>
                    <el-row>
                        <div class="el-upload__text a-upload" @click="exFile">导出Excel文件</div>
                    </el-row>
                </el-card>
            </el-col>
            <el-col :span="12" v-if="myCanImport">
                <el-card shadow="never" class="myCard">
                    <el-row>
                        <i class="el-icon-upload icon pointer"></i>
                    </el-row>
                    <el-row>
                        <a href="javascript:;" id="pic" class="el-upload__text a-upload">
                            <input type="file" accept="application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" @change="imFile($event)" name="file" > 点击这里上传文件 
                        </a>
                    </el-row>
                </el-card>
            </el-col>
        </el-row>
    </el-dialog>
</template>
<script lang="ts">
//辅助query
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import { BIPUtil } from "@/utils/Request";
import { BaseVariable } from "@/utils/BaseICL";
let tools = BIPUtil.ServApi
import { CommICL } from '@/utils/CommICL';
let icl = CommICL
import { GlobalVariable } from "@/utils/ICL";
import { Cell } from '@/classes/pub/coob/Cell';
@Component({})
/**
 * 导入 导出 Excel
 */
export default class ImExFile extends Vue {
    @Prop() title!:string
    @Prop() canImport!:boolean//可以导入
    @Prop() canExport!:boolean//可以导出
    @Prop() cell!:Cell;
    @Prop() cellID!:string;
    outerVisible: boolean = false;
    mytitle = "文件导入导出";
    myCanImport:boolean = true//可以导入
    myCanExport:boolean = true//可以导出
    uri:string = "";
    open() {
        if(this.title)
            this.mytitle = this.title;
        if(this.canImport == false){
            this.myCanImport = false
        }
        if(this.canExport == false){
            this.myCanExport = false
        }
        this.outerVisible = true;
    }
    close() {
        this.outerVisible = false;
    }
    //导出文件
    exFile(){
        this.$emit("exFile")
    }
    //导入文件
    imFile(event:any) {
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
        if(this.cellID)
            config.params.cellID = this.cellID
        else
            config.params.cellID = this.cell.obj_id;
        config.params.apiId = GlobalVariable.APIID_IMPORTEXPDATA;
        form.append("data", file); 
        form.append("name", name); 
        this.$axios.post(GlobalVariable.API,form,config).then((res)=>{
            if(res.data.id==-1){
                this.$notify.error("上传失败！");
            }else{
                this.$notify.success( "上传完成！")
            }
        });
        console.log(file)
        this.outerVisible = false;
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