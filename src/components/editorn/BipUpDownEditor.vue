<template>
    <el-col :span="span" :xs="24" :sm="24" :md="span">
        <template v-if="!bgrid">
            <el-form-item :label="cell.labelString" class="bip-input-item" :required="cell.isReq">
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
                <el-input :style="cell.desc?'width: calc(100% - 29px);':''" v-model="model1" size="medium" :clearable="clearable" :disabled="disabled" :readonly="true" @focus="focus">
                    <i slot="suffix" class="el-input__icon el-icon-upload"  :disabled="disabled" @click="iconClick()"></i>
                </el-input>
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
                <el-input v-model="model1" size="medium" :clearable="clearable" :disabled="disabled" :readonly="true"  @focus="focus">
                    <i slot="suffix" class="el-input__icon el-icon-upload"  :disabled="disabled" @click="iconClick()"></i>
                </el-input>
        </template>
        
        <bip-file-info :env="env" ref="file" :cds="cds" :cell="cell" :index="row" @select="selectOK"></bip-file-info>
            
    </el-col>
</template>
<script lang="ts">
//辅助query
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import CDataSet from '@/classes/pub/CDataSet';
import { Cell } from '@/classes/pub/coob/Cell';
import BipFileInfo from './cutil/BipFileInfo.vue'
import CCliEnv from '@/classes/cenv/CCliEnv'
// import { BIPUtil } from '@/utils/Request';
@Component({
    components:{BipFileInfo}
})
export default class BipUpDownEditor extends Vue{
    @Prop() env!:CCliEnv    
    @Prop() cds!: CDataSet;
    @Prop() cell!: Cell;
    @Prop() row!:number
    @Prop() bgrid!:boolean
    @Prop() model?: any ;
    model1: any = "";
    clearable: boolean = false;
    disabled: boolean = false;
    fj_root:string = ''
    span:number = 6
  
    mounted(){
        if(this.model){
            this.model1 = this.model;
        }
        if(this.bgrid){
            this.span = 24
        }else{
            this.span = Math.round(24/this.cds.ccells.widthCell*this.cell.ccHorCell)
        }
    }

    iconClick(){
        this.focus();
        if(!this.disabled){
            setTimeout(()=>{
                let file:any = this.$refs.file
                file.open()
            },100);
        }  
    }

    selectOK(bok:boolean){
        let file:any = this.$refs.file
        file.close()
        if(bok){
            this.cds.currRecord.c_state |= 2;
            if(this.cds.ds_par){
                this.cds.ds_par.currRecord.c_state |= 2;
            }
        }
    }
    focus(){
        this.$emit("focus",{})
    }
    @Watch('model')
    dataChange(){
        this.model1 = this.model;
    }

}
</script>