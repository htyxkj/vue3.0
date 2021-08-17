<template>
    <el-col :span="span" :xs="24" :sm="24" :md="span">
        <template v-if="!bgrid">
            <el-form-item :label="cell.labelString" :required="cell.isReq">
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
                <el-cascader v-model="model1" :options="options" clearable  size="medium" @change="dataChange" @focus="focus" :disabled="(cell.attr&0x40)>0"
                    :style="cell.desc?'width: calc(100% - 29px);':'width:100%'" :placeholder="cell.placeholder" :props="props" collapse-tags
                    ></el-cascader>
                <template v-if="cell.desc">
                    <span style="position:relative;line-height:32px;width:29px;padding: 5px 0px 5px 5px;">
                        <el-tooltip class="item" effect="dark" :content="cell.desc" placement="top">
                            <i class="iconfont icon-bip-bangzhu" style="font-size:14px;"></i>
                        </el-tooltip>
                    </span>
                </template>
            </el-form-item>
        </template>
        <template v-else>
            <el-cascader v-model="model1" :options="options" clearable  size="medium" @change="dataChange" @focus="focus" :disabled="(cell.attr&0x40)>0"
            style="width:100%" :placeholder="cell.placeholder" :props="props" collapse-tags
            ></el-cascader>
        </template>
    </el-col>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import CDataSet from '@/classes/pub/CDataSet';
import { Cell } from '@/classes/pub/coob/Cell';
import { CommICL } from '@/utils/CommICL';
let icl = CommICL
import BipInsAidNew from '../../classes/BipInsAidNew';
@Component({})
export default class BipInputCascaderEditor extends Vue{
    @Prop() cds!:CDataSet
    @Prop() cell!:Cell
    @Prop() model:any
    @Prop() bgrid!:boolean
    @Prop() row!:number
    @Prop() bipInsAid!:BipInsAidNew
    model1:any =[];
    props:any={
        multiple : false
    }
    span:number = 6
    options:any = []
    mounted(){
        this.props.multiple = (this.cds.ccells.attr&0x80)>0
        if(!this.bgrid){
            this.span = Math.round(24/this.cds.ccells.widthCell*this.cell.ccHorCell)
        }else{
            this.span = 24
        }
        this.initOPtions()
    }

    async initOPtions(){
        this.options = [];
        this.model1 = [];
        await this.$axios.get('./static/cascader/'+this.cell.editName+'.json').then((res:any) => { 
            this.options = res.data;
        }).catch((err:any) => {
            console.log(err)
        })
        this.initModel();
    }

    searchTree(tree:any, id:any) {
        let res = this.findNode(tree, id)
        if (res == undefined) {
            return null;
        }
        res.path.unshift(tree.value)
        return res.path
    }
    // 深度遍历查找目标节点及缓存相关路径
    findNode(tree:any, id:any):any {
        if (tree.value == id) {
            return {
                path: [],
                node: tree
            }
        }
        let res;
        if(tree.children)
        for (let i = 0; i < tree.children.length; i++) {
            res = this.findNode(tree.children[i], id)
            if (res != undefined) {
                res.path.unshift(tree.children[i].value)
                return res
            }
        }
        return undefined
    }

    dataChange(value:any){
        let str = ""
        if(this.props.multiple){
            for(var i=0;i<this.model1.length;i++){
                let md = this.model1[i];
                str += md[md.length-1]+";";
            }
            str = str.substring(0,str.length-1);
        }else{
            str = this.model1[this.model1.length-1]
        }
        if( str !== this.model){
            if(this.cds.currCanEdit()){
                this.cds.setStateOrAnd(icl.R_EDITED)
                let record = this.cds.currRecord
                record.data[this.cell.id] = str
                this.cds.currRecord = Object.assign({},record);
                this.cds.cdata.data[this.cds.index] = Object.assign({},record)
                const key:string = this.cell.id
                if(this.cds.baseI){
                    this.cds.baseI.cellDataChange(this.cds,this.cell.id,this.model1)
                }
                this.cds.cellChange(key,str);
                this.cds.checkGS(this.cell);
                this.cds.currRecord.c_state |= 2;
                if(this.cds.ds_par){
                    this.cds.ds_par.currRecord.c_state |= 2;
                }
            }else{
                this.initModel();
            }   
        } 
    }
    initModel(){
        if(this.model){
            let values = [this.model];
            if(this.props.multiple){
                values = this.model.split(";")
            }
            for(var j=0;j<values.length;j++){
                for(var i=0;i<this.options.length;i++){
                    let md:any = this.searchTree(this.options[i],values[j]);
                    if(md && md.length>1){
                        if(md[md.length-1] == values[j]){
                            this.model1.push(md);
                        }
                    }
                }
            }
        }else{
            this.model1 = [];
        }
    }
    @Watch('model')
    valueChange(){
        this.initModel();
    }
    focus(){
        this.$emit("focus",{})
    }
}
</script>
<style lang="scss">
.el-select__tags{
    .el-tag:nth-child(1){
        max-width: 59%;
        overflow: hidden;
    }
    .el-tag:nth-child(2){
        max-width: 30%;
        overflow: hidden;
    }
    input{
        margin: 0px;
    }
}
</style>

