<template>
    <el-dialog :title="mytitle" class="bip-file" :visible.sync="outerVisible" :append-to-body="true" :close-on-press-escape="true" :close-on-click-modal="false" >
        <el-row class="padding" :gutter="40">
            <el-col :span="12" v-if="myCanExport">
                <el-card shadow="never" class="myCard">
                    <i class="el-icon-download icon pointer" @click="exFile"></i>
                    <div class="el-upload__text">导出Excel文件</div>
                </el-card>
            </el-col>
            <el-col :span="12" v-if="myCanImport">
                <el-card shadow="never" class="myCard">
                    <i class="el-icon-upload icon pointer" @click="imFile"></i>
                    <div class="el-upload__text">点击上传</div>
                </el-card>
            </el-col>
        </el-row>
    </el-dialog>
</template>
<script lang="ts">
//辅助query
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator";
import { BIPUtil } from "@/utils/Request";
let tools = BIPUtil.ServApi
import { CommICL } from '@/utils/CommICL';
let icl = CommICL
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
    outerVisible: boolean = false;
    mytitle = "文件导入导出";
    myCanImport:boolean = true//可以导入
    myCanExport:boolean = true//可以导出
    open() {
        console.log("文件导入导出")
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
    imFile(){

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
</style>