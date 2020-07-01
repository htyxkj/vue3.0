<template>
    <el-col :span="span" :xs="24" :sm="24" :md="span">
        <template v-if="!bgrid">
            <el-form-item :label="cell.labelString" class="bip-input-item" :required="cell.isReq">
                <el-input :style="cell.desc?'width: calc(100% - 29px);':''" v-model="model1" size="small" :clearable="clearable" :disabled="disabled" :readonly="true">
                    <i slot="suffix" class="el-input__icon el-icon-document"  :disabled="disabled" @click="iconClick()"></i>
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
                <el-input v-model="model1" size="small" :clearable="clearable" :disabled="disabled" :readonly="true">
                    <i slot="suffix" class="el-input__icon el-icon-document"  :disabled="disabled" @click="iconClick()"></i>
                </el-input>
        </template>
        
        <bip-file-info ref="file" :cds="cds" :cell="cell" :index="row" @select="selectOK"></bip-file-info>
            
    </el-col>
</template>
<script lang="ts">
//辅助query
import { Component, Vue, Provide, Prop, Watch } from "vue-property-decorator"
import CDataSet from '@/classes/pub/CDataSet';
import { Cell } from '@/classes/pub/coob/Cell';
import BipFileInfo from './cutil/BipFileInfo.vue'
// import { BIPUtil } from '@/utils/Request';
@Component({
    components:{BipFileInfo}
})
export default class BipUpDownEditor extends Vue{
  @Prop() cds!: CDataSet;
  @Prop() cell!: Cell;
  @Prop() row!:number
  @Prop() bgrid!:boolean
  @Prop() model?: any ;
  @Provide() model1: any = "";
  @Provide() clearable: boolean = false;
  @Provide() disabled: boolean = false;
  @Provide() fj_root:string = ''
  @Provide() span:number = 6
  
  mounted(){
    //   if(this.cds&&this.cell){
          this.model1 = this.model
          this.span = Math.round(24/this.cds.ccells.widthCell*this.cell.ccHorCell)
    //   }
  }

  iconClick(){
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
  }

  @Watch('model')
  dataChange(){
      this.model1 = this.model;
  }

}
</script>